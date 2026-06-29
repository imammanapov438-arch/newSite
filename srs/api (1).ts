import type { App } from './types'

const API_BASE_URL = 'http://localhost:4000/api'

export async function fetchApps(): Promise<App[]> {
  const response = await fetch(`${API_BASE_URL}/apps`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function fetchAppById(id: number): Promise<App> {
  const response = await fetch(`${API_BASE_URL}/apps/${id}`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function createApp(data: Omit<App, 'id'>): Promise<App> {
  const response = await fetch(`${API_BASE_URL}/admin/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function updateApp(id: number, data: Partial<App>): Promise<App> {
  const response = await fetch(`${API_BASE_URL}/admin/apps/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function deleteApp(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/apps/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE_URL}/admin/uploads`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const data = await response.json()
  return data.url
}