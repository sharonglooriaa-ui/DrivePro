let loggedStaff = null;
let selectedQueueId = null;
let woSpareparts = [];
let woPromoDiscount = 0;
let woPromoName = "";
let woGrandTotal = 0;

document.addEventListener("DOMContentLoaded", () => {
    loggedStaff = requireStaffAuth();
    if (!loggedStaff) return;

    const filter = document.getElementById("queueBranchFilter");
    if ([...filter.options].some((o) => o.value === loggedStaff.branch)) {
        filter.value = loggedStaff.branch;
    }

    renderQueueList();
});

function renderQueueList() {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const branchFilter = document.getElementById("queueBranchFilter").value;

    const activeQueues = queues.filter((q) => {
        if (q.status === "Selesai") return false;
        if (branchFilter === "ALL") return true;
        const cityKey = branchFilter.includes("Bandung") ? "Bandung" : branchFilter.includes("Jakarta") ? "Jakarta" : "Surabaya";
        return (q.branch || "").includes(cityKey);
    });

    const container = document.getElementById("queueListContainer");
    if (activeQueues.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:24px; color:#64748b;">Tidak ada antrean aktif pada cabang ini.</p>`;
        return;
    }

    container.innerHTML = activeQueues.map((q) => {
        const statusClass = q.status === "Sedang Dikerjakan" ? "st-work" : "st-wait";
        return `
            <div class="queue-row-card" onclick="openQueueDetailModal('${q.id}')">
                <div style="display:flex; align-items:center; gap:16px;">
                    <span class="q-code-badge">${q.queueCode}</span>
                    <div class="q-main-info">
                        <h4>${q.customerName} — ${q.carModel} (${q.plateNumber})</h4>
                        <p>Mesin: <strong>${q.engineType}</strong> • Jadwal: <strong>${q.date} (${q.startTime} - ${q.endTime})</strong></p>
                        <p style="margin-top:4px; color:#103c8c;">Layanan: ${(q.services || []).join(", ")}</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <span class="q-status-chip ${statusClass}">${q.status}</span>
                    <div style="margin-top:8px; font-size:12px; font-weight:700; color:#1d63dc;">Klik untuk Detail & Kasir →</div>
                </div>
            </div>
        `;
    }).join("");
}

function openQueueDetailModal(queueId) {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const q = queues.find((item) => item.id === queueId);
    if (!q) return;

    selectedQueueId = queueId;
    woSpareparts = [...(q.spareparts || [])];
    woPromoDiscount = q.promoDiscount || 0;
    woPromoName = q.promoName || "";

    document.getElementById("mdQueueCode").textContent = q.queueCode;
    document.getElementById("mdCustomerHeader").textContent = `Work Order — ${q.customerName}`;
    document.getElementById("mdVehicleDetails").innerHTML = `<strong>${q.carModel} (${q.plateNumber})</strong> • Mesin: <strong>${q.engineType}</strong> • HP: ${q.phone || "-"}`;
    document.getElementById("mdTimeDisplay").textContent = `${q.startTime} - ${q.endTime}`;
    document.getElementById("mdTechNotes").value = q.techNotes || "";

    const services = SERVICE_LIST[q.engineType] || [];
    document.getElementById("mdServiceChecklist").innerHTML = services.map((s) => `
        <label class="srv-check-box">
            <input type="checkbox" name="mdSrvItem" value="${s.name}" data-price="${s.price}" ${(q.services || []).includes(s.name) ? "checked" : ""} onchange="recalcWorkOrder()">
            <div><strong>${s.name}</strong><br><small style="color:#64748b;">Rp ${s.price.toLocaleString("id-ID")}</small></div>
        </label>
    `).join("");

    document.getElementById("mdEngineTypeLabel").textContent = q.engineType;
    const parts = SPAREPART_LIST[q.engineType] || [];
    document.getElementById("mdSparepartDropdown").innerHTML = parts.map((p) => `
        <option value="${p.id}" data-name="${p.name}" data-price="${p.price}">${p.name} — Rp ${p.price.toLocaleString("id-ID")}</option>
    `).join("");

    renderAddedParts();
    recalcWorkOrder();
    document.getElementById("queueDetailModal").style.display = "flex";
}

