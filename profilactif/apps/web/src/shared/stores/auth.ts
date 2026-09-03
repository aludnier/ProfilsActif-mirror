import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService from '@/services/AuthService'
import { clearAuthToken, setAuthToken, getAuthToken } from '@/shared/api-client'
import type { PublicUser, SignupInput, LoginInput } from '@/shared/types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function initializeAuth() {
    const token = getAuthToken()
    if (token) {
      try {
        isLoading.value = true
        user.value = await AuthService.getMe()
      } catch (err: any) {
        clearAuthToken()
        user.value = null
      } finally {
        isLoading.value = false
      }
    }
  }

  async function signup(input: SignupInput) {
    isLoading.value = true
    error.value = null
    try {
      const response = await AuthService.signup(input)
      setAuthToken(response.token)
      user.value = response.user
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'inscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function login(input: LoginInput) {
    isLoading.value = true
    error.value = null
    try {
      const response = await AuthService.login(input)
      setAuthToken(response.token)
      user.value = response.user
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la connexion'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    clearAuthToken()
    user.value = null
    error.value = null
  }

  function updateUser(updates: Partial<PublicUser>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    initializeAuth,
    signup,
    login,
    logout,
    updateUser,
  }
})
