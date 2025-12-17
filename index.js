const inquirer = require('inquirer');
const fs = require('fs');

console.log("🤖 BEM-VINDO AO AUTODOCKER (DevSecOps Edition)");

const questions = [
  {
    type: 'list',
    name: 'tech',
    message: '🚀 Para qual tecnologia vamos criar o ambiente?',
    choices: ['Node.js', 'Python']
  },
  {
    type: 'list',
    name: 'version',
    message: '📦 Qual versão da imagem base?',
    choices: ['14', '16', '18', '20'], 
    when: (answers) => answers.tech === 'Node.js'
  },
  {
    type: 'list',
    name: 'version',
    message: '📦 Qual versão da imagem base?',
    choices: ['3.8', '3.9', '3.11'],
    when: (answers) => answers.tech === 'Python'
  },
  {
    type: 'confirm',
    name: 'compose',
    message: ' Deseja gerar um docker-compose com Banco de Dados?',
    default: false
  },
  {
    type: 'list',
    name: 'db',
    message: '🪑Qual banco de dados?',
    choices: ['PostgreSQL', 'MySQL', 'MongoDB'],
    when: (answers) => answers.compose === true
  }
];

inquirer.prompt(questions).then(answers => {
  // 1. Gera o Dockerfile (Lógica antiga mantida)
  let dockerContent = '';
  if (answers.tech === 'Node.js') {
    dockerContent = `
FROM node:${answers.version}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]`;
  } else {
    dockerContent = `
FROM python:${answers.version}-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]`;
  }

  fs.writeFileSync('Dockerfile', dockerContent.trim());
  console.log('✅ Dockerfile gerado com sucesso!');

  // 2. Gera o docker-compose.yml
  if (answers.compose) {
    let dbImage = '';
    let dbPort = '';

    if (answers.db === 'PostgreSQL') { dbImage = 'postgres:13-alpine'; dbPort = '5432:5432'; }
    if (answers.db === 'MySQL') { dbImage = 'mysql:8.0'; dbPort = '3306:3306'; }
    if (answers.db === 'MongoDB') { dbImage = 'mongo:latest'; dbPort = '27017:27017'; }

    const composeContent = `
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
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
});
