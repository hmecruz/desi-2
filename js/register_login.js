/* CONSTANTS & STATE MANAGEMENT 
*/
const DB_KEY = 'code_website_users'; // Key for LocalStorage
let userDatabase = [];

/* INITIALIZATION 
    1. Load users from LocalStorage.
    2. If LocalStorage is empty, fetch from accounts.json to populate defaults.
*/
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load LocalStorage
    const storedUsers = localStorage.getItem(DB_KEY);
    
    if (storedUsers) {
        userDatabase = JSON.parse(storedUsers);
    } else {
        // 2. Fetch from JSON file if LocalStorage is empty
        try {
            const response = await fetch('json/accounts.json');
            if (response.ok) {
                const jsonData = await response.json();
                userDatabase = jsonData;
                // Save initial JSON data to LocalStorage so we can append to it later
                saveToLocalStorage(); 
            }
        } catch (error) {
            console.warn("Could not load accounts.json. Starting with empty database.", error);
        }
    }

    setupEventListeners();
});

/* CORE LOGIC 
*/

function saveToLocalStorage() {
    localStorage.setItem(DB_KEY, JSON.stringify(userDatabase));
}

function registerUser(username, email, password, isFormador) {
    const newUser = {
        username: username,
        email: email,
        password: password,
        formador: isFormador // Boolean
    };
    
    userDatabase.push(newUser);
    saveToLocalStorage();
    console.log("User registered:", newUser);
}

function findUser(username) {
    return userDatabase.find(user => user.username === username);
}

function findUserByEmail(email) {
    return userDatabase.find(user => user.email === email);
}

function authenticateUser(username, password) {
    return userDatabase.find(user => user.username === username && user.password === password);
}

/* UI HELPER FUNCTIONS 
*/

function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}

function clearAllErrors(formElement) {
    const inputs = formElement.querySelectorAll(".form__input");
    inputs.forEach(input => clearInputError(input));
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = "";
}

/* VALIDATION LOGIC 
*/

function validateEmail(email) {
    const validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return validRegex.test(email);
}

/* EVENT LISTENERS SETUP 
*/

function setupEventListeners() {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    // Toggle: Switch to Create Account
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        clearAllErrors(loginForm);
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    // Toggle: Switch to Login
    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        clearAllErrors(createAccountForm);
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });

    // --- LOGIN SUBMIT ---
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        let hasError = false;

        // Basic Empty Check
        if (!username) {
            setInputError(usernameInput, "Username is required");
            hasError = true;
        }
        if (!password) {
            setInputError(passwordInput, "Password is required");
            hasError = true;
        }

        if (hasError) return;

        // Authentication Check
        const user = authenticateUser(username, password);

        if (user) {
            setFormMessage(loginForm, "success", "Login successful! Redirecting...");
            
            // Redirect based on user role (formador vs formando)
            setTimeout(() => {
                if (user.formador === true || user.formador === "true") {
                    window.location.href = "formadores.html";
                } else {
                    window.location.href = "formando.html";
                }
            }, 1000);
        } else {
            setFormMessage(loginForm, "error", "Invalid username or password combination");
        }
    });

    // --- REGISTER SUBMIT ---
    createAccountForm.addEventListener("submit", e => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('signupUsername');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const checkboxInput = document.getElementById('checkboxID');

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        let hasError = false;

        // 1. Validate Username
        if (username.length < 3) {
            setInputError(usernameInput, "Username must be at least 3 characters");
            hasError = true;
        } else if (findUser(username)) {
            setInputError(usernameInput, "Username already taken");
            hasError = true;
        } else {
            clearInputError(usernameInput);
        }

        // 2. Validate Email
        if (!validateEmail(email)) {
            setInputError(emailInput, "Invalid email address");
            hasError = true;
        } else if (findUserByEmail(email)) {
            setInputError(emailInput, "Email already registered");
            hasError = true;
        } else {
            clearInputError(emailInput);
        }

        // 3. Validate Password
        if (password.length < 8) {
            setInputError(passwordInput, "Password must be at least 8 characters");
            hasError = true;
        } else {
            clearInputError(passwordInput);
        }

        // 4. Validate Confirm Password
        if (password !== confirmPassword) {
            setInputError(confirmPasswordInput, "Passwords do not match");
            hasError = true;
        } else {
            clearInputError(confirmPasswordInput);
        }

        // Stop if errors
        if (hasError) {
            setFormMessage(createAccountForm, "error", "Please fix the errors above");
            return;
        }

        // Success: Register User
        registerUser(username, email, password, checkboxInput.checked);
        
        setFormMessage(createAccountForm, "success", "Account created! Redirecting to login...");
        
        // Reset form and switch to login after delay
        createAccountForm.reset();
        setTimeout(() => {
            createAccountForm.classList.add("form--hidden");
            loginForm.classList.remove("form--hidden");
            setFormMessage(createAccountForm, "", ""); // Clear success message
        }, 1500);
    });

    // --- REAL-TIME INPUT CLEARING ---
    // Clears error messages as soon as the user starts typing
    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("input", () => {
            clearInputError(inputElement);
        });
    });
}