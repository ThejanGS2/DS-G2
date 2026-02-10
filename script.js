console.log("Travel Sri Lanka Guest Page Loaded");

// Motion Layer Scroller (Destinations Page)
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
