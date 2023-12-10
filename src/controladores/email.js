const nodemailer = require('nodemailer')

const transportador = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Adicione essa linha para usar conexão não segura (importante para alguns serviços de e-mail)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = transportador;