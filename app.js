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

async function garantirCaixaAberto() {
  try {
    const snapshot = await db.collection("caixas")
      .where("status", "==", "aberto")
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert("Abra o caixa antes de cadastrar ou salvar informações no sistema.");
      return false;
    }

    return true;
  } catch (erro) {
    console.error("Erro ao verificar caixa aberto:", erro);
    alert("Não foi possível verificar o caixa. Tente novamente.");
    return false;
  }
}

let renderClientesToken = 0;

// PROTEÇÃO DE LOGIN
firebase.auth().onAuthStateChanged((user) => {
    if (!window.location.href.includes("login.html") && !user) {
        window.location.href = "login.html";
    }
});

// LOGIN
function fazerLogin() {
    const email = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    firebase.auth().signInWithEmailAndPassword(email, senha)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            alert("Email ou senha incorretos!");
            console.log(error);
        });
}

function logout() {
    firebase.auth().signOut()
        .then(() => {
            window.location.href = "login.html";
        })
        .catch((error) => {
            alert("Erro ao sair do sistema.");
            console.log(error);
        });
}

// CLIENTES
async function salvarCliente() {
  if (!(await garantirCaixaAberto())) return;
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
  const tokenAtual = ++renderClientesToken;
  const lista = document.getElementById("listaClientes");
  const buscaInput = document.getElementById("buscaCliente");
  const busca = buscaInput ? buscaInput.value.toLowerCase() : "";

  if (!lista) return;

  const snapshot = await db.collection("clientes").get();

  if (tokenAtual !== renderClientesToken) return;

  let totalClientes = 0;
  let totalVencidos = 0;
  let totalHoje = 0;
  let totalSem = 0;
  let totalPrazo = 0;

  let linhas = `
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
        totalPrazo--;
        totalVencidos++;
      } else if (cliente.retorno === hoje) {
        status = "🟡 Vence hoje";
        totalPrazo--;
        totalHoje++;
      }
    }

    if (filtroStatus === "vencido" && status !== "🔴 Vencido") return;
    if (filtroStatus === "hoje" && status !== "🟡 Vence hoje") return;
    if (filtroStatus === "sem" && status !== "⚪ Sem retorno") return;
    if (filtroStatus === "prazo" && status !== "🟢 No prazo") return;

    const nome = String(cliente.nome || "").toLowerCase();
    const telefone = String(cliente.telefone || "").toLowerCase();

    if (busca && !nome.includes(busca) && !telefone.includes(busca)) {
      return;
    }

    linhas += `
      <tr>
        <td>${cliente.nome || ""}</td>
        <td>${cliente.telefone || ""}</td>
        <td>${cliente.endereco || ""}</td>
        <td>${cliente.bairro || ""}</td>
        <td>${cliente.cidade || ""}</td>
        <td>${cliente.retorno || "-"}</td>
        <td>${status}</td>
        <td>
          <button onclick="abrirWhatsApp('${cliente.telefone || ""}')">WhatsApp</button>
          <button onclick="editarCliente('${doc.id}')">Editar</button>
          <button onclick="excluirCliente('${doc.id}')">Excluir</button>
        </td>
      </tr>
    `;
  });

  if (tokenAtual !== renderClientesToken) return;

  lista.innerHTML = linhas;

  const btnVencidos = document.getElementById("btnVencidos");
  const btnHoje = document.getElementById("btnHoje");
  const campoTotalClientes = document.getElementById("totalClientes");
  const campoTotalVencidos = document.getElementById("totalVencidosCard");
  const campoTotalHoje = document.getElementById("totalHojeCard");
  const campoTotalSem = document.getElementById("totalSemCard");
  const campoTotalPrazo = document.getElementById("totalPrazoCard");

  if (btnVencidos) btnVencidos.innerText = `🔴 Vencidos (${totalVencidos})`;
  if (btnHoje) btnHoje.innerText = `🟡 Vence hoje (${totalHoje})`;
  if (campoTotalClientes) campoTotalClientes.innerText = totalClientes;
  if (campoTotalVencidos) campoTotalVencidos.innerText = totalVencidos;
  if (campoTotalHoje) campoTotalHoje.innerText = totalHoje;
  if (campoTotalSem) campoTotalSem.innerText = totalSem;
  if (campoTotalPrazo) campoTotalPrazo.innerText = totalPrazo;
}

async function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente e suas receitas?")) {
    return;
  }

  const receitasSnap = await db
    .collection("receituarios")
    .where("clienteId", "==", id)
    .get();

  const exclusoesReceitas = receitasSnap.docs.map(doc => doc.ref.delete());
  await Promise.all(exclusoesReceitas);

  await db.collection("clientes").doc(id).delete();

  await mostrarClientes();

  if (typeof atualizarDashboard === "function") {
    await atualizarDashboard();
  }

  alert("Cliente e receitas excluídos com sucesso!");
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
  if (!(await garantirCaixaAberto())) return;

  const nome = document.getElementById("nomePedido").value.trim();
  const lente = document.getElementById("lentePedido").value.trim();
  const armacao = document.getElementById("armacaoPedido").value.trim();
  const valor = Number(document.getElementById("valorPedido").value);
  const data = new Date().toLocaleDateString("pt-BR");

  if (!nome || !lente || !armacao || !valor) {
    alert("Preencha nome, lente, armação e valor.");
    return;
  }

  const dadosPedido = {
    nome,
    clienteId: window.clientePedidoId || "",
    telefone: window.clientePedidoTelefone || "",
    cpf: window.clientePedidoCpf || "",
    lente,
    armacao,
    produto: lente,
    valor,
    data,
    criadoEm: new Date()
  };

  if (window.pedidoEditandoId) {
    await db.collection("pedidos").doc(window.pedidoEditandoId).update(dadosPedido);
    window.pedidoEditandoId = null;
    alert("Pedido atualizado com sucesso!");
  } else {
    await db.collection("pedidos").add(dadosPedido);
    alert("Pedido salvo com sucesso!");
  }

  document.getElementById("nomePedido").value = "";
  document.getElementById("lentePedido").value = "";
  document.getElementById("armacaoPedido").value = "";
  document.getElementById("valorPedido").value = "";

  await mostrarPedidos();
  await atualizarDashboard();
}

async function mostrarPedidos() {
  const lista = document.getElementById("listaPedidos");
  if (!lista) return;

  lista.innerHTML = "";

  const snapshot = await db.collection("pedidos").get();

  snapshot.forEach(doc => {
    const pedido = doc.data();
    const lente = pedido.lente || pedido.produto || "";
    const armacao = pedido.armacao || "";

    lista.innerHTML += `
      <p>
        <strong>${pedido.nome || ""}</strong><br>
        Lente: ${lente || "-"}<br>
        Armação: ${armacao || "-"}<br>
        Valor: R$ ${pedido.valor || 0}<br>
        Data: ${pedido.data || "-"}<br>
        <button onclick="editarPedido('${doc.id}')">Editar</button>
        <button onclick="excluirPedido('${doc.id}')">Excluir</button>
      </p>
      <hr>
    `;
  });
}

async function editarPedido(id) {
  const doc = await db.collection("pedidos").doc(id).get();

  if (!doc.exists) {
    alert("Pedido não encontrado.");
    return;
  }

  const pedido = doc.data();

  document.getElementById("nomePedido").value = pedido.nome || "";
  document.getElementById("lentePedido").value = pedido.lente || pedido.produto || "";
  document.getElementById("armacaoPedido").value = pedido.armacao || "";
  document.getElementById("valorPedido").value = pedido.valor || "";

  window.clientePedidoId = pedido.clienteId || "";
  window.clientePedidoTelefone = pedido.telefone || "";
  window.clientePedidoCpf = pedido.cpf || "";
  window.pedidoEditandoId = id;

  document.getElementById("nomePedido").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  alert("Pedido carregado para edição.");
}

async function excluirPedido(id) {
  if (!confirm("Deseja realmente excluir este pedido?")) {
    return;
  }

  await db.collection("pedidos").doc(id).delete();

  const caixasSnap = await db
    .collection("caixas")
    .where("pedidoId", "==", id)
    .get();

  const exclusoes = caixasSnap.docs.map(doc => doc.ref.delete());
  await Promise.all(exclusoes);

  await mostrarPedidos();
  await atualizarDashboard();

  if (typeof carregarFinanceiro === "function") {
    await carregarFinanceiro();
  }

  alert("Pedido excluído com sucesso!");
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

pedidosSnap.forEach(doc => {
  const item = doc.data();
  soma += Number(item.valor || 0);
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

  

pedidosSnap.forEach(doc => {
  const item = doc.data();
  totalFinanceiro += Number(item.valor || 0);
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
function converterGrau(valor) {
  if (!valor) return null;
  return Number(String(valor).replace(",", ".").replace("+", ""));
}

function formatarGrau(valor) {
  if (valor === null || isNaN(valor)) return "";
  const sinal = valor > 0 ? "+" : "";
  return sinal + valor.toFixed(2).replace(".", ",");
}

function calcularPerto() {
  const adicao = converterGrau(document.getElementById("adicao")?.value);
  const odLonge = converterGrau(document.getElementById("odLongeEsferico")?.value);
  const oeLonge = converterGrau(document.getElementById("oeLongeEsferico")?.value);

  if (adicao !== null && odLonge !== null) {
    document.getElementById("odPertoEsferico").value = formatarGrau(odLonge + adicao);
  }

  if (adicao !== null && oeLonge !== null) {
    document.getElementById("oePertoEsferico").value = formatarGrau(oeLonge + adicao);
  }
 }
async function salvarReceituario() {
  if (!(await garantirCaixaAberto())) return;
  const cliente = document.getElementById("clienteReceita").value;
  const telefone = document.getElementById("telefoneReceita").value;
  const cpf = document.getElementById("cpfReceita").value;
  const adicao = document.getElementById("adicao").value;
  const dnp = document.getElementById("dnp").value;
  const altura = document.getElementById("altura").value;
  const observacoes = document.getElementById("obsReceita").value;

  await db.collection("receituarios").add({
    cliente,
    clienteId: window.clienteReceitaId || "",
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

observacoes,
criadoEm: new Date()
  });

  alert("Receituário salvo com sucesso!");
}
async function apagarReceita() {
const nome = document.getElementById("clienteReceita").value;
const telefone = document.getElementById("telefoneReceita").value;
const cpf = document.getElementById("cpfReceita").value;

if (!nome && !telefone && !cpf) {
alert("Busque uma receita antes de apagar.");
return;
}

if (!confirm("Deseja apagar esta receita?")) return;

const snap = await db.collection("receituarios").get();

snap.forEach(async (doc) => {
const r = doc.data();

if (
String(r.cpf || "") === String(cpf || "") ||
String(r.telefone || "") === String(telefone || "") ||
String(r.cliente || "").toLowerCase() === String(nome || "").toLowerCase()
) {
await db.collection("receituarios").doc(doc.id).delete();
}
});

alert("Receita apagada com sucesso!");
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

<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">

    <div style="width:60%;">
        <p><b>OD Longe:</b> ${odLongeEsferico} / ${odLongeCilindrico} / ${odLongeEixo}</p>
        <p><b>OE Longe:</b> ${oeLongeEsferico} / ${oeLongeCilindrico} / ${oeLongeEixo}</p>
    </div>

    <div style="width:30%; padding-left:20px;">
        <p><b>DNP:</b> ${dnp} mm</p>
<p><b>Altura:</b> ${altura} mm</p>
<p><b>Adição:</b> ${adicao}</p>
    </div>

</div>

<div class="box">
    <p><b>Cliente:</b> ${cliente}</p>
    <p><b>Telefone:</b> ${telefone}</p>
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
const campoBusca = document.getElementById("buscaClienteOS");
const buscaOriginal = campoBusca.value.trim();

if (!buscaOriginal) {
alert("Digite o nome completo, telefone ou CPF do cliente.");
return;
}

const buscaTexto = buscaOriginal.toLowerCase();
const buscaNumerica = buscaOriginal.replace(/\D/g, "");

const snapshot = await db.collection("clientes").get();

const clienteEncontrado = snapshot.docs
.map(doc => ({
    id: doc.id,
    ...doc.data()
}))
.find(cliente => {
const nome = String(cliente.nome || "").trim().toLowerCase();
const telefone = String(cliente.telefone || "").replace(/\D/g, "");
const cpf = String(cliente.cpf || "").replace(/\D/g, "");

return (
nome === buscaTexto ||
(buscaNumerica && telefone === buscaNumerica) ||
(buscaNumerica && cpf === buscaNumerica)
);
});

if (!clienteEncontrado) {
alert("Cliente não encontrado. Digite o nome completo, telefone ou CPF.");
return;
}

const cliente = clienteEncontrado;
  window.clienteOSId = cliente.id;

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

const receitasSnap = await db.collection("receituarios").get();

const cpfCliente = String(cliente.cpf || "").replace(/\D/g, "");
const telefoneCliente = String(cliente.telefone || "").replace(/\D/g, "");

const receitasDoCliente = receitasSnap.docs
    .map(doc => doc.data())
    .filter(receita => {
        const cpfReceita = String(receita.cpf || "").replace(/\D/g, "");
        const telefoneReceita = String(receita.telefone || "").replace(/\D/g, "");

        return (
            receita.clienteId === cliente.id ||
            (cpfCliente && cpfReceita === cpfCliente) ||
            (telefoneCliente && telefoneReceita === telefoneCliente)
        );
    });

const receitaEncontrada = receitasDoCliente.sort((a, b) => {
    const dataA = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
const dataB = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;

    return dataB - dataA;
})[0] || null;

if (receitaEncontrada) {
const receita = receitaEncontrada;

document.getElementById("odEsferico").value =
receita.odLongeEsferico || cliente.odEsferico || "";

document.getElementById("odCilindrico").value =
receita.odLongeCilindrico || cliente.odCilindrico || "";

document.getElementById("odEixo").value =
receita.odLongeEixo || cliente.odEixo || "";

document.getElementById("oeEsferico").value =
receita.oeLongeEsferico || cliente.oeEsferico || "";

document.getElementById("oeCilindrico").value =
receita.oeLongeCilindrico || cliente.oeCilindrico || "";

document.getElementById("oeEixo").value =
receita.oeLongeEixo || cliente.oeEixo || "";

document.getElementById("dnpOS").value =
receita.dnp || cliente.dnp || "";

document.getElementById("alturaOS").value =
receita.altura || cliente.altura || "";

document.getElementById("addOS").value =
receita.adicao || cliente.adicao || "";
}
  // Buscar último pedido do cliente
const pedidosSnapshot = await db.collection("pedidos")
    .where("clienteId", "==", cliente.id)
    .get();

let ultimoPedido = null;

pedidosSnapshot.forEach(doc => {
    const pedido = doc.data();

    if (
        !ultimoPedido ||
        (pedido.criadoEm &&
         ultimoPedido.criadoEm &&
         pedido.criadoEm.toMillis() > ultimoPedido.criadoEm.toMillis())
    ) {
        ultimoPedido = pedido;
    }
});

if (ultimoPedido) {
  document.getElementById("lenteOS").value =
    ultimoPedido.lente || ultimoPedido.produto || "";

  const campoArmacaoOS = document.getElementById("armacaoOS");
  if (campoArmacaoOS) {
    campoArmacaoOS.value = ultimoPedido.armacao || "";
  }
    document.getElementById("valorOS").value = ultimoPedido.valor || "";
}

alert("Cliente encontrado!");
}
async function salvarOS() {
  if (!(await garantirCaixaAberto())) return;
  const valorTotal = Number(
  String(document.getElementById("valorOS").value || 0).replace(",", ".")
);

const valorEntrada = Number(
  String(document.getElementById("entradaOS").value || 0).replace(",", ".")
);

const valorRestante = Math.max(valorTotal - valorEntrada, 0);
    const dadosOS = {
        numero: document.getElementById("numeroOS").value,
        dataCompra: document.getElementById("dataCompraOS")?.value || "",
        vendedor: document.getElementById("vendedorOS")?.value || "",
        previsaoEntrega: document.getElementById("previsaoEntregaOS")?.value || "",
        status: document.getElementById("statusOS")?.value || "Recebido",
        cliente: document.getElementById("clienteOS").value,
        lente: document.getElementById("lenteOS").value,
        armacao: document.getElementById("armacaoOS")?.value || "",
        observacoes: document.getElementById("observacoesOS")?.value || "",
        valor: valorTotal,
entrada: valorEntrada,
restante: valorRestante,
        pagamento: document.getElementById("pagamentoOS").value,
      parcelasCartao: document.getElementById("parcelasCartao")?.value || "",
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
  window.osEditandoId = null;
    alert("OS atualizada com sucesso!");
} else {
    

localStorage.setItem("ultimaOS", JSON.stringify(dadosOS));
   const ordemRef = await db.collection("ordens").add(dadosOS);
  await db.collection("caixas").add({
    ordemId: ordemRef.id,
  tipo: "entrada",
  descricao: "OS " + dadosOS.numero + " - " + dadosOS.cliente,
  valor: Number(dadosOS.entrada || 0),
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
async function obterEmpresaOS(){
  try{
    const snap=await db.collection("configuracoes").doc("empresa").get();
    if(snap.exists)return snap.data()||{};
  }catch(e){}
  try{return JSON.parse(localStorage.getItem("configLoja")||"{}")||{};}catch(e){return {};}
}
function dataBR(v){if(!v)return "";const p=String(v).split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:v;}
async function imprimirOSModelo(tipo){
  const empresa=await obterEmpresaOS();
  const g=id=>document.getElementById(id)?.value||"";
  const endereco=[empresa.enderecoLoja,empresa.numeroLoja,empresa.complementoLoja,empresa.bairroLoja,empresa.cidadeLoja,empresa.ufLoja].filter(Boolean).join(" - ");
  const contato=[empresa.telefoneLoja?"Tel.: "+empresa.telefoneLoja:"",empresa.whatsappLoja?"WhatsApp: "+empresa.whatsappLoja:""].filter(Boolean).join(" | ");
  const receita=tipo==="loja"?`
    <div class="box"><h3>Receita / Exame</h3>
      <table><tr><th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th></tr>
      <tr><td>OD</td><td>${g("odEsferico")||"Plano"}</td><td>${g("odCilindrico")}</td><td>${g("odEixo")}</td></tr>
      <tr><td>OE</td><td>${g("oeEsferico")||"Plano"}</td><td>${g("oeCilindrico")}</td><td>${g("oeEixo")}</td></tr></table>
      <p><b>DNP:</b> ${g("dnpOS")} | <b>Altura:</b> ${g("alturaOS")} | <b>ADD:</b> ${g("addOS")}</p>
    </div>`:"";
  const html=`<html><head><meta charset="UTF-8"><title>OS ${g("numeroOS")}</title><style>
  body{font-family:Arial;padding:18px;color:#17324b}.folha{max-width:800px;margin:auto;border:2px solid #0d5d9f;border-radius:14px;padding:20px}
  .topo{display:flex;gap:15px;align-items:center;border-bottom:2px solid #0d5d9f;padding-bottom:12px}.topo img{width:75px;height:75px;border-radius:50%;object-fit:cover}
  h1{margin:0;color:#0d5d9f}.topo p{margin:3px 0;font-size:12px}.via{margin-left:auto;text-align:right;font-weight:bold;color:#0d5d9f}
  .box{border:1px solid #cfdce8;border-radius:10px;padding:12px;margin-top:12px}.box h3{margin:0 0 8px;color:#0d5d9f}
  p{margin:5px 0;font-size:13px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #9fb4c5;padding:7px;text-align:center;font-size:12px}
  th{background:#eaf4fc}.assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:55px}.ass{border-top:1px solid #000;text-align:center;padding-top:6px;font-size:12px}
  @media print{body{padding:0}.folha{border:0}}</style></head><body><div class="folha">
  <div class="topo"><img src="${empresa.logoSistema || localStorage.getItem('logoSistemaVentura') || 'logo.jpg'}"><div><h1>${empresa.nomeLoja||"Óticas Ventura"}</h1>
  <p>${empresa.cnpjLoja?"CNPJ: "+empresa.cnpjLoja:""}</p><p>${endereco}</p><p>${contato}</p></div>
  <div class="via">${tipo==="loja"?"VIA DA LOJA":"VIA DO CLIENTE"}<br>OS Nº ${g("numeroOS")}</div></div>
  <div class="box"><h3>Dados da venda</h3><p><b>Data:</b> ${dataBR(g("dataCompraOS"))}</p><p><b>Vendedor:</b> ${g("vendedorOS")}</p>
  <p><b>Previsão:</b> ${dataBR(g("previsaoEntregaOS"))}</p><p><b>Status:</b> ${g("statusOS")}</p></div>
  <div class="box"><h3>Cliente</h3><p><b>Nome:</b> ${g("clienteOS")}</p><p><b>Telefone:</b> ${g("telefoneOS")}</p>${tipo==="loja"?`<p><b>CPF:</b> ${g("cpfOS")}</p>`:""}</div>
  <div class="box"><h3>Produto</h3><p><b>Lente:</b> ${g("lenteOS")}</p><p><b>Armação:</b> ${g("armacaoOS")}</p></div>
  <div class="box"><h3>Pagamento</h3><p><b>Total:</b> R$ ${g("valorOS")}</p><p><b>Entrada:</b> R$ ${g("entradaOS")}</p><p><b>Restante:</b> R$ ${g("restanteOS")}</p><p><b>Forma:</b> ${g("pagamentoOS")} ${g("parcelasCartao")}</p></div>
  ${receita}${g("observacoesOS")?`<div class="box"><h3>Observações</h3><p>${g("observacoesOS")}</p></div>`:""}
  <div class="assinaturas"><div class="ass">Assinatura do cliente</div><div class="ass">Responsável pela loja</div></div>
  </div></body></html>`;
  const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
}
function imprimirOSCompleta(){imprimirOSModelo("loja");}
function imprimirOSCliente(){imprimirOSModelo("cliente");}

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
    if (document.getElementById("armacaoOS")) {
      document.getElementById("armacaoOS").value = os.armacao || "";
    }
    if (document.getElementById("dataCompraOS")) document.getElementById("dataCompraOS").value = os.dataCompra || "";
    if (document.getElementById("vendedorOS")) document.getElementById("vendedorOS").value = os.vendedor || "";
    if (document.getElementById("previsaoEntregaOS")) document.getElementById("previsaoEntregaOS").value = os.previsaoEntrega || "";
    if (document.getElementById("statusOS")) document.getElementById("statusOS").value = os.status || "Recebido";
    if (document.getElementById("observacoesOS")) document.getElementById("observacoesOS").value = os.observacoes || "";
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
    const restante = Number(
  String(os.restante || 0).replace(",", ".")
);

const estaQuitada = restante <= 0;

    html += `
  <div style="border:1px solid #ccc; margin:5px; padding:5px; display:flex; justify-content:space-between; align-items:center;">
    <div>
      <b>OS:</b> ${os.numero || ""}<br>
      <b>Cliente:</b> ${os.cliente || ""}<br>
      <b>Telefone:</b> ${os.telefone || ""}<br>
      <b>Status:</b> ${
  estaQuitada
    ? '<span style="color:green;font-weight:bold;">✅ Quitada</span>'
    : '<span style="color:#d97706;font-weight:bold;">Em aberto - R$ ' + restante.toFixed(2) + '</span>'
}<br>
    </div>

    <button onclick="editarOS('${doc.id}')"
style="background:orange; color:white; border:none; padding:8px; cursor:pointer; border-radius:5px; margin-right:5px;">
✏ Editar
</button>
${!estaQuitada ? `
<button
  onclick="receberSaldoOS('${doc.id}')"
  style="background:green;color:white;border:none;padding:8px;cursor:pointer;border-radius:5px;margin-right:5px;">
  Receber saldo
</button>
` : ''}

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

function atualizarResumoCaixa(valorConferido = null) {
  const saldo = valorInicialCaixaAtual + totalEntradas - totalSaidas;

  const resumoInicial = document.getElementById("resumoInicial");
  const resumoEntradas = document.getElementById("resumoEntradas");
  const resumoSaidas = document.getElementById("resumoSaidas");
  const resumoSaldo = document.getElementById("resumoSaldo");
  const resumoConferido = document.getElementById("resumoConferido");
  const resumoDiferenca = document.getElementById("resumoDiferenca");

  if (resumoInicial) resumoInicial.innerText = valorInicialCaixaAtual.toFixed(2);
  if (resumoEntradas) resumoEntradas.innerText = totalEntradas.toFixed(2);
  if (resumoSaidas) resumoSaidas.innerText = totalSaidas.toFixed(2);
  if (resumoSaldo) resumoSaldo.innerText = saldo.toFixed(2);

  if (valorConferido !== null) {
    const diferenca = Number(valorConferido) - saldo;

    if (resumoConferido) resumoConferido.innerText = Number(valorConferido).toFixed(2);
    if (resumoDiferenca) resumoDiferenca.innerText = diferenca.toFixed(2);
  }
}

async function carregarCaixaAberto() {
  const campoValorInicial = document.getElementById("valorInicialCaixa");
  const campoFuncionario = document.getElementById("funcionarioCaixa");

  if (!campoValorInicial || !campoFuncionario) return;

  try {
    const snapshot = await db.collection("caixas")
      .where("status", "==", "aberto")
      .limit(1)
      .get();

    if (snapshot.empty) {
      caixaAbertoId = null;
      totalEntradas = 0;
      totalSaidas = 0;
      valorInicialCaixaAtual = 0;
      atualizarResumoCaixa();
      return;
    }

    const doc = snapshot.docs[0];
    const caixa = doc.data();

    caixaAbertoId = doc.id;
    valorInicialCaixaAtual = Number(caixa.valorInicial || 0);
    totalEntradas = 0;
    totalSaidas = 0;

    const movimentosSnapshot = await doc.ref.collection("movimentos").get();

    movimentosSnapshot.forEach(movimentoDoc => {
      const movimento = movimentoDoc.data();
      const valor = Number(movimento.valor || 0);

      if (movimento.tipo === "entrada") {
        totalEntradas += valor;
      } else if (movimento.tipo === "saida") {
        totalSaidas += valor;
      }
    });

    campoValorInicial.value = valorInicialCaixaAtual;
    campoFuncionario.value = caixa.funcionario || "";

    campoValorInicial.disabled = true;
    campoFuncionario.disabled = true;

    atualizarResumoCaixa();
  } catch (erro) {
    console.error("Erro ao carregar caixa aberto:", erro);
    alert("Não foi possível carregar o caixa aberto.");
  }
}

async function abrirCaixa() {
  const valorInicialCampo = document.getElementById("valorInicialCaixa");
  const funcionarioCampo = document.getElementById("funcionarioCaixa");

  const valorInicial = Number(
    String(valorInicialCampo.value || 0).replace(",", ".")
  );
  const funcionario = funcionarioCampo.value.trim();

  if (!valorInicial || !funcionario) {
    alert("Preencha valor inicial e funcionário.");
    return;
  }

  try {
    const caixaAbertoSnapshot = await db.collection("caixas")
      .where("status", "==", "aberto")
      .limit(1)
      .get();

    if (!caixaAbertoSnapshot.empty) {
      alert("Já existe um caixa aberto. Feche o caixa atual antes de abrir outro.");
      await carregarCaixaAberto();
      return;
    }

    const docRef = await db.collection("caixas").add({
      valorInicial,
      funcionario,
      abertoEm: new Date(),
      status: "aberto"
    });

    caixaAbertoId = docRef.id;
    valorInicialCaixaAtual = valorInicial;
    totalEntradas = 0;
    totalSaidas = 0;

    valorInicialCampo.disabled = true;
    funcionarioCampo.disabled = true;

    atualizarResumoCaixa();

    alert("Caixa aberto com sucesso!");
  } catch (erro) {
    console.error("Erro ao abrir caixa:", erro);
    alert("Erro ao abrir o caixa.");
  }
}

async function registrarMovimento() {
  if (!caixaAbertoId) {
    alert("Abra o caixa primeiro!");
    return;
  }

  const descricaoCampo = document.getElementById("descricaoMovimento");
  const valorCampo = document.getElementById("valorMovimento");
  const tipoCampo = document.getElementById("tipoMovimento");

  const descricao = descricaoCampo.value.trim();
  const valor = Number(String(valorCampo.value || 0).replace(",", "."));
  const tipo = tipoCampo.value;

  if (!descricao || !valor || valor <= 0) {
    alert("Preencha descrição e valor corretamente.");
    return;
  }

  try {
    await db.collection("caixas")
      .doc(caixaAbertoId)
      .collection("movimentos")
      .add({
        descricao,
        valor,
        tipo,
        criadoEm: new Date()
      });

    if (tipo === "entrada") {
      totalEntradas += valor;
    } else {
      totalSaidas += valor;
    }

    atualizarResumoCaixa();

    descricaoCampo.value = "";
    valorCampo.value = "";

    alert("Movimento registrado!");
  } catch (erro) {
    console.error("Erro ao registrar movimento:", erro);
    alert("Erro ao registrar a movimentação.");
  }
}

async function fecharCaixa() {
  if (!caixaAbertoId) {
    alert("Não existe caixa aberto.");
    return;
  }

  const valorConferidoCampo = document.getElementById("valorConferidoCaixa");
  const valorConferido = Number(
    String(valorConferidoCampo.value || 0).replace(",", ".")
  );

  if (!valorConferidoCampo.value.trim() || isNaN(valorConferido)) {
    alert("Informe o valor conferido.");
    return;
  }

  const saldoEsperado = valorInicialCaixaAtual + totalEntradas - totalSaidas;
  const diferenca = valorConferido - saldoEsperado;

  try {
    const caixaRef = db.collection("caixas").doc(caixaAbertoId);
    const caixaDoc = await caixaRef.get();
    const caixa = caixaDoc.exists ? caixaDoc.data() : {};

    await caixaRef.update({
      valorConferido,
      saldoEsperado,
      diferenca,
      entradas: totalEntradas,
      saidas: totalSaidas,
      fechadoEm: new Date(),
      status: "fechado"
    });

    await db.collection("historicoCaixa").add({
      caixaId: caixaAbertoId,
      funcionario: caixa.funcionario || document.getElementById("funcionarioCaixa").value,
      valorInicial: valorInicialCaixaAtual,
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldoEsperado,
      valorConferido,
      diferenca,
      fechadoEm: new Date()
    });

    atualizarResumoCaixa(valorConferido);

    alert("Caixa fechado com sucesso!");

    caixaAbertoId = null;
    totalEntradas = 0;
    totalSaidas = 0;
    valorInicialCaixaAtual = 0;

    document.getElementById("valorInicialCaixa").value = "";
    document.getElementById("funcionarioCaixa").value = "";
    document.getElementById("valorConferidoCaixa").value = "";

    document.getElementById("valorInicialCaixa").disabled = false;
    document.getElementById("funcionarioCaixa").disabled = false;
  } catch (erro) {
    console.error("Erro ao fechar caixa:", erro);
    alert("Erro ao fechar o caixa.");
  }
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
    <td>${h.fechadoEm ? new Date(h.fechadoEm.seconds * 1000).toLocaleDateString("pt-BR") : "-"}</td>
    <td>R$ ${h.diferenca || 0}</td>
     <td><button onclick="apagarHistoricoCaixa('${doc.id}')">🗑️ Apagar</button></td>
  </tr>
`;
  });
}

async function apagarHistoricoCaixa(id) {
    if (!confirm("Deseja apagar este histórico?")) return;

    try {
        await db.collection("historicoCaixa").doc(id).delete();
        alert("Histórico apagado com sucesso!");
        carregarHistoricoCaixa();
    } catch (e) {
        console.error(e);
        alert("Erro ao apagar histórico.");
    }
}
function imprimirCaixa() {
  window.print();
}
async function carregarFinanceiro() {
  try {
    let totalVendido = 0;
    let totalPedidos = 0;
    let totalReceber = 0;
    let recebidoHoje = 0;
    let totalDespesas = 0;

    const [caixasSnapshot, ordensSnapshot] = await Promise.all([
      db.collection("caixas").get(),
      db.collection("ordens").get()
    ]);

    ordensSnapshot.forEach(doc => {
      const os = doc.data();
      const valorTotal = parseFloat(String(os.valor || 0).replace(",", ".")) || 0;
      const restante = parseFloat(String(os.restante || 0).replace(",", ".")) || 0;

      totalVendido += valorTotal;
      totalPedidos++;
      totalReceber += restante;
    });

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const lista = document.getElementById("listaFinanceiro");

    if (lista) lista.innerHTML = "";

    caixasSnapshot.forEach(doc => {
      const lancamento = doc.data();
      const valor = parseFloat(String(lancamento.valor || 0).replace(",", ".")) || 0;
      let dataLancamento = null;

      if (lancamento.criadoEm && lancamento.criadoEm.toDate) {
        dataLancamento = lancamento.criadoEm.toDate();
      } else if (lancamento.data) {
        const partes = String(lancamento.data).split("/");
        if (partes.length === 3) {
          dataLancamento = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0])
          );
        }
      }

      const ehHoje = dataLancamento &&
        dataLancamento.getDate() === hoje.getDate() &&
        dataLancamento.getMonth() === hoje.getMonth() &&
        dataLancamento.getFullYear() === hoje.getFullYear();

      const ehMesAtual = dataLancamento &&
        dataLancamento.getMonth() === mesAtual &&
        dataLancamento.getFullYear() === anoAtual;

      if (lancamento.tipo === "entrada" && ehHoje) recebidoHoje += valor;
      if (lancamento.tipo === "saida" && ehMesAtual) totalDespesas += valor;

      if (lista && ehMesAtual && valor > 0) {
        const tipoTexto = lancamento.tipo === "saida" ? "Saída" : "Entrada";
        lista.innerHTML += `
          <div style="margin-bottom:10px;border:1px solid #d9e5ef;padding:12px;border-radius:10px;background:#fff;">
            <strong>${tipoTexto}:</strong>
            ${lancamento.descricao || "Sem descrição"} -
            R$ ${valor.toFixed(2).replace(".", ",")}
            <button type="button" onclick="deletarFinanceiro('${doc.id}')" style="margin-left:8px;">
              Deletar
            </button>
          </div>
        `;
      }
    });

    const totalLucro = totalVendido - totalDespesas;

    const campos = {
      totalFinanceiro: totalVendido.toFixed(2),
      totalPedidos: totalPedidos,
      totalReceber: totalReceber.toFixed(2),
      recebidoHoje: recebidoHoje.toFixed(2),
      totalDespesas: totalDespesas.toFixed(2),
      totalLucro: totalLucro.toFixed(2)
    };

    Object.entries(campos).forEach(([id, valor]) => {
      const elemento = document.getElementById(id);
      if (elemento) elemento.innerText = valor;
    });

    if (lista && !lista.innerHTML.trim()) {
      lista.innerHTML = "<p>Nenhum lançamento encontrado neste mês.</p>";
    }
  } catch (erro) {
    console.error("Erro ao carregar financeiro:", erro);
    alert("Erro ao carregar os dados financeiros.");
  }
}

if (window.location.pathname.includes("financeiro")) {
  carregarFinanceiro();
}
if (document.getElementById("graficoFinanceiro")) {
  desenharGrafico();
}
async function corrigirLancamentosOS() {
if (!confirm("Corrigir os lançamentos antigos das Ordens de Serviço?")) {
return;
}

try {
const ordensSnapshot = await db.collection("ordens").get();
const caixasSnapshot = await db.collection("caixas").get();

const ordensPorNumero = {};

ordensSnapshot.forEach(doc => {
const os = doc.data();
ordensPorNumero[String(os.numero || "").trim()] = os;
});

const batch = db.batch();
let corrigidos = 0;

caixasSnapshot.forEach(doc => {
const caixa = doc.data();

if (caixa.origem !== "ordem_servico") return;

const numeroOS = String(caixa.os || "").trim();
const ordem = ordensPorNumero[numeroOS];

if (!ordem) return;

const entradaCorreta =
Number(String(ordem.entrada || 0).replace(",", ".")) || 0;

batch.update(doc.ref, {
valor: entradaCorreta,
pagamento: ordem.pagamento || caixa.pagamento || "",
cliente: ordem.cliente || caixa.cliente || ""
});

corrigidos++;
});

if (corrigidos === 0) {
alert("Nenhum lançamento de OS foi encontrado para corrigir.");
return;
}

await batch.commit();

alert(corrigidos + " lançamento(s) corrigido(s) com sucesso!");

if (typeof carregarFinanceiro === "function") {
carregarFinanceiro();
}
} catch (erro) {
console.error(erro);
alert("Erro ao corrigir os lançamentos.");
}
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
    .where("os", "==", Number(numero))
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

const caixasSnap = await db
  .collection("caixas")
  .where("ordemId", "==", id)
  .get();

const exclusoes = caixasSnap.docs.map(doc => doc.ref.delete());
await Promise.all(exclusoes);
  if (typeof carregarDashboard === "function") {
  carregarDashboard();
}

if (typeof carregarFinanceiro === "function") {
  carregarFinanceiro();
}

alert("OS deletada com sucesso!");
listarOS();
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
  const cliente = {
    id: doc.id,
    ...doc.data()
  };

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
  window.clientePedidoId = encontrado.id;
window.clientePedidoTelefone = encontrado.telefone || "";
window.clientePedidoCpf = encontrado.cpf || "";

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
    const cliente = {
        id: doc.id,
        ...doc.data()
    };

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
window.clienteReceitaId = encontrado.id;
  document.getElementById("clienteReceita").value = encontrado.nome || "";
  document.getElementById("telefoneReceita").value = encontrado.telefone || "";
  document.getElementById("cpfReceita").value = encontrado.cpf || "";
  const receitasSnap = await db.collection("receituarios").get();

receitasSnap.forEach(doc => {
const receita = doc.data();

if (
String(receita.cpf || "") === String(encontrado.cpf || "") ||
String(receita.telefone || "") === String(encontrado.telefone || "") ||
String(receita.cliente || "").toLowerCase() === String(encontrado.nome || "").toLowerCase()
) {
document.getElementById("odLongeEsferico").value = receita.odLongeEsferico || "";
document.getElementById("odLongeCilindrico").value = receita.odLongeCilindrico || "";
document.getElementById("odLongeEixo").value = receita.odLongeEixo || "";

document.getElementById("oeLongeEsferico").value = receita.oeLongeEsferico || "";
document.getElementById("oeLongeCilindrico").value = receita.oeLongeCilindrico || "";
document.getElementById("oeLongeEixo").value = receita.oeLongeEixo || "";

document.getElementById("adicao").value = receita.adicao || "";
document.getElementById("dnp").value = receita.dnp || "";
document.getElementById("altura").value = receita.altura || "";
document.getElementById("obsReceita").value = receita.observacoes || "";
}
});
}
function calcularRestante() {
  const valor = Number(document.getElementById("valorOS").value) || 0;
  const entrada = Number(document.getElementById("entradaOS").value) || 0;

  document.getElementById("restanteOS").value = Math.max(valor - entrada, 0);
}
async function deletarFinanceiro(id) {
  if (!confirm("Deseja deletar este lançamento?")) return;

  await db.collection("caixas").doc(id).delete();

  alert("Lançamento deletado!");
  carregarFinanceiro();
}
async function editarOS(id) {
  const doc = await db.collection("ordens").doc(id).get();

  if (!doc.exists) {
    alert("OS não encontrada!");
    return;
  }

  const os = doc.data();
  window.osEditandoId = id;

  document.getElementById("numeroOS").value = os.numero || "";
  document.getElementById("clienteOS").value = os.cliente || "";
  document.getElementById("telefoneOS").value = os.telefone || "";
  document.getElementById("cpfOS").value = os.cpf || "";
  document.getElementById("cepOS").value = os.cep || "";
  document.getElementById("enderecoOS").value = os.endereco || "";
  document.getElementById("bairroOS").value = os.bairro || "";
  document.getElementById("cidadeOS").value = os.cidade || "";

  document.getElementById("lenteOS").value = os.lente || "";
    if (document.getElementById("armacaoOS")) {
      document.getElementById("armacaoOS").value = os.armacao || "";
    }
  document.getElementById("valorOS").value = os.valor || "";
  document.getElementById("entradaOS").value = os.entrada || "";
  document.getElementById("restanteOS").value = os.restante || "";
  document.getElementById("pagamentoOS").value = os.pagamento || "";
}
function finalizarEEnviar() {
  const cliente = document.getElementById("clienteOS").value;
  const telefone = document.getElementById("telefoneOS").value.replace(/\D/g, "");
  const numero = document.getElementById("numeroOS").value;
  const produto = document.getElementById("lenteOS").value;
  const valor = document.getElementById("valorOS").value;
  const entrada = document.getElementById("entradaOS").value;
  const restante = document.getElementById("restanteOS").value;
  localStorage.setItem("ultimaOS", JSON.stringify({
  cliente: cliente,
  lente: produto,
  valor: valor
}));

  if (!telefone) {
    alert("Cliente sem telefone!");
    return;
  }

  const mensagem = `Olá ${cliente} 👋

Sua Ordem de Serviço da Óticas Ventura foi finalizada com sucesso ✅

OS Nº: ${numero}
Produto: ${produto}
Valor: R$ ${valor}
Entrada: R$ ${entrada}
Restante: R$ ${restante}

Qualquer dúvida, estamos à disposição.`;

  window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`, "_blank");
}
function salvarConfig() {
  const config = {
    nome: document.getElementById("nomeLoja").value,
    telefone: document.getElementById("telefoneLoja").value,
    endereco: document.getElementById("enderecoLoja").value,
    cidade: document.getElementById("cidadeLoja").value
  };

  localStorage.setItem("configLoja", JSON.stringify(config));

  alert("Configurações salvas com sucesso!");
}
function carregarConfig() {
  const configSalva = localStorage.getItem("configLoja");

  if (!configSalva) return;

  const config = JSON.parse(configSalva);

  if (document.getElementById("nomeLoja")) {
    document.getElementById("nomeLoja").value = config.nome || "";
    document.getElementById("telefoneLoja").value = config.telefone || "";
    document.getElementById("enderecoLoja").value = config.endereco || "";
    document.getElementById("cidadeLoja").value = config.cidade || "";
  }
}

carregarConfig();
function salvarConfig() {
  const config = {
    nomeLoja: document.getElementById("nomeLoja").value,
    telefoneLoja: document.getElementById("telefoneLoja").value,
    enderecoLoja: document.getElementById("enderecoLoja").value,
    cidadeLoja: document.getElementById("cidadeLoja").value
  };

  localStorage.setItem("configLoja", JSON.stringify(config));
  alert("Configurações salvas com sucesso!");
}

window.addEventListener("load", function () {
  const configSalva = localStorage.getItem("configLoja");

  if (!configSalva) return;

  const config = JSON.parse(configSalva);

  if (document.getElementById("nomeLoja")) {
    document.getElementById("nomeLoja").value = config.nomeLoja || "";
    document.getElementById("telefoneLoja").value = config.telefoneLoja || "";
    document.getElementById("enderecoLoja").value = config.enderecoLoja || "";
    document.getElementById("cidadeLoja").value = config.cidadeLoja || "";
  }
});
function gerarNotaFiscalOS() {
  const cliente = document.getElementById("clienteOS")?.value || "";
  const produto = document.getElementById("lenteOS")?.value || "";
  const valor = document.getElementById("valorOS")?.value || "";

  const dadosNota = {
    cliente: cliente,
    produto: produto,
    valor: valor
  };

  localStorage.setItem("dadosNotaFiscal", JSON.stringify(dadosNota));

  const url = "notafiscal.html?cliente=" + encodeURIComponent(cliente) +
              "&produto=" + encodeURIComponent(produto) +
              "&valor=" + encodeURIComponent(valor);

  window.location.href = url;
}
function mostrarParcelas() {
  const pagamento = document.getElementById("pagamentoOS")?.value || "";
  const parcelas = document.getElementById("parcelasCartao");

  if (!parcelas) return;

  if (pagamento === "Cartão de Crédito") {
    parcelas.style.display = "block";
  } else {
    parcelas.style.display = "none";
    parcelas.value = "";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("listaClientes")) {
    mostrarClientes();
  }

  if (document.getElementById("valorInicialCaixa")) {
    carregarCaixaAberto();
  }
});
async function receberSaldoOS(id) {
    const ref = db.collection("ordens").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
  alert("OS não encontrada.");
  return;
}
    const os = doc.data();

    if (Number(os.restante || 0) <= 0) {
        alert("Esta OS já está quitada.");
        return;
    }

    const valor = prompt(
        "Valor recebido:",
        String(os.restante).replace(".", ",")
    );

    if (valor === null) return;

    const recebido = parseFloat(valor.replace(",", "."));

    if (isNaN(recebido) || recebido <= 0) {
        alert("Valor inválido.");
        return;
    }

    const restante = Math.max(
        Number(os.restante || 0) - recebido,
        0
    );

    await ref.update({
        entrada: Number(os.entrada || 0) + recebido,
        restante: restante
    });

    await db.collection("caixas").add({
        tipo: "entrada",
        descricao: "Recebimento restante - OS " + os.numero,
        valor: recebido,
        cliente: os.cliente,
        origem: "recebimento_os",
        data: new Date().toLocaleDateString("pt-BR"),
        criadoEm: new Date()
    });

    alert("Pagamento registrado!");
    listarOS();
    carregarFinanceiro();
}
async function listarReceitasCliente() {
    const lista = document.getElementById("listaReceitasCliente");

    if (!lista) {
        alert("Área da lista não encontrada.");
        return;
    }

    if (!window.clienteReceitaId) {
        alert("Busque um cliente primeiro.");
        return;
    }

    lista.innerHTML = "Carregando receitas...";

    const snapshot = await db.collection("receituarios")
        .where("clienteId", "==", window.clienteReceitaId)
        .get();

    if (snapshot.empty) {
        lista.innerHTML = "<p>Nenhuma receita encontrada para este cliente.</p>";
        return;
    }

    const receitas = snapshot.docs
        .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        .sort((a, b) => {
            const dataA = a.criadoEm && a.criadoEm.toMillis
                ? a.criadoEm.toMillis()
                : 0;

            const dataB = b.criadoEm && b.criadoEm.toMillis
                ? b.criadoEm.toMillis()
                : 0;

            return dataB - dataA;
        });

    lista.innerHTML = "";

    receitas.forEach((receita, indice) => {
        const item = document.createElement("div");

        item.style.border = "1px solid #ccc";
        item.style.padding = "10px";
        item.style.marginTop = "10px";
        item.style.borderRadius = "6px";

        const odEsferico = receita.odLongeEsferico || "Plano";
        const odCilindrico = receita.odLongeCilindrico || "-";
        const odEixo = receita.odLongeEixo || "-";

        const oeEsferico = receita.oeLongeEsferico || "Plano";
        const oeCilindrico = receita.oeLongeCilindrico || "-";
        const oeEixo = receita.oeLongeEixo || "-";

        item.innerHTML = `
            <strong>Receita ${indice + 1}</strong><br>
            <b>OD:</b> Esférico ${odEsferico} | Cilíndrico ${odCilindrico} | Eixo ${odEixo}<br>
            <b>OE:</b> Esférico ${oeEsferico} | Cilíndrico ${oeCilindrico} | Eixo ${oeEixo}<br>
            DNP: ${receita.dnp || "-"}<br>
            Adição: ${receita.adicao || "-"}<br><br>

            <button
                type="button"
                onclick="excluirReceitaPorId('${receita.id}')"
                style="background:red;color:white;border:none;padding:8px;border-radius:5px;cursor:pointer;"
            >
                Excluir receita
            </button>
        `;

        lista.appendChild(item);
    });
}

async function excluirReceitaPorId(id) {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) {
        return;
    }

    await db.collection("receituarios").doc(id).delete();

    alert("Receita excluída com sucesso!");

    await listarReceitasCliente();
}
async function fazerBackup() {
    try {
        const colecoes = [
            "clientes",
            "pedidos",
            "receituarios",
            "ordens",
            "caixas"
        ];

        const backup = {
            criadoEm: new Date().toISOString(),
            dados: {}
        };

        for (const nomeColecao of colecoes) {
            const snapshot = await db.collection(nomeColecao).get();

            backup.dados[nomeColecao] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        const conteudo = JSON.stringify(backup, null, 2);
        const blob = new Blob([conteudo], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `backup-oticas-ventura-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        alert("Backup criado com sucesso!");
    } catch (erro) {
        console.error("Erro ao fazer backup:", erro);
        alert("Não foi possível criar o backup.");
    }
}


/* =========================================================
   ATUALIZAÇÃO PROFISSIONAL DA ORDEM DE SERVIÇO - JUL/2026
   Não altera coleções nem nomes de campos existentes.
========================================================= */

function escaparHTMLOS(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function valorNumeroOS(valor) {
  return Number(String(valor ?? 0).replace(",", ".")) || 0;
}

function dadosOSDosCampos() {
  const g = id => document.getElementById(id)?.value || "";

  return {
    numero: g("numeroOS"),
    dataCompra: g("dataCompraOS"),
    vendedor: g("vendedorOS"),
    previsaoEntrega: g("previsaoEntregaOS"),
    status: g("statusOS"),
    cliente: g("clienteOS"),
    telefone: g("telefoneOS"),
    cpf: g("cpfOS"),
    cep: g("cepOS"),
    endereco: g("enderecoOS"),
    bairro: g("bairroOS"),
    cidade: g("cidadeOS"),
    lente: g("lenteOS"),
    armacao: g("armacaoOS"),
    valor: g("valorOS"),
    entrada: g("entradaOS"),
    restante: g("restanteOS"),
    pagamento: g("pagamentoOS"),
    parcelasCartao: g("parcelasCartao"),
    odEsferico: g("odEsferico"),
    odCilindrico: g("odCilindrico"),
    odEixo: g("odEixo"),
    oeEsferico: g("oeEsferico"),
    oeCilindrico: g("oeCilindrico"),
    oeEixo: g("oeEixo"),
    dnp: g("dnpOS"),
    altura: g("alturaOS"),
    add: g("addOS"),
    observacoes: g("observacoesOS")
  };
}

async function gerarImpressaoOSComDados(os, tipo) {
  const empresa = await obterEmpresaOS();
  const e = escaparHTMLOS;
  const enderecoLoja = [
    empresa.enderecoLoja,
    empresa.numeroLoja,
    empresa.complementoLoja,
    empresa.bairroLoja,
    empresa.cidadeLoja,
    empresa.ufLoja
  ].filter(Boolean).join(" - ");

  const contato = [
    empresa.telefoneLoja ? "Tel.: " + empresa.telefoneLoja : "",
    empresa.whatsappLoja ? "WhatsApp: " + empresa.whatsappLoja : ""
  ].filter(Boolean).join(" | ");

  const receita = `
    <div class="box">
      <h3>Receita / Exame</h3>
      <table>
        <tr><th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th></tr>
        <tr>
          <td>OD</td>
          <td>${e(os.odEsferico || "Plano")}</td>
          <td>${e(os.odCilindrico)}</td>
          <td>${e(os.odEixo)}</td>
        </tr>
        <tr>
          <td>OE</td>
          <td>${e(os.oeEsferico || "Plano")}</td>
          <td>${e(os.oeCilindrico)}</td>
          <td>${e(os.oeEixo)}</td>
        </tr>
      </table>
      <p>
        <b>DNP:</b> ${e(os.dnp)} |
        <b>Altura:</b> ${e(os.altura)} |
        <b>ADD:</b> ${e(os.add)}
      </p>
    </div>`;

  const html = `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>OS ${e(os.numero)}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:14px;color:#17324b;background:#fff}
      .folha{max-width:800px;margin:auto;border:2px solid #0d5d9f;border-radius:14px;padding:18px}
      .topo{display:flex;gap:14px;align-items:center;border-bottom:2px solid #0d5d9f;padding-bottom:10px}
      .topo img{width:70px;height:70px;border-radius:50%;object-fit:cover}
      h1{margin:0;color:#0d5d9f;font-size:25px}
      .topo p{margin:3px 0;font-size:11px}
      .via{margin-left:auto;text-align:right;font-weight:bold;color:#0d5d9f;font-size:13px}
      .box{border:1px solid #cfdce8;border-radius:10px;padding:10px;margin-top:10px}
      .box h3{margin:0 0 7px;color:#0d5d9f;font-size:15px}
      p{margin:4px 0;font-size:12px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #9fb4c5;padding:6px;text-align:center;font-size:11px}
      th{background:#eaf4fc}
      .duas-colunas{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:38px;margin-top:42px}
      .ass{border-top:1px solid #000;text-align:center;padding-top:5px;font-size:11px}
      @media print{
        body{padding:0}
        .folha{border:0}
      }
    </style>
  </head>
  <body>
    <div class="folha">
      <div class="topo">
        <img src="${empresa.logoSistema || localStorage.getItem('logoSistemaVentura') || 'logo.jpg'}" alt="Logo">
        <div>
          <h1>${e(empresa.nomeLoja || "Óticas Ventura")}</h1>
          <p>${empresa.cnpjLoja ? "CNPJ: " + e(empresa.cnpjLoja) : ""}</p>
          <p>${e(enderecoLoja)}</p>
          <p>${e(contato)}</p>
        </div>
        <div class="via">
          ${tipo === "loja" ? "VIA DA LOJA" : "VIA DO CLIENTE"}<br>
          OS Nº ${e(os.numero)}
        </div>
      </div>

      <div class="duas-colunas">
        <div class="box">
          <h3>Dados da venda</h3>
          <p><b>Data:</b> ${e(dataBR(os.dataCompra))}</p>
          <p><b>Vendedor:</b> ${e(os.vendedor)}</p>
          <p><b>Previsão:</b> ${e(dataBR(os.previsaoEntrega))}</p>
          <p><b>Status:</b> ${e(os.status || "Recebido")}</p>
        </div>

        <div class="box">
          <h3>Cliente</h3>
          <p><b>Nome:</b> ${e(os.cliente)}</p>
          <p><b>Telefone:</b> ${e(os.telefone)}</p>
          ${tipo === "loja" ? `<p><b>CPF:</b> ${e(os.cpf)}</p>` : ""}
        </div>
      </div>

      <div class="box">
        <h3>Produto</h3>
        <p><b>Lente:</b> ${e(os.lente)}</p>
        <p><b>Modelo da armação:</b> ${e(os.armacao)}</p>
      </div>

      ${receita}

      <div class="box">
        <h3>Pagamento</h3>
        <p><b>Total:</b> R$ ${e(os.valor)}</p>
        <p><b>Entrada:</b> R$ ${e(os.entrada)}</p>
        <p><b>Restante:</b> R$ ${e(os.restante)}</p>
        <p><b>Forma:</b> ${e(os.pagamento)} ${e(os.parcelasCartao)}</p>
      </div>

      ${os.observacoes ? `
        <div class="box">
          <h3>Observações</h3>
          <p>${e(os.observacoes)}</p>
        </div>` : ""}

      <div class="assinaturas">
        <div class="ass">Assinatura do cliente</div>
        <div class="ass">Responsável pela loja</div>
      </div>
    </div>

    <script>
      window.addEventListener("load", function() {
        setTimeout(function(){ window.print(); }, 250);
      });
    <\/script>
  </body>
  </html>`;

  const janela = window.open("", "_blank");

  if (!janela) {
    alert("O navegador bloqueou a janela de impressão. Permita pop-ups para este site.");
    return;
  }

  janela.document.open();
  janela.document.write(html);
  janela.document.close();
}

async function imprimirOSModelo(tipo) {
  await gerarImpressaoOSComDados(dadosOSDosCampos(), tipo);
}

async function imprimirOSPorId(id, tipo = "cliente") {
  try {
    const documento = await db.collection("ordens").doc(id).get();

    if (!documento.exists) {
      alert("OS não encontrada.");
      return;
    }

    await gerarImpressaoOSComDados(documento.data(), tipo);
  } catch (erro) {
    console.error("Erro ao imprimir a OS:", erro);
    alert("Não foi possível abrir a impressão.");
  }
}

async function atualizarStatusOS(id) {
  const seletor = document.getElementById("status-lista-" + id);
  if (!seletor) return;

  try {
    await db.collection("ordens").doc(id).update({
      status: seletor.value
    });

    alert("Status atualizado para: " + seletor.value);
    await listarOS();
  } catch (erro) {
    console.error("Erro ao atualizar o status:", erro);
    alert("Não foi possível atualizar o status.");
  }
}

async function editarOS(id) {
  const documento = await db.collection("ordens").doc(id).get();

  if (!documento.exists) {
    alert("OS não encontrada.");
    return;
  }

  const os = documento.data();
  window.osEditandoId = id;

  const preencher = (idCampo, valor) => {
    const campo = document.getElementById(idCampo);
    if (campo) campo.value = valor ?? "";
  };

  preencher("numeroOS", os.numero);
  preencher("dataCompraOS", os.dataCompra);
  preencher("vendedorOS", os.vendedor);
  preencher("previsaoEntregaOS", os.previsaoEntrega);
  preencher("statusOS", os.status || "Recebido");
  preencher("clienteOS", os.cliente);
  preencher("telefoneOS", os.telefone);
  preencher("cpfOS", os.cpf);
  preencher("cepOS", os.cep);
  preencher("enderecoOS", os.endereco);
  preencher("bairroOS", os.bairro);
  preencher("cidadeOS", os.cidade);
  preencher("lenteOS", os.lente);
  preencher("armacaoOS", os.armacao);
  preencher("valorOS", os.valor);
  preencher("entradaOS", os.entrada);
  preencher("restanteOS", os.restante);
  preencher("pagamentoOS", os.pagamento);
  preencher("parcelasCartao", os.parcelasCartao);
  preencher("odEsferico", os.odEsferico);
  preencher("odCilindrico", os.odCilindrico);
  preencher("odEixo", os.odEixo);
  preencher("oeEsferico", os.oeEsferico);
  preencher("oeCilindrico", os.oeCilindrico);
  preencher("oeEixo", os.oeEixo);
  preencher("dnpOS", os.dnp);
  preencher("alturaOS", os.altura);
  preencher("addOS", os.add);
  preencher("observacoesOS", os.observacoes);

  mostrarParcelas();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function listarOS() {
  const listaDiv = document.getElementById("listaOS");
  if (!listaDiv) return;

  listaDiv.innerHTML = "Carregando...";

  try {
    const snapshot = await db.collection("ordens").get();
    const registros = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    registros.sort((a, b) => {
      const numeroA = Number(String(a.numero || "").replace(/\D/g, "")) || 0;
      const numeroB = Number(String(b.numero || "").replace(/\D/g, "")) || 0;
      return numeroB - numeroA;
    });

    let html = "";

    registros.forEach(os => {
      const restante = valorNumeroOS(os.restante);
      const estaQuitada = restante <= 0;
      const statusAtual = os.status || "Recebido";
      const status = [
        "Recebido",
        "Em produção",
        "Enviado ao laboratório",
        "Pronto para retirada",
        "Entregue"
      ];

      const opcoes = status.map(item =>
        `<option value="${escaparHTMLOS(item)}" ${item === statusAtual ? "selected" : ""}>${escaparHTMLOS(item)}</option>`
      ).join("");

      html += `
        <article class="os-lista-item">
          <div class="os-lista-dados">
            <b>OS:</b> ${escaparHTMLOS(os.numero)}<br>
            <b>Cliente:</b> ${escaparHTMLOS(os.cliente)}<br>
            <b>Telefone:</b> ${escaparHTMLOS(os.telefone)}<br>
            <b>Pagamento:</b> ${
              estaQuitada
                ? '<span style="color:#21864a;font-weight:bold;">✅ Quitada</span>'
                : '<span style="color:#d97706;font-weight:bold;">Em aberto - R$ ' + restante.toFixed(2).replace(".", ",") + '</span>'
            }<br>
            <b>Andamento:</b> ${escaparHTMLOS(statusAtual)}
          </div>

          <div class="os-lista-acoes">
            <button type="button" class="btn-os-editar" onclick="editarOS('${os.id}')">✏ Editar</button>

            ${!estaQuitada ? `
              <button type="button" class="btn-os-receber" onclick="receberSaldoOS('${os.id}')">💰 Receber</button>
            ` : ""}

            <button type="button" class="btn-os-imprimir" onclick="imprimirOSPorId('${os.id}', 'cliente')">🖨 Imprimir</button>

            <select id="status-lista-${os.id}" aria-label="Status da OS ${escaparHTMLOS(os.numero)}">
              ${opcoes}
            </select>

            <button type="button" class="btn-os-status" onclick="atualizarStatusOS('${os.id}')">🔄 Status</button>

            <button type="button" class="btn-os-deletar" onclick="deletarOSPorId('${os.id}', '${escaparHTMLOS(os.numero)}')">🗑 Deletar</button>
          </div>
        </article>
      `;
    });

    listaDiv.innerHTML = html || "Nenhuma OS encontrada.";
  } catch (erro) {
    console.error("Erro ao listar as ordens:", erro);
    listaDiv.innerHTML = "Não foi possível carregar a lista.";
  }
}

document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById("listaOS")) {
    listarOS();
  }
});


/* =========================================================
   LOGO PERSONALIZÁVEL DO VENTURA SYSTEM
   Salva no documento configuracoes/empresa sem alterar
   clientes, pedidos, caixas ou ordens de serviço.
========================================================= */

let logoSistemaBase64 = "";

function reduzirLogoSistema(arquivo) {
  return new Promise(function(resolve, reject) {
    const leitor = new FileReader();

    leitor.onerror = function() {
      reject(new Error("Não foi possível ler a imagem."));
    };

    leitor.onload = function(evento) {
      const imagem = new Image();

      imagem.onerror = function() {
        reject(new Error("Arquivo de imagem inválido."));
      };

      imagem.onload = function() {
        const limite = 600;
        let largura = imagem.width;
        let altura = imagem.height;

        if (largura > limite || altura > limite) {
          const proporcao = Math.min(limite / largura, limite / altura);
          largura = Math.round(largura * proporcao);
          altura = Math.round(altura * proporcao);
        }

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");
        contexto.fillStyle = "#ffffff";
        contexto.fillRect(0, 0, largura, altura);
        contexto.drawImage(imagem, 0, 0, largura, altura);

        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };

      imagem.src = evento.target.result;
    };

    leitor.readAsDataURL(arquivo);
  });
}

function aplicarLogoSistema(logo) {
  const enderecoLogo = logo || "logo.jpg";

  document.querySelectorAll(
    'img[src="logo.jpg"], img[src="./logo.jpg"], img[data-logo-sistema]'
  ).forEach(function(imagem) {
    imagem.src = enderecoLogo;
    imagem.setAttribute("data-logo-sistema", "true");
  });

  const preview = document.getElementById("logoSistemaPreview");

  if (preview) {
    preview.innerHTML =
      '<img src="' + enderecoLogo + '" alt="Logo atual do sistema">';
  }
}

async function carregarLogoSistema() {
  let logo = "";

  try {
    const documento = await db.collection("configuracoes").doc("empresa").get();

    if (documento.exists) {
      logo = documento.data().logoSistema || "";
    }
  } catch (erro) {
    console.warn("Não foi possível carregar a logo do Firebase.", erro);
  }

  if (!logo) {
    logo = localStorage.getItem("logoSistemaVentura") || "";
  }

  logoSistemaBase64 = logo;

  if (logo) {
    localStorage.setItem("logoSistemaVentura", logo);
  }

  aplicarLogoSistema(logo);
}

async function salvarLogoSistema() {
  const status = document.getElementById("statusLogoSistema");
  const botao = document.getElementById("btnSalvarLogoSistema");

  if (!logoSistemaBase64) {
    alert("Escolha uma imagem antes de salvar.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Salvando...";
    }

    if (status) status.textContent = "Salvando a nova logo...";

    await db.collection("configuracoes").doc("empresa").set({
      logoSistema: logoSistemaBase64,
      logoAtualizadaEm: new Date()
    }, { merge: true });

    localStorage.setItem("logoSistemaVentura", logoSistemaBase64);
    aplicarLogoSistema(logoSistemaBase64);

    if (status) {
      status.textContent =
        "Logo atualizada com sucesso. Ela aparecerá nas telas e nas novas impressões.";
    }

    try {
      if (window.parent && window.parent !== window) {
        const imagensPai = window.parent.document.querySelectorAll(
          'img[src="logo.jpg"], img[src="./logo.jpg"], img[data-logo-sistema]'
        );

        imagensPai.forEach(function(imagem) {
          imagem.src = logoSistemaBase64;
          imagem.setAttribute("data-logo-sistema", "true");
        });
      }
    } catch (erroPai) {
      console.warn("A logo será atualizada na tela principal ao recarregar.", erroPai);
    }
  } catch (erro) {
    console.error("Erro ao salvar a logo do sistema:", erro);

    if (status) {
      status.textContent = "Não foi possível salvar a logo agora.";
    }

    alert("Erro ao salvar a logo do sistema.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "💾 Salvar logo";
    }
  }
}

async function restaurarLogoPadrao() {
  if (!confirm("Deseja restaurar a logo padrão do sistema?")) return;

  const status = document.getElementById("statusLogoSistema");

  try {
    await db.collection("configuracoes").doc("empresa").set({
      logoSistema: firebase.firestore.FieldValue.delete(),
      logoAtualizadaEm: new Date()
    }, { merge: true });

    logoSistemaBase64 = "";
    localStorage.removeItem("logoSistemaVentura");
    aplicarLogoSistema("");

    if (status) {
      status.textContent = "Logo padrão restaurada com sucesso.";
    }
  } catch (erro) {
    console.error("Erro ao restaurar a logo padrão:", erro);
    alert("Não foi possível restaurar a logo padrão.");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const arquivoLogo = document.getElementById("arquivoLogoSistema");

  if (arquivoLogo) {
    arquivoLogo.addEventListener("change", async function() {
      const arquivo = this.files && this.files[0];
      const status = document.getElementById("statusLogoSistema");

      if (!arquivo) return;

      if (!arquivo.type.startsWith("image/")) {
        alert("Escolha um arquivo de imagem.");
        this.value = "";
        return;
      }

      if (arquivo.size > 8 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 8 MB.");
        this.value = "";
        return;
      }

      try {
        if (status) status.textContent = "Preparando a imagem...";

        logoSistemaBase64 = await reduzirLogoSistema(arquivo);
        aplicarLogoSistema(logoSistemaBase64);

        if (status) {
          status.textContent =
            "Prévia pronta. Clique em Salvar logo para confirmar.";
        }
      } catch (erro) {
        console.error("Erro ao preparar a logo:", erro);
        alert("Não foi possível preparar essa imagem.");
      }
    });
  }

  carregarLogoSistema();
});

