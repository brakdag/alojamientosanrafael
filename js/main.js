'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const mobileViewport = window.matchMedia('(max-width: 900px)');

function closeMenu(restoreFocus = false) {
    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    if (restoreFocus) menuToggle.focus();
}

menuToggle.hidden = false;
navigation.dataset.collapsible = 'true';
menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    navigation.classList.toggle('is-open', isOpen);
});
navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
});
mobileViewport.addEventListener('change', () => closeMenu());

const galleryToggle = document.querySelector('#gallery-toggle');
const extraPhotos = Array.from(document.querySelectorAll('.gallery-extra'));
extraPhotos.forEach((photo) => { photo.hidden = true; });
galleryToggle.hidden = false;
galleryToggle.addEventListener('click', () => {
    const expanded = galleryToggle.getAttribute('aria-expanded') !== 'true';
    extraPhotos.forEach((photo) => { photo.hidden = !expanded; });
    galleryToggle.setAttribute('aria-expanded', String(expanded));
    galleryToggle.textContent = expanded ? 'Ver menos fotos −' : 'Ver todas las fotos +';
    if (!expanded) galleryToggle.scrollIntoView({ block: 'nearest' });
});

const galleryLinks = Array.from(document.querySelectorAll('[data-gallery]'));
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('.lightbox-image');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
let currentPhoto = 0;
let galleryTrigger = null;
let touchStart = null;

function showPhoto(index) {
    currentPhoto = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[currentPhoto];
    const description = link.querySelector('img').alt;
    lightboxImage.src = link.href;
    lightboxImage.alt = description;
    lightboxCaption.textContent = `${description} · ${currentPhoto + 1} / ${galleryLinks.length}`;
}

if (typeof lightbox.showModal === 'function') {
    galleryLinks.forEach((link, index) => {
        link.addEventListener('click', (event) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            galleryTrigger = link;
            showPhoto(index);
            lightbox.showModal();
            document.body.classList.add('modal-open');
        });
    });
}
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (galleryTrigger) galleryTrigger.focus({ preventScroll: true });
});
lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
    }
});
lightbox.addEventListener('touchstart', (event) => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
lightbox.addEventListener('touchend', (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) showPhoto(currentPhoto + (deltaX < 0 ? 1 : -1));
    touchStart = null;
}, { passive: true });
lightbox.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navigation.querySelectorAll('a').forEach((link) => {
                if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-20% 0px -60% 0px' });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}
