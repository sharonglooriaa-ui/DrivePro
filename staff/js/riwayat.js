// staff/js/riwayat.js
let activeStaffUser = null;
let allHistoryRecords = [];

document.addEventListener('DOMContentLoaded', () => {
    activeStaffUser = getLoggedStaff();
    document.getElementById('navBranchLabel').textContent = activeStaffUser.branchName.toUpperCase();

    allHistoryRecords = getCompletedHistoryList();
    populateWorkerFilterOptions();
    renderFilteredHistory();
});

function populateWorkerFilterOptions() {
    const workerSet = new Set();
    allHistoryRecords.forEach(rec => {
        if (rec.staffAdvisor) workerSet.add(rec.staffAdvisor);
        if (rec.mechanic) workerSet.add(rec.mechanic);
    });

    const selectEl = document.getElementById('filterWorkerSelect');
    workerSet.forEach(worker => {
        selectEl.innerHTML += `<option value="${worker}">${worker}</option>`;
    });
}

function resetHistoryFilters() {
    document.getElementById('filterTrxKeyword').value = '';
    document.getElementById('filterWorkerSelect').value = '';
    document.getElementById('filterDateInput').value = '';
    renderFilteredHistory();
}

function renderFilteredHistory() {
    const keyword = document.getElementById('filterTrxKeyword').value.trim().toLowerCase();
    const worker = document.getElementById('filterWorkerSelect').value;
    const dateVal = document.getElementById('filterDateInput').value;

    const filtered = allHistoryRecords.filter(rec => {
        const matchKeyword = !keyword ||
            (rec.trxId && rec.trxId.toLowerCase().includes(keyword)) ||
            (rec.bookingId && rec.bookingId.toLowerCase().includes(keyword)) ||
            (rec.car && rec.car.toLowerCase().includes(keyword)) ||
            (rec.customerName && rec.customerName.toLowerCase().includes(keyword));

        const matchWorker = !worker ||
            rec.staffAdvisor === worker ||
            rec.mechanic === worker;

        const matchDate = !dateVal || rec.date === dateVal;

        return matchKeyword && matchWorker && matchDate;
    });

    document.getElementById('historyCountLabel').textContent = `Menampilkan ${filtered.length} riwayat transaksi`;

    const container = document.getElementById('staffHistoryRowsContainer');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="card-box" style="text-align:center; padding:36px; color:var(--text-muted);">
                Tidak ada riwayat servis yang cocok dengan kriteria filter Anda.
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((rec) => {
        const originalIdx = allHistoryRecords.indexOf(rec);
        const srvCount = (rec.servicesList || []).length;
        const partCount = (rec.sparepartsList || []).reduce((acc, p) => acc + Number(p.qty || 1), 0);

        return `
            <div class="history-row-card" onclick="openHistoryDetailModal(${originalIdx})">
                <div>
                    <div style="font-size:12px; font-weight:800; color:var(--blue-accent);">${rec.trxId}</div>
                    <strong style="display:block; font-size:14.5px; color:var(--blue-dark);">${rec.car}</strong>
                    <small style="color:var(--text-muted);">Pelanggan: ${rec.customerName}</small>
                </div>

                <div>
                    <div style="font-size:12.5px; font-weight:700; color:var(--text-dark);">${rec.date}</div>
                    <small style="color:var(--text-muted);">Mulai ${rec.startedAt} &rarr; Selesai <strong>${rec.finishedAt}</strong></small>
                    <div style="font-size:11.5px; color:var(--blue-primary); font-weight:700; margin-top:2px;">
                        ${srvCount} Servis • ${partCount} Sparepart
                    </div>
                </div>

                <div>
                    <div style="font-size:12px; color:var(--text-muted);">SA: <strong style="color:var(--text-dark);">${rec.staffAdvisor}</strong></div>
                    <div style="font-size:12px; color:var(--text-muted);">Mekanik: <strong style="color:var(--text-dark);">${rec.mechanic}</strong></div>
                </div>

                <div style="text-align:right;">
                    <strong style="display:block; font-size:15px; color:var(--blue-primary);">${formatRupiah(rec.totalAmount)}</strong>
                    <span class="status-pill done" style="margin-top:4px;">Detail &rarr;</span>
                </div>
            </div>
        `;
    }).join('');
}

