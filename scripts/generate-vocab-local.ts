// scripts/generate-vocab-local.ts

// No need to import 'fetch' if using Node >= 18
// import fetch from 'node-fetch'; // Remove this line

import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Use these imports to correctly find the .env file path in ESM
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: `${__dirname}/../.env` });


// --- Type Definitions (copy from src/types/vocabulary.ts if you moved them there) ---
// If you put these in src/types/vocabulary.ts, you could import them:
// import type { VocabularyItem, Translations, TranslationDetail } from '../src/types/vocabulary';
// For a standalone script, it's often easier to keep local copies of needed types:
interface GeneratedTranslation {
    word: string;
    meaning: string;
    example: string;
}

interface Translations {
    en: GeneratedTranslation;
    ja: GeneratedTranslation;
    ko: GeneratedTranslation;
    zh: GeneratedTranslation; // Assuming Simplified Chinese
    de: GeneratedTranslation;
    [key: string]: GeneratedTranslation | undefined; // Allow undefined
}

interface GeneratedVocabularyItem {
    vietnamese_word: string;
    meaning_vietnamese: string;
    example_vietnamese: string;
    translations: Translations;
}
// ------------------------------------------------------------------


async function runLocalGenerator() {
    console.log('--- Starting Local Vocabulary Generator ---');

    // Get OpenRouter API Keys and prepare for cycling
    const openrouterApiKeys = process.env.OPENROUTER_API_KEYS?.split(',').map(key => key.trim()).filter(key => key.length > 0);

    if (!openrouterApiKeys || openrouterApiKeys.length === 0) {
        console.error('ERROR: OPENROUTER_API_KEYS environment variable not set or empty in .env file.');
        console.log('Please ensure your .env file exists in the project root and contains OPENROUTER_API_KEYS=...');
        console.log('--- Generator Finished with Error ---');
        return;
    }

    const prompt = `Generate exactly 20 unique Vietnamese vocabulary words and phrases suitable for general language learners.
For each of the 20 items, provide:
1. The Vietnamese word/phrase.
2. A concise Vietnamese definition for the word/phrase.
3. An example sentence in Vietnamese using the word/phrase.
4. English translation for the word/phrase, its definition, and its example sentence.
5. Japanese translation for the word/phrase, its definition, and its example sentence.
6. Korean translation for the word/phrase, its definition, and its example sentence.
7. Chinese (Simplified) translation for the word/phrase, its definition, and its example sentence.
8. German translation for the word/phrase, its definition, and its example sentence.

Format the entire response as a single JSON array, where each element is an object representing one vocabulary item. Each object MUST have the keys: "vietnamese_word", "meaning_vietnamese", "example_vietnamese", and a nested "translations" object. The "translations" object MUST have the keys "en", "ja", "ko", "zh", "de", each containing "word", "meaning", and "example" sub-keys. Ensure all 20 items are distinct and relevant for language learners. The JSON array should be the *entire* content of the response, enclosed in [].`;

    let generatedItems: GeneratedVocabularyItem[] | null = null;
    let successfulKey: string | null = null;

    // Add logging *before* the fetch loop
    console.log(`Loaded ${openrouterApiKeys.length} API keys.`);
    console.log('Starting API call loop...');

    // Call OpenRouter API, cycling through keys if needed
    for (const key of openrouterApiKeys) {
        console.log(`Attempting OpenRouter API call with key ending in ${key.substring(key.length - 5)}`);
        try {
            // Use Node's native fetch API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    // Recommended headers for OpenRouter tracking
                    'HTTP-Referer': 'http://localhost:3000/local-generator-script',
                    'X-Title': 'VietVocab Flow Local Generator',
                },
                body: JSON.stringify({
                    model: "mistralai/mistral-7b-instruct", // Or another suitable free model
                    messages: [{ role: "user", content: prompt }],
                    // max_tokens: 2500, // Optional
                    // temperature: 0.7, // Optional
                })
            });

            // Add logging *after* the fetch call, before checking response.ok
            console.log(`Fetch call completed for key ending in ${key.substring(key.length - 5)}. Status: ${response.status}`);


            if (!response.ok) {
                const errorStatus = response.status;
                const errorBody = await response.text();
                if (errorStatus === 429 || errorStatus === 401) { // Rate limit or invalid key
                    console.warn(`API Key ending in ${key.substring(key.length - 5)} failed (Status: ${errorStatus}). Response: ${errorBody.substring(0, 200)}... Trying next.`); // Log part of body
                    continue; // Try the next key
                }
                throw new Error(`OpenRouter API error (Status: ${errorStatus}): ${errorBody}`);
            }

            const data: any = await response.json();
            const content = data?.choices?.[0]?.message?.content;

            if (!content) {
                 console.warn(`API Key ending in ${key.substring(key.length - 5)} returned empty content. Response data: ${JSON.stringify(data).substring(0, 200)}... Trying next.`);
                 continue;
            }

            try {
                 const parsedData = JSON.parse(content);

                 if (Array.isArray(parsedData) && parsedData.length >= 1) { // Be slightly more lenient for testing, check if at least 1 item
                    // Add robust validation here if needed, similar to Edge Function
                    // For local testing, a basic check is often enough
                    const isValidStructure = parsedData.every(item =>
                         typeof item === 'object' && item !== null &&
                         typeof item.vietnamese_word === 'string' &&
                         typeof item.translations === 'object' && item.translations !== null
                         // Add checks for required translation keys if strict validation needed
                    );

                    if (isValidStructure) {
                        generatedItems = parsedData as GeneratedVocabularyItem[];
                        successfulKey = key;
                        console.log(`Successfully generated and parsed ${generatedItems.length} items with key ending in ${key.substring(key.length - 5)}.`);
                        // console.log('Generated Data:', JSON.stringify(generatedItems, null, 2)); // Optional: log full data
                        break; // Success
                    } else {
                         console.warn(`API Key ending in ${key.substring(key.length - 5)} returned data with invalid structure. Trying next.`);
                    }
                 } else {
                     console.warn(`API Key ending in ${key.substring(key.length - 5)} returned unexpected JSON (not array or empty). Content: ${content.substring(0, 200)}... Trying next.`);
                 }
            } catch (jsonError: any) {
                 console.warn(`API Key ending in ${key.substring(key.length - 5)} returned invalid JSON. Trying next. Error: ${jsonError.message}. Content: ${content.substring(0, 200)}...`);
            }


        } catch (error: any) {
            console.error(`Caught exception during API call with Key ending in ${key.substring(key.length - 5)}: `, error.message);
            // Continue to the next key on other errors
        }
    }

    // Check if generation was successful
    if (!generatedItems || generatedItems.length === 0) {
        console.error('\nERROR: Failed to generate vocabulary items after trying all keys.');
        console.log('--- Generator Finished with Error ---');
        return;
    }

    // --- Output Generated Data ---
    const generationBatchId = uuidv4();
    console.log(`\n--- Successfully Generated Batch ---`);
    console.log(`Batch ID: ${generationBatchId}`);
    console.log(`Number of Items: ${generatedItems.length}`);

    console.log('\nSample Item (First item):');
    console.log(JSON.stringify(generatedItems[0], null, 2));

     // You could optionally save this to a local file for testing the frontend
     // import fs from 'fs';
     // fs.writeFileSync('local_vocab_batch.json', JSON.stringify(generatedItems, null, 2));
     // console.log('\nData saved to local_vocab_batch.json');


    console.log('\n--- Generator Finished Successfully ---');
}

// Run the script
runLocalGenerator();