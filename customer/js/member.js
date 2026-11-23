// customer/js/member.js

let currentMember = {
    name: 'Budi Santoso',
    email: 'budi@email.com',
    phone: '081234567890',
    city: 'Bandung',
    points: 1250
};

let memberVehicles = [
    { model: 'Toyota Avanza', plate: 'D 1428 ABC', fuel: 'Petrol', yearColor: '2022 • Silver' },
    { model: 'Hyundai Ioniq 5', plate: 'D 88 EV', fuel: 'Electric', yearColor: '2024 • Putih' }
];

let memberTransactions = [
    {
        trxId: 'TRX-20261118-084',
        bookingId: 'BK-20261118-011',
        date: '18 Nov 2026',
        time: '14:35 WIB',
        branch: 'DrivePro Bandung',
        car: 'Toyota Avanza (D 1428 ABC)',
        services: [
            { name: 'Ganti Oli Sintetik Full 4L', price: 420000 },
            { name: 'Filter Oli Original Toyota', price: 85000 },
            { name: 'Pengecekan Rem & Kaki-Kaki', price: 150000 }
        ],
        subtotal: 655000,
        promoName: 'Voucher Potongan Ganti Oli (DP-OLI50K)',
        discountAmount: 50000,
        finalTotal: 605000,
        paymentMethod: 'QRIS BCA',
        pointsEarned: 120,
        status: 'Completed'
    },
    {
        trxId: 'TRX-20261029-042',
        bookingId: 'BK-20261029-006',
        date: '29 Okt 2026',
        time: '11:10 WIB',
        branch: 'DrivePro Bandung',
        car: 'Hyundai Ioniq 5 (D 88 EV)',
        services: [
            { name: 'EV Battery Health Diagnostic', price: 450000 },
            { name: 'Spooring & Balancing 4 Roda', price: 350000 },
            { name: 'Penggantian Filter Kabin HEPA', price: 200000 }
        ],
        subtotal: 1000000,
        promoName: 'Promo Member Gold 10% (GOLD10)',
        discountAmount: 100000,
        finalTotal: 900000,
        paymentMethod: 'Kartu Debit Mandiri',
        pointsEarned: 180,
        status: 'Completed'
    },
    {
        trxId: 'TRX-20260914-019',
        bookingId: 'BK-20260914-003',
        date: '14 Sep 2026',
        time: '09:25 WIB',
        branch: 'DrivePro Jakarta',
        car: 'Toyota Avanza (D 1428 ABC)',
        services: [
            { name: 'Tune Up Mesin Berkala', price: 380000 },
            { name: 'Kuras Minyak Rem DOT 4', price: 140000 }
        ],
        subtotal: 520000,
        promoName: 'Tidak menggunakan promo / voucher',
        discountAmount: 0,
        finalTotal: 520000,
        paymentMethod: 'Tunai / Cash',
        pointsEarned: 100,
        status: 'Completed'
    }
];

let memberActiveVouchers = [
    {
        code: 'DP-MEMBER20',
        title: 'Special Member Discount 20% OFF',
        desc: 'Berlaku untuk seluruh paket servis berkala (Bensin, Hybrid & Listrik).',
        validUntil: '31 Dec 2026'
    },
    {
        code: 'DP-WASHFREE',
        title: 'Gratis Cuci Mobil Premium & Vakum',
        desc: 'Hasil penukaran 150 Loyalty Points pada 20 Nov 2026.',
        validUntil: '20 Dec 2026'
    }
];

const REDEEM_CATALOG = [
    { id: 'RDM-OLI', code: 'DP-OLI50K', title: 'Voucher Potongan Ganti Oli Rp 50.000', cost: 250, benefit: 'Potongan langsung Rp 50.000 untuk paket ganti oli mesin.' },
    { id: 'RDM-WASH', code: 'DP-WASHFREE', title: 'Gratis Cuci Mobil Premium & Vakum', cost: 150, benefit: 'Cuci salju + vakum interior gratis senilai Rp 85.000.' },
    { id: 'RDM-SPOOR', code: 'DP-SPOOR75K', title: 'Voucher Spooring & Balancing Rp 75.000', cost: 350, benefit: 'Diskon Rp 75.000 untuk layanan spooring & balancing 4 roda.' }
];

