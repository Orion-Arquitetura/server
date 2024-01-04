const mongoose = require("mongoose");

const NotificacaoSchema = new mongoose.Schema({
    emissor: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true
    },
    receptor: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true
    },
    mensagem: {
        type: String,
        required: true
    },
    lida: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
    }
}, { timestamps: true });

const Notificacao = mongoose.models.Notificacao || mongoose.model("Notificacao", NotificacaoSchema, "Notificacoes");

module.exports = Notificacao;
