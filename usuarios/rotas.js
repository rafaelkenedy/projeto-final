const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Usuario = require('./Usuario');
const { logRequest, validateRequestBody, logSuccess } = require('../middlewares');

router.post('/usuarios', logRequest, validateRequestBody, logSuccess, async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).send({ mensagem: "Já existe um usuário com este email" });
        }

        let novoUsuario = new Usuario({ nome, email, senha });
        await novoUsuario.save();

        res.status(201).send({ id: novoUsuario.id });
    } catch (erro) {
        res.status(500).send({ mensagem: "Erro ao salvar o usuário no banco de dados" });
    }
});

router.get('/usuarios', logRequest, logSuccess, async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.send(usuarios);
    } catch (erro) {
        res.status(500).send({ mensagem: "Erro ao buscar usuários" });
    }
});

module.exports = router;
