document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#upgrade');
    const botoesUpgrade = document.querySelectorAll('.botoes-upgrade button');
    const campoNomeCliente = document.getElementById('nome-cliente');
    const campoSobrenomeCliente = document.getElementById('sobrenome-cliente');
    const campoServOutro = document.getElementById('serv-Outro');
    const botaoEnviar = document.getElementById('enviar-upgrade');
    const telefoneInput = document.getElementById('telefone');

    let upgradesSelecionados = [];

    // Gerenciar a seleção dos botões de upgrade
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

    // Máscara para o telefone
    telefoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
        }
        e.target.value = value;
    });

    // FUNÇÃO PARA CRIAR MENSAGEM ELEGANTE DE UPGRADE
    function criarMensagemUpgrade(nome, sobrenome, telefone, upgrades = [], outrosUpgrades = '') {
        const quebra = '\n';
        const separador = '━━━━━━━━━━━━━━━━━━━━━';
        
        let msg = [];
        
        // Cabeçalho
        msg.push('⚡ UPGRADE DE COMPUTADOR ⚡');
        msg.push(separador);
        msg.push('');
        
        // Dados pessoais
        msg.push('👤 IDENTIFICAÇÃO');
        msg.push(`Nome: ${nome} ${sobrenome}`);
        msg.push(`Contato: ${telefone}`);
        msg.push('');
        
        // Upgrades selecionados
        if (upgrades.length > 0) {
            msg.push('🔧 UPGRADES SOLICITADOS');
            upgrades.forEach((upgrade) => {
                msg.push(`• ${upgrade}`);
            });
            msg.push('');
        }
        
        // Upgrades extras
        if (outrosUpgrades) {
            msg.push('➕ UPGRADES ADICIONAIS');
            msg.push(`• ${outrosUpgrades}`);
            msg.push('');
        }
        
        // Se não tem nenhum upgrade específico
        if (upgrades.length === 0 && !outrosUpgrades) {
            msg.push('💡 INTERESSE GERAL');
            msg.push('• Gostaria de conhecer opções de upgrade');
            msg.push('');
        }
        
        // Finalização
        msg.push(separador);
        msg.push('Aguardo retorno! Obrigado(a) 😊');
        
        return msg.join(quebra);
    }

    // Evento no botão de envio
    botaoEnviar.addEventListener('click', function (event) {
        event.preventDefault();

        const nomeCliente = campoNomeCliente.value.trim();
        const sobrenomeCliente = campoSobrenomeCliente.value.trim();
        const telefone = telefoneInput.value.trim();
        const servOutro = campoServOutro.value.trim();

        // Validação corrigida
        if (!nomeCliente || !sobrenomeCliente || !telefone) {
            alert('Por favor, preencha todos os campos obrigatórios: Nome, Sobrenome e Telefone.');
            return;
        }

        // Criar mensagem elegante
        const mensagemFinal = criarMensagemUpgrade(
            nomeCliente,
            sobrenomeCliente,
            telefone,
            upgradesSelecionados,
            servOutro
        );

        // Enviar para WhatsApp
        const numeroWhats = '5533984024108';
        const whatsappUrl = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagemFinal)}`;
        window.open(whatsappUrl, '_blank');
    });
});