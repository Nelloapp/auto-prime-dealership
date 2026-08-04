/**
 * Parsing "morbido" degli orari scritti a mano nelle impostazioni admin.
 * Esempi supportati:
 *   "Lun-Sab 9:00-13:00 / 15:00-19:30"
 *   "Lun-Ven 9-13, 15-19; Sab 9-13"
 */

const DAY_INDEX: Record<string, number> = {
  dom: 0,
  lun: 1,
  mar: 2,
  mer: 3,
  gio: 4,
  ven: 5,
  sab: 6,
};

const DAY_LABELS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export type TimeRange = { start: number; end: number };
export type DaySchedule = { days: number[]; ranges: TimeRange[] };

function toMinutes(h: string, m?: string) {
  return Number(h) * 60 + Number(m ?? 0);
}

function parseDays(chunk: string): number[] {
  const found = [...chunk.toLowerCase().matchAll(/(dom|lun|mar|mer|gio|ven|sab)[a-zì]*/g)].map(
    (m) => DAY_INDEX[m[1]!]!,
  );
  if (found.length === 0) return [1, 2, 3, 4, 5, 6];
  const isRange = /-|–|\/a\s/.test(chunk) && found.length === 2 && /(-|–)\s*(dom|lun|mar|mer|gio|ven|sab)/i.test(chunk);
  if (isRange) {
    const [a, b] = found as [number, number];
    const out: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = (a + i) % 7;
      out.push(d);
      if (d === b) break;
    }
    return out;
  }
  return [...new Set(found)];
}

function parseRanges(chunk: string): TimeRange[] {
  const matches = [...chunk.matchAll(/(\d{1,2})[:.]?(\d{2})?\s*(?:-|–|alle)\s*(\d{1,2})[:.]?(\d{2})?/g)];
  return matches
    .map((m) => ({ start: toMinutes(m[1]!, m[2]), end: toMinutes(m[3]!, m[4]) }))
    .filter((r) => r.end > r.start);
}

export function parseOpeningHours(text: string | null | undefined): DaySchedule[] {
  if (!text) return [];
  return text
    .split(/[;\n]|,(?=[^\d]*(?:lun|mar|mer|gio|ven|sab|dom))/i)
    .map((chunk) => ({ days: parseDays(chunk), ranges: parseRanges(chunk) }))
    .filter((s) => s.ranges.length > 0);
}

export type OpenState = {
  open: boolean;
  /** Testo breve: "Aperto ora · chiude alle 19:30" oppure "Chiuso · apre lunedì 9:00". */
  detail: string;
};

function fmt(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function getOpenState(text: string | null | undefined, now = new Date()): OpenState | null {
  const schedule = parseOpeningHours(text);
  if (schedule.length === 0) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();

  const rangesFor = (day: number) =>
    schedule
      .filter((s) => s.days.includes(day))
      .flatMap((s) => s.ranges)
      .sort((a, b) => a.start - b.start);

  const todayRanges = rangesFor(today);
  const current = todayRanges.find((r) => nowMin >= r.start && nowMin < r.end);
  if (current) return { open: true, detail: `Aperto ora · chiude alle ${fmt(current.end)}` };

  const later = todayRanges.find((r) => r.start > nowMin);
  if (later) return { open: false, detail: `Chiuso · riapre oggi alle ${fmt(later.start)}` };

  for (let i = 1; i <= 7; i++) {
    const day = (today + i) % 7;
    const next = rangesFor(day)[0];
    if (next) {
      const when = i === 1 ? "domani" : DAY_LABELS[day]!.toLowerCase();
      return { open: false, detail: `Chiuso · apre ${when} alle ${fmt(next.start)}` };
    }
  }
  return { open: false, detail: "Chiuso" };
}
