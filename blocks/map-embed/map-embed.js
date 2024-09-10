import { iframe, h1 } from '../../scripts/dom-helpers.js';
import { getPathSegments } from '../../scripts/utils.js';

export default function decorate(block) {
  const [locale] = getPathSegments();
  // heading translations
  const routeHeading = [
    { code: 'de', label: 'Anfahrt' },
    { code: 'en', label: 'Directions' },
    { code: 'es', label: '¿Cómo llegar?' },
    { code: 'fr', label: 'Directions' },
    { code: 'it', label: 'Indicazioni' },
    { code: 'nl', label: 'Directions' },
  ];

  const $heading = h1(routeHeading.filter((route) => route.code === locale)[0].label);
  const $mapEmbedUrl = block.querySelector('a').href;
  const $iframe = iframe(
    {
      src: $mapEmbedUrl,
      allowFullscreen: true,
      frameBorder: 0,
      class: 'map-embed',
    },
  );
  block.replaceWith($heading, $iframe);
}
