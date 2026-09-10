
import type { Question, Questionnaire } from './Questionnaire.js'

export type Answers = Record<string, string[]>

export interface CategoryScore {
  code: string
  label: string
  weight: number
  score: number
  questionCount: number
}

export interface ScoreResult {

  score: number
  passed: boolean
  badgeLevel: string | null
  categories: CategoryScore[]
}

export function normalizeAnswers(raw: unknown): Answers {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}

  const sortie: Answers = {}
  for (const [questionId, valeur] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(valeur)) {
      sortie[questionId] = valeur.filter((v): v is string => typeof v === 'string')
    } else if (typeof valeur === 'string') {
      sortie[questionId] = [valeur]
    }
  }
  return sortie
}

/*
 * Notation proportionnelle : le ratio est « points obtenus / points maximum ».
 * Sur une question 'single' on retient le meilleur choix plutôt que la somme,
 * sinon tout cocher sur une échelle donnerait le maximum.
 */
function ratioGradue(question: Question, chosen: Set<string>): number {
  const retenues = question.options.filter((o) => chosen.has(o.id))

  const maximum =
    question.type === 'single'
      ? Math.max(...question.options.map((o) => o.points))
      : question.options.reduce((somme, o) => somme + o.points, 0)
  if (maximum <= 0) return 0

  const obtenus =
    question.type === 'single'
      ? retenues.reduce((meilleur, o) => Math.max(meilleur, o.points), 0)
      : retenues.reduce((somme, o) => somme + o.points, 0)

  return Math.min(1, Math.max(0, obtenus / maximum))
}

function questionRatio(question: Question, selected: string[]): number {
  const chosen = new Set(selected)

  if (question.scoring === 'graded') return ratioGradue(question, chosen)

  const correct = question.options.filter((o) => o.points > 0).map((o) => o.id)
  const wrong = question.options.filter((o) => o.points <= 0).map((o) => o.id)

  if (question.type === 'single') {
    return chosen.size === 1 && chosen.has(correct[0]) ? 1 : 0
  }

  if (correct.length === 0) return 0
  const good = correct.filter((id) => chosen.has(id)).length
  const bad = wrong.filter((id) => chosen.has(id)).length
  const ratio = good / correct.length - (wrong.length > 0 ? bad / wrong.length : 0)
  return Math.min(1, Math.max(0, ratio))
}

function badgeFor(bands: Questionnaire['config']['badgeBands'], score: number): string | null {
  for (const bande of bands) {
    if (score >= bande.min) return bande.level
  }
  return null
}

export function computeScore(questionnaire: Questionnaire, answers: unknown): ScoreResult {
  const reponses = normalizeAnswers(answers)
  const { config, categories, questions } = questionnaire

  let sommeGlobalePonderee = 0
  let poidsGlobalTotal = 0

  const parCategorie: CategoryScore[] = categories.map((categorie) => {
    const questionsCat = questions.filter((q) => q.category === categorie.code)

    if (questionsCat.length === 0) {
      return { code: categorie.code, label: categorie.label, weight: categorie.weight, score: 0, questionCount: 0 }
    }

    let sommePonderee = 0
    let poidsTotal = 0
    for (const question of questionsCat) {
      const ratio = questionRatio(question, reponses[question.id] ?? [])
      sommePonderee += ratio * question.weight
      poidsTotal += question.weight
    }

    const ratioCategorie = poidsTotal > 0 ? sommePonderee / poidsTotal : 0
    sommeGlobalePonderee += ratioCategorie * categorie.weight
    poidsGlobalTotal += categorie.weight

    return {
      code: categorie.code,
      label: categorie.label,
      weight: categorie.weight,
      score: Math.round(ratioCategorie * 100),
      questionCount: questionsCat.length,
    }
  })

  const ratioGlobal = poidsGlobalTotal > 0 ? sommeGlobalePonderee / poidsGlobalTotal : 0
  const score = Math.round(ratioGlobal * 100)

  const notees = parCategorie.filter((c) => c.questionCount > 0)
  const passed =
    score >= config.passThreshold && notees.every((c) => c.score >= config.minCategoryScore)

  return {
    score,
    passed,
    badgeLevel: passed ? badgeFor(config.badgeBands, score) : null,
    categories: parCategorie,
  }
}
