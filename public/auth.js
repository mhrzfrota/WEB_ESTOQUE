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
                alert(result.message);
                window.location.href = 'index.html'; 
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
                window.location.href = 'login.html'; 
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
        const response = await fetch('/api/auth', {
            method: 'GET',
            credentials: 'include', 
        });

        if (!response.ok) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = 'login.html'; 
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            alert('Logout realizado com sucesso!');
            window.location.href = 'login.html';
        } else {
            alert('Erro ao realizar logout.');
        }
    } catch (error) {
        console.error('Erro no logout:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

if (window.location.pathname === '/index.html') {
    checkAuth();
}
