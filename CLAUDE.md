# CLAUDE.md — Guide Claude Code (low-tokens)

But : améliorer ce portfolio **sans refonte lourde** :
- Design **moderne, élégant, cohérent, premium** (couleurs + typos soignées)
- UX **fluide** (donne envie de scroller + rester)
- Positionnement : **développeuse d’abord**, avec **bonus design/UI**
- Consommation tokens : **minimum**

---

## 0) Règle #1 — Low tokens
- Réponses **courtes**, orientées **actions concrètes**
- Pas de blabla, pas de justification longue
- Toujours produire :
  **(1) constats → (2) plan → (3) changements**

Format attendu :
1) 5–10 problèmes concrets (fichier + zone)
2) Plan P0/P1/P2 (max 8 items)
3) Appliquer **P0 puis P1 uniquement**
4) Résumé diff (fichiers modifiés + gain)

---

## 1) Objectif produit (priorités)

### P0 — Première impression + impact immédiat (mobile + perf + lisibilité)
- Hero lisible, orienté métier
- Hiérarchie claire dès l’écran 1
- Navigation / scroll évidents
- Projets = section la plus convaincante
- CTA contact **simple et visible**
- Perf : supprimer le “lourd inutile”, fallback mobile (images/vidéo)

### P1 — Crédibilité développeuse (preuves + structure)
- Projets présentés comme **preuves de valeur**
- Stack principale visible
- Structure de contenu claire
- Micro-UX propre (hover, focus, feedback)
- Modales projets accessibles (ESC, focus, scroll lock)

### P2 — Polish premium
- Animations sobres
- Détails UI cohérents (cards, spacing, alignements)
- Optimisations perfs faciles (lazy, preload utiles)

---

## 2) Positionnement (non négociable)

Toujours mettre en avant :
- architecture
- clean code
- API
- qualité & maintenabilité
- projets concrets
- stack principale

Design / UI / UX = **bonus**, jamais le cœur du discours.

Éviter :
- ton junior
- discours générique
- posture “designer avant dev”

---

## 3) Contraintes techniques (ne pas casser)
- Site statique one-page : `index.html`
- jQuery + plugins existants (Isotope, Owl…)
- PHP uniquement pour contact : `mail.php`
- Pas de framework, pas de build
- Changements **petits, réversibles**

---

## 4) Architecture du repo (repères)
- `index.html` — ancres : `#home`, `#about`, `#portfolio`, `#contact`
- CSS :
  1. `css/plugins.css`
  2. `css/style-dark.css`
  3. `css/purple-color.css`
  4. `css/custom.css` (design tokens)
- JS :
  - `jquery.min.js`, `plugins.min.js`
  - `main.js`
- PHP :
  - `mail.php` (AJAX JSON)

---

## 5) Design system (source de vérité)
Source unique : `css/custom.css` (`:root`).

Règles techniques :
- toujours utiliser les **variables CSS**
- aucune couleur hardcodée si un token existe
- préserver la cohérence : 1 système de spacing, 1 système de radius, 1 système d’ombre

---

## 6) Design — principes visuels (obligatoires)

Objectif : rendu **premium, moderne, lisible** (avec de “belles couleurs” et de “belles typos”).

### Typographie (priorité)
- 2 polices max (une pour titres, une pour texte)
- tailles confortables (mobile d’abord)
- line-height généreux
- hiérarchie nette (H1/H2/H3 visibles)

### Couleurs (harmonie)
- 1 fond principal + 1 surface (cards) + 1 accent + 1 “accent soft”
- accent utilisé avec parcimonie (CTA, liens, highlights)
- contrastes AA minimum (texte lisible)

### Hiérarchie visuelle
- **1 message principal par écran**
- titres très visibles
- éléments secondaires discrets
- jamais tout au même niveau

### Rythme & respiration
- sections bien espacées verticalement
- alternance : dense → aéré → dense
- éviter les blocs tassés

### Grille & alignements
- largeur de lecture limitée (≈1100–1200px)
- alignements stricts
- cohérence verticale entre sections

### Contraste intelligent
- utiliser d’abord **taille, poids, espace**
- la couleur vient en dernier
- pas de contrastes faibles

### Cards & composants
- fond légèrement distinct
- padding généreux
- ombre douce
- rayons cohérents partout

### Cohérence UI
- mêmes boutons
- mêmes rayons
- mêmes ombres
- mêmes espacements
→ aucun composant “à part”

### Mobile-first
- texte jamais serré
- boutons larges
- respiration conservée
- pas de réduction excessive

Interdits :
- gadgets visuels
- surcharge décorative
- hiérarchie plate
- styles incohérents

---

## 7) UX (parcours recruteur)

Objectif : comprendre en **10 secondes**, décider en **60**.

Parcours idéal :
Hero → crédibilité → projets → contact

Règles UX :
- CTA visible tôt (max 2)
- chaque section compréhensible en 5s
- feedback clair (loading / succès / erreur)
- aucune friction inutile (preloader long, scroll bloqué…)
- accessibilité clavier : focus visible, navigation logique

---

## 8) Hero — standard attendu

Structure obligatoire :
- Ligne 1 : rôle principal
- Ligne 2 : stack cible
- Ligne 3 : promesse claire (qualité, maintenabilité, UX)

Règles :
- texte court
- orienté valeur métier
- jamais générique
- pas de duplication desktop/mobile (1 contenu, responsive via CSS)

CTA :
- 1 primaire (Contact)
- 1 secondaire (Projets)
- pas plus

---

## 9) Portfolio = preuves (pas galerie)

Chaque projet doit afficher :
- Contexte (1 phrase)
- Mon rôle
- Stack (max 6 tags)
- 2–3 actions réalisées
- 1 résultat concret
- Liens utiles

Descriptions vagues interdites.

Modale / case study :
- fermeture ESC
- clic overlay pour fermer (si cohérent)
- scroll lock arrière-plan
- focus correct (au moins focus sur le bouton fermer)

---

## 10) JavaScript
- rester en jQuery
- vérifier plugins avant usage
- modifier uniquement si gain UX/perf réel

Formulaire :
- AJAX → `mail.php`
- JSON `{status, message}`
- loading + succès + erreur visibles
- pas de double submit

---

## 11) SEO & social
- conserver OG / Twitter / JSON-LD cohérents
- ne pas casser titres, ancres, metas existantes
- ajouter seulement si utile (pas d’usine à gaz)

---

## 12) Sécurité mail.php (non négociable)

Validation stricte :
- email : `filter_var` + longueur max 254
- champs texte : longueurs min/max définies
- rejeter toute entrée hors limites

Anti-spam :
- honeypot actif (champ website)
- option : rate-limit léger (session/IP) si simple

Injection headers :
- ne jamais injecter brut dans From / Reply-To
- supprimer `\r`, `\n` et caractères de contrôle

Réponse :
- toujours JSON `{status, message}`
- zéro info interne (stack trace, chemins)

Logs :
- minimaux
- jamais de données personnelles (email, nom, message)

⚠️ Sensible :
- `mail.php` : `$recipient` = ne pas exposer, ne pas modifier sans raison

---

## 13) Checklist avant commit
- aucun secret (token/clé/mdp)
- pas de données perso ajoutées par erreur
- tokens CSS respectés (pas de hardcode si variable existe)
- responsive OK (375 / 768 / 1280)
- focus clavier visible
- formulaire OK (succès/erreur/loading)
- `$recipient` inchangé

---

## 14) Workflow unique
1) Audit rapide  
2) Plan P0 / P1 / P2  
3) Appliquer P0 puis P1  
4) Résumé diff  

Fin.
