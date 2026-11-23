// js/data.js

const WORKSHOP_BRANCHES = [
    {
        id: "BDG-01",
        city: "BANDUNG",
        name: "AutoCare Mitra Bandung - Soekarno Hatta",
        address: "Jl. Soekarno-Hatta No. 452, Kota Bandung, Jawa Barat 40266",
        whatsapp: "0812-3456-7890"
    },
    {
        id: "JKT-01",
        city: "JAKARTA",
        name: "AutoCare Mitra Jakarta - TB Simatupang",
        address: "Jl. TB Simatupang Kav. 18, Cilandak, Jakarta Selatan 12430",
        whatsapp: "0812-9876-5432"
    },
    {
        id: "SBY-01",
        city: "SURABAYA",
        name: "AutoCare Mitra Surabaya - Ahmad Yani",
        address: "Jl. Ahmad Yani No. 112, Wonocolo, Kota Surabaya 60237",
        whatsapp: "0813-5555-8899"
    }
];

const VEHICLE_CATALOG = {
    Bensin: {
        Toyota: ["Avanza", "Veloz", "Innova Reborn", "Raize", "Yaris", "Agya", "Fortuner"],
        Honda: ["Brio", "HR-V", "BR-V", "CR-V", "Civic", "City Hatchback"],
        Mitsubishi: ["Xpander", "Xforce", "Pajero Sport", "Outlander"],
        Suzuki: ["Ertiga", "XL7", "Baleno", "Ignis", "Jimny"]
    },
    Hybrid: {
        Toyota: ["Innova Zenix Hybrid", "Yaris Cross Hybrid", "Corolla Cross Hybrid", "Camry Hybrid"],
        Honda: ["CR-V e:HEV", "Accord e:HEV"],
        Suzuki: ["Ertiga Hybrid", "XL7 Hybrid", "Grand Vitara Hybrid"],
        Wuling: ["Almaz Hybrid"]
    },
    Listrik: {
        Hyundai: ["Ioniq 5", "Ioniq 6", "Kona Electric"],
        Wuling: ["Air ev", "BinguoEV", "Cloud EV"],
        BYD: ["Atto 3", "Dolphin", "Seal", "M6"],
        Chery: ["Omoda E5"]
    }
};

// js/data.js (Update SERVICE_LIST & defaultMembers)

const SERVICE_LIST = {
    Bensin: [
        { id: "srv-oli", name: "Ganti Oli Mesin & Filter Oli", duration: 45, price: 450000 },
        { id: "srv-tuneup", name: "Tune Up & Pembersihan Ruang Bakar", duration: 90, price: 650000 },
        { id: "srv-rem", name: "Servis & Penggantian Kampas Rem", duration: 45, price: 300000 },
        { id: "srv-ac", name: "Servis AC, Cuci Evaporator & Freon", duration: 60, price: 400000 },
        { id: "srv-spooring", name: "Spooring & Balancing 4 Roda", duration: 60, price: 350000 },
        { id: "srv-aki", name: "Cek / Ganti Aki & Sistem Pengisian", duration: 30, price: 250000 },
        { id: "srv-kaki", name: "Pengecekan Kaki-Kaki & Shockbreaker", duration: 60, price: 300000 },
        { id: "srv-kopling", name: "Servis Transmisi / Kopling & Kuras Oli Matic", duration: 90, price: 750000 },
        { id: "srv-lainnya", name: "Lainnya (Keluhan Khusus / Diagnosa Umum)", duration: 45, price: 150000 }
    ],
    Hybrid: [
        { id: "srv-hyb-oli", name: "Ganti Oli Mesin & Cek Sistem Hybrid", duration: 60, price: 600000 },
        { id: "srv-hyb-bat", name: "Pembersihan Filter & Kipas Pendingin Baterai Hybrid", duration: 45, price: 350000 },
        { id: "srv-hyb-rem", name: "Servis Sistem Regenerative Braking & Kampas Rem", duration: 60, price: 400000 },
        { id: "srv-hyb-scan", name: "Full ECU & Hybrid Inverter Diagnostic", duration: 45, price: 300000 },
        { id: "srv-hyb-ac", name: "Servis Kompresor AC Elektrik Hybrid", duration: 60, price: 450000 },
        { id: "srv-hyb-spooring", name: "Spooring, Balancing & Rotasi Ban", duration: 60, price: 350000 },
        { id: "srv-hyb-lainnya", name: "Lainnya (Keluhan Khusus / Diagnosa Umum)", duration: 45, price: 150000 }
    ],
    Listrik: [
        { id: "srv-ev-soh", name: "Pengecekan Kesehatan Baterai (SoH) & Tegangan Tinggi", duration: 60, price: 500000 },
        { id: "srv-ev-coolant", name: "Cek & Kuras Cairan Pendingin Baterai (Battery Coolant)", duration: 75, price: 650000 },
        { id: "srv-ev-soft", name: "Update Firmware & Kalibrasi Sensor ADAS", duration: 45, price: 350000 },
        { id: "srv-ev-rem", name: "Servis Rem & Rotasi Ban Khusus EV", duration: 45, price: 300000 },
        { id: "srv-ev-ac", name: "Servis Sistem Thermal & AC Kabin EV", duration: 60, price: 450000 },
        { id: "srv-ev-kaki", name: "Pengecekan Suspensi & Spooring 4 Roda", duration: 60, price: 350000 },
        { id: "srv-ev-lainnya", name: "Lainnya (Keluhan Khusus / Diagnosa Umum)", duration: 45, price: 150000 }
    ]
};

