import {
  label, tr, th, td,
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child) => {
    [...child.children].forEach((col) => {
      // const row = document.createElement('tr');
      const row = tr();
      col.querySelectorAll('div.heading').forEach((div) => {
        const cell = th({ scope: 'col' });
        cell.innerHTML = div.innerHTML;
        row.append(cell); 
        thead.append(row);
      });
      col.querySelectorAll('div.data').forEach((div) => {
        const cell = td();
        cell.innerHTML = div.innerHTML;
        row.append(cell);
        tbody.append(row);
      });
    });
  });

  // Addition of show more row
  const showMoreRow = tr({ class: 'showmore' });
  const showMoreCell = td({ colspan: '100%' });
  const showMoreLabel = label('Show More');
  showMoreCell.append(showMoreLabel);
  showMoreRow.append(showMoreCell);

  if (tbody.querySelectorAll('tr').length > 6) {
    tbody.querySelectorAll('tr').forEach((row, i) => {
      if (i > 6) {
        row.classList.add('hidden', 'shouldbehidden');
      }
    });
    tbody.append(showMoreRow);
  }

  const toggle = () => {
    tbody.querySelectorAll('tr.shouldbehidden').forEach((row) => {
      row.classList.toggle('hidden');
    });
    showMoreLabel.textContent = showMoreLabel.textContent === 'Show More' ? 'Show Less' : 'Show More';
  };

  showMoreLabel.addEventListener('click', toggle);

  block.innerHTML = '';
  block.append(table);
}
