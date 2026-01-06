// rev.js - Updated for professional review system
document.addEventListener('DOMContentLoaded', function() {
  // Star rating functionality for new reviews
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('rating');
  const submitBtn = document.querySelector('.submit-btn');
  
  if (stars.length > 0 && ratingInput) {
    let currentRating = 0;
    
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const value = parseInt(this.getAttribute('data-value'));
        currentRating = value;
        ratingInput.value = value;
        
        // Update star display
        stars.forEach((s, index) => {
          if (index < value) {
            s.textContent = '★';
            s.classList.add('active');
          } else {
            s.textContent = '☆';
            s.classList.remove('active');
          }
        });
        
        // Enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.add('active');
        }
      });
      
      star.addEventListener('mouseover', function() {
        const value = parseInt(this.getAttribute('data-value'));
        
        stars.forEach((s, index) => {
          if (index < value) {
            s.textContent = '★';
            s.classList.add('active');
          } else {
            s.textContent = '☆';
            s.classList.remove('active');
          }
        });
      });
      
      star.addEventListener('mouseout', function() {
        stars.forEach((s, index) => {
          if (index < currentRating) {
            s.textContent = '★';
            s.classList.add('active');
          } else {
            s.textContent = '☆';
            s.classList.remove('active');
          }
        });
      });
    });
  }
  
  // See More/Less functionality for long reviews
  function toggleReadMore(button) {
    const commentText = button.parentElement.querySelector('.comment-text');
    const fullText = commentText.textContent;
    
    if (button.textContent === 'See more') {
      commentText.style.maxHeight = 'none';
      commentText.style.overflow = 'visible';
      button.textContent = 'See less';
    } else {
      commentText.style.maxHeight = '4.5em'; // 3 lines of text
      commentText.style.overflow = 'hidden';
      button.textContent = 'See more';
    }
  }
  
  // Attach event listeners to existing See more buttons
  document.querySelectorAll('.see-more-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      toggleReadMore(this);
    });
  });
  
  // Initialize comments with "See more" if they're long
  document.querySelectorAll('.review-comment-pro .comment-text').forEach(comment => {
    if (comment.textContent.length > 200) {
      comment.style.maxHeight = '4.5em'; // 3 lines of text
      comment.style.overflow = 'hidden';
      comment.style.display = 'block';
    }
  });
  
  // Form validation
  const reviewForm = document.querySelector('form[action*="/reviews"]');
  if (reviewForm) {
    const textarea = reviewForm.querySelector('textarea[name="review[comment]"]');
    const charCount = document.createElement('div');
    charCount.className = 'char-count';
    charCount.style.fontSize = '12px';
    charCount.style.color = '#717171';
    charCount.style.textAlign = 'right';
    charCount.style.marginTop = '4px';
    textarea.parentNode.insertBefore(charCount, textarea.nextSibling);
    
    textarea.addEventListener('input', function() {
      const remaining = 1000 - this.value.length;
      charCount.textContent = `${remaining} characters remaining`;
      
      if (remaining < 0) {
        charCount.style.color = '#FF385C';
      } else if (remaining < 100) {
        charCount.style.color = '#ff9800';
      } else {
        charCount.style.color = '#717171';
      }
    });
    
    // Trigger initial count
    textarea.dispatchEvent(new Event('input'));
  }
});

// Make toggleReadMore function available globally
window.toggleReadMore = function(button) {
  const commentText = button.parentElement.querySelector('.comment-text');
  
  if (button.textContent === 'See more') {
    commentText.style.maxHeight = 'none';
    commentText.style.overflow = 'visible';
    button.textContent = 'See less';
  } else {
    commentText.style.maxHeight = '4.5em';
    commentText.style.overflow = 'hidden';
    button.textContent = 'See more';
  }
};