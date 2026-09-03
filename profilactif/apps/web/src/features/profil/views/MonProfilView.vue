<template>
  <div class="page">

    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-label">Espace candidat</div>
        <nav class="sidebar-nav">
          <button type="button" class="side-link" :class="{ active: currentView === 'profile' }" @click="currentView = 'profile'">
            Mon profil public
          </button>
          <button type="button" class="side-link" :class="{ active: currentView === 'dashboard' }" @click="currentView = 'dashboard'">
            Tableau de bord
          </button>
          <button type="button" class="side-link" :class="{ active: currentView === 'videos' }" @click="currentView = 'videos'">
            Mes vidéos
            </button>
        </nav>
      </aside>

      <main class="main">

        <div class="grid">
        <div v-if="currentView == 'profile'" >
          <section class="card">
            <div class="field">
              <label for="fullname">Nom complet</label>
              <input id="fullname" v-model="fullname" placeholder="Prénom Nom" />
            </div>

            <div class="field">
              <label for="headline">Titre professionnel</label>
              <input id="headline" v-model="headline" placeholder="Ex : Directrice des affaires publiques" />
            </div>

            <div class="field">
              <label>Compétences</label>
              <div class="tags">
                <div class="skills-block" v-if="skills.length > 0">
                  <span class="tag" v-for="(skill, index) in skills" :key="index">
                    {{ skill }}
                    <button type="button" class="tag-remove" @click="removeSkill(index)">✕</button>
                  </span>
                </div>

                <input
                  v-model="tempSkill"
                  class="tag-input"
                  placeholder="+ Ajouter"
                  @keydown.enter.prevent="addSkill"
                />
              </div>
            </div>
          </section>
        </div>
        <div v-if="currentView == 'videos'">
            <section class="card">
              <label v-if="videos.length <= 0">Aucune videos</label>
              <div class="video-frame" v-for="(link, index) in videos" :key="index">
                <!-- Video player -->
              </div>
            </section>
        </div>

          <section class="card">
            <h2>Ma vidéo de présentation</h2>

            <div class="video-frame">
              <!-- Video player -->
            </div>
            <input class="" v-model="videoLink" placeholder="lien de la video" />
            <div class="video-actions">
              <button class="btn-light full" v-on:click="changeVideo">Changer de vidéo</button>
              <button class="btn-icon-danger">🗑</button>
            </div>

          </section>
        </div>

        <div class="footer-bar">
          <div class="footer-actions">
            <button class="btn-primary">Publier mon profil public</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const videoLink = ref("")
const currentView = ref("profile")
const fullname = ref("")
const headline = ref("")
const tempSkill = ref("")
const allVideos = ref([])
const skills = ref(["Direction Générale", "Affaires Publiques", "Gestion de crise", "Souveraineté numérique"])

function addSkill() {
  const value = tempSkill.value.trim()
  if (value !== "") {
    skills.value.push(value)
    tempSkill.value = ""
  }
}

function changeVideo() {

}

function removeSkill(index) {
  skills.value.splice(index, 1)
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

* {
  box-sizing: border-box;
}

.page {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  min-height: 100vh;
}

/* Layout */
.layout {
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  gap: 28px;
  padding: 28px 32px;
}

.sidebar {
  width: 230px;
  flex-shrink: 0;
}

.sidebar-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-light);
  margin-bottom: 10px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.side-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  border-bottom: 1px solid var(--border);
}

.side-link:last-child {
  border-bottom: none;
}

.side-link.active {
  background: #eceffb;
  font-weight: 700;
  color: var(--navy);
}

/* Main */
.main {
  flex: 1;
  min-width: 0;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.progress-wrap {
  min-width: 220px;
  text-align: right;
}

.progress-label {
  color: var(--accent);
  font-weight: 700;
  font-size: 12.5px;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
}

.card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.card h2 {
  color: var(--navy);
  font-size: 17px;
  margin: 0 0 16px;
}

.btn-light {
  background: #eceffb;
  color: var(--navy);
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
}

.btn-light.full {
  width: 100%;
}

.field {
  margin-top: 20px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--navy);
  margin-bottom: 6px;
}

.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  font-size: 14px;
  color: var(--text);
}

.field input:focus {
  outline: none;
  border-color: var(--navy-light);
  box-shadow: 0 0 0 3px rgba(27, 58, 107, 0.12);
  background: #fff;
}

.tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skills-block {
  max-width: 480px;
  max-height: 130px;
  overflow-y: scroll;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  margin: 0;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--navy);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px 6px 14px;
  border-radius: 6px;
  height: fit-content;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
}

.tag-remove:hover {
  background: var(--accent);
}

.tag-input {
  border: 1px dashed var(--navy-light);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  background: #fff;
  color: var(--navy);
  width: 100%;
}

.tag-input:focus {
  outline: none;
  border-style: solid;
}

.video-frame {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #33445c, #1a2436);
}

.video-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.btn-icon-danger {
  border: 1px solid #f3c9c7;
  background: #fff;
  color: var(--accent);
  border-radius: 8px;
  width: 42px;
  cursor: pointer;
}

.footer-bar {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  margin-top: 24px;
  padding-top: 20px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

@media (max-width: 900px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
