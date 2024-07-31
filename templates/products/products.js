// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section, p } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import getPathSegments from '../../scripts/utils.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $content = $page.querySelector('.default-content-wrapper');
  // eslint-disable-next-line no-unused-vars
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  const navFrag = await loadFragment('/aside-nav');
  const $asideNav = navFrag.querySelector('.aside-nav-wrapper').cloneNode(true);

  const $aside = aside(
    $asideNav,
  );

  const $section = section(
    $content,
    p(`locale = ${locale}`),
    p(`vocCompliant = ${vocCompliant}`),
    p(`type = ${type}`),
    p(`title = ${title}`),
    p('get data from products.json & display here'),
  );

  $page.append($aside, $section);
}
