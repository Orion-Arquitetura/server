const mongoose = require("mongoose");

const AtualizacaoSchema = new mongoose.Schema({
    projeto: {
        type: mongoose.Types.ObjectId,
        ref: "Projeto"
    },
    conteudo: {
        type: String,
        required: true
    },
    emissor: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    visivelParaCliente: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


const Atualizacao = mongoose.models.Atualizacao || mongoose.model("Atualizacao", AtualizacaoSchema, "Atualizacoes");

module.exports = Atualizacao;
