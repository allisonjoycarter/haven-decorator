<template>
  <div>
    <Notification 
      class="md:hidden"
      notificationId="mobile-planner-unavailable"
      :showClose="true"
      >
      <p class="p-4">This planner is not supported on mobile yet. This is something that could be added in the future, but for now it will not function as expected on small devices.</p>
    </Notification>
    <div class="flex flex-row gap-4 ml-4">
      <NuxtLink 
        v-for="(map, index) in plannerAreas"
        :key="index"
        :class="{'no-underline btn-text': true, 'active': map.route === $route.path }"
        :to="map.route">
        {{ map.name }}
    </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
const plannerAreas = [
  { name: "Welcome", route: "/planner/welcome" },
  { name: "Sun Haven Farm", route: "/planner/sun-haven-farm" },
  { name: "Nel'Vari Farm", route: "/planner/nelvari-farm" },
  { name: "Withergate Farm", route: "/planner/withergate-farm" },
  { name: "Workshop", route: "/planner/workshop" },
]

function goToPlannerArea(route: string) {
  navigateTo(route)
}

</script>
