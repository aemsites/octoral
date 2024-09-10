/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, h3, p, a, ul, li } from '../../scripts/dom-helpers.js';
import ArticleList from '../../scripts/article-list.js';
import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';

let autoInterval;
let autoDuration = 8000; // default if not set in block
let isInitialLoad = true;
const scrollSpeed = 1000;

// auto slide functions
function startAuto(block) {
  if (!autoInterval) {
    autoInterval = setInterval(() => {
      // get data-active-slide attribute from block
      const activeSlide = parseInt(block.dataset.activeSlide, 10);
      // if activeSlide is the last slide, go to the first slide
      if (activeSlide === block.querySelectorAll('.carousel-slide').length - 1) {
        showSlide(block, 0);
      }
      showSlide(block, activeSlide + 1);
    }, autoDuration);
  }
}

function stopAuto() {
  clearInterval(autoInterval);
  autoInterval = undefined;
}

function initAuto(block) {
  block.dataset.activeSlide = 0;
  const autoSlide = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // delay first auto slide to allow for initial load
        if (isInitialLoad) {
          setTimeout(() => startAuto(block), 1000);
          isInitialLoad = false;
        } else {
          startAuto(block);
        }
      } else {
        stopAuto();
      }
    });
  };
  const autoObserver = new IntersectionObserver(autoSlide, { threshold: 0.5 });
  autoObserver.observe(block);

  // pause when mouse is over
  block.addEventListener('mouseenter', () => stopAuto());
  block.addEventListener('mouseleave', () => startAuto(block));

  // pause when tab is not active or window is not focused
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') stopAuto();
    else startAuto(block);
  });
  window.addEventListener('blur', () => {
    stopAuto();
  });
  window.addEventListener('focus', () => {
    startAuto(block);
  });
}

function smoothScrollTo(container, targetPosition, duration) {
  const startPosition = container.scrollLeft;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
    container.scrollLeft = startPosition + (distance * ease);
    if (elapsed < duration) {
      requestAnimationFrame(animation); // Continue the animation
    }
  }
  requestAnimationFrame(animation);
}

function showSlide(block, slideIndex) {
  const $slides = block.querySelector('.carousel-slides');
  const $indicators = block.querySelectorAll('.carousel-nav li');
  const $activeSlide = block.querySelectorAll('.carousel-slide')[slideIndex];
  // calculate scroll position factoring in padding
  const activeSlideRect = $activeSlide.getBoundingClientRect();
  const slidesRect = $slides.getBoundingClientRect();
  const scrollPosition = activeSlideRect.left - slidesRect.left + $slides.scrollLeft;
  smoothScrollTo($slides, scrollPosition, scrollSpeed);
  $indicators.forEach(($li) => { $li.classList.remove('active'); });
  $indicators[slideIndex].classList.add('active');
  block.dataset.activeSlide = slideIndex;
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const maxArticles = blockConfig['number-of-articles-to-show'] || 5;
  autoDuration = blockConfig['auto-duration'];
  block.innerHTML = '';

  const $newsArticles = ul({ class: 'carousel-slides' });
  const $newsCard = (article) => li({ class: 'carousel-slide', 'data-slide-index': article.index },
    a({ href: article.path },
      div(
        h3(article.title),
        p(article.description),
      ),
      createOptimizedPicture(article.image, article.title, true, [{ width: '280' }]),
    ),
  );

  const $carouselNav = ul({ class: 'carousel-nav' });
  Array.from({ length: maxArticles }).forEach((_, index) => {
    const $li = li();
    $li.addEventListener('click', () => {
      showSlide(block, index);
    });
    if (index === 0) $li.classList.add('active');
    $carouselNav.append($li);
  });

  const articleList = new ArticleList({
    jsonPath: blockConfig['data-source'],
    articleContainer: $newsArticles,
    articleCard: $newsCard,
    articlesPerPage: maxArticles,
  });
  await articleList.render();

  block.append($newsArticles, $carouselNav);
  initAuto(block);
}
