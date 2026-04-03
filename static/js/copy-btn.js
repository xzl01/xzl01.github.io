/* Code block copy button */
(function () {
  var copyToClipboard = (function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return function (text) { return navigator.clipboard.writeText(text); };
    }
    return function (text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    };
  })();

  document.querySelectorAll('pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = '复制';
    btn.onclick = function () {
      var code = pre.querySelector('code') || pre;
      copyToClipboard(code.innerText);
      btn.textContent = '✓';
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.textContent = '复制'; }, 2000);
    };
    pre.appendChild(btn);
  });
})();
