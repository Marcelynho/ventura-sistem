// ================================================================
// COMPARTILHAMENTO GRATUITO DE PDF
// Gera o documento no navegador e abre a folha de compartilhamento.
// Nenhum arquivo é enviado sem a confirmação do usuário.
// ================================================================

(function () {
  "use strict";

  const HTML2PDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  let carregamentoHtml2Pdf = null;

  function escaparHTMLCompartilhamento(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function somenteNomeArquivo(valor) {
    return String(valor || "documento")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "documento";
  }

  function primeiroNome(valor) {
    return String(valor || "cliente").trim().split(/\s+/)[0] || "cliente";
  }

  function numeroCompartilhamento(valor) {
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    let texto = String(valor ?? "").trim().replace(/R\$/gi, "").replace(/\s/g, "");
    if (!texto) return 0;
    if (texto.includes(",") && texto.includes(".")) {
      texto = texto.replace(/\./g, "").replace(",", ".");
    } else if (texto.includes(",")) {
      texto = texto.replace(",", ".");
    }
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : 0;
  }

  function valorMoedaCompartilhamento(valor) {
    return numeroCompartilhamento(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function dataBRCompartilhamento(valor) {
    if (!valor) return "-";
    const partes = String(valor).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : String(valor);
  }

  function urlAbsoluta(arquivo) {
    try {
      return new URL(arquivo, window.location.href).href;
    } catch (erro) {
      return arquivo;
    }
  }

  function carregarHtml2Pdf() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (carregamentoHtml2Pdf) return carregamentoHtml2Pdf;

    carregamentoHtml2Pdf = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = HTML2PDF_URL;
      script.async = true;
      script.onload = () => window.html2pdf
        ? resolve(window.html2pdf)
        : reject(new Error("Biblioteca de PDF não carregada."));
      script.onerror = () => reject(new Error("Não foi possível carregar o gerador de PDF."));
      document.head.appendChild(script);
    });

    return carregamentoHtml2Pdf;
  }

  function aguardarImagens(elemento) {
    const imagens = Array.from(elemento.querySelectorAll("img"));
    return Promise.all(imagens.map(imagem => {
      if (imagem.complete) return Promise.resolve();
      return new Promise(resolve => {
        imagem.addEventListener("load", resolve, { once: true });
        imagem.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 2500);
      });
    }));
  }

  async function gerarPdfDeElemento(elemento, nomeArquivo) {
    await carregarHtml2Pdf();
    await aguardarImagens(elemento);

    const opcoes = {
      margin: [7, 7, 7, 7],
      filename: nomeArquivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    };

    return window.html2pdf()
      .set(opcoes)
      .from(elemento)
      .outputPdf("blob");
  }

  async function gerarPdfDeHtml(html, nomeArquivo) {
    await carregarHtml2Pdf();

    const parser = new DOMParser();
    const documentoTemporario = parser.parseFromString(html, "text/html");
    const elementoOrigem = documentoTemporario.querySelector(".folha-pdf") || documentoTemporario.body;
    if (!elementoOrigem) throw new Error("Conteúdo do PDF não encontrado.");

    const estilos = Array.from(documentoTemporario.querySelectorAll("style"))
      .map(estilo => estilo.textContent || "")
      .join("\n");

    const idEstilo = "venturaPdfEstiloTemporario";
    const estiloAnterior = document.getElementById(idEstilo);
    if (estiloAnterior) estiloAnterior.remove();

    const folhaEstilo = document.createElement("style");
    folhaEstilo.id = idEstilo;
    folhaEstilo.textContent = estilos;

    const suporte = document.createElement("div");
    suporte.setAttribute("aria-hidden", "true");
    suporte.style.position = "fixed";
    suporte.style.left = "-12000px";
    suporte.style.top = "0";
    suporte.style.width = "790px";
    suporte.style.minHeight = "1px";
    suporte.style.background = "#ffffff";
    suporte.style.opacity = "1";
    suporte.style.pointerEvents = "none";
    suporte.style.zIndex = "-1";

    const elemento = elementoOrigem.cloneNode(true);
    suporte.appendChild(elemento);
    document.head.appendChild(folhaEstilo);
    document.body.appendChild(suporte);

    try {
      await aguardarImagens(elemento);
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (erro) {}
      }
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return await gerarPdfDeElemento(elemento, nomeArquivo);
    } finally {
      suporte.remove();
      folhaEstilo.remove();
    }
  }

  function baixarBlob(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function fecharModalCompartilhamento() {
    const modal = document.getElementById("modalCompartilharPdfVentura");
    if (modal) modal.remove();
  }

  function mostrarPreparandoPDF() {
    fecharModalCompartilhamento();
    const fundo = document.createElement("div");
    fundo.id = "modalCompartilharPdfVentura";
    fundo.innerHTML = `
      <div class="ventura-pdf-modal" role="dialog" aria-modal="true" aria-label="Preparando PDF">
        <div class="ventura-pdf-icone">📄</div>
        <h2>Preparando o PDF...</h2>
        <p>Aguarde alguns segundos.</p>
      </div>`;
    aplicarEstiloModal(fundo);
    document.body.appendChild(fundo);
  }

  function aplicarEstiloModal(fundo) {
    fundo.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,18,37,.76);backdrop-filter:blur(4px)";
    const modal = fundo.querySelector(".ventura-pdf-modal");
    if (modal) modal.style.cssText = "width:100%;max-width:430px;padding:25px;border-radius:20px;background:#fff;color:#17324b;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.38);font-family:Arial,Helvetica,sans-serif";
    const icone = fundo.querySelector(".ventura-pdf-icone");
    if (icone) icone.style.cssText = "font-size:42px;margin-bottom:8px";
    const titulo = fundo.querySelector("h2");
    if (titulo) titulo.style.cssText = "margin:0;color:#0d4d84;font-size:23px";
    const texto = fundo.querySelector("p");
    if (texto) texto.style.cssText = "margin:9px 0 0;color:#60788f;font-size:14px;line-height:1.45";
  }

  function abrirModalCompartilhamento(blob, nomeArquivo, titulo, mensagem) {
    fecharModalCompartilhamento();

    const fundo = document.createElement("div");
    fundo.id = "modalCompartilharPdfVentura";
    fundo.innerHTML = `
      <div class="ventura-pdf-modal" role="dialog" aria-modal="true" aria-label="PDF pronto">
        <div class="ventura-pdf-icone">✅</div>
        <h2>PDF pronto</h2>
        <p>Toque em <b>Compartilhar agora</b>, escolha o WhatsApp e confirme o contato.</p>
        <div class="ventura-pdf-acoes">
          <button type="button" data-acao="compartilhar">📲 Compartilhar agora</button>
          <button type="button" data-acao="baixar">⬇️ Baixar PDF</button>
          <button type="button" data-acao="fechar">Cancelar</button>
        </div>
      </div>`;
    aplicarEstiloModal(fundo);

    const acoes = fundo.querySelector(".ventura-pdf-acoes");
    if (acoes) acoes.style.cssText = "display:grid;gap:10px;margin-top:20px";
    fundo.querySelectorAll("button").forEach((botao, indice) => {
      botao.style.cssText = "width:100%;min-height:47px;padding:11px 14px;border:0;border-radius:12px;font:inherit;font-weight:800;cursor:pointer";
      if (indice === 0) botao.style.cssText += ";background:#1687e8;color:#fff";
      if (indice === 1) botao.style.cssText += ";background:#e8f2fa;color:#0d5d9f";
      if (indice === 2) botao.style.cssText += ";background:#eef2f5;color:#536b7e";
    });

    const arquivo = new File([blob], nomeArquivo, { type: "application/pdf" });
    const botaoCompartilhar = fundo.querySelector('[data-acao="compartilhar"]');
    let aceitaArquivo = false;

    try {
      aceitaArquivo = Boolean(navigator.share) && (!navigator.canShare || navigator.canShare({ files: [arquivo] }));
    } catch (erro) {
      aceitaArquivo = false;
    }

    if (!aceitaArquivo && botaoCompartilhar) {
      botaoCompartilhar.style.display = "none";
      const paragrafo = fundo.querySelector("p");
      if (paragrafo) paragrafo.innerHTML = "Este navegador não permite compartilhar o arquivo diretamente. Baixe o PDF e envie pelo WhatsApp.";
    }

    if (botaoCompartilhar) {
      botaoCompartilhar.addEventListener("click", async () => {
        try {
          await navigator.share({
            files: [arquivo],
            title: titulo,
            text: mensagem
          });
          fecharModalCompartilhamento();
        } catch (erro) {
          if (erro && erro.name === "AbortError") return;
          console.error("Erro ao compartilhar PDF:", erro);
          alert("Não foi possível abrir o compartilhamento. Você pode baixar o PDF e enviá-lo pelo WhatsApp.");
        }
      });
    }

    const botaoBaixar = fundo.querySelector('[data-acao="baixar"]');
    if (botaoBaixar) botaoBaixar.addEventListener("click", () => baixarBlob(blob, nomeArquivo));

    const botaoFechar = fundo.querySelector('[data-acao="fechar"]');
    if (botaoFechar) botaoFechar.addEventListener("click", fecharModalCompartilhamento);

    document.body.appendChild(fundo);
  }

  async function executarCompartilhamento(gerador) {
    mostrarPreparandoPDF();
    try {
      const resultado = await gerador();
      abrirModalCompartilhamento(
        resultado.blob,
        resultado.nomeArquivo,
        resultado.titulo,
        resultado.mensagem
      );
    } catch (erro) {
      fecharModalCompartilhamento();
      console.error("Erro ao preparar PDF:", erro);
      alert("Não foi possível preparar o PDF. Confira os dados e tente novamente.");
    }
  }

  async function obterEmpresaCompartilhamento() {
    if (typeof window.obterEmpresaOS === "function") {
      try { return await window.obterEmpresaOS(); } catch (erro) {}
    }

    try {
      if (typeof db !== "undefined") {
        const snap = await db.collection("configuracoes").doc("empresa").get();
        if (snap.exists) return snap.data() || {};
      }
    } catch (erro) {}

    try {
      return JSON.parse(localStorage.getItem("configLoja") || "{}") || {};
    } catch (erro) {
      return {};
    }
  }

  function cabecalhoEmpresaHTML(empresa, titulo, subtitulo) {
    const e = escaparHTMLCompartilhamento;
    const endereco = [
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

    return `
      <div class="topo-pdf">
        <img src="${e(urlAbsoluta("logo.jpg"))}" alt="Logo da Óticas Ventura">
        <div class="empresa-pdf">
          <h1>${e(empresa.nomeLoja || empresa.nomeFantasia || "Óticas Ventura")}</h1>
          ${empresa.cnpjLoja ? `<p>CNPJ: ${e(empresa.cnpjLoja)}</p>` : ""}
          ${endereco ? `<p>${e(endereco)}</p>` : ""}
          ${contato ? `<p>${e(contato)}</p>` : ""}
        </div>
        <div class="tipo-pdf"><strong>${e(titulo)}</strong><span>${e(subtitulo || "")}</span></div>
      </div>`;
  }

  function estilosDocumentoPDF() {
    return `
      .folha-pdf,.folha-pdf *{box-sizing:border-box}
      .folha-pdf{width:790px;max-width:790px;margin:0 auto;padding:18px;background:#fff;color:#17324b;font-family:Arial,Helvetica,sans-serif}
      .folha-pdf .topo-pdf{display:flex;gap:13px;align-items:center;padding-bottom:11px;border-bottom:2px solid #0d5d9f}
      .folha-pdf .topo-pdf img{width:66px!important;height:66px!important;max-width:66px!important;max-height:66px!important;object-fit:cover;border-radius:50%;flex:0 0 66px}
      .folha-pdf .empresa-pdf{min-width:0;flex:1}
      .folha-pdf .empresa-pdf h1{margin:0;color:#0d5d9f;font-size:23px}
      .folha-pdf .empresa-pdf p{margin:3px 0;color:#38556e;font-size:10px}
      .folha-pdf .tipo-pdf{text-align:right;color:#0d5d9f;font-size:12px;font-weight:800}
      .folha-pdf .tipo-pdf strong,.folha-pdf .tipo-pdf span{display:block}
      .folha-pdf .tipo-pdf span{margin-top:4px;color:#60788f;font-size:10px}
      .folha-pdf .grade-pdf{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .folha-pdf .box-pdf{margin-top:10px;padding:10px;border:1px solid #cfdce8;border-radius:9px;break-inside:avoid;page-break-inside:avoid}
      .folha-pdf .box-pdf h2{margin:0 0 7px;color:#0d5d9f;font-size:14px}
      .folha-pdf .box-pdf p{margin:4px 0;font-size:11px;line-height:1.35}
      .folha-pdf table{width:100%;border-collapse:collapse}
      .folha-pdf th,.folha-pdf td{padding:6px;border:1px solid #9fb4c5;text-align:center;font-size:10px}
      .folha-pdf th{background:#eaf4fc;color:#0d4d84}
      .folha-pdf .total-pdf{font-size:18px!important;color:#0d4d84;font-weight:900}
      .folha-pdf .aviso-pdf{margin-top:10px;padding:8px;border:1px solid #efc46a;border-radius:8px;background:#fff8e7;color:#73500b;font-size:9px;font-weight:800;text-align:center}
      .folha-pdf .assinaturas-pdf{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-top:38px;break-inside:avoid;page-break-inside:avoid}
      .folha-pdf .assinatura-pdf{padding-top:5px;border-top:1px solid #000;text-align:center;font-size:10px}
    `;
  }

  async function montarHtmlOS(os, tipoDocumento) {
    const empresa = await obterEmpresaCompartilhamento();
    const e = escaparHTMLCompartilhamento;
    const titulo = tipoDocumento === "recibo" ? "RECIBO DE ATENDIMENTO" : "ORDEM DE SERVIÇO";
    const subtitulo = tipoDocumento === "recibo"
      ? `OS Nº ${os.numero || "-"} • Sem valor fiscal`
      : `Via do cliente • OS Nº ${os.numero || "-"}`;

    const receita = tipoDocumento === "recibo" ? "" : `
      <div class="box-pdf">
        <h2>Receita / Exame</h2>
        <table>
          <tr><th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th></tr>
          <tr><td>OD</td><td>${e(os.odEsferico || "Plano")}</td><td>${e(os.odCilindrico || "-")}</td><td>${e(os.odEixo || "-")}</td></tr>
          <tr><td>OE</td><td>${e(os.oeEsferico || "Plano")}</td><td>${e(os.oeCilindrico || "-")}</td><td>${e(os.oeEixo || "-")}</td></tr>
        </table>
        <p><b>DNP:</b> ${e(os.dnp || "-")} &nbsp; <b>Altura:</b> ${e(os.altura || "-")} &nbsp; <b>ADD:</b> ${e(os.add || "-")}</p>
      </div>`;

    const textoRecibo = tipoDocumento === "recibo" ? `
      <div class="box-pdf">
        <h2>Declaração de recebimento</h2>
        <p>Recebemos de <b>${e(os.cliente || "-")}</b> o valor de <b>${e(valorMoedaCompartilhamento(os.entrada))}</b>, referente à Ordem de Serviço nº <b>${e(os.numero || "-")}</b>.</p>
        <p><b>Forma de pagamento:</b> ${e(os.pagamento || "-")} ${e(os.parcelasCartao || "")}</p>
        <p><b>Saldo restante:</b> ${e(valorMoedaCompartilhamento(os.restante))}</p>
      </div>` : "";

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${estilosDocumentoPDF()}</style></head><body>
      <main class="folha-pdf">
        ${cabecalhoEmpresaHTML(empresa, titulo, subtitulo)}
        <div class="grade-pdf">
          <div class="box-pdf">
            <h2>Cliente</h2>
            <p><b>Nome:</b> ${e(os.cliente || "-")}</p>
            <p><b>Telefone:</b> ${e(os.telefone || "-")}</p>
            ${os.email ? `<p><b>E-mail:</b> ${e(os.email)}</p>` : ""}
          </div>
          <div class="box-pdf">
            <h2>Atendimento</h2>
            <p><b>Data:</b> ${e(dataBRCompartilhamento(os.dataCompra))}</p>
            <p><b>Vendedor:</b> ${e(os.vendedor || "-")}</p>
            <p><b>Status:</b> ${e(os.status || "Recebido")}</p>
            ${tipoDocumento === "recibo" ? "" : `<p><b>Previsão:</b> ${e(dataBRCompartilhamento(os.previsaoEntrega))}</p>`}
          </div>
        </div>
        ${tipoDocumento === "recibo" ? textoRecibo : `
          <div class="box-pdf">
            <h2>Produto</h2>
            <p><b>Lente:</b> ${e(os.lente || "-")}</p>
            <p><b>Modelo da armação:</b> ${e(os.armacao || "-")}</p>
          </div>
          ${receita}
          <div class="box-pdf">
            <h2>Pagamento</h2>
            <p class="total-pdf"><b>Total:</b> ${e(valorMoedaCompartilhamento(os.valor))}</p>
            <p><b>Entrada:</b> ${e(valorMoedaCompartilhamento(os.entrada))}</p>
            <p><b>Restante:</b> ${e(valorMoedaCompartilhamento(os.restante))}</p>
            <p><b>Forma:</b> ${e(os.pagamento || "-")} ${e(os.parcelasCartao || "")}</p>
          </div>
          ${os.observacoes ? `<div class="box-pdf"><h2>Observações</h2><p>${e(os.observacoes)}</p></div>` : ""}
        `}
        <div class="assinaturas-pdf">
          <div class="assinatura-pdf">Assinatura do cliente</div>
          <div class="assinatura-pdf">Responsável pela loja</div>
        </div>
        ${tipoDocumento === "recibo" ? '<div class="aviso-pdf">RECIBO DE ATENDIMENTO — DOCUMENTO SEM VALOR FISCAL.</div>' : ""}
      </main>
    </body></html>`;
  }

  function dadosOSAtuaisCompartilhamento() {
    if (typeof window.dadosOSDosCampos === "function") return window.dadosOSDosCampos();
    const valor = id => document.getElementById(id)?.value || "";
    return {
      numero: valor("numeroOS"),
      cliente: valor("clienteOS"),
      telefone: valor("telefoneOS"),
      email: valor("emailOS"),
      dataCompra: valor("dataCompraOS"),
      previsaoEntrega: valor("previsaoEntregaOS"),
      vendedor: valor("vendedorOS"),
      status: valor("statusOS"),
      lente: valor("lenteOS"),
      armacao: valor("armacaoOS"),
      valor: valor("valorOS"),
      entrada: valor("entradaOS"),
      restante: valor("restanteOS"),
      pagamento: valor("pagamentoOS"),
      parcelasCartao: valor("parcelasCartao"),
      odEsferico: valor("odEsferico"),
      odCilindrico: valor("odCilindrico"),
      odEixo: valor("odEixo"),
      oeEsferico: valor("oeEsferico"),
      oeCilindrico: valor("oeCilindrico"),
      oeEixo: valor("oeEixo"),
      dnp: valor("dnpOS"),
      altura: valor("alturaOS"),
      add: valor("addOS"),
      observacoes: valor("observacoesOS")
    };
  }

  async function criarResultadoOS(os, tipoDocumento) {
    if (!os || !os.cliente) throw new Error("Selecione ou preencha um cliente.");
    const nomeBase = somenteNomeArquivo(os.cliente);
    const numero = somenteNomeArquivo(os.numero || "sem-numero");
    const recibo = tipoDocumento === "recibo";
    const nomeArquivo = recibo
      ? `Recibo-OS-${numero}-${nomeBase}.pdf`
      : `OS-${numero}-${nomeBase}.pdf`;
    const html = await montarHtmlOS(os, tipoDocumento);
    const blob = await gerarPdfDeHtml(html, nomeArquivo);
    const nomeCliente = primeiroNome(os.cliente);

    return {
      blob,
      nomeArquivo,
      titulo: recibo ? `Recibo da OS ${os.numero || ""}` : `Ordem de Serviço ${os.numero || ""}`,
      mensagem: recibo
        ? `Olá, ${nomeCliente}! Segue seu recibo de atendimento da Óticas Ventura. 👓`
        : `Olá, ${nomeCliente}! Segue sua Ordem de Serviço da Óticas Ventura. 👓`
    };
  }

  window.compartilharOSAtualPDF = function () {
    executarCompartilhamento(() => criarResultadoOS(dadosOSAtuaisCompartilhamento(), "os"));
  };

  window.compartilharReciboAtualPDF = function () {
    executarCompartilhamento(() => criarResultadoOS(dadosOSAtuaisCompartilhamento(), "recibo"));
  };

  async function obterOSPorIdCompartilhamento(id) {
    if (typeof db === "undefined") throw new Error("Banco de dados indisponível.");
    const documento = await db.collection("ordens").doc(id).get();
    if (!documento.exists) throw new Error("OS não encontrada.");
    return documento.data();
  }

  window.compartilharOSPorId = function (id) {
    executarCompartilhamento(async () => criarResultadoOS(await obterOSPorIdCompartilhamento(id), "os"));
  };

  window.compartilharReciboPorId = function (id) {
    executarCompartilhamento(async () => criarResultadoOS(await obterOSPorIdCompartilhamento(id), "recibo"));
  };

  async function montarHtmlReceita() {
    const valor = id => document.getElementById(id)?.value || "";
    const cliente = valor("clienteReceita");
    if (!cliente) throw new Error("Busque ou preencha um cliente antes de compartilhar.");
    const empresa = await obterEmpresaCompartilhamento();
    const e = escaparHTMLCompartilhamento;

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${estilosDocumentoPDF()}</style></head><body>
      <main class="folha-pdf">
        ${cabecalhoEmpresaHTML(empresa, "RECEITUÁRIO", "Documento do cliente")}
        <div class="grade-pdf">
          <div class="box-pdf">
            <h2>Cliente</h2>
            <p><b>Nome:</b> ${e(cliente)}</p>
            <p><b>Telefone:</b> ${e(valor("telefoneReceita") || "-")}</p>
            <p><b>CPF:</b> ${e(valor("cpfReceita") || "-")}</p>
          </div>
          <div class="box-pdf">
            <h2>Medidas</h2>
            <p><b>DNP:</b> ${e(valor("dnp") || "-")}</p>
            <p><b>Altura:</b> ${e(valor("altura") || "-")}</p>
            <p><b>Adição:</b> ${e(valor("adicao") || "-")}</p>
          </div>
        </div>
        <div class="box-pdf">
          <h2>Receita / Exame</h2>
          <table>
            <tr><th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th></tr>
            <tr><td>OD</td><td>${e(valor("odLongeEsferico") || "Plano")}</td><td>${e(valor("odLongeCilindrico") || "-")}</td><td>${e(valor("odLongeEixo") || "-")}</td></tr>
            <tr><td>OE</td><td>${e(valor("oeLongeEsferico") || "Plano")}</td><td>${e(valor("oeLongeCilindrico") || "-")}</td><td>${e(valor("oeLongeEixo") || "-")}</td></tr>
          </table>
        </div>
        ${valor("obsReceita") ? `<div class="box-pdf"><h2>Observações</h2><p>${e(valor("obsReceita"))}</p></div>` : ""}
        <div class="assinaturas-pdf">
          <div class="assinatura-pdf">Assinatura do responsável</div>
          <div class="assinatura-pdf">Óticas Ventura</div>
        </div>
      </main>
    </body></html>`;

    return { html, cliente };
  }

  window.compartilharReceitaPDF = function () {
    executarCompartilhamento(async () => {
      const dados = await montarHtmlReceita();
      const nomeArquivo = `Receita-${somenteNomeArquivo(dados.cliente)}.pdf`;
      const blob = await gerarPdfDeHtml(dados.html, nomeArquivo);
      return {
        blob,
        nomeArquivo,
        titulo: `Receita de ${dados.cliente}`,
        mensagem: `Olá, ${primeiroNome(dados.cliente)}! Segue sua receita da Óticas Ventura. 👓`
      };
    });
  };

  window.compartilharPreviaFiscalPDF = function () {
    executarCompartilhamento(async () => {
      const documentoOriginal = document.querySelector(".documento");
      if (!documentoOriginal) throw new Error("Prévia fiscal não encontrada.");
      const copia = documentoOriginal.cloneNode(true);
      copia.querySelectorAll(".acoes").forEach(elemento => elemento.remove());
      copia.style.maxWidth = "820px";
      copia.style.boxShadow = "none";
      copia.style.borderRadius = "0";
      copia.style.background = "#ffffff";

      const suporte = document.createElement("div");
      suporte.style.position = "fixed";
      suporte.style.left = "-12000px";
      suporte.style.top = "0";
      suporte.style.width = "820px";
      suporte.style.background = "#ffffff";
      suporte.appendChild(copia);
      document.body.appendChild(suporte);

      try {
        const numeroOS = document.getElementById("osNumero")?.textContent || "sem-numero";
        const cliente = document.getElementById("clienteNome")?.textContent || "cliente";
        const nomeArquivo = `Previa-fiscal-OS-${somenteNomeArquivo(numeroOS)}-${somenteNomeArquivo(cliente)}.pdf`;
        const blob = await gerarPdfDeElemento(copia, nomeArquivo);
        return {
          blob,
          nomeArquivo,
          titulo: `Prévia fiscal da OS ${numeroOS}`,
          mensagem: `Olá, ${primeiroNome(cliente)}! Segue a prévia do seu atendimento na Óticas Ventura. Documento sem valor fiscal.`
        };
      } finally {
        suporte.remove();
      }
    });
  };
})();
