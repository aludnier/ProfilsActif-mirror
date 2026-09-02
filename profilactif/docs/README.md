# ProfilsActifs — Architecture

> Réf. cahier des charges : JEB/DNI/2026-003
> Ce document explique **pourquoi** le code est organisé comme il l'est. Pour lancer le projet, voir le README racine.

## 1. En une phrase

Un monorepo à deux applications (`apps/api` en Hono, `apps/web` en Vue) où le code est découpé **par fonctionnalité métier et non par couche technique**, avec deux exceptions assumées : du **DDD** là où il y a une vraie règle métier (la certification), et un **port/adapters** là où il y a réellement plusieurs implémentations (la vidéo).

## 2. Arborescence

```
profilactif/
├
├── migrations/                schema.sql puis seed.sql
└── apps/
    ├── api/src/
    │   ├── index.ts           démarrage du serveur
    │   ├── app.ts             assemblage Hono + injection des adapters
    │   ├── features/          UN DOSSIER PAR FONCTIONNALITÉ  ← le cœur
    │   │   ├── auth/
    │   │   ├── profil/
    │   │   ├── recruteur/
    │   │   ├── certification/ ← contient un domain/ (DDD)
    │   │   ├── interaction/
    │   │   └── admin/
    │   ├── ports/             contrat (interface) sans implémentation : la vidéo
    │   ├── adapters/          les deux implémentations concrètes du port vidéo
    │   ├── infrastructure/    MySQL, middleware d'auth, OpenAPI
    │   └── shared/            erreurs, pagination, rôles
    └── web/src/
        ├── features/          MÊME DÉCOUPAGE QUE L'API
        │   └── <slice>/       api.ts · views/ · components/
        ├── shared/            api-client.ts, store d'auth, composants transverses
        └── router/            routes + gardes par rôle
```

## 3. Choix n°1 — Vertical slice

Chaque fonctionnalité est un dossier autonome contenant **toute sa pile**, du HTTP au SQL :

```
features/profil/
├── ProfilRoutes.ts       les URLs, les gardes d'accès, la validation Zod, le code HTTP
├── ProfilService.ts      la logique applicative — le seul à décider quelque chose
├── ProfilRepository.ts   le seul à écrire du SQL
└── ProfilSchema.ts       les schémas Zod (validation + génération Swagger)
```

**Pourquoi pas de `*Handler.ts` séparé ?** Parce que « déclarer l'URL » et « valider puis répondre » sont la même couche : du HTTP. Les séparer donnait un fichier par slice qui ne faisait que passer le relais. En Hono, la route *est* le point d'accroche du handler, et le middleware de validation Zod s'y déclare directement :

```ts
profils.get('/', authOptionnel, zValidator('query', FiltresFeedSchema), async (c) => …)
```

**Pourquoi pas `controllers/ services/ models/` ?** Parce qu'avec un découpage par couche, ajouter « mettre un profil en favori » oblige à toucher quatre dossiers éloignés, et rien dans l'arborescence ne dit ce que fait l'application. Ici, l'arborescence **est** le cahier des charges : on lit `features/` et on voit les trois espaces du brief plus la certification.

Concrètement, ça donne aussi :

- **une répartition d'équipe évidente** — un slice par personne, très peu de conflits Git ;
- **une suppression propre** — si l'admin sortait du périmètre, `rm -rf features/admin` et c'est fini ;
- **la même carte mentale des deux côtés** — le front reprend exactement les mêmes noms de slices, donc `features/recruteur/api.ts` parle à `features/recruteur/RecruteurRoutes.ts`.

### La règle de dépendance

C'est ce qui empêche le vertical slice de dégénérer en plat de spaghettis :

```
Routes → Service → Repository → MySQL
            ↓
          ports/  (jamais adapters/ directement)
```

1. Le sens des flèches ne s'inverse jamais. Un Repository n'appelle pas un Service.
2. **Un slice n'importe pas un autre slice.** Ce qui est commun descend dans `shared/`, ou passe par un port.
3. Le SQL n'existe que dans les `*Repository.ts`. Le code HTTP (200, 404…) n'existe que dans les `*Routes.ts`. Entre les deux, le Service ne connaît ni Hono ni MySQL.
4. **Une table a un seul slice propriétaire en écriture. La lecture croisée est autorisée** (voir le tableau ci-dessous).

Le slice `interaction/` existe précisément à cause de la règle 2 : le recruteur *écrit* les contacts, le candidat les *lit*. Plutôt que de faire s'appeler les slices `recruteur` et `profil`, les deux passent par un slice dédié qui possède ces tables.

