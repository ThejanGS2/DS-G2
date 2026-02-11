console.log("Travel Sri Lanka Guest Page Loaded");

// 3D Horizontal Carousel (Destinations Page)
const carouselContainer = document.querySelector('.cylinder');
// Using same container class 'cylinder' to avoid breaking HTML,
// logically it acts as the carousel track now.

if (carouselContainer) {
    const originalCards = document.querySelectorAll('.cylinder-card');

    if (originalCards.length > 0) {
        // 1. Clone cards for infinite scroll illusion
        // We need enough copies to cover the screen width + buffer
        const targetCount = 15; // Fewer cards needed for linear view than dense cylinder
        const currentCount = originalCards.length;

        for (let i = 0; i < targetCount - currentCount; i++) {
            const sourceCard = originalCards[i % currentCount];
            const clone = sourceCard.cloneNode(true);
            carouselContainer.appendChild(clone);
        }

        const allCards = document.querySelectorAll('.cylinder-card');
        const totalCards = allCards.length;

        // 2. Configuration
        const cardWidth = 330; // Spacing between cards
        const totalWidth = totalCards * cardWidth;

        // 3. Interaction State
        let currentScroll = 0;
        let targetScroll = 0;
        let isDragging = false;
        let startX = 0;
        let lastX = 0;

        let autoScrollSpeed = 1;
        let isInteracting = false;
        let idleTimer = null;

        // Tilt State
        let currentTilt = 0;
        let targetTilt = 0;

        // Mouse Wheel
        window.addEventListener('wheel', (e) => {
            targetScroll += e.deltaY * 0.5; // Translate scroll Y to horizontal movement
            isInteracting = true;
            resetIdleTimer();
        });

        // Mouse Move (Tilt)
        window.addEventListener('mousemove', (e) => {
            const y = e.clientY / window.innerHeight;
            targetTilt = (y - 0.5) * 20;
        });

        // Touch
        const viewport = document.querySelector('.cylinder-viewport');
        viewport.addEventListener('touchstart', (e) => {
            isDragging = true;
            isInteracting = true;
            startX = e.touches[0].clientX;
            lastX = startX;
            resetIdleTimer();
        });

        viewport.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - lastX;

            targetScroll -= deltaX * 1.5; // Drag opposes scroll direction
            lastX = currentX;
            e.preventDefault();
        });

        viewport.addEventListener('touchend', () => {
            isDragging = false;
            resetIdleTimer();
        });

        function resetIdleTimer() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                isInteracting = false;
            }, 2000);
        }

        // Animation Loop
        function animate() {
            // Auto-scroll
            if (!isInteracting && !isDragging) {
                targetScroll += autoScrollSpeed;
            }

            // Smoothing
            currentScroll += (targetScroll - currentScroll) * 0.08;
            currentTilt += (targetTilt - currentTilt) * 0.1;

            // Apply Tilt to container (X-axis)
            carouselContainer.style.transform = `rotateX(${currentTilt}deg)`;

            const viewportCenter = window.innerWidth / 2;

            allCards.forEach((card, index) => {
                // Calculate position on the infinite track
                // itemPos is the abstract Base X position
                const itemBaseX = index * cardWidth;

                // Adjusted X relative to scroll
                // We use modulo to wrap around
                let relativeX = (itemBaseX - currentScroll) % totalWidth;

                // Handle negative wrap
                if (relativeX < -totalWidth / 2) relativeX += totalWidth;
                if (relativeX > totalWidth / 2) relativeX -= totalWidth;

                // Center the carousel
                // relativeX = 0 means card is AT the anchor point.
                // We want anchor point to be viewport center.
                // But we are plotting within the 'carouselContainer' which is centered?

                const xPos = relativeX;

                // 3D Transforms based on distance from center (0)
                const distFromCenter = Math.abs(xPos);

                // Max limits for effects
                const maxDist = 1000; // Increased range so effects are more gradual
                const progress = Math.min(distFromCenter / maxDist, 1);

                // Calculate properties
                // Z: pushes back less aggressively
                const z = -progress * 250; // Was 600, now 250 to keep them visible

                // RotateY: reduced rotation to keep content visible
                let rotateY = 0;
                if (xPos > 0) rotateY = -progress * 30; // Was 60, now 30
                else rotateY = progress * 30;

                // Opacity / Blur: Keep them more opaque
                const opacity = 1 - (progress * 0.2); // Only fades to 0.8
                const blur = progress * 2; // Subtle blur (2px)

                card.style.transform = `translateX(${xPos}px) translateZ(${z}px) rotateY(${rotateY}deg)`;
                card.style.filter = `brightness(${opacity}) blur(${blur}px)`;
                card.style.zIndex = Math.round(100 - progress * 100); // Front cards on top
            });

            requestAnimationFrame(animate);
        }
        animate();
    }
}

