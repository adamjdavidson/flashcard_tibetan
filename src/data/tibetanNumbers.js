/**
 * Initial seed data: Tibetan numbers 1-30
 * Front: Tibetan numerals (e.g., ༢༥ for 25)
 * Back: Arabic numeral + Tibetan spelling (Wylie romanization)
 */

// Tibetan numeral digits: ༠ ༡ ༢ ༣ ༤ ༥ ༦ ༧ ༨ ༩ (0-9)
const TIBETAN_NUMERALS = ['༠', '༡', '༢', '༣', '༤', '༥', '༦', '༧', '༨', '༩'];

/**
 * Converts an Arabic number to Tibetan numerals
 * @param {number} num - The Arabic number to convert
 * @returns {string} Tibetan numeral representation
 */
export function numberToTibetanNumeral(num) {
  return num.toString().split('').map(digit => TIBETAN_NUMERALS[parseInt(digit)]).join('');
}

export const TIBETAN_NUMBERS = [
  { number: 0, tibetan: 'ཐིག', spelling: 'thig', english: 'zero', type: 'number' },
  { number: 1, tibetan: 'གཅིག', spelling: 'gcig', english: 'one', type: 'number' },
  { number: 2, tibetan: 'གཉིས', spelling: 'gnyis', english: 'two', type: 'number' },
  { number: 3, tibetan: 'གསུམ', spelling: 'gsum', english: 'three', type: 'number' },
  { number: 4, tibetan: 'བཞི', spelling: 'bzhi', english: 'four', type: 'number' },
  { number: 5, tibetan: 'ལྔ', spelling: 'lnga', english: 'five', type: 'number' },
  { number: 6, tibetan: 'དྲུག', spelling: 'drug', english: 'six', type: 'number' },
  { number: 7, tibetan: 'བདུན', spelling: 'bdun', english: 'seven', type: 'number' },
  { number: 8, tibetan: 'བརྒྱད', spelling: 'brgyad', english: 'eight', type: 'number' },
  { number: 9, tibetan: 'དགུ', spelling: 'dgu', english: 'nine', type: 'number' },
  { number: 10, tibetan: 'བཅུ', spelling: 'bcu', english: 'ten', type: 'number' },
  { number: 11, tibetan: 'བཅུ་གཅིག', spelling: 'bcu gcig', english: 'eleven', type: 'number' },
  { number: 12, tibetan: 'བཅུ་གཉིས', spelling: 'bcu gnyis', english: 'twelve', type: 'number' },
  { number: 13, tibetan: 'བཅུ་གསུམ', spelling: 'bcu gsum', english: 'thirteen', type: 'number' },
  { number: 14, tibetan: 'བཅུ་བཞི', spelling: 'bcu bzhi', english: 'fourteen', type: 'number' },
  { number: 15, tibetan: 'བཅུ་ལྔ', spelling: 'bcu lnga', english: 'fifteen', type: 'number' },
  { number: 16, tibetan: 'བཅུ་དྲུག', spelling: 'bcu drug', english: 'sixteen', type: 'number' },
  { number: 17, tibetan: 'བཅུ་བདུན', spelling: 'bcu bdun', english: 'seventeen', type: 'number' },
  { number: 18, tibetan: 'བཅུ་བརྒྱད', spelling: 'bcu brgyad', english: 'eighteen', type: 'number' },
  { number: 19, tibetan: 'བཅུ་དགུ', spelling: 'bcu dgu', english: 'nineteen', type: 'number' },
  { number: 20, tibetan: 'ཉི་ཤུ', spelling: 'nyi shu', english: 'twenty', type: 'number' },
  { number: 21, tibetan: 'ཉི་ཤུ་རྩ་གཅིག', spelling: 'nyi shu rtsa gcig', english: 'twenty-one', type: 'number' },
  { number: 22, tibetan: 'ཉི་ཤུ་རྩ་གཉིས', spelling: 'nyi shu rtsa gnyis', english: 'twenty-two', type: 'number' },
  { number: 23, tibetan: 'ཉི་ཤུ་རྩ་གསུམ', spelling: 'nyi shu rtsa gsum', english: 'twenty-three', type: 'number' },
  { number: 24, tibetan: 'ཉི་ཤུ་རྩ་བཞི', spelling: 'nyi shu rtsa bzhi', english: 'twenty-four', type: 'number' },
  { number: 25, tibetan: 'ཉི་ཤུ་རྩ་ལྔ', spelling: 'nyi shu rtsa lnga', english: 'twenty-five', type: 'number' },
  { number: 26, tibetan: 'ཉི་ཤུ་རྩ་དྲུག', spelling: 'nyi shu rtsa drug', english: 'twenty-six', type: 'number' },
  { number: 27, tibetan: 'ཉི་ཤུ་རྩ་བདུན', spelling: 'nyi shu rtsa bdun', english: 'twenty-seven', type: 'number' },
  { number: 28, tibetan: 'ཉི་ཤུ་རྩ་བརྒྱད', spelling: 'nyi shu rtsa brgyad', english: 'twenty-eight', type: 'number' },
  { number: 29, tibetan: 'ཉི་ཤུ་རྩ་དགུ', spelling: 'nyi shu rtsa dgu', english: 'twenty-nine', type: 'number' },
  { number: 30, tibetan: 'སུམ་ཅུ', spelling: 'sum cu', english: 'thirty', type: 'number' },
];

/**
 * Converts Tibetan numbers data to card format
 * Creates TWO sets of cards:
 * 1. Cards with Tibetan numerals on front → back shows Arabic number + Tibetan Script
 * 2. Cards with Tibetan Script on front → back shows Arabic number + Tibetan Numerals
 */
export function convertNumbersToCards() {
  const numeralCards = TIBETAN_NUMBERS.map((num, index) => {
    const tags = ['Numerals'];
    // Add "First 10" tag for numbers 0-9
    if (num.number >= 0 && num.number <= 9) {
      tags.push('First 10');
    }
    return {
      id: `number_numeral_${num.number}`,
      type: 'number',
      category: 'numbers',
      subcategory: 'numerals',
      tags: tags,
      front: numberToTibetanNumeral(num.number), // Tibetan numerals on front
      backArabic: num.number.toString(), // Arabic numeral on back
      backTibetanScript: num.tibetan, // Tibetan script on back
      createdAt: Date.now() - (TIBETAN_NUMBERS.length - index) * 1000
    };
  });

  const scriptCards = TIBETAN_NUMBERS.map((num, index) => {
    const tags = ['Numbers'];
    // Add "First 10" tag for numbers 0-9
    if (num.number >= 0 && num.number <= 9) {
      tags.push('First 10');
    }
    return {
      id: `number_script_${num.number}`,
      type: 'number',
      category: 'numbers',
      subcategory: 'script',
      tags: tags,
      front: num.tibetan, // Tibetan script on front
      backArabic: num.number.toString(), // Arabic numeral on back
      backTibetanNumeral: numberToTibetanNumeral(num.number), // Tibetan numerals on back
      createdAt: Date.now() - (TIBETAN_NUMBERS.length * 2 - index) * 1000
    };
  });

  return [...numeralCards, ...scriptCards];
}
