require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

//middleware(Conexao front com back)
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ message: 'Usuário registrado com sucesso!', data });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Login realizado com sucesso!', data });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});


app.get('/api/products', async (req, res) => {
    const { data, error } = await supabase.from('estoque').select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
});

app.post('/api/products', async (req, res) => {
    const { nome, descricao, categoria, cod_produto, preco, qtd_inicial } = req.body;

    const { data, error } = await supabase
        .from('estoque')
        .insert([{ nome, descricao, categoria, cod_produto, preco, qtd_inicial }]);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ message: 'Produto adicionado com sucesso!', data });
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase.from('estoque').delete().eq('id', id);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
