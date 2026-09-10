import axios, { type AxiosInstance, type AxiosError } from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'authToken'

// Types d'erreurs API
export interface ApiErrorResponse {
  code: string
  message: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Instance Axios centralisée
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur requête : ajouter le token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur réponse : gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 0
    const data = error.response?.data

    // Créer une erreur standardisée
    const apiError = new ApiError(
      status,
      data?.code || 'UNKNOWN_ERROR',
      data?.message || error.message || 'Une erreur est survenue',
    )

    // Gérer les cas spécifiques
    if (status === 401) {
      // Token expiré ou absent : nettoyer et rediriger
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }

    if (status === 403) {
      // Accès refusé
      window.location.href = '/'
    }

    return Promise.reject(apiError)
  },
)

// Fonctions utilitaires
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  delete axiosInstance.defaults.headers.common.Authorization
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export default axiosInstance
