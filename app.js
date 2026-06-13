if (
    !window.location.href.includes("login.html") &&
    localStorage.getItem("logado") !== "sim"
) {
    window.location.href = "login.html";
}
function entrar() {
  const usuario = document.querySelector('input[type="text"]').value;
  const senha = document.querySelector('input[type="password"]').value;

  if (usuario === "admin" && senha === "1234") {
    alert("Login realizado com sucesso!");
    window.location.href = "dashboard.html";
  } else {
    alert("Usuário ou senha incorretos.");
  }
}

function salvarCliente() {
    const nome = document.getElementById("nomeCliente").value;
    const telefone = document.getElementById("telefoneCliente").value;
    const receita = document.getElementById("receitaCliente").value;
    const observacoes = document.getElementById("obsCliente").value;

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    clientes.push({ nome, telefone, receita, observacoes });

    localStorage.setItem("clientes", JSON.stringify(clientes));

    mostrarClientes();
    atualizarDashboard();

    alert("Cliente salvo com sucesso!");
}

function mostrarClientes() {
  const lista = document.getElementById("listaClientes");

  if (!lista) return;

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  lista.innerHTML = "";

  clientes.forEach(function(cliente) {
    lista.innerHTML += `
<tr>
    <td>${cliente.nome}</td>
    <td>${cliente.telefone}</td>
    <td>${cliente.receita}</td>
    <td>${cliente.observacoes}</td>
    <td>
        <button onclick="excluirCliente('${cliente.telefone}')">
            Excluir
        </button>
    </td>
</tr>
`;
  });
}

mostrarClientes();
window.onload = mostrarClientes;
function atualizarDashboard() {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    const totalClientes = document.getElementById("totalClientes");
    const totalPedidos = document.getElementById("totalPedidos");
    const totalFinanceiro = document.getElementById("totalFinanceiro");

    if (totalClientes) totalClientes.textContent = clientes.length;
    if (totalPedidos) totalPedidos.textContent = pedidos.length;

    if (totalFinanceiro) {
        let soma = 0;
        pedidos.forEach(function(pedido) {
            soma += Number(pedido.receita || 0);
        });
        totalFinanceiro.textContent = soma;
    }
}

atualizarDashboard();
function salvarPedido() {
    const nome = document.querySelectorAll("input")[0].value;
    const produto = document.querySelectorAll("input")[1].value;
    const valor = document.querySelectorAll("input")[2].value;

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    const data = new Date().toLocaleDateString("pt-BR");
pedidos.push({ nome, produto, valor, data });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    mostrarPedidos();
}

function mostrarPedidos() {
    const lista = document.getElementById("listaPedidos");
    if (!lista) return;

    lista.innerHTML = "";

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos.forEach(function(pedido) {
        lista.innerHTML += `
            <p>
                <strong>${pedido.nome}</strong><br>
                Produto: ${pedido.produto}<br>
                Valor: R$ ${pedido.valor}<br>
Data: ${pedido.data}
                <button onclick="excluirPedido('${pedido.nome}')">Excluir</button>
            </p>
            <hr>
        `;
    });
}

mostrarPedidos();
function atualizarPedidosDashboard() {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const totalPedidos = document.getElementById("totalPedidos");

    if (totalPedidos) {
        totalPedidos.textContent = pedidos.length;
    }
}

atualizarPedidosDashboard();
function atualizarFinanceiro() {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const totalFinanceiro = document.getElementById("totalFinanceiro");

    let soma = 0;

    pedidos.forEach(function(pedido) {
        soma += Number(pedido.valor);
    });

    if (totalFinanceiro) {
        totalFinanceiro.textContent = soma;
    }
}

atualizarFinanceiro();
function atualizarDashboard() {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const totalClientes = document.getElementById("totalClientes");

    if (totalClientes) {
        totalClientes.textContent = clientes.length;
    }
}

atualizarDashboard();
function excluirCliente(telefone) {
    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    clientes = clientes.filter(function(cliente) {
        return cliente.telefone !== telefone;
    });

    localStorage.setItem("clientes", JSON.stringify(clientes));

    mostrarClientes();
    atualizarDashboard();
}
function excluirPedido(nome) {
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos = pedidos.filter(function(pedido) {
        return pedido.nome !== nome;
    });
localStorage.setItem("pedidos", JSON.stringify(pedidos));
mostrarPedidos();
atualizarPedidosDashboard();
atualizarFinanceiro();
}
function fazerLogin() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "ventura" && senha === "123456") {
        localStorage.setItem("logado", "sim");
        window.location.href = "dashboard.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
}
    
