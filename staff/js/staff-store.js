// staff/js/staff-store.js

const STAFF_ACCOUNTS = [
    {
        staffId: 'STF-BDG-01',
        name: 'Raka Pratama',
        email: 'raka.staff@drivepro.id',
        phone: '081322445566',
        role: 'Senior Service Advisor',
        branchKey: 'bandung',
        branchName: 'DrivePro Bandung',
        assignedBays: [1, 2],
        shift: 'Shift Pagi (08:00 - 17:00 WIB)'
    },
    {
        staffId: 'STF-JKT-02',
        name: 'Dimas Saputra',
        email: 'dimas.staff@drivepro.id',
        phone: '081299887766',
        role: 'Service Advisor & Lead Mechanic',
        branchKey: 'jakarta',
        branchName: 'DrivePro Jakarta',
        assignedBays: [1, 2],
        shift: 'Shift Pagi (08:00 - 17:00 WIB)'
    },
    {
        staffId: 'STF-SBY-03',
        name: 'Fajar Nugroho',
        email: 'fajar.staff@drivepro.id',
        phone: '081577665544',
        role: 'Service Advisor',
        branchKey: 'surabaya',
        branchName: 'DrivePro Surabaya',
        assignedBays: [1, 2],
        shift: 'Shift Pagi (08:00 - 17:00 WIB)'
    }
];

const MECHANICS_BY_BRANCH = {
    bandung: ['Andi Wijaya (Mekanik Senior)', 'Dedi Kurniawan (Spesialis EV & Hybrid)', 'Rizky Maulana (Mekanik Umum)'],
    jakarta: ['Hendra Gunawan (Mekanik Senior)', 'Bagus Setiawan (Spesialis Eropa & EV)', 'Taufik Hidayat (Mekanik Umum)'],
    surabaya: ['Surya Dharma (Mekanik Senior)', 'Eko Prasetyo (Mekanik Umum)']
};

const STAFF_VEHICLE_CATALOG = {
    Bensin: {
        Toyota: ['Avanza', 'Innova Reborn', 'Rush', 'Raize', 'Yaris'],
        Honda: ['Brio', 'HR-V', 'CR-V', 'Civic'],
        Mitsubishi: ['Xpander', 'Pajero Sport'],
        Daihatsu: ['Terios', 'Xenia', 'Sigra']
    },
    Hybrid: {
        Toyota: ['Innova Zenix Hybrid', 'Corolla Cross Hybrid', 'Yaris Cross Hybrid'],
        Honda: ['CR-V RS e:HEV', 'Accord e:HEV']
    },
    Listrik: {
        Hyundai: ['Ioniq 5', 'Ioniq 6', 'Kona Electric'],
        Wuling: ['Air EV', 'Binguo EV', 'Cloud EV'],
        BYD: ['Atto 3', 'Seal', 'Dolphin']
    }
};

const STAFF_SERVICE_CATALOG = {
    Bensin: [
        { id: 'srv-oli', name: 'Ganti Oli Mesin Sintetik 4L', price: 420000, duration: 30 },
        { id: 'srv-tuneup', name: 'Tune Up Mesin Berkala', price: 380000, duration: 45 },
        { id: 'srv-rem', name: 'Pengecekan & Servis Rem 4 Roda', price: 180000, duration: 30 },
        { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 },
        { id: 'srv-ac', name: 'Servis AC & Pembersihan Evaporator', price: 290000, duration: 40 }
    ],
    Hybrid: [
        { id: 'srv-hyb-oli', name: 'Ganti Oli Mesin Hybrid 0W-16', price: 520000, duration: 35 },
        { id: 'srv-hyb-inv', name: 'Inverter & Hybrid Cooling Check', price: 350000, duration: 40 },
        { id: 'srv-hyb-rem', name: 'Regenerative Brake Calibration', price: 220000, duration: 30 },
        { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 }
    ],
    Listrik: [
        { id: 'srv-ev-bat', name: 'EV Battery Health & Cell Diagnostic', price: 450000, duration: 40 },
        { id: 'srv-ev-cool', name: 'Penggantian Coolant Baterai EV', price: 390000, duration: 45 },
        { id: 'srv-ev-ac', name: 'Penggantian Filter Kabin HEPA & Sanitasi', price: 240000, duration: 25 },
        { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 }
    ]
};

