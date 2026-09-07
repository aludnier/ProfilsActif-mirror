import { describe, expect, it } from 'vitest'

import { parseQuestionnaire, QuestionnaireInvalide } from './Questionnaire.js'
import { computeScore, normalizeAnswers } from './Score.js'

function contenuValide() {
  return {
    config: {
      passThreshold: 70,
      minCategoryScore: 50,
      badgeBands: [
        { min: 90, level: 'or' },
        { min: 80, level: 'argent' },
        { min: 70, level: 'bronze' },
      ],
    },
    categories: [
      { code: 'COMM', label: 'Communication', weight: 50 },
      { code: 'NUM', label: 'Numérique', weight: 50 },
    ],
    questions: [
      {
        id: 'COMM-1',
        category: 'COMM',
        type: 'single',
        prompt: 'Q1',
        options: [
          { id: 'a', label: 'Faux', points: 0 },
          { id: 'b', label: 'Vrai', points: 1 },
        ],
      },
      {
        id: 'COMM-2',
        category: 'COMM',
        type: 'single',
        prompt: 'Q2',
        options: [
          { id: 'a', label: 'Vrai', points: 1 },
          { id: 'b', label: 'Faux', points: 0 },
        ],
      },
      {
        id: 'NUM-1',
        category: 'NUM',
        type: 'multiple',
        prompt: 'Q3',
        options: [
          { id: 'a', label: 'Bon', points: 1 },
          { id: 'b', label: 'Bon', points: 1 },
          { id: 'c', label: 'Mauvais', points: 0 },
          { id: 'd', label: 'Mauvais', points: 0 },
        ],
      },
    ],
  }
}

function raisonDe(fn: () => unknown): string {
  try {
    fn()
  } catch (error) {
    if (error instanceof QuestionnaireInvalide) return error.raison
    throw error
  }
  throw new Error('attendu : QuestionnaireInvalide, mais rien n’a été levé')
}

describe('parseQuestionnaire', () => {
  it('normalise un contenu valide (poids question par défaut à 1, bandes triées)', () => {
    const q = parseQuestionnaire(contenuValide())
    expect(q.questions.every((question) => question.weight === 1)).toBe(true)
    expect(q.config.badgeBands.map((b) => b.min)).toEqual([90, 80, 70])
    expect(q.config.retakeDelayDays).toBe(0)
  })

  it('refuse un contenu sans catégorie', () => {
    expect(raisonDe(() => parseQuestionnaire({ categories: [], questions: [] }))).toBe(
      'CATEGORIES_VIDES',
    )
  })

  it('refuse une question qui pointe vers une catégorie inconnue', () => {
    const contenu = contenuValide()
    contenu.questions[0].category = 'INCONNUE'
    expect(raisonDe(() => parseQuestionnaire(contenu))).toBe('CATEGORIE_INCONNUE')
  })

  it('refuse une question sans aucune bonne réponse', () => {
    const contenu = contenuValide()
    contenu.questions[0].options = [
      { id: 'a', label: 'x', points: 0 },
      { id: 'b', label: 'y', points: 0 },
    ]
    expect(raisonDe(() => parseQuestionnaire(contenu))).toBe('AUCUNE_BONNE_REPONSE')
  })

  it("refuse une question 'single' avec deux bonnes réponses", () => {
    const contenu = contenuValide()
    contenu.questions[0].options = [
      { id: 'a', label: 'x', points: 1 },
      { id: 'b', label: 'y', points: 1 },
    ]
    expect(raisonDe(() => parseQuestionnaire(contenu))).toBe('SINGLE_MULTI_BONNES')
  })

  it('refuse un poids de catégorie <= 0', () => {
    const contenu = contenuValide()
    contenu.categories[0].weight = 0
    expect(raisonDe(() => parseQuestionnaire(contenu))).toBe('POIDS_INVALIDE')
  })

  it('refuse des points négatifs', () => {
    const contenu = contenuValide()
    contenu.questions[0].options[0].points = -1
    expect(raisonDe(() => parseQuestionnaire(contenu))).toBe('POINTS_NEGATIFS')
  })

  it('refuse deux questions avec le même id', () => {
    const contenu = contenuValide()
    contenu.questions[1].id = 'COMM-1'
    expect(raisonDe(() => parseQuestionnaire(contenu))).toBe('QUESTION_DUPLIQUEE')
  })
})

