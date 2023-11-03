<template>
  <div class="bg-container">
    <div class="flex flex-row flex-wrap">
      <CustomizationsAssembledHouse
        :roofUrl="roof !== undefined ? blobURL + roof.filename : undefined"
        :roofName="roof?.nameInGame ?? ''"
        :wallsUrl="walls !== undefined ? blobURL + walls.filename : undefined"
        :windowsUrl="windows !== undefined ? blobURL + windows.filename : undefined"
        :doorUrl="door !== undefined ? blobURL + door.filename : undefined"
        :patioUrl="patio !== undefined ? blobURL + patio.filename : undefined"
      ></CustomizationsAssembledHouse>
      <div class="flex-grow md:mt-12">
        <CustomizationsCurrentCard
          :roof="roof"
          :walls="walls"
          :windows="windows"
          :door="door"
          :patio="patio"
          :is-current-saved="savedAsName !== undefined"
          @remove-from-saved-sets="removeFromSavedSets"
          @save-current-set="saveCurrentSet"
        />
        <div v-if="savedSets.length > 0" class="mt-4 elevated-card">
          <h5 class="mb-2 text-xl font-bold">Saved</h5>
          <div>
            <button 
              v-for="set in savedSets"
              class="btn-primary mr-2 mb-2"
              @click="loadSavedSet(set)"
              >
              {{set.name}}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-8">
      <button 
        @click="selectRandom"
        class="btn-primary sticky md:static z-20 bottom-6 right-8"
      >
        Shuffle
        <Icon name="fa:random" />
      </button>
      <div class="elevated-card mt-2 p-1">
        <div>
          <div class="flex flex-row overflow-x-scroll">
            <button 
              v-for="(tabname, index) in tabs"
              :key="tabname"
              :class="{
                'm-2 btn-text': true,
                'active': index === tab,
              }"
              @click="tab = index"
              >
              {{ tabname }}
            </button>
          </div>
          <div>
            <div v-show="tab === 0">
              <ClickableItemGallery
                category="Roofs"
                normalizedname="Roof"
                tier="3"
                ref="roofComponent"
                :images="roofImages"
                :selected-image-name="roof?.nameInGame"
                @selected-image="onRoofSelected"
              />
            </div>
            <div v-show="tab === 1">
              <ClickableItemGallery
                category="Walls"
                normalizedname="Walls"
                tier="3"
                ref="wallComponent"
                :images="wallImages"
                :selected-image-name="walls?.nameInGame"
                @selected-image="onWallsSelected"
              />
            </div>
            <div v-show="tab === 2">
              <ClickableWindowsGallery
                category="Windows"
                normalizedname="Windows"
                tier="3"
                ref="windowComponent"
                :images="windowImages"
                :selected-image-name="windows?.nameInGame"
                @selected-image="onWindowsSelected"
              />
            </div>
            <div v-show="tab === 3">
              <ClickableItemGallery
                category="Doors"
                normalizedname="Door"
                width-class="w-20"
                mobile-width-class="w-1/4"
                tier="3"
                ref="doorComponent"
                :images="doorImages"
                :selected-image-name="door?.nameInGame"
                @selected-image="onDoorSelected"
              />
            </div>
            <div v-show="tab === 4">
              <ClickableItemGallery
                category="Patios"
                normalizedname="Patio"
                tier="1"
                ref="patioComponent"
                image-width="180"
                :images="patioImages"
                :selected-image-name="patio?.nameInGame"
                @selected-image="onPatioSelected"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { AnonymousCredential, BlobServiceClient } from "@azure/storage-blob";
import type { CustomSet } from "~/models/custom_set";
import type { SunHavenImage } from "~/models/image";

useSeoMeta({
  title: 'Haven Decorator - Customizer',
  ogTitle: 'Haven Decorator - Customizer',
  description: 'Try out tier 3 house customizations from the Hardware Store!',
  ogDescription: 'Try out tier 3 house customizations from the Hardware Store!',
  ogImage: 'https://farmdecoratorassets.blob.core.windows.net/decorations/sample_house.png',
  twitterCard: 'summary',
})


const store = useCustomizationsStore()
const blobURL =
  "https://farmdecoratorassets.blob.core.windows.net/decorations/";

const tab = ref(0);
const tabs = ["Roofs", "Walls", "Windows", "Doors", "Patios"];

const patioImages = ref([] as Array<SunHavenImage>)
const roofImages = ref([] as Array<SunHavenImage>)
const wallImages = ref([] as Array<SunHavenImage>)
const windowImages = ref([] as Array<SunHavenImage>)
const doorImages = ref([] as Array<SunHavenImage>)

const patio = ref(undefined as SunHavenImage | undefined)
const roof = ref(undefined as SunHavenImage | undefined)
const windows = ref(undefined as SunHavenImage | undefined)
const door = ref(undefined as SunHavenImage | undefined)
const walls = ref(undefined as SunHavenImage | undefined)

