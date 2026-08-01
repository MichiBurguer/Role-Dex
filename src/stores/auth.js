// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  // Guarda la información del usuario conectado
  const user = ref(null)
  const loading = ref(true) // Saber si Firebase está verificando la sesión inicial

  // Propiedades
  const isAuthenticated = computed(() => user.value !== null)
  const userDisplayName = computed(() => user.value?.displayName || 'Aventurero')

  // Escucha los cambios de estado en Firebase (si entra, sale o recarga la página)
  const initAuthListener = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        loading.value = false
        resolve(currentUser)
      })
    })
  }

  // limpiar el usuario al cerrar sesión
  const clearUser = () => {
    user.value = null
  }

  return {
    user,
    loading,
    isAuthenticated,
    userDisplayName,
    initAuthListener,
    clearUser
  }
})