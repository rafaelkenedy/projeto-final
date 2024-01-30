const path = require("path");
const express = require("express");
const multer = require("multer");
const Produto = require("./Produto");
const {
  verifyAuthToken,
  logRequest,
  validateRequestBody,
  logSuccess,
} = require("../middlewares");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post(
  "/produtos",
  logRequest,
  upload.single("foto"),
  validateRequestBody,
  verifyAuthToken,
  async (req, res) => {
    try {
      const { nome, descricao, categoria, preco } = req.body;
      const usuarioId = req.usuarioId;
      const fotoPath = req.file ? req.file.filename : "";
      if (!nome || !descricao || !categoria || !preco || !fotoPath) {
        return res
          .status(400)
          .send({
            mensagem:
              "Todos os campos são obrigatórios e a foto deve ser enviada",
          });
      }

      let novoProduto = new Produto({
        nome,
        descricao,
        categoria,
        preco,
        usuarioId,
        fotoPath,
      });
      console.log(novoProduto);
      await novoProduto.save();

      logSuccess(req, res, () => {});
      res.status(201).send({ id: novoProduto.id });
    } catch (erro) {
      res
        .status(500)
        .send({ mensagem: "Erro ao salvar o produto no banco de dados" });
    }
  }
);

router.get("/produtos", logRequest, async (req, res) => {
  try {
    const { categoria, usuarioId } = req.query;
    let filtro = {};

    if (categoria) {
      filtro.categoria = categoria;
    }

    if (usuarioId) {
      filtro.usuarioId = usuarioId;
    }

    const produtos = await Produto.find(filtro);
    const produtosComUrlImagem = produtos.map((produto) => {
      const produtoObj = produto.toObject();
      const fotoPathCorrigido = produto.fotoPath.replace(/\\/g, "/");
      produtoObj.urlImagem = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${fotoPathCorrigido}`;
      return produtoObj;
    });
    res.status(200).send(produtosComUrlImagem);
  } catch (erro) {
    res
      .status(500)
      .send({ mensagem: "Erro ao recuperar os produtos do banco de dados" });
  }
});

router.delete(
  "/produtos/:id",
  logRequest,
  verifyAuthToken,
  async (req, res) => {
    try {
      const produtoId = req.params.id;
      const produto = await Produto.findById(produtoId);

      if (!produto) {
        return res.status(404).send({ mensagem: "Produto não encontrado" });
      }

      if (produto.usuarioId.toString() !== req.usuarioId) {
        return res
          .status(403)
          .send({ mensagem: "Usuário não autorizado a excluir este produto" });
      }

      await Produto.deleteOne({ _id: produtoId });
      res.status(200).send({ mensagem: "Produto excluído com sucesso" });
    } catch (erro) {
      res.status(500).send({ mensagem: "Erro ao excluir o produto" });
    }
  }
);

router.put(
  "/produtos/:id",
  logRequest,
  upload.single("foto"),
  validateRequestBody,
  verifyAuthToken,
  async (req, res) => {
    try {
      const produtoId = req.params.id;
      const { nome, descricao, categoria, preco } = req.body;
      const fotoPath = req.file ? req.file.filename : "";

      const produto = await Produto.findById(produtoId);

      if (!produto) {
        return res.status(404).send({ mensagem: "Produto não encontrado" });
      }

      if (produto.usuarioId.toString() !== req.usuarioId) {
        return res
          .status(403)
          .send({ mensagem: "Usuário não autorizado a editar este produto" });
      }

      produto.nome = nome;
      produto.descricao = descricao;
      produto.categoria = categoria;
      produto.preco = preco;
      if (fotoPath) produto.fotoPath = fotoPath;

      await produto.save();
      res
        .status(200)
        .send({ mensagem: "Produto atualizado com sucesso", id: produto.id });
    } catch (erro) {
      res.status(500).send({ mensagem: "Erro ao atualizar o produto" });
    }
  }
);

module.exports = router;