// Motion Layer Scroller (Index Page)
const motionScroller = document.querySelector('.motion-scroller');

if (motionScroller) {
    const cards = document.querySelectorAll('.destination-card');

    window.addEventListener('scroll', () => {
        // We need to calculate scale for each card based on the NEXT card's position
        cards.forEach((card, index) => {
            const nextCard = cards[index + 1];

            if (nextCard) {
                const rect = card.getBoundingClientRect();
                const nextRect = nextCard.getBoundingClientRect();

                // Calculate how much the next card overlaps the current one
                // When nextRect.top hits the intended sticky top of the next card, overlap starts increasing?
                // Actually, simple logic:
                // As the next card moves UP towards its sticky position, nothing happens to current.
                // Once next card is STICKY and we keep scrolling, it covers current.
                // Wait, sticky stacking means current stays, next covers.
                // We want current to SCALE DOWN as it gets covered.

                // The overlap is: (current.bottom - next.top) ?
                // Simpler: map the distance of nextCard from viewport bottom?
                // Or map the distance of nextCard.top from viewport top?

                const viewportHeight = window.innerHeight;

                // Distance of next card from top of viewport
                const nextCardTop = nextRect.top;

                // If next card is rising from bottom
                // We want to scale current card when next card gets close to it.
                // Let's say we start scaling when next card is 100px below its sticky position?

                // Let's use a simpler distance metric:
                // As next card rises to overlap current, current scales down.
                // Max overlap happens when next card reaches its sticky top.

                // Sticky top of next card (approx)
                // We can just use the visual overlap.

                const overlap = Math.max(0, rect.bottom - nextRect.top);
                // When overlap is 0 (next card far below), scale is 1.
                // When overlap is max (next card fully covering), scale is small.

                // But rect.bottom of sticky card stays constant? No.
                // A sticky card at top has fixed rect.top/bottom relative to viewport.
                // The next card moves UP until it hits its sticky top.

                // So nextRect.top decreases as we scroll down.

                // We want to scale current card based on nextRect.top

                // Range: 
                // Start scaling when nextRect.top < viewportHeight
                // End scaling when nextRect.top = stickyTop (e.g. 180px)

                const stickyTarget = 150 + ((index + 1) * 30); // Approx

                // Calculate a factor (0 to 1) 
                // 1 = next card is far away
                // 0 = next card is at its sticky position

                const distance = nextCardTop - stickyTarget;
                const range = 500; // Pixel range over which scaling happens

                let factor = distance / range;
                factor = Math.max(0, Math.min(1, factor));

                // Map factor to scale
                // If factor is 1 (far), scale 1
                // If factor is 0 (overlapped), scale 0.95 (or smaller)

                const scale = 0.9 + (0.1 * factor);

                // Apply scale
                // Filter brightness for depth
                const brightness = 0.5 + (0.5 * factor); // Darken as it goes back

                card.style.transform = `scale(${scale})`;
                card.style.filter = `brightness(${brightness})`;
            } else {
                // Last card stays 1
                card.style.transform = 'scale(1)';
                card.style.filter = 'brightness(1)';
            }
        });
    });
}

// Mobile menu toggle (placeholder for now)
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // You'll need to add styles for .nav-links.active in styles.css for this to work elegantly
    });
}

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal, .reveal-alternate');

const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

revealElements.forEach(element => {
    revealObserver.observe(element);
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    item.addEventListener('click', () => {
        // Close other items (optional, but good UX)
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').classList.remove('active');
            }
        });

        // Toggle current
        item.classList.toggle('active');
        const answer = item.querySelector('.faq-answer');
        answer.classList.toggle('active');
    });
});
