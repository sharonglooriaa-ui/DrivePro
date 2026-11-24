// staff/js/antrean.js
let currentStaff = null;
let bayViewMode = 'mine'; // 'mine' atau 'all'
let selectedBayNumber = 1;

const TOTAL_BAYS_MAP = {
    bandung: 6,
    jakarta: 8,
    surabaya: 5
};

document.addEventListener('DOMContentLoaded', () => {
    currentStaff = getLoggedStaff();
    document.getElementById('navBranchLabel').textContent = currentStaff.branchName.toUpperCase();
    ensureInitialWorkshopQueues();

    selectedBayNumber = (currentStaff.assignedBays && currentStaff.assignedBays[0]) || 1;
    renderStaffQueueWorkspace();
});

function switchBayViewMode(mode) {
    bayViewMode = mode;
    document.getElementById('btnModeMyBays').classList.toggle('active', mode === 'mine');
    document.getElementById('btnModeAllBays').classList.toggle('active', mode === 'all');
    document.getElementById('bayStripHeading').textContent = mode === 'mine'
        ? 'Daftar Bay Tugas Anda (Klik Bay untuk Mengelola):'
        : `Monitor Seluruh Bay — ${currentStaff.branchName} (Klik Bay Manapun untuk Cek / Edit):`;

    if (mode === 'mine' && currentStaff.assignedBays && !currentStaff.assignedBays.includes(selectedBayNumber)) {
        selectedBayNumber = currentStaff.assignedBays[0];
    }
    renderStaffQueueWorkspace();
}

function selectWorkshopBay(bayNum) {
    selectedBayNumber = bayNum;
    renderStaffQueueWorkspace();
}

function getBranchQueues() {
    const all = ensureInitialWorkshopQueues();
    return all.filter(q => (q.branch || 'bandung').toLowerCase() === currentStaff.branchKey);
}