function openHistoryDetailModal(idx) {
    const rec = allHistoryRecords[idx];
    if (!rec) return;

    const servicesHtml = (rec.servicesList || []).map(s => `
        <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px;">
            <span>&bull; ${s.name}</span>
            <strong>${formatRupiah(s.price)}</strong>
        </div>
    `).join('');

    const parts = rec.sparepartsList || [];
    const partsHtml = parts.length === 0
        ? `<div style="font-size:12.5px; color:var(--text-muted); padding:4px 0;">Tidak ada penggantian sparepart.</div>`
        : parts.map(p => {
            const sub = (Number(p.partPrice) + Number(p.installFee)) * Number(p.qty);
            return `
                <div style="padding:6px 0; border-bottom:1px dashed #e2e8f0; font-size:13px;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${p.name} (${p.qty}x)</strong>
                        <strong>${formatRupiah(sub)}</strong>
                    </div>
                    <small style="color:var(--text-muted);">Harga Part: ${formatRupiah(p.partPrice)} + Jasa Pasang: ${formatRupiah(p.installFee)}</small>
                </div>
            `;
        }).join('');

    document.getElementById('modalHistoryTitle').textContent = `Rincian Work Order • ${rec.trxId}`;
    document.getElementById('modalHistoryBody').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px; font-size:13px;">
            <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div><span style="color:var(--text-muted);">No. Transaksi:</span><br><strong>${rec.trxId}</strong></div>
                <div><span style="color:var(--text-muted);">No. Booking:</span><br><strong>${rec.bookingId}</strong></div>
                <div><span style="color:var(--text-muted);">Tanggal &amp; Cabang:</span><br><strong>${rec.date} • ${rec.branchName}</strong></div>
                <div><span style="color:var(--text-muted);">Kendaraan:</span><br><strong>${rec.car}</strong></div>
                <div><span style="color:var(--text-muted);">Jam Booking / Mulai:</span><br><strong>${rec.bookingTime} / ${rec.startedAt}</strong></div>
                <div><span style="color:var(--text-muted);">Jam Selesai (${rec.durationMinutes} mnt):</span><br><strong style="color:#15803d;">${rec.finishedAt}</strong></div>
                <div><span style="color:var(--text-muted);">Service Advisor (Staff):</span><br><strong>${rec.staffAdvisor}</strong></div>
                <div><span style="color:var(--text-muted);">Mekanik Pengerja:</span><br><strong>${rec.mechanic}</strong></div>
            </div>

            <div style="border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
                <strong style="display:block; color:var(--blue-primary); margin-bottom:6px;">Daftar Perbaikan / Layanan Servis:</strong>
                ${servicesHtml}
            </div>

            <div style="border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
                <strong style="display:block; color:var(--blue-primary); margin-bottom:6px;">Daftar Penggantian Sparepart &amp; Jasa Pasang:</strong>
                ${partsHtml}
            </div>

            <div style="background:var(--blue-soft); border:1.5px solid #bfdbfe; border-radius:12px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="display:block; font-size:14px; color:var(--blue-dark);">Total Biaya Pengerjaan</strong>
                    <small style="color:var(--blue-primary);">${rec.paymentStatus}</small>
                </div>
                <strong style="font-size:18px; color:var(--blue-primary);">${formatRupiah(rec.totalAmount)}</strong>
            </div>
        </div>
    `;
    document.getElementById('historyDetailModal').style.display = 'flex';
}

function closeHistoryModal() {
    document.getElementById('historyDetailModal').style.display = 'none';
}