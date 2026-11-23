// js/service.js
let foundMember = null;
let selectedVehicleMode = "NEW";

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("bookingDate");
    if (dateInput) {
        dateInput.value = today;
        dateInput.min = today;
    }

    handleEngineTypeChange("Bensin");

    // Cek apakah ada member yang sedang login dari halaman member.html
    const activeSession = JSON.parse(localStorage.getItem("autocare_logged_member"));
    if (activeSession) {
        document.querySelector('input[name="customerType"][value="member"]').checked = true;
        toggleCustomerType("member");
        document.getElementById("memberIdentifier").value = activeSession.phone;
        lookupMember();
    }

    const form = document.getElementById("serviceBookingForm");
    if (form) {
        form.addEventListener("submit", handleBookingSubmit);
    }
});

function toggleCustomerType(type) {
    const memberSection = document.getElementById("memberLookupSection");
    const guestFields = document.getElementById("guestIdentityFields");

    if (type === "member") {
        memberSection.style.display = "block";
        guestFields.style.display = "none";
    } else {
        foundMember = null;
        selectedVehicleMode = "NEW";
        memberSection.style.display = "none";
        guestFields.style.display = "grid";
        document.getElementById("memberFoundBox").style.display = "none";
    }
}

function lookupMember() {
    const query = document.getElementById("memberIdentifier").value.trim().toLowerCase();
    if (!query) {
        alert("Silakan masukkan No. HP atau Email member.");
        return;
    }

    const members = JSON.parse(localStorage.getItem("autocare_members")) || [];
    const match = members.find(
        (m) => m.phone.toLowerCase() === query || m.email.toLowerCase() === query
    );

    if (!match) {
        alert("Data member tidak ditemukan. Silakan daftar di menu MEMBER atau pilih Non-Member.");
        return;
    }

    foundMember = match;
    const foundBox = document.getElementById("memberFoundBox");
    foundBox.style.display = "block";
    document.getElementById("memberWelcomeText").textContent =
        `Halo, ${match.name} (${match.city}) • Poin Anda: ${match.points} Poin`;

    renderSavedVehicles(match.vehicles || []);
}

