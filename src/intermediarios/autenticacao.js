const jwt = require('jsonwebtoken')
const pool = require('../conexaosql')
const senhaJwt = require('../senhaJwt')

const verificarToken = async (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization) {
		return res.status(401).json({ mensagem: 'Não autorizado' })
	}

	const token = authorization.split(' ')[1]

	try {
		const { id } = jwt.verify(token, senhaJwt)

		const { rows, rowCount } = await pool.query(
			'select * from usuarios where id = $1',
			[id]
		)

		if (rowCount < 1) {
			return res.status(401).json({ mensagem: 'Não autorizado' })
		}

		req.usuario = rows[0]
        const { senha, ...usuarioSemSenha} = req.usuario; //excluindo senha da visualização

        req.usuario = usuarioSemSenha; //atribuindo visualização sem a senha ao req.usuário

		next()
	} catch (error) {
		return res.status(401).json({ mensagem: 'Não autorizado' })
	}
}

module.exports = verificarToken;