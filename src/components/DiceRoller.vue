<!-- src/components/DiceRoller.vue -->
<template>
  <div class="dice-roller-card">
    <h3>🎲 Lanzador de Dados</h3>

    <!-- Selector de Dados -->
    <div class="dice-buttons">
      <button 
        v-for="d in DICE_TYPES" 
        :key="d" 
        class="btn-dice"
        @click="handleRoll(d)"
        :disabled="rolling"
      >
        d{{ d }}
      </button>
    </div>

    <!-- Modificador opcional -->
    <div class="modifier-group">
      <label>Modificador:</label>
      <input v-model.number="modifier" type="number" placeholder="0" />
    </div>

    <hr class="divider" />

    <!-- Feed de Tiradas -->
    <h4>Historial de la Campaña</h4>
    <div class="rolls-feed">
      <div 
        v-for="roll in rolls" 
        :key="roll.id" 
        class="roll-item"
        :class="{ 'is-crit': roll.diceType === 'd20' && roll.rawRoll === 20, 'is-fail': roll.diceType === 'd20' && roll.rawRoll === 1 }"
      >
        <div class="roll-info">
          <strong>{{ roll.userName || 'Jugador' }}</strong>
          <span class="roll-type">lanzó {{ roll.diceType }}</span>
        </div>

        <div class="roll-result">
          <span class="raw-roll">[{{ roll.rawRoll }}]</span>
          <span v-if="roll.modifier" class="mod-roll">
            {{ roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier }}
          </span>
          <span class="total-roll">= {{ roll.total }}</span>
        </div>
      </div>

      <p v-if="!rolls.length" class="empty-rolls">Sin tiradas aún en esta campaña.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { rollDice, subscribeToDiceRolls } from '../services/diceService'

const props = defineProps({
  campaignId: { type: String, required: true },
  userName: { type: String, default: 'Jugador' }
})

const authStore = useAuthStore()
const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100]

const modifier = ref(0)
const rolling = ref(false)
const rolls = ref([])
let unsubscribe = null

const handleRoll = async (diceType) => {
  if (!props.campaignId || rolling.value) return
  rolling.value = true

  await rollDice({
    campaignId: props.campaignId,
    userId: authStore.user?.uid || 'anonimo',
    userName: props.userName,
    diceType,
    modifier: modifier.value || 0
  })

  rolling.value = false
}

onMounted(() => {
  if (props.campaignId) {
    unsubscribe = subscribeToDiceRolls(props.campaignId, (newRolls) => {
      rolls.value = newRolls
    })
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped>
.dice-roller-card {
  background: #1e272e;
  border: 1px solid #2f3542;
  border-radius: 12px;
  padding: 20px;
  color: #f3f4f6;
}

.dice-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.btn-dice {
  flex: 1;
  min-width: 45px;
  padding: 10px;
  background: #2f3542;
  color: #ff4757;
  border: 1px solid #ff475744;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dice:hover {
  background: #ff4757;
  color: white;
}

.modifier-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.modifier-group input {
  width: 70px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #353b48;
  background: #2f3542;
  color: white;
  text-align: center;
}

.divider {
  border: none;
  border-top: 1px solid #2f3542;
  margin: 15px 0;
}

.rolls-feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.roll-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2f3542;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.88rem;
}

.roll-item.is-crit {
  border-left: 4px solid #2ed573;
  background: #2ed57315;
}

.roll-item.is-fail {
  border-left: 4px solid #ff4757;
  background: #ff475715;
}

.roll-type {
  color: #a4b0be;
  margin-left: 6px;
}

.raw-roll { color: #a4b0be; }
.mod-roll { color: #eccc68; margin: 0 3px; }
.total-roll { font-weight: bold; font-size: 1.05rem; margin-left: 5px; color: #ff4757; }
.empty-rolls { font-size: 0.85rem; color: #718093; text-align: center; }
</style>