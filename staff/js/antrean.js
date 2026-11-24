// staff/js/antrean.js
let currentStaff = null;
let bayViewMode = 'mine';
let selectedBayNumber = null;
let modalTargetBay = null;
let isEditingServices = false;
let countdownIntervalId = null;

const TOTAL_BAYS_MAP = {
    bandung: 6,
    jakarta: 8,
    surabaya: 5
};

document.addEventListener('DOMContentLoaded', () => {
    currentStaff = getLoggedStaff();
    document.getElementById('navBranchLabel').textContent = currentStaff.branchName.toUpperCase();
    ensureInitialWorkshopQueues();

    const myActiveJobs = getMyActiveAssignedJobs();
    selectedBayNumber = myActiveJobs.length > 0 ? Number(myActiveJobs[0].bay) : null;

    renderStaffQueueWorkspace();
    startLiveCountdownTicker();
});

function getBranchQueues() {
    const all = ensureInitialWorkshopQueues();
    return all.filter(q => (q.branch || 'bandung').toLowerCase() === currentStaff.branchKey);
}

function getUnassignedWaitingQueues() {
    return getBranchQueues().filter(q =>
        q.status !== 'done' && (!q.bay || Number(q.bay) === 0 || q.status === 'waiting')
    );
}

function getMyActiveAssignedJobs() {
    const myBays = currentStaff.assignedBays || [1, 2];
    return getBranchQueues().filter(q =>
        q.status !== 'done' &&
        q.status !== 'waiting' &&
        Number(q.bay) > 0 &&
        (myBays.includes(Number(q.bay)) || q.staffAdvisor === currentStaff.name)
    );
}

