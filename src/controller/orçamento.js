// Sistema de Orçamento - Digital Drift - Opções Flexíveis
// Versão otimizada para A4 com quebra de páginas e totais individuais

// Configurações
const TAXA_CARTAO = 0.0677; // 6,77%
let opcoesSelecionadas = []; // Array para múltiplas opções

// Função para verificar se jsPDF está disponível
function verificarJsPDF() {
    // Verifica múltiplas possibilidades de como jsPDF pode estar disponível
    if (typeof jsPDF !== 'undefined') {
        return jsPDF;
    }
    if (typeof window.jsPDF !== 'undefined') {
        return window.jsPDF;
    }
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        return window.jspdf.jsPDF;
    }
    if (typeof jspdf !== 'undefined' && jspdf.jsPDF) {
        return jspdf.jsPDF;
    }
    return null;
}

// Função para carregar jsPDF dinamicamente se não estiver carregado
async function carregarJsPDF() {
    if (verificarJsPDF()) {
        return verificarJsPDF();
    }
    
    try {
        // Tenta carregar jsPDF via CDN
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        // Aguarda um pouco para garantir que carregou
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return verificarJsPDF();
    } catch (error) {
        console.error('Erro ao carregar jsPDF:', error);
        throw new Error('Não foi possível carregar a biblioteca jsPDF');
    }
}

// Função para carregar autoTable dinamicamente
async function carregarAutoTable() {
    try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
        
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        // Aguarda um pouco para garantir que carregou
        await new Promise(resolve => setTimeout(resolve, 100));
        
    } catch (error) {
        console.error('Erro ao carregar autoTable:', error);
    }
}

// Função para calcular o total de uma opção específica
function calcularTotal(opcao) {
    let subtotal = 0;
    
    // Percorre todas as linhas da tabela de itens da opção específica
    document.querySelectorAll(`#itens-orcamento-${opcao} tbody tr`).forEach(row => {
        const qtd = parseFloat(row.querySelector(".quantidade")?.value) || 0;
        const valor = parseFloat(row.querySelector(".valor")?.value) || 0;
        const total = qtd * valor;
        
        // Atualiza o valor total de cada item na tabela
        const campoTotal = row.querySelector(".total-item");
        if (campoTotal) {
            campoTotal.value = formatarValor(total);
        }
        subtotal += total;
    });

    // Aplica o desconto, se houver
    const desconto = parseFloat(document.getElementById(`desconto-${opcao}`)?.value) || 0;
    let totalVista = subtotal - desconto;
    let totalCartao = totalVista * (1 + TAXA_CARTAO);

    // Atualiza os campos da opção específica
    const campoSubtotal = document.getElementById(`subtotal-${opcao}`);
    const campoTotal = document.getElementById(`total-${opcao}`);
    
    if (campoSubtotal) campoSubtotal.value = formatarValor(subtotal);
    if (campoTotal) campoTotal.value = formatarValor(totalVista);

    // Armazena o valor do cartão para uso no PDF
    window[`totalCartao${opcao}`] = totalCartao;
    
    // Atualiza a interface se esta opção estiver selecionada
    if (opcoesSelecionadas.includes(opcao)) {
        atualizarOpcoesSelecionadas();
    }
}

// Função para formatar valores monetários
function formatarValor(valor) {
    return valor.toFixed(2);
}

// Função para adicionar um novo item na tabela de uma opção específica
function adicionarItem(opcao) {
    const tabela = document.querySelector(`#itens-orcamento-${opcao} tbody`);
    if (!tabela) return;
    
    const novaLinha = tabela.insertRow();
    novaLinha.innerHTML = `
        <td>
            <input type="text" class="item" placeholder="Nome do Item">
        </td>
        <td>
            <input type="number" class="quantidade" placeholder="Qtd" 
                   min="0" step="0.01" oninput="calcularTotal(${opcao})">
        </td>
        <td>
            <input type="number" class="valor" placeholder="Valor Unitário" 
                   min="0" step="0.01" oninput="calcularTotal(${opcao})">
        </td>
        <td>
            <input type="text" class="total-item" readonly>
        </td>
        <td>
            <button type="button" class="btn btn-remove" onclick="removerItem(this, ${opcao})">
                <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
        </td>
    `;
    
    // Foca no primeiro campo do novo item
    setTimeout(() => {
        novaLinha.querySelector(".item")?.focus();
    }, 50);
}

