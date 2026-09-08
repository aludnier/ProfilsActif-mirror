<template>
  <div class="frame">
  <div class="question-form">
    <label for="code">Code du questionnaire</label>
    <input id="code" v-model="questionnaireCode"><br>

    <label for="title">Titre du questionnaire</label>
    <input id="title" v-model="questionnaireTitle"><br>

    <label for="categorie">Catégorie de la question</label>
    <select id="categorie" v-model="tempCategory">
      <option v-for="categorie in categories" :key="categorie.code" :value="categorie.code">
        {{ categorie.label }}
      </option>
    </select><br>

    <label for="Questiontype">Type de question</label>
    <select id="Questiontype" v-model="questionType">
        <option value="personalized">Personnalisée</option>
        <option value="YesNo">Oui ou Non</option>
        <option value="Scale">Echelle de 1 à 10</option>
    </select><br>

    <div class="double-input">
      <span class=" mx-8 w-3/4">
        <label for="question">Question</label>
        <input id="question" v-model="tempQuestion">
      </span>
    
      <span class="w-1/5">
        <label for="weight">Poids</label>
        <input v-model="tempWeight" type="number" min="1">
      </span>
    </div>

    <div v-if="questionType === 'personalized'">
      <div class="double-input">
        <span class="w-3/4">
          <label for="Answer">Réponses (Entrée pour ajouter)</label>
          <input id="Answer" v-model="tempResponse" @keyup.enter="addanswer"/>
        </span>
        <span class="w-1/5">
          <label for="points">Points (0 à 10)</label>
          <input id="points" v-model.number="tempAnswerPoints" type="number" min="0" max="10"/>
        </span>
      </div>

      <!-- Le type ne se déduit pas des points : sans cette case, un QCM nuancé
           serait pris pour une question à réponses multiples. -->
      <label class="inline-choice">
        <input v-model="multipleChoice" type="checkbox"/>
        Plusieurs réponses possibles
      </label>

      <p>{{ tempQuestion }}</p>
      <div class="Answer-list">
        <span v-for="(response, index) in responses" :key="index" class="Answer-tag">
          {{ response.label }}
           <input v-model.number="response.points" type="number" class="points-edit" min="0"/>
          <button type="button" class="answer-remove" @click="removeAnswer(index)">✕</button>
        </span>
      </div>
    </div>

    <button @click="addQuestion">Ajouter la question</button>
    </div>
    <div class="Questionnary-block">
      <h2> {{ questionnaireTitle ? questionnaireTitle : 'Questionnaire-' + questionnaireCode }} </h2>
      <div class="questionnaryButtons">
        <button class="m-1" @click="publishQuestionnaire">Publier le questionnaire</button>
        <button class="m-1" @click="saveQuestionnaire">Sauver le brouillon</button>
      </div>

      <div class="import-block">
        <button type="button" @click="chargerDefaut">Charger le questionnaire par défaut</button>
        <button type="button" @click="toutEffacer">Tout effacer</button>
        <p v-if="message" class="import-message">{{ message }}</p>
        <p class="import-hint">
          Réussite à partir de {{ config.passThreshold }} % ·
          {{ createdQuestions.length }} question(s) en préparation
        </p>
      </div>

      <div v-for="(question, index) in createdQuestions" :key="question.id ?? index" class="question-block">
        <button type="button" class="question-remove" @click="removeQuestion(index)">✕</button>
          <p class="question-title">
            {{ index + 1 }}. {{ question.prompt }}
          </p>
          <p class="question-meta">
            {{ libelleCategorie(question.category) }} ·
            {{ question.type === 'multiple' ? 'plusieurs réponses' : 'une seule réponse' }} ·
            poids {{ question.weight ?? 1 }}
          </p>
          <div class="Answer-list">
            <span
              v-for="(response, indexReponse) in question.options"
              :key="indexReponse"
              class="Answer-tag"
            >
              {{ response.label }}
              <input v-model.number="response.points" type="number" class="points-edit" min="0"/>
            </span>
          </div>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import CertificationService from '@/services/CertificationService'
import questionnaireDefaut from '@data/questionnaire-aptitudes.json'
import type {
  QuestionnaireCategory,
  QuestionnaireContent,
  QuestionnaireQuestion,
} from '@/shared/types/api'
import { computed, onMounted, ref } from 'vue'

/* Les points vont de 0 à 10 partout : les questions restent comparables entre elles. */
const POINTS_MAX = 10
const questionTemplateScale = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

type Config = NonNullable<QuestionnaireContent['config']>

const CATEGORIE_LIBRE: QuestionnaireCategory = { code: 'general', label: 'Général', weight: 1 }

/* Même règle que le questionnaire livré : réussite à 50, pas de plancher par catégorie. */
const CONFIG_DEFAUT: Config = {
  passThreshold: 50,
  minCategoryScore: 0,
  retakeDelayDays: 0,
}

const tempQuestion = ref("")
const tempResponse = ref("")
const tempWeight = ref<number>(1)
const tempAnswerPoints = ref<number>(POINTS_MAX)
const tempCategory = ref(CATEGORIE_LIBRE.code)
const responses = ref<{ label: string; points: number }[]>([])
const questionType = ref<'personalized' | 'YesNo' | 'Scale'>("personalized")
const multipleChoice = ref<boolean>(false)

