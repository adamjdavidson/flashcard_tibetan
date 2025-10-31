/**
 * Tibetan words data
 * Creates two cards per word:
 * 1. English → Tibetan: Front = English, Back = Tibetan
 * 2. Tibetan → English: Front = Tibetan, Back = English
 */

export const TIBETAN_WORDS = [
  { english: 'Eye', tibetan: 'མིག', spelling: 'mig' },
  { english: 'Father', tibetan: 'ཕ་པ', spelling: 'pha pa' },
  { english: 'Head', tibetan: 'མགོ', spelling: 'mgo' },
  { english: 'Hand', tibetan: 'ལག་པ', spelling: 'lag pa' },
  { english: 'Road', tibetan: 'ལམ', spelling: 'lam' },
  { english: 'Mountain', tibetan: 'རི', spelling: 'ri' },
  { english: 'Mother', tibetan: 'ཨ་མ', spelling: 'a ma' },
  { english: 'Tooth', tibetan: 'སོ', spelling: 'so' },
];

/**
 * Converts Tibetan words data to card format
 * Creates two cards per word: English→Tibetan and Tibetan→English
 */
export function convertWordsToCards() {
  const englishToTibetanCards = TIBETAN_WORDS.map((word, index) => ({
    id: `word_en_${word.english.toLowerCase().replace(/\s+/g, '_')}`,
    type: 'word',
    subcategory: 'english_to_tibetan',
    tags: ['Word'],
    front: word.english, // English word on front
    backTibetanScript: word.tibetan, // Tibetan script on back
    backEnglish: word.english, // Keep for reference
    createdAt: Date.now() - (TIBETAN_WORDS.length * 2 - index * 2) * 1000
  }));

  const tibetanToEnglishCards = TIBETAN_WORDS.map((word, index) => ({
    id: `word_tib_${word.english.toLowerCase().replace(/\s+/g, '_')}`,
    type: 'word',
    subcategory: 'tibetan_to_english',
    tags: ['Word'],
    front: word.tibetan, // Tibetan script on front
    backEnglish: word.english, // English word on back
    backTibetanScript: word.tibetan, // Keep for reference
    createdAt: Date.now() - (TIBETAN_WORDS.length * 2 - index * 2 - 1) * 1000
  }));

  return [...englishToTibetanCards, ...tibetanToEnglishCards];
}

