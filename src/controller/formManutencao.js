document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#upgrade');
    const botoesUpgrade = document.querySelectorAll('.botoes-upgrade button');
    const campoNomeCliente = document.getElementById('nome-cliente');
    const campoSobrenomeCliente = document.getElementById('sobrenome-cliente');
    const campoTelefoneCliente = document.getElementById('telefone-cliente');
    const campoServOutro = document.getElementById('serv-Outro');
    const botaoEnviar = document.getElementById('enviar-upgrade');

    let upgradesSelecionados = [];

    botoesUpgrade.forEach((botao) => {
        botao.addEventListener('click', function () {
            const upgrade = this.dataset.upgrade;

            if (upgradesSelecionados.includes(upgrade)) {
                upgradesSelecionados = upgradesSelecionados.filter((item) => item !== upgrade);
                this.classList.remove('selecionado');
            } else {
                upgradesSelecionados.push(upgrade);
                this.classList.add('selecionado');
            }
        });
    });

    botaoEnviar.addEventListener('click', function (event) {
        event.preventDefault();

        const nome = campoNomeCliente.value.trim();
        const sobrenome = campoSobrenomeCliente.value.trim();
        const telefone = campoTelefoneCliente.value.trim();
        const outroServico = campoServOutro.value.trim();

        // Validação simples
        if (!nome || !sobrenome || !telefone) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        // ABORDAGEM COMPLETAMENTE NOVA - CONSTRUÇÃO SIMPLES
        const quebra = '\n';
        const separador = '━━━━━━━━━━━━━━━━━━━━━';
        
        let msg = [];
        
        // Cabeçalho elegante
        msg.push('🌟 SOLICITAÇÃO DE ORÇAMENTO 🌟');
        msg.push(separador);
        msg.push('');
        
        // Dados pessoais
        msg.push('👤 IDENTIFICAÇÃO');
        msg.push(`Nome: ${nome} ${sobrenome}`);
        msg.push(`Contato: ${telefone}`);
        msg.push('');
        
        // Serviços principais
        if (upgradesSelecionados.length > 0) {
            msg.push('🔧 SERVIÇOS SOLICITADOS');
            
            // Pontos em vez de numeração
            upgradesSelecionados.forEach((servico) => {
                msg.push(`• ${servico}`);
            });
            msg.push('');
        }
        
        // Serviços extras
        if (outroServico) {
            msg.push('➕ SERVIÇOS ADICIONAIS');
            msg.push(`• ${outroServico}`);
            msg.push('');
        }
        
        // Finalização
        msg.push(separador);
        msg.push('Aguardo retorno! Obrigado(a) 😊');
        
        // Juntar tudo
        const mensagemFinal = msg.join(quebra);
        
        // Abrir WhatsApp - método mais direto
        const numeroWhats = '5533984024108';
        const linkWhats = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagemFinal)}`;
        
        // Abrir em nova aba
        window.open(linkWhats, '_blank');
    });
});