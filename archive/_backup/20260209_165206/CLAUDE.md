# CLAUDE.md

Ce fichier guide Claude Code (claude.ai/code) pour travailler sur ce dépôt.

## Présentation du projet

Portfolio / site vitrine d'Angélique Redjdal ("Arprodev"), développeuse full-stack à Montpellier. Site one-page statique avec backend PHP (formulaires). Hébergé sur `devweb.angelgaeta.com`.

## Architecture

**Site HTML one-page** (`index.html`) — quatre sections par ancres :
- `#home` — Bannière hero avec vidéo de fond (`img/bgvideo.mp4`)
  - `#about` — Profil (stack, présentation, infos)
- `#portfolio` — Galerie filtrée via Isotope (catégories : web, design, dev)
  - `#contact` — Formulaire de contact (AJAX)

**Ordre de chargement CSS** (dans `<head>`) :
1. `css/plugins.css` — styles tiers
2. `css/style-dark.css` — thème de base (sombre par défaut)
3. `css/purple-color.css` — couleur d'accent (alternatives : `pink-color.css`, `yellow-color.css`)
4. `css/custom.css` — surcharges projet et custom properties (design tokens dans `:root`)

**JavaScript** (`js/`) :
- `modernizr.js` — détection de fonctionnalités, chargé dans `<head>`
- `jquery.min.js` + `plugins.min.js` — jQuery, Isotope, Owl Carousel, Magnific Popup, SimpleBar, Tilt.js, fitty (tout bundlé)
  - `main.js` — logique applicative : preloader, filtrage portfolio, formulaire contact AJAX (`contactFormSetup`)

**Backend PHP** :
  - `mail.php` — Gère le formulaire de contact AJAX (champs `cf_*`). Inclut honeypot anti-spam, assainissement des entrées, validation email.

## Développement

Aucun build, aucun bundler, aucun gestionnaire de paquets. Modifier les fichiers directement et servir via n'importe quel serveur local.

```bash
# Serveur local PHP
php -S localhost:8000

# Ou avec Python
python3 -m http.server 8000
```

Les fonctionnalités mail (`mail.php`) nécessitent un serveur capable d'envoyer des emails (ex. hébergement OVH).

Aucun test ni linting configuré.

## Conventions

- **Langue** : tout le texte UI, les commentaires et les messages de commit sont en **français**.
- **Thème sombre par défaut** : `style-dark.css` est chargé ; `style-light.css` existe mais n'est pas utilisé.
- **Custom properties CSS** : les design tokens (couleurs, espacements, rayons, ombres) sont dans `css/custom.css` sous `:root`. Utiliser ces variables, ne pas coder en dur.
- **jQuery** : tout le JS utilise jQuery (pas de vanilla DOM). Vérifier l'existence du plugin avant appel (ex. `$.fn.isotope`, `$.fn.owlCarousel`).
- **Soumission de formulaires** : tous les formulaires POST vers `mail.php` en AJAX, réponse JSON attendue `{status, message}`.
- **SEO** : données structurées (JSON-LD schéma `Person`), balises Open Graph et Twitter Card dans `<head>` de `index.html`. Les maintenir synchronisées avec le contenu.

## Sécurité (obligatoire)

### `mail.php`

- **Validation stricte** : valider format email (`filter_var` + longueur max 254), longueur min/max de chaque champ. Rejeter toute entrée hors limites.
- **Anti-spam** : honeypot actif (champ `website`). Ajouter un rate limit côté serveur si possible (ex. session ou IP).
- **Injection d'en-têtes email** : ne jamais injecter de données utilisateur dans les en-têtes `From`, `Reply-To` sans les assainir. Supprimer `\r`, `\n` et tout caractère de contrôle.
- **Limites de taille** : respecter les `$maxLen` définis dans `clean_text()` / `clean_message()`. Ne pas les augmenter sans raison.
- **Réponse JSON standard** : toujours répondre `{status, message}`. Ne jamais exposer de stack trace, chemin serveur ou détail d'erreur interne.
- **Logs** : logs minimaux. Ne jamais logger de données personnelles (email, nom, contenu du message).
- **Email destinataire** (`$recipient` ligne 57) : ne pas exposer cette adresse côté client ni dans les réponses JSON.

### `private/`

- (Supprimé) Dossier `private/` : n'est plus utilisé (chat retiré).

## Checklist avant commit

1. **Secrets** : aucune clé API, token ou mot de passe dans le diff (`git diff --staged`).
2. **Données personnelles** : vérifier que l'email, le téléphone et l'adresse dans `index.html` sont intentionnels (pas de données de test).
3. **Secrets** : confirmer qu'aucune clé/token n'est présent dans le staging (`git status`).
4. **Email destinataire** : `$recipient` dans `mail.php` ne doit pas avoir été modifié par erreur.
5. **Langue** : message de commit en français.

## Fichiers sensibles

- `mail.php` ligne 57 — adresse email destinataire
- `index.html` — contient téléphone, email, localisation
