<template>
  <NuxtPage :map="$route.id" />
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Haven Decorator - Planner',
  ogTitle: 'Haven Decorator - Planner',
  description: 'Test out farm organizations!',
  ogDescription: 'Test out farm organizations!',
  ogImage: 'https://assets.havendecorator.com/decorations/Planner/planner_sample.png',
  twitterCard: 'summary',
})

</script>
