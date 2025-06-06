<template>
  <div v-if="wordItem"
    class="vocabulary-card"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <!-- Main Vietnamese Word -->
    <NH1 class="vietnamese-word">
      <span>{{ wordItem.vietnamese_word }}</span>
      <NButton text @click="speak(wordItem.vietnamese_word, 'vi')" class="tts-button-main">
        <template #icon><NIcon :component="SpeakerIcon" size="24" /></template>
      </NButton>
    </NH1>

    <!-- "All Languages" Display Option -->
    <div v-if="store.selectedUILanguage === ALL_LANGUAGES_KEY" class="all-translations-container">
      <!-- Show primary Vietnamese details at the end of "all" view for reinforcement -->
      <NBlockquote class="translation-block vietnamese-details-in-all">
        <NText strong>Vietnamese Details:</NText><br/>
        <NText>
          Meaning: {{ wordItem.meaning_vietnamese }}
          <NButton text @click="speak(wordItem.meaning_vietnamese, 'vi')" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText><br/>
        <NText>
          Example: {{ wordItem.example_vietnamese }}
          <NButton text @click="speak(wordItem.example_vietnamese, 'vi')" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText>
      </NBlockquote>
      <NBlockquote v-for="(langData, langKey) in wordItem.translations" :key="langKey" class="translation-block">
        <NText strong>{{ getLanguageName(langKey as string) }}:</NText><br/>
        <NText italic>
          Word: {{ langData.word }}
          <NButton text @click="speak(langData.word, langKey as string)" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText><br/>
        <NText italic>
          Meaning: {{ langData.meaning }}
          <NButton text @click="speak(langData.meaning, langKey as string)" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText><br/>
        <NText italic>
          Example: {{ langData.example }}
          <NButton text @click="speak(langData.example, langKey as string)" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText>
      </NBlockquote>
    </div>

    <!-- Single Selected Language Display -->
    <div v-else-if="activeTranslation" class="single-translation-container">
      <NText italic class="translated-word">
        ({{ activeTranslation.word }})
        <NButton text @click="speak(activeTranslation.word, store.selectedUILanguage)" class="tts-button-inline">
          <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
        </NButton>
      </NText>

      <NBlockquote class="detail-block">
        <NText strong>Meaning (Vietnamese):</NText>
        <span> {{ wordItem.meaning_vietnamese }}</span>
        <NButton text @click="speak(wordItem.meaning_vietnamese, 'vi')" class="tts-button-inline">
          <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
        </NButton>
        <br />
        <NText italic>
          ({{ activeTranslation.meaning }})
          <NButton text @click="speak(activeTranslation.meaning, store.selectedUILanguage)" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText>
      </NBlockquote>

      <NBlockquote class="detail-block">
        <NText strong>Example (Vietnamese):</NText>
        <span> {{ wordItem.example_vietnamese }}</span>
        <NButton text @click="speak(wordItem.example_vietnamese, 'vi')" class="tts-button-main">
          <template #icon><NIcon :component="SpeakerIcon" size="20" /></template>
        </NButton>
        <br />
        <NText italic>
          ({{ activeTranslation.example }})
          <NButton text @click="speak(activeTranslation.example, store.selectedUILanguage)" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText>
      </NBlockquote>
    </div>

    <!-- English Fallback Display (if selected language has no translation but English does) -->
    <div v-else-if="wordItem.translations?.en" class="single-translation-container english-fallback">
      <NText italic class="translated-word">
        ({{ wordItem.translations.en.word }} - English Fallback)
        <NButton text @click="speak(wordItem.translations.en.word, 'en')" class="tts-button-inline">
          <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
        </NButton>
      </NText>
      <NBlockquote class="detail-block">
        <NText strong>Meaning (Vietnamese):</NText>
        <span> {{ wordItem.meaning_vietnamese }}</span>
        <NButton text @click="speak(wordItem.meaning_vietnamese, 'vi')" class="tts-button-inline">
          <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
        </NButton>
        <br />
        <NText italic>
          ({{ wordItem.translations.en.meaning }})
          <NButton text @click="speak(wordItem.translations.en.meaning, 'en')" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText>
      </NBlockquote>
      <NBlockquote class="detail-block">
        <NText strong>Example (Vietnamese):</NText>
        <span> {{ wordItem.example_vietnamese }}</span>
        <NButton text @click="speak(wordItem.example_vietnamese, 'vi')" class="tts-button-main">
          <template #icon><NIcon :component="SpeakerIcon" size="20" /></template>
        </NButton>
        <br />
        <NText italic>
          ({{ wordItem.translations.en.example }})
          <NButton text @click="speak(wordItem.translations.en.example, 'en')" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NText>
      </NBlockquote>
    </div>

    <!-- Only Vietnamese (if no translation for selected lang and no English fallback) -->
    <div v-else class="single-translation-container no-translation-available">
        <NText class="no-translation-message">
            Translations are not available for the selected language. Showing Vietnamese details.
        </NText>
        <NBlockquote class="detail-block">
          <NText strong>Meaning (Vietnamese):</NText>
          <span> {{ wordItem.meaning_vietnamese }}</span>
          <NButton text @click="speak(wordItem.meaning_vietnamese, 'vi')" class="tts-button-inline">
            <template #icon><NIcon :component="SpeakerIcon" size="16" /></template>
          </NButton>
        </NBlockquote>
        <NBlockquote class="detail-block">
          <NText strong>Example (Vietnamese):</NText>
          <span> {{ wordItem.example_vietnamese }}</span>
          <NButton text @click="speak(wordItem.example_vietnamese, 'vi')" class="tts-button-main">
            <template #icon><NIcon :component="SpeakerIcon" size="20" /></template>
          </NButton>
        </NBlockquote>
    </div>

  </div>
  <div v-else class="no-word-message">
    <NText>No vocabulary word to display at the moment.</NText>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { NBlockquote, NH1, NText, NButton, NIcon } from 'naive-ui';
