// staff/js/service.js
let activeStaff = null;
let matchedMemberData = null;
let selectedMemberVehIdx = 'NEW';

document.addEventListener('DOMContentLoaded', () => {
    activeStaff = getLoggedStaff();
    document.getElementById('navBranchLabel').textContent = activeStaff.branchName.toUpperCase();
    document.getElementById('summarySaName').textContent = activeStaff.name;

    const now = new Date();
    document.getElementById('bookingDate').value = now.toISOString().slice(0, 10);
    document.getElementById('bookingTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const branchSelect = document.getElementById('workshopBranchSelect');
    branchSelect.value = activeStaff.branchKey;
    onBranchChanged(activeStaff.branchKey);

    onStaffEngineChange('Bensin');

    document.getElementById('staffServiceForm').addEventListener('submit', handleStaffServiceSubmit);
});

function onBranchChanged(branchKey) {
    const mechSelect = document.getElementById('assignedMechanicSelect');
    const mechs = MECHANICS_BY_BRANCH[branchKey] || MECHANICS_BY_BRANCH.bandung;
    mechSelect.innerHTML = mechs.map(m => `<option value="${m}">${m}</option>`).join('');
}

function toggleStaffCustomerType(type) {
    document.getElementById('pillNonMember').classList.toggle('active', type === 'non-member');
    document.getElementById('pillMember').classList.toggle('active', type === 'member');
    document.getElementById('guestFieldsBox').style.display = type === 'non-member' ? 'grid' : 'none';
    document.getElementById('memberLookupBox').style.display = type === 'member' ? 'block' : 'none';

    if (type === 'non-member') {
        matchedMemberData = null;
        selectedMemberVehIdx = 'NEW';
    }
}

function searchMemberForStaff() {
    const query = document.getElementById('memberSearchInput').value.trim().toLowerCase();
    if (!query) {
        alert('Masukkan No. HP atau Email member terlebih dahulu.');
        return;
    }

    const storedMembers = JSON.parse(localStorage.getItem('autocare_members') || '[]');
    const allMembers = [...DEMO_MEMBERS_LIST, ...storedMembers];
    const found = allMembers.find(m =>
        (m.phone && m.phone.toLowerCase() === query) ||
        (m.email && m.email.toLowerCase() === query)
    );

    if (!found) {
        alert('Data member tidak ditemukan. Coba 081234567890 atau budi@email.com.');
        return;
    }

    matchedMemberData = found;
    document.getElementById('memberResultArea').style.display = 'block';
    document.getElementById('memberBannerText').textContent =
        `Member Terverifikasi: ${found.name} (${found.city}) • ${found.points || 1250} Poin`;

    const vehicles = found.vehicles || [];
    const vehHtml = vehicles.map((v, idx) => {
        const isEv = (v.engineType || '').toLowerCase().includes('listrik') || (v.model || '').toLowerCase().includes('ioniq');
        const imgSrc = isEv ? 'assets/ioniq.png' : 'assets/avanza.png';
        return `
            <div class="saved-veh-card" id="staff-veh-card-${idx}" onclick="pickMemberVehicle(${idx})">
                <img src="${imgSrc}" alt="${v.model}">
                <div>
                    <strong style="display:block; font-size:13px; color:var(--blue-dark);">${v.brand} ${v.model}</strong>
                    <small style="color:var(--text-muted);">${v.plateNumber} • ${v.engineType}</small>
                </div>
            </div>
        `;
    }).join('') + `
        <div class="saved-veh-card selected" id="staff-veh-card-NEW" onclick="pickMemberVehicle('NEW')">
            <div>
                <strong style="display:block; font-size:13px; color:var(--blue-primary);">+ Kendaraan Baru</strong>
                <small style="color:var(--text-muted);">Input manual di bawah</small>
            </div>
        </div>
    `;

    document.getElementById('memberVehiclesContainer').innerHTML = vehHtml;
}

function pickMemberVehicle(idx) {
    selectedMemberVehIdx = idx;
    document.querySelectorAll('.saved-veh-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`staff-veh-card-${idx}`);
    if (card) card.classList.add('selected');

    if (idx === 'NEW' || !matchedMemberData) {
        document.getElementById('plateNumber').value = '';
        return;
    }

    const v = matchedMemberData.vehicles[idx];
    if (!v) return;

    document.getElementById('engineType').value = v.engineType;
    onStaffEngineChange(v.engineType);
    document.getElementById('vehicleBrand').value = v.brand;
    onStaffBrandChange(v.brand);
    document.getElementById('vehicleModel').value = v.model;
    document.getElementById('plateNumber').value = v.plateNumber;
}

function onStaffEngineChange(engineType) {
    const brandSel = document.getElementById('vehicleBrand');
    const modelSel = document.getElementById('vehicleModel');
    brandSel.innerHTML = '<option value="">-- Pilih Merk --</option>';
    modelSel.innerHTML = '<option value="">-- Pilih Model --</option>';

    Object.keys(STAFF_VEHICLE_CATALOG[engineType] || {}).forEach(b => {
        brandSel.innerHTML += `<option value="${b}">${b}</option>`;
    });

    const list = STAFF_SERVICE_CATALOG[engineType] || [];
    document.getElementById('staffServiceChecklist').innerHTML = list.map(srv => `
        <label class="srv-check-card">
            <input type="checkbox" value="${srv.id}" data-name="${srv.name}" data-price="${srv.price}" data-duration="${srv.duration}" onchange="recalcStaffServiceSummary()">
            <div>
                <strong style="display:block; font-size:13px; color:var(--blue-dark);">${srv.name}</strong>
                <small style="color:var(--text-muted);">± ${srv.duration} mnt • ${formatRupiah(srv.price)}</small>
            </div>
        </label>
    `).join('');

    recalcStaffServiceSummary();
}

function onStaffBrandChange(brand) {
    const engineType = document.getElementById('engineType').value;
    const modelSel = document.getElementById('vehicleModel');
    modelSel.innerHTML = '<option value="">-- Pilih Model --</option>';
    ((STAFF_VEHICLE_CATALOG[engineType] && STAFF_VEHICLE_CATALOG[engineType][brand]) || []).forEach(m => {
        modelSel.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function recalcStaffServiceSummary() {
    const checked = Array.from(document.querySelectorAll('#staffServiceChecklist input[type="checkbox"]:checked'));
    const totalSrv = checked.length;
    const totalDur = checked.reduce((acc, el) => acc + Number(el.dataset.duration || 0), 0);
    const totalPrice = checked.reduce((acc, el) => acc + Number(el.dataset.price || 0), 0);

    document.getElementById('summarySrvCount').textContent = `${totalSrv} Layanan`;
    document.getElementById('summaryEstDuration').textContent = `${totalDur} Menit`;
    document.getElementById('summaryTotalPrice').textContent = formatRupiah(totalPrice);
}

function handleStaffServiceSubmit(e) {
    e.preventDefault();

    const custType = document.querySelector('input[name="customerType"]:checked').value;
    let custName = '';
    let custPhone = '';

    if (custType === 'member') {
        if (!matchedMemberData) {
            alert('Silakan cari dan verifikasi data Member terlebih dahulu.');
            return;
        }
        custName = matchedMemberData.name;
        custPhone = matchedMemberData.phone;
    } else {
        custName = document.getElementById('guestName').value.trim();
        custPhone = document.getElementById('guestPhone').value.trim();
        if (!custName || !custPhone) {
            alert('Harap lengkapi Nama Pelanggan dan No. HP.');
            return;
        }
    }

    const checked = Array.from(document.querySelectorAll('#staffServiceChecklist input[type="checkbox"]:checked'));
    if (checked.length === 0) {
        alert('Pilih minimal 1 jenis layanan servis.');
        return;
    }

    const branchKey = document.getElementById('workshopBranchSelect').value;
    const branchLabelMap = { bandung: 'DrivePro Bandung', jakarta: 'DrivePro Jakarta', surabaya: 'DrivePro Surabaya' };
    const prefixMap = { bandung: 'A', jakarta: 'J', surabaya: 'S' };

    const queues = ensureInitialWorkshopQueues();
    const nextNum = queues.filter(q => q.branch === branchKey).length + 15;
    const numStr = String(nextNum).padStart(3, '0');
    const ticketCode = `${prefixMap[branchKey] || 'A'}-${numStr}`;

    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    const bookingId = `BK-${bookingDate.replace(/-/g, '')}-${numStr}`;

    const brand = document.getElementById('vehicleBrand').value;
    const model = document.getElementById('vehicleModel').value;
    const plate = document.getElementById('plateNumber').value.trim().toUpperCase();
    const bayNum = Number(document.getElementById('targetBaySelect').value);
    const mechanic = document.getElementById('assignedMechanicSelect').value;

    const servicesList = checked.map(cb => ({
        id: cb.value,
        name: cb.dataset.name,
        price: Number(cb.dataset.price),
        duration: Number(cb.dataset.duration)
    }));

    const totalDuration = servicesList.reduce((acc, s) => acc + s.duration, 0);

    const newTicket = {
        bookingId,
        ticket: ticketCode,
        branch: branchKey,
        branchName: branchLabelMap[branchKey],
        bay: bayNum,
        name: custName,
        phone: custPhone,
        isMember: custType === 'member',
        engineType: document.getElementById('engineType').value,
        car: `${brand} ${model} (${plate})`,
        service: servicesList.map(s => s.name).join(', '),
        servicesList,
        sparepartsList: [],
        mechanic,
        staffAdvisor: activeStaff.name,
        date: bookingDate,
        time: bookingTime,
        startedAt: bookingTime,
        estMinutes: totalDuration,
        est: `± ${totalDuration} Menit`,
        status: 'called'
    };

    queues.push(newTicket);
    localStorage.setItem('drivepro_bookings_list', JSON.stringify(queues));

    document.getElementById('issuedTicketCode').textContent = ticketCode;
    document.getElementById('issuedBookingCode').textContent = bookingId;
    document.getElementById('issuedTicketSummary').innerHTML = `
        <div><strong>Pelanggan:</strong> ${custName} (${custPhone})</div>
        <div><strong>Kendaraan:</strong> ${newTicket.car}</div>
        <div><strong>Alokasi Bay:</strong> Bay ${bayNum} • ${mechanic}</div>
        <div><strong>Estimasi Awal:</strong> ± ${totalDuration} Menit</div>
    `;
    document.getElementById('staffTicketModal').style.display = 'flex';
}