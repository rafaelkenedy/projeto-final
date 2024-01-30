const express = require('express');
const multer = require('multer');
const Produto = require('./Produto');
const verificarToken = require('../middlewares').verificarToken;

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/produtos', verificarToken, upload.single('foto'), async (req, res) => {
    try {
        const { nome, descricao, categoria, preco } = req.body;
        const usuarioId = req.usuarioId; 
        const fotoPath = req.file.path;

        let novoProduto = new Produto({ nome, descricao, categoria, preco, usuarioId, fotoPath });
        await novoProduto.save();

        res.status(201).send({ id: novoProduto.id });
    } catch (erro) {
        res.status(500).send({ mensagem: "Erro ao salvar o produto no banco de dados" });
    }
});
