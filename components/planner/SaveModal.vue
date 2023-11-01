<template>
  <Modal @clickedOutsideModal="close">
    <div class="flex flex-col flex-grow-0">
      <slot/>
      <button @click="save" class="btn-primary flex-grow-0">Save</button>
    </div>
  </Modal>
</template>

<script lang="ts" setup>

  const emit = defineEmits(['onSave', 'onClose'])

  function save() {
    emit('onSave')
  }

  function close() {
    emit('onClose')
  }

</script>

<style scoped>
</style>