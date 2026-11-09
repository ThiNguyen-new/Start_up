/*
 * SkConfirm — hộp thoại xác nhận theo giao diện site, thay cho window.confirm().
 *   SkConfirm({ title, message, confirmText, cancelText, danger }).then(function (ok) { ... })
 * Truy cập: role="alertdialog", aria-modal, giữ focus trong hộp thoại, Esc = Hủy,
 * trả focus về phần tử đã mở hộp thoại.
 */
(function () {
  'use strict';

  var dialog = null;
  var pending = null;

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'sk-modal';
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="sk-modal-backdrop" data-sk-cancel></div>' +
      '<div class="sk-modal-box" role="alertdialog" aria-modal="true" aria-labelledby="sk-modal-title" aria-describedby="sk-modal-msg">' +
      '  <h2 class="sk-modal-title" id="sk-modal-title"></h2>' +
      '  <p class="sk-modal-msg" id="sk-modal-msg"></p>' +
      '  <div class="sk-modal-actions">' +
      '    <button type="button" class="sk-btn sk-btn-ghost sk-focusable" data-sk-cancel></button>' +
      '    <button type="button" class="sk-btn sk-btn-primary sk-focusable" data-sk-ok></button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      if (e.target.closest('[data-sk-ok]')) close(true);
      else if (e.target.closest('[data-sk-cancel]')) close(false);
    });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(false); return; }
      if (e.key !== 'Tab') return;
      var btns = wrap.querySelectorAll('.sk-modal-actions button');
      var first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    return wrap;
  }

  function close(result) {
    if (!pending) return;
    var p = pending;
    pending = null;
    dialog.hidden = true;
    document.documentElement.classList.remove('sk-modal-open');
    if (p.opener && p.opener.focus) p.opener.focus();
    p.resolve(result);
  }

  function SkConfirm(opts) {
    opts = typeof opts === 'string' ? { message: opts } : (opts || {});
    if (!document.body) return Promise.resolve(window.confirm(opts.message || ''));
    if (!dialog) dialog = build();
    if (pending) close(false);

    dialog.querySelector('.sk-modal-title').textContent = opts.title || 'Xác nhận';
    dialog.querySelector('.sk-modal-msg').textContent = opts.message || '';
    var ok = dialog.querySelector('[data-sk-ok]');
    ok.textContent = opts.confirmText || 'Đồng ý';
    ok.classList.toggle('sk-btn-danger', !!opts.danger);
    dialog.querySelector('.sk-modal-actions [data-sk-cancel]').textContent = opts.cancelText || 'Hủy';

    return new Promise(function (resolve) {
      pending = { resolve: resolve, opener: document.activeElement };
      dialog.hidden = false;
      document.documentElement.classList.add('sk-modal-open');
      // Nút an toàn (Hủy) nhận focus trước cho hành động xóa; còn lại focus nút Đồng ý.
      (opts.danger ? dialog.querySelector('.sk-modal-actions [data-sk-cancel]') : ok).focus();
    });
  }

  window.SkConfirm = SkConfirm;
})();
