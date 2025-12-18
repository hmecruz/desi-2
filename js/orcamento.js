let pricingData = [];

loadPricingData();

async function loadPricingData() {
    try {
        const response = await fetch('../json/servicos.json');
        if (!response.ok) throw new Error("Failed to load pricing configuration");
        
        pricingData = await response.json();
        generateFormFromJSON(pricingData);
        calculateBudget();
        
    } catch (error) { // Debug sincee we had an explorer problem
        console.error("Error:", error);
        document.getElementById('form-placeholder').innerHTML = 
            '<div class="alert alert-danger">Erro ao carregar o formulário. Tente novamente.</div>';
    }
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

function generateFormFromJSON(data) {
    const container = document.getElementById('form-placeholder');
    container.innerHTML = ''; 

    data.forEach(item => {
        let htmlElement = '';
        const actionAttrs = `onchange="calculateBudget()" oninput="calculateBudget()"`;

        switch (item.tipo_input) {
            case 'dropdown':
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
                            <select id="${item.id}" class="form-select dynamic-input" ${actionAttrs}>
                                ${optionsHtml}
                            </select>
                        </div>
                    </div>`;
                break;

            case 'number':
                htmlElement = `
                    <div class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="mb-1 text-muted small">${item.descricao} (${item.preco_base}€ / ${item.unidade})</p>
                        </div>
                        <div class="input-group w-auto">
                            <input type="number" id="${item.id}" value="${item.valor_initial}" min="0" class="form-control text-center dynamic-input" style="width: 80px;" ${actionAttrs}>
                        </div>
                    </div>`;
                break;

            case 'checkbox':
                htmlElement = `
                    <div class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="mb-1 text-muted small">${item.descricao} (+${item.preco_base}€)</p>
                        </div>
                        <div class="form-check form-switch p-0 mt-2 mt-md-0">
                            <input class="form-check-input float-none dynamic-input" type="checkbox" role="switch" id="${item.id}" ${actionAttrs}>
                        </div>
                    </div>`;
                break;
        }
        container.insertAdjacentHTML('beforeend', htmlElement);
    });
}

function calculateBudget() {
    let total = 0;
    let detailsListHtml = '';

    pricingData.forEach(item => {
        const element = document.getElementById(item.id);
        if (!element) return;

        let cost = 0;
        let label = item.nome;

        if (item.tipo_input === 'dropdown') {
            const selectedOption = element.options[element.selectedIndex];
            cost = parseFloat(selectedOption.getAttribute('data-price')) || 0;
            label = `${item.nome} (${selectedOption.text.split('(')[0].trim()})`;
        } 
        else if (item.tipo_input === 'number') {
            const qty = parseFloat(element.value) || 0;
            cost = qty * item.preco_base;
            label = `${item.nome} (${qty} ${item.unidade}s)`;
        } 
        else if (item.tipo_input === 'checkbox') {
            if (element.checked) {
                cost = item.preco_base;
            }
        }

        total += cost;

        if (cost > 0) {
            detailsListHtml += `<li>${label}: <strong>${cost.toFixed(2)}€</strong></li>`;
        }
    });

    document.getElementById('resumo-orcamento').innerHTML = detailsListHtml || '<li class="text-muted">Aguardando dados...</li>';
    const totalEl = document.getElementById('total-orcamento');
    totalEl.textContent = `${total.toFixed(2)}€`;
    totalEl.classList.remove('text-danger');
    totalEl.classList.add('text-success');
}