const createdQuestions = ref<QuestionnaireQuestion[]>([])
const categories = ref<QuestionnaireCategory[]>([{ ...CATEGORIE_LIBRE }])
const config = ref<Config>({ ...CONFIG_DEFAUT })

const questionnaireCode = ref("")
const questionnaireTitle = ref("")
const message = ref<string | null>(null)

const libelleCategorie = computed(() => {
  const table = new Map(categories.value.map((c) => [c.code, c.label]))
  return (code: string) => table.get(code) ?? code
})

onMounted(() => {
  checkDraft()
})

/*
 * Reprend le fichier `shared/data/questionnaire-aptitudes.json`. Éditer ce fichier
 * puis recharger la page suffit à faire évoluer le questionnaire de référence :
 * rien n'est publié tant que l'admin ne clique pas sur Publier.
 */
function chargerDefaut() {
  const contenu = questionnaireDefaut.content as unknown as QuestionnaireContent
  questionnaireCode.value = questionnaireDefaut.code
  questionnaireTitle.value = questionnaireDefaut.title
  categories.value = (contenu.categories ?? []).map((c) => ({ ...c }))
  config.value = { ...CONFIG_DEFAUT, ...(contenu.config ?? {}) }
  createdQuestions.value = (contenu.questions ?? []).map((q) => ({
    ...q,
    options: q.options.map((o) => ({ ...o })),
  }))
  tempCategory.value = categories.value[0]?.code ?? CATEGORIE_LIBRE.code
  message.value = `${createdQuestions.value.length} questions chargées.`
}

function toutEffacer() {
  createdQuestions.value = []
  categories.value = [{ ...CATEGORIE_LIBRE }]
  config.value = { ...CONFIG_DEFAUT }
  tempCategory.value = CATEGORIE_LIBRE.code
  questionnaireCode.value = ""
  questionnaireTitle.value = ""
  message.value = null
  resetQuestion()
}

async function checkDraft() {
  try {
    const draft = await CertificationService.getDraft()
    if (!draft) return

    createdQuestions.value = draft.content.questions ?? []
    /* Un brouillon transporte ses propres catégories : sans elles, les questions
       reprises pointeraient vers une catégorie inconnue et la publication échouerait. */
    categories.value = draft.content.categories?.length
      ? draft.content.categories.map((c) => ({ ...c }))
      : [{ ...CATEGORIE_LIBRE }]
    config.value = { ...CONFIG_DEFAUT, ...(draft.content.config ?? {}) }
    tempCategory.value = categories.value[0]?.code ?? CATEGORIE_LIBRE.code
    questionnaireCode.value = draft.code
    questionnaireTitle.value = draft.title
  } catch (err) {
    /* Au chargement de la page : sans message, l'admin croirait à un brouillon vide. */
    message.value = "Impossible de charger le brouillon."
    console.error('Impossible de charger le brouillon', err)
  }
}

function resetQuestion() {
  responses.value = []
  tempQuestion.value = ""
  tempWeight.value = 1
  tempAnswerPoints.value = POINTS_MAX
  multipleChoice.value = false
}

function addQuestion() {
  let responsesToSend: { label: string; points: number }[] = []

  if (tempQuestion.value == "") return

  switch (questionType.value) {
    case "personalized":
      if (responses.value.length < 2) return
      responsesToSend = responses.value
      break
    case "YesNo":
      responsesToSend = [
        { label: "Oui", points: POINTS_MAX },
        { label: "Non", points: 0 },
      ]
      break
    case "Scale":
      responsesToSend = questionTemplateScale.map(label => ({ label, points: Number(label) }))
      break
  }
  const mappedrespond = responsesToSend.map((r, i) => ({
      id: `opt-${i}`,
      label: r.label,
      points: r.points,
    }))

  if (!mappedrespond.some((o) => o.points > 0)) {
    message.value = "Au moins une réponse doit rapporter des points."
    return
  }

  createdQuestions.value.push({
    id: crypto.randomUUID(),
    category: tempCategory.value,
    weight: tempWeight.value,
    /* Le type ne se devine pas depuis les points : l'admin le déclare. */
    type: questionType.value === 'personalized' && multipleChoice.value ? 'multiple' : 'single',
    /* Notation proportionnelle : une échelle ou un QCM nuancé n'a pas UNE bonne réponse. */
    scoring: 'graded',
    prompt: tempQuestion.value,
    options: mappedrespond,
  })

  message.value = null
  resetQuestion()
}
function removeQuestion(index: number) {
  createdQuestions.value.splice(index, 1)
}

function addanswer() {
  if (tempResponse.value == "") return
  responses.value.push({ label: tempResponse.value, points: tempAnswerPoints.value })
  tempResponse.value = ""
  tempAnswerPoints.value = POINTS_MAX
}
function removeAnswer(index: number) {
  responses.value.splice(index, 1)
}

