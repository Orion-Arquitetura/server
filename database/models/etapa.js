const mongoose = require("mongoose");

const EtapaSchema = new mongoose.Schema({
    nome: { type: String, unique: true },
    sigla: { type: String, unique: true }
});

const Etapa = mongoose.models.Etapa || mongoose.model("Etapa", EtapaSchema, "Etapas");

module.exports = Etapa;
