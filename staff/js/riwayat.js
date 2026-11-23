document.addEventListener("DOMContentLoaded", () => {
    if (!requireStaffAuth()) return;
    renderTransactionHistory();
});

function renderTransactionHistory() {
    const queues = JSON.parse(localStorage.getItem("autocare_queues")) || [];
    const keyword = (document.getElementById("historySearchInput").value || "").toLowerCase();

    const completed = queues.filter((q) => {
        if (q.status !== "Selesai") return false;
        return (
            q.customerName.toLowerCase().includes(keyword) ||
            q.plateNumber.toLowerCase().includes(keyword) ||
            q.queueCode.toLowerCase().includes(keyword)
        );
    });

    const container = document.getElementById("transactionHistoryContainer");
    if (completed.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:24px; color:#64748b;">Belum ada riwayat transaksi lunas yang tercatat.</p>`;
        return;
    }

    container.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Kode</th>
                    <th>Tanggal</th>
                    <th>Customer & Mobil</th>
                    <th>Layanan & Sparepart</th>
                    <th>Metode</th>
                    <th>Total Lunas</th>
                    <th>PIC Staff</th>
                </tr>
            </thead>
            <tbody>
                ${completed.map((tx) => `
                    <tr>
                        <td><strong>${tx.queueCode}</strong></td>
                        <td>${tx.date}</td>
                        <td><strong>${tx.customerName}</strong><br><small>${tx.carModel} (${tx.plateNumber})</small></td>
                        <td>${(tx.services || []).join(", ")}</td>
                        <td>${tx.paymentMethod || "Tunai"}</td>
                        <td><strong style="color:#103c8c;">Rp ${(tx.grandTotal || tx.serviceTotal || 0).toLocaleString("id-ID")}</strong></td>
                        <td>${tx.handledByStaffName || "-"}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}