function renderSavedVehicles(vehicles) {
    const container = document.getElementById("savedVehiclesList");
    let html = vehicles.map((v) => `
        <div class="saved-vehicle-item" id="veh-card-${v.id}" onclick="selectMemberVehicle('${v.id}')">
            <input type="radio" name="savedVehRadio" value="${v.id}">
            <div>
                <strong>${v.brand} ${v.model}</strong><br>
                <small>${v.plateNumber} • Mesin ${v.engineType}</small>
            </div>
        </div>
    `).join("");

    html += `
        <div class="saved-vehicle-item selected" id="veh-card-NEW" onclick="selectMemberVehicle('NEW')">
            <input type="radio" name="savedVehRadio" value="NEW" checked>
            <div>
                <strong>+ Isi Info Kendaraan Baru</strong><br>
                <small>Otomatis tersimpan ke akun Anda</small>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function selectMemberVehicle(vehId) {
    selectedVehicleMode = vehId;
    document.querySelectorAll(".saved-vehicle-item").forEach((el) => el.classList.remove("selected"));
    const activeCard = document.getElementById(`veh-card-${vehId}`);
    if (activeCard) {
        activeCard.classList.add("selected");
        activeCard.querySelector("input").checked = true;
    }

    if (vehId === "NEW") {
        document.getElementById("plateNumber").value = "";
        handleEngineTypeChange("Bensin");
        return;
    }

    if (foundMember) {
        const veh = foundMember.vehicles.find((v) => v.id === vehId);
        if (veh) {
            document.getElementById("engineType").value = veh.engineType;
            handleEngineTypeChange(veh.engineType);
            document.getElementById("vehicleBrand").value = veh.brand;
            handleBrandChange(veh.brand);
            document.getElementById("vehicleModel").value = veh.model;
            document.getElementById("plateNumber").value = veh.plateNumber;
        }
    }
}

function handleEngineTypeChange(engineType) {
    const brandSelect = document.getElementById("vehicleBrand");
    const modelSelect = document.getElementById("vehicleModel");

    brandSelect.innerHTML = '<option value="">-- Pilih Merk --</option>';
    modelSelect.innerHTML = '<option value="">-- Pilih Model Kendaraan --</option>';

    const brands = Object.keys(VEHICLE_CATALOG[engineType] || {});
    brands.forEach((brand) => {
        const opt = document.createElement("option");
        opt.value = brand;
        opt.textContent = brand;
        brandSelect.appendChild(opt);
    });

    renderServiceChecklist(engineType);
}

function handleBrandChange(brand) {
    const engineType = document.getElementById("engineType").value;
    const modelSelect = document.getElementById("vehicleModel");
    modelSelect.innerHTML = '<option value="">-- Pilih Model Kendaraan --</option>';

    const models = (VEHICLE_CATALOG[engineType] && VEHICLE_CATALOG[engineType][brand]) || [];
    models.forEach((model) => {
        const opt = document.createElement("option");
        opt.value = model;
        opt.textContent = model;
        modelSelect.appendChild(opt);
    });
}

function renderServiceChecklist(engineType) {
    const container = document.getElementById("serviceChecklistContainer");
    const services = SERVICE_LIST[engineType] || [];

    container.innerHTML = services.map((srv) => {
        const isOther = srv.id.includes("lainnya");
        return `
            <label class="service-item-card">
                <input type="checkbox" name="selectedServices" value="${srv.name}" 
                       data-price="${srv.price}" data-duration="${srv.duration}"
                       ${isOther ? 'onchange="toggleOtherServiceInput(this)"' : ''}>
                <div class="service-info">
                    <span class="service-name">${srv.name}</span>
                    <span class="service-meta">Estimasi: ${srv.duration} menit • Rp ${srv.price.toLocaleString("id-ID")}</span>
                </div>
            </label>
        `;
    }).join("") + `
        <div id="otherServiceDetailBox" style="display: none; grid-column: 1 / -1; margin-top: 4px;">
            <input type="text" id="otherServiceCustomText" placeholder="Tuliskan detail perbaikan lainnya yang dibutuhkan (misal: ganti kaca spion, cek bunyi mesin, dll)..." style="width: 100%;">
        </div>
    `;
}

function toggleOtherServiceInput(checkbox) {
    const detailBox = document.getElementById("otherServiceDetailBox");
    if (detailBox) {
        detailBox.style.display = checkbox.checked ? "block" : "none";
    }
}

// function handleBookingSubmit(e) {
//     e.preventDefault();

//     const customerType = document.querySelector('input[name="customerType"]:checked').value;
//     let customerName = "";

//     if (customerType === "member") {
//         if (!foundMember) {
//             alert("Silakan cari dan pilih data Member Anda terlebih dahulu.");
//             return;
//         }
//         customerName = foundMember.name;
//     } else {
//         customerName = document.getElementById("guestName").value.trim();
//         const phone = document.getElementById("guestPhone").value.trim();
//         const email = document.getElementById("guestEmail").value.trim();
//         const city = document.getElementById("guestCity").value.trim();

//         if (!customerName || !phone || !email || !city) {
//             alert("Harap lengkapi Nama, No. HP, Email, dan Kota Anda.");
//             return;
//         }
//     }

//     const checkedServices = document.querySelectorAll('input[name="selectedServices"]:checked');
//     if (checkedServices.length === 0) {
//         alert("Pilih minimal 1 jenis layanan/perbaikan.");
//         return;
//     }

//     let totalPrice = 0;
//     let totalDuration = 0;
//     const serviceNames = [];

//     checkedServices.forEach((cb) => {
//         totalPrice += Number(cb.dataset.price);
//         totalDuration += Number(cb.dataset.duration);
//         serviceNames.push(cb.value);
//     });

//     const engineType = document.getElementById("engineType").value;
//     const brand = document.getElementById("vehicleBrand").value;
//     const model = document.getElementById("vehicleModel").value;
//     const plateNumber = document.getElementById("plateNumber").value.trim().toUpperCase();
//     const bookingTime = document.getElementById("bookingTime").value;
//     const bookingDate = document.getElementById("bookingDate").value;

//     // Jika member memilih isi kendaraan baru, simpan otomatis ke daftar kendaraannya
//     if (customerType === "member" && foundMember && selectedVehicleMode === "NEW") {
//         const members = JSON.parse(localStorage.getItem("autocare_members")) || [];
//         const idx = members.findIndex((m) => m.id === foundMember.id);
//         if (idx !== -1) {
//             members[idx].vehicles.push({
//                 id: "VEH-" + Date.now(),
//                 brand,
//                 engineType,
//                 model,
//                 plateNumber
//             });
//             localStorage.setItem("autocare_members", JSON.stringify(members));
//         }
//     }

//     // Generate Kode Antrean baru & simpan ke antrean real-time
//     const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
//     const nextNumber = String(queues.length + 1).padStart(3, "0");
//     const queueCode = `A-${nextNumber}`;

//     queues.push({
//         queueCode,
//         customerName,
//         vehicle: `${brand} ${model} (${engineType})`,
//         plateNumber,
//         bay: "Menunggu Alokasi Bay",
//         status: "Menunggu Giliran",
//         bookingTime,
//         estDuration: totalDuration
//     });
//     localStorage.setItem("autocare_queues", JSON.stringify(queues));

//     // Tampilkan Tiket & Rules
//     document.getElementById("serviceBookingForm").style.display = "none";
//     const resultSection = document.getElementById("bookingResultSection");
//     resultSection.style.display = "block";

//     document.getElementById("resultQueueCode").textContent = queueCode;
//     document.getElementById("resultCustomerSummary").textContent =
//         `${customerName} • ${brand} ${model} (${plateNumber}) • Jadwal: ${bookingDate} pukul ${bookingTime} WIB`;
//     document.getElementById("resultEstPrice").textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
//     document.getElementById("resultEstDuration").textContent = `${totalDuration} Menit`;

//     resultSection.scrollIntoView({ behavior: "smooth" });
// }

function handleBookingSubmit(e) {
    e.preventDefault();

    const customerType = document.querySelector('input[name="customerType"]:checked').value;
    let customerName = "";
    let customerPhone = "";
    let customerEmail = "";

    if (customerType === "member") {
        if (!foundMember) {
            alert("Silakan cari dan pilih data Member Anda terlebih dahulu.");
            return;
        }
        customerName = foundMember.name;
        customerPhone = foundMember.phone;
        customerEmail = foundMember.email;
    } else {
        customerName = document.getElementById("guestName").value.trim();
        customerPhone = document.getElementById("guestPhone").value.trim();
        customerEmail = document.getElementById("guestEmail").value.trim();
        const city = document.getElementById("guestCity").value.trim();

        if (!customerName || !customerPhone || !customerEmail || !city) {
            alert("Harap lengkapi Nama, No. HP, Email, dan Kota Anda.");
            return;
        }
    }

    const branch = document.getElementById("workshopBranch").value;
    if (!branch) {
        alert("Silakan pilih cabang bengkel tujuan terlebih dahulu.");
        return;
    }

    const checkedServices = document.querySelectorAll('input[name="selectedServices"]:checked');
    if (checkedServices.length === 0) {
        alert("Pilih minimal 1 jenis layanan/perbaikan.");
        return;
    }

    let totalPrice = 0;
    let totalDuration = 0;
    const serviceNames = [];

    checkedServices.forEach((cb) => {
        totalPrice += Number(cb.dataset.price);
        totalDuration += Number(cb.dataset.duration);
        serviceNames.push(cb.value);
    });

    const engineType = document.getElementById("engineType").value;
    const brand = document.getElementById("vehicleBrand").value;
    const model = document.getElementById("vehicleModel").value;
    const plateNumber = document.getElementById("plateNumber").value.trim().toUpperCase();
    const bookingTime = document.getElementById("bookingTime").value;
    const bookingDate = document.getElementById("bookingDate").value;

    // Simpan kendaraan baru jika user adalah Member & memilih tambah kendaraan baru
    if (customerType === "member" && foundMember && selectedVehicleMode === "NEW") {
        const members = JSON.parse(localStorage.getItem("autocare_members")) || [];
        const idx = members.findIndex((m) => m.id === foundMember.id);
        if (idx !== -1) {
            members[idx].vehicles.push({
                id: "VEH-" + Date.now(),
                brand,
                engineType,
                model,
                plateNumber
            });
            localStorage.setItem("autocare_members", JSON.stringify(members));
        }
    }

    // Generate Kode Antrean sesuai prefix cabang (A = Bandung, J = Jakarta, S = Surabaya)
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    let prefix = "A";
    if (branch.includes("Jakarta")) prefix = "J";
    if (branch.includes("Surabaya")) prefix = "S";

    const branchQueueCount = queues.filter((q) => q.branch === branch).length + 1;
    const queueCode = `${prefix}-${String(branchQueueCount).padStart(3, "0")}`;

    // Simpan langsung ke localStorage agar langsung muncul di halaman Cek Antrean
    queues.push({
        queueCode,
        branch,
        bay: "Menunggu Alokasi Bay",
        status: "Menunggu Giliran",
        bookingTime,
        estDuration: totalDuration
    });
    localStorage.setItem("autocare_queues", JSON.stringify(queues));

    // Format nomor WA ke awalan 62
    let waNumber = customerPhone.replace(/[^0-9]/g, "");
    if (waNumber.startsWith("0")) {
        waNumber = "62" + waNumber.slice(1);
    }

    const ticketMessage =
        `Halo ${customerName},\n` +
        `Booking servis Anda di *${branch}* telah terdaftar!\n\n` +
        `• *Nomor Antrean:* ${queueCode}\n` +
        `• *Kendaraan:* ${brand} ${model} (${plateNumber})\n` +
        `• *Jadwal:* ${bookingDate} pukul ${bookingTime} WIB\n` +
        `• *Layanan:* ${serviceNames.join(", ")}\n` +
        `• *Estimasi Biaya:* Rp ${totalPrice.toLocaleString("id-ID")} (±${totalDuration} menit)\n\n` +
        `Harap membawa STNK asli & datang 30 menit lebih awal. Toleransi keterlambatan 5 menit saat dipanggil.`;

    // Tampilkan Tiket & Link Pengiriman ke WA & Email
    document.getElementById("serviceBookingForm").style.display = "none";
    const resultSection = document.getElementById("bookingResultSection");
    resultSection.style.display = "block";

    document.getElementById("resultQueueCode").textContent = queueCode;
    document.getElementById("resultCustomerSummary").textContent =
        `${customerName} • ${branch} • ${brand} ${model} (${plateNumber}) • ${bookingDate} (${bookingTime} WIB)`;
    document.getElementById("dispatchStatusText").textContent =
        `✓ Nomor antrean ${queueCode} telah dicatat & siap dikirim ke ${customerPhone} / ${customerEmail}`;

    document.getElementById("btnSendWhatsapp").href =
        `https://wa.me/${waNumber}?text=${encodeURIComponent(ticketMessage)}`;
    document.getElementById("btnSendEmail").href =
        `mailto:${customerEmail}?subject=${encodeURIComponent("Tiket Antrean Servis AutoCare Mitra - " + queueCode)}&body=${encodeURIComponent(ticketMessage)}`;

    document.getElementById("resultEstPrice").textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
    document.getElementById("resultEstDuration").textContent = `${totalDuration} Menit`;

    resultSection.scrollIntoView({ behavior: "smooth" });
}

