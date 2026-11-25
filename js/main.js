(() => {
  'use strict';
  const settings = window.PORTFOLIO || {images:{}};
  const isProject = document.documentElement.hasAttribute('data-project-page');
  const rootPrefix = isProject ? '../' : '';

  document.querySelectorAll('[data-image]').forEach((holder) => {
    const path = settings.images?.[holder.dataset.image];
    if (!path) return;
    const image = new Image();
    image.className = 'real-art';
    image.alt = holder.dataset.alt || 'Изображение проекта';
    image.decoding = 'async';
    image.loading = holder.classList.contains('project-hero-visual') ? 'eager' : 'lazy';
    image.onload = () => {holder.append(image); holder.classList.add('has-image');};
    image.onerror = () => { console.warn('Изображение не найдено:', rootPrefix+path); };
    image.src = rootPrefix+path;
  });

  const telegram = String(settings.telegram || '').trim();
  const email = String(settings.email || '').trim();
  const figma = String(settings.figma || '').trim();
  document.querySelectorAll('[data-contact="telegram"]').forEach((link) => {
    if (/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,}$/.test(telegram)) {
      link.href = telegram; link.target = '_blank'; link.rel = 'noopener noreferrer';
    } else link.hidden = true;
  });
  document.querySelectorAll('[data-contact="figma"]').forEach((link) => {
    if (/^https:\/\/\S+/.test(figma)) {link.href = figma; link.target = '_blank'; link.rel = 'noopener noreferrer';}
    else link.hidden = true;
  });
  document.querySelectorAll('[data-copy-email]').forEach((button) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {button.hidden = true; return;}
    button.title = email;
    button.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
        else {
          const box = document.createElement('textarea');
          box.value = email; box.style.cssText = 'position:fixed;opacity:0;';document.body.append(box);box.select();
          if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');box.remove();
        }
        const before = button.textContent; button.textContent = 'Почта скопирована';
        setTimeout(() => button.textContent = before, 2000);
      } catch(error) {
        const before = button.textContent;button.textContent = email;
        setTimeout(() => button.textContent = before, 3500);
      }
    });
  });

  // Краткий текст меняется внутри заранее зарезервированной области.
  const toggle = document.querySelector('[data-hero-toggle]');
  const copy = document.querySelector('[data-hero-copy]');
  if (toggle && copy) {
    // Reserve exactly the full text's height so short mode never moves the work grid.
    const slot = copy.parentElement;
    const measureFullText = () => {
      const clone = copy.cloneNode(false);
      clone.textContent = copy.dataset.full;
      clone.removeAttribute('data-hero-copy');
      clone.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:' + copy.clientWidth + 'px;min-height:0;height:auto;';
      slot.append(clone);
      slot.style.height = Math.ceil(clone.getBoundingClientRect().height) + 'px';
      clone.remove();
    };
    measureFullText();
    window.addEventListener('resize',measureFullText);
    if (document.fonts?.ready) document.fonts.ready.then(measureFullText);
    let brief = false;
    toggle.addEventListener('click', () => {
      brief = !brief;
      copy.classList.add('is-changing');
      copy.textContent = brief ? copy.dataset.short : copy.dataset.full;
      copy.classList.remove('is-changing');
      toggle.setAttribute('aria-pressed',String(brief));
      toggle.setAttribute('aria-label',brief?'Показать полный текст':'Я тороплюсь — сократить текст');
      toggle.title = brief?'Читать полностью':'Я тороплюсь';
      toggle.classList.remove('is-spinning');
      void toggle.offsetWidth;
      toggle.classList.add('is-spinning');
    });
    toggle.addEventListener('animationend',e=>{if(e.animationName==='orbit-click')toggle.classList.remove('is-spinning')});
  }

  const mobileToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (mobileToggle && mobileMenu) {
    const close = () => {mobileMenu.hidden=true;mobileToggle.setAttribute('aria-expanded','false');};
    mobileToggle.addEventListener('click',()=>{mobileMenu.hidden=!mobileMenu.hidden;mobileToggle.setAttribute('aria-expanded',String(!mobileMenu.hidden));});
    mobileMenu.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',close));
    document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  }

  const modal = document.querySelector('[data-shot-modal]');
  if (modal) {
    const content=modal.querySelector('[data-modal-content]');const title=modal.querySelector('[data-modal-title]');
    document.querySelectorAll('[data-open-shot]').forEach(button=>button.addEventListener('click',()=>{
      const imageKey=button.dataset.openShot;
      const path=settings.images?.[imageKey];
      title.textContent=button.querySelector('.shot-name')?.textContent || 'Шот';
      content.replaceChildren();
      if (path) {const image = new Image();image.src=rootPrefix+path;image.alt=title.textContent;content.append(image);}
      else {const preview=button.querySelector('.shot-cover').cloneNode(true);preview.classList.add('modal-preview');preview.removeAttribute('data-image');content.append(preview);}
      modal.showModal();
    }));
    modal.querySelector('[data-close-modal]').addEventListener('click',()=>modal.close());
    modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
  }
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));
})();
