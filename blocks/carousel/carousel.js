import {
  div, h3, p, h1, a, ul, li,
  button,
} from '../../scripts/dom-helpers.js';
import { fetchPlaceholders } from '../../scripts/aem.js';
import ArticleList from '../../scripts/article-list.js';

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');
  const container = div({ class: 'carousel-container' });
  const $articles = ul({ class: 'carousel-slides' });
  const articlesPerPage = 4;

  const $articleCard = (article) =>
    // eslint-disable-next-line function-paren-newline, implicit-arrow-linebreak
    li({ class: 'carousel-slide', 'data-slide-index': article.index },
      // eslint-disable-next-line function-paren-newline
      a({ href: article.path },
        // eslint-disable-next-line function-paren-newline
        h3(article.title)),
      p(article.description),
      p(article.image),
    );

  const $newsPage = div(
    h1('News'),
    $articles,
  );

  block.append($newsPage);

  const articleList = new ArticleList({
    jsonPath: '/en/news/query-index.json',
    articleContainer: $articles,
    articleCard: $articleCard,
    articlesPerPage,
  });

  await articleList.render();

  function showSlide(block, slideIndex) {
    console.log('initial index passed:', slideIndex);
    const slides = block.querySelectorAll('.carousel-slide');
    let realSlideIndex = slideIndex < 0 ? slideIndex : slideIndex - 1;

    if (slideIndex >= slides.length) realSlideIndex = 0;
    const activeSlide = slides[realSlideIndex];
    console.log('realSlideIndex:', realSlideIndex);
    console.log('slideIndex:', slideIndex);
    activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
    block.querySelector('.carousel-slides').scrollTo({
      top: 0,
      left: activeSlide.offsetLeft,
      behavior: 'smooth',
    });
  }

  function updateActiveSlide(slide) {
    const nextSlide = slide.closest('.carousel-slide');
    const slideIndex = parseInt(slide.dataset.slideIndex, 10);
    nextSlide.dataset.activeSlide = slideIndex;

    const slides = document.querySelectorAll('.carousel-slide');
    slides.forEach((aSlide, idx) => {
      aSlide.setAttribute('aria-hidden', idx !== slideIndex);

      aSlide.querySelectorAll('a').forEach((link) => {
        if (idx !== slideIndex) {
          link.setAttribute('tabindex', '-1');
        } else {
          link.removeAttribute('tabindex');
        }
      });
    });

    const indicators = block.querySelectorAll('.carousel-slide-indicator');
    indicators.forEach((indicator, idx) => {
      if (idx !== slideIndex) {
        indicator.querySelector('button').removeAttribute('disabled');
      } else {
        indicator.querySelector('button').setAttribute('disabled', 'true');
      }
    });
  }

  function bindEvents(indicatorBlock) {
    const slideIndicators = indicatorBlock.querySelector('.carousel-slide-indicators');
    if (!slideIndicators) return;

    slideIndicators.querySelectorAll('button').forEach((indicatorButton) => {
      indicatorButton.addEventListener('click', (e) => {
        const slideIndicator = e.currentTarget.parentElement;
        console.log('slideIndicator:', slideIndicator);
        console.log('slideIndicator.dataset.targetSlide:', slideIndicator.dataset.targetSlide);
        showSlide(block, slideIndicator.dataset.targetSlide);
      });
    });

    indicatorBlock.querySelector('.slide-prev').addEventListener('click', () => {
      console.log('activeSlide', parseInt(document.querySelector('.carousel-slide').dataset.activeSlide, 10));
      showSlide(indicatorBlock, parseInt(document.querySelector('.carousel-slide').dataset.activeSlide, 10) - 1);
    });
    indicatorBlock.querySelector('.slide-next').addEventListener('click', () => {
      console.log('activeSlide', parseInt(document.querySelector('.carousel-slide').dataset.activeSlide, 10));
      showSlide(indicatorBlock, parseInt(document.querySelector('.carousel-slide').dataset.activeSlide, 10) + 1);
    });

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target);
      });
    }, { threshold: 1 });
    indicatorBlock.querySelectorAll('.carousel-slide').forEach((slide) => {
      slideObserver.observe(slide);
    });
  }

  const listItems = block.querySelectorAll('.carousel-slide');
  listItems.forEach((item, index) => {
    item.setAttribute('id', `carousel-${carouselId}-slide-${index}`);
  });
  let slideIndicators;
  if (listItems.length > 1) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    for (let idx = 0; idx < listItems.length; idx += 1) {
      // const row = listItems[idx];
      if (slideIndicators) {
        const indicator = document.createElement('li');
        indicator.classList.add('carousel-slide-indicator');
        indicator.dataset.targetSlide = idx;
        indicator.innerHTML = `<button class="navButton" type="button" id=navButton-${idx}" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} of ${listItems.length}"></button>`;
        slideIndicators.append(indicator);
      }
    }
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <li><button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button></li>
      <li><button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button></li>
    `;

    container.append(slideNavButtons);
  }

  block.append(container);
  // AUTOPLAY - uncomment after testing
  function clickButton() {
    const slideNext = block.querySelector('.slide-next');
    document.querySelector('.slide-next').click();
    slideNext.click();
  }

  if (listItems.length > 1) {
    bindEvents(block);
  }
  // setInterval(clickButton, 1000);
}
