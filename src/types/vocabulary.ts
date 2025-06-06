export interface TranslationDetail {
    word: string;
    meaning: string;
    example: string;
}

export interface Translations {
    en: TranslationDetail;
    ja: TranslationDetail;
    ko: TranslationDetail;
    zh: TranslationDetail; // Simplified Chinese
    de: TranslationDetail;
    [key: string]: TranslationDetail; // Index signature for dynamic access
}

export interface VocabularyItem {
    word_index: number; 
    vietnamese_word: string;
    meaning_vietnamese: string;
    example_vietnamese: string;
    translations: Translations;
}