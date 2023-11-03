<template>
  <div class="overlay fixed top-0 right-0 w-screen h-screen bg-black bg-opacity-70" 
    @click="clickedOutside">
    <div class="modal w-min h-min p-5 mx-auto 
                mt-40 dark:bg-gray-700 bg-gray-100 drop-shadow-lg rounded-md" @click="(ev) => ev.stopPropagation()">
      <slot/>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'

  const emit = defineEmits(['clickedOutsideModal', ])

  function clickedOutside() {
    emit('clickedOutsideModal')
  }

</script>

<style scoped>
.overlay {
  z-index: 98;
}

.modal {
  z-index: 99;
}
</style>