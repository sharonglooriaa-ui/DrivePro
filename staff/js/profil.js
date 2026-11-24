// staff/js/profil.js
document.addEventListener('DOMContentLoaded', () => {
    const staff = getLoggedStaff();
    const todayStr = new Date().toISOString().slice(0, 10);

    document.getElementById('navBranchLabel').textContent = staff.branchName.toUpperCase();
    document.getElementById('profTodayDate').textContent = todayStr;

    const initials = staff.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('staffInitials').textContent = initials;
    document.getElementById('profStaffName').textContent = staff.name;
    document.getElementById('profStaffRole').textContent = staff.role;
    document.getElementById('profStaffId').textContent = staff.staffId;
    document.getElementById('profBranchName').textContent = staff.branchName;
    document.getElementById('profEmail').textContent = staff.email;
    document.getElementById('profPhone').textContent = staff.phone;
    document.getElementById('profAssignedBays').textContent = (staff.assignedBays || [1, 2]).map(b => `Bay ${b}`).join(' & ');
    document.getElementById('profShift').textContent = staff.shift;

    // Hitung KPI dinamis dari riwayat selesai + antrean aktif hari ini
    const completedToday = getCompletedHistoryList().filter(h =>
        h.date === todayStr && (h.staffAdvisor === staff.name || h.branch === staff.branchKey)
    );
    const activeToday = ensureInitialWorkshopQueues().filter(q =>
        q.status !== 'done' && (q.branch || 'bandung') === staff.branchKey && (staff.assignedBays || [1, 2]).includes(Number(q.bay))
    );

    const totalCustomers = completedToday.length + activeToday.length;
    const totalMinutes = completedToday.reduce((acc, h) => acc + Number(h.durationMinutes || 45), 0) +
                         activeToday.reduce((acc, q) => acc + Number(q.estMinutes || 20), 0);
    const totalRevenue = completedToday.reduce((acc, h) => acc + Number(h.totalAmount || 0), 0);

    const hours = Math.floor(totalMinutes / 60);
    const remMins = totalMinutes % 60;

    document.getElementById('kpiCustomersToday').textContent = `${totalCustomers} Customer`;
    document.getElementById('kpiBreakdownLabel').textContent = `${completedToday.length} selesai • ${activeToday.length} aktif di bay`;
    document.getElementById('kpiWorkTimeToday').textContent = hours > 0 ? `${hours} Jam ${remMins} Mnt` : `${totalMinutes} Menit`;
    document.getElementById('kpiRevenueToday').textContent = formatRupiah(totalRevenue);

    const recentContainer = document.getElementById('profRecentJobsList');
    if (completedToday.length === 0) {
        recentContainer.innerHTML = `<div style="font-size:13px; color:var(--text-muted);">Belum ada unit yang selesai hari ini.</div>`;
    } else {
        recentContainer.innerHTML = completedToday.slice(0, 3).map(item => `
            <div style="background:#f8fafd; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="display:block; font-size:13.5px; color:var(--blue-dark);">${item.car}</strong>
                    <small style="color:var(--text-muted);">${item.trxId} • Selesai ${item.finishedAt} (${item.durationMinutes} mnt)</small>
                </div>
                <strong style="font-size:13.5px; color:var(--blue-primary);">${formatRupiah(item.totalAmount)}</strong>
            </div>
        `).join('');
    }
});

function logoutStaffAccount() {
    localStorage.removeItem('drivepro_logged_staff');
    window.location.href = 'login.html';
}