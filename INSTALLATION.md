# EquiMeteo - Hebergement Web

Le dossier www contient le site complet et autonome : index.html, CSS compile,
icones et polices locales, moteur Three.js, piece Sol Blade, manifeste, icones
iPhone/Android, service worker et instantane d'actualites. Aucun Python, Java,
Node.js ou CDN de styles n'est necessaire sur l'hebergeur. La meteo en direct
necessite une connexion a Open-Meteo. WebGL est requis pour la piece 3D.

## Hebergeur Statique

Publier l'integralite du contenu de www dans le repertoire public du serveur.
index.html doit etre a la racine publique (ou celle du sous-dossier choisi).
Le site accepte les sous-dossiers : tous les chemins de ressources sont relatifs.
Utiliser HTTPS pour l'installation comme application et le mode hors ligne.
Ne pas ouvrir directement index.html depuis l'explorateur de fichiers.

Conserver .nojekyll, y compris si le logiciel de transfert cache les fichiers
commencant par un point. Servir les fichiers .js comme JavaScript, .json comme
JSON et manifest.webmanifest comme application/manifest+json. Ne pas rediriger
les fichiers manquants vers index.html et ne pas mettre sw.js en cache permanent.

## GitHub Pages - Contenu De www Seul

1. Creer un depot GitHub et y deposer tout le contenu de www a la racine.
2. Dans Settings > Pages, choisir Deploy from a branch.
3. Choisir la branche main (ou votre branche) et le dossier / (root).
4. Attendre la publication, puis ouvrir l'adresse HTTPS indiquee par GitHub.

Ne pas deposer le ZIP comme unique fichier : il faut publier ses fichiers
decompresses. Une copie de www dans un sous-dossier est accessible par /www/
si la racine du depot entier est publiee.

## GitHub Pages - Depot Projet Complet

Le projet fournit .github/workflows/deploy-pages.yml pour publier uniquement
www, sans les sources privees, caches ou cles de signature Android.

1. Pousser le projet avec www et le workflow sur GitHub.
2. Dans Settings > Pages, choisir GitHub Actions comme source.
3. Dans Actions, lancer Deploy EquiMeteo Pages, ou pousser une modification de www
   sur main/master. Le workflow publie le contenu de www a la racine du site.

Un depot projet peut etre servi sous https://PSEUDO.github.io/DEPOT/ : les
ressources restent valides, sans changer les chemins. Aucun deploiement distant
n'est effectue par le simple fait de generer le dossier en local.

## Actualites

GitHub Pages n'execute pas news.py. Le site lit equestrian-news.json, presente
la date de collecte et signale les collectes anciennes. Le bouton d'actualisation
relit le fichier publie : il ne collecte pas de nouveaux flux sur un hebergement
statique. Les filtres de periode et de zone restent actifs.

Pour collecter les actualites, reconstruire le site et republier www :

```sh
python3 build_www.py --refresh-news
```

Pour reconstruire sans nouvelle collecte :

```sh
python3 build_www.py
```

Generation locale : Linux x86_64, Python 3.9+, Internet au premier lancement pour
Tailwind et les polices. La reconstruction reutilise les outils deja en cache,
sans SDK Android ni Java. Le ZIP dist/EquiMeteo-www.zip est regenere egalement.
Le workflow de publication ne collecte pas automatiquement les actualites et
aucune tache recurrente n'est activee par defaut.

## Application Installable

Sur iPhone : ouvrir le site HTTPS dans Safari, Partager > Sur l'ecran d'accueil.
Sur Android : utiliser l'installation proposee par le navigateur compatible.
Apres une premiere visite reussie, l'interface et la piece peuvent se recharger
hors ligne. La meteo requiert Internet ; les actualites hors ligne sont un
instantane dont la date de collecte reste affichee.

Apres une mise a jour, fermer les anciennes fenetres de l'application et rouvrir
pour activer le nouveau cache. La meteo n'est pas mise en cache par le service
worker. Les licences locales sont conservees dans THREE-LICENSE.txt et icons/LICENSE.