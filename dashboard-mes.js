let mesDashboardSelecionado = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
);

function dataDoRegistroDashboard(item) {
  if (!item) return null;

  if (item.criadoEm) {
    if (typeof item.criadoEm.toDate === "function") {
      return item.criadoEm.toDate();
    }

    if (item.criadoEm.seconds) {
      return new Date(item.criadoEm.seconds * 1000);
    }

    const direta = new Date(item.criadoEm);
    if (!isNaN(direta.getTime())) return direta;
  }

  if (item.data) {
    const partes = String(item.data).split("/");

    if (partes.length === 3) {
      const data = new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
      );

      if (!isNaN(data.getTime())) return data;
    }
  }

  return null;
}

function pertenceAoMesSelecionadoDashboard(item) {
  const data = dataDoRegistroDashboard(item);

  return Boolean(
    data &&
    data.getMonth() === mesDashboardSelecionado.getMonth() &&
    data.getFullYear() === mesDashboardSelecionado.getFullYear()
  );
}

function mostrarMesSelecionadoDashboard() {
  const campo = document.getElementById("mesDashboard");
  if (!campo) return;

  const texto = mesDashboardSelecionado.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  campo.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
}

function destruirGraficoDashboard(canvas) {
  if (!canvas || typeof Chart === "undefined") return;

  const grafico = Chart.getChart(canvas);
  if (grafico) grafico.destroy();
}

async function carregarDashboardMensal() {
  const campoMes = document.getElementById("mesDashboard");
  if (!campoMes || typeof db === "undefined") return;

  mostrarMesSelecionadoDashboard();

  try {
    const [clientesSnap, pedidosSnap] = await Promise.all([
      db.collection("clientes").get(),
      db.collection("pedidos").get()
    ]);

    let pedidosDoMes = 0;
    let faturamentoDoMes = 0;

    pedidosSnap.forEach(function(doc) {
      const pedido = doc.data();

      if (pertenceAoMesSelecionadoDashboard(pedido)) {
        pedidosDoMes += 1;
        faturamentoDoMes += Number(pedido.valor || 0);
      }
    });

    const totalClientes = document.getElementById("totalClientes");
    const totalPedidos = document.getElementById("totalPedidos");
    const totalFinanceiro = document.getElementById("totalFinanceiro");

    if (totalClientes) totalClientes.textContent = clientesSnap.size;
    if (totalPedidos) totalPedidos.textContent = pedidosDoMes;

    if (totalFinanceiro) {
      totalFinanceiro.textContent = faturamentoDoMes
        .toFixed(2)
        .replace(".", ",");
    }

    const canvasVendas = document.getElementById("graficoVendas");
    const canvasFinanceiro = document.getElementById("graficoFinanceiro");

    if (canvasVendas && canvasFinanceiro && typeof Chart !== "undefined") {
      destruirGraficoDashboard(canvasVendas);
      destruirGraficoDashboard(canvasFinanceiro);

      new Chart(canvasVendas, {
        type: "bar",
        data: {
          labels: ["Clientes", "Pedidos do mês"],
          datasets: [{
            data: [clientesSnap.size, pedidosDoMes],
            borderRadius: 12
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      new Chart(canvasFinanceiro, {
        type: "bar",
        data: {
          labels: ["Faturamento do mês"],
          datasets: [{
            data: [faturamentoDoMes],
            borderRadius: 12
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar o dashboard mensal:", erro);
    campoMes.textContent = "Erro ao carregar";
  }
}

async function mudarMesDashboard(direcao) {
  mesDashboardSelecionado = new Date(
    mesDashboardSelecionado.getFullYear(),
    mesDashboardSelecionado.getMonth() + direcao,
    1
  );

  mostrarMesSelecionadoDashboard();
  await carregarDashboardMensal();
}

document.addEventListener("DOMContentLoaded", function() {
  mostrarMesSelecionadoDashboard();

  setTimeout(function() {
    carregarDashboardMensal();
  }, 500);
});
