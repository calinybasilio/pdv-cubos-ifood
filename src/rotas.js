const express = require('express');
const usuarios = require('./controladores/usuarios')
const verificarToken = require('./intermediarios/autenticacao');
const produtos = require('./controladores/produtos')
const pedidos = require('./controladores/pedidos')
const multer = require('./multer')



const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);

rotas.use(verificarToken);
rotas.post('/produto', multer.single('produto_imagem'), produtos.cadastrarProduto);
rotas.get('/produto', produtos.listarProduto);
rotas.get('/produto/:id', produtos.detalharProduto);
rotas.delete('/produto/:id', produtos.excluirProduto);
rotas.post('/pedido', pedidos.cadastrarPedido);
rotas.get('/pedido', pedidos.listarPedido);

module.exports = rotas;