// Katalog Sparepart beserta Harga Part & Harga Jasa Pemasangan
const SPAREPART_CATALOG = [
    { partId: 'PRT-01', name: 'Filter Oli Original', partPrice: 85000, installFee: 25000 },
    { partId: 'PRT-02', name: 'Kampas Rem Depan (1 Set)', partPrice: 340000, installFee: 90000 },
    { partId: 'PRT-03', name: 'Kampas Rem Belakang (1 Set)', partPrice: 290000, installFee: 85000 },
    { partId: 'PRT-04', name: 'Busi Iridium (Per Pcs)', partPrice: 125000, installFee: 20000 },
    { partId: 'PRT-05', name: 'Filter Udara Mesin', partPrice: 145000, installFee: 20000 },
    { partId: 'PRT-06', name: 'Filter Kabin AC HEPA', partPrice: 175000, installFee: 25000 },
    { partId: 'PRT-07', name: 'Minyak Rem DOT 4 (Botol)', partPrice: 75000, installFee: 50000 },
    { partId: 'PRT-08', name: 'Wiper Blade Frameless (Sepasang)', partPrice: 160000, installFee: 15000 },
    { partId: 'PRT-09', name: 'Aki Kering Maintenance Free 45Ah', partPrice: 890000, installFee: 50000 }
];

const DEMO_MEMBERS_LIST = [
    {
        name: 'Budi Santoso',
        phone: '081234567890',
        email: 'budi@email.com',
        city: 'Bandung',
        points: 1250,
        vehicles: [
            { engineType: 'Bensin', brand: 'Toyota', model: 'Avanza', plateNumber: 'D 1428 ABC' },
            { engineType: 'Listrik', brand: 'Hyundai', model: 'Ioniq 5', plateNumber: 'D 88 EV' }
        ]
    }
];

function getLoggedStaff() {
    const saved = localStorage.getItem('drivepro_logged_staff');
    if (saved) return JSON.parse(saved);
    return STAFF_ACCOUNTS[0];
}

function formatRupiah(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}

// Inisialisasi data antrean awal agar langsung terisi & sinkron dengan customer
function ensureInitialWorkshopQueues() {
    const existing = JSON.parse(localStorage.getItem('drivepro_bookings_list') || '[]');
    if (existing.length > 0) return existing;

    const todayStr = new Date().toISOString().slice(0, 10);
    const initialQueues = [
        {
            bookingId: 'BK-20261123-015',
            ticket: 'A-015',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            bay: 1,
            name: 'Budi Santoso',
            phone: '081234567890',
            isMember: true,
            engineType: 'Bensin',
            car: 'Toyota Avanza (D 1428 ABC)',
            service: 'Ganti Oli Mesin Sintetik 4L, Pengecekan & Servis Rem 4 Roda',
            servicesList: [
                { id: 'srv-oli', name: 'Ganti Oli Mesin Sintetik 4L', price: 420000, duration: 30 },
                { id: 'srv-rem', name: 'Pengecekan & Servis Rem 4 Roda', price: 180000, duration: 30 }
            ],
            sparepartsList: [
                { partId: 'PRT-01', name: 'Filter Oli Original', partPrice: 85000, installFee: 25000, qty: 1 }
            ],
            mechanic: 'Andi Wijaya (Mekanik Senior)',
            staffAdvisor: 'Raka Pratama',
            date: todayStr,
            time: '10:30 WIB',
            startedAt: '10:35 WIB',
            estMinutes: 15,
            est: '± 15 Menit',
            status: 'called'
        },
        {
            bookingId: 'BK-20261123-012',
            ticket: 'A-012',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            bay: 2,
            name: 'Budi Santoso',
            phone: '081234567890',
            isMember: true,
            engineType: 'Listrik',
            car: 'Hyundai Ioniq 5 (D 88 EV)',
            service: 'EV Battery Health & Cell Diagnostic, Spooring & Balancing 4 Roda',
            servicesList: [
                { id: 'srv-ev-bat', name: 'EV Battery Health & Cell Diagnostic', price: 450000, duration: 40 },
                { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 }
            ],
            sparepartsList: [],
            mechanic: 'Dedi Kurniawan (Spesialis EV & Hybrid)',
            staffAdvisor: 'Raka Pratama',
            date: todayStr,
            time: '09:30 WIB',
            startedAt: '09:40 WIB',
            estMinutes: 25,
            est: '± 25 Menit',
            status: 'working'
        },
        {
            bookingId: 'BK-20261123-013',
            ticket: 'A-013',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            bay: 3,
            name: 'Nadia Putri',
            phone: '08131112223',
            isMember: false,
            engineType: 'Bensin',
            car: 'Mitsubishi Xpander (D 5510 KLM)',
            service: 'Tune Up Mesin Berkala',
            servicesList: [
                { id: 'srv-tuneup', name: 'Tune Up Mesin Berkala', price: 380000, duration: 45 }
            ],
            sparepartsList: [
                { partId: 'PRT-04', name: 'Busi Iridium (Per Pcs)', partPrice: 125000, installFee: 20000, qty: 4 }
            ],
            mechanic: 'Rizky Maulana (Mekanik Umum)',
            staffAdvisor: 'Raka Pratama',
            date: todayStr,
            time: '10:00 WIB',
            startedAt: '10:12 WIB',
            estMinutes: 35,
            est: '± 35 Menit',
            status: 'working'
        }
    ];

    localStorage.setItem('drivepro_bookings_list', JSON.stringify(initialQueues));
    return initialQueues;
}

