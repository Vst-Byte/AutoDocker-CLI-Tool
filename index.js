const inquirer = require('inquirer');
const fs = require('fs');
const { execSync } = require('child_process');

console.log("🤖 BEM-VINDO AO AUTODOCKER (DevSecOps Edition)");

const questions = [
  {
    type: 'list',
    name: 'tech',
    message: '🚀 Para qual tecnologia vamos criar o ambiente?',
    choices: ['Node.js', 'Python', 'Go (Golang)', 'Java']
  },
  // --- Perguntas de Versão ---
  {
    type: 'list',
    name: 'version',
    message: '📦 Qual versão do Node.js?',
    choices: ['16', '18', '20'],
    when: (answers) => answers.tech === 'Node.js'
  },
  {
    type: 'list',
    name: 'version',
    message: '📦 Qual versão do Python?',
    choices: ['3.9', '3.10', '3.11'],
    when: (answers) => answers.tech === 'Python'
  },
  {
    type: 'list',
    name: 'version',
    message: '📦 Qual versão do Go?',
    choices: ['1.21', '1.20', '1.19'],
    when: (answers) => answers.tech === 'Go (Golang)'
  },
  {
    type: 'list',
    name: 'version',
    message: '📦 Qual versão do Java (JDK)?',
    choices: ['11', '17', '21'],
    when: (answers) => answers.tech === 'Java'
  },
  // --- Docker Compose ---
  {
    type: 'confirm',
    name: 'compose',
    message: '🗄️ Deseja gerar um docker-compose com Banco de Dados?',
    default: false
  },
  {
    type: 'list',
    name: 'db',
    message: 'Qual banco de dados?',
    choices: ['PostgreSQL', 'MySQL', 'MongoDB'],
    when: (answers) => answers.compose === true
  },
  // --- CI/CD (NOVIDADE AQUI!) ---
  {
    type: 'confirm',
    name: 'cicd',
    message: '⚙️ Deseja gerar uma pipeline de CI/CD (GitHub Actions)?',
    default: true
  },
  // --- Auto-Build ---
  {
    type: 'confirm',
    name: 'autoBuild',
    message: '🔨 Deseja construir (Build) a imagem agora automaticamente?',
    default: true
  },
  {
    type: 'input',
    name: 'imageName',
    message: '🏷️ Qual nome você quer dar para a imagem?',
    default: 'meu-projeto-app',
    when: (answers) => answers.autoBuild === true && answers.compose === false
  }
];

inquirer.prompt(questions).then(answers => {
  let dockerContent = '';

  // 1. Gera o Dockerfile
  if (answers.tech === 'Node.js') {
    dockerContent = `
FROM node:${answers.version}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]`;
  } else if (answers.tech === 'Python') {
    dockerContent = `
FROM python:${answers.version}-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]`;
  } else if (answers.tech === 'Go (Golang)') {
    dockerContent = `
FROM golang:${answers.version}-alpine
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]`;
  } else if (answers.tech === 'Java') {
    dockerContent = `
FROM eclipse-temurin:${answers.version}-jdk-alpine
WORKDIR /app
COPY . .
RUN javac Main.java
EXPOSE 8080
CMD ["java", "Main"]`;
  }

  fs.writeFileSync('Dockerfile', dockerContent.trim());
  console.log(`✅ Dockerfile gerado para ${answers.tech} com sucesso!`);

  // 2. Gera o docker-compose.yml
  if (answers.compose) {
    let dbImage = '', dbPort = '';
    if (answers.db === 'PostgreSQL') { dbImage = 'postgres:13-alpine'; dbPort = '5432:5432'; }
    if (answers.db === 'MySQL') { dbImage = 'mysql:8.0'; dbPort = '3306:3306'; }
    if (answers.db === 'MongoDB') { dbImage = 'mongo:latest'; dbPort = '27017:27017'; }

    const composeContent = `
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=db
  db:
    image: ${dbImage}
    ports:
      - "${dbPort}"
    restart: always
`;
    fs.writeFileSync('docker-compose.yml', composeContent.trim());
    console.log(`✅ docker-compose.yml gerado com banco ${answers.db}!`);
  }

  // 3. Gera o GitHub Actions (A MÁGICA NOVA)
  if (answers.cicd) {
    // Cria as pastas .github/workflows se elas não existirem
    const dir = './.github/workflows';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    // O conteúdo do arquivo ci.yml
    const ciContent = `
name: CI Pipeline
on: [push]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Baixar código
        uses: actions/checkout@v3
      
      - name: Setup Docker
        uses: docker/setup-buildx-action@v2
      
      - name: Build da Imagem
        run: docker build . -t app-teste
      
      - name: Scan de Segurança (Trivy)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'app-teste'
          format: 'table'
          exit-code: '0' # Não quebra o build por enquanto
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
`;
    fs.writeFileSync(`${dir}/ci.yml`, ciContent.trim());
    console.log(`✅ Pipeline de CI/CD gerada na pasta .github/workflows!`);
  }

  // 4. Auto-Build
  if (answers.autoBuild) {
    console.log("\n🚀 Iniciando o Build...");
    try {
      if (answers.compose) {
        execSync('docker-compose up -d --build', { stdio: 'inherit' });
      } else {
        execSync(`docker build -t ${answers.imageName} .`, { stdio: 'inherit' });
      }
      console.log("\n✨ SUCESSO! Build finalizado.");
    } catch (error) {
      console.log("\n❌ O Build falhou (Verifique se o Docker está rodando).");
    }
  }
});
