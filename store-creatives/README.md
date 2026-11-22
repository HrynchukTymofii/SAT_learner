# store-creatives/ — App Store and Google Play images

Screenshots and banners are generated from HTML, never edited by hand. The app screens are redrawn in HTML
from the real components (Apple rejects screenshots that don't show the real app).

```
src/kit.js           app screens, device frames, layouts; SLIDES / FLOAT / FLOAT_AT choose what each slide shows
src/creatives.html   renders one image: creatives.html?v=<kind>&s=<slide number>
src/kit.css, fonts/  styles and local fonts (Outfit, Manrope)
src/render.mjs       renders everything to PNG
src/capture-lesson.mjs  grabs a lesson screenshot used inside a slide (lesson.png)
app-store/, google-play/   output (not in git)
```

## Render

Needs Node and Playwright's headless Chromium (`npx playwright install chromium-headless-shell`).
`render.mjs` looks for it in `%USERPROFILE%/AppData/Local/ms-playwright` (Windows path; change the `pw`
line on macOS: `~/Library/Caches/ms-playwright`).

```bash
node src/render.mjs              # everything
node src/render.mjs iphone-6.3   # only kinds whose name contains the filter
```

Sizes: iPhone 6.9" and 6.3", iPad 13", Google Play phone 1080×1920, 7" and 10" tablets, feature graphic
1024×500, plus wide headers. Style: one short title on top, a tilted phone, one feature block "lifted" bigger
over its real place; dark ink + lavender glow + graph paper.

Preview while editing: open `src/creatives.html?v=iphone-6.3&s=1` in a browser.
