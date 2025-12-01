const SUPABASE_URL = 'https://tzdlkjzjoyrmknawitqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGxranpqb3lybWtuYXdpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDE0MzYsImV4cCI6MjA4MDE3NzQzNn0.fOn12hfDz38Rq4OLIcgguNA-S2rFoZBC30moXpgKVt8';

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);


const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');   
const messageBox = document.getElementById('messageBox');
const signupButton = document.getElementById('signupButton');
//alert("Welcome! Please log in or sign up to continue."); testing

loginButton.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email==="" || password==="") {;
        messageBox.textContent = 'Please enter both email and password.';
        return; 
    }
        messageBox.textContent = 'Logging in!';
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });         
    if (error) {
        messageBox.textContent = `Error: ${error.message}`;
    } else {
        messageBox.textContent = 'Login successful! Redirecting...'; 
        window.location.href = 'dashboard.html';       
        console.log("User ID:", data.user.id);
    }   
});
signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email==="" || password==="") { 
        messageBox.textContent = 'Please enter both email and password.';
        return;
    }
   
        messageBox.textContent = 'Signing up!';
        const { data, error } = supabase.auth.signUp({
            email: email,
            password: password,
        });
        if (error) {
            messageBox.textContent = `Error: ${error.message}`;
        } else {
            messageBox.textContent = 'Sign-up successful! You can now login.';
        }

});
