# Protection Habitat Sud-Ouest — Tunnel de génération de leads

Site statique (HTML/CSS/JS) pour un test rapide de génération de leads sur **hydrofuge toiture à Limoges**, extensible aux services connexes (nettoyage, démoussage, façade, isolation, VMC) et aux autres villes du Sud-Ouest.

## Promesse centrale

> Votre toiture absorbe-t-elle l'eau sans que vous le sachiez ? Demandez un diagnostic gratuit avant les infiltrations.

## Positionnement

Plateforme **de mise en relation locale**, pas une entreprise de travaux. Les demandes sont transmises à un professionnel partenaire qui réalise le diagnostic et le devis.

## Arborescence

```
/
├── index.html                                 # Accueil
├── hydrofuge-toiture/                         # Service générique
├── hydrofuge-toiture-limoges/                 # ★ Landing prioritaire (Ads + SEO)
├── nettoyage-toiture-limoges/
├── demoussage-toiture-limoges/
├── prix-hydrofuge-toiture/
├── tuiles-poreuses/
├── comment-fonctionne-notre-service/
├── mentions-legales/
├── politique-confidentialite/
├── gestion-cookies/
├── conditions-utilisation/
├── merci/                                     # Page de confirmation
├── assets/
│   ├── css/styles.css
│   └── js/main.js
├── robots.txt
├── sitemap.xml
└── README.md
```

Toutes les URL sont en *clean URLs* (`/slug/` → `/slug/index.html`), compatibles avec la plupart des hébergeurs statiques.

## Déploiement rapide

Le site est 100 % statique : aucun build, aucune dépendance.

**Options :**

- **Netlify / Vercel / Cloudflare Pages** : connecter le repo, choisir la branche, déployer. Aucune commande de build.
- **OVH / hébergement classique** : transférer tout le contenu à la racine du site.
- **GitHub Pages** : activer Pages sur la branche, choisir la racine.

Pensez ensuite à :

1. Acheter `protection-habitat-sudouest.fr` (ou domaine équivalent).
2. Pointer le DNS vers l'hébergeur choisi.
3. Activer le HTTPS (automatique sur Netlify/Vercel/Cloudflare).

## Configuration à effectuer **avant** mise en ligne

### 1. Endpoint du formulaire — `assets/js/main.js`

En haut du fichier, configurer les constantes :

```js
var FORM_ENDPOINT = "https://formspree.io/f/XXXXXXXX"; // ou webhook Make/Zapier
var FALLBACK_EMAIL = "contact@protection-habitat-sudouest.fr";
var CLARITY_ID    = "";  // Microsoft Clarity (gratuit) — heatmaps & enregistrements
var META_PIXEL_ID = "";  // Meta / Facebook Pixel — retargeting + conversions
```

Options de soumission :
- **Formspree** (simple, rapide à brancher).
- **Webhook Make / Zapier / n8n** vers Google Sheets + email + SMS.
- **Backend custom** (PHP, Node) si besoin de logique métier.

Tant que `FORM_ENDPOINT` est vide, le formulaire bascule sur un `mailto:` de secours — utile en local, **à remplacer en production**.

### 1.b — Formulaire multi-step

Le JS remplace automatiquement le `<form id="lead-form">` (visible sans JS) par un formulaire **multi-step en 4 écrans** plus une variante **« rappel express »** (3 champs) accessible via le lien `Plutôt un rappel rapide`.

Architecture des écrans :
1. **Problème observé** (boutons visuels avec auto-avance)
2. **Délai** (boutons visuels avec auto-avance)
3. **Localisation** (CP + ville + statut)
4. **Coordonnées** (prénom + téléphone + consentement) ← *seul moment où on demande le numéro*

Bénéfice attendu : taux de conversion 30–80 % supérieur à un formulaire long en une page (cf. études standard sur les funnels B2C).

Tous les événements multi-step sont trackés dans `dataLayer` :
- `ms_step_view` (step: 1–4)
- `ms_select` (field, value)
- `cb_form_view` (passage à la variante express)
- `lead_submit` (avec `kind: multistep | callback`)
- `lead_submit_error`
- `lead_blocked_bot`

### 1.c — Bannière saisonnière

Une bannière `Saison hydrofuge en cours` s'affiche automatiquement de **mars à octobre** (configurable via `SEASON_BANNER_MONTHS` dans main.js). Crée un effet d'urgence honnête fondé sur les conditions réelles d'application des produits.

