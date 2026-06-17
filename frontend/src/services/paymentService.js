import api from '../lib/axios'

const BASE = '/api/v1/payments'

export const paymentService = {
  getAll(params = {}) {
    return api.get(BASE, { params }).then((r) => r.data)
  },

  getById(id) {
    return api.get(`${BASE}/${id}`).then((r) => r.data)
  },

  create(data) {
    return api.post(BASE, data).then((r) => r.data)
  },

  update(id, data) {
    return api.put(`${BASE}/${id}`, data).then((r) => r.data)
  },

  remove(id) {
    return api.delete(`${BASE}/${id}`)
  },

  // GET /api/v1/payments/overdue — membres sans paiement pour le mois courant
  getOverdue() {
    return api.get(`${BASE}/overdue`).then((r) => r.data)
  },

  // GET /api/v1/members/{id}/payments — historique d'un membre
  getMemberHistory(memberId, params = {}) {
    return api.get(`/api/v1/members/${memberId}/payments`, { params }).then((r) => r.data)
  },
}
