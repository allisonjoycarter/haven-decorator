import { defineStore } from 'pinia'

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore('main', {
  // a function that returns a fresh state
  state: () => ({
    darkMode: false,
  }),
  // optional getters
  getters: {
  },
  // optional actions
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    },
  },
})