
export type QuestionType = 'single' | 'multiple'

/*
 * 'exact' : une seule combinaison vaut le point (question de connaissance).
 * 'graded' : chaque option rapporte ses points, le ratio est proportionnel —
 * indispensable pour une échelle de 1 à 10, où répondre 7 ne vaut ni 0 ni tout.
 */
export type QuestionScoring = 'exact' | 'graded'

export interface Option {
  id: string
  label: string
  points: number
}

export interface Question {
  id: string
  category: string
  weight: number
  type: QuestionType
  scoring: QuestionScoring
  prompt: string
  options: Option[]
}

export interface Category {
  code: string
  label: string
  weight: number
}

export interface BadgeBand {
  min: number
  level: string
}

export interface Config {
  passThreshold: number
  minCategoryScore: number
  retakeDelayDays: number
  badgeBands: BadgeBand[]
}

export interface Questionnaire {
  config: Config
  categories: Category[]
  questions: Question[]
}

export class QuestionnaireInvalide extends Error {
  constructor(
    message: string,
    readonly raison: string,
  ) {
    super(message)
    this.name = 'QuestionnaireInvalide'
  }
}

const DEFAULT_CONFIG: Config = {
  passThreshold: 70,
  minCategoryScore: 0,
  retakeDelayDays: 0,
  badgeBands: [],
}

function invalide(message: string, raison: string): never {
  throw new QuestionnaireInvalide(message, raison)
}

function objet(valeur: unknown, chemin: string): Record<string, unknown> {
  if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
    invalide(`${chemin} doit être un objet`, 'FORME_INVALIDE')
  }
  return valeur as Record<string, unknown>
}

function tableau(valeur: unknown, chemin: string): unknown[] {
  if (!Array.isArray(valeur)) invalide(`${chemin} doit être un tableau`, 'FORME_INVALIDE')
  return valeur
}

function texte(valeur: unknown, chemin: string): string {
  if (typeof valeur !== 'string' || valeur.trim() === '') {
    invalide(`${chemin} doit être une chaîne non vide`, 'FORME_INVALIDE')
  }
  return valeur
}

function nombre(valeur: unknown, chemin: string): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) {
    invalide(`${chemin} doit être un nombre`, 'FORME_INVALIDE')
  }
  return valeur
}

function borne(valeur: number, min: number, max: number, chemin: string): number {
  if (valeur < min || valeur > max) {
    invalide(`${chemin} doit être compris entre ${min} et ${max}`, 'HORS_BORNES')
  }
  return valeur
}

function parseConfig(brut: unknown): Config {
  if (brut === undefined || brut === null) return { ...DEFAULT_CONFIG }
  const source = objet(brut, 'config')

  const passThreshold =
    source.passThreshold === undefined
      ? DEFAULT_CONFIG.passThreshold
      : borne(nombre(source.passThreshold, 'config.passThreshold'), 0, 100, 'config.passThreshold')

  const minCategoryScore =
    source.minCategoryScore === undefined
      ? DEFAULT_CONFIG.minCategoryScore
      : borne(
          nombre(source.minCategoryScore, 'config.minCategoryScore'),
          0,
          100,
          'config.minCategoryScore',
        )

  const retakeDelayDays =
    source.retakeDelayDays === undefined
      ? DEFAULT_CONFIG.retakeDelayDays
      : Math.max(0, Math.trunc(nombre(source.retakeDelayDays, 'config.retakeDelayDays')))

  const badgeBands = (source.badgeBands === undefined ? [] : tableau(source.badgeBands, 'config.badgeBands'))
    .map((bande, i) => {
      const b = objet(bande, `config.badgeBands[${i}]`)
      return {
        min: borne(nombre(b.min, `config.badgeBands[${i}].min`), 0, 100, `config.badgeBands[${i}].min`),
        level: texte(b.level, `config.badgeBands[${i}].level`),
      }
    })
    .sort((a, b) => b.min - a.min)

  return { passThreshold, minCategoryScore, retakeDelayDays, badgeBands }
}

