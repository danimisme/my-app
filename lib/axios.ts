import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://6a2bb86c3e2b60ab038eb30a.mockapi.io/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

export default apiClient
