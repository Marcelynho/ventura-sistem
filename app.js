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
let filtroStatus = "todos";

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
  const cpf = document.getElementById("cpfCliente").value;
const cep = document.getElementById("cepCliente").value;
const endereco = document.getElementById("enderecoCliente").value;
const bairro = document.getElementById("bairroCliente").value;
const cidade = document.getElementById("cidadeCliente").value;
const nascimento = document.getElementById("nascimentoCliente").value;
  const retorno = new Date();
retorno.setFullYear(retorno.getFullYear() + 1);
const dataRetorno = retorno.toISOString().split("T")[0];
const observacoes = document.getElementById("obsCliente").value;
  if (window.clienteEditandoId) {
    await db.collection("clientes").doc(window.clienteEditandoId).update({
        nome,
        telefone,
        cpf,
        cep,
        endereco,
        bairro,
        cidade,
        nascimento,
        observacoes,
      retorno: dataRetorno
    });

    window.clienteEditandoId = null;
    mostrarClientes();
    alert("Cliente atualizado com sucesso!");
    return;
}
    await db.collection("clientes").add({
    nome,
    telefone,
      cpf,
      cep,
    endereco,
    bairro,
    cidade,
    nascimento,
    observacoes,
      retorno: dataRetorno
      

      
});

    mostrarClientes();
    alert("Cliente salvo com sucesso!");
}

async function mostrarClientes() {
    const lista = document.getElementById("listaClientes");
  const buscaInput = document.getElementById("buscaCliente");
const busca = buscaInput ? buscaInput.value.toLowerCase() : "";
    if (!lista) return;

    lista.innerHTML = `
        <tr>
            <th>Nome</th>
<th>Telefone</th>
<th>Endereço</th>
<th>Bairro</th>
<th>Cidade</th>
<th>Retorno</th>
<th>Status</th>
<th>Ações</th>
        </tr>
    `;

    const snapshot = await db.collection("clientes").get();
  let totalClientes = 0;
let totalVencidos = 0;
let totalHoje = 0;
let totalSem = 0;
let totalPrazo = 0;

    snapshot.forEach(doc => {
        const cliente = doc.data();
      totalClientes++;
      const hoje = new Date().toISOString().split("T")[0];

let status = "⚪ Sem retorno";
totalSem++;

if (cliente.retorno) {
    totalSem--;
    totalPrazo++;
    status = "🟢 No prazo";
    if (cliente.retorno < hoje) {
    status = "🔴 Vencido";
    totalVencidos++;
} else if (cliente.retorno === hoje) {
    status = "🟡 Vence hoje";
    totalHoje++;
}
}

if (filtroStatus === "vencido" && status !== "🔴 Vencido") return;
if (filtroStatus === "hoje" && status !== "🟡 Vence hoje") return;
if (filtroStatus === "sem" && status !== "⚪ Sem retorno") return;
if (filtroStatus === "prazo" && status !== "🟢 No prazo") return;

if (
    busca &&
    !cliente.nome.toLowerCase().includes(busca) &&
    !(cliente.telefone || "").toLowerCase().includes(busca)
) {
    return;
}

        lista.innerHTML += `
<tr>
    <td>${cliente.nome}</td>
    <td>${cliente.telefone}</td>
    <td>${cliente.endereco || ""}</td>
    <td>${cliente.bairro || ""}</td>
    <td>${cliente.cidade || ""}</td>
    <td>${cliente.retorno || "-"}</td>
    <td>${status}</td>

    <td>
        <button onclick="abrirWhatsApp('${cliente.telefone}')">
            WhatsApp
        </button>

        <br><br>
     

        <button onclick="editarCliente('${doc.id}')">
            Editar
        </button>

        <br><br>

        <button onclick="excluirCliente('${doc.id}')">
            Excluir
        </button>
    </td>
</tr>
`;
    });
  document.getElementById("btnVencidos").innerText = `🔴 Vencidos (${totalVencidos})`;
document.getElementById("btnHoje").innerText = `🟡 Vence hoje (${totalHoje})`;
document.getElementById("totalClientes").innerText = totalClientes;
document.getElementById("totalVencidosCard").innerText = totalVencidos;
document.getElementById("totalHojeCard").innerText = totalHoje;
document.getElementById("totalSemCard").innerText = totalSem;
document.getElementById("totalPrazoCard").innerText = totalPrazo;
}

async function excluirCliente(id) {
    await db.collection("clientes").doc(id).delete();
    mostrarClientes();
}

