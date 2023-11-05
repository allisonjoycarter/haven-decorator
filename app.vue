<template>
  <NuxtLayout>
    <NuxtPage />
    <Notification
      v-if="hasNotOptedCookies"
      notificationId="tracking-cookies"
      :showClose="false"
      >
      <div class="flex flex-col mx-auto p-4 gap-2">
        <p>
          We use tracking cookies to improve this website. This contains a random identifier to tell us 
          whether people return to the website or hate it and never visit again. To learn more, visit <NuxtLink to="/about">about</NuxtLink>.
        </p>
        <button class="btn-primary" @click="acceptCookies">Accept Cookies</button>
        <button class="btn-text" @click="declineCookies">Decline Cookies</button>
      </div>
    </Notification>
  </NuxtLayout>
</template>

<script setup lang="ts">

const { $posthog } = useNuxtApp()
const store = useMainStore()

const hasNotOptedCookies = computed(() => {
  return $posthog !== undefined && !($posthog.has_opted_in_capturing() || $posthog.has_opted_out_capturing())
})

function acceptCookies() { 
  if ($posthog !== undefined) {
    $posthog.opt_in_capturing()
    store.closeNotification("tracking-cookies")
  }
}

function declineCookies () {
  if ($posthog !== undefined) {
    $posthog.opt_out_capturing()
    store.closeNotification("tracking-cookies")
  }
}

</script>
