/**
 * Retrieves the path segments of the current window's pathname.
 * The pathname is split into segments by '/' (ignoring empty segments),
 * and the segments are returned as an array.
 * @returns {string[]} An array of path segments.
 */
export function getPathSegments() {
  return window.location.pathname.split('/')
    .filter((segment) => segment);
}

let translations = {};

// Function to fetch translations and return a lookup object
export async function loadTranslations(url, locale) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch translations');
    const data = await response.json();

    // Create a lookup object for translations
    translations = data.data.reduce((acc, item) => {
      acc[item.key] = item[locale] || item.en; // Fallback to en if locale is not available
      return acc;
    }, {});

    return translations;
  } catch (error) {
    console.error('Error loading translations:', error);
    return {};
  }
}

// Function to get translated text based on key
export function translate(key) {
  return translations[key] || key;
}

export function normalizeString(str) {
  return str.toLowerCase().replace(/ /g, '_');
}
