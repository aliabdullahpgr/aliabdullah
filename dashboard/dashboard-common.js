// shared dashboard helpers — user menu, toast, sidebar stub-link interception
(function(){
  // user menu
  const btn = document.getElementById('userBtn');
  const pop = document.getElementById('userPop');
  if(btn && pop){
    btn.addEventListener('click', e => { e.stopPropagation(); pop.classList.toggle('open'); });
    document.addEventListener('click', () => pop.classList.remove('open'));
  }

  // toast
  window.toast = function(kind, headline, body, timeout){
    timeout = timeout || 3500;
    let wrap = document.getElementById('toasts');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'toasts';
      wrap.className = 'toast-stack';
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind === 'err' ? 'err' : '');
    const ic = kind === 'err' ? '!' : '◆';
    t.innerHTML = `<div class="ic">${ic}</div><div class="body"><b>${headline}</b><span>${body || ''}</span></div>`;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220); }, timeout);
  };

  // sign out
  const so = document.getElementById('signout');
  if(so) so.addEventListener('click', () => {
    window.toast('ok', 'Signed out', 'Returning to login…');
    setTimeout(() => { window.location.href = 'login.html'; }, 700);
  });

  // intercept # links
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.toast('ok', 'Coming next', 'This control isn\u2019t wired up yet.');
    });
  });
})();
