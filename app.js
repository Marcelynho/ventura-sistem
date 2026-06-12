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

  const lista = document.getElementById("listaClientes");

  lista.innerHTML += `
    <p>
      <strong>${nome}</strong><br>
      Telefone: ${telefone}<br>
      Receita: ${receita}<br>
      Obs: ${observacoes}
    </p>
    <hr>
  `;

  alert("Cliente salvo com sucesso!");
}
