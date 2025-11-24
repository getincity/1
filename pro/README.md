# SK AYAAN — Pro link page

This `pro/` folder contains an enhanced, production-ready (static) link page for `@sk_ayaan99`.

Files included:
- `index.pro.html` — enhanced HTML with SEO/OG tags, contact form (mailto fallback), Google Fonts.
- `styles.pro.css` — polished styles and responsive layout.
- `script.pro.js` — small UX helpers and form fallback.
- `assets/favicon.svg`, `assets/logo-pro.svg` — small SVG assets.

Preview locally
--------------
Open the HTML file in your browser:

```powershell
start 'D:\htmp\pro\index.pro.html'
```

Or run a tiny server (recommended):

```powershell
cd D:\htmp\pro
python -m http.server 8000
# then open http://localhost:8000
```

Deploy
------
This is a static site — you can deploy to GitHub Pages, Netlify, Vercel, or any static host.

Notes
-----
- The contact form uses a mailto: fallback. If you want a real form endpoint, I can wire one using Formspree or a serverless function.
- Replace the placeholder logo and favicon in `assets/` with your branding for production.
