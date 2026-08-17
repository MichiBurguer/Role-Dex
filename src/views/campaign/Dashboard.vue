<!-- src/views/campaign/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- Encabezado del Panel -->
    <header class="dashboard-header">
      <div>
        <h1>Hola, <span class="brand">{{ authStore.userDisplayName }}</span></h1>
        <p class="subtitle">Bienvenido al dashboard de RoleDex</p>
      </div>
      <button @click="handleLogout" class="btn btn-logout">Cerrar Sesión</button>
    </header>

    <!-- Barra de Acciones: Crear o Unirse a Campaña -->
    <section class="actions-section">
      <div class="action-card">
        <h3>Unirse a una Campaña</h3>
        <p>Introduce el código de 6 caracteres proporcionado por tu DM:</p>
        <div class="inline-form">
          <input 
            v-model="inviteCode" 
            type="text" 
            placeholder="Ej. ELD789" 
            maxlength="6"
          />
          <button @click="handleJoinCampaign" class="btn btn-primary" :disabled="joining">
            {{ joining ? 'Uniéndose...' : 'Unirse' }}
          </button>
        </div>
      </div>

      <div class="action-card">
        <h3>Crear Nueva Campaña</h3>
        <p>Inicia una nueva aventura como Dungeon Master:</p>
        <button @click="showCreateModal = true" class="btn btn-secondary">
          + Crear Campaña
        </button>
      </div>
    </section>

    <!-- Mensajes de estado -->
    <p v-if="statusMessage" :class="['status-msg', isError ? 'error' : 'success']">
      {{ statusMessage }}
    </p>

    <hr class="divider" />

    <!-- Lista de Campañas -->
    <section class="campaigns-section">
      <h2>Tus Campañas Activas</h2>

      <div v-if="loadingCampaigns" class="loading">Cargando aventuras...</div>

      <div v-else-if="campaigns.length === 0" class="empty-state">
        <p>Aún no formas parte de ninguna campaña.</p>
        <p>¡Crea una nueva o únete usando un código de invitación!</p>
      </div>

      <div v-else class="campaigns-grid">
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.id" 
          class="campaign-card"
        >
          <div class="card-header">
            <h3>{{ campaign.name }}</h3>
            <span :class="['role-badge', campaign.dmId === authStore.user?.uid ? 'badge-dm' : 'badge-player']">
              {{ campaign.dmId === authStore.user?.uid ? 'DM' : 'Jugador' }}
            </span>
          </div>

          <p class="description">{{ campaign.description || 'Sin descripción disponible.' }}</p>

          <div class="card-footer">
            <span class="invite-tag">Código: <strong>{{ campaign.inviteCode }}</strong></span>
            <router-link :to="'/campaign/' + campaign.id" class="btn btn-small">
              Ver Campaña →
            </router-link>
            
          </div>
        </div>
      </div>
    </section>

    <!-- Modal para Crear Campaña -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>Crear Campaña</h3>
        <form @submit.prevent="handleCreateCampaign">
          <div class="form-group">
            <label>Nombre de la Campaña</label>
            <input v-model="newCampaignName" type="text" placeholder="Ej. La Mina Perdida" required />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="newCampaignDesc" placeholder="Breve resumen del escenario..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Guardando...' : 'Crear Aventura' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { logoutUser } from '../../services/authService'
import { createCampaign, joinCampaignByCode, getUserCampaigns } from '../../services/campaignService'

const authStore = useAuthStore()
const router = useRouter()

const campaigns = ref([])
const loadingCampaigns = ref(true)

const inviteCode = ref('')
const joining = ref(false)

const showCreateModal = ref(false)
const newCampaignName = ref('')
const newCampaignDesc = ref('')
const creating = ref(false)

const statusMessage = ref('')
const isError = ref(false)

const showMessage = (msg, error = false) => {
  statusMessage.value = msg
  isError.value = error
  setTimeout(() => { statusMessage.value = '' }, 4000)
}

const loadCampaigns = async () => {
  if (!authStore.user) return
  loadingCampaigns.value = true
  const res = await getUserCampaigns(authStore.user.uid)
  if (res.success) {
    campaigns.value = res.campaigns
  }
  loadingCampaigns.value = false
}

const handleJoinCampaign = async () => {
  if (!inviteCode.value) return
  joining.value = true
  const res = await joinCampaignByCode(inviteCode.value, authStore.user.uid)
  
  if (res.success) {
    showMessage('¡Te has unido con éxito a la campaña!')
    inviteCode.value = ''
    await loadCampaigns()
  } else {
    showMessage(res.error, true)
  }
  joining.value = false
}

const handleCreateCampaign = async () => {
  if (!newCampaignName.value) return
  creating.value = true
  const res = await createCampaign(newCampaignName.value, newCampaignDesc.value, authStore.user.uid)

  if (res.success) {
    showMessage('¡Campaña creada correctamente!')
    newCampaignName.value = ''
    newCampaignDesc.value = ''
    showCreateModal.value = false
    await loadCampaigns()
  } else {
    showMessage(res.error, true)
  }
  creating.value = false
}

const handleLogout = async () => {
  await logoutUser()
  authStore.clearUser()
  router.push('/')
}

onMounted(() => {
  loadCampaigns()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #f3f4f6;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 { margin: 0; font-size: 2.2rem; }
.brand { color: #ff4757; }
.subtitle { margin: 5px 0 0 0; color: #9ca3af; }

.actions-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.action-card {
  background: #1e272e;
  border: 1px solid #2f3542;
  border-radius: 10px;
  padding: 20px;
}

.action-card h3 { margin-top: 0; }
.action-card p { color: #a4b0be; font-size: 0.9rem; }

.inline-form {
  display: flex;
  gap: 10px;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #353b48;
  background: #2f3542;
  color: white;
  box-sizing: border-box;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #ff4757;
}

.btn {
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-primary { background: #ff4757; color: white; }
.btn-primary:hover { background: #e84118; }

.btn-secondary { background: #2ed573; color: #0c1013; }
.btn-secondary:hover { background: #26af5f; }

.btn-logout { background: #3a404d; color: white; }
.btn-logout:hover { background: #57606f; }

.btn-small { background: #2f3542; color: white; border: 1px solid #57606f; padding: 6px 12px; }
.btn-small:hover { background: #57606f; }

.divider { border: 0; height: 1px; background: #2f3542; margin: 30px 0; }

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.campaign-card {
  background: #1e272e;
  border: 1px solid #2f3542;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-dm { background: #ff4757; color: white; }
.badge-player { background: #1e90ff; color: white; }

.description { color: #a4b0be; font-size: 0.9rem; flex-grow: 1; margin: 15px 0; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invite-tag { font-size: 0.8rem; color: #718093; }

.empty-state, .loading {
  text-align: center;
  color: #718093;
  padding: 40px;
}

.status-msg {
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 10px;
  text-align: center;
}
.status-msg.success { background: #2ed57322; color: #2ed573; border: 1px solid #2ed573; }
.status-msg.error { background: #ff475722; color: #ff4757; border: 1px solid #ff4757; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal-content {
  background: #1e272e;
  border: 1px solid #2f3542;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 450px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel { background: transparent; color: #a4b0be; }
.btn-cancel:hover { color: white; }
</style>