let memberPointLedger = [
    {
        logId: 'PTS-20261120-05',
        type: 'redeem',
        title: 'Penukaran Poin ke Voucher Cuci Premium',
        date: '20 Nov 2026',
        time: '16:18 WIB',
        pointChange: -150,
        balanceBefore: 1400,
        balanceAfter: 1250,
        voucherCode: 'DP-WASHFREE',
        voucherBenefit: 'Gratis Cuci Mobil Premium & Vakum Interior (Senilai Rp 85.000)',
        validUntil: '20 Dec 2026',
        usageStatus: 'Aktif (Belum Dipakai)'
    },
    {
        logId: 'PTS-20261118-04',
        type: 'earn',
        title: 'Bonus Poin Transaksi Servis Toyota Avanza',
        date: '18 Nov 2026',
        time: '14:35 WIB',
        pointChange: 120,
        balanceBefore: 1280,
        balanceAfter: 1400,
        sourceRef: 'No. Transaksi TRX-20261118-084 (Total Bayar Rp 605.000)',
        note: 'Poin otomatis masuk setelah pembayaran servis terverifikasi Lunas.'
    },
    {
        logId: 'PTS-20261115-03',
        type: 'redeem',
        title: 'Penukaran Poin ke Voucher Potongan Ganti Oli',
        date: '15 Nov 2026',
        time: '09:42 WIB',
        pointChange: -250,
        balanceBefore: 1530,
        balanceAfter: 1280,
        voucherCode: 'DP-OLI50K',
        voucherBenefit: 'Potongan Langsung Rp 50.000 untuk Paket Ganti Oli',
        validUntil: '15 Dec 2026',
        usageStatus: 'Sudah Digunakan pada TRX-20261118-084 (18 Nov 2026)'
    },
    {
        logId: 'PTS-20261029-02',
        type: 'earn',
        title: 'Bonus Poin Transaksi Servis Hyundai Ioniq 5',
        date: '29 Okt 2026',
        time: '11:10 WIB',
        pointChange: 180,
        balanceBefore: 1350,
        balanceAfter: 1530,
        sourceRef: 'No. Transaksi TRX-20261029-042 (Total Bayar Rp 900.000)',
        note: 'Poin otomatis masuk setelah pembayaran servis terverifikasi Lunas.'
    }
];

function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function getVehicleAsset(modelName) {
    const lower = (modelName || '').toLowerCase();
    if (lower.includes('ioniq') || lower.includes('ev') || lower.includes('listrik')) {
        return 'assets/ioniq.png';
    }
    return 'assets/avanza.png';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idVal = document.getElementById('loginIdentifier').value.trim();
            if (idVal && idVal !== 'budi@email.com' && idVal !== '081234567890') {
                currentMember.email = idVal.includes('@') ? idVal : currentMember.email;
                currentMember.phone = !idVal.includes('@') ? idVal : currentMember.phone;
            }
            enterMemberDashboard();
        });
    }

    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentMember.name = document.getElementById('regName').value.trim();
            currentMember.phone = document.getElementById('regPhone').value.trim();
            currentMember.email = document.getElementById('regEmail').value.trim();
            currentMember.city = document.getElementById('regCity').value.trim();

            regForm.style.display = 'none';
            document.getElementById('otpSentMessage').textContent = `Kode OTP 6 digit telah dikirim ke ${currentMember.email}`;
            document.getElementById('otpVerificationBox').style.display = 'block';
        });
    }

    const addVehForm = document.getElementById('addVehicleForm');
    if (addVehForm) {
        addVehForm.addEventListener('submit', (e) => {
            e.preventDefault();
            memberVehicles.push({
                model: document.getElementById('newCarModel').value.trim(),
                plate: document.getElementById('newCarPlate').value.trim().toUpperCase(),
                fuel: document.getElementById('newCarFuel').value,
                yearColor: document.getElementById('newCarYearColor').value.trim() || '2024'
            });
            addVehForm.reset();
            closeModal('addVehicleModal');
            renderAllMemberUI();
        });
    }

    const editProfForm = document.getElementById('editProfileForm');
    if (editProfForm) {
        editProfForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentMember.name = document.getElementById('editNameInput').value.trim();
            currentMember.phone = document.getElementById('editPhoneInput').value.trim();
            currentMember.city = document.getElementById('editCityInput').value.trim();
            closeModal('editProfileModal');
            renderAllMemberUI();
        });
    }

    if (sessionStorage.getItem('drivepro_member_logged_in') === '1') {
        enterMemberDashboard();
    }
});

function switchAuthTab(mode) {
    document.getElementById('tabLoginBtn').classList.toggle('active', mode === 'login');
    document.getElementById('tabRegisterBtn').classList.toggle('active', mode === 'register');
    document.getElementById('loginForm').style.display = mode === 'login' ? 'flex' : 'none';
    document.getElementById('registerForm').style.display = mode === 'register' ? 'flex' : 'none';
    document.getElementById('otpVerificationBox').style.display = 'none';
}

