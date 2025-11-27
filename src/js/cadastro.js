// src/js/cadastro.js

document.addEventListener('DOMContentLoaded', () => {
    // --- CÓDIGO SECRETO ---
    // Você pode mudar este código para o que quiser
    const CODIGO_BAIXA_SECRETO = "80028922"; 
    
    // --- ELEMENTOS PRINCIPAIS ---
    const areaCadastro = document.getElementById('area-cadastro');
    const painelCliente = document.getElementById('painel-cliente');
    
    // --- ELEMENTOS DOS FORMULÁRIOS ---
    const cadastroForm = document.getElementById('cadastro-form');
    const loginForm = document.getElementById('login-form'); 
    const tabButtonsContainer = document.querySelector('.tab-buttons'); 
    const allTabButtons = document.querySelectorAll('.tab-buttons .tab-button'); 
    const allTabForms = document.querySelectorAll('.tab-form'); 
    const tituloForm = document.getElementById('titulo-form'); 
    
    // --- ELEMENTOS DO PAINEL ---
    const saudacaoCliente = document.getElementById('saudacao-cliente');
    const infoCliente = document.getElementById('info-cliente');
    const historicoComprasLista = document.getElementById('historico-compras-lista');
    const btnLogout = document.getElementById('btn-logout');
    const btnEditarDados = document.getElementById('btn-editar-dados');
    const painelTabButtons = document.querySelectorAll('.painel-nav .tab-button'); 
    const tabContents = document.querySelectorAll('.tab-content');

    // --- ELEMENTOS DO MODAL DE EDIÇÃO ---
    const modalEditar = document.getElementById('modal-editar');
    const editForm = document.getElementById('edit-form');
    const fecharModalBtn = document.getElementById('fechar-modal');
    
    // --- ELEMENTOS MODAL HISTÓRICO ---
    const modalHistorico = document.getElementById('modal-historico');
    const fecharModalHistoricoBtn = document.getElementById('fechar-modal-historico');
    const detalhesPedidoConteudo = document.getElementById('detalhes-pedido-conteudo');

    // --- ELEMENTOS MODAL HORÁRIOS ---
    const modalHorarios = document.getElementById('modal-horarios');
    const fecharModalHorariosBtn = document.getElementById('fechar-modal-horarios');
    const btnHorarios = document.getElementById('btn-horarios'); 

    // --- MODIFICADO: ELEMENTOS MODAL TAXA ---
    const modalTaxa = document.getElementById('modal-taxa');
    const fecharModalTaxaBtn = document.getElementById('fechar-modal-taxa');
    const taxaOpcoesInicial = document.getElementById('taxa-opcoes-inicial');
    const taxaDetalhesPix = document.getElementById('taxa-detalhes-pix');
    const btnTaxaPix = document.getElementById('btn-taxa-pix');
    const btnTaxaDivida = document.getElementById('btn-taxa-divida');
    const formPagarComCodigo = document.getElementById('form-pagar-com-codigo');
    const inputCodigoBaixaPix = document.getElementById('codigo-baixa-pix');
    // --- FIM MODIFICADO ---

    // --- ELEMENTOS MODAL PAGAR DÍVIDA (PARA DEPOIS) ---
    const modalPagarDivida = document.getElementById('modal-pagar-divida');
    const fecharModalPagarDividaBtn = document.getElementById('fechar-modal-pagar-divida');
    const formPagarDivida = document.getElementById('form-pagar-divida');
    const inputCodigoBaixa = document.getElementById('codigo-baixa');

    // --- HELPERS DE GERENCIAMENTO DE USUÁRIO ---
    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const salvarUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    const getClienteLogado = () => {
        const emailLogado = sessionStorage.getItem('sessaoClienteEmail');
        if (!emailLogado) return null;
        return getUsuarios().find(u => u.email === emailLogado);
    };

    const salvarHistoricoCliente = (emailCliente, novoHistorico) => {
        let usuarios = getUsuarios();
        let clienteIndex = usuarios.findIndex(u => u.email === emailCliente);
        if (clienteIndex !== -1) {
            usuarios[clienteIndex].historico = novoHistorico;
            salvarUsuarios(usuarios);
        }
    };

    const salvarCliente = (clienteAtualizado) => {
         let usuarios = getUsuarios();
         let clienteIndex = usuarios.findIndex(u => u.email === clienteAtualizado.email);
         if (clienteIndex !== -1) {
            usuarios[clienteIndex] = clienteAtualizado;
            salvarUsuarios(usuarios);
         }
    };
    
    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Verifica se há um usuário logado e exibe o painel ou o formulário
     */
    const verificarLogin = () => {
        const cliente = getClienteLogado();
        if (cliente) {
            exibirPainel(cliente);
        } else {
            exibirFormCadastro();
        }
    };

    /**
     * ====================================================================
     * ===== EXIBIR PAINEL (MODIFICADO) =====
     * ====================================================================
     * A lógica de adicionar o listener foi removida daqui.
     */
    const exibirPainel = (cliente) => {
        areaCadastro.classList.add('hidden');
        painelCliente.classList.remove('hidden');

        saudacaoCliente.textContent = `Olá, ${cliente.nome.split(' ')[0]}!`;
        
        let dividaHTML = '';
        if (cliente.divida && cliente.divida > 0) {
            dividaHTML = `
                <div class="divida-pendente">
                    <h3>Dívida Pendente</h3>
                    <p>Você possui uma taxa de cancelamento pendente no valor de <strong>R$ ${cliente.divida.toFixed(2)}</strong>.</p>
                    <button class="btn-pagar-divida">Pagar Dívida Agora</button>
                </div>
            `;
        }

        infoCliente.innerHTML = `
            ${dividaHTML} 
            <p><strong>Nome:</strong> ${cliente.nome}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            <p><strong>Data de Nascimento:</strong> ${formatarData(cliente.dataNascimento)}</p>
        `;
        
        // O listener foi MOVIDO para fora desta função
        
        renderizarHistorico(cliente.historico); 
        ativarAbaPainel('dados');
    };
    
    const exibirFormCadastro = () => {
        areaCadastro.classList.remove('hidden');
        painelCliente.classList.add('hidden');
    };

    /**
     * Lógica de Cadastro (COM VALIDAÇÃO DE DATA)
     */
    const handleCadastro = (event) => {
        event.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email-cadastro').value.toLowerCase();
        const senha = document.getElementById('senha-cadastro').value; 
        const telefone = document.getElementById('telefone').value;
        const dataNascimento = document.getElementById('data-nascimento').value;

        if (!dataNascimento) {
            alert('Por favor, preencha a data de nascimento.');
            return;
        }
        const anoNascimento = new Date(dataNascimento + 'T12:00:00').getFullYear(); 
        if (anoNascimento > 2010) {
            alert('Você deve ter nascido em 2010 ou antes para se cadastrar.');
            return; 
        }

        if (senha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        let usuarios = getUsuarios();
        let clienteExistente = usuarios.find(u => u.email === email);

        if (clienteExistente) {
            alert('Já há uma conta com o email citado.');
        } else {
            const novoCliente = {
                nome, email, senha, telefone, dataNascimento,
                historico: [],
                carrinho: [],
                divida: 0 // Inicia dívida zerada
            };
            
            usuarios.push(novoCliente);
            salvarUsuarios(usuarios); 
            sessionStorage.setItem('sessaoClienteEmail', novoCliente.email);
            alert('Cadastro realizado com sucesso!');
            verificarLogin();
        }
    };

    const handleLogin = (event) => {
        event.preventDefault();
        const email = document.getElementById('email-login').value.toLowerCase();
        const senha = document.getElementById('senha-login').value;
        const usuarios = getUsuarios();
        const cliente = usuarios.find(u => u.email === email);

        if (!cliente) {
            alert('Email não cadastrado. Primeiro faça o cadastro completo');
            return;
        }
        if (cliente.senha !== senha) {
            alert('Email ou senha estão incorretos.');
            return;
        }
        sessionStorage.setItem('sessaoClienteEmail', cliente.email);
        verificarLogin();
    };

    const handleLogout = () => {
        if (confirm('Você tem certeza que deseja sair?')) {
            sessionStorage.removeItem('sessaoClienteEmail');
            localStorage.removeItem('carrinho'); 
            alert('Você saiu da sua conta.'); 
            verificarLogin();
        }
    };

    // --- FUNÇÕES DE CONTROLE DE ABAS ---
    const setupFormTabs = () => {
        if (tabButtonsContainer) { 
            tabButtonsContainer.addEventListener('click', (event) => {
                const btnClicado = event.target.closest('button');
                if (!btnClicado) return;
                const formAlvoId = btnClicado.dataset.form;
                allTabButtons.forEach(btn => btn.classList.remove('active'));
                allTabForms.forEach(form => form.classList.remove('active'));
                btnClicado.classList.add('active');
                document.getElementById(formAlvoId).classList.add('active');
                tituloForm.textContent = (formAlvoId === 'login-form') ? 'FAÇA SEU LOGIN' : 'FAÇA SEU CADASTRO';
            });
        }
    };

    const handlePainelTabClick = (event) => {
        const tabAlvoId = event.target.dataset.tab;
        if(tabAlvoId) { 
            ativarAbaPainel(tabAlvoId);
        }
    };
    
    const ativarAbaPainel = (tabId) => {
        painelTabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        const activeButton = document.querySelector(`.painel-nav .tab-button[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }
    
    // --- FUNÇÕES DE RENDERIZAÇÃO E UTILITÁRIOS ---
    const renderizarHistorico = (historico) => {
        historicoComprasLista.innerHTML = '';
        if (!historico || historico.length === 0) {
            historicoComprasLista.innerHTML = '<p>Você ainda não fez nenhum pedido ou reserva.</p>';
            return;
        }
        
        const cliente = getClienteLogado();
        const agora = new Date();
        let precisaSalvar = false; 

        historico.slice().reverse().forEach(pedido => {
            const pedidoDiv = document.createElement('div');
            pedidoDiv.className = 'pedido';
            
            const isReserva = pedido.reserva_data;
            let itensHTML = '';
            let headerHTML = '';
            let botoesAcaoHTML = '';
            let statusHTML = '';

            if (isReserva && (!pedido.status || pedido.status === "Ativo" || pedido.status === "Modificado")) {
                const horaReserva = new Date(pedido.reserva_data + 'T' + pedido.reserva_hora);
                const horaConclusao = new Date(horaReserva.getTime() + 60 * 60 * 1000); 
                if (agora > horaConclusao) {
                    pedido.status = "Concluído";
                    precisaSalvar = true; 
                }
            }
            if (pedido.itens && pedido.itens.length > 0) {
                pedido.itens.forEach(item => {
                    itensHTML += `<li><span>${item.nome} (x${item.quantidade})</span> <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span></li>`;
                });
            } else if (isReserva) {
                itensHTML = '<li class="nenhum-item">Nenhum pré-pedido foi feito.</li>';
            } else {
                itensHTML = '<li class="nenhum-item">Nenhum item neste pedido.</li>';
            }
            if (pedido.observacao) {
                itensHTML += `<li class="pedido-observacao"><strong>Observação (Pedido):</strong> ${pedido.observacao}</li>`;
            }

            if (isReserva) {
                const horaReserva = new Date(pedido.reserva_data + 'T' + pedido.reserva_hora);
                const diffHoras = (horaReserva - agora) / (1000 * 60 * 60);

                if (pedido.status === "Concluído") {
                    statusHTML = '<span class="pedido-status status-concluido">Concluído</span>';
                } else if (pedido.status === "Cancelado") {
                    statusHTML = '<span class="pedido-status status-cancelado">Cancelado</span>';
                } else if (diffHoras <= 0) {
                     statusHTML = '<span class="pedido-status">Em andamento</span>';
                }

                if (diffHoras > 0 && pedido.status !== "Cancelado") {
                    if (diffHoras > 24) {
                        botoesAcaoHTML += `<a href="reserva.html?modificar=${pedido.data}" class="btn-modificar-reserva">Modificar</a>`;
                    }
                    botoesAcaoHTML += `<button class="btn-cancelar-reserva" data-id="${pedido.data}">Cancelar</button>`;
                    botoesAcaoHTML = `<div class="pedido-acoes">${botoesAcaoHTML}</div>`;
                }
            }

            if (isReserva) {
                headerHTML = `
                    <div class="pedido-header reserva-header">
                        <div>
                           <span class="data-reserva">Reserva para: <strong>${formatarData(pedido.reserva_data)} às ${pedido.reserva_hora}</strong></span>
                           ${statusHTML} 
                        </div>
                        <span class="total">Pessoas: ${pedido.reserva_pessoas}</span>
                    </div>
                    <div class="pedido-header pedido-sub-header">
                        <span class="data">Registrado em: ${new Date(pedido.data).toLocaleString('pt-BR')}</span>
                        <span class="total">Pré-Pedido: R$ ${pedido.total.toFixed(2)}</span>
                    </div>
                `;
            } else {
                headerHTML = `
                    <div class="pedido-header">
                        <span class="data">Pedido em: ${new Date(pedido.data).toLocaleString('pt-BR')}</span>
                        <span class="total">Total: R$ ${pedido.total.toFixed(2)}</span>
                    </div>
                `;
            }

            pedidoDiv.innerHTML = `
                ${headerHTML}
                <ul class="pedido-lista">${itensHTML}</ul>
                ${botoesAcaoHTML} 
            `;
            
            pedidoDiv.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                     abrirModalHistorico(pedido);
                }
            });
            
            historicoComprasLista.appendChild(pedidoDiv);
        });

        if (precisaSalvar) {
            salvarHistoricoCliente(cliente.email, historico);
        }
    };
    
    const formatarData = (dataString) => {
        if (!dataString) return '';
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // --- FUNÇÕES DO MODAL DE EDIÇÃO ---
    const abrirModalEdicao = () => {
        const cliente = getClienteLogado();
        if (cliente) {
            document.getElementById('edit-nome').value = cliente.nome;
            document.getElementById('edit-email').value = cliente.email;
            document.getElementById('edit-telefone').value = cliente.telefone;
            document.getElementById('edit-data-nascimento').value = cliente.dataNascimento;
            modalEditar.classList.remove('hidden');
        }
    };
    const fecharModalEdicao = () => modalEditar.classList.add('hidden');

    const handleSalvarEdicao = (event) => {
        event.preventDefault();
        const clienteLogado = getClienteLogado();
        if (!clienteLogado) return;
        let usuarios = getUsuarios();
        let clienteIndex = usuarios.findIndex(u => u.email === clienteLogado.email);
        if (clienteIndex !== -1) {
            usuarios[clienteIndex].nome = document.getElementById('edit-nome').value;
            usuarios[clienteIndex].telefone = document.getElementById('edit-telefone').value;
            usuarios[clienteIndex].dataNascimento = document.getElementById('edit-data-nascimento').value;
            salvarUsuarios(usuarios);
            alert('Dados atualizados com sucesso!');
            fecharModalEdicao();
            exibirPainel(usuarios[clienteIndex]); 
        }
    };
    
    // --- FUNÇÕES MODAL HISTÓRICO ---
    const formatarPagamento = (pagamento) => {
        if (!pagamento) return 'Não informado';
        switch(pagamento) {
            case 'cartao': return 'Cartão de Crédito';
            case 'pix': return 'Pix';
            case 'dinheiro': return 'Dinheiro (na entrega)';
            default: return pagamento;
        }
    };
    const formatarMetodoEntrega = (metodo) => {
        if (!metodo) return 'Não informado';
        switch(metodo) {
            case 'entrega': return 'Entrega (Delivery)';
            case 'retirada': return 'Retirada no Local';
            default: return metodo;
        }
    };

    const abrirModalHistorico = (pedido) => {
        let itensHTML = '';
        const isReserva = pedido.reserva_data;
        
        let totalItensPedido = 0;
        if (pedido.itens && pedido.itens.length > 0) {
            totalItensPedido = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0);
            pedido.itens.forEach(item => {
                itensHTML += `<li><span>${item.nome} (x${item.quantidade})</span> <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span></li>`;
            });
        } else {
            itensHTML = `<li>${isReserva ? 'Nenhum item no pré-pedido.' : 'Nenhum item neste pedido.'}</li>`;
        }

        let conteudoHTML = ''; 
        if (isReserva) {
            conteudoHTML += `
                <h3>Detalhes da Reserva</h3>
                <p><strong>Status:</strong> ${pedido.status || 'Ativo'}</p>
                <p><strong>Data:</strong> ${formatarData(pedido.reserva_data)}</p>
                <p><strong>Horário:</strong> ${pedido.reserva_hora}</p>
                <p><strong>Pessoas:</strong> ${pedido.reserva_pessoas}</p>
                <p><strong>Mesas:</strong> ${pedido.reserva_mesas}</p>
                <p><strong>Método:</strong> ${formatarMetodoEntrega(pedido.metodoEntrega)}</p>
                <p><strong>Valor do Pré-Pedido:</strong> R$ ${pedido.total.toFixed(2)}</p>
            `;
            if (pedido.reserva_observacoes) {
                conteudoHTML += `
                    <h3>Observações da Reserva</h3>
                    <p class="detalhe-observacao">${pedido.reserva_observacoes}</p>
                `;
            }
            conteudoHTML += `
                <div class="detalhes-finais-pedido">
                    <h3>DETALHES</h3>
                    ${pedido.pagamento ? `<p><strong>Pagamento (Pré-Pedido):</strong> ${formatarPagamento(pedido.pagamento)}</p>` : ''}
                    <p><strong>Registrado em:</strong> ${new Date(pedido.data).toLocaleString('pt-BR')}</p>
                </div>
            `;
            conteudoHTML += `
                <h3>Itens do Pré-Pedido (${totalItensPedido})</h3>
                <ul>${itensHTML}</ul>
            `;
            conteudoHTML += `<h3>Observações</h3>`; 
            if (pedido.observacao) {
                conteudoHTML += `<p class="detalhe-observacao">${pedido.observacao}</p>`;
            } else {
                conteudoHTML += `<p><i>Nenhuma observação foi feita para o pedido.</i></p>`;
            }

        } else {
            // --- ESTRUTURA PARA PEDIDO NORMAL ---
            let dataHtml = `<p><strong>Data:</strong> ${new Date(pedido.data).toLocaleString('pt-BR')}`;
            if (pedido.tempoEstimado) {
                dataHtml += ` <span class="detalhe-tempo-estimado">(Estimativa: ${pedido.tempoEstimado})</span>`;
            }
            dataHtml += `</p>`;
            conteudoHTML += dataHtml;
            conteudoHTML += `<p><strong>Valor Total:</strong> R$ ${pedido.total.toFixed(2)}</p>`;
            if (pedido.pagamento === 'cartao' && pedido.detalhesPagamento) {
                conteudoHTML += `
                    <p><strong>Forma de Pagamento:</strong> Cartão de Crédito</p>
                    <p><strong>Detalhes do Cartão:</strong> ${pedido.detalhesPagamento.bandeira} - Final ${pedido.detalhesPagamento.final}</p>
                `;
            } else if (pedido.pagamento) {
                conteudoHTML += `<p><strong>Forma de Pagamento:</strong> ${formatarPagamento(pedido.pagamento)}</p>`;
            }
            conteudoHTML += `<p><strong>Método de Entrega:</strong> ${formatarMetodoEntrega(pedido.metodoEntrega)}</p>`;
            conteudoHTML += `
                <h3>Itens do Pedido (${totalItensPedido})</h3>
                <ul>${itensHTML}</ul>
            `;
            conteudoHTML += `<h3>Observações</h3>`; 
            if (pedido.observacao) {
                conteudoHTML += `<p class="detalhe-observacao">${pedido.observacao}</p>`;
            } else {
                conteudoHTML += `<p><i>Nenhuma observação foi feita.</i></p>`;
            }
        }
        detalhesPedidoConteudo.innerHTML = conteudoHTML;
        modalHistorico.classList.remove('hidden');
    };
    const fecharModalHistorico = () => modalHistorico.classList.add('hidden');
    
    // --- FUNÇÕES MODAL HORÁRIOS ---
    const abrirModalHorarios = (event) => {
        event.preventDefault(); 
        if(modalHorarios) modalHorarios.classList.remove('hidden');
    };
    const fecharModalHorarios = () => {
        if(modalHorarios) modalHorarios.classList.add('hidden');
    };

    // --- FUNÇÕES DE NAVEGAÇÃO E REVELAR SENHA ---
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetInputId = button.dataset.target;
            const targetInput = document.getElementById(targetInputId);
            if (!targetInput) return; 
            const eyeIcon = button.querySelector('.eye-icon');
            const eyeSlashIcon = button.querySelector('.eye-slash-icon');
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                if(eyeIcon) eyeIcon.classList.add('hidden');
                if(eyeSlashIcon) eyeSlashIcon.classList.remove('hidden');
            } else {
                targetInput.type = 'password';
                if(eyeIcon) eyeIcon.classList.remove('hidden');
                if(eyeSlashIcon) eyeSlashIcon.classList.add('hidden');
            }
        });
    });

    const habilitarNavegacaoEnter = (container) => {
        const inputs = Array.from(
            container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea')
        ).filter(el => !el.disabled && !el.closest('.hidden'));
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' || (input.tagName === 'TEXTAREA' && !event.shiftKey)) return;
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

    // --- EVENT LISTENERS ---
    if (cadastroForm) cadastroForm.addEventListener('submit', handleCadastro);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);
    
    painelTabButtons.forEach(button => button.addEventListener('click', handlePainelTabClick));
    
    if (btnEditarDados) btnEditarDados.addEventListener('click', abrirModalEdicao);
    if (fecharModalBtn) fecharModalBtn.addEventListener('click', fecharModalEdicao);
    if (editForm) editForm.addEventListener('submit', handleSalvarEdicao);
    if (modalEditar) {
        modalEditar.addEventListener('click', (event) => {
            if (event.target === modalEditar) fecharModalEdicao();
        });
    }
    
    if (fecharModalHistoricoBtn) fecharModalHistoricoBtn.addEventListener('click', fecharModalHistorico);
    if (modalHistorico) {
        modalHistorico.addEventListener('click', (event) => {
            if (event.target === modalHistorico) fecharModalHistorico();
        });
    }

    if (btnHorarios) btnHorarios.addEventListener('click', abrirModalHorarios);
    if (fecharModalHorariosBtn) fecharModalHorariosBtn.addEventListener('click', fecharModalHorarios);
    if (modalHorarios) {
        modalHorarios.addEventListener('click', (event) => {
            if (event.target === modalHorarios) fecharModalHorarios();
        });
    }

    /**
     * ====================================================================
     * ===== LÓGICA DE CANCELAMENTO (MODIFICADA) =====
     * ====================================================================
     */
    historicoComprasLista.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-cancelar-reserva')) {
            const pedidoId = e.target.dataset.id;
            handleCancelarReserva(pedidoId);
        }
    });

    const handleCancelarReserva = (pedidoId) => {
        const cliente = getClienteLogado();
        if (!cliente) return;
        
        const historico = cliente.historico;
        const pedido = historico.find(p => p.data === pedidoId);
        if (!pedido) return;

        const agora = new Date();
        const horaReserva = new Date(pedido.reserva_data + 'T' + pedido.reserva_hora);
        const diffHoras = (horaReserva - agora) / (1000 * 60 * 60);
        const mesas = parseInt(pedido.reserva_mesas, 10);

        // 1. Checa a regra da taxa
        if (diffHoras < 1 && mesas >= 4) {
            abrirModalTaxa(pedidoId);
        } else {
            // 2. Confirmação normal
            if (confirm("Tem certeza que deseja cancelar esta reserva?")) {
                confirmarCancelamento(pedidoId, false); // Cancela sem taxa
            }
        }
    };

    /**
     * ====================================================================
     * ===== NOVAS FUNÇÕES: MODAL DE TAXA (FLUXO PIX / DÍVIDA) =====
     * ====================================================================
     */
    
    // Abre o modal e anexa o ID do pedido aos botões
    const abrirModalTaxa = (pedidoId) => {
        // Reseta o modal para o estado inicial
        taxaOpcoesInicial.classList.remove('hidden');
        taxaDetalhesPix.classList.add('hidden');
        formPagarComCodigo.reset();
        
        // Atribui o ID aos botões
        btnTaxaPix.dataset.id = pedidoId;
        btnTaxaDivida.dataset.id = pedidoId;
        formPagarComCodigo.dataset.id = pedidoId; // Atribui ao formulário
        
        modalTaxa.classList.remove('hidden');
    };

    const fecharModalTaxa = () => {
        modalTaxa.classList.add('hidden');
    };

    // Mostra a seção PIX
    if (btnTaxaPix) {
        btnTaxaPix.addEventListener('click', () => {
            taxaOpcoesInicial.classList.add('hidden');
            taxaDetalhesPix.classList.remove('hidden');
        });
    }

    // Lógica para Adicionar à Dívida
    if (btnTaxaDivida) {
        btnTaxaDivida.addEventListener('click', (e) => {
            const pedidoId = e.target.dataset.id;
            const cliente = getClienteLogado();
            if (!cliente) return;
            
            cliente.divida = (cliente.divida || 0) + 50.00;
            salvarCliente(cliente); 
            
            confirmarCancelamento(pedidoId, true); // Cancela E marca que teve taxa
            
            alert("Reserva cancelada. Uma taxa de R$ 50,00 foi adicionada à sua conta.");
            fecharModalTaxa();
            exibirPainel(cliente); // Re-renderiza o painel para mostrar a dívida
        });
    }
    
    // Lógica para confirmar após "pagar" o Pix (DENTRO DO MODAL DE TAXA)
    if (formPagarComCodigo) {
        formPagarComCodigo.addEventListener('submit', (e) => {
            e.preventDefault();
            const pedidoId = e.target.dataset.id;
            const codigoDigitado = inputCodigoBaixaPix.value; // Pega o código deste modal
    
            if (codigoDigitado === CODIGO_BAIXA_SECRETO) {
                // Cancela a reserva (sem taxa, pois foi "paga")
                confirmarCancelamento(pedidoId, false); 
                
                alert("Pagamento confirmado. Reserva cancelada!");
                fecharModalTaxa();
                formPagarComCodigo.reset();
            } else {
                alert("Código de baixa incorreto. Verifique o código recebido via WhatsApp.");
                formPagarComCodigo.reset();
            }
        });
    }
    

    /**
     * ====================================================================
     * ===== NOVAS FUNÇÕES: MODAL DE PAGAR DÍVIDA (DEPOIS) =====
     * ====================================================================
     */
     
    const abrirModalPagarDivida = () => {
        if (formPagarDivida) formPagarDivida.reset(); 
        if (modalPagarDivida) modalPagarDivida.classList.remove('hidden');
    };
    
    const fecharModalPagarDivida = () => {
        if (modalPagarDivida) modalPagarDivida.classList.add('hidden');
    };
    
    // Este é o modal que abre a partir do PAINEL
    const handlePagarDivida = (e) => {
        e.preventDefault();
        const codigoDigitado = inputCodigoBaixa.value; // Pega o código do modal 'pagar-divida'
        
        if (codigoDigitado === CODIGO_BAIXA_SECRETO) {
            const cliente = getClienteLogado();
            if (!cliente) return;
            
            cliente.divida = 0; // Zera a dívida
            salvarCliente(cliente);
            
            alert("Dívida quitada com sucesso!");
            fecharModalPagarDivida();
            exibirPainel(cliente); // Re-renderiza o painel
            
        } else {
            alert("Código de baixa incorreto. Solicite ao gerente.");
            if (formPagarDivida) formPagarDivida.reset();
        }
    };
    

    /**
     * Função Central de Cancelamento
     */
    const confirmarCancelamento = (pedidoId, aplicarTaxa) => {
        const cliente = getClienteLogado();
        if (!cliente) return;
        
        let historico = cliente.historico;
        const pedidoIndex = historico.findIndex(p => p.data === pedidoId);
        if (pedidoIndex === -1) return;

        historico[pedidoIndex].status = "Cancelado";
        if (aplicarTaxa) {
            historico[pedidoIndex].taxaCancelamento = 50.00;
        }
        
        salvarHistoricoCliente(cliente.email, historico); 
        renderizarHistorico(historico); 
    };
    

    // --- INICIALIZAÇÃO ---
    setupFormTabs(); 
    verificarLogin(); 

    // --- INICIALIZAÇÃO DA NAVEGAÇÃO ---
    if (cadastroForm) habilitarNavegacaoEnter(cadastroForm);
    if (loginForm) habilitarNavegacaoEnter(loginForm);
    if (editForm) habilitarNavegacaoEnter(editForm);
    if (formPagarDivida) habilitarNavegacaoEnter(formPagarDivida); 
    if (formPagarComCodigo) habilitarNavegacaoEnter(formPagarComCodigo); // NOVO

    // --- LISTENERS DO MODAL DE TAXA (MODIFICADO) ---
    if (fecharModalTaxaBtn) fecharModalTaxaBtn.addEventListener('click', fecharModalTaxa);
    if (modalTaxa) {
         modalTaxa.addEventListener('click', (event) => {
            if (event.target === modalTaxa) fecharModalTaxa();
        });
    }
    
    // --- NOVOS LISTENERS: MODAL PAGAR DÍVIDA (DEPOIS) ---
    if(formPagarDivida) formPagarDivida.addEventListener('submit', handlePagarDivida);
    if(fecharModalPagarDividaBtn) fecharModalPagarDividaBtn.addEventListener('click', fecharModalPagarDivida);
    if (modalPagarDivida) {
         modalPagarDivida.addEventListener('click', (event) => {
            if (event.target === modalPagarDivida) fecharModalPagarDivida();
        });
    }

    /**
     * ====================================================================
     * ===== CORREÇÃO DO BOTÃO PAGAR DÍVIDA (EVENT DELEGATION) =====
     * ====================================================================
     */
   /**
     * ====================================================================
     * ===== DEBUG DO BOTÃO PAGAR DÍVIDA (COM CONSOLE.LOG) =====
     * ====================================================================
     */
    if (infoCliente) {
        
        console.log('Tudo certo. O "pai" (infoCliente) foi encontrado e está ouvindo cliques.');

        infoCliente.addEventListener('click', (e) => {
            
            // Isso vai aparecer no console CADA VEZ que você clicar em QUALQUER COISA dentro do painel
            console.log('--- CLIQUE DETECTADO DENTRO DO PAINEL ---');
            console.log('Você clicou em:', e.target);
            console.log('Classes do que você clicou:', e.target.classList);
            
            // Verificação mais robusta usando .closest()
            const botaoAlvo = e.target.closest('.btn-pagar-divida');
            
            if (botaoAlvo) {
                // Se isso aparecer, o botão foi encontrado!
                console.log('Sucesso! O botão .btn-pagar-divida foi encontrado. Abrindo o modal...');
                abrirModalPagarDivida();
            } else {
                // Se isso aparecer, o clique foi em outra coisa.
                console.log('Aviso: O clique não foi no botão .btn-pagar-divida.');
            }
        });
    } else {
        // Se isso aparecer, o script não achou o <div id="info-cliente">
        console.error('ERRO CRÍTICO: O <div id="info-cliente"> não foi encontrado na página.');
    }
});