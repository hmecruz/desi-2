document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Check (unchanged)
    const sessionUsername = sessionStorage.getItem('username');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn || !sessionUsername) {
        window.location.href = "register_login.html";
        return; 
    }

    // --- FIX 2: Correctly update the Navbar UI on this page ---
    // The previous implementation was insufficient because it only ran the initial check.
    updateNavbarUI(sessionUsername, true);
    // -----------------------------------------------------------

    // 2. Initialize Page Data
    fetchAndDisplayData(sessionUsername);

    // 3. Attach Logout Logic (unchanged)
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});

// --- New/Updated Helper Functions for Navbar UI (Needed on this page) ---
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
// --------------------------------------------------------------------------


/**
 * Fetches user data from JSON, merges it with session data, and orchestrates DOM updates.
 */
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

    // --- FIX 1: Merge Logic (Handle New Users & Duplicates) ---

    // 1. Build the object for the currently logged-in user using session data.
    const sessionUser = {
        username: sessionStorage.getItem('username'),
        email: sessionStorage.getItem('email'),
        birthday: sessionStorage.getItem('birthday'),
        admin: sessionStorage.getItem('isAdmin') === 'true'
    };

    // 2. If the current user was not found in the JSON (i.e., they just registered):
    if (!currentUser) {
        console.log("Current user not found in JSON. Merging session data into table view.");
        
        // Use session data for personal profile display
        currentUser = sessionUser;

        // Add the session user to the allUsers array for the Admin table view, avoiding duplicates by checking username.
        if (!allUsers.some(user => user.username === sessionUser.username)) {
             // Only add if the user's username is genuinely new
            allUsers.push(sessionUser);
        }
    } else {
         // If user WAS found in JSON (like a mock admin), use the JSON data for personal display.
         // Ensure the admin status reflects the JSON data in this case.
         currentUser.admin = currentUser.admin === true; // Ensure boolean consistency
    }
    // -----------------------------------------------------------

    // A. Populate Personal Info Section
    populatePersonalInfo(currentUser);

    // B. Check if Admin and Populate Dashboard (using the potentially merged allUsers array)
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

/**
 * Injects user data into the "Personal Info" card (Unchanged)
 */
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

/**
 * Unhides the Admin Section and builds the table (Modified slightly for consistency)
 */
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