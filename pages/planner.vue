<template>
  <Notification 
    notification-id="version110-update"
    :show-close="true"
  >
    <p class="p-4">Welcome to version 1.1.0! There's some changes to building hitboxes that may have moved them on your farm. 
      Sorry about that! You can right click buildings to move them. <NuxtLink to="/planner/welcome#updates">Changelog</NuxtLink></p>
  </Notification>
  <NuxtPage :page-key="route => route.fullPath" />
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Planner - Haven Decorator',
  ogTitle: 'Planner - Haven Decorator',
  description: 'Haven Decorator is a fan-made farm planner website to view and edit full gridded farm maps from the Sun Haven game. Test out farm organizations and save them as an image. You can place buildings, sheds, and crafting tables.',
  ogDescription: 'Haven Decorator is a fan-made farm planner website to view and edit a full gridded farm maps from the Sun Haven game. Test out farm organizations and save them as an image. You can place buildings, sheds, and crafting tables.',
  ogImage: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/planner_sample.png',
  twitterCard: 'summary_large_image',
})

</script>
