## Blocco 1 — Conversione

Obiettivo: rendere più facile e immediato contattare Auto Prime e chiedere info su un'auto specifica.

### 1. Barra azioni fissa su mobile
Nuovo componente `StickyActions` mostrato solo su mobile (nascosto da `sm:` in su) in fondo allo schermo:
- **Chiama** (rosso pieno) e **WhatsApp** (verde) sempre disponibili.
- Nella pagina auto, terzo bottone **Prenota** che apre il dialog appuntamento già esistente.
- Numeri presi dalle impostazioni admin (nessun dato hardcoded).
- Padding extra in fondo alle pagine così la barra non copre i contenuti.

### 2. Messaggi WhatsApp precompilati e ricchi
Centralizzo la costruzione del testo in `src/lib/site.ts`:
- Da scheda auto e card catalogo: `Ciao Auto Prime, sono interessato a <Marca Modello, anno, km> — prezzo <€> — link diretto alla pagina`.
- Da home/contatti/footer: messaggio generico con nome pagina.
- Il link è l'URL assoluto della scheda, così in chat arriva l'anteprima.

### 3. Calcolatore rata nella scheda auto
Blocco "Calcola la rata" sotto il prezzo:
- Slider anticipo (0–50% del prezzo) e durata (24/36/48/60/72 mesi), TAN indicativo configurabile.
- Rata calcolata client-side con formula di ammortamento francese, mostrata in Space Mono grande.
- Nota legale: "Preventivo indicativo, non è un'offerta contrattuale".
- Bottone "Chiedi questo finanziamento su WhatsApp" con la rata inclusa nel messaggio.

### 4. Form permuta più corto
`/permuta` passa a due step leggeri:
- **Step 1 (obbligatorio, minimo attrito)**: targa o marca/modello, anno, km, telefono. Bottone "Richiedi valutazione".
- **Step 2 (facoltativo)**: foto (fino a 8) ed eventuali note/danni, con messaggio "puoi anche inviarcele dopo su WhatsApp".
- Il record viene salvato già alla fine dello step 1: se l'utente abbandona, il lead resta.

### Dettagli tecnici
- Solo frontend: nessuna modifica a database, tabelle o policy.
- Il calcolatore è puro calcolo client-side, nessun dato salvato.
- I file toccati: nuovo `src/components/StickyActions.tsx`, nuovo `src/components/RateCalculator.tsx`, modifiche a `src/lib/site.ts`, `src/routes/auto.$slug.tsx`, `src/routes/permuta.tsx`, `src/routes/__root.tsx` (montaggio barra), `src/components/CarCard.tsx`.
- Tasso e durate di default costanti nel codice; se vuoi li rendo modificabili da admin in un secondo momento.
