# Auto Prime Enrico Auricchio

Crea una web app completa (frontend + backend + database) per una concessionaria di auto usate chiamata Auto Prime.

Dati aziendali

Nome: Auto Prime

Titolare: Enrico Auricchio

P.IVA: 11121961210

Telefono: 329 789 7193

Indirizzo: Traversa Andolfi 11, 80045 Pompei (NA)

Posizionamento: auto usate di qualità a prezzi convenienti, affidabilità e trasparenza

Stile grafico

Tono energico e diretto, non minimal e non "istituzionale"

Colore primario: blu elettrico/cobalto (fiducia, professionalità)

Colore accent per i pulsanti di azione: arancione o giallo acceso, ad alto contrasto sul blu, per far risaltare le call-to-action ("Prenota appuntamento", "Chiama ora", "Scrivi su WhatsApp")

Font moderno, sans-serif, leggibile anche da mobile (la maggior parte del traffico sarà da smartphone)

Foto delle auto grandi, in primo piano, con gallery scorrevole

Badge colorati sopra le card auto: "Nuovo arrivo", "Prezzo ribassato", "Pronta consegna"

Design mobile-first: bottoni grandi, facili da toccare, form brevi

Struttura del sito (pagine pubbliche)

Home

Hero con headline forte (es. "Auto di qualità, prezzi onesti") e CTA principale

Sezione auto in evidenza/ultimi arrivi

Sezione "Perché scegliere Auto Prime" (garanzia, trasparenza, assistenza)

Sezione contatti rapidi (telefono, WhatsApp, indirizzo con mappa)

Catalogo auto

Griglia di card auto con: foto principale, marca/modello, anno, km, prezzo, alimentazione, cambio

Filtri di ricerca: prezzo (range), km (range), anno, marca, alimentazione (benzina/diesel/gpl/ibrida/elettrica), cambio (manuale/automatico)

Ordinamento: prezzo crescente/decrescente, km, anno

Pagina singola auto

Galleria foto (più immagini, zoom su tap)

Tutti i parametri tecnici (marca, modello, anno, km, cilindrata, potenza, alimentazione, cambio, colore, numero proprietari, revisione, garanzia)

Prezzo in evidenza

Pulsante "Prenota appuntamento" che apre un calendario con scelta di data e ora disponibile

Pulsante "Chiama ora" (click-to-call, numero: 329 789 7193)

Pulsante "Scrivi su WhatsApp" con messaggio precompilato che include il modello dell'auto

Form di contatto rapido per chi vuole scrivere direttamente dal sito

Pagina "Valuta la tua auto / Permuta"

Form dove l'utente inserisce i dati della propria auto (marca, modello, anno, km, condizioni, foto opzionali) per richiedere una valutazione in permuta

Le richieste arrivano nel pannello admin come lead da gestire

Pagina Chi siamo / Contatti

Presentazione di Auto Prime ed Enrico Auricchio

Dati aziendali (P.IVA, indirizzo, telefono)

Mappa con la posizione

Form di contatto generico

Pannello Admin (accesso riservato con login)

L'admin deve avere pieni poteri di gestione, incluso:

Gestione auto: aggiungere, modificare, eliminare auto dal catalogo

Upload multiplo di foto per ogni auto, con possibilità di riordinarle e scegliere la foto principale

Inserimento di tutti i parametri tecnici (marca, modello, anno, km, cilindrata, potenza, alimentazione, cambio, colore, numero proprietari, stato revisione, garanzia, prezzo)

Stato dell'auto: disponibile / venduta / riservata / in arrivo

Possibilità di mettere in evidenza un'auto in home

Gestione appuntamenti: vedere tutte le prenotazioni ricevute per ogni auto, con data, ora, dati del cliente; possibilità di confermare, rifiutare o riprogrammare

Gestione lead di permuta: vedere le richieste di valutazione auto in permuta

Gestione messaggi/contatti: vedere tutti i messaggi ricevuti dai form del sito

Gestione dati aziendali: pannello dove modificare in autonomia telefono, indirizzo, orari di apertura, e altri dati di contatto mostrati sul sito, senza dover toccare il codice

Dashboard iniziale con riepilogo: numero auto attive, appuntamenti in arrivo, nuovi messaggi/lead da leggere

Database

Struttura dati necessaria:

Auto (tutti i parametri sopra elencati + foto + stato)

Appuntamenti (auto collegata, data, ora, nome cliente, telefono, stato)

Richieste di permuta (dati auto cliente, dati contatto, stato)

Messaggi di contatto (nome, contatto, messaggio, data)

Note tecniche

Sito interamente responsive, ottimizzato per smartphone

Velocità di caricamento delle immagini ottimizzata (compressione automatica delle foto caricate)

SEO di base: title, meta description, url leggibili per ogni auto (utile per essere trovati su Google)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://auto-prime-dealership.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/63ac32fe-6b57-42c8-ac35-0ce2e1917c09).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
