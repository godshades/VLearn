/**
 * Plays text using Google Translate's unofficial TTS URL.
 * @param text - The text to speak.
 * @param langCode - The language code (e.g., 'vi' for Vietnamese, 'en' for English).
 */
export function playTextToSpeechGoogle(text: string, langCode: string = 'vi'): void {
    if (!text || text.trim() === '') {
      console.warn('audioService: Attempted to play empty text.');
      return;
    }
  
    const encodedText = encodeURIComponent(text);
    // Note: Using 'translate.google.com' might be more resilient than specific TLDs like '.com.vn'
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
  
    console.log(`audioService: Playing TTS for "${text.substring(0,20)}..." using URL: ${audioUrl}`);
  
    try {
      const audio = new Audio(audioUrl);
      audio.crossOrigin = "anonymous";
      audio.play()
        .catch(e => {
          console.error("audioService: Error playing TTS audio:", e);
          // Potentially notify the user or try a fallback if 'e' indicates a specific issue (e.g. network)
          // For now, we just log the error.
          // alert(`Could not play audio: ${e.message}. Please check your internet connection.`);
        });
    } catch (e) {
      // This catch block is for synchronous errors in Audio constructor, though unlikely.
      console.error("audioService: Synchronous error creating Audio object:", e);
    }
  }
  
  /**
   * (Optional Fallback) Plays text using the browser's Web Speech API.
   * @param text - The text to speak.
   * @param lang - The BCP 47 language tag (e.g., 'vi-VN', 'en-US').
   */
  export function playTextToSpeechWebAPI(text: string, lang: string = 'vi-VN'): void {
    if (!text || text.trim() === '') {
      console.warn('audioService (WebAPI): Attempted to play empty text.');
      return;
    }
  
    if (!('speechSynthesis' in window)) {
      console.warn('audioService (WebAPI): Web Speech API not supported in this browser.');
      // alert('Sorry, your browser does not support text-to-speech.');
      // Optionally, you could call playTextToSpeechGoogle here as a fallback if WebAPI is preferred but unavailable
      // playTextToSpeechGoogle(text, lang.split('-')[0]);
      return;
    }
  
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
  
      // Optional: Find a specific voice if needed
      const voices = speechSynthesis.getVoices();
      const targetVoice = voices.find(voice => voice.lang === lang);
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
  
      speechSynthesis.cancel(); // Cancel any ongoing speech
      speechSynthesis.speak(utterance);
      console.log(`audioService (WebAPI): Playing TTS for "${text.substring(0,20)}..."`);
    } catch (e) {
      console.error("audioService (WebAPI): Error with SpeechSynthesis:", e);
    }
  }