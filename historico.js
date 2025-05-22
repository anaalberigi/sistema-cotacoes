document.addEventListener("DOMContentLoaded", () => {
    const nomeProduto = localStorage.getItem("historicoProduto");
    const cotacoes = JSON.parse(localStorage.getItem("cotacoes")) || [];
  
    const h1 = document.getElementById("titulo");
    const tbody = document.querySelector("#tabelaHistorico tbody");
    const analiseDiv = document.getElementById("analise");
    const graficoDiv = document.getElementById("grafico");
    const btnMedia = document.getElementById("btnMedia");
    const btnMaiorMenor = document.getElementById("btnMaiorMenor");
    const btnGrafico = document.getElementById("btnGrafico");
    const btnVoltar = document.getElementById("btnVoltar");
    const usuario = localStorage.getItem("usuarioLogado");

    if (!usuario) {
      window.location.href = "login.html";
    }
    
    const TEMPO_INATIVIDADE = 5 * 60 * 1000;
    let timerInatividade;
    
    function encerrarSessao() {
      localStorage.removeItem("usuarioLogado");
      localStorage.removeItem("loginExpiraEm");
      alert("Sessão encerrada por inatividade.");
      window.location.href = "login.html";
    }
    
    function resetarInatividade() {
      clearTimeout(timerInatividade);
      timerInatividade = setTimeout(encerrarSessao, TEMPO_INATIVIDADE);
    }
    
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evento => {
      document.addEventListener(evento, resetarInatividade);
    });
    
    resetarInatividade();
    
    h1.textContent = `Histórico de Cotações: ${nomeProduto}`;
    const historico = cotacoes.filter(c => c.nome === nomeProduto);
  
    // Preenche a tabela
    historico.forEach(entry => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${entry.data}</td>
        <td>${entry.moeda}</td>
        <td>${entry.taxaCambio? `R$ ${entry.taxaCambio.toFixed(4).replace(".",",")}` : "-"}</td>
        <td>${entry.precoFormatado}</td>
        <td>${entry.quantidade}</td>
        <td>${entry.totalConvertido}</td>
      `;
      tbody.appendChild(tr);
    });
  
    function parseValorBRL(valor) {
      return parseFloat(
        valor.replace("R$", "").replace(" ", "").replace(".", "").replace(",", ".")
      );
    }
  
    function gerarGraficoPrecoUnitario() {
      if (document.getElementById("graficoCanvas")) return; // Evita recriar
  
      graficoDiv.innerHTML = `
        <h3 style="text-align:center;">Preço Unitário (em BRL)</h3>
        <canvas id="graficoCanvas" style="max-height: 300px;"></canvas>
      `;
      const ctx = document.getElementById("graficoCanvas").getContext("2d");
  
      const labels = historico.map(h => h.data);
      const valores = historico.map(h => {
        const preco = h.preco;
        const moeda = h.moeda;
        let taxa = 1;
  
        if (moeda.includes("USD") || moeda.includes("US$")) taxa = 5.67;
        if (moeda.includes("EUR") || moeda.includes("€")) taxa = 6.58;
  
        return parseFloat((preco * taxa).toFixed(2));
      });
  
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: `Preço Unitário (BRL) – ${nomeProduto}`,
            data: valores,
            backgroundColor: "#005c99"
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Valor em Reais (R$)"
              }
            }
          }
        }
      });
    }
  
    btnMedia.onclick = () => {
      if (historico.length === 0) return;
  
      const precos = historico.map(h => h.preco);
      const media = precos.reduce((acc, val) => acc + val, 0) / precos.length;
  
      analiseDiv.innerHTML = `
        <h3 style="margin-top: 20px;">Análise de Preço Unitário</h3>
        <p><strong>Média de preço unitário:</strong> ${media.toLocaleString("pt-BR", {
          style: "currency", currency: "BRL"
        })}</p>
      `;
  
      gerarGraficoPrecoUnitario();
    };
  
    btnMaiorMenor.onclick = () => {
      if (historico.length === 0) return;
  
      let maior = historico[0];
      let menor = historico[0];
  
      historico.forEach(entry => {
        if (entry.preco > maior.preco) maior = entry;
        if (entry.preco < menor.preco) menor = entry;
      });
  
      analiseDiv.innerHTML = `
        <h3 style="margin-top: 20px;">Análise de Preço Unitário</h3>
        <p><strong>Maior preço unitário:</strong> ${maior.precoFormatado} em ${maior.data}</p>
        <p><strong>Menor preço unitário:</strong> ${menor.precoFormatado} em ${menor.data}</p>
      `;
  
      gerarGraficoPrecoUnitario();
    };
  
    btnGrafico.onclick = () => {
      if (historico.length === 0) return;
      analiseDiv.innerHTML = "";
  
      graficoDiv.innerHTML = `
        <h3 style="text-align:center;">Total Convertido (em R$)</h3>
        <canvas id="graficoCanvas" style="max-height: 300px;"></canvas>
        <small style="display:block; text-align:center; color:#555; margin-top: 10px;">
          * O gráfico representa o <strong>valor total da cotação em reais (R$)</strong>, calculado com base no preço unitário × quantidade × câmbio da data.
        </small>
      `;
  
      const ctx = document.getElementById("graficoCanvas").getContext("2d");
      const labels = historico.map(h => h.data);
      const valores = historico.map(h => parseValorBRL(h.totalConvertido));
  
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: `Total (BRL) - ${nomeProduto}`,
            data: valores,
            backgroundColor: "#005c99"
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Valor em Reais (R$)"
              }
            }
          }
        }
      });
    };
  
    btnVoltar.onclick = () => {
      window.location.href = "index.html";
    };
  });
  