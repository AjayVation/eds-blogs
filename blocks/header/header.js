import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getBlogsData, getCategories } from '../../scripts/utils.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  window.blogsData = await getBlogsData();

  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  navBrand.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/';
  });
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navData = await getCategories() || [];
  const navSections = nav.querySelector('.nav-sections');

  if (navSections) {
    // Clear existing nav items
    const defaultWrapper = navSections.querySelector('.default-content-wrapper');
    if (defaultWrapper) {
      const mainUl = defaultWrapper.querySelector('ul');
      if (mainUl) {
        mainUl.replaceChildren(); // Clear all existing LI items
      }
    }

    // Build new list from categories data
    if (navData.length > 0) {
      if (defaultWrapper) {
        let mainUl = defaultWrapper.querySelector('ul');
        if (!mainUl) {
          mainUl = document.createElement('ul');
          defaultWrapper.appendChild(mainUl);
        }

        navData.forEach((category) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `/blogs?category=${category.slug}`;
          a.textContent = category.name;
          li.appendChild(a);
          mainUl.appendChild(li);

          // Add active class logic based on category query parameter
          const currentUrl = new URL(window.location);
          const currentCategory = currentUrl.searchParams.get('category');
          if (currentCategory === category.slug) li.classList.add('active');

          li.addEventListener('click', () => {
            if (isDesktop.matches) {
              const expanded = li.getAttribute('aria-expanded') === 'true';
              toggleAllNavSections(navSections);
              li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            }
          });
        });
      }
    }
  }

  const iconSearch = nav.querySelector('.icon-search');
  if (iconSearch) {
    const search = document.createElement('div');
    search.className = 'search';
    search.innerHTML = `
      <input id="global-search" type="text" placeholder="Search..." />
      <span class="icon icon-search">
        <img src="/icons/search.svg" alt="search" width="16" height="16" />
      </span>
      <div id="search-results" class="hidden"></div>
    `;
    iconSearch.closest('p')?.replaceWith(search);

    const searchInput = search.querySelector('#global-search');
    const searchResults = search.querySelector('#search-results');
    const renderSearchResults = async () => {
      const query = searchInput.value.trim().toLowerCase();
      searchResults.replaceChildren();
      if (!query) {
        searchResults.classList.add('hidden');
        return;
      }
      const response = await fetch('/query-index.json?limit=1000');
      const json = await response.json();
      console.log('queryIndexjson', json);
      const matches = (window.blogsData || []).filter((blog) => {
        const searchableText = [blog.title, blog.description, blog.author, blog.category, blog.tags]
          .join(' ')
          .toLowerCase();
        return searchableText.includes(query);
      }).slice(0, 6);

      matches.forEach((blog) => {
        const result = document.createElement('a');
        result.href = `/blogs/blog-detail?title=${blog.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')}`;
        result.textContent = blog.title;
        searchResults.append(result);
      });
      searchResults.classList.remove('hidden');
    };

    searchInput.addEventListener('input', renderSearchResults);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        search.classList.add('search-active');
        renderSearchResults();
      }
    });
    search.addEventListener('click', () => search.classList.add('search-active'));
    document.addEventListener('click', (event) => {
      if (!search.contains(event.target)) {
        search.classList.remove('search-active');
        searchResults.classList.add('hidden');
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
