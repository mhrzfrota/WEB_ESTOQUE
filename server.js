require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// User registration
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.status(201).json({ message: 'Usuário registrado com sucesso!', data });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.status(200).json({ message: 'Login realizado com sucesso!', data });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('estoque').select('*');
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const { nome, descricao, categoria, cod_produto, preco, qtd_inicial } = req.body;

    if (!nome || !cod_produto || !preco || qtd_inicial === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('estoque')
      .insert([{ nome, descricao, categoria, cod_produto, preco, qtd_inicial, qtd_vendida: 0 }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Produto adicionado com sucesso!', data: data[0] });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('estoque').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update product information
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
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
});


// Sell a product (reduce quantity by 1)
app.post('/api/products/:id/sell', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the product to get the current stock and quantity sold
    const { data: product, error: fetchError } = await supabase
      .from('estoque')
      .select('qtd_inicial, qtd_vendida')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    // Validate if stock is available
    if (product.qtd_inicial <= 0) {
      return res.status(400).json({ error: 'Produto fora de estoque' });
    }

    // Update the product's quantities
    const { error: updateError } = await supabase
      .from('estoque')
      .update({
        qtd_inicial: product.qtd_inicial - 1, // Reduce stock by 1
        qtd_vendida: (product.qtd_vendida || 0) + 1 // Increment sold quantity
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({
      message: 'Produto vendido com sucesso!',
      novoEstoque: product.qtd_inicial - 1,
      quantidadeVendida: (product.qtd_vendida || 0) + 1
    });
  } catch (error) {
    console.error('Erro ao vender produto:', error.message);
    res.status(500).json({ error: 'Erro ao processar a venda do produto' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .eq('id', id)
      .single(); // O ".single()" garante que apenas um único produto seja retornado

    if (error) {
      throw error; // Caso haja erro no Supabase
    }

    if (!data) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(data); // Retorna o produto encontrado
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get sales statistics
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
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});