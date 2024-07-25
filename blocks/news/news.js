import {
    getMetadata,
} from '../../scripts/aem.js';
export default async function decorate(block) {

    // Add News list navigation
    const newsList = document.createElement('h2');
    const anchor = document.createElement('a');
    anchor.href = '/en/news';
    anchor.textContent = "NEWS"; // TO-DO - change specific to language
    newsList.appendChild(anchor);
    block.insertBefore(newsList, block.firstChild);

    // Handle Publish and Update date time
    const dateEl = document.querySelector('.news.block div div p');
    if(dateEl) {
        const dateText = dateEl.textContent;
        // Regular expression to match date format (e.g., YYYY-MM-DD)
        const dateRegex = /^\d{2}-\d{2}-\d{4}/;
        const dateMatch = dateText.match(dateRegex);

        if (dateMatch) {
            const [date, date_time] = dateText.split(" ");
            dateEl.setAttribute('title', date_time);
            dateEl.innerHTML = date;
            dateEl.classList.add('published');
            const updateDateEl = document.createElement('p');
            updateDateEl.innerHTML = getMetadata('updateddatetime')
            ;

            const dateParent = document.createElement('div')
            dateParent.classList.add('entry-meta');
            dateParent.appendChild(dateEl.cloneNode(true));
            dateParent.appendChild(updateDateEl);

            dateEl.replaceWith(dateParent)
        } else {
            console.error('Publish date not found:', dateText);
        }
    }

    // Handle Brochure Links
    const brochureEls = document.querySelectorAll('.button-container')
    brochureEls.forEach((brochureEl) => {
        const brochureLinks = brochureEl.querySelectorAll('a');
        brochureLinks.forEach((brochureLink) => {
            brochureLink.classList.remove('button');
            brochureLink.classList.add('brochure-link');
        });
    })

    // Handle brochure Download button, if present
    const img = document.querySelector('p img[alt="Download Button"]');
    if(img) {
        const par = img.parentNode;
        let sibling = par;
        while(sibling.nodeName !== 'A') {
            sibling = sibling.nextSibling;
        }
        sibling.replaceChildren(img);
    }
}