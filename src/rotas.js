const express = require('express');
const usuarios = require('./controladores/usuarios')
const verificarToken = require('./intermediarios/autenticacao');
const produtos = require('./controladores/produtos')
//const cadastrarUsuario = require('./controladores/usuarios');


const rotas = express();

rotas.get('/usuario', (req, res) => {
    
    return res.status(200).json({ mensagem: 'Entrou' });
});

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);

rotas.use(verificarToken);
rotas.post('/produto', produtos.cadastrarProduto);
rotas.get('/produto', produtos.listarProduto);
rotas.get('/produto/:id', produtos.detalharProduto);
rotas.delete('/produto/:id', produtos.excluirProduto);

module.exports = rotas;