/* CORE DATA STRUCTURE 
   Uses a global array to store user objects during the current session only.
   (Data is reset when the page is refreshed or closed.)
*/
let userDatabase = [];

// --- Mock Data Initialization (Optional) ---
// Add a few test users immediately upon script load.
(function initializeMockUsers() {
    userDatabase.push({
        username: "admin",
        password: "password123",
        email: "admin@code.com",
        formador: true
    });
    userDatabase.push({
        username: "user",
        password: "password123",
        email: "user@code.com",
        formador: false
    });
})();


/* CORE LOGIC 
*/

function registerUser(username, email, password, isFormador) {
    const newUser = {
        username: username,
        email: email,
        password: password,
        formador: isFormador // Boolean
    };
    
    userDatabase.push(newUser);
    console.log("User registered (in-memory):", newUser);
    // Optional: console.log(userDatabase);
}

function findUser(username) {
    // Check if username exists
    return userDatabase.find(user => user.username === username);
}

function findUserByEmail(email) {
    // Check if email exists
    return userDatabase.find(user => user.email === email);
}

function authenticateUser(username, password) {
    // Check if username AND password match
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

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    // --- Toggle: Switch to Create Account ---
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        clearAllErrors(loginForm);
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    // --- Toggle: Switch to Login ---
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
            setInputError(usernameInput, "Nome de utilizador necessário");
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
        const user = authenticateUser(username, password);

        if (user) {
            setFormMessage(loginForm, "success", "Login bem-sucedido! A redirecionar...");
            
            // Redirect based on user role (formador vs formando)
            setTimeout(() => {
                // Check using strict boolean or string 'true' just in case
                if (user.formador === true || user.formador === "true") {
                    window.location.href = "formadores.html";
                } else {
                    window.location.href = "formando.html";
                }
            }, 1000);
        } else {
            setFormMessage(loginForm, "error", "Nome de utilizador ou password inválidos");
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

        // Clear previous messages
        setFormMessage(createAccountForm, "", "");

        // 1. Validate Username
        if (username.length < 3) {
            setInputError(usernameInput, "O nome de utilizador deve ter pelo menos 3 caracteres");
            hasError = true;
        } else if (findUser(username)) {
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

        // 3. Validate Password
        if (password.length < 8) {
            setInputError(passwordInput, "A password deve ter pelo menos 8 caracteres");
            hasError = true;
        } else {
            clearInputError(passwordInput);
        }

        // 4. Validate Confirm Password
        if (password !== confirmPassword) {
            setInputError(confirmPasswordInput, "As passwords não coincidem");
            hasError = true;
        } else {
            clearInputError(confirmPasswordInput);
        }

        // Stop if errors
        if (hasError) {
            setFormMessage(createAccountForm, "error", "Corrija os erros destacados acima");
            return;
        }

        // Success: Register User
        registerUser(username, email, password, checkboxInput.checked);
        
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
    });
});