// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDkKbihoymG4pYzlZWSknXtn6xqhZumbNk",
  authDomain: "ventura-system.firebaseapp.com",
  projectId: "ventura-system",
  storageBucket: "ventura-system.firebasestorage.app",
  messagingSenderId: "302438886661",
  appId: "1:302438886661:web:8c5ce0f51c9a71e4e35b6c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// PROTEÇÃO DE LOGIN
if (
    !window.location.href.includes("login.html") &&
    localStorage.getItem("logado") !== "sim"
) {
    window.location.href = "login.html";
}

// LOGIN
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

function logout() {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
}

// CLIENTES
async function salvarCliente() {
    const nome = document.getElementById("nomeCliente").value;
const telefone = document.getElementById("telefoneCliente").value;
const endereco = document.getElementById("enderecoCliente").value;
const bairro = document.getElementById("bairroCliente").value;
const cidade = document.getElementById("cidadeCliente").value;
const nascimento = document.getElementById("nascimentoCliente").value;
const observacoes = document.getElementById("obsCliente").value;
    await db.collection("clientes").add({
    nome,
    telefone,
    endereco,
    bairro,
    cidade,
    nascimento,
    observacoes
});

    mostrarClientes();
    alert("Cliente salvo com sucesso!");
}

async function mostrarClientes() {
    const lista = document.getElementById("listaClientes");
    if (!lista) return;

    lista.innerHTML = `
        <tr>
            <th>Nome</th>
<th>Telefone</th>
<th>Endereço</th>
<th>Bairro</th>
<th>Cidade</th>
<th>Ações</th>
        </tr>
    `;

    const snapshot = await db.collection("clientes").get();

    snapshot.forEach(doc => {
        const cliente = doc.data();

        lista.innerHTML += `
        <tr>
            <td>${cliente.nome}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.endereco || ""}</td>
<td>${cliente.bairro || ""}</td>
<td>${cliente.cidade || ""}</td>

            <td>
                <button onclick="excluirCliente('${doc.id}')">
                    Excluir
                </button>
            </td>
        </tr>
        `;
    });
}

async function excluirCliente(id) {
    await db.collection("clientes").doc(id).delete();
    mostrarClientes();
}

// PEDIDOS
async function salvarPedido() {
    const nome = document.querySelectorAll("input")[0].value;
    const produto = document.querySelectorAll("input")[1].value;
    const valor = document.querySelectorAll("input")[2].value;
    const data = new Date().toLocaleDateString("pt-BR");

    await db.collection("pedidos").add({
        nome,
        produto,
        valor,
        data
    });

    mostrarPedidos();
}

async function mostrarPedidos() {
    const lista = document.getElementById("listaPedidos");
    if (!lista) return;

    lista.innerHTML = "";

    const snapshot = await db.collection("pedidos").get();

    snapshot.forEach(doc => {
        const pedido = doc.data();

        lista.innerHTML += `
            <p>
                <strong>${pedido.nome}</strong><br>
                Produto: ${pedido.produto}<br>
                Valor: R$ ${pedido.valor}<br>
                Data: ${pedido.data}
                <button onclick="excluirPedido('${doc.id}')">Excluir</button>
            </p>
            <hr>
        `;
    });
}

async function excluirPedido(id) {
    await db.collection("pedidos").doc(id).delete();
    mostrarPedidos();
}

// DASHBOARD
async function atualizarDashboard() {
    const clientesSnap = await db.collection("clientes").get();
    const pedidosSnap = await db.collection("pedidos").get();

    const totalClientes = document.getElementById("totalClientes");
    const totalPedidos = document.getElementById("totalPedidos");
    const totalFinanceiro = document.getElementById("totalFinanceiro");

    if (totalClientes) totalClientes.textContent = clientesSnap.size;
    if (totalPedidos) totalPedidos.textContent = pedidosSnap.size;

    let soma = 0;
    pedidosSnap.forEach(doc => {
        soma += Number(doc.data().valor || 0);
    });

    if (totalFinanceiro) totalFinanceiro.textContent = soma;
}

// GRÁFICO
function desenharGrafico() {
    const canvas = document.getElementById("graficoVendas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const valores = [2, 1, 5000];
    const cores = ["#00c6ff", "#0072ff", "#28a745"];
    const larguraBarra = 80;

    valores.forEach((valor, i) => {
        let altura = valor > 100 ? 120 : valor * 40;
        ctx.fillStyle = cores[i];
        ctx.fillRect(50 + (i * 120), 150 - altura, larguraBarra, altura);

        ctx.fillStyle = "#0b3d91";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";

        const nomes = ["Clientes", "Pedidos", "Financeiro"];
        ctx.fillText(nomes[i], 50 + (i * 120) + larguraBarra / 2, 205);
    });
}

window.onload = function () {
    mostrarClientes();
    mostrarPedidos();
    atualizarDashboard();
    desenharGrafico();
};

async function salvarReceituario() {
  const cliente = document.getElementById("clienteReceita").value;
  const telefone = document.getElementById("telefoneReceita").value;
  const adicao = document.getElementById("adicao").value;
  const dnp = document.getElementById("dnp").value;
  const altura = document.getElementById("altura").value;
  const observacoes = document.getElementById("obsReceita").value;

  await db.collection("receituarios").add({
    cliente,
    telefone,
    adicao,
    dnp,
    altura,
    observacoes
  });

  alert("Receituário salvo com sucesso!");
}
function imprimirReceita() {
    const cliente = document.getElementById("clienteReceita").value;
    const telefone = document.getElementById("telefoneReceita").value;
    const adicao = document.getElementById("adicao").value;
    const dnp = document.getElementById("dnp").value;
    const altura = document.getElementById("altura").value;
    const observacoes = document.getElementById("obsReceita").value;
const odLongeEsferico = document.getElementById("odLongeEsferico").value;
const odLongeCilindrico = document.getElementById("odLongeCilindrico").value;
const odLongeEixo = document.getElementById("odLongeEixo").value;

const oeLongeEsferico = document.getElementById("oeLongeEsferico").value;
const oeLongeCilindrico = document.getElementById("oeLongeCilindrico").value;
const oeLongeEixo = document.getElementById("oeLongeEixo").value;
    const conteudo = `
    <html>
    <head>
        <title>Receituário</title>
        <style>
            body {
                font-family: Arial;
                padding: 40px;
            }
            h1, h2 {
                text-align: center;
                color: #0b3d91;
            }
            .box {
                border: 2px solid #0b3d91;
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
            }
            p {
                font-size: 20px;
                margin: 12px 0;
            }
        </style>
    </head>
    <body>
        <h1>Óticas Ventura</h1>
<h2>Receituário</h2>

<p><b>OD Longe:</b> ${odLongeEsferico} / ${odLongeCilindrico} / ${odLongeEixo}</p>
<p><b>OE Longe:</b> ${oeLongeEsferico} / ${oeLongeCilindrico} / ${oeLongeEixo}</p>

<div class="box">
            <p><b>Cliente:</b> ${cliente}</p>
            <p><b>Telefone:</b> ${telefone}</p>
            <p><b>Adição:</b> ${adicao}</p>
            <p><b>DNP / DP:</b> ${dnp}</p>
            <p><b>Altura:</b> ${altura}</p>
            <p><b>Observações:</b> ${observacoes}</p>
        </div>
    </body>
    </html>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(conteudo);
    janela.print();
}
