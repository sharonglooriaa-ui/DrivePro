function getLoggedStaff() {
    const raw = localStorage.getItem("drivepro_staff_session");
    return raw ? JSON.parse(raw) : null;
}

function requireStaffAuth() {
    const staff = getLoggedStaff();
    if (!staff) {
        window.location.href = "login.html";
        return null;
    }
    return staff;
}

function logoutStaff() {
    localStorage.removeItem("drivepro_staff_session");
    window.location.href = "login.html";
}