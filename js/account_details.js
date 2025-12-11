document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Check
    const sessionUsername = sessionStorage.getItem('username');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn || !sessionUsername) {
        window.location.href = "register_login.html";
        return; 
    }

    // 2. Update Navbar
    const navUsernameDisplay = document.getElementById('loggedInUsername');
    if (navUsernameDisplay) {
        navUsernameDisplay.textContent = sessionUsername;
    }

    // 3. Initialize Page Data
    fetchAndDisplayData(sessionUsername);

    // 4. Attach Logout Logic
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});

async function fetchAndDisplayData(currentUsername) {
    let currentUser = null;
    let allUsers = [];

    try {
        const response = await fetch('json/users.json');
        if (response.ok) {
            allUsers = await response.json();
            // Try to find user in JSON (Old/Admin accounts)
            currentUser = allUsers.find(user => user.username === currentUsername);
        }
    } catch (error) {
        console.warn("Could not load JSON, using session data only.");
    }

    // FALLBACK: If user not in JSON (New User), build object from Session
    if (!currentUser) {
        console.log("User not found in JSON (New Session User). Using Session Storage.");
        currentUser = {
            username: sessionStorage.getItem('username'),
            email: sessionStorage.getItem('email'), // Retrieved from session
            birthday: sessionStorage.getItem('birthday'), // Retrieved from session
            admin: sessionStorage.getItem('isAdmin') === 'true'
        };
    }

    // A. Populate Personal Info
    populatePersonalInfo(currentUser);

    // B. Check if Admin (Only works if user is in JSON or explicitly set in session)
    if (currentUser.admin === true) {
        // If the array is empty (fetch failed), we can't show the table
        if (allUsers.length > 0) {
            populateAdminDashboard(allUsers);
        } else {
            // Optional: Hide admin section or show message
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
            const roleBadge = user.admin 
                ? '<span class="badge bg-primary">Admin</span>' 
                : '<span class="badge bg-secondary">User</span>';

            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>${user.birthday || '-'}</td>
                <td>${roleBadge}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}