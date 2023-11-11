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
      <div class="elevated-card my-4" id="updates">
        <h2 class="text-lg font-semibold">Updates</h2>
        <p>Current Version: 1.1.0</p>
        <h3 class="text-md font-semibold">Version 1.1.0</h3>
        <ul class="list-disc ml-6">
          <li>Update collidable space on buildings (may affect previous layouts!)</li>
          <li>Can no longer place buildings on cliffs, trees, water, or any tile not buildable in game</li>
          <li>Can no longer place crops on cliffs, trees, water, or any tile not farmable in game</li>
          <li>Right click on sheds to select a skin</li>
          <li>Right click on house to apply customizations</li>
          <li>Added a red dashed outline to show area building takes up, can be hidden using the grid opacity slider</li>
          <li>Added a right click menu on buildings/trees/etc to delete and move. Moving removes skin/customization (this will be fixed in the future)</li>
          <li>Buildings are not erased by drags. Crop and paths are still removed using right click drag</li>
          <li>Fixed tree sizing</li>
        </ul>
      </div>
      <div class="elevated-card my-4">
        <h2 class="text-lg font-semibold">Future Ideas</h2>
        <p>Even though I felt the current setup is enough to deploy, here are some things I'm working on or thinking about adding!</p>
        <ul class="list-disc ml-6">
          <li>More accurate building sizing & collidable size</li>
          <li>Right click to change building tiers</li>
          <li>Filter items by region</li>
          <li>Full undo/redo capabilty</li>
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
