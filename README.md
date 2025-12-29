# 🚀 AutoDocker CLI Tool

![NodeJS](https://img.shields.io/badge/Node.js-v12%2B-green) ![License](https://img.shields.io/badge/license-MIT-blue) ![Status](https://img.shields.io/badge/status-MVP-orange) [![Node.js CI & Security](https://github.com/Vst-Byte/AutoDocker-CLI-Tool/actions/workflows/ci.yml/badge.svg)](https://github.com/Vst-Byte/AutoDocker-CLI-Tool/actions/workflows/ci.yml).

**AutoDocker** é uma ferramenta de linha de comando (CLI) interativa projetada para automatizar a geração de arquivos `Dockerfile` padronizados e seguros para projetos de desenvolvimento.

Construída com **Node.js**, esta ferramenta visa eliminar configurações manuais repetitivas e garantir que todo container criado siga as **boas práticas de DevSecOps** desde o início (imagens mínimas, cache de camadas e versionamento explícito).

---

## 📋 Índice
- [Funcionalidades](#-funcionalidades)
- [O Diferencial DevSecOps](#-o-diferencial-devsecops)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Próximos Passos (Roadmap)](#-próximos-passos-roadmap)
- [Autor](#-autor)

---
## ✨ Funcionalidades

* **Menu Interativo:** Interface amigável via terminal utilizando `Inquirer.js`.
* **Suporte Multi-Linguagem:** Templates otimizados para:
    * 🟢 **Node.js** (Baseado em Alpine Linux)
    * 🐍 **Python** (Baseado em imagens Slim)
* **Geração de Pipeline CI/CD:** Cria automaticamente fluxos de trabalho do GitHub Actions (`.github/workflows`) com scan de segurança integrado.
* **Versionamento Dinâmico:** O usuário escolhe a versão da linguagem (ex: Node 18, 20 ou Python 3.9, 3.11).
* **Prevenção de Conflitos:** Detecta se já existe um `Dockerfile` na pasta para evitar sobrescrita acidental.

---

## 🔒 O Diferencial DevSecOps

Como uma iniciativa de **Engenharia de Plataforma & Segurança**, esta ferramenta resolve o problema de ambientes inconsistentes e imagens "inchadas".

### 1. Security by Design (Superfície de Ataque Reduzida)
A ferramenta força o uso de imagens **Alpine** (para Node) e **Slim** (para Python).
* **Benefício:** Remove pacotes desnecessários do sistema operacional, reduzindo drasticamente o número de vulnerabilidades (CVEs) conhecidas.
* **Resultado:** Imagens mais leves e seguras para produção.

### 2. Otimização de Build (Cache de Camadas)
Os Dockerfiles gerados seguem o padrão de "Dependências Primeiro":
```dockerfile
# Exemplo do código gerado
COPY package*.json ./
RUN npm install
COPY . .
```
### 🛠 Pré-requisitos
- Node.js: Versão 12 ou superior.

- NPM: Gerenciador de pacotes (já vem com o Node).

### 🖥 Instalação
1. Clone o repositório:
```bash
git clone [https://github.com/Vst-Byte/AutoDocker-CLI-Tool.git](https://github.com/Vst-Byte/AutoDocker-CLI-Tool.git)
cd AutoDocker-CLI-Tool
```
2. Instale as dependências:
```bash
npm install
```
### 🖱 Como Usar
Execute a ferramenta dentro da pasta do seu projeto:
```bash
node index.js
```
### Siga o passo a passo interativo:
1. Selecione a tecnologia do projeto.
2. Escolha a versão desejada.
3. Confirme a geração do arquivo.

Exemplo de Saída no Terminal:

🤖 INICIANDO AUTODOCKER...
```bash
? 🚀 Para qual tecnologia vamos criar o Dockerfile? Node.js
? 📦 Qual versão da imagem base? 18
? Posso gerar o arquivo agora? Yes

✨ Dockerfile criado com sucesso!
📝 Tipo: Node.js | Versão: 18 |
```
------------------------------------------------------------
## 📂 Estrutura do Projeto

```text
.
├── index.js          # Ponto de entrada (Lógica e Templates)
├── package.json      # Dependências (Inquirer)
└── README.md         # Documentação

```
------------------------------------------------------------
### 🗺 Próximos Passos (Roadmap)
Melhorias planejadas para as próximas versões:

- [X] Auto-Build: Executar o comando docker build automaticamente após gerar o arquivo.

- [X] Suporte a docker-compose: Gerar arquivo para subir banco de dados junto com a app.

- [x] Integração CI/CD: Opção para gerar um arquivo básico de pipeline do GitHub Actions.

- [X] Novas Linguagens: Adicionar suporte para Go e Java.




