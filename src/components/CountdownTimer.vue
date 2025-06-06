<template>
    <div class="countdown-timer">
      <NStatistic :tabular-nums="true">
        <template #label>
          <NText depth="3">{{ label }}</NText>
        </template>
        <NText :type="timeLeft <= 0 ? 'success' : 'default'" strong>
          {{ formattedTimeLeft }}
        </NText>
      </NStatistic>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
  import { NStatistic, NText } from 'naive-ui';
  
  const props = defineProps<{
    targetTime: number; // Timestamp (in milliseconds) of the target event
    label?: string;      // Optional label for the countdown
    onFinished?: () => void; // Optional callback when timer reaches zero
  }>();
  
  const now = ref(Date.now());
  const timerId = ref<number | undefined>(undefined);
  
  const timeLeft = computed(() => Math.max(0, props.targetTime - now.value));
  
  const formattedTimeLeft = computed(() => {
    if (timeLeft.value <= 0) {
      return props.onFinished ? "Refreshing..." : "Event Time!";
    }
  
    const seconds = Math.floor((timeLeft.value / 1000) % 60);
    const minutes = Math.floor((timeLeft.value / (1000 * 60)) % 60);
    const hours = Math.floor(timeLeft.value / (1000 * 60 * 60)); // Can be > 24
  
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  
  const updateCurrentTime = () => {
    now.value = Date.now();
    if (timeLeft.value <= 0) {
      if (props.onFinished) {
        props.onFinished();
      }
      if (timerId.value) {
        clearInterval(timerId.value); // Stop timer once finished if callback exists
      }
    }
  };
  
  onMounted(() => {
    updateCurrentTime(); // Initial calculation
    timerId.value = (setInterval(updateCurrentTime, 1000) as unknown) as number;
  });
  
  onUnmounted(() => {
    if (timerId.value) {
      clearInterval(timerId.value);
    }
  });
  
  // Watch for targetTime changes to restart the timer if necessary
  watch(() => props.targetTime, () => {
    if (timerId.value) {
      clearInterval(timerId.value);
    }
    updateCurrentTime(); // Recalculate immediately
    if (timeLeft.value > 0) { // Only restart interval if time is left
        timerId.value = (setInterval(updateCurrentTime, 1000) as unknown) as number;
    }
  });
  
  </script>
  
  <style scoped>
  .countdown-timer {
    display: inline-block; /* Or block, depending on layout needs */
    padding: 5px 10px;
    /* background-color: #f8f8f8;
    border-radius: 4px; */
  }
  </style>