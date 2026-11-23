// js/about.js
let activeCarouselIdx = 0;

document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
});

function renderCarouselSlide(index) {
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".ind-dot");
    if (slides.length === 0) return;

    if (index >= slides.length) activeCarouselIdx = 0;
    else if (index < 0) activeCarouselIdx = slides.length - 1;
    else activeCarouselIdx = index;

    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));

    slides[activeCarouselIdx].classList.add("active");
    if (dots[activeCarouselIdx]) {
        dots[activeCarouselIdx].classList.add("active");
    }
}

function moveCarousel(step) {
    renderCarouselSlide(activeCarouselIdx + step);
}

function jumpToCarousel(index) {
    renderCarouselSlide(index);
}