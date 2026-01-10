<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT YOUR SLIDER (Make sure ID matches)
    const slider = document.getElementById('my-slider');
    
    // Buttons
    const btnDrag = document.getElementById('btn-mode-drag');
    const btnHover = document.getElementById('btn-mode-hover');
    const btnVertOff = document.getElementById('btn-vertical-off');
    const btnVertOn = document.getElementById('btn-vertical-on');
    const btnFade = document.getElementById('btn-fade-toggle');

    if(!slider) return;

    // Helper to toggle active class on buttons
    const toggleActive = (btnToActivate, group) => {
        group.forEach(b => b.classList.remove('active'));
        btnToActivate.classList.add('active');
    };

    // --- LOGIC ---

    // 1. Mode
    if(btnDrag && btnHover) {
        btnDrag.addEventListener('click', () => {
            slider.setAttribute('data-ba-mode', 'drag');
            toggleActive(btnDrag, [btnDrag, btnHover]);
        });
        btnHover.addEventListener('click', () => {
            slider.setAttribute('data-ba-mode', 'hover');
            toggleActive(btnHover, [btnDrag, btnHover]);
        });
    }

    // 2. Vertical
    if(btnVertOff && btnVertOn) {
        btnVertOff.addEventListener('click', () => {
            slider.setAttribute('data-ba-vertical', 'center');
            toggleActive(btnVertOff, [btnVertOff, btnVertOn]);
        });
        btnVertOn.addEventListener('click', () => {
            slider.setAttribute('data-ba-vertical', 'move');
            toggleActive(btnVertOn, [btnVertOff, btnVertOn]);
        });
    }

    // 3. Fade Toggle (Finds the inner visual div)
    if(btnFade) {
        btnFade.addEventListener('click', () => {
            // Find the visual element inside the knob
            const visual = slider.querySelector('.ba-slider--knob > div'); 
            if(visual) {
                if(visual.hasAttribute('data-ba-fade')) {
                    visual.removeAttribute('data-ba-fade');
                    btnFade.classList.remove('active');
                    btnFade.innerText = "Always Visible";
                } else {
                    visual.setAttribute('data-ba-fade', '');
                    btnFade.classList.add('active');
                    btnFade.innerText = "Fade on Move";
                }
            }
        });
    }
});
</script>
