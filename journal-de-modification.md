# Journal des modifications (CHANGELOG)

## [1.2.0] - 2026-09-10

### 🏛️ Décision d'arbitrage de marque (Rebranding)
* **Date de décision :** 2026-09-09 à 15h30
* **Auteur de la décision :** Directeur de cabinet (transmis par Benjamin Sellami)
* **Objet :** Abandon immédiat et définitif de la dénomination commerciale « ProfilsActifs » au profit de « Compétences+ ».
* **Référence interne :** Clôture du ticket GitHub [#65] (*Rebranding to Compétences+*)

---

### 🔄 Modifications apportées
* **UI / Front-End :**
  * Remplacement de toutes les mentions textuelles (titres d'onglets, en-têtes, footers, écrans vides, modales d'erreur).
  * Déploiement du nouveau mot-symbole « Compétences+ », de la déclinaison monochrome et du nouveau favicon.
* **Back-End & Base de données :**
  * Migration et mise à jour des libellés en base de données, fixtures de test et comptes de démonstration.
  * Actualisation complète du catalogue des 500 profils de démonstration.
  * Normalisation des routes/URLs sans caractères accentués (`/competences`) pour garantir l'interopérabilité.
* **Notifications & Mails :**
  * Mise à jour des gabarits HTML/texte et des objets de mails transactionnels avec encodage UTF-8 validé pour l'accent.
* **Documentation & Supports :**
  * Actualisation du `package.json`, du `README.md`, de la documentation d'API.
  * Mise à jour du rapport de tests de charge et remplacement des captures d'écran ciblées dans le pitch deck.

---

### 🔍 Rapport d'audit des occurrences résiduelles (Grep)
*Recherche effectuée sur l'ensemble de l'arborescence du dépôt (`git grep -in "ProfilsActifs"`) :*

| Fichier / Emplacement | Occurrence | Justification légitime |
| :--- | :--- | :--- |
| `journal-de-modification.md` | Ligne 5, 8 | Traçabilité historique de la décision de renommage. |
| `.git/` (historique des commits) | Messages de commits antérieurs | Intégrité de l'historique Git (non réécrit par arbitrage). |

*Résultat net : 0 occurrence non justifiée dans le code source exécutable, les vues, les gabarits et les jeux de données livrés.*