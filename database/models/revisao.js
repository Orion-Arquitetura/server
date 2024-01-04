const mongoose = require("mongoose");

const RevisaoSchema = new mongoose.Schema({
    arquivoInicial: {
        type: mongoose.Types.ObjectId,
        ref: "Arquivo",
        required: true
    },
    arquivoFinal: {
        type: mongoose.Types.ObjectId,
        ref: "Arquivo",
    },
    projeto: {
        type: mongoose.Types.ObjectId,
        ref: "Projeto",
        required: true
    },
    requerente: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    responsavel: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Aguardando projetista enviar arquivo", "Entregue"],
        default: "Aguardando projetista enviar arquivo"
    },
    prazo: {
        type: Date,
        default: null
    },
    textoRequerimento: {
        type: String
    },
    textoResposta: {
        type: String
    },
    dataFinalizacao: {
        type: Date
    }
}, { timestamps: true });

const Revisao = mongoose.models.Revisao || mongoose.model("Revisao", RevisaoSchema, "Revisoes");

module.exports = Revisao;
