// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';

export default async function decorate(doc) {
  doc.querySelector('header').remove();
  doc.querySelector('footer').remove();
  doc.body.classList.add('tintingguide');
  doc.querySelector('.left').classList.add('hidden');
}
