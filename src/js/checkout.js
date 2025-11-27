document.addEventListener('DOMContentLoaded', () => {
    const listaResumoCarrinho = document.getElementById('lista-resumo-carrinho');
    const totalResumoValor = document.getElementById('total-resumo-valor');
    const formFinalizarPedido = document.getElementById('form-finalizar-pedido');
    const observacoesTextarea = document.getElementById('observacoes'); 

    // --- ELEMENTOS (OBJETIVO 1: ENDEREÇO) ---
    const radioEntrega = document.getElementById('entrega');
    const radioRetirada = document.getElementById('retirada');
    const secaoEndereco = document.getElementById('secao-endereco');
    const camposEnderecoObrigatorios = [
        document.getElementById('cep'),
        document.getElementById('rua'),
        document.getElementById('numero'),
        document.getElementById('bairro')
    ];
    const campoComplemento = document.getElementById('complemento');

    // --- ELEMENTOS (OBJETIVO 2: TEMPO) ---
    const spanTempoEntrega = document.getElementById('tempo-estimado-entrega');
    const spanTempoRetirada = document.getElementById('tempo-estimado-retirada');

    // --- ELEMENTOS (MODAL CARTÃO) ---
    const modalCartaoCredito = document.getElementById('modal-cartao-credito');
    const fecharModalCartaoBtn = document.getElementById('fechar-modal-cartao');
    const formCartaoCredito = document.getElementById('form-cartao-credito');
    const radioCartao = document.getElementById('cartao');
    const radioPix = document.getElementById('pix');
    const radioDinheiro = document.getElementById('dinheiro');
    const detalheCartaoSpan = document.getElementById('detalhe-cartao');
    
    // --- NOVOS ELEMENTOS (BANDEIRA "OUTRA") ---
    const selectBandeira = document.getElementById('cartao-bandeira');
    const caixaOutraBandeira = document.getElementById('caixa-outra-bandeira');
    const inputOutraBandeira = document.getElementById('cartao-outra-bandeira');

    // ============================================================
    // ===== ELEMENTOS DO PONTO DA CARNE (MODIFICADO) =====
    // ============================================================
    
    const modalPonto = document.getElementById('modal-opcoes-ponto');
    const fecharModalPontoBtn = document.getElementById('fechar-modal-opcoes-ponto');
    const formModalPonto = document.getElementById('form-modal-opcoes-ponto');
    const modalPontoTitulo = document.getElementById('modal-opcoes-titulo-ponto');
    const modalPontoLista = document.getElementById('modal-opcoes-lista-ponto');
    const modalPontoIndexInput = document.getElementById('item-index-ponto');
    
    const itensQuePedemPonto = [
        "BRISKET COM ACOMPANHAMENTOS",
        "CONTRA Filé",
        "WAGYU COM ACOMPANHAMENTOS",
        "FILE MIGNON COM FRITAS",
        "ALCATRA COM BATATA RUSTICA",
        "BIFE ANCHO E ACOMPANHAMENTOS",
    ];
    const opcoesPontoCarne = ["Mal Passado", "Ao Ponto", "Bem Passado"];
    // ============================================================
    // ============================================================
    
    // ============================================================
    // ===== NOVAS DEFINIÇÕES (FRITAS) =====
    // ============================================================
    // Preço base das fritas (do carnes.html data-preco="22,00")
    const PRECO_BASE_FRITAS = 22.00; 
    
    // Definição dos adicionais (copiado de carnes.js)
    const OPCOES_ADICIONAIS_FRITAS = [
        { nome: "Cheddar", preco: 3.5 },
        { nome: "Bacon", preco: 3.5 },
        { nome: "Muçarela", preco: 3.5 },
    ];
    // ============================================================
    // ============================================================


    // Lista de bandeiras (em minúsculas) para validação
    const BANDEIRAS_VALIDAS = [
        'visa', 
        'mastercard', 
        'elo', 
        'american express', 
        'hipercard', 
        'diners club', 
        'discover', 
        'jcb',
        'aura' 
    ];

    let dadosCartaoSalvo = null; 

    // --- HELPERS DE GERENCIAMENTO DE USUÁRIO ---
    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const salvarUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    const getClienteLogado = () => {
        const emailLogado = sessionStorage.getItem('sessaoClienteEmail');
        if (!emailLogado) return null;
        return getUsuarios().find(u => u.email === emailLogado);
    };
    
    const salvarCarrinhoNoCheckout = () => {
        if (!cliente) return;
        let usuarios = getUsuarios();
        let clienteIndex = usuarios.findIndex(u => u.email === cliente.email);
        if (clienteIndex !== -1) {
            usuarios[clienteIndex].carrinho = carrinhoItens; // carrinhoItens é a nossa variável local
            salvarUsuarios(usuarios);
        }
    };
    // --- FIM HELPERS ---

    const cliente = getClienteLogado();

    if (!cliente) {
        alert("Você precisa estar logado para finalizar a compra.");
        window.location.href = 'cadastro.html';
        return;
    }

    let carrinhoItens = cliente.carrinho || [];

    if (carrinhoItens.length === 0) {
        alert("Seu carrinho está vazio.");
        window.location.href = 'carnes.html';
        return;
    }

    /**
     * ============================================================
     * ===== MODIFICADO E CORRIGIDO: renderizarResumo =====
     * ============================================================
     * Agora é robusto contra itens antigos no carrinho (sem nomeBase ou ponto).
     */
    const renderizarResumo = () => {
        listaResumoCarrinho.innerHTML = '';
        let total = 0;

        carrinhoItens.forEach((item, index) => {
            const li = document.createElement('li');
            
            // 1. GARANTIA DE NOMEBASE
            // Garante que 'nomeBase' exista. Se o item for antigo (sem 'nomeBase'),
            // ele usa o próprio 'nome' do item como base.
            const nomeBase = item.nomeBase || item.nome; 
            
            // 2. NOME DE EXIBIÇÃO PADRÃO
            // Define o nome completo (Ex: "Fritas (Cheddar)") como padrão
            let nomeExibido = item.nome; 
            let classeItem = '';

            // 3. VERIFICA O TIPO DE ITEM
            const precisaPonto = itensQuePedemPonto.includes(nomeBase);
            const eFritas = nomeBase === "PORÇAO DE FRITAS";

            // 4. LÓGICA DE EXIBIÇÃO
            if (precisaPonto || eFritas) {
                // Se for um item clicável (carne ou fritas)
                classeItem = 'item-ponto-clicavel-resumo'; 
                li.dataset.index = index; 
                li.dataset.nomeBase = nomeBase; // Salva o nomeBase seguro
                
                if (precisaPonto) {
                    // --- Lógica para Carnes ---
                    if (item.ponto === 'pendente') {
                        nomeExibido = `${nomeBase} (<span class="ponto-pendente-texto">Escolha o ponto</span>)`;
                    } else if (item.ponto) { // Verifica se 'item.ponto' existe
                        // Verifica se o item foi adicionado a partir do carnes.js com o preço no nome
                        const match = item.nome.match(/\(Ponto pendente\)|\(Mal Passado\)|\(Ao Ponto\)|\(Bem Passado\)/);
                        if (match) {
                            // Se o nome já tem o ponto, usa o item.nome, mas decora o ponto
                            // Exemplo: BRISKET COM ACOMPANHAMENTOS (Ao Ponto)
                            nomeExibido = item.nome.replace(match[0], `(<span class="ponto-escolhido-texto">${item.ponto}</span>)`);
                        } else {
                            nomeExibido = `${nomeBase} (<span class="ponto-escolhido-texto">${item.ponto}</span>)`;
                        }
                    } else {
                        // Se for um item de carne antigo (sem 'ponto' definido), força a escolha
                        nomeExibido = `${nomeBase} (<span class="ponto-pendente-texto">Escolha o ponto</span>)`;
                    }
                } else if (eFritas) {
                    // --- Lógica para Fritas ---
                    // O nome já está correto (Ex: "Fritas (Simples)" ou "Fritas (Cheddar) - R$XX,XX")
                    // Não é necessário alterar a exibição, o nome já é detalhado
                    nomeExibido = item.nome;
                }

            } else {
                // --- Lógica para Itens Simples ---
                // O nome já está correto (Ex: "CERVEJA CORONA" ou "CHOPP (Chopp de vinho, Torre de 3,5 litros) - R$ 120,00")
                nomeExibido = item.nome; 
            }
            
            // 5. RENDERIZA O ITEM
            li.className = classeItem;
            li.innerHTML = `
                <span class="item-nome">${nomeExibido}</span>
                <span class="item-preco">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            `;
            listaResumoCarrinho.appendChild(li);
            total += item.preco * item.quantidade;
        });

        totalResumoValor.textContent = `R$ ${total.toFixed(2)}`;
    };

    // ============================================================
    // ===== FUNÇÕES DO PONTO DA CARNE (MODIFICADA) =====
    // ============================================================

    /**
     * MODIFICADO: abrirModalPonto
     * Agora define um 'data-tipo' no formulário para sabermos o que salvar.
     */
    const abrirModalPonto = (item, index) => {
        const nomeLimpo = item.nomeBase
            .replace('COM ACOMPANHAMENTOS', '')
            .replace('COM FRITAS', '')
            .trim();
        
        modalPontoTitulo.textContent = `Escolha o ponto do ${nomeLimpo}`;
        modalPontoIndexInput.value = index; 
        modalPontoLista.innerHTML = ''; 
        formModalPonto.dataset.tipo = 'ponto'; // <-- IMPORTANTE

        opcoesPontoCarne.forEach((opcao, i) => {
            let isChecked = (opcao === item.ponto);
            
            if (item.ponto === 'pendente' && opcao === 'Ao Ponto') {
                isChecked = true;
            }
            
            const idOpcao = `ponto-checkout-${i}`;
            // Renderiza RÁDIOS
            modalPontoLista.innerHTML += `
                <div class="opcao-radio">
                    <input type="radio" id="${idOpcao}" name="ponto-carne-checkout" value="${opcao}" ${isChecked ? "checked" : ""}>
                    <label for="${idOpcao}">${opcao}</label>
                </div>
            `;
        });

        modalPonto.classList.remove('hidden');
    };

    /**
     * ============================================================
     * ===== NOVA FUNÇÃO: abrirModalFritas =====
     * ============================================================
     * Reutiliza o modal 'modal-opcoes-ponto' para os adicionais.
     */
    const abrirModalFritas = (item, index) => {
        modalPontoTitulo.textContent = `Escolha seus adicionais`;
        modalPontoIndexInput.value = index;
        modalPontoLista.innerHTML = '';
        formModalPonto.dataset.tipo = 'fritas'; // <-- IMPORTANTE

        OPCOES_ADICIONAIS_FRITAS.forEach((opcao, i) => {
            const idOpcao = `fritas-checkout-${i}`;
            // Verifica se o nome do item no carrinho já inclui este adicional
            const isChecked = item.nome.includes(opcao.nome);

            // Renderiza CHECKBOXES
            modalPontoLista.innerHTML += `
                <div class="opcao-checkbox">
                    <input type="checkbox" id="${idOpcao}" name="adicional-fritas" value="${opcao.nome}" data-preco="${opcao.preco}" ${isChecked ? "checked" : ""}>
                    <label for="${idOpcao}">${opcao.nome} (R$ ${opcao.preco.toFixed(2)})</label>
                </div>
            `;
        });

        modalPonto.classList.remove('hidden');
    };
    // ============================================================
    // ============================================================


    const fecharModalPonto = () => {
        modalPonto.classList.add('hidden');
        delete formModalPonto.dataset.tipo; // Limpa o tipo ao fechar
    };

    /**
     * ============================================================
     * ===== MODIFICADO: handleSalvarPonto (Agora é handleSalvarOpcoes) =====
     * ============================================================
     * Salva PONTO ou FRITAS, dependendo do 'data-tipo' do formulário.
     */
    const handleSalvarOpcoes = (event) => {
        event.preventDefault();
        
        const tipoModal = formModalPonto.dataset.tipo;
        const itemIndex = modalPontoIndexInput.value;
        const item = carrinhoItens[itemIndex];

        if (tipoModal === 'ponto') {
            // --- Lógica antiga (salvar PONTO) ---
            const formData = new FormData(formModalPonto);
            const pontoEscolhido = formData.get('ponto-carne-checkout');
            if (!pontoEscolhido) {
                alert('Por favor, selecione uma opção.');
                return;
            }
            item.ponto = pontoEscolhido; 
            
            // Remove o preço antigo do nome, se existir
            let nomeBasePuro = item.nomeBase.replace(/ - R\$ \d+\.\d{2}/, ''); 
            item.nome = `${nomeBasePuro} (${pontoEscolhido})`; 

        } else if (tipoModal === 'fritas') {
            // --- Lógica nova (salvar FRITAS) ---
            const checkboxes = modalPontoLista.querySelectorAll('input[name="adicional-fritas"]:checked');
            let escolhas = [];
            let precoAdicionais = 0;

            checkboxes.forEach(check => {
                escolhas.push(check.value);
                precoAdicionais += parseFloat(check.dataset.preco);
            });

            // Atualiza o nome
            if (escolhas.length > 0) {
                item.nome = `${item.nomeBase} (${escolhas.join(', ')})`;
            } else {
                item.nome = `${item.nomeBase} (Simples)`;
            }
            
            // Atualiza o preço (Preço Base + Adicionais)
            item.preco = PRECO_BASE_FRITAS + precoAdicionais;
        }

        // --- Lógica Comum ---
        salvarCarrinhoNoCheckout();
        renderizarResumo();
        fecharModalPonto();
    };
    // ============================================================
    // ============================================================


    /**
     * MODIFICADO: Finalizar Pedido
     * Agora salva o tempo estimado no objeto do pedido
     */
    const finalizarPedido = (event) => {
        event.preventDefault();

        const temPendencia = carrinhoItens.some(item => item.ponto === 'pendente');
        if (temPendencia) {
            alert('Por favor, escolha o ponto de todas as carnes antes de finalizar o pedido.');
            listaResumoCarrinho.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const emailLogado = sessionStorage.getItem('sessaoClienteEmail');
        let usuarios = getUsuarios();
        let clienteIndex = usuarios.findIndex(u => u.email === emailLogado);

        if (clienteIndex === -1) {
            alert("Erro: Usuário não encontrado.");
            window.location.href = 'cadastro.html';
            return;
        }

        let clienteAtualizado = usuarios[clienteIndex];
        
        if (carrinhoItens.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const totalDaCompra = carrinhoItens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        
        const observacao = observacoesTextarea.value;
        const pagamentoInput = document.querySelector('input[name="pagamento"]:checked');
        const pagamento = pagamentoInput ? pagamentoInput.value : 'Não informado';
        const metodoInput = document.querySelector('input[name="metodo"]:checked');
        const metodoEntrega = metodoInput ? metodoInput.value : 'Não informado';
        
        // ============================================================
        // ===== INÍCIO DA MODIFICAÇÃO (SALVAR TEMPO) =====
        // ============================================================
        
        // --- NOVO: Captura o tempo estimado ---
        let tempoEstimadoTexto = '';
        if (metodoEntrega === 'entrega') {
            // Pega o texto, ex: "Tempo estimado: 50-70 min"
            tempoEstimadoTexto = spanTempoEntrega.textContent; 
        } else if (metodoEntrega === 'retirada') {
            tempoEstimadoTexto = spanTempoRetirada.textContent;
        }

        // Limpa o texto para salvar apenas o tempo, ex: "50-70 min"
        if (tempoEstimadoTexto.includes(':')) {
            tempoEstimadoTexto = tempoEstimadoTexto.split(':')[1].trim();
        }
        // --- FIM DA CAPTURA ---

        // ============================================================
        // ============================================================


        if (pagamento === 'cartao' && !dadosCartaoSalvo) {
            alert('Por favor, clique em "Cartão de Crédito" e adicione os dados do seu cartão para continuar.');
            abrirModalCartao(); 
            return;
        }

        const novoPedido = {
            data: new Date().toISOString(),
            itens: carrinhoItens, 
            total: totalDaCompra,
            observacao: observacao, 
            pagamento: pagamento,    
            metodoEntrega: metodoEntrega,
            tempoEstimado: tempoEstimadoTexto // <-- PROPRIEDADE ADICIONADA
        };

        if (pagamento === 'cartao' && dadosCartaoSalvo) {
            novoPedido.detalhesPagamento = dadosCartaoSalvo;
        }

        if (!clienteAtualizado.historico) {
            clienteAtualizado.historico = [];
        }
        
        clienteAtualizado.historico.push(novoPedido);
        clienteAtualizado.carrinho = []; 
        usuarios[clienteIndex] = clienteAtualizado;
        salvarUsuarios(usuarios); 

        localStorage.removeItem('carrinho'); 

        alert('Pedido finalizado com sucesso! Agradecemos a sua preferência.');
        window.location.href = 'index.html';
    };

    // --- LÓGICA (OBJETIVO 1: ENDEREÇO) ---

    const toggleCamposEndereco = (habilitar) => {
        camposEnderecoObrigatorios.forEach(campo => {
            campo.required = habilitar;
            campo.disabled = !habilitar;
        });
        campoComplemento.disabled = !habilitar;

        if (habilitar) {
            secaoEndereco.classList.remove('secao-endereco-desabilitada');
        } else {
            secaoEndereco.classList.add('secao-endereco-desabilitada');
        }
    };

    radioEntrega.addEventListener('change', () => toggleCamposEndereco(true));
    radioRetirada.addEventListener('change', () => toggleCamposEndereco(false));

    // --- LÓGICA (TEMPO) ---
    const getItensNaUltimaHora = () => {
        if (!cliente || !cliente.historico || cliente.historico.length === 0) {
            return 0;
        }
        let contadorItens = 0; 
        const agora = new Date();
        const umaHoraAtras = new Date(agora.getTime() - 60 * 60 * 1000);

        cliente.historico.forEach(pedido => {
            const dataPedido = new Date(pedido.data);
            if (dataPedido > umaHoraAtras) {
                pedido.itens.forEach(item => {
                    contadorItens += item.quantidade;
                });
            }
        });
        return contadorItens;
    };

    const calcularTempoEstimado = (numItens) => {
        if (numItens > 14) { 
            return {
                tempoEntrega: "65-80 min",
                tempoRetirada: "45-60 min"
            };
        } else {
            return {
                tempoEntrega: "50-70 min",
                tempoRetirada: "30-45 min"
            };
        }
    };

    const atualizarTemposEstimados = () => {
        const itensDoHistorico = getItensNaUltimaHora();
        const itensNoCarrinhoAtual = carrinhoItens.reduce((acc, item) => acc + item.quantidade, 0);
        const numItensTotal = itensDoHistorico + itensNoCarrinhoAtual;
        const tempos = calcularTempoEstimado(numItensTotal);
        spanTempoEntrega.textContent = `Tempo estimado: ${tempos.tempoEntrega}`;
        spanTempoRetirada.textContent = `Tempo estimado: ${tempos.tempoRetirada}`;
    };

    // --- LÓGICA (MODAL CARTÃO) ---
    
    const abrirModalCartao = () => {
        modalCartaoCredito.classList.remove('hidden');
    };

    const fecharModalCartao = () => {
        modalCartaoCredito.classList.add('hidden');
        if (!dadosCartaoSalvo && radioCartao.checked) {
            radioPix.checked = true; 
        }
        formCartaoCredito.reset(); 
        caixaOutraBandeira.classList.add('hidden'); 
        inputOutraBandeira.required = false;
    };

    const salvarDadosCartao = (event) => {
        event.preventDefault();
        
        const numeroCartao = document.getElementById('cartao-numero').value;
        let bandeiraCartao;
        const bandeiraSelecionada = selectBandeira.value;
        
        if (bandeiraSelecionada === 'Outra') {
            bandeiraCartao = inputOutraBandeira.value.trim();
            if (!bandeiraCartao) {
                alert('Por favor, informe o nome da bandeira.');
                return;
            }
            if (!BANDEIRAS_VALIDAS.includes(bandeiraCartao.toLowerCase())) {
                alert(`A bandeira "${bandeiraCartao}" não é reconhecida. Por favor, verifique a ortografia (ex: Hipercard, Elo).`);
                return;
            }
        } else if (bandeiraSelecionada === "") {
            alert('Por favor, selecione a bandeira do seu cartão.');
            return;
        } else {
            bandeiraCartao = bandeiraSelecionada;
        }

        if (numeroCartao.length < 13) {
            alert('Número do cartão inválido.');
            return;
        }

        const finalCartao = numeroCartao.slice(-4);
        
        dadosCartaoSalvo = {
            bandeira: bandeiraCartao,
            final: finalCartao
        };

        detalheCartaoSpan.textContent = `${bandeiraCartao} - Final ${finalCartao}`;
        fecharModalCartao();
    };

    const toggleOutraBandeira = () => {
        if (selectBandeira.value === 'Outra') {
            caixaOutraBandeira.classList.remove('hidden');
            inputOutraBandeira.required = true;
        } else {
            caixaOutraBandeira.classList.add('hidden');
            inputOutraBandeira.required = false;
            inputOutraBandeira.value = '';
        }
    };
    selectBandeira.addEventListener('change', toggleOutraBandeira);

    document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.id === 'cartao') {
                abrirModalCartao();
            } else if (modalCartaoCredito.classList.contains('hidden') === false) {
                 modalCartaoCredito.classList.add('hidden');
                 formCartaoCredito.reset(); 
                 caixaOutraBandeira.classList.add('hidden'); 
                 inputOutraBandeira.required = false;
            }
        });
    });

    fecharModalCartaoBtn.addEventListener('click', fecharModalCartao);
    formCartaoCredito.addEventListener('submit', salvarDadosCartao);
    modalCartaoCredito.addEventListener('click', (event) => {
        if (event.target === modalCartaoCredito) {
            fecharModalCartao();
        }
    });

    // --- FIM LÓGICA (MODAL CARTÃO) ---


    // ============================================================
    // ===== NOVA FUNÇÃO: NAVEGAÇÃO COM ENTER =====
    // ============================================================
    /**
     * Habilita a navegação por "Enter" nos formulários
     * @param {HTMLElement} container - O elemento (form, modal) onde a navegação deve funcionar.
     */
    const habilitarNavegacaoEnter = (container) => {
        // Encontra todos os inputs (texto, email, etc.), selects e textareas
        const inputs = Array.from(
            container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea')
        ).filter(el => !el.disabled && !el.closest('.hidden'));

        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (event) => {
                // Se a tecla não for "Enter", não faz nada
                // Exceção: Se for <textarea> e o Shift NÃO estiver pressionado, o Enter deve quebrar linha
                if (event.key !== 'Enter' || (input.tagName === 'TEXTAREA' && !event.shiftKey)) {
                    return;
                }

                // Previne o comportamento padrão (ex: submeter o formulário ou quebrar linha no textarea com Shift)
                event.preventDefault();

                // Encontra o próximo elemento na nossa lista
                const nextInput = inputs[index + 1];

                if (nextInput) {
                    nextInput.focus(); // Move o foco para o próximo
                } else {
                    // Se for o último input, tenta focar o botão de submit principal
                    const submitButton = container.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.focus();
                    }
                }
            });
        });
    };
    // ============================================================
    // ============================================================


    // --- INICIALIZAÇÃO ---
    formFinalizarPedido.addEventListener('submit', finalizarPedido);
    
    // ============================================================
    // ===== MODIFICADO: Listener de Clique no Resumo =====
    // ============================================================
    listaResumoCarrinho.addEventListener('click', (event) => {
        const itemClicado = event.target.closest('.item-ponto-clicavel-resumo');
        if (itemClicado) {
            const index = itemClicado.dataset.index;
            const nomeBase = itemClicado.dataset.nomeBase; // Pegamos o nome base
            const item = carrinhoItens[index];

            // Decide qual modal abrir
            if (itensQuePedemPonto.includes(nomeBase)) {
                abrirModalPonto(item, index);
            } else if (nomeBase === "PORÇAO DE FRITAS") {
                abrirModalFritas(item, index);
            }
        }
    });
    // ============================================================
    // ============================================================
    
    // MODIFICADO: O submit agora chama a nova função 'handleSalvarOpcoes'
    formModalPonto.addEventListener('submit', handleSalvarOpcoes);
    fecharModalPontoBtn.addEventListener('click', fecharModalPonto);
    
    modalPonto.addEventListener('click', (event) => {
        if (event.target === modalPonto) {
            fecharModalPonto();
        }
    });
    // --- FIM NOVOS LISTENERS ---

    // Renderiza tudo na inicialização
    renderizarResumo();
    toggleCamposEndereco(radioEntrega.checked); 
    atualizarTemposEstimados(); 

    // --- NOVA INICIALIZAÇÃO DA NAVEGAÇÃO ---
    habilitarNavegacaoEnter(formFinalizarPedido);
    habilitarNavegacaoEnter(formCartaoCredito);
    habilitarNavegacaoEnter(formModalPonto);

});