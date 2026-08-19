document.addEventListener('DOMContentLoaded', function () {
  // Mobile navigation menu toggle
  var menuToggle = document.querySelector('.menu-toggle');
  var siteNav = document.querySelector('.site-nav');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
      var isExpanded = siteNav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
  }

  // Mobile dropdown toggles
  var dropdownToggles = document.querySelectorAll('.nav-dropdown > .dropdown-toggle');
  dropdownToggles.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (window.innerWidth <= 850) {
        e.preventDefault();
        var parent = btn.parentElement;
        parent.classList.toggle('open');
      }
    });
  });

  // Hero Slider if multiple slides exist
  var slides = document.querySelectorAll('.hero-slide');
  var dots = document.querySelectorAll('.hero-dots button');
  if (slides.length > 1) {
    var currentIndex = 0;
    var slideInterval = null;

    function goToSlide(index) {
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === index);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === index);
      });
      currentIndex = index;
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        goToSlide(idx);
        resetAutoPlay();
      });
    });

    function resetAutoPlay() {
      if (slideInterval) clearInterval(slideInterval);
      slideInterval = setInterval(function () {
        var nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
      }, 6000);
    }

    resetAutoPlay();
  }

  // Testimonials track horizontal scroll controls
  var track = document.querySelector('.testimonial-track');
  var prevBtn = document.querySelector('.slider-controls button:first-child');
  var nextBtn = document.querySelector('.slider-controls button:last-child');
  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -340, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }

  // Hero Dropdown Quick Navigator
  var heroDropdownWrappers = document.querySelectorAll('.hero-dropdown-wrapper');
  heroDropdownWrappers.forEach(function (wrapper) {
    var trigger = wrapper.querySelector('.hero-dropdown-box');
    var menu = wrapper.querySelector('.hero-dropdown-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = wrapper.classList.contains('open');
      // Close any other open hero dropdowns
      heroDropdownWrappers.forEach(function (other) {
        if (other !== wrapper) {
          other.classList.remove('open');
          var otherTrigger = other.querySelector('.hero-dropdown-box');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      wrapper.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  // Close dropdown on click outside or Escape
  document.addEventListener('click', function (e) {
    heroDropdownWrappers.forEach(function (wrapper) {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        var trigger = wrapper.querySelector('.hero-dropdown-box');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      heroDropdownWrappers.forEach(function (wrapper) {
        wrapper.classList.remove('open');
        var trigger = wrapper.querySelector('.hero-dropdown-box');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Auto-dismiss toast messages after 4 seconds
  var toast = document.querySelector('.toast');
  if (toast) {
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(function () {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 500);
    }, 4000);
  }

  // Gradual number & percentage counting animation for stats
  function initNumberCounters() {
    var statElements = document.querySelectorAll('.stat-number, [data-counter]');
    if (!statElements.length) return;

    function startCounting(el) {
      if (el.getAttribute('data-counted') === 'true') return;
      el.setAttribute('data-counted', 'true');

      var originalHtml = el.innerHTML.trim();
      var originalText = el.textContent.trim();

      // Extract prefix, number (with optional commas and decimals), and suffix
      var match = originalText.match(/^([^\d]*?)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!match) return;

      var prefix = match[1] || '';
      var numStr = match[2];
      var rawSuffix = match[3] || '';

      var hasCommas = numStr.indexOf(',') !== -1;
      var cleanNumStr = numStr.replace(/,/g, '');
      var targetValue = parseFloat(cleanNumStr);
      if (isNaN(targetValue)) return;

      var decimals = 0;
      if (cleanNumStr.indexOf('.') !== -1) {
        decimals = cleanNumStr.split('.')[1].length;
      }

      // Preserve rich HTML inside suffix (such as <b>★</b> or custom icons/spans)
      var suffixHtml = rawSuffix;
      var numPos = originalHtml.indexOf(numStr);
      if (numPos !== -1) {
        var potentialSuffix = originalHtml.substring(numPos + numStr.length);
        if (potentialSuffix) {
          suffixHtml = potentialSuffix;
        }
      }

      var duration = 2000; // 2.0s smooth animation duration
      var startTime = null;

      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        var progress = Math.min((currentTime - startTime) / duration, 1);

        // Ease-out cubic curve: smooth acceleration and graceful deceleration
        var easeOut = 1 - Math.pow(1 - progress, 3);
        var currentValue = targetValue * easeOut;

        var displayNum;
        if (decimals > 0) {
          var fixed = currentValue.toFixed(decimals);
          if (hasCommas) {
            var parts = fixed.split('.');
            parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
            displayNum = parts.join('.');
          } else {
            displayNum = fixed;
          }
        } else {
          var intVal = Math.floor(currentValue);
          displayNum = hasCommas ? intVal.toLocaleString('en-US') : intVal.toString();
        }

        el.innerHTML = prefix + displayNum + suffixHtml;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Final exact value
          var finalDisplay;
          if (decimals > 0) {
            var finalFixed = targetValue.toFixed(decimals);
            if (hasCommas) {
              var fParts = finalFixed.split('.');
              fParts[0] = parseInt(fParts[0], 10).toLocaleString('en-US');
              finalDisplay = fParts.join('.');
            } else {
              finalDisplay = finalFixed;
            }
          } else {
            var finalInt = Math.round(targetValue);
            finalDisplay = hasCommas ? finalInt.toLocaleString('en-US') : finalInt.toString();
          }
          el.innerHTML = prefix + finalDisplay + suffixHtml;
        }
      }

      // Start at 0 with proper decimal formatting
      var zeroDisplay = decimals > 0 ? (0).toFixed(decimals) : '0';
      el.innerHTML = prefix + zeroDisplay + suffixHtml;
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCounting(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -20px 0px'
      });

      statElements.forEach(function (elem) {
        statsObserver.observe(elem);
      });
    } else {
      statElements.forEach(function (elem) {
        startCounting(elem);
      });
    }
  }

  initNumberCounters();
});
