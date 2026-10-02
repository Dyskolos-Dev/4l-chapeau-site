# 4L CHAPEAU

Site de l’association de Maxence et Baptiste : préparation du 4L Trophy 2028, recherche de leur future Renault 4L depuis Saint-Chamond, actualités, événements, galerie et soutiens.

## Lancer le projet en local

```bash
npm install
cp .dev.vars.example .dev.vars
npm run build
npm run start
```

Renseignez ensuite les deux mots de passe réels entre guillemets dans `.dev.vars`. Ce fichier est ignoré par Git et ne doit jamais être publié.

Les commandes `npm run dev` et `npm run start` préparent automatiquement la base locale, sans remplacer les contenus déjà saisis. Le fichier `.dev.vars` est lu seulement par votre prévisualisation locale et n’est jamais embarqué dans l’image Docker. `npm run dev` reste utile pour travailler sur le rendu, mais `npm run start` est la prévisualisation complète à utiliser pour tester le portail et les imports d’images.

## Portail équipage

Le portail se trouve à l’adresse `/admin`. Il est réservé aux deux identifiants suivants :

- `baptiste` utilise `ADMIN_BAPTISTE_PASSWORD`
- `maxence` utilise `ADMIN_MAXENCE_PASSWORD`

Ces deux variables doivent être définies comme **secrets** chez l’hébergeur choisi. Ne mettez jamais leurs valeurs dans le dépôt Git. Le portail crée un cookie de session HTTP-only, signé et valable 12 heures.

Depuis le tableau de bord, l’équipage peut gérer :

- les textes, boutons, menus, pages et visuels hero ;
- les membres de l’équipage, le statut du projet et l’objectif 2028 ;
- les actualités, avancées, photos de galerie et liens de soutien.

## Formulaire de don HelloAsso

Le bouton « Faire un don » ouvre le formulaire officiel HelloAsso dans une fenêtre du site. Depuis `Site & équipe` > `Soutenir`, vous pouvez modifier son libellé, les textes de la fenêtre, l’URL du widget et le lien direct de secours, sans toucher au code.

## Données et médias

Le projet utilise Cloudflare D1 (`DB`) pour les contenus structurés et R2 (`BUCKET`) pour les images importées. Conservez ces deux liaisons si vous le déployez sur Cloudflare Workers ; elles sont déclarées dans `.openai/hosting.json`.

Les schémas sont dans `db/schema.ts` et les migrations Drizzle dans `drizzle/`. N’écrasez pas les migrations déjà existantes : ajoutez-en une nouvelle à chaque changement de schéma.

## Vérifier avant publication

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Le dossier de build produit un Worker compatible avec l’infrastructure Cloudflare. La publication et la configuration des secrets restent sous votre contrôle.

## Déploiement Docker autonome

Le `Dockerfile` produit une image autonome : elle exécute le Worker généré avec Wrangler/Miniflare, sans connexion à GPT, Sites ou Cloudflare. D1 et R2 sont émulés localement et leurs données sont conservées dans le volume Docker nommé `4l_chapeau_data`.

Avant le premier démarrage, créez deux fichiers locaux — un mot de passe par fichier, sans les ajouter à Git :

```text
secrets/admin_baptiste_password.txt
secrets/admin_maxence_password.txt
```

Vous pouvez aussi indiquer des chemins externes avec `ADMIN_BAPTISTE_PASSWORD_FILE_PATH` et `ADMIN_MAXENCE_PASSWORD_FILE_PATH`. Docker Compose les monte comme secrets ; les valeurs ne figurent ni dans l’image ni dans `docker-compose.yml`.

```bash
docker compose up -d --build
```

Le site écoute par défaut sur `http://localhost:8787`. Pour choisir un autre port hôte, utilisez `HOST_PORT=8080 docker compose up -d`. En production, placez-le derrière un reverse proxy HTTPS : le cookie du portail équipage est sécurisé lorsque `NODE_ENV=production` (valeur par défaut).

Les migrations D1 sont appliquées automatiquement à chaque démarrage. Sauvegardez régulièrement le volume `4l_chapeau_data`, qui contient à la fois les contenus du tableau de bord et les images importées. `docker compose down` conserve ce volume ; `docker compose down -v` l’efface volontairement.
