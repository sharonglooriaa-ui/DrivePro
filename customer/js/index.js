// js/index.js
const MAINTENANCE_DATA = {
    "10000": {
        title: "Servis Ringan — Kelipatan 10.000 KM / 6 Bulan",
        desc: "Fokus pada pelumasan mesin dan pengecekan keselamatan dasar agar mobil tetap responsif untuk pemakaian harian.",
        estTime: "± 45 - 60 Menit",
        items: [
            { name: "Penggantian Oli Mesin & Filter Oli", note: "Mencegah keausan komponen internal mesin." },
            { name: "Pembersihan Filter Udara & Kabin", note: "Menjaga suplai udara bersih ke ruang bakar dan AC." },
            { name: "Inspeksi Sistem Pengereman", note: "Pengecekan ketebalan kampas rem depan & belakang." },
            { name: "Pengecekan Aki, Lampu & Tekanan Ban", note: "Memastikan kelistrikan dan kaki-kaki dalam kondisi aman." }
        ]
    },
    "20000": {
        title: "Servis Menengah — Kelipatan 20.000 KM / 12 Bulan",
        desc: "Mencakup seluruh item servis 10.000 KM ditambah pembersihan sistem pembakaran dan penyelarasan roda.",
        estTime: "± 90 - 120 Menit",
        items: [
            { name: "Tune Up & Pembersihan Throttle Body", note: "Mengembalikan tarikan mesin dan efisiensi BBM." },
            { name: "Spooring, Balancing & Rotasi Ban", note: "Mencegah keausan ban tidak merata dan menjaga stabilitas setir." },
            { name: "Pengecekan Busi & Sistem Pengapian", note: "Memastikan pembakaran sempurna tanpa brebet." },
            { name: "Perawatan Sistem Pendingin AC", note: "Cek tekanan freon dan kebersihan kondensor." }
        ]
    },
    "40000": {
        title: "Servis Besar — Kelipatan 40.000 KM / 24 Bulan",
        desc: "Penggantian seluruh fluida vital kendaraan untuk menjaga keawetan transmisi, rem, dan sistem pendingin mesin.",
        estTime: "± 2,5 - 3 Jam",
        items: [
            { name: "Kuras & Ganti Oli Transmisi (Matic/Manual)", note: "Menjaga perpindahan gigi tetap halus." },
            { name: "Kuras Minyak Rem & Air Radiator (Coolant)", note: "Mencegah overheat dan menjaga daya cengkeram rem." },
            { name: "Penggantian Filter Bahan Bakar & Busi", note: "Optimalisasi aliran bahan bakar." },
            { name: "Inspeksi Kaki-Kaki & Suspensi Lengkap", note: "Cek shockbreaker, tie rod, dan ball joint." }
        ]
    },
    "ev": {
        title: "Perawatan Berkala Hybrid & Mobil Listrik (EV)",
        desc: "Perawatan khusus kendaraan elektrifikasi yang berfokus pada kesehatan baterai tegangan tinggi, sistem pendingin baterai, dan pengereman regeneratif.",
        estTime: "± 60 - 90 Menit",
        items: [
            { name: "Battery State of Health (SoH) Scan", note: "Pemindaian keseimbangan sel baterai dan suhu modul." },
            { name: "Pengecekan Sistem Pendingin Baterai & Inverter", note: "Memastikan thermal management baterai bekerja optimal." },
            { name: "Servis Kaliper Rem Regeneratif", note: "Pembersihan dan pelumasan pin kaliper agar tidak macet." },
            { name: "Update Firmware & Kalibrasi Sensor ADAS", note: "Pembaruan perangkat lunak sistem kendaraan terbaru." }
        ]
    }
};

function renderInterval(key) {
    const container = document.getElementById("intervalContent");
    const data = MAINTENANCE_DATA[key];
    if (!container || !data) return;

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <h2 style="color: var(--primary-dark);">${data.title}</h2>
            <span class="badge-blue">Estimasi Durasi: ${data.estTime}</span>
        </div>
        <p style="color: var(--text-muted); margin-top: 0.4rem;">${data.desc}</p>
        <div class="interval-grid">
            ${data.items.map(item => `
                <div class="check-item">
                    <h4>${item.name}</h4>
                    <p>${item.note}</p>
                </div>
            `).join("")}
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderInterval("10000");

    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderInterval(btn.dataset.km);
        });
    });
});