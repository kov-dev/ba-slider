/**
 * BA Slider - Attribute Driven Before/After Slider
 * Version: 1.1.0 (Reactive Update)
 * Author: Your Name
 * License: MIT
 */
(function() {
  'use strict';

  const initSliders = () => {
    const sliders = document.querySelectorAll('.ba-slider');

    sliders.forEach((slider) => {
      if (slider.dataset.baInitialized) return;
      slider.dataset.baInitialized = "true";

      const before = slider.querySelector('.ba-slider--before');
      const handle = slider.querySelector('.ba-slider--handle');
      const knob = slider.querySelector('.ba-slider--knob');

      if (!before || !handle) return;

      // State
      let isDragging = false;
      let targetX = 50;
      let currentX = 50;
      let targetY = 50;
      let currentY = 50;
      let rafId;

      // Helper to get settings dynamically (Reactive)
      const getSettings = () => {
        const mode = slider.getAttribute('data-ba-mode') || 'drag';
        const verticalMode = slider.getAttribute('data-ba-vertical') || 'center';
        const rawDamping = parseFloat(slider.getAttribute('data-ba-damping') || '0.15');
        const damping = Math.max(0.01, Math.min(1, rawDamping));
        return { mode, verticalMode, damping };
      };

      const updateTargets = (clientX, clientY) => {
        const rect = slider.getBoundingClientRect();
        const { verticalMode } = getSettings();
        
        // X Logic
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        targetX = (x / rect.width) * 100;

        // Y Logic
        if (verticalMode === 'move' && knob) {
          let y = clientY - rect.top;
          y = Math.max(0, Math.min(y, rect.height));
          targetY = (y / rect.height) * 100;
        }
      };

      const render = () => {
        const { verticalMode, damping } = getSettings();
        const diffX = targetX - currentX;
        const diffY = targetY - currentY;

        // Optimization: Stop if static
        if (Math.abs(diffX) < 0.01 && Math.abs(diffY) < 0.01) {
            currentX = targetX;
            currentY = targetY;
            
            before.style.width = `${currentX}%`;
            handle.style.left = `${currentX}%`;
            
            if (verticalMode === 'move' && knob) {
               knob.style.top = `${currentY}%`;
            } else if (knob) {
                // Reset to center if mode switched back to static
                knob.style.top = '50%';
            }
            
            rafId = requestAnimationFrame(render);
            return;
        }

        // Interpolation
        currentX += diffX * damping;
        currentY += diffY * damping;

        before.style.width = `${currentX}%`;
        handle.style.left = `${currentX}%`;

        if (verticalMode === 'move' && knob) {
            if (knob.style.position !== 'absolute') knob.style.position = 'absolute';
            knob.style.top = `${currentY}%`;
        } else if (knob) {
             knob.style.top = '50%';
        }
        
        rafId = requestAnimationFrame(render);
      };

      // Start Loop
      render();

      // --- Event Listeners ---

      const handleMouseDown = (e) => {
        const { mode } = getSettings();
        if (mode !== 'drag') return;

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
        const { mode, verticalMode } = getSettings();

        // Allow vertical movement update even in hover mode if enabled
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
        const touch = e.touches[0];
        updateTargets(touch.clientX, touch.clientY);
      };

      const handleTouchEnd = () => {
         isDragging = false;
         slider.removeAttribute('data-ba-dragging');
      };

      // Always attach basic listeners, filter logic inside
      slider.addEventListener('mousemove', handleMouseMove);
      slider.addEventListener('mousedown', handleMouseDown);
      
      // Global listeners need to be careful not to stack too many
      // But for this pattern, adding them once per slider is acceptable or could be optimized to document level
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            updateTargets(e.clientX, e.clientY);
        }
      });
      
      slider.addEventListener('touchstart', handleTouchStart, { passive: true });
      slider.addEventListener('touchmove', handleTouchMove, { passive: true });
      slider.addEventListener('touchend', handleTouchEnd);
      slider.addEventListener('touchcancel', handleTouchEnd);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }

  // SPA / Mutation Support
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
