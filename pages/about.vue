<template>
  <div class="bg-container">
    <div>
      <div>
        <div class="elevated-card">
          <h3 class="text-xl font-semibold">About</h3>
          <div>
            <p>
              Haven Decorator is a pet project started to preview house customization options in Sun Haven. Since then, I've
              been slowly adding to it, creating a farm layout planner. Normally you can find me working on the <a href="https://sun-haven.fandom.com/wiki/Sun_Haven_Wiki" target="_blank">Sun Haven Wiki</a>,
                but it doesn't allow for interactive setups like this website. Eventually I'd like to expand this to preview 
              house decorating and more. I hope you enjoy!
            </p>
            <p>
              - Doubleterrainbow
            </p>
          </div>
        </div>
      </div>
      <div class="elevated-card mt-4">
        <div class="mx-auto">
          <h3 class="text-xl font-semibold">Images Copyright</h3>
          <p>
            All images are from <a href="https://store.steampowered.com/app/1432860/Sun_Haven/" target="_blank">Sun Haven</a> or from websites created and owned by <a href="https://linktr.ee/PixelSproutStudios" target="_blank">Pixel Sprout Studios</a>, who hold the copyright of Sun Haven.
          </p>
        </div>
      </div>
      <div class="elevated-card my-4">
        <div class="mx-auto">
          <h3 class="text-xl font-semibold">Data</h3>
          <p>
            All saved data is stored locally in your browser, or saved to a file if using the planner. If you encounter any strange behavior or issues on the website, clearing this data is a good remedy. 
            To delete these, look for an option to "Clear Site Data" or clear your local storage. Besides analytics events, no data is sent to any server. 
          </p>
        </div>
      </div>
      <div>
        <div class="my-4 elevated-card">
          <h3 class="text-xl font-semibold">Cookies</h3>
          <div>
            Cookies are used to determine whether people are returning to the website or only using it once 
            and never again. The cookie contains a random identifier and some device information (i.e. mobile or desktop).
            This does NOT gather personal or identifying information, and only communicates the amount of returning users. 
          </div>
        </div>
      </div>
      <div>
        <div class="my-4 elevated-card">
          <h3 class="text-xl font-semibold">Analytics</h3>
          <div>
            This website collects data to track page views, button clicks, and other relevant information to 
            understand usage and performance. We use PostHog to track this data so we can 
            improve this website. To see more details, go to the <a href="/privacy-policy">Privacy Policy</a>. 
            For questions about this policy, contact doubleterrainbow@gmail.com  
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'About Haven Decorator',
  ogTitle: 'About Haven Decorator',
  description: 'Haven Decorator is a fan-made website for Sun Haven made with love - or at least - not hate. Oh, and Monster Fruit. Lots of Monster Fruit.',
  ogDescription: 'Haven Decorator is a fan-made website for Sun Haven made with love - or at least - not hate. Oh, and Monster Fruit. Lots of Monster Fruit.',
  ogImage: 'https://farmdecoratorassets.blob.core.windows.net/decorations/sample_house.png',
  twitterCard: 'summary',
})

</script>
