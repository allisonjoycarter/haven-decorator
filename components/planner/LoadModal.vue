<template>
  <Modal
    @clicked-outside-modal="close"
  >
      <label for="loadfile" class="
        relative flex flex-col gap-4 
        justify-center items-center 
        h-60 p-10 rounded-lg border-2 border-dashed border-gray-400
        hover:bg-gray-300 hover:dark:bg-gray-600  transition-colors duration-200
        "
        @drop="dropHandler"
        @dragover="dragOverHandler"
        >
        <span class="drop-title">Drop file here</span>
        or
        <input class="ml-6" type="file" accept="application/json" id="loadfile" @change="selectFile">
      </label>
    </Modal>
</template>

<script lang="ts" setup>

  const emit = defineEmits(['onFileSelected', 'onSaveConfig', 'onClose'])

  function selectFile(event: Event) {
    const files = (event.target as any).files;
    emit('onFileSelected', files.item(0))
  }

  function dragOverHandler(event: DragEvent) {
    event.preventDefault()
  }

  function dropHandler(event: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    if (event.dataTransfer?.items !== undefined) {
      // Use DataTransferItemList interface to access the file(s)
      [...event.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          emit('onFileSelected', item.getAsFile())
        }
      });
    }
  }

  function close() {
    emit('onClose')
  }

</script>

<style scoped>
</style>