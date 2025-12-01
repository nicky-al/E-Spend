const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGxranpqb3lybWtuYXdpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDE0MzYsImV4cCI6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const envelopesList = document.getElementById('envelopesList');
const addEnvelopeButton = document.getElementById('addEnvelopeButton');
const envelopeNameInput = document.getElementById('envelopeName');
const envelopeBudgetInput = document.getElementById('envelopeBudget');
const envelopeEmojiInput = document.getElementById('envelopeEmoji');
const envelopeTypeSelect = document.getElementById('envelopeType');
const savingFields = document.getElementById('savingFields');
const savingGoalAmountInput = document.getElementById('savingGoalAmount');
const savingGoalDeadlineInput = document.getElementById('savingGoalDeadline');
const envelopeMessageBox = document.getElementById('envelopeMessageBox');

const variableContainer = document.getElementById('variableEnvelopes');
const fixedContainer = document.getElementById('fixedEnvelopes');
const savingContainer = document.getElementById('savingEnvelopes');

let currentUserId = null;

async function loadEnvelopes() {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    currentUserId = user.id;
    loadEnvelopesList();
  } else {
    window.location.href = 'index.html';
  }
}
loadEnvelopes();

if (envelopeTypeSelect) {
  envelopeTypeSelect.addEventListener('change', () => {
    if (envelopeTypeSelect.value === 'saving') {
      savingFields.style.display = 'block';
    } else {
      savingFields.style.display = 'none';
      savingGoalAmountInput.value = '';
      savingGoalDeadlineInput.value = '';
    }
  });
}

addEnvelopeButton.addEventListener('click', async () => {
  const name = envelopeNameInput.value.trim();
  const budget = envelopeBudgetInput.value.trim();
  const emoji = envelopeEmojiInput.value.trim();
  const type = envelopeTypeSelect.value;

  if (!name) {
    envelopeMessageBox.textContent = 'Please enter an envelope name.';
    return;
  }

  let finalBudget = null;
  if (type !== 'saving') {
    if (!budget) {
      envelopeMessageBox.textContent = 'Please enter a budget.';
      return;
    }
    finalBudget = Number(budget);
  } else if (budget) {
    finalBudget = Number(budget);
  }

  let goalAmount = null;
  let goalDeadline = null;

  if (type === 'saving') {
    if (!savingGoalAmountInput.value) {
      envelopeMessageBox.textContent = 'Please enter a savings goal.';
      return;
    }
    goalAmount = Number(savingGoalAmountInput.value);
    goalDeadline = savingGoalDeadlineInput.value || null;
  }

  const { error } = await supabase.from('envelopes').insert([
    {
      user_id: currentUserId,
      name,
      budget: finalBudget,
      emoji,
      type,
      goal_amount: goalAmount,
      goal_deadline: goalDeadline,
    },
  ]);

  if (error) {
    envelopeMessageBox.textContent = `Error: ${error.message}`;
  } else {
    envelopeMessageBox.textContent = 'Envelope added successfully!';
    envelopeNameInput.value = '';
    envelopeBudgetInput.value = '';
    envelopeEmojiInput.value = '';
    savingGoalAmountInput.value = '';
    savingGoalDeadlineInput.value = '';
    loadEnvelopesList();
  }
});

async function loadEnvelopesList() {
  variableContainer.innerHTML = '';
  fixedContainer.innerHTML = '';
  savingContainer.innerHTML = '';

  const { data: envelopes, error } = await supabase
    .from('envelopes')
    .select('*')
    .eq('user_id', currentUserId);

  if (error) {
    envelopeMessageBox.textContent = `Error: ${error.message}`;
    return;
  }

  envelopes.forEach((envelope) => {
    const div = document.createElement('div');
    div.style.padding = "10px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "5px";
    div.style.backgroundColor = "#6c3b3bff";

    if (envelope.type === 'saving') {
      div.innerHTML = `
        ${envelope.emoji || ''} <strong>${envelope.name}</strong><br>
        Goal: $${envelope.goal_amount}<br>
        Monthly Plan: $${envelope.budget || 0}
      `;
      savingContainer.appendChild(div);
    } 
    else if (envelope.type === 'fixed') {
      div.innerHTML = `
        ${envelope.emoji || ''} <strong>${envelope.name}</strong><br>
        Fixed Bill: $${envelope.budget}
      `;
      fixedContainer.appendChild(div);
    } 
    else {
      div.innerHTML = `
        ${envelope.emoji || ''} <strong>${envelope.name}</strong><br>
        Budget: $${envelope.budget}
      `;
      variableContainer.appendChild(div);
    }
  });
}

const backButton = document.getElementById('backToDashboard');
if (backButton) {
  backButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

//OLD CONTENT BELOW PRIOR TO ADdING MULTIPLE ENVELOPE TYPES
// const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGxranpqb3lybWtuYXdpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDE0MzYsImV4cCI6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// const envelopesList = document.getElementById('envelopesList');
// const addEnvelopeButton = document.getElementById('addEnvelopeButton');
// const envelopeNameInput = document.getElementById('envelopeName');
// const envelopeBudgetInput = document.getElementById('envelopeBudget');
// const envelopeEmojiInput = document.getElementById('envelopeEmoji');
// const envelopeMessageBox = document.getElementById('envelopeMessageBox');

// let currentUserId = null;
// async function loadEnvelopes() {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (user) {
//         currentUserId = user.id;
//         loadEnvelopesList()
//     } else {
//         window.location.href = 'index.html'; 
//         return;
//     }
// }
// loadEnvelopes();

// addEnvelopeButton.addEventListener('click', async () => {
//     const name = envelopeNameInput.value;
//     const budget= envelopeBudgetInput.value;
//     const emoji = envelopeEmojiInput.value;

//     if(!name|| !budget){
//         envelopeMessageBox.textContent = 'Please enter both name and budget.';
//         return; 
//     }
//     const{error}= await supabase
//         .from('envelopes')
//         .insert([
//             { user_id: currentUserId, name: name, budget: budget, emoji: emoji , type:"variable" },
//         ]);
//     if (error) {
//         envelopeMessageBox.textContent = `Error: ${error.message}`;
//     } else {
//         envelopeMessageBox.textContent = 'Envelope added successfully!';
//         envelopeNameInput.value = '';
//         envelopeBudgetInput.value = '';
//         envelopeEmojiInput.value = '';
//         loadEnvelopesList();
//     }
// });

// async function loadEnvelopesList() {
//     envelopesList.innerHTML = '';
//     const { data: envelopes, error } = await supabase
//         .from('envelopes')
//         .select('*')
//         .eq('user_id', currentUserId);
//     if (error) {
//         envelopeMessageBox.textContent = `Error: ${error.message}`;
//         return;
//     }
//     envelopes.forEach((envelope) => {
//         const div=document.createElement('div');
//         div.style.padding="10px";
//         div.style.margin="10px 0";
//         div.style.borderRadius="5px";
//         div.style.backgroundColor="#6c3b3bff";

//         div.innerHTML=`
//         ${envelope.emoji} <strong>${envelope.name}</strong> <br>
//         Budget: $${envelope.budget}
//         `;
//         envelopesList.appendChild(div);
//     });
// }
// const backButton = document.getElementById('backToDashboard');

// if (backButton) {
//   backButton.addEventListener('click', () => {
//     window.location.href = 'dashboard.html';
//   });
// }
