import api from '../lib/axios'

const BASE = '/api/v1/teams'

export const teamService = {
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

  // GET /teams/{id}/members — liste paginée des membres de l'équipe
  getMembers(id, params = {}) {
    return api.get(`${BASE}/${id}/members`, { params }).then((r) => r.data)
  },

  // POST /teams/{id}/members  { member_ids: [...] } → attache
  attachMembers(id, memberIds) {
    return api.post(`${BASE}/${id}/members`, { member_ids: memberIds }).then((r) => r.data)
  },

  // DELETE /teams/{id}/members  { member_ids: [...] } → détache
  detachMembers(id, memberIds) {
    return api.delete(`${BASE}/${id}/members`, { data: { member_ids: memberIds } }).then((r) => r.data)
  },
}
