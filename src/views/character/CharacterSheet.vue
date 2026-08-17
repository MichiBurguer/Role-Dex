<!-- src/views/character/CharacterSheet.vue -->
<template>
  <div class="sheet-container">
    <div class="sheet-header-actions">
      <router-link to="/dashboard" class="btn-back">← Volver al Dashboard</router-link>
    </div>

    <!-- Carga inicial -->
    <div v-if="loading" class="loading-state">Cargando datos del personaje...</div>

    <!-- Bloqueo si es DM -->
    <div v-else-if="isDmOfThisCampaign" class="create-character-card dm-warning">
      <h2>Eres el Director de Juego</h2>
      <p class="subtitle">Como DM de esta campaña, no tienes una ficha de personaje asignada.</p>
      <router-link :to="'/campaign/' + campaignId" class="btn btn-primary" style="display: inline-block; text-align: center; text-decoration: none;">
        Ir al Panel del DM
      </router-link>
    </div>

    <!-- Formulario de Creación con Selects y Modificadores -->
    <div v-else-if="!character" class="create-character-card">
      <h2>Crear tu Personaje</h2>
      <p class="subtitle">Selecciona tu clase, raza y asigna tus atributos base</p>

      <form @submit.prevent="handleCreateCharacter" class="character-form">
        <div class="form-row">
          <div class="form-group">
            <label>Nombre del Personaje</label>
            <input v-model="newChar.name" type="text" placeholder="Ej. Valeros" required />
          </div>

          <div class="form-group">
            <label>Clase</label>
            <select v-model="newChar.class" @change="onClassChange" required>
              <option value="" disabled>Selecciona una clase</option>
              <option v-for="c in CLASSES" :key="c.id" :value="c.name">
                {{ c.name }} (HP Base: {{ c.hpBase }})
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Raza</label>
            <select v-model="newChar.race" required>
              <option v-for="r in RACES" :key="r.id" :value="r.name">
                {{ r.name }} ({{ r.desc }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Puntos de Vida Máximos (HP)</label>
            <input v-model.number="newChar.hpMax" type="number" min="1" required />
          </div>
        </div>

        <hr class="form-divider" />
        <h3>Atributos Base y Bonificación Racial</h3>

        <div class="stats-grid-input">
          <div v-for="stat in STAT_CONFIG" :key="stat.key" class="stat-input-group">
            <label>{{ stat.label }}</label>
            <input v-model.number="newChar.stats[stat.key]" type="number" min="1" max="20" />
            
            <!-- Muestra el modificador aplicado por la raza -->
            <span class="stat-bonus" :class="{ 'has-bonus': selectedRace.mods[stat.key] > 0 }">
              +{{ selectedRace.mods[stat.key] || 0 }} Racial = 
              <strong>{{ getFinalStat(stat.key) }}</strong>
            </span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Comenzar Aventura' }}
        </button>
      </form>
    </div>

    <!-- Hoja de Personaje Interactiva -->
    <div v-else class="character-sheet">
      <header class="sheet-header">
        <div>
          <h1>{{ character.name }}</h1>
          <p class="hero-sub">{{ character.race }} {{ character.class }} — Nivel {{ character.level || 1 }}</p>
        </div>
      </header>

      <div class="sheet-grid">
        <!-- Control de Vida -->
        <section class="sheet-card hp-card">
          <h3>Puntos de Vida (HP)</h3>
          <div class="hp-display">
            <span class="hp-current" :class="{ 'hp-low': character.hpCurrent <= character.hpMax * 0.25 }">
              {{ character.hpCurrent }}
            </span>
            <span class="hp-max">/ {{ character.hpMax }}</span>
          </div>

          <div class="hp-controls">
            <button @click="modifyHp(-5)" class="btn-hp btn-damage">-5</button>
            <button @click="modifyHp(-1)" class="btn-hp btn-damage">-1</button>
            <button @click="modifyHp(1)" class="btn-hp btn-heal">+1</button>
            <button @click="modifyHp(5)" class="btn-hp btn-heal">+5</button>
          </div>
        </section>

        <!-- Atributos -->
        <section class="sheet-card">
          <h3>Atributos</h3>
          <div class="stats-grid">
            <div v-for="stat in STAT_CONFIG" :key="stat.key" class="stat-box">
              <span class="stat-name">{{ stat.label }}</span>
              <span class="stat-val">{{ getStatValue(character.stats, stat.key) }}</span>
              <span class="stat-mod">{{ calcMod(getStatValue(character.stats, stat.key)) }}</span>
            </div>
          </div>
        </section>

        <!-- Inventario -->
        <section class="sheet-card inventory-card">
          <h3>Inventario</h3>
          <div class="add-item-form">
            <input v-model="newItem" placeholder="Añadir objeto..." @keyup.enter="addItem" />
            <button @click="addItem" class="btn btn-small">+</button>
          </div>
          <ul class="inventory-list">
            <li v-for="(item, index) in character.inventory" :key="index">
              <span>{{ item }}</span>
              <button @click="removeItem(index)" class="btn-delete">✕</button>
            </li>
            <li v-if="!character.inventory?.length" class="empty-inv">El inventario está vacío.</li>
          </ul>
        </section>


        <div class="sheet-container">

          <div class="sheet-grid">

            <section class="sheet-card">
              <DiceRoller 
                :campaignId="campaignId" 
                :userName="character?.name || authStore.user?.email || 'Jugador'" 
              />
            </section>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import DiceRoller from '../../components/DiceRoller.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { 
  getCharacterByCampaign, 
  createCharacter, 
  subscribeToCharacter, 
  updateCharacter 
} from '../../services/characterService'
import { getCampaignById } from '../../services/campaignService'

const props = defineProps({
  campaignId: { type: String, default: '' }
})

const route = useRoute()
const authStore = useAuthStore()
const campaignId = props.campaignId || route.params.campaignId

const loading = ref(true)
const saving = ref(false)
const isDmOfThisCampaign = ref(false)
const character = ref(null)
const newItem = ref('')
let unsubscribe = null

// Catálogos
const RACES = [
  { id: 'humano', name: 'Humano', mods: { fuerza: 1, destreza: 1, constitucion: 1, inteligencia: 1, sabiduria: 1, carisma: 1 }, desc: '+1 Todo' },
  { id: 'elfo', name: 'Elfo', mods: { fuerza: 0, destreza: 2, constitucion: 0, inteligencia: 1, sabiduria: 0, carisma: 0 }, desc: '+2 DEX, +1 INT' },
  { id: 'enano', name: 'Enano', mods: { fuerza: 0, destreza: 0, constitucion: 2, inteligencia: 0, sabiduria: 1, carisma: 0 }, desc: '+2 CON, +1 WIS' },
  { id: 'semiorco', name: 'Semiorco', mods: { fuerza: 2, destreza: 0, constitucion: 1, inteligencia: 0, sabiduria: 0, carisma: 0 }, desc: '+2 STR, +1 CON' },
  { id: 'mediano', name: 'Mediano', mods: { fuerza: 0, destreza: 2, constitucion: 0, inteligencia: 0, sabiduria: 0, carisma: 1 }, desc: '+2 DEX, +1 CHA' }
]

const CLASSES = [
  { id: 'guerrero', name: 'Guerrero', hpBase: 12 },
  { id: 'mago', name: 'Mago', hpBase: 6 },
  { id: 'picaro', name: 'Pícaro', hpBase: 8 },
  { id: 'clerigo', name: 'Clérigo', hpBase: 8 },
  { id: 'paladin', name: 'Paladín', hpBase: 10 }
]

const STAT_CONFIG = [
  { key: 'fuerza', label: 'STR' },
  { key: 'destreza', label: 'DEX' },
  { key: 'constitucion', label: 'CON' },
  { key: 'inteligencia', label: 'INT' },
  { key: 'sabiduria', label: 'WIS' },
  { key: 'carisma', label: 'CHA' }
]

const newChar = ref({
  name: '',
  class: CLASSES[0].name,
  race: RACES[0].name,
  hpMax: CLASSES[0].hpBase,
  hpCurrent: CLASSES[0].hpBase,
  level: 1,
  stats: {
    fuerza: 10,
    destreza: 10,
    constitucion: 10,
    inteligencia: 10,
    sabiduria: 10,
    carisma: 10
  },
  inventory: ['Mochila de aventurero', 'Raciones x5']
})

// Obtiene los datos de la raza seleccionada
const selectedRace = computed(() => {
  return RACES.find(r => r.name === newChar.value.race) || RACES[0]
})

// Calcula la estadística final incluyendo bonificación racial
const getFinalStat = (statKey) => {
  const base = newChar.value.stats[statKey] || 10
  const mod = selectedRace.value.mods[statKey] || 0
  return base + mod
}

// Actualiza los HP máximos automáticamente según la clase elegida
const onClassChange = () => {
  const foundClass = CLASSES.find(c => c.name === newChar.value.class)
  if (foundClass) {
    newChar.value.hpMax = foundClass.hpBase
  }
}

const getStatValue = (statsObj, key) => {
  if (!statsObj) return 10
  const val = statsObj[key] ?? statsObj[key.toLowerCase()] ?? 10
  return typeof val === 'number' && !isNaN(val) ? val : 10
}

const calcMod = (val) => {
  const num = typeof val === 'number' && !isNaN(val) ? val : 10
  const mod = Math.floor((num - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const loadOrSubscribeCharacter = async () => {
  if (!authStore.user?.uid) return
  const res = await getCharacterByCampaign(campaignId, authStore.user.uid)

  if (res.success && res.character) {
    unsubscribe = subscribeToCharacter(res.character.id, (updatedChar) => {
      character.value = updatedChar
    })
  }
}

const handleCreateCharacter = async () => {
  if (!authStore.user?.uid) return
  saving.value = true

  // Aplicar bonificaciones raciales finales a los atributos al guardar
  const finalStats = {}
  STAT_CONFIG.forEach(stat => {
    finalStats[stat.key] = getFinalStat(stat.key)
  })

  const payload = {
    ...newChar.value,
    stats: finalStats,
    hpCurrent: newChar.value.hpMax,
    campaignId,
    userId: authStore.user.uid
  }

  const res = await createCharacter(payload)
  if (res.success) {
    await loadOrSubscribeCharacter()
  }
  saving.value = false
}

const modifyHp = async (amount) => {
  if (!character.value) return
  let newHp = character.value.hpCurrent + amount
  if (newHp < 0) newHp = 0
  if (newHp > character.value.hpMax) newHp = character.value.hpMax

  await updateCharacter(character.value.id, { hpCurrent: newHp })
}

const addItem = async () => {
  if (!newItem.value.trim() || !character.value) return
  const updatedInv = [...(character.value.inventory || []), newItem.value.trim()]
  await updateCharacter(character.value.id, { inventory: updatedInv })
  newItem.value = ''
}

const removeItem = async (index) => {
  if (!character.value) return
  const updatedInv = [...character.value.inventory]
  updatedInv.splice(index, 1)
  await updateCharacter(character.value.id, { inventory: updatedInv })
}

onMounted(async () => {
  loading.value = true
  try {
    const campaign = await getCampaignById(campaignId)
    if (campaign && campaign.dmId === authStore.user?.uid) {
      isDmOfThisCampaign.value = true
    } else {
      await loadOrSubscribeCharacter()
    }
  } catch (error) {
    console.error("Error al cargar la hoja de personaje:", error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>


<style scoped>
.sheet-container { max-width: 900px; margin: 0 auto; padding: 30px 20px; color: #f3f4f6; }
.btn-back { color: #9ca3af; text-decoration: none; font-size: 0.9rem; }
.btn-back:hover { color: #ff4757; }

.create-character-card, .sheet-card {
  background: #1e272e; border: 1px solid #2f3542; border-radius: 12px; padding: 25px; margin-top: 15px;
}

.dm-warning { text-align: center; display: flex; flex-direction: column; gap: 15px; align-items: center; }

.form-row { display: flex; gap: 15px; margin-bottom: 15px; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }

input, select { 
  padding: 10px; 
  border-radius: 6px; 
  border: 1px solid #353b48; 
  background: #2f3542; 
  color: white; 
  font-size: 0.95rem;
}

.stats-grid-input { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
.stat-input-group { display: flex; flex-direction: column; text-align: center; font-weight: bold; }

.stat-bonus { 
  font-size: 0.75rem; 
  color: #a4b0be; 
  margin-top: 4px; 
}
.stat-bonus.has-bonus { color: #2ed573; }

.sheet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 20px; }

.hp-card { text-align: center; }
.hp-display { font-size: 3rem; font-weight: bold; margin: 10px 0; }
.hp-current { color: #2ed573; }
.hp-low { color: #ff4757; }
.hp-max { font-size: 1.5rem; color: #718093; }

.hp-controls { display: flex; justify-content: center; gap: 10px; }
.btn-hp { padding: 8px 14px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; }
.btn-damage { background: #ff475722; color: #ff4757; border: 1px solid #ff4757; }
.btn-heal { background: #2ed57322; color: #2ed573; border: 1px solid #2ed573; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; }
.stat-box { background: #2f3542; padding: 10px; border-radius: 8px; display: flex; flex-direction: column; }
.stat-name { font-size: 0.75rem; color: #a4b0be; }
.stat-val { font-size: 1.4rem; font-weight: bold; }
.stat-mod { font-size: 0.85rem; color: #ff4757; }

.add-item-form { display: flex; gap: 10px; margin-bottom: 15px; }
.inventory-list { list-style: none; padding: 0; margin: 0; }
.inventory-list li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2f3542; }
.btn-delete { background: none; border: none; color: #ff4757; cursor: pointer; }

.btn-primary { width: 100%; padding: 12px; background: #ff4757; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>