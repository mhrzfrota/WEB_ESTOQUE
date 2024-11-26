// script.js
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
let editingProductId = null;

async function loadProducts() {
  try {
    console.log('Fetching products...');
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    console.log('Products loaded:', products);

    productList.innerHTML = '';
    products.forEach((product) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${product.nome}</strong> - ${product.descricao || ''} - ${product.categoria || ''} - 
        Código: ${product.cod_produto} - Preço: R$ ${product.preco.toFixed(2)} - 
        Quantidade: ${product.qtd_inicial}
        <button class="btn-editar" onclick="editProduct(${product.id})">Editar</button>
        <button class="btn-excluir" onclick="deleteProduct(${product.id})">Excluir</button>
        <button class="btn-vender" onclick="sellProduct(${product.id})">Vender</button>
      `;
      productList.appendChild(li);

      if (product.qtd_inicial <= 5) {
        alert(`Atenção! O produto "${product.nome}" está com apenas ${product.qtd_inicial} unidades em estoque.`);
      }
    });
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Erro ao carregar produtos: ' + error.message);
  }
}

async function addProduct(event) {
  event.preventDefault();

  const product = {
    nome: document.getElementById('productName').value,
    descricao: document.getElementById('productDescription').value,
    categoria: document.getElementById('productCategory').value,
    cod_produto: parseInt(document.getElementById('productCode').value),
    preco: parseFloat(document.getElementById('productPrice').value),
    qtd_inicial: parseInt(document.getElementById('productQuantity').value)
  };

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add product');
    }

    const result = await response.json();
    alert(result.message);
    productForm.reset();
    await loadProducts();
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Erro ao adicionar produto: ' + error.message);
  }
}

async function editProduct(id) {
  console.log('ID recebido para edição:', id);
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar produto! Status: ${response.status}`);
    }

    const product = await response.json();

    // Preenche o formulário com os dados do produto
    document.getElementById('productName').value = product.nome || '';
    document.getElementById('productDescription').value = product.descricao || '';
    document.getElementById('productCategory').value = product.categoria || '';
    document.getElementById('productCode').value = product.cod_produto || '';
    document.getElementById('productPrice').value = product.preco || '';
    document.getElementById('productQuantity').value = product.qtd_inicial || '';

    // Altera o botão para o modo de edição
    const submitButton = productForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Confirmar Edição';
    submitButton.style.backgroundColor = 'blue';
    submitButton.dataset.mode = 'edit';

    editingProductId = id; // Armazena o ID do produto sendo editado
  } catch (error) {
    console.error('Erro ao carregar produto para edição:', error);
    alert('Erro ao carregar produto: ' + error.message);
  }
}

productForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const submitButton = productForm.querySelector('button[type="submit"]');
  const mode = submitButton.dataset.mode; // Verifica o modo do botão (edição ou cadastro)

  const productData = {
    nome: document.getElementById('productName').value,
    descricao: document.getElementById('productDescription').value,
    categoria: document.getElementById('productCategory').value,
    cod_produto: parseInt(document.getElementById('productCode').value),
    preco: parseFloat(document.getElementById('productPrice').value),
    qtd_inicial: parseInt(document.getElementById('productQuantity').value)
  };

  if (mode === 'edit' && editingProductId) {
    // Atualização de produto
    try {
      const response = await fetch(`/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      alert('Produto atualizado com sucesso!');
      resetForm();
      await loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  } else {
    // Cadastro de produto
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar produto');
      }

      alert('Produto cadastrado com sucesso!');
      resetForm();
      await loadProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto: ' + error.message);
    }
  }
});

function resetForm() {
  // Limpa o formulário e restaura o estado inicial
  productForm.reset();
  const submitButton = productForm.querySelector('button[type="submit"]');
  submitButton.textContent = 'Cadastrar Produto';
  submitButton.style.backgroundColor = '';
  submitButton.dataset.mode = 'add'; // Retorna ao modo de cadastro
  editingProductId = null;
}

async function deleteProduct(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Produto excluído com sucesso!');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto: ' + error.message);
    }
  }
}

async function sellProduct(id) {
  try {
    const response = await fetch(`/api/products/${id}/sell`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sell product');
    }

    const result = await response.json();
    alert(result.message);
    await loadProducts();
  } catch (error) {
    console.error('Error selling product:', error);
    alert('Erro ao vender produto: ' + error.message);
  }
}

function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const products = Array.from(productList.children);

  products.forEach(li => {
    const productText = li.textContent.toLowerCase();
    li.style.display = productText.includes(searchTerm) ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', loadProducts);