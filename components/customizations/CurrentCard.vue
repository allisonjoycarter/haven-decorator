<template>
  <div class="elevated-card w-full">

    <h5 class="text-xl font-bold w-max mobile:hidden">Current Customization</h5>

    <button
      class="md:hidden w-full flex flex-row justify-between items-baseline"
      @click="toggleCardOpen()"
    >
      <h5 class="text-xl font-bold w-max">Current Customization</h5>
      <Icon name="fa:angle-down" :class="showFullCard ? 'transition rotate-180' : 'transition rotate-0'"/>
    </button>
    
    <div :class="{
      'max-h-0' : !showFullCard,
      'max-h-96': showFullCard,
      'md:max-h-96 overflow-hidden transition-[max-height] ease-in-out duration-200': true
    }">
      <p class="">Roof: {{ roof?.nameInGame }}</p>
      <p class="">Walls: {{ walls?.nameInGame }}</p>
      <p class="">Windows: {{ windows?.nameInGame }}</p>
      <p class="">Door: {{ door?.nameInGame }}</p>
      <p class="">Patio: {{ patio?.nameInGame }}</p>
      <button class="btn-text" @click="saveCurrentSet" v-if="!isCurrentSaved">
        Save for Later
      </button>
      <button v-else class="btn-text" @click="removeFromSavedSets">
        Remove from Saved
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import type { SunHavenImage } from '~/models/image'

  const props = defineProps<{
    roof?: SunHavenImage,
    walls?: SunHavenImage,
    windows?: SunHavenImage,
    door?: SunHavenImage,
    patio?: SunHavenImage,
    isCurrentSaved?: boolean,
  }>()
  const emit = defineEmits(['saveCurrentSet', 'removeFromSavedSets'])

  const isProcessing = ref(false)
  const showFullCard = ref(false)

  function toggleCardOpen() {
    if (!isProcessing.value) {
      isProcessing.value = true;
      setTimeout(() => {
        showFullCard.value = !showFullCard.value;
        isProcessing.value = false;
      }, 100)
    }
  }

  function saveCurrentSet() {
    emit('saveCurrentSet')
  }

  function removeFromSavedSets() {
    emit('removeFromSavedSets')
  }

</script>

<style scoped>
.gallery-container{
  height: 30vh;
  overflow-y: scroll;
}

.selected {
  background: rgba(var(--v-theme-primary), .1);
  border: 1px solid var(--v-theme-primary);
  border-radius: 4px;
}

</style>