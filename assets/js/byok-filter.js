/*
 * Build Your Own Kit — Lọc theo nhóm, tìm kiếm, sắp xếp.
 * - Chỉ ẩn/hiện và đổi thứ tự thẻ có sẵn trong DOM, không tạo lại thẻ,
 *   nên số lượng đã chọn (build-your-own-kit.js) luôn được giữ nguyên.
 * - Giữ tiêu đề từng nhóm; sắp xếp áp dụng trong mỗi nhóm.
 * - Tìm kiếm không phân biệt dấu tiếng Việt ("ca phe" khớp "Cà phê"), debounce 300ms.
 */
(function () {
  'use strict';

  var root = document.querySelector('.js-byok-filter');
  if (!root) return;

  var state = { category: 'all', query: '', sort: 'popular' };
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-category-group]'));
  var pills = Array.prototype.slice.call(root.querySelectorAll('.js-filter-pill'));
  var search = root.querySelector('.js-filter-search');
  var sort = root.querySelector('.js-filter-sort');
  var status = root.querySelector('.js-filter-status');
  var empty = document.querySelector('.js-filter-empty');
  var reset = document.querySelector('.js-filter-reset');

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Dữ liệu gốc của từng thẻ (không bao giờ sửa).
  var cards = [];
  groups.forEach(function (group) {
    var grid = group.querySelector('.sk-byok-grid');
    Array.prototype.slice.call(group.querySelectorAll('.js-byok-card')).forEach(function (el, i) {
      cards.push({
        el: el,
        grid: grid,
        group: group,
        order: i,
        name: el.getAttribute('data-name') || '',
        price: Number(el.getAttribute('data-price')) || 0,
        popularity: Number(el.getAttribute('data-popularity')) || 0,
        category: el.getAttribute('data-category') || '',
        haystack: normalize(el.getAttribute('data-search') || el.getAttribute('data-name'))
      });
    });
  });

  var comparators = {
    popular: function (a, b) { return (b.popularity - a.popularity) || (a.price - b.price) || (a.order - b.order); },
    price_asc: function (a, b) { return (a.price - b.price) || (a.order - b.order); },
    price_desc: function (a, b) { return (b.price - a.price) || (a.order - b.order); },
    name_asc: function (a, b) { return a.name.localeCompare(b.name, 'vi'); }
  };

  function apply() {
    var terms = normalize(state.query).split(' ').filter(Boolean);
    var compare = comparators[state.sort] || comparators.popular;
    var visible = 0;

    groups.forEach(function (group) {
      var inGroup = cards.filter(function (c) { return c.group === group; });
      var shown = 0;
      inGroup.slice().sort(compare).forEach(function (c) {
        var match = (state.category === 'all' || c.category === state.category) &&
          terms.every(function (t) { return c.haystack.indexOf(t) !== -1; });
        c.el.hidden = !match;
        c.grid.appendChild(c.el); // đổi thứ tự, giữ nguyên node và trạng thái
        if (match) shown += 1;
      });
      group.hidden = shown === 0;
      visible += shown;
    });

    if (empty) empty.hidden = visible !== 0;
    if (status) {
      var filtered = state.category !== 'all' || terms.length > 0;
      status.textContent = filtered ? 'Đang hiển thị ' + visible + '/' + cards.length + ' món' : '';
    }
  }

  function scrollToListIfNeeded() {
    var top = root.getBoundingClientRect().top;
    if (top < 0) {
      var header = document.querySelector('.navigation, header');
      var offset = header ? header.getBoundingClientRect().height + 12 : 12;
      window.scrollTo({ top: window.pageYOffset + top - offset, behavior: 'smooth' });
    }
  }

  function setCategory(cat) {
    state.category = cat;
    pills.forEach(function (p) {
      var on = p.getAttribute('data-filter-category') === cat;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    apply();
    scrollToListIfNeeded();
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () { setCategory(p.getAttribute('data-filter-category')); });
  });

  var timer = null;
  if (search) {
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.query = search.value; apply(); }, 300);
    });
  }

  if (sort) {
    sort.addEventListener('change', function () { state.sort = sort.value; apply(); });
  }

  if (reset) {
    reset.addEventListener('click', function () {
      if (search) search.value = '';
      state.query = '';
      setCategory('all');
      if (search) search.focus();
    });
  }

  apply();
})();
