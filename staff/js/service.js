let loggedStaff = null;

document.addEventListener("DOMContentLoaded", () => {
    loggedStaff = requireStaffAuth();
    if (!loggedStaff) return;

    document.getElementById("wiBranch").value = loggedStaff.branch;
    document.getElementById("wiDate").value = new Date().toISOString().split("T")[0];
    renderWalkInChecklist();

    document.getElementById("walkInBookingForm").addEventListener("submit", handleWalkInSubmit);
});

function renderWalkInChecklist() {
    const engine = document.getElementById("wiEngineType").value;
    const services = SERVICE_LIST[engine] || [];
    document.getElementById("wiChecklistContainer").innerHTML = services.map((s) => `
        <label class="srv-check-box">
            <input type="checkbox" name="wiServiceItem" value="${s.name}" data-price="${s.price}" data-duration="${s.duration}">
            <div>
                <strong>${s.name}</strong><br>
                <small style="color:#64748b;">Rp ${s.price.toLocaleString("id-ID")} • ${s.duration} menit</small>
            </div>
        </label>
    `).join("");
}

function addMinutesToTime(timeStr, deltaMin) {
    const [h, m] = timeStr.split(":").map(Number);
    let total = Math.max(0, h * 60 + m + deltaMin);
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function handleWalkInSubmit(e) {
    e.preventDefault();
    const checked = [...document.querySelectorAll('input[name="wiServiceItem"]:checked')];
    if (checked.length === 0) {
        alert("Pilih minimal 1 jenis layanan servis!");
        return;
    }

    const branch = document.getElementById("wiBranch").value;
    const prefix = branch.includes("Bandung") ? "BDG" : branch.includes("Jakarta") ? "JKT" : "SBY";
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const nextNo = String(queues.filter((q) => (q.branch || "").includes(prefix === "BDG" ? "Bandung" : prefix === "JKT" ? "Jakarta" : "Surabaya")).length + 1).padStart(3, "0");

    const services = checked.map((c) => c.value);
    const serviceTotal = checked.reduce((sum, c) => sum + Number(c.dataset.price), 0);
    const totalDuration = checked.reduce((sum, c) => sum + Number(c.dataset.duration), 0);
    const startTime = document.getElementById("wiTime").value;
    const endTime = addMinutesToTime(startTime, totalDuration);

    const newEntry = {
        id: "Q-" + Date.now(),
        queueCode: `${prefix}-${nextNo}`,
        bookingSource: "Walk-In (Input Staff)",
        branch,
        customerName: document.getElementById("wiCustomerName").value.trim(),
        phone: document.getElementById("wiPhone").value.trim() || "-",
        engineType: document.getElementById("wiEngineType").value,
        carModel: document.getElementById("wiCarModel").value.trim(),
        plateNumber: document.getElementById("wiPlate").value.trim().toUpperCase(),
        date: document.getElementById("wiDate").value,
        startTime,
        endTime,
        totalDuration,
        services,
        serviceTotal,
        spareparts: [],
        status: "Menunggu",
        handledByStaffId: loggedStaff.staffId,
        handledByStaffName: loggedStaff.name
    };

    queues.push(newEntry);
    localStorage.setItem("autocare_queues", JSON.stringify(queues));
    alert(`Antrean ${newEntry.queueCode} berhasil dibuat!`);
    window.location.href = "antrean.html";
}