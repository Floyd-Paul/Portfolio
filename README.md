# Floyd Paul — Portfolio

A complete static portfolio website based on **Floyd Paul – Kreativ Portfölj 2027-A.pdf**. The site includes a Three.js artwork installation, twelve project galleries, category filters, an about section, visual experiments, contact links, and the original PDF.

## Publish on GitHub Pages

No build, package installation, API key, or backend is needed.

1. Create a GitHub repository, for example `portfolio`. A public repository works with GitHub Free.
2. Upload the **contents of this folder** to the repository. `index.html`, `style.css`, `js/`, `assets/`, and `vendor/` must be at the repository root. Do not upload only the ZIP or nest the entire folder one level deeper.
3. Commit the files to `main`.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose **main** and **/(root)**, then **Save**.
7. Wait for GitHub's deployment to finish. The live address will appear in Pages settings, usually `https://YOUR-USERNAME.github.io/portfolio/`.

All internal paths are relative, so both repository sites and username.github.io sites work without changing the code. Keep the bundled `.nojekyll` file if your upload method includes hidden files.

Official instructions: [Configure a GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Preview on your computer

With Node.js 18 or newer installed, open a terminal in this folder and run:

```sh
npm start
```

Open **http://localhost:4173**. There are no dependencies to install. Stop the preview with Ctrl+C.

Alternatively, serve this folder with any static web server, such as VS Code's Live Server extension or `python -m http.server 4173`.

Opening `index.html` directly from the filesystem will not load the JavaScript modules: use the preview server or GitHub Pages.

## Make it yours

- **Projects and gallery text:** `js/projects.js`
- **Intro, bio, contact details and page metadata:** `index.html`
- **Colours, type and layouts:** `style.css`; the main colours are at the beginning in `:root`
- **Three.js composition and motion:** `js/scene.js`
- **Artwork:** `assets/work/`
- **Downloadable original:** `assets/floyd-paul-portfolio.pdf`

To add a project, follow the existing object structure in `js/projects.js`, add its images, and update the “All work” count in `index.html`. Project numbering and filtered counts update automatically. The `filters` array accepts `brand`, `editorial` and `digital`.

## What's included

- Locally bundled **Three.js 0.186.1** and **Space Grotesk**, with their licenses. No CDN or third-party requests are required to view the site.
- Original PDF imagery converted to WebP, plus complete project spreads. Some images retain the original PDF's modest resolution.
- Mouse-responsive 3D image cards, a pause control, and reduced-motion support.
- Rendering pauses outside the hero, while a project is open, and when the browser tab is hidden.
- A static artwork fallback if WebGL is unavailable or its context is lost.
- Responsive layouts and native accessible project dialogs with Escape-to-close and focus restoration.
- Lazy-loaded project imagery. The 8 MB PDF downloads only when a visitor opens its link.
- Working email and phone links. No analytics, forms, tracking, or cookies.

## Content notes

The Adidas artwork is explicitly labelled a speculative concept. “Stellar Equipment” follows the spelling shown in the original artwork; the PDF's body copy spells it “Steller.” Source filenames retain `steller` for consistency. Photographic credits on the two visual experiment spreads are retained. No client results, testimonials or performance figures have been invented.

The design and portfolio content belong to their respective owners. Third-party library licenses are in `vendor/LICENSE` (Three.js) and `assets/FONT-LICENSE.txt` (Space Grotesk).

The website is prepared for upload; a GitHub repository has not been created and no public deployment has been made.
