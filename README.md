# AZIZ // Cybersecurity

A responsive, dark green cybersecurity portfolio and write-up site built with plain HTML, CSS, and JavaScript. No build step, framework, or paid service is required.

## Preview locally

### Option 1: Open directly
Open `index.html` in your browser. Most features work without a server.

### Option 2: Serve it locally
From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy for free with GitHub Pages

1. Create or sign in to a GitHub account at https://github.com/.
2. Create a **public** repository, for example `aziz-cybersecurity`.
3. Upload the contents of this folder to the repository root. Make sure `index.html` is at the top level.
4. Open the repository **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/(root)`, then click **Save**.
7. Wait for deployment, then open the URL shown in Settings → Pages. It will usually look like `https://YOUR-USERNAME.github.io/aziz-cybersecurity/`.

GitHub Pages publishes public sites to the internet. Do not commit passwords, API keys, session cookies, private data, or confidential program findings.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Add a new article

Open `posts.js` and add an object to `window.SITE_POSTS`. Use one of these values for `section`:

- `htb` — appears under HTB Write-ups
- `research` — appears under Bug Bounty Research
- `notes` — appears under Notes & Cheatsheets

Example:

```js
{
  id: "my-new-note", // unique ID
  section: "notes",
  title: "My New Note",
  date: "2026-10-30",
  difficulty: "Notes",
  readTime: "4 min read",
  tags: ["Linux", "CLI"],
  excerpt: "A one-sentence summary of this note.",
  body: [
    { type: "p", text: "Start with the context and what you wanted to learn." },
    { type: "h3", text: "Commands" },
    { type: "code", text: "whoami\\nuname -a" },
    { type: "ul", items: ["First point", "Second point"] }
  ]
}
```

Supported body block types: `p`, `h3`, `code`, and `ul`. Text is escaped before rendering, so HTML in article text is displayed as text rather than executed.

## Personalize before publishing

- Replace generic GitHub, LinkedIn, and YouTube URLs in `index.html` with your real profile links.
- Update the About section to reflect your current experience and credentials.
- Replace the starter/sample articles with your own verified notes.
- Keep targets, report details, tokens, personal data, and undisclosed findings private.
- For HTB content, follow the platform's current content-sharing rules before publishing complete solutions or flags.

## File structure

```text
aziz-cybersecurity-site/
├── index.html
├── styles.css
├── app.js
├── posts.js
├── README.md
└── assets/
    └── favicon.svg
```
