console.log("Travel Sri Lanka Guest Page Loaded");

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
const revealElements = document.querySelectorAll('.reveal');

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
