const pool = require('../conexaosql');
const aws = require('aws-sdk')

const cadastrarProduto = async (req, res) => {
    const { descricao, valor } = req.body;
    const { file } = req

    if (!descricao || !valor) {
        return res.status(400).json({ mensagem: 'Campos "descricao" e "valor" são obrigatórios' });
    }

    try {
        const endpoint = new aws.Endpoint(process.env.ENDPOINT_S3)

        const s3 = new aws.S3({
            endpoint,
            credentials: {
                accessKeyId: process.env.KEY_ID,
                secretAccessKey: process.env.APP_KEY
            }
        })

        const uploadFile = async (path, buffer, mimetype) => {
            const arquivo = await s3.upload({
                Bucket: process.env.BACKBLAZE_BUCKET,
                Key: path,
                Body: buffer,
                ContentType: mimetype
            }).promise()

            return {
                url: arquivo.Location,
                path: arquivo.Key
            }
        }

        const arquivo = await uploadFile(
            `imagens/${file.originalname}`,
            file.buffer,
            file.mimetype
        );

        console.log(arquivo.url)

        let url = arquivo.url;

        const cadastrandoProduto = await pool.query(
            `INSERT INTO 
        produtos (descricao, valor, produto_imagem) 
        VALUES 
        ($1, $2, $3)
        returning *;`,
            [descricao, valor, url]
        );

        const produtoInserido = cadastrandoProduto.rows[0];
        return res.status(201).json(produtoInserido)
    } catch (error) {
        return res.status(500).json()
    }
};

const listarProduto = async (req, res) => {

    try {
        const listandoProdutos = await pool.query(
            `select * from produtos`,
        )
        return res.status(200).json(listandoProdutos.rows);
    } catch (error) {
        return res.status(400).json({ mensagem: 'Erro interno do servidor' })
    }
}

const detalharProduto = async (req, res) => {
    const { id } = req.params;
    const idUsuario = req.usuario.id;

    try {
        const detalhandoProduto = await pool.query(
            `SELECT * FROM produtos WHERE id = $1;`,
            [id]
        )

        if (detalhandoProduto.rows < 1) {
            return res.status(400).json({ mensagem: 'Produto não encontrado' })
        }

        return res.status(200).json(detalhandoProduto.rows)
    } catch (error) {

        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }

}

const excluirProduto = async (req, res) => {
    const { id } = req.params;
    const idUsuario = req.usuario.id;

    const validarId = (id) => {
        return isNaN(id);
    }

    if (validarId(id)) {
        return res.status(400).json({ mensagem: "O id deve ser um número válido." });
    }

    try {
        const produtoExistente = await pool.query(
            `SELECT * FROM produtos
            WHERE id = $1`,
            [id]
        );

        if (produtoExistente.rowCount === 0) {
            return res.status(404).json({ mensagem: "Produto não encontrado." });
        }

        await pool.query(
            `DELETE FROM produtos
            WHERE id = $1`,
            [id]
        );

        return res.status(204).json({ mensagem: 'Produto excluído com sucesso!' });

    } catch (error) {
        console.log(error)

        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
}

module.exports = {
    cadastrarProduto,
    listarProduto,
    detalharProduto,
    excluirProduto
}