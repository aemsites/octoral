/**
 * get the path segment at the specified index
 *
 * @param {number} index - The index of the path segment to retrieve.
 * @returns {string|null} The path segment or `null` if the index is out of bounds
 */
export default function getPathSegments() {
  const pathSegments = window.location.pathname.split('/').filter((segment) => segment);
  // Return the full array of segments
  return pathSegments;
}