function renderStaffQueueWorkspace() {
    const totalBays = TOTAL_BAYS_MAP[currentStaff.branchKey] || 6;
    const branchQueues = getBranchQueues();
    const myBays = currentStaff.assignedBays || [1, 2];

    const bayNumbersToRender = bayViewMode === 'mine'
        ? myBays
        : Array.from({ length: totalBays }, (_, i) => i + 1);

    // 1. Render Strip Kartu Bay
    const stripEl = document.getElementById('staffBayStripContainer');
    stripEl.innerHTML = bayNumbersToRender.map(bayNum => {
        const job = branchQueues.find(q => Number(q.bay) === bayNum && q.status !== 'done');
        const isSelected = bayNum === selectedBayNumber;
        const isMine = myBays.includes(bayNum);

        let badgeClass = 'waiting';
        let badgeText = 'Kosong';
        if (job) {
            badgeClass = job.status;
            badgeText = job.status === 'called' ? 'Dipanggil' : (job.status === 'working' ? 'Dikerjakan' : 'Menunggu');
        }

        return `
            <div class="bay-mini-card ${isSelected ? 'selected-bay' : ''} ${isMine ? 'my-assigned' : ''}" onclick="selectWorkshopBay(${bayNum})">
                <div style="font-size:14px; font-weight:800; color:var(--blue-dark); margin-bottom:4px;">Bay ${bayNum}</div>
                <span class="status-pill ${badgeClass}" style="margin-bottom:6px;">${badgeText}</span>
                <div style="font-size:12.5px; font-weight:700; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${job ? `${job.ticket} • ${job.car}` : 'Siap Menerima Unit'}
                </div>
                <small style="color:var(--text-muted);">${job ? job.est : '-'}</small>
            </div>
        `;
    }).join('');

    // 2. Render Panel Kerja Detail untuk Bay Terpilih
    const workspaceEl = document.getElementById('bayWorkspaceContainer');
    const activeJob = branchQueues.find(q => Number(q.bay) === selectedBayNumber && q.status !== 'done');

    if (!activeJob) {
        workspaceEl.innerHTML = `
            <div class="card-box" style="text-align:center; padding:44px 24px; margin-bottom:48px;">
                <h3 style="font-size:18px; font-weight:800; color:var(--blue-dark); margin-bottom:6px;">Bay ${selectedBayNumber} Saat Ini Kosong</h3>
                <p style="font-size:13.5px; color:var(--text-muted); margin-bottom:18px;">Belum ada kendaraan yang dialokasikan ke Bay ${selectedBayNumber}.</p>
                <a href="service.html" class="btn-primary">+ Input Pelanggan Walk-In ke Bay ${selectedBayNumber}</a>
            </div>
        `;
        return;
    }

    // Pastikan struktur servicesList & sparepartsList selalu tersedia
    if (!Array.isArray(activeJob.servicesList)) {
        activeJob.servicesList = [{ id: 'custom-1', name: activeJob.service || 'Servis Berkala', price: 350000, duration: 30 }];
    }
    if (!Array.isArray(activeJob.sparepartsList)) {
        activeJob.sparepartsList = [];
    }

    const engineKey = activeJob.engineType || (activeJob.car.toLowerCase().includes('ioniq') || activeJob.car.toLowerCase().includes('ev') ? 'Listrik' : 'Bensin');
    const availableServices = STAFF_SERVICE_CATALOG[engineKey] || STAFF_SERVICE_CATALOG.Bensin;

    const srvSubtotal = activeJob.servicesList.reduce((acc, s) => acc + Number(s.price || 0), 0);
    const partSubtotal = activeJob.sparepartsList.reduce((acc, p) => acc + ((Number(p.partPrice) + Number(p.installFee)) * Number(p.qty)), 0);
    const grandTotal = srvSubtotal + partSubtotal;

    const isEv = engineKey === 'Listrik' || activeJob.car.toLowerCase().includes('ioniq');
    const carImg = isEv ? 'assets/ioniq.png' : 'assets/avanza.png';

    workspaceEl.innerHTML = `
        <div class="workspace-grid">
            <!-- KOLOM KIRI: STATUS, KONTROL WAKTU & REVISI ITEM SERVIS -->
            <div style="display:flex; flex-direction:column; gap:20px;">
                <!-- Kartu Identitas Kendaraan & Kontrol Progres/Waktu -->
                <div class="card-box">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <img src="${carImg}" alt="${activeJob.car}" style="width:82px; height:52px; object-fit:contain; background:#f8fafd; border:1px solid #e2e8f0; border-radius:10px; padding:4px;">
                            <div>
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
                                    <span style="background:var(--blue-primary); color:#fff; font-size:12px; font-weight:800; padding:2px 9px; border-radius:7px;">Bay ${selectedBayNumber} • ${activeJob.ticket}</span>
                                    <span style="font-size:12px; font-weight:700; color:var(--text-muted);">${activeJob.bookingId}</span>
                                </div>
                                <h2 style="font-size:18px; font-weight:800; color:var(--blue-dark);">${activeJob.car}</h2>
                                <small style="color:var(--text-muted);">Pelanggan: <strong>${activeJob.name}</strong> (${activeJob.phone}) • Mekanik: <strong>${activeJob.mechanic || 'Andi Wijaya'}</strong></small>
                            </div>
                        </div>
                        <span class="status-pill ${activeJob.status}">
                            ${activeJob.status === 'called' ? 'Sedang Dipanggil' : (activeJob.status === 'working' ? 'Sedang Dikerjakan' : 'Menunggu')}
                        </span>
                    </div>

                    <!-- Kontrol Tahap Status -->
                    <div style="margin-top:16px;">
                        <label style="display:block; font-size:12px; font-weight:800; color:var(--blue-dark); margin-bottom:8px;">1. Ubah Status Pengerjaan Bay:</label>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            <button type="button" class="btn-outline" style="${activeJob.status === 'waiting' ? 'background:var(--blue-soft); border-color:var(--blue-accent);' : ''}" onclick="updateJobStatus('${activeJob.bookingId}', 'waiting')">Menunggu</button>
                            <button type="button" class="btn-outline" style="${activeJob.status === 'called' ? 'background:var(--blue-soft); border-color:var(--blue-accent);' : ''}" onclick="updateJobStatus('${activeJob.bookingId}', 'called')">Panggil ke Bay ${selectedBayNumber}</button>
                            <button type="button" class="btn-outline" style="${activeJob.status === 'working' ? 'background:var(--warning-bg); border-color:#f59e0b; color:#b45309;' : ''}" onclick="updateJobStatus('${activeJob.bookingId}', 'working')">Mulai Dikerjakan</button>
                            <button type="button" class="btn-primary" style="background:#15803d; box-shadow:none;" onclick="completeWorkshopJob('${activeJob.bookingId}')">&#10003; Selesaikan &amp; Kirim ke POS</button>
                        </div>
                    </div>

                    <!-- Kontrol Maju / Mundur Estimasi Waktu (Sinkron ke Customer) -->
                    <div style="margin-top:18px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <label style="font-size:12px; font-weight:800; color:var(--blue-dark);">2. Sesuaikan Estimasi Waktu (Otomatis Update di Layar Customer):</label>
                            <strong style="font-size:14px; color:var(--blue-accent);">Saat ini: ${activeJob.est}</strong>
                        </div>
                        <div class="time-adjust-bar">
                            <button type="button" class="btn-time-step" onclick="adjustJobEstimate('${activeJob.bookingId}', -10)">-10 Mnt (Lebih Cepat)</button>
                            <button type="button" class="btn-time-step" onclick="adjustJobEstimate('${activeJob.bookingId}', -5)">-5 Mnt</button>
                            <button type="button" class="btn-time-step delay" onclick="adjustJobEstimate('${activeJob.bookingId}', 5)">+5 Mnt</button>
                            <button type="button" class="btn-time-step delay" onclick="adjustJobEstimate('${activeJob.bookingId}', 10)">+10 Mnt (Mundur)</button>
                            <button type="button" class="btn-time-step delay" onclick="adjustJobEstimate('${activeJob.bookingId}', 15)">+15 Mnt</button>
                        </div>
                    </div>
                </div>

                <!-- Kartu Revisi Jenis Servis (A,B,C -> A,C,D) -->
                <div class="card-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <h3 style="font-size:16px; font-weight:800; color:var(--blue-dark);">Revisi Item Pekerjaan Servis</h3>
                            <small style="color:var(--text-muted);">Hapus atau tambah item servis jika hasil pengecekan fisik berbeda dari prediksi awal.</small>
                        </div>
                    </div>

                    <!-- List Layanan Aktif -->
                    <div style="margin-bottom:14px;">
                        ${activeJob.servicesList.map((srv, sIdx) => `
                            <div class="item-line-row">
                                <div>
                                    <strong style="display:block; font-size:13.5px; color:var(--blue-dark);">${srv.name}</strong>
                                    <small style="color:var(--text-muted);">${formatRupiah(srv.price)}</small>
                                </div>
                                <button type="button" onclick="removeServiceFromJob('${activeJob.bookingId}', ${sIdx})" style="background:var(--danger-bg); color:var(--danger-text); border:none; border-radius:8px; padding:6px 10px; font-size:12px; font-weight:700; cursor:pointer;">
                                    Hapus
                                </button>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Tambah Layanan Pengganti -->
                    <div style="display:flex; gap:8px;">
                        <select id="addServiceDropdown">
                            ${availableServices.map(s => `<option value="${s.id}">${s.name} — ${formatRupiah(s.price)}</option>`).join('')}
                        </select>
                        <button type="button" class="btn-outline" style="white-space:nowrap;" onclick="addServiceToJob('${activeJob.bookingId}', '${engineKey}')">+ Tambah Servis</button>
                    </div>
                </div>
            </div>

            <!-- KOLOM KANAN: TAMBAH SPAREPART & JASA PEMASANGAN + RINGKASAN BIAYA -->
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="card-box">
                    <h3 style="font-size:16px; font-weight:800; color:var(--blue-dark); margin-bottom:4px;">Penggantian Sparepart &amp; Jasa Pasang</h3>
                    <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px;">Tambahkan suku cadang yang diganti beserta ongkos pemasangannya.</p>

                    <div style="background:#f8fafd; border:1px solid #dbe3f0; border-radius:12px; padding:12px; margin-bottom:14px;">
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px;">Pilih Sparepart:</label>
                        <select id="sparepartSelectDropdown" style="margin-bottom:10px;">
                            ${SPAREPART_CATALOG.map(p => `
                                <option value="${p.partId}">
                                    ${p.name} (Part: ${formatRupiah(p.partPrice)} + Jasa: ${formatRupiah(p.installFee)})
                                </option>
                            `).join('')}
                        </select>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <div style="width:110px;">
                                <input type="number" id="sparepartQtyInput" value="1" min="1" max="20" placeholder="Qty">
                            </div>
                            <button type="button" class="btn-primary" style="flex:1;" onclick="addSparepartToJob('${activeJob.bookingId}')">+ Tambah Sparepart</button>
                        </div>
                    </div>

                    <!-- Daftar Sparepart Terpasang -->
                    <div>
                        ${activeJob.sparepartsList.length === 0
                            ? `<div style="text-align:center; padding:18px; font-size:12.5px; color:var(--text-muted); border:1px dashed #cbd5e1; border-radius:10px;">Belum ada penggantian sparepart pada pengerjaan ini.</div>`
                            : activeJob.sparepartsList.map((p, pIdx) => {
                                const unitTotal = Number(p.partPrice) + Number(p.installFee);
                                return `
                                    <div class="item-line-row" style="flex-direction:column; align-items:stretch;">
                                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                            <div>
                                                <strong style="font-size:13.5px; color:var(--blue-dark);">${p.name}</strong>
                                                <div style="font-size:11.5px; color:var(--text-muted);">
                                                    Part: ${formatRupiah(p.partPrice)} • Jasa Pasang: ${formatRupiah(p.installFee)}
                                                </div>
                                            </div>
                                            <button type="button" onclick="removeSparepartFromJob('${activeJob.bookingId}', ${pIdx})" style="background:none; border:none; color:var(--danger-text); font-size:12px; font-weight:700; cursor:pointer;">&times; Hapus</button>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:6px; border-top:1px dashed #e2e8f0;">
                                            <div class="qty-stepper">
                                                <button type="button" onclick="changeSparepartQty('${activeJob.bookingId}', ${pIdx}, -1)">-</button>
                                                <span style="font-size:12.5px; font-weight:800;">${p.qty} pcs</span>
                                                <button type="button" onclick="changeSparepartQty('${activeJob.bookingId}', ${pIdx}, 1)">+</button>
                                            </div>
                                            <strong style="font-size:13.5px; color:var(--blue-primary);">${formatRupiah(unitTotal * p.qty)}</strong>
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>

                <!-- Ringkasan Tagihan Sementara (Siap Diteruskan ke POS Kasir) -->
                <div class="card-box" style="background:var(--blue-soft); border-color:#bfdbfe;">
                    <h4 style="font-size:14.5px; font-weight:800; color:var(--blue-dark); margin-bottom:10px;">Ringkasan Biaya Pengerjaan</h4>
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
                        <span>Subtotal Jasa Servis (${activeJob.servicesList.length} item)</span>
                        <strong>${formatRupiah(srvSubtotal)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px dashed #93c5fd;">
                        <span>Subtotal Sparepart &amp; Pemasangan</span>
                        <strong>${formatRupiah(partSubtotal)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:16px; color:var(--blue-primary);">
                        <strong>Total Sementara (Pre-POS)</strong>
                        <strong>${formatRupiah(grandTotal)}</strong>
                    </div>
                    <small style="display:block; color:var(--text-muted); margin-top:8px;">
                        *Potongan promo member &amp; metode pembayaran akan diproses pada modul kasir POS setelah servis selesai.
                    </small>
                </div>
            </div>
        </div>
    `;
}

function mutateActiveJob(bookingId, mutatorFn) {
    const all = ensureInitialWorkshopQueues();
    const idx = all.findIndex(q => q.bookingId === bookingId);
    if (idx === -1) return;

    mutatorFn(all[idx]);
    localStorage.setItem('drivepro_bookings_list', JSON.stringify(all));
    renderStaffQueueWorkspace();
}

function updateJobStatus(bookingId, newStatus) {
    mutateActiveJob(bookingId, (job) => {
        job.status = newStatus;
    });
}

function adjustJobEstimate(bookingId, deltaMinutes) {
    mutateActiveJob(bookingId, (job) => {
        const currentMins = Number(job.estMinutes || 15);
        const updatedMins = Math.max(5, currentMins + deltaMinutes);
        job.estMinutes = updatedMins;
        job.est = `± ${updatedMins} Menit`;
    });
}

function addServiceToJob(bookingId, engineKey) {
    const sel = document.getElementById('addServiceDropdown');
    if (!sel) return;
    const catalog = STAFF_SERVICE_CATALOG[engineKey] || STAFF_SERVICE_CATALOG.Bensin;
    const found = catalog.find(s => s.id === sel.value);
    if (!found) return;

    mutateActiveJob(bookingId, (job) => {
        if (!Array.isArray(job.servicesList)) job.servicesList = [];
        job.servicesList.push({ ...found });
        job.service = job.servicesList.map(s => s.name).join(', ');
    });
}

function removeServiceFromJob(bookingId, srvIdx) {
    mutateActiveJob(bookingId, (job) => {
        if (job.servicesList.length <= 1) {
            alert('Minimal harus terdapat 1 layanan servis pada kendaraan.');
            return;
        }
        job.servicesList.splice(srvIdx, 1);
        job.service = job.servicesList.map(s => s.name).join(', ');
    });
}

function addSparepartToJob(bookingId) {
    const sel = document.getElementById('sparepartSelectDropdown');
    const qtyInput = document.getElementById('sparepartQtyInput');
    if (!sel || !qtyInput) return;

    const part = SPAREPART_CATALOG.find(p => p.partId === sel.value);
    const qty = Math.max(1, Number(qtyInput.value || 1));
    if (!part) return;

    mutateActiveJob(bookingId, (job) => {
        if (!Array.isArray(job.sparepartsList)) job.sparepartsList = [];
        const existingIdx = job.sparepartsList.findIndex(p => p.partId === part.partId);
        if (existingIdx !== -1) {
            job.sparepartsList[existingIdx].qty += qty;
        } else {
            job.sparepartsList.push({ ...part, qty });
        }
    });
}

function changeSparepartQty(bookingId, partIdx, delta) {
    mutateActiveJob(bookingId, (job) => {
        const item = job.sparepartsList[partIdx];
        if (!item) return;
        const nextQty = item.qty + delta;
        if (nextQty <= 0) {
            job.sparepartsList.splice(partIdx, 1);
        } else {
            item.qty = nextQty;
        }
    });
}

function removeSparepartFromJob(bookingId, partIdx) {
    mutateActiveJob(bookingId, (job) => {
        job.sparepartsList.splice(partIdx, 1);
    });
}

function completeWorkshopJob(bookingId) {
    const all = ensureInitialWorkshopQueues();
    const idx = all.findIndex(q => q.bookingId === bookingId);
    if (idx === -1) return;

    const job = all[idx];
    job.status = 'done';
    localStorage.setItem('drivepro_bookings_list', JSON.stringify(all));

    // Catat ke Riwayat Servis Selesai (drivepro_completed_history)
    const now = new Date();
    const finishedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const srvTotal = (job.servicesList || []).reduce((acc, s) => acc + Number(s.price || 0), 0);
    const partTotal = (job.sparepartsList || []).reduce((acc, p) => acc + ((Number(p.partPrice) + Number(p.installFee)) * Number(p.qty)), 0);

    const history = getCompletedHistoryList();
    history.unshift({
        trxId: job.bookingId.replace('BK-', 'TRX-'),
        bookingId: job.bookingId,
        branch: job.branch || currentStaff.branchKey,
        branchName: job.branchName || currentStaff.branchName,
        date: job.date || now.toISOString().slice(0, 10),
        bookingTime: job.time || '09:00 WIB',
        startedAt: job.startedAt || job.time || '09:05 WIB',
        finishedAt: finishedTime,
        durationMinutes: Number(job.estMinutes || 45),
        customerName: job.name,
        customerPhone: job.phone,
        car: job.car,
        staffAdvisor: job.staffAdvisor || currentStaff.name,
        mechanic: job.mechanic || 'Andi Wijaya (Mekanik Senior)',
        servicesList: job.servicesList || [],
        sparepartsList: job.sparepartsList || [],
        totalAmount: srvTotal + partTotal,
        paymentStatus: 'Menunggu Pembayaran POS'
    });
    localStorage.setItem('drivepro_completed_history', JSON.stringify(history));

    alert(`Servis ${job.car} (${job.ticket}) selesai! Data telah masuk ke Riwayat Servis dan siap diproses di POS Kasir.`);
    renderStaffQueueWorkspace();
}