// Função para remover um item da tabela
function removerItem(button, opcao) {
    const linha = button?.closest("tr");
    if (linha) {
        linha.remove();
        calcularTotal(opcao);
    }
}

// Função para selecionar/deselecionar uma opção (volta aos checkboxes)
function selecionarOpcao(opcao) {
    const checkbox = document.getElementById(`checkbox-${opcao}`);
    
    if (checkbox.checked) {
        // Adiciona à lista se não estiver já
        if (!opcoesSelecionadas.includes(opcao)) {
            opcoesSelecionadas.push(opcao);
        }
    } else {
        // Remove da lista
        opcoesSelecionadas = opcoesSelecionadas.filter(op => op !== opcao);
    }
    
    // Atualiza a interface
    atualizarOpcoesSelecionadas();
}

// Função para atualizar a exibição das opções selecionadas com totais individuais
function atualizarOpcoesSelecionadas() {
    const headerOpcoes = document.getElementById("header-opcoes-selecionadas");
    const resumoOpcoes = document.getElementById("resumo-opcoes-selecionadas");
    const listaOpcoes = document.getElementById("lista-opcoes-selecionadas");
    
    if (opcoesSelecionadas.length > 0) {
        // Mostra a seção
        if (headerOpcoes) headerOpcoes.style.display = "table-row";
        if (resumoOpcoes) resumoOpcoes.style.display = "table-row";
        
        // Constrói a lista das opções selecionadas com totais individuais
        let htmlLista = "";
        opcoesSelecionadas.forEach(opcao => {
            const nomeOpcao = opcao === 1 ? "Básica" : opcao === 2 ? "Intermediária" : "Premium";
            const totalVista = document.getElementById(`total-${opcao}`)?.value || "0.00";
            const totalCartao = formatarValor(window[`totalCartao${opcao}`] || 0);
            
            htmlLista += `
                <div class="opcao-individual" style="margin-bottom: 10px; padding: 8px; border-left: 3px solid #007bff; background-color: #f8f9fa;">
                    <strong>Opção ${opcao} - ${nomeOpcao}:</strong><br>
                    <span style="margin-left: 10px;">À Vista: R$ ${totalVista}</span><br>
                    <span style="margin-left: 10px;">Cartão: R$ ${totalCartao}</span>
                </div>
            `;
        });
        
        if (listaOpcoes) listaOpcoes.innerHTML = htmlLista;
    } else {
        // Oculta a seção
        if (headerOpcoes) headerOpcoes.style.display = "none";
        if (resumoOpcoes) resumoOpcoes.style.display = "none";
    }
}

// Função para obter dados do cliente
function obterDadosCliente() {
    return {
        nome: document.getElementById("nome")?.value || "",
        telefone: document.getElementById("telefone")?.value || "",
        descricao: document.getElementById("descricao")?.value || "",
        validade: document.getElementById("validade")?.value || "30"
    };
}

// Função para obter dados de todas as opções selecionadas
function obterTodasOpcoesItens() {
    const todasOpcoes = {};
    
    opcoesSelecionadas.forEach(opcao => {
        const itens = [];
        document.querySelectorAll(`#itens-orcamento-${opcao} tbody tr`).forEach(row => {
            const item = {
                nome: row.querySelector(".item")?.value || "",
                quantidade: row.querySelector(".quantidade")?.value || "0",
                valor: row.querySelector(".valor")?.value || "0.00",
                total: row.querySelector(".total-item")?.value || "0.00"
            };
            // Só adiciona se não estiver vazio
            if (item.nome.trim() || parseFloat(item.quantidade) > 0) {
                itens.push(item);
            }
        });
        
        const nomeOpcao = opcao === 1 ? "Básica" : opcao === 2 ? "Intermediária" : "Premium";
        todasOpcoes[opcao] = {
            nome: nomeOpcao,
            itens: itens
        };
    });
    
    return todasOpcoes;
}

