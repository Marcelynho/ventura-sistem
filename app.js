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
  const odEsferico = document.getElementById("odEsfericoCliente")?.value || "";
const odCilindrico = document.getElementById("odCilindricoCliente")?.value || "";
const odEixo = document.getElementById("odEixoCliente")?.value || "";

const oeEsferico = document.getElementById("oeEsfericoCliente")?.value || "";
const oeCilindrico = document.getElementById("oeCilindricoCliente")?.value || "";
const oeEixo = document.getElementById("oeEixoCliente")?.value || "";

const dnp = document.getElementById("dnpCliente")?.value || "";
const altura = document.getElementById("alturaCliente")?.value || "";
const adicao = document.getElementById("adicaoCliente")?.value || "";
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
      retorno: dataRetorno,
      odEsferico,
odCilindrico,
odEixo,

oeEsferico,
oeCilindrico,
oeEixo,

dnp,
altura,
adicao,
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
      retorno: dataRetorno,
      odEsferico,
odCilindrico,
odEixo,

oeEsferico,
oeCilindrico,
oeEixo,

dnp,
altura,
adicao,

      
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
  const nome = document.getElementById("nomePedido").value;
  const produto = document.getElementById("produtoPedido").value;
  const valor = Number(document.getElementById("valorPedido").value);
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
  let total = 0;

    snapshot.forEach(doc => {
        const pedido = doc.data();
      total += Number(pedido.valor || 0);

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
const caixasSnap = await db.collection("caixas").get();
    const totalClientes = document.getElementById("totalClientes");
    const totalPedidos = document.getElementById("totalPedidos");
    const totalFinanceiro = document.getElementById("totalFinanceiro");

    if (totalClientes) totalClientes.textContent = clientesSnap.size;
    if (totalPedidos) totalPedidos.textContent = pedidosSnap.size;

    let soma = 0;

caixasSnap.forEach(doc => {
  const item = doc.data();

  if (item.tipo === "entrada") {
    soma += Number(item.valor || 0);
  }
});

    if (totalFinanceiro) totalFinanceiro.textContent = soma.toFixed(2);
}

// GRÁFICO
async function desenharGrafico() {
  const canvas = document.getElementById("graficoVendas");
  const canvasFinanceiro = document.getElementById("graficoFinanceiro");

  if (!canvas || !canvasFinanceiro) return;

  const clientesSnap = await db.collection("clientes").get();
const pedidosSnap = await db.collection("pedidos").get();
const caixasSnap = await db.collection("caixas").get();
  let totalFinanceiro = 0;

  

caixasSnap.forEach(doc => {
  const item = doc.data();

  if (item.tipo === "entrada") {
    totalFinanceiro += Number(item.valor || 0);
  }
});

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Clientes", "Pedidos"],
      datasets: [{
        data: [clientesSnap.size, pedidosSnap.size],
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  new Chart(canvasFinanceiro, {
    type: "bar",
    data: {
      labels: ["Faturamento"],
      datasets: [{
        data: [totalFinanceiro],
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
window.onload = function () {
  if (document.getElementById("listaClientes")) mostrarClientes();
  if (document.getElementById("listaPedidos")) mostrarPedidos();
  if (document.getElementById("totalClientes")) atualizarDashboard();
  if (document.getElementById("graficoVendas")) desenharGrafico();
};

async function salvarReceituario() {
  const cliente = document.getElementById("clienteReceita").value;
  const telefone = document.getElementById("telefoneReceita").value;
  const cpf = document.getElementById("cpfReceita").value;
  const adicao = document.getElementById("adicao").value;
  const dnp = document.getElementById("dnp").value;
  const altura = document.getElementById("altura").value;
  const observacoes = document.getElementById("obsReceita").value;

  await db.collection("receituarios").add({
    cliente,
    telefone,
    cpf,
    adicao,
    dnp,
    altura,
    
odLongeEsferico: document.getElementById("odLongeEsferico").value,
odLongeCilindrico: document.getElementById("odLongeCilindrico").value,
odLongeEixo: document.getElementById("odLongeEixo").value,

oeLongeEsferico: document.getElementById("oeLongeEsferico").value,
oeLongeCilindrico: document.getElementById("oeLongeCilindrico").value,
oeLongeEixo: document.getElementById("oeLongeEixo").value,

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
          document.getElementById("telefoneOS").value = cliente.telefone || "";
document.getElementById("cpfOS").value = cliente.cpf || "";
document.getElementById("cepOS").value = cliente.cep || "";
document.getElementById("enderecoOS").value = cliente.endereco || "";
document.getElementById("bairroOS").value = cliente.bairro || "";
document.getElementById("cidadeOS").value = cliente.cidade || "";
          document.getElementById("odEsferico").value = cliente.odEsferico || "";
document.getElementById("odCilindrico").value = cliente.odCilindrico || "";
document.getElementById("odEixo").value = cliente.odEixo || "";

document.getElementById("oeEsferico").value = cliente.oeEsferico || "";
document.getElementById("oeCilindrico").value = cliente.oeCilindrico || "";
document.getElementById("oeEixo").value = cliente.oeEixo || "";

document.getElementById("dnpOS").value = cliente.dnp || "";
document.getElementById("alturaOS").value = cliente.altura || "";
document.getElementById("addOS").value = cliente.adicao || "";
            achou = true;
        }
    });

    if (!achou) {
        alert("Cliente não encontrado");
    }
}
async function salvarOS() {
    const dadosOS = {
        numero: document.getElementById("numeroOS").value,
        cliente: document.getElementById("clienteOS").value,
        lente: document.getElementById("lenteOS").value,
        valor: document.getElementById("valorOS").value,
        entrada: document.getElementById("entradaOS").value,
        restante: document.getElementById("restanteOS").value,
        pagamento: document.getElementById("pagamentoOS").value,
      telefone: document.getElementById("telefoneOS").value,
cpf: document.getElementById("cpfOS").value,
cep: document.getElementById("cepOS").value,
endereco: document.getElementById("enderecoOS").value,
bairro: document.getElementById("bairroOS").value,
cidade: document.getElementById("cidadeOS").value,
      
odEsferico: document.getElementById("odEsferico").value,
odCilindrico: document.getElementById("odCilindrico").value,
odEixo: document.getElementById("odEixo").value,

oeEsferico: document.getElementById("oeEsferico").value,
oeCilindrico: document.getElementById("oeCilindrico").value,
oeEixo: document.getElementById("oeEixo").value,

dnp: document.getElementById("dnpOS").value,
altura: document.getElementById("alturaOS").value,
add: document.getElementById("addOS").value
    };

if (window.osEditandoId) {
    await db.collection("ordens").doc(window.osEditandoId).update(dadosOS);
    alert("OS atualizada com sucesso!");
} else {
    


    await db.collection("ordens").add(dadosOS);
  await db.collection("caixas").add({
  tipo: "entrada",
  descricao: "OS " + dadosOS.numero + " - " + dadosOS.cliente,
  valor: Number(dadosOS.valor || 0),
  pagamento: dadosOS.pagamento || "",
  origem: "ordem_servico",
  os: dadosOS.numero,
  cliente: dadosOS.cliente,
    data: new Date().toLocaleDateString("pt-BR"),
  criadoEm: new Date()
});
    alert("OS salva com sucesso!");
}
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
  const odEsferico = document.getElementById("odEsferico").value;
const odCilindrico = document.getElementById("odCilindrico").value;
const odEixo = document.getElementById("odEixo").value;

const oeEsferico = document.getElementById("oeEsferico").value;
const oeCilindrico = document.getElementById("oeCilindrico").value;
const oeEixo = document.getElementById("oeEixo").value;

const dnp = document.getElementById("dnpOS").value;
const altura = document.getElementById("alturaOS").value;
const add = document.getElementById("addOS").value;

    const conteudo = `
<html>
<head>
<title>OS ${numero}</title>
<style>
body {
    font-family: Arial, sans-serif;
    padding: 25px
    font-size: 20px;
}
h2, h3 {
    text-align: center;
    margin: 10px 0;
}
hr {
    margin: 15px 0;
}
p {
    margin: 6px 0;
    font-size: 22px;
}
.assinatura {
    margin-top: 50px;
    text-align: center;
}
</style>
</head>
<body>

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

<p><b>OD:</b> ${odEsferico} / ${odCilindrico} / ${odEixo}</p>
<p><b>OE:</b> ${oeEsferico} / ${oeCilindrico} / ${oeEixo}</p>
<p><b>DNP:</b> ${dnp}</p>
<p><b>Altura:</b> ${altura}</p>
<p><b>ADD:</b> ${add}</p>

<div class="assinatura">
<p>________________________________</p>
<p><b>Assinatura do Cliente</b></p>
</div>

</body>
</html>
`;

    const janela = window.open("", "_blank");
    janela.document.write(conteudo);
    janela.print();
}
async function buscarOS() {
    const busca = document.getElementById("buscaOS").value.trim();

    const snapshot = await db.collection("ordens").get();

    let achou = false;

    snapshot.forEach(doc => {
  const os = doc.data();
      
  if (
  String(os.numero || os.os || os.OS || os.numeroOS || os.ordem || "").replace(/\D/g, "") === String(busca || "").replace(/\D/g, "") ||
  (os.cliente && os.cliente.toLowerCase().includes(busca.toLowerCase())) ||
  (os.telefone && String(os.telefone).includes(busca)) ||
  (os.cpf && String(os.cpf).includes(busca))
) {
    window.osEditandoId = doc.id;

    document.getElementById("numeroOS").value = os.numero || os.os || os.OS || os.numeroOS || os.ordem || "";
    document.getElementById("clienteOS").value = os.cliente || "";
    document.getElementById("telefoneOS").value = os.telefone || "";
    document.getElementById("cpfOS").value = os.cpf || "";
    document.getElementById("cepOS").value = os.cep || "";
    document.getElementById("enderecoOS").value = os.endereco || "";
    document.getElementById("bairroOS").value = os.bairro || "";
    document.getElementById("cidadeOS").value = os.cidade || "";

    document.getElementById("lenteOS").value = os.lente || "";
    document.getElementById("valorOS").value = os.valor || "";
    document.getElementById("entradaOS").value = os.entrada || "";
    document.getElementById("restanteOS").value = os.restante || "";
    document.getElementById("pagamentoOS").value = os.pagamento || "";

    document.getElementById("odEsferico").value = os.odEsferico || "";
    document.getElementById("odCilindrico").value = os.odCilindrico || "";
    document.getElementById("odEixo").value = os.odEixo || "";

    document.getElementById("oeEsferico").value = os.oeEsferico || "";
    document.getElementById("oeCilindrico").value = os.oeCilindrico || "";
    document.getElementById("oeEixo").value = os.oeEixo || "";

    document.getElementById("dnpOS").value = os.dnp || "";
    document.getElementById("alturaOS").value = os.altura || "";
    document.getElementById("addOS").value = os.add || "";

    achou = true;
  }
});
      
 
    if (!achou) {
        alert("OS não encontrada");
    }
}
setTimeout(() => {
    const valor = document.getElementById("valorOS");
    const entrada = document.getElementById("entradaOS");
    const restante = document.getElementById("restanteOS");

    if (valor && entrada && restante) {
        function calcularRestante() {
            const total = parseFloat(valor.value.replace(",", ".")) || 0;
            const pago = parseFloat(entrada.value.replace(",", ".")) || 0;
            restante.value = (total - pago).toFixed(2).replace(".", ",");
        }

        valor.addEventListener("input", calcularRestante);
        entrada.addEventListener("input", calcularRestante);
    }
}, 1000);
async function listarOS() {
  const listaDiv = document.getElementById("listaOS");
  listaDiv.innerHTML = "Carregando...";

  const snapshot = await db.collection("ordens").get();

  let html = "";

  snapshot.forEach(doc => {
    const os = doc.data();

    html += `
  <div style="border:1px solid #ccc; margin:5px; padding:5px; display:flex; justify-content:space-between; align-items:center;">
    <div>
      <b>OS:</b> ${os.numero || ""}<br>
      <b>Cliente:</b> ${os.cliente || ""}<br>
      <b>Telefone:</b> ${os.telefone || ""}<br>
    </div>

    <button onclick="deletarOSPorId('${doc.id}', '${os.numero || ""}')"
      style="background:red; color:white; border:none; padding:8px; cursor:pointer; border-radius:5px;">
      🗑 Deletar
    </button>
  </div>
`;
  });

  listaDiv.innerHTML = html || "Nenhuma OS encontrada";
}


let caixaAbertoId = null;
let totalEntradas = 0;
let totalSaidas = 0;
let valorInicialCaixaAtual = 0;

async function abrirCaixa() {
  const valorInicial = document.getElementById("valorInicialCaixa").value;
  const funcionario = document.getElementById("funcionarioCaixa").value;

  if (!valorInicial || !funcionario) {
    alert("Preencha valor inicial e funcionário");
    return;
  }

  const docRef = await db.collection("caixas").add({
    valorInicial: Number(valorInicial),
    funcionario,
    abertoEm: new Date(),
    status: "aberto"
  });

  caixaAbertoId = docRef.id;
  valorInicialCaixaAtual = Number(valorInicial);
document.getElementById("resumoInicial").innerText = valorInicial;
document.getElementById("resumoSaldo").innerText = valorInicial;

  alert("Caixa aberto com sucesso!");
}

async function registrarMovimento() {
  if (!caixaAbertoId) {
    alert("Abra o caixa primeiro!");
    return;
  }

  const descricao = document.getElementById("descricaoMovimento").value;
  const valor = document.getElementById("valorMovimento").value;
  const tipo = document.getElementById("tipoMovimento").value;
  

  if (!descricao || !valor) {
    alert("Preencha descrição e valor");
    return;
  }
if (tipo === "entrada") {
   totalEntradas += Number(valor);
} else {
   totalSaidas += Number(valor);
}

const saldo = valorInicialCaixaAtual + totalEntradas - totalSaidas;

document.getElementById("resumoEntradas").innerText = totalEntradas;
document.getElementById("resumoSaidas").innerText = totalSaidas;
document.getElementById("resumoSaldo").innerText = saldo;
  await db.collection("caixas").doc(caixaAbertoId).collection("movimentos").add({
    descricao,
    valor: Number(valor),
    tipo,
    criadoEm: new Date()
  });

  alert("Movimento registrado!");
}

async function fecharCaixa() {
  if (!caixaAbertoId) {
    alert("Abra o caixa primeiro!");
    return;
  }

  const valorConferido = document.getElementById("valorConferidoCaixa").value;

  if (!valorConferido) {
    alert("Informe o valor conferido");
    return;
  }
const saldoEsperado = valorInicialCaixaAtual + totalEntradas - totalSaidas;
const diferenca = Number(valorConferido) - saldoEsperado;

document.getElementById("resumoConferido").innerText = valorConferido;
document.getElementById("resumoDiferenca").innerText = diferenca;
  await db.collection("caixas").doc(caixaAbertoId).update({
    valorConferido: Number(valorConferido),
    fechadoEm: new Date(),
    status: "fechado"
  });
  await db.collection("historicoCaixa").add({
    funcionario: document.getElementById("funcionarioCaixa").value,
    valorInicial: valorInicialCaixaAtual,
    entradas: totalEntradas,
    saidas: totalSaidas,
    saldoEsperado: saldoEsperado,
    valorConferido: Number(valorConferido),
    diferenca: diferenca,
    fechadoEm: new Date()
});

  alert("Caixa fechado com sucesso!");
  caixaAbertoId = null;
}
async function carregarHistoricoCaixa() {
  const tabela = document.querySelector("#tabelaHistorico tbody");
  if (!tabela) return;

  tabela.innerHTML = "";

  const snapshot = await db.collection("historicoCaixa")
    .orderBy("fechadoEm", "desc")
    .get();

  snapshot.forEach(doc => {
    const h = doc.data();
    const filtroFuncionario = document.getElementById("filtroFuncionario")?.value.toLowerCase() || "";
const filtroData = document.getElementById("filtroData")?.value || "";

const nomeFuncionario = (h.funcionario || "").toLowerCase();
const dataFormatada = h.fechadoEm
  ? new Date(h.fechadoEm.seconds * 1000).toISOString().split("T")[0]
  : "";

if (filtroFuncionario && !nomeFuncionario.includes(filtroFuncionario)) return;
if (filtroData && dataFormatada !== filtroData) return;

    tabela.innerHTML += `
      <tr>
        <td>${h.funcionario || ""}</td>
        <td>R$ ${h.valorInicial || 0}</td>
        <td>R$ ${h.entradas || 0}</td>
        <td>R$ ${h.saidas || 0}</td>
        <td>R$ ${h.valorConferido || 0}</td>
        <td>${h.fechadoEm ? new Date(h.fechadoEm.seconds * 1000).toLocaleDateString('pt-BR') : '-'}</td>
        <td>R$ ${h.diferenca || 0}</td>
      </tr>
    `;
  });
}

carregarHistoricoCaixa();
function imprimirCaixa() {
  window.print();
}
async function carregarFinanceiro() {
  let totalMes = 0;
  let totalPedidos = 0;

  const snapshot = await db.collection("caixas").get();
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  snapshot.forEach(doc => {
    const pedido = doc.data();

    if (!pedido.valor) return;

    
let ano = anoAtual;
let mes = mesAtual;

if (pedido.data) {
const partes = pedido.data.split("/");
mes = parseInt(partes[1]);
ano = parseInt(partes[2]);
}

    if (mes === mesAtual && ano === anoAtual) {
      totalMes += Number(pedido.valor);
      totalPedidos++;
    }
  });

  document.getElementById("totalFinanceiro").innerText =
    totalMes.toFixed(2);

  document.getElementById("totalPedidos").innerText =
    totalPedidos;
}
if (window.location.pathname.includes("financeiro")) {
  carregarFinanceiro();
}
if (document.getElementById("graficoFinanceiro")) {
  desenharGrafico();
}
async function deletarOS() {
  const numero = document.getElementById("numeroOS").value;

  if (!numero) {
    alert("Digite o número da OS.");
    return;
  }

  if (!confirm("Tem certeza que deseja deletar esta OS?")) {
    return;
  }

  const osSnap = await db.collection("ordens")
    .where("numero", "==", numero)
    .get();

  if (osSnap.empty) {
    alert("OS não encontrada.");
    return;
  }

  osSnap.forEach(async (doc) => {
    await db.collection("ordens").doc(doc.id).delete();
  });

  const caixaSnap = await db.collection("caixas")
    .where("os", "==", numero)
    .get();
  alert("Encontrados em caixas: " + caixaSnap.size);

  caixaSnap.forEach(async (doc) => {
    await db.collection("caixas").doc(doc.id).delete();
  });

  alert("OS deletada com sucesso!");
}

async function deletarOSPorId(id, numero) {
if (!confirm("Tem certeza que deseja deletar esta OS?")) {
return;
}

await db.collection("ordens").doc(id).delete();

const caixaSnap = await db.collection("caixas").get();

caixaSnap.forEach(async (doc) => {
const item = doc.data();

if (numero && String(item.os || "") === String(numero)) {
await db.collection("caixas").doc(doc.id).delete();
}
});

alert("OS deletada com sucesso!");
listarOS();
}
async function buscarClienteOS() {
const busca = document.getElementById("buscaClienteOS").value.trim().toLowerCase();

if (!busca) {
alert("Digite nome, telefone ou CPF.");
return;
}

const snapshot = await db.collection("clientes").get();
let encontrado = null;

snapshot.forEach(doc => {
const cliente = doc.data();

const nome = String(cliente.nome || "").toLowerCase();
const telefone = String(cliente.telefone || "");
const cpf = String(cliente.cpf || "");

if (nome.includes(busca) || telefone.includes(busca) || cpf.includes(busca)) {
encontrado = cliente;
}
});

if (!encontrado) {
alert("Cliente não encontrado.");
return;
}

document.getElementById("clienteOS").value = encontrado.nome || "";
document.getElementById("telefoneOS").value = encontrado.telefone || "";
document.getElementById("cpfOS").value = encontrado.cpf || "";
document.getElementById("cepOS").value = encontrado.cep || "";
document.getElementById("enderecoOS").value = encontrado.endereco || "";
}
async function buscarClientePedido() {
  const busca = document.getElementById("buscaClientePedido").value.trim().toLowerCase();

  if (!busca) {
    alert("Digite nome, telefone ou CPF.");
    return;
  }

  const snapshot = await db.collection("clientes").get();
  let encontrado = null;

  snapshot.forEach(doc => {
    const cliente = doc.data();

    const nome = String(cliente.nome || "").toLowerCase();
    const telefone = String(cliente.telefone || "");
    const cpf = String(cliente.cpf || "");

    if (
      nome.includes(busca) ||
      telefone.includes(busca) ||
      cpf.includes(busca)
    ) {
      encontrado = cliente;
    }
  });

  if (!encontrado) {
    alert("Cliente não encontrado.");
    return;
  }

  document.getElementById("nomePedido").value = encontrado.nome || "";
}
async function buscarClienteReceita() {
  const busca = document.getElementById("buscaClienteReceita").value.trim().toLowerCase();

  if (!busca) {
    alert("Digite nome, telefone ou CPF.");
    return;
  }

  const snapshot = await db.collection("clientes").get();
  let encontrado = null;

  snapshot.forEach(doc => {
    const cliente = doc.data();

    const nome = String(cliente.nome || "").toLowerCase();
    const telefone = String(cliente.telefone || "");
    const cpf = String(cliente.cpf || "");

    if (
      nome.includes(busca) ||
      telefone.includes(busca) ||
      cpf.includes(busca)
    ) {
      encontrado = cliente;
    }
  });

  if (!encontrado) {
    alert("Cliente não encontrado.");
    return;
  }

  document.getElementById("clienteReceita").value = encontrado.nome || "";
  document.getElementById("telefoneReceita").value = encontrado.telefone || "";
  document.getElementById("cpfReceita").value = encontrado.cpf || "";
}