### Qui possède quoi

La règle 2 interdit les imports de code entre slices ; elle ne dit rien des tables, et plusieurs slices vont légitimement lire les mêmes. Sans propriétaire déclaré, on finit soit avec du SQL dupliqué, soit avec un slice qui en importe un autre. D'où ce tableau, qui est la référence en cas de doute :

| Slice | Écrit (propriétaire) | Lit seulement |
|---|---|---|
| `auth` | `utilisateur` | — |
| `profil` | `profil`, `competence`, `profil_competence`, `video` | `certification` (badge dans le feed) |
| `recruteur` | `favori` | `profil`, `contact` (tableau de bord) |
| `interaction` | `vue`, `contact`, `notification` | `profil`, `utilisateur` (libellés) |
| `certification` | `question`, `reponse_possible`, `tentative`, `tentative_reponse`, `certification` | — |
| `admin` | `journal_moderation`, et les colonnes `statut_moderation` de `profil` et `video` | tout, en agrégation |

Deux conséquences sur les frontières :

- **`admin/` ne gère pas les questions du questionnaire.** Le CRUD des questions et des pondérations vit dans le slice `certification`, sur des routes gardées par `requireRole('admin')` — c'est lui qui possède ces tables et qui connaît leurs invariants. `admin/` garde la modération et le tableau de bord global. Côté front, `admin/views/GestionQuestionsView.vue` appelle donc `features/certification/api.ts` : la vue suit le parcours utilisateur, l'API suit la propriété des données.
- **`recruteur/` ne réimplémente pas le filtrage du catalogue.** Ce sont les mêmes filtres que le feed public : la requête vit dans `ProfilRepository`, et `recruteur/` ne possède que les favoris et l'agrégation de son tableau de bord.

## 4. Choix n°2 — DDD uniquement sur la certification

`features/certification/domain/` contient du code **pur** : ni SQL, ni HTTP, ni Hono, aucun import de framework.

| Fichier | Rôle |
|---|---|
| `domain/Questionnaire.ts` | ce qu'est une question valide : catégorie d'aptitude, pondération > 0, au moins une bonne réponse |
| `domain/Score.ts` | le calcul : score pondéré par catégorie, score global, seuil de réussite, niveau de badge |
| `domain/Score.test.ts` | les tests unitaires, sans base de données ni serveur |

**Pourquoi seulement ici ?** Parce que c'est le seul endroit du sujet avec une règle métier non triviale. Le brief en fait « un élément central du dispositif » et l'admin peut modifier les pondérations à chaud : la règle a de la valeur, elle va changer, elle doit être isolée et testable.

**Pourquoi pas partout ?** Parce que `profil` et `recruteur` sont du CRUD avec des filtres. Y mettre des entités, des value objects et des repositories abstraits ajouterait trois couches d'indirection pour zéro règle métier — de la cérémonie, pas de l'architecture. Le DDD est appliqué là où il paie.

Conséquence pratique : le calcul du score se teste en millisecondes, sans MySQL, sans serveur, sans jeu de données. C'est la seule partie du projet couverte par des tests unitaires, et c'est voulu.

## 5. Choix n°3 — Un port / adapters, uniquement sur la vidéo

Un port, deux adapters :

```
ports/VideoProvider.ts  ←─ adapters/video/IframeAdapter.ts         (lien YouTube / Vimeo)
                        ←─ adapters/video/VideoStorageAdapter.ts   (upload, 100 Mo max)
```

Le cahier des charges laisse explicitement le choix : *« lien externe **ou** upload selon contraintes techniques »*. Un port n'est pas une abstraction de principe ici, il y a réellement **deux implémentations vivantes** derrière.

`ProfilService` appelle le port et ne sait pas ce qu'il y a derrière. Le seul fichier qui choisit une implémentation concrète est `app.ts`. Ce qu'on y gagne :

- on démarre en **v1 sur l'iframe** (validé par le brief pour le démonstrateur), et on branche l'upload en semaine 2 **sans toucher au slice profil** ;
- on teste le service avec un faux adapter, sans réseau ni disque.

Le port est **hors** de `features/` : c'est un contrat transverse, utilisé par `profil` (attacher une vidéo) et par `admin` (modérer puis supprimer un contenu).

### Pourquoi les notifications n'ont pas de port