import { VolumeHighOutline as SpeakerIcon } from '@vicons/ionicons5';
import type { VocabularyItem, TranslationDetail, Translations } from '@/types/vocabulary'; // Ensure types path is correct
import { useVocabularyStore, ALL_LANGUAGES_KEY } from '@/store/vocabularyStore';

// Choose your TTS service (WebAPI is generally recommended for reliability)
import { playTextToSpeechWebAPI, playTextToSpeechWebAPI as ttsService } from '@/services/audioService';
// import { playTextToSpeechViaProxy as ttsService } from '@/services/audioService'; // If you set up the proxy
// import { playTextToSpeechGoogle as ttsService } from '@/services/audioService'; // If direct Google URL works or for testing

const store = useVocabularyStore();

interface Props {
  wordItem: VocabularyItem | null;
}
const props = defineProps<Props>();

// Define custom emits for swipe actions
const emit = defineEmits(['swipe-next', 'swipe-previous']);

// --- Swipe Logic State ---
const touchStartX = ref(0);
const touchStartY = ref(0); // Also track Y to differentiate horizontal vs vertical scroll
const SWIPE_THRESHOLD_X = 50; // Minimum horizontal pixels to count as a swipe
const SWIPE_THRESHOLD_Y = 30; // Maximum vertical pixels during horizontal swipe for it to be valid
const TOUCH_ACTION_TIMEOUT = 100; // Time in ms to wait before enabling default touch action (for click detection)

let touchMoveTimeout: number | undefined;


// --- Touch Event Handlers ---
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) return; // Only interested in single-finger touch
  touchStartX.value = event.touches[0].clientX;
  touchStartY.value = event.touches[0].clientY;
  // Clear any previous timeout
  if (touchMoveTimeout) {
    clearTimeout(touchMoveTimeout);
    touchMoveTimeout = undefined;
  }
  // Disable default browser touch actions for a short period to prevent accidental scroll
  // (e.g., pan-x to allow horizontal scroll, but we want to prevent it for swipe detection)
  // Instead of preventDefault in touchmove, using CSS touch-action is generally better.
  // We'll rely on the CSS `touch-action: pan-y;` on the element for horizontal prevention.
};

const handleTouchMove = (event: TouchEvent) => {
  // Check if a swipe is starting, and if so, prevent default vertical scrolling IF horizontal is dominant.
  // This is a more nuanced way than just event.preventDefault() on all touchmoves.
  if (touchStartX.value === 0) return; // Not a valid start event

  const currentX = event.touches[0].clientX;
  const currentY = event.touches[0].clientY;

  const deltaX = currentX - touchStartX.value;
  const deltaY = currentY - touchStartY.value;

  // If horizontal movement is significantly greater than vertical movement,
  // and we're past a small initial threshold, prevent default scroll
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) { // Small threshold to avoid accidental scroll block
    event.preventDefault(); // Prevent browser horizontal scroll/swipe gestures
  }
};


