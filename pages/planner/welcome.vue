<template>
  <div class="flex flex-col">
    <PlannerNav />
    <div class="flex flex-col w-1/2 mx-auto">
      <div class="elevated-card my-4">
        <h2 class="text-lg font-semibold">Welcome to the Planner!</h2>
        <p>Here's some useful information to get started:</p>
        <ul class="list-disc ml-6">
          <li>Saves locally every 30 seconds, navigating away or refreshing before then will lose your recent progress!</li>
          <li>Select a building, crop, or path from the tool menu</li>
          <li>Left Click & Drag to measure or place crops & paths</li>
          <li>Right Click & Drag to erase</li>
          <li>Ctrl + Z will undo ONE action</li>
          <li>Anything turned grayscale will be erased by your action</li>
        </ul>
      </div>
      <div class="elevated-card my-4">
        <h2 class="text-lg font-semibold">Navigating</h2>
        <p>You can move around the map with WASD or the arrow keys. The movement is a bit awkward because it relies on how each browser handles scrolling. 
          Clicking the middle mouse button is my recommended way to move around quickly. You can also zoom the webpage out (with CTRL + scroll or CMD + scroll).
        </p>
      </div>
      <div class="elevated-card my-4">
        <h2 class="text-lg font-semibold">Saving</h2>
        <p>All maps are saved locally on your current browser every 30 seconds. Refreshing or clicking away will 
          reset your state to the last local save. Clicking Save > Save Config will allow you to download a file representing
          your current map configuration. This file can be shared or moved and loading it will restore what was in your
            planner at that time. 
        </p>
      </div>
      <div class="elevated-card my-4">
        <h2 class="text-lg font-semibold">Future Ideas</h2>
        <p>Even though I felt the current setup is enough to deploy, here are some things I'm working on or thinking about adding!</p>
        <ul class="list-disc ml-6">
          <li>More accurate building sizing & collidable size</li>
          <li>Right click to change building skins or tiers</li>
          <li>Filter items by region</li>
          <li>Prevent placing on water, cliffs, etc</li>
          <li>Full undo/redo capabilty</li>
          <li>Apply current house customization to the house in planner</li>
          <li>Totems & Scarecrows with ranges</li>
          <li>Optimizations for speed</li>
          <li>Mobile Support</li>
          <li>Add Decorations & Furniture</li>
          <li>Section & Building Naming</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>
