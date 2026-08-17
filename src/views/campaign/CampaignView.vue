<!-- src/views/campaign/CampaignView.vue -->
<template>
  <div class="campaign-view-wrapper">
    <!-- Pantalla de Carga -->
    <div v-if="loading" class="state-card">
      <p>Verificando rol en la campaña...</p>
    </div>

    <!-- Si la campaña no existe -->
    <div v-else-if="notFound" class="state-card">
      <h2>Campaña no encontrada</h2>
      <p>La campaña solicitada no existe o no tienes acceso a ella.</p>
      <router-link to="/dashboard" class="btn-back">← Volver al Dashboard</router-link>
    </div>

    <!-- Consola DM para el creador -->
    <DmDashboard v-else-if="isDm" :campaignId="campaignId" />

    <!-- Ficha de Personaje para los jugadores -->
    <CharacterSheet v-else :campaignId="campaignId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getCampaignById } from '../../services/campaignService'
import DmDashboard from './DmDashboard.vue'
import CharacterSheet from '../character/CharacterSheet.vue'

const route = useRoute()
const authStore = useAuthStore()

const campaignId = route.params.campaignId
const isDm = ref(false)
const loading = ref(true)
const notFound = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    if (authStore.loading && typeof authStore.initAuthListener === 'function') {
      await authStore.initAuthListener()
    }

    const campaign = await getCampaignById(campaignId)

    if (!campaign) {
      notFound.value = true
      return
    }

    isDm.value = campaign.dmId === authStore.user?.uid
  } catch (error) {
    console.error("Error al verificar rol de campaña:", error)
    notFound.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.campaign-view-wrapper {
  min-height: 80vh;
}

.state-card {
  text-align: center;
  color: #f3f4f6;
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.btn-back {
  color: #ff4757;
  text-decoration: none;
  font-weight: bold;
}

.btn-back:hover {
  text-decoration: underline;
}
</style>