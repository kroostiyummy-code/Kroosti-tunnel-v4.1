# toitrenov — site

Site vitrine multi-pages, HTML statique + Tailwind CSS (build local).

## Prérequis

- Node.js ≥ 18
- npm

## Installation

```bash
npm install
```

## Développement

Mode watch — recompile `assets/site.css` à chaque changement de classe Tailwind dans les fichiers `.html` :

```bash
npm run dev
```

Sert le site en local (utiliser n'importe quel serveur statique pendant que `npm run dev` tourne dans un autre terminal) :

```bash
npx serve .
# ou : python3 -m http.server 8000
```

## Build production

```bash
npm run build
```

Génère `assets/site.css` minifié (~30 ko, ne contient que les classes utilisées). À lancer **avant chaque déploiement** si tu as modifié des classes dans le HTML.

## Structure

```
.
├── index.html, toiture.html, facade.html,
├── isolation-interieure.html, aides.html, contact.html,
├── mentions-legales.html
├── assets/
│   ├── site.css         ← CSS compilé (commité, généré par `npm run build`)
│   └── site.js          ← JS partagé (reveal au scroll, slider avant/après, menu mobile, formulaire)
├── src/
│   └── input.css        ← Source CSS (Tailwind directives + custom)
├── tailwind.config.js   ← Configuration thème (couleurs, polices, ombres)
└── package.json
```

## À configurer avant mise en ligne

1. **Formulaire de contact** (`contact.html`) — remplacer `YOUR_FORM_ID` dans l'attribut `action` par un identifiant Formspree (https://formspree.io). Alternatives : Netlify Forms, Web3Forms, backend maison.
2. **Mentions légales** (`mentions-legales.html`) — remplir tous les champs `[À COMPLÉTER]` avec les informations légales réelles (raison sociale, SIRET, hébergeur, etc.).
3. **Open Graph** — les images OG pointent sur Unsplash, à remplacer par tes propres visuels une fois disponibles (héberger sur ton domaine, en 1200×630 px).

## Déploiement

Le site est 100% statique : déployable sur Netlify, Vercel, GitHub Pages, OVH, etc. Uploader simplement les fichiers `*.html`, le dossier `assets/`, et c'est tout. **Ne pas uploader** `node_modules/`, `src/`, `package.json`, `tailwind.config.js` — uniquement le HTML et le contenu de `assets/`.
