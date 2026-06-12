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
  const nome = document.querySelectorAll("input")[0].value;
  const telefone = document.querySelectorAll("input")[1].value;
  const receita = document.querySelectorAll("input")[2].value;
  const observacoes = document.querySelector("textarea").value;

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  clientes.push({ nome, telefone, receita, observacoes });

  localStorage.setItem("clientes", JSON.stringify(clientes));

  mostrarClientes();

  alert("Cliente salvo com sucesso!");
}

function mostrarClientes() {
  const lista = document.getElementById("listaClientes");

  if (!lista) return;

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  lista.innerHTML = "";

  clientes.forEach(function(cliente) {
    lista.innerHTML += `
      <p>
        <strong>${cliente.nome}</strong><br>
        Telefone: ${cliente.telefone}<br>
        Receita: ${cliente.receita}<br>
        Obs: ${cliente.observacoes}
      </p>
      <hr>
    `;
  });
}

mostrarClientes();
