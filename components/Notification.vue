<template>
<div v-if="canShow" class="fixed notification mx-4 ">
  <div class="drop-shadow-lg bg-gray-300 dark:bg-gray-700 rounded-md flex flex-row">
    <p class="m-4 message">{{ text }}</p>
    <button class="flex-grow-0" @click="close">
      <Icon name="fa:close"/>
    </button>
  </div>
</div>
</template>


<script lang="ts" setup>

const store = useMainStore()
const props = defineProps<{
  notificationId: string,
  text: string
}>()
const isOpen = ref(true)

const canShow = computed(() => {
  return isOpen.value && !store.viewedNotifications.includes(props.notificationId)
})

function close() {
  isOpen.value = false
  store.closeNotification(props.notificationId)
}

</script>

<style scoped>

.message {
  width: 70vw;
}

.notification {
  z-index: 200;
  top: 80vh;
  width: 90vw;
}
</style>
  
  