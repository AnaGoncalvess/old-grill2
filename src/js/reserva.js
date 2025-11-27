// src/js/reserva.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO FORMULÁRIO DE RESERVA ---
    const formConfirmarReserva = document.getElementById('form-confirmar-reserva');
    const observacoesPedidoTextarea = document.getElementById('observacoes'); 
    const secaoObsPedido = document.getElementById('secao-obs-pedido');
    const inputPessoas = document.getElementById('reserva-pessoas');
    const inputMesas = document.getElementById('reserva-mesas');
    const inputData = document.getElementById('reserva-data');
    const inputHora = document.getElementById('reserva-hora');
    const spanDiaSemana = document.getElementById('reserva-dia-semana');
    const inputObsReserva = document.getElementById('reserva-observacoes'); 
    
    // --- NOVO: Botão de submit e link de carnes ---
    const submitButton = formConfirmarReserva.querySelector('button[type="submit"]');
    const linkCarnes = document.querySelector('.info-reserva a');

    // --- ELEMENTOS DO RESUMO (PRÉ-PEDIDO) ---
    const listaResumoCarrinho = document.getElementById('lista-resumo-carrinho');
    const totalResumoValor = document.getElementById('total-resumo-valor');
    
    // --- ELEMENTOS MODAL PONTO/FRITAS ---
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
    const PRECO_BASE_FRITAS = 22.00; 
    const OPCOES_ADICIONAIS_FRITAS = [
        { nome: "Cheddar", preco: 3.5 },
        { nome: "Bacon", preco: 3.5 },
        { nome: "Muçarela", preco: 3.5 }, // <-- CORRIGIDO
    ];

    // --- Horários de Funcionamento ---
    const operatingHours = {
        0: { open: "10:00", close: "16:00", nome: "Domingo" }, 
        1: null, 
        2: { open: "14:00", close: "22:30", nome: "Terça-feira" }, 
        3: { open: "18:00", close: "22:30", nome: "Quarta-feira" }, 
        4: { open: "18:00", close: "22:30", nome: "Quinta-feira" }, 
        5: { open: "18:00", close: "22:30", nome: "Sexta-feira" }, 
        6: { open: "16:00", close: "23:00", nome: "Sábado" } 
    };
    const diasSemanaNomes = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

    // --- HELPERS DE GERENCIAMENTO DE USUÁRIO ---
    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const salvarUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    const getClienteLogado = () => {
        const emailLogado = sessionStorage.getItem('sessaoClienteEmail');
        if (!emailLogado) return null;
        return getUsuarios().find(u => u.email === emailLogado);
    };
    
    const salvarCarrinhoNaReserva = () => {
        if (!cliente) return;
        let usuarios = getUsuarios();
        let clienteIndex = usuarios.findIndex(u => u.email === cliente.email);
        if (clienteIndex !== -1) {
            usuarios[clienteIndex].carrinho = carrinhoItens;
            salvarUsuarios(usuarios);
        }
    };

    // --- Funções para salvar e restaurar o formulário ---
    const CHAVE_FORM_RESERVA = 'reservaForm';

    const salvarDadosNoSessionStorage = () => {
        const dadosForm = {
            data: inputData.value,
            hora: inputHora.value,
            pessoas: inputPessoas.value,
            obsReserva: inputObsReserva.value
        };
        sessionStorage.setItem(CHAVE_FORM_RESERVA, JSON.stringify(dadosForm));
    };

    const restaurarDadosDoFormulario = () => {
        const dadosSalvos = sessionStorage.getItem(CHAVE_FORM_RESERVA);
        if (dadosSalvos) {
            const dadosForm = JSON.parse(dadosSalvos);
            inputData.value = dadosForm.data || '';
            inputHora.value = dadosForm.hora || '';
            inputPessoas.value = dadosForm.pessoas || '2';
            inputObsReserva.value = dadosForm.obsReserva || '';
            
            atualizarMesas(); 
            handleDataChange({ target: inputData }); 
        }
    };


    const cliente = getClienteLogado();

    // 1. VERIFICA LOGIN
    if (!cliente) {
        alert("Você precisa estar logado para fazer uma reserva.");
        window.location.href = 'cadastro.html';
        return;
    }

    // --- NOVO: Lógica de Modificação de Reserva ---
    const urlParams = new URLSearchParams(window.location.search);
    const modificarId = urlParams.get('modificar');
    let pedidoParaModificar = null;

    if (modificarId) {
        pedidoParaModificar = cliente.historico.find(p => p.data === modificarId);
        if (pedidoParaModificar) {
            // Carrega dados da reserva no formulário
            inputData.value = pedidoParaModificar.reserva_data;
            inputHora.value = pedidoParaModificar.reserva_hora;
            inputPessoas.value = pedidoParaModificar.reserva_pessoas;
            inputObsReserva.value = pedidoParaModificar.reserva_observacoes || '';
            
            // Atualiza campos dependentes
            atualizarMesas(); 
            handleDataChange({ target: inputData }); 
            
            // Atualiza botão e link de "Carnes"
            submitButton.textContent = 'Salvar Alterações';
            linkCarnes.href = `carnes.html?from=reserva&modificar=${modificarId}`;

            // Salva no sessionStorage para persistir se o usuário for add itens
            salvarDadosNoSessionStorage();
        } else {
             alert("Erro: Reserva para modificar não encontrada.");
             window.location.href = 'cadastro.html';
        }
    }
    // --- FIM DA LÓGICA DE MODIFICAÇÃO ---

    let carrinhoItens = cliente.carrinho || [];

    // 2. FUNÇÃO PARA LIDAR COM O FORMULÁRIO DE RESERVA
    const handleConfirmarReserva = (event) => {
        event.preventDefault();

        // Validação de data (digitada) no envio
        const dataAtual = new Date();
        const ano = dataAtual.getFullYear();
        const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
        const dia = dataAtual.getDate().toString().padStart(2, '0');
        const hoje = `${ano}-${mes}-${dia}`;

        if (inputData.value < hoje) {
             alert("Não é possível fazer uma reserva para uma data que já passou. Por favor, verifique o dia.");
             inputData.focus();
             return;
        }

        // Validação final de data/hora
        const dataSelecionada = new Date(inputData.value + 'T12:00:00'); 
        const diaDaSemana = dataSelecionada.getDay();
        const horario = operatingHours[diaDaSemana];
        const horaSelecionada = inputHora.value;

        if (!horario) { 
            alert("Data inválida. Estamos fechados às Segundas-feiras. Por favor, escolha outra data.");
            inputData.focus();
            return;
        }
        if (horaSelecionada < horario.open || horaSelecionada > horario.close) {
            alert(`Horário inválido para ${horario.nome}. Funcionamos das ${horario.open} às ${horario.close}.`);
            inputHora.focus();
            return;
        }

        // Verifica pendência de ponto da carne
        if (carrinhoItens.length > 0) {
            const temPendencia = carrinhoItens.some(item => item.ponto === 'pendente');
            if (temPendencia) {
                alert('Você tem itens no pré-pedido. Por favor, escolha o ponto de todas as carnes antes de finalizar a reserva.');
                listaResumoCarrinho.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }
        
        // Pega dados da reserva
        const reserva_data = inputData.value;
        const reserva_hora = horaSelecionada;
        const reserva_pessoas = inputPessoas.value;
        const reserva_mesas = inputMesas.value;
        const reserva_observacoes = inputObsReserva.value;

        // Pega dados do pré-pedido
        const totalDaCompra = carrinhoItens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        const observacaoPedido = observacoesPedidoTextarea.value;

        // Busca o cliente atualizado
        let usuarios = getUsuarios();
        let clienteIndex = usuarios.findIndex(u => u.email === cliente.email);
        if (clienteIndex === -1) {
            alert("Erro: Usuário não encontrado.");
            return;
        }
        let clienteAtualizado = usuarios[clienteIndex];

        // --- LÓGICA DE SALVAR (MODIFICADA) ---
        if (pedidoParaModificar) {
            // Modo de ATUALIZAÇÃO
            const index = clienteAtualizado.historico.findIndex(p => p.data === modificarId);
            if (index === -1) {
                alert("Erro ao salvar: Reserva original não encontrada.");
                return;
            }
            
            // Atualiza o pedido existente
            clienteAtualizado.historico[index] = {
                ...clienteAtualizado.historico[index], // Mantém ID (data) original e itens
                // Atualiza apenas os campos da reserva
                reserva_data: reserva_data,
                reserva_hora: reserva_hora,
                reserva_pessoas: reserva_pessoas,
                reserva_mesas: reserva_mesas,
                reserva_observacoes: reserva_observacoes,
                status: "Modificado" // Adiciona um status opcional
            };
            
            // Se o carrinho NÃO estava vazio, o pré-pedido foi atualizado
            if (carrinhoItens.length > 0) {
                 clienteAtualizado.historico[index].itens = carrinhoItens;
                 clienteAtualizado.historico[index].total = totalDaCompra;
                 clienteAtualizado.historico[index].observacao = observacaoPedido;
                 clienteAtualizado.historico[index].pagamento = totalDaCompra > 0 ? 'Pagar no local' : null;
            }

            usuarios[clienteIndex] = clienteAtualizado;
            salvarUsuarios(usuarios); 
            
            // Limpa o carrinho SÓ SE ele foi usado para atualizar o pré-pedido
            if(carrinhoItens.length > 0) {
                clienteAtualizado.carrinho = [];
                salvarUsuarios(usuarios);
            }

            alert('Reserva atualizada com sucesso!');

        } else {
            // Modo de CRIAÇÃO (Lógica antiga)
            const novaReserva = {
                data: new Date().toISOString(), 
                itens: carrinhoItens, 
                total: totalDaCompra, 
                observacao: observacaoPedido, 
                reserva_data: reserva_data,
                reserva_hora: reserva_hora,
                reserva_pessoas: reserva_pessoas,
                reserva_mesas: reserva_mesas,
                reserva_observacoes: reserva_observacoes, 
                pagamento: totalDaCompra > 0 ? 'Pagar no local' : null,
                metodoEntrega: 'Reserva (Consumo no Local)',
                tempoEstimado: null,
                status: "Ativo" // Novo status
            };

            if (!clienteAtualizado.historico) {
                clienteAtualizado.historico = [];
            }
            clienteAtualizado.historico.push(novaReserva);
            
            if (carrinhoItens.length > 0) {
                clienteAtualizado.carrinho = []; 
            }
            
            usuarios[clienteIndex] = clienteAtualizado;
            salvarUsuarios(usuarios); 
            alert('Reserva confirmada com sucesso!');
        }
        // --- FIM DA LÓGICA DE SALVAR ---

        sessionStorage.removeItem(CHAVE_FORM_RESERVA);
        window.location.href = 'cadastro.html'; 
    };

    // 3. RENDERIZAR RESUMO (Sem alterações)
    const renderizarResumo = () => {
        listaResumoCarrinho.innerHTML = '';
        let total = 0;

        if (carrinhoItens.length === 0) {
            if (secaoObsPedido) secaoObsPedido.classList.add('secao-obs-pedido-hidden');
            // Se estiver modificando, pega os itens da reserva original
            if (pedidoParaModificar && pedidoParaModificar.itens.length > 0) {
                 listaResumoCarrinho.innerHTML = '<li class="nenhum-item">Seu pré-pedido original está mantido. Adicione novos itens para substituí-lo.</li>';
            } else {
                 listaResumoCarrinho.innerHTML = '<li class="nenhum-item">Nenhum item adicionado ao pré-pedido.</li>';
            }
        } else {
            if (secaoObsPedido) secaoObsPedido.classList.remove('secao-obs-pedido-hidden');
        }

        carrinhoItens.forEach((item, index) => {
            const li = document.createElement('li');
            const nomeBase = item.nomeBase || item.nome; 
            let nomeExibido = item.nome; 
            let classeItem = '';
            const precisaPonto = itensQuePedemPonto.includes(nomeBase);
            const eFritas = nomeBase === "PORÇAO DE FRITAS";

            if (precisaPonto || eFritas) {
                classeItem = 'item-ponto-clicavel-resumo'; 
                li.dataset.index = index; 
                li.dataset.nomeBase = nomeBase; 
                
                if (precisaPonto) {
                    if (item.ponto === 'pendente') {
                        nomeExibido = `${nomeBase} (<span class="ponto-pendente-texto">Escolha o ponto</span>)`;
                    } else if (item.ponto) { 
                        nomeExibido = `${nomeBase} (<span class="ponto-escolhido-texto">${item.ponto}</span>)`;
                    } else {
                        nomeExibido = `${nomeBase} (<span class="ponto-pendente-texto">Escolha o ponto</span>)`;
                    }
                } else if (eFritas) {
                    nomeExibido = item.nome;
                }
            } else {
                nomeExibido = item.nome; 
            }
            
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

    // 4. FUNÇÕES DO MODAL DE PONTO/FRITAS (Sem alterações)
    const abrirModalPonto = (item, index) => {
        const nomeLimpo = item.nomeBase.replace('COM ACOMPANHAMENTOS', '').replace('COM FRITAS', '').trim();
        modalPontoTitulo.textContent = `Escolha o ponto do ${nomeLimpo}`;
        modalPontoIndexInput.value = index; 
        modalPontoLista.innerHTML = ''; 
        formModalPonto.dataset.tipo = 'ponto';

        opcoesPontoCarne.forEach((opcao, i) => {
            let isChecked = (opcao === item.ponto);
            if (item.ponto === 'pendente' && opcao === 'Ao Ponto') isChecked = true;
            const idOpcao = `ponto-checkout-${i}`;
            modalPontoLista.innerHTML += `
                <div class="opcao-radio">
                    <input type="radio" id="${idOpcao}" name="ponto-carne-checkout" value="${opcao}" ${isChecked ? "checked" : ""}>
                    <label for="${idOpcao}">${opcao}</label>
                </div>
            `;
        });
        modalPonto.classList.remove('hidden');
    };

    const abrirModalFritas = (item, index) => {
        modalPontoTitulo.textContent = `Escolha seus adicionais`;
        modalPontoIndexInput.value = index;
        modalPontoLista.innerHTML = '';
        formModalPonto.dataset.tipo = 'fritas';

        // ADICIONADO TEXTO DE AJUDA
        modalPontoLista.innerHTML = `<p class="info-simples">Para a porção simples (R$ ${PRECO_BASE_FRITAS.toFixed(
          2
        )}), desmarque todas as opções e clique em "Confirmar".</p>`;

        OPCOES_ADICIONAIS_FRITAS.forEach((opcao, i) => {
            const idOpcao = `fritas-checkout-${i}`;
            const isChecked = item.nome.includes(opcao.nome);
            modalPontoLista.innerHTML += `
                <div class="opcao-checkbox">
                    <input type="checkbox" id="${idOpcao}" name="adicional-fritas" value="${opcao.nome}" data-preco="${opcao.preco}" ${isChecked ? "checked" : ""}>
                    <label for="${idOpcao}">${opcao.nome} (R$ ${opcao.preco.toFixed(2)})</label>
                </div>
            `;
        });
        modalPonto.classList.remove('hidden');
    };

    const fecharModalPonto = () => {
        modalPonto.classList.add('hidden');
        delete formModalPonto.dataset.tipo;
    };

    const handleSalvarOpcoes = (event) => {
        event.preventDefault();
        const tipoModal = formModalPonto.dataset.tipo;
        const itemIndex = modalPontoIndexInput.value;
        const item = carrinhoItens[itemIndex];

        if (tipoModal === 'ponto') {
            const formData = new FormData(formModalPonto);
            const pontoEscolhido = formData.get('ponto-carne-checkout');
            if (!pontoEscolhido) { alert('Por favor, selecione uma opção.'); return; }
            item.ponto = pontoEscolhido; 
            item.nome = `${item.nomeBase} (${pontoEscolhido})`; 
        } else if (tipoModal === 'fritas') {
            const checkboxes = modalPontoLista.querySelectorAll('input[name="adicional-fritas"]:checked');
            let escolhas = [];
            let precoAdicionais = 0;
            checkboxes.forEach(check => {
                escolhas.push(check.value);
                precoAdicionais += parseFloat(check.dataset.preco);
            });
            if (escolhas.length > 0) {
                item.nome = `${item.nomeBase} (${escolhas.join(', ')})`;
            } else {
                item.nome = `${item.nomeBase} (Simples)`;
            }
            item.preco = PRECO_BASE_FRITAS + precoAdicionais;
        }
        salvarCarrinhoNaReserva();
        renderizarResumo();
        fecharModalPonto();
    };

    // 5. NAVEGAÇÃO COM ENTER (Sem alterações)
    const habilitarNavegacaoEnter = (container) => {
        const inputs = Array.from(
            container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea')
        ).filter(el => !el.disabled && !el.closest('.hidden'));

        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' || (input.tagName === 'TEXTAREA' && !event.shiftKey)) {
                    return;
                }
                event.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    const submitButton = container.querySelector('button[type="submit"]');
                    if (submitButton) submitButton.focus();
                }
            });
        });
    };

    // --- Função para atualizar mesas ---
    const atualizarMesas = () => {
        const pessoas = parseInt(inputPessoas.value) || 0;
        if (pessoas < 1) {
            inputMesas.value = 1;
            return;
        }
        const mesas = Math.ceil(pessoas / 4);
        inputMesas.value = mesas;
    };

    // --- Função para atualizar data/hora ---
    const handleDataChange = (event) => {
        const input = event.target; 
        const dataSelecionada = input.value;
        
        if (!dataSelecionada) {
            spanDiaSemana.textContent = '';
            spanDiaSemana.classList.remove('erro');
            input.setCustomValidity("");
            inputHora.disabled = false;
            return;
        }

        const dataObj = new Date(dataSelecionada + 'T12:00:00');
        const diaDaSemana = dataObj.getDay();
        const horario = operatingHours[diaDaSemana];

        spanDiaSemana.textContent = ` (${diasSemanaNomes[diaDaSemana]})`;

        if (!horario) { 
            spanDiaSemana.classList.add('erro');
            spanDiaSemana.textContent = ` (Fechado às Segundas)`;
            input.setCustomValidity("Desculpe, estamos fechados às Segundas-feiras.");
            inputHora.disabled = true;
            inputHora.value = "";
        } else { 
            spanDiaSemana.classList.remove('erro');
            input.setCustomValidity("");
            inputHora.disabled = false;
            inputHora.min = horario.open;
            inputHora.max = horario.close;
            if (inputHora.value < horario.open || inputHora.value > horario.close) {
                 inputHora.value = horario.open;
            }
        }
    };

    // 6. INICIALIZAÇÃO E LISTENERS
    if (formConfirmarReserva) {
        formConfirmarReserva.addEventListener('submit', handleConfirmarReserva);
    }
    
    // Listeners do Modal Ponto/Fritas
    listaResumoCarrinho.addEventListener('click', (event) => {
        const itemClicado = event.target.closest('.item-ponto-clicavel-resumo');
        if (itemClicado) {
            const index = itemClicado.dataset.index;
            const nomeBase = itemClicado.dataset.nomeBase;
            const item = carrinhoItens[index];
            if (itensQuePedemPonto.includes(nomeBase)) {
                abrirModalPonto(item, index);
            } else if (nomeBase === "PORÇAO DE FRITAS") {
                abrirModalFritas(item, index);
            }
        }
    });
    
    if (formModalPonto) formModalPonto.addEventListener('submit', handleSalvarOpcoes);
    if (fecharModalPontoBtn) fecharModalPontoBtn.addEventListener('click', fecharModalPonto);
    if (modalPonto) {
        modalPonto.addEventListener('click', (event) => {
            if (event.target === modalPonto) fecharModalPonto();
        });
    }

    // Listeners do formulário
    inputPessoas.addEventListener('input', atualizarMesas);
    inputData.addEventListener('input', handleDataChange);

    // Listeners para salvar dados do form no session storage
    inputData.addEventListener('change', salvarDadosNoSessionStorage);
    inputHora.addEventListener('change', salvarDadosNoSessionStorage);
    inputPessoas.addEventListener('input', salvarDadosNoSessionStorage);
    inputObsReserva.addEventListener('input', salvarDadosNoSessionStorage);

    // Inicializa o render e a navegação
    renderizarResumo();
    habilitarNavegacaoEnter(formConfirmarReserva);
    habilitarNavegacaoEnter(formModalPonto);

    // Define a data mínima (HOJE)
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const hoje = `${ano}-${mes}-${dia}`;
    
    inputData.min = hoje;
    const maxAno = ano + 2; 
    inputData.max = `${maxAno}-12-31`;
    
    // Restaura os dados do formulário APÓS definir min/max
    // E SÓ se não estivermos no modo de modificação (que já define os valores)
    if (!modificarId) {
        restaurarDadosDoFormulario();
    }
    
    // Roda o cálculo de mesas no início (caso não seja restaurado)
    if (!sessionStorage.getItem(CHAVE_FORM_RESERVA) && !modificarId) {
        atualizarMesas();
    }
});