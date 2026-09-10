import type { RouteLocationNamedRaw } from 'vue-router';

import amelieDubois from '@/assets/images/profils/amelie-dubois.webp';
import aurelieMasson from '@/assets/images/profils/aurelie-masson.webp';
import claraMorisset from '@/assets/images/profils/clara-morisset.webp';
import olivierGiraud from '@/assets/images/profils/olivier-giraud.webp';
import sebastienChevalier from '@/assets/images/profils/sebastien-chevalier.webp';
import thierryHenry from '@/assets/images/profils/thierry-henry.webp';
import yasminaBensaid from '@/assets/images/profils/yasmina-bensaid.webp';

/*
 * Placeholder data standing in for `GET /api/profils`. It lives in `shared/`
 * because both the catalogue (recruteur slice) and the profile sheet (profil
 * slice) read it, and a slice may not import another one's code. Delete the
 * whole file once the API answers.
 */
export type Experience = {
  periode: string;
  poste: string;
  organisation: string;
  description: string;
};

export type Profil = {
  id: string;
  nom: string;
  intitule: string;
  ville: string;
  modalite: string;
  experience: string;
  competences: string[];
  dureeVideo: string;
  certifie: boolean;
  miniature: string;
  disponibilite: string;
  contrat: string;
  bio: string;
  experiences: Experience[];
};

