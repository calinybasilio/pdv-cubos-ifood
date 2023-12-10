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
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' })
        }

		const senhaCriptografada = await bcrypt.hash(senha, 10)

		const novoUsuario = await pool.query(
			'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning id, nome, email',
			[nome, email, senhaCriptografada]
		)

		return res.status(201).json(novoUsuario.rows[0])
	} catch (error) {
		return res.status(500).json({ mensagem: 'Erro interno do servidor' })
	}
}

const login = async (req, res) => {
    const { email, senha } = req.body    
    try {
        const usuario = await pool.query(
			'select * from usuarios where email = $1',
			[email]
		)

        if(usuario.rowCount < 1){
            return res.status(404).json({ mensagem: 'Email ou senha invalida' })
        }

        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha)

		if (!senhaValida) {
			return res.status(400).json({ mensagem: 'Email ou senha invalida' })
		}

		const token = jwt.sign({ id: usuario.rows[0].id }, senhaJwt, {
			expiresIn: '8h',
		})

		const { senha: _, ...usuarioLogado } = usuario.rows[0]

        return res.status(200).json({ usuario: usuarioLogado, token })

    } catch (error) {
        return res.status(400).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = {
    cadastrarUsuario,
    login
}