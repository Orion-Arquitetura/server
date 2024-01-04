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
    equipes: {
        type: [{type: mongoose.Types.ObjectId, ref: "Equipe"}]
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
    comentarios_funcionarios: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Comentario"
        }],
    },
    comentarios_clientes: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Comentario"
        }],
    }
}, { timestamps: true });

ProjetoSchema.statics.createProject = async function({}) {

}

const Projeto = mongoose.models.Projeto || mongoose.model("Projeto", ProjetoSchema, "Projetos");

module.exports = Projeto;
