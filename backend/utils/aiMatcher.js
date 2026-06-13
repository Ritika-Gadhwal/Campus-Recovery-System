/**
 * Utility to calculate similarity between lost and found items.
 * Uses a weighted keyword overlap (Jaccard Similarity) model.
 */

// Helper to clean and tokenize text
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)            // Split by whitespace
    .filter(word => word.length > 2); // Ignore short words (the, of, is, a, etc.)
}

// Jaccard similarity coefficient (0 to 1)
function getJaccardSimilarity(arr1, arr2) {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculates a match score (0 to 100) between two items.
 * @param {Object} itemA - First item
 * @param {Object} itemB - Second item
 * @returns {Number} Score from 0 to 100
 */
function calculateMatchScore(itemA, itemB) {
  // If item types are the same, they shouldn't match (e.g., lost vs lost)
  if (itemA.itemType === itemB.itemType) return 0;

  let score = 0;

  // 1. Category Match (Weight: 30%)
  // If categories are different, similarity is heavily discounted
  if (itemA.category === itemB.category) {
    score += 30;
  } else {
    // If category is completely different, we cap match score low
    return 0;
  }

  // 2. Title Similarity (Weight: 40%)
  const tokensTitleA = tokenize(itemA.title);
  const tokensTitleB = tokenize(itemB.title);
  const titleSim = getJaccardSimilarity(tokensTitleA, tokensTitleB);
  score += titleSim * 40;

  // 3. Description Similarity (Weight: 20%)
  const tokensDescA = tokenize(itemA.description);
  const tokensDescB = tokenize(itemB.description);
  const descSim = getJaccardSimilarity(tokensDescA, tokensDescB);
  score += descSim * 20;

  // 4. Location Similarity (Weight: 10%)
  const tokensLocA = tokenize(itemA.location);
  const tokensLocB = tokenize(itemB.location);
  const locSim = getJaccardSimilarity(tokensLocA, tokensLocB);
  score += locSim * 10;

  // Round to nearest integer
  return Math.round(score);
}

/**
 * Finds potential matches for a given item in a pool of opposite item types.
 * @param {Object} targetItem - The item we want to match
 * @param {Array} itemsPool - Array of items to compare against
 * @param {Number} threshold - Minimum score to include (default: 30)
 * @returns {Array} List of matches with score parameter sorted descending
 */
function getMatchingSuggestions(targetItem, itemsPool, threshold = 30) {
  return itemsPool
    .map(item => {
      const score = calculateMatchScore(targetItem, item);
      return { item, score };
    })
    .filter(match => match.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

module.exports = {
  calculateMatchScore,
  getMatchingSuggestions
};
