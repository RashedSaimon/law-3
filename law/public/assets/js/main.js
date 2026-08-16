document.addEventListener('DOMContentLoaded', () => {
  const navButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mobile Dropdown toggles
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 850) {
          e.preventDefault();
          const isOpen = dropdown.classList.toggle('open');
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(d => {
        if (window.innerWidth <= 850) return;
        d.classList.remove('open');
      });
    }
  });

  const track = document.querySelector('.testimonial-track');
  document.querySelector('.slider-next')?.addEventListener('click', () => {
    track?.scrollBy({ left: track.clientWidth * 0.7, behavior: 'smooth' });
  });
  document.querySelector('.slider-prev')?.addEventListener('click', () => {
    track?.scrollBy({ left: -track.clientWidth * 0.7, behavior: 'smooth' });
  });

  // Hero slider support
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('[data-hero-dot]');
  if (slides.length > 1) {
    let currentSlide = 0;
    const showSlide = (index) => {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      currentSlide = index;
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    setInterval(() => {
      showSlide((currentSlide + 1) % slides.length);
    }, 6000);
  }
});
