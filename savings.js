const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGxranpqb3lybWtuYXdpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDE0MzYsImV4cCI6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const savingsList = document.getElementById('savingsList');

let currentUserId = null;

// ✅ INIT
document.addEventListener('DOMContentLoaded', init);

async function init() {
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUserId = user.id;
  loadSavings();
}

// ✅ LOAD SAVINGS ENVELOPES
async function loadSavings() {
  const { data, error } = await supabase
    .from('envelopes')
    .select('id, name, goal_amount, saved_amount, goal_deadline')
    .eq('user_id', currentUserId)
    .eq('type', 'savings');

  if (error) {
    savingsList.textContent = error.message;
    return;
  }

  if (!data.length) {
    savingsList.innerHTML = '<p>No savings goals yet.</p>';
    return;
  }

  savingsList.innerHTML = '';

  data.forEach((goal) => {
    const saved = Number(goal.saved_amount || 0);
    const goalAmt = Number(goal.goal_amount || 1);
    const percent = Math.min((saved / goalAmt) * 100, 100).toFixed(1);

    let daysLeftText = '';
    if (goal.goal_deadline) {
      const now = new Date();
      const deadline = new Date(goal.goal_deadline);
      const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      daysLeftText = diff > 0 ? `${diff} days left` : 'Deadline passed';
    }

    const card = document.createElement('div');
    card.style.padding = '12px';
    card.style.margin = '10px 0';
    card.style.borderRadius = '10px';
    card.style.background = '#f3edff';

    card.innerHTML = `
      <h3>${goal.name}</h3>
      <p>$${saved.toFixed(2)} / $${goalAmt.toFixed(2)}</p>

      <div style="background:#ddd; border-radius:30px; overflow:hidden;">
        <div style="
          width:${percent}%;
          background:#7b5cff;
          color:white;
          text-align:center;
          font-size:12px;
        ">
          ${percent}%
        </div>
      </div>

      <p style="margin-top:6px;">${daysLeftText}</p>
    `;

    savingsList.appendChild(card);
  });
}
