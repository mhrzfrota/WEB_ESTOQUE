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
            <button onclick="deleteProduct(${product.id})">Excluir</button>
        `;
        productList.appendChild(li);
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

loadProducts();

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
            <button onclick="deleteProduct(${product.id})">Excluir</button>
        `;
        productList.appendChild(li);
    });
}