function resetBookingForm() {
    document.getElementById("serviceBookingForm").reset();
    document.getElementById("serviceBookingForm").style.display = "block";
    document.getElementById("bookingResultSection").style.display = "none";
    toggleCustomerType("non-member");
    handleEngineTypeChange("Bensin");
}

// tambahan
// Generator Nomor Antrean Harian (Reset Otomatis ke 001 Saat Berganti Tanggal)
function generateDailyQueueNumber(branchKey) {
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const prefixMap = { bandung: 'A', jakarta: 'J', surabaya: 'S' };
    const prefix = prefixMap[branchKey] || 'A';

    const trackerRaw = localStorage.getItem('drivepro_daily_queue_tracker');
    let tracker = trackerRaw ? JSON.parse(trackerRaw) : { date: todayStr, counts: {} };

    // Jika tanggal hari ini berbeda dari tanggal terakhir tersimpan, reset hitungan ke 0
    if (tracker.date !== todayStr) {
        tracker = { date: todayStr, counts: {} };
    }

    const nextNum = (tracker.counts[branchKey] || 0) + 1;
    tracker.counts[branchKey] = nextNum;
    localStorage.setItem('drivepro_daily_queue_tracker', JSON.stringify(tracker));

    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

function submitServiceBooking(event) {
    event.preventDefault();

    const branchKey = (document.getElementById('bookingBranch')?.value || 'bandung').toLowerCase();
    const branchLabelMap = {
        bandung: 'DrivePro Bandung',
        jakarta: 'DrivePro Jakarta',
        surabaya: 'DrivePro Surabaya'
    };

    const customerName = document.getElementById('custName')?.value.trim() || 'Pelanggan DrivePro';
    const customerPhone = document.getElementById('custPhone')?.value.trim() || '08123456789';
    const carModel = document.getElementById('carModel')?.value.trim() || 'Kendaraan Pelanggan';
    const plateNumber = document.getElementById('plateNumber')?.value.trim().toUpperCase() || 'D 1234 ABC';
    const servicePackage = document.getElementById('serviceType')?.value || 'Servis Berkala';
    const serviceDate = document.getElementById('bookingDate')?.value || new Date().toISOString().slice(0, 10);
    const serviceTime = document.getElementById('bookingTime')?.value || '10:00 WIB';

    const queueNumber = generateDailyQueueNumber(branchKey);
    const compactDate = serviceDate.replace(/-/g, '');
    const bookingId = `BK-${compactDate}-${queueNumber.split('-')[1]}`;

    const newBookingRecord = {
        bookingId,
        ticket: queueNumber,
        branch: branchKey,
        branchName: branchLabelMap[branchKey] || 'DrivePro Bandung',
        name: customerName,
        phone: customerPhone,
        car: `${carModel} (${plateNumber})`,
        service: servicePackage,
        date: serviceDate,
        time: serviceTime,
        status: 'called',
        createdAt: new Date().toISOString()
    };

    // Simpan ke daftar booking aktif (mendukung > 1 kendaraan untuk No. HP yang sama)
    const existingList = JSON.parse(localStorage.getItem('drivepro_bookings_list') || '[]');
    existingList.push(newBookingRecord);
    localStorage.setItem('drivepro_bookings_list', JSON.stringify(existingList));

    // Isi Modal Bukti Booking
    document.getElementById('recQueueNumber').textContent = queueNumber;
    document.getElementById('recBookingCode').textContent = bookingId;
    document.getElementById('recSummaryDetails').innerHTML = `
        <div><strong>Cabang:</strong> ${newBookingRecord.branchName}</div>
        <div><strong>Tanggal &amp; Waktu:</strong> ${serviceDate} • ${serviceTime}</div>
        <div><strong>Kendaraan:</strong> ${newBookingRecord.car}</div>
        <div><strong>Layanan:</strong> ${servicePackage}</div>
        <div><strong>No. HP:</strong> ${customerPhone}</div>
    `;

    // Format Pesan WhatsApp Otomatis
    const waPhone = customerPhone.replace(/^0/, '62').replace(/\D/g, '');
    const waText = encodeURIComponent(
        `Halo ${customerName}, reservasi servis Anda di *${newBookingRecord.branchName}* berhasil tercatat:\n\n` +
        `• *No. Booking:* ${bookingId}\n` +
        `• *No. Antrean:* ${queueNumber}\n` +
        `• *Tanggal:* ${serviceDate}\n` +
        `• *Waktu:* ${serviceTime}\n` +
        `• *Kendaraan:* ${newBookingRecord.car}\n` +
        `• *Layanan:* ${servicePackage}\n\n` +
        `Gunakan *No. HP* atau *No. Booking* di atas pada halaman *Cek Antrean* untuk memantau panggilan bay.`
    );
    const waUrl = `https://wa.me/${waPhone}?text=${waText}`;
    document.getElementById('btnSendWhatsApp').href = waUrl;

    document.getElementById('bookingReceiptModal').style.display = 'flex';
    window.open(waUrl, '_blank');
}

function copyBookingCode() {
    const code = document.getElementById('recBookingCode').textContent.trim();
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('btnCopyBookingCode');
        btn.textContent = 'Tersalin!';
        setTimeout(() => { btn.textContent = 'Copy No. Booking'; }, 2000);
    });
}

