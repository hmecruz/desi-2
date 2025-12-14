/********
 * Alterações do TP2
 */
// Função para mensagem no preenchimento do formulário

function enviarFormulario() {
    // Obter os valores dos campos
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;

    // Caso não se preencha algum campo
    if (name === "" || email === "" || message === "") {
        alert("Por favor preencha todos os campos obrigatórios.");
        return; 
    }
    // Perguntar se deseja confirmar o envio da mensagem
    var ok = confirm("Deseja enviar a mensagem?");

    //Caso carregue no ok
    if (ok) {
        alert("Mensagem enviada com sucesso!");
    // Caso carregue no cancelar (o formulário volta a ficar em branco)
    } else {
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
        document.getElementById("project").value = "";
    }
}

// Fim da função para mensagem no preenchimento do formulário

// Função botão de fast contact

function enviarcontacto() {

  // Obter os valores dos campos
    var telefone = document.getElementById("telefone").value; 

    // Erro caso não preencham 
    if (telefone === "") {
        alert("Por favor, insira o seu número de telefone."); 
        return; 
    }
 
    // Verificar se inseriram um número (pois letras não é válido)
    var numTelefonico = parseInt(telefone); 

    if (numTelefonico * 1 != numTelefonico) { 
        alert("O contacto deve conter apenas números.");
        return;
    }

    // Confirmação de envio do número de telefone
    var confirmacao = confirm("Confirma o envio do número " + telefone + " para contacto?");

     // Se confirmar 
    if (confirmacao) { 
        alert("Obrigado! Ligaremos para si o mais brevemente possível.");
        document.getElementById("telefone").value = ""; 
        
    // Se cancelar 
    } else { 
        document.getElementById("telefone").value = "";
    }
}
// Fim da Função botão de fast contact