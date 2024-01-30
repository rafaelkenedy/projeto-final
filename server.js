const express = require('express');
const usuarioRoutes = require('./usuarios/rotas');
const loginRoutes = require('./login/rotas');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/marketplace', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexão com o MongoDB estabelecida com sucesso'))
  .catch(err => console.error('Não foi possível conectar ao MongoDB', err));

const app = express();
app.use(express.json());

app.use(usuarioRoutes);
app.use(loginRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});