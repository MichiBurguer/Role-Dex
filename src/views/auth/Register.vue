<!-- src/views/auth/Register.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Unirse a <span class="brand">RoleDex</span></h2>
      <p class="subtitle">Crea tu cuenta de aventurero o Dungeon Master</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Nombre de Usuario / Nickname</label>
          <input 
            v-model="username" 
            type="text" 
            id="username" 
            placeholder="Ej. Gandalf33" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
            placeholder="aventurero@roledex.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>¿Ya tienes cuenta? <router-link to="/login">Inicia Sesión</router-link></p>
        <p><router-link to="/" class="back-link">← Volver al Inicio</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../../services/authService'

const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const router = useRouter()

const handleRegister = async () => {
  errorMessage.value = ''
  loading.value = true

  const result = await registerUser(email.value, password.value, username.value)

  if (result.success) {
    // Redirigir al panel principal o al login tras el registro exitoso
    router.push('/login')
  } else {
    // Traducir algunos errores
    if (result.error.includes('email-already-in-use')) {
      errorMessage.value = 'Este correo ya está registrado.'
    } else if (result.error.includes('weak-password')) {
      errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.'
    } else {
      errorMessage.value = 'Ocurrió un error al registrar la cuenta.'
    }
  }

  loading.value = false
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.auth-card {
  background: #1e272e;
  border: 1px solid #2f3542;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  color: #f3f4f6;
  text-align: center;
}

.brand {
  color: #ff4757;
  font-weight: bold;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-size: 0.85rem;
  color: #dcdde1;
}

input {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #353b48;
  background: #2f3542;
  color: white;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #ff4757;
}

.btn-primary {
  margin-top: 10px;
  padding: 12px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #e84118;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin: 0;
}

.auth-footer {
  margin-top: 25px;
  font-size: 0.9rem;
  color: #a4b0be;
}

.auth-footer a {
  color: #ff4757;
  text-decoration: none;
}

.back-link {
  display: inline-block;
  margin-top: 10px;
  color: #718093 !important;
  font-size: 0.85rem;
}
</style>