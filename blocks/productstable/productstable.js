/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child) => {
    [...child.children].forEach((col) => {
      const row = document.createElement('tr');
      col.querySelectorAll('div.heading').forEach((div) => {
        const cell = document.createElement('th');
        cell.setAttribute('scope', 'col');
        cell.innerHTML = div.innerHTML;
        row.append(cell);
        thead.append(row);
      });
      col.querySelectorAll('div.data').forEach((div) => {
        const cell = document.createElement('td');
        cell.innerHTML = div.innerHTML;
        row.append(cell);
        tbody.append(row);
      });
    });
  });
  block.innerHTML = '';
  block.append(table);
}
