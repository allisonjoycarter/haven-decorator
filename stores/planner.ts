import { defineStore } from 'pinia'
import type { PlacedItem } from '~/models/placed_item'
import type PlannerState from '~/models/planner_state'

export const usePlannerStore = defineStore('planner', {
  persist: {
    storage: persistedState.localStorage,
  },
  // a function that returns a fresh state
  state: () => ({
    maps: Array<PlannerState>()
  }),
  // optional getters
  getters: {
  },
  // optional actions
  actions: {
    updateTileData(payload: { map: string, key: string, data: PlaceableTile }) {
      const index = this.maps.findIndex(state => state.mapName === payload.map)
      this.maps[index].tileData[payload.key] = payload.data
    },
    setTileData(payload: { map: string, tileData: Map<string, PlaceableTile> }) {
      const index = this.maps.findIndex(state => state.mapName === payload.map)
      if (index >= 0) {
        this.maps[index].tileData = payload.tileData
      } else {
        this.maps.push({
          mapName: payload.map,
          tileData: payload.tileData,
          subtileData: []
        })
      }
    },
    updateSubtileData(payload: { map: string, subtileIndex: number, data: PlacedItem }) {
      const index = this.maps.findIndex(state => state.mapName === payload.map)
      if (index >= 0) {
        this.maps[index].subtileData[payload.subtileIndex] = payload.data
      } else {
        this.maps.push({
          mapName: payload.map,
          tileData: new Map<string, PlaceableTile>(),
          subtileData: [payload.data]
        })
      }
    },
    addSubtileData(payload: { map: string, data: PlacedItem }) {
      const index = this.maps.findIndex(state => state.mapName === payload.map)
      if (index >= 0) {
        this.maps[index].subtileData.push(payload.data)
      } else {
        this.maps.push({
          mapName: payload.map,
          tileData: new Map<string, PlaceableTile>(),
          subtileData: [payload.data]
        })
      }
    },
    setSubtileData(payload: { map: string, subtileData: PlacedItem[] }) {
      const index = this.maps.findIndex(state => state.mapName === payload.map)
      if (index >= 0) {
        this.maps[index].subtileData = payload.subtileData
      } else {
        this.maps.push({
          mapName: payload.map,
          tileData: new Map<string, PlaceableTile>(),
          subtileData: payload.subtileData
        })
      }
    }
  },
})