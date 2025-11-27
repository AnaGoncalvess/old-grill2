document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO MODAL HORÁRIOS ---
    const modalHorarios = document.getElementById('modal-horarios');
    const fecharModalHorariosBtn = document.getElementById('fechar-modal-horarios');
    const btnHorarios = document.getElementById('btn-horarios'); // Botão do relógio no header

    /**
     * Abre o modal de horários
     */
    const abrirModalHorarios = (event) => {
        event.preventDefault(); // Previne que o link '#' mude a URL
        if (modalHorarios) {
            modalHorarios.classList.remove('hidden');
        }
    };

    /**
     * Fecha o modal de horários
     */
    const fecharModalHorarios = () => {
        if (modalHorarios) {
            modalHorarios.classList.add('hidden');
        }
    };

    // --- LISTENERS ADICIONADOS: MODAL HORÁRIOS ---
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