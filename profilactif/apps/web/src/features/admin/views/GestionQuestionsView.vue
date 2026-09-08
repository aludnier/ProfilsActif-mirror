<template>
  <div class="frame">
  <div class="question-form">
    <label for="code">Code du questionnaire</label>
    <input id="code" v-model="questionnaireCode"><br>

    <label for="title">Titre du questionnaire</label>
    <input id="title" v-model="questionnaireTitle"><br>

    <label for="Questiontype">Type de question</label>
    <select id="Questiontype" v-model="questionType">
        <option value="personalized">Persionaliser</option>
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
      <label for="Answer">Réponses</label>
      <input id="Answer" v-model="tempResponse" @keyup.enter="addanswer"/><br>

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
      <div v-for="(question, index) in createdQuestions" :key="index" class="question-block">
        <button type="button" class="question-remove" @click="removeQuestion(index)">✕</button>
          <p class="question-title">{{ question.prompt }} - {{ question.type }}</p>
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
import type { QuestionnaireContent, QuestionnaireQuestion } from '@/shared/types/api'
import { onMounted, ref } from 'vue'

const questionTemplateYesNo = ["Oui", "Non"]
const questionTemplateScale = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

const tempQuestion = ref("")
const tempResponse = ref("")
const tempWeight = ref<number>(1)
const tempAnswerPoints = ref<number>(1)
const responses = ref<{ label: string; points: number }[]>([])
const questionType = ref<'personalized' | 'YesNo' | 'Scale'>("personalized")

const createdQuestions = ref<QuestionnaireQuestion[]>([])

const questionnaireCode = ref("")
const questionnaireTitle = ref("")

onMounted(() => {
  checkDraft()
})


function mapType(responses: { id: string; label: string; points: number }[], type: string): 'single' | 'multiple' {
  if (type === "YesNo") {
    return 'single'
  }

  let nbvalid = 0
  for (let r = 0; r < responses.length; r++) {
    if ((responses.at(r)?.points ?? 0) > 0) {
      nbvalid++
    }
  }
  return nbvalid > 1 ? 'multiple' : 'single'
}

async function checkDraft() {
  try {
    const draft = await CertificationService.getDraft()
    if (!draft) return
    createdQuestions.value = (draft.content.questions ?? []) as QuestionnaireQuestion[]
    questionnaireCode.value = draft.code
    questionnaireTitle.value = draft.title
  } catch (err) {
    console.error('Impossible de charger le brouillon', err)
  }
}

function resetQuestion() {
  responses.value = []
  tempQuestion.value = ""
  tempWeight.value = 1
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
      responsesToSend = questionTemplateYesNo.map(label => ({ label, points: label == "Oui" ? 1 : 0 }))
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

  createdQuestions.value.push({
    id: crypto.randomUUID(),
    category: 'general',
    weight: tempWeight.value,
    type: mapType(mappedrespond, questionType.value),
    prompt: tempQuestion.value,
    options: mappedrespond,
  })

  resetQuestion()
}
function removeQuestion(index: number) {
  createdQuestions.value.splice(index, 1)
}

function addanswer() {
  if (tempResponse.value == "") return
  responses.value.push({ label: tempResponse.value, points: tempAnswerPoints.value })
  tempResponse.value = ""
  tempAnswerPoints.value = 1
}
function removeAnswer(index: number) {
  responses.value.splice(index, 1)
}

function normalizeContent(): QuestionnaireContent {
  return {
    config: {
      passThreshold: 70,
      minCategoryScore: 50,
      retakeDelayDays: 30,
      badgeBands: [
        { min: 90, level: 'expert' },
        { min: 70, level: 'confirmé' },
        { min: 50, level: 'débutant' },
      ],
    },
    categories: [
      { code: 'general', label: 'Général', weight: 1 },
    ],
    questions: createdQuestions.value,
  }
}

async function publishQuestionnaire() {
  if (!questionnaireCode.value) {
    console.error('Code requis')
    return
  }
  if (createdQuestions.value.length === 0) {
    console.error('Aucune question à publier')
    return
  }
  try {
    const content = normalizeContent()
    const questionnaire = await CertificationService.createQuestionnaire(
      questionnaireCode.value,
      questionnaireTitle.value ? questionnaireTitle.value : 'Questionnaire-' + questionnaireCode.value,
      content,
    )
    console.log('Questionnaire créé :', questionnaire)

    await CertificationService.publishQuestionnaire(questionnaire.id)
    console.log('Questionnaire publié :', questionnaire)

    resetQuestion()
  } catch (err) {
    console.error(err)
  }
}

async function saveQuestionnaire() {
  if (!questionnaireCode.value) {
    console.error('Code requis')
    return
  }
  if (createdQuestions.value.length === 0) {
    console.error('Aucune question à publier')
    return
  }
  try {
    const content = normalizeContent()
    const questionnaire = await CertificationService.createQuestionnaire(
      questionnaireCode.value,
      questionnaireTitle.value ? questionnaireTitle.value : 'Questionnaire-' + questionnaireCode.value,
      content,
    )
    console.log('Questionnaire créé :', questionnaire)
    console.log('Questionnaire créé :', questionnaire)
    await CertificationService.publishQuestionnaireDraft(questionnaire.id)
    console.log('Questionnaire publié :', questionnaire)

    resetQuestion()
  } catch (err) {
    console.error(err)
  }
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
  /* border: solid red; */
} 
</style>
