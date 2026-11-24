// staff/js/staff-store.js

const FALLBACK_CAR_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="48" viewBox="0 0 80 48" fill="none">
        <rect width="80" height="48" rx="8" fill="#eef4ff"/>
        <path d="M18 30h44l-4-11c-1-2.5-3-4-5.5-4h-25c-2.5 0-4.5 1.5-5.5 4l-4 11z" fill="#103c8c"/>
        <circle cx="25" cy="32" r="4.5" fill="#07193d"/>
        <circle cx="55" cy="32" r="4.5" fill="#07193d"/>
    </svg>`
);

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
    bandung: [
        // 6 Mekanik Bersertifikat Hybrid & Listrik (EV)
        { name: 'Andi Wijaya (Lead EV & Hybrid)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Dedi Kurniawan (Spesialis EV)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Faisal Rahman (Teknisi HV & Hybrid)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Bagas Pratama (Spesialis EV)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Kevin Saputra (Teknisi Hybrid)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Ilham Akbar (Spesialis Baterai EV)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        // 9 Mekanik Mesin Bensin
        { name: 'Rizky Maulana (Mekanik Senior Bensin)', skills: ['Bensin'] },
        { name: 'Galih Permana (Teknisi Mesin & AC)', skills: ['Bensin'] },
        { name: 'Hendra Gunawan (Mekanik Umum)', skills: ['Bensin'] },
        { name: 'Taufik Hidayat (Mekanik Umum)', skills: ['Bensin'] },
        { name: 'Surya Dharma (Spesialis Kaki-Kaki)', skills: ['Bensin'] },
        { name: 'Eko Prasetyo (Mekanik Umum)', skills: ['Bensin'] },
        { name: 'Rama Aditya (Mekanik Berkala)', skills: ['Bensin'] },
        { name: 'Dimas Nugraha (Mekanik Berkala)', skills: ['Bensin'] },
        { name: 'Yusuf Kurnia (Mekanik Umum)', skills: ['Bensin'] }
    ],
    jakarta: [
        { name: 'Hendra Gunawan (Spesialis EV & Hybrid)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Bagus Setiawan (Mekanik Umum)', skills: ['Bensin'] }
    ],
    surabaya: [
        { name: 'Surya Dharma (Spesialis EV & Hybrid)', skills: ['Bensin', 'Hybrid', 'Listrik'] },
        { name: 'Eko Prasetyo (Mekanik Umum)', skills: ['Bensin'] }
    ]
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
        { id: 'srv-ac', name: 'Servis AC & Pembersihan Evaporator', price: 290000, duration: 40 },
        { id: 'srv-lainnya', name: 'Lainnya (Perbaikan Khusus)', price: 150000, duration: 30 }
    ],
    Hybrid: [
        { id: 'srv-hyb-oli', name: 'Ganti Oli Mesin Hybrid 0W-16', price: 520000, duration: 35 },
        { id: 'srv-hyb-inv', name: 'Inverter & Hybrid Cooling Check', price: 350000, duration: 40 },
        { id: 'srv-hyb-rem', name: 'Regenerative Brake Calibration', price: 220000, duration: 30 },
        { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 },
        { id: 'srv-lainnya', name: 'Lainnya (Perbaikan Khusus)', price: 150000, duration: 30 }
    ],
    Listrik: [
        { id: 'srv-ev-bat', name: 'EV Battery Health & Cell Diagnostic', price: 450000, duration: 40 },
        { id: 'srv-ev-cool', name: 'Penggantian Coolant Baterai EV', price: 390000, duration: 45 },
        { id: 'srv-ev-ac', name: 'Penggantian Filter Kabin HEPA & Sanitasi', price: 240000, duration: 25 },
        { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 },
        { id: 'srv-lainnya', name: 'Lainnya (Perbaikan Khusus)', price: 150000, duration: 30 }
    ]
};

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
            { engineType: 'Bensin', brand: 'Toyota', model: 'Avanza', plateNumber: 'D 1428 ABC', yearKm: '2022 • 42.500 km' },
            { engineType: 'Listrik', brand: 'Hyundai', model: 'Ioniq 5', plateNumber: 'D 88 EV', yearKm: '2024 • 14.200 km' }
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

function getStaffCarImage(carLabel) {
    const lower = (carLabel || '').toLowerCase();
    if (lower.includes('ioniq') || lower.includes('hyundai') || lower.includes('ev') || lower.includes('listrik')) {
        return 'assets/ioniq.png';
    }
    return 'assets/avanza.png';
}

function getMechanicsStatusByEngine(branchKey, engineType) {
    const allMechs = MECHANICS_BY_BRANCH[branchKey] || MECHANICS_BY_BRANCH.bandung;
    const activeQueues = ensureInitialWorkshopQueues().filter(
        q => (q.branch || 'bandung') === branchKey && q.status !== 'done' && q.status !== 'waiting' && Number(q.bay) > 0
    );

    return allMechs
        .filter(m => !engineType || m.skills.includes(engineType))
        .map(m => {
            const busyJob = activeQueues.find(q =>
                (Array.isArray(q.mechanics) && q.mechanics.includes(m.name)) ||
                (q.mechanic && q.mechanic.includes(m.name))
            );
            return {
                name: m.name,
                skills: m.skills,
                isBusy: Boolean(busyJob),
                busyBay: busyJob ? busyJob.bay : null,
                busyEst: busyJob ? busyJob.est : null
            };
        });
}

function ensureInitialWorkshopQueues() {
    const existing = JSON.parse(localStorage.getItem('drivepro_bookings_list') || '[]');
    if (existing.length > 0) return existing;

    const todayStr = new Date().toISOString().slice(0, 10);
    const initialQueues = [
        {
            bookingId: 'BK-20261124-015',
            ticket: 'A-015',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            bay: 1,
            name: 'Budi Santoso',
            phone: '081234567890',
            email: 'budi@email.com',
            isMember: true,
            engineType: 'Bensin',
            car: 'Toyota Avanza (D 1428 ABC)',
            yearKm: '2022 • 42.500 km',
            service: 'Ganti Oli Mesin Sintetik 4L, Pengecekan & Servis Rem 4 Roda',
            servicesList: [
                { id: 'srv-oli', name: 'Ganti Oli Mesin Sintetik 4L', price: 420000, duration: 30 },
                { id: 'srv-rem', name: 'Pengecekan & Servis Rem 4 Roda', price: 180000, duration: 30 }
            ],
            sparepartsList: [
                { partId: 'PRT-01', name: 'Filter Oli Original', partPrice: 85000, installFee: 25000, qty: 1 }
            ],
            mechanics: ['Rizky Maulana (Mekanik Senior Bensin)'],
            mechanic: 'Rizky Maulana (Mekanik Senior Bensin)',
            staffAdvisor: 'Raka Pratama',
            date: todayStr,
            time: '10:30 WIB',
            startedAt: '10:35 WIB',
            estMinutes: 15,
            remainingSeconds: 15 * 60,
            est: '± 15 Menit',
            status: 'called'
        },
        {
            bookingId: 'BK-20261124-012',
            ticket: 'A-012',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            bay: 2,
            name: 'Budi Santoso',
            phone: '081234567890',
            email: 'budi@email.com',
            isMember: true,
            engineType: 'Listrik',
            car: 'Hyundai Ioniq 5 (D 88 EV)',
            yearKm: '2024 • 14.200 km',
            service: 'EV Battery Health & Cell Diagnostic, Spooring & Balancing 4 Roda',
            servicesList: [
                { id: 'srv-ev-bat', name: 'EV Battery Health & Cell Diagnostic', price: 450000, duration: 40 },
                { id: 'srv-spooring', name: 'Spooring & Balancing 4 Roda', price: 350000, duration: 45 }
            ],
            sparepartsList: [],
            mechanics: ['Andi Wijaya (Lead EV & Hybrid)'],
            mechanic: 'Andi Wijaya (Lead EV & Hybrid)',
            staffAdvisor: 'Raka Pratama',
            date: todayStr,
            time: '09:30 WIB',
            startedAt: '09:40 WIB',
            estMinutes: 25,
            remainingSeconds: 25 * 60,
            est: '± 25 Menit',
            status: 'working'
        },
        {
            bookingId: 'BK-20261124-016',
            ticket: 'A-016',
            branch: 'bandung',
            branchName: 'DrivePro Bandung',
            bay: 0,
            name: 'Siti Rahmawati',
            phone: '081398765432',
            email: 'siti@email.com',
            isMember: false,
            engineType: 'Bensin',
            car: 'Honda Brio (D 5512 KLP)',
            yearKm: '2021 • 36.000 km',
            service: 'Tune Up Mesin Berkala',
            servicesList: [
                { id: 'srv-tuneup', name: 'Tune Up Mesin Berkala', price: 380000, duration: 45 }
            ],
            sparepartsList: [],
            mechanics: [],
            mechanic: 'Menunggu Alokasi Mekanik',
            staffAdvisor: 'Raka Pratama',
            date: todayStr,
            time: '10:45 WIB',
            startedAt: '10:45 WIB',
            estMinutes: 45,
            remainingSeconds: 45 * 60,
            est: '± 45 Menit',
            status: 'waiting'
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
            trxId: 'TRX-20261124-004',
            bookingId: 'BK-20261124-004',
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
            yearKm: '2021 • 58.000 km',
            staffAdvisor: 'Raka Pratama',
            mechanic: 'Rizky Maulana (Mekanik Senior Bensin)',
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
        }
    ];

    localStorage.setItem('drivepro_completed_history', JSON.stringify(initialHistory));
    return initialHistory;
}