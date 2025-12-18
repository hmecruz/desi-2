let userDatabase = [];

// 1. Initialize immediately
loadUserDatabase();
checkSessionOnLoad();

// --- Database & Session Logic ---

async function loadUserDatabase() {
    try {
        const response = await fetch('../json/users.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        userDatabase = users;
        console.log("User database loaded from JSON:", userDatabase);
    } catch (error) {
        console.error("Failed to load user database:", error);
    }
}

function checkSessionOnLoad() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const username = sessionStorage.getItem('username');
    if (isLoggedIn && username) {
        updateNavbarUI(username, true);
}
}

function saveUserSession(user) {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('isAdmin', user.admin);
    sessionStorage.setItem('email', user.email); 
    sessionStorage.setItem('birthday', user.birthday);
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = "index.html"; 
}

// --- Navigation / Form Switching ---

function switchForm(formToShow) {
    const loginForm = document.getElementById("login");
    const createForm = document.getElementById("createAccount");
    const forgotForm = document.getElementById("forgotPassword");

    // Hide all
    loginForm.classList.add("form--hidden");
    createForm.classList.add("form--hidden");
    forgotForm.classList.add("form--hidden");

    // Clear errors before switching
    clearAllErrors(loginForm);
    clearAllErrors(createForm);
    clearAllErrors(forgotForm);

    // Show specific
    if (formToShow === 'login') loginForm.classList.remove("form--hidden");
    if (formToShow === 'create') createForm.classList.remove("form--hidden");
    if (formToShow === 'forgot') forgotForm.classList.remove("form--hidden");
}

// --- Form Handlers (Called by HTML) ---

