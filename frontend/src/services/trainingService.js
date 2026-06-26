import api from '../lib/axios'

const BASE = '/api/v1/trainings'

export const trainingService = {
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
}
