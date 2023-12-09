const pool = require('../conexaosql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')

const cadastrarUsuario = async (req, res) => {
	const { nome, email, senha } = req.body

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome do usuário é obrigatório' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória' });
    }

  	try {

        const verificandoEmail = await pool.query(
            `SELECT *
            FROM usuarios
            WHERE email = $1`,
            [email]
        )
        if (verificandoEmail.rowCount != 0){
            return res.status(500).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' })
        }

		const senhaCriptografada = await bcrypt.hash(senha, 10)

		const novoUsuario = await pool.query(
			'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning id, nome, email',
			[nome, email, senhaCriptografada]
		)

		return res.status(201).json(novoUsuario.rows[0])
	} catch (error) {
		return res.status(400).json({ mensagem: 'Erro interno do servidor' })
	}
}

module.exports = cadastrarUsuario;