function formatSecondsCountdown(totalSec) {
    const safeSec = Math.max(0, Math.floor(totalSec));
    const mins = Math.floor(safeSec / 60);
    const secs = safeSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startLiveCountdownTicker() {
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    countdownIntervalId = setInterval(() => {
        const all = ensureInitialWorkshopQueues();
        let changed = false;

        all.forEach(job => {
            if (job.status !== 'done' && job.status !== 'waiting' && Number(job.bay) > 0) {
                if (typeof job.remainingSeconds !== 'number') {
                    job.remainingSeconds = Number(job.estMinutes || 15) * 60;
                }
                if (job.remainingSeconds > 0) {
                    job.remainingSeconds -= 1;
                    const remMins = Math.ceil(job.remainingSeconds / 60);
                    job.estMinutes = remMins;
                    job.est = `± ${remMins} Menit`;
                    changed = true;
                }
            }
        });

        if (changed) {
            localStorage.setItem('drivepro_bookings_list', JSON.stringify(all));
            all.forEach(job => {
                const timerEl = document.getElementById(`live-timer-${job.bookingId}`);
                if (timerEl) {
                    timerEl.textContent = formatSecondsCountdown(job.remainingSeconds);
                }
                const estLabelEl = document.getElementById(`workspace-est-label-${job.bookingId}`);
                if (estLabelEl) {
                    estLabelEl.textContent = `${job.est} (${formatSecondsCountdown(job.remainingSeconds)})`;
                }
            });
        }
    }, 1000);
}

function switchBayViewMode(mode) {
    bayViewMode = mode;
    isEditingServices = false;
    document.getElementById('btnModeMyBays').classList.toggle('active', mode === 'mine');
    document.getElementById('btnModeAllBays').classList.toggle('active', mode === 'all');

    if (mode === 'mine') {
        const myActive = getMyActiveAssignedJobs();
        selectedBayNumber = myActive.length > 0 ? Number(myActive[0].bay) : null;
    }

    renderStaffQueueWorkspace();
}

function selectWorkshopBay(bayNum) {
    selectedBayNumber = bayNum;
    isEditingServices = false;
    renderStaffQueueWorkspace();
}

function toggleEditServicesMode() {
    isEditingServices = !isEditingServices;
    renderStaffQueueWorkspace();
}

/* =========================================================
   POP-UP MODAL ALOKASI UNIT & MEKANIK KE BAY KOSONG
   ========================================================= */
function openAssignBayModal(bayNum) {
    const waitingList = getUnassignedWaitingQueues();
    if (waitingList.length === 0) {
        alert('Tidak ada tiket antrean yang sedang menunggu.');
        return;
    }

    modalTargetBay = bayNum;
    document.getElementById('assignModalTitle').textContent = `Alokasikan Unit ke Bay ${bayNum}`;

    const sel = document.getElementById('modalQueueSelect');
    sel.innerHTML = `<option value="">-- Pilih No. Antrean --</option>` + waitingList.map(w => {
        const eng = w.engineType || (w.car.toLowerCase().includes('ioniq') || w.car.toLowerCase().includes('ev') ? 'Listrik' : 'Bensin');
        return `<option value="${w.bookingId}">${w.ticket} • ${w.car} (${eng}) — ${w.name}</option>`;
    }).join('');

    document.getElementById('modalVehicleInfoBox').style.display = 'none';
    document.getElementById('modalMechanicSection').style.display = 'none';
    document.getElementById('assignBayModal').style.display = 'flex';
}

function closeAssignBayModal() {
    modalTargetBay = null;
    document.getElementById('assignBayModal').style.display = 'none';
}

function onModalQueueSelected(bookingId) {
    const infoBox = document.getElementById('modalVehicleInfoBox');
    const mechSection = document.getElementById('modalMechanicSection');
    const mechLabel = document.getElementById('modalMechanicLabel');
    const mechChecklist = document.getElementById('modalMechanicChecklist');

    if (!bookingId) {
        infoBox.style.display = 'none';
        mechSection.style.display = 'none';
        return;
    }

    const job = getBranchQueues().find(q => q.bookingId === bookingId);
    if (!job) return;

    const engineType = job.engineType || (job.car.toLowerCase().includes('ioniq') || job.car.toLowerCase().includes('ev') ? 'Listrik' : 'Bensin');
    const mechList = getMechanicsStatusByEngine(currentStaff.branchKey, engineType);
    const availableCount = mechList.filter(m => !m.isBusy).length;

    infoBox.style.display = 'block';
    infoBox.innerHTML = `
        <div style="font-weight:800; color:var(--blue-dark);">${job.car} • Tipe Mesin: ${engineType}</div>
        <div style="color:var(--text-muted); margin-top:2px;">Layanan: ${job.service} (${job.est})</div>
    `;

    mechLabel.textContent = `2. Pilih Mekanik Spesialis ${engineType} (${availableCount} Tersedia) *`;
    mechSection.style.display = 'block';

    let autoPicked = false;
    mechChecklist.innerHTML = mechList.map(m => {
        let isChecked = false;
        if (!m.isBusy && !autoPicked) {
            isChecked = true;
            autoPicked = true;
        }

        const badge = m.isBusy
            ? `<span style="font-size:10.5px; font-weight:700; color:#b45309; background:#fef3c7; padding:2px 6px; border-radius:5px; margin-left:auto;">Bay ${m.busyBay}</span>`
            : `<span style="font-size:10.5px; font-weight:700; color:#15803d; background:#dcfce7; padding:2px 6px; border-radius:5px; margin-left:auto;">Kosong</span>`;

        return `
            <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:600; color:var(--text-dark); cursor:pointer; padding:5px 6px; border-radius:6px;">
                <input type="checkbox" name="modalChosenMechs" value="${m.name}" ${isChecked ? 'checked' : ''} style="width:15px; height:15px; accent-color:var(--blue-accent); flex-shrink:0;">
                <span style="min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.name}</span>
                ${badge}
            </label>
        `;
    }).join('');
}

function confirmAssignQueueFromModal() {
    if (!modalTargetBay) return;
    const bookingId = document.getElementById('modalQueueSelect').value;
    if (!bookingId) {
        alert('Pilih nomor antrean terlebih dahulu.');
        return;
    }

    const chosenMechs = Array.from(document.querySelectorAll('input[name="modalChosenMechs"]:checked')).map(cb => cb.value);
    if (chosenMechs.length === 0) {
        alert('Pilih minimal 1 mekanik yang bertugas.');
        return;
    }

    const all = ensureInitialWorkshopQueues();
    const idx = all.findIndex(q => q.bookingId === bookingId);
    if (idx === -1) return;

    const job = all[idx];
    job.bay = modalTargetBay;
    job.status = 'called';
    job.mechanics = chosenMechs;
    job.mechanic = chosenMechs.join(', ');
    job.staffAdvisor = currentStaff.name;
    if (typeof job.remainingSeconds !== 'number') {
        job.remainingSeconds = Number(job.estMinutes || 20) * 60;
    }

    localStorage.setItem('drivepro_bookings_list', JSON.stringify(all));
    closeAssignBayModal();
    renderStaffQueueWorkspace();
}

/* =========================================================
   RENDER UTAMA (TAB BAY SAYA vs TAB CEK BAY KESELURUHAN)
   ========================================================= */
function renderStaffQueueWorkspace() {
    const totalBays = TOTAL_BAYS_MAP[currentStaff.branchKey] || 6;
    const branchQueues = getBranchQueues();
    const waitingList = getUnassignedWaitingQueues();
    const myActiveJobs = getMyActiveAssignedJobs();

    document.getElementById('waitingQueueCountBadge').textContent =
        `${waitingList.length} Tiket Antrean Menunggu Alokasi Bay`;

    const stripEl = document.getElementById('staffBayStripContainer');
    const workspaceEl = document.getElementById('bayWorkspaceContainer');

    // MODE 2: CEK BAY KESELURUHAN (HANYA RINGKASAN STATUS BAY & TOMBOL POP-UP BAY KOSONG, TANPA DETAIL)
    if (bayViewMode === 'all') {
        document.getElementById('bayStripHeading').textContent =
            `Status Seluruh Bay — ${currentStaff.branchName} (${totalBays} Bay):`;

        workspaceEl.innerHTML = ''; // Tidak tampilkan detail pengerjaan di tab Cek Bay Keseluruhan

        const allBayNums = Array.from({ length: totalBays }, (_, i) => i + 1);
        stripEl.innerHTML = allBayNums.map(bayNum => {
            const job = branchQueues.find(q => Number(q.bay) === bayNum && q.status !== 'done' && q.status !== 'waiting');

            if (!job) {
                return `
                    <div class="bay-slot-card empty-bay" style="min-height:165px;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <strong style="font-size:16px; color:var(--blue-dark);">Bay ${bayNum}</strong>
                                <span class="status-pill waiting">Kosong</span>
                            </div>
                            <p style="font-size:12.5px; color:var(--text-muted); margin:0;">
                                Bay tersedia dan siap diisi unit dari antrean menunggu.
                            </p>
                        </div>
                        <button type="button" class="btn-primary" style="width:100%; padding:9px 12px; font-size:12.5px;" onclick="openAssignBayModal(${bayNum})">
                            + Masukkan Unit ke Bay ${bayNum}
                        </button>
                    </div>
                `;
            }

            const remSec = typeof job.remainingSeconds === 'number' ? job.remainingSeconds : Number(job.estMinutes || 15) * 60;
            const badgeText = job.status === 'called' ? 'Dipanggil' : 'Sedang Dikerjakan';

            return `
                <div class="bay-slot-card" style="min-height:165px; cursor:default;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <strong style="font-size:16px; color:var(--blue-dark);">Bay ${bayNum} • ${job.ticket}</strong>
                            <span class="live-timer-badge" id="live-timer-${job.bookingId}">${formatSecondsCountdown(remSec)}</span>
                        </div>
                        <span class="status-pill ${job.status}" style="margin-bottom:10px;">${badgeText}</span>
                        <div style="font-size:13.5px; font-weight:800; color:var(--text-dark); margin-bottom:4px;">${job.car}</div>
                    </div>
                    <div style="background:#f8fafd; border-radius:8px; padding:7px 9px; font-size:11.5px; color:var(--text-muted);">
                        <div><strong>PIC Advisor:</strong> ${job.staffAdvisor || '-'}</div>
                        <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><strong>Mekanik:</strong> ${job.mechanic || '-'}</div>
                    </div>
                </div>
            `;
        }).join('');
        return;
    }

    // MODE 1: BAY SAYA (AKTIF) — MENAMPILKAN BAY AKTIF MILIK AKUN INI + DETAIL PENGERJAAN
    document.getElementById('bayStripHeading').textContent =
        `Bay Aktif yang Sedang Anda Tangani (${myActiveJobs.length} Unit Aktif):`;

    if (myActiveJobs.length === 0) {
        stripEl.innerHTML = '';
        workspaceEl.innerHTML = `
            <div class="card-box" style="text-align:center; padding:48px 24px; margin-bottom:48px;">
                <h3 style="font-size:18px; font-weight:800; color:var(--blue-dark); margin-bottom:6px;">
                    Semua Pengerjaan Bay Anda Sudah Selesai!
                </h3>
                <p style="font-size:13.5px; color:var(--text-muted); margin-bottom:20px;">
                    Tidak ada unit aktif yang tersisa di daftar Bay Saya. Buka tab <strong>Cek Bay Keseluruhan</strong> untuk memasukkan antrean berikutnya ke bay yang kosong.
                </p>
                <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn-primary" onclick="switchBayViewMode('all')">Buka Cek Bay Keseluruhan</button>
                    <a href="service.html" class="btn-outline">+ Input Pelanggan Baru</a>
                </div>
            </div>
        `;
        return;
    }

    if (!myActiveJobs.some(j => Number(j.bay) === selectedBayNumber)) {
        selectedBayNumber = Number(myActiveJobs[0].bay);
    }

    stripEl.innerHTML = myActiveJobs.map(job => {
        const bayNum = Number(job.bay);
        const isSelected = bayNum === selectedBayNumber;
        const remSec = typeof job.remainingSeconds === 'number' ? job.remainingSeconds : Number(job.estMinutes || 15) * 60;
        const badgeText = job.status === 'called' ? 'Dipanggil' : 'Sedang Dikerjakan';

        return `
            <div class="bay-slot-card occupied ${isSelected ? 'selected-bay' : ''}" onclick="selectWorkshopBay(${bayNum})">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <strong style="font-size:15px; color:var(--blue-dark);">Bay ${bayNum} • ${job.ticket}</strong>
                        <span class="live-timer-badge" id="live-timer-${job.bookingId}">${formatSecondsCountdown(remSec)}</span>
                    </div>
                    <span class="status-pill ${job.status}" style="margin-bottom:8px;">${badgeText}</span>
                    <div style="font-size:13.5px; font-weight:800; color:var(--text-dark);">${job.car}</div>
                    <small style="color:var(--text-muted);">${job.name} • ${job.yearKm || ''}</small>
                </div>
            </div>
        `;
    }).join('');

    const activeJob = myActiveJobs.find(q => Number(q.bay) === selectedBayNumber);
    if (!activeJob) {
        workspaceEl.innerHTML = '';
        return;
    }

    if (!Array.isArray(activeJob.servicesList)) {
        activeJob.servicesList = [{ id: 'custom-1', name: activeJob.service || 'Servis Berkala', price: 350000, duration: 30 }];
    }
    if (!Array.isArray(activeJob.sparepartsList)) {
        activeJob.sparepartsList = [];
    }

    const engineKey = activeJob.engineType || (activeJob.car.toLowerCase().includes('ioniq') || activeJob.car.toLowerCase().includes('ev') ? 'Listrik' : 'Bensin');
    const catalogServices = STAFF_SERVICE_CATALOG[engineKey] || STAFF_SERVICE_CATALOG.Bensin;

    const srvSubtotal = activeJob.servicesList.reduce((acc, s) => acc + Number(s.price || 0), 0);
    const partSubtotal = activeJob.sparepartsList.reduce((acc, p) => acc + ((Number(p.partPrice) + Number(p.installFee)) * Number(p.qty)), 0);
    const grandTotal = srvSubtotal + partSubtotal;
    const remSec = typeof activeJob.remainingSeconds === 'number' ? activeJob.remainingSeconds : Number(activeJob.estMinutes || 15) * 60;
    const carImg = getStaffCarImage(activeJob.car);

    const selectedIds = activeJob.servicesList.map(s => s.id);
    const serviceSectionHtml = isEditingServices
        ? `
            <div style="background:#f8fafd; border:1.5px solid #bfdbfe; border-radius:12px; padding:14px;">
                <strong style="display:block; font-size:13px; color:var(--blue-primary); margin-bottom:10px;">
                    Centang Jenis Layanan yang Sesuai Hasil Pengecekan:
                </strong>
                <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                    ${catalogServices.map(srv => {
                        const isChecked = selectedIds.includes(srv.id);
                        return `
                            <label style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #dbe3f0; padding:10px 12px; border-radius:10px; cursor:pointer;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <input type="checkbox" class="edit-srv-checkbox" value="${srv.id}" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--blue-accent);">
                                    <span style="font-size:13px; font-weight:700; color:var(--blue-dark);">${srv.name}</span>
                                </div>
                                <strong style="font-size:12.5px; color:var(--blue-primary);">${formatRupiah(srv.price)}</strong>
                            </label>
                        `;
                    }).join('')}
                </div>
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                    <button type="button" class="btn-outline" onclick="toggleEditServicesMode()">Batal</button>
                    <button type="button" class="btn-primary" onclick="saveEditedServices('${activeJob.bookingId}', '${engineKey}')">Simpan Perubahan Servis</button>
                </div>
            </div>
        `
        : `
            <div>
                ${activeJob.servicesList.map((srv) => `
                    <div class="item-line-row">
                        <div>
                            <strong style="display:block; font-size:13.5px; color:var(--blue-dark);">${srv.name}</strong>
                            <small style="color:var(--text-muted);">Estimasi ± ${srv.duration || 30} mnt</small>
                        </div>
                        <strong style="font-size:13.5px; color:var(--blue-primary);">${formatRupiah(srv.price)}</strong>
                    </div>
                `).join('')}
            </div>
        `;

    workspaceEl.innerHTML = `
        <div class="workspace-grid">
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="card-box">
                    <div class="vehicle-hero-header">
                        <div class="vehicle-hero-left">
                            <img src="${carImg}" onerror="this.onerror=null;this.src=FALLBACK_CAR_SVG;" alt="${activeJob.car}" class="vehicle-hero-img">
                            <div>
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                    <span style="background:var(--blue-primary); color:#fff; font-size:11.5px; font-weight:800; padding:3px 10px; border-radius:7px;">Bay ${selectedBayNumber} • ${activeJob.ticket}</span>
                                    <span style="font-size:12px; font-weight:700; color:var(--text-muted);">${activeJob.bookingId}</span>
                                </div>
                                <h2 style="font-size:19px; font-weight:800; color:var(--blue-dark); line-height:1.25;">${activeJob.car}</h2>
                                <span style="font-size:12.5px; color:var(--blue-accent); font-weight:700;">${activeJob.yearKm || '2023 • 25.000 km'} • Mesin ${engineKey}</span>
                            </div>
                        </div>

                        <span class="status-pill ${activeJob.status}" style="flex-shrink:0;">
                            ${activeJob.status === 'called' ? 'Sedang Dipanggil' : 'Sedang Dikerjakan'}
                        </span>
                    </div>

                    <div class="job-meta-grid">
                        <div>
                            <span>Nama &amp; Kontak Pelanggan</span>
                            <strong>${activeJob.name} (${activeJob.phone})</strong>
                        </div>
                        <div>
                            <span>Tim Mekanik Pengerja</span>
                            <strong>${activeJob.mechanic || 'Andi Wijaya'}</strong>
                        </div>
                    </div>

                    <div style="margin-top:18px;">
                        <label style="display:block; font-size:12px; font-weight:800; color:var(--blue-dark); margin-bottom:8px;">
                            1. Tahap Pengerjaan Bay ${selectedBayNumber}:
                        </label>
                        <div class="status-stepper-grid">
                            <button type="button" class="status-step-btn ${activeJob.status === 'waiting' ? 'active-waiting' : ''}" onclick="releaseBayToWaiting('${activeJob.bookingId}')">
                                Kembalikan ke Antrean
                            </button>
                            <button type="button" class="status-step-btn ${activeJob.status === 'called' ? 'active-called' : ''}" onclick="updateJobStatus('${activeJob.bookingId}', 'called')">
                                Panggil ke Bay ${selectedBayNumber}
                            </button>
                            <button type="button" class="status-step-btn ${activeJob.status === 'working' ? 'active-working' : ''}" onclick="updateJobStatus('${activeJob.bookingId}', 'working')">
                                Sedang Dikerjakan
                            </button>
                            <button type="button" class="status-step-btn complete-btn" onclick="completeWorkshopJob('${activeJob.bookingId}')">
                                &#10003; Selesai
                            </button>
                        </div>
                    </div>

                    <div style="margin-top:18px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                            <label style="font-size:12px; font-weight:800; color:var(--blue-dark);">
                                2. Estimasi Waktu Tersisa (Sinkron ke Layar Customer):
                            </label>
                            <strong style="font-size:13.5px; color:var(--blue-accent);" id="workspace-est-label-${activeJob.bookingId}">
                                ${activeJob.est} (${formatSecondsCountdown(remSec)})
                            </strong>
                        </div>
                        <div class="time-adjust-grid">
                            <button type="button" class="btn-time-step" onclick="adjustJobEstimate('${activeJob.bookingId}', -15)">-15 Mnt</button>
                            <button type="button" class="btn-time-step" onclick="adjustJobEstimate('${activeJob.bookingId}', -10)">-10 Mnt</button>
                            <button type="button" class="btn-time-step" onclick="adjustJobEstimate('${activeJob.bookingId}', -5)">-5 Mnt</button>
                            <button type="button" class="btn-time-step delay" onclick="adjustJobEstimate('${activeJob.bookingId}', 5)">+5 Mnt</button>
                            <button type="button" class="btn-time-step delay" onclick="adjustJobEstimate('${activeJob.bookingId}', 10)">+10 Mnt</button>
                            <button type="button" class="btn-time-step delay" onclick="adjustJobEstimate('${activeJob.bookingId}', 15)">+15 Mnt</button>
                        </div>
                    </div>
                </div>

                <div class="card-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:14px;">
                        <div>
                            <h3 style="font-size:16px; font-weight:800; color:var(--blue-dark);">Jenis Layanan Servis</h3>
                            <small style="color:var(--text-muted);">Layanan yang dipilih saat pendaftaran awal. Klik Edit jika ada perubahan.</small>
                        </div>
                        ${!isEditingServices ? `<button type="button" class="btn-outline" onclick="toggleEditServicesMode()">Edit Jenis Servis</button>` : ''}
                    </div>
                    ${serviceSectionHtml}
                </div>
            </div>

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

function releaseBayToWaiting(bookingId) {
    mutateActiveJob(bookingId, (job) => {
        job.status = 'waiting';
        job.bay = 0;
        job.mechanics = [];
        job.mechanic = 'Menunggu Alokasi Mekanik';
    });
}

function adjustJobEstimate(bookingId, deltaMinutes) {
    mutateActiveJob(bookingId, (job) => {
        const currentSec = typeof job.remainingSeconds === 'number'
            ? job.remainingSeconds
            : Number(job.estMinutes || 15) * 60;
        const updatedSec = Math.max(60, currentSec + (deltaMinutes * 60));
        job.remainingSeconds = updatedSec;
        const updatedMins = Math.ceil(updatedSec / 60);
        job.estMinutes = updatedMins;
        job.est = `± ${updatedMins} Menit`;
    });
}

function saveEditedServices(bookingId, engineKey) {
    const checkedIds = Array.from(document.querySelectorAll('.edit-srv-checkbox:checked')).map(cb => cb.value);
    if (checkedIds.length === 0) {
        alert('Pilih minimal 1 jenis layanan servis.');
        return;
    }

    const catalog = STAFF_SERVICE_CATALOG[engineKey] || STAFF_SERVICE_CATALOG.Bensin;
    mutateActiveJob(bookingId, (job) => {
        const updatedList = checkedIds.map(id => {
            const existingCustom = (job.servicesList || []).find(s => s.id === id);
            if (existingCustom) return existingCustom;
            const found = catalog.find(s => s.id === id);
            return found ? { ...found } : null;
        }).filter(Boolean);

        job.servicesList = updatedList;
        job.service = updatedList.map(s => s.name).join(', ');
        const totalDur = updatedList.reduce((acc, s) => acc + Number(s.duration || 30), 0);
        job.estMinutes = totalDur;
        job.remainingSeconds = totalDur * 60;
        job.est = `± ${totalDur} Menit`;
        isEditingServices = false;
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
    job.bay = 0;
    localStorage.setItem('drivepro_bookings_list', JSON.stringify(all));

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
        yearKm: job.yearKm || '-',
        staffAdvisor: job.staffAdvisor || currentStaff.name,
        mechanic: job.mechanic || 'Andi Wijaya (Lead EV & Hybrid)',
        servicesList: job.servicesList || [],
        sparepartsList: job.sparepartsList || [],
        totalAmount: srvTotal + partTotal,
        paymentStatus: 'Menunggu Pembayaran POS'
    });
    localStorage.setItem('drivepro_completed_history', JSON.stringify(history));

    const remainingMyActive = getMyActiveAssignedJobs();
    selectedBayNumber = remainingMyActive.length > 0 ? Number(remainingMyActive[0].bay) : null;

    renderStaffQueueWorkspace();
}

function resetDemoQueues() {
    localStorage.removeItem('drivepro_bookings_list');
    localStorage.removeItem('drivepro_completed_history');
    location.reload();
}