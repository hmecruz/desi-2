/* CORE DATA STRUCTURE 
   Uses a global array to store user objects during the current session only.
   (Data is reset when the page is refreshed or closed.)
*/
let userDatabase = [];

// --- User Database Loading ---
async function loadUserDatabase() {
    try {
        // Assume users.json is in the same directory or accessible path
        const response = await fetch('../json/users.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        userDatabase = users;
        console.log("User database loaded from JSON:", userDatabase);
    } catch (error) {
        console.error("Failed to load user database from JSON:", error);
        // Fallback: If JSON loading fails, the database remains empty.
    }
}

/* CORE LOGIC 
*/

// Removed isFormador parameter and logic
function registerUser(username, email, password, isAdmin, birthday) {
    const newUser = {
        username: username,
        email: email,
        password: password,
        admin: isAdmin, // Only 'admin' remains
        birthday: birthday
    };
    
    userDatabase.push(newUser);
    console.log("User registered (in-memory):", newUser);
}

// Function to find user by username or email (used for login and recovery)
function findUser(identifier) {
    return userDatabase.find(user => user.username === identifier || user.email === identifier);
}

function findUserByUsername(username) {
    return userDatabase.find(user => user.username === username);
}

function findUserByEmail(email) {
    return userDatabase.find(user => user.email === email);
}

function authenticateUser(identifier, password) {
    // Check if identifier (username or email) AND password match
    return userDatabase.find(user => 
        (user.username === identifier || user.email === identifier) && user.password === password
    );
}

// --- NEW SESSION MANAGEMENT & NAVBAR UI FUNCTIONS ---

function saveUserSession(user) {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('isAdmin', user.admin);
    sessionStorage.setItem('email', user.email); 
    sessionStorage.setItem('birthday', user.birthday);
    console.log("Session saved for:", user.username);
}

function clearUserSession() {
    // Clear all session data and refresh the page to restore guest UI
    sessionStorage.clear();
    console.log("Session cleared.");
    // Redirect to home or login page after logout
    window.location.href = "index.html"; 
}

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

// ---------------------------------------------------

/* UI HELPER FUNCTIONS 
*/

function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
    // Check if the input is a select box (like the Month dropdown) or a standard input
    if (inputElement.tagName === 'SELECT' || inputElement.type === 'number') {
        // Find the error message element specific to the input's container
        const parentCol = inputElement.closest('.col-4');
        if (parentCol) {
            parentCol.querySelector(".form__input-error-message").textContent = message;
        }
    } else {
        inputElement.classList.add("form__input--error");
        inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
    }
    inputElement.classList.add("form__input--error");
}

function clearInputError(inputElement) {
    // Special handling for grouped birthday inputs
    if (inputElement.tagName === 'SELECT' || inputElement.type === 'number') {
        const parentCol = inputElement.closest('.col-4');
        if (parentCol) {
            parentCol.querySelector(".form__input-error-message").textContent = "";
        }
    } else {
        inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
    }
    inputElement.classList.remove("form__input--error");
}

function clearAllErrors(formElement) {
    const inputs = formElement.querySelectorAll(".form__input");
    inputs.forEach(input => clearInputError(input));
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = "";
    
    // Clear Terms & Conditions specific error
    const termsError = document.getElementById('termsError');
    if (termsError) termsError.textContent = "";

    // Clear recovery identifier error message specifically
    const recoveryInput = formElement.querySelector('#recoveryIdentifier');
    if (recoveryInput) {
        clearInputError(recoveryInput);
    }
}

/* VALIDATION LOGIC 
*/

function validateEmail(email) {
    const validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return validRegex.test(email);
}