// Função para obter dados financeiros de todas as opções selecionadas
function obterTodosDadosFinanceiros() {
    const todosFinanceiros = {};
    
    opcoesSelecionadas.forEach(opcao => {
        const subtotal = parseFloat(document.getElementById(`subtotal-${opcao}`)?.value) || 0;
        const desconto = parseFloat(document.getElementById(`desconto-${opcao}`)?.value) || 0;
        const total = parseFloat(document.getElementById(`total-${opcao}`)?.value) || 0;
        const totalCartao = window[`totalCartao${opcao}`] || 0;
        
        const nomeOpcao = opcao === 1 ? "Básica" : opcao === 2 ? "Intermediária" : "Premium";
        todosFinanceiros[opcao] = {
            nome: nomeOpcao,
            subtotal: formatarValor(subtotal),
            desconto: formatarValor(desconto),
            total: formatarValor(total),
            totalCartao: formatarValor(totalCartao)
        };
    });
    
    return todosFinanceiros;
}

// Função para mostrar placeholder quando não há logo
function mostrarPlaceholderLogo(doc, pageWidth) {
    doc.setFillColor(200, 200, 200);
    doc.circle(pageWidth - 35, 22, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text("LOGO", pageWidth - 35, 25, { align: "center" });
}

// Função para gerar o PDF (versão corrigida)
async function gerarPDF() {
    if (opcoesSelecionadas.length === 0) {
        alert('Por favor, selecione pelo menos uma das opções antes de gerar o PDF.');
        return;
    }
    
    // Exibe mensagem de carregamento
    const botaoOriginal = document.querySelector('[onclick*="gerarPDF"]');
    const textoOriginal = botaoOriginal ? botaoOriginal.innerText : '';
    if (botaoOriginal) {
        botaoOriginal.innerText = 'Gerando PDF...';
        botaoOriginal.disabled = true;
    }
    
    try {
        // Carrega as bibliotecas necessárias
        const jsPDFClass = await carregarJsPDF();
        await carregarAutoTable();
        
        if (!jsPDFClass) {
            throw new Error('jsPDF não pôde ser carregado');
        }
        
        // Cria uma nova instância do jsPDF
        const doc = new jsPDFClass();

        const dados = {
            cliente: obterDadosCliente(),
            opcoes: obterTodasOpcoesItens(),
            financeiro: obterTodosDadosFinanceiros(),
            opcoesEscolhidas: opcoesSelecionadas.map(op => op === 1 ? "Básica" : op === 2 ? "Intermediária" : "Premium").join(", "),
            quantidadeOpcoes: opcoesSelecionadas.length
        };

        // Constrói o PDF
        construirPDFFlexivel(doc, dados);

        // Salva o PDF com nome do cliente
        const nomeCliente = dados.cliente.nome.trim() || 'Cliente';
        const nomeArquivo = `Orcamento_${nomeCliente.replace(/\s+/g, '_')}.pdf`;
        
        doc.save(nomeArquivo);
        
        // Mostra mensagem de sucesso
        alert('PDF gerado com sucesso!');

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('jsPDF')) {
            alert('Erro: A biblioteca jsPDF não pôde ser carregada. Verifique sua conexão com a internet e tente novamente.');
        } else {
            alert(`Erro ao gerar o PDF: ${error.message}`);
        }
    } finally {
        // Restaura o botão
        if (botaoOriginal) {
            botaoOriginal.innerText = textoOriginal;
            botaoOriginal.disabled = false;
        }
    }
}

