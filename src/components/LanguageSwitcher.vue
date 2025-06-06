<template>
    <NSelect
      :value="store.selectedUILanguage"
      :options="languageOptions"
      @update:value="onLanguageChange"
      size="small"
      style="width: 180px"
      placeholder="Select Language"
    />
  </template>
  
  <script setup lang="ts">
  import { NSelect } from 'naive-ui';
  import { useVocabularyStore, ALL_LANGUAGES_KEY } from '@/store/vocabularyStore';
  
  const store = useVocabularyStore();
  
  const languageOptions = [
    { label: '--- All Translations ---', value: ALL_LANGUAGES_KEY },
    { label: 'English', value: 'en' },
    { label: '日本語 (Japanese)', value: 'ja' },
    { label: '한국어 (Korean)', value: 'ko' },
    { label: '中文 (Chinese)', value: 'zh' },
    { label: 'Deutsch (German)', value: 'de' },
  ];
  
  const onLanguageChange = (value: string) => {
    store.setUILanguage(value);
  };
  </script>
  
  <style scoped>
  /* Add any specific styles for the language switcher if needed */
  </style>