function verifyOtpAndComplete() {
    enterMemberDashboard();
}

function enterMemberDashboard() {
    sessionStorage.setItem('drivepro_member_logged_in', '1');
    document.getElementById('memberSplitWrapper').style.display = 'none';
    document.getElementById('memberDashboardSection').style.display = 'block';
    renderAllMemberUI();
}

function logoutMember() {
    sessionStorage.removeItem('drivepro_member_logged_in');
    document.getElementById('memberDashboardSection').style.display = 'none';
    document.getElementById('memberSplitWrapper').style.display = 'grid';
}

function switchMemberSubTab(tabKey) {
    document.querySelectorAll('.subpill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtab === tabKey);
    });
    document.querySelectorAll('.subtab-panel').forEach(panel => {
        panel.style.display = panel.id === `subtab-${tabKey}` ? 'block' : 'none';
    });
}

function renderAllMemberUI() {
    document.getElementById('mbNameDisplay').textContent = currentMember.name;
    document.getElementById('mbEmailDisplay').textContent = currentMember.email;
    document.getElementById('mbPhoneDisplay').textContent = currentMember.phone;
    document.getElementById('mbCityDisplay').textContent = currentMember.city;
    document.getElementById('mbPointsDisplay').textContent = currentMember.points.toLocaleString('id-ID');
    document.getElementById('redeemTabPointsDisplay').textContent = currentMember.points.toLocaleString('id-ID');

    const totalSpent = memberTransactions.reduce((acc, t) => acc + t.finalTotal, 0);
    document.getElementById('ovTotalServices').textContent = memberTransactions.length;
    document.getElementById('ovLastService').textContent = memberTransactions[0]?.date || '-';
    document.getElementById('histTotalCount').textContent = memberTransactions.length;
    document.getElementById('histTotalSpent').textContent = formatRupiah(totalSpent);
    document.getElementById('vehCountDisplay').textContent = memberVehicles.length;

    renderVehicles();
    renderTransactions();
    renderVouchersAndRedeem();
    renderPointLedger();
}

function bookMemberVehicle(idx) {
    const selectedVehicle = memberVehicles[idx];
    if (!selectedVehicle) return;

    const prefillPayload = {
        phone: currentMember.phone,
        email: currentMember.email,
        name: currentMember.name,
        city: currentMember.city,
        points: currentMember.points,
        vehicle: selectedVehicle
    };
    sessionStorage.setItem('drivepro_quick_book_member', JSON.stringify(prefillPayload));
    window.location.href = 'service.html';
}

function renderVehicles() {
    const html = memberVehicles.map((v, idx) => `
        <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div style="display:flex; align-items:center; gap:14px;">
                <img src="${getVehicleAsset(v.model)}" alt="${v.model}" style="width:76px; height:48px; object-fit:contain; border-radius:8px; background:#ffffff; padding:4px; border:1px solid #e2e8f0; flex-shrink:0;">
                <div>
                    <strong style="display:block; font-size:14px; color:#0b2c6b;">${v.model}</strong>
                    <small style="color:#64748b;">${v.plate} • ${v.fuel} • ${v.yearColor}</small>
                </div>
            </div>
            <button type="button" onclick="bookMemberVehicle(${idx})" style="background:none; border:none; font-size:12.5px; font-weight:700; color:#1852b8; cursor:pointer; flex-shrink:0;">
                Book
            </button>
        </div>
    `).join('');

    const ovPrev = document.getElementById('ovVehiclesPreview');
    const fullGrid = document.getElementById('fullVehiclesGrid');
    if (ovPrev) ovPrev.innerHTML = html;
    if (fullGrid) fullGrid.innerHTML = html;
}