function validateBirthday(day, month, year) {
    let isValid = true;

    // Day validation (1-31)
    if (!day || day < 1 || day > 31) {
        setInputError(document.getElementById('bdayDay'), "Inválido");
        isValid = false;
    } else {
        clearInputError(document.getElementById('bdayDay'));
    }

    // Month validation (1-12)
    if (!month) {
        setInputError(document.getElementById('bdayMonth'), "Selecione");
        isValid = false;
    } else {
        clearInputError(document.getElementById('bdayMonth'));
    }

    // Year validation (simple range check)
    const currentYear = new Date().getFullYear();
    if (!year || year < 1900 || year > currentYear) {
        setInputError(document.getElementById('bdayYear'), "Inválido");
        isValid = false;
    } else {
        clearInputError(document.getElementById('bdayYear'));
    }
    
    // Additional check for day/month compatibility (e.g., Feb 30) - basic leap year ignored for brevity
    if (isValid && day && month && year) {
        const date = new Date(year, month - 1, day);
        if (date.getMonth() + 1 != month || date.getDate() != day) {
            setInputError(document.getElementById('bdayDay'), "Data inválida");
            setFormMessage(document.querySelector("#createAccount"), "error", "Data de nascimento inválida");
            return false;
        }
    }

    return isValid;
}


/* EVENT LISTENERS SETUP 
*/

