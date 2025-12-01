const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGxranpqb3lybWtuYXdpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDE0MzYsImV4cCI6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const amountInput = document.getElementById('amountInput');
const typeInput = document.getElementById('typeInput');
const envelopeSelect = document.getElementById('envelopeSelect');
const dateInput = document.getElementById('dateInput');
const noteInput = document.getElementById('noteInput');
const addTransactionButton = document.getElementById('addTransactionButton');
const transactionMessageBox = document.getElementById('transactionMessageBox');

let currentUserId = null;

async function init() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUserId = user.id;
  loadEnvelopes();
}

init();

async function loadEnvelopes() {
  const { data, error } = await supabase
    .from('envelopes')
.select('uuid_id, name')
    .eq('user_id', currentUserId);

  if (error) {
    transactionMessageBox.textContent = error.message;
    return;
  }

  // ✅ reset dropdown properly
  envelopeSelect.innerHTML = '<option value="">Select Envelope</option>';

  data.forEach((env) => {
    const option = document.createElement('option');

option.value = env.uuid_id;
    option.textContent = env.name;

    envelopeSelect.appendChild(option);
  });
}



addTransactionButton.addEventListener('click', async () => {
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const envelopeId = envelopeSelect.value;
  console.log("Selected Envelope ID:", envelopeId);

  const date = dateInput.value;
  const note = noteInput.value;

  if (!amount || !envelopeId || !date) {
    transactionMessageBox.textContent = "Please fill all required fields.";
    return;
  }

  const { error } = await supabase.from('transactions').insert([
    {
      user_id: currentUserId,
      envelope_id: envelopeId,
      amount,
      type,
      date,
      note
    }
  ]);

  if (error) {
    transactionMessageBox.textContent = error.message;
  } else {
    transactionMessageBox.textContent = "Transaction saved!";
    amountInput.value = '';
    noteInput.value = '';
  }
});
