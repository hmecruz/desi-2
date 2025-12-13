
function calcularOrcamento() {

    // Ler o valor da escolha do Pacote Base (String: "simples", "blog", ou "e_commerce")
    var tipoWebsite = document.getElementById("tipo_website").value; 
    
    // Ler os valores dos campos numéricos e convertê-los 

    var horas = parseFloat(document.getElementById("horas_personalizacao").value);
    var paginas = parseFloat(document.getElementById("num_paginas").value);

    // Ler o estado dos checkboxes (Boolean: true ou false)
    var temLogin = document.getElementById("login").checked;
    var temApi = document.getElementById("integracao_api").checked;

   //Definir custo base e hora
    
    var custoBase = 0.0;
    var taxaPorHora = 0.0;
    
    // switch (Escolher entre as opções)

    switch (tipoWebsite) {
        case "simples":
            custoBase = 800.00;
            taxaPorHora = 45.00; 
            break;
        case "blog":
            custoBase = 1200.00;
            taxaPorHora = 54.00; 
            break;
        case "e_commerce":
            custoBase = 3500.00;
            taxaPorHora = 81.00;
            break;
        // Caso não seja selecionada nenhuma opção válida
        default:
            alert("Por favor, selecione um tipo de website para iniciar o cálculo.");
            return;
    }

    
    var custoPaginasExtra = paginas * 50.00;
    var custoTotalHoras = horas * taxaPorHora;
    
    // Inicializa o total com os custos base e de horas/páginas
    var totalOrcamento = custoBase + custoTotalHoras + custoPaginasExtra;
    var custoFuncionalidades = 0.0; 

    // Checkboxes
    if (temLogin) {
        totalOrcamento = totalOrcamento + 300.00;
        custoFuncionalidades = custoFuncionalidades + 300.00;
    }

    if (temApi) {
        totalOrcamento = totalOrcamento + 200.00;
        custoFuncionalidades = custoFuncionalidades + 200.00;
    }

    //Resultado

    // Formatação do valor final
    var totalFormatado = totalOrcamento.toFixed(2) + "€"; 

    // Atualizar o valor total final 
    document.getElementById("total-orcamento").textContent = totalFormatado;

    // Gerar o Resumo Detalhado 
    var resumoHTML = "";
    
    // Custo Base
    resumoHTML = resumoHTML + "<li>Preço Base do Website: <strong>" + custoBase.toFixed(2) + "€</strong></li>";
    
    // Custo de Horas
    resumoHTML = resumoHTML + "<li>Custo de Horas (" + horas + "h @ " + taxaPorHora.toFixed(2) + "€/h): <strong>" + custoTotalHoras.toFixed(2) + "€</strong></li>";
    
    // Custo de Páginas
    resumoHTML = resumoHTML + "<li>Custo de Páginas (" + paginas + " páginas @ 50.00€): <strong>" + custoPaginasExtra.toFixed(2) + "€</strong></li>";
    
    // Custo de Funcionalidades 
    resumoHTML = resumoHTML + "<li>Custo de Funcionalidades (Login/APIs): <strong>" + custoFuncionalidades.toFixed(2) + "€</strong></li>";


    // Injetar a lista completa de detalhes no DOM 
    document.getElementById("resumo-orcamento").innerHTML = resumoHTML;

}