<template>
  <div class="bg-container">
    <div>
      <div>
        <div class="elevated-card">
          <h3 class="text-xl font-semibold">About</h3>
          <div>
            <p>
              This is a pet project designed to make trying out new house customization options fun and easy.
               Normally you can find me working on the <a href="https://sun-haven.fandom.com/wiki/Sun_Haven_Wiki" target="_blank">Sun Haven Wiki</a>,
                but it doesn't allow for interactive setups like this website. Eventually I'd like to expand this to preview 
              other kinds of decorating, but those would be much more expansive additions. I hope you enjoy!
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
            All saved data is stored locally in your browser. Only light/dark mode and the names of selected customizations are saved. To delete these, look for an option to "Clear Site Data" or clear your local storage.
          </p>
        </div>
      </div>
      
        <div>
          <div class="my-4 elevated-card">
            <h3 class="text-xl font-semibold">Analytics</h3>
            <div>
              This website collects data to track page views, button clicks, and other relevant data to 
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
  description: 'Haven Decorator was made with love - or at least - not hate. Oh, and Monster Fruit. Lots of Monster Fruit.',
  ogDescription: 'Haven Decorator was made with love - or at least - not hate. Oh, and Monster Fruit. Lots of Monster Fruit.',
  ogImage: 'https://assets.havendecorator.com/decorations/sample_house.png',
  twitterCard: 'summary',
})

</script>
