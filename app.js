function entrar() {
    const usuario = document.querySelector('input[type="text"]').value;
    const senha = document.querySelector('input[type="password"]').value;

    if (usuario === "admin" && senha === "1234") {
        alert("Login realizado com sucesso!");
        window.location.href = "painel.html";
    } else {
        alert("Usuário ou senha incorretos.");
    }
}

function salvarCliente() {
    alert("Cliente salvo com sucesso!");
}
