document.addEventListener("DOMContentLoaded", () => {
    if (getLoggedStaff()) {
        window.location.href = "antrean.html";
        return;
    }

    document.getElementById("staffLoginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const idVal = document.getElementById("staffIdentifier").value.trim().toLowerCase();
        const passVal = document.getElementById("staffPassword").value;

        const staff = STAFF_ACCOUNTS.find(
            (s) => (s.staffId.toLowerCase() === idVal || s.email.toLowerCase() === idVal) && s.password === passVal
        );

        if (!staff) {
            alert("ID Staff / Email atau Password salah!");
            return;
        }

        localStorage.setItem("drivepro_staff_session", JSON.stringify(staff));
        window.location.href = "antrean.html";
    });
});