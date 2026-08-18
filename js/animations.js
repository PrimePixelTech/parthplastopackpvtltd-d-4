document.addEventListener('DOMContentLoaded', () => {
  // --- Scroll Reveal Animation ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  // Reduce motion preference check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // --- Auto-Animation Engine ---
    // Automatically apply staggered premium animations to grids and lists
    const animateGroups = document.querySelectorAll('.features-grid, .products-grid, .values-grid, .process-grid, .faq-container, .timeline, .stats-grid, .testing-list, .contact-grid, .premium-features-grid, .process-journey, .quality-indicators, .horizontal-scroller, .certifications-grid, .vertical-timeline');
    
    animateGroups.forEach(group => {
      const children = Array.from(group.children);
      children.forEach((child, index) => {
        if (!child.classList.contains('fade-up') && !child.classList.contains('zoom-in') && !child.classList.contains('fade-left') && !child.classList.contains('fade-right')) {
          child.classList.add('fade-up');
        }
        // Add stagger delay (e.g. 100, 200, 300, 400 ms)
        const delay = ((index % 4) + 1) * 100; 
        child.classList.add(`delay-${delay}`);
      });
    });

    // Auto-animate common standalone elements
    const genericAnimateElements = document.querySelectorAll('.section-title, .section-desc, .badge, .page-header h1, .page-header p, .hero-title, .hero-buttons, .contact-card');
    genericAnimateElements.forEach((el, index) => {
      if (!el.classList.contains('fade-up') && !el.classList.contains('zoom-in') && !el.classList.contains('fade-left') && !el.classList.contains('fade-right')) {
        el.classList.add('fade-up');
      }
    });

    const fadeElements = document.querySelectorAll('.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in');
    fadeElements.forEach(el => observer.observe(el));
  } else {
    // If reduced motion is preferred, make all elements visible immediately
    const fadeElements = document.querySelectorAll('.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in');
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // --- Counter Animation ---
  function animateCounter(element) {
    const targetValue = element.dataset.target || element.textContent.trim();
    if (!targetValue) return;
    
    // Extract prefix, number, and suffix using regex
    const match = targetValue.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) {
      element.textContent = targetValue;
      return;
    }
    
    const prefix = match[1];
    const target = parseFloat(match[2]);
    const suffix = match[3];
    const isFloat = match[2].includes('.');
    
    const duration = Number(element.dataset.duration) || 2000;
    let start = null;

    function update(currentTime) {
      if (!start) start = currentTime;
      const progress = Math.min((currentTime - start) / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      
      let currentText;
      if (isFloat) {
        currentText = current.toFixed(1);
      } else {
        currentText = Math.floor(current);
      }
      
      element.textContent = prefix + currentText + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetValue;
      }
    }
    
    if (!prefersReducedMotion) {
      // Start from 0 initially
      element.textContent = prefix + (isFloat ? "0.0" : "0") + suffix;
      requestAnimationFrame(update);
    } else {
      element.textContent = targetValue;
    }
  }

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        animateCounter(counter);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.1 });

  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => counterObserver.observe(counter));
  
  // --- Progress Bars ---
  const progressObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.dataset.width;
        if (!prefersReducedMotion) {
          bar.style.width = targetWidth;
        } else {
          bar.style.width = targetWidth;
          bar.style.transition = 'none';
        }
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });
  
  const progressBars = document.querySelectorAll('.progress-fill');
  progressBars.forEach(bar => progressObserver.observe(bar));
});