function shiftTimeString(timeStr, deltaMin) {
    const [h, m] = timeStr.split(":").map(Number);
    let total = Math.max(0, h * 60 + m + deltaMin);
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function adjustQueueSchedule(deltaMinutes) {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const idx = queues.findIndex((q) => q.id === selectedQueueId);
    if (idx === -1) return;

    queues[idx].startTime = shiftTimeString(queues[idx].startTime, deltaMinutes);
    queues[idx].endTime = shiftTimeString(queues[idx].endTime, deltaMinutes);
    localStorage.setItem("autocare_queues", JSON.stringify(queues));

    document.getElementById("mdTimeDisplay").textContent = `${queues[idx].startTime} - ${queues[idx].endTime}`;
    renderQueueList();
}

function deleteAndAdvanceQueue() {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const idx = queues.findIndex((q) => q.id === selectedQueueId);
    if (idx === -1) return;

    const target = queues[idx];
    if (!confirm(`Hapus antrean ${target.queueCode} (${target.customerName}) dan majukan jadwal antrean berikutnya?`)) return;

    const durationFreed = target.totalDuration || 60;
    for (let i = idx + 1; i < queues.length; i++) {
        if (queues[i].branch === target.branch && queues[i].date === target.date && queues[i].status !== "Selesai") {
            queues[i].startTime = shiftTimeString(queues[i].startTime, -durationFreed);
            queues[i].endTime = shiftTimeString(queues[i].endTime, -durationFreed);
        }
    }

    queues.splice(idx, 1);
    localStorage.setItem("autocare_queues", JSON.stringify(queues));
    closeModal("queueDetailModal");
    renderQueueList();
    alert(`Antrean ${target.queueCode} dihapus. Jadwal antrean berikutnya otomatis dimajukan!`);
}

function addPartItem() {
    const sel = document.getElementById("mdSparepartDropdown");
    const opt = sel.options[sel.selectedIndex];
    const qty = parseInt(document.getElementById("mdSparepartQty").value, 10) || 1;
    if (!opt) return;

    const existing = woSpareparts.find((p) => p.id === opt.value);
    if (existing) existing.qty += qty;
    else woSpareparts.push({ id: opt.value, name: opt.dataset.name, price: Number(opt.dataset.price), qty });

    renderAddedParts();
    recalcWorkOrder();
}

function removePartItem(idx) {
    woSpareparts.splice(idx, 1);
    renderAddedParts();
    recalcWorkOrder();
}

function renderAddedParts() {
    const ul = document.getElementById("mdAddedPartsList");
    ul.innerHTML = woSpareparts.length === 0
        ? `<li style="color:#64748b; justify-content:center;">Belum ada sparepart tambahan.</li>`
        : woSpareparts.map((p, idx) => `
            <li>
                <span><strong>${p.name}</strong> (${p.qty}x)</span>
                <div>
                    <strong style="margin-right:10px;">Rp ${(p.price * p.qty).toLocaleString("id-ID")}</strong>
                    <button type="button" class="btn-danger-soft" onclick="removePartItem(${idx})">✕</button>
                </div>
            </li>
        `).join("");
}

function recalcWorkOrder() {
    const checkedSrvs = [...document.querySelectorAll('input[name="mdSrvItem"]:checked')];
    const srvTotal = checkedSrvs.reduce((sum, el) => sum + Number(el.dataset.price), 0);
    const partTotal = woSpareparts.reduce((sum, p) => sum + p.price * p.qty, 0);
    const subtotal = srvTotal + partTotal;

    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const q = queues.find((item) => item.id === selectedQueueId);
    const members = JSON.parse(localStorage.getItem("autocare_members")) || [];
    const member = members.find((m) => m.phone === q.phone || m.name.toLowerCase() === q.customerName.toLowerCase());

    const promoCatalog = [
        {
            title: "Diskon 15% Member Setia",
            desc: "Minimal transaksi Rp 700.000 & sudah pernah transaksi sebelumnya.",
            eligible: Boolean(member && (member.transactions || []).length >= 1 && subtotal >= 700000),
            discountValue: Math.round(subtotal * 0.15)
        },
        {
            title: "Potongan Rp 50.000 (Tukar 1.000 Poin)",
            desc: "Khusus member dengan saldo minimal 1.000 poin & transaksi min. Rp 150.000.",
            eligible: Boolean(member && member.points >= 1000 && subtotal >= 150000),
            discountValue: 50000
        },
        {
            title: "Diskon 10% Servis Pertama Member Baru",
            desc: "Berlaku untuk member terdaftar yang belum memiliki riwayat transaksi.",
            eligible: Boolean(member && (member.transactions || []).length === 0 && subtotal >= 200000),
            discountValue: Math.round(subtotal * 0.10)
        }
    ];

    const activePromoObj = promoCatalog.find((p) => p.title === woPromoName);
    if (!activePromoObj || !activePromoObj.eligible) {
        woPromoName = "";
        woPromoDiscount = 0;
    } else {
        woPromoDiscount = activePromoObj.discountValue;
    }

    document.getElementById("mdPromoCardsContainer").innerHTML = (!member
        ? `<p class="hint-sm" style="margin-bottom:8px;">⚠️ Customer non-member (promo terkunci abu-abu).</p>`
        : `<p class="hint-sm" style="margin-bottom:8px; color:#103c8c;">✅ Member: <strong>${member.name}</strong> (${member.points} Poin • ${member.transactions.length} Transaksi)</p>`
    ) + promoCatalog.map((p) => `
        <div class="promo-state-card ${p.eligible ? "promo-unlocked" : "promo-locked"} ${woPromoName === p.title ? "selected" : ""}"
             ${p.eligible ? `onclick="toggleSelectPromo('${p.title}', ${p.discountValue})"` : ""}>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${p.title}</strong>
                <span style="font-size:11px; font-weight:800;">${p.eligible ? (woPromoName === p.title ? "✓ DIPAKAI" : "TERSEDIA (KLIK)") : "BELUM SYARAT"}</span>
            </div>
            <small style="display:block; margin-top:4px;">${p.desc}</small>
        </div>
    `).join("");

    woGrandTotal = Math.max(0, subtotal - woPromoDiscount);
    document.getElementById("sumServiceText").textContent = `Rp ${srvTotal.toLocaleString("id-ID")}`;
    document.getElementById("sumPartText").textContent = `Rp ${partTotal.toLocaleString("id-ID")}`;
    document.getElementById("sumDiscountText").textContent = `- Rp ${woPromoDiscount.toLocaleString("id-ID")}`;
    document.getElementById("sumGrandTotalText").textContent = `Rp ${woGrandTotal.toLocaleString("id-ID")}`;
}

function toggleSelectPromo(title, discountVal) {
    woPromoName = woPromoName === title ? "" : title;
    woPromoDiscount = woPromoName ? discountVal : 0;
    recalcWorkOrder();
}

function saveQueueChangesOnly() {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const idx = queues.findIndex((q) => q.id === selectedQueueId);
    if (idx === -1) return null;

    const checkedSrvs = [...document.querySelectorAll('input[name="mdSrvItem"]:checked')];
    const srvTotal = checkedSrvs.reduce((sum, el) => sum + Number(el.dataset.price), 0);
    const partTotal = woSpareparts.reduce((sum, p) => sum + p.price * p.qty, 0);

    queues[idx].services = checkedSrvs.map((el) => el.value);
    queues[idx].serviceTotal = srvTotal;
    queues[idx].spareparts = woSpareparts;
    queues[idx].partTotal = partTotal;
    queues[idx].techNotes = document.getElementById("mdTechNotes").value.trim();
    queues[idx].promoName = woPromoName;
    queues[idx].promoDiscount = woPromoDiscount;
    queues[idx].grandTotal = woGrandTotal;
    queues[idx].status = "Sedang Dikerjakan";
    queues[idx].handledByStaffId = loggedStaff.staffId;
    queues[idx].handledByStaffName = loggedStaff.name;

    localStorage.setItem("autocare_queues", JSON.stringify(queues));
    renderQueueList();
    alert("Perubahan servis & sparepart berhasil disimpan!");
    return queues[idx];
}

function proceedToCashier() {
    const updated = saveQueueChangesOnly();
    if (!updated) return;

    closeModal("queueDetailModal");
    document.getElementById("cashierPaymentFormArea").style.display = "block";
    document.getElementById("paidReceiptSuccessArea").style.display = "none";

    document.getElementById("cashierBillSummary").innerHTML = `
        <div style="display:flex; justify-content:space-between;"><span>No. Antrean:</span><strong>${updated.queueCode}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Customer:</span><strong>${updated.customerName}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Kendaraan:</span><strong>${updated.carModel} (${updated.plateNumber})</strong></div>
        <hr style="border:none; border-top:1px dashed #cbd5e1; margin:10px 0;">
        <div style="display:flex; justify-content:space-between; font-size:17px; color:#103c8c;">
            <span>Total Tagihan Fix:</span><strong>Rp ${updated.grandTotal.toLocaleString("id-ID")}</strong>
        </div>
    `;

    document.getElementById("cashReceivedInput").value = updated.grandTotal;
    document.getElementById("waReceiptPhoneInput").value = updated.phone !== "-" ? updated.phone : "";
    calculateChangeAmount();
    document.getElementById("cashierModal").style.display = "flex";
}

function toggleCashInput() {
    const method = document.getElementById("paymentMethodSelect").value;
    document.getElementById("cashReceivedGroup").style.display = method === "Tunai (Cash)" ? "flex" : "none";
}

function calculateChangeAmount() {
    const cash = Number(document.getElementById("cashReceivedInput").value) || 0;
    const change = cash - woGrandTotal;
    document.getElementById("cashChangeDisplay").textContent = change >= 0 ? `Kembalian: Rp ${change.toLocaleString("id-ID")}` : "Nominal uang tunai kurang!";
}

function confirmPaymentAndGenerateReceipt() {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const idx = queues.findIndex((q) => q.id === selectedQueueId);
    if (idx === -1) return;

    const method = document.getElementById("paymentMethodSelect").value;
    const waPhoneRaw = document.getElementById("waReceiptPhoneInput").value.trim();

    queues[idx].status = "Selesai";
    queues[idx].paymentMethod = method;
    queues[idx].paidAt = new Date().toLocaleString("id-ID");
    queues[idx].handledByStaffId = loggedStaff.staffId;
    queues[idx].handledByStaffName = loggedStaff.name;
    localStorage.setItem("autocare_queues", JSON.stringify(queues));

    const members = JSON.parse(localStorage.getItem("autocare_members")) || [];
    const mIdx = members.findIndex((m) => m.phone === queues[idx].phone || m.name.toLowerCase() === queues[idx].customerName.toLowerCase());
    if (mIdx !== -1) {
        if (queues[idx].promoName && queues[idx].promoName.includes("1.000 Poin")) {
            members[mIdx].points = Math.max(0, members[mIdx].points - 1000);
        }
        members[mIdx].points += Math.floor(queues[idx].grandTotal / 10000);
        members[mIdx].transactions.unshift({
            date: queues[idx].date,
            queueCode: queues[idx].queueCode,
            vehicle: `${queues[idx].carModel} (${queues[idx].plateNumber})`,
            services: queues[idx].services.join(", "),
            total: queues[idx].grandTotal,
            status: "Selesai"
        });
        localStorage.setItem("autocare_members", JSON.stringify(members));
    }

    const q = queues[idx];
    const partsText = (q.spareparts || []).map((p) => `- ${p.name} (${p.qty}x): Rp ${(p.price * p.qty).toLocaleString("id-ID")}`).join("\n") || "- Tidak ada";
    const waMessage = `*STRUK DIGITAL DRIVEPRO*\n_Your Car, Our Priority._\n\nNo. Antrean: *${q.queueCode}*\nCabang: ${q.branch}\nCustomer: ${q.customerName}\nMobil: ${q.carModel} (${q.plateNumber})\n\n*Jasa Servis:*\n${q.services.join(", ")} (Rp ${q.serviceTotal.toLocaleString("id-ID")})\n\n*Sparepart Diganti:*\n${partsText}\n\nPotongan Promo: -Rp ${(q.promoDiscount || 0).toLocaleString("id-ID")}\n*TOTAL LUNAS (${method}): Rp ${q.grandTotal.toLocaleString("id-ID")}*\n\nTerima kasih telah mempercayakan kendaraan Anda di DrivePro!`;

    const formattedPhone = waPhoneRaw.replace(/[^0-9]/g, "").replace(/^0/, "62");
    document.getElementById("sendWhatsappBtn").href = formattedPhone
        ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waMessage)}`
        : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

    document.getElementById("cashierPaymentFormArea").style.display = "none";
    document.getElementById("paidReceiptSuccessArea").style.display = "block";
    document.getElementById("finalReceiptPreview").innerHTML = `
        <div style="text-align:center; border-bottom:1px dashed #cbd5e1; padding-bottom:10px; margin-bottom:10px;">
            <strong style="font-size:16px; color:#07193d;">DrivePro — Struk Digital Lunas</strong><br>
            <small>${q.branch}</small>
        </div>
        <div><strong>Antrean:</strong> ${q.queueCode} • ${q.customerName}</div>
        <div><strong>Mobil:</strong> ${q.carModel} (${q.plateNumber})</div>
        <div><strong>Metode Bayar:</strong> ${method}</div>
        <hr style="border:none; border-top:1px dashed #cbd5e1; margin:8px 0;">
        <div><strong>Layanan:</strong> ${q.services.join(", ")}</div>
        <div><strong>Sparepart:</strong> ${(q.spareparts || []).map((p) => `${p.name} (${p.qty}x)`).join(", ") || "-"}</div>
        <div style="margin-top:8px; font-size:15px; font-weight:800; color:#103c8c;">TOTAL DIBAYAR: Rp ${q.grandTotal.toLocaleString("id-ID")}</div>
    `;

    renderQueueList();
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}