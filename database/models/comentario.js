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
    }
}, { timestamps: true }) 


const Comentario = mongoose.models.Comentario || mongoose.model("Comentario", ComentarioSchema, "Comentarios")

module.exports = Comentario