// Implementação da Fetch API com async/await para obter o JSON
async function LoadData(file)
{
 let obj = await fetch(file); // Pede o recurso
 let data = await obj.json(); // Converte para objeto JavaScript
 return data;
}

// Função de carregamento e manipulação do DOM
async function carregarEquipa() {
  console.log("Entrei");  
  const container = document.getElementById("equipa-container");

    try {
        let dados_equipa = await LoadData("../json/equipa.json"); // Chama a Fetch API
        let htm = "";
    for (let i = 0; i < dados_equipa.length; i++) { // ... Construção dinâmica da string htm
            const membro = dados_equipa[i];
            htm += '<div class="col-item">'; 
            htm += '  <div class="membro">';
            htm += '    <img src="' + membro.foto + '" alt="' + membro.nome + '" class="membro-foto">';
            htm += '    <h4>' + membro.nome + '</h4>';
            htm += '    <p class="membro-cargo"><strong>' + membro.descricao + '</strong></p>';
            htm += '  </div>';
            htm += '</div>';
        }

        container.innerHTML = htm; // Injeção no DOM

    } catch (error) {
        console.error("Erro ao carregar os dados da equipa:", error);
        container.innerHTML = "<p>Não foi possível carregar os dados da equipa. Verifique o ficheiro JSON ou o caminho das imagens.</p>";
    } // ... Tratamento de erros
}
// Inicia a execução do programa de carregamento
carregarEquipa();