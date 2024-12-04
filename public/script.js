const productForm = document.getElementById('productForm');
const productTableBody = document.querySelector('#productTable tbody');
let editingProductId = null;
let alertedProducts = new Set();

// Carregar produtos ao carregar a página
document.addEventListener('DOMContentLoaded', loadProducts);

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error(`Erro ao carregar produtos: ${response.status}`);

    const products = await response.json();
    productTableBody.innerHTML = '';

    products.forEach((product) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.nome}</td>
        <td>${product.descricao || '-'}</td>
        <td>${product.categoria || '-'}</td>
        <td>${product.cod_produto}</td>
        <td>R$ ${product.preco.toFixed(2)}</td>
        <td>${product.qtd_inicial}</td>
        <td class="action-buttons">
          <button class="btn-editar" onclick="editProduct(${product.id})">Editar</button>
          <button class="btn-excluir" onclick="deleteProduct(${product.id})">Excluir</button>
          <button class="btn-vender" onclick="sellProduct(${product.id})">Vender</button>
        </td>
      `;
      productTableBody.appendChild(row);

      if (product.qtd_inicial <= 5 && !alertedProducts.has(product.id)) {
        alert(`Atenção! O produto "${product.nome}" está com apenas ${product.qtd_inicial} unidades em estoque.`);
        alertedProducts.add(product.id);
      }
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    alert('Erro ao carregar produtos.');
  }
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productData = {
    nome: document.getElementById('productName').value,
    descricao: document.getElementById('productDescription').value,
    categoria: document.getElementById('productCategory').value,
    cod_produto: parseInt(document.getElementById('productCode').value),
    preco: parseFloat(document.getElementById('productPrice').value),
    qtd_inicial: parseInt(document.getElementById('productQuantity').value),
  };

  try {
    const method = editingProductId ? 'PUT' : 'POST';
    const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!response.ok) throw new Error('Erro ao salvar produto.');

    const message = editingProductId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
    alert(message);
    resetForm();
    await loadProducts();
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto.');
  }
});

async function editProduct(id) {
  console.log('ID recebido para edição:', id); 
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      console.error(`Erro na resposta do servidor: ${response.status}`);
      throw new Error(`Erro ao carregar produto: ${response.status}`);
    }

    const product = await response.json();
    console.log('Produto carregado:', product); 

    document.getElementById('productName').value = product.nome || '';
    document.getElementById('productDescription').value = product.descricao || '';
    document.getElementById('productCategory').value = product.categoria || '';
    document.getElementById('productCode').value = product.cod_produto || '';
    document.getElementById('productPrice').value = product.preco || '';
    document.getElementById('productQuantity').value = product.qtd_inicial || '';

    const submitButton = productForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Atualizar Produto';
    submitButton.style.backgroundColor = 'blue';
    editingProductId = id;
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    alert('Erro ao carregar produto.');
  }
}

async function deleteProduct(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir produto.');

      alert('Produto excluído com sucesso!');
      await loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto.');
    }
  }
}

async function sellProduct(id) {
  try {
    const response = await fetch(`/api/products/${id}/sell`, { method: 'POST' });
    if (!response.ok) throw new Error('Erro ao registrar venda do produto.');

    const result = await response.json();
    alert(result.message);
    await loadProducts();
  } catch (error) {
    console.error('Erro ao vender produto:', error);
    alert('Erro ao vender produto.');
  }
}

function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = productTableBody.querySelectorAll('tr');

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function resetForm() {
  productForm.reset();
  const submitButton = productForm.querySelector('button[type="submit"]');
  submitButton.textContent = 'Cadastrar Produto';
  submitButton.style.backgroundColor = 'green';
  editingProductId = null;
}
