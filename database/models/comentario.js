const mongoose = require("mongoose");

const ComentarioSchema = new mongoose.Schema({
    conteudo: {
        type: String,
        required: true
    },
    usuario: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    projeto: {
        type: mongoose.Types.ObjectId,
        ref: "Projeto",
        required: true
    },
    entrega: {
        type: mongoose.Types.ObjectId,
        ref: "Entrega",
    },
    arquivo: {
        type: mongoose.Types.ObjectId,
        ref: "Arquivo",
    },
    visivelParaCliente: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })


const Comentario = mongoose.models.Comentario || mongoose.model("Comentario", ComentarioSchema, "Comentarios")

module.exports = Comentario