import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import CertificationService from '@/services/CertificationService'
import type { Questionnaire, QuestionnaireQuestion, ScoreResult } from '@/shared/types/api'

type Answers = Record<string, string[]>

/** Clé localStorage : permet de reprendre une tentative après un rechargement. */
const CLE_TENTATIVE = 'certification.attemptId'

function messageErreur(erreur: unknown, defaut: string): string {
  return erreur instanceof Error && erreur.message ? erreur.message : defaut
}

/** `answers` sort d'une colonne JSON : on la ramène à `Record<string, string[]>`. */
function normaliser(brut: Record<string, unknown> | null | undefined): Answers {
  const sortie: Answers = {}
  for (const [id, valeur] of Object.entries(brut ?? {})) {
    if (Array.isArray(valeur)) sortie[id] = valeur.filter((v): v is string => typeof v === 'string')
    else if (typeof valeur === 'string') sortie[id] = [valeur]
  }
  return sortie
}

function lireTentativeEnAttente(): string | null {
  try {
    return localStorage.getItem(CLE_TENTATIVE)
  } catch {
    return null
  }
}

function memoriserTentative(id: string | null): void {
  try {
    if (id) localStorage.setItem(CLE_TENTATIVE, id)
    else localStorage.removeItem(CLE_TENTATIVE)
  } catch {
    /* mode privé / stockage indisponible : la reprise ne sera pas persistée */
  }
}

export const useCertificationStore = defineStore('certification', () => {
  const questionnaire = ref<Questionnaire | null>(null)
  const attemptId = ref<string | null>(null)
  const answers = ref<Answers>({})
  const currentIndex = ref(0)
  const result = ref<ScoreResult | null>(null)

  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const questions = computed<QuestionnaireQuestion[]>(
    () => questionnaire.value?.content.questions ?? [],
  )
  const total = computed(() => questions.value.length)
  const currentQuestion = computed<QuestionnaireQuestion | null>(
    () => questions.value[currentIndex.value] ?? null,
  )
  const answeredCount = computed(
    () => questions.value.filter((q) => (answers.value[q.id]?.length ?? 0) > 0).length,
  )
  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value >= total.value - 1)
  const started = computed(() => attemptId.value !== null && result.value === null)
  const finished = computed(() => result.value !== null)

  async function loadQuestionnaire(): Promise<void> {
    if (questionnaire.value) return
    loading.value = true
    error.value = null
    try {
      questionnaire.value = await CertificationService.getPublished()
    } catch (e) {
      error.value = messageErreur(e, 'Aucune certification publiée pour le moment')
    } finally {
      loading.value = false
    }
  }

  async function start(): Promise<void> {
    await loadQuestionnaire()
    if (!questionnaire.value) return
    loading.value = true
    error.value = null
    try {
      const attempt = await CertificationService.createAttempt(questionnaire.value.id, {})
      attemptId.value = attempt.id
      answers.value = normaliser(attempt.answers)
      currentIndex.value = 0
      result.value = null
      memoriserTentative(attempt.id)
    } catch (e) {
      error.value = messageErreur(e, 'Impossible de démarrer le test')
    } finally {
      loading.value = false
    }
  }

  /** Recharge une tentative existante (reprise ou consultation d'un résultat). */
  async function resume(id: string): Promise<void> {
    await loadQuestionnaire()
    loading.value = true
    error.value = null
    try {
      const attempt = await CertificationService.getAttempt(id)
      attemptId.value = attempt.id
      answers.value = normaliser(attempt.answers)
      currentIndex.value = 0
      if (attempt.status === 'submitted') memoriserTentative(null)
    } catch (e) {
      error.value = messageErreur(e, 'Tentative introuvable')
      memoriserTentative(null)
    } finally {
      loading.value = false
    }
  }

  let minuteurSauvegarde: ReturnType<typeof setTimeout> | null = null

  function planifierSauvegarde(): void {
    if (!attemptId.value) return
    if (minuteurSauvegarde) clearTimeout(minuteurSauvegarde)
    minuteurSauvegarde = setTimeout(() => void sauvegarder(), 600)
  }

  async function sauvegarder(): Promise<void> {
    if (!attemptId.value) return
    saving.value = true
    try {
      await CertificationService.updateAttempt(attemptId.value, answers.value)
    } catch (e) {
      error.value = messageErreur(e, 'Sauvegarde impossible')
    } finally {
      saving.value = false
    }
  }

  function setAnswer(questionId: string, optionIds: string[]): void {
    answers.value = { ...answers.value, [questionId]: optionIds }
    planifierSauvegarde()
  }

  function next(): void {
    if (!isLast.value) currentIndex.value += 1
  }
  function prev(): void {
    if (!isFirst.value) currentIndex.value -= 1
  }
  function goTo(index: number): void {
    if (index >= 0 && index < total.value) currentIndex.value = index
  }

  /** Dépose la tentative. Renvoie son id (pour naviguer vers le résultat) ou null. */
  async function submit(): Promise<string | null> {
    if (!attemptId.value) return null
    if (minuteurSauvegarde) {
      clearTimeout(minuteurSauvegarde)
      minuteurSauvegarde = null
    }
    loading.value = true
    error.value = null
    try {
      const res = await CertificationService.updateAttempt(attemptId.value, answers.value, 'submitted')
      result.value = res.result ?? null
      memoriserTentative(null)
      return attemptId.value
    } catch (e) {
      error.value = messageErreur(e, 'Impossible de soumettre le test')
      return null
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    questionnaire.value = null
    attemptId.value = null
    answers.value = {}
    currentIndex.value = 0
    result.value = null
    error.value = null
    memoriserTentative(null)
  }

  return {
    questionnaire,
    attemptId,
    answers,
    currentIndex,
    result,
    loading,
    saving,
    error,
    questions,
    total,
    currentQuestion,
    answeredCount,
    isFirst,
    isLast,
    started,
    finished,
    pendingAttemptId: lireTentativeEnAttente,
    loadQuestionnaire,
    start,
    resume,
    setAnswer,
    next,
    prev,
    goTo,
    submit,
    reset,
  }
})
