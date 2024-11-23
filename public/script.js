const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const product = {
    nome: document.getElementById('productName').value,
    descricao: document.getElementById('productDescription').value,
    categoria: document.getElementById('productCategory').value,
    cod_produto: parseInt(document.getElementById('productCode').value),
    preco: parseFloat(document.getElementById('productPrice').value),
    qtd_inicial: parseInt(document.getElementById('productQuantity').value)
  };

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });

  if (response.ok) {
    loadProducts();
    productForm.reset();
  } else {
    console.error('Erro ao cadastrar o produto');
  }
});

async function loadProducts() {
  const response = await fetch('/api/products');
  const products = await response.json();

  productList.innerHTML = '';
  products.forEach((product) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${product.nome}</strong> - ${product.descricao} - ${product.categoria} - 
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
}

async function deleteProduct(id) {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    loadProducts();
  } else {
    console.error('Erro ao excluir o produto');
  }
}

async function editProduct(id) {
    try {
      console.log('Fetching product:', id);
      const response = await fetch(`/api/products/${id}`);
      
      // First check if the response is ok
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error(`Product ${id} not found`);
        }
        throw new Error(errorData.error || 'Failed to fetch product');
      }
  
      // Ensure we're getting JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - expected JSON');
      }
  
      const product = await response.json();
      
      // Validate the product data
      if (!product || typeof product !== 'object') {
        throw new Error('Invalid product data received');
      }
  
      // Populate form with product data, using optional chaining and defaults
      document.getElementById('productName').value = product?.nome ?? '';
      document.getElementById('productDescription').value = product?.descricao ?? '';
      document.getElementById('productCategory').value = product?.categoria ?? '';
      document.getElementById('productCode').value = product?.cod_produto ?? '';
      document.getElementById('productPrice').value = product?.preco ?? '';
      document.getElementById('productQuantity').value = product?.qtd_inicial ?? '';
  
      // Update form submission handler
      productForm.onsubmit = async (e) => {
        e.preventDefault();
        
        try {
          const updatedProduct = {
            nome: document.getElementById('productName').value,
            descricao: document.getElementById('productDescription').value,
            categoria: document.getElementById('productCategory').value,
            cod_produto: parseInt(document.getElementById('productCode').value),
            preco: parseFloat(document.getElementById('productPrice').value),
            qtd_inicial: parseInt(document.getElementById('productQuantity').value)
          };
  
          const updateResponse = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
          });
  
          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.error || 'Failed to update product');
          }
  
          await loadProducts();
          productForm.reset();
          productForm.onsubmit = null; // Reset form handler
          alert('Product updated successfully!');
        } catch (updateError) {
          console.error('Error updating product:', updateError);
          alert(`Failed to update product: ${updateError.message}`);
        }
      };
    } catch (error) {
      console.error('Error in editProduct:', error);
      alert(`Error: ${error.message}`);
      // Reset form in case of error
      productForm.reset();
      productForm.onsubmit = null;
    }
  }
  

async function sellProduct(id) {
    try {
      // Log the request details
      console.log('Attempting to sell product:', id);
      
      const response = await fetch(`http://localhost:3000/api/products/${id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Log the response status
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sell product');
      }
  
      const data = await response.json();
      console.log('Sale successful:', data);
      
      // Reload the products list
      await loadProducts();
    } catch (error) {
      console.error('Error selling product:', error);
      alert('Error selling product: ' + error.message);
    }
  }

async function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const response = await fetch('/api/products');
  const products = await response.json();

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm)
  );

  displayProducts(filteredProducts);
}

function displayProducts(products) {
  productList.innerHTML = '';
  products.forEach((product) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${product.nome}</strong> - ${product.descricao} - ${product.categoria} - 
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
}

loadProducts();
