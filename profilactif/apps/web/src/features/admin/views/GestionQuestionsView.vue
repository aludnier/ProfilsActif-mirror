<template>
  <div class="question-form">
    <span>
      <label for="question">Question</label><br>
      <input id="question" v-model="tempQuestion"><br>
    </span>
    <label for="Questiontype">Type de question</label>
    <select id="Questiontype" v-model="questionType">
        <option value="personalized">Persionaliser</option>
        <option value="YesNo">Oui ou Non</option>
        <option value="Scale">Echelle de 1 à 10</option>
    </select><br>

    <div v-if="questionType === 'personalized'">
      <label for="Answer">Réponses</label><br>
      <input id="Answer" v-model="tempResponse" @keyup.enter="addanswer"/><br>

      <p>{{ tempQuestion }}</p>
      <div class="Answer-list">
        <span v-for="(response, index) in responses" :key="index" class="Answer-tag">
          {{ response }}
          <button type="button" class="answer-remove" @click="removeAnswer(index)">✕</button>
        </span>
      </div>
    </div>

    <button @click="addQuestion">Ajouter la question</button>
    </div>
    <div class="Questionnary-block">
      <div v-for="(question, index) in questionary" :key="index" class="question-block">
        <button type="button" class="question-remove" @click="removeQuestion(index)">✕</button>
          <p class="question-title">{{ question }}</p>
          <div class="Answer-list">
            <span
              v-for="(response, indexReponse) in questionaryResponses[index]"
              :key="indexReponse"
              class="Answer-tag"
            >
              {{ response }}
            </span>
          </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const questionTemplateYesNo = ["Oui", "Non"]
const questionTemplateScale = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

const tempQuestion = ref("")
const tempResponse = ref("")
const responses = ref<string[]>([])
const questionary = ref<string[]>(["Qui", "Quoi"])
const questionaryResponses = ref<string[][]>([questionTemplateYesNo, questionTemplateYesNo])
const questionType = ref("personalized")


function addanswer() {
    if (tempResponse.value == "") {
        return
    }
    responses.value.push(tempResponse.value)
    tempResponse.value = ""
}

function addQuestion() {
    if (tempQuestion.value != "") {
        switch (questionType.value){
            case "personalized":
                if (responses.value.length < 2) {
                    return
                }
                questionaryResponses.value.push(responses.value)
                break
            case "YesNo":
                questionaryResponses.value.push(questionTemplateYesNo)
                break
            case "Scale":
                questionaryResponses.value.push(questionTemplateScale)
                break
        }
        questionary.value.push(tempQuestion.value)
    }
    tempQuestion.value = ""
    tempResponse.value = ""
    responses.value = []
}

function removeAnswer(index: number) {
  responses.value.splice(index, 1)
}

function removeQuestion(index: number) {
  questionary.value.splice(index, 1)
  questionaryResponses.value.splice(index, 1)
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
  max-width: 1000px;
  margin-top: 60px;
  margin: 15px;
  margin-right: 20%;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--navy);
  border-radius: 10px;
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

.Questionnary-block {
  max-width: 100%;
  display : grid;
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
</style>
