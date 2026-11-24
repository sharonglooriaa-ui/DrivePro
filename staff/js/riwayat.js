// staff/js/riwayat.js
let historyStaff = null;

document.addEventListener('DOMContentLoaded', () => {
    historyStaff = getLoggedStaff();
    document.getElementById('navBranchLabel').textContent = historyStaff.branchName.toUpperCase();

    populateStaffFilterDropdown();
    applyHistoryFilters();
});

function populateStaffFilterDropdown() {
    const sel = document.getElementById('filterHistoryStaff');
    if (!sel) return;

    const branchStaffs = STAFF_ACCOUNTS.filter(s => s.branchKey === historyStaff.branchKey);
    sel.innerHTML = `<option value="ALL">Semua PIC / Staff</option>` + branchStaffs.map(s =>
        `<option value="${s.name}">${s.name}</option>`
    ).join('');
}

function resetHistoryFilters() {
    document.getElementById('filterHistoryDate').value = '';
    document.getElementById('filterHistoryStaff').value = 'ALL';
    document.getElementById('filterHistoryKeyword').value = '';
    applyHistoryFilters();
}

function applyHistoryFilters() {
    const selectedDate = document.getElementById('filterHistoryDate').value; // kosong jika tidak dipilih
    const selectedStaff = document.getElementById('filterHistoryStaff').value;
    const keyword = document.getElementById('filterHistoryKeyword').value.trim().toLowerCase();

    const allHistory = getCompletedHistoryList().filter(
        h => (h.branch || 'bandung').toLowerCase() === historyStaff.branchKey
    );

    const filtered = allHistory.filter(item => {
        const matchDate = !selectedDate || item.date === selectedDate;
        const matchStaff = selectedStaff === 'ALL' || (item.staffAdvisor || '').toLowerCase() === selectedStaff.toLowerCase();
        const matchKeyword = !keyword ||
            (item.trxId || '').toLowerCase().includes(keyword) ||
            (item.bookingId || '').toLowerCase().includes(keyword) ||
            (item.customerName || '').toLowerCase().includes(keyword) ||
            (item.car || '').toLowerCase().includes(keyword);

        return matchDate && matchStaff && matchKeyword;
    });

    const tbody = document.getElementById('staffHistoryTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="padding:36px 16px; text-align:center; color:var(--text-muted);">
                    Tidak ada riwayat servis yang cocok dengan kriteria pencarian.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map((item, idx) => `
        <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:14px 16px;">
                <strong style="display:block; color:var(--blue-primary);">${item.trxId}</strong>
                <small style="color:var(--text-muted);">${item.date}</small>
            </td>
            <td style="padding:14px 16px;">
                <strong style="display:block; color:var(--text-dark);">${item.startedAt} - ${item.finishedAt}</strong>
                <small style="color:var(--text-muted);">Durasi: ${item.durationMinutes} mnt</small>
            </td>
            <td style="padding:14px 16px;">
                <strong style="display:block; color:var(--blue-dark);">${item.car}</strong>
                <small style="color:var(--text-muted);">${item.customerName} (${item.customerPhone})</small>
            </td>
            <td style="padding:14px 16px;">
                <strong style="display:block; color:var(--text-dark);">PIC: ${item.staffAdvisor}</strong>
                <small style="color:var(--text-muted);">${item.mechanic}</small>
            </td>
            <td style="padding:14px 16px;">
                <strong style="color:var(--blue-primary);">${formatRupiah(item.totalAmount)}</strong>
            </td>
            <td style="padding:14px 16px; text-align:right;">
                <button type="button" class="btn-outline" style="padding:6px 12px; font-size:12px;" onclick="openHistoryDetailModal('${item.trxId}')">
                    Rincian
                </button>
            </td>
        </tr>
    `).join('');
}

function openHistoryDetailModal(trxId) {
    const item = getCompletedHistoryList().find(h => h.trxId === trxId);
    if (!item) return;

    document.getElementById('modalHistoryTrxId').textContent = `${item.trxId} (${item.date})`;
    document.getElementById('modalHistoryDetailContent').innerHTML = `
        <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
            <div><strong>Pelanggan:</strong> ${item.customerName} (${item.customerPhone})</div>
            <div><strong>Kendaraan:</strong> ${item.car} • ${item.yearKm || '-'}</div>
            <div><strong>PIC Advisor:</strong> ${item.staffAdvisor}</div>
            <div><strong>Mekanik:</strong> ${item.mechanic}</div>
        </div>
        <div>
            <strong style="display:block; margin-bottom:6px; color:var(--blue-dark);">Jasa Servis:</strong>
            ${(item.servicesList || []).map(s => `
                <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e8f0;">
                    <span>${s.name}</span>
                    <strong>${formatRupiah(s.price)}</strong>
                </div>
            `).join('')}
        </div>
        <div>
            <strong style="display:block; margin-bottom:6px; color:var(--blue-dark);">Sparepart Terpasang:</strong>
            ${(item.sparepartsList || []).length === 0
                ? `<small style="color:var(--text-muted);">Tidak ada penggantian sparepart.</small>`
                : item.sparepartsList.map(p => `
                    <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e8f0;">
                        <span>${p.name} (${p.qty}x)</span>
                        <strong>${formatRupiah((Number(p.partPrice) + Number(p.installFee)) * Number(p.qty))}</strong>
                    </div>
                `).join('')
            }
        </div>
        <div style="display:flex; justify-content:space-between; font-size:15px; color:var(--blue-primary); padding-top:8px;">
            <strong>Total Biaya Akhir</strong>
            <strong>${formatRupiah(item.totalAmount)}</strong>
        </div>
    `;
    document.getElementById('historyDetailModal').style.display = 'flex';
}