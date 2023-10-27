<template>
    <div>
      <div class="house-container">
      <img
        v-if="patioUrl !== undefined"
        transition="fade-transition"
        :src="patioUrl"
        class="tier-3-patio"
      />
      <img
        v-if="doorUrl !== undefined"
        transition="fade-transition"
        :src="doorUrl"
        class="tier-3-door"
      />
      <img
        v-if="wallsUrl !== undefined"
        transition="fade-transition"
        :src="wallsUrl"
        class="tier-3-walls"
      />
      <img
        v-if="windowsUrl !== undefined"
        transition="fade-transition"
        :src="windowsUrl"
        class="tier-3-windows"
      />
      <img
        v-if="roofUrl !== undefined"
        transition="fade-transition"
        :src="roofUrl"
        :class="{
          'tier-3-roof': true,
          'lower': lowerRoof
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
import { RoofExceptions } from "~/models/image_exceptions";


  const props = defineProps({
    roofName: String,
    roofUrl: String,
    wallsUrl: String,
    windowsUrl: String,
    doorUrl: String,
    patioUrl: String,
  })

  
  const lowerRoof = computed(() => {
    return RoofExceptions.lower.includes(props.roofName?.trim() ?? "")
  })
</script>

<style scoped>
.house-container {
  position: relative;
  image-rendering: crisp-edges;
  min-height: 500px;
  min-width: 580px;
}

.house-placeholder {
  filter: blur(4px);
}

.tier-3-patio {
  position: absolute;
  top: 170px;
  left: 30px;
  width: 540px;
  z-index: 0;
  image-rendering: crisp-edges;
}

.tier-3-walls {
  position: absolute;
  top: 182px;
  left: 65px;
  width: 470px;
  z-index: 1;
}

.tier-3-roof {
  position: absolute;
  top: 0;
  left: 50px;
  z-index: 5;
  width: 500px;
}

.tier-3-roof.lower {
  top: 10px;
}

.tier-3-windows {
  position: absolute;
  top: 117px;
  left: 84px;
  width: 433px;
  z-index: 6;
}

.tier-3-door {
  position: absolute;
  top: 240px;
  left: 266px;
  width: 70px;
  z-index: 5;
}

@media only screen and (max-width: 900px) {
  .house-container {
    position: relative;
    image-rendering: crisp-edges;
    min-height: 280px;
    min-width: 350px;
  }

  .house-placeholder {
    filter: blur(4px);
  }

  .tier-3-patio {
    position: absolute;
    top: 90px;
    left: 0;
    width: 350px;
    z-index: 0;
    image-rendering: crisp-edges;
  }

  .tier-3-walls {
    position: absolute;
    top: 108px;
    left: 35px;
    width: 280px;
    z-index: 1;
  }

  .tier-3-roof {
    position: absolute;
    top: 0;
    left: 25px;
    z-index: 5;
    width: 300px;
  }

  .tier-3-roof.lower {
    top: 5px;
  }

  .tier-3-windows {
    position: absolute;
    top: 70px;
    left: 45px;
    width: 260px;
    z-index: 6;
  }

  .tier-3-door {
    position: absolute;
    top: 144px;
    left: 154px;
    width: 43px;
    z-index: 5;
  }

}

</style>
