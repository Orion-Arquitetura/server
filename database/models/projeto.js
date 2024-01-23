const mongoose = require("mongoose");

const ProjetoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        set: function (value) {
            return value.toUpperCase()
        }
    },
    projetistas: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    engenheiros: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    arquitetos: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    clientes: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    numero: {
        type: Number,
        required: true
    },
    ano: {
        type: Number,
        required: true
    },
    arquivos: [{
        type: mongoose.Types.ObjectId,
        ref: "Arquivo",
        default: null
    }],
    etapa: {
        type: mongoose.Types.ObjectId,
        ref: "Etapa"
    },
    entregas: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Entrega"
        }],
        default: []
    },
    comentarios: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Comentario"
        }],
    },
    atualizacoes: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Atualizacao",
        }],
        default: []
    }
}, { timestamps: true });

const Projeto = mongoose.models.Projeto || mongoose.model("Projeto", ProjetoSchema, "Projetos");

module.exports = Projeto;
