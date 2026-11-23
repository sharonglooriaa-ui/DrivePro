const STAFF_ACCOUNTS = [
    {
        staffId: "STF-BDG-01",
        name: "Rizky Pratama",
        role: "Service Advisor",
        branch: "DrivePro Bandung - Soekarno Hatta",
        email: "rizky@drivepro.co.id",
        password: "staff123"
    },
    {
        staffId: "STF-JKT-01",
        name: "Dimas Saputra",
        role: "Kepala Bengkel",
        branch: "DrivePro Jakarta - TB Simatupang",
        email: "dimas@drivepro.co.id",
        password: "staff123"
    },
    {
        staffId: "STF-SBY-01",
        name: "Nadia Putri",
        role: "Service Advisor",
        branch: "DrivePro Surabaya - Ahmad Yani",
        email: "nadia@drivepro.co.id",
        password: "staff123"
    }
];

const SERVICE_LIST = {
    Bensin: [
        { name: "Ganti Oli Mesin & Filter", price: 250000, duration: 45 },
        { name: "Tune Up Berkala", price: 350000, duration: 60 },
        { name: "Servis Sistem Rem & Kaki-kaki", price: 300000, duration: 60 },
        { name: "Cek & Ganti Aki", price: 150000, duration: 30 },
        { name: "Servis AC & Cuci Evaporator", price: 275000, duration: 60 }
    ],
    Hybrid: [
        { name: "Ganti Oli Khusus Hybrid", price: 300000, duration: 45 },
        { name: "Cek Sistem Hybrid & Baterai", price: 450000, duration: 60 },
        { name: "Tune Up & Kalibrasi ECU Hybrid", price: 500000, duration: 75 },
        { name: "Servis Sistem Pendingin Inverter", price: 400000, duration: 60 },
        { name: "Cek Aki Auxiliary 12V Hybrid", price: 175000, duration: 30 }
    ],
    Listrik: [
        { name: "Diagnostik Baterai EV & Sistem Pendingin", price: 550000, duration: 60 },
        { name: "Cek Sistem Rem Regeneratif", price: 320000, duration: 45 },
        { name: "Cek Aki 12V & Kelistrikan Kabin EV", price: 200000, duration: 30 },
        { name: "Spooring, Balancing & Cek Suspensi EV", price: 380000, duration: 60 }
    ]
};

const SPAREPART_LIST = {
    Bensin: [
        { id: "sp-oli-4l", name: "Oli Mesin Full Synthetic 5W-30 (4L)", price: 420000 },
        { id: "sp-filter-oli", name: "Filter Oli Original", price: 85000 },
        { id: "sp-aki-mf", name: "Aki Kering Maintenance Free (NS60)", price: 950000 },
        { id: "sp-kampas-dpn", name: "Kampas Rem Depan (1 Set)", price: 480000 },
        { id: "sp-busi-ir", name: "Busi Iridium (4 Pcs)", price: 440000 }
    ],
    Hybrid: [
        { id: "sp-hyb-oli", name: "Oli Mesin Khusus Hybrid 0W-20 (4L)", price: 560000 },
        { id: "sp-hyb-filter", name: "Filter Kipas Pendingin Baterai Hybrid", price: 240000 },
        { id: "sp-hyb-aki12v", name: "Aki Auxiliary 12V Khusus Hybrid", price: 1350000 },
        { id: "sp-hyb-inv", name: "Inverter Coolant Fluid (2L)", price: 320000 }
    ],
    Listrik: [
        { id: "sp-ev-coolant", name: "Low-Conductivity Battery Coolant (4L)", price: 850000 },
        { id: "sp-ev-aki12v", name: "Aki 12V Sistem Kontrol EV", price: 1150000 },
        { id: "sp-ev-filter", name: "Filter Kabin HEPA Aktivasi Karbon EV", price: 340000 },
        { id: "sp-ev-rem", name: "Kampas Rem Anti-Korosi EV (1 Set)", price: 680000 }
    ]
};

// Inisialisasi data contoh jika localStorage masih kosong
(function initDefaultData() {
    const todayStr = new Date().toISOString().split("T")[0];

    if (!localStorage.getItem("autocare_queues")) {
        localStorage.setItem("autocare_queues", JSON.stringify([
            {
                id: "Q-101",
                queueCode: "BDG-001",
                bookingSource: "Online Customer",
                branch: "DrivePro Bandung - Soekarno Hatta",
                customerName: "Andi Wijaya",
                phone: "081234567890",
                engineType: "Bensin",
                carModel: "Honda HR-V RS",
                plateNumber: "D 1420 ABC",
                date: todayStr,
                startTime: "08:30",
                endTime: "09:30",
                totalDuration: 60,
                services: ["Ganti Oli Mesin & Filter", "Tune Up Berkala"],
                serviceTotal: 600000,
                spareparts: [],
                status: "Sedang Dikerjakan"
            },
            {
                id: "Q-102",
                queueCode: "BDG-002",
                bookingSource: "Online Customer",
                branch: "DrivePro Bandung - Soekarno Hatta",
                customerName: "Siti Rahmawati",
                phone: "081299887766",
                engineType: "Hybrid",
                carModel: "Toyota Innova Zenix Hybrid",
                plateNumber: "D 1889 XYZ",
                date: todayStr,
                startTime: "09:30",
                endTime: "10:30",
                totalDuration: 60,
                services: ["Cek Sistem Hybrid & Baterai"],
                serviceTotal: 450000,
                spareparts: [],
                status: "Menunggu"
            },
            {
                id: "Q-103",
                queueCode: "BDG-003",
                bookingSource: "Online Customer",
                branch: "DrivePro Bandung - Soekarno Hatta",
                customerName: "Budi Santoso",
                phone: "081355443322",
                engineType: "Listrik",
                carModel: "Hyundai Ioniq 5",
                plateNumber: "D 1005 EV",
                date: todayStr,
                startTime: "10:30",
                endTime: "11:30",
                totalDuration: 60,
                services: ["Diagnostik Baterai EV & Sistem Pendingin"],
                serviceTotal: 550000,
                spareparts: [],
                status: "Menunggu"
            }
        ]));
    }

    if (!localStorage.getItem("autocare_members")) {
        localStorage.setItem("autocare_members", JSON.stringify([
            {
                id: "MBR-001",
                name: "Andi Wijaya",
                phone: "081234567890",
                email: "andi.wijaya@email.com",
                points: 1450,
                transactions: [
                    {
                        date: "2026-10-12",
                        queueCode: "BDG-088",
                        vehicle: "Honda HR-V RS (D 1420 ABC)",
                        services: "Servis Berkala 20.000 KM",
                        total: 850000,
                        status: "Selesai"
                    }
                ]
            },
            {
                id: "MBR-002",
                name: "Siti Rahmawati",
                phone: "081299887766",
                email: "siti.rahma@email.com",
                points: 350,
                transactions: []
            }
        ]));
    }
})();