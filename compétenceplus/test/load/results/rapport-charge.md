# Rapport de test de charge CompétencePlus

**Date :** 9 septembre 2026  
**Outil :** k6  
**Environnement :** serveur API local sur `http://localhost:3000`  
**Charge :** 100 utilisateurs virtuels simultanés  
**Duree de chaque test :** environ 60 secondes  
**Jeu de donnees :** 500 profils et 300 videos generes par le script de seed.

## 1. Objectif

L'objectif est de mesurer le comportement de l'API lorsque 100 utilisateurs parcourent simultanement le catalogue. Les trois routes sollicitees sont :

- `GET /profiles`
- `GET /profiles/:id/competences`
- `GET /profiles/:id`

Deux executions ont ete realisees : une execution representative d'une navigation humaine avec une pause d'une seconde, puis une execution de stress sans pause.

## 2. Scenario realiste avec pause

Le script `test/load/k6-catalogue.js` execute les trois requetes puis attend une seconde avant de recommencer. Les 100 utilisateurs virtuels restent actifs pendant toute la duree du test.

| Route | Mediane | P95 | Maximum |
|---|---:|---:|---:|
| `GET /profiles` | 347,52 ms | 816,79 ms | 2 823,91 ms |
| `GET /profiles/:id/competences` | 383,17 ms | 849,54 ms | 964,82 ms |
| `GET /profiles/:id` | 73,31 ms | 163,06 ms | 849,79 ms |

- Requetes traitees : **9 643**
- Erreurs HTTP : **0**
- Checks reussis : **9 643 / 9 643**
- Debit moyen : **159,46 requetes/s**

## 3. Scenario de stress sans pause

Le script `test/load/k6-catalogue-stress.js` execute les memes requetes sans `sleep(1)`. Ce scenario mesure la capacite de saturation de l'API plutot qu'une navigation humaine.

| Route | Mediane | P95 | Maximum |
|---|---:|---:|---:|
| `GET /profiles` | 237,89 ms | 461,63 ms | 4 521,89 ms |
| `GET /profiles/:id/competences` | 259,44 ms | 456,50 ms | 570,32 ms |
| `GET /profiles/:id` | 61,31 ms | 245,17 ms | 849,79 ms |

- Requetes traitees : **29 221**
- Erreurs HTTP : **0**
- Checks reussis : **29 221 / 29 221**
- Debit moyen : **483,01 requetes/s**

## 4. Analyse et goulot d'etranglement

Le catalogue constitue le principal point de vigilance. La route `GET /profiles` charge encore la liste complete des profils en une seule reponse. Elle atteint le temps maximal le plus eleve du test de stress, avec **4,52 secondes**.

Dans le scenario realiste, la route des competences presente le P95 le plus eleve avec **849,54 ms**. Elle reste toutefois sans erreur sous 100 utilisateurs simultanes.

La pagination a ete ajoutee avec la route :

```text
GET /profiles/catalogue?page=1&limit=20
```

Les executions presentees ici utilisent encore `GET /profiles`. Un test complementaire sur `/profiles/catalogue` est donc necessaire pour mesurer precisement le gain apporte par la pagination.

## 5. Sorties brutes k6

Les fichiers bruts sont joints au rapport dans le meme dossier :

- [k6-raw.json](./k6-raw.json) : sortie brute du scenario avec pause
- [k6-summary.json](./k6-summary.json) : resume du scenario avec pause
- [k6-stress-raw.json](./k6-stress-raw.json) : sortie brute du scenario sans pause
- [k6-stress-summary.json](./k6-stress-summary.json) : resume du scenario sans pause

Les fichiers `*-raw.json` sont les sorties originales generees par l'option k6 `--out json`. Ils sont volontairement conserves comme fichiers joints plutot qu'integres dans ce document : ils contiennent respectivement environ 43 Mo et 130 Mo de donnees brutes. Les resumes JSON contiennent les memes metriques agregees dans un format lisible.

Pour relire les sorties depuis un terminal :

```bash
jq . test/load/results/k6-summary.json
jq . test/load/results/k6-stress-summary.json
```
