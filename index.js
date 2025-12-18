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
  // --- AUTO-BUILD ---
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

  // --- Lógica dos Templates ---
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

  // Gera o Dockerfile
  fs.writeFileSync('Dockerfile', dockerContent.trim());
  console.log(`✅ Dockerfile gerado para ${answers.tech} com sucesso!`);

  // --- Lógica do Docker Compose ---
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

  // --- Lógica do AUTO-BUILD ---
  if (answers.autoBuild) {
    console.log("\n🚀 Iniciando o Build... (Isso pode demorar uns segundos)");
    
    try {
      if (answers.compose) {
        // Se tem compose, usa o comando do compose
        console.log("⚙️  Rodando: docker-compose up -d --build");
        execSync('docker-compose up -d --build', { stdio: 'inherit' });
      } else {
        // Se é só Dockerfile, usa o comando padrão
        console.log(`⚙️  Rodando: docker build -t ${answers.imageName} .`);
        execSync(`docker build -t ${answers.imageName} .`, { stdio: 'inherit' });
      }
      console.log("\n✨ SUCESSO! Seu container foi construído.");
    } catch (error) {
      console.log("\n❌ ERRO NO BUILD: Verifique se o Docker está aberto no seu PC.");
      console.log("Dica: Tente rodar 'docker ps' no terminal para testar.");
    }
  }
});
