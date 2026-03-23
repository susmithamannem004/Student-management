// ── CHART ──
let deptChart = null;

function updateChart(students) {
  const dm = {};
  students.forEach(s => { dm[s.department] = (dm[s.department] || 0) + 1; });
  const labels = Object.keys(dm);
  const data = Object.values(dm);
  const colors = labels.map((_, i) => DEPT_COLORS[i % DEPT_COLORS.length]);

  if (deptChart) deptChart.destroy();
  const ctx = document.getElementById('deptChart').getContext('2d');
  deptChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 5 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw}` } }
      }
    }
  });

  document.getElementById('dept-legend').innerHTML = labels.map((l, i) => `
    <div class="legend-item">
      <div class="legend-dot-label">
        <div class="legend-dot" style="background:${colors[i]}"></div>
        <span>${l}</span>
      </div>
      <span class="legend-count">${data[i]}</span>
    </div>`).join('');
}
