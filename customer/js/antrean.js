// customer/js/antrean.js

let currentBranchKey = 'bandung';
let verifiedTickets = [];
let activeTicketIndex = 0;
let notificationHistory = [];

const BRANCH_QUEUE_DATA = {
    bandung: {
        title: 'DrivePro Bandung',
        photo: 'assets/branch-center.jpg',
        totalBays: 6,
        simStage: 1,
        waitingList: [],
        bays: [
            { bay: 1, status: 'called', statusText: 'Dipanggil', bookingId: 'BK-20261123-015', ticket: 'A-015', phone: '08123456789', car: 'Toyota Avanza (D 1428 ABC)', service: 'Ganti Oli & Cek Rem', est: '± 10 Menit' },
            { bay: 2, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-012', ticket: 'A-012', phone: '08123456789', car: 'Hyundai Ioniq 5 (D 88 EV)', service: 'Battery Health Check', est: '± 20 Menit' },
            { bay: 3, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-013', ticket: 'A-013', phone: '08131112223', car: 'Mitsubishi Xpander (D 5510 KLM)', service: 'Tune Up Lengkap', est: '± 35 Menit' },
            { bay: 4, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' },
            { bay: 5, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' },
            { bay: 6, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' }
        ]
    },
    jakarta: {
        title: 'DrivePro Jakarta',
        photo: 'assets/branch-west.jpg',
        totalBays: 8,
        simStage: 1,
        waitingList: [
            { bookingId: 'BK-20261123-026', ticket: 'J-026', phone: '08120000111', car: 'Toyota Innova Zenix (B 2190 KLA)', service: 'Servis Hybrid & Oli', est: '± 20 Menit' },
            { bookingId: 'BK-20261123-027', ticket: 'J-027', phone: '08120000222', car: 'Mazda CX-5 (B 1844 RFD)', service: 'Spooring & Balancing', est: '± 35 Menit' }
        ],
        bays: [
            { bay: 1, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-020', ticket: 'J-020', phone: '08111111111', car: 'BMW 320i (B 889 BMW)', service: 'Full Diagnostic & Oli', est: '± 25 Menit' },
            { bay: 2, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-021', ticket: 'J-021', phone: '08112222222', car: 'Toyota Fortuner (B 1902 PQR)', service: 'Servis Berkala 40.000 km', est: '± 40 Menit' },
            { bay: 3, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-022', ticket: 'J-022', phone: '08113333333', car: 'Hyundai Creta (B 2451 STU)', service: 'Servis AC & Filter Kabin', est: '± 15 Menit' },
            { bay: 4, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-023', ticket: 'J-023', phone: '08114444444', car: 'Honda CR-V (B 1029 VWX)', service: 'Tune Up & Ganti Busi', est: '± 30 Menit' },
            { bay: 5, status: 'called', statusText: 'Dipanggil', bookingId: 'BK-20261123-024', ticket: 'J-024', phone: '08123456789', car: 'Toyota Raize (B 1745 YZA)', service: 'Ganti Oli Sintetik', est: '± 10 Menit' },
            { bay: 6, status: 'called', statusText: 'Dipanggil', bookingId: 'BK-20261123-025', ticket: 'J-025', phone: '08116666666', car: 'Wuling Air EV (B 402 EV)', service: 'Pengecekan Kelistrikan', est: '± 10 Menit' },
            { bay: 7, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' },
            { bay: 8, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' }
        ]
    },
    surabaya: {
        title: 'DrivePro Surabaya',
        photo: 'assets/branch-south.jpg',
        totalBays: 5,
        simStage: 1,
        waitingList: [],
        bays: [
            { bay: 1, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-007', ticket: 'S-007', phone: '08151111111', car: 'Toyota Rush (L 1523 AB)', service: 'Servis Rem & Kaki-Kaki', est: '± 30 Menit' },
            { bay: 2, status: 'working', statusText: 'Dikerjakan', bookingId: 'BK-20261123-008', ticket: 'S-008', phone: '08152222222', car: 'Honda Brio (L 1982 CD)', service: 'Tune Up & Ganti Oli', est: '± 15 Menit' },
            { bay: 3, status: 'called', statusText: 'Dipanggil', bookingId: 'BK-20261123-009', ticket: 'S-009', phone: '08123456789', car: 'Daihatsu Terios (L 1409 EF)', service: 'Servis Berkala 10.000 km', est: '± 10 Menit' },
            { bay: 4, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' },
            { bay: 5, status: 'empty', statusText: 'Kosong', bookingId: '-', ticket: '-', phone: '', car: '-', service: 'Bay Siap Menerima Kendaraan', est: '-' }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mergeBookingsFromServicePage();
    renderQueuePage();
    updateTimestamp();
});

function mergeBookingsFromServicePage() {
    try {
        const list = JSON.parse(localStorage.getItem('drivepro_bookings_list') || '[]');
        // Ambil maksimal 2 booking terbaru dari localStorage yang valid memiliki plat nomor
        const validRecent = list
            .filter(item => /\([A-Z0-9\s]+\)/i.test(item.car || ''))
            .slice(-2);

        validRecent.forEach(item => {
            const branchKey = (item.branch || 'bandung').toLowerCase();
            const targetBranch = BRANCH_QUEUE_DATA[branchKey];
            if (!targetBranch) return;

            const alreadyExists = targetBranch.bays.some(b => b.bookingId === item.bookingId) ||
                                  targetBranch.waitingList.some(w => w.bookingId === item.bookingId);
            if (alreadyExists) return;

            const emptyBay = targetBranch.bays.find(b => b.status === 'empty');
            if (emptyBay) {
                emptyBay.status = 'called';
                emptyBay.statusText = 'Dipanggil';
                emptyBay.bookingId = item.bookingId;
                emptyBay.ticket = item.ticket;
                emptyBay.phone = item.phone;
                emptyBay.car = item.car;
                emptyBay.service = item.service;
                emptyBay.est = '± 10 Menit';
            } else {
                targetBranch.waitingList.push({
                    bookingId: item.bookingId,
                    ticket: item.ticket,
                    phone: item.phone,
                    car: item.car,
                    service: item.service,
                    est: '± 20 Menit'
                });
            }
        });
    } catch (err) {}
}

document.addEventListener('click', (e) => {
    const branchWrap = document.getElementById('branchDropdownWrapper');
    if (branchWrap && !branchWrap.contains(e.target)) branchWrap.classList.remove('open');

    const bellWrap = document.getElementById('notifBellWrapper');
    if (bellWrap && !bellWrap.contains(e.target)) bellWrap.classList.remove('open');
});

function toggleBranchDropdown() {
    const wrapper = document.getElementById('branchDropdownWrapper');
    if (wrapper) wrapper.classList.toggle('open');
}

function selectCustomBranch(branchKey, branchLabel, btnEl) {
    currentBranchKey = branchKey;
    const labelEl = document.getElementById('selectedBranchLabel');
    if (labelEl) labelEl.textContent = branchLabel;

    document.querySelectorAll('.branch-option').forEach(opt => opt.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const wrapper = document.getElementById('branchDropdownWrapper');
    if (wrapper) wrapper.classList.remove('open');

    resetBookingLookup();
    renderQueuePage();
    updateTimestamp();
}

function quickFillDemoTicket() {
    const input = document.getElementById('bookingLookupInput');
    if (input) {
        input.value = '08123456789';
        input.focus();
    }
}

function handleBookingLookup(event) {
    event.preventDefault();
    const inputEl = document.getElementById('bookingLookupInput');
    const errEl = document.getElementById('lookupErrorMsg');
    if (!inputEl || !errEl) return;

    const query = inputEl.value.trim().toUpperCase();
    const cleanPhone = query.replace(/\D/g, '');
    const data = BRANCH_QUEUE_DATA[currentBranchKey];

    const matchPredicate = (item) =>
        (item.bookingId && item.bookingId !== '-' && item.bookingId.toUpperCase() === query) ||
        (item.ticket && item.ticket !== '-' && item.ticket.toUpperCase() === query) ||
        (cleanPhone.length >= 6 && item.phone && item.phone.replace(/\D/g, '').includes(cleanPhone));

    // Pastikan setiap mobil yang tampil selalu memiliki plat nomor
    const formatWithPlate = (carName, idx) => {
        if (/\([A-Z0-9\s]+\)/i.test(carName)) return carName;
        const fallbackPlates = ['D 1428 ABC', 'D 88 EV'];
        return `${carName} (${fallbackPlates[idx % fallbackPlates.length]})`;
    };

    const matchedFromBays = data.bays.filter(matchPredicate).map((b, i) => ({
        bookingId: b.bookingId,
        ticket: b.ticket,
        car: formatWithPlate(b.car, i)
    }));

    const matchedFromWait = data.waitingList.filter(matchPredicate).map((w, i) => ({
        bookingId: w.bookingId,
        ticket: w.ticket,
        car: formatWithPlate(w.car, i)
    }));

    // Batasi maksimal 2 mobil contoh agar rapi
    const allMatches = [...matchedFromBays, ...matchedFromWait].slice(0, 2);

    if (allMatches.length === 0) {
        errEl.textContent = `Data tidak ditemukan di ${data.title}. Pastikan No. HP atau No. Booking sesuai dengan cabang yang dipilih.`;
        errEl.style.display = 'block';
        return;
    }

    errEl.style.display = 'none';
    activateVerifiedTickets(allMatches, true);
}

function activateVerifiedTickets(ticketList, withSound) {
    verifiedTickets = ticketList;
    activeTicketIndex = 0;

    document.getElementById('lookupFormState').style.display = 'none';
    document.getElementById('verifiedStatusState').style.display = 'flex';
    document.getElementById('liveBadgeIndicator').style.display = 'inline-flex';
    document.getElementById('myQueueNumberBadge').style.display = 'inline-block';
    document.getElementById('btnSimulateDemo').style.display = 'inline-block';
    document.getElementById('notifBellWrapper').style.display = 'flex';

    renderMultiVehicleTabs();
    renderQueuePage();

    const data = BRANCH_QUEUE_DATA[currentBranchKey];
    verifiedTickets.forEach((item, idx) => {
        const inBay = data.bays.find(b => b.ticket.toUpperCase() === item.ticket.toUpperCase());
        if (inBay && inBay.status === 'called') {
            triggerQueueNotification(
                'called',
                `Giliran Tiba • ${item.car} (${item.ticket})`,
                `Silakan arahkan ${item.car} ke Bay ${inBay.bay} di ${data.title}.`,
                withSound && idx === 0
            );
        } else if (inBay && inBay.status === 'working') {
            triggerQueueNotification(
                'working',
                `Sedang Dikerjakan • ${item.car} (${item.ticket})`,
                `${item.car} sedang ditangani di Bay ${inBay.bay} (${inBay.est}).`,
                withSound && idx === 0
            );
        }
    });
}

function renderMultiVehicleTabs() {
    const tabsWrap = document.getElementById('multiVehicleTabs');
    if (!tabsWrap) return;

    if (verifiedTickets.length <= 1) {
        tabsWrap.style.display = 'none';
        tabsWrap.innerHTML = '';
        return;
    }

    // Susun sebagai list baris vertikal penuh (1 baris per mobil)
    tabsWrap.style.display = 'flex';
    tabsWrap.style.flexDirection = 'column';
    tabsWrap.style.gap = '8px';
    tabsWrap.style.width = '100%';

    tabsWrap.innerHTML = verifiedTickets.map((item, idx) => {
        const isActive = idx === activeTicketIndex;
        return `
            <button type="button"
                class="mv-tab-btn ${isActive ? 'active' : ''}"
                onclick="switchActiveVehicleTab(${idx})"
                style="
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    text-align: left;
                ">
                <span style="font-size: 13.5px; font-weight: 700;">${item.car}</span>
                <span class="mv-tab-code" style="flex-shrink: 0;">${item.ticket}</span>
            </button>
        `;
    }).join('');
}

function switchActiveVehicleTab(idx) {
    activeTicketIndex = idx;
    renderMultiVehicleTabs();
    renderQueuePage();
}

function resetBookingLookup() {
    verifiedTickets = [];
    activeTicketIndex = 0;
    notificationHistory = [];
    renderNotifHistory();

    document.getElementById('lookupFormState').style.display = 'flex';
    document.getElementById('verifiedStatusState').style.display = 'none';
    document.getElementById('liveBadgeIndicator').style.display = 'none';
    document.getElementById('myQueueNumberBadge').style.display = 'none';
    document.getElementById('btnSimulateDemo').style.display = 'none';
    document.getElementById('notifBellWrapper').style.display = 'none';
    document.getElementById('liveToastContainer').innerHTML = '';
    renderQueuePage();
}

function renderQueuePage() {
    const data = BRANCH_QUEUE_DATA[currentBranchKey];
    if (!data) return;

    document.getElementById('heroBranchTitle').textContent = data.title;
    document.getElementById('heroBranchPhoto').src = data.photo;

    const workingCount = data.bays.filter(b => b.status === 'working').length;
    const calledCount = data.bays.filter(b => b.status === 'called').length;
    const waitingCount = data.waitingList.length;

    document.getElementById('statInProgress').textContent = workingCount;
    document.getElementById('statCalled').textContent = calledCount;
    document.getElementById('statWaiting').textContent = waitingCount;

    document.getElementById('barInProgress').style.width = `${Math.round((workingCount / data.totalBays) * 100)}%`;
    document.getElementById('barCalled').style.width = `${Math.max(15, Math.round((calledCount / data.totalBays) * 100))}%`;
    document.getElementById('barWaiting').style.width = `${waitingCount === 0 ? 8 : Math.min(100, waitingCount * 24)}%`;

    const activeObj = verifiedTickets[activeTicketIndex];
    if (activeObj) {
        renderMyTicketStatus(data, activeObj.ticket);
    }

    const baysGrid = document.getElementById('baysGridContainer');
    baysGrid.innerHTML = data.bays.map(b => {
        const isMine = verifiedTickets.some(t => t.ticket.toUpperCase() === b.ticket.toUpperCase());
        return `
            <div class="bay-box ${isMine ? 'mine' : ''}" onclick="inspectSingleBay(${b.bay})" title="Klik untuk detail Bay ${b.bay}">
                <div class="bay-car-lift">
                    <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                        <rect x="4" y="4" width="3.2" height="28" rx="1.5" fill="#1852b8"/>
                        <rect x="28.8" y="4" width="3.2" height="28" rx="1.5" fill="#1852b8"/>
                        <path d="M2.5 32H9M27 32H33.5" stroke="#0b2c6b" stroke-width="2.4" stroke-linecap="round"/>
                        <path d="M7 22.5H29" stroke="#1852b8" stroke-width="2.2" stroke-linecap="round"/>
                        <path d="M10.5 15.5L12.3 10.8C12.7 9.8 13.6 9.2 14.7 9.2H21.3C22.4 9.2 23.3 9.8 23.7 10.8L25.5 15.5H10.5Z" fill="#93c5fd" stroke="#0b2c6b" stroke-width="1.6" stroke-linejoin="round"/>
                        <rect x="9" y="15" width="18" height="5.5" rx="2" fill="#1d63dc" stroke="#0b2c6b" stroke-width="1.6"/>
                        <circle cx="12.2" cy="17.7" r="1.1" fill="#ffffff"/>
                        <circle cx="23.8" cy="17.7" r="1.1" fill="#ffffff"/>
                        <rect x="15.5" y="17.2" width="5" height="1.6" rx="0.8" fill="#dbeafe"/>
                        <rect x="10.5" y="20.5" width="2.8" height="2.4" rx="0.8" fill="#0b2c6b"/>
                        <rect x="22.7" y="20.5" width="2.8" height="2.4" rx="0.8" fill="#0b2c6b"/>
                    </svg>
                </div>
                <div class="bay-meta">
                    <strong>Bay ${b.bay}</strong>
                    <span class="status-chip ${b.status}">
                        <span class="dot"></span>
                        ${b.statusText}
                    </span>
                    <span class="bay-ticket-text">${b.ticket}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateStepperUI(stageIdx) {
    const steps = document.querySelectorAll('#queueStepperBar .qstep');
    const lines = document.querySelectorAll('#queueStepperBar .qstep-line');

    steps.forEach((step, idx) => {
        step.classList.remove('done', 'active');
        const node = step.querySelector('.qstep-node');
        if (!node) return;

        if (idx < stageIdx) {
            step.classList.add('done');
            node.innerHTML = '&#10003;';
        } else if (idx === stageIdx) {
            step.classList.add('active');
            node.textContent = idx === 3 ? '✓' : String(idx + 1);
        } else {
            node.textContent = String(idx + 1);
        }
    });

    lines.forEach((line, idx) => {
        line.classList.toggle('done', idx < stageIdx);
    });
}

function renderMyTicketStatus(data, ticketCode) {
    const cleanCode = ticketCode.trim().toUpperCase();
    document.getElementById('myQueueNumberBadge').innerHTML = `${cleanCode} &times;`;

    const ringEl = document.getElementById('myStatusRing');
    const headlineEl = document.getElementById('myStatusHeadline');
    const descEl = document.getElementById('myStatusDesc');
    const estEl = document.getElementById('myEstTime');

    ringEl.classList.remove('working', 'waiting', 'done');

    const inBay = data.bays.find(b => b.ticket.toUpperCase() === cleanCode);
    if (inBay) {
        if (inBay.status === 'called') {
            headlineEl.textContent = `Sedang Dipanggil ke Bay ${inBay.bay}`;
            descEl.textContent = `Mohon arahkan ${inBay.car} (${inBay.bookingId}) ke Bay ${inBay.bay}.`;
            estEl.textContent = inBay.est;
            updateStepperUI(1);
        } else if (inBay.status === 'working') {
            ringEl.classList.add('working');
            headlineEl.textContent = `Sedang Dikerjakan di Bay ${inBay.bay}`;
            descEl.textContent = `${inBay.car} • ${inBay.service} sedang ditangani teknisi.`;
            estEl.textContent = inBay.est;
            updateStepperUI(2);
        }
        return;
    }

    const inWaitIdx = data.waitingList.findIndex(w => w.ticket.toUpperCase() === cleanCode);
    if (inWaitIdx !== -1) {
        const waitItem = data.waitingList[inWaitIdx];
        ringEl.classList.add('waiting');
        headlineEl.textContent = `Menunggu Giliran (Urutan #${inWaitIdx + 1})`;
        descEl.textContent = `${waitItem.car} — ${waitItem.service}.`;
        estEl.textContent = waitItem.est;
        updateStepperUI(0);
        return;
    }

    ringEl.classList.add('done');
    headlineEl.textContent = 'Servis Selesai & Siap Diambil';
    descEl.textContent = 'Kendaraan Anda telah selesai diservis dan lolos pemeriksaan akhir.';
    estEl.textContent = 'Selesai';
    updateStepperUI(3);
}

function toggleNotifPanel() {
    const bellWrap = document.getElementById('notifBellWrapper');
    if (bellWrap) {
        bellWrap.classList.toggle('open');
        if (bellWrap.classList.contains('open')) markAllNotifRead();
    }
}

function markAllNotifRead() {
    notificationHistory.forEach(item => { item.unread = false; });
    renderNotifHistory();
}

function playNotificationChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [880, 1174.66].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.14);
            gain.gain.setValueAtTime(0.08, now + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.14);
            osc.stop(now + i * 0.14 + 0.36);
        });
    } catch (err) {}
}

function triggerQueueNotification(type, title, message, withSound = true) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const iconMap = { called: '🚗', working: '🔧', done: '✅' };

    notificationHistory.unshift({ type, icon: iconMap[type] || '🔔', title, message, time: timeStr, unread: true });
    renderNotifHistory();

    if (withSound) playNotificationChime();

    const container = document.getElementById('liveToastContainer');
    if (container) {
        const toast = document.createElement('div');
        toast.className = `live-toast-card ${type}`;
        toast.innerHTML = `
            <div class="lt-badge-icon">${iconMap[type] || '🔔'}</div>
            <div class="lt-body">
                <div class="lt-top-row">
                    <span class="lt-app-tag">DrivePro Live Update</span>
                    <button type="button" class="lt-close-btn" onclick="this.closest('.live-toast-card').remove()">&times;</button>
                </div>
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        container.prepend(toast);
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 6000);
    }
}

function renderNotifHistory() {
    const listEl = document.getElementById('notifHistoryList');
    const badgeEl = document.getElementById('notifBadgeCount');
    if (!listEl || !badgeEl) return;

    const unreadCount = notificationHistory.filter(n => n.unread).length;
    badgeEl.textContent = unreadCount;
    badgeEl.classList.toggle('hidden', unreadCount === 0);

    if (notificationHistory.length === 0) {
        listEl.innerHTML = `<div style="padding:20px; text-align:center; font-size:12.5px; color:#64748b;">Belum ada notifikasi layanan.</div>`;
        return;
    }

    listEl.innerHTML = notificationHistory.map(n => `
        <div class="ndp-item ${n.unread ? 'unread' : ''}">
            <div class="ndp-icon ${n.type}">${n.icon}</div>
            <div class="ndp-content">
                <strong>${n.title}</strong>
                <p>${n.message}</p>
                <small>${n.time}</small>
            </div>
        </div>
    `).join('');
}

function simulateNextProgress() {
    const activeObj = verifiedTickets[activeTicketIndex];
    if (!activeObj) return;

    const data = BRANCH_QUEUE_DATA[currentBranchKey];
    const myBay = data.bays.find(b => b.ticket.toUpperCase() === activeObj.ticket.toUpperCase());

    if (myBay && myBay.status === 'called') {
        myBay.status = 'working';
        myBay.statusText = 'Dikerjakan';
        myBay.est = '± 15 Menit';
        triggerQueueNotification('working', `Pengerjaan Dimulai • Bay ${myBay.bay}`, `${activeObj.car} (${activeObj.ticket}) sedang ditangani teknisi.`, true);
    } else if (myBay && myBay.status === 'working') {
        const finishedBayNum = myBay.bay;
        myBay.status = 'empty';
        myBay.statusText = 'Kosong';
        myBay.bookingId = '-';
        myBay.ticket = '-';
        myBay.car = '-';
        myBay.service = 'Bay Siap Menerima Kendaraan';
        myBay.est = '-';
        triggerQueueNotification('done', `Servis Selesai! (${activeObj.ticket})`, `${activeObj.car} di Bay ${finishedBayNum} telah rampung dan siap diambil.`, true);
    } else {
        const targetBay = data.bays.find(b => b.status === 'empty') || data.bays[0];
        targetBay.status = 'called';
        targetBay.statusText = 'Dipanggil';
        targetBay.bookingId = activeObj.bookingId;
        targetBay.ticket = activeObj.ticket;
        targetBay.car = activeObj.car;
        targetBay.service = 'Ganti Oli & Cek Rem';
        targetBay.est = '± 10 Menit';
        triggerQueueNotification('called', `Giliran Anda Tiba! (${activeObj.ticket})`, `Silakan arahkan ${activeObj.car} ke Bay ${targetBay.bay}.`, true);
    }

    renderQueuePage();
    updateTimestamp();
}

function inspectSingleBay(bayNumber) {
    const data = BRANCH_QUEUE_DATA[currentBranchKey];
    const b = data.bays.find(item => item.bay === bayNumber);
    if (!b) return;

    const isMine = verifiedTickets.some(t => t.ticket.toUpperCase() === b.ticket.toUpperCase());
    const carInfo = b.status === 'empty' ? '-' : (isMine ? `${b.car} (${b.bookingId})` : 'Kendaraan Pelanggan (Privasi Terjaga)');

    document.getElementById('modalDetailTitle').textContent = `${data.title} — Detail Bay ${b.bay}`;
    document.getElementById('modalBayDetailList').innerHTML = `
        <div class="detail-bay-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <strong style="font-size:15px; color:#0b2c6b;">Bay ${b.bay} ${b.ticket !== '-' ? '• ' + b.ticket : ''}</strong>
                <span class="status-chip ${b.status}"><span class="dot"></span>${b.statusText}</span>
            </div>
            <div><strong>Kendaraan:</strong> ${carInfo}</div>
            <div><strong>Layanan:</strong> ${b.service}</div>
            <div><strong>Estimasi Selesai:</strong> ${b.est}</div>
            ${b.status === 'empty' ? `<a href="service.html" class="btn-book-empty-bay">Booking Servis Sekarang</a>` : ''}
        </div>
    `;
    document.getElementById('bayDetailModal').style.display = 'flex';
}

function openBayDetailModal() {
    const data = BRANCH_QUEUE_DATA[currentBranchKey];
    document.getElementById('modalDetailTitle').textContent = `Detail Pengerjaan - ${data.title} (${data.totalBays} Bay)`;

    const bayRows = data.bays.map(b => {
        const isMine = verifiedTickets.some(t => t.ticket.toUpperCase() === b.ticket.toUpperCase());
        const label = b.ticket !== '-' ? `${b.ticket}${isMine ? ' (' + b.car + ')' : ''}` : 'Kosong';
        return `
            <div class="detail-bay-row">
                <div>
                    <strong style="color:#0b2c6b;">Bay ${b.bay} • ${label}</strong>
                    <div style="color:#64748b; margin-top:2px;">${b.service}</div>
                </div>
                <div style="text-align:right;">
                    <span class="status-chip ${b.status}"><span class="dot"></span>${b.statusText}</span>
                    <div style="font-weight:700; color:#0b2c6b; margin-top:4px;">${b.est}</div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('modalBayDetailList').innerHTML = bayRows;
    document.getElementById('bayDetailModal').style.display = 'flex';
}

function closeBayDetailModal() {
    document.getElementById('bayDetailModal').style.display = 'none';
}

function updateTimestamp() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dd = String(now.getDate()).padStart(2, '0');
    const mmm = months[now.getMonth()];
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('lastUpdatedTime');
    if (timeEl) timeEl.textContent = `${dd} ${mmm} ${yyyy}, ${hh}:${min} WIB`;
}

function refreshQueueNow() {
    mergeBookingsFromServicePage();
    renderQueuePage();
    updateTimestamp();
}