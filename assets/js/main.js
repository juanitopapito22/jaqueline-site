document.addEventListener('DOMContentLoaded', () => {
  const btnHamburguer = document.querySelector('.nav-toggle');
  const drawer        = document.getElementById('drawer');
  const backdrop      = document.querySelector('[data-backdrop]');
  const btnInside     = document.querySelector('.drawer-toggle');

  if (!btnHamburguer || !drawer || !backdrop || !btnInside) {
    console.warn('Faltan elementos: ',
      { btnHamburguer: !!btnHamburguer, drawer: !!drawer, backdrop: !!backdrop, btnInside: !!btnInside }
    );
    return;
  }

  
  function openDrawer () {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    backdrop.hidden = false;
    drawer.setAttribute('aria-hidden','false');
    btnHamburguer.setAttribute('aria-expanded','true');
    document.body.classList.add('no-scroll');
    btnInside?.focus();
  }

  function closeDrawer () {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    btnHamburguer.setAttribute('aria-expanded','false');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { backdrop.hidden = true; }, 250);
    btnHamburguer?.focus();
  }

  function toggleDrawer () {
    if (drawer.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  }

  btnHamburguer.addEventListener('click', toggleDrawer);
  btnInside.addEventListener('click', toggleDrawer);
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const topbar   = document.querySelector('.topbar');
  const sentinel = document.getElementById('topbar-sentinel');
  if (!topbar || !sentinel) return;

  let observer;

  // Cambia SÓLO cuando el sentinel real cruza el umbral
  const setupObserver = () => {

    if (observer) observer.disconnect();

    // Asegúrate de medir sin estilos de "scrolled"
    topbar.classList.remove('scrolled');

    const tbH = Math.ceil(topbar.getBoundingClientRect().height || 0);
    // Ajusta este número si quieres que cambie antes/después de pasar sentinel
    const vhCompensate = window.innerWidth < 768 ? 200 : 5;
    const margin = `-${tbH + vhCompensate}px 0px 0px 0px`;

    // Histeresis suave: ignorar jitter < 2px al calcular estado inicial
    const atTop = () => (window.pageYOffset || document.documentElement.scrollTop || 0) <= 1;

    observer = new IntersectionObserver(([entry]) => {
      // Sólo usamos el estado de intersección del sentinel
      const shouldBeScrolled = !entry.isIntersecting && !atTop();
      topbar.classList.toggle('scrolled', shouldBeScrolled);
    }, { rootMargin: margin, threshold: 0 });

    observer.observe(sentinel);

    // Estado inicial robusto (sin depender de scroll)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = sentinel.getBoundingClientRect();
        const startScrolled = (rect.top - tbH - vhCompensate) < 0 && !atTop();
        topbar.classList.toggle('scrolled', startScrolled);
      });
    });
  };

  const debounced = (fn, d=150) => { clearTimeout(fn.__t); fn.__t = setTimeout(fn, d); };

  // Recalcula cuando todo terminó de cargar (imágenes, banner abajo, etc.)
  window.addEventListener('load', () => setTimeout(setupObserver, 300));

  // Si cambian fuentes/alto del topbar, recalcula
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => debounced(setupObserver, 80)).catch(()=>{});
  }

  // Cambios de tamaño/orientación
  window.addEventListener('resize', () => debounced(setupObserver), { passive: true });
  window.addEventListener('orientationchange', () => debounced(setupObserver, 80));

  // Si Cookiebot aparece/desaparece (banner abajo), recalcula
  window.addEventListener('CookiebotOnShow',    () => setTimeout(setupObserver, 200));
  window.addEventListener('CookiebotOnHide',    () => setTimeout(setupObserver, 200));
  window.addEventListener('CookiebotOnAccept',  () => setTimeout(setupObserver, 200));
  window.addEventListener('CookiebotOnDecline', () => setTimeout(setupObserver, 200));
});
// Update Google Consent Mode when Cookiebot consent changes
window.addEventListener('CookiebotOnAccept', function () {
  if (typeof gtag === 'function' && typeof Cookiebot !== 'undefined') {
    gtag('consent', 'update', {
      analytics_storage: Cookiebot.consent.statistics ? 'granted' : 'denied',
      ad_storage: Cookiebot.consent.marketing ? 'granted' : 'denied',
      ad_user_data: Cookiebot.consent.marketing ? 'granted' : 'denied',
      ad_personalization: Cookiebot.consent.marketing ? 'granted' : 'denied'
    });
  }
});

window.addEventListener('CookiebotOnDecline', function () {
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    // Quita esto si quieres que el navegador haga el POST normal
    e.preventDefault();
    status.textContent = '';

    const data = new FormData(form);
    const endpoint = form.getAttribute('action');

    try{
      const res = await fetch(endpoint, { method:'POST', body:data, headers:{'Accept':'application/json'} });
      if (res.ok){
        form.reset();
        status.textContent = '¡Gracias! Tu mensaje fue enviado.';
      }else{
        status.textContent = 'No pudimos enviar el mensaje. Intenta de nuevo.';
      }
    }catch(err){
      status.textContent = 'Problema de conexión. Intenta nuevamente.';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.bton-servicios');

  
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const target = document.querySelector(btn.dataset.target);
      if (!target) return;

      const offset = 80; // ajusta a tu header móvil

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        offset;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    });
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.bton-proyecto');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.target;
      if (url) window.location.href = url;
    });
  });
});


