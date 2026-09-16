# Audit prima del lancio — Auto Prime

Ho controllato le pagine, i dati e la sicurezza del sito. La base è solida: il sito si costruisce senza errori, funziona su mobile, l'area riservata è protetta e i testi/immagini sono già gestibili dal pannello. Restano alcuni punti concreti da sistemare prima di comprare il dominio.

## Cosa manca davvero (priorità alta)

1. **Le schede delle singole auto sono tutte identiche per Google e per WhatsApp.**
   Oggi ogni auto mostra il titolo "Dettaglio auto — Auto Prime Pompei" e nessuna foto in anteprima. Chi condivide un annuncio non vede marca, modello e prezzo.
   Intervento: titolo e descrizione generati dai dati dell'auto (marca, modello, anno, km, prezzo) e foto principale come immagine di anteprima.

2. **Manca la mappa del sito (sitemap) per i motori di ricerca.**
   Intervento: creare la sitemap con tutte le pagine pubbliche e le schede auto, e collegarla nel file delle regole per i motori di ricerca.

3. **Manca l'indirizzo "ufficiale" di ogni pagina (canonical).**
   Solo la home lo ha. Senza, Google può considerare doppie le pagine con filtri del catalogo.
   Intervento: aggiungerlo su catalogo, chi siamo, contatti, permuta, privacy, pagine personalizzate e schede auto.

4. **Nessun dato strutturato: il sito non compare come attività locale né con prezzi in evidenza.**
   Intervento: aggiungere le informazioni tecniche invisibili che descrivono la concessionaria (indirizzo, telefono, orari) e ogni auto in vendita (prezzo, km, alimentazione, disponibilità). È ciò che permette a Google di mostrare prezzo e scheda direttamente nei risultati.

5. **Una funzione del database è ancora richiamabile dagli utenti registrati.**
   Segnalazione di sicurezza aperta.
   Intervento: limitare l'esecuzione ai soli usi interni del server.

## Miglioramenti consigliati (priorità media)

6. **Pagina catalogo con filtri indicizzabile a metà**: aggiungere l'istruzione per non indicizzare le combinazioni di filtri, tenendo indicizzato solo il catalogo pulito.
7. **Anteprima social sulle pagine interne**: catalogo, chi siamo, contatti e permuta oggi non hanno immagine di anteprima; riuso di quella della home.
8. **Immagini più leggere e caricamento differito** sulle foto sotto la prima schermata (catalogo e galleria): pagine più rapide, soprattutto da telefono.
9. **Controllo finale dei contenuti reali**: indirizzo, telefono, email, orari, P.IVA nella privacy. Alcuni valori sono attualmente di esempio e vanno confermati da te prima della pubblicazione.
10. **Pagina 404 in italiano**: ora è in inglese ("Page not found").
11. **Icona del sito (favicon)**: verificare che sia il logo attuale e ben leggibile in piccolo.

## Dopo la pubblicazione

- Collegare Google Search Console e inviare la sitemap (serve il sito pubblicato).
- Creare/aggiornare la scheda Google Business Profile di Pompei con link al sito: per una concessionaria locale è la fonte principale di contatti.
- Comprare il dominio e collegarlo; dopo il cambio dominio vanno aggiornati gli indirizzi usati nelle anteprime social e nella sitemap.

## Note tecniche

- `src/routes/auto.$slug.tsx`: `head()` dinamico da `loaderData` (title, description, og:title/description/url, og:image dalla foto primaria, `og:type: article`, canonical) + JSON-LD `Vehicle`/`Product` con `offers`.
- Sitemap: generatore router-derived con `staticData.sitemap` sulle route + lista dinamica degli slug auto pubblicate; `Sitemap:` in `public/robots.txt`.
- `__root.tsx`: JSON-LD `AutoDealer`/`LocalBusiness` da `site_settings` (indirizzo, telefono, `openingHoursSpecification` da `src/lib/hours.ts`).
- Canonical solo sulle route foglia; su `/catalogo` con filtri attivi aggiungere `robots: noindex,follow`.
- `REVOKE EXECUTE ... FROM authenticated` sulla funzione SECURITY DEFINER segnalata dal linter.
- Immagini: `loading="lazy"` + `decoding="async"` su `CarCard`/`CarGallery` (escludendo la prima immagine della scheda).