document.addEventListener("DOMContentLoaded", () => {
    // Load users from JSON immediately on page load
    loadUserDatabase();

    // --- NEW: Check Session and Update UI on load ---
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const username = sessionStorage.getItem('username');
    if (isLoggedIn && username) {
        updateNavbarUI(username, true);
    }
    // ------------------------------------------------

    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const forgotPasswordForm = document.querySelector("#forgotPassword"); 

    // --- Logout Listener (NEW) ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            clearUserSession();
        });
    }

    // --- Toggle: Switch to Create Account ---
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        clearAllErrors(loginForm);
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
        forgotPasswordForm.classList.add("form--hidden"); // Ensure recovery is hidden
    });

    // --- Toggle: Switch to Login (From Register) ---
    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        clearAllErrors(createAccountForm);
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
        forgotPasswordForm.classList.add("form--hidden"); // Ensure recovery is hidden
    });

    // --- Toggle: Switch to Forgot Password (From Login) ---
    document.querySelector("#linkForgotPassword").addEventListener("click", e => { 
        e.preventDefault();
        clearAllErrors(loginForm);
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.add("form--hidden");
        forgotPasswordForm.classList.remove("form--hidden");
    });
    
    // --- Toggle: Switch to Login (From Forgot Password) ---
    document.querySelector("#linkForgotPasswordLogin").addEventListener("click", e => { 
        e.preventDefault();
        clearAllErrors(forgotPasswordForm);
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
        forgotPasswordForm.classList.add("form--hidden");
    });

    // --- LOGIN SUBMIT ---
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const identifierInput = document.getElementById('loginIdentifier');
        const passwordInput = document.getElementById('loginPassword');
        
        const identifier = identifierInput.value.trim();
        const password = passwordInput.value;
        let hasError = false;

        // Basic Empty Check
        if (!identifier) {
            setInputError(identifierInput, "Nome de utilizador ou Email necessário");
            hasError = true;
        }
        if (!password) {
            setInputError(passwordInput, "Password necessária");
            hasError = true;
        }

        if (hasError) {
             setFormMessage(loginForm, "error", "Preencha todos os campos necessários");
             return;
        }

        // Authentication Check
        const user = authenticateUser(identifier, password); 

        if (user) {
            // KEY CHANGE: Save session and update UI
            saveUserSession(user);
            updateNavbarUI(user.username, true); // Update navbar immediately

            setFormMessage(loginForm, "success", "Login bem-sucedido! A redirecionar...");
            
            setTimeout(() => {
                // Simplified login redirect based only on 'admin' status
                if (user.admin === true) {
                    window.location.href = "index.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 1000);
        } else {
            setFormMessage(loginForm, "error", "Nome de utilizador/Email ou password inválidos");
        }
    });
    
    // --- FORGOT PASSWORD SUBMIT (NEW FEATURE) ---
    forgotPasswordForm.addEventListener("submit", e => {
        e.preventDefault();
        const recoveryIdentifierInput = document.getElementById('recoveryIdentifier');
        const identifier = recoveryIdentifierInput.value.trim();
        
        clearInputError(recoveryIdentifierInput);
        setFormMessage(forgotPasswordForm, "", "");

        if (!identifier) {
            setInputError(recoveryIdentifierInput, "Nome de utilizador ou Email necessário");
            setFormMessage(forgotPasswordForm, "error", "Preencha o campo necessário.");
            return;
        }
        
        // Check if user exists by username or email
        const user = findUser(identifier);

        if (user) {
            // Success case: user found
            recoveryIdentifierInput.value = ''; // Clear input
            setFormMessage(forgotPasswordForm, "success", "Se a conta estiver registada, será enviado um email de restauração.");
        } else {
            // Failure case: user not found
            setFormMessage(forgotPasswordForm, "error", "Nome do utilizador ou email inválidos");
        }
    });

    // --- REGISTER SUBMIT ---
    createAccountForm.addEventListener("submit", e => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('signupUsername');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        // Only need checkboxInputAdmin now
        const checkboxInputAdmin = document.getElementById('checkboxAdmin');
        
        const checkboxInputTerms = document.getElementById('checkboxTerms');

        const dayInput = document.getElementById('bdayDay');
        const monthInput = document.getElementById('bdayMonth');
        const yearInput = document.getElementById('bdayYear');
        const termsErrorElement = document.getElementById('termsError');

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const bdayDay = parseInt(dayInput.value);
        const bdayMonth = monthInput.value ? parseInt(monthInput.value) : null;
        const bdayYear = parseInt(yearInput.value);

        let hasError = false;

        // Clear previous messages
        setFormMessage(createAccountForm, "", "");
        termsErrorElement.textContent = "";


        // 1. Validate Username
        if (username.length < 3) {
            setInputError(usernameInput, "O nome de utilizador deve ter pelo menos 3 caracteres");
            hasError = true;
        } else if (findUserByUsername(username)) {
            setInputError(usernameInput, "Nome de utilizador já registado");
            hasError = true;
        } else {
            clearInputError(usernameInput);
        }

        // 2. Validate Email
        if (!validateEmail(email)) {
            setInputError(emailInput, "Endereço de email inválido");
            hasError = true;
        } else if (findUserByEmail(email)) {
            setInputError(emailInput, "Email já registado");
            hasError = true;
        } else {
            clearInputError(emailInput);
        }
        
        // 3. Validate Birthday
        if (!validateBirthday(bdayDay, bdayMonth, bdayYear)) {
             hasError = true;
        }

        // 4. Validate Password
        if (password.length < 8) {
            setInputError(passwordInput, "A password deve ter pelo menos 8 caracteres");
            hasError = true;
        } else {
            clearInputError(passwordInput);
        }

        // 5. Validate Confirm Password
        if (password !== confirmPassword) {
            setInputError(confirmPasswordInput, "As passwords não coincidem");
            hasError = true;
        } else {
            clearInputError(confirmPasswordInput);
        }
        
        // 6. Validate Terms and Conditions
        if (!checkboxInputTerms.checked) {
            termsErrorElement.textContent = "É obrigatório aceitar os termos e condições.";
            hasError = true;
        }

        // Stop if errors
        if (hasError) {
            setFormMessage(createAccountForm, "error", "Corrija os erros destacados acima");
            return;
        }
        
        // Format birthday for storage
        const birthdayString = `${bdayDay}/${bdayMonth}/${bdayYear}`;

        // Success: Register User (Removed formador argument)
        registerUser(
            username, 
            email, 
            password, 
            checkboxInputAdmin.checked,
            birthdayString
        );
        
        setFormMessage(createAccountForm, "success", "Conta criada com sucesso! A redirecionar para o login...");
        
        // Reset form and switch to login after delay
        createAccountForm.reset();
        setTimeout(() => {
            clearAllErrors(createAccountForm);
            createAccountForm.classList.add("form--hidden");
            loginForm.classList.remove("form--hidden");
            setFormMessage(loginForm, "success", "Registo concluído. Por favor, inicie sessão.");
        }, 1500);
    });

    // --- REAL-TIME INPUT CLEARING ---
    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("input", () => {
            clearInputError(inputElement);
        });
        // Clear Month error on change
        if (inputElement.id === 'bdayMonth') {
            inputElement.addEventListener("change", () => {
                clearInputError(inputElement);
            });
        }
    });
    
    // Clear Terms error on check
    document.getElementById('checkboxTerms').addEventListener('change', () => {
        const termsErrorElement = document.getElementById('termsError');
        if (document.getElementById('checkboxTerms').checked) {
            termsErrorElement.textContent = "";
        }
    });
});