C'est la contrepartie du critère ci-dessus, et elle compte autant que le choix lui-même. Un port se justifie quand il y a **deux implémentations vivantes** ; les notifications n'en ont qu'une. L'exigence 2.3 (« informer le candidat lors d'une nouvelle interaction recruteur ») est satisfaite par une notification dans l'application, et un envoi d'email demanderait du SMTP, des gabarits et de la délivrabilité que le démonstrateur n'exercera jamais.

Un `NotificationSender` avec un seul adapter réel serait une abstraction qui existe pour justifier l'abstraction. Le slice `interaction/` possède déjà la table `notification` et sait déjà quand un contact est créé : la notification s'écrit donc dans `InteractionRepository`, directement. Le jour où un second canal existe vraiment, on introduit le port à ce moment-là — avec, cette fois, deux implémentations.

Le principe appliqué dans les deux sens : **un port là où il y a deux implémentations, pas de port là où il n'y en a qu'une.**

## 6. La stack, et pourquoi

| Couche | Choix | Raison |
|---|---|---|
| Front | Vue 3 + Vue Router | composition API, découpage par feature naturel |
| UI | PrimeVue + Tailwind | PrimeVue pour les composants lourds (DataTable, Paginator), Tailwind pour la mise en page — pas de CSS maison à maintenir |
| API | Hono | très léger, middlewares typés, s'accorde bien avec des slices montés indépendamment |
| BDD | MySQL | relationnel imposé par le brief ; les filtres du catalogue sont des jointures, pas du document |
| Mots de passe | bcryptjs | hachage avec salt, jamais de mot de passe en clair, coût configurable par l'env |
| Config | dotenv | `.env.example` versionné, `.env` jamais commité |
| Doc | Swagger UI | générée depuis les schémas Zod des `*Schema.ts` — la doc ne peut pas se désynchroniser du code |

## 7. Comment on répond aux exigences du brief

| Exigence | Où c'est traité |
|---|---|
| Profil consultable sans compte | `GET /api/profils/:id` laissée publique par `ProfilRoutes`, page `ProfilPublicView.vue` |
| Badge visuellement distinct | `shared/components/BadgeCertification.vue`, un seul composant réutilisé partout |
| Vidéo par lien **ou** upload | le port `VideoProvider` et ses deux adapters |
| Prévisionnement sans quitter la page | `shared/components/LecteurVideo.vue` |
| Notification sur interaction recruteur | `InteractionService` à la création du contact, table `notification`, relevée par `MesInteractionsView.vue` |
| Feed paginé, 20 max par page | `shared/pagination.ts`, borne appliquée **côté serveur** ; le front utilise directement le `Paginator` de PrimeVue |
| Reprise du questionnaire après interruption | sauvegarde incrémentale des réponses dans `CertificationRepository` |
| Auth multi-rôles | slice `auth/` (bcrypt + JWT) et `infrastructure/auth.middleware.ts` (`requireRole`) |
| API RESTful documentée | `infrastructure/openapi.ts`, Swagger UI sur `/docs` |

## 8. Conventions

- **Tout le vocabulaire métier est en français** (`profil`, `recruteur`, `certification`, `interaction`), le vocabulaire technique en anglais (`Routes`, `Service`, `Repository`). On ne mélange pas les deux dans un même nom.
- **Un fichier = une responsabilité**, nommé `<Slice><Couche>.ts`. Si un nom ne rentre pas dans ce moule, c'est probablement qu'il ne va pas dans `features/`.
- **Rien de commun ne se duplique entre slices** : ça descend dans `shared/` (back) ou `shared/` (front). Un seul dossier « commun » par application — pas de `lib/` en plus de `shared/`.
- **Pas de store Pinia par slice.** L'état d'une vue reste dans la vue, et les filtres du feed et du catalogue vivent dans la query string (partageable, rechargeable, gratuit). Deux stores seulement, chacun avec une raison : `shared/stores/auth.ts` (authentiquement global, lu par les gardes du router) et `features/certification/store.ts` (passation multi-étapes, sauvegarde automatique, reprise après interruption).
- **Pas de composant qui ne fait qu'envelopper un composant PrimeVue.** Si l'enveloppe n'ajoute ni logique ni contrainte métier, on utilise PrimeVue directement.
- Les schémas Zod servent **deux fois** : validation à l'exécution et génération de la doc. On n'écrit jamais la doc à la main.

## 9. Ce qui est volontairement hors périmètre

Conformément au point 5 du cahier des charges, ProfilsActifs est un **outil de valorisation des compétences, pas un réseau social**. Il n'y a donc ni likes, ni partages, ni fil d'actualité, ni système de recommandation. Les seules interactions modélisées sont celles qui mènent à une mise en relation professionnelle : la vue, le favori et la prise de contact.