// Função para construir o PDF flexível com quebra de páginas otimizada
function construirPDFFlexivel(doc, dados) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margemInferior = 30;
    let y = 15;

    // Função para verificar se precisa de nova página
    function verificarNovaPagina(alturaConteudo) {
        if (y + alturaConteudo > pageHeight - margemInferior) {
            adicionarRodape(doc, pageWidth, pageHeight);
            doc.addPage();
            y = 15;
            return true;
        }
        return false;
    }

    // === CABEÇALHO ===
    doc.setFillColor(90, 90, 90);
    doc.rect(0, 0, pageWidth, 50, 'F');

    const logoBase64 = "data:image/png;base64,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LZpM1XXR/Hy0AF4k+/btO3byZG3q4mWXXYZ77rkHmzZtonfddde1N954439as2bNVy655JLPtLW1XS8Tf+tCQBp8SYZhoLm5+e6WlhYAwOTkJE6cOCEMw/iKYRh760su+VohBKIoSnfu3PmXU1NTyGaz6Onpgeu6YIxdr6xK9TkSAYBdcGO84UQ5hdxGBCDinA9xzgPlwySv5TNy2lABoiwQubwVjftkmiYRQhDR0Kbf8zxjcHDwqp6eHiRJgkKhAFmRkVqWtYkxNq+2waXrQJ6TlwD8J0LI8cbjbdwHz/PyuVzOiqIIZ8+exeTkJAghnxJCjKrXq31B7cEWnzp1ahuTk/m6u7th23ZTHMfr1OuUBcxqeYem4ziwLAuLBgfx/ve/Hw888AA+97nP4bOf/SweeughfOITn8B73/teLF68GIQQOwiCDiEEazxfjLF0aGho5tixY4AQWLZsGe644w588IMfxN13391x4403/v7atWs/u2TJko/m8/l7TdNczzlvVddCfUcsyyLsTcYlaLQAXjQvv/zygW3btlX27NmDYrGI7u5urFmzhrz73e/277///pWbNm163/ve977P3nDDDf/Q29v7ohBiQ7VarS8tlXhIK6A/lcPS5U0FSulW9cVWX25TJlzbto25ubmtSZJwyKRs1JzfLbxhRgcaSueUEDX8+4UW4etIZeWI/Gw1HnOacz6nxEgJEudcmKYJW5a6KWExTZMDYI3CxGuRWaL2I62lApnt7e31GcFyYLvIZDKPG4ZxVgUzVDUKlYnXtGZVcvW3xs/gcvlPKe2xLItEUYTZ2VkkScIzmcw/N54jIh9Iyq84PT39eKVSEXitooTGcXytEispNJDXjFYqFczNzQEABgYGcNlll6GzsxO9vb14xzvegSvWrMHKlSvR3t4OwzAoY+x6AK5yU8hzy8+dO7d7586d2LZtW/07de26dXjP3Xfb999//zs/8pGPfOa+++778zvvvPMPLrnkkk82NTV9I47j96vjlcnWmn8BWgAvkvn5+YMHDx7c8uSTT+KJJ57A888/j5GREYRhCM/zMDAwgKuvvhq33XabuX79+qt6e3u3EEI+pqKYStRQuwHtRuEQQnDOeaReI290oGE4Unt7e1UtndLXal47pDXxOiGQvwv1Xskb+gDVjQkpENKCq1BKZ9R+KotUBT6UsKdpqhKH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";
    
    // Logo placeholder
    if (typeof logoBase64 !== 'undefined' && logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', pageWidth - 55, 10, 35, 35);
        } catch (e) {
            console.warn('Erro ao adicionar logo:', e);
            mostrarPlaceholderLogo(doc, pageWidth);
        }
    } else {
        mostrarPlaceholderLogo(doc, pageWidth);
    }
    
    // Título principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("ORÇAMENTO", 15, 28);
    
    // Subtítulo empresa
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Drift - Assistência Técnica", 15, 38);
    
    // Número do orçamento, data e opções escolhidas
    const numeroOrcamento = `#${Date.now().toString().slice(-6)}`;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Orçamento: ${numeroOrcamento}`, 15, 45);
    
    // Trunca as opções se for muito longo
    let textoOpcoes = `Opções: ${dados.opcoesEscolhidas}`;
    if (textoOpcoes.length > 30) {
        textoOpcoes = textoOpcoes.substring(0, 27) + '...';
    }
    doc.text(textoOpcoes, pageWidth/2, 45, { align: "center" });
    doc.text(`Data: ${dataAtual}`, pageWidth - 55, 45);
    
    y = 60;

    // === DADOS DO CLIENTE ===
    verificarNovaPagina(35);
    
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.5);
    doc.rect(15, y, pageWidth - 30, 30, 'FD');
    
    doc.setFillColor(120, 120, 120);
    doc.rect(15, y, pageWidth - 30, 8, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("DADOS DO CLIENTE", 18, y + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Cliente: ${dados.cliente.nome || 'Não informado'}`, 18, y + 16);
    doc.text(`Telefone: ${dados.cliente.telefone || 'Não informado'}`, 18, y + 24);
    
    y += 38;

    // === DESCRIÇÃO ===
    if (dados.cliente.descricao && dados.cliente.descricao.trim()) {
        const linhasDescricao = doc.splitTextToSize(dados.cliente.descricao, pageWidth - 40);
        const alturaDescricao = Math.min(linhasDescricao.length * 5, 30) + 18;
        
        verificarNovaPagina(alturaDescricao);
        
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.5);
        doc.rect(15, y, pageWidth - 30, alturaDescricao, 'FD');
        
        doc.setFillColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, 8, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text("DESCRIÇÃO DO SERVIÇO", 18, y + 5);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        
        const linhasLimitadas = linhasDescricao.slice(0, 5);
        doc.text(linhasLimitadas, 18, y + 15);
        
        y += alturaDescricao + 10;
    }

    // === ITENS POR OPÇÃO ===
    Object.entries(dados.opcoes).forEach(([opcao, dadosOpcao]) => {
        if (dadosOpcao.itens.length > 0) {
            // Verifica se precisa de nova página para a opção
            verificarNovaPagina(60);
            
            // Tons de cinza por opção (Básica, Intermediária, Premium)
            let corFundo = [245, 245, 245]; // Básica
            if (opcao == 2) corFundo = [230, 230, 230]; // Intermediária
            if (opcao == 3) corFundo = [215, 215, 215]; // Premium

            doc.setFillColor(...corFundo);
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.5);

            // Retângulo com cantos arredondados e altura menor
            const altura = 10;
            doc.roundedRect(15, y, pageWidth - 30, altura, 2, 2, 'FD');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text(`OPÇÃO ${opcao} - ${dadosOpcao.nome.toUpperCase()}`, 18, y + 7);
            
            y += 18;

            // Tabela de itens da opção
            const colunas = ["Item/Serviço", "Qtd", "Valor Unit.", "Total"];
            const linhas = dadosOpcao.itens.map(item => [
                item.nome.length > 35 ? item.nome.substring(0, 32) + '...' : item.nome,
                item.quantidade || '0',
                `R$ ${item.valor || '0,00'}`,
                `R$ ${item.total || '0,00'}`
            ]);

            doc.autoTable({
                head: [colunas],
                body: linhas,
                startY: y,
                theme: "grid",
                styles: {
                    fontSize: 8,
                    cellPadding: 2.5,
                    halign: 'center',
                    lineColor: [120, 120, 120],
                    lineWidth: 0.3,
                    textColor: [60, 60, 60],
                },
                headStyles: {
                    fillColor: [100, 100, 100],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center',
                },
                columnStyles: {
                    0: { halign: 'left', cellWidth: 75 },
                    1: { halign: 'center', cellWidth: 20 },
                    2: { halign: 'right', cellWidth: 30 },
                    3: { halign: 'right', cellWidth: 30, fontStyle: 'bold', fillColor: [245, 245, 245] }
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248],
                },
                margin: { left: 15, right: 15 },
                pageBreak: 'auto',
                showHead: 'everyPage',
            });
            
            y = doc.autoTable.previous.finalY + 8;
        }
    });

    // === RESUMO FINANCEIRO POR OPÇÃO ===
    verificarNovaPagina(40 + (opcoesSelecionadas.length * 15));
    
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.5);
    const alturaResumo = 25 + (opcoesSelecionadas.length * 15);
    doc.rect(15, y, pageWidth - 30, alturaResumo, 'FD');
    
    doc.setFillColor(120, 120, 120);
    doc.rect(15, y, pageWidth - 30, 8, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("RESUMO FINANCEIRO - TOTAIS INDIVIDUAIS", 18, y + 5);
    
    y += 18;
    
    // Lista os totais de cada opção individualmente
    Object.entries(dados.financeiro).forEach(([opcao, fin]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`${fin.nome}:`, 18, y);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`À Vista: R$ ${fin.total}`, 18, y + 6);
        doc.text(`Cartão: R$ ${fin.totalCartao}`, pageWidth - 18, y + 6, { align: "right" });
        
        if (parseFloat(fin.desconto) > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`(Subtotal: R$ ${fin.subtotal} - Desconto: R$ ${fin.desconto})`, 30, y + 12);
            y += 18;
        } else {
            y += 12;
        }
        
        // Linha separadora entre opções
        if (Object.keys(dados.financeiro).length > 1) {
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.3);
            doc.line(18, y, pageWidth - 18, y);
            y += 3;
        }
    });
    
    y += 15;

    // === INFORMAÇÕES FINAIS ===
    verificarNovaPagina(25);
    
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(15, y, pageWidth - 30, 20, 'FD');
    
    doc.setFillColor(180, 180, 180);
    doc.rect(15, y, 5, 20, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`VÁLIDO POR ${dados.cliente.validade || '30'} DIAS`, 22, y + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Preços sujeitos a alteração sem aviso prévio.", 22, y + 14);

    // === RODAPÉ ===
    adicionarRodape(doc, pageWidth, pageHeight);
}

