# Portfolio DevWeb

Portfolio personnel (webdesign + developpement front/back) deploye sur:
`https://devweb.angelgaeta.com/`

## Stack

- HTML5
- CSS3 (dont `css/design-tokens.css`)
- JavaScript (vanilla)
- PHP (endpoints simples: contact, tracking, update JSON)

## Lancer le projet en local

1. Cloner le repo:
   `git clone https://github.com/Angelgaeta/portfolio.git`
2. Se placer dans le dossier:
   `cd angelgaeta`
3. Lancer un serveur PHP local (recommande pour tester les scripts `.php`):
   `php -S localhost:8080`
4. Ouvrir:
   `http://localhost:8080`

Note: pour un test purement statique, `index.html` peut aussi etre ouvert directement, mais les endpoints PHP ne fonctionneront pas.

## Structure rapide

- `index.html`: page principale du portfolio
- `css/`: styles, tokens et themes
- `js/`: scripts front
- `img/`: assets et captures
- `data/posts.json`: donnees de posts/projets
- `archive/`: anciens backups de travail (sortis de la racine)

## Captures

![Apercu portfolio](img/og-cover.jpg)
![Capture projet](img/portfolio/00-screenshot-1.png)

## Production

- URL: `https://devweb.angelgaeta.com/`
- Canonical configure dans `index.html`
