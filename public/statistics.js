async function loadStatistics() {
  try {
    const response = await fetch('/api/statistics');
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    const statistics = await response.json();

    const tableBody = document.querySelector('#statisticsTable tbody');
    tableBody.innerHTML = '';

    let totalQuantity = 0;
    let totalRevenue = 0;

    statistics.forEach((stat) => {
      totalQuantity += stat.qtd_vendida;
      totalRevenue += stat.valor_total;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stat.nome}</td>
        <td>${stat.qtd_vendida}</td>
        <td>R$ ${stat.valor_total.toFixed(2)}</td>
      `;
      tableBody.appendChild(row);
    });

    // Update summary
    document.getElementById('totalSales').textContent = 
      `Total de Vendas: ${totalQuantity} unidades`;
    document.getElementById('totalRevenue').textContent = 
      `Receita Total: R$ ${totalRevenue.toFixed(2)}`;

  } catch (error) {
    console.error('Error loading statistics:', error);
    alert('Erro ao carregar estatísticas: ' + error.message);
  }
}

// Add some CSS styles for the statistics page
const style = document.createElement('style');
style.textContent = `
  .statistics-summary {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  #statisticsTable {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }

  #statisticsTable th,
  #statisticsTable td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  #statisticsTable th {
    background-color: #f5f5f5;
    font-weight: bold;
  }

  .btn-back {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin-top: 20px;
  }

  .btn-back:hover {
    background-color: #0056b3;
  }
`;

document.head.appendChild(style);

// Load statistics when the page loads
document.addEventListener('DOMContentLoaded', loadStatistics);