// lifecycle hooks
onMounted(() => {
  if (store.currentSet !== undefined) {
    loadSavedSet(store.currentSet)
  }
  loadImages();
});

async function loadImages() {
  const blobServiceClient = new BlobServiceClient(
    "https://farmdecoratorassets.blob.core.windows.net",
    new AnonymousCredential()
  );

  // create container client
  const containerClient = blobServiceClient.getContainerClient("decorations");

  for (const customizationType of tabs) {
    const listOptions = {
      includeMetadata: false,
      includeSnapshots: false,
      includeTags: false,
      includeVersions: false,
      prefix: customizationType,
    };
    const imageNames = containerClient.listBlobsFlat(listOptions);

    var item = (await imageNames.next()).value;
    var foundImages = [];
    while (item !== undefined) {
      if (item.name.includes("3") || item.name.includes("Patio1")) {
        foundImages.push({
          nameInGame: item.name
            .replace(customizationType + "/", "")
            .split(customizationType.replace("s", ""))[0].trim(),
          filename: item.name,
        });
      }
      item = (await imageNames.next()).value;
    }

    if (customizationType.includes("Door")) {
      doorImages.value = foundImages
    } else if (customizationType.includes("Roof")) {
      roofImages.value = foundImages
    } else if (customizationType.includes("Patio")) {
      patioImages.value = foundImages
    } else if (customizationType.includes("Window")) {
      windowImages.value = foundImages
    } else if (customizationType.includes("Wall")) {
      wallImages.value = foundImages
    }
  }

  if (store.currentSet === undefined) {
    selectRandom()

    store.updateCurrentSet({
      name: undefined,
      roof: roof.value as SunHavenImage,
      windows: windows.value as SunHavenImage,
      walls: walls.value as SunHavenImage,
      door: door.value as SunHavenImage,
      patio: patio.value as SunHavenImage,
    })

    
  }
}

function selectRandom() {
  onDoorSelected(doorImages.value[getRandomArbitrary(0, doorImages.value.length)])
  onRoofSelected(roofImages.value[getRandomArbitrary(0, roofImages.value.length)])
  onWallsSelected(wallImages.value[getRandomArbitrary(0, wallImages.value.length)])
  onPatioSelected(patioImages.value[getRandomArbitrary(0, patioImages.value.length)])
  onWindowsSelected(windowImages.value[getRandomArbitrary(0, windowImages.value.length)])
}

function loadSavedSet(set: CustomSet) {
  onDoorSelected(set.door)
  onRoofSelected(set.roof)
  onWallsSelected(set.walls)
  onWindowsSelected(set.windows)
  onPatioSelected(set.patio)
}

function onPatioSelected(image: SunHavenImage) {
  patio.value = image;

  let set = store.currentSet
  if (set !== undefined && image !== undefined) {
    set.patio = image
    store.updateCurrentSet(set)
  }
}

function onRoofSelected(image: SunHavenImage) {
  roof.value = image;
  
  let set = store.currentSet
  if (set !== undefined && image !== undefined) {
    set.roof = image
    store.updateCurrentSet(set)
  }
}

function onWindowsSelected(image: SunHavenImage) {
  windows.value = image;
  
  let set = store.currentSet
  if (set !== undefined && image !== undefined) {
    set.windows = image
    store.updateCurrentSet(set)
  }
}

function onDoorSelected(image: SunHavenImage) {
  door.value = image;
  
  let set = store.currentSet
  if (set !== undefined && image !== undefined) {
    set.door = image
    store.updateCurrentSet(set)
  }
}

function onWallsSelected(image: SunHavenImage) {
  walls.value = image;
  
  let set = store.currentSet
  if (set !== undefined && image !== undefined) {
    set.walls = image
    store.updateCurrentSet(set)
  }
}

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function saveCurrentSet() {
  store.addSavedSet({
    name: undefined,
    roof: roof.value as SunHavenImage,
    windows: windows.value as SunHavenImage,
    walls: walls.value as SunHavenImage,
    door: door.value as SunHavenImage,
    patio: patio.value as SunHavenImage,
  })
}

function removeFromSavedSets() {
  if (savedAsName.value !== undefined) {
    store.deleteSavedSet(savedAsName.value)
  }
}

const savedSets = computed(() => {
  return store.savedSets
})

const savedAsName = computed(() => {
  const savedSet = store.savedSets.find((saved) => 
    saved.roof == roof.value 
    && saved.door == door.value 
    && saved.walls == walls.value
    && saved.windows == windows.value
    && saved.patio == patio.value)
  return savedSet?.name
})

const currentSet = computed(() => {
  return store.currentSet
})

const isMobileSize = computed(() => {
  return false;
})

</script>

<style scoped>

</style>
