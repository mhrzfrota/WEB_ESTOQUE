require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configurações básicas do servidor
app.use(express.json());
app.use(express.static('public'));

// Rota raiz para redirecionar para login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve o login.html como página inicial
});

// Rota de registro de usuário
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.status(201).json({ message: 'Usuário registrado com sucesso!', data });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota de login de usuário
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.status(200).json({ message: 'Login realizado com sucesso!', data });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para obter todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('estoque').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produtos' });
  }
});

// Rota para adicionar um novo produto
app.post('/api/products', async (req, res) => {
  try {
    const { nome, descricao, categoria, cod_produto, preco, qtd_inicial } = req.body;

    if (!nome || !cod_produto || !preco || qtd_inicial === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios estão faltando' });
    }

    const { data, error } = await supabase
      .from('estoque')
      .insert([{ nome, descricao, categoria, cod_produto, preco, qtd_inicial, qtd_vendida: 0 }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Produto adicionado com sucesso!', data: data[0] });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para excluir um produto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('estoque').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para atualizar informações de um produto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, categoria, cod_produto, preco, qtd_inicial } = req.body;

    const { data, error } = await supabase
      .from('estoque')
      .update({ nome, descricao, categoria, cod_produto, preco, qtd_inicial })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Produto atualizado com sucesso!', data });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para registrar venda de um produto
app.post('/api/products/:id/sell', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error: fetchError } = await supabase
      .from('estoque')
      .select('qtd_inicial, qtd_vendida')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    if (product.qtd_inicial <= 0) {
      return res.status(400).json({ error: 'Produto fora de estoque' });
    }

    const { error: updateError } = await supabase
      .from('estoque')
      .update({
        qtd_inicial: product.qtd_inicial - 1,
        qtd_vendida: (product.qtd_vendida || 0) + 1
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({
      message: 'Produto vendido com sucesso!',
      novoEstoque: product.qtd_inicial - 1,
      quantidadeVendida: (product.qtd_vendida || 0) + 1
    });
  } catch (error) {
    console.error('Erro ao processar venda:', error.message);
    res.status(500).json({ error: 'Erro ao processar venda do produto' });
  }
});

// Rota para obter estatísticas de vendas
app.get('/api/statistics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('estoque')
      .select('id, nome, qtd_vendida, preco');

    if (error) throw error;

    const statistics = (data || []).filter(product => product.qtd_vendida > 0).map(product => ({
      id: product.id,
      nome: product.nome,
      qtd_vendida: product.qtd_vendida,
      valor_total: product.qtd_vendida * product.preco
    }));

    res.status(200).json(statistics);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