function closeBookingReceiptModal() {
    document.getElementById('bookingReceiptModal').style.display = 'none';
}

// =========================================================
// TAMBAHAN: NO. ANTREAN HARIAN (RESET BESOK), NO. BOOKING + COPY & WA
// =========================================================
function generateDailyQueueNumber(branchText) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let branchKey = 'bandung';
    let prefix = 'A';
    const lower = (branchText || '').toLowerCase();
    if (lower.includes('jakarta')) { branchKey = 'jakarta'; prefix = 'J'; }
    else if (lower.includes('surabaya')) { branchKey = 'surabaya'; prefix = 'S'; }

    const raw = localStorage.getItem('drivepro_daily_queue_tracker');
    let tracker = raw ? JSON.parse(raw) : { date: todayStr, counts: {} };

    // Reset otomatis ke 001 saat berganti hari
    if (tracker.date !== todayStr) {
        tracker = { date: todayStr, counts: {} };
    }

    const nextNum = (tracker.counts[branchKey] || 0) + 1;
    tracker.counts[branchKey] = nextNum;
    localStorage.setItem('drivepro_daily_queue_tracker', JSON.stringify(tracker));

    return {
        branchKey,
        queueNumber: `${prefix}-${String(nextNum).padStart(3, '0')}`,
        numPart: String(nextNum).padStart(3, '0')
    };
}

