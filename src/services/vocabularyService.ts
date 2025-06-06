// src/services/vocabularyService.ts
import { supabase } from './supabaseClient';
import type { VocabularyItem, Translations } from '@/types/vocabulary'; // Adjusted path

// Define the raw structure expected from Supabase, now with word_index
interface SupabaseVocabularyItemRaw {
    word_index: number;
    // id?: string; // if you keep UUID
    vietnamese_word: string;
    meaning_vietnamese: string;
    example_vietnamese: string;
    translations: any; // Supabase returns JSONB as 'any'
    // generation_batch_id: string; // if selected
    // created_at: string; // if selected
}

/**
 * Fetches a page of vocabulary items and the total count.
 * @param page - The page number (1-indexed).
 * @param pageSize - The number of items per page.
 * @returns A promise with data, total count, and error.
 */
export async function fetchPaginatedVocabulary(
    page: number,
    pageSize: number
): Promise<{ data: VocabularyItem[] | null; totalCount: number; error: any }> {
    console.log(`vocabularyService: Fetching page ${page}, pageSize ${pageSize}`);
    const offset = (page - 1) * pageSize;

    try {
        // Step 1: Fetch the total count of words
        const { count, error: countError } = await supabase
            .from('vocabulary_items')
            .select('*', { count: 'exact', head: true }); // head:true makes it faster

        if (countError) {
            console.error('vocabularyService: Error fetching total word count:', countError);
            return { data: null, totalCount: 0, error: countError };
        }
        const totalCount = count || 0;
        if (totalCount === 0) {
            console.warn('vocabularyService: No words found in the database.');
            return { data: [], totalCount: 0, error: null};
        }


        // Step 2: Fetch the paginated items
        const { data: rawItems, error: itemsError } = await supabase
            .from('vocabulary_items')
            .select('word_index, vietnamese_word, meaning_vietnamese, example_vietnamese, translations')
            .order('word_index', { ascending: true })
            .range(offset, offset + pageSize - 1);

        if (itemsError) {
            console.error('vocabularyService: Error fetching paginated vocabulary items:', itemsError);
            return { data: null, totalCount, error: itemsError };
        }

        if (!rawItems) {
            return { data: [], totalCount, error: null };
        }

        const typedItems: VocabularyItem[] = rawItems.map(item => ({
            word_index: item.word_index,
            vietnamese_word: item.vietnamese_word,
            meaning_vietnamese: item.meaning_vietnamese,
            example_vietnamese: item.example_vietnamese,
            translations: item.translations as Translations,
        }));

        console.log(`vocabularyService: Successfully fetched ${typedItems.length} words for page ${page}. Total words: ${totalCount}`);
        return { data: typedItems, totalCount, error: null };

    } catch (e: any) {
        console.error('vocabularyService: Unexpected error in fetchPaginatedVocabulary:', e);
        return { data: null, totalCount: 0, error: e };
    }
}

/**
 * Fetches a single vocabulary item by its word_index.
 * @param wordIndex - The sequential index of the word.
 * @returns A promise with the vocabulary item or null, and error.
 */
export async function fetchVocabularyItemByIndex(
    wordIndex: number
): Promise<{ data: VocabularyItem | null; error: any }> {
    console.log(`vocabularyService: Fetching word by index ${wordIndex}`);
    try {
        const { data: rawItem, error } = await supabase
            .from('vocabulary_items')
            .select('word_index, vietnamese_word, meaning_vietnamese, example_vietnamese, translations')
            .eq('word_index', wordIndex)
            .maybeSingle(); // Returns single item or null

        if (error) {
            console.error(`vocabularyService: Error fetching word index ${wordIndex}:`, error);
            return { data: null, error };
        }

        if (!rawItem) {
            return { data: null, error: null }; // Word not found
        }

        const typedItem: VocabularyItem = {
            word_index: rawItem.word_index,
            vietnamese_word: rawItem.vietnamese_word,
            meaning_vietnamese: rawItem.meaning_vietnamese,
            example_vietnamese: rawItem.example_vietnamese,
            translations: rawItem.translations as Translations,
        };
        return { data: typedItem, error: null };

    } catch (e: any) {
        console.error(`vocabularyService: Unexpected error fetching word index ${wordIndex}:`, e);
        return { data: null, error: e };
    }
}