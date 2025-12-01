const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGxranpqb3lybWtuYXdpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDE0MzYsImV4cCI6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const transactionsList = document.getElementById('transactionsList');
const filterEnvelope = document.getElementById('filterEnvelope');
const filterMonth = document.getElementById('filterMonth');
const clearFilters = document.getElementById('clearFilters');
const historyTotals = document.getElementById('historyTotals');

let currentUserId = null;
let allTransactions = [];
let envelopeMap = {};

async function init() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUserId = user.id;

  await loadEnvelopes();
  await loadTransactions();
  applyFilters();
}

init();

async function loadEnvelopes() {
  const { data, error } = await supabase
    .from('envelopes')
    .select('id, name')
    .eq('user_id', currentUserId);

  if (error) return;

  envelopeMap = {};
  filterEnvelope.innerHTML = '<option value="">All Envelopes</option>';

  data.forEach((env) => {
    envelopeMap[env.id] = env.name;

    const option = document.createElement('option');
    option.value = env.id;
    option.textContent = env.name;
    filterEnvelope.appendChild(option);
  });
}

async function loadTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', currentUserId)
    .order('date', { ascending: false });

  if (error) {
    transactionsList.textContent = error.message;
    return;
  }

  allTransactions = data || [];
}

function applyFilters() {
  let filtered = [...allTransactions];

  const envelopeId = filterEnvelope.value;
  const monthVal = filterMonth.value; 

  if (envelopeId) {
    filtered = filtered.filter(tx => tx.envelope_id === envelopeId);
  }

  if (monthVal) {
    filtered = filtered.filter(tx => tx.date.startsWith(monthVal));
  }

  renderTransactions(filtered);
}

function renderTransactions(list) {
  transactionsList.innerHTML = '';

  let totalIncome = 0;
  let totalExpense = 0;

  if (!list.length) {
    transactionsList.innerHTML = '<p>No transactions found.</p>';
    historyTotals.textContent = '';
    return;
  }

  list.forEach((tx) => {
    const row = document.createElement('div');
    row.style.padding = "8px";
    row.style.margin = "8px 0";
    row.style.borderRadius = "6px";
    row.style.background = "#f6f1ff";
    row.style.fontSize = "14px";

    const name = envelopeMap[tx.envelope_id] || 'Unknown';

    if (tx.type === 'income') totalIncome += Number(tx.amount);
    if (tx.type === 'expense') totalExpense += Number(tx.amount);

 row.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div>
      <strong>${tx.type === 'income' ? '💰' : '💸'} $${Number(tx.amount).toFixed(2)}</strong><br>
      ${name} • ${tx.date}<br>
      ${tx.note || ''}
    </div>

    <button
      onclick="deleteTransaction('${tx.id}')"
     background:#ff4d4d;
    color:white;
    border:none;
    border-radius:50%;
    width:36px;
    height:36px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:16px;
    cursor:pointer;
  "> 
      🗑
    </button>
  </div>
`;

    transactionsList.appendChild(row);
  });

  historyTotals.textContent =
    `Income: $${totalIncome.toFixed(2)} | Spent: $${totalExpense.toFixed(2)} | Net: $${(totalIncome - totalExpense).toFixed(2)}`;
}

filterEnvelope.addEventListener('change', applyFilters);
filterMonth.addEventListener('change', applyFilters);

clearFilters.addEventListener('click', () => {
  filterEnvelope.value = '';
  filterMonth.value = '';
  applyFilters();
});
async function deleteTransaction(id) {
  const confirmDelete = confirm("Delete this transaction?");
  if (!confirmDelete) return;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    alert(error.message);
  } else {
    alert("Transaction deleted.");
    location.reload();
  }
}
