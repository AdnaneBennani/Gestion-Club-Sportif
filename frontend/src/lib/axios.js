import axios from 'axios'

const TOKEN_KEY = 'auth_token'

const api = axios.create({
  // baseURL vide = chemins relatifs, proxy Vite forward /api/* → Laravel :8000
  baseURL: import.meta.env.VITE_API_URL ?? '',
  // Token Bearer uniquement — pas de cookie session, pas de CSRF
})

// ── Request interceptor ───────────────────────────────────────────────────────
// Injecte le Bearer token à chaque requête sortante, même après un rechargement
// de page (AuthContext re-initialise api.defaults, mais cet intercepteur sert
// de filet de sécurité si une requête part avant que le contexte soit prêt).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor ──────────────────────────────────────────────────────
// Sur 401 : token expiré ou révoqué côté serveur.
// On purge le localStorage et on redirige vers /login sans passer par React Router
// (l'intercepteur vit en dehors de l'arbre React).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      // Évite une boucle si on est déjà sur /login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
