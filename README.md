# TheGreenShot - Test Simon TRICHEREAU

## Prérequis

- NodeJS >= 20.18
- MySQL >= 8.4
- LibreOffice*

*Après plusieurs tests infructueux, j'ai décidé d'utiliser le package `libreoffice-convert` pour convertir les fichier **.docx** en **.pdf** aussi il est important pour le bon fonctionnement de l'API d'installer libreoffice sur son poste.

## Installation

1. Tout d'abord il vous faudra créer votre base de données MySQL grâce au fichier `/bulk.sql`
2. Ensuite, il vous faudra renseigner les données de votre configuration dans le fichier `/.env`
3. Maintenant vous pouvez installer les dépendances de node en faisant `npm i`
4. Puis il ne vous reste plus qu'à lancer l'API en faisant `npm run start`
5. Si vous souhaitez lancer les tests utilisez la commande `npm run test`

## Architecture

Pour gagner du temps je me suis servi d'un framework maison que j'ai conçu pour des projets personnels, créé sur la base de la librairie **KoaJS**. Pour faire simple, il s'agit d'une base MVC où tout est découpé en modules (un peu comme les Bundles sur Symfony par exemple).

Chaque module représente une table de la base de donnée et contient son propre :

- `Router.js` pour gérer les requêtes qui lui sont dédiées
- `Middlewares.js` pour gérer les données reçues et renvoyer des erreurs le cas échéant
- `Controller.js` pour gérer la logique métier
- `Models.js` pour valider les données et quelles soient en raccord avec ce qu'attend la base de données
- `Manager.js` pour gérer les échanges avec la base de données

**⚠️ À savoir** que normalement je préfixe les routes par le nom du module. Par exemple, pour faire un `[GET] /user/12` j'aurais normalement un fichier `/modules/User/Router.js` contenant la route `router.get("/:id")` mais la consigne me demandait des routes précises non préfixées, aussi j'ai fait un router "global".

## Exemple d'utilisation

Je vous conseille d'utiliser un logiciel tel que **Postman** pour effectuer des requêtes sur l'API en question.

Il vous faudra faire une requête `[POST] http://localhost:3030/convert` avec un body de type form-data avec ces paramètres :

```bash
+===============+==============+==========+=================================================+
|     param     |     type     | required |                     exemple                     |
+===============+==============+==========+=================================================+
| fileToConvert | .docx file   | yes      | /path/to/thegreenshot-test/tests/assets/cv.docx |
+---------------+--------------+----------+-------------------------------------------------+
| webhookUrl    | string (url) | no       | http://localhost:3030/test                      |
+---------------+--------------+----------+-------------------------------------------------+
```

Si vous renseignez le paramètre webhookUrl, alors une fois le fichier converti, l'API enverra un `[POST]` sur l'url renseignée en envoyant le paramètre `pdfUrl` contenant l'URL pour télécharger le PDF converti.

**⚠️ Attention** si vous utilisez l'url `localhost` il vous faut mettre la variable `ENVIRONMENT=development` dans le fichier `.env`

Vous pourrez ensuite tester la route `[GET] /stats` ce qui vous donnera quelque chose comme :

```json
{
    "total": 16,
    "tempsMoyen": "54.06 secondes",
    "reussi": "75.00 %",
    "echoue": "0.00 %"
}
```

## Améliorations et explications

Il m'aura fallut 6h pour mettre en place toute cette API sachant que j'ai perdu du temps en testant les modules `pdf-lib` et `docx-pdf` qui malheureusement n'ont pas fonctionnés correctement. 

Pour ne pas passer trop de temps sur ce test, je me suis permis de prendre un framework déjà existant et j'ai volontairement évité TypeScript pour développer plus rapidement. Cependant sur un projet à grande envergure c'est normalement un choix indiscutable. Il faudrait également mettre en place des linters pour travailler en équipe et qu'on ait tous un code "équivalent".

Concernant la gestion de la queue, j'ai préféré faire au plus simple en utilisant la base de données directement, mais il aurait fallut utiliser un système plus adapté tel que Redis Queue ou RabbitMQ. De plus, pour la gestion de la queue, j'ai utilisé un système de CRON qui appelle un script avec un fichier Semaphore pour éviter le traitement simultané. À la base j'avais pensé à une fonction récursive qui s'appellerait tant qu'il y a encore des fichiers à traiter et ainsi éviter la latence du CRON (chaque minute), mais j'ai préféré découpé ça du serveur en passant par les CRONS. Cependant sur un vrai projet j'utiliserai plutôt les CRON du serveur (et non le module CRON de nodeJS) afin de véritablement découper les 2...

L'avantage d'utiliser des CRONS c'est qu'on pourrait mettre en place un système de nettoyage des fichiers pour supprimer les fichiers plus vieux d'1 semaine par exemple et bien d'autres scripts comme par exemple déporter la gestion du webhook ... Ou alors on pourrait utiliser un système d'EventListenner plutôt que de faire de la programmation procédurale, mais par soucis de rapidité j'ai fait au plus simple. D'ailleurs je n'ai pas mis en place le système de renvoi de webhook en cas d'erreur par manque de temps.

Pour finir, concernant les tests, l'architecture permet de faire une multitude de tests différents (Unitaire, Fonctionnels ...) mais j'ai préféré me concentrer sur quelques tests end2end qui me semblent être les plus complets. Il faudrait cependant créer un Mock de la Base de Données afin d'éviter de polluer la "vraie" base. 