function normalizeContent(): QuestionnaireContent {
  /* On ne publie que les catégories réellement utilisées : l'API refuse une
     question dont la catégorie est inconnue, jamais l'inverse. */
  const utilisees = new Set(createdQuestions.value.map((q) => q.category))
  const retenues = categories.value.filter((c) => utilisees.has(c.code))

  return {
    config: config.value,
    categories: retenues.length > 0 ? retenues : [{ ...CATEGORIE_LIBRE }],
    questions: createdQuestions.value,
  }
}

/* Publier et sauver ne diffèrent que par l'appel final : même création de version. */
async function enregistrer(publier: boolean) {
  if (!questionnaireCode.value) {
    message.value = 'Le code du questionnaire est requis.'
    return
  }
  if (createdQuestions.value.length === 0) {
    message.value = 'Aucune question à enregistrer.'
    return
  }
  try {
    const questionnaire = await CertificationService.createQuestionnaire(
      questionnaireCode.value,
      questionnaireTitle.value ? questionnaireTitle.value : 'Questionnaire-' + questionnaireCode.value,
      normalizeContent(),
    )

    if (publier) await CertificationService.publishQuestionnaire(questionnaire.id)
    else await CertificationService.publishQuestionnaireDraft(questionnaire.id)

    message.value = publier
      ? `Questionnaire publié (version ${questionnaire.version}) : il est désormais servi aux candidats.`
      : `Brouillon enregistré (version ${questionnaire.version}).`
    resetQuestion()
  } catch (err) {
    message.value = err instanceof Error ? err.message : 'Enregistrement impossible'
  }
}

function publishQuestionnaire() {
  return enregistrer(true)
}

function saveQuestionnaire() {
  return enregistrer(false)
}


</script>

<style>
:root {
  --navy: #1B3A6B;
  --navy-light: #253e66;
  --accent: #d9534f;
  --accent-hover: #c44844;
  --bg: #f4f6f9;
  --border: #e2e5eb;
  --text: #1B3A6B;
  --text-light: #6b7280;
}

.question-form {
  max-width: 100%;
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--navy);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: 'Faber Serif Reduced', Georgia, 'Times New Roman', serif;
  color: var(--text);
}

label {
  display: block;
  font-family: 'Faber Serif Reduced', Georgia, 'Times New Roman', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  margin-top: 16px;
  margin-bottom: 6px;
}

input,
select {
  width: 100%;
  max-width: 480px;
  padding: 10px 12px;
  border: 1px solid var(--navy-light);
  border-radius: 8px;
  background: var(--bg);
  font-size: 14px;
  color: var(--text);
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}



input:focus,
select:focus {
  outline: none;
  border-color: var(--navy-light);
  box-shadow: 0 0 0 3px rgba(44, 66, 112, 0.12);
  background: #fff;
}

p {
  font-family: 'Faber Serif Reduced', Georgia, 'Times New Roman', serif;
  color: var(--text);
  font-size: 15px;
  margin: 10px 0;
}

.frame {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.question-form {
  min-width: 400px;
  width: 40%;
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--navy);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: 'Marianne', 'Spectral', system-ui, sans-serif;
  color: var(--text);
}


.Answer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 16px;
}

.Answer-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--navy);
  color: #fff;
  font-family: 'Faber Serif Reduced', Georgia, 'Times New Roman', serif;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px 6px 14px;
  border-radius: 5px;
  line-height: 1;
}

.answer-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: var(--navy-light);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.answer-remove:hover {
  background: var(--accent);
}

button {
  padding: 10px 18px;
  margin-top: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

button:hover {
  background: var(--accent-hover);
}

div[v-for] > p,
.question-block p {
  font-family: 'Faber Serif Reduced', Georgia, 'Times New Roman', serif;
  color: var(--navy);
  font-weight: 700;
  font-size: 16px;
}

.question-block {
  position: relative;
  width: 100%;
  margin-top: 60px;
  margin: 15px;
  margin-right: 20%;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--navy);
  border-radius: 10px;
}

.points-edit {
  width: 48px;
  padding: 2px 4px;
  margin: 0;
  font-size: 12px;
  border-radius: 4px;
}

.question-remove {
  position: absolute;
  top: 0px;
  right: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: var(--navy-light);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.double-input {
  display: flex;
}

.double-input-block {
  /* width: 40%; */
  margin: 5%;
}

.Questionnary-block {
  position: relative;
  border: double ;
  min-width: 600px;
  width: 60%;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
}

.question-title {
  font-family: 'Faber Serif Reduced', Georgia, 'Times New Roman', serif;
  color: var(--navy);
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 8px;
}

.questionnaryButtons {
  position: absolute;
  top: 0px;
  right: 5px;
}

.import-block {
  margin: 12px 0 24px;
  padding: 12px 16px;
  border: 1px dashed var(--navy-light);
  border-radius: 10px;
}

.import-hint {
  font-size: 13px;
  color: var(--text-light);
}

.import-message {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy);
}

.inline-choice {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.inline-choice input {
  width: auto;
}

.question-meta {
  font-size: 13px;
  color: var(--text-light);
  margin: 0 0 8px;
}
</style>