function parseCategories(brut: unknown): Category[] {
  const liste = tableau(brut, 'categories')
  if (liste.length === 0) invalide('Au moins une catégorie est requise', 'CATEGORIES_VIDES')

  const vues = new Set<string>()
  return liste.map((entree, i) => {
    const source = objet(entree, `categories[${i}]`)
    const code = texte(source.code, `categories[${i}].code`)
    if (vues.has(code)) invalide(`Catégorie en double : ${code}`, 'CATEGORIE_DUPLIQUEE')
    vues.add(code)

    const weight = nombre(source.weight, `categories[${i}].weight`)
    if (weight <= 0) invalide(`categories[${i}].weight doit être > 0`, 'POIDS_INVALIDE')

    return { code, label: texte(source.label, `categories[${i}].label`), weight }
  })
}

function parseQuestions(brut: unknown, codesCategories: Set<string>): Question[] {
  const liste = tableau(brut, 'questions')
  if (liste.length === 0) invalide('Au moins une question est requise', 'QUESTIONS_VIDES')

  const vues = new Set<string>()
  return liste.map((entree, i) => {
    const source = objet(entree, `questions[${i}]`)
    const id = texte(source.id, `questions[${i}].id`)
    if (vues.has(id)) invalide(`Question en double : ${id}`, 'QUESTION_DUPLIQUEE')
    vues.add(id)

    const category = texte(source.category, `questions[${i}].category`)
    if (!codesCategories.has(category)) {
      invalide(`questions[${i}].category inconnue : ${category}`, 'CATEGORIE_INCONNUE')
    }

    if (source.type !== 'single' && source.type !== 'multiple') {
      invalide(`questions[${i}].type doit être 'single' ou 'multiple'`, 'TYPE_INVALIDE')
    }
    const type = source.type as QuestionType

    if (source.scoring !== undefined && source.scoring !== 'exact' && source.scoring !== 'graded') {
      invalide(`questions[${i}].scoring doit être 'exact' ou 'graded'`, 'SCORING_INVALIDE')
    }
    /* Absent = 'exact' : les questionnaires écrits avant ce mode gardent leur notation. */
    const scoring = (source.scoring ?? 'exact') as QuestionScoring

    const weight = source.weight === undefined ? 1 : nombre(source.weight, `questions[${i}].weight`)
    if (weight <= 0) invalide(`questions[${i}].weight doit être > 0`, 'POIDS_INVALIDE')

    const options = parseOptions(source.options, `questions[${i}]`)
    const bonnes = options.filter((o) => o.points > 0)
    if (bonnes.length === 0) {
      invalide(`questions[${i}] n'a aucune option qui rapporte des points`, 'AUCUNE_BONNE_REPONSE')
    }
    /* En 'graded', plusieurs options positives sont la norme (une échelle en a dix). */
    if (scoring === 'exact' && type === 'single' && bonnes.length > 1) {
      invalide(`questions[${i}] est 'single' mais a ${bonnes.length} bonnes réponses`, 'SINGLE_MULTI_BONNES')
    }

    return {
      id,
      category,
      weight,
      type,
      scoring,
      prompt: texte(source.prompt, `questions[${i}].prompt`),
      options,
    }
  })
}

function parseOptions(brut: unknown, chemin: string): Option[] {
  const liste = tableau(brut, `${chemin}.options`)
  if (liste.length < 2) invalide(`${chemin}.options doit contenir au moins 2 entrées`, 'OPTIONS_INSUFFISANTES')

  const vues = new Set<string>()
  return liste.map((entree, i) => {
    const source = objet(entree, `${chemin}.options[${i}]`)
    const id = texte(source.id, `${chemin}.options[${i}].id`)
    if (vues.has(id)) invalide(`${chemin}.options[${i}].id en double : ${id}`, 'OPTION_DUPLIQUEE')
    vues.add(id)

    const points = nombre(source.points, `${chemin}.options[${i}].points`)
    if (points < 0) invalide(`${chemin}.options[${i}].points ne peut pas être négatif`, 'POINTS_NEGATIFS')

    return { id, label: texte(source.label, `${chemin}.options[${i}].label`), points }
  })
}

export function parseQuestionnaire(content: unknown): Questionnaire {
  const source = objet(content, 'content')
  const categories = parseCategories(source.categories)
  const codes = new Set(categories.map((c) => c.code))
  const questions = parseQuestions(source.questions, codes)
  return { config: parseConfig(source.config), categories, questions }
}
