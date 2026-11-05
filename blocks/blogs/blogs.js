import {
  formatDate,
  extractWraperDiv,
  getBlogsData,
  getCategories,
} from '../../scripts/utils.js';

export default async function decorate(block) {
  const response = await fetch('/en/query-index.json');
  const data = await response.json();
  console.log('queryIndex', data);
  // 1. If a blog title is in the URL query, hide this entire list block
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('title')) {
    block.style.display = 'none'; // Completely hides the list view component
    return; // Stops execution immediately
  }

  const blogsList = [...block.children];
  const blogsData = (await getBlogsData()) || [];
  const categoriesData = (await getCategories()) || [];
  console.log('blogsList', blogsList);
  console.log('categoriesData', categoriesData);

  blogsList.forEach((blog, index) => {
    const cols = [...blog.children];
    const data = blogsData[index];

    // Create wrappers
    const bannerWrapper = document.createElement('div');
    bannerWrapper.classList.add('blog__banner');

    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('blog__content');

    const authorDate = document.createElement('div');
    authorDate.classList.add('blog__author-date');

    // Move existing elements
    if (cols[0])
      bannerWrapper.appendChild(extractWraperDiv(cols[0], 'picture')); // image
    if (cols[1])
      contentWrapper.appendChild(extractWraperDiv(cols[1], 'p', 'blog__title')); // title
    if (cols[3]) {
      const dateEl = extractWraperDiv(cols[3], 'p', 'blog__date');
      dateEl.textContent = formatDate(dateEl.textContent);
      authorDate.appendChild(dateEl);
    } // date
    if (cols[4]) {
      authorDate.appendChild(extractWraperDiv(cols[4], 'p', 'blog__author')); // author
    }
    if (cols[5]) {
      contentWrapper?.appendChild(
        extractWraperDiv(cols[5], 'p', 'blog__category'),
      );
    } // category

    // Clear blog row row items
    blog.innerHTML = '';

    // Append structured layout
    blog.appendChild(bannerWrapper);
    contentWrapper.appendChild(authorDate);
    blog.appendChild(contentWrapper);

    blog.classList.add('blog');

    // Dynamic language path isolation
    const lang = window.location.pathname.split('/')[1] || 'en';

    blog.addEventListener('click', () => {
      // Create a clean layout data object matching your details component requirements
      const payload = {
        banner: bannerWrapper.innerHTML, // Passes the full inner picture markup
        title:
          data?.title || blog.querySelector('.blog__title')?.textContent || '',
        category:
          data?.category ||
          blog.querySelector('.blog__category')?.textContent ||
          '',
        author:
          data?.author ||
          blog.querySelector('.blog__author')?.textContent ||
          '',
        date:
          data?.date || blog.querySelector('.blog__date')?.textContent || '',
        description: data?.description || '',
      };

      sessionStorage.setItem('blogDetail', JSON.stringify(payload));

      const slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      window.location.href = `/${lang}/blogs?title=${slug}`;
    });
  });
}