function renderTransactions() {
    const buildCard = (trx, idx) => `
        <div onclick="openTransactionDetail(${idx})" style="background:#f8fafd; border:1.5px solid #e2e8f0; border-radius:12px; padding:13px 15px; cursor:pointer; transition:border-color 0.2s;" onmouseover="this.style.borderColor='#93c5fd'" onmouseout="this.style.borderColor='#e2e8f0'">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11.5px; font-weight:800; color:#1852b8;">${trx.trxId} • Booking: ${trx.bookingId}</span>
                <span style="font-size:11.5px; color:#64748b;">${trx.date} (${trx.time})</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div>
                    <strong style="display:block; font-size:14px; color:#0b2c6b;">${trx.car}</strong>
                    <small style="color:#475569;">${trx.services.length} Layanan • ${trx.discountAmount > 0 ? `<span style="color:#16a34a; font-weight:700;">Potongan ${formatRupiah(trx.discountAmount)}</span>` : 'Tanpa Promo'}</small>
                </div>
                <div style="text-align:right;">
                    <strong style="display:block; font-size:14px; color:#0b2c6b;">${formatRupiah(trx.finalTotal)}</strong>
                    <span style="font-size:11px; font-weight:700; color:#1852b8;">Lihat Struk</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('ovRecentTxList').innerHTML = memberTransactions.slice(0, 2).map(buildCard).join('');
    document.getElementById('fullTransactionsTable').innerHTML = memberTransactions.map(buildCard).join('');
}

function openTransactionDetail(idx) {
    const trx = memberTransactions[idx];
    if (!trx) return;

    const itemsHtml = trx.services.map(s => `
        <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:13px;">
            <span>• ${s.name}</span>
            <strong>${formatRupiah(s.price)}</strong>
        </div>
    `).join('');

    document.getElementById('memberModalTitle').textContent = `Rincian Transaksi • ${trx.trxId}`;
    document.getElementById('memberModalBody').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; color:#334155;">
            <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between;"><span>No. Transaksi:</span><strong>${trx.trxId}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>No. Booking:</span><strong>${trx.bookingId}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Tanggal &amp; Jam:</span><strong>${trx.date}, ${trx.time}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Cabang:</span><strong>${trx.branch}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Kendaraan:</span><strong>${trx.car}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Metode Bayar:</span><strong>${trx.paymentMethod}</strong></div>
            </div>

            <div style="border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
                <strong style="display:block; color:#0b2c6b; margin-bottom:8px;">Rincian Layanan &amp; Biaya:</strong>
                ${itemsHtml}
                <div style="border-top:1px dashed #cbd5e1; margin-top:8px; padding-top:8px; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>Subtotal</span>
                        <strong>${formatRupiah(trx.subtotal)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; color:${trx.discountAmount > 0 ? '#16a34a' : '#64748b'};">
                        <span>Promo (${trx.promoName})</span>
                        <strong>${trx.discountAmount > 0 ? '- ' + formatRupiah(trx.discountAmount) : 'Rp 0'}</strong>
                    </div>
                    <div style="border-top:1.5px solid #e2e8f0; padding-top:8px; display:flex; justify-content:space-between; font-size:15px; color:#0b2c6b;">
                        <strong>Total Dibayar (${trx.status})</strong>
                        <strong>${formatRupiah(trx.finalTotal)}</strong>
                    </div>
                </div>
            </div>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 14px; display:flex; justify-content:space-between;">
                <span>Poin Member Didapat</span>
                <strong style="color:#16a34a;">+${trx.pointsEarned} Poin</strong>
            </div>
        </div>
    `;
    document.getElementById('memberDetailModal').style.display = 'flex';
}

function renderVouchersAndRedeem() {
    document.getElementById('allVouchersGrid').innerHTML = memberActiveVouchers.map(v => `
        <div style="background:#f8fafd; border:1.5px solid #dbeafe; border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="background:#dbeafe; color:#1852b8; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px;">${v.code}</span>
                <small style="color:#64748b;">Valid until ${v.validUntil}</small>
            </div>
            <strong style="display:block; font-size:14px; color:#0b2c6b; margin:4px 0;">${v.title}</strong>
            <p style="font-size:12.5px; color:#475569; margin:0;">${v.desc}</p>
        </div>
    `).join('');

    document.getElementById('redeemCatalogGrid').innerHTML = REDEEM_CATALOG.map((item, idx) => `
        <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:12px; padding:13px 15px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div>
                <strong style="display:block; font-size:13.5px; color:#0b2c6b;">${item.title}</strong>
                <small style="color:#64748b;">${item.benefit}</small>
            </div>
            <button type="button" onclick="redeemPointsToVoucher(${idx})" style="background:#1852b8; color:#ffffff; border:none; border-radius:9px; padding:8px 12px; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap;">
                Tukar ${item.cost} pts
            </button>
        </div>
    `).join('');
}

function redeemPointsToVoucher(catalogIdx) {
    const item = REDEEM_CATALOG[catalogIdx];
    if (!item) return;

    if (currentMember.points < item.cost) {
        alert('Saldo Loyalty Points Anda belum mencukupi untuk menukar voucher ini.');
        return;
    }

    const before = currentMember.points;
    currentMember.points -= item.cost;

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    memberActiveVouchers.unshift({
        code: item.code,
        title: item.title,
        desc: `Hasil penukaran ${item.cost} Loyalty Points pada ${dateStr} (${timeStr}).`,
        validUntil: '31 Des 2026'
    });

    memberPointLedger.unshift({
        logId: `PTS-${Date.now().toString().slice(-6)}`,
        type: 'redeem',
        title: `Penukaran Poin ke ${item.title}`,
        date: dateStr,
        time: timeStr,
        pointChange: -item.cost,
        balanceBefore: before,
        balanceAfter: currentMember.points,
        voucherCode: item.code,
        voucherBenefit: item.benefit,
        validUntil: '31 Des 2026',
        usageStatus: 'Aktif (Belum Dipakai)'
    });

    renderAllMemberUI();
    alert(`Berhasil menukar ${item.cost} poin menjadi voucher ${item.code}!`);
}