function copyBookingCode() {
    const codeEl = document.getElementById('resultBookingCode');
    const btn = document.getElementById('btnCopyBookingCode');
    if (!codeEl || !btn) return;

    const code = codeEl.textContent.trim();
    const onCopied = () => {
        btn.textContent = '✓ Tersalin!';
        btn.style.background = '#16a34a';
        setTimeout(() => {
            btn.textContent = '📋 Copy No. Booking';
            btn.style.background = '#1852b8';
        }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(onCopied);
    } else {
        const temp = document.createElement('input');
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        onCopied();
    }
}

// Jalankan otomatis setelah form #serviceBookingForm disubmit
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('serviceBookingForm');
    if (!form) return;

    form.addEventListener('submit', () => {
        setTimeout(() => {
            const branchSelect = document.getElementById('workshopBranch');
            const branchText = branchSelect ? branchSelect.value : 'DrivePro Bandung';
            const { branchKey, queueNumber, numPart } = generateDailyQueueNumber(branchText);

            const bookingDate = document.getElementById('bookingDate')?.value || new Date().toISOString().slice(0, 10);
            const bookingTime = document.getElementById('bookingTime')?.value || '08:30';
            const compactDate = bookingDate.replace(/-/g, '');
            const bookingId = `BK-${compactDate}-${numPart}`;

            const custType = document.querySelector('input[name="customerType"]:checked')?.value || 'non-member';
            const custName = custType === 'member'
                ? (document.getElementById('memberWelcomeText')?.textContent.replace('Halo,', '').trim() || 'Member DrivePro')
                : (document.getElementById('guestName')?.value.trim() || 'Pelanggan DrivePro');
            const custPhone = custType === 'member'
                ? (document.getElementById('memberIdentifier')?.value.trim() || '081234567890')
                : (document.getElementById('guestPhone')?.value.trim() || '08123456789');

            const brand = document.getElementById('vehicleBrand')?.value || '';
            const model = document.getElementById('vehicleModel')?.value || 'Kendaraan';
            const plate = (document.getElementById('plateNumber')?.value || '').toUpperCase();
            const carLabel = `${brand} ${model} (${plate})`.trim();

            const checkedServices = Array.from(document.querySelectorAll('#serviceChecklistContainer input[type="checkbox"]:checked'))
                .map(cb => cb.parentElement?.textContent.trim() || cb.value);
            const serviceLabel = checkedServices.length > 0 ? checkedServices.join(', ') : 'Servis Berkala';

            // Update tampilan No. Antrean & No. Booking di #bookingResultSection
            const qCodeEl = document.getElementById('resultQueueCode');
            const bCodeEl = document.getElementById('resultBookingCode');
            if (qCodeEl) qCodeEl.textContent = queueNumber;
            if (bCodeEl) bCodeEl.textContent = bookingId;

            // Simpan ke localStorage agar otomatis terbaca di halaman Cek Antrean
            const bookings = JSON.parse(localStorage.getItem('drivepro_bookings_list') || '[]');
            bookings.push({
                bookingId,
                ticket: queueNumber,
                branch: branchKey,
                branchName: branchText,
                name: custName,
                phone: custPhone,
                car: carLabel,
                service: serviceLabel,
                date: bookingDate,
                time: `${bookingTime} WIB`,
                status: 'called',
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('drivepro_bookings_list', JSON.stringify(bookings));

            // Perbarui link WhatsApp agar membawa Tanggal, Waktu, No. Antrean, dan No. Booking
            const waBtn = document.getElementById('btnSendWhatsapp');
            if (waBtn) {
                const waPhone = custPhone.replace(/^0/, '62').replace(/\D/g, '');
                const waText =
                    `Halo *${custName}*, berikut detail booking servis Anda di *${branchText}*:\n\n` +
                    `• *No. Booking:* ${bookingId}\n` +
                    `• *No. Antrean:* ${queueNumber}\n` +
                    `• *Tanggal:* ${bookingDate}\n` +
                    `• *Waktu:* ${bookingTime} WIB\n` +
                    `• *Kendaraan:* ${carLabel}\n` +
                    `• *Layanan:* ${serviceLabel}\n\n` +
                    `Gunakan *No. Booking (${bookingId})* atau *No. HP* Anda di halaman *Cek Antrean* untuk memantau panggilan bay secara live.`;

                waBtn.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;
            }
        }, 50);
    });
});

// =========================================================
// AUTO-PREFILL KENDARAAN DARI KLIK "BOOK" DI HALAMAN MEMBER
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const rawQuickBook = sessionStorage.getItem("drivepro_quick_book_member");
    if (!rawQuickBook) return;

    sessionStorage.removeItem("drivepro_quick_book_member");

    try {
        const payload = JSON.parse(rawQuickBook);
        const targetModel = (payload.vehicle?.model || "").toLowerCase();
        const targetPlate = (payload.vehicle?.plate || "").toUpperCase();
        const targetFuel = (payload.vehicle?.fuel || "").toLowerCase();

        // 1. Aktifkan radio Member & isi No. HP
        const memberRadio = document.querySelector('input[name="customerType"][value="member"]');
        if (memberRadio) {
            memberRadio.checked = true;
            toggleCustomerType("member");
        }

        const idInput = document.getElementById("memberIdentifier");
        if (idInput) {
            idInput.value = payload.phone || payload.email || "081234567890";
        }

        // 2. Jalankan lookupMember() agar kartu kendaraan ter-render
        lookupMember();

        // 3. Pilih kartu mobil yang sesuai menggunakan selectMemberVehicle(v.id)
        if (foundMember && Array.isArray(foundMember.vehicles)) {
            const matchedVeh = foundMember.vehicles.find(v => {
                const fullName = `${v.brand} ${v.model}`.toLowerCase();
                return (
                    (targetModel && (fullName.includes(targetModel) || targetModel.includes(v.model.toLowerCase()))) ||
                    (targetPlate && v.plateNumber.toUpperCase() === targetPlate)
                );
            });

            if (matchedVeh) {
                selectMemberVehicle(matchedVeh.id);
                return;
            }
        }

        // Fallback jika data kendaraan belum ada di autocare_members localStorage
        const engineType = (targetFuel.includes("electric") || targetFuel.includes("listrik") || targetModel.includes("ioniq"))
            ? "Listrik"
            : (targetFuel.includes("hybrid") ? "Hybrid" : "Bensin");

        document.getElementById("engineType").value = engineType;
        handleEngineTypeChange(engineType);

        const brandWord = (payload.vehicle?.model || "").split(" ")[0];
        const brandSelect = document.getElementById("vehicleBrand");
        const matchedBrand = Array.from(brandSelect.options).find(o => o.value.toLowerCase() === brandWord.toLowerCase());
        if (matchedBrand) {
            brandSelect.value = matchedBrand.value;
            handleBrandChange(matchedBrand.value);
        }

        const modelSelect = document.getElementById("vehicleModel");
        const matchedModel = Array.from(modelSelect.options).find(o =>
            o.value && (targetModel.includes(o.value.toLowerCase()) || o.value.toLowerCase().includes(targetModel))
        );
        if (matchedModel) {
            modelSelect.value = matchedModel.value;
        }

        if (targetPlate) {
            document.getElementById("plateNumber").value = targetPlate;
        }
    } catch (err) {}
});