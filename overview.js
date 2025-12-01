const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const monthLabel = document.getElementById('monthLabel');
const calendarGrid = document.getElementById('calendar');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const dayTransactions = document.getElementById('dayTransactions');
const dayTotals = document.getElementById('dayTotals');
const totalIncomeEl = document.getElementById('totalIncome');
const totalSpentEl = document.getElementById('totalSpent');
const remainingBalanceEl = document.getElementById('remainingBalance');
const topCategoryEl = document.getElementById('topCategory');


let currentUserId = null;
let monthTransactions = []; 
let currentMonth; 
let currentYear;

document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  await loadUser();
  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  await loadMonthTransactions(currentYear, currentMonth);
  buildCalendar(currentYear, currentMonth);
  calculateMonthlySummary();


  const backButton = document.getElementById('backToDashboard');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
}

async function loadUser() {
  const { data, error } = await supabase.auth.getSession();

  const user = data?.session?.user;

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUserId = user.id;
}


async function loadMonthTransactions(year, month) {
  if (!currentUserId) return;

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('transactions')
.select('id, envelope_id, amount, type, created_at, note')
    .eq('user_id', currentUserId)
   .gte('created_at', start.toISOString())
.lte('created_at', end.toISOString())

    .order('date', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  monthTransactions = data || [];
}

function buildCalendar(year, month) {
  calendarGrid.innerHTML = '';

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  monthLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startWeekday = firstDay.getDay(); 

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-cell calendar-empty';
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';

    const date = new Date(year, month, day);
    const dateStr = date.toISOString().slice(0, 10);

    const todaysTx = monthTransactions.filter((tx) => tx.date === dateStr);
    const totalExpense = todaysTx
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    if (totalExpense === 0 && todaysTx.length > 0) {
      cell.classList.add('calendar-green');
    } else if (totalExpense > 0) {
      cell.classList.add('calendar-red');
    }

    cell.textContent = String(day);

    cell.addEventListener('click', () => {
      showDayDetails(dateStr, todaysTx, totalExpense);
    });

    calendarGrid.appendChild(cell);
  }
}

function showDayDetails(dateStr, txs, totalExpense) {
  selectedDateLabel.textContent = dateStr;

  dayTotals.innerHTML = `
    <p><strong>Total spent:</strong> $${totalExpense.toFixed(2)}</p>
  `;

  dayTransactions.innerHTML = '';

  if (!txs.length) {
    dayTransactions.innerHTML = '<p>No transactions.</p>';
    return;
  }

  txs.forEach((tx) => {
    const row = document.createElement('div');
    row.className = 'transaction-row';
    row.innerHTML = `
      <span>${tx.type === 'expense' ? '💸' : '💰'}</span>
      <span>$${Number(tx.amount).toFixed(2)}</span>
      <span>${tx.note || ''}</span>
    `;
    dayTransactions.appendChild(row);
  });
}

async function calculateMonthlySummary() {
  let totalIncome = 0;
  let totalExpense = 0;
  const spendingByEnvelope = {};

  monthTransactions.forEach((tx) => {
    const amt = Number(tx.amount || 0);

    if (tx.type === 'income') {
      totalIncome += amt;
    } else if (tx.type === 'expense') {
      totalExpense += amt;

      if (!spendingByEnvelope[tx.envelope_id]) {
        spendingByEnvelope[tx.envelope_id] = 0;
      }
      spendingByEnvelope[tx.envelope_id] += amt;
    }
  });

  totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
  totalSpentEl.textContent = `$${totalExpense.toFixed(2)}`;
  remainingBalanceEl.textContent = `$${(totalIncome - totalExpense).toFixed(2)}`;

  let topEnvelopeId = null;
  let highestSpend = 0;

  for (let env in spendingByEnvelope) {
    if (spendingByEnvelope[env] > highestSpend) {
      highestSpend = spendingByEnvelope[env];
      topEnvelopeId = env;
    }
  }

  topCategoryEl.textContent = topEnvelopeId
    ? `Envelope ${highestSpend.toFixed(2)}`
    : 'None';
}