function getCompletedHistoryList() {
    const existing = JSON.parse(localStorage.getItem('drivepro_completed_history') || '[]');
    if (existing.length > 0) return existing;

    const todayStr = new Date().toISOString().slice(0, 10);
    const initialHistory = [
        {
            trxId: 'TRX-20261123-004',
            bookingId: 'BK-20261123-004',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            date: todayStr,
            bookingTime: '08:00 WIB',
            startedAt: '08:05 WIB',
            finishedAt: '09:10 WIB',
            durationMinutes: 65,
            customerName: 'Hendrik Wijaya',
            customerPhone: '08122334455',
            car: 'Honda HR-V (D 1920 ZAA)',
            staffAdvisor: 'Raka Pratama',
            mechanic: 'Andi Wijaya (Mekanik Senior)',
            servicesList: [
                { name: 'Ganti Oli Mesin Sintetik 4L', price: 420000 },
                { name: 'Pengecekan & Servis Rem 4 Roda', price: 180000 }
            ],
            sparepartsList: [
                { name: 'Filter Oli Original', partPrice: 85000, installFee: 25000, qty: 1 },
                { name: 'Kampas Rem Depan (1 Set)', partPrice: 340000, installFee: 90000, qty: 1 }
            ],
            totalAmount: 1140000,
            paymentStatus: 'Menunggu Pembayaran POS'
        },
        {
            trxId: 'TRX-20261123-002',
            bookingId: 'BK-20261123-002',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            date: todayStr,
            bookingTime: '08:30 WIB',
            startedAt: '08:35 WIB',
            finishedAt: '09:20 WIB',
            durationMinutes: 45,
            customerName: 'Sinta Maharani',
            customerPhone: '08177889900',
            car: 'Wuling Air EV (D 310 EV)',
            staffAdvisor: 'Raka Pratama',
            mechanic: 'Dedi Kurniawan (Spesialis EV & Hybrid)',
            servicesList: [
                { name: 'EV Battery Health & Cell Diagnostic', price: 450000 },
                { name: 'Penggantian Filter Kabin HEPA & Sanitasi', price: 240000 }
            ],
            sparepartsList: [
                { name: 'Filter Kabin AC HEPA', partPrice: 175000, installFee: 25000, qty: 1 }
            ],
            totalAmount: 890000,
            paymentStatus: 'Menunggu Pembayaran POS'
        },
        {
            trxId: 'TRX-20261122-018',
            bookingId: 'BK-20261122-018',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            date: '2026-11-22',
            bookingTime: '14:00 WIB',
            startedAt: '14:10 WIB',
            finishedAt: '15:25 WIB',
            durationMinutes: 75,
            customerName: 'Budi Santoso',
            customerPhone: '081234567890',
            car: 'Toyota Avanza (D 1428 ABC)',
            staffAdvisor: 'Raka Pratama',
            mechanic: 'Rizky Maulana (Mekanik Umum)',
            servicesList: [
                { name: 'Tune Up Mesin Berkala', price: 380000 },
                { name: 'Spooring & Balancing 4 Roda', price: 350000 }
            ],
            sparepartsList: [
                { name: 'Busi Iridium (Per Pcs)', partPrice: 125000, installFee: 20000, qty: 4 }
            ],
            totalAmount: 1310000,
            paymentStatus: 'Lunas (POS)'
        }
    ];

    localStorage.setItem('drivepro_completed_history', JSON.stringify(initialHistory));
    return initialHistory;
}