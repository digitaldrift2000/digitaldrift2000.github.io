document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('clientForm');
    const toggleButton = document.getElementById('toggleFormButton');
    const textoOpcao = document.getElementById('textoOpcao');
    const enviarPecasClienteButton = document.getElementById('enviarPecasCliente');
    const nomeInput = document.getElementById('nome');
    const sobrenomeInput = document.getElementById('sobrenome');
    const telefoneInput = document.getElementById('telefone');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const outrosTextoInput = document.getElementById('outros-texto');
    const precoMinInput = document.getElementById('preco-min');
    const precoMaxInput = document.getElementById('preco-max');
    const observacoesInput = document.getElementById('observacoes');

    // Inicialmente, o formulário fica visível
    form.style.display = 'block';
    textoOpcao.textContent = "Montar com Peças da Loja";
    enviarPecasClienteButton.style.display = 'none';

    // Alterna entre as opções de montagem
    toggleButton.addEventListener('click', function () {
        if (form.style.display === 'none') {
            form.style.display = 'block';
            enviarPecasClienteButton.style.display = 'none';
            textoOpcao.textContent = "Montar com Peças da Loja";
        } else {
            form.style.display = 'none';
            enviarPecasClienteButton.style.display = 'block';
            textoOpcao.textContent = "Montar com as Suas Peças";
        }
    });

    // Máscara para o telefone
    telefoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
        }
        e.target.value = value;
    });

    // Obter valores dos checkboxes marcados
    function getCheckedValues(checkboxGroup) {
        return Array.from(checkboxGroup)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
    }

    // Verificar se o campo "Outros" é obrigatório
    function verificarOutrosObrigatorio() {
        outrosTextoInput.required = document.getElementById('outros').checked;
    }

    // Atualiza obrigatoriedade ao mudar o checkbox "Outros"
    verificarOutrosObrigatorio();
    document.getElementById('outros').addEventListener('change', verificarOutrosObrigatorio);

    // FUNÇÃO PARA CRIAR MENSAGEM ELEGANTE
    function criarMensagem(nome, sobrenome, telefone, opcao, intencoes = [], outrosTexto = '', precoMin = '', precoMax = '', observacoes = '') {
        const quebra = '\n';
        const separador = '━━━━━━━━━━━━━━━━━━━━━';
        
        let msg = [];
        
        // Cabeçalho
        msg.push('🖥️ MONTAGEM DE COMPUTADOR 🖥️');
        msg.push(separador);
        msg.push('');
        
        // Dados pessoais
        msg.push('👤 IDENTIFICAÇÃO');
        msg.push(`Nome: ${nome} ${sobrenome}`);
        msg.push(`Contato: ${telefone}`);
        msg.push('');
        
        // Tipo de serviço
        msg.push('⚙️ TIPO DE MONTAGEM');
        msg.push(`• ${opcao}`);
        msg.push('');
        
        // Intenções de uso (apenas para peças da loja)
        if (intencoes.length > 0) {
            msg.push('🎯 INTENÇÃO DE USO');
            intencoes.forEach((intencao) => {
                msg.push(`• ${intencao}`);
            });
            msg.push('');
        }
        
        // Outros (se preenchido)
        if (outrosTexto) {
            msg.push('➕ ESPECIFICAÇÕES EXTRAS');
            msg.push(`• ${outrosTexto}`);
            msg.push('');
        }
        
        // Faixa de preço (apenas para peças da loja)
        if (precoMin || precoMax) {
            msg.push('💰 ORÇAMENTO');
            if (precoMin && precoMax) {
                msg.push(`• Faixa: R$ ${precoMin} - R$ ${precoMax}`);
            } else if (precoMin) {
                msg.push(`• Mínimo: R$ ${precoMin}`);
            } else if (precoMax) {
                msg.push(`• Máximo: R$ ${precoMax}`);
            }
            msg.push('');
        }
        
        // Observações
        if (observacoes) {
            msg.push('📝 OBSERVAÇÕES');
            msg.push(`• ${observacoes}`);
            msg.push('');
        }
        
        // Finalização
        msg.push(separador);
        msg.push('Aguardo retorno! Obrigado(a) 😊');
        
        return msg.join(quebra);
    }

    // Envio do formulário (Peças da Loja)
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const nome = nomeInput.value.trim();
        const sobrenome = sobrenomeInput.value.trim();
        const telefone = telefoneInput.value.trim();
        const intencoesArray = getCheckedValues(checkboxes);
        const outrosTexto = outrosTextoInput.value.trim();
        const precoMin = precoMinInput.value.trim();
        const precoMax = precoMaxInput.value.trim();
        const observacoes = observacoesInput.value.trim();

        // Validações
        if (!nome || !sobrenome || !telefone) {
            alert("Por favor, preencha todos os campos obrigatórios (Nome, Sobrenome e Telefone).");
            return;
        }

        if (document.getElementById('outros').checked && outrosTexto === "") {
            alert("Por favor, especifique o campo 'Outros'.");
            outrosTextoInput.focus();
            return;
        }

        // Criar mensagem elegante
        const mensagemFinal = criarMensagem(
            nome, 
            sobrenome, 
            telefone, 
            'Montagem com peças da loja',
            intencoesArray,
            outrosTexto,
            precoMin,
            precoMax,
            observacoes
        );

        // Enviar para WhatsApp
        const numeroWhats = '5533984024108';
        const whatsappUrl = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagemFinal)}`;
        window.open(whatsappUrl, '_blank');
    });

    // Envio para opção de Peças do Cliente
    enviarPecasClienteButton.addEventListener('click', function () {
        const nome = nomeInput.value.trim();
        const sobrenome = sobrenomeInput.value.trim();
        const telefone = telefoneInput.value.trim();

        if (!nome || !sobrenome || !telefone) {
            alert("Por favor, preencha todos os campos obrigatórios (Nome, Sobrenome e Telefone).");
            return;
        }

        // Criar mensagem elegante para peças do cliente
        const mensagemFinal = criarMensagem(
            nome, 
            sobrenome, 
            telefone, 
            'Montagem com as minhas próprias peças'
        );

        // Enviar para WhatsApp
        const numeroWhats = '5533984024108';
        const whatsappUrl = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagemFinal)}`;
        window.open(whatsappUrl, '_blank');
    });
});