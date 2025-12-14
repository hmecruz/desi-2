let pricingData = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPricingData();
});

// 1. Fetch JSON
async function loadPricingData() {
    try {
        const response = await fetch('../json/servicos.json');
        if (!response.ok) throw new Error("Failed to load pricing configuration");
        
        pricingData = await response.json();
        
        // Build the form based on JSON instructions
        generateFormFromJSON(pricingData);
        
        // Initial Calculation
        calculateBudget();
        
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('form-placeholder').innerHTML = 
            '<div class="alert alert-danger">Erro ao carregar o formulário. Tente novamente.</div>';
    }
}

// 2. Generate HTML (Injection)
function generateFormFromJSON(data) {
    const container = document.getElementById('form-placeholder');
    container.innerHTML = ''; // Clear loading message

    data.forEach(item => {
        let htmlElement = '';

        // SWITCH: Decide which HTML structure to build based on "tipo_input"
        switch (item.tipo_input) {
            
            case 'dropdown':
                // Create Dropdown HTML
                let optionsHtml = '';
                item.opcoes.forEach(opt => {
                    optionsHtml += `<option value="${opt.valor_id}" data-price="${opt.preco}">${opt.nome} (${opt.preco}€)</option>`;
                });

                htmlElement = `
                    <div class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="mb-1 text-muted small">${item.descricao}</p>
                        </div>
                        <div class="w-100 w-md-50">
                            <select id="${item.id}" class="form-select dynamic-input">
                                ${optionsHtml}
                            </select>
                        </div>
                    </div>`;
                break;

            case 'number':
                // Create Number Input HTML
                htmlElement = `
                    <div class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="mb-1 text-muted small">${item.descricao} (${item.preco_base}€ / ${item.unidade})</p>
                        </div>
                        <div class="input-group w-auto">
                            <input type="number" id="${item.id}" value="${item.valor_inicial}" min="0" class="form-control text-center dynamic-input" style="width: 80px;">
                        </div>
                    </div>`;
                break;

            case 'checkbox':
                // Create Checkbox/Switch HTML
                htmlElement = `
                    <div class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="mb-1 text-muted small">${item.descricao} (+${item.preco_base}€)</p>
                        </div>
                        <div class="form-check form-switch p-0 mt-2 mt-md-0">
                            <input class="form-check-input float-none dynamic-input" type="checkbox" role="switch" id="${item.id}">
                        </div>
                    </div>`;
                break;
        }

        // Inject into DOM
        container.insertAdjacentHTML('beforeend', htmlElement);
    });

    // Add Event Listeners to the new inputs for Real-time Calculation
    document.querySelectorAll('.dynamic-input').forEach(input => {
        input.addEventListener('change', calculateBudget);
        input.addEventListener('input', calculateBudget);
    });
}

// 3. Logic: Calculate Total
function calculateBudget() {
    let total = 0;
    let detailsListHtml = '';

    // Loop through the JSON data again to calculate based on definitions
    pricingData.forEach(item => {
        const element = document.getElementById(item.id);
        if (!element) return;

        let cost = 0;
        let label = item.nome;

        if (item.tipo_input === 'dropdown') {
            // Get selected option price
            const selectedOption = element.options[element.selectedIndex];
            cost = parseFloat(selectedOption.getAttribute('data-price')) || 0;
            label = `${item.nome} (${selectedOption.text.split('(')[0].trim()})`;
        } 
        else if (item.tipo_input === 'number') {
            // Value * Base Price
            const qty = parseFloat(element.value) || 0;
            cost = qty * item.preco_base;
            label = `${item.nome} (${qty} ${item.unidade}s)`;
        } 
        else if (item.tipo_input === 'checkbox') {
            // Fixed price if checked
            if (element.checked) {
                cost = item.preco_base;
            }
        }

        // Add to total
        total += cost;

        // Add to summary list if cost > 0
        if (cost > 0) {
            detailsListHtml += `<li>${label}: <strong>${cost.toFixed(2)}€</strong></li>`;
        }
    });

    // Update DOM
    document.getElementById('resumo-orcamento').innerHTML = detailsListHtml;
    
    const totalEl = document.getElementById('total-orcamento');
    totalEl.textContent = `${total.toFixed(2)}€`;
    totalEl.classList.remove('text-danger');
    totalEl.classList.add('text-success');
}