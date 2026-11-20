HOW TO EDIT
-----------
index.html  -> names, date, procession names (look for the "CHANGE:" comments)
styles.css  -> colours and fonts are at the top (:root)
script.js   -> cover/open behaviour and music (usually no edits needed)
assets/     -> replace these files with your own (keep the same file names):
   envelope-photo.png       (envelope + couple photo, transparent PNG)
   flower-top-left.png      (cover card corner)
   flower-bottom-right.png  (cover card corner)
   flower-right.png / flower-left.png  (bouquets on the wine cards)
   gallery/01.jpg ... 11.jpg  (gallery photos; 05.jpg is a sample. Change PHOTO_COUNT in script.js)
   gift-envelopes.png  (monetary gifts image)
   music.mp3                (add your song; optional)

TO PREVIEW: double-click index.html, or run "npx serve" in this folder.
TO PUBLISH: upload the whole folder to Netlify, Vercel, GitHub Pages or any web host.
