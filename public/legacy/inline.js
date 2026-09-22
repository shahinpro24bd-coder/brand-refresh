/* guard: create placeholders for optional element ids referenced below */
(function () {
  ["after15", "after16", "after17", "after18"].forEach(function (id) {
    if (!document.getElementById(id)) {
      var d = document.createElement("div");
      d.id = id;
      d.style.display = "none";
      document.body.appendChild(d);
    }
  });
})();


            const heroImages = [
                "/legacy/img/dr-arman-molazadeh.webp",
            ];

            let heroIndex = 0;
            const currentImg = document.getElementById("heroSliderImg");
            const nextImg = document.getElementById("heroSliderImgNext");

            if (currentImg && nextImg && heroImages.length > 1) {
                setInterval(() => {
                    heroIndex = (heroIndex + 1) % heroImages.length;
                    const nextImageSrc = heroImages[heroIndex];

                    nextImg.src = nextImageSrc;
                    nextImg.style.opacity = 1;
                    currentImg.style.opacity = 0;

                    setTimeout(() => {
                        currentImg.src = nextImageSrc;
                        currentImg.style.opacity = 1;
                        nextImg.style.opacity = 0;
                    }, 1000);
                }, 4000);
            }
        
        

        const after15 = document.getElementById('after15');
        const after16 = document.getElementById('after16');
        const after17 = document.getElementById('after17');
        const after18 = document.getElementById('after18');
        let isDragging = false;
        function updateSlider(percent) { percent = Math.max(0, Math.min(100, percent)); const clipRight = 100 - percent; after16.style.clipPath = `inset(0 ${clipRight}% 0 0)`; after17.style.left = percent + '%'; after18.style.left = percent + '%'; after15.setAttribute('aria-valuenow', Math.round(percent)); }
        function getPercent(clientX) { const rect = after15.getBoundingClientRect(); return ((clientX - rect.left) / rect.width) * 100; }
        after18.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
        after15.addEventListener('mousedown', (e) => { isDragging = true; updateSlider(getPercent(e.clientX)); });
        document.addEventListener('mousemove', (e) => { if (!isDragging) return; updateSlider(getPercent(e.clientX)); });
        document.addEventListener('mouseup', () => { isDragging = false; });
        after18.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); }, { passive: false });
        after15.addEventListener('touchstart', (e) => { isDragging = true; updateSlider(getPercent(e.touches[0].clientX)); }, { passive: true });
        document.addEventListener('touchmove', (e) => { if (!isDragging) return; updateSlider(getPercent(e.touches[0].clientX)); }, { passive: true });
        document.addEventListener('touchend', () => { isDragging = false; });
        updateSlider(50);




















































     

     function toggleCard(el) {
            var card = el.closest('.ser7');
            var details = card.querySelector('.ser14');
            var btnText = card.querySelector('.ser17');

            // close any other open card
            var openCards = document.querySelectorAll('.ser7.expanded');
            for (var i = 0; i < openCards.length; i++) {
                var openCard = openCards[i];
                if (openCard !== card) {
                    openCard.classList.remove('expanded');
                    openCard.querySelector('.ser14').style.maxHeight = '0';
                    openCard.querySelector('.ser17').textContent = 'Read More';
                }
            }

            // toggle current card
            if (card.classList.contains('expanded')) {
                card.classList.remove('expanded');
                details.style.maxHeight = '0';
                btnText.textContent = 'Read More';
            } else {
                card.classList.add('expanded');
                details.style.maxHeight = details.scrollHeight + 'px';
                btnText.textContent = 'Show Less';
            }
        }                          
























































                function shareContent() {
            const url = window.location.href;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    showNotification("Profile link copied successfully!");
                }).catch(() => {
                    fallbackCopy(url);
                });
            } else {
                fallbackCopy(url);
            }
        }

        function fallbackCopy(text) {
            const tempInput = document.createElement("input");
            tempInput.style.position = "fixed";
            tempInput.style.left = "-9999px";
            document.body.appendChild(tempInput);
            tempInput.value = text;
            tempInput.select();
            try {
                document.execCommand("copy");
                showNotification("Profile link copied successfully!");
            } catch (e) {
                showNotification("Could not copy link. Please copy manually.");
            }
            document.body.removeChild(tempInput);
        }

        let activeToast = null;

        function showNotification(message) {
            if (activeToast) {
                activeToast.remove();
            }

            const notification = document.createElement('div');
            notification.className = 'toast-notification';
            notification.innerHTML = `
                <div class="toast-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <span>${message}</span>
            `;
            document.body.appendChild(notification);
            activeToast = notification;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    notification.classList.add('visible');
                });
            });

            setTimeout(() => {
                notification.classList.remove('visible');
                notification.classList.add('hiding');
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                    if (activeToast === notification) activeToast = null;
                }, 300);
            }, 3000);
        }

















document.querySelectorAll('.chamber-btn').forEach(function(button) {

    button.addEventListener('click', function(e) {

        e.preventDefault();

        const appointment =
            document.querySelector('#appointment');

        if (appointment) {

            appointment.scrollIntoView({
                behavior: 'smooth'
            });

        }

    });

});
  

















































    


window.sendWhatsAppBooking = function (form) {
    try {
        var get = function (n) {
            var el = form.querySelector('[name="' + n + '"]');
            return el && el.value ? el.value.trim() : '';
        };
        var lines = [];
        lines.push('Hello, I would like to book an appointment with Dr. Arman Molazadeh.');
        if (get('name')) lines.push('Name: ' + get('name'));
        if (get('phone')) lines.push('Phone: ' + get('phone'));
        if (get('date')) lines.push('Preferred date: ' + get('date'));
        if (get('message')) lines.push('Message: ' + get('message'));
        window.open('https://wa.me/971567515919?text=' + encodeURIComponent(lines.join('\n')), '_blank');
    } catch (e) {
        window.open('https://wa.me/971567515919?text=' + encodeURIComponent('Hello, I would like to book an appointment with Dr. Arman Molazadeh.'), '_blank');
    }
    return false;
};
