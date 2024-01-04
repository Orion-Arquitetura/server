const mongoose = require("mongoose");

const ConteudoSchema = new mongoose.Schema({
    nome: { type: String, unique: true },
    sigla: { type: String, unique: true }
});

const Conteudo = mongoose.models.Conteudo || mongoose.model("Conteudo", ConteudoSchema, "Conteudos");

module.exports = Conteudo;
