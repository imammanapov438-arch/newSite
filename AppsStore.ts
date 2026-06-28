import { makeAutoObservable } from 'mobx'
import type { App } from '../types'
import { fetchApps } from '../api'

class AppsStore {
  apps: App[] = []
  isLoading: boolean = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async loadApps(): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const data = await fetchApps()
      this.apps = data
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Неизвестная ошибка'
    } finally {
      this.isLoading = false
    }
  }
}

export const appsStore = new AppsStore()