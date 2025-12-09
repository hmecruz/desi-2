    /*Data Base*/

var dataBase = [];

function addDict(username, password, email, formador){
    var dict = {username: username, password: password, email: email, formador: formador};
    dataBase.push(dict);
}

function printDataBase(){
    for(let i = 0; i < dataBase.length; i++){
        for(let j in dataBase[i]){
            console.log(j + ": " + dataBase[i][j]);
        }
    }
}

function checkKey(key, value){
    if(key == "username"){
        return (dataBase.some(e => e.username == value));
    }
    if(key == "password"){
        return (dataBase.some(e => e.password == value)); 
    }
    if(key == "email"){
        return (dataBase.some(e => e.email == value)); 
    }
    if(key == "formador"){
        return (dataBase.some(e => e.formador == value)); 
    }
}

function checkKeyValue(username, password){
    for(let i = 0; i < dataBase.length; i++){
        if(dataBase[i]['username'] === username && dataBase[i]['password'] === password){
            return true;
        }
    }
    return false;
}

function checkKeyValueCheckbox(username, password){
    for(let i = 0; i < dataBase.length; i++){
        if(dataBase[i]['username'] === username && dataBase[i]['password'] === password && dataBase[i]['formador'] === true){
            return true;
        }
    }
    return false;
}

    /*Functions*/

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


    // Register Fields Validation

function validateUsername(){
    if(document.getElementById('signupUsername').value.length > 0 && document.getElementById('signupUsername').value.length < 3){
        return false;
    }
    return true
}

function existantUsername(){
    return checkKey("username", document.getElementById('signupUsername').value); 
}

function validateEmail(email){
    var validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (email.value.match(validRegex) || email.value.length == 0) {
        return true;
    } 
    return false;
}

function existantEmail(){
    return checkKey("email", document.getElementById('email').value); 
}

function validatePassword(){
    if(document.getElementById('password').value.length > 0 && document.getElementById('password').value.length < 8){
        return false;
    }
    return true;
}


function validateConfirmPassword(){
    if(document.getElementById('password').value == document.getElementById('confirmPassword').value){
        return true;
    }
    return false;
}

function validateAllFields(){
    if(validateUsername() && validateEmail(document.getElementById('email')) && validatePassword() && validateConfirmPassword()){
        return true;
    } 
    return false;
}

function emptyFields(){
    if(document.getElementById('signupUsername').value.length == 0 || document.getElementById('email').value.length == 0 || document.getElementById('password').value.length == 0 || document.getElementById('confirmPassword').value.length == 0){
        return true;
    }
    return false;
}

    // Login Fields Validation

function validateLoginUsername(){
    if(document.getElementById('loginUsername').value.length > 0 && document.getElementById('loginUsername').value.length < 3){
        return false;
    }
    return true
}

function existantLoginUsernamePassword(){
    //console.log(checkKeyValue(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value));
    return (checkKeyValue(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value));
}


function validateLoginPassword(){
    if(document.getElementById('loginPassword').value.length > 0 && document.getElementById('loginPassword').value.length < 8){
        return false;
    }
    return true;
}

function validateAllLoginFields(){
    if(validateLoginUsername() && validateLoginPassword()){
        return true
    }
    return false;
}

function emptyLoginFields(){
    if(document.getElementById('loginUsername').value.length == 0 || document.getElementById('loginPassword').value.length == 0 ){
        return true;
    }
    return false;
}

function checkBoxFormador(){
    return (checkKeyValueCheckbox(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value));
}


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });

    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        // Perform your AJAX/Fetch login
        if(!validateAllLoginFields() || !existantLoginUsernamePassword()){
            setFormMessage(loginForm, "error", "Invalid username/password combination");
        } 
        if(emptyLoginFields()){
            setFormMessage(loginForm, "error", "There are empty fields");
        }
        if(existantLoginUsernamePassword() && checkBoxFormador()){
            window.location.href = "formadores.html";
        }
        if(existantLoginUsernamePassword() && !checkBoxFormador()){
            window.location.href = "formando.html";
        }
    });

    createAccountForm.addEventListener("submit", e => {
        e.preventDefault();

        // Perform your AJAX/Fetch login
        if(!validateAllFields()){
            setFormMessage(createAccountForm, "error", "There are invalid fields");
        } 
        if(emptyFields()){
            setFormMessage(createAccountForm, "error", "There are empty fields");
        }
        if(validateAllFields() && !emptyFields() && !existantUsername() && !existantEmail()){
            addDict(document.getElementById('signupUsername').value, document.getElementById('password').value, document.getElementById('email').value, document.getElementById('checkboxID').checked);
            var delayInMilliseconds = 1500; //1 second
            setTimeout(function() {
                loginForm.classList.remove("form--hidden");
                createAccountForm.classList.add("form--hidden");
            }, delayInMilliseconds);
            printDataBase();
        }
        else if(existantUsername() || existantEmail()){
            setFormMessage(createAccountForm, "error", "This account has already been registered");
        } 
    });

    var delayInMilliseconds = 1000; //1 second

setTimeout(function() {
    loginForm.classList.remove("form--hidden");
    createAccountForm.classList.add("form--hidden");
}, delayInMilliseconds);


    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername") {
                if(existantUsername()){
                    setInputError(inputElement, "Username has already been registered");
                }
                if(!(validateUsername())){
                    setInputError(inputElement, "Username must be at least 3 characters in length");
                }
            }
            if (e.target.id === "email") {
                if(existantEmail()){
                    setInputError(inputElement, "Email has already been registered");
                }
                if(!validateEmail(inputElement)){
                    setInputError(inputElement, "Email must be in the format xxxxx@xxxxx.xxx");
                }
            }
            if (e.target.id === "password") {
                if(!validatePassword()){
                    setInputError(inputElement, "Password is too weak. Must be at least 8 characters in length");
                }
                else if (!validateConfirmPassword()) {
                    setInputError(document.getElementById('confirmPassword'), "Password and Confirm Password don't match");
                }
                else clearInputError(document.getElementById('confirmPassword'));
            }
            if (e.target.id === "confirmPassword" && !validateConfirmPassword()) {
                setInputError(document.getElementById('confirmPassword'), "Password and Confirm Password don't match");
            }
            if(validateAllFields() && !emptyFields()){
                setFormMessage(createAccountForm, "success", "All Good");
            }
            if(validateAllLoginFields() && !emptyLoginFields() && existantLoginUsernamePassword()){
                setFormMessage(loginForm, "success", "All Good");
            }
        });
        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
   
});