// customer/js/about.js

let activeSlideIndex = 0;

const BRANCHES_DATA = [
    {
        id: 'bandung',
        name: 'Bandung',
        address: 'Jl. Soekarno Hatta No. 452, Bandung 40286',
        phone: '(021) 1234 5678',
        hours: 'Mon - Sat, 08.00 - 20.00',
        image: 'assets/branch-center.jpg',
        fallbackImg: 'assets/bengkel1.jpg'
    },
    {
        id: 'jakarta',
        name: 'Jakarta',
        address: 'Jl. TB Simatupang Kav. 18, Jakarta Selatan 12560',
        phone: '(021) 8765 4321',
        hours: 'Mon - Sat, 08.00 - 20.00',
        image: 'assets/branch-west.jpg',
        fallbackImg: 'assets/bengkel2.jpg'
    },
    {
        id: 'surabaya',
        name: 'Surabaya',
        address: 'Jl. Ahmad Yani No. 112, Surabaya 60234',
        phone: '(021) 2468 1357',
        hours: 'Mon - Sat, 08.00 - 20.00',
        image: 'assets/branch-south.jpg',
        fallbackImg: 'assets/bengkel3.jpg'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    updateAboutCarousel();
    renderBranchesGrid();

    document.querySelectorAll('.c3d-card').forEach((card) => {
        card.addEventListener('click', () => {
            const idx = Number(card.dataset.index);
            goToAboutSlide(idx);
        });
    });
});

function moveAboutSlide(step) {
    const total = document.querySelectorAll('.c3d-card').length;
    activeSlideIndex = (activeSlideIndex + step + total) % total;
    updateAboutCarousel();
}

function goToAboutSlide(index) {
    activeSlideIndex = index;
    updateAboutCarousel();
}

function updateAboutCarousel() {
    const cards = document.querySelectorAll('.c3d-card');
    const dots = document.querySelectorAll('.cdot');
    const total = cards.length;

    cards.forEach((card, idx) => {
        card.classList.remove('active', 'prev', 'next');
        if (idx === activeSlideIndex) {
            card.classList.add('active');
        } else if (idx === (activeSlideIndex - 1 + total) % total) {
            card.classList.add('prev');
        } else {
            card.classList.add('next');
        }
    });

    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeSlideIndex);
    });
}

function renderBranchesGrid() {
    const grid = document.getElementById('branchesGrid');
    if (!grid) return;

    grid.innerHTML = BRANCHES_DATA.map((b) => `
        <article class="branch-card">
            <div class="branch-photo-wrap">
                <img src="${b.image}" alt="${b.name}" onerror="this.src='${b.fallbackImg}'">
            </div>
            <div class="branch-card-body">
                <div class="branch-title-row">
                    <span>${b.name}</span>
                </div>
                <ul class="branch-meta-list" style="margin-bottom: 4px;">
                    <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1852b8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>${b.address}</span>
                    </li>
                    <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1852b8"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        <span>${b.phone}</span>
                    </li>
                    <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1852b8"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        <span>${b.hours}</span>
                    </li>
                </ul>
            </div>
        </article>
    `).join('');
}

function openBranchModal(branchId) {
    const branch = BRANCHES_DATA.find((b) => b.id === branchId);
    if (!branch) return;

    document.getElementById('modalBranchName').textContent = branch.name;
    document.getElementById('modalBranchAddress').textContent = branch.address;
    document.getElementById('modalBranchPhone').textContent = branch.phone;
    document.getElementById('modalBranchHours').textContent = branch.hours;
    document.getElementById('modalBranchFacilities').textContent = branch.facilities;

    const imgEl = document.getElementById('modalBranchImg');
    imgEl.src = branch.image;
    imgEl.onerror = () => { imgEl.src = branch.fallbackImg; };

    document.getElementById('branchDetailModal').style.display = 'flex';
}

function closeBranchModal() {
    document.getElementById('branchDetailModal').style.display = 'none';
}