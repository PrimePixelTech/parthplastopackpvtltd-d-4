const menuIcon = document.getElementById("menu-icon");
const navLinks = document.querySelector(".header-ul");


// Toggle menu on click
menuIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  navLinks.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    navLinks.classList.contains("active") &&
    !e.target.closest(".header-ul") &&
    !e.target.closest("#menu-icon")
  ) {
    navLinks.classList.remove("active");
  }
});

window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");

  gsap.to(preloader, {
    opacity: 0,
    duration: 0.6,
    onComplete: () => (preloader.style.display = "none"),
  });
});

var tl = gsap.timeline();

tl.from(".header-logo", {
  y: -100,
  duration: 1,
  ease: "bounce.out",
  opacity: 0,
});
tl.from(".header-li", {
  // duration: 0.5,
  y: -100,
  stagger: 0.1,
  opacity: 0,
});








//Banner Section

$('.owl-carousel').owlCarousel({
      loop: true,
      margin: 10,
      nav: false,
      dots: false,
      autoplay: true,
      autoplayTimeout: 4000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1
        }
      }
    });



// Scroll animation
        document.addEventListener('DOMContentLoaded', function() {
            const sections = document.querySelectorAll('.section');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1
            });
            
            sections.forEach(section => {
                observer.observe(section);
            });
            
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });


        //counter effect

        
    const counterEl = document.getElementById('counter');
    const counterBox = document.getElementById('counterBox');
    let hasCounted = false;

    const animateCounter = () => {
      let count = 0;
      const target = 500;
      const duration = 2000;
      const stepTime = Math.floor(duration / target);

      const interval = setInterval(() => {
        count++;
        counterEl.textContent = count + "+";
        if (count >= target) {
          clearInterval(interval);
        }
      }, stepTime);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          animateCounter();
          hasCounted = true;
        }
      });
    }, {
      threshold: 0.5
    });

    observer.observe(counterBox);