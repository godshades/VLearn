<template>
  <NConfigProvider :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <NMessageProvider>
      <NLayout style="min-height: 100vh;">
        <NLayoutHeader bordered style="padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div class="header-left">
            <!-- Logo goes here -->
            <img src="@/assets/icon.png" alt="VietVocab Flow Logo" class="app-logo" />
            <h1 style="margin: 0; font-weight: 600;">VLearn</h1>
          </div>
          <LanguageSwitcher />
        </NLayoutHeader>

        <NLayoutContent style="padding: 24px;">
          <RouterView />
        </NLayoutContent>

        <NLayoutFooter bordered style="padding: 12px 24px; text-align: center;">
          © {{ new Date().getFullYear() }} VLearn - Learning Together |
          <a href="https://forms.gle/9epHsaPKVcGQwWC27" target="_blank" rel="noopener noreferrer" style="color: #18a058; text-decoration: none;">Contact Us</a>
        </NLayoutFooter>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter
} from 'naive-ui';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
</script>

<style>
/* Global styles. Add this to your App.vue style block or a global CSS file */
body {
  margin: 0;
  font-family: 'Lato', sans-serif; /* From vfonts */
}

.header-left {
  display: flex;
  align-items: center; /* Vertically align logo and text */
}

.app-logo {
  height: 40px; /* Adjust height as needed */
  width: auto; /* Maintain aspect ratio */
  margin-right: 15px; /* Space between logo and title */
}

.n-layout-footer a {
  font-weight: 500;
}

.n-layout-footer a:hover {
  text-decoration: underline;
  color: #167a48;
}
</style>