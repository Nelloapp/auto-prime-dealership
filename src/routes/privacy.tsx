import { createFileRoute } from "@tanstack/react-router";
import { useSettings } from "@/lib/cars";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Auto Prime Pompei" },
      {
        name: "description",
        content:
          "Informativa privacy di Auto Prime: quali dati raccogliamo tramite i moduli del sito, come li usiamo e come esercitare i tuoi diritti GDPR.",
      },
      { property: "og:title", content: "Privacy Policy — Auto Prime" },
      {
        property: "og:description",
        content: "Come Auto Prime tratta i dati personali raccolti dal sito.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data: s } = useSettings();
  const company = s?.company_name ?? "Auto Prime";
  const address = s?.address ?? "Traversa Andolfi 11, 80045 Pompei (NA)";
  const email = s?.email ?? "info@autoprime.it";
  const vat = s?.vat_number ?? "11121961210";

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold uppercase text-primary-deep sm:text-4xl">
        Privacy Policy
      </h1>
      <div className="mt-2 h-1 w-24 bg-primary" />

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold uppercase text-foreground">
            Titolare del trattamento
          </h2>
          <p className="mt-2">
            {company} — {address} — P.IVA {vat}. Per qualsiasi richiesta relativa ai tuoi dati
            personali puoi scrivere a{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase text-foreground">
            Dati raccolti e finalità
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Richieste di contatto</strong>: nome, telefono,
              email e messaggio, per rispondere alle tue domande.
            </li>
            <li>
              <strong className="text-foreground">Prenotazione prova su strada</strong>: nome,
              telefono, data e orario scelti, per gestire l'appuntamento.
            </li>
            <li>
              <strong className="text-foreground">Valutazione permuta</strong>: dati del veicolo,
              recapiti ed eventuali foto caricate, per formulare una valutazione.
            </li>
            <li>
              <strong className="text-foreground">Dati tecnici</strong>: log tecnici necessari al
              funzionamento e alla sicurezza del sito.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase text-foreground">
            Base giuridica e conservazione
          </h2>
          <p className="mt-2">
            Il trattamento si fonda sull'esecuzione di misure precontrattuali richieste da te
            (art. 6.1.b GDPR) e sul legittimo interesse a gestire le richieste commerciali
            (art. 6.1.f GDPR). I dati sono conservati per il tempo necessario a gestire la
            richiesta e, salvo obblighi di legge, non oltre 24 mesi dall'ultimo contatto.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase text-foreground">
            Destinatari e fornitori
          </h2>
          <p className="mt-2">
            I dati sono trattati dal personale autorizzato di {company} e dai fornitori tecnici che
            gestiscono hosting, database e archiviazione delle immagini del sito, nominati
            responsabili del trattamento. Non vendiamo né cediamo i tuoi dati a terzi per finalità
            di marketing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase text-foreground">Cookie</h2>
          <p className="mt-2">
            Il sito utilizza esclusivamente cookie e archiviazione locale tecnici, necessari al
            funzionamento delle pagine e all'accesso all'area riservata. Non sono impiegati cookie
            di profilazione o pubblicitari di terze parti.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase text-foreground">I tuoi diritti</h2>
          <p className="mt-2">
            Puoi chiedere in ogni momento accesso, rettifica, cancellazione, limitazione,
            portabilità dei dati e opporti al trattamento scrivendo a{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
            . Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati
            personali.
          </p>
        </section>
      </div>
    </main>
  );
}
