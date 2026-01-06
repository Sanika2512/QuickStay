// Map Section Interactive Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Google Maps integration
  const openGoogleMapsBtn = document.getElementById('openGoogleMaps');
  
  if (openGoogleMapsBtn) {
    // Add click analytics (optional)
    openGoogleMapsBtn.addEventListener('click', function(e) {
      // You can add tracking here if needed
      console.log('Opening Google Maps for location');
      
      // Optional: Add a small delay for visual feedback
      const originalHTML = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Opening...';
      
      setTimeout(() => {
        this.innerHTML = originalHTML;
      }, 1000);
    });
  }
  
  // Map preview interactive hover effect
  const mapBackground = document.getElementById('mapBackground');
  
  if (mapBackground) {
    mapBackground.addEventListener('mousemove', function(e) {
      const x = e.clientX - this.getBoundingClientRect().left;
      const y = e.clientY - this.getBoundingClientRect().top;
      
      // Calculate parallax effect
      const moveX = (x / this.offsetWidth - 0.5) * 10;
      const moveY = (y / this.offsetHeight - 0.5) * 10;
      
      // Apply subtle parallax to map labels
      const labels = this.querySelectorAll('.map-label');
      labels.forEach(label => {
        const originalX = parseFloat(label.style.left);
        const originalY = parseFloat(label.style.top);
        
        label.style.transform = `translate(-50%, -50%) translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
      });
    });
    
    mapBackground.addEventListener('mouseleave', function() {
      // Reset labels position
      const labels = this.querySelectorAll('.map-label');
      labels.forEach(label => {
        label.style.transform = 'translate(-50%, -50%)';
      });
    });
  }
  
  // Toggle location details with animation
  const locationDetailsBtn = document.querySelector('[data-bs-target="#locationMoreInfo"]');
  
  if (locationDetailsBtn) {
    locationDetailsBtn.addEventListener('click', function() {
      const icon = this.querySelector('i');
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Update text
      const textSpan = this.querySelector('span');
      const detailText = this.querySelector('small');
      
      if (isExpanded) {
        textSpan.innerHTML = '<i class="fas fa-chevron-down me-2"></i>What\'s nearby';
        detailText.textContent = 'Click to expand';
      } else {
        textSpan.innerHTML = '<i class="fas fa-chevron-up me-2"></i>What\'s nearby';
        detailText.textContent = 'Click to collapse';
      }
    });
  }
  
  // Add subtle animation to map grid points
  const gridPoints = document.querySelectorAll('.map-grid-point');
  
  gridPoints.forEach((point, index) => {
    // Stagger animation
    point.style.animation = `pulse ${2 + index * 0.5}s infinite alternate`;
  });
  
  // Simulate loading animation for map (optional)
  const mapContainer = document.querySelector('.map-preview-container');
  
  if (mapContainer) {
    // Add a subtle shimmer effect on load
    mapContainer.style.opacity = '0';
    
    setTimeout(() => {
      mapContainer.style.transition = 'opacity 0.5s ease';
      mapContainer.style.opacity = '1';
    }, 300);
  }
});