const fs = require('fs');
const inquirer = require('inquirer');

// --- TEMPLATES ---
const DOCKERFILE_PYTHON = (version) => `
FROM python:${version}-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
`;

const DOCKERFILE_NODE = (version) => `
FROM node:${version}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`;

// --- QUESTIONÁRIO ---
const questions = [
  {
    type: 'list',
    name: 'tech',     
    message: '🚀 Para qual tecnologia vamos criar o Dockerfile?',
    choices: ['Node.js', 'Python'],
  },
  {
    type: 'list',    
    name: 'version',
    message: '📦 Qual versão da imagem base?',
    // Esta função "choices" decide as opções baseada na resposta anterior!
    choices: (respostasAnteriores) => {
        if (respostasAnteriores.tech === 'Node.js') {
            return ['20', '18', '16', 'latest'];
        } else {
            return ['3.11', '3.9', '3.8', 'latest'];
        }
    }
  },
  {
    type: 'confirm', 
    name: 'confirmation',
    message: 'Posso gerar o arquivo agora?',
    default: true
  }
];

// --- EXECUÇÃO ---
console.log('🤖 INICIANDO AUTODOCKER...\n');

inquirer.prompt(questions).then((answers) => {
    // Se o usuário disse "Não" na confirmação, paramos.
    if (!answers.confirmation) {
        console.log('❌ Operação cancelada pelo usuário.');
        return;
    }

    let finalContent = '';

    // Escolhe o template certo
    if (answers.tech === 'Node.js') {
        finalContent = DOCKERFILE_NODE(answers.version);
    } else {
        finalContent = DOCKERFILE_PYTHON(answers.version);
    }

    // Escreve o arquivo
    try {
        fs.writeFileSync('Dockerfile', finalContent.trim());
        console.log('\n✨ Dockerfile criado com sucesso!');
        console.log(`📝 Tipo: ${answers.tech} | Versão: ${answers.version}`);
    } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
    }
});
