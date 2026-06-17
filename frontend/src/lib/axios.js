import axios from 'axios'

const api = axios.create({
  // baseURL vide = chemins relatifs, proxy Vite forward /api/* → Laravel :8000
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
  withXSRFToken: true,
})

export default api
