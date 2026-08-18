document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  
  if (form) {
    // Pre-fill subject if coming from product detail
    const urlParams = new URLSearchParams(window.location.search);
    const product = urlParams.get('product');
    if (product) {
      document.getElementById('subject').value = `Inquiry regarding ${product}`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      // Reset errors
      document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
      
      // Name validation
      const name = document.getElementById('name').value.trim();
      if (!name) {
        document.getElementById('nameGroup').classList.add('has-error');
        isValid = false;
      }
      
      // Email validation
      const email = document.getElementById('email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        document.getElementById('emailGroup').classList.add('has-error');
        isValid = false;
      }
      
      // Phone validation
      const phone = document.getElementById('phone').value.trim();
      const phoneRegex = /^[\d\s\+\-\(\)]{7,15}$/;
      if (!phone || !phoneRegex.test(phone)) {
        document.getElementById('phoneGroup').classList.add('has-error');
        isValid = false;
      }
      
      // Message validation
      const message = document.getElementById('message').value.trim();
      if (!message) {
        document.getElementById('messageGroup').classList.add('has-error');
        isValid = false;
      }
      
      if (isValid) {
        // Save to IndexedDB if available
        if (typeof addInquiry === 'function') {
          const subject = document.getElementById('subject')?.value.trim() || '';
          addInquiry({
            name: name,
            email: email,
            phone: phone,
            productName: subject,
            company: 'Website Contact',
            message: message
          }).catch(err => console.warn('Inquiry DB save:', err));
        }

        // Show success state without reload
        const successMsg = document.getElementById('successMsg');
        if (successMsg) successMsg.style.display = 'block';
        
        // Disable form inputs
        const inputs = form.querySelectorAll('input, textarea, button');
        inputs.forEach(input => input.disabled = true);
        
        // Hide success message after 5 seconds and reset
        setTimeout(() => {
          if (successMsg) successMsg.style.display = 'none';
          inputs.forEach(input => input.disabled = false);
          form.reset();
        }, 5000);
      }
    });
  }
});
