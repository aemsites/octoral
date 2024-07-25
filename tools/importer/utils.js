/* global WebImporter */

export const createMetadata = (main, document, params) => {
    const meta = {};

    const title = document.querySelector('title');
    if (title) {
        meta.Title = title.textContent.replace(/[\n\t]/gm, '');
    }

    const desc = document.querySelector('[property="og:description"]');
    if (desc) {
        meta.Description = desc.content;
    }

    const img = document.querySelector('[property="og:image"]');
    if (img && img.content) {
        const el = document.createElement('img');
        el.src = img.content.replaceAll('https://www.octoral.com', '');
        meta.Image = el;
    }

    if (params.preProcessMetadata && Object.keys(params.preProcessMetadata).length) {
        Object.assign(meta, params.preProcessMetadata);
    }

    const block = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(block);

    return meta;
};