describe('computeScore', () => {
  const questionnaire = parseQuestionnaire(contenuValide())

  it('toutes bonnes -> 100, réussi, badge or', () => {
    const r = computeScore(questionnaire, {
      'COMM-1': ['b'],
      'COMM-2': ['a'],
      'NUM-1': ['a', 'b'],
    })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.badgeLevel).toBe('or')
    expect(r.categories.find((c) => c.code === 'COMM')?.score).toBe(100)
  })

  it('toutes fausses -> 0, échec, pas de badge', () => {
    const r = computeScore(questionnaire, { 'COMM-1': ['a'], 'COMM-2': ['b'], 'NUM-1': ['c', 'd'] })
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
    expect(r.badgeLevel).toBeNull()
  })

  it('une réponse manquante compte comme fausse', () => {
    const r = computeScore(questionnaire, { 'COMM-1': ['b'], 'COMM-2': ['a'] })
    expect(r.score).toBe(50)
    expect(r.categories.find((c) => c.code === 'NUM')?.score).toBe(0)
  })

  it("'multiple' : une bonne + une mauvaise -> ratio pénalisé", () => {
    const r = computeScore(questionnaire, {
      'COMM-1': ['b'],
      'COMM-2': ['a'],
      'NUM-1': ['a', 'c'],
    })
    expect(r.categories.find((c) => c.code === 'NUM')?.score).toBe(0)
    expect(r.score).toBe(50)
  })

  it("'multiple' : les deux bonnes sans erreur -> 100 sur la catégorie", () => {
    const r = computeScore(questionnaire, { 'NUM-1': ['a', 'b'] })
    expect(r.categories.find((c) => c.code === 'NUM')?.score).toBe(100)
  })

  it('ignore une réponse à une question inconnue', () => {
    const r = computeScore(questionnaire, {
      'COMM-1': ['b'],
      'COMM-2': ['a'],
      'NUM-1': ['a', 'b'],
      FANTOME: ['x'],
    })
    expect(r.score).toBe(100)
  })

  it('plancher par catégorie : global au-dessus du seuil mais une catégorie trop basse -> échec', () => {
    const contenu = contenuValide()
    contenu.categories[0].weight = 90 
    contenu.categories[1].weight = 10 
    const q = parseQuestionnaire(contenu)
    const r = computeScore(q, { 'COMM-1': ['b'], 'COMM-2': ['a'], 'NUM-1': ['c', 'd'] })
    expect(r.score).toBeGreaterThanOrEqual(70)
    expect(r.categories.find((c) => c.code === 'NUM')?.score).toBe(0)
    expect(r.passed).toBe(false)
  })

  it('réussite sans atteindre la plus haute bande -> badge bronze', () => {
    const contenu = contenuValide()
    contenu.config.minCategoryScore = 0
    const q = parseQuestionnaire(contenu)
    const r = computeScore(q, { 'COMM-1': ['b'], 'COMM-2': ['a'], 'NUM-1': ['a'] })
    expect(r.score).toBe(75)
    expect(r.passed).toBe(true)
    expect(r.badgeLevel).toBe('bronze')
  })
})

describe('normalizeAnswers', () => {
  it('accepte une string simple ou un tableau, ignore le reste', () => {
    expect(normalizeAnswers({ a: 'x', b: ['y', 'z'], c: 3, d: null })).toEqual({
      a: ['x'],
      b: ['y', 'z'],
    })
  })

  it('renvoie {} pour une valeur non-objet', () => {
    expect(normalizeAnswers(null)).toEqual({})
    expect(normalizeAnswers('bonjour')).toEqual({})
    expect(normalizeAnswers([1, 2])).toEqual({})
  })
})
