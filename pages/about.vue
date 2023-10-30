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
              other kinds of decorating, but those would be much more expansive additions. At least for viewing the customizations, 
              I hope you enjoy!
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
      <!--
        <div>
          <div class="mb-8">
            <h3>Analytics</h3>
            <div>
              Analytics disclaimer
            </div>
          </div>
        </div>
      -->
    </div>
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Haven Decorator - About',
  ogTitle: 'Haven Decorator - About',
  description: 'Haven Decorator was made with love - or at least - not hate. Oh, and Monster Fruit. Lots of Monster Fruit.',
  ogDescription: 'Haven Decorator was made with love - or at least - not hate. Oh, and Monster Fruit. Lots of Monster Fruit.',
  ogImage: 'https://farmdecoratorassets.blob.core.windows.net/decorations/sample_house.png',
  twitterCard: 'summary',
})

</script>
