document.addEventListener('DOMContentLoaded', () => {
  // --- Premium Page Loader ---
  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    const progressBar = pageLoader.querySelector('.loader-progress-fill');
    const percentageText = pageLoader.querySelector('.loader-percentage');
    const taglineFill = pageLoader.querySelector('.tagline-fill');
    const loadingText = pageLoader.querySelector('.loader-status');
    let progress = 0;
    let isLoaded = false;
    const startTime = performance.now();
    const minLoadTime = 2000; // Force a minimum 2 second premium loading experience
    
    // Smooth progress simulation
    const progressInterval = setInterval(() => {
      const elapsedTime = performance.now() - startTime;
      const timeRemaining = Math.max(0, minLoadTime - elapsedTime);
      
      let increment;
      if (isLoaded && timeRemaining <= 0) {
        increment = 15; // Finish fast if min time elapsed
      } else if (isLoaded) {
        // Steadily progress to finish exactly around minLoadTime
        const ticksRemaining = Math.max(1, timeRemaining / 30);
        increment = (100 - progress) / ticksRemaining;
      } else {
        // Not loaded yet
        increment = progress < 85 ? Math.random() * 1.5 + 0.5 : 0.2;
      }
      
      progress += increment;
      
      if (progress > 99 && (!isLoaded || timeRemaining > 0)) progress = 99; // Cap at 99%
      if (progress >= 100) progress = 100;
      
      const currentProgress = Math.floor(progress);
      
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (percentageText) percentageText.textContent = `${currentProgress}%`;
      if (taglineFill) taglineFill.style.clipPath = `inset(0 ${100 - progress}% 0 0)`;
      
      if (loadingText) {
        if (currentProgress < 20) loadingText.textContent = "INITIALIZING EXPERIENCE";
        else if (currentProgress < 40) loadingText.textContent = "LOADING PACKAGING SOLUTIONS";
        else if (currentProgress < 60) loadingText.textContent = "PREPARING PRODUCTS";
        else if (currentProgress < 80) loadingText.textContent = "LOADING WEBSITE";
        else if (currentProgress < 100) loadingText.textContent = "FINALIZING EXPERIENCE";
        else loadingText.textContent = "WELCOME TO PARTH PLASTO PACK";
      }
      
      if (progress >= 100 && isLoaded && timeRemaining <= 0) {
        clearInterval(progressInterval);
        setTimeout(hideLoader, 250);
      }
    }, 30);

    function hideLoader() {
      if (progress < 100) {
        progress = 100;
        if (progressBar) progressBar.style.width = `100%`;
        if (percentageText) percentageText.textContent = `100%`;
        if (taglineFill) taglineFill.style.clipPath = `inset(0 0% 0 0)`;
        if (loadingText) loadingText.textContent = "WELCOME TO PARTH PLASTO PACK";
      }
      pageLoader.classList.add('loaded');
      setTimeout(() => pageLoader.remove(), 700);
    }

    // Hide loader on window load
    window.addEventListener('load', () => {
      isLoaded = true;
    });

    // Safety fallback
    setTimeout(() => {
      if (pageLoader.parentElement) {
        isLoaded = true;
        hideLoader();
      }
    }, 5000);
    
    // Internal link interception
    document.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || link.target === '_blank') {
          return;
        }
        event.preventDefault();
        
        // Re-inject loader for navigation if removed
        if (!document.getElementById('page-loader')) {
           document.body.appendChild(pageLoader);
        }
        pageLoader.classList.remove('loaded');
        pageLoader.style.animation = 'none'; // Stop exit animation
        pageLoader.style.opacity = '1';
        pageLoader.style.visibility = 'visible';
        pageLoader.style.transform = 'none';
        
        if (progressBar) progressBar.style.width = '0%';
        if (percentageText) percentageText.textContent = '0%';
        if (taglineFill) taglineFill.style.clipPath = `inset(0 100% 0 0)`;
        if (loadingText) loadingText.textContent = "INITIALIZING EXPERIENCE";
        
        setTimeout(() => {
          window.location.href = href;
        }, 250);
      });
    });
  }

  // --- Header Scroll Effect ---
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // --- Back to Top Button ---
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- Set Active Nav Link Based on URL ---
  const currentPath = window.location.pathname;
  const page = currentPath.split("/").pop() || 'index.html';
  
  if (navLinks) {
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.classList.remove('active');
      const linkPage = link.getAttribute('href');
      if (linkPage === page) {
        link.classList.add('active');
      }
    });
  }
});
