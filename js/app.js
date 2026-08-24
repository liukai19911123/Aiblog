(function () {
  'use strict';

  var config = window.BLOG_CONFIG;
  var app = document.getElementById('app');
  var searchPanel = document.getElementById('searchPanel');
  var searchInput = document.getElementById('searchInput');
  var state = { query: '', category: '全部' };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    var date = new Date(value + 'T00:00:00');
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  function publishedPosts() {
    return config.posts.filter(function (post) { return post.published; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function readingTime(text) {
    var chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    var latin = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/\b\w+\b/g) || []).length;
    return Math.max(1, Math.ceil(chinese / 350 + latin / 220)) + ' 分钟阅读';
  }

  function setMeta(title, description) {
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', description || config.description);
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description || config.description);
  }

  function renderShellConfig() {
    document.getElementById('brandName').textContent = config.title;
    document.getElementById('brandTagline').textContent = config.tagline;
    document.getElementById('footerTitle').textContent = config.title;
    document.getElementById('footerText').textContent = config.description;
    document.getElementById('footerAuthor').textContent = config.author;
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    document.getElementById('footerSocials').innerHTML = config.socials.map(function (item) {
      var external = /^https?:/.test(item.url) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a href="' + escapeHtml(item.url) + '"' + external + '>' + escapeHtml(item.label) + '</a>';
    }).join('');
  }

  function getCategoryCounts(posts) {
    return posts.reduce(function (result, post) {
      result[post.category] = (result[post.category] || 0) + 1;
      return result;
    }, {});
  }

  function postCard(post) {
    return '<a class="post-card" href="#/article/' + encodeURIComponent(post.slug) + '">' +
      '<time class="post-date" datetime="' + escapeHtml(post.date) + '">' + formatDate(post.date) + '</time>' +
      '<div><span class="post-category">' + escapeHtml(post.category) + '</span>' +
      '<h3>' + escapeHtml(post.title) + '</h3>' +
      '<p>' + escapeHtml(post.excerpt) + '</p>' +
      '<div class="post-tags">' + post.tags.map(function (tag) { return '<span>#' + escapeHtml(tag) + '</span>'; }).join('') + '</div></div>' +
      '<span class="post-arrow" aria-hidden="true">→</span></a>';
  }

  function renderHome() {
    var allPosts = publishedPosts();
    var counts = getCategoryCounts(allPosts);
    var categories = ['全部'].concat(Object.keys(counts));
    var query = state.query.trim().toLowerCase();
    var posts = allPosts.filter(function (post) {
      var categoryMatch = state.category === '全部' || post.category === state.category;
      var haystack = [post.title, post.excerpt, post.category].concat(post.tags).join(' ').toLowerCase();
      return categoryMatch && (!query || haystack.indexOf(query) !== -1);
    });

    var categoryButtons = categories.map(function (category) {
      var count = category === '全部' ? allPosts.length : counts[category];
      return '<button class="category-button' + (state.category === category ? ' active' : '') + '" type="button" data-category="' + escapeHtml(category) + '"><span>' + escapeHtml(category) + '</span><span>' + count + '</span></button>';
    }).join('');

    app.innerHTML = '<div class="page-shell">' +
      '<section class="hero"><div><span class="eyebrow">Personal journal · since 2026</span><h1>' + config.heroTitle + '</h1><p class="hero-intro">' + escapeHtml(config.heroIntro) + '</p></div>' +
      '<aside class="hero-note"><span class="eyebrow">Currently</span><strong>' + escapeHtml(config.authorRole) + '</strong><span>正在持续学习、实践，也持续修正自己的答案。</span></aside></section>' +
      '<section class="archive-layout"><aside class="filter-sidebar"><h2>按主题浏览</h2><div class="category-list">' + categoryButtons + '</div></aside>' +
      '<div><header class="archive-head"><h2>' + (query ? '搜索结果' : state.category === '全部' ? '最近文章' : escapeHtml(state.category)) + '</h2><span class="archive-count">' + posts.length + ' POSTS</span></header>' +
      '<div class="post-list">' + (posts.length ? posts.map(postCard).join('') : '<div class="empty-state"><strong>没有找到相关文章</strong><span>换个关键词或分类试试看。</span></div>') + '</div></div></section></div>';

    Array.prototype.forEach.call(document.querySelectorAll('[data-category]'), function (button) {
      button.addEventListener('click', function () {
        state.category = button.dataset.category;
        renderHome();
      });
    });
    setMeta(config.title + ' · 个人博客', config.description);
  }

  function loading() {
    app.innerHTML = '<div class="loading"><div class="loading-mark" aria-label="正在加载"></div></div>';
  }

  function parseMarkdown(markdown) {
    if (!window.marked || !window.DOMPurify) throw new Error('Markdown renderer unavailable');
    marked.use({ gfm: true, breaks: false });
    return DOMPurify.sanitize(marked.parse(markdown));
  }

  function fetchText(path) {
    return fetch(new URL(path, document.baseURI)).then(function (response) {
      if (!response.ok) throw new Error('Content not found');
      return response.text();
    });
  }

  function renderArticle(slug) {
    var post = publishedPosts().find(function (item) { return item.slug === slug; });
    if (!post) return renderNotFound();
    loading();
    fetchText(post.file).then(function (markdown) {
      app.innerHTML = '<article class="article-shell"><a class="article-back" href="#/"><span aria-hidden="true">←</span> 返回文章列表</a>' +
        '<header class="article-header"><span class="eyebrow">' + escapeHtml(post.category) + '</span><h1>' + escapeHtml(post.title) + '</h1>' +
        '<div class="article-meta"><time datetime="' + escapeHtml(post.date) + '">' + formatDate(post.date) + '</time><span>' + readingTime(markdown) + '</span><span>' + escapeHtml(post.tags.join(' · ')) + '</span></div></header>' +
        '<div class="article-content">' + parseMarkdown(markdown) + '</div>' +
        '<footer class="article-end"><p>最后更新于 ' + formatDate(post.date) + '</p><button class="share-button" id="shareButton" type="button">复制文章链接</button></footer></article>';
      document.getElementById('shareButton').addEventListener('click', copyArticleLink);
      setMeta(post.title + ' · ' + config.title, post.excerpt);
      window.scrollTo(0, 0);
    }).catch(function () { renderContentError(); });
  }

  function renderAbout() {
    loading();
    fetchText('about.md').then(function (markdown) {
      app.innerHTML = '<div class="page-shell"><header class="about-hero"><div><span class="eyebrow">About me</span><h1>关于这个<br>博客与我。</h1></div><p class="about-lead">你好，我是' + escapeHtml(config.author) + '。这里不是知识的终点，而是一张持续生长的思考地图。</p></header>' +
        '<section class="about-grid"><aside class="about-aside"><strong>' + escapeHtml(config.authorRole) + '</strong><span>' + escapeHtml(config.email) + '</span></aside><div class="article-content">' + parseMarkdown(markdown) + '</div></section></div>';
      setMeta('关于 · ' + config.title, '关于作者与这个博客。');
      window.scrollTo(0, 0);
    }).catch(function () { renderContentError(); });
  }

  function renderNotFound() {
    app.innerHTML = '<div class="not-found"><span class="number">ERROR · 404</span><h1>这一页还没有写下。</h1><p>它可能被移动了，也可能从未存在。</p><a class="text-link" href="#/">回到文章列表</a></div>';
    setMeta('页面未找到 · ' + config.title, config.description);
  }

  function renderContentError() {
    app.innerHTML = '<div class="not-found"><span class="number">CONTENT · ERROR</span><h1>内容暂时无法读取。</h1><p>请通过本地服务器或静态网站托管访问本站，不要直接双击 HTML 文件。</p><a class="text-link" href="#/">回到文章列表</a></div>';
  }

  function updateNav(route) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-route]'), function (link) {
      link.classList.toggle('active', link.dataset.route === route);
    });
  }

  function route() {
    closeMobileMenu();
    var hash = window.location.hash || '#/';
    var articleMatch = hash.match(/^#\/article\/([^?]+)/);
    if (articleMatch) {
      updateNav('');
      renderArticle(decodeURIComponent(articleMatch[1]));
    } else if (hash === '#/about') {
      updateNav('about');
      renderAbout();
    } else if (hash === '#/' || hash === '#') {
      updateNav('home');
      renderHome();
      window.scrollTo(0, 0);
    } else {
      updateNav('');
      renderNotFound();
    }
  }

  function toggleSearch(force) {
    var shouldOpen = typeof force === 'boolean' ? force : searchPanel.hidden;
    searchPanel.hidden = !shouldOpen;
    document.getElementById('searchToggle').setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) setTimeout(function () { searchInput.focus(); }, 0);
  }

  function closeMobileMenu() {
    var menu = document.getElementById('mobileNav');
    var button = document.getElementById('menuToggle');
    menu.hidden = true;
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }

  function copyArticleLink() {
    var button = document.getElementById('shareButton');
    navigator.clipboard.writeText(window.location.href).then(function () {
      button.textContent = '链接已复制';
      setTimeout(function () { button.textContent = '复制文章链接'; }, 1600);
    });
  }

  document.getElementById('searchToggle').addEventListener('click', function () { toggleSearch(); });
  searchInput.addEventListener('input', function () {
    state.query = searchInput.value;
    if ((window.location.hash || '#/') !== '#/') window.location.hash = '#/';
    else renderHome();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !searchPanel.hidden) toggleSearch(false);
    if (event.key === '/' && document.activeElement !== searchInput) { event.preventDefault(); toggleSearch(true); }
  });
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('blog-theme', next);
  });
  document.getElementById('menuToggle').addEventListener('click', function () {
    var menu = document.getElementById('mobileNav');
    var open = menu.hidden;
    menu.hidden = !open;
    this.classList.toggle('open', open);
    this.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('backTop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('scroll', function () { document.getElementById('backTop').classList.toggle('visible', window.scrollY > 500); }, { passive: true });
  window.addEventListener('hashchange', route);

  renderShellConfig();
  route();
})();
