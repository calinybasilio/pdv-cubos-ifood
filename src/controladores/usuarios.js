const pool = require('../conexaosql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')
const transportador = require('./email')


const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'O nome, o email e a senha do usuário são obrigatórios' });
    }

    try {
        const verificandoEmail = await pool.query(
            `SELECT *
            FROM usuarios
            WHERE email = $1`,
            [email]
        );

        if (verificandoEmail.rowCount !== 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
            [nome, email, senhaCriptografada]
        );

        transportador.sendMail({
            from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
            to: `${nome} <${email}>`,
            subject: 'Boas Vindas',
            text: 'Desejamos boas vindas à nossa aplicação!',
        })
    
        return res.status(201).json(novoUsuario.rows[0]);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body
    try {
        const usuario = await pool.query(
            'select * from usuarios where email = $1',
            [email]
        )

        if (usuario.rowCount < 1) {
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