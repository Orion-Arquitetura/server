const mongoose = require("mongoose")

const EntregaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true
    },
    dataEnvio: {
        type: Date,
    },
    texto: {
        type: String,
    },
    arquivos: {
        type: [{type: mongoose.Types.ObjectId, ref: "Arquivo"}],
        default: []
    },
    projeto: {
        type: mongoose.Types.ObjectId,
        ref: "Projeto",
        required: true
    },
    status: {
        type: String,
        enum: ["Em preparo", "Aguardando aprovação", "Aprovada", "Rejeitada"],
        default: "Em preparo"
    },
}, { timestamps: true })

const Entrega = mongoose.models.Entrega || mongoose.model("Entrega", EntregaSchema, "Entregas");

module.exports = Entrega