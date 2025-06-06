<template>
  <div class="home-view">
    <h1 class="sr-only">Learn Vietnamese Vocabulary Easily with VLeanr</h1>
    <NSpin :show="store.isLoading" size="large">
      <template #description>Loading vocabulary...</template>

      <NCard v-if="store.currentWord && !store.isLoading" :bordered="false" class="main-card">
        <VocabularyCard 
          :word-item="store.currentWord"
          @swipe-next="store.goToNextWord()"
          @swipe-previous="store.goToPreviousWord()" />
        <template #footer>
          <div class="footer-controls">
            <!-- Apply gap="0" to NSpace to prevent its default inline gap -->
            <!-- We will control spacing via CSS on .navigation-controls -->
            <NFlex :size="0" justify="space-between" align="center" class="navigation-controls">
              <NButton @click="store.goToPreviousWord()" :disabled="!store.canGoPrevious" type="primary" ghost>
                < Previous
              </NButton>
              <NText class="word-count">
                Word {{ store.currentGlobalWordIndex }} of {{ store.totalWords }}
              </NText>
              <NButton @click="store.goToNextWord()" :disabled="!store.canGoNext" type="primary" ghost>
                Next >
              </NButton>
            </NFlex>

            <!-- These NSpace components can also have :gap="0" if you want to control their spacing via CSS -->
            <NSpace justify="center" align="center" class="pagination-controls">
              <NText>Go to Page:</NText>
              <NInputNumber
                v-model:value="jumpToPageInput"
                :min="1"
                :max="store.totalPages"
                size="small"
                style="width: 100px"
                placeholder="Page"
                @keyup.enter="handleJumpToPage"
              />
              <NButton @click="handleJumpToPage" size="small">Go</NButton>
            </NSpace>
            <NSpace justify="center" align="center" class="pagination-controls">
              <NText class="page-info">(Page {{ store.currentPageNumber }} of {{ store.totalPages }})</NText>
            </NSpace>

            <NSpace justify="center" align="center" class="pagination-controls">
              <NText>Go to Word Index:</NText>
              <NInputNumber
                v-model:value="jumpToWordIndexInput"
                :min="1"
                :max="store.totalWords"
                size="small"
                style="width: 100px"
                placeholder="Index"
                @keyup.enter="handleJumpToWordIndex"
              />
              <NButton @click="handleJumpToWordIndex" size="small">Go</NButton>
            </NSpace>
          </div>
        </template>
      </NCard>

      <!-- The NEmpty and NResult sections remain the same -->
      <NEmpty
        v-else-if="!store.isLoading && store.totalWords === 0"
        description="No vocabulary words found in the database. The generation script might need to run."
        class="empty-state"
      />
      <NEmpty
        v-else-if="!store.isLoading && !store.currentWord && store.totalWords > 0"
        description="Could not load the current word. Try refreshing or navigating."
        class="empty-state"
      >
         <template #extra>
          <NButton @click="store.initializeOrLoadWord()" type="primary">Refresh Current</NButton>
        </template>
      </NEmpty>

      <NResult
        v-if="store.error && !store.isLoading"
        status="error"
        title="Error Loading Vocabulary"
        :description="store.error"
        class="error-state"
      >
        <template #footer>
          <NButton @click="store.initializeOrLoadWord()">Try Again</NButton>
        </template>
      </NResult>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NSpin, NCard, NButton, NSpace, NEmpty, NResult, NText, NInputNumber, NFlex } from 'naive-ui';
import { useVocabularyStore } from '@/store/vocabularyStore';
import VocabularyCard from '@/components/VocabularyCard.vue';

const store = useVocabularyStore();
const jumpToPageInput = ref<number | null>(null);
const jumpToWordIndexInput = ref<number | null>(null);

onMounted(() => {
  store.initializeOrLoadWord();
});

const handleJumpToPage = () => {
  if (jumpToPageInput.value !== null && jumpToPageInput.value >= 1 && jumpToPageInput.value <= store.totalPages) {
    store.goToPage(jumpToPageInput.value);
  }
  jumpToPageInput.value = null;
};

const handleJumpToWordIndex = () => {
    if (jumpToWordIndexInput.value !== null && jumpToWordIndexInput.value >= 1 && jumpToWordIndexInput.value <= store.totalWords) {
        store.goToWordIndex(jumpToWordIndexInput.value);
    }
    jumpToWordIndexInput.value = null;
};
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 20px auto;
  padding: 15px;
}

.main-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.word-count, .page-info {
  font-weight: 500;
  color: #555;
  white-space: nowrap; /* Prevent wrapping on small screens */
}

.empty-state, .error-state {
  margin-top: 30px;
  padding: 20px;
  text-align: center;
}

.footer-controls {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Adds space between the navigation and pagination sections */
}

/* --- OPTIMIZED LAYOUT FOR MOBILE & TABLET DEVICES --- */

/* Default (Desktop First) styles */
.navigation-controls {
  /* NSpace already applies display: flex, justify-content, align-items by default.
     Since we set gap="0" on the component, we can define our own gap here. */
  display: flex; /* Ensure it's flex */
  flex-wrap: nowrap; /* Prevent wrapping on desktop unless specified by media query */
  justify-content: space-between;
  align-items: center;
  gap: 20px; /* Example desktop gap between items */
}

.pagination-controls {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 12px; /* Example desktop gap for pagination controls */
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Mobile & Tablet Optimizations */
@media (max-width: 768px) {
  .home-view {
    padding: 10px;
  }

  /* Make navigation controls stack and align items differently */
  .navigation-controls {
    flex-direction: row; /* Keep horizontal but let items adjust */
    justify-content: space-between; /* Space out buttons */
    align-items: center;
    gap: 10px; /* Reduced gap for smaller screens */
    width: 100%;
  }

  .word-count {
    flex-grow: 1; /* Allow word count to take available space */
    text-align: center; /* Center the "Word X of Y" text */
  }

  .pagination-controls {
    flex-direction: column; /* Stack pagination controls vertically */
    gap: 10px; /* Adjust vertical gap */
  }

  /* Make input fields and buttons take full width for better touch targets */
  .pagination-controls .n-input-number,
  .pagination-controls .n-button {
    width: 100%;
    max-width: 250px; /* Cap max width so they don't get too wide on tablets */
  }

  /* Center the input/button group */
  .pagination-controls {
    align-items: center;
  }

  .page-info {
    margin-top: 5px; /* Add some space above page info when stacked */
  }
}

/* Optional: Further optimization for very small mobile screens (e.g., iPhone SE) */
@media (max-width: 480px) {
  /* You can make navigation buttons full width if desired for very small screens */
  .navigation-controls .n-button {
    flex-grow: 1; /* Allow buttons to expand */
  }
}
</style>