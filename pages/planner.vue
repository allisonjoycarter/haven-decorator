<template>
  <NuxtPage :map="$route.id" />
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Planner - Haven Decorator',
  ogTitle: 'Planner - Haven Decorator',
  description: 'View and edit a full gridded map from the Sun Haven game. Test out farm organizations, save them as an image, and view crops and buildings.',
  ogDescription: 'View and edit a full gridded map from the Sun Haven game. Test out farm organizations, save them as an image, and view crops and buildings.',
  ogImage: 'https://assets.havendecorator.com/decorations/Planner/planner_sample.png',
  image: 'https://assets.havendecorator.com/decorations/Planner/planner_sample.png',
  twitterCard: 'summary_large_image',
})

</script>
