// --- SCRIPT ANTIGO DO PAINEL ---
const projetos = document.querySelectorAll('.imagem-painel');
let indiceAtual = 0;

function mostrarProjeto(indice) {
  projetos.forEach((projeto, i) => {
    projeto.classList.toggle('mostrar', i === indice);
  });
}

function proximoProjeto() {
  indiceAtual = (indiceAtual + 1) % projetos.length;
  mostrarProjeto(indiceAtual);
}

// Mudar projeto a cada 3 segundos (2500ms + 500ms da transição)
setInterval(proximoProjeto, 4000); 

// Inicia mostrando o primeiro projeto
mostrarProjeto(indiceAtual);


// --- NOVO SCRIPT DO MODAL DE HORÁRIOS ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Seletores do modal de horários
    const modalHorarios = document.getElementById('modal-horarios');
    const fecharModalHorariosBtn = document.getElementById('fechar-modal-horarios');
    const btnHorarios = document.getElementById('btn-horarios'); // Botão do relógio no header

    /**
     * Abre o modal de horários
     */
    const abrirModalHorarios = (event) => {
        event.preventDefault(); // Previne que o link '#' mude a URL
        if(modalHorarios) {
            modalHorarios.classList.remove('hidden');
        }
    };

    /**
     * Fecha o modal de horários
     */
    const fecharModalHorarios = () => {
        if(modalHorarios) {
            modalHorarios.classList.add('hidden');
        }
    };

    // Listeners do modal de horários
    if (btnHorarios) {
        btnHorarios.addEventListener('click', abrirModalHorarios);
    }
    if (fecharModalHorariosBtn) {
        fecharModalHorariosBtn.addEventListener('click', fecharModalHorarios);
    }
    if (modalHorarios) {
        modalHorarios.addEventListener('click', (event) => {
            // Fecha se clicar no overlay (o fundo)
            if (event.target === modalHorarios) {
                fecharModalHorarios();
            }
        });
    }
});

