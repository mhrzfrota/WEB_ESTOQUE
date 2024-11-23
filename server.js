require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

//middleware(Conexao front com back)
app.use(cors({
    origin: 'http://localhost:3000', // or your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
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


app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Fetching product with ID:', id);
  
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) {
        console.error('Supabase error:', error);
        // Always send JSON response, even for errors
        return res.status(400).json({
          error: error.message,
          details: error
        });
      }
  
      if (!data) {
        // Send JSON for 404 cases
        return res.status(404).json({
          error: 'Product not found',
          productId: id
        });
      }
  
      // Set proper content type and send JSON response
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
  
    } catch (err) {
      console.error('Server error:', err);
      // Ensure error responses are also JSON
      res.status(500).json({
        error: 'Internal server error',
        details: err.message
      });
    }
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

// Update product information
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, categoria, cod_produto, preco, qtd_inicial } = req.body;
  
    const { data, error } = await supabase
      .from('estoque')
      .update({ nome, descricao, categoria, cod_produto, preco, qtd_inicial })
      .eq('id', id);
  
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ message: 'Produto atualizado com sucesso!', data });
  });
  
  // Sell a product (reduce quantity by 1)
  // In your server.js file
app.post('/api/products/:id/sell', async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Received sell request for product:', id);
  
      // First, get the current quantity
      const { data: product, error: fetchError } = await supabase
        .from('estoque')
        .select('qtd_inicial')
        .eq('id', id)
        .single();
  
      if (fetchError) {
        console.error('Error fetching product:', fetchError);
        return res.status(400).json({ error: fetchError.message });
      }
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      if (product.qtd_inicial <= 0) {
        return res.status(400).json({ error: 'Product out of stock' });
      }
  
      // Update the quantity
      const { data, error } = await supabase
        .from('estoque')
        .update({ qtd_inicial: product.qtd_inicial - 1 })
        .eq('id', id)
        .select();
  
      if (error) {
        console.error('Error updating product:', error);
        return res.status(400).json({ error: error.message });
      }
  
      res.status(200).json({ 
        message: 'Product sold successfully!', 
        newQuantity: product.qtd_inicial - 1 
      });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get sales statistics
  app.get('/api/statistics', async (req, res) => {
    const { data, error } = await supabase
      .from('vendas')
      .select('produto_id, quantidade')
      .join('estoque', { 'estoque.id': 'vendas.produto_id' });
  
    if (error) {
      return res.status(500).json({ error: error.message });
    }
  
    const statistics = data.reduce((acc, sale) => {
      if (!acc[sale.produto_id]) {
        acc[sale.produto_id] = { nome: sale.estoque.nome, total: 0 };
      }
      acc[sale.produto_id].total += sale.quantidade;
      return acc;
    }, {});
  
    res.status(200).json(Object.values(statistics));
  });

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
