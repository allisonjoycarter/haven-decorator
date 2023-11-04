<template>
  <Modal @clickedOutsideModal="close">
    <div class="flex flex-col flex-grow-0">
      <div class="flex flex-row gap-4 my-2 justify-between">
        <span class="mt-2">Right click > Save Image As...</span>
        <!-- 
          TODO: Investigate CORS issues with this button
          <button @click="saveImage" class="btn-primary flex-grow-0 w-max">
          <Icon name="fa:image"/>&nbsp;Save Image</button>
        -->
        <button @click="saveConfig" class="btn-primary flex-grow-0 w-max">
          <Icon name="fa:code"/>&nbsp;Save Config
        </button>
      </div>
      <slot/>
    </div>
  </Modal>
</template>

<script lang="ts" setup>

  const emit = defineEmits(['onSaveImage', 'onSaveConfig', 'onClose'])

  function saveImage() {
    emit('onSaveImage')
  }

  function saveConfig() {
    emit('onSaveConfig')
  }

  function close() {
    emit('onClose')
  }

</script>

<style scoped>
</style>