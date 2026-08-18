/**
 * Expo 2026 Invitation Modal & Sticky Floating Ad Controller
 * Parth Plasto Pack Pvt. Ltd.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject the Expo HTML structure if not already present
  if (!document.getElementById('expoModalBackdrop')) {
    const expoHTML = `
      <!-- Expo Invitation Modal Ad -->
      <div id="expoModalBackdrop" class="expo-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="expoTitle">
        <div class="expo-modal-container" id="expoModalContainer">
          <!-- Header Bar -->
          <div class="expo-modal-header">
            <h3 id="expoTitle" class="expo-modal-title">
              <span class="expo-live-dot"></span>
              Special Expo 2026 Invitation
            </h3>
            <button id="expoCloseBtn" class="expo-close-btn" aria-label="Close Advertisement">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Card Body with Image -->
          <div class="expo-card-body">
            <div class="expo-card-image-wrap">
              <img 
                src="./assets/images/expo-invitation.jpg" 
                alt="Parth Plasto Pack - Expo Invitation 20, 21 & 22 August 2026, Helipad Exhibition Centre Gandhinagar, Hall 1 Stall D-168" 
                class="expo-card-image"
                loading="eager"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="expo-action-footer">
            <div class="expo-quick-info">
              <span><i class="fa-regular fa-calendar-days"></i> 20-22 Aug 2026</span>
              <span><i class="fa-solid fa-location-dot"></i> Hall 1, Stall D-168</span>
            </div>
            <div class="expo-btn-group">
              <a 
                href="https://wa.me/919825626651?text=Hello%20Parth%20Plasto%20Pack,%20I%20would%20like%20to%20connect%20regarding%20your%20Expo%20Invitation%20(Hall%201,%20Stall%20D-168)." 
                target="_blank" 
                class="expo-btn expo-btn-primary"
              >
                <i class="fa-brands fa-whatsapp"></i> RSVP on WhatsApp
              </a>
              <a 
                href="https://maps.google.com/?q=Helipad+Exhibition+Centre+Gandhinagar+Gujarat" 
                target="_blank" 
                class="expo-btn expo-btn-secondary"
              >
                <i class="fa-solid fa-location-arrow"></i> Get Directions
              </a>
              <a 
                href="tel:+919825626651" 
                class="expo-btn expo-btn-outline"
              >
                <i class="fa-solid fa-phone"></i> Call: +91 98256 26651
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Trigger Button to reopen -->
      <button id="expoFloatingBtn" class="expo-floating-trigger" aria-label="Open Expo 2026 Invitation">
        <div class="expo-floating-icon">
          <i class="fa-solid fa-calendar-star fa-bell"></i>
        </div>
        <div class="expo-floating-text">
          <span class="expo-floating-badge">Expo 2026</span>
          <div>Hall 1, Stall D-168</div>
        </div>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', expoHTML);
  }

  const modal = document.getElementById('expoModalBackdrop');
  const closeBtn = document.getElementById('expoCloseBtn');
  const floatingBtn = document.getElementById('expoFloatingBtn');
  const modalContainer = document.getElementById('expoModalContainer');

  function openExpoModal() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeExpoModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Close triggers
  if (closeBtn) {
    closeBtn.addEventListener('click', closeExpoModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeExpoModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeExpoModal();
    }
  });

  // Floating trigger button opens modal
  if (floatingBtn) {
    floatingBtn.addEventListener('click', openExpoModal);
  }

  // Auto-open ad after a short delay on page load (e.g. 1.2 seconds)
  setTimeout(() => {
    openExpoModal();
  }, 1200);
});
