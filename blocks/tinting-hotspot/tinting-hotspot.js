import { div, button } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const leftDiv = document.querySelector('.left.section');
  const rightDiv = document.querySelector('.right.section');
  const navDiv = div({ class: 'nav' }, button('X'));
  const contentDiv = div({ class: 'content' });

  [...block.children].forEach((row, r) => {
    if (r > 0) {
      const nexticondiv = div({ class: 'hotspot' });
      nexticondiv.style.margin = `${[...row.children][2].textContent} 0 0 ${[...row.children][3].textContent}`;
      const data = [...row.children][1].innerHTML;
      nexticondiv.addEventListener('click', () => {
        leftDiv.innerHTML = '';
        contentDiv.innerHTML = data;
        leftDiv.appendChild(navDiv);
        leftDiv.appendChild(contentDiv);
        leftDiv.classList.remove('hidden');
        rightDiv.classList.add('postclick');
      });
      row.after(nexticondiv);
      row.remove();
    }
  });
}
