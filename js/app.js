//=============================================================================
// Gestor Financeiro - app.js - v1.9.11 - Calculadora de Economia
// Adiciona funcionalidade para comparar preços de produtos.
// Inclui correções para listeners de botões "Ver Todos" e Notas.
//=============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Configurações Globais, Categorias e Mapeamento de Ícones ---
    const categories = { /* ... seu objeto categories ... */ expense: ['-- MORADIA --','Aluguel','Condomínio','Financiamento Imobiliário','IPTU','Água','Energia','Gás','Internet & Celular','Manutenção Residencial','Casa & Decoração','Eletrodomésticos','-- ALIMENTAÇÃO --','Mercado','Restaurantes & Lanches','-- TRANSPORTE --','Transporte Público','Combustível','Aplicativos de Transporte','Manutenção Veículo','Seguro Veicular','Estacionamento & Pedágio','-- DESPESAS PESSOAIS --','Vestuário & Calçados','Saúde','Plano de Saúde','Farmácia','Cuidados Pessoais','Educação','Academia & Clubes','-- LAZER & ENTRETENIMENTO --','Lazer','Viagens','Livros, Música & Jogos','-- SERVIÇOS & FINANCEIRO --','Faturas','Fatura do cartão','Assinaturas & Serviços','Empréstimos & Financiamentos','Tarifas Bancárias','Impostos','Seguros (outros)','-- OUTROS --','Presentes (oferecidos)','Pet','Doações','Outras Despesas'], income: ['Salário','13º Salário','Bônus & PLR','Serviços / Freelance','Vendas & Comissões','Investimentos','Aluguel Recebido','Benefícios Sociais / Auxílios','Aposentadoria','Pensão','Presentes Recebidos','Reembolsos','Outras Receitas'] };
    const scheduledPaymentVisibleCategories = [ /* ... seu array ... */ {value:'',text:'-- Selecione --'}, {value:'Faturas',text:'Faturas'}, {value:'Aluguel',text:'Aluguel / Financiamento Imob.'}, {value:'Fatura do cartão',text:'Fatura Cartão Crédito'} ];
    const scheduleToTransactionCategoryMap = { /* ... seu objeto ... */ 'Faturas':'Faturas', 'Aluguel':'Aluguel', 'Fatura do cartão':'Faturas', };
    const categoryIconMapping = { /* ... seu objeto ... */ 'Aluguel': 'fas fa-file-contract', 'Condomínio': 'fas fa-building', 'Financiamento Imobiliário': 'fas fa-landmark', 'IPTU': 'fas fa-home', 'Água': 'fas fa-tint', 'Energia': 'fas fa-bolt', 'Gás': 'fas fa-burn', 'Internet & Celular': 'fas fa-wifi', 'Manutenção Residencial': 'fas fa-tools', 'Casa & Decoração': 'fas fa-couch', 'Eletrodomésticos': 'fas fa-plug', 'Mercado': 'fas fa-shopping-basket', 'Restaurantes & Lanches': 'fas fa-utensils', 'Transporte Público': 'fas fa-bus-alt', 'Combustível': 'fas fa-gas-pump', 'Aplicativos de Transporte': 'fas fa-taxi', 'Manutenção Veículo': 'fas fa-wrench', 'Seguro Veicular': 'fas fa-car-crash', 'Estacionamento & Pedágio': 'fas fa-parking', 'Vestuário & Calçados': 'fas fa-tshirt', 'Saúde': 'fas fa-stethoscope', 'Plano de Saúde': 'fas fa-briefcase-medical', 'Farmácia': 'fas fa-pills', 'Cuidados Pessoais': 'fas fa-spa', 'Educação': 'fas fa-graduation-cap', 'Academia & Clubes': 'fas fa-dumbbell', 'Lazer': 'fas fa-film', 'Viagens': 'fas fa-plane-departure', 'Livros, Música & Jogos': 'fas fa-book-open', 'Faturas': 'fas fa-file-invoice', 'Fatura do cartão': 'fas fa-credit-card', 'Assinaturas & Serviços': 'fas fa-sync-alt', 'Empréstimos & Financiamentos': 'fas fa-file-invoice-dollar', 'Tarifas Bancárias': 'fas fa-piggy-bank', 'Impostos': 'fas fa-landmark', 'Seguros (outros)': 'fas fa-shield-alt', 'Presentes (oferecidos)': 'fas fa-gift', 'Pet': 'fas fa-paw', 'Doações': 'fas fa-hand-holding-heart', 'Outras Despesas': 'fas fa-question-circle', 'Salário': 'fas fa-money-bill-wave', '13º Salário': 'fas fa-gifts', 'Bônus & PLR': 'fas fa-star', 'Serviços / Freelance': 'fas fa-briefcase', 'Vendas & Comissões': 'fas fa-tags', 'Investimentos': 'fas fa-chart-line', 'Aluguel Recebido': 'fas fa-key', 'Benefícios Sociais / Auxílios': 'fas fa-hands-helping', 'Aposentadoria': 'fas fa-user-clock', 'Pensão': 'fas fa-hand-holding-usd', 'Presentes Recebidos': 'fas fa-hand-holding-heart', 'Reembolsos': 'fas fa-undo-alt', 'Outras Receitas': 'fas fa-plus-circle' };
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
    const NOTE_REMINDER_CHECK_INTERVAL = 60 * 1000;
    const PENDING_CHECKLIST = '&- ';
    const COMPLETED_CHECKLIST = '&+ ';

    // --- Funções Utilitárias ---
    function getLocalDateString(date = new Date()) { try { const d = date instanceof Date && !isNaN(date) ? date : new Date(); const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dy = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${dy}`; } catch (e) { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; } }
    function formatDisplayDate(dateString) { if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) return "Inválida"; const p = dateString.split('-'); if (p.length !== 3) return "Inválida"; const [y, m, d] = p; return isNaN(parseInt(y)) || isNaN(parseInt(m)) || isNaN(parseInt(d)) ? "Inválida" : `${d}/${m}/${y}`; }
    function formatDisplayDateTime(dateString, timeString) { const formattedDate = formatDisplayDate(dateString); if (formattedDate === "Inválida") return "Data Inválida"; if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) return formattedDate; return `${formattedDate} às ${timeString}`; }
    function parseDateInput(dateString) { if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) return new Date(NaN); const p = dateString.split('-'); if (p.length !== 3) return new Date(NaN); const [y, m, d] = p.map(Number); return isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31 ? new Date(NaN) : new Date(y, m - 1, d); }
    function parseDateTimeInput(dateString, timeString) { const datePart = parseDateInput(dateString); if (isNaN(datePart.getTime())) return new Date(NaN); if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) { datePart.setHours(0, 0, 0, 0); return datePart; } const timeParts = timeString.split(':'); if (timeParts.length < 2) { datePart.setHours(0, 0, 0, 0); return datePart; } const hours = parseInt(timeParts[0], 10); const minutes = parseInt(timeParts[1], 10); if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) { datePart.setHours(0, 0, 0, 0); return datePart; } datePart.setHours(hours, minutes, 0, 0); return datePart; }
    function getMonthName(monthIndex) { const m = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; const v = Math.max(0, Math.min(11, monthIndex)); return m[v]; }
    function formatCurrency(value) { if (valuesHidden) return 'R$ ***'; if (typeof value !== 'number' || isNaN(value)) { value = parseFloat(String(value).replace(',', '.')) || 0; } return value.toLocaleString('pt-BR', { style: 'currency', currency: currency || 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function formatPlaceholderCurrency() { return valuesHidden ? '***' : '0,00'; }
    function showAlert(message, type = 'info', duration = 5000) { /* ... (código showAlert existente) ... */ if (alertModal && alertMessage && confirmAlert) { alertMessage.innerHTML = message; alertModal.className = `modal-overlay modal-alert-${type} active`; confirmAlert.className = `btn btn-${type === 'danger' ? 'danger' : 'primary'}`; const titleEl = alertModal.querySelector('.modal-title'); if (titleEl) titleEl.textContent = type === 'danger' ? 'Erro' : (type === 'warning' ? 'Atenção' : (type === 'success' ? 'Sucesso' : 'Aviso')); alertModal.classList.add('active'); if (duration > 0) { setTimeout(() => { if (alertModal.classList.contains('active') && alertMessage.innerHTML === message) { closeModal(alertModal); } }, duration); } } else { window.alert(message.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?strong>/gi, '*').replace(/<\/?b>/gi, '*')); } }
    function showConfirmModal(message) { return new Promise((resolve) => { if (!confirmModal) { resolve(window.confirm(message.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, ''))); return; } const msgElement = confirmModal.querySelector('.modal-body p'); const okButton = document.getElementById('confirmDelete'); const cancelButton = document.getElementById('cancelDelete'); const closeButton = confirmModal.querySelector('.modal-close'); if (!msgElement || !okButton || !cancelButton || !closeButton) { resolve(window.confirm(message)); return; } msgElement.innerHTML = message; confirmModal.classList.add('active'); let handled = false; const cleanup = () => { okButton.removeEventListener('click', handleOk); cancelButton.removeEventListener('click', handleCancel); closeButton.removeEventListener('click', handleCancel); confirmModal.classList.remove('active'); }; const handleOk = () => { if(handled) return; handled = true; cleanup(); resolve(true); }; const handleCancel = () => { if(handled) return; handled = true; cleanup(); resolve(false); }; okButton.onclick = handleOk; cancelButton.onclick = handleCancel; closeButton.onclick = handleCancel; }); }
    function showSuccessFeedback(button, message) { if (!button) return; const originalHTML = button.innerHTML; const originalClass = button.className; const wasDisabled = button.disabled; button.innerHTML = `<i class="fas fa-check"></i> ${message}`; button.disabled = true; button.className = 'btn btn-success'; setTimeout(() => { button.innerHTML = originalHTML; button.className = originalClass; button.disabled = wasDisabled; }, 2000); }
    function isWithinGracePeriod(timestamp) { return timestamp && (Date.now() - timestamp < GRACE_PERIOD_MS); }
    function showScheduledPaymentWarningModal() { /* ... (código existente) ... */ return new Promise((resolve) => { if (hideScheduledPaymentWarning || !scheduledWarningModal) return resolve(); const confirmBtn = document.getElementById('confirmScheduledWarning'); const closeBtn = scheduledWarningModal.querySelector('.modal-close'); const dontShowCheck = document.getElementById('dontShowWarningAgain'); if (!confirmBtn || !closeBtn || !dontShowCheck) return resolve(); let handled = false; const cleanup = () => { confirmBtn.removeEventListener('click', handleConfirm); closeBtn.removeEventListener('click', handleCancel); scheduledWarningModal.removeEventListener('click', handleOverlayClick); scheduledWarningModal.classList.remove('active'); }; const handleConfirm = () => { if (handled) return; handled = true; if (dontShowCheck.checked) { localStorage.setItem('hideScheduledPaymentWarning', 'true'); hideScheduledPaymentWarning = true; } cleanup(); resolve(); }; const handleCancel = () => { if (handled) return; handled = true; cleanup(); resolve(); }; const handleOverlayClick = (event) => { if (event.target === scheduledWarningModal) { /* handleCancel(); // Ou não fechar */ } }; confirmBtn.onclick = handleConfirm; closeBtn.onclick = handleCancel; scheduledWarningModal.addEventListener('click', handleOverlayClick); scheduledWarningModal.classList.add('active'); }); }
    function truncateText(text, maxLength = 30) { if (!text) return ''; return text.length > maxLength ? text.substring(0, maxLength) + '...' : text; }
    function escapeHtml(unsafe) { if (!unsafe) return ''; return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }

    // --- Seletores DOM ---
    const safeGetElementById = (id) => document.getElementById(id);
    const safeQuerySelector = (selector) => document.querySelector(selector);
    // ... (seletores financeiros existentes) ...
    const body=document.body; const sidebar=safeQuerySelector('.sidebar'); const menuToggle=safeQuerySelector('.menu-toggle'); const closeSidebar=safeQuerySelector('.close-sidebar'); const themeToggle=safeQuerySelector('.theme-toggle'); const themeToggleIcon=themeToggle?themeToggle.querySelector('i.fa-toggle-off, i.fa-toggle-on'):null; const valueToggle=safeGetElementById('valueToggle'); const valueToggleIcon=valueToggle?valueToggle.querySelector('i'):null; const addTransactionFab=safeGetElementById('addTransactionBtn'); const pageTitleElement=safeQuerySelector('.page-title'); const menuItems=document.querySelectorAll('.sidebar-menu .menu-item'); const contentSections=document.querySelectorAll('.main-content .content-section'); const remainingBalancePix=safeGetElementById('remainingBalancePix'); const remainingBalanceCash=safeGetElementById('remainingBalanceCash'); const remainingBalanceCard=safeGetElementById('remainingBalanceCard'); const transactionModal=safeGetElementById('transactionModal'); const transactionModalForm=safeGetElementById('transactionModalForm'); const modalDateInput=safeGetElementById('modalDate'); const modalItemInput=safeGetElementById('modalItem'); const modalAmountInput=safeGetElementById('modalAmount'); const modalTypeInput=safeGetElementById('modalType'); const modalCategoryInput=safeGetElementById('modalCategory'); const modalPaymentMethodInput=safeGetElementById('modalPaymentMethod'); const modalDescriptionInput=safeGetElementById('modalDescription'); const modalOriginatingBillIdInput=safeGetElementById('modalOriginatingBillIdInput'); const saveTransactionBtn=safeGetElementById('saveTransaction'); const cancelTransactionBtn=safeGetElementById('cancelTransaction'); const editModal=safeGetElementById('editModal'); const editForm=safeGetElementById('editForm'); const editDateInput=safeGetElementById('editDate'); const editItemInput=safeGetElementById('editItem'); const editAmountInput=safeGetElementById('editAmount'); const editTypeInput=safeGetElementById('editType'); const editCategoryInput=safeGetElementById('editCategory'); const editPaymentMethodInput=safeGetElementById('editPaymentMethod'); const editDescriptionInput=safeGetElementById('editDescription'); const saveEditBtn=safeGetElementById('saveEdit'); const cancelEditBtn=safeGetElementById('cancelEdit'); const scheduledPaymentModal=safeGetElementById('scheduledPaymentModal'); const scheduledPaymentForm=safeGetElementById('scheduledPaymentForm'); const scheduledItemInput=safeGetElementById('scheduledItem'); const scheduledAmountInput=safeGetElementById('scheduledAmount'); const scheduledDateInput=safeGetElementById('scheduledDate'); const scheduledCategoryInput=safeGetElementById('scheduledCategory'); const scheduledPaymentMethodInput=safeGetElementById('scheduledPaymentMethod'); const scheduledAutoDebitInput=safeGetElementById('scheduledAutoDebit'); const saveScheduledPaymentBtn=safeGetElementById('saveScheduledPayment'); const cancelScheduledPaymentBtn=safeGetElementById('cancelScheduledPayment'); const goalModal=safeGetElementById('goalModal'); const goalForm=safeGetElementById('goalForm'); const goalNameInput=safeGetElementById('goalName'); const goalTargetInput=safeGetElementById('goalTarget'); const monthlyContributionInput=safeGetElementById('monthlyContribution'); const goalDateInput=safeGetElementById('goalDate'); const goalTypeInput=safeGetElementById('goalType'); const goalImageInput=safeGetElementById('goalImage'); const goalImagePreview=safeGetElementById('goalImagePreview'); const removeGoalImageBtn=goalModal?goalModal.querySelector('.remove-image-btn'):null; const saveGoalBtn=safeGetElementById('saveGoal'); const cancelGoalBtn=safeGetElementById('cancelGoal'); const addGoalBtns=document.querySelectorAll('#addGoalBtnDashboard, #addGoalBtnList, #addGoalFromEmptyState'); const addScheduledPaymentBtn=safeGetElementById('addScheduledPaymentBtn'); const addScheduledFromListBtn=safeGetElementById('addScheduledFromListBtn'); const settingsSection=safeGetElementById('settings-section'); const initialBalancePixInput=safeGetElementById('initialBalancePix'); const initialBalanceCashInput=safeGetElementById('initialBalanceCash'); const initialBalanceCardInput=safeGetElementById('initialBalanceCard'); const pixBalanceDisplay=safeGetElementById('pixBalanceDisplay'); const cashBalanceDisplay=safeGetElementById('cashBalanceDisplay'); const cardBalanceDisplay=safeGetElementById('cardBalanceDisplay'); const saveInitialBalancesBtn=safeGetElementById('saveInitialBalances'); const saveUserSettingsBtn=safeGetElementById('saveUserSettings'); const userNameInput=safeGetElementById('userName'); const userEmailInput=safeGetElementById('userEmail'); const currencyInput=safeGetElementById('currency'); const exportDataBtn=safeGetElementById('exportDataBtn'); const importDataBtn=safeGetElementById('importDataBtn'); const importDataInput=safeGetElementById('importDataInput'); const alertModal=safeGetElementById('alertModal'); const alertMessage=safeGetElementById('alertMessage'); const confirmAlert=safeGetElementById('confirmAlert'); const confirmModal=safeGetElementById('confirmModal'); const scheduledWarningModal=safeGetElementById('scheduledWarningModal'); const transactionDetailModal=safeGetElementById('transactionDetailModal'); const transactionHistoryContainer=safeGetElementById('transactionHistory'); const allTransactionsContainer=safeGetElementById('allTransactions'); const upcomingBillsContainer=safeGetElementById('upcomingBills'); const allScheduledPaymentsListContainer=safeGetElementById('allScheduledPaymentsList'); const goalsListContainer=safeGetElementById('goalsList'); const dashboardEmptyState=safeGetElementById('emptyState'); const transactionsEmptyState=safeGetElementById('emptyState2'); const goalsSummaryContainer=safeQuerySelector('.goals-summary');
    // --- Seletores para Notas ---
    const notesSection = safeGetElementById('notes-section');
    const notesListContainer = safeGetElementById('notesListContainer');
    const notesEmptyState = safeGetElementById('notesEmptyState');
    const addNoteBtn = safeGetElementById('addNoteBtn');
    const quickViewNotesBtn = safeGetElementById('quickViewNotesBtn');
    const noteModal = safeGetElementById('noteModal');
    const noteForm = safeGetElementById('noteForm');
    const noteIdInput = safeGetElementById('noteId');
    const noteTypeSelect = safeGetElementById('noteTypeSelect');
    const noteTitleInput = safeGetElementById('noteTitle');
    const noteContentInput = safeGetElementById('noteContent');
    const noteReminderDateInput = safeGetElementById('noteReminderDate');
    const noteReminderTimeInput = safeGetElementById('noteReminderTime');
    const noteColorOptionsContainer = safeGetElementById('noteColorOptions');
    const saveNoteBtn = safeGetElementById('saveNoteBtn');
    const noteModalTitle = safeGetElementById('noteModalTitle');
    const viewAllNotesBtn = safeGetElementById('viewAllNotesBtn'); // Botão da seção de Notas
    const viewAllNotesModal = safeGetElementById('viewAllNotesModal');
    const viewAllNotesList = safeGetElementById('viewAllNotesList');
    const quickNotesModal = safeGetElementById('quickNotesModal');
    const quickNotesList = safeGetElementById('quickNotesList');
    const noteReaderModal = safeGetElementById('noteReaderModal');
    const noteReaderTitle = safeGetElementById('noteReaderTitle');
    const noteReaderContent = safeGetElementById('noteReaderContent');
    const closeNoteReaderBtn = safeGetElementById('closeNoteReaderBtn');
    const createNoteFromEmptyStateBtn = safeGetElementById('createNoteFromEmptyStateBtn'); // Botão "Criar" no empty state
    // --- Seletores Botões Dashboard "Ver Todos" ---
    const viewAllGoalsBtn = safeGetElementById('viewAllGoalsBtn');
    const viewAllScheduledBtn = safeGetElementById('viewAllScheduledBtn');
    const viewAllTransactionsBtn = safeGetElementById('viewAllTransactionsBtn');
    // === Seletores Calculadora de Economia ===
    const economyCalculatorModal = safeGetElementById('economyCalculatorModal');
    const economyCalculatorForm = safeGetElementById('economyCalculatorForm');
    const comparePrice1 = safeGetElementById('comparePrice1');
    const compareQuantity1 = safeGetElementById('compareQuantity1');
    const compareUnit1 = safeGetElementById('compareUnit1');
    const product1Result = safeGetElementById('product1Result');
    const comparePrice2 = safeGetElementById('comparePrice2');
    const compareQuantity2 = safeGetElementById('compareQuantity2');
    const compareUnit2 = safeGetElementById('compareUnit2');
    const product2Result = safeGetElementById('product2Result');
    const comparisonSummary = safeGetElementById('comparisonSummary');
    const calculateComparisonBtn = safeGetElementById('calculateComparisonBtn');
    const clearComparisonBtn = safeGetElementById('clearComparisonBtn');
    const openEconomyCalculatorBtn = safeGetElementById('openEconomyCalculatorBtn'); // Botão trigger na sidebar
    // === Fim Seletores Calculadora ===
    // --- Fim Seletores Notas/Dashboard/Calculadora ---
    const getCanvasAndContext=(id)=>{const c=safeGetElementById(id); const ctx=c?.getContext('2d'); return ctx?{canvas:c,ctx}:{canvas:c,ctx:null};}; const {ctx:expChartCtx}=getCanvasAndContext('expensesChart'); const {ctx:incExpChartCtx}=getCanvasAndContext('incomeVsExpensesChart'); const {ctx:payMethChartCtx}=getCanvasAndContext('paymentMethodsChart'); const {ctx:expChartCtx2}=getCanvasAndContext('expensesChart2'); const {ctx:incExpChartCtx2}=getCanvasAndContext('incomeVsExpensesChart2'); const {ctx:payMethChartCtx2}=getCanvasAndContext('paymentMethodsChart2'); const {ctx:monHistChartCtx}=getCanvasAndContext('monthlyHistoryChart'); let expensesChart, incomeVsExpensesChart, paymentMethodsChart; let expensesChart2, incomeVsExpensesChart2, paymentMethodsChart2, monthlyHistoryChart;

    // --- Aplicação State ---
    let transactions = []; let goals = []; let upcomingBills = []; let initialBalances = { pix: 0, cash: 0, card: 0 };
    let notes = [];
    let userName = 'Usuário'; let userEmail = 'email@exemplo.com'; let currency = 'BRL';
    let selectedThemeColor = 'masculine-1'; let currentTheme = 'light';
    let currentEditIndex = null;
    let currentEditingNoteId = null;
    let valuesHidden = false; let hideScheduledPaymentWarning = false;
    let reminderCheckIntervalId = null;

    // --- Funções Principais (Load/Save) ---
    function loadDataFromStorage() {
        try{
            transactions=JSON.parse(localStorage.getItem('transactions'))||[];
            goals=JSON.parse(localStorage.getItem('goals'))||[];
            upcomingBills=JSON.parse(localStorage.getItem('upcomingBills'))||[];
            initialBalances=JSON.parse(localStorage.getItem('initialBalances'))||{pix:0,cash:0,card:0};
            notes = JSON.parse(localStorage.getItem('notes')) || [];

            // ... (limpeza de dados financeiros existente) ...
            transactions.forEach(t=>{t.amount=parseFloat(String(t.amount).replace(',','.'))||0;t.description=t.description||'';}); goals.forEach(g=>{g.target=parseFloat(String(g.target).replace(',','.'))||0; g.current=parseFloat(String(g.current).replace(',','.'))||0; g.monthlyContribution=parseFloat(String(g.monthlyContribution).replace(',','.'))||0; if(g.goalType&&!g.type){g.type=g.goalType;delete g.goalType;} g.contributions=Array.isArray(g.contributions)?g.contributions.map(c=>({...c,amount:parseFloat(String(c.amount).replace(',','.'))||0})):[];}); upcomingBills.forEach(b=>{b.amount=parseFloat(String(b.amount).replace(',','.'))||0; const validScheduledCats=scheduledPaymentVisibleCategories.map(cat=>cat.value).filter(Boolean); if(!b.category||!validScheduledCats.includes(b.category)){if(b.category?.toLowerCase().includes('aluguel')||b.category?.toLowerCase().includes('financiamento imob'))b.category='Aluguel'; else if(b.category?.toLowerCase().includes('fatura')&&b.category?.toLowerCase().includes('cart'))b.category='Fatura do cartão'; else b.category='Faturas';} if(b.category==='Fatura do cartão'&&b.paymentMethod==='card')b.paymentMethod='pix'; if(b.processedTimestamp)b.processedTimestamp=parseInt(b.processedTimestamp,10)||null; b.processedDate=b.processedDate||null;});

            // Limpeza/Validação de Notas
            notes.forEach(n => {
                n.id = n.id || Date.now() + Math.random();
                n.type = n.type === 'task' ? 'task' : 'note';
                n.createdAt = n.createdAt || new Date().toISOString();
                n.updatedAt = n.updatedAt || n.createdAt;
                n.color = n.color || 'default';
                n.reminderDate = n.reminderDate || null;
                n.reminderTime = n.reminderTime || null;
                n.reminderTriggered = n.reminderTriggered === true;
                // Remover sintaxe antiga [ ]/[x] se existir
                if (n.content && (n.content.includes('[ ]') || n.content.includes('[x]'))) {
                    n.content = n.content.replace(/^(\s*)\[ \]\s*/gm, '$1').replace(/^(\s*)\[x\]\s*/gm, '$1');
                }
                // Recalcular tarefas com nova sintaxe
                const taskCounts = parseNoteContentForTasks(n.content || '', n.type);
                n.isTask = taskCounts.total > 0 && n.type === 'task';
                n.completedTasks = taskCounts.completed;
                n.totalTasks = taskCounts.total;
            });

        } catch(e){
            console.error("Load Err:",e);showAlert("Erro ao carregar dados.",'danger');
            transactions=[];goals=[];upcomingBills=[];notes=[];initialBalances={pix:0,cash:0,card:0};
        }
        // ... (carregar outras configs) ...
        userName=localStorage.getItem('userName')||'Usuário'; userEmail=localStorage.getItem('userEmail')||'email@exemplo.com'; currency=localStorage.getItem('currency')||'BRL'; selectedThemeColor=localStorage.getItem('themeColor')||'masculine-1'; currentTheme=localStorage.getItem('theme')||'light'; valuesHidden=localStorage.getItem('valuesHidden')==='true'; hideScheduledPaymentWarning=localStorage.getItem('hideScheduledPaymentWarning')==='true';
    }

    function saveDataToStorage() {
        try{
            localStorage.setItem('transactions',JSON.stringify(transactions));
            localStorage.setItem('goals',JSON.stringify(goals));
            localStorage.setItem('upcomingBills',JSON.stringify(upcomingBills));
            localStorage.setItem('initialBalances',JSON.stringify(initialBalances));
            localStorage.setItem('notes', JSON.stringify(notes));
            // ... (salvar outras configs) ...
             localStorage.setItem('userName',userName); localStorage.setItem('userEmail',userEmail); localStorage.setItem('currency',currency); localStorage.setItem('themeColor',selectedThemeColor); localStorage.setItem('theme',currentTheme); localStorage.setItem('valuesHidden',String(valuesHidden)); localStorage.setItem('hideScheduledPaymentWarning',String(hideScheduledPaymentWarning));
        } catch(e){
            console.error("Save Err:",e);showAlert("Erro ao salvar dados.",'danger');
        }
    }

    // --- Funções de Atualização da UI ---
    function updateBalanceDisplay(){ /* ... (código existente) ... */ if(!remainingBalancePix||!remainingBalanceCash||!remainingBalanceCard)return; const{currentPix:p,currentCash:c,currentCard:d}=calculateCurrentBalances(); remainingBalancePix.innerHTML=`<span class="monetary-value">${formatCurrency(p)}</span>`; remainingBalanceCash.innerHTML=`<span class="monetary-value">${formatCurrency(c)}</span>`; remainingBalanceCard.innerHTML=`<span class="monetary-value">${formatCurrency(d)}</span>`; const rpCard=remainingBalancePix.closest('.card'); const rcCard=remainingBalanceCash.closest('.card'); const rdCard=remainingBalanceCard.closest('.card'); if(rpCard){rpCard.classList.toggle('card-negative',p<0);rpCard.classList.toggle('card-positive',p>=0);} if(rcCard){rcCard.classList.toggle('card-negative',c<0);rcCard.classList.toggle('card-positive',c>=0);} if(rdCard){rdCard.classList.toggle('card-negative',d<0);rdCard.classList.toggle('card-positive',d>=0);}}
    function updateBalanceDisplays(){ /* ... (código existente) ... */ if(pixBalanceDisplay)pixBalanceDisplay.innerHTML=`<span class="monetary-value">${formatCurrency(initialBalances.pix)}</span>`; if(cashBalanceDisplay)cashBalanceDisplay.innerHTML=`<span class="monetary-value">${formatCurrency(initialBalances.cash)}</span>`; if(cardBalanceDisplay)cardBalanceDisplay.innerHTML=`<span class="monetary-value">${formatCurrency(initialBalances.card)}</span>`;}
    function renderTransactionHistory(){ /* ... (código existente) ... */ if(!transactionHistoryContainer)return; transactionHistoryContainer.innerHTML=''; const recent=[...transactions].sort((a,b)=>parseDateInput(b.date)-parseDateInput(a.date)||Number(b.id)-Number(a.id)).slice(0,5); if(recent.length===0){return;} recent.forEach(t=>{const i=transactions.findIndex(x=>x.id===t.id); if(i!==-1)transactionHistoryContainer.appendChild(createTransactionElement(t,i,false));});}
    function renderAllTransactions(transToRender=transactions) { /* ... (código existente) ... */ if(!allTransactionsContainer)return; allTransactionsContainer.innerHTML=''; const sorted=[...transToRender].sort((a,b)=>parseDateInput(b.date)-parseDateInput(a.date)||Number(b.id)-Number(a.id)); if(sorted.length===0){if(transactionsEmptyState)transactionsEmptyState.style.display='flex';return;} if(transactionsEmptyState)transactionsEmptyState.style.display='none'; sorted.forEach(t=>{const i=transactions.findIndex(x=>x.id===t.id); if(i!==-1)allTransactionsContainer.appendChild(createTransactionElement(t,i,true));}); }
    function renderUpcomingBills(){ /* ... (código existente) ... */ if(!upcomingBillsContainer)return; upcomingBillsContainer.innerHTML=''; const upcoming=upcomingBills.filter(b=>!b.paid).sort((a,b)=>parseDateInput(a.date)-parseDateInput(b.date)||a.id-b.id).slice(0,5); if(upcoming.length===0){upcomingBillsContainer.innerHTML=`<div class="empty-state info" style="padding:1rem;"><i class="fas fa-calendar-check"></i><p>Nenhum pag. próximo</p></div>`; return;} upcoming.forEach(b=>{const i=upcomingBills.findIndex(x=>x.id===b.id); if(i!==-1)upcomingBillsContainer.appendChild(createBillElement(b,i,false));});}
    function renderAllScheduledPayments(){ /* ... (código existente) ... */ if(!allScheduledPaymentsListContainer)return; allScheduledPaymentsListContainer.innerHTML=''; const sorted=[...upcomingBills].sort((a,b)=>parseDateInput(b.date)-parseDateInput(a.date)||b.id-a.id); if(sorted.length===0){allScheduledPaymentsListContainer.innerHTML=`<div class="empty-state info" style="padding:2rem;"><i class="fas fa-calendar-plus"></i><p>Nenhum agendamento.</p></div>`; return;} sorted.forEach(b=>{const i=upcomingBills.findIndex(x=>x.id===b.id); if(i!==-1)allScheduledPaymentsListContainer.appendChild(createBillElement(b,i,true));});}
    function renderGoals(){ /* ... (código existente) ... */ if(!goalsListContainer)return; goalsListContainer.innerHTML=''; if(goals.length===0){goalsListContainer.innerHTML=`<div class="empty-state info" style="padding:2rem;"><i class="fas fa-flag-checkered"></i><h3>Nenhuma meta</h3><button class="btn btn-primary" id="addGoalFromEmptyState"><i class="fas fa-plus"></i> Criar Meta</button></div>`; const addBtn=goalsListContainer.querySelector('#addGoalFromEmptyState'); if(addBtn)addBtn.onclick=openAddGoalModal; return;} const actG=goals.filter(g=>!g.completed).sort((a,b)=>parseDateInput(a.date)-parseDateInput(b.date)); const compG=goals.filter(g=>g.completed).sort((a,b)=>parseDateInput(a.completedAt||'9999-12-31')-parseDateInput(a.completedAt||'9999-12-31')); actG.forEach(g=>{const i=goals.findIndex(x=>x.id===g.id); if(i!==-1)goalsListContainer.appendChild(createGoalElement(g,i));}); if(compG.length>0){ const cS=document.createElement('div'); cS.className='completed-goals-section'; cS.innerHTML=`<h3 class="completed-goals-title">Metas Concluídas <i class="fas fa-check-double"></i></h3>`; compG.forEach(g=>{const i=goals.findIndex(x=>x.id===g.id); if(i!==-1)cS.appendChild(createGoalElement(g,i));}); goalsListContainer.appendChild(cS);} updateGoalsSummary();}
    function updateGoalsSummary(){ /* ... (código existente) ... */ if(!goalsSummaryContainer)return; const aG=goals.filter(g=>!g.completed);const cGC=goals.length-aG.length;let tA=aG.length;let tSA=aG.reduce((s,g)=>s+g.current,0);let tTA=aG.reduce((s,g)=>s+g.target,0);let tNA=Math.max(0,tTA-tSA); goalsSummaryContainer.innerHTML=`<div class="goals-summary-grid"> <div class="summary-card"><div class="summary-icon"><i class="fas fa-tasks"></i></div><div class="summary-text"><h4>Ativas</h4><div class="summary-value">${tA}</div></div></div><div class="summary-card"><div class="summary-icon"><i class="fas fa-piggy-bank"></i></div><div class="summary-text"><h4>Economizado</h4><div class="summary-value"><span class="monetary-value">${formatCurrency(tSA)}</span></div></div></div><div class="summary-card"><div class="summary-icon"><i class="fas fa-coins"></i></div><div class="summary-text"><h4>Falta</h4><div class="summary-value"><span class="monetary-value">${formatCurrency(tNA)}</span></div></div></div><div class="summary-card"><div class="summary-icon"><i class="fas fa-check-double"></i></div><div class="summary-text"><h4>Concluídas</h4><div class="summary-value">${cGC}</div></div></div></div> ${aG.length > 0 ? `<div class="goals-priority"> <h4>Próximas Metas</h4> ${aG.sort((a, b) => parseDateInput(a.date) - parseDateInput(b.date)).slice(0, 3).map(g => `<div class="priority-item"><div class="priority-name">${escapeHtml(g.name)}</div> <div class="priority-date">${formatDisplayDate(g.date)}</div> <div class="priority-progress"> <div class="progress-bar" style="width: ${Math.min((g.target > 0 ? g.current / g.target : 0) * 100, 100)}%"></div> </div> </div>`).join('')} </div>` : ''}`; }
    function updateCategoryDropdowns(selectElement, mode){ /* ... (código existente) ... */ if(!selectElement)return; selectElement.innerHTML=''; let categoryList=[]; let includeTitles=false; let blankOptionText='-- Selecione --'; if(mode==='expense'||mode==='income'){categoryList=mode==='expense'?categories.expense:categories.income;includeTitles=mode==='expense'; selectElement.innerHTML=`<option value="" disabled selected>${blankOptionText}</option>`; categoryList.forEach(cat=>{ if(cat.startsWith('-- ')&&includeTitles)selectElement.innerHTML+=`<option disabled class="category-title-option">${cat}</option>`; else if(!cat.startsWith('-- '))selectElement.innerHTML+=`<option value="${cat}">${cat}</option>`;});} else if(mode==='filter'){categoryList=[...new Set([...categories.expense,...categories.income])].filter(cat=>!cat.startsWith('-- ')).sort((a,b)=>a.localeCompare(b)); selectElement.innerHTML=`<option value="all">Todas Categorias</option>`+categoryList.map(cat=>`<option value="${cat}">${cat}</option>`).join('');} else if(mode==='scheduled'){scheduledPaymentVisibleCategories.forEach(cat=>{const option=document.createElement('option'); option.value=cat.value; option.textContent=cat.text; if(cat.value===''){option.disabled=true; option.selected=true;} selectElement.appendChild(option);});} else {console.warn(`Update Cat Dropdown: Modo inválido "${mode}"`); selectElement.innerHTML=`<option value="" disabled selected>-- Modo Inválido --</option>`;}}

    // --- Renderização de Notas (Principal) ---
    function renderNotes(container = notesListContainer, emptyStateElement = notesEmptyState) {
        if (!container || !emptyStateElement) return;
        container.innerHTML = '';
        const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // Preenche o modal 'Ver Todas Notas' se ele existir
        if(viewAllNotesList) {
            viewAllNotesList.innerHTML = ''; // Limpa antes de preencher
            if (sortedNotes.length === 0) {
                viewAllNotesList.innerHTML = '<p class="text-center text-muted p-4">Nenhuma nota ou tarefa encontrada.</p>';
            } else {
                 // Usando um fragmento para melhor performance ao adicionar múltiplos elementos
                 const fragment = document.createDocumentFragment();
                 sortedNotes.forEach(note => {
                     fragment.appendChild(createNoteElement(note)); // Reutiliza a função que cria o card
                 });
                 viewAllNotesList.appendChild(fragment);
            }
        }

        // Preenche o container principal (notesListContainer)
        if (sortedNotes.length === 0) {
            emptyStateElement.style.display = 'flex';
            container.style.display = 'none';
        } else {
            emptyStateElement.style.display = 'none';
            container.style.display = 'grid';
            const fragment = document.createDocumentFragment();
            sortedNotes.forEach(note => {
                fragment.appendChild(createNoteElement(note));
            });
            container.appendChild(fragment);
        }
    }

    // --- Criação de Elementos HTML Dinâmicos ---
    function createTransactionElement(transaction, index, showActions) { /* ... (código existente) ... */ const div=document.createElement('div'); div.className=`transaction-item ${transaction.isScheduled?'is-scheduled-transaction':''}`; div.dataset.index=index; div.dataset.id=transaction.id; const isInc=transaction.type==='income'; let catIcon=categoryIconMapping[transaction.category]||'fas fa-question-circle'; if(transaction.category==='Faturas'&&transaction.isScheduled){const origBill=upcomingBills.find(b=>String(b.id)===String(transaction.originatingBillId)); if(origBill?.category==='Fatura do cartão'){catIcon='fas fa-credit-card';}}else if(transaction.category==='Fatura do cartão'&&!isInc){catIcon='fas fa-credit-card';} const iconBg=isInc?'bg-success':'bg-danger'; const amtCls=isInc?'amount-positive':'amount-negative'; const amtPfx=isInc?'+ ':'- '; let pmIcon='',pmText=''; switch(transaction.paymentMethod){case'pix':pmIcon='<i class="fas fa-qrcode fa-fw"></i>';pmText='Pix';break;case'cash':pmIcon='<i class="fas fa-money-bill-wave fa-fw"></i>';pmText='Dinheiro';break;case'card':pmIcon='<i class="fas fa-credit-card fa-fw"></i>';pmText='Conta/C.';break;default:pmIcon='<i class="fas fa-question-circle fa-fw"></i>';pmText=transaction.paymentMethod||'N/D';} const schedInd=transaction.isScheduled?`<span class="scheduled-origin-indicator" title="Origem Agendamento ${transaction.originatingBillId||'N/A'}"><i class="fas fa-history"></i></span>`:''; const descIndicator=showActions&&transaction.description?`<span class="transaction-description-icon" title="${escapeHtml(transaction.description)}"><i class="far fa-comment-dots"></i></span>`:''; let actions=''; if(transaction.isScheduled){const origBill=upcomingBills.find(b=>b&&String(b.id)===String(transaction.originatingBillId));const canDel=origBill&&isWithinGracePeriod(origBill.processedTimestamp);let delTitleBase="Excluir Tx Agend."; let delAct="(Histórico - não rev.)"; if(canDel){delTitleBase=`Cancelar Pgto.: ${origBill?.name||'Agend.'}`; const rT=new Date((origBill.processedTimestamp||Date.now())+GRACE_PERIOD_MS).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); delAct=`(Rev. até ${rT})`;} const fT=`${delTitleBase} ${delAct}`; actions=`<button class="action-btn delete-transaction btn-sm btn-outline-danger" data-linked-bill-id="${origBill?.id||''}" title="${escapeHtml(fT)}" ${!canDel?'disabled':''}><i class="fas fa-trash"></i></button>`;} else {actions=` <button class="action-btn edit-transaction btn-sm btn-outline-secondary" title="Editar"><i class="fas fa-pencil"></i></button> <button class="action-btn delete-transaction btn-sm btn-outline-danger" title="Excluir"><i class="fas fa-trash"></i></button>`;} div.innerHTML=`<div class="transaction-icon ${iconBg}"><i class="${catIcon}"></i></div> <div class="transaction-details"> <div class="transaction-title">${escapeHtml(transaction.item)} ${schedInd} ${descIndicator}</div> <div class="transaction-meta"> <span><i class="far fa-calendar-alt fa-fw"></i>${formatDisplayDate(transaction.date)}</span> <span><i class="fas fa-tag fa-fw"></i>${escapeHtml(transaction.category)}</span> </div> <div class="transaction-payment-method ${transaction.paymentMethod||'unknown'}">${pmIcon} ${escapeHtml(pmText)}</div> </div> <div class="transaction-amount ${amtCls}"> ${amtPfx} <span class="monetary-value">${formatCurrency(transaction.amount)}</span></div> ${showActions?`<div class="transaction-actions">${actions}</div>`:''}`; return div; }
    function createBillElement(bill, index, showDeleteButton){ /* ... (código existente) ... */ const div=document.createElement('div'); div.className='bill-item'; div.dataset.index=index; div.dataset.id=bill.id; const today=getLocalDateString(); const isOverdue=!bill.paid&&bill.date<today; let catIcon=categoryIconMapping[bill.category]||'fas fa-file-invoice'; if(bill.category==='Fatura do cartão')catIcon='fas fa-credit-card'; if(bill.paid)div.classList.add('paid'); else if(bill.insufficientBalance)div.classList.add('insufficient-balance','pending'); else if(bill.pending)div.classList.add('pending'); else if(isOverdue)div.classList.add('overdue'); let statTxt='',statIcon='',cancInf=''; if(bill.paid&&isWithinGracePeriod(bill.processedTimestamp)){const rT=new Date((bill.processedTimestamp||Date.now())+GRACE_PERIOD_MS).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});cancInf=` (Rev. até ${rT})`;} if(bill.paid){statTxt=`Pago ${formatDisplayDate(bill.processedDate||'N/D')}${cancInf}`;statIcon='<i class="fas fa-check-circle text-success"></i>';} else if(bill.insufficientBalance){statTxt='Saldo insufic.';statIcon='<i class="fas fa-exclamation-triangle text-warning"></i>';} else if(bill.pending){statTxt='Pendente Conf.';statIcon='<i class="fas fa-hourglass-half text-info"></i>';} else if(isOverdue){statTxt='Vencido';statIcon='<i class="fas fa-calendar-times text-danger"></i>';} else {statTxt=`Vence ${formatDisplayDate(bill.date)}`;statIcon='<i class="far fa-calendar-alt text-muted"></i>';} let pmIcon='',pmText=''; let pmDisp=bill.paymentMethod; switch(pmDisp){case'pix':pmIcon='<i class="fas fa-qrcode fa-fw"></i>';pmText='Pix';break;case'cash':pmIcon='<i class="fas fa-money-bill-wave fa-fw"></i>';pmText='Dinheiro';break;case'card':pmIcon='<i class="fas fa-credit-card fa-fw"></i>';pmText='Conta/C.';break;default:pmIcon='<i class="fas fa-question-circle fa-fw"></i>';pmText=bill.paymentMethod||'N/D';} const catDisp=scheduledPaymentVisibleCategories.find(c=>c.value===bill.category)?.text||bill.category||'Agendam.'; const payDesc=`${pmIcon} Pagar c/ ${pmText}`; let acts=''; if(!bill.paid){ const btnClass=`btn btn-sm manual-pay-btn`; let payTitle=`Confirmar pag. ${bill.pending?'pendente':(isOverdue?'vencido':'')} usando ${pmText}`; if(bill.insufficientBalance)payTitle=`Saldo insuf. em ${pmText}. Clique p/ pag. manual`; acts+=`<button class="${btnClass} btn-outline-secondary ${isOverdue && !bill.insufficientBalance ? 'border-danger text-danger' : ''}" title="${escapeHtml(payTitle)}"><i class="fas fa-hand-holding-usd me-1"></i>Pagar</button>`; if(showDeleteButton){ acts+=` <button class="action-btn delete-scheduled-item-btn btn btn-sm btn-outline-danger" title="Excluir Agend. (não pago)"><i class="fas fa-trash"></i></button>`; } } else { if(!showDeleteButton){ acts+=`<span class="action-btn info-paid" title="${escapeHtml(statTxt)}"><i class="fas fa-check-circle text-success"></i></span>`; } else { let delTitle=`Rem Hist. Agend. Pago`; const canCancel=isWithinGracePeriod(bill.processedTimestamp); let assocTxId=transactions.find(t=>t.isScheduled&&String(t.originatingBillId)===String(bill.id))?.id||'N/A'; if(canCancel){delTitle+=`. Reversível via Tx ID ${assocTxId} ${cancInf}.`;}else{delTitle+=` (Não Rev. aqui. Tx ID ${assocTxId}.)`;} acts+=`<button class="action-btn delete-scheduled-item-btn btn btn-sm btn-outline-danger" title="${escapeHtml(delTitle)}"><i class="fas fa-trash"></i></button>`;}} div.innerHTML=`<div class="bill-category-icon"><i class="${catIcon}"></i></div> <div class="bill-details"> <div class="bill-title">${escapeHtml(bill.name)} <span class="bill-category-text">(${escapeHtml(catDisp)})</span></div> <div class="bill-meta"> <span>${statIcon} ${escapeHtml(statTxt)}</span> <span class="separator">|</span> <span>${payDesc}</span> ${bill.autoDebit&&!bill.paid&&!bill.insufficientBalance?'<span class="separator">|</span><span title="Déb. Auto Ativo"><i class="fas fa-robot"></i> Auto</span>':''} ${bill.autoDebit&&bill.paid?'<span class="separator">|</span><span title="Pago via Déb. Auto"><i class="fas fa-robot text-success"></i> Pgo Auto</span>':''} ${bill.autoDebit&&bill.insufficientBalance?'<span class="separator">|</span><span title="Déb. Auto Falhou"><i class="fas fa-robot text-danger"></i> Falha</span>':''} </div> </div> <div class="bill-amount amount-negative">- <span class="monetary-value">${formatCurrency(bill.amount)}</span></div> <div class="bill-actions">${acts}</div>`; return div; }
    function createGoalElement(goal, index){ /* ... (código existente) ... */ const div=document.createElement('div');div.className=`goal-item ${goal.completed?'completed':''}`;div.dataset.index=index;div.dataset.id=goal.id; const goalTypeName=getGoalTypeName(goal.type); const goalTypeIcon=getGoalTypeIcon(goal.type); const progress=goal.target>0?Math.min((goal.current/goal.target)*100,100):0; const today=new Date(); today.setHours(0,0,0,0); const goalDate=parseDateInput(goal.date); if (!isNaN(goalDate)) goalDate.setHours(0, 0, 0, 0); const daysLeft=isNaN(goalDate) ? Infinity : Math.ceil((goalDate-today)/(1000*60*60*24)); let timeLeftText='',timeLeftClass=''; if(goal.completed){timeLeftText=`Concluída ${formatDisplayDate(goal.completedAt||goal.createdAt)}`; timeLeftClass='completed';} else if (isNaN(goalDate)) { timeLeftText = 'Data Inválida'; timeLeftClass = 'overdue'; } else if(daysLeft<0){timeLeftText=`Vencida ${Math.abs(daysLeft)} dia(s)`; timeLeftClass='overdue';} else if(daysLeft===0){timeLeftText='Vence hoje!'; timeLeftClass='due-today';} else if(daysLeft<30){timeLeftText=`Faltam ${daysLeft} dia(s)`; timeLeftClass='due-soon';} else {timeLeftText=`~ ${Math.ceil(daysLeft/30.44)} mese(s)`; timeLeftClass='due-later';} const projection=!goal.completed?calculateProjection(goal):null; const canCompleteManually=!goal.completed&&progress>=100; const themeColorVar=`--theme-color-${goal.themeColor||selectedThemeColor||'masculine-1'}`; const progressBarColor=`var(${themeColorVar}, #3a86ff)`; div.innerHTML=`<div class="goal-header"> <div class="goal-content"> ${goal.image?`<img src="${escapeHtml(goal.image)}" class="goal-image" alt="${escapeHtml(goal.name)}">`:'<div class="goal-image-placeholder"><i class="fas fa-image"></i></div>'} <div class="goal-info"> <h3>${escapeHtml(goal.name)}</h3> <div class="goal-meta"> <span class="goal-type"><i class="fas ${goalTypeIcon} fa-fw"></i> ${escapeHtml(goalTypeName)}</span> <span class="goal-time-left ${timeLeftClass}"><i class="far fa-clock fa-fw"></i> ${escapeHtml(timeLeftText)}</span> </div> </div> </div> <div class="goal-actions"> <button class="action-btn edit-goal btn-sm btn-outline-secondary" title="Editar Meta"><i class="fas fa-pencil"></i></button> <button class="action-btn delete-goal btn-sm btn-outline-danger" title="Excluir Meta"><i class="fas fa-trash"></i></button> </div> </div> <div class="goal-progress-details"> <div class="progress-container"> <div class="progress-bar" style="width:${progress}%; background:${progressBarColor};"></div> </div> <div class="goal-progress-info"> <span><span class="monetary-value">${formatCurrency(goal.current)}</span> / <span class="monetary-value">${formatCurrency(goal.target)}</span></span> <span>(${Math.round(progress)}%)</span> </div> </div> ${projection?`<div class="projection-info"><small><i class="fas fa-chart-line fa-fw"></i> Proj: ${projection.monthsNeeded} meses (${escapeHtml(projection.completionDateDisplay)})</small></div>`:''} ${!goal.completed?`<div class="goal-contribution"><label for="contribution-${goal.id}" class="sr-only">Contribuição</label><input type="number" id="contribution-${goal.id}" placeholder="${formatPlaceholderCurrency()}" step="0.01" min="0.01" class="form-control contribution-input monetary-input"><button class="btn btn-sm btn-outline add-contribution-btn" title="Adicionar"><i class="fas fa-plus"></i> Add</button></div>`:''} ${canCompleteManually?`<div class="goal-complete-action"><button class="btn btn-sm btn-success complete-goal-btn"><i class="fas fa-check"></i> Concluir</button></div>`:''}`; return div; }
    function getGoalTypeName(typeKey){const t={travel:'Viagem',electronics:'Eletrônicos',education:'Educação',emergency:'Emergência',home:'Casa',car:'Carro',debt:'Dívida',investment:'Investimento',other:'Outro'};return t[typeKey]||typeKey||'N/D';}
    function getGoalTypeIcon(typeKey){const i={travel:'fa-plane-departure',electronics:'fa-laptop',education:'fa-graduation-cap',emergency:'fa-briefcase-medical',home:'fa-home',car:'fa-car',debt:'fa-credit-card',investment:'fa-piggy-bank',other:'fa-bullseye'};return i[typeKey]||'fa-bullseye';}

    // --- Criar Elemento de Nota (Principal) ---
    function createNoteElement(note) {
        const div = document.createElement('div');
        div.className = `note-card note-color-${note.color || 'default'} note-type-${note.type}`;
        div.dataset.noteId = note.id;
        let reminderActiveClass = '';
        if (note.reminderDate && !note.reminderTriggered) { const reminderDateTime = parseDateTimeInput(note.reminderDate, note.reminderTime); if (!isNaN(reminderDateTime) && reminderDateTime <= new Date()) { reminderActiveClass = ' has-reminder-active'; } }
        const processedContent = processNoteContentForDisplay(note.content || '', note.id, false); // False = visual, não interativo
        let reminderInfo = ''; if (note.reminderDate) { const displayDateTime = formatDisplayDateTime(note.reminderDate, note.reminderTime); reminderInfo = `<span class="note-reminder-info${reminderActiveClass}" title="Lembrete para ${displayDateTime}"><i class="far fa-bell"></i> ${displayDateTime}</span>`; }
        let taskInfo = ''; if (note.type === 'task' && note.totalTasks > 0) { taskInfo = `<span class="note-task-info" title="${note.completedTasks} de ${note.totalTasks} tarefas"><i class="fas fa-tasks"></i> ${note.completedTasks}/${note.totalTasks}</span>`; }
        const updatedDate = new Date(note.updatedAt); const formattedUpdatedDate = `${String(updatedDate.getDate()).padStart(2, '0')}/${String(updatedDate.getMonth() + 1).padStart(2, '0')}/${updatedDate.getFullYear().toString().slice(-2)} ${String(updatedDate.getHours()).padStart(2, '0')}:${String(updatedDate.getMinutes()).padStart(2, '0')}`;
        const typeIcon = note.type === 'task' ? '<i class="fas fa-clipboard-list note-type-indicator" title="Tarefa"></i>' : '<i class="far fa-file-alt note-type-indicator" title="Nota"></i>';
        div.innerHTML = `<div class="note-header">${typeIcon} ${note.title ? `<h4 class="note-title">${escapeHtml(note.title)}</h4>` : `<h4 class="note-title text-muted fst-italic">(Sem Título)</h4>`}<div class="note-actions"><button class="action-btn edit-note btn-sm btn-outline-secondary" title="Editar"><i class="fas fa-pencil"></i></button><button class="action-btn delete-note btn-sm btn-outline-danger" title="Excluir"><i class="fas fa-trash"></i></button></div></div><div class="note-content">${processedContent}</div><div class="note-footer"><span class="note-date" title="Atualizado"><i class="far fa-calendar-alt"></i> ${formattedUpdatedDate}</span><div class="note-meta-icons">${taskInfo} ${taskInfo && reminderInfo ? '&nbsp;|&nbsp;' : ''} ${reminderInfo}</div></div>`;
        return div;
    }

    // --- Processar Conteúdo da Nota para Display ---
    function processNoteContentForDisplay(content, noteId, generateCheckboxes = false) {
        let processedHtml = '';
        const lines = content.split('\n');
        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trimStart();
            let isCompleted = false, isTaskLine = false, taskMarker = '';
            if (trimmedLine.startsWith(PENDING_CHECKLIST)) { isTaskLine = true; isCompleted = false; taskMarker = PENDING_CHECKLIST; }
            else if (trimmedLine.startsWith(COMPLETED_CHECKLIST)) { isTaskLine = true; isCompleted = true; taskMarker = COMPLETED_CHECKLIST; }

            if (isTaskLine) {
                const leadingSpace = line.substring(0, line.indexOf(taskMarker));
                const restOfLine = line.substring(leadingSpace.length + taskMarker.length);
                const checkboxClass = isCompleted ? 'completed' : 'pending';
                const textClass = isCompleted ? 'completed-text' : '';
                let checkboxElement;

                if (generateCheckboxes) { // Gera checkbox REAL para o Leitor
                    checkboxElement = `<input type="checkbox" class="reader-task-checkbox" data-note-id="${noteId}" data-line-index="${lineIndex}" ${isCompleted ? 'checked' : ''}>`;
                } else { // Gera span VISUAL para o Card Principal
                    checkboxElement = `<span class="task-checkbox-visual ${checkboxClass}">${escapeHtml(taskMarker)}</span>`;
                }

                 processedHtml += `<div class="task-line-item">${leadingSpace}${checkboxElement}<span class="task-text ${textClass}">${escapeHtml(restOfLine)}</span></div>`;
            } else {
                 processedHtml += `<div>${escapeHtml(line)}</div>`;
            }
        });
        return processedHtml;
    }

     // --- Contar Tarefas ---
     function parseNoteContentForTasks(content, noteType) {
         let completed = 0, total = 0;
         if (noteType === 'task' && content) {
             const lines = content.split('\n');
             lines.forEach(line => {
                  const trimmedLine = line.trimStart();
                 if (trimmedLine.startsWith(PENDING_CHECKLIST)) total++;
                 else if (trimmedLine.startsWith(COMPLETED_CHECKLIST)) { total++; completed++; }
             });
         }
         return { completed, total };
     }

    // --- Funções da Calculadora de Economia ---

    /**
     * Calcula o custo por unidade base (g, ml, unidade).
     * @param {number} price - Preço do produto.
     * @param {number} quantity - Quantidade do produto.
     * @param {string} unit - Unidade original (kg, g, L, ml, unidade).
     * @returns {object|null} Objeto com { costPerBaseUnit, baseUnit, displayValue, error } ou null em caso de erro.
     */
    function calculateUnitCost(price, quantity, unit) {
        if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0 || !unit) {
            return { costPerBaseUnit: NaN, baseUnit: null, displayValue: 'Dados inválidos', error: true };
        }

        let baseQuantity = quantity;
        let baseUnit = unit;
        let costPerBaseUnit = NaN;
        let unitLabel = '';

        switch (unit) {
            case 'kg':
                baseQuantity = quantity * 1000;
                baseUnit = 'g';
                unitLabel = 'g';
                break;
            case 'g':
                baseUnit = 'g';
                unitLabel = 'g';
                break;
            case 'L':
                baseQuantity = quantity * 1000;
                baseUnit = 'ml';
                unitLabel = 'ml';
                break;
            case 'ml':
                baseUnit = 'ml';
                unitLabel = 'ml';
                break;
            case 'unidade':
                 baseUnit = 'unidade';
                 unitLabel = 'unid.';
                 break;
            default:
                return { costPerBaseUnit: NaN, baseUnit: null, displayValue: 'Unidade inválida', error: true };
        }

        costPerBaseUnit = price / baseQuantity;

        if (isNaN(costPerBaseUnit)) {
             return { costPerBaseUnit: NaN, baseUnit: null, displayValue: 'Erro no cálculo', error: true };
        }

        // Formatação especial para g e ml para mostrar mais decimais
        let formattedCost;
        if (baseUnit === 'g' || baseUnit === 'ml') {
            // Tentar mostrar até 4 casas decimais se relevante, senão usar formatCurrency
            const preciseCost = costPerBaseUnit.toFixed(5); // Calcula com 5 casas para decidir
             // Se o custo for muito baixo (e.g., < 0.01), mostra mais casas
             if (costPerBaseUnit < 0.01 && costPerBaseUnit > 0) {
                 formattedCost = `R$ ${parseFloat(preciseCost).toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 5})}`;
             } else {
                 formattedCost = formatCurrency(costPerBaseUnit); // Usa a função padrão para valores maiores
             }

        } else { // Para unidades
            formattedCost = formatCurrency(costPerBaseUnit);
        }

        const displayValue = `${formattedCost} por ${unitLabel}`;

        return { costPerBaseUnit, baseUnit, displayValue, error: false };
    }

    /**
     * Pega os dados do formulário, calcula e exibe a comparação de preços.
     */
    function handleComparisonCalculation() {
        // Resetar classes e textos de resultado anteriores
        product1Result.textContent = '';
        product1Result.className = 'comparison-result';
        product2Result.textContent = '';
        product2Result.className = 'comparison-result';
        comparisonSummary.textContent = '';
        comparisonSummary.style.display = 'none'; // Oculta o sumário

        // Obter e validar dados do Produto 1
        const price1 = parseFloat(String(comparePrice1?.value || '0').replace(',', '.')) || 0;
        const quantity1 = parseFloat(String(compareQuantity1?.value || '0').replace(',', '.')) || 0;
        const unit1 = compareUnit1?.value || '';

        // Obter e validar dados do Produto 2
        const price2 = parseFloat(String(comparePrice2?.value || '0').replace(',', '.')) || 0;
        const quantity2 = parseFloat(String(compareQuantity2?.value || '0').replace(',', '.')) || 0;
        const unit2 = compareUnit2?.value || '';

        // Validação básica de preenchimento
        if (!price1 || !quantity1 || !unit1 || !price2 || !quantity2 || !unit2) {
            showAlert('Preencha todos os campos com valores válidos (*).', 'warning');
            return;
        }

        // Calcular custo unitário para ambos
        const result1 = calculateUnitCost(price1, quantity1, unit1);
        const result2 = calculateUnitCost(price2, quantity2, unit2);

        // Exibir resultados individuais ou erros
        product1Result.textContent = result1.displayValue;
        if (result1.error) product1Result.classList.add('text-danger');

        product2Result.textContent = result2.displayValue;
         if (result2.error) product2Result.classList.add('text-danger');

        // Parar se houve erro em algum cálculo ou as unidades base são incompatíveis
        if (result1.error || result2.error) {
             showAlert('Erro nos dados de um dos produtos. Verifique os valores.', 'danger');
             return;
        }
        if (result1.baseUnit !== result2.baseUnit) {
             comparisonSummary.innerHTML = `Erro: Não é possível comparar unidades diferentes (<strong>${result1.baseUnit}</strong> vs <strong>${result2.baseUnit}</strong>).`;
             comparisonSummary.className = 'comparison-summary mt-3 text-danger';
             comparisonSummary.style.display = 'block';
             showAlert('As unidades selecionadas não são comparáveis (Ex: g vs ml). Escolha unidades equivalentes.', 'warning');
             return;
        }

        // Comparar os custos e definir classes visuais
        let cheaperProduct = 0; // 0: igual, 1: prod1, 2: prod2
        if (result1.costPerBaseUnit < result2.costPerBaseUnit) {
            cheaperProduct = 1;
            product1Result.classList.add('cheaper');
            product2Result.classList.add('more-expensive');
        } else if (result2.costPerBaseUnit < result1.costPerBaseUnit) {
             cheaperProduct = 2;
            product2Result.classList.add('cheaper');
            product1Result.classList.add('more-expensive');
        } else {
             // Preços iguais
             product1Result.classList.add('cheaper'); // Usa 'cheaper' para indicar OK (poderia ser 'equal')
             product2Result.classList.add('cheaper');
        }

        // Montar e exibir o sumário da comparação
        let summaryText = '';
        const unitLabel = result1.baseUnit === 'unidade' ? 'unidade' : result1.baseUnit;

        if (cheaperProduct === 1) {
            const diff = result2.costPerBaseUnit - result1.costPerBaseUnit;
            const percentage = ((diff / result2.costPerBaseUnit) * 100).toFixed(1);
            summaryText = `<strong>Produto 1</strong> é <strong class="text-success">${percentage}%</strong> mais barato por ${unitLabel}.`;
        } else if (cheaperProduct === 2) {
            const diff = result1.costPerBaseUnit - result2.costPerBaseUnit;
             const percentage = ((diff / result1.costPerBaseUnit) * 100).toFixed(1);
             summaryText = `<strong>Produto 2</strong> é <strong class="text-success">${percentage}%</strong> mais barato por ${unitLabel}.`;
        } else {
            summaryText = `Ambos os produtos têm o <strong>mesmo preço</strong> por ${unitLabel}.`;
        }

        comparisonSummary.innerHTML = summaryText;
        comparisonSummary.className = 'comparison-summary mt-3'; // Reset class para tirar erro anterior
        comparisonSummary.style.display = 'block';
    }

    /**
     * Limpa o formulário da calculadora e os resultados.
     */
    function clearComparisonForm() {
        if(economyCalculatorForm) economyCalculatorForm.reset(); // Reseta o formulário
        if(product1Result) {
            product1Result.textContent = '';
            product1Result.className = 'comparison-result'; // Reseta classes CSS
        }
       if(product2Result) {
           product2Result.textContent = '';
           product2Result.className = 'comparison-result'; // Reseta classes CSS
       }
       if(comparisonSummary) {
            comparisonSummary.textContent = '';
            comparisonSummary.style.display = 'none'; // Oculta o sumário
       }
        // Redefinir seletores para valores padrão se necessário (exemplo)
        if (compareUnit1) compareUnit1.value = 'g';
        if (compareUnit2) compareUnit2.value = 'kg';
       // Focar no primeiro campo de preço pode ser útil
       if(comparePrice1) comparePrice1.focus();
       updatePlaceholders(); // Garante que placeholders estejam corretos (se afetados por valuesHidden)
    }
    // --- Fim Funções Calculadora ---


    // --- Cálculos ---
    function calculateCurrentBalances(){ /* ... */ let p=initialBalances.pix,c=initialBalances.cash,d=initialBalances.card; transactions.forEach(t=>{if(!t||isNaN(t.amount))return; const f=t.type==='income'?1:-1; if(t.paymentMethod==='pix')p+=t.amount*f; else if(t.paymentMethod==='cash')c+=t.amount*f; else if(t.paymentMethod==='card')d+=t.amount*f;}); return{currentPix:p,currentCash:c,currentCard:d};}
    function calculateCurrentBalancesWithout(idx){ /* ... */ let p=initialBalances.pix,c=initialBalances.cash,d=initialBalances.card; transactions.forEach((t,i)=>{if(i===idx||!t||isNaN(t.amount))return; const f=t.type==='income'?1:-1; if(t.paymentMethod==='pix')p+=t.amount*f; else if(t.paymentMethod==='cash')c+=t.amount*f; else if(t.paymentMethod==='card')d+=t.amount*f;}); return{currentPix:p,currentCash:c,currentCard:d};}
    function calculateProjection(goal){ /* ... */ if(!goal||goal.completed||!goal.monthlyContribution||goal.monthlyContribution<=0||goal.target<=goal.current)return null; const r=goal.target-goal.current;const m=Math.ceil(r/goal.monthlyContribution); if(m<=0)return null; const cD=new Date(); cD.setMonth(cD.getMonth()+m); const y=cD.getFullYear(); const mn=String(cD.getMonth()+1).padStart(2,'0'); const dy=String(cD.getDate()).padStart(2,'0'); return{monthsNeeded:m,completionDateDisplay:`${dy}/${mn}/${y}`};}

    // --- Ações ---
    async function addTransactionFromModal(e){ /* ... */ e.preventDefault(); if (!modalItemInput||!modalAmountInput||!modalDateInput||!modalCategoryInput||!modalPaymentMethodInput||!modalDescriptionInput||!modalOriginatingBillIdInput||!modalTypeInput)return showAlert('Erro interno.', 'danger'); const dt=modalDateInput.value; const it=modalItemInput.value.trim(); const am=parseFloat(String(modalAmountInput.value).replace(',','.'))||0; const ty=modalTypeInput.value; const ca=modalCategoryInput.value; const pm=modalPaymentMethodInput.value; const ds=modalDescriptionInput.value.trim(); const oId=modalOriginatingBillIdInput.value||null; if(!it||!dt||isNaN(am)||am<=0||!ca||ca.startsWith('-- ')||!pm)return showAlert('Preencha obrigatórios (*).','warning'); if(oId){const oBill=upcomingBills.find(b=>String(b.id)===String(oId)); if(oBill&&oBill.category==='Fatura do cartão'&&pm==='card')return showAlert('Erro: Fatura não paga com Cartão.', 'danger');} if(ty==='expense'){const{currentPix:cp,currentCash:cc}=calculateCurrentBalances(); let b=0, n=''; if(pm==='pix'){b=cp;n='Pix';} else if(pm==='cash'){b=cc;n='Dinheiro';} if((pm==='pix'||pm==='cash')&&am>b)return showAlert(`Saldo ${n} insuf. (${formatCurrency(b)}).`, 'danger');} const newTx={id:Date.now()+Math.random(),date:dt,item:it,amount:am,type:ty,category:ca,paymentMethod:pm,description:ds,isScheduled:!!oId,originatingBillId:oId}; transactions.push(newTx); if(oId){const bIdx=upcomingBills.findIndex(b=>String(b.id)===String(oId)); if(bIdx>-1){const bill=upcomingBills[bIdx]; bill.paid=true; bill.processedDate=getLocalDateString(); bill.processedTimestamp=newTx.id; bill.pending=false; bill.insufficientBalance=false; bill.processingAttempted=true; bill.paymentMethod=pm; showAlert(`Pag. manual "${escapeHtml(bill.name)}" (${pm.toUpperCase()}) OK!`, 'success');}else{showAlert('Pgto registrado, Agend. ñ achado.','warning');}} else {if(saveTransactionBtn) showSuccessFeedback(saveTransactionBtn,"Salvo!");} saveDataToStorage(); updateUIafterTransactionChange(); closeModal(transactionModal); highlightNewTransaction(newTx.id);}
    async function saveEditedTransaction(){ /* ... */ if(currentEditIndex===null||!transactions[currentEditIndex]||!editForm)return showAlert("Erro encontrar tx.", 'danger'), closeModal(editModal); if(!editDateInput||!editItemInput||!editAmountInput||!editTypeInput||!editCategoryInput||!editPaymentMethodInput||!editDescriptionInput)return showAlert("Erro interno.", "danger"); const oT=transactions[currentEditIndex]; if(oT.isScheduled)return showAlert("Tx agend. não editável.", 'warning'), closeModal(editModal); const nDt=editDateInput.value; const nIt=editItemInput.value.trim(); const nAm=parseFloat(String(editAmountInput.value).replace(',','.'))||0; const nTy=editTypeInput.value; const nCa=editCategoryInput.value; const nPm=editPaymentMethodInput.value; const nDs=editDescriptionInput.value.trim(); if(!nIt||!nDt||isNaN(nAm)||nAm<=0||!nCa||nCa.startsWith('-- ')||!nPm)return showAlert('Preencha obrigatórios (*).', 'warning'); let chkB=false; if(nTy==='expense'&&(oT.type!=='expense'||nAm>oT.amount||((nPm==='pix'||nPm==='cash')&&nPm!==oT.paymentMethod)))chkB=true; if(chkB){const tmpB=calculateCurrentBalancesWithout(currentEditIndex); let bal=0, lbl=''; if(nPm==='pix'){bal=tmpB.currentPix; lbl='Pix';} else if(nPm==='cash'){bal=tmpB.currentCash; lbl='Dinheiro';} if((nPm==='pix'||nPm==='cash')&&nAm>bal)return showAlert(`Saldo ${lbl} insuf. p/ alteração.`, 'danger');} transactions[currentEditIndex]={...oT, date:nDt, item:nIt, amount:nAm, type:nTy, category:nCa, paymentMethod:nPm, description:nDs}; saveDataToStorage(); updateUIafterTransactionChange(); closeModal(editModal); showAlert('Transação manual atualizada!', 'info'); if(saveEditBtn)showSuccessFeedback(saveEditBtn,"Atualizado!"); }
    async function confirmDeleteTransaction(){ /* ... */ if (currentEditIndex===null||!transactions[currentEditIndex]) return showAlert("Erro: Tx não encontrada.",'danger'), currentEditIndex=null; const txDel={...transactions[currentEditIndex]}; const oIdx=currentEditIndex; currentEditIndex=null; let conf=false, ok=false; if (txDel.isScheduled&&txDel.originatingBillId) { const bId=txDel.originatingBillId; const bIdx=upcomingBills.findIndex(b=>b&&String(b.id)===String(bId)); if(bIdx===-1){conf=await showConfirmModal(`Excluir tx agend. <b>"${escapeHtml(txDel.item)}"</b> (${formatCurrency(txDel.amount)})?<br>Agend. ID ${bId} ñ encontrado.<br><strong>Ñ</strong> pode ser desfeita.`); if(conf){transactions.splice(oIdx,1); ok=true; showAlert('Tx agendada (órfã) excluída.','info');}} else { const bill=upcomingBills[bIdx]; if(isWithinGracePeriod(bill.processedTimestamp)){const rT=new Date((bill.processedTimestamp||Date.now())+GRACE_PERIOD_MS).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); conf=await showConfirmModal(`Cancelar pag. <b>"${escapeHtml(bill.name)}"</b> (${formatCurrency(txDel.amount)})?<br><i class="fas fa-history"></i> <strong>REVERSÍVEL</strong> (até ${rT}).<br>Excluir Tx; Reverter Agend. p/ PENDENTE.`); if(conf){transactions.splice(oIdx,1); upcomingBills[bIdx].paid=false; upcomingBills[bIdx].processedDate=null; upcomingBills[bIdx].processedTimestamp=null; upcomingBills[bIdx].pending=true; upcomingBills[bIdx].insufficientBalance=false; upcomingBills[bIdx].processingAttempted=false; ok=true; showAlert(`Pgto "${escapeHtml(bill.name)}" revertido.`, 'success');}} else {showAlert(`Reversão ñ permitida (+24h). Exclua na tela 'Agendamentos'.`, 'warning');}}} else { conf=await showConfirmModal(`Excluir tx manual: <b>"${escapeHtml(txDel.item)}"</b> (${formatCurrency(txDel.amount)})?<br>Ñ pode ser desfeita.`); if(conf){transactions.splice(oIdx,1); ok=true; showAlert('Transação manual excluída.', 'info');}} if(ok){saveDataToStorage(); updateUIafterTransactionChange();} }
    async function saveScheduledPayment(e){ /* ... */ e.preventDefault(); const nI=scheduledItemInput?.value.trim()||''; const aI=scheduledAmountInput?.value||''; const dI=scheduledDateInput?.value||''; const cS=scheduledCategoryInput; const pS=scheduledPaymentMethodInput; const aC=scheduledAutoDebitInput?.checked||false; if(!cS||!pS)return showAlert("Erro interno.",'danger'); const n=nI||'Agendamento'; const a=parseFloat(String(aI).replace(',','.'))||0; const d=dI; const c=cS.value; const p=pS.value; const b=aC; let err=[]; if(!n)err.push("Descrição"); if(!d)err.push("Data"); if(isNaN(a)||a<=0)err.push("Valor"); if(!c||c===''||!scheduledPaymentVisibleCategories.find(cat=>cat.value===c&&cat.value!==''))err.push("Categoria"); if(!p)err.push("Método"); if(c==='Fatura do cartão'&&p==='card')return showAlert('Erro: Fatura ñ paga c/ Cartão.','danger'); if(err.length>0)return showAlert(`Preencha: ${err.join(', ')}.`, 'warning'); await showScheduledPaymentWarningModal(); const newB={id:Date.now()+Math.random(),name:n,amount:a,date:d,category:c,paymentMethod:p,autoDebit:b,paid:false,pending:!b,insufficientBalance:false,processingAttempted:false,processedTimestamp:null,processedDate:null}; upcomingBills.push(newB); saveDataToStorage(); renderUpcomingBills(); renderAllScheduledPayments(); checkScheduledPayments(); closeModal(scheduledPaymentModal); showAlert('Agendado!', 'success'); if(saveScheduledPaymentBtn)showSuccessFeedback(saveScheduledPaymentBtn,"Salvo!"); }
    async function deleteScheduledItem(index){ /* ... */ if(index===null||!upcomingBills[index])return showAlert("Erro: Agend. ñ encontrado.",'danger'); const bill=upcomingBills[index]; let msg=`Excluir agend. <b>"${escapeHtml(bill.name)}"</b> (Venc: ${formatDisplayDate(bill.date)})?`; let hasTx=false, canC=false, txId=null; if(bill.paid){const tx=transactions.find(t=>t.isScheduled&&String(t.originatingBillId)===String(bill.id)); if(tx){hasTx=true; txId=tx.id; canC=isWithinGracePeriod(bill.processedTimestamp); const rT=new Date((bill.processedTimestamp||Date.now())+GRACE_PERIOD_MS).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); if(canC)msg+=`<br><br><strong>PAGO RECENTE</strong> (até ${rT}). Excluir aqui <strong>REMOVE SÓ HISTÓRICO</strong>. Cancele via Tx ID ${txId}.`; else msg+=`<br><br>Pago há +24h. Remove <strong>SÓ HISTÓRICO</strong>. Tx ID ${txId} ñ afetada.`;}else{msg+=`<br><br>Pago, Tx ñ encontrada. Remove só registro.`}}else{msg+=`<br><br>Ñ pago. Nenhuma Tx afetada.`} const conf=await showConfirmModal(msg); if(!conf)return; upcomingBills.splice(index,1); saveDataToStorage(); renderUpcomingBills(); renderAllScheduledPayments(); if(hasTx&&canC)showAlert(`Hist. "${escapeHtml(bill.name)}" excluído. Cancele via Tx ID ${txId}.`,'info'); else if(hasTx)showAlert(`Hist. "${escapeHtml(bill.name)}" excluído. Tx ñ afetada (ID ${txId}).`,'info'); else showAlert(`Registro "${escapeHtml(bill.name)}" excluído.`,'info');}
    async function saveGoal(e){ /* ... */ e.preventDefault(); if (!goalNameInput||!goalTargetInput||!goalDateInput||!goalTypeInput) return; const nm=goalNameInput.value.trim(); const tg=parseFloat(String(goalTargetInput.value).replace(',','.'))||0; const dt=goalDateInput.value; const iF=goalImageInput?.files?.[0]; const sC=goalModal?.querySelector('.theme-color-option.selected')?.dataset.color||selectedThemeColor||'masculine-1'; const mC=parseFloat(String(monthlyContributionInput?.value||'0').replace(',','.'))||0; const gT=goalTypeInput.value; if(!nm||isNaN(tg)||tg<=0||!dt||!gT||gT==="")return showAlert('Preencha: Nome, Valor, Data Alvo, Tipo.', 'warning'); const isEd=currentEditIndex!==null&&goals[currentEditIndex]; const gData={id:isEd?goals[currentEditIndex].id:Date.now()+Math.random(),name:nm,target:tg,date:dt,type:gT,monthlyContribution:mC,themeColor:sC,current:isEd?goals[currentEditIndex].current:0,contributions:isEd?goals[currentEditIndex].contributions||[]:[],completed:isEd?goals[currentEditIndex].completed:false,completedAt:isEd?goals[currentEditIndex].completedAt:null,createdAt:isEd?goals[currentEditIndex].createdAt:new Date().toISOString(),image:isEd?goals[currentEditIndex].image:null}; const proc=(imgD=null)=>{if(imgD)gData.image=imgD; else if(isEd&&goalImagePreview?.style.display==='none'&&!iF)gData.image=null; else if(isEd&&!imgD&&!goalImagePreview?.style.display?.includes('none')&&!iF)gData.image=goals[currentEditIndex].image; if(isEd)goals[currentEditIndex]=gData; else goals.push(gData); saveDataToStorage(); renderGoals(); updateGoalsSummary(); closeModal(goalModal); showAlert(`Meta ${isEd?'atualizada':'salva'}!`, 'success'); currentEditIndex=null; if(saveGoalBtn)showSuccessFeedback(saveGoalBtn,isEd?'Atualizada!':'Salva!');}; if(iF){const r=new FileReader(); r.onload=ev=>proc(ev.target?.result?.toString()); r.onerror=e=>{showAlert("Erro upload imagem.",'danger');proc(gData.image);}; r.readAsDataURL(iF);} else proc(gData.image);}
    async function addContribution(goalIndex,amountString){ /* ... */ if(goalIndex===null||!goals[goalIndex])return showAlert("Meta não encontrada.",'warning'); const goal=goals[goalIndex]; const amount=parseFloat(String(amountString||'0').replace(',','.'))||0; if(isNaN(amount)||amount<=0)return showAlert('Valor inválido.','warning'); if(goal.completed)return showAlert(`Meta "${escapeHtml(goal.name)}" concluída.`,'info'); goal.current+=amount; goal.contributions=goal.contributions||[]; goal.contributions.push({date:getLocalDateString(),amount:amount}); let comp=false; if(goal.current>=goal.target&&!goal.completed){goal.completed=true; goal.completedAt=new Date().toISOString(); comp=true;} saveDataToStorage(); renderGoals(); updateGoalsSummary(); if(comp)showAlert(`Meta "${escapeHtml(goal.name)}" alcançada!`, 'success'); const item=goalsListContainer?.querySelector(`.goal-item[data-index="${goalIndex}"]`); const inp=item?.querySelector('.contribution-input'); if(inp)inp.value=''; const btn=item?.querySelector('.add-contribution-btn'); if(btn)showSuccessFeedback(btn,'Add!');}
    async function completeGoal(goalIndex){ /* ... */ if(goalIndex===null||!goals[goalIndex])return; const goal=goals[goalIndex]; if(goal.completed)return showAlert("Meta já concluída.",'info'); if(goal.current<goal.target){const nd=goal.target-goal.current; return showAlert(`Faltam ${formatCurrency(nd)}.`, 'warning');} goal.completed=true; goal.completedAt=new Date().toISOString(); saveDataToStorage(); renderGoals(); updateGoalsSummary(); showAlert(`Meta "${escapeHtml(goal.name)}" concluída!`, 'success');}
    async function deleteGoal(goalIndex){ /* ... */ if(goalIndex===null||!goals[goalIndex])return showAlert("Meta não encontrada.",'warning'); const goal=goals[goalIndex]; const conf=await showConfirmModal(`Excluir meta "${escapeHtml(goal.name)}"?<br>Progresso perdido.`); if(conf){goals.splice(goalIndex,1); saveDataToStorage(); renderGoals(); updateGoalsSummary(); showAlert('Meta excluída.','info');}}

    // --- Ações Notas (Salvar, Excluir, Toggle) ---
    async function saveNote(e) {
        e.preventDefault();
        if (!noteForm || !noteTypeSelect || !noteTitleInput || !noteContentInput || !noteReminderDateInput || !noteReminderTimeInput || !noteColorOptionsContainer || !noteIdInput) return showAlert("Erro interno.", 'danger');
        const type = noteTypeSelect.value; const title = noteTitleInput.value.trim(); const content = noteContentInput.value;
        const reminderDate = noteReminderDateInput.value || null; const reminderTime = reminderDate ? (noteReminderTimeInput.value || null) : null;
        const selectedColorEl = noteColorOptionsContainer.querySelector('.color-option.selected'); const color = selectedColorEl ? selectedColorEl.dataset.color : 'default';
        const noteId = noteIdInput.value || null;
        if (!content && type === 'note') return showAlert("Conteúdo obrigatório.", 'warning');
        if (type === 'task' && !content && !title) return showAlert("Tarefa precisa de título ou conteúdo.", 'warning');
        if (reminderDate && isNaN(parseDateInput(reminderDate))) return showAlert("Data lembrete inválida.", 'warning');
        if (reminderTime) { const tp = reminderTime.split(':'); if (tp.length < 2 || isNaN(parseInt(tp[0])) || isNaN(parseInt(tp[1]))) return showAlert("Hora lembrete inválida.", 'warning'); }

        const now = new Date().toISOString(); const taskCounts = parseNoteContentForTasks(content, type);
        let noteData = { type, title, content, color, reminderDate, reminderTime, updatedAt: now, isTask: taskCounts.total > 0 && type === 'task', completedTasks: taskCounts.completed, totalTasks: taskCounts.total };
        let isEd = false, msg = 'Nota salva!', origN = null;

        if (noteId) {
            const idx = notes.findIndex(n => String(n.id) === String(noteId));
            if (idx > -1) { isEd = true; origN = { ...notes[idx] }; noteData.reminderTriggered = (origN.reminderDate === reminderDate && origN.reminderTime === reminderTime) ? origN.reminderTriggered : false; notes[idx] = { ...origN, ...noteData }; msg = 'Nota atualizada!'; }
            else return showAlert("Erro: Nota p/ edição ñ encontrada.", 'danger');
        } else { noteData = { ...noteData, id: Date.now() + Math.random(), createdAt: now, reminderTriggered: false }; notes.push(noteData); }

        saveDataToStorage(); renderNotes();
        if (quickNotesModal?.classList.contains('active')) renderQuickNotesPopupContent();
        if (noteReaderModal?.classList.contains('active')) { const rId = noteReaderModal.dataset.currentNoteId; if (rId && String(rId) === String(noteData.id || noteId)) updateNoteReaderContent(noteData.id || noteId); }
        closeModal(noteModal); showAlert(msg, 'success'); if (saveNoteBtn) showSuccessFeedback(saveNoteBtn, isEd ? "Atualizada!" : "Salva!"); checkReminders();
    }
    async function confirmDeleteNote(noteId) {
        const noteIndex = notes.findIndex(n => String(n.id) === String(noteId)); if (noteIndex === -1) return showAlert("Erro: Nota ñ encontrada.", 'danger');
        const note = notes[noteIndex]; const tSnip = note.title ? `"${escapeHtml(truncateText(note.title, 20))}"` : 'esta nota'; const cSnip = escapeHtml(truncateText(note.content.replace(/(&[-+]\s)/g, ''), 30));
        const conf = await showConfirmModal(`Excluir ${note.type==='task'?'tarefa':'nota'} ${tSnip}? <br><small>Conteúdo: ${cSnip}</small><br>Ação irreversível.`);
        if (conf) { if (noteReaderModal?.classList.contains('active') && noteReaderModal.dataset.currentNoteId === String(noteId)) closeModal(noteReaderModal); if (quickNotesModal?.classList.contains('active')) closeModal(quickNotesModal); notes.splice(noteIndex, 1); saveDataToStorage(); renderNotes(); showAlert(`${note.type === 'task' ? 'Tarefa' : 'Nota'} excluída.`, 'info'); }
    }
    function handleReaderCheckboxChange(event) { // Listener para change no leitor
        const target = event.target;
        if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox' || !target.closest('#noteReaderContent')) return;
        const noteId = target.dataset.noteId;
        const lineIndex = parseInt(target.dataset.lineIndex, 10);
        const makeComplete = target.checked; // Novo estado desejado
        if (!noteId || isNaN(lineIndex)) { console.error("Dados inválidos checkbox leitor (change):", target.dataset); return showAlert("Erro ao processar tarefa.", "warning"); }
        toggleTaskStatus(noteId, lineIndex, makeComplete); // Passa o estado desejado
    }
    function toggleTaskStatus(noteId, lineIndex, makeComplete) { // Modificado para receber estado
         const noteIndex = notes.findIndex(n => String(n.id) === String(noteId)); if (noteIndex === -1) return showAlert("Erro: Nota ñ encontrada.", 'danger');
         let note = notes[noteIndex]; if (note.type !== 'task') return;
         let contentLines = note.content.split('\n'); if (lineIndex < 0 || lineIndex >= contentLines.length) return showAlert("Erro: Linha inválida.", 'danger');
         let line = contentLines[lineIndex]; const trimmedLine = line.trimStart(); const leadingSpace = line.substring(0, line.indexOf(trimmedLine));
         let currentMarker = trimmedLine.startsWith(PENDING_CHECKLIST) ? PENDING_CHECKLIST : (trimmedLine.startsWith(COMPLETED_CHECKLIST) ? COMPLETED_CHECKLIST : null);
         if (!currentMarker) return console.warn(`Linha ${lineIndex} (ID: ${noteId}) ñ é checklist: ${line}`), showAlert("Erro: Item inválido.", "warning");

         const newMarker = makeComplete ? COMPLETED_CHECKLIST : PENDING_CHECKLIST;
         // Atualiza a string SÓ se o marcador for diferente do desejado
         if (currentMarker !== newMarker) {
             contentLines[lineIndex] = leadingSpace + newMarker + line.substring(leadingSpace.length + currentMarker.length);
             note.content = contentLines.join('\n');
             note.updatedAt = new Date().toISOString();
             const taskCounts = parseNoteContentForTasks(note.content, note.type);
             note.isTask = taskCounts.total > 0; note.completedTasks = taskCounts.completed; note.totalTasks = taskCounts.total;
             notes[noteIndex] = note;
             saveDataToStorage();
             showAlert(`Tarefa ${makeComplete ? 'concluída' : 'pendente'}.`, 'success', 1500);
         } else {
             console.log(`Status da tarefa já é ${makeComplete ? 'completo' : 'pendente'}. Nenhuma mudança na string.`);
         }

         // Sempre re-renderiza UIs para garantir consistência visual
         if (noteReaderModal?.classList.contains('active') && noteReaderModal.dataset.currentNoteId === String(noteId)) updateNoteReaderContent(noteId);
         renderNotes();
         if (quickNotesModal?.classList.contains('active')) renderQuickNotesPopupContent();
     }

    // --- Ações de Configurações ---
    function adjustBalance(method, amount){ /* ... */ if (!initialBalances||!['pix','cash','card'].includes(method)||typeof amount!=='number'||isNaN(amount))return showAlert('Erro ajuste.','danger'); const cBal=initialBalances[method]||0; const nBal=cBal+amount; initialBalances[method]=nBal; saveDataToStorage(); updateBalanceDisplay(); updateBalanceDisplays(); updateCharts(); const inpId=`initialBalance${method[0].toUpperCase()+method.slice(1)}`; const inpEl=safeGetElementById(inpId); if(inpEl){inpEl.value=nBal.toFixed(2); inpEl.classList.add('balance-updated-highlight'); setTimeout(()=>inpEl.classList.remove('balance-updated-highlight'), 1500);} }
    function saveSettings(){ /* ... */ if(!initialBalancePixInput||!initialBalanceCashInput||!initialBalanceCardInput)return showAlert("Erro interno.", 'danger'); const nP=parseFloat(initialBalancePixInput.value||'0')||0; const nC=parseFloat(initialBalanceCashInput.value||'0')||0; const nCd=parseFloat(initialBalanceCardInput.value||'0')||0; let ch=false; if(initialBalances.pix!==nP||initialBalances.cash!==nC||initialBalances.card!==nCd){initialBalances={pix:nP,cash:nC,card:nCd}; ch=true;} if(ch){saveDataToStorage(); updateBalanceDisplay(); updateBalanceDisplays(); updateCharts(); const btn=safeGetElementById('saveInitialBalances'); if(btn)showSuccessFeedback(btn,'Saldos Salvos!'); else showAlert('Saldos salvos!', 'success');} else { const btn=safeGetElementById('saveInitialBalances'); if(btn){btn.classList.add('btn-outline-secondary');btn.classList.remove('btn-primary'); const oT=btn.innerHTML; btn.innerHTML=`<i class="fas fa-info-circle"></i> Sem alterações`; btn.disabled=true; setTimeout(()=>{btn.innerHTML=oT; btn.classList.add('btn-primary');btn.classList.remove('btn-outline-secondary'); btn.disabled=false;},2000);}}}
    function saveUserSettings(){ /* ... */ if (!userNameInput||!userEmailInput||!currencyInput||!settingsSection) return; const nUn=userNameInput.value.trim(); const nEm=userEmailInput.value.trim(); const nCu=currencyInput.value; const nThC=settingsSection.querySelector('.theme-color-option.selected')?.dataset.color||selectedThemeColor; let ch=false; if(userName!==nUn){userName=nUn;ch=true;} if(userEmail!==nEm){userEmail=nEm;ch=true;} if(currency!==nCu){currency=nCu;ch=true;} if(selectedThemeColor!==nThC){selectedThemeColor=nThC;ch=true; applyThemeColor();} if(ch){saveDataToStorage(); if(safeQuerySelector('.user-name'))safeQuerySelector('.user-name').textContent=userName; if(safeQuerySelector('.user-email'))safeQuerySelector('.user-email').textContent=userEmail; if(currency!==nCu||selectedThemeColor!==nThC)updateUIafterSettingsChange(); else{applyValueVisibilityIconAndClass();updatePlaceholders();} if(saveUserSettingsBtn)showSuccessFeedback(saveUserSettingsBtn,'Salvo!'); else showAlert('Preferências Salvas!','success');}else{ if (saveUserSettingsBtn){const oT=saveUserSettingsBtn.innerHTML;saveUserSettingsBtn.classList.add('btn-outline-secondary');saveUserSettingsBtn.classList.remove('btn-primary');saveUserSettingsBtn.innerHTML=`<i class="fas fa-info-circle"></i> Sem alterações`; saveUserSettingsBtn.disabled=true;setTimeout(() => {saveUserSettingsBtn.innerHTML=oT;saveUserSettingsBtn.classList.add('btn-primary');saveUserSettingsBtn.classList.remove('btn-outline-secondary');saveUserSettingsBtn.disabled=false;},2000);}}}
    function exportData(){ /* ... */ const d={version:"1.9.11",transactions,goals,upcomingBills,notes,initialBalances,userName,userEmail,currency,selectedThemeColor,currentTheme,valuesHidden,hideScheduledPaymentWarning}; const s=JSON.stringify(d,null,2); const u='data:application/json;charset=utf-8,'+encodeURIComponent(s); const f=`gestor-backup-${new Date().toISOString().split('T')[0]}.json`; const a=document.createElement('a'); a.href=u; a.download=f; a.click(); a.remove(); showAlert('Backup exportado!', 'success');}
    function handleFileImport(event){ /* ... */ const file=event.target.files?.[0]; if (!file||!importDataInput)return; const reader=new FileReader(); reader.onload=async(e)=>{ try{ const data=JSON.parse(e.target?.result?.toString()||'{}'); const conf=await showConfirmModal('<strong>PERIGO!</strong> Importar backup?<br>SUBSTITUIRÁ TUDO.<br>Ação IRREVERSÍVEL.'); if(conf)importData(data); else showAlert('Importação cancelada.', 'info');} catch(err){showAlert(`Erro backup: ${err.message}.`,'danger');} finally{if(importDataInput)importDataInput.value='';}}; reader.onerror=()=>showAlert('Erro ler arquivo.','danger'); reader.readAsText(file);}
    function importData(data){ /* ... */ try { if(!data||typeof data!=='object')throw new Error('Formato inválido.'); transactions=Array.isArray(data.transactions)?data.transactions.map(t=>({...t, id:t.id||Date.now()+Math.random(),amount:parseFloat(String(t.amount).replace(',','.'))||0,description:t.description||'',isScheduled:t.isScheduled===true,originatingBillId:t.originatingBillId||null})):[]; goals=Array.isArray(data.goals)?data.goals.map(g=>{const pg={...g, id:g.id||Date.now()+Math.random(),target:parseFloat(String(g.target).replace(',','.'))||0, current:parseFloat(String(g.current).replace(',','.'))||0, monthlyContribution:parseFloat(String(g.monthlyContribution).replace(',','.'))||0, contributions:Array.isArray(g.contributions)?g.contributions.map(c=>({...c, amount:parseFloat(String(c.amount).replace(',','.'))||0})):[]}; if(pg.goalType&&!pg.type){pg.type=pg.goalType; delete pg.goalType;} return pg;}):[]; upcomingBills=Array.isArray(data.upcomingBills)?data.upcomingBills.map(b=>{const bill={...b, id:b.id||Date.now()+Math.random(),amount:parseFloat(String(b.amount).replace(',','.'))||0, paid:b.paid===true, pending:b.pending===true, insufficientBalance:b.insufficientBalance===true, autoDebit:b.autoDebit===true, processingAttempted:b.processingAttempted===true, category:(()=>{const valid=scheduledPaymentVisibleCategories.map(c=>c.value).filter(Boolean); if(b.category&&valid.includes(b.category))return b.category; if(b.category?.toLowerCase().includes('aluguel')||b.category?.toLowerCase().includes('financiamento'))return 'Aluguel'; if(b.category?.toLowerCase().includes('fatura')&&b.category?.toLowerCase().includes('cart'))return 'Fatura do cartão'; return 'Faturas';})(), paymentMethod:b.paymentMethod||'pix'}; if(bill.category==='Fatura do cartão'&&bill.paymentMethod==='card')bill.paymentMethod='pix'; if(bill.processedTimestamp)bill.processedTimestamp=parseInt(String(bill.processedTimestamp),10)||null; bill.processedDate=b.processedDate||null; return bill;}):[];
         notes = Array.isArray(data.notes) ? data.notes.map(n => { const nT = n.type === 'task' ? 'task' : 'note'; let clC = n.content || ''; if (clC && (clC.includes('[ ]') || clC.includes('[x]'))) clC=clC.replace(/^(\s*)\[ \]\s*/gm,'$1').replace(/^(\s*)\[x\]\s*/gm,'$1'); const tC = parseNoteContentForTasks(clC, nT); return { id: n.id||Date.now()+Math.random(), type: nT, title: n.title||'', content: clC, color: n.color||'default', createdAt: n.createdAt||new Date().toISOString(), updatedAt: n.updatedAt||n.createdAt||new Date().toISOString(), reminderDate: n.reminderDate||null, reminderTime: n.reminderTime||null, reminderTriggered: n.reminderTriggered===true, isTask: tC.total>0&&nT==='task', completedTasks: tC.completed, totalTasks: tC.total }; }) : [];
         initialBalances=(data.initialBalances&&typeof data.initialBalances==='object')?{pix:parseFloat(String(data.initialBalances.pix||0).replace(',','.')),cash:parseFloat(String(data.initialBalances.cash||0).replace(',','.')),card:parseFloat(String(data.initialBalances.card||0).replace(',','.'))}:{pix:0,cash:0,card:0}; userName=data.userName||'Usuário'; userEmail=data.userEmail||'email@exemplo.com'; currency=data.currency||'BRL'; selectedThemeColor=data.selectedThemeColor||'masculine-1'; currentTheme=data.currentTheme||data.theme||'light'; valuesHidden=data.valuesHidden===true; hideScheduledPaymentWarning=data.hideScheduledPaymentWarning===true; saveDataToStorage(); applyTheme(); applyThemeColor(); applyValueVisibilityIconAndClass(); updateUIafterImport(); showAlert('Dados importados!', 'success'); } catch(err){showAlert(`Falha importação: ${err.message}.`,'danger');}}

    // --- Lógica de Negócios ---
    function checkScheduledPayments() { /* ... */ const now=new Date(); const today=getLocalDateString(now); let upd=false, pC=0, fAC=0, pMC=0, save=false; let fMsg=[], pMsg=[]; upcomingBills.forEach((b,i)=>{if(!b||b.paid)return; const due=parseDateInput(b.date); if(isNaN(due))return; due.setHours(23,59,59,999); if(due<=now){if(b.autoDebit&&!b.processingAttempted&&!b.paid){upcomingBills[i].processingAttempted=true; save=true; const res=processScheduledPaymentLogic(i); if(res.success){pC++; upd=true;}else{fAC++; upd=true; if(upcomingBills[i].insufficientBalance)fMsg.push(`"${escapeHtml(b.name)}" (${b.paymentMethod})`);}}else if(!b.autoDebit&&!b.paid&&!b.pending&&!b.insufficientBalance){upcomingBills[i].pending=true; pMC++; save=true; upd=true; pMsg.push(`"${escapeHtml(b.name)}" (${formatDisplayDate(b.date)})`);}}}); if(save)saveDataToStorage(); if(upd){if(pC>0)refreshAllUIComponents(); else{renderUpcomingBills(); renderAllScheduledPayments();}} if(fMsg.length>0||pMsg.length>0){let msgs=[]; if(fMsg.length>0)msgs.push(`${fMsg.length} pag. auto falharam: ${fMsg.slice(0,2).join(', ')}${fMsg.length>2?'...':''}. Use 'Pagar'.`); if(pMsg.length>0)msgs.push(`${pMsg.length} pag. manual aguardam conf.: ${pMsg.slice(0,2).join(', ')}${pMsg.length>2?'...':''}.`); if(msgs.length>0)showAlert(msgs.join('<br>'),fAC>0?'warning':'info');}}
    function processScheduledPaymentLogic(index) { /* ... */ if (index===null||!upcomingBills[index]) return {success:false,message:'Agend. inválido.'}; const b=upcomingBills[index]; if(b.paid)return {success:false,message:'Já pago.'}; if(b.insufficientBalance&&b.autoDebit)return {success:false,message:`Auto falhou saldo.`}; if(b.category==='Fatura do cartão'&&b.paymentMethod==='card'){upcomingBills[index].pending=true; upcomingBills[index].insufficientBalance=false; upcomingBills[index].processingAttempted=true; return {success:false,message:'Erro Config: Fatura ñ paga c/ Cartão.'};} const pDate=getLocalDateString(); const bId=b.id; const bCat=b.category; const pM=b.paymentMethod; const bAmt=b.amount; let balOK=true; if(pM==='pix'||pM==='cash'){const{currentPix,currentCash}=calculateCurrentBalances(); let bChk=(pM==='pix')?currentPix:currentCash; let mLbl=(pM==='pix')?'Pix':'Dinheiro'; balOK=bChk>=bAmt; if(!balOK){upcomingBills[index].pending=true; upcomingBills[index].insufficientBalance=true; upcomingBills[index].paid=false; if(b.autoDebit)upcomingBills[index].processingAttempted=true; return {success:false,message:`Saldo ${mLbl} insuficiente (${formatCurrency(bChk)}).`};}} try { const tId=Date.now()+Math.random(); let txCat=scheduleToTransactionCategoryMap[bCat]||(categories.expense.includes(bCat)?bCat:'Faturas'); const newTx={id:tId,date:pDate,item:`Pag. Agend: ${b.name}`,amount:bAmt,type:'expense',category:txCat,paymentMethod:pM,description:`Ref agend ID ${bId}. (CatAgend: ${b.category}, Método: ${b.paymentMethod}${b.autoDebit?', Auto':', Manual/Conf'}).`,isScheduled:true,originatingBillId:bId}; transactions.push(newTx); upcomingBills[index].paid=true; upcomingBills[index].processedDate=pDate; upcomingBills[index].processedTimestamp=tId; upcomingBills[index].pending=false; upcomingBills[index].insufficientBalance=false; upcomingBills[index].processingAttempted=true; return {success:true};} catch(err){console.error(`ERRO CRÍTICO gerando Tx agend ${bId}:`,err); upcomingBills[index].pending=true; upcomingBills[index].insufficientBalance=false; upcomingBills[index].paid=false; upcomingBills[index].processingAttempted=true; return {success:false,message:`Erro interno Tx: ${err.message}`};}}
    function checkReminders() { /* ... */ const now=new Date(); let trig=0, save=false; notes.forEach((n,i)=>{if(n.reminderDate&&!n.reminderTriggered){const rDT=parseDateTimeInput(n.reminderDate,n.reminderTime); if(!isNaN(rDT)&&rDT<=now){const t=n.title?`<b>${escapeHtml(n.title)}</b>`:'Lembrete'; const p=escapeHtml(truncateText(n.content.replace(/(&[-+]\s)/g,''),100)); showAlert(`${t}<br><small>${p}</small>`,'warning',10000); notes[i].reminderTriggered=true; trig++; save=true;}}}); if(save){saveDataToStorage(); if(notesSection?.classList.contains('active'))renderNotes(); if(quickNotesModal?.classList.contains('active'))renderQuickNotesPopupContent(); if(noteReaderModal?.classList.contains('active')){const cId=noteReaderModal.dataset.currentNoteId; const tN=notes.find(n=>String(n.id)===cId&&n.reminderTriggered===true&&save); if(tN)updateNoteReaderContent(cId);}}}

    // --- Modals ---
    function openModal(el) { /* ... */ if (typeof el === 'string') el = safeGetElementById(el.substring(1)); if (el) el.classList.add('active'); }
    function closeModal(el) { /* ... */ if (typeof el === 'string') el = safeGetElementById(el.substring(1)); if (!el) return; el.classList.remove('active'); const id = el.id; if (['transactionModal','editModal','goalModal','scheduledPaymentModal'].includes(id)) currentEditIndex = null; if (id === 'noteModal') { currentEditingNoteId = null; if (noteForm) noteForm.reset(); if (noteTypeSelect) noteTypeSelect.value = 'note'; if (noteColorOptionsContainer) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected')); noteColorOptionsContainer.querySelector('[data-color="default"]')?.classList.add('selected'); } if (noteIdInput) noteIdInput.value = ''; if (noteModalTitle) noteModalTitle.textContent = "Nova Nota"; if (noteContentInput) noteContentInput.removeEventListener('keydown', handleNoteContentKeyDown); } if (id === 'transactionModal' && transactionModalForm) { /* ... reset tx form ... */ transactionModalForm.reset(); if (modalDateInput) modalDateInput.value = getLocalDateString(); if(modalTypeInput) modalTypeInput.value = 'expense'; if(modalCategoryInput) updateCategoryDropdowns(modalCategoryInput, 'expense'); if(modalPaymentMethodInput){Array.from(modalPaymentMethodInput.options).forEach(opt=>{opt.disabled=false; if(opt.value==='pix')opt.textContent='Pix'; else if(opt.value==='cash')opt.textContent='Dinheiro'; else if(opt.value==='card')opt.textContent='Conta/Cartão'; else if(opt.value==='')opt.textContent='--Selecione--'}); modalPaymentMethodInput.value='pix';} if(modalOriginatingBillIdInput) modalOriginatingBillIdInput.value=''; Object.values({modalDateInput, modalItemInput, modalAmountInput, modalDescriptionInput, modalTypeInput, modalCategoryInput, modalPaymentMethodInput}).forEach(inp => {if(inp){inp.readOnly = false; inp.disabled = false;}}); if(modalCategoryInput) modalCategoryInput.required = true; if(modalPaymentMethodInput) modalPaymentMethodInput.required = true; const descLabel = modalDescriptionInput?.previousElementSibling; if(descLabel?.tagName === 'LABEL') descLabel.textContent = 'Descrição Adicional (Opcional):'; const typeCont = modalTypeInput?.closest('.form-group'); if(typeCont) typeCont.style.display = ''; } if (id === 'editModal' && editForm) editForm.reset(); if (id === 'goalModal' && goalForm) { /* ... reset goal form ... */ goalForm.reset(); if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } const rmBtn = goalModal?.querySelector('.remove-image-btn'); if(rmBtn) rmBtn.style.display = 'none'; if(goalImageInput) goalImageInput.value = ''; if(goalDateInput) goalDateInput.value = getLocalDateString(); if(goalTypeInput) goalTypeInput.value = ""; const cTh = localStorage.getItem('themeColor') || 'masculine-1'; goalModal?.querySelectorAll('.theme-color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === cTh)); } if (id === 'scheduledPaymentModal' && scheduledPaymentForm) { /* ... reset scheduled form ... */ scheduledPaymentForm.reset(); if(scheduledDateInput) scheduledDateInput.value = getLocalDateString(); if(scheduledCategoryInput) updateCategoryDropdowns(scheduledCategoryInput, 'scheduled'); if(scheduledPaymentMethodInput) scheduledPaymentMethodInput.value = 'pix'; if(scheduledAutoDebitInput) scheduledAutoDebitInput.checked = false; handleScheduledCategoryChange(); } if (id === 'scheduledWarningModal' && el.querySelector('#dontShowWarningAgain')) { const chk = el.querySelector('#dontShowWarningAgain'); if(chk) chk.checked = false; } if (id === 'transactionDetailModal') { /* ... reset detail modal ... */ ['detailId','detailDate','detailType','detailAmount','detailItem','detailCategory','detailPaymentMethod','detailOrigin','detailDescription'].forEach(fid=>{const s=safeGetElementById(fid);if(s)s.innerHTML='-';}); ['descriptionContainer','originContainer'].forEach(cid=>{const c=safeGetElementById(cid);if(c)c.style.display='none';}); } if (id === 'noteReaderModal') { if (noteReaderTitle) noteReaderTitle.textContent = ''; if (noteReaderContent) { noteReaderContent.innerHTML = ''; noteReaderContent.removeEventListener('change', handleReaderCheckboxChange); } noteReaderModal.removeAttribute('data-current-note-id'); } if (id === 'quickNotesModal' && quickNotesList) quickNotesList.innerHTML = '';
         // Reset específico da calculadora de economia (não é estritamente necessário limpar ao fechar, pois limpamos ao abrir, mas pode ser adicionado se preferir)
         // if (id === 'economyCalculatorModal') { clearComparisonForm(); }
        updatePlaceholders();
    }
    function openAddTransactionModal() { /* ... */ currentEditIndex = null; if (!transactionModal || !transactionModalForm) return; closeModal(transactionModal); openModal(transactionModal); const title = transactionModal.querySelector('.modal-title'); if (title) title.textContent = 'Adicionar Transação'; }
    function openEditModal(index) { /* ... */ if (index === null || !transactions[index] || !editModal || !editForm) return showAlert("Erro.", 'danger'); const t = transactions[index]; if (t.isScheduled) return showAlert(`Tx agend. não editável.`, 'warning'); currentEditIndex = index; editForm.reset(); if(editDateInput) editDateInput.value=t.date; if(editItemInput) editItemInput.value=t.item; if(editAmountInput) editAmountInput.value=t.amount.toFixed(2); if(editTypeInput) editTypeInput.value=t.type; if(editCategoryInput) updateCategoryDropdowns(editCategoryInput, t.type); if(editCategoryInput) editCategoryInput.value=t.category; if(editPaymentMethodInput) editPaymentMethodInput.value=t.paymentMethod; if(editDescriptionInput) editDescriptionInput.value=t.description||''; const mTitle = editModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = 'Editar Transação Manual'; updatePlaceholders(); openModal(editModal); }
    function openAddGoalModal() { /* ... */ currentEditIndex = null; if (!goalModal || !goalForm) return; goalForm.reset(); if (goalDateInput) goalDateInput.value = getLocalDateString(); if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } const rmBtn = goalModal?.querySelector('.remove-image-btn'); if (rmBtn) rmBtn.style.display = 'none'; if(goalImageInput) goalImageInput.value = ''; const cTh = localStorage.getItem('themeColor') || 'masculine-1'; goalModal.querySelectorAll('.theme-color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === cTh)); if(goalTypeInput) goalTypeInput.value = ""; const mTitle = goalModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = 'Nova Meta'; updatePlaceholders(); openModal(goalModal); }
    function openEditGoalModal(index) { /* ... */ if (index === null || !goals[index] || !goalModal || !goalForm) return showAlert("Erro.", 'danger'); const g = goals[index]; currentEditIndex = index; goalForm.reset(); if (goalNameInput) goalNameInput.value = g.name; if (goalTargetInput) goalTargetInput.value = g.target.toFixed(2); if (goalDateInput) goalDateInput.value = g.date; if (goalTypeInput) goalTypeInput.value = g.type || 'other'; if (monthlyContributionInput) monthlyContributionInput.value = g.monthlyContribution ? g.monthlyContribution.toFixed(2) : ''; const rmBtn = goalModal?.querySelector('.remove-image-btn'); if (g.image && goalImagePreview) { goalImagePreview.src = g.image; goalImagePreview.style.display = 'block'; if (rmBtn) rmBtn.style.display = 'inline-block'; } else { if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } if (rmBtn) rmBtn.style.display = 'none'; } if(goalImageInput) goalImageInput.value = ''; const thSel = g.themeColor || localStorage.getItem('themeColor') || 'masculine-1'; goalModal.querySelectorAll('.theme-color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === thSel)); const mTitle = goalModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = 'Editar Meta'; updatePlaceholders(); openModal(goalModal); }
    function removeImageHandler(event) { /* ... */ event.preventDefault(); event.stopPropagation(); if (goalImageInput) goalImageInput.value = ''; if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } if (removeGoalImageBtn) removeGoalImageBtn.style.display = 'none'; }
    function openScheduledPaymentModal() { /* ... */ if (!scheduledPaymentModal || !scheduledPaymentForm) return showAlert("Erro.", 'danger'); currentEditIndex = null; scheduledPaymentForm.reset(); if (scheduledDateInput) scheduledDateInput.value = getLocalDateString(); if (scheduledCategoryInput) updateCategoryDropdowns(scheduledCategoryInput, 'scheduled'); else return showAlert("Erro Categoria.", 'danger'); if (scheduledPaymentMethodInput) scheduledPaymentMethodInput.value = 'pix'; if (scheduledAutoDebitInput) scheduledAutoDebitInput.checked = false; handleScheduledCategoryChange(); updatePlaceholders(); openModal(scheduledPaymentModal); }
    function openManualPaymentForBill(billId){ /* ... */ const bIdx=upcomingBills.findIndex(b=>String(b.id)===String(billId)); if(bIdx===-1||!upcomingBills[bIdx])return showAlert(`Erro: Agend. ID ${billId} ñ encontrado.`, 'danger'); const b=upcomingBills[bIdx]; if (b.paid)return showAlert(`"${escapeHtml(b.name)}" já pago.`, 'info'); if (b.autoDebit&&!b.insufficientBalance)return showAlert(`"${escapeHtml(b.name)}" déb.auto OK.`, 'info'); const today=getLocalDateString(); const isOver=b.date<today; if (!b.insufficientBalance && !b.pending && !(isOver && !b.autoDebit)) return showAlert(`Ação ñ disponível p/ "${escapeHtml(b.name)}".`, 'info'); if(!transactionModal||!transactionModalForm||!modalDateInput||!modalItemInput||!modalAmountInput||!modalTypeInput||!modalCategoryInput||!modalPaymentMethodInput||!modalDescriptionInput||!modalOriginatingBillIdInput)return showAlert("Erro interno.", 'danger'); closeModal(transactionModal); if(modalDateInput){modalDateInput.value=getLocalDateString(); modalDateInput.readOnly=true;} if(modalItemInput){modalItemInput.value=`Pag. Manual Agend.: ${b.name}`; modalItemInput.readOnly=true;} if(modalAmountInput){modalAmountInput.value=b.amount.toFixed(2); modalAmountInput.readOnly=true;} if(modalDescriptionInput){ let dTxt=`Conf pag. manual Agend ID ${bId} ("${escapeHtml(b.name)}", Venc: ${formatDisplayDate(b.date)}). `; if(b.insufficientBalance) dTxt+=`Método original (${b.paymentMethod.toUpperCase()}) falhou. `; if(isOver) dTxt+=`Realizado pós-venc. `; dTxt+=`Selecione método usado.`; modalDescriptionInput.value=dTxt; modalDescriptionInput.readOnly=true; const dLbl=modalDescriptionInput.previousElementSibling; if(dLbl?.tagName==='LABEL')dLbl.textContent='Descrição (Automática):';} const tyCont=modalTypeInput?.closest('.form-group'); if(tyCont)tyCont.style.display='none'; if(modalTypeInput)modalTypeInput.value='expense'; let txCat=scheduleToTransactionCategoryMap[b.category]||(categories.expense.includes(b.category)?b.category:'Faturas'); if(modalCategoryInput){updateCategoryDropdowns(modalCategoryInput, 'expense'); modalCategoryInput.value=txCat; modalCategoryInput.disabled=true;} if(modalPaymentMethodInput) { modalPaymentMethodInput.disabled=false; modalPaymentMethodInput.value=''; modalPaymentMethodInput.required=true; Array.from(modalPaymentMethodInput.options).forEach(opt=>{opt.disabled=!['pix','cash','card',''].includes(opt.value); if(opt.value==='pix')opt.textContent='Pix';else if(opt.value==='cash')opt.textContent='Dinheiro';else if(opt.value==='card')opt.textContent='Conta/Cartão';}); if(b.category==='Fatura do cartão'){const cOpt=modalPaymentMethodInput.querySelector('option[value="card"]'); if(cOpt){cOpt.disabled=true;cOpt.textContent='Conta/Cartão (Inválido)';}}} if(modalOriginatingBillIdInput){modalOriginatingBillIdInput.value=b.id;} const mTitle=transactionModal.querySelector('.modal-title'); if(mTitle)mTitle.textContent=`Confirmar Pgto: ${escapeHtml(b.name)}`; updatePlaceholders(); openModal(transactionModal); let aMsg=`Confirme pag. manual: <strong>"${escapeHtml(b.name)}" (${formatCurrency(b.amount)})</strong>.<br>`; if(b.insufficientBalance)aMsg+=`Método original (${b.paymentMethod.toUpperCase()}) falhou. `; if(isOver)aMsg+=`Estava vencido. `; aMsg+=`Selecione <strong>MÉTODO REAL</strong> e Salve.`; showAlert(aMsg, b.insufficientBalance || isOver ? 'warning' : 'info'); }
    function handleScheduledCategoryChange(){ /* ... */ const cS=scheduledCategoryInput; const mS=scheduledPaymentMethodInput; const hlp=document.getElementById('scheduledMethodHelp'); if(!cS||!mS)return; const selC=cS.value; const mOpts=mS.options; const curM=mS.value; let fE=''; Array.from(mOpts).forEach(o=>{const v=o.value; if(v==='pix'||v==='cash'||v==='card'){o.disabled=false;o.style.cssText='';o.textContent=v[0].toUpperCase()+v.slice(1); if(!fE)fE=v;} else if(v!==''&&v!==mS.options[0].value){o.disabled=true;o.style.display='none';}}); if(selC==='Fatura do cartão'){const cOpt=mS.querySelector('option[value="card"]'); if(cOpt){cOpt.disabled=true;cOpt.style.color='var(--text-muted)'; cOpt.textContent='Cartão (Inválido)';} if(curM==='card')mS.value=fE||''; if(hlp)hlp.textContent="Fatura paga c/ Pix ou Dinheiro.";}else{const cOpt=mS.querySelector('option[value="card"]'); if(cOpt)cOpt.textContent='Conta/Cartão'; if(hlp)hlp.textContent="Método a ser usado.";}}

    // --- Funções de Notas (Novas e Modificadas) ---
    function openAddNoteModal() { /* ... */ currentEditingNoteId = null; if (!noteModal || !noteForm) return; closeModal(noteModal); if (noteForm) noteForm.reset(); if (noteIdInput) noteIdInput.value = ''; if (noteTypeSelect) noteTypeSelect.value = 'note'; if (noteModalTitle) noteModalTitle.textContent = "Nova Nota"; if (noteColorOptionsContainer) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected')); noteColorOptionsContainer.querySelector('[data-color="default"]')?.classList.add('selected'); } if (noteContentInput) noteContentInput.addEventListener('keydown', handleNoteContentKeyDown); openModal(noteModal); }
    function openEditNoteModal(noteId) { /* ... */ const note = notes.find(n => String(n.id) === String(noteId)); if (!note || !noteModal || !noteForm) return showAlert("Erro.", 'danger'); currentEditingNoteId = noteId; closeModal(noteModal); if (noteForm) noteForm.reset(); if (noteIdInput) noteIdInput.value = note.id; if (noteTypeSelect) noteTypeSelect.value = note.type || 'note'; if (noteTitleInput) noteTitleInput.value = note.title || ''; if (noteContentInput) noteContentInput.value = note.content || ''; if (noteReminderDateInput) noteReminderDateInput.value = note.reminderDate || ''; if (noteReminderTimeInput) noteReminderTimeInput.value = note.reminderTime || ''; if (noteModalTitle) noteModalTitle.textContent = `Editar ${note.type === 'task' ? 'Tarefa' : 'Nota'}`; if (noteColorOptionsContainer) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === note.color)); if (!noteColorOptionsContainer.querySelector('.selected')) noteColorOptionsContainer.querySelector('[data-color="default"]')?.classList.add('selected'); } if (noteContentInput) noteContentInput.addEventListener('keydown', handleNoteContentKeyDown); openModal(noteModal); }
    function handleNoteContentKeyDown(event) { /* ... */ if (event.key !== 'Enter' || !noteModal.classList.contains('active')) return; const cType = noteTypeSelect?.value; if (cType !== 'task') return; const txt = event.target; const pos = txt.selectionStart; const val = txt.value; const bef = val.substring(0, pos); const lines = bef.split('\n'); const cLine = lines[lines.length - 1]; const trimLine = cLine.trimStart(); const isChk = trimLine.startsWith(PENDING_CHECKLIST) || trimLine.startsWith(COMPLETED_CHECKLIST); if (isChk) { event.preventDefault(); const aft = val.substring(pos); const newV = bef + '\n' + PENDING_CHECKLIST + aft; txt.value = newV; const newP = pos + 1 + PENDING_CHECKLIST.length; txt.setSelectionRange(newP, newP); txt.scrollTop = txt.scrollHeight; } }
    function openQuickNotesPopup() { /* ... */ if (!quickNotesModal || !quickNotesList) return; quickNotesList.innerHTML = '<p class="text-center text-muted small my-3">Carregando...</p>'; openModal(quickNotesModal); setTimeout(() => renderQuickNotesPopupContent(), 50); }
    function renderQuickNotesPopupContent() { // MODIFICADA (Usa generateQuickNotePreviewHtml)
         if (!quickNotesList) return; quickNotesList.innerHTML = '';
         const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
         if (sortedNotes.length === 0) { quickNotesList.innerHTML = '<p class="text-center text-muted small my-3">Nenhuma nota.</p>'; return; }
         sortedNotes.forEach(note => {
             const div = document.createElement('div'); div.className = `quick-note-item note-color-${note.color || 'default'} note-type-${note.type}`; div.dataset.noteId = note.id;
             const previewHtml = generateQuickNotePreviewHtml(note.content, note.type); // Usa helper
             const typeIcon = note.type === 'task' ? '<i class="fas fa-clipboard-list fa-fw text-muted me-1" title="Tarefa"></i>' : '';
             const reminderIcon = note.reminderDate ? `<span title="${formatDisplayDateTime(note.reminderDate, note.reminderTime)}"><i class="far fa-bell${note.reminderTriggered ? '' : ' text-warning'}"></i></span>` : '';
             const taskCountIcon = note.type === 'task' && note.totalTasks > 0 ? `<span title="${note.completedTasks}/${note.totalTasks} concluídas"><i class="fas fa-tasks"></i> ${note.completedTasks}/${note.totalTasks}</span>` : '';
             div.innerHTML = ` ${note.title ? `<div class="quick-note-title">${typeIcon}${escapeHtml(note.title)}</div>` : `<div class="quick-note-title text-muted fst-italic">${typeIcon}(Sem Título)</div>`} <div class="quick-note-content-preview">${previewHtml}</div> <div class="quick-note-footer"> <span><i class="far fa-calendar-alt"></i> ${formatDisplayDate(note.updatedAt.substring(0,10))}</span> <div class="quick-note-icons">${reminderIcon} ${taskCountIcon}</div> </div>`;
             div.addEventListener('click', () => openNoteReaderModal(note.id)); quickNotesList.appendChild(div);
         });
    }
    function generateQuickNotePreviewHtml(content, noteType, maxLines = 3) { // Helper para preview QuickNotes
        if (!content) return ''; const lines = content.split('\n'); const linesToProc = lines.slice(0, maxLines); let pHtml = '';
        linesToProc.forEach(line => { const tLine = line.trimStart(); let lHtml = '';
            if (noteType === 'task' && tLine.startsWith(PENDING_CHECKLIST)) { const rLine = line.substring(line.indexOf(PENDING_CHECKLIST) + PENDING_CHECKLIST.length); lHtml = `<div class="quick-preview-task-line"><input type="checkbox" disabled> ${escapeHtml(rLine)}</div>`; }
            else if (noteType === 'task' && tLine.startsWith(COMPLETED_CHECKLIST)) { const rLine = line.substring(line.indexOf(COMPLETED_CHECKLIST) + COMPLETED_CHECKLIST.length); lHtml = `<div class="quick-preview-task-line"><input type="checkbox" checked disabled> <span class="completed-text">${escapeHtml(rLine)}</span></div>`; }
            else { lHtml = `<div class="quick-preview-normal-line">${escapeHtml(line)}</div>`; } pHtml += lHtml;
        });
        if (lines.length > maxLines) pHtml += '<div class="ellipsis">...</div>'; return pHtml;
    }
    function openNoteReaderModal(noteId) { /* ... */ const note = notes.find(n => String(n.id) === String(noteId)); if (!note || !noteReaderModal || !noteReaderTitle || !noteReaderContent) return; if (quickNotesModal?.classList.contains('active')) closeModal(quickNotesModal); noteReaderTitle.textContent = note.title || "(Sem Título)"; const typeSpan = document.createElement('span'); typeSpan.className = `badge rounded-pill ms-2 ${note.type === 'task' ? 'bg-primary' : 'bg-secondary'}`; typeSpan.textContent = note.type === 'task' ? 'Tarefa' : 'Nota'; noteReaderTitle.appendChild(typeSpan); noteReaderModal.dataset.currentNoteId = note.id; updateNoteReaderContent(note.id); openModal(noteReaderModal); }
    function updateNoteReaderContent(noteId) { // MODIFICADA
         const note = notes.find(n => String(n.id) === String(noteId)); if (!note || !noteReaderContent) return;
         noteReaderContent.removeEventListener('change', handleReaderCheckboxChange); // Remove listener CHANGE antigo
         const processedContentHtml = processNoteContentForDisplay(note.content || '', note.id, true); // True = Gera Checkboxes REAIS
         noteReaderContent.innerHTML = processedContentHtml;
         if (note.type === 'task') noteReaderContent.addEventListener('change', handleReaderCheckboxChange); // Adiciona listener CHANGE novo
    }

    // --- showTransactionDetails ---
    function showTransactionDetails(transactionId) { /* ... */ const t = transactions.find(tx => String(tx.id) === String(transactionId)); const m = transactionDetailModal; if (!t || !m) return showAlert("Erro.", "warning"); const setF=(fId, iCls, cont, isH=false)=>{const el=safeGetElementById(fId);const sCId=fId==='detailDescription'?'descriptionContainer':(fId==='detailOrigin'?'originContainer':null); const sC=sCId?safeGetElementById(sCId):null; if(el){const dC=cont||cont===0?String(cont):''; const iH=iCls?`<i class="${iCls} fa-fw"></i> `:''; if(dC&&dC!=='-'){if(isH||iCls)el.innerHTML=iH+dC; else el.textContent=dC; if(sC)sC.style.display='block';}else{if(sC)sC.style.display='none'; else if(el.closest('.transaction-detail-grid'))el.innerHTML='-';}}}; m.querySelectorAll('.transaction-detail-grid span, #detailDescription, #detailOrigin').forEach(s=>{s.innerHTML='-';}); const dCont=safeGetElementById('descriptionContainer'); if(dCont)dCont.style.display='none'; const oCont=safeGetElementById('originContainer'); if(oCont)oCont.style.display='none'; setF('detailId','fas fa-hashtag',t.id,true); setF('detailDate','far fa-calendar-alt',formatDisplayDate(t.date),true); const tTxt=t.type==='income'?'Receita':'Despesa'; const tIcn=t.type==='income'?'fas fa-arrow-up text-success':'fas fa-arrow-down text-danger'; const tEl=safeGetElementById('detailType'); if(tEl)tEl.innerHTML=`<i class="${tIcn} fa-fw"></i> ${tTxt}`; const aEl=safeGetElementById('detailAmount'); if(aEl){aEl.innerHTML=`<i class="fas fa-dollar-sign fa-fw"></i> ${formatCurrency(t.amount)}`; aEl.className=t.type==='income'?'income':'expense';} setF('detailItem','fas fa-tag',t.item,true); setF('detailDescription',null,t.description?escapeHtml(t.description).replace(/\n/g,'<br>'):'',true); const cIcn=categoryIconMapping[t.category]||'fas fa-question-circle'; setF('detailCategory',`fas ${cIcn}`,t.category,true); let pTxt='N/D', pIcn='fas fa-question-circle'; switch(t.paymentMethod){case'pix':pTxt='Pix';pIcn='fas fa-qrcode';break;case'cash':pTxt='Dinheiro';pIcn='fas fa-money-bill-wave';break;case'card':pTxt='Conta/C.';pIcn='fas fa-credit-card';break;default:pTxt=t.paymentMethod||'N/D';} setF('detailPaymentMethod',pIcn,pTxt,true); let oHtml='',oTitle='Origem'; if(t.isScheduled&&t.originatingBillId){oTitle='Origem (Agendamento)'; const oBill=upcomingBills.find(b=>String(b.id)===String(t.originatingBillId)); if(oBill){oHtml=`Agend.: <strong>"${escapeHtml(oBill.name)}"</strong> (Venc: ${formatDisplayDate(oBill.date)}, Cat: ${escapeHtml(oBill.category)})<br><i>Pgto via ${t.paymentMethod.toUpperCase()} em ${formatDisplayDate(t.date)}.</i>`; if(isWithinGracePeriod(oBill.processedTimestamp)){const rT=new Date((oBill.processedTimestamp||Date.now())+GRACE_PERIOD_MS).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); oHtml+=`<br><small class="text-success">Reversível até ${rT}.</small>`;}else{oHtml+=`<br><small class="text-muted">Prazo reversão expirado.</small>`;}}else{oHtml=`Agend. ID: ${t.originatingBillId}<br><small class="text-warning">Registro agend. ñ encontrado.</small>`;} setF('detailOrigin',null,oHtml,true);}else{oTitle='Origem'; oHtml=`<i class="fas fa-keyboard fa-fw"></i> Transação Manual`; setF('detailOrigin',null,oHtml,true);} const oLbl=safeGetElementById('detailOriginLabel'); if(oLbl)oLbl.innerHTML=`<i class="fas fa-history fa-fw"></i> ${oTitle}:`; openModal(m);}

    // --- UI Navigation & Theme ---
    function toggleSidebar(){if(sidebar)sidebar.classList.toggle('open');}
    function showSection(sectionId){ /* ... */ contentSections.forEach(s=>s.classList.remove('active')); menuItems.forEach(i=>i.classList.remove('active')); const secEl=safeGetElementById(`${sectionId}-section`); const mItem=safeQuerySelector(`.menu-item[data-section="${sectionId}"]`); if(secEl){secEl.classList.add('active'); if(mItem)mItem.classList.add('active'); updatePageTitle(mItem?.querySelector('span')?.textContent||sectionId); if(sectionId==='transactions'){if(safeGetElementById('filterCategory2'))updateCategoryDropdowns(safeGetElementById('filterCategory2'), 'filter'); clearFilters();renderAllTransactions();} else if(sectionId==='scheduled'){renderAllScheduledPayments();} else if(sectionId==='goals'){renderGoals();} else if (sectionId === 'notes') { renderNotes(); } else if(sectionId==='settings'){loadSettingsValues();} updateCharts();} else {safeGetElementById('dashboard-section')?.classList.add('active'); safeQuerySelector('.menu-item[data-section="dashboard"]')?.classList.add('active'); updatePageTitle('Dashboard'); updateCharts();} if(window.innerWidth<768 && sidebar?.classList.contains('open')){toggleSidebar();}}
    function updatePageTitle(title){ /* ... */ const dt='Gestor Financeiro'; let d=title?title[0].toUpperCase()+title.slice(1):'Dashboard'; if(title?.toLowerCase()==='dashboard')d='Dashboard'; if(pageTitleElement)pageTitleElement.textContent=d; document.title=`${dt} | ${d}`; }
    function applyTheme(){ /* ... */ if(!body)return; const th=localStorage.getItem('theme')||'light'; body.setAttribute('data-theme',th); currentTheme=th; if(themeToggleIcon){const isDark=th==='dark'; themeToggleIcon.classList.toggle('fa-toggle-on',isDark); themeToggleIcon.classList.toggle('fa-toggle-off',!isDark); themeToggle?.setAttribute('title',isDark?'Tema: Claro':'Tema: Escuro'); const sun=themeToggle?.querySelector('.fa-sun'); const moon=themeToggle?.querySelector('.fa-moon'); if(sun)sun.style.display=isDark?'none':'inline-block'; if(moon)moon.style.display=isDark?'inline-block':'none';} updateChartDefaults();}
    function toggleTheme(){ /* ... */ currentTheme=body.getAttribute('data-theme')==='dark'?'light':'dark'; localStorage.setItem('theme',currentTheme); applyTheme(); updateCharts();}
    function applyThemeColor(){ /* ... */ const r=document.documentElement; if(!r)return; const p='theme-color-'; const e=Array.from(r.classList).find(c=>c.startsWith(p)); if(e)r.classList.remove(e); const s=localStorage.getItem('themeColor')||'masculine-1'; r.classList.add(`${p}${s}`); selectedThemeColor=s; updateChartDefaults(); updateCharts();}
    function updateChartDefaults(){ /* ... */ if(typeof Chart==='undefined')return; const isDark=currentTheme==='dark'; Chart.defaults.color=isDark?'rgba(255,255,255,0.7)':'#495057'; Chart.defaults.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'; Chart.defaults.plugins.legend.labels.color=Chart.defaults.color; Chart.defaults.scale.ticks.color=Chart.defaults.color; Chart.defaults.elements.bar.borderRadius=4; Chart.defaults.elements.bar.borderSkipped='start';}

    // --- Value Visibility ---
    function applyValueVisibilityIconAndClass(){ /* ... */ if(body&&valueToggleIcon){valuesHidden=localStorage.getItem('valuesHidden')==='true'; body.classList.toggle('values-hidden',valuesHidden); valueToggleIcon.classList.toggle('fa-eye-slash',valuesHidden); valueToggleIcon.classList.toggle('fa-eye',!valuesHidden); valueToggle?.setAttribute('title',valuesHidden?'Mostrar':'Ocultar'); updatePlaceholders();}}
    function toggleValueVisibility(){ /* ... */ valuesHidden=!valuesHidden; localStorage.setItem('valuesHidden',String(valuesHidden)); refreshAllUIComponents(); updateCharts();}
    function updatePlaceholders(){ /* ... */ const ph=formatPlaceholderCurrency(); [modalAmountInput, editAmountInput, scheduledAmountInput, monthlyContributionInput, comparePrice1, comparePrice2, compareQuantity1, compareQuantity2].filter(Boolean).forEach(i=>{if (i.type==='number') i.placeholder = ph; }); [initialBalancePixInput,initialBalanceCashInput,initialBalanceCardInput].filter(Boolean).forEach(i=>i.placeholder='0.00'); goalsListContainer?.querySelectorAll('.contribution-input').forEach(i=>i.placeholder=ph); [modalDescriptionInput, editDescriptionInput].filter(Boolean).forEach(t=>t.placeholder='Notas... (Opc.)'); if(safeGetElementById('searchInput2'))safeGetElementById('searchInput2').placeholder='Pesquisar...'; if (compareQuantity1 && compareQuantity1.placeholder === ph) compareQuantity1.placeholder = '500'; if (compareQuantity2 && compareQuantity2.placeholder === ph) compareQuantity2.placeholder = '1'; }

    // --- Settings Loader ---
    function loadSettingsValues(){ /* ... */ if(!settingsSection)return; if(initialBalancePixInput)initialBalancePixInput.value=initialBalances.pix.toFixed(2); if(initialBalanceCashInput)initialBalanceCashInput.value=initialBalances.cash.toFixed(2); if(initialBalanceCardInput)initialBalanceCardInput.value=initialBalances.card.toFixed(2); updateBalanceDisplays(); if(userNameInput)userNameInput.value=userName; if(userEmailInput)userEmailInput.value=userEmail; if(currencyInput)currencyInput.value=currency; const theme=localStorage.getItem('themeColor')||'masculine-1'; settingsSection.querySelectorAll('.theme-color-option').forEach(o=>o.classList.toggle('selected',o.dataset.color===theme)); if(importDataInput)importDataInput.value='';}

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        console.log("Configurando Listeners...");

        // Botões "Ver Todas" do Dashboard e "Criar" de Notas Empty State
        if(viewAllGoalsBtn) viewAllGoalsBtn.addEventListener('click', () => showSection('goals'));
        if(viewAllScheduledBtn) viewAllScheduledBtn.addEventListener('click', () => showSection('scheduled'));
        if(viewAllTransactionsBtn) viewAllTransactionsBtn.addEventListener('click', () => showSection('transactions'));
        if(createNoteFromEmptyStateBtn && addNoteBtn) {
             createNoteFromEmptyStateBtn.addEventListener('click', () => addNoteBtn.click()); // Simula clique no botão principal
        }

        // === Calculadora de Economia Listeners ===
        if (openEconomyCalculatorBtn) {
            openEconomyCalculatorBtn.addEventListener('click', () => {
                clearComparisonForm(); // Limpa ao abrir
                openModal(economyCalculatorModal);
            });
        }
        if (calculateComparisonBtn) {
            calculateComparisonBtn.addEventListener('click', handleComparisonCalculation);
        }
        if (clearComparisonBtn) {
            clearComparisonBtn.addEventListener('click', clearComparisonForm);
        }
        // === Fim Calculadora Listeners ===


        // Sidebar, Theme, Values
        if(menuToggle) menuToggle.addEventListener('click', toggleSidebar);
        if(closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
        if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
        if(valueToggle) valueToggle.addEventListener('click', toggleValueVisibility);
        menuItems.forEach(item => item.addEventListener('click', (e) => {
            const s = e.currentTarget.dataset.section || e.currentTarget.closest('.menu-item')?.dataset.section;
            if(s) showSection(s);
        }));

        // FAB, Add Btns
        if(addTransactionFab) addTransactionFab.addEventListener('click', openAddTransactionModal);
        if(addScheduledPaymentBtn) addScheduledPaymentBtn.addEventListener('click', openScheduledPaymentModal);
        if(addScheduledFromListBtn) addScheduledFromListBtn.addEventListener('click', openScheduledPaymentModal);
        addGoalBtns.forEach(b => b?.addEventListener('click', openAddGoalModal));

        // Modals Close
        document.querySelectorAll('.modal-overlay').forEach(ov => {
            ov.addEventListener('click', (e) => {
                const t = e.target;
                if (t === ov || t.classList.contains('modal-close') || t.closest('.modal-close')) {
                    if (ov.id === 'scheduledWarningModal' && t === ov) return;
                    if (ov.id === 'noteReaderModal' && !(t.id === 'closeNoteReaderBtn' || t.closest('#closeNoteReaderBtn'))) return;
                    closeModal(ov);
                }
            });
        });
        if(alertModal && confirmAlert) confirmAlert.onclick = () => closeModal(alertModal);
        const cdBtn = confirmModal?.querySelector('#cancelDelete');
        if (cdBtn) cdBtn.onclick = () => closeModal(confirmModal);

        // Forms Submit
        if(transactionModalForm) transactionModalForm.addEventListener('submit', addTransactionFromModal);
        if(editForm) editForm.addEventListener('submit', (e) => { e.preventDefault(); saveEditedTransaction(); });
        if(goalForm) goalForm.addEventListener('submit', saveGoal);
        if(scheduledPaymentForm) scheduledPaymentForm.addEventListener('submit', saveScheduledPayment);
        if(noteForm) noteForm.addEventListener('submit', saveNote);

        // Settings & Controls
        if(saveInitialBalancesBtn) saveInitialBalancesBtn.addEventListener('click', saveSettings);
        if(saveUserSettingsBtn) saveUserSettingsBtn.addEventListener('click', saveUserSettings);
        if(modalTypeInput && modalCategoryInput) modalTypeInput.addEventListener('change', () => updateCategoryDropdowns(modalCategoryInput, modalTypeInput.value || 'expense'));
        if(editTypeInput && editCategoryInput) editTypeInput.addEventListener('change', () => updateCategoryDropdowns(editCategoryInput, editTypeInput.value || 'expense'));
        if(scheduledCategoryInput) scheduledCategoryInput.addEventListener('change', handleScheduledCategoryChange);
        if(goalImageInput && goalImagePreview) { goalImageInput.addEventListener('change', (e) => { /*...*/ const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => { if (ev.target?.result && goalImagePreview instanceof HTMLImageElement) { goalImagePreview.src = ev.target.result.toString(); goalImagePreview.style.display = 'block'; const rm = goalImagePreview.closest('.image-upload-container')?.querySelector('.remove-image-btn'); if (rm instanceof HTMLElement) rm.style.display = 'inline-block'; } }; r.readAsDataURL(f); } }); }
        if(removeGoalImageBtn) removeGoalImageBtn.addEventListener('click', removeImageHandler);
        if(settingsSection) settingsSection.addEventListener('click', (e) => { const tO = e.target.closest('.theme-color-option'); if (tO?.dataset.color) { settingsSection.querySelectorAll('.theme-color-option').forEach(o => o.classList.remove('selected')); tO.classList.add('selected'); } const bAB = e.target.closest('.balance-adjust'); if (bAB?.dataset.method && bAB?.dataset.amount) { const m = bAB.dataset.method; const a = parseFloat(bAB.dataset.amount); if (!isNaN(a)) adjustBalance(m, a); } });
        if(exportDataBtn) exportDataBtn.addEventListener('click', exportData);
        if(importDataBtn && importDataInput) importDataBtn.addEventListener('click', () => importDataInput.click());
        if(importDataInput) importDataInput.addEventListener('change', handleFileImport);

        // Filters
        [safeGetElementById('filterType2'), safeGetElementById('filterCategory2'), safeGetElementById('filterPayment2')].filter(Boolean).forEach(el => el.addEventListener('change', filterTransactions));
        const sIn = safeGetElementById('searchInput2');
        if(sIn) sIn.addEventListener('input', debounce(filterTransactions, 300));
        const cF = safeGetElementById('clearFilters2');
        if(cF) cF.addEventListener('click', clearFilters);

        // List Item Actions (Delegation)
        if(allTransactionsContainer) { allTransactionsContainer.addEventListener('click', (e) => { const item = e.target.closest('.transaction-item'); if (!item?.dataset?.id) return; const txId = item.dataset.id; const txIndex = transactions.findIndex(t => String(t.id) === String(txId)); if (txIndex === -1) return; const editBtn = e.target.closest('.edit-transaction'); const delBtn = e.target.closest('.delete-transaction'); if (editBtn && !transactions[txIndex].isScheduled) { e.stopPropagation(); openEditModal(txIndex); } else if (delBtn) { e.stopPropagation(); currentEditIndex = txIndex; confirmDeleteTransaction(); } else if (editBtn && transactions[txIndex].isScheduled) { e.stopPropagation(); showAlert('Tx agend. não editável.', 'warning'); } else if (!editBtn && !delBtn) { showTransactionDetails(txId); } }); }
        if(goalsListContainer) { goalsListContainer.addEventListener('click', (e) => { const t = e.target; const item = t.closest('.goal-item'); const id = item?.dataset.id; if (!item || !id) return; const idx = goals.findIndex(g => String(g.id) === String(id)); if (idx === -1) return; const addBtn = t.closest('.add-contribution-btn'); const editBtn = t.closest('.edit-goal'); const delBtn = t.closest('.delete-goal'); const compBtn = t.closest('.complete-goal-btn'); if (editBtn) { e.stopPropagation(); openEditGoalModal(idx); } else if (delBtn) { e.stopPropagation(); deleteGoal(idx); } else if (compBtn) { e.stopPropagation(); completeGoal(idx); } else if (addBtn) { e.stopPropagation(); const inp = item.querySelector('.contribution-input'); if (inp instanceof HTMLInputElement) addContribution(idx, inp.value); } }); }
        const billActHandler = (e) => { const btn = e.target.closest('.action-btn, .manual-pay-btn'); if (!btn) return; const item = btn.closest('.bill-item'); const bId = item?.dataset?.id; if (!item || !bId) return; const bIdx = upcomingBills.findIndex(b => String(b.id) === String(bId)); if (bIdx === -1) return; e.stopPropagation(); if (btn.classList.contains('delete-scheduled-item-btn')) { deleteScheduledItem(bIdx); } else if (btn.classList.contains('manual-pay-btn')) { openManualPaymentForBill(bId); } }; if(upcomingBillsContainer) upcomingBillsContainer.addEventListener('click', billActHandler); if(allScheduledPaymentsListContainer) allScheduledPaymentsListContainer.addEventListener('click', billActHandler);

        // --- Notas Listeners ---
        if(addNoteBtn) addNoteBtn.addEventListener('click', openAddNoteModal);
        if(viewAllNotesBtn) viewAllNotesBtn.addEventListener('click', () => openModal(viewAllNotesModal)); // Abre o modal de Todas as Notas
        if(quickViewNotesBtn) quickViewNotesBtn.addEventListener('click', openQuickNotesPopup);

        if(notesListContainer) {
            notesListContainer.addEventListener('click', (e) => {
                const t = e.target;
                const card = t.closest('.note-card');
                const id = card?.dataset.noteId;
                if (!id) return;
                if (t.closest('.edit-note')) {
                    e.stopPropagation();
                    openEditNoteModal(id);
                } else if (t.closest('.delete-note')) {
                    e.stopPropagation();
                    confirmDeleteNote(id);
                } else {
                    openNoteReaderModal(id);
                }
            });
        }

        if(viewAllNotesList) { // Listener para cards dentro do Modal "Todas as Notas"
            viewAllNotesList.addEventListener('click', (e) => {
                 const t = e.target;
                 const card = t.closest('.note-card');
                 const id = card?.dataset.noteId;
                 if (!id) return;
                 if (t.closest('.edit-note')) {
                     e.stopPropagation();
                     closeModal(viewAllNotesModal);
                     openEditNoteModal(id);
                 } else if (t.closest('.delete-note')) {
                     e.stopPropagation();
                     confirmDeleteNote(id).then(() => {
                         if(viewAllNotesModal.classList.contains('active')) {
                             renderNotes(); // Atualiza lista no modal
                         }
                     });
                 } else {
                     closeModal(viewAllNotesModal);
                     openNoteReaderModal(id);
                 }
            });
        }

        if(noteColorOptionsContainer) { noteColorOptionsContainer.addEventListener('click', (e) => { const t = e.target.closest('.color-option'); if (t?.dataset.color) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected')); t.classList.add('selected'); } }); }
        if(closeNoteReaderBtn) closeNoteReaderBtn.addEventListener('click', () => closeModal(noteReaderModal));

        console.log("Listeners Configurados.");
    }

    // --- Filtering Logic ---
    function filterTransactions() { /* ... */ const ty=safeGetElementById('filterType2')?.value||'all'; const ca=safeGetElementById('filterCategory2')?.value||'all'; const pa=safeGetElementById('filterPayment2')?.value||'all'; const se=(safeGetElementById('searchInput2')?.value||'').toLowerCase().trim(); const filt=transactions.filter(t=>(ty==='all'||t.type===ty)&&(ca==='all'||t.category===ca)&&(pa==='all'||t.paymentMethod===pa)&&(se===''||t.item.toLowerCase().includes(se)||t.category.toLowerCase().includes(se)||(t.description&&t.description.toLowerCase().includes(se)))); renderAllTransactions(filt);}
    function clearFilters() { /* ... */ const t=safeGetElementById('filterType2'); if(t)t.value='all'; const c=safeGetElementById('filterCategory2'); if(c)c.value='all'; const p=safeGetElementById('filterPayment2'); if(p)p.value='all'; const s=safeGetElementById('searchInput2'); if(s)s.value=''; filterTransactions();}
    function debounce(func, wait) { /* ... */ let t; return function(...a){ clearTimeout(t); t=setTimeout(()=>{func.apply(this,a);}, wait);};}

    // --- Charting Functions ---
    const incomeExpenseColors={income:'rgba(25, 135, 84, 0.7)',expense:'rgba(220, 53, 69, 0.7)',incomeBorder:'rgb(25, 135, 84)',expenseBorder:'rgb(220, 53, 69)'};
    function updateCharts() { /* ... */ if (typeof Chart === 'undefined') return; [expensesChart, incomeVsExpensesChart, paymentMethodsChart, expensesChart2, incomeVsExpensesChart2, paymentMethodsChart2, monthlyHistoryChart].forEach(ch => ch?.destroy?.()); const expByCat = {}, payMethUseExpense = { pix: 0, cash: 0, card: 0 }, monthData = {}; let totInc = 0, totExp = 0; transactions.forEach(t => { if (!t?.category || t.category.startsWith('--') || isNaN(t.amount)) return; const mY = t.date.substring(0, 7); if (!monthData[mY]) monthData[mY] = { income: 0, expense: 0 }; if (t.type === 'expense') { totExp += t.amount; expByCat[t.category] = (expByCat[t.category] || 0) + t.amount; if (payMethUseExpense.hasOwnProperty(t.paymentMethod)) payMethUseExpense[t.paymentMethod] += t.amount; monthData[mY].expense += t.amount; } else { totInc += t.amount; monthData[mY].income += t.amount; } }); const formatLabel=(ctx,vPath='parsed')=>{const l=ctx.label||''; const v=vPath==='parsed.x'?ctx.parsed?.x:(vPath==='parsed.y'?ctx.parsed?.y:ctx.parsed)||0; if(valuesHidden)return `${l}: R$ ***`; const ds=ctx.dataset; let pct=''; if((ctx.chart.config.type==='pie'||ctx.chart.config.type==='doughnut')&&ds.data?.length>0){const tot=ds.data.reduce((a,b)=>a+(typeof b==='number'?b:0),0); pct=tot>0?` (${(v/tot*100).toFixed(0)}%)`:'';} return `${l}: ${formatCurrency(v)}${pct}`;}; const chartOptsBase={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:10,font:{size:10}}},tooltip:{callbacks:{label:(ctx)=>formatLabel(ctx,ctx.chart.config.type==='bar'&&ctx.chart.config.options?.indexAxis==='y'?'parsed.x':'parsed.y')}}}}; const pieTT={callbacks:{label:ctx=>formatLabel(ctx)}}; const hBarTT={callbacks:{label:ctx=>formatLabel(ctx,'parsed.x')}}; const barTT={callbacks:{label:ctx=>formatLabel(ctx,'parsed.y')}}; const dClr=getComputedStyle(document.documentElement).getPropertyValue('--primary-color')?.trim()||'#3a86ff'; const eClrs=[dClr,'#6f42c1','#d63384','#dc3545','#fd7e14','#ffc107','#198754','#20c997','#0dcaf0','#adb5bd'].slice(0,10); const pClrs={pix:'#0dcaf0',cash:'#fd7e14',card:'#6f42c1',other:'#adb5bd'}; const manageC=(ctx,hasD,msg="Sem dados")=>{if(!ctx?.canvas?.parentElement)return; const p=ctx.canvas.parentElement; p.querySelectorAll('.chart-empty-message').forEach(e=>e.remove()); if(hasD){if(ctx.canvas)ctx.canvas.style.display='block';}else{if(ctx.canvas)ctx.canvas.style.display='none'; const m=document.createElement('p'); m.className='chart-empty-message text-center text-muted p-3'; m.innerHTML=`<i class="fas fa-chart-pie fa-2x mb-2 d-block"></i> ${msg}`; p.appendChild(m);}}; const expL=Object.keys(expByCat).filter(cat=>expByCat[cat]>0).sort((a,b)=>expByCat[b]-expByCat[a]); [expChartCtx,expChartCtx2].filter(Boolean).forEach((ctx,i)=>{manageC(ctx,expL.length>0,"Nenhuma despesa"); if(expL.length>0){const cfg={type:'doughnut',data:{labels:expL,datasets:[{data:expL.map(l=>expByCat[l]),backgroundColor:expL.map((_,ix)=>eClrs[ix%eClrs.length]),borderColor:currentTheme==='dark'?'var(--bg-color)':'#fff',borderWidth:2}]},options:{...chartOptsBase,cutout:'60%',plugins:{...chartOptsBase.plugins,tooltip:pieTT}}}; try{if(i==0)expensesChart=new Chart(ctx, cfg); else expensesChart2=new Chart(ctx, cfg);}catch(e){console.error(`Err Chart Exp ${i}:`,e);manageC(ctx,false);}}}); [incExpChartCtx,incExpChartCtx2].filter(Boolean).forEach((ctx,i)=>{manageC(ctx,totInc>0||totExp>0,"Sem Rec/Desp"); if(totInc>0||totExp>0){const cfg={type:'bar',data:{labels:['Receitas','Despesas'],datasets:[{data:[totInc,totExp],backgroundColor:[incomeExpenseColors.income,incomeExpenseColors.expense],borderColor:[incomeExpenseColors.incomeBorder,incomeExpenseColors.expenseBorder],borderWidth:1}]},options:{...chartOptsBase,indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{callback:v=>formatCurrency(v)},grid:{color:Chart.defaults.borderColor}},y:{grid:{display:false}}},plugins:{...chartOptsBase.plugins,legend:{display:false},tooltip:hBarTT}}}; try{if(i==0)incomeVsExpensesChart=new Chart(ctx, cfg); else incomeVsExpensesChart2=new Chart(ctx, cfg);}catch(e){console.error(`Err Chart IncExp ${i}:`,e);manageC(ctx,false);}}}); const payL=Object.keys(payMethUseExpense).filter(m=>payMethUseExpense[m]>0); [payMethChartCtx,payMethChartCtx2].filter(Boolean).forEach((ctx,i)=>{manageC(ctx,payL.length>0,"Métodos ñ usados"); if(payL.length>0){const l=payL.map(m=>m==='pix'?'Pix':(m==='cash'?'Dinheiro':'Conta/C.')); const cfg={type:'pie',data:{labels:l,datasets:[{data:payL.map(m=>payMethUseExpense[m]),backgroundColor:payL.map(m=>pClrs[m]||pClrs.other),borderColor:currentTheme==='dark'?'var(--bg-color)':'#fff',borderWidth:2}]},options:{...chartOptsBase,plugins:{...chartOptsBase.plugins,tooltip:pieTT}}}; try{if(i==0)paymentMethodsChart=new Chart(ctx, cfg); else paymentMethodsChart2=new Chart(ctx, cfg);}catch(e){console.error(`Err Chart PayM ${i}:`,e);manageC(ctx,false);}}}); updateCashFlowReport(monthData); }
    function updateCashFlowReport(monthlyData){ /* ... */ if(monthlyHistoryChart?.destroy)monthlyHistoryChart.destroy(); if(!monHistChartCtx||typeof Chart==='undefined')return; const parent=monHistChartCtx.canvas.parentElement; const manageC=(hasD,msg="Sem histórico")=>{if(!parent)return; parent.querySelectorAll('.chart-empty-message').forEach(e=>e.remove()); if(hasD){if(monHistChartCtx.canvas)monHistChartCtx.canvas.style.display='block';} else {if(monHistChartCtx.canvas)monHistChartCtx.canvas.style.display='none'; const m=document.createElement('p'); m.className='chart-empty-message text-center text-muted p-3'; m.innerHTML=`<i class="fas fa-calendar-alt fa-2x mb-2 d-block"></i> ${msg}`; parent.appendChild(m);}}; const sMonths=Object.keys(monthlyData).sort((a,b)=>a.localeCompare(b)); manageC(sMonths.length>0); if(sMonths.length===0)return; const lbls=sMonths.map(mY=>{const[y,m]=mY.split('-'); return `${getMonthName(parseInt(m)-1)}/${y.slice(-2)}`;}); const incData=sMonths.map(m=>monthlyData[m].income); const expData=sMonths.map(m=>monthlyData[m].expense); const tCb=(v)=>valuesHidden?'***':formatCurrency(v); const ttCb=(ctx)=>{const lbl=ctx.dataset.label||''; const v=ctx.parsed?.y||0; return `${lbl}: ${valuesHidden?'***':formatCurrency(v)}`;}; try { monthlyHistoryChart=new Chart(monHistChartCtx, { type:'bar', data:{labels:lbls, datasets:[{label:'Receitas',data:incData,backgroundColor:incomeExpenseColors.income,borderColor:incomeExpenseColors.incomeBorder,borderWidth:1},{label:'Despesas',data:expData,backgroundColor:incomeExpenseColors.expense,borderColor:incomeExpenseColors.expenseBorder,borderWidth:1}]}, options:{responsive:true, maintainAspectRatio:false, scales:{x:{stacked:false, grid:{display:false}}, y:{beginAtZero:true, stacked:false, ticks:{callback:tCb}, grid:{color:Chart.defaults.borderColor}}}, plugins:{tooltip:{callbacks:{label:ttCb}}, legend:{position:'top'}}} });} catch(e){console.error("Err monthlyHistoryChart:", e); manageC(false);}}

    // --- UI Update Helpers ---
    function refreshAllUIComponents(){ /* ... */ console.log("UI Refresh..."); applyValueVisibilityIconAndClass(); updateBalanceDisplay(); updateBalanceDisplays(); renderTransactionHistory(); renderUpcomingBills(); renderGoals(); updateGoalsSummary(); const actSect = document.querySelector('.content-section.active'); if(actSect){const sId=actSect.id.replace('-section',''); if(sId==='transactions'){if(safeGetElementById('filterCategory2'))updateCategoryDropdowns(safeGetElementById('filterCategory2'),'filter'); filterTransactions();} else if(sId==='scheduled')renderAllScheduledPayments(); else if(sId==='notes')renderNotes(); else if(sId==='settings')loadSettingsValues();}else{renderTransactionHistory();renderUpcomingBills();updateGoalsSummary();} if(quickNotesModal?.classList.contains('active'))renderQuickNotesPopupContent(); updateCharts(); updatePlaceholders(); console.log("UI Refresh OK."); }
    function updateUIafterTransactionChange(){ /* ... */ refreshAllUIComponents(); checkScheduledPayments();}
    function updateUIafterSettingsChange(){ /* ... */ refreshAllUIComponents(); }
    function updateUIafterImport(){ /* ... */ refreshAllUIComponents(); checkScheduledPayments(); checkReminders(); loadSettingsValues(); showSection('dashboard'); }
    function highlightNewTransaction(txId){ /* ... */ const h=(el)=>{if(!el)return; el.classList.add('new-transaction-highlight'); setTimeout(()=>{el.scrollIntoView({behavior:'smooth',block:'nearest'});},100); setTimeout(()=>el.classList.remove('new-transaction-highlight'),3500);}; const hEl=transactionHistoryContainer?.querySelector(`.transaction-item[data-id="${txId}"]`); const aEl=allTransactionsContainer?.querySelector(`.transaction-item[data-id="${txId}"]`); h(hEl); if(allTransactionsContainer?.closest('.content-section')?.classList.contains('active')){ h(aEl); }}

    // --- Inicialização ---
    function init() {
        console.log("Gestor Financeiro: Inicializando v1.9.11");
        loadDataFromStorage(); applyTheme(); applyThemeColor(); setupEventListeners();
        if (safeQuerySelector('.user-name')) safeQuerySelector('.user-name').textContent = userName; if (safeQuerySelector('.user-email')) safeQuerySelector('.user-email').textContent = userEmail;
        [modalDateInput, editDateInput, goalDateInput, scheduledDateInput].filter(Boolean).forEach(inp => {if(!inp.value)inp.value=getLocalDateString()});
        if (modalCategoryInput) updateCategoryDropdowns(modalCategoryInput, 'expense'); if (editCategoryInput) updateCategoryDropdowns(editCategoryInput, 'expense'); if (scheduledCategoryInput) updateCategoryDropdowns(scheduledCategoryInput, 'scheduled');
        if (typeof Chart !== 'undefined' && Chart.register) { Chart.defaults.font.family = "'Poppins', sans-serif"; updateChartDefaults(); console.log("Chart.js config."); } else { console.error("ERRO CRÍTICO: Chart.js não carregado."); showAlert("Erro: Falha gráficos.", 'danger'); }
        refreshAllUIComponents(); checkScheduledPayments(); checkReminders();
        setInterval(checkScheduledPayments, 60 * 1000);
        if (reminderCheckIntervalId) clearInterval(reminderCheckIntervalId);
        reminderCheckIntervalId = setInterval(checkReminders, NOTE_REMINDER_CHECK_INTERVAL);
        showSection('dashboard');
        console.log(`Gestor Financeiro: Pronto (v1.9.11). ${notes.length} notas/tarefas. Calculadora OK.`);
    }

    // --- Início da Execução ---
    init();

}); // Fim DOMContentLoaded