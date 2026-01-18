document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const form = document.getElementById('maintenance-form');
    const problemTextarea = document.getElementById('problema-descricao');
    const charCounter = document.getElementById('char-count');
    const toggleButton = document.getElementById('toggle-solutions');
    const solutionsGrid = document.getElementById('solutions-grid');
    const serviceCheckboxes = document.querySelectorAll('input[name="quick-services"]');
    const serviceCards = document.querySelectorAll('.service-card');
    const submitButton = document.getElementById('enviar-upgrade');
    const selectedServicesDiv = document.getElementById('selected-services');
    const servicesList = document.getElementById('services-list');

    // Campos obrigatórios
    const requiredFields = ['nome-cliente', 'sobrenome-cliente', 'telefone-cliente'];

    // Contador de caracteres
    problemTextarea.addEventListener('input', function () {
        const count = this.value.length;
        const maxLength = 1000;

        charCounter.textContent = `${count} / ${maxLength} caracteres`;
        charCounter.classList.toggle('warning', count > maxLength * 0.9);

        validateForm();
    });

    // Toggle das soluções rápidas
    toggleButton.addEventListener('click', function () {
        const isExpanded = solutionsGrid.classList.contains('expanded');

        solutionsGrid.classList.toggle('expanded');
        this.setAttribute('aria-expanded', !isExpanded);

        const icon = this.querySelector('i');
        icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        this.innerHTML = `<i class="${icon.className}" aria-hidden="true"></i> ${isExpanded ? 'Ver Opções' : 'Ocultar Opções'}`;
    });

    // Gerenciar seleção de serviços rápidos
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const card = this.closest('.service-card');
            card.classList.toggle('selected', this.checked);
            updateSelectedServices();
            validateForm();
        });
    });

    // Atualizar lista de serviços selecionados
    function updateSelectedServices() {
        const selectedServices = Array.from(serviceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selectedServices.length > 0) {
            selectedServicesDiv.style.display = 'block';
            servicesList.innerHTML = selectedServices
                .map(service => `<li>${service}</li>`)
                .join('');
        } else {
            selectedServicesDiv.style.display = 'none';
        }
    }

    // Validação do formulário
    function validateForm() {
        const problemText = problemTextarea.value.trim();
        const hasProblemDescription = problemText.length >= 20;

        const selectedServices = Array.from(serviceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const hasQuickServices = selectedServices.length > 0;

        const hasRequiredFields = requiredFields.every(id => 
            document.getElementById(id).value.trim()
        );

        // Agora basta ter descrição OU serviços selecionados
        submitButton.disabled = !( (hasProblemDescription || hasQuickServices) && hasRequiredFields );
    }

    // Validação em tempo real dos campos obrigatórios
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', validateForm);
    });

    // Máscara para telefone
    document.getElementById('telefone-cliente').addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            if (value.length < 14) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            e.target.value = value;
        }
    });

    // Submissão do formulário -> Envio pro WhatsApp
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const problemDescription = problemTextarea.value.trim();
        const selectedServices = Array.from(serviceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const nome = document.getElementById('nome-cliente').value.trim();
        const sobrenome = document.getElementById('sobrenome-cliente').value.trim();
        const telefone = document.getElementById('telefone-cliente').value.trim();

        // Checagem: precisa ter descrição OU serviços
        if (problemDescription.length < 20 && selectedServices.length === 0) {
            alert('Por favor, descreva o problema (mínimo 20 caracteres) ou selecione uma solução rápida.');
            problemTextarea.focus();
            return;
        }

        // Montar mensagem pro WhatsApp
        const quebra = '\n';
        const separador = '━━━━━━━━━━━━━━━━━━━━━';
        let msg = [];

        msg.push('🖥️ SOLICITAÇÃO DE SUPORTE 🖥️');
        msg.push(separador);
        msg.push('');
        msg.push('👤 IDENTIFICAÇÃO');
        msg.push(`Nome: ${nome} ${sobrenome}`);
        msg.push(`Contato: ${telefone}`);
        msg.push('');
        msg.push('❗ PROBLEMA RELATADO');
        msg.push(problemDescription || '(Não informado, selecionou solução rápida)');
        msg.push('');

        if (selectedServices.length > 0) {
            msg.push('⚡ SOLUÇÕES RÁPIDAS SELECIONADAS');
            selectedServices.forEach(service => {
                msg.push(`• ${service}`);
            });
            msg.push('');
        }

        msg.push(separador);
        msg.push('Aguardo retorno! Obrigado(a) 😊');

        const mensagemFinal = msg.join(quebra);

        // WhatsApp destino
        const numeroWhats = '5533984024108';
        const linkWhats = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagemFinal)}`;

        // Abrir em nova aba
        window.open(linkWhats, '_blank');
    });

    // Inicialização
    validateForm();
});
