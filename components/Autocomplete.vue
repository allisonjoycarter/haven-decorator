<template>
  <div class="flex flex-col">
    <input type="text" v-focus
      class="p-2 rounded-md drop-shadow-lg
            border-2 border-gray-300 dark:border-gray-500
          bg-gray-100 dark:bg-gray-700 
            focus:ring-2 focus:ring-indigo-400 focus:dark:ring-indigo-800 
            outline-none
            "
      v-model="search"
      @input="searchOptions()"
      :placeholder="placeholder"
    />
    <div 
      class=" w-full pr-4 mt-1 dark:bg-gray-700 bg-gray-100 drop-shadow-lg rounded-md max-h-96 overflow-y-scroll">
      <div v-if="results.length === 0 && search !== ''">
        <p class="text-sm px-4 py-1">No results match your search.</p>
      </div>
      <div v-else>
        <slot name="resultsHeader"></slot>
        <button 
          class="selectable-item w-full z-50 flex flex-row gap-2 items-center"
          v-for="(option, index) in resultsOrPreview"
          :key="index"
          @click="selectOption(option.name)"
        >
          <img v-if="option.image !== undefined" :src="option.image" class="max-h-20">
          {{ option.name.replace("NelVari", "Nel'Vari") }}
        </button>
        <button
          v-if="hasMoreOptions" 
          class="selectable-item w-full z-50 flex flex-row gap-2 items-center text-sm font-semibold"
          @click="showOptionsModal = true"          
          >
          <Icon name="fa:table"/> See all options 
        </button>
      </div>
    </div>
    <AutocompleteModal
      v-if="hasMoreOptions && showOptionsModal"
      :items="options"
      :title="category"
      @clicked-outside-modal="showOptionsModal = false"
      @select-item="selectFromModal"
    >
    </AutocompleteModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'

  const props = defineProps<{
    category: string,
    options: {name: string, image: string|undefined}[],
    placeholder: string|undefined,
    previewOptions?: {name: string, image: string|undefined}[],
    hasMoreOptions?: boolean
  }>()
  const emit = defineEmits(['selected', 'seeAllOptions'])
  const search = ref('')
  const showOptionsModal = ref(false)
  const results = ref([] as {name: string, image: string|undefined}[])

  const resultsOrPreview = computed(() => {
    if (results.value.length > 0) {
      return results.value
    }
    return props.previewOptions ?? [] as {name: string, image: string|undefined}[]
  })

  const vFocus = {
    mounted: (el: HTMLInputElement) => el.focus(),
    created: (el: HTMLInputElement) => el.focus(),
    updated: (el: HTMLInputElement) => el.focus()
  }

  function selectOption(option: string) {
    emit('selected', option)
  }

  function selectFromModal(option: string) {
    showOptionsModal.value = false
    emit('selected', option)
  }

  function debounce<T extends unknown[]>(
    func: (...args: T) => void,
    delay: number,
  ):
    (...args: T) => void
  {
    let timer: NodeJS.Timeout | null = null;
    return (...args: T) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.call(null, ...args);
      }, delay);
    };
  }

  const searchOptions = debounce(() => {
    if (search.value == '') {
      results.value = props.options.slice(0, 5)
    } else {
      results.value = props.options.filter((item) => 
        item.name.toLowerCase().includes(search.value.toLowerCase())
      )
    }
  }, 200)
</script>

<style scoped>
</style>