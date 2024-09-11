import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const leftDiv = document.querySelector('.left.section');
  const rightDiv = document.querySelector('.right.section');

  [...block.children].forEach((row, r) => {
    if (r > 0) {
      const nexticondiv = div({ class: 'hotspot' });
      nexticondiv.classList.add([...row.children][0].textContent);
      const data = [...row.children][1].innerHTML;
      nexticondiv.addEventListener('click', () => {
        leftDiv.innerHTML = data;
        leftDiv.classList.remove('hidden');
        rightDiv.classList.add('postclick');
      });
      console.log(nexticondiv);
      row.after(nexticondiv);
      row.remove();
    }
  });
}
