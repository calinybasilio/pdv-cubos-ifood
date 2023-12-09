const pool = require('../conexaosql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')
const axios = require('axios');
const FormData = require('form-data');

const cadastrarProduto = async (req, res) => {
	const { descricao, valor, produto_imagem } = req.body
    const idUsuario = req.usuario.id;
    try {
        if (!descricao || !valor) {
            return res.status(400).json({ mensagem: 'Campos "descricao" e "valor" são obrigatórios' });
        }

        let imagemUrl = null;

        // Verificar se há uma imagem no corpo da requisição
        if (produto_imagem) {
            imagemUrl = await uploadImage(produto_imagem);

            if (!imagemUrl) {
                return res.status(500).json({ mensagem: 'Erro ao fazer upload da imagem' });
            }
        }

        const cadastrandoProduto = await pool.query(
            `INSERT INTO 
            produtos (descricao, valor, produto_imagem) 
            VALUES 
            ($1, $2, $3)
            returning *;`,
            [descricao, valor, imagemUrl]
        );

        const produtoInserido = cadastrandoProduto.rows[0];

        return res.status(200).json(produtoInserido);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const uploadImage = async (imageUrl) => {
    try {
        const form = new FormData();
        form.append('file', imageUrl);

        const response = await axios.post('https://example-storage-service.com/upload', form, { // VERIFICARRRRRRRRRRR
            headers: {
                ...form.getHeaders(),
            },
        });

        if (response.status === 200) {
            return response.data.url; // Substitua 'url' pelo campo real retornado pelo serviço de armazenamento
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

const listarProduto = async (req, res) => {
    //const idUsuario = req.usuario.id;

    try {
        const listandoProdutos = await pool.query(
            `select * from produtos`,
        )
        return res.status(200).json(listandoProdutos.rows);
    } catch (error) {
        return res.status(400).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = {
    cadastrarProduto,
    listarProduto
}