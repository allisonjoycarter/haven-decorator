import { defineStore } from 'pinia'
import type { CustomSet } from '~/models/custom_set'

const findMostFrequent = (str = '', num = 1) => {
  const strArr = str.split(' ');
  const map = {} as any;
  strArr.forEach(word => {
     if(map.hasOwnProperty(word)){
        map[word]++;
     }else{
        map[word] = 1;
     }
  });
  const frequencyArr = Object.keys(map).map(key => [key, map[key]]);
  frequencyArr.sort((a, b) => b[1] - a[1]);
  return frequencyArr.slice(0, num).map(el => el[0]);
};

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useCustomizationsStore = defineStore('customizations', {
  persist: {
    storage: persistedState.localStorage,
  },
  // a function that returns a fresh state
  state: () => ({
    savedSets: Array<CustomSet>(),
    currentSet: undefined as CustomSet|undefined,
  }),
  // optional getters
  getters: {
  },
  // optional actions
  actions: {
    addSavedSet (value: CustomSet) {
      const allNames = [
        value.door.nameInGame,
        value.roof.nameInGame,
        value.patio.nameInGame,
        value.windows.nameInGame,
        value.walls.nameInGame
      ]
      const commonNames = findMostFrequent(allNames.join(" "), 5).filter((text) => text !== "")
      let name = commonNames.slice(0, 2).join(" ")

      let count = this.savedSets.filter((set) => set.name !== undefined && set.name.includes(name)).length
      if (count !== 0) {
        name += ` ${(count + 1).toString()}`
      }
      
      value.name = name 
      this.savedSets.push(value)
    },
    deleteSavedSet (payload: string) {
      this.savedSets = this.savedSets.filter((set) => set.name != payload)
    },
    updateCurrentSet (payload: CustomSet) {
      this.currentSet = payload
    }
  },
})