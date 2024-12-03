const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('supabase_token', result.data.access_token); // Salva o token no localStorage
        alert(result.message);
        window.location.href = 'index.html'; // Redireciona para o controle de estoque
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        window.location.href = 'login.html'; // Redireciona para o login
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });
}

async function checkAuth() {
  try {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
      window.location.href = 'login.html'; // Redireciona se não houver token
      return;
    }

    const response = await fetch('/api/auth', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      window.location.href = 'login.html'; // Redireciona se não estiver autenticado
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    window.location.href = 'login.html';
  }
}

if (window.location.pathname === '/index.html') {
  checkAuth(); // Verifica autenticação na página protegida
}