function initAppStorage() {
    // Tambahkan di dalam initAppStorage() pada js/data.js sebelum if (!localStorage.getItem("autocare_members")):
    const existingMembers = JSON.parse(localStorage.getItem("autocare_members") || "[]");
    if (existingMembers.length > 0 && existingMembers[0].promos && typeof existingMembers[0].promos[0] === "string") {
        localStorage.removeItem("autocare_members");
        localStorage.removeItem("autocare_logged_member");
    }
    if (!localStorage.getItem("autocare_members")) {
        const defaultMembers = [
            {
                id: "MBR-001",
                name: "Budi Santoso",
                phone: "081234567890",
                email: "budi@email.com",
                password: "123",
                city: "Bandung",
                points: 1250,
                promos: [
                    {
                        title: "Diskon 15% untuk minimal transaksi Rp 700.000",
                        expiryDate: "31 Nov 2026",
                        termsList: [
                            "Berlaku untuk member yang sudah pernah melakukan minimal 1x transaksi servis sebelumnya.",
                            "Minimal total transaksi jasa dan/atau suku cadang sebesar Rp 700.000.",
                            "Berlaku di seluruh cabang AutoCare Mitra (Bandung, Jakarta, Surabaya).",
                            "Promo tidak dapat digabungkan dengan penukaran poin atau promo lainnya."
                        ]
                    },
                    {
                        title: "Gratis Pengecekan Aki & Scanner ECU",
                        expiryDate: "31 Des 2026",
                        termsList: [
                            "Wajib melakukan booking jadwal servis secara online melalui website.",
                            "Berlaku untuk semua jenis kendaraan (Bensin, Hybrid, dan Listrik).",
                            "Tunjukkan halaman dashboard member aktif kepada petugas saat check-in."
                        ]
                    },
                    {
                        title: "Potongan Rp 50.000 dengan Penukaran 1.000 Poin",
                        expiryDate: "15 Jan 2027",
                        termsList: [
                            "Saldo poin member minimal 1.000 poin.",
                            "Poin yang sudah ditukarkan tidak dapat dibatalkan atau diuangkan.",
                            "Berlaku untuk semua paket perawatan berkala."
                        ]
                    }
                ],
                vehicles: [
                    { id: "VEH-1", brand: "Toyota", engineType: "Bensin", model: "Avanza", plateNumber: "D 1234 ABC" },
                    { id: "VEH-2", brand: "Hyundai", engineType: "Listrik", model: "Ioniq 5", plateNumber: "D 5678 XYZ" }
                ],
                transactions: [
                    { date: "2026-09-12", queueCode: "A-102", vehicle: "Toyota Avanza (D 1234 ABC)", services: "Ganti Oli Mesin & Filter Oli", total: 450000, status: "Selesai" },
                    { date: "2026-10-20", queueCode: "A-215", vehicle: "Hyundai Ioniq 5 (D 5678 XYZ)", services: "Pengecekan Kesehatan Baterai (SoH)", total: 500000, status: "Selesai" }
                ]
            }
        ];
        localStorage.setItem("autocare_members", JSON.stringify(defaultMembers));
    }

    if (!localStorage.getItem("autocare_queues")) {
        const defaultQueues = [
            {
                queueCode: "A-001",
                branch: "AutoCare Mitra Bandung - Soekarno Hatta",
                bay: "Bay 1",
                status: "Sedang Dikerjakan",
                bookingTime: "09:00",
                estDuration: 60
            },
            {
                queueCode: "A-002",
                branch: "AutoCare Mitra Bandung - Soekarno Hatta",
                bay: "Menuju Bay 2",
                status: "Dipanggil ke Bay",
                bookingTime: "09:30",
                estDuration: 45
            },
            {
                queueCode: "J-001",
                branch: "AutoCare Mitra Jakarta - TB Simatupang",
                bay: "Bay 1",
                status: "Sedang Dikerjakan",
                bookingTime: "09:15",
                estDuration: 90
            },
            {
                queueCode: "S-001",
                branch: "AutoCare Mitra Surabaya - Ahmad Yani",
                bay: "Menunggu Alokasi Bay",
                status: "Menunggu Giliran",
                bookingTime: "10:00",
                estDuration: 45
            }
        ];
        localStorage.setItem("autocare_queues", JSON.stringify(defaultQueues));
    }
}

initAppStorage();