/* script.js - funcionalidade principal do sistema*/

document.addEventListener("DOMContentLoaded", () => {
  const nome = document.getElementById("nome");
  const quantidade = document.getElementById("quantidade");
  const moeda = document.getElementById("moeda");
  const preco = document.getElementById("preco");
  const categoria = document.getElementById("categoria");
  const btnCadastrar = document.getElementById("btnCadastrar");
  const btnExcluir = document.getElementById("btnExcluir");
  const btnEditar = document.getElementById("btnEditar");
  const btnHistorico = document.getElementById("btnVerHistorico");
  const tabelaBody = document.getElementById("tabela-body");
  const conversaoInfo = document.getElementById("conversao");
  const usuario = localStorage.getItem("usuarioLogado");

  if (!usuario) {
    window.location.href = "login.html";
  }

  // Tempo máximo de inatividade (em milissegundos)
  const TEMPO_INATIVIDADE = 1 * 60 * 1000; // 5 minutos

  let timerInatividade;

  // Função que desloga
  function encerrarSessao() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("loginExpiraEm");
    alert("Sessão encerrada por inatividade.");
    window.location.href = "login.html";
  }

  // Função que reinicia o timer sempre que o usuário interagir
  function resetarInatividade() {
    clearTimeout(timerInatividade);
    timerInatividade = setTimeout(encerrarSessao, TEMPO_INATIVIDADE);
  }

  // Monitora ações do usuário
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evento => {
    document.addEventListener(evento, resetarInatividade);
  });

  // Inicia o primeiro timer
  resetarInatividade();

  
  let dados = JSON.parse(localStorage.getItem("produtos")) || [];
  let cotacoes = JSON.parse(localStorage.getItem("cotacoes")) || [];
  let taxaCambioAtual = 1;

  async function buscarTaxaCambio(moedaSelecionada) {
    if (moedaSelecionada === "BRL") {
      taxaCambioAtual = 1;
      conversaoInfo.textContent = "";
      return;
    }

    try {
      const response = await fetch(`https://economia.awesomeapi.com.br/last/${moedaSelecionada}-BRL`);
      const data = await response.json();
      const key = `${moedaSelecionada}BRL`;
      taxaCambioAtual = parseFloat(data[key].bid);
      conversaoInfo.textContent = `1 ${moedaSelecionada} = R$ ${taxaCambioAtual.toFixed(2).replace(".", ",")}`;
    } catch (error) {
      alert("Erro ao buscar taxa de câmbio");
    }
  }

  moeda.addEventListener("change", () => {
    buscarTaxaCambio(moeda.value);
  });

  buscarTaxaCambio(moeda.value);

  function formatarMoeda(valor, tipo = "BRL") {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: tipo
    });
  }

  function renderTabela() {
    tabelaBody.innerHTML = "";
    dados.forEach((item, index) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td><input type="checkbox" data-id="${index}"></td>
        <td>${item.nome}</td>
        <td>${item.quantidade}</td>
        <td>${item.precoFormatado}</td>
        <td>${item.totalFormatado}</td>
      `;
      tabelaBody.appendChild(linha);
    });
  }

  btnCadastrar.onclick = () => {
    const nomeProduto = nome.value.trim();
    if (!nomeProduto || dados.some(p => p.nome.toLowerCase() === nomeProduto.toLowerCase())) {
      alert("Nome inválido ou já cadastrado.");
      return;
    }

    const qtd = parseFloat(quantidade.value);
    const valor = parseFloat(preco.value.replace(",", "."));
    const moedaSelecionada = moeda.value;

    if (isNaN(qtd) || isNaN(valor)) {
      alert("Informe quantidade e preço válidos.");
      return;
    }

    const totalBRL = valor * qtd * taxaCambioAtual;

    const precoFormatado = (moedaSelecionada === "BRL")
      ? formatarMoeda(valor, "BRL")
      : moedaSelecionada === "USD"
        ? `US$ ${valor.toFixed(2).replace(".", ",")}`
        : `€ ${valor.toFixed(2).replace(".", ",")}`;

    const produto = {
      nome: nomeProduto,
      quantidade: qtd,
      preco: valor,
      precoFormatado,
      totalFormatado: formatarMoeda(totalBRL, "BRL"),
      categoria: categoria.value,
      moeda: moedaSelecionada
    };

    const cotacao = {
      nome: nomeProduto,
      preco: valor,
      precoFormatado,
      quantidade: qtd,
      moeda: moedaSelecionada,
      totalConvertido: formatarMoeda(totalBRL, "BRL"),
      taxaCambio: taxaCambioAtual, 
      data: new Date().toLocaleDateString("pt-BR")
    };

    dados.push(produto);
    cotacoes.push(cotacao);

    localStorage.setItem("produtos", JSON.stringify(dados));
    localStorage.setItem("cotacoes", JSON.stringify(cotacoes));
    renderTabela();

    nome.value = "";
    quantidade.value = "";
    preco.value = "";
    categoria.value = "";
  };

  btnExcluir.onclick = () => {
    const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");
    if (!checkboxes.length) return;

    const indicesParaExcluir = [...checkboxes].map(cb => parseInt(cb.dataset.id));
    dados = dados.filter((_, i) => !indicesParaExcluir.includes(i));
    localStorage.setItem("produtos", JSON.stringify(dados));
    renderTabela();
  };

  btnEditar.onclick = () => {
    const index = [...document.querySelectorAll("input[type='checkbox']")].findIndex(cb => cb.checked);
    if (index === -1) {
      alert("Selecione um produto para editar.");
      return;
    }

    const produto = dados[index];

    // Preenche campos com dados
    nome.value = produto.nome;
    quantidade.value = produto.quantidade;
    preco.value = produto.preco;
    categoria.value = produto.categoria || "";
    moeda.value = produto.moeda;

    buscarTaxaCambio(produto.moeda);

    // Remove o produto atual da lista (será regravado)
    dados.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(dados));
    renderTabela();
  };

  btnHistorico.onclick = () => {
    const index = [...document.querySelectorAll("input[type='checkbox']")].findIndex(cb => cb.checked);
    if (index === -1) {
      alert("Selecione um produto para visualizar o histórico.");
      return;
    }

    const produto = dados[index];
    localStorage.setItem("historicoProduto", produto.nome);
    window.location.href = "historico.html";
  };

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
  
  renderTabela();
});
