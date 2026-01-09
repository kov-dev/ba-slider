/**
 * BA Slider - Attribute Driven Before/After Slider
 * Version: 1.0.0
 * Author: Your Name
 * License: MIT
 */
(function() {
  'use strict';

  const initSliders = () => {
    // 1. Select by Class
    const sliders = document.querySelectorAll('.ba-slider');

    sliders.forEach((slider) => {
      // Prevent double initialization
      if (slider.dataset.baInitialized) return;
      slider.dataset.baInitialized = "true";

      // 2. Find internal elements
      const before = slider.querySelector('.ba-slider--before');
      const handle = slider.querySelector('.ba-slider--handle');
      const knob = slider.querySelector('.ba-slider--knob'); // Positioning wrapper

      // If structure is missing, abort
      if (!before || !handle) return;

      // 3. Get Settings from Attributes
      const mode = slider.getAttribute('data-ba-mode') || 'drag';
      const verticalMode = slider.getAttribute('data-ba-vertical') || 'center';
      const rawDamping = parseFloat(slider.getAttribute('data-ba-damping') || '0.15');
      const damping = Math.max(0.01, Math.min(1, rawDamping));

      // State
      let isDragging = false;
      let targetX = 50;
      let currentX = 50;
      let targetY = 50;
      let currentY = 50;
      let rafId;

      const updateTargets = (clientX, clientY) => {
        const rect = slider.getBoundingClientRect();
        
        // X Logic
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        targetX = (x / rect.width) * 100;

        // Y Logic (only if vertical mode is enabled)
        if (verticalMode === 'move' && knob) {
          let y = clientY - rect.top;
          y = Math.max(0, Math.min(y, rect.height));
          targetY = (y / rect.height) * 100;
        }
      };

      const render = () => {
        const diffX = targetX - currentX;
        const diffY = targetY - currentY;

        // Stop animation loop if movement is negligible
        if (Math.abs(diffX) < 0.01 && Math.abs(diffY) < 0.01) {
            currentX = targetX;
            currentY = targetY;
            
            before.style.width = `${currentX}%`;
            handle.style.left = `${currentX}%`;
            
            if (verticalMode === 'move' && knob) {
               knob.style.top = `${currentY}%`;
            }
            
            rafId = requestAnimationFrame(render);
            return;
        }

        // Interpolation (Damping)
        currentX += diffX * damping;
        currentY += diffY * damping;

        before.style.width = `${currentX}%`;
        handle.style.left = `${currentX}%`;

        if (verticalMode === 'move' && knob) {
            if (knob.style.position !== 'absolute') knob.style.position = 'absolute';
            knob.style.top = `${currentY}%`;
        }
        
        rafId = requestAnimationFrame(render);
      };

      // Start Loop
      render();

      // --- Event Listeners ---

      const handleMouseDown = (e) => {
        e.preventDefault();
        isDragging = true;
        slider.setAttribute('data-ba-dragging', 'true');
        updateTargets(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          slider.removeAttribute('data-ba-dragging');
        }
      };

      const handleMouseMove = (e) => {
        // Vertical move logic works even on hover if enabled
        if (verticalMode === 'move' && knob) {
           const rect = slider.getBoundingClientRect();
           let y = e.clientY - rect.top;
           y = Math.max(0, Math.min(y, rect.height));
           targetY = (y / rect.height) * 100;
        }

        if (mode === 'hover') {
          updateTargets(e.clientX, e.clientY);
        } else if (mode === 'drag' && isDragging) {
          e.preventDefault();
          updateTargets(e.clientX, e.clientY);
        }
      };

      const handleTouchStart = (e) => {
         isDragging = true;
         slider.setAttribute('data-ba-dragging', 'true');
         const touch = e.touches[0];
         updateTargets(touch.clientX, touch.clientY);
      };

      const handleTouchMove = (e) => {
        // Prevent scroll on mobile if strictly dragging horizontally? 
        // usually better to let user scroll if not perfectly horizontal
        const touch = e.touches[0];
        updateTargets(touch.clientX, touch.clientY);
      };

      const handleTouchEnd = () => {
         isDragging = false;
         slider.removeAttribute('data-ba-dragging');
      };

      // Attach Listeners
      slider.addEventListener('mousemove', handleMouseMove);
      
      if (mode === 'drag') {
          slider.addEventListener('mousedown', handleMouseDown);
          // Window listeners for drag continuation outside element
          window.addEventListener('mouseup', handleMouseUp);
          window.addEventListener('mousemove', (e) => {
            if (isDragging) {
               e.preventDefault();
               updateTargets(e.clientX, e.clientY);
            }
          });
      }
      
      slider.addEventListener('touchstart', handleTouchStart, { passive: true });
      slider.addEventListener('touchmove', handleTouchMove, { passive: true });
      slider.addEventListener('touchend', handleTouchEnd);
      slider.addEventListener('touchcancel', handleTouchEnd);
    });
  };

  // Initialize on Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }

  // Optional: Observe for new elements (SPA support / Webflow Interactions)
  const observer = new MutationObserver((mutations) => {
     let shouldInit = false;
     for(const mutation of mutations) {
         if(mutation.addedNodes.length > 0) {
             shouldInit = true;
             break;
         }
     }
     if(shouldInit) initSliders();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });

})();
