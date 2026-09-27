# Elizaveta Pelykh Portfolio — editable prototype

Open `index.html` in a browser.

## Replace visuals
The outlined blocks are media slots. For the first pass they are placeholders so the layout/motion can be approved before adding final assets.

To replace one manually, find e.g.:
`<div class="media wide" data-media="grand-associations">...</div>`
and replace its contents with `<img src="media/your-file.jpg" alt="">`.

Add this CSS if using images/videos: `.media img,.media video{width:100%;height:100%;object-fit:cover;display:block}`.

## Edit services
Edit only `assets/content.js`; the package layout is generated automatically.

## Motion
`assets/app.js` contains scroll reveals and the Grand Dessert parallax. Motion values can be tuned without changing the layout.


## Clean Grand Dessert variant
Based directly on v4. Removed the two translucent backing planes from the Grand Dessert intro. No later motion/carousel experiments were carried over.