function handleLogin(e) {
    e.preventDefault();
    const form = document.getElementById("login");
    const idInput = document.getElementById('loginIdentifier');
    const passInput = document.getElementById('loginPassword');
    
    const identifier = idInput.value.trim();
    const password = passInput.value;
    
    let hasError = false;

    if (!identifier) {
        setInputError(idInput, "Nome de utilizador ou Email necessário");
        hasError = true;
    }
    if (!password) {
        setInputError(passInput, "Password necessária");
        hasError = true;
    }

    if (hasError) {
        setFormMessage(form, "error", "Preencha todos os campos necessários");
        return;
    }

    // Authentication Logic
    const user = userDatabase.find(u => 
        (u.username === identifier || u.email === identifier) && u.password === password
    );

    if (user) {
        saveUserSession(user);
        updateNavbarUI(user.username, true);
        setFormMessage(form, "success", "Login bem-sucedido! A redirecionar...");
        setTimeout(() => window.location.href = "index.html", 1000);
    } else {
        setFormMessage(form, "error", "Credenciais inválidas");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const form = document.getElementById("createAccount");
    
    const usernameIn = document.getElementById('signupUsername');
    const emailIn = document.getElementById('email');
    const passIn = document.getElementById('password');
    const confirmIn = document.getElementById('confirmPassword');
    const termsCheck = document.getElementById('checkboxTerms');
    const adminCheck = document.getElementById('checkboxAdmin');
    
    // Date inputs
    const day = parseInt(document.getElementById('bdayDay').value);
    const month = document.getElementById('bdayMonth').value ? parseInt(document.getElementById('bdayMonth').value) : null;
    const year = parseInt(document.getElementById('bdayYear').value);

    let hasError = false;
    setFormMessage(form, "", "");
    document.getElementById('termsError').textContent = "";

    // 1. Validation
    if (usernameIn.value.trim().length < 3) {
        setInputError(usernameIn, "Mínimo 3 caracteres");
        hasError = true;
    } else if (userDatabase.find(u => u.username === usernameIn.value.trim())) {
        setInputError(usernameIn, "Nome já existe");
        hasError = true;
    } else {
        clearInputError(usernameIn);
}

    if (!validateEmail(emailIn.value.trim())) {
        setInputError(emailIn, "Email inválido");
        hasError = true;
    } else if (userDatabase.find(u => u.email === emailIn.value.trim())) {
        setInputError(emailIn, "Email já registado");
        hasError = true;
    } else {
        clearInputError(emailIn);
    }

    if (!validateBirthday(day, month, year)) hasError = true;

    if (passIn.value.length < 8) {
        setInputError(passIn, "Mínimo 8 caracteres");
        hasError = true;
    } else {
        clearInputError(passIn);
    }

    if (passIn.value !== confirmIn.value) {
        setInputError(confirmIn, "Passwords não coincidem");
        hasError = true;
    } else {
        clearInputError(confirmIn);
    }

    if (!termsCheck.checked) {
        document.getElementById('termsError').textContent = "Deve aceitar os termos.";
        hasError = true;
    }

    if (hasError) {
        setFormMessage(form, "error", "Corrija os erros acima");
        return;
    }

    // 2. Success
    const newUser = {
        username: usernameIn.value.trim(),
        email: emailIn.value.trim(),
        password: passIn.value,
        admin: adminCheck.checked,
        birthday: `${day}/${month}/${year}`
    };

    userDatabase.push(newUser);
    
    setFormMessage(form, "success", "Conta criada! A redirecionar...");
    
    form.reset();
    setTimeout(() => {
        switchForm('login');
        setFormMessage(document.getElementById("login"), "success", "Registo concluído. Faça login.");
    }, 1500);
}

function handleRecovery(e) {
    e.preventDefault();
    const form = document.getElementById("forgotPassword");
    const input = document.getElementById('recoveryIdentifier');
    const val = input.value.trim();

    clearInputError(input);
    setFormMessage(form, "", "");

    if (!val) {
        setInputError(input, "Campo obrigatório");
        return;
    }

    const user = userDatabase.find(u => u.username === val || u.email === val);
    
    if (user) {
        input.value = '';
        setFormMessage(form, "success", "Email de recuperação enviado (simulado).");
    } else {
        setFormMessage(form, "error", "Utilizador não encontrado.");
    }
}

// --- UI Helper Functions ---

function updateNavbarUI(username, isLoggedIn) {
    const guestBtn = document.getElementById('auth-button-guest');
    const userDrop = document.getElementById('auth-dropdown-user');
    const userDisplay = document.getElementById('loggedInUsername');

    if (isLoggedIn) {
        if (guestBtn) guestBtn.classList.add('d-none');
        if (userDrop) userDrop.classList.remove('d-none');
        if (userDisplay) userDisplay.textContent = username;
    } else {
        if (guestBtn) guestBtn.classList.remove('d-none');
        if (userDrop) userDrop.classList.add('d-none');
    }
}

function validateEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function validateBirthday(day, month, year) {
    if (!day || day < 1 || day > 31) {
        setInputError(document.getElementById('bdayDay'), "Inválido");
        return false;
    }
    clearInputError(document.getElementById('bdayDay'));

    if (!month) {
        setInputError(document.getElementById('bdayMonth'), "Selecione");
        return false;
    }
    clearInputError(document.getElementById('bdayMonth'));

    const currentYear = new Date().getFullYear();
    if (!year || year < 1900 || year > currentYear) {
        setInputError(document.getElementById('bdayYear'), "Inválido");
        return false;
    }
    clearInputError(document.getElementById('bdayYear'));
    
        const date = new Date(year, month - 1, day);
        if (date.getMonth() + 1 != month || date.getDate() != day) {
            setInputError(document.getElementById('bdayDay'), "Data inválida");
            return false;
        }
    return true;
}

function setFormMessage(form, type, msg) {
    const el = form.querySelector(".form__message");
    el.textContent = msg;
    el.className = `form__message form__message--${type}`;
}

function setInputError(input, msg) {
    input.classList.add("form__input--error");
    if (input.closest('.col-4')) {
        input.closest('.col-4').querySelector(".form__input-error-message").textContent = msg;
        } else {
        input.parentElement.querySelector(".form__input-error-message").textContent = msg;
    }
}

function clearInputError(input) {
    input.classList.remove("form__input--error");
    if (input.closest('.col-4')) {
        input.closest('.col-4').querySelector(".form__input-error-message").textContent = "";
        } else {
        const msgEl = input.parentElement.querySelector(".form__input-error-message");
        if(msgEl) msgEl.textContent = "";
    }
}

function clearAllErrors(form) {
    form.querySelectorAll(".form__input").forEach(i => clearInputError(i));
    form.querySelector(".form__message").textContent = "";
    if (document.getElementById('termsError')) document.getElementById('termsError').textContent = "";
        }