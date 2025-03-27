const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');

// Configuração da conexão com o banco de dados
const sequelize = new Sequelize('viagens_db', 'root', 'sawil123', {
    host: 'localhost',
    dialect: 'mysql'
});

// Testando a conexão com o banco de dados
sequelize.authenticate()
    .then(() => {
        console.log('Conexão bem-sucedida!');
    })
    .catch((error) => {
        console.error('Erro de conexão:', error); // Exibe o erro caso a conexão falhe
    });

// Definindo o modelo PacoteViagem
const PacoteViagem = sequelize.define('PacoteViagem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    destino: { type: DataTypes.STRING, allowNull: false },
    preco: { type: DataTypes.FLOAT, allowNull: false },
    dataPartida: { type: DataTypes.DATE, allowNull: false },
    descricao: { type: DataTypes.TEXT },
    duracao: { type: DataTypes.STRING },
    lugaresDisponiveis: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'pacotes_viagem',
    timestamps: false
});

// Sincronizando o banco de dados
sequelize.sync()
    .then(() => console.log("Banco de dados sincronizado"))
    .catch(err => console.error("Erro ao sincronizar banco de dados:", err));

const app = express();
const port = 3001;

// Configurando o middleware
app.use(bodyParser.json());
app.use(session({
    secret: 'viagemsecret',
    resave: false,
    saveUninitialized: true
}));



// Rotas da API
app.post('/pacotes', async (req, res) => {
    try {
        const pacote = await PacoteViagem.create(req.body);
        res.status(201).json(pacote);
    } catch (error) {
        console.error('Erro ao cadastrar pacote:', error);
        res.status(400).json({ error: error.message });
    }
});

// Rota para renderizar o painel de pacotes (painelPacotes.ejs)
app.get('/painel-pacotes', async (req, res) => {
    try {
        const pacotes = await PacoteViagem.findAll(); // Tenta buscar todos os pacotes no banco
        if (pacotes.length > 0) {
            res.render('painelPacotes', { pacotes });
        } else {
            res.status(404).json({ error: 'Nenhum pacote encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar pacotes:', error);  // Log do erro completo
        res.status(500).json({ error: 'Erro ao buscar pacotes', details: error.message });
    }
});



app.get('/pacotes', async (req, res) => {
    try {
        const pacotes = await PacoteViagem.findAll();
        res.json(pacotes);
    } catch (error) {
        console.error('Erro ao obter pacotes:', error);
        res.status(500).json({ error: 'Erro ao obter pacotes' });
    }
});

app.get('/pacotes/:id', async (req, res) => {
    try {
        const pacote = await PacoteViagem.findByPk(req.params.id);
        if (pacote) {
            res.json(pacote);
        } else {
            res.status(404).json({ error: "Pacote não encontrado" });
        }
    } catch (error) {
        console.error('Erro ao buscar pacote:', error);
        res.status(500).json({ error: 'Erro ao buscar pacote' });
    }
});

app.put('/pacotes/:id', async (req, res) => {
    try {
        const pacote = await PacoteViagem.findByPk(req.params.id);
        if (pacote) {
            await pacote.update(req.body);
            res.json(pacote);
        } else {
            res.status(404).json({ error: "Pacote não encontrado" });
        }
    } catch (error) {
        console.error('Erro ao atualizar pacote:', error);
        res.status(400).json({ error: 'Erro ao atualizar pacote' });
    }
});

app.delete('/pacotes/:id', async (req, res) => {
    try {
        const pacote = await PacoteViagem.findByPk(req.params.id);
        if (pacote) {
            await pacote.destroy();
            res.json({ message: "Pacote excluído com sucesso" });
        } else {
            res.status(404).json({ error: "Pacote não encontrado" });
        }
    } catch (error) {
        console.error('Erro ao excluir pacote:', error);
        res.status(400).json({ error: 'Erro ao excluir pacote' });
    }
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