async function editarCliente(id) {
    const doc = await db.collection("clientes").doc(id).get();
    const cliente = doc.data();

    document.getElementById("nomeCliente").value = cliente.nome || "";
    document.getElementById("telefoneCliente").value = cliente.telefone || "";
    document.getElementById("enderecoCliente").value = cliente.endereco || "";
    document.getElementById("bairroCliente").value = cliente.bairro || "";
    document.getElementById("cidadeCliente").value = cliente.cidade || "";
    document.getElementById("nascimentoCliente").value = cliente.nascimento || "";
    document.getElementById("obsCliente").value = cliente.observacoes || "";

    window.clienteEditandoId = id;

    alert("Cliente carregado para edição!");
}

function abrirWhatsApp(telefone) {
  const numero = telefone.replace(/\D/g, "");

  const mensagem = "Olá! Aqui é da Óticas Ventura";

  const link = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(link, "_blank");
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
    font-family: Arial, sans-serif;
    padding: 30px;
    background: #f5f7fb;
}

h1, h2 {
    text-align: center;
    color: #0b3d91;
}

.box {
    border: 2px solid #0b3d91;
    border-radius: 15px;
    padding: 25px;
    margin-top: 20px;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
max-width: 700px;
margin-left: auto;
margin-right: auto;
}

.logo-box {
    text-align: center;
    margin-bottom: 15px;
}

.logo {
   width: 160px;
   height: 160px;
   border-radius: 50%;
   display: block;
   margin: 0 auto;
}
p {
    font-size: 20px;
    margin: 12px 0;
}

.assinatura {
    margin-top:100px;
    text-align: center;
    font-size: 30px;
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
    <div class="logo-box">
        <img src="./WhatsApp%20Image%202026-06-14%20at%2019.34.42.jpeg" class="logo">
    </div>

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
        <div class="assinatura">_________________________<br>Assinatura do responsável</div>
    </body>
    </html>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(conteudo);
    janela.print();
}
setTimeout(() => {
    const campoBusca = document.getElementById("buscarCliente");

    if (campoBusca) {
        campoBusca.addEventListener("input", function () {
            let busca = this.value.toLowerCase();
            let linhas = document.querySelectorAll("#listaClientes tr");

            linhas.forEach((linha, index) => {
                if (index === 0) return;

                let texto = linha.innerText.toLowerCase();

                linha.style.display = texto.includes(busca) ? "" : "none";
            });
        });
    }
}, 1000);
async function buscarClienteOS() {
  
    const busca = document.getElementById("buscaClienteOS").value.toLowerCase();

    const snapshot = await db.collection("clientes").get();
  
    let achou = false;

    snapshot.forEach(doc => {
        const cliente = doc.data();

        if (
            (cliente.nome && cliente.nome.toLowerCase().includes(busca)) ||
            (cliente.telefone && cliente.telefone.includes(busca)) ||
            (cliente.cpf && cliente.cpf.includes(busca))
        ) {
            document.getElementById("clienteOS").value = cliente.nome || "";
            achou = true;
        }
    });

    if (!achou) {
        alert("Cliente não encontrado");
    }
}
async function salvarOS() {
    await db.collection("ordens").add({
        numero: document.getElementById("numeroOS").value,
        cliente: document.getElementById("clienteOS").value,
        lente: document.getElementById("lenteOS").value,
        valor: document.getElementById("valorOS").value,
        entrada: document.getElementById("entradaOS").value,
        restante: document.getElementById("restanteOS").value,
        pagamento: document.getElementById("pagamentoOS").value
    });
  document.getElementById("numeroOS").value = "";
document.getElementById("clienteOS").value = "";
document.getElementById("lenteOS").value = "";
document.getElementById("valorOS").value = "";
document.getElementById("entradaOS").value = "";
document.getElementById("restanteOS").value = "";
document.getElementById("pagamentoOS").value = "";

    alert("OS salva com sucesso!");
}
function imprimirOS() {
    const numero = document.getElementById("numeroOS").value;
    const cliente = document.getElementById("clienteOS").value;
    const lente = document.getElementById("lenteOS").value;
    const valor = document.getElementById("valorOS").value;
    const entrada = document.getElementById("entradaOS").value;
    const restante = document.getElementById("restanteOS").value;
    const pagamento = document.getElementById("pagamentoOS").value;

    const conteudo = `
        <h2>Óticas Ventura</h2>
        <h3>Ordem de Serviço Nº ${numero}</h3>
        <hr>

        <p><b>Cliente:</b> ${cliente}</p>
        <p><b>Lente / Produto:</b> ${lente}</p>
        <p><b>Valor Total:</b> R$ ${valor}</p>
        <p><b>Entrada:</b> R$ ${entrada}</p>
        <p><b>Restante:</b> R$ ${restante}</p>
        <p><b>Forma de Pagamento:</b> ${pagamento}</p>

        <hr>
        <p><b>Assinatura do cliente:</b> ______________________________</p>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(conteudo);
    janela.print();
}

