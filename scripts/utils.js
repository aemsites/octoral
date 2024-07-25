/**
 * get the path segment at the specified index
 *
 * @param {number} index - The index of the path segment to retrieve.
 * @returns {string|null} The path segment or `null` if the index is out of bounds
 */
export default function getPathSegment(index) {
  const pathSegments = window.location.pathname.split('/').filter((segment) => segment);
  return pathSegments.length > index ? pathSegments[index] : null;
}
