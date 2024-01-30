const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  categoria: { type: String, required: true },
  preco: { type: Number, required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  fotoPath: { type: String, required: true },
});

module.exports = mongoose.model("Produto", produtoSchema);
