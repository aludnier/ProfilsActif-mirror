<template>
  <div class="page">

    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-label">Espace candidat</div>
        <nav class="sidebar-nav">
          <a href="#" class="side-link active">Mon profil public</a>
          <a href="#" class="side-link">Tableau de bord</a>
          <a href="#" class="side-link">Mes vidéos</a>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="main">
        <div class="page-header">
          <div class="progress-wrap">
            <div class="progress-label">Profil complété à {{ completion }}%</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: completion + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="grid">
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
                    <button type="button+" class="tag-remove" @click="removeSkill(index)">✕</button>
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

          <section class="card">
            <h2>Ma vidéo de présentation</h2>

            <div class="video-frame">
              <!-- Video player -->
            </div>

            <div class="video-actions">
              <button class="btn-light full">Enregistrer à nouveau</button>
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

const fullname = ref("")
const headline = ref("")
const tempSkill = ref("")
const skills = ref(["Direction Générale", "Affaires Publiques", "Gestion de crise", "Souveraineté numérique"])
const recruiterCount = ref("5 000")

const criteria = ref([
  "Qualité sonore (voix claire et audible)",
  "Cadrage correct (buste et visage centrés)",
  "Contenu déontologique neutre (Loi Service Public)"
])

function addSkill() {
  const value = tempSkill.value.trim()
  if (value !== "") {
    skills.value.push(value)
    tempSkill.value = ""
  }
}

function removeSkill(index) {
  skills.value.splice(index, 1)
}

const completion = computed(() => {
  let filled = 0
  const total = 4
  if (fullname.value) filled++
  if (headline.value) filled++
  if (skills.value.length > 0) filled++
  filled++ // vidéo déjà présente dans cet exemple
  return Math.round((filled / total) * 100)
})
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

/* Header */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--border);
  padding: 16px 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 34px;
  height: 34px;
  border: 2px solid var(--navy);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.brand-name {
  font-weight: 700;
  color: var(--navy);
  font-size: 15px;
}

.brand-sub {
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--text-light);
}

.nav {
  display: flex;
  gap: 28px;
}

.nav-link {
  color: var(--text-light);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.nav-link.active {
  color: var(--navy);
  font-weight: 700;
}

.btn-outline {
  background: #eceffb;
  color: var(--navy);
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
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
  margin-bottom: 20px;
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

.badge {
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.ethics-box {
  background: #eceffb;
  border-radius: 10px;
  padding: 16px;
}

.ethics-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--navy);
  margin-bottom: 8px;
}

.ethics-box p {
  font-size: 12.5px;
  color: var(--text);
  line-height: 1.5;
  margin: 0;
}

/* Main */
.main {
  flex: 1;
  min-width: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 24px;
}

.page-header h1 {
  color: var(--navy);
  font-size: 26px;
  margin: 0 0 6px;
}

.subtitle {
  color: var(--text-light);
  font-size: 14px;
  margin: 0;
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

.hint {
  font-size: 12px;
  color: var(--text-light);
  margin: 8px 0 0;
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
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
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
  padding: 6px 12px;
  font-size: 13px;
  background: #fff;
  color: var(--navy);
  width: 110px;
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
  display: flex;
  align-items: flex-end;
  padding: 14px;
  color: #fff;
}

.video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.video-meta {
  z-index: 1;
}

.video-title {
  font-weight: 700;
  font-size: 14px;
}

.video-sub {
  font-size: 11px;
  opacity: 0.8;
}

.video-time {
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-size: 11px;
  z-index: 1;
}

.video-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.25);
}

.video-progress-fill {
  width: 45%;
  height: 100%;
  background: var(--accent);
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

.criteria-box {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.criteria-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 12px;
}

.criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.criteria-list li {
  font-size: 13.5px;
  color: var(--text);
}

.check {
  color: #2e7d32;
  font-weight: 700;
  margin-right: 6px;
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  margin-top: 24px;
  padding-top: 20px;
}

.footer-note {
  font-size: 13px;
  color: var(--text-light);
  margin: 0;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.skills-block {
  max-width: 480px;
  max-height: 130px;
  overflow-y: scroll;
  margin: 20px 0;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
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
