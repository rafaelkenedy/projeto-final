const express = require("express");
const router = express.Router();
const Usuario = require("../usuarios/Usuario");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  logRequest,
  validateLoginRequest,
  logSuccess,
} = require("../middlewares");

const JWT_SECRET = process.env.JWT_SECRET || "seuSuperSegredo";

router.post(
  "/login",
  logRequest,
  logSuccess,
  validateLoginRequest,
  async (req, res) => {
    const { email, senha } = req.body;

    try {
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        return res.status(401).send({ mensagem: "Email não cadastrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).send({ mensagem: "Senha incorreta" });
      }

      const token = jwt.sign({ id: usuario._id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.send({ token });
    } catch (erro) {
      res.status(500).send({ mensagem: "Erro interno do servidor" });
    }
  }
);

module.exports = router;
