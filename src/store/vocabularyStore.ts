import { supabase } from '../services/supabaseClient';
import { defineStore } from 'pinia';
import { fetchPaginatedVocabulary, fetchVocabularyItemByIndex } from '@/services/vocabularyService';
import type { VocabularyItem } from '@/types/vocabulary'; // Path to your types

const PAGE_SIZE = 10; // Words per page

interface VocabularyState {
  currentWordsOnPage: VocabularyItem[]; // Holds the 10 words of the current page
  currentGlobalWordIndex: number; // The word_index of the currently displayed word from the DB
  currentPageNumber: number; // For pagination UI
  totalWords: number;
  isLoading: boolean;
  error: string | null;
  selectedUILanguage: string;
  // 'seenWordIds' is removed as the primary interaction model changes from "new words"
}

export const ALL_LANGUAGES_KEY = 'all';

export const useVocabularyStore = defineStore('vocabulary', {
  state: (): VocabularyState => {
    // Try to load saved global word index
    const savedWordIndexStr = localStorage.getItem('currentGlobalWordIndex');
    const initialGlobalWordIndex = savedWordIndexStr ? parseInt(savedWordIndexStr, 10) : 1; // Default to first word

    return {
        currentWordsOnPage: [],
        currentGlobalWordIndex: initialGlobalWordIndex, // Start at 1 or saved index
        currentPageNumber: Math.ceil(initialGlobalWordIndex / PAGE_SIZE), // Calculate initial page
        totalWords: 0,
        isLoading: false,
        error: null,
        selectedUILanguage: localStorage.getItem('uiLang') || 'en',
    };
  },

  getters: {
    currentWord(state): VocabularyItem | null {
        // Find the word in currentWordsOnPage that matches currentGlobalWordIndex
        return state.currentWordsOnPage.find(word => word.word_index === state.currentGlobalWordIndex) || null;
    },
    totalPages(state): number {
        return Math.ceil(state.totalWords / PAGE_SIZE);
    },
    // Getters for disabling next/prev buttons
    canGoNext(state): boolean {
        return state.currentGlobalWordIndex < state.totalWords;
    },
    canGoPrevious(state): boolean {
        return state.currentGlobalWordIndex > 1;
    }
  },

  actions: {
    async initializeOrLoadWord(targetWordIndex?: number) {
        this.isLoading = true;
        this.error = null;
        const indexToLoad = targetWordIndex !== undefined ? targetWordIndex : this.currentGlobalWordIndex;

        try {
            // Fetch total words first if not already fetched or if it might have changed
            // For simplicity, we fetch it each time, but you could cache it.
            const { count, error: countError } = await supabase
                .from('vocabulary_items')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;
            this.totalWords = count || 0;

            if (this.totalWords === 0) {
                this.currentWordsOnPage = [];
                this.currentGlobalWordIndex = 1; // Reset if no words
                this.currentPageNumber = 1;
                console.warn("Store: No words in database.");
                this.isLoading = false;
                return;
            }

            // Ensure indexToLoad is within bounds
            const validatedIndex = Math.max(1, Math.min(indexToLoad, this.totalWords));
            this.currentGlobalWordIndex = validatedIndex;
            localStorage.setItem('currentGlobalWordIndex', this.currentGlobalWordIndex.toString());

            const targetPage = Math.ceil(this.currentGlobalWordIndex / PAGE_SIZE);
            this.currentPageNumber = targetPage;

            // Fetch the page containing the currentGlobalWordIndex
            const { data, totalCount, error: fetchError } = await fetchPaginatedVocabulary(targetPage, PAGE_SIZE);

            if (fetchError) throw fetchError;

            this.currentWordsOnPage = data || [];
            // this.totalWords = totalCount; // totalCount from paginated fetch might be redundant if fetched above

            // If currentGlobalWordIndex is not on the fetched page (e.g., page empty but index exists)
            // this should ideally not happen if pagination logic is correct.
            // One could add a fallback to fetch the single word by index if currentWord getter returns null.
            if (!this.currentWordsOnPage.find(w => w.word_index === this.currentGlobalWordIndex) && this.currentWordsOnPage.length > 0) {
                // This case indicates a potential logic mismatch, or the word is on a different page than expected.
                // For now, we assume fetchPaginatedVocabulary brings the correct page.
                console.warn("Store: Current global word index not found on the fetched page. This might indicate a logic issue.");
            } else if (this.currentWordsOnPage.length === 0 && this.totalWords > 0) {
                // If page is empty but there should be words
                 console.warn("Store: Fetched page is empty, but totalWords > 0.");
                 // Try to fetch the specific word directly as a fallback
                 const { data: singleWord, error: singleFetchError } = await fetchVocabularyItemByIndex(this.currentGlobalWordIndex);
                 if (singleWord) {
                     this.currentWordsOnPage = [singleWord]; // Put just this word on the page
                 } else if (singleFetchError) {
                     throw singleFetchError;
                 }
            }

        } catch (err: any) {
            console.error("Store: Error initializing or loading word:", err);
            this.error = err.message || 'Failed to load vocabulary.';
        } finally {
            this.isLoading = false;
        }
    },

    async goToNextWord() {
        if (this.currentGlobalWordIndex < this.totalWords) {
            this.currentGlobalWordIndex++;
            localStorage.setItem('currentGlobalWordIndex', this.currentGlobalWordIndex.toString());
            // Check if the next word is on a new page
            const nextPageNumber = Math.ceil(this.currentGlobalWordIndex / PAGE_SIZE);
            if (nextPageNumber !== this.currentPageNumber || !this.currentWordsOnPage.find(w=>w.word_index === this.currentGlobalWordIndex)) {
                await this.initializeOrLoadWord(this.currentGlobalWordIndex); // This will fetch the new page
            }
            // If on the same page, currentWord getter will pick it up.
        }
    },

    async goToPreviousWord() {
        if (this.currentGlobalWordIndex > 1) {
            this.currentGlobalWordIndex--;
            localStorage.setItem('currentGlobalWordIndex', this.currentGlobalWordIndex.toString());
            const prevPageNumber = Math.ceil(this.currentGlobalWordIndex / PAGE_SIZE);
            if (prevPageNumber !== this.currentPageNumber || !this.currentWordsOnPage.find(w=>w.word_index === this.currentGlobalWordIndex)) {
                await this.initializeOrLoadWord(this.currentGlobalWordIndex); // This will fetch the new page
            }
        }
    },

    async goToWordIndex(index: number) {
        if (index >= 1 && index <= this.totalWords) {
            await this.initializeOrLoadWord(index);
        } else {
            console.warn(`Store: Attempted to go to invalid word index: ${index}`);
        }
    },

    async goToPage(pageNumber: number) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            // Load the first word of that page
            const targetWordIndex = (pageNumber - 1) * PAGE_SIZE + 1;
            await this.goToWordIndex(targetWordIndex);
        } else {
             console.warn(`Store: Attempted to go to invalid page number: ${pageNumber}`);
        }
    },

    setUILanguage(lang: string) {
        this.selectedUILanguage = lang;
        localStorage.setItem('uiLang', lang);
    },
  },
});