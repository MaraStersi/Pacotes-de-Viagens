const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');

// conexão com o banco de dados
const sequelize = new Sequelize('viagens_db', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql'
});

// Testando a conexão com o banco de dados
sequelize.authenticate()
    .then(() => {
        console.log('Conexão bem-sucedida!');
    })
    .catch((error) => {
        console.error('Erro de conexão:', error);
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

// sincronizando o banco de dados
sequelize.sync()
    .then(() => console.log("Banco de dados sincronizado"))
    .catch(err => console.error("Erro ao sincronizar banco de dados:", err));

const app = express();
const port = 3001;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './views');

// autenticação
app.use(session({
    secret: 'viagemsecret',
    resave: false,
    saveUninitialized: true
}));

// autenticação
function autenticar(req, res, next) {
    if (req.session.autenticado) {
        return next();
    }
    res.redirect('/login');
}

// rota para a página inicial (frontend)
/*app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/pacotes');
        res.render('index', { pacotes: response.data });
    } catch (error) {
        console.error("Erro ao buscar pacotes:", error);
        res.render('index', { pacotes: [] });
    }
});*/

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/pacotes');
        // Passando o valor da autenticação para a view
        res.render('index', { 
            pacotes: response.data, 
            autenticado: req.session.autenticado || false // Certificando que o valor é booleano
        });
    } catch (error) {
        console.error("Erro ao buscar pacotes:", error);
        res.render('index', { 
            pacotes: [], 
            autenticado: req.session.autenticado || false 
        });
    }
});



// rota de login (frontend)
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    if (usuario === 'admin' && senha === 'senha123') {
        req.session.autenticado = true;
        res.redirect('/');
    } else {
        res.send('Credenciais inválidas');
    }
});

// Rota para visualizar os detalhes de um pacote (frontend)
app.get('/pacote/:id', autenticar, async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3001/pacotes/${req.params.id}`);
        const pacote = response.data;
        if (pacote) {
            res.render('pacoteDetalhes', { pacote });
        } else {
            res.send('Pacote não encontrado');
        }
    } catch (error) {
        console.error("Erro ao buscar pacote:", error);
        res.send('Erro ao buscar pacote');
    }
});

// Rota de logout (frontend)
/*app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});*/
app.get('/logout', (req, res) => {
    req.session.autenticado = false; // Limpa a variável de autenticação
    res.redirect('/'); // Redireciona de volta para a página principal
});


// Rotas da API (backend)
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

app.post('/pacotes', async (req, res) => {
    try {
        const pacote = await PacoteViagem.create(req.body);
        res.status(201).json(pacote);
    } catch (error) {
        console.error('Erro ao cadastrar pacote:', error);
        res.status(400).json({ error: error.message });
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

// Rota para renderizar o painel de pacotes (frontend)
app.get('/painel-pacotes', async (req, res) => {
    try {
        const pacotes = await PacoteViagem.findAll(); // Tenta buscar todos os pacotes no banco
        if (pacotes.length > 0) {
            res.render('painelPacotes', { pacotes });
        } else {
            res.status(404).json({ error: 'Nenhum pacote encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar pacotes:', error);
        res.status(500).json({ error: 'Erro ao buscar pacotes', details: error.message });
    }
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
