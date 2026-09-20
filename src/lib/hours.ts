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

/* ---------------- editor settimanale (pannello admin) ---------------- */

/** Ordine di visualizzazione: lunedì → domenica (indice = getDay()). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const DAY_SHORT: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Gio",
  5: "Ven",
  6: "Sab",
};
export const DAY_FULL: Record<number, string> = {
  0: "Domenica",
  1: "Lunedì",
  2: "Martedì",
  3: "Mercoledì",
  4: "Giovedì",
  5: "Venerdì",
  6: "Sabato",
};

/** Una giornata nell'editor: due fasce orarie opzionali in formato "HH:MM". */
export type DayHours = {
  day: number;
  closed: boolean;
  morningFrom: string;
  morningTo: string;
  afternoonFrom: string;
  afternoonTo: string;
};

function clock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const EMPTY_DAY = (day: number): DayHours => ({
  day,
  closed: true,
  morningFrom: "",
  morningTo: "",
  afternoonFrom: "",
  afternoonTo: "",
});

/** Converte il testo degli orari nella struttura usata dall'editor. */
export function weeklyFromText(text: string | null | undefined): DayHours[] {
  const schedule = parseOpeningHours(text);
  return WEEK_ORDER.map((day) => {
    const ranges = schedule
      .filter((s) => s.days.includes(day))
      .flatMap((s) => s.ranges)
      .sort((a, b) => a.start - b.start);
    if (ranges.length === 0) return EMPTY_DAY(day);
    const [first, second] = ranges;
    return {
      day,
      closed: false,
      morningFrom: first ? clock(first.start) : "",
      morningTo: first ? clock(first.end) : "",
      afternoonFrom: second ? clock(second.start) : "",
      afternoonTo: second ? clock(second.end) : "",
    };
  });
}

function dayRangesText(d: DayHours) {
  const parts: string[] = [];
  if (d.morningFrom && d.morningTo) parts.push(`${d.morningFrom}-${d.morningTo}`);
  if (d.afternoonFrom && d.afternoonTo) parts.push(`${d.afternoonFrom}-${d.afternoonTo}`);
  return parts.join(" / ");
}

/**
 * Ricompone il testo degli orari raggruppando i giorni consecutivi identici
 * (es. "Lun-Ven 9:00-13:00 / 15:00-19:30; Sab 9:00-13:00").
 */
export function textFromWeekly(week: DayHours[]): string {
  const byDay = new Map(week.map((d) => [d.day, d]));
  const rows = WEEK_ORDER.map((day) => {
    const d = byDay.get(day) ?? EMPTY_DAY(day);
    return { day, text: d.closed ? "" : dayRangesText(d) };
  });

  const groups: { days: number[]; text: string; lastIndex: number }[] = [];
  rows.forEach((row, index) => {
    if (!row.text) return;
    const last = groups[groups.length - 1];
    if (last && last.text === row.text && last.lastIndex === index - 1) {
      last.days.push(row.day);
      last.lastIndex = index;
    } else {
      groups.push({ days: [row.day], text: row.text, lastIndex: index });
    }
  });

  return groups
    .map((g) => {
      const first = DAY_SHORT[g.days[0]!];
      const last = DAY_SHORT[g.days[g.days.length - 1]!];
      const label = g.days.length === 1 ? first : `${first}-${last}`;
      return `${label} ${g.text}`;
    })
    .join("; ");
}
