import { defineStore } from 'pinia'

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore('main', {
  persist: {
    storage: persistedState.localStorage,
  },
  state: () => ({
    viewedNotifications: [] as string[]
  }),
  // optional getters
  getters: {
  },
  // optional actions
  actions: {
    closeNotification(id: string) {
      this.viewedNotifications.push(id)
    }
  },
})