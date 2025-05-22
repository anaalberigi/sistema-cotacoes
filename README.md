# Sistema de Cotações de Produtos

Este é um sistema web desenvolvido como parte do Projeto Integrador III do curso de Engenharia da Computação pela UNIVESP.Ele permite o cadastro e acompanhamento de cotações de produtos com controle de moeda, histórico e análise gráfica.

## 📌 Funcionalidades

- Login com proteção de sessão e expiração por inatividade
- Cadastro de produtos com nome, quantidade, preço e moeda
- Conversão automática de moeda (Real, Dólar, Euro) via API de câmbio
- Registro histórico completo de cotações com data e taxa de câmbio usada
- Análise de dados com cálculo de média, maior/menor preço e gráficos
- Gráfico de evolução dos preços em reais
- Sistema acessível, responsivo e com estrutura modular

## 🚀 Como usar

1. Acesse o sistema via `login.html` ou GitHub Pages
2. Faça login com:
   - **Usuário:** admin
   - **Senha:** 102030
3. Após login, cadastre os produtos e navegue pelo histórico
4. Utilize os botões para editar, excluir e visualizar análises gráficas

## 🛠️ Tecnologias utilizadas

- HTML, CSS, JavaScript
- Chart.js
- API AwesomeAPI (taxas de câmbio em tempo real)
- Armazenamento local com `localStorage`
- Estrutura pronta para deploy via GitHub Pages

## 🔐 Segurança implementada

- Sessão expira automaticamente após inatividade
- Proteção contra duplicidade de nomes no cadastro

## 📚 Objetivo acadêmico

Este sistema foi desenvolvido com o objetivo de integrar conhecimentos técnicos em desenvolvimento web, banco de dados, acessibilidade, controle de versão e uso de APIs externas.

---

> Projeto acadêmico — todos os dados e estruturas são fictícios e utilizados apenas para fins educacionais.