/* The catalogue shows the first page; the sheet can reach any of them. */
export const PROFILS: Profil[] = [
  {
    id: '5',
    nom: 'Thierry Henry',
    intitule: 'Administrateur de systèmes Linux',
    ville: 'Strasbourg (67)',
    modalite: 'Hybride',
    experience: "6 ans d'expérience",
    competences: ['Debian/RHEL', 'Ansible', 'Docker', 'Security'],
    dureeVideo: '1:10',
    certifie: true,
    miniature: thierryHenry,
    disponibilite: 'Disponible immédiatement',
    contrat: 'CDI / Temps plein',
    bio: "Administrateur systèmes depuis six ans, je maintiens des parcs Debian et RHEL pour des collectivités et des PME industrielles. J'automatise le déploiement et le durcissement des serveurs, et je documente systématiquement pour que l'équipe reste autonome après mon passage.",
    experiences: [
      {
        periode: '2021 - Pr.',
        poste: 'Administrateur systèmes Linux',
        organisation: 'Ville de Strasbourg • Strasbourg (67)',
        description:
          "Maintien en condition opérationnelle de 120 serveurs Debian. Migration du parc vers Ansible, divisant par trois le temps de déploiement d'un nouveau service.",
      },
      {
        periode: '2018 - 2021',
        poste: 'Technicien infrastructure',
        organisation: 'Groupe Rhenus • Colmar (68)',
        description:
          "Supervision, sauvegardes et plan de reprise d'activité pour trois sites industriels.",
      },
    ],
  },
  {
    id: '6',
    nom: 'Clara Morisset',
    intitule: 'Consultante en transition énergétique',
    ville: 'Bordeaux (33)',
    modalite: 'Déplacements',
    experience: "4 ans d'expérience",
    competences: ['Bilan carbone', 'RSE', 'Réglementation public'],
    dureeVideo: '1:45',
    certifie: true,
    miniature: claraMorisset,
    disponibilite: 'Disponible sous 2 mois',
    contrat: 'CDI / Temps plein',
    bio: "J'accompagne les collectivités de Nouvelle-Aquitaine dans leurs schémas directeurs énergie. Mon travail commence toujours par la mesure : sans données fiables, un plan de sobriété n'est qu'une intention.",
    experiences: [
      {
        periode: '2022 - Pr.',
        poste: 'Consultante transition énergétique',
        organisation: 'Cabinet Ausone • Bordeaux (33)',
        description:
          'Réalisation de bilans carbone réglementaires pour huit intercommunalités et accompagnement de leurs plans de rénovation.',
      },
      {
        periode: '2020 - 2022',
        poste: 'Chargée de mission énergie',
        organisation: 'Syndicat Énergies Gironde • Mérignac (33)',
        description:
          'Suivi des consommations du patrimoine bâti et instruction des dossiers de subvention.',
      },
    ],
  },
  {
    id: '7',
    nom: 'Sébastien Chevalier',
    intitule: 'Directeur des ventes équipements',
    ville: 'Marseille (13)',
    modalite: 'Présentiel',
    experience: "12 ans d'expérience",
    competences: ['Négociation B2B', 'Management', 'Export'],
    dureeVideo: '1:55',
    certifie: true,
    miniature: sebastienChevalier,
    disponibilite: 'Disponible sous 3 mois',
    contrat: 'CDI / Cadre',
    bio: "Douze ans de vente d'équipements industriels, dont sept à encadrer des équipes commerciales sur le pourtour méditerranéen. Je construis des cycles de vente longs, où la relation compte davantage que la remise consentie.",
    experiences: [
      {
        periode: '2017 - Pr.',
        poste: 'Directeur des ventes Sud-Est',
        organisation: 'Provalor Industries • Marseille (13)',
        description:
          "Encadrement de neuf commerciaux, ouverture des marchés Maghreb et Italie, croissance du chiffre d'affaires régional de 40 % en cinq ans.",
      },
      {
        periode: '2013 - 2017',
        poste: 'Responsable grands comptes',
        organisation: 'Metalis • Aix-en-Provence (13)',
        description:
          'Négociation des contrats-cadres avec les donneurs Naval et Aéronautique de la région.',
      },
    ],
  },
  {
    id: '8',
    nom: 'Yasmina Bensaid',
    intitule: 'Développeuse front-end React/UI',
    ville: 'Toulouse (31)',
    modalite: 'Télétravail',
    experience: "3 ans d'expérience",
    competences: ['React', 'TypeScript', 'Tailwind CSS', 'WCAG'],
    dureeVideo: '1:05',
    certifie: true,
    miniature: yasminaBensaid,
    disponibilite: 'Disponible immédiatement',
    contrat: 'CDI / Temps plein',
    bio: "Développeuse front-end venue du design, je travaille surtout sur des interfaces publiques soumises au RGAA. L'accessibilité n'est pas une passe de correction en fin de projet : je la traite au moment où le composant s'écrit.",
    experiences: [
      {
        periode: '2023 - Pr.',
        poste: 'Développeuse front-end',
        organisation: 'Onepoint • Toulouse (31)',
        description:
          "Refonte du portail usagers d'un département : design system React, audit RGAA et remise à niveau de 60 composants.",
      },
      {
        periode: '2022 - 2023',
        poste: 'Intégratrice web',
        organisation: 'Studio Katan • Toulouse (31)',
        description:
          'Intégration de sites vitrines et mise en place des tests de non-régression visuelle.',
      },
    ],
  },
  {
    id: '9',
    nom: 'Olivier Giraud',
    intitule: 'Comptable public adjoint',
    ville: 'Orléans (45)',
    modalite: 'Présentiel',
    experience: "7 ans d'expérience",
    competences: ['Comptabilité publique', 'M57', 'Excel expert'],
    dureeVideo: '1:20',
    certifie: true,
    miniature: olivierGiraud,
    disponibilite: 'Disponible sous 1 mois',
    contrat: 'Titulaire / Mutation',
    bio: "Comptable public en collectivité territoriale, j'ai piloté deux passages à la nomenclature M57. Je fais le lien entre les services opérationnels et la trésorerie, en traduisant les contraintes réglementaires en gestes de gestion simples.",
    experiences: [
      {
        periode: '2020 - Pr.',
        poste: 'Comptable public adjoint',
        organisation: "Communauté d'agglomération Orléans Métropole • Orléans (45)",
        description:
          "Exécution d'un budget de 180 M€, encadrement de quatre agents et conduite du passage à la M57.",
      },
      {
        periode: '2018 - 2020',
        poste: 'Gestionnaire comptable',
        organisation: 'Centre hospitalier • Blois (41)',
        description: 'Mandatement, suivi des marchés publics et clôture des exercices.',
      },
    ],
  },
  {
    id: '10',
    nom: 'Aurélie Masson',
    intitule: 'Ergothérapeute conseil',
    ville: 'Montpellier (34)',
    modalite: 'Cabinet',
    experience: "5 ans d'expérience",
    competences: ['Ergonomie', 'Adaptation habitat', 'Pédagogie'],
    dureeVideo: '1:30',
    certifie: true,
    miniature: aurelieMasson,
    disponibilite: 'Disponible sous 1 mois',
    contrat: 'Temps partiel',
    bio: "Ergothérapeute en libéral, j'interviens à domicile pour l'adaptation du logement des personnes âgées et en situation de handicap. Je forme aussi les aidants, parce qu'un aménagement n'est utile que s'il est compris par ceux qui vivent avec.",
    experiences: [
      {
        periode: '2021 - Pr.',
        poste: 'Ergothérapeute conseil',
        organisation: 'Cabinet libéral • Montpellier (34)',
        description:
          "Environ 120 visites d'évaluation par an, préconisations d'aménagement et montage des dossiers de financement.",
      },
      {
        periode: '2019 - 2021',
        poste: 'Ergothérapeute',
        organisation: 'SSIAD Hérault • Béziers (34)',
        description: "Accompagnement à domicile et formation des équipes d'aide-soignants.",
      },
    ],
  },
  /*
   * The mockup's sheet (Figma DetailBody). Kept last so the catalogue's first
   * page stays the six it already showed, and given id 1 because the candidate
   * sidebar already links there.
   */
  {
    id: '1',
    nom: 'Mathilde Rousseau',
    intitule: 'Responsable RSE & Transition Écologique',
    ville: 'Nantes (44)',
    modalite: 'Hybride',
    experience: "5 ans d'expérience",
    competences: [
      'RSE (ISO 26000)',
      'Bilan Carbone ADEME',
      "Management d'impact",
      "Animation d'ateliers fresque",
    ],
    dureeVideo: '1:30',
    certifie: true,
    /* No portrait shot for her in assets/, so an unused one stands in. */
    miniature: amelieDubois,
    disponibilite: 'Disponible sous 1 mois',
    contrat: 'CDI / Temps plein',
    bio: "Passionnée par le développement durable et diplômée en Sciences de l'Environnement, j'accompagne depuis 5 ans les entreprises de la région nantaise dans la mise en œuvre de démarches ISO 26000 et de Bilans Carbone. Mon approche repose sur la co-construction d'indicateurs d'impact pragmatiques et porteurs de sens pour les équipes.",
    experiences: [
      {
        periode: '2022 - Pr.',
        poste: 'Responsable Transition Écologique',
        organisation: 'Ecoterra Consultant • Nantes (44)',
        description:
          'Pilotage des démarches RSE pour 15 entreprises régionales du secteur industriel. Réduction moyenne de 18% des émissions de CO2.',
      },
      {
        periode: '2020 - 2022',
        poste: "Chargée d'études Environnement",
        organisation: 'Agence GreenOasis • Angers (49)',
        description:
          "Réalisation de diagnostics environnementaux réglementaires et d'audits d'impact biodiversité.",
      },
    ],
  },
];

export function ficheProfil(profil: Profil): RouteLocationNamedRaw {
  return { name: 'candidate-profile', params: { id: profil.id } };
}

export function trouverProfil(id: string): Profil | undefined {
  return PROFILS.find((profil) => profil.id === id);
}
