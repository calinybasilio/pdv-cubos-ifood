const express = require('express');
const usuarios = require('./controladores/usuarios')
const verificarToken = require('./intermediarios/autenticacao');
//const cadastrarUsuario = require('./controladores/usuarios');


const rotas = express();

rotas.get('/usuario', (req, res) => {
    
    return res.status(200).json({ mensagem: 'Entrou' });
});

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);

rotas.use(verificarToken);
//todas as rotas que requerem autenticação

module.exports = rotas;