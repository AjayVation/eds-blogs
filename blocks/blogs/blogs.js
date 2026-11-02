import {
  formatDate, extractWraperDiv, getBlogsData, getCategories,
} from '../../scripts/utils.js';

export default async function decorate(block) {
  const blogsList = [...block.children];
  const blogsData = await getBlogsData() || [];
  const categoriesData = await getCategories() || [];
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

    // Move existing elements (IMPORTANT)
    if (cols[0]) bannerWrapper.appendChild(extractWraperDiv(cols[0], 'picture')); // image
    if (cols[1]) contentWrapper.appendChild(extractWraperDiv(cols[1], 'p', 'blog__title')); // title
    if (cols[3]) {
      const dateEl = extractWraperDiv(cols[3], 'p', 'blog__date');
      dateEl.textContent = formatDate(dateEl.textContent);
      authorDate.appendChild(dateEl);
    } // date
    if (cols[4]) authorDate.appendChild(extractWraperDiv(cols[4], 'p', 'blog__author')); // author
    if (cols[5]) contentWrapper?.appendChild(extractWraperDiv(cols[5], 'p', 'blog__category')); // category

    // Clear blog row
    blog.innerHTML = '';

    // Append structured layout
    blog.appendChild(bannerWrapper);
    contentWrapper.appendChild(authorDate);
    blog.appendChild(contentWrapper);

    blog.classList.add('blog');
    blog.addEventListener('click', () => {
      sessionStorage.setItem('blogDetail', JSON.stringify(data));
      const slug = data?.title?.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
      window.location.href = `/blogs/blog-detail?title=${slug}`;
    });
  });
}
