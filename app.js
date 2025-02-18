const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3001;

// Configurações do middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Sessão para autenticação
app.use(session({
    secret: 'viagemsecret',
    resave: false,
    saveUninitialized: true
}));

// Pacotes de viagem (dados fictícios)
const pacotes = [
    { id: 1, nome: 'Viagem para Paris', destino: 'Paris', preco: 5000, dataPartida: '2025-06-15', descricao: 'Pacote incrível para conhecer Paris.', duracao: '7 dias', lugaresDisponiveis: 5 },
    { id: 2, nome: 'Aventura na Tailândia', destino: 'Tailândia', preco: 4000, dataPartida: '2025-07-01', descricao: 'Explore as praias e templos da Tailândia.', duracao: '10 dias', lugaresDisponiveis: 3 },
    { id: 3, nome: 'Tour pelo Japão', destino: 'Japão', preco: 6000, dataPartida: '2025-08-10', descricao: 'Descubra a cultura milenar do Japão.', duracao: '12 dias', lugaresDisponiveis: 4 }
];

// Middleware de autenticação
function autenticar(req, res, next) {
    if (req.session.autenticado) {
        return next();
    }
    res.redirect('/login');
}

// Página Inicial (Lista de Pacotes)
app.get('/', (req, res) => {
    res.render('index', { pacotes });
});

// Página de Login (Autenticação)
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

// Página de Detalhes do Pacote (apenas para usuários autenticados)
app.get('/pacote/:id', autenticar, (req, res) => {
    const pacote = pacotes.find(p => p.id == req.params.id);
    if (pacote) {
        res.render('pacoteDetalhes', { pacote });
    } else {
        res.send('Pacote não encontrado');
    }
});

app.get('/pacotes', (req, res) => {
    res.render('pacoteDetalhes');
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