function renderPointLedger() {
    const container = document.getElementById('memberPointLedgerList');
    if (!container) return;

    container.innerHTML = memberPointLedger.map((log, idx) => {
        const isEarn = log.type === 'earn';
        return `
            <div onclick="openPointLogDetail(${idx})" style="background:#f8fafd; border:1.5px solid #e2e8f0; border-radius:12px; padding:12px 14px; cursor:pointer; transition:border-color 0.2s;" onmouseover="this.style.borderColor='#93c5fd'" onmouseout="this.style.borderColor='#e2e8f0'">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="background:${isEarn ? '#dcfce7' : '#fef3c7'}; color:${isEarn ? '#15803d' : '#b45309'}; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:99px;">
                        ${isEarn ? 'Poin Bertambah' : 'Redeem Voucher'}
                    </span>
                    <span style="font-size:11.5px; color:#64748b;">${log.date} • ${log.time}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <div>
                        <strong style="display:block; font-size:13.5px; color:#0b2c6b;">${log.title}</strong>
                        <small style="color:#475569;">Saldo: ${log.balanceBefore} <strong>${log.balanceAfter} pts</strong></small>
                    </div>
                    <div style="text-align:right;">
                        <strong style="display:block; font-size:14px; color:${isEarn ? '#16a34a' : '#dc2626'};">
                            ${isEarn ? '+' + log.pointChange : log.pointChange} pts
                        </strong>
                        <span style="font-size:11px; font-weight:700; color:#1852b8;">Detail</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openPointLogDetail(idx) {
    const log = memberPointLedger[idx];
    if (!log) return;

    const isEarn = log.type === 'earn';
    document.getElementById('memberModalTitle').textContent = isEarn
        ? `Detail Penambahan Poin • ${log.logId}`
        : `Detail Redeem Voucher • ${log.logId}`;

    document.getElementById('memberModalBody').innerHTML = `
        <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:8px; font-size:13px; color:#334155;">
            <div style="display:flex; justify-content:space-between;"><span>Aktivitas:</span><strong>${log.title}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Tanggal &amp; Jam:</span><strong>${log.date}, ${log.time}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Saldo Sebelumnya:</span><strong>${log.balanceBefore} pts</strong></div>
            <div style="display:flex; justify-content:space-between;">
                <span>${isEarn ? 'Poin Bertambah:' : 'Poin Terpotong:'}</span>
                <strong style="color:${isEarn ? '#16a34a' : '#dc2626'};">${isEarn ? '+' + log.pointChange : log.pointChange} pts</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:8px;">
                <span>Saldo Akhir:</span>
                <strong style="color:#0b2c6b;">${log.balanceAfter} pts</strong>
            </div>
            ${isEarn ? `
                <div style="margin-top:4px; padding-top:8px; border-top:1px solid #e2e8f0;">
                    <div><strong>Sumber:</strong> ${log.sourceRef}</div>
                    <p style="margin:6px 0 0; color:#166534; background:#f0fdf4; padding:8px 10px; border-radius:8px; font-size:12px;">${log.note}</p>
                </div>
            ` : `
                <div style="margin-top:4px; padding-top:8px; border-top:1px solid #e2e8f0; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between;"><span>Kode Voucher:</span><strong style="color:#1852b8;">${log.voucherCode}</strong></div>
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Manfaat:</span><strong style="text-align:right;">${log.voucherBenefit}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Berlaku Hingga:</span><strong>${log.validUntil}</strong></div>
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Status:</span><strong style="text-align:right; color:#0b2c6b;">${log.usageStatus}</strong></div>
                </div>
            `}
        </div>
    `;
    document.getElementById('memberDetailModal').style.display = 'flex';
}

function openAddVehicleModal() {
    document.getElementById('addVehicleModal').style.display = 'flex';
}

function openEditProfileModal() {
    document.getElementById('editNameInput').value = currentMember.name;
    document.getElementById('editPhoneInput').value = currentMember.phone;
    document.getElementById('editCityInput').value = currentMember.city;
    document.getElementById('editProfileModal').style.display = 'flex';
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'none';
}