### 2. Tracking

Ajouter dans chaque page, juste avant `</head>`, le snippet **Google Tag Manager** ou **GA4** :

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
```

Le JS pousse déjà ces événements dans `dataLayer` :
- `lead_submit` (succès)
- `lead_submit_error`
- `lead_submit_fallback_mailto`
- `lead_blocked_bot`
- `phone_click`
- `lead_thanks_view` (page `/merci/`)

À utiliser pour configurer les conversions Google Ads et les rapports GA4.

### 3. Numéro de téléphone

Remplacer dans toutes les pages `tel:+33000000000` par le vrai numéro de rappel ou le numéro tracké (Aircall, Ringover, etc.).

### 4. Pages légales

Compléter `mentions-legales/`, `politique-confidentialite/` et `conditions-utilisation/` avec les coordonnées réelles de l'éditeur, de l'hébergeur, le SIRET et la date de mise à jour.

### 5. Bannière cookies

À déployer une fois Analytics / Ads actifs. Solutions simples : Tarteaucitron, CookieYes, ou un consent banner maison.

## Suivi des leads

Format de message à transmettre au client (par email / SMS / WhatsApp) :

```
Nouveau lead toiture — Limoges
Nom : ...
Téléphone : ...
Ville : ... (CP : ...)
Statut : propriétaire
Problème : mousse + tuiles poreuses
Type : toiture
Délai : dans le mois
Source : /hydrofuge-toiture-limoges/
```

Tableau de suivi recommandé (Google Sheets / Airtable) :
date · source · ville · service · prénom · téléphone · statut (nouveau / contacté / devis / signé / refusé) · qualité (faible / moyen / bon / premium) · commentaire · facturable

## SEO

- Sitemap : `/sitemap.xml`
- Robots : `/robots.txt` (la page `/merci/` est exclue de l'indexation)
- Chaque landing locale a un contenu, une FAQ et un hero distincts (cf. recommandations Google sur le « contenu utile »).
- À soumettre à Google Search Console + Bing Webmaster Tools dès la mise en ligne.

## Conformité

- **RGPD** : consentement explicite via case à cocher non précochée, finalités mentionnées (recontact + transmission au partenaire).
- **Démarchage rénovation énergétique** (depuis le 1er juillet 2025) : modèle reposant **uniquement** sur des demandes entrantes volontaires. Pas d'appels sortants à froid, pas de SMS non sollicités, pas d'emailing acheté.
- Pas de mention RGE si le partenaire ne l'est pas. Pas de « isolation gratuite ». Pas d'« aides garanties ».

## Roadmap (post-MVP)

- Pages locales additionnelles : Brive, Tulle, Albi, Castres, Saint-Junien.
- Pages services : hydrofuge façade, isolation combles, VMC.
- Bannière cookies + intégration Analytics.
- Lead magnet : guide PDF « 7 signes d'une toiture poreuse » avec formulaire email court.
- A/B test : multi-step vs. callback express vs. formulaire long.
- Vraies photos de toiture (hero + before/after) — à fournir par le partenaire.
- Preuves sociales : compteur de diagnostics réalisés, avis Google (quand disponibles).

## Améliorations conversion déjà en place

- ✅ Formulaire multi-step (4 écrans, téléphone demandé en dernier)
- ✅ Variante « rappel express » 3 champs
- ✅ Bannière saisonnière automatique mars→oct.
- ✅ Sticky CTA mobile + desktop (apparaît au scroll)
- ✅ OG image 1200×630 (partage WhatsApp/Facebook/Twitter)
- ✅ Hooks Microsoft Clarity et Meta Pixel (à activer via constantes)
- ✅ Tracking étape par étape dans dataLayer/gtag
- ✅ Honeypot anti-bot
- ✅ Validation FR (téléphone + code postal)
- ✅ Fallback mailto si endpoint non configuré
- ✅ Page 404 brandée
- ✅ Sécurité HTTP (HSTS, X-Frame, Permissions-Policy, etc.)

## Notes

- Couleurs : vert foncé `#0f4d3a`, orange CTA `#ec6f1a`.
- Police système (pas de webfont) pour minimiser le coût de chargement et améliorer le Largest Contentful Paint sur mobile.
- Mobile-first : tous les CTA sont accessibles via une barre fixe en bas d'écran sur mobile.
