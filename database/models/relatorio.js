const mongoose = require("mongoose")

const RelatorioSchema = new mongoose.Schema({
    gridID: {
        type: String,
        required: true
    },
    emissor: {
        type: mongoose.Types.ObjectId,
        required: true
    },
}, {
    timestamps: true
})

const Relatorio = mongoose.models.Relatorio || mongoose.model("Relatorio", RelatorioSchema, "Relatorios")

module.exports = Relatorio