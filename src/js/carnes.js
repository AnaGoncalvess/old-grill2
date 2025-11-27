// No arquivo carnes.js

document.addEventListener("DOMContentLoaded", () => {
  const botoesAdicionar = document.querySelectorAll(".add-carrinho");
  const carrinhoLateral = document.getElementById("carrinho-lateral");
  const listaCarrinho = document.getElementById("lista-carrinho");
  const totalCarrinhoSpan = document.getElementById("total-carrinho");
  const totalItensSpan = document.getElementById("total-itens-carrinho");
  const fecharCarrinhoBtn = document.getElementById("fechar-carrinho");
  const concluirCompraBtn = document.getElementById("concluir-compra");
  const overlay = document.getElementById("overlay");

  // --- ELEMENTOS DO MODAL DE OPÇÕES (PARA BEBIDAS/ETC) ---
  const modalOpcoes = document.getElementById("modal-opcoes");
  const fecharModalOpcoesBtn = document.getElementById("fechar-modal-opcoes");
  const modalOpcoesTitulo = document.getElementById("modal-opcoes-titulo");
  const modalOpcoesLista = document.getElementById("modal-opcoes-lista");
  const formModalOpcoes = document.getElementById("form-modal-opcoes");

  // --- HELPERS DE GERENCIAMENTO DE USUÁRIO ---
  const getUsuarios = () => JSON.parse(localStorage.getItem("usuarios")) || [];
  const salvarUsuarios = (usuarios) =>
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

  const getClienteLogado = () => {
    const emailLogado = sessionStorage.getItem("sessaoClienteEmail");
    if (!emailLogado) return null;
    return getUsuarios().find((u) => u.email === emailLogado);
  };
  // --- FIM HELPERS ---

  let clienteLogado = getClienteLogado();
  let carrinhoItens = [];

  if (clienteLogado) {
    carrinhoItens = clienteLogado.carrinho || [];
  } else {
    localStorage.removeItem("carrinho");
  }

  const abrirCarrinho = () => {
    carrinhoLateral.classList.add("aberto");
    overlay.classList.add("visivel");
  };
  const fecharCarrinho = () => {
    carrinhoLateral.classList.remove("aberto");
    overlay.classList.remove("visivel");
  };

  const salvarCarrinho = () => {
    const emailLogado = sessionStorage.getItem("sessaoClienteEmail");
    if (!emailLogado) {
      return;
    }
    let usuarios = getUsuarios();
    let clienteIndex = usuarios.findIndex((u) => u.email === emailLogado);
    if (clienteIndex !== -1) {
      usuarios[clienteIndex].carrinho = carrinhoItens;
      salvarUsuarios(usuarios);
    }
    localStorage.removeItem("carrinho");
  };

  // --- MODIFICADO: Lista dos itens que pedem ponto (CONFORME SOLICITADO) ---
  const itensQuePedemPonto = [
    "BRISKET COM ACOMPANHAMENTOS",
    "CONTRA Filé",
    "WAGYU COM ACOMPANHAMENTOS",
    "FILE MIGNON COM FRITAS",
    "ALCATRA COM BATATA RUSTICA",
    "BIFE ANCHO E ACOMPANHAMENTOS",
  ];

  /**
   * ============================================================
   * ===== MODIFICADO: Adicionar ao Carrinho =====
   * ============================================================
   * Agora aceita um 'nomeBase' opcional para lidar com itens
   * que vêm do modal (como fritas ou carnes com ponto).
   */
  const adicionarAoCarrinho = (nome, preco, nomeBase) => {
    const itemExistente = carrinhoItens.find((item) => item.nome === nome);
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      // Usa nomeBase se for fornecido, senão usa o nome do item
      const itemNomeBase = nomeBase || nome;

      // Cria o novo item
      const novoItem = {
        nome,
        preco,
        quantidade: 1,
        nomeBase: itemNomeBase,
      };

      // Verifica se é um item que precisa de ponto
      if (itensQuePedemPonto.includes(itemNomeBase)) {
        novoItem.ponto = "pendente"; // Esta é a "marca"
      }

      carrinhoItens.push(novoItem);
    }
    salvarCarrinho();
    atualizarCarrinho(true); // Anima o item
    abrirCarrinho();
  };
  // ============================================================
  // ============================================================

  const mudarQuantidade = (nome, delta) => {
    const itemIndex = carrinhoItens.findIndex((item) => item.nome === nome);
    if (itemIndex === -1) return;

    carrinhoItens[itemIndex].quantidade += delta;
    if (carrinhoItens[itemIndex].quantidade <= 0) {
      carrinhoItens.splice(itemIndex, 1);
    }
    salvarCarrinho();
    atualizarCarrinho();
    if (carrinhoItens.length === 0) fecharCarrinho();
  };

  const removerItemInteiro = (nome) => {
    carrinhoItens = carrinhoItens.filter((item) => item.nome !== nome);
    salvarCarrinho();
    atualizarCarrinho();
    if (carrinhoItens.length === 0) fecharCarrinho();
  };

  /**
   * ============================================================
   * ===== MODIFICADO: atualizarCarrinho (Invertendo a ordem) =====
   * ============================================================
   * Usa um loop decrescente (i >= 0) para renderizar os itens
   * do final do array (mais recente) para o início (mais antigo).
   */
  const atualizarCarrinho = (animarUltimoItem = false) => {
    listaCarrinho.innerHTML = "";
    let total = 0;
    let totalItens = 0;

    // Inverte a ordem para mostrar o mais recente no topo
    for (let i = carrinhoItens.length - 1; i >= 0; i--) {
        const item = carrinhoItens[i];
        const li = document.createElement("li");

        // MODIFICADO: Mostra "Escolha o ponto" no carrinho se pendente
        let nomeExibido = item.nome;
        if (item.ponto === "pendente") {
            nomeExibido = `${item.nomeBase} (Ponto pendente)`;
        }

        li.innerHTML = `
                <div class="item-info">
                    <span class="nome">${nomeExibido}</span>
                    <span class="preco-unitario">R$ ${item.preco.toFixed(
                      2
                    )}</span>
                </div>
                <div class="quantidade-controls">
                    <button class="quantidade-btn diminuir" data-nome="${
                      item.nome
                    }">-</button>
                    <span class="item-quantidade">${item.quantidade}</span>
                    <button class="quantidade-btn aumentar" data-nome="${
                      item.nome
                    }">+</button>
                </div>
                <button class="remover-item" data-nome="${item.nome}">×</button>
            `;
        
        // Verifica se o item a ser animado é o último (o primeiro no loop reverso)
        if (animarUltimoItem && i === carrinhoItens.length - 1) {
            li.classList.add("item-adicionado");
            setTimeout(() => li.classList.remove("item-adicionado"), 800);
        }
        
        // Adiciona ao topo da lista (já que estamos iterando de trás para frente)
        listaCarrinho.appendChild(li);
        
        total += item.preco * item.quantidade;
        totalItens += item.quantidade;
    }
    // FIM DA ALTERAÇÃO

    totalCarrinhoSpan.textContent = `R$ ${total.toFixed(2)}`;
    totalItensSpan.textContent = totalItens;
    concluirCompraBtn.disabled = carrinhoItens.length === 0;
  };

  // Em carnes.js, substitua APENAS a função concluirCompra por esta:

  // Em src/js/carnes.js

  const concluirCompra = () => {
    if (carrinhoItens.length === 0) return;

    const cliente = getClienteLogado();
    if (!cliente) {
      alert("Você precisa fazer o cadastro para concluir a compra!");
      window.location.href = "cadastro.html";
      return;
    }
    salvarCarrinho();

    // --- MUDANÇA (Passa todos os parâmetros de volta) ---
    const urlParams = new URLSearchParams(window.location.search);
    const fromReserva = urlParams.get("from") === "reserva";

    if (fromReserva) {
      // Se veio da reserva, volta para a reserva
      const modificarId = urlParams.get("modificar"); // Verifica se está modificando
      let redirectUrl = "reserva.html";

      if (modificarId) {
        // Se estava modificando, anexa o ID de volta
        redirectUrl += "?modificar=" + modificarId;
      }
      window.location.href = redirectUrl;
    } else {
      // Comportamento padrão: vai para o checkout
      window.location.href = "checkout.html";
    }
    // --- FIM DA MUDANÇA ---
  };
  // --- LÓGICA DO MODAL (AGORA SÓ PARA BEBIDAS, ETC) ---

  /**
   * ============================================================
   * ===== MODIFICADO E CORRIGIDO: Abrir Modal Opções =====
   * ============================================================
   * Agora renderiza checkboxes (fritas) e lida com
   * grupos de rádios que têm objetos (nome/preco) ou strings.
   */
  const abrirModalOpcoes = (produtoNome, produtoPreco, config) => {
    modalOpcoesTitulo.textContent = config.titulo;
    modalOpcoesLista.innerHTML = "";
    formModalOpcoes.dataset.nome = produtoNome;
    formModalOpcoes.dataset.preco = produtoPreco;
    delete formModalOpcoes.dataset.grupos;
    delete formModalOpcoes.dataset.tipo; // Limpa o tipo

    if (config.grupos) {
      // Lógica para Rádios em Grupos (Ex: Refrigerante, Suco, Chopp)
      const groupNames = [];
      let htmlGrupos = "";
      config.grupos.forEach((grupo) => {
        groupNames.push(grupo.name);
        htmlGrupos += `<h3 class="modal-grupo-titulo">${grupo.titulo}</h3>`;

        grupo.opcoes.forEach((opcao, index) => {
          const isChecked = index === 0 ? "checked" : "";
          const idOpcao = `${grupo.name}-${index}`;

          let valor, preco, textoLabel;

          // Verifica se 'opcao' é um objeto (ex: {nome: "Copo", preco: 0})
          if (
            typeof opcao === "object" &&
            opcao !== null &&
            opcao.hasOwnProperty("nome")
          ) {
            valor = opcao.nome;
            preco = opcao.preco;
            // Formata o label para mostrar o preço adicional
            if (preco > 0) {
              textoLabel = `${opcao.nome} (+ R$ ${preco.toFixed(2)})`;
            } else {
              textoLabel = opcao.nome;
            }
          } else {
            // 'opcao' é uma string simples (ex: "Coca-Cola")
            valor = opcao;
            preco = 0;
            textoLabel = opcao;
          }

          // Adiciona o data-preco="${preco}" e o value="${valor}"
          htmlGrupos += `
            <div class="opcao-radio">
                <input type="radio" id="${idOpcao}" name="${grupo.name}" value="${valor}" data-preco="${preco}" ${isChecked}>
                <label for="${idOpcao}">${textoLabel}</label>
            </div>
          `;
        });
      });
      modalOpcoesLista.innerHTML = htmlGrupos;
      formModalOpcoes.dataset.grupos = JSON.stringify(groupNames);
    } else if (config.tipo === "checkbox" && config.opcoes) {
      // --- Lógica para Checkboxes (Ex: Fritas) ---
      formModalOpcoes.dataset.tipo = "checkbox";
      config.opcoes.forEach((opcao, index) => {
        const idOpcao = `opcao-check-${index}`;
        const opcaoHTML = `
            <div class="opcao-checkbox">
                <input type="checkbox" id="${idOpcao}" name="adicional" value="${
          opcao.nome
        }" data-preco="${opcao.preco}">
                <label for="${idOpcao}">${opcao.nome} (R$ ${opcao.preco.toFixed(
          2
        )})</label>
            </div>
          `;
        modalOpcoesLista.innerHTML += opcaoHTML;
      });
    } else if (config.opcoes) {
      // Lógica existente para Rádios Simples (Ex: Água)
      config.opcoes.forEach((opcao, index) => {
        const isChecked = index === 0 ? "checked" : "";
        const idOpcao = `opcao-${index}`;
        const opcaoHTML = `
            <div class="opcao-radio">
                <input type="radio" id="${idOpcao}" name="opcao-sabor" value="${opcao}" ${isChecked}>
                <label for="${idOpcao}">${opcao}</label>
            </div>
          `;
        modalOpcoesLista.innerHTML += opcaoHTML;
      });
    }
    modalOpcoes.classList.remove("hidden");
  };
  // ============================================================
  // ============================================================

  const fecharModalOpcoes = () => {
    modalOpcoes.classList.add("hidden");
    delete formModalOpcoes.dataset.grupos;
    delete formModalOpcoes.dataset.tipo; // Limpa o tipo
  };

  /**
   * ============================================================
   * ===== MODIFICADO: Confirmar Opção =====
   * ============================================================
   * Agora lê os checkboxes, calcula o preço e passa o nomeBase.
   */
  // Em src/js/carnes.js

  const handleConfirmarOpcao = (event) => {
    event.preventDefault();
    const formData = new FormData(formModalOpcoes);
    const nomeBase = formModalOpcoes.dataset.nome;
    const precoBase = parseFloat(formModalOpcoes.dataset.preco);
    let escolhas = [];
    let precoAdicionais = 0; // Esta variável já existe

    if (formModalOpcoes.dataset.tipo === "checkbox") {
      // Lógica existente para Checkboxes (Fritas)
      const checkboxes = formModalOpcoes.querySelectorAll(
        'input[name="adicional"]:checked'
      );
      checkboxes.forEach((check) => {
        escolhas.push(check.value);
        precoAdicionais += parseFloat(check.dataset.preco);
      });
    } else if (formModalOpcoes.dataset.grupos) {
      // --- LÓGICA MODIFICADA PARA RÁDIOS (GRUPOS) ---
      const grupos = JSON.parse(formModalOpcoes.dataset.grupos);
      for (const nomeGrupo of grupos) {
        // Encontra o input checado
        const inputChecado = formModalOpcoes.querySelector(
          `input[name="${nomeGrupo}"]:checked`
        );

        if (!inputChecado) {
          alert("Por favor, selecione uma opção em cada grupo.");
          return;
        }

        escolhas.push(inputChecado.value);

        // ===== ADIÇÃO DA LEITURA DE PREÇO DO RÁDIO =====
        // A função abrirModalOpcoes (corrigida) garante que o data-preco exista
        const precoOpcao = parseFloat(inputChecado.dataset.preco || 0);
        precoAdicionais += precoOpcao;
        // ===== FIM DA ADIÇÃO =====
      }
    } else {
      // Lógica existente para Rádios (Simples, como Água)
      const inputChecado = formModalOpcoes.querySelector(
        `input[name="opcao-sabor"]:checked`
      );
      if (!inputChecado) {
        alert("Por favor, selecione uma opção.");
        return;
      }
      escolhas.push(inputChecado.value);
      // Adiciona o preço do rádio simples (caso tenha)
      precoAdicionais += parseFloat(inputChecado.dataset.preco || 0);
    }

    // --- Lógica de Nomenclatura e Preço Final (Esta parte já está correta) ---
    let nomeFinal = nomeBase;
    const precoFinal = precoBase + precoAdicionais; // O preço base + adicionais
    
    // ============================================================
    // ===== ALTERAÇÃO PARA INCLUIR O PREÇ NO NOME FINAL =====
    // ============================================================
    // Encontra o nome da opção de TAMANHO para exibição
    let nomeTamanho = null;
    if (formModalOpcoes.dataset.grupos) {
        const grupos = JSON.parse(formModalOpcoes.dataset.grupos);
        // Exemplo: 'tamanho_suco', 'tamanho_ml', 'tamanho_chopp'
        const grupoTamanho = grupos.find(name => name.includes('tamanho'));
        if (grupoTamanho) {
             const inputChecado = formModalOpcoes.querySelector(
                `input[name="${grupoTamanho}"]:checked`
            );
            if (inputChecado) {
                nomeTamanho = inputChecado.value;
            }
        }
    }
    
    // O nome final agora é: Base (Escolha1, Escolha2) R$XX,XX
    if (nomeTamanho && precoAdicionais > 0) {
        // Ex: Suco (Abacaxi c/ Hortelã, Jarra (1 litro)) - R$ 35,00
        nomeFinal = `${nomeBase} (${escolhas.join(", ")}) - R$ ${precoFinal.toFixed(2)}`;
    } else if (escolhas.length > 0) {
        // Ex: Fritas (Cheddar, Bacon) ou Água (Com gás)
        nomeFinal = `${nomeBase} (${escolhas.join(", ")})`;
    } else if (formModalOpcoes.dataset.tipo === "checkbox") {
        // Se for checkbox e não marcou nada, é "Simples"
        nomeFinal = `${nomeBase} (Simples)`;
    }
    // ============================================================
    // ============================================================

    // Passa nomeFinal, precoFinal e nomeBase
    adicionarAoCarrinho(nomeFinal, precoFinal, nomeBase);
    fecharModalOpcoes();
  };
  // ============================================================
  // ============================================================

  // --- EVENT LISTENERS ---

  /**
   * ============================================================
   * ===== MAPA DE ITENS COM OPÇÕES (MODIFICADO) =====
   * ============================================================
   */
  const itensComOpcoes = {
    "PORÇAO DE FRITAS": {
      titulo: "Escolha seus adicionais:",
      tipo: "checkbox", // Indica que usará checkboxes
      opcoes: [
        // O preço aqui é SÓ o adicional
        { nome: "Cheddar", preco: 3.5 },
        { nome: "Bacon", preco: 3.5 },
        { nome: "Muçarela", preco: 3.5 },
      ],
    },
    ÁGUA: {
      titulo: "Escolha o tipo de água:",
      opcoes: ["Água com gás", "Água sem gás"],
    },
    // ===== SUCOS NATURAIS (Correto) =====
    "SUCOS NATURAIS": {
      titulo: "Escolha as opções do Suco:",
      grupos: [
        {
          titulo: "Sabor:",
          name: "sabor_suco",
          opcoes: [
            "Abacaxi",
            "Abacaxi c/ Hortelã",
            "Acerola",
            "Frutas Vermelhas",
            "Laranja",
            "Limonada Suíça",
            "Maracujá",
            "Melancia",
            "Morango",
          ],
        },
        {
          titulo: "Tamanho:",
          name: "tamanho_suco",
          // Preço base do card: R$ 13,00 (Copo)
          opcoes: [
            { nome: "Copo (Padrão)", preco: 0.0 }, // 13.00 + 0.00 = 13.00
            { nome: "Jarra (1 litro)", preco: 22.0 }, // 13.00 + 22.00 = 35.00
          ],
        },
      ],
    },
    // ===== REFRIGERANTE (Corrigido) =====
    REFRIGERANTE: {
      titulo: "Escolha as opções do Refrigerante:",
      grupos: [
        {
          titulo: "Sabor:",
          name: "sabor_refri",
          opcoes: [
            "Coca-Cola",
            "Fanta Laranja",
            "Fanta Uva",
            "Guaraná",
            "Pepsi",
            "Sprite",
          ],
        },
        {
          titulo: "Tipo:",
          name: "tipo_acucar",
          opcoes: ["Com Açúcar", "Sem Açúcar (Zero)"],
        },
        {
          titulo: "Tamanho:",
          name: "tamanho_ml",
          // Preço base do card: R$ 6.00 (200ml)
          opcoes: [
            { nome: "200ml (Padrão)", preco: 0.0 }, // 6.00 + 0.00 = 6.00
            { nome: "Lata (375ml)", preco: 2.0 }, // 6.00 + 2.00 = 8.00
            { nome: "600ml", preco: 5.0 }, // 6.00 + 5.00 = 11.00
            { nome: "1 Litro", preco: 7.0 }, // 6.00 + 7.00 = 13.00
            { nome: "2 Litros", preco: 10.0 }, // 6.00 + 10.00 = 16.00
          ],
        },
      ],
    },
    CAIPIRINHA: {
      titulo: "Monte sua Caipirinha:",
      grupos: [
        {
          titulo: "Sabor da Fruta:",
          name: "sabor_caipira",
          opcoes: ["Abacaxi", "Limão", "Maracujá", "Morango", "Kiwi"],
        },
        {
          titulo: "Base:",
          name: "base_caipira",
          opcoes: ["Cachaça", "Vodka", "Gin", "Run"],
        },
      ],
    },
    VINHO: {
      titulo: "Escolha seu Vinho (Garrafa):",
      grupos: [
        {
          titulo: "Marca:",
          name: "marca_vinho",
          opcoes: [
            "Casillero del Diabo",
            "Don Tannat 2020",
            "Quinta do Vale Meão",
            "Vinícola Casa Perini",
          ],
        },
        {
          titulo: "Tipo:",
          name: "tipo_vinho",
          opcoes: ["Tinto Suave", "Tinto Seco"],
        },
      ],
    },
    "ESPETO DE MEDALHÃO": {
      titulo: "Escolha o tipo de medalhão:",
      opcoes: ["Queijo (com bacon)", "Frango (com bacon)"],
    },
    "BIFE ANCHO E ACOMPANHAMENTOS": {
      titulo: "Escolha o acompanhamento:",
      opcoes: ["Fritas", "Mandioca Frita"],
    },
    // ===== CHOPP (Correto) =====
    "CHOPP": {
      titulo: "Escolha seu Chopp:",
      grupos: [
        {
          titulo: "Tipo:",
          name: "tipo_chopp",
          opcoes: ["Chopp de cerveja", "Chopp de vinho", "Chopp de ice"],
        },
        {
          titulo: "Tamanho:",
          name: "tamanho_chopp",
          // Preço base do card: R$ 15.00 (Copo)
          opcoes: [
            { nome: "Copo (Padrão)", preco: 0.0 }, // 15.00 + 0.00 = 15.00
            { nome: "Torre de 1 litro", preco: 25.0 }, // 15.00 + 25.00 = 40.00
            { nome: "Torre de 2,5 litros", preco: 75.0 }, // 15.00 + 75.00 = 90.00
            { nome: "Torre de 3,5 litros", preco: 105.0 }, // 15.00 + 105.00 = 120.00
          ],
        },
      ],
    },
    "WHISKY": {
      titulo: "Escolha a dose de Whisky (30ml):",
      opcoes: ["Black Label", "Jack Daniels", "White Horse"],
    },
    "CREPE": {
      titulo: "Escolha o sabor do Crepe:",
      opcoes: ["Ninho", "Ninho com Morango", "Ninho com Nutella", "Nutella com Morango", "Banana com Doce de Leite"]
    },
    "PETIT GATEAU": {
      titulo: "Escolha o sabor do Sorvete:",
      opcoes: ["Baunilha", "Morango", "Chocolate", "Ninho Trufado"]
    },
    "TORTA": {
      titulo: "Escolha o sabor da Torta:",
      opcoes: ["Limão", "Maracujá", "Floresta Negra", "Ouro Branco"]
    },
    "BROWNIE": {
      titulo: "Escolha seu acompanhamento:",
      opcoes: ["Simples (sem Acompanhamento)", "Com Sorvete de Baunilha", "Com Sorvete de Ninho Trufado"]
    },
  };
  // ============================================================
  // ============================================================

  // Listener principal dos botões de adicionar
  botoesAdicionar.forEach((botao) => {
    botao.addEventListener("click", (event) => {
      const produtoElemento = event.target.closest(".carne, .bebida, .sobremesa");
      const produtoNome = produtoElemento.dataset.nome;
      const produtoPreco = parseFloat(
        produtoElemento.dataset.preco.replace(",", ".")
      );

      // Verifica se o item tem opções (Sucos, Refri, ETC, e agora Fritas)
      if (produtoNome in itensComOpcoes) {
        const config = itensComOpcoes[produtoNome];
        // Abre o modal de opções
        abrirModalOpcoes(produtoNome, produtoPreco, config);
      } else {
        // Lógica para itens sem opções (Carnes, Molhos, etc.)
        // A função 'adicionarAoCarrinho' agora cuida da "marcação"
        // O `nomeBase` não é passado, então o fallback o definirá
        // como o próprio `produtoNome`, o que está correto.
        adicionarAoCarrinho(produtoNome, produtoPreco);
      }
    });
  });

  // --- Listeners do Carrinho e Modal (sem alteração) ---
  listaCarrinho.addEventListener("click", (event) => {
    const target = event.target;
    const nomeItem = target.dataset.nome;
    if (!nomeItem) return;

    if (target.classList.contains("aumentar")) mudarQuantidade(nomeItem, 1);
    if (target.classList.contains("diminuir")) mudarQuantidade(nomeItem, -1);
    if (target.classList.contains("remover-item")) removerItemInteiro(nomeItem);
  });

  concluirCompraBtn.addEventListener("click", concluirCompra);
  fecharCarrinhoBtn.addEventListener("click", fecharCarrinho);
  overlay.addEventListener("click", fecharCarrinho);

  if (formModalOpcoes) {
    formModalOpcoes.addEventListener("submit", handleConfirmarOpcao);
  }
  if (fecharModalOpcoesBtn) {
    fecharModalOpcoesBtn.addEventListener("click", fecharModalOpcoes);
  }
  if (modalOpcoes) {
    modalOpcoes.addEventListener("click", (event) => {
      if (event.target === modalOpcoes) {
        fecharModalOpcoes();
      }
    });
  }

  // --- INICIALIZAÇÃO ---
  if (
    new URLSearchParams(window.location.search).get("abrirCarrinho") === "true"
  ) {
    abrirCarrinho();
  }
  atualizarCarrinho();
});