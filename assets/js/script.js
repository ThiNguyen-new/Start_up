// Preloader js    
$(window).on('load', function () {
  $('.preloader').fadeOut(100);
});

(function ($) {
  'use strict';

  // navigation
  $(window).scroll(function () {
    if ($('.navigation').offset().top > 1) {
      $('.navigation').addClass('nav-bg');
    } else {
      $('.navigation').removeClass('nav-bg');
    }
  });


  // video modal popup
  var $videoSrc;
  $('.video-modal').click(function () {
    $videoSrc = $(this).data("src");
  });
  $('#videoModal').on('shown.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  })
  $('#videoModal').on('hide.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc);
  })
  $('#videoModal2').on('shown.bs.modal', function (e) {
    $("#video2").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  })
  $('#videoModal2').on('hide.bs.modal', function (e) {
    $("#video2").attr('src', $videoSrc);
  })


  // testimonial slider
  $('.testimonial-slider').slick({
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '<button type=\'button\' class=\'prevArrow\'><i class=\'ti-arrow-left\'></i></button>',
    nextArrow: '<button type=\'button\' class=\'nextArrow\'><i class=\'ti-arrow-right\'></i></button>',
    autoplay: true,
    responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 401,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });


  // product Slider
  $('.product-slider').slick({
    autoplay: false,
    infinite: true,
    arrows: false,
    dots: true,
    customPaging: function (slider, i) {
      // Lấy ảnh đã xử lý trong slide (src đã được Hugo đổi sang đường dẫn tương đối),
      // không dùng data-image (đường dẫn ảnh gốc trong assets/, không được publish
      // và vỡ khi site chạy trong thư mục con như /Start_up/ trên GitHub Pages).
      var $slide = $(slider.$slides[i]);
      var $img = $slide.find('img').first();
      var image = ($img.length && ($img.prop('currentSrc') || $img.prop('src'))) || $slide.data('image');
      return '<img class="img-fluid" src="' + image + '" alt="product-img">';
    }
  });


  // Accordions
  $('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
  }).on('hidden.bs.collapse', function () {
    $(this).parent().find('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
  });


  // Survival Kit — Panic Level Meter, product filters, schedule & gifting (MVP, no backend)

  var PRICE_BANDS = {
    mini: { min: 39000, max: 59000 },
    standard: { min: 79000, max: 129000 },
    premium: { min: 149000, max: 229000 }
  };

  function attrOrData($el, name) {
    var attr = $el.attr(name);
    if (attr !== undefined && attr !== '') {
      return String(attr);
    }
    var camel = name.replace(/^data-/, '').replace(/-([a-z])/g, function (_, c) {
      return c.toUpperCase();
    });
    var value = $el.data(camel);
    if (value === undefined || value === null || value === '') {
      return '';
    }
    return String(value);
  }

  function parsePrice($card) {
    var raw = attrOrData($card, 'data-price');
    if (!raw) {
      return NaN;
    }
    return Number(String(raw).replace(/[^\d.]/g, ''));
  }

  function priceBandOf($card) {
    var band = attrOrData($card, 'data-price-band').toLowerCase();
    if (band) {
      return band;
    }
    var price = parsePrice($card);
    if (isNaN(price)) {
      return '';
    }
    var key;
    for (key in PRICE_BANDS) {
      if (price >= PRICE_BANDS[key].min && price <= PRICE_BANDS[key].max) {
        return key;
      }
    }
    return '';
  }

  function selectedPanicLevel() {
    var $slider = $('.js-panic-slider');
    if ($slider.length) {
      return String($slider.val() || '');
    }
    var $pressed = $('.js-panic-level[aria-pressed="true"]');
    if ($pressed.length) {
      return attrOrData($pressed.first(), 'data-panic-level') || attrOrData($pressed.first(), 'data-level');
    }
    return '';
  }

  function applyKitFilters() {
    var $cards = $('.js-kit-card');
    if (!$cards.length) {
      return;
    }

    var level = selectedPanicLevel();
    var kitType = ($('.js-kit-filter-type').val() || '').toString().toLowerCase();
    var priceBand = ($('.js-kit-filter-price').val() || '').toString().toLowerCase();
    var visible = 0;

    $cards.each(function () {
      var $card = $(this);
      var match = true;
      var cardLevel = attrOrData($card, 'data-panic-level');
      var cardType = attrOrData($card, 'data-kit-type').toLowerCase();
      var cardBand = priceBandOf($card);

      if (level && cardLevel && cardLevel !== level) {
        match = false;
      }
      if (kitType && cardType !== kitType) {
        match = false;
      }
      if (priceBand && cardBand !== priceBand) {
        match = false;
      }

      $card.toggle(match);
      if (match) {
        visible += 1;
      }
    });

    if (visible === 0) {
      $('.js-kit-empty').removeAttr('hidden').show();
    } else {
      $('.js-kit-empty').attr('hidden', 'hidden').hide();
    }
  }

  var lastPanicLevel = null;
  var showcaseFrame = null;

  function currentLevelValue() {
    if (window.PanicLevel) { return window.PanicLevel.get(); }
    return Number($('.js-panic-slider').val() || 3);
  }

  function renderKitShowcase(level) {
    var box = document.querySelector('.js-panic-kit-showcase');
    if (!box || !window.KitRecommend) { return; }
    var rec = window.KitRecommend.recommend(window.KitRecommend.getCategory(), level);
    if (!rec) { return; }
    var pick = function (sel) { return box.querySelector(sel); };
    pick('.js-panic-kit-title').textContent = rec.kit.name;
    pick('.js-panic-kit-type').textContent = rec.category.name;
    pick('.js-panic-kit-desc').textContent = rec.kit.tagline;
    pick('.js-panic-kit-price').textContent = window.KitRecommend.formatVND(rec.total);
    var list = pick('.js-panic-kit-items');
    if (list) {
      list.textContent = '';
      rec.items.forEach(function (it) {
        var li = document.createElement('li');
        li.className = 'sk-kit-chip';
        var img = document.createElement('img');
        img.src = it.image;
        img.alt = '';
        img.width = 32;
        img.height = 32;
        img.loading = 'lazy';
        var label = document.createElement('span');
        label.textContent = it.name + ' × ' + it.qty;
        li.appendChild(img);
        li.appendChild(label);
        list.appendChild(li);
      });
    }
    var btn = pick('.js-panic-explore-btn');
    if (btn) {
      var base = box.getAttribute('data-build-url') || '/build-your-own-kit/';
      btn.setAttribute('href', base + '?category=' + encodeURIComponent(rec.category.id) +
        '&level=' + rec.level + '&apply=1');
    }
    var live = pick('.js-panic-kit-live');
    if (live) { live.textContent = 'Kit gợi ý: ' + rec.kit.name; }
  }

  // Gom nhiều lần đổi level trong cùng một khung hình thành một lần dựng DOM.
  function scheduleShowcase(level) {
    if (showcaseFrame) { cancelAnimationFrame(showcaseFrame); }
    showcaseFrame = requestAnimationFrame(function () {
      showcaseFrame = null;
      renderKitShowcase(level);
    });
  }

  function updatePanicMeter(level) {
    var lvl = String(level || $('.js-panic-slider').val() || '4');
    lastPanicLevel = lvl;
    var $data = $('.js-panic-data-item[data-level="' + lvl + '"]');
    var name = $data.length ? ($data.attr('data-name') || '') : '';
    $('.js-panic-meter-status').text(name);
    $('.js-panic-meter-badge').attr('data-level', lvl);
    $('.js-panic-meter-badge-num').text(lvl);
    var sliderEl = $('.js-panic-slider')[0];
    if (sliderEl) {
      sliderEl.value = lvl;
      sliderEl.setAttribute('aria-valuenow', lvl);
      sliderEl.setAttribute('aria-valuetext', 'Level ' + lvl + (name ? ': ' + name : ''));
      sliderEl.style.setProperty('--f', ((Number(lvl) - 1) / 6).toFixed(4));
    }
    $('.js-panic-step').removeClass('is-active').attr('aria-pressed', 'false');
    $('.js-panic-step[data-level="' + lvl + '"]').addClass('is-active').attr('aria-pressed', 'true');
    var $show = $('.js-panic-kit-showcase').addClass('is-swapping');
    setTimeout(function () { $show.removeClass('is-swapping'); }, 140);
    if (window.PanicLevel && window.PanicLevel.get() !== Number(lvl)) {
      window.PanicLevel.set(lvl);
    }
    scheduleShowcase(lvl);
    applyKitFilters();
  }

  // Đổi category ở trang chủ thì dựng lại kit của level hiện tại.
  document.addEventListener('kitcategorychange', function () {
    scheduleShowcase(currentLevelValue());
  });

  $(document).on('input change', '.js-panic-slider', function () {
    var lvl = String($(this).val());
    if (lvl === lastPanicLevel) { return; } // bỏ qua lần gọi thứ hai (input rồi change)
    updatePanicMeter(lvl);
  });

  $(document).on('click', '.js-panic-step', function (event) {
    event.preventDefault();
    var lvl = $(this).attr('data-level') || $(this).data('level');
    if (lvl) {
      $('.js-panic-slider').val(lvl);
      updatePanicMeter(lvl);
    }
  });

  document.addEventListener('paniclevelchange', function (e) {
    if (e.detail && e.detail.level) {
      var lvl = String(e.detail.level);
      if ($('.js-panic-slider').length && $('.js-panic-slider').val() !== lvl) {
        $('.js-panic-slider').val(lvl);
        updatePanicMeter(lvl);
      }
    }
  });

  $(document).on('click', '.js-panic-level', function (event) {
    event.preventDefault();
    var $btn = $(this);
    var wasPressed = $btn.attr('aria-pressed') === 'true';
    $('.js-panic-level').attr('aria-pressed', 'false').removeClass('is-active');
    if (!wasPressed) {
      $btn.attr('aria-pressed', 'true').addClass('is-active');
    }
    applyKitFilters();
  });

  $(document).on('change', '.js-kit-filter-type, .js-kit-filter-price', applyKitFilters);

  if ($('.js-panic-slider').length) {
    var initialLevel = window.PanicLevel ? window.PanicLevel.get() : ($('.js-panic-slider').val() || '3');
    updatePanicMeter(initialLevel);
  } else {
    applyKitFilters();
  }

})(jQuery);
