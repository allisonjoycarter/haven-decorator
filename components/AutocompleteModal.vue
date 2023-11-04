<template>
<Modal
  @clicked-outside-modal="clickedOutsideModal"
  >
  <h2 class="text-xl">{{ title }}</h2>
  <div class="modal-content grid grid-cols-4 overflow-y-scroll">
    <button
    v-for="(item, index) in items"
    :key="index"
    class="selectable-item w-44"
    @click="selectItem(item.name)"
    >
      <div class="flex flex-col justify-end items-center">
        <img v-if="item.image !== undefined" :src="item.image" class="pixelized max-h-36"/>
        <span>{{ item.name.replace("NelVari", "Nel'Vari") }}</span>
      </div>
    </button>
  </div>
</Modal>
</template>


<script lang="ts" setup>

const props = defineProps<{
  title: string,
  items: { name: string; image: string|undefined; }[]
}>()
const emit = defineEmits(['clickedOutsideModal', 'selectItem'])

function clickedOutsideModal() {
  emit('clickedOutsideModal')
}

function selectItem(name: string) {
  emit('selectItem', name)
}

</script>

<style scoped>

.modal-content {
  height: 50vh;
  width: 75vw;
}

.pixelized {
  min-width: 40px;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
}

</style>

