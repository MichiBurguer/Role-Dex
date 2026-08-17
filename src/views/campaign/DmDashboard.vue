<!-- src/views/campaign/DmDashboard.vue -->
<template>
  <div class="dm-container">
    <div class="dm-header">
      <router-link to="/dashboard" class="btn-back">← Volver al Dashboard</router-link>
      <span class="dm-badge">PANEL DEL DUNGEON MASTER</span>
    </div>

    <div v-if="loading" class="loading">Cargando mesa de juego...</div>

    <div v-else>
      <!-- Cabecera de la Campaña -->
      <header class="campaign-title-card">
        <div>
          <h1>{{ campaign?.name || 'Campaña' }}</h1>
          <p>{{ campaign?.description || 'Sin descripción' }}</p>
        </div>
        <div class="invite-box">
          <span>Código para Jugadores:</span>
          <strong>{{ campaign?.inviteCode }}</strong>
        </div>
      </header>

      <!-- Lista de Jugadores en Vivo -->
      <section class="players-section">
        <h2>Jugadores en la Mesa ({{ characters.length }})</h2>

        <div v-if="characters.length === 0" class="empty-players">
          <p>Aún no hay personajes creados en esta campaña.</p>
          <p>Comparte el código <strong>{{ campaign?.inviteCode }}</strong> con tus jugadores para que se unan.</p>
        </div>

        <div v-else class="players-grid">
          <div v-for="char in characters" :key="char.id" class="player-card">
            <div class="player-header">
              <h3>{{ char.name }}</h3>
              <span class="char-meta">{{ char.race }} {{ char.class }} (Nvl {{ char.level || 1 }})</span>
            </div>

            <!-- Control de HP del personaje desde el panel del DM -->
            <div class="hp-section">
              <div class="hp-info">
                <span>HP:</span>
                <span class="hp-values" :class="{ 'hp-low': char.hpCurrent <= char.hpMax * 0.25 }">
                  {{ char.hpCurrent }} / {{ char.hpMax }}
                </span>
              </div>
              <div class="hp-dm-controls">
                <button @click="modifyPlayerHp(char, -5)" class="btn-hp btn-damage">-5</button>
                <button @click="modifyPlayerHp(char, -1)" class="btn-hp btn-damage">-1</button>
                <button @click="modifyPlayerHp(char, 1)" class="btn-hp btn-heal">+1</button>
                <button @click="modifyPlayerHp(char, 5)" class="btn-hp btn-heal">+5</button>
              </div>
            </div>

            <!-- Resumen de Atributos del Jugador -->
            <div class="mini-stats">
              <div v-for="stat in STAT_CONFIG" :key="stat.key" class="mini-stat-box">
                <span class="label">{{ stat.label }}</span>
                <span class="val">{{ getStatVal(char.stats, stat.key) }}</span>
              </div>
            </div>

            <!-- Inventario Resumido -->
            <div class="inventory-preview">
              <strong>Inventario:</strong>
              <p v-if="char.inventory?.length">{{ char.inventory.join(', ') }}</p>
              <p v-else class="text-muted">Vacío</p>
            </div>

        
            <div class="dashboard-grid">
              <div class="dashboard-card">
                <DiceRoller :campaignId="campaignId" userName="Director de Juego (DM)" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import DiceRoller from '../../components/DiceRoller.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { getCampaignById } from '../../services/campaignService'
import { subscribeToCampaignCharacters, updateCharacter } from '../../services/characterService'

const props = defineProps({
  campaignId: { type: String, required: true }
})

const campaign = ref(null)
const characters = ref([])
const loading = ref(true)
let unsubscribe = null

const STAT_CONFIG = [
  { key: 'fuerza', label: 'STR' },
  { key: 'destreza', label: 'DEX' },
  { key: 'constitucion', label: 'CON' },
  { key: 'inteligencia', label: 'INT' },
  { key: 'sabiduria', label: 'WIS' },
  { key: 'carisma', label: 'CHA' }
]

const getStatVal = (statsObj, key) => {
  if (!statsObj) return 10
  const val = statsObj[key] ?? statsObj[key.toLowerCase()] ?? 10
  return typeof val === 'number' && !isNaN(val) ? val : 10
}

const modifyPlayerHp = async (char, amount) => {
  let newHp = char.hpCurrent + amount
  if (newHp < 0) newHp = 0
  if (newHp > char.hpMax) newHp = char.hpMax
  await updateCharacter(char.id, { hpCurrent: newHp })
}

onMounted(async () => {
  campaign.value = await getCampaignById(props.campaignId)
  
  // Suscripción en tiempo real a los personajes de la campaña
  unsubscribe = subscribeToCampaignCharacters(props.campaignId, (updatedList) => {
    characters.value = updatedList
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>



<style scoped>
.dm-container { max-width: 1000px; margin: 0 auto; padding: 30px 20px; color: #f3f4f6; }
.dm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-back { color: #9ca3af; text-decoration: none; }
.btn-back:hover { color: #ff4757; }
.dm-badge { background: #ff4757; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }

.campaign-title-card {
  background: #1e272e; border: 1px solid #2f3542; border-radius: 12px; padding: 20px 25px;
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;
}
.campaign-title-card h1 { margin: 0; font-size: 1.8rem; }
.campaign-title-card p { margin: 5px 0 0 0; color: #9ca3af; }

.invite-box { background: #2f3542; padding: 10px 15px; border-radius: 8px; text-align: center; }
.invite-box span { display: block; font-size: 0.75rem; color: #a4b0be; }
.invite-box strong { font-size: 1.2rem; color: #ff4757; letter-spacing: 1px; }

.players-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.player-card { background: #1e272e; border: 1px solid #2f3542; border-radius: 12px; padding: 20px; }

.player-header h3 { margin: 0; font-size: 1.4rem; color: #ffffff; }
.char-meta { font-size: 0.85rem; color: #ff4757; }

.hp-section { margin: 15px 0; background: #2f3542; padding: 12px; border-radius: 8px; }
.hp-info { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; }
.hp-values { color: #2ed573; }
.hp-low { color: #ff4757; }

.hp-dm-controls { display: flex; gap: 8px; justify-content: center; }
.btn-hp { padding: 4px 10px; border-radius: 4px; border: none; font-weight: bold; cursor: pointer; }
.btn-damage { background: #ff475722; color: #ff4757; border: 1px solid #ff4757; }
.btn-heal { background: #2ed57322; color: #2ed573; border: 1px solid #2ed573; }

.mini-stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; text-align: center; margin-bottom: 15px; }
.mini-stat-box { background: #0c1013; padding: 5px; border-radius: 4px; }
.mini-stat-box .label { display: block; font-size: 0.65rem; color: #718093; }
.mini-stat-box .val { font-size: 0.85rem; font-weight: bold; }

.inventory-preview { font-size: 0.85rem; color: #a4b0be; border-top: 1px solid #2f3542; padding-top: 10px; margin-top: 10px; }
.text-muted { color: #718093; font-style: italic; }

.empty-players, .loading { text-align: center; padding: 40px; color: #718093; background: #1e272e; border-radius: 12px; }
</style>