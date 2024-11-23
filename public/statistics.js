async function loadStatistics() {
  const response = await fetch('/api/statistics');
  const statistics = await response.json();

  const statisticsList = document.getElementById('statisticsList');
  statisticsList.innerHTML = '';

  statistics.forEach((stat) => {
    const li = document.createElement('li');
    li.textContent = `${stat.nome}: ${stat.total} unidades vendidas`;
    statisticsList.appendChild(li);
  });
}

loadStatistics();