const handleTouchEnd = (event: TouchEvent) => {
  if (touchStartX.value === 0) return; // No valid touch start

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;

  // Reset touch state
  touchStartX.value = 0;
  touchStartY.value = 0;

  // Determine if it was a valid horizontal swipe
  if (
    Math.abs(deltaX) > SWIPE_THRESHOLD_X &&  // Must be a significant horizontal movement
    Math.abs(deltaY) < SWIPE_THRESHOLD_Y    // Must not be a dominant vertical scroll
  ) {
    if (deltaX > 0) { // Swiped right
      console.log('Swipe Right detected');
      emit('swipe-previous');
    } else { // Swiped left
      console.log('Swipe Left detected');
      emit('swipe-next');
    }
  }
  // If not a swipe, it was a tap or a vertical scroll, allow default browser behavior
};

const languageMap: Record<string, string> = {
  en: 'English',
  ja: 'Japanese (日本語)',
  ko: 'Korean (한국어)',
  zh: 'Chinese (中文)',
  de: 'German (Deutsch)',
};

const getLanguageName = (key: string): string => languageMap[key] || key.toUpperCase();

const activeTranslation = computed((): TranslationDetail | null => {
  if (!props.wordItem?.translations || store.selectedUILanguage === ALL_LANGUAGES_KEY) {
    return null;
  }
  return props.wordItem.translations[store.selectedUILanguage] || null;
});

const speak = (text: string | undefined, langCode: string) => {
  if (!text || text.trim() === '') return;

  let effectiveLangCode = langCode;
  // Adjust for Web Speech API's typical locale format if using it
  if (ttsService === playTextToSpeechWebAPI) { // Check if it's the WebAPI function
      if (langCode === 'vi') effectiveLangCode = 'vi-VN';
      else if (langCode === 'en') effectiveLangCode = 'en-US';
      else if (langCode === 'ja') effectiveLangCode = 'ja-JP';
      else if (langCode === 'ko') effectiveLangCode = 'ko-KR';
      else if (langCode === 'zh') effectiveLangCode = 'zh-CN'; // Or zh-TW for traditional
      else if (langCode === 'de') effectiveLangCode = 'de-DE';
      // Add other mappings as needed
  }
  // For Google TTS URL or Proxy, simple lang codes like 'vi', 'en' usually work.

  ttsService(text, effectiveLangCode);
};
</script>

<style scoped>
.vocabulary-card {
  padding: 10px;
  /* Crucial for swipe: Allows vertical scrolling but not horizontal */
  touch-action: pan-y;
  /* Optional: Add a grab cursor to indicate interactivity */
  cursor: grab;
}

.vietnamese-word {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 2.5em;
  color: #333;
}

.vietnamese-word span {
    margin-right: 8px; /* Space before the main speaker icon */
}

.tts-button-main { /* For main word and main example */
  margin-left: 5px; /* Slight adjustment from previous tts-button */
  color: #444;
  vertical-align: middle;
}
.tts-button-main:hover {
  color: #18a058;
}

.tts-button-inline { /* For smaller, inline text elements */
  margin-left: 4px;
  color: #666;
  vertical-align: middle; /* Align icon with text */
}
.tts-button-inline .n-icon {
  vertical-align: -0.15em; /* Fine-tune icon alignment */
}
.tts-button-inline:hover {
  color: #18a058;
}


.translated-word {
  font-size: 1.2em;
  color: #777;
  margin-bottom: 15px;
  display: block;
}
.translated-word .n-button { /* Target inline button within translated word */
    font-size: 0.8em; /* Make icon button smaller relative to text */
}

.all-translations-container .translation-block {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-left: 3px solid #18a058;
}
.all-translations-container .translation-block .n-text {
    line-height: 1.8; /* Increase line height for readability with icons */
}
.vietnamese-details-in-all {
    background-color: #f0f0f0;
    border-left-color: #555;
    margin-top: 20px;
}


.single-translation-container .detail-block {
  margin-top: 15px;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 2px solid #eee;
}
.single-translation-container .detail-block .n-text,
.single-translation-container .detail-block span {
    line-height: 1.8; /* Increase line height for readability with icons */
}


.no-translation-message, .no-word-message {
  color: #999;
  font-style: italic;
  margin-top: 20px;
}
.no-translation-available .detail-block {
    margin-top: 10px;
}

</style>