/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

function embedYoutube(url, autoplay) {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
}

const loadVideoEmbed = (block, link, autoplay) => {
  if (block.dataset.embedIsLoaded) {
    return;
  }
  const url = new URL(link);
  const isYoutube = link.includes('youtube') || link.includes('youtu.be');

  if (isYoutube) {
    block.innerHTML = embedYoutube(url, autoplay);
  }
  block.dataset.embedIsLoaded = true;
};

export default async function decorate(block) {
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.innerHTML = '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadVideoEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    block.classList.add('lazy-loading');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideoEmbed(block, link, false);
        block.classList.remove('lazy-loading');
      }
    });
    observer.observe(block);
  }
}
