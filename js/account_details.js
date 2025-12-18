const sessionUsername = sessionStorage.getItem('username');
const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

if (!isLoggedIn || !sessionUsername) {
    window.location.href = "register_login.html";
} else {
    updateNavbarUI(sessionUsername, true);
    fetchAndDisplayData(sessionUsername);
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

function updateNavbarUI(username, isLoggedIn) {
    const guestButtonContainer = document.getElementById('auth-button-guest');
    const userDropdownContainer = document.getElementById('auth-dropdown-user');
    const usernameDisplay = document.getElementById('loggedInUsername');

    if (isLoggedIn) {
        if (guestButtonContainer) guestButtonContainer.classList.add('d-none');
        if (userDropdownContainer) userDropdownContainer.classList.remove('d-none');
        if (usernameDisplay) usernameDisplay.textContent = username;
    } else {
        if (guestButtonContainer) guestButtonContainer.classList.remove('d-none');
        if (userDropdownContainer) userDropdownContainer.classList.add('d-none');
    }
}

async function fetchAndDisplayData(currentUsername) {
    let allUsers = [];
    let currentUser = null;

    try {
        const response = await fetch('json/users.json');
        if (response.ok) {
            allUsers = await response.json();
            currentUser = allUsers.find(user => user.username === currentUsername);
        }
    } catch (error) {
        console.warn("Error loading JSON", error); // Debug since we had an explorer problem
    }

    const sessionUser = {
        username: sessionStorage.getItem('username'),
        email: sessionStorage.getItem('email'),
        birthday: sessionStorage.getItem('birthday'),
        admin: sessionStorage.getItem('isAdmin') === 'true'
    };

    if (!currentUser) {
        currentUser = sessionUser;
        if (!allUsers.some(user => user.username === sessionUser.username)) {
            allUsers.push(sessionUser);
        }
    } else {
        currentUser.admin = currentUser.admin === true; 
    }

    populatePersonalInfo(currentUser);

    if (currentUser.admin === true) {
        if (allUsers.length > 0) {
            populateAdminDashboard(allUsers);
        } else {
            const adminSec = document.getElementById('admin-dashboard-section');
            if (adminSec) adminSec.classList.add('d-none');
        }
    }
}

function populatePersonalInfo(user) {
    const nameEl = document.getElementById('user-profile-name');
    const roleEl = document.getElementById('user-profile-role');
    const emailEl = document.getElementById('user-profile-email');
    const bdayEl = document.getElementById('user-profile-birthday');

    if(nameEl) nameEl.textContent = user.username;
    if(emailEl) emailEl.textContent = user.email || "Email não disponível";
    if(bdayEl) bdayEl.textContent = user.birthday || "Data não disponível";

    if (roleEl) {
        if (user.admin) {
            roleEl.textContent = "Administrador";
            roleEl.classList.replace('bg-secondary', 'bg-primary');
        } else {
            roleEl.textContent = "Utilizador";
        }
    }
}

function populateAdminDashboard(allUsers) {
    const adminSection = document.getElementById('admin-dashboard-section');
    const tableBody = document.getElementById('users-table-body');

    if (adminSection) adminSection.classList.remove('d-none');
    if (tableBody) {
        tableBody.innerHTML = '';
        allUsers.forEach((user, index) => {
            const row = document.createElement('tr');
            const isAdmin = user.admin === true || user.admin === 'true';
            const roleBadge = isAdmin
                ? '<span class="badge bg-primary">Admin</span>' 
                : '<span class="badge bg-secondary">User</span>';

            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td><strong>${user.username}</strong></td>
                <td>${user.email || '-'}</td>
                <td>${user.birthday || '-'}</td>
                <td>${roleBadge}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}