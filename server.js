require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

//middleware CORS
app.use(cors());

//JSON
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////////////////////////////////////////
app.post('/api/products', async (req, res) => {
    console.log('POST /api/products chamado');
    const { nome, descricao, categoria, cod_produto, preco, qtd_inicial } = req.body;

    const { data, error } = await supabase
        .from('estoque')
        .insert([{ nome, descricao, categoria, cod_produto, preco, qtd_inicial }]);

    if (error) {
        console.error("Erro ao inserir no Supabase:", error.message);
        return res.status(500).json({ error: error.message });
    }

    // verificar se o `data` não é nulo antes de acessar data[0]
    if (data && data.length > 0) {
        res.status(201).json(data[0]);
    } else {
        res.status(500).json({ error: 'Erro ao inserir o produto.' });
    }

    res.status(204).send();
});

app.get('/api/products', async (req, res) => {
    console.log('GET /api/products chamado');
    const { data, error } = await supabase
        .from('estoque')
        .select('*');

    if (error) {
        console.error("Erro ao buscar produtos:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

//////////////////////////////////////////////////////
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/products/${id} chamado`);

    const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Erro ao deletar o produto:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.status(204).send();
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
