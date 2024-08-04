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
        const cell = th();
        cell.setAttribute('scope', 'col');
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
  const showMoreCell = td();
  showMoreCell.setAttribute('colspan', '100%');
  const showMoreLabel = label('Show More');
  showMoreCell.append(showMoreLabel);
  showMoreRow.append(showMoreCell);

  // Addition of show less row
  const showLessRow = tr({ class: 'showless' });
  const showLessCell = td();
  showLessCell.setAttribute('colspan', '100%');
  const showLessLabel = label('Show Less');
  showLessCell.append(showLessLabel);
  showLessRow.append(showLessCell);

  if (tbody.querySelectorAll('tr').length > 6) {
    tbody.append(showMoreRow);
    tbody.append(showLessRow);
    tbody.querySelectorAll('tr').forEach((row, i) => {
      if (i > 6 && !row.classList.contains('showmore')) {
        row.classList.add('hidden', 'shouldbehidden');
      }
    });
  }

  showMoreLabel.addEventListener('click', () => {
    tbody.querySelectorAll('tr').forEach((row) => {
      if (row.classList.contains('hidden')) {
        row.classList.remove('hidden');
      }
      if (row.classList.contains('showmore')) {
        row.classList.add('hidden');
      }
    });
  });

  showLessLabel.addEventListener('click', () => {
    tbody.querySelectorAll('tr').forEach((row) => {
      if (row.classList.contains('shouldbehidden')) {
        row.classList.add('hidden');
      }
      if (row.classList.contains('showmore')) {
        row.classList.remove('hidden');
      }
    });
  });

  block.innerHTML = '';
  block.append(table);
}
