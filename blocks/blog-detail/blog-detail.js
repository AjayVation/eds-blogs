import { getSession } from '../../scripts/utils.js';

export default function decorate(block) {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedSlug = urlParams.get('title');
  const lang = window.location.pathname.split('/')[1] || 'en';

  // 1. Hide the block instantly if no blog was selected
  if (!selectedSlug) {
    block.style.display = 'none';
    block.innerHTML = '';
    return;
  }

  // 2. Ensure block visibility when a parameter match hits
  block.style.display = 'block';

  // 3. Extract payload details out of storage cache container
  const item = getSession('blogDetail');

  if (!item) {
    block.innerHTML = `<div class="blog-detail__inner"><p>Blog content not found. <a href="/${lang}/blogs">Go back to all blogs</a></p></div>`;
    return;
  }

  // Clear component container text node placeholders
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'blog-detail__inner';

  const banner = document.createElement('div');
  banner.className = 'blog-detail__banner';
  banner.innerHTML = item.banner || '';

  const body = document.createElement('div');
  body.className = 'blog-detail__body';

  const category = document.createElement('p');
  category.className = 'blog-detail__tags';
  category.textContent = item.category || 'General';

  const title = document.createElement('h1');
  title.className = 'blog-detail__title';
  title.textContent = item.title || '';

  const authorDate = document.createElement('p');
  authorDate.className = 'blog-detail__author-date';
  authorDate.textContent = `${item.author || 'Author'} | ${item.date || ''}`;

  const desc = document.createElement('div');
  desc.className = 'blog-detail__description';
  desc.innerHTML = item.description || ''; // Using innerHTML ensures paragraph layout flow tags remain unbroken

  body.append(category, title, authorDate, desc);
  wrapper.append(banner, body);
  block.append(wrapper);
}
