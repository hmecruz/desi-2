document.addEventListener("DOMContentLoaded", () => {
    const sessionUsername = sessionStorage.getItem('username');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn || !sessionUsername) {
        window.location.href = "register_login.html";
        return; 
    }

    updateNavbarUI(sessionUsername, true);
    // -----------------------------------------------------------

    fetchAndDisplayData(sessionUsername);

    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});

function updateNavbarUI(username, isLoggedIn) {
    const guestButtonContainer = document.getElementById('auth-button-guest');
    const userDropdownContainer = document.getElementById('auth-dropdown-user');
    const usernameDisplay = document.getElementById('loggedInUsername');

    if (isLoggedIn) {
        // Logged in: Hide guest button, show user dropdown
        if (guestButtonContainer) {
            guestButtonContainer.classList.add('d-none');
        }
        if (userDropdownContainer) {
            userDropdownContainer.classList.remove('d-none');
        }
        if (usernameDisplay) {
            usernameDisplay.textContent = username;
        }
    } else {
        // Logged out: Show guest button, hide user dropdown
        if (guestButtonContainer) {
            guestButtonContainer.classList.remove('d-none');
        }
        if (userDropdownContainer) {
            userDropdownContainer.classList.add('d-none');
        }
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
        console.warn("Could not load JSON. Proceeding with session data only.", error);
    }

    // 1. Build the object for the currently logged-in user using session data.
    const sessionUser = {
        username: sessionStorage.getItem('username'),
        email: sessionStorage.getItem('email'),
        birthday: sessionStorage.getItem('birthday'),
        admin: sessionStorage.getItem('isAdmin') === 'true'
    };

    // 2. If the current user was not found in the JSON (they just registered):
    if (!currentUser) {
        console.log("Current user not found in JSON. Merging session data into table view.");
        
        // Use session data for personal profile display
        currentUser = sessionUser;

        // Add the session user to the allUsers array for the Admin table view, avoiding duplicates by checking username.
        if (!allUsers.some(user => user.username === sessionUser.username)) {
             // Only add if the user's username is new
            allUsers.push(sessionUser);
        }
    } else {
         currentUser.admin = currentUser.admin === true; 
    }


    populatePersonalInfo(currentUser);

    if (currentUser.admin === true) {
        // We only show the dashboard if we have data to display.
        if (allUsers.length > 0) {
            populateAdminDashboard(allUsers);
        } else {
             // If JSON fetch failed completely, still hide the admin section properly
             document.getElementById('admin-dashboard-section').classList.add('d-none');
        }
    }
}


function populatePersonalInfo(user) {
    // Target DOM elements
    const nameEl = document.getElementById('user-profile-name');
    const roleEl = document.getElementById('user-profile-role');
    const emailEl = document.getElementById('user-profile-email');
    const bdayEl = document.getElementById('user-profile-birthday');

    // Inject Content
    if(nameEl) nameEl.textContent = user.username;
    if(emailEl) emailEl.textContent = user.email || "Email não disponível";
    if(bdayEl) bdayEl.textContent = user.birthday || "Data não disponível";

    // Set Role Badge style and text
    if (roleEl) {
        if (user.admin) {
            roleEl.textContent = "Administrador";
            roleEl.classList.replace('bg-secondary', 'bg-primary'); // Change badge color
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
            
            // Ensure admin status is treated as boolean/true for badge logic
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