// Função para adicionar rodapé
function adicionarRodape(doc, pageWidth, pageHeight) {
    const alturaRodape = 25;
    const yRodape = pageHeight - alturaRodape;
    
    doc.setFillColor(80, 80, 80);
    doc.rect(0, yRodape, pageWidth, alturaRodape, 'F');
    
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(2);
    doc.line(0, yRodape, pageWidth, yRodape);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("Digital Drift - Assistência Técnica", pageWidth/2, yRodape + 8, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text("(33) 98402-4108  |  Rua Raimundo Martins, 20 - Manhuaçu/MG", pageWidth/2, yRodape + 16, { align: "center" });
    
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth/2, yRodape + 22, { align: "center" });
}

// Função para limpar todos os campos
function limparFormulario() {
    // Limpa dados básicos
    const camposBasicos = ["nome", "telefone", "descricao", "validade"];
    camposBasicos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });

    // Limpa todas as 3 opções
    for (let i = 1; i <= 3; i++) {
        const camposOpcao = [`subtotal-${i}`, `desconto-${i}`, `total-${i}`];
        camposOpcao.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.value = "";
        });

        // Desmarca checkbox
        const checkbox = document.getElementById(`checkbox-${i}`);
        if (checkbox) checkbox.checked = false;

        // Limpa tabela de itens da opção
        const tbody = document.querySelector(`#itens-orcamento-${i} tbody`);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td><input type="text" class="item" placeholder="Nome do Item"></td>
                    <td><input type="number" class="quantidade" placeholder="Qtd" min="0" step="0.01" oninput="calcularTotal(${i})"></td>
                    <td><input type="number" class="valor" placeholder="Valor Unitário" min="0" step="0.01" oninput="calcularTotal(${i})"></td>
                    <td><input type="text" class="total-item" readonly></td>
                </tr>
            `;
        }
        
        // Limpa variável global
        window[`totalCartao${i}`] = 0;
    }

    // Oculta opções selecionadas
    const headerOpcoes = document.getElementById("header-opcoes-selecionadas");
    const resumoOpcoes = document.getElementById("resumo-opcoes-selecionadas");
    if (headerOpcoes) headerOpcoes.style.display = "none";
    if (resumoOpcoes) resumoOpcoes.style.display = "none";

    // Reset variáveis
    opcoesSelecionadas = [];
}

// Inicialização quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
    // Adiciona event listeners para os campos de desconto de cada opção
    for (let i = 1; i <= 3; i++) {
        const campoDesconto = document.getElementById(`desconto-${i}`);
        if (campoDesconto) {
            campoDesconto.addEventListener("input", () => calcularTotal(i));
        }
        
        // Calcula totais iniciais
        calcularTotal(i);
    }

    // Atalho para gerar PDF
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            gerarPDF();
        }
    });
});
