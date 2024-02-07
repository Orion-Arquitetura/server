const mongoose = require("mongoose")

const RelatorioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    gridID: {
        type: String,
        required: true
    },
    emissor: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    lido: {
        type: Boolean,
        default: false
    },
    dataLeitura: {
        type: Date,
        default: null
    },
    visivelParaCliente: {
        type: Boolean,
        default: true
    },
    extensao: {
        type: String,
        required: true
    },
    projeto: {
        type: mongoose.Types.ObjectId,
        ref: "Projeto",
        required: true
    }
}, {
    timestamps: true
})

const Relatorio = mongoose.models.Relatorio || mongoose.model("Relatorio", RelatorioSchema, "Relatorios")

module.exports = Relatorio