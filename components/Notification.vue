<template>
<div v-if="canShow" class="fixed notification w-screen md:w-96 md:mx-4 bottom-0 left-0">
  <div class="drop-shadow-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-md flex flex-row mx-4 mb-4">
    <slot class="m-4 message"/>
    <button v-if="showClose" class="flex-grow-0 mx-2" @click="close">
      <Icon name="fa:close"/>
    </button>
  </div>
</div>
</template>


<script lang="ts" setup>

const store = useMainStore()
const props = defineProps<{
  notificationId: string,
  showClose?: boolean
}>()
const emit = defineEmits(['onAction'])

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
}
</style>
  
  