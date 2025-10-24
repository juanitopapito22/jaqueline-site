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
  const topbar = document.querySelector('.topbar');
  const sentinel = document.getElementById('topbar-sentinel');
  if (!topbar || !sentinel) return;

  let observer;

  const setupObserver = () => {
    // Limpia cualquier observer previo
    if (observer) observer.disconnect();

    const tbH = Math.ceil(topbar.getBoundingClientRect().height || 0);

    // 🎯 Compensamos más en pantallas pequeñas, pero mantenemos sensible en desktop
    const vhCompensate = window.innerWidth < 768 ? 140 : 5;
    const margin = `-${tbH + vhCompensate}px 0px 0px 0px`;

    observer = new IntersectionObserver(([entry]) => {
      const shouldBeScrolled = !entry.isIntersecting;
      topbar.classList.toggle('scrolled', shouldBeScrolled);
    }, { rootMargin: margin, threshold: 0 });

    observer.observe(sentinel);

    // Estado inicial correcto
    const startScrolled = (sentinel.getBoundingClientRect().top - tbH - vhCompensate) < 0;
    topbar.classList.toggle('scrolled', startScrolled);
  };

  // Inicializa una vez
  setupObserver();

  // 🔁 Recalcular si cambian las fuentes, tamaños o cookie banners
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setupObserver).catch(() => {});
  }

  window.addEventListener('resize', () => {
    clearTimeout(window.__tbResizeTO);
    window.__tbResizeTO = setTimeout(setupObserver, 150);
  }, { passive: true });

  // Ajuste final tras cargas diferidas (cookies, imágenes, etc.)
  window.addEventListener('load', () => setTimeout(setupObserver, 500));
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
  const root  = document.getElementById('servicios-content');
  const btn   = document.getElementById('bton-servicios');
  const paths = root?.querySelector('.paths');

  if (!root || !btn || !paths) return;

  // accesibilidad básica
  btn.type = 'button';
  btn.setAttribute('aria-controls', 'paths');
  btn.setAttribute('aria-expanded', 'false');
  paths.setAttribute('aria-hidden', 'true');

  btn.addEventListener('click', () => {
    const open = root.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    paths.setAttribute('aria-hidden', String(!open));

    if (open) {
      // Esperar un poco a que el layout cambie (para móvil)
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Desplázate directamente hasta los paths (más estable que root)
          paths.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.bton-proyecto').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.target;
      window.location.href = url;
    });
  });
});

