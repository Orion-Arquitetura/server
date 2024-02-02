const mongoose = require("mongoose");

const AtividadeSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    mensagem: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

AtividadeSchema.virtual("data_formatada").get(function () {
    return `${new Date(this.createdAt).toLocaleDateString("pt-BR", {timeZone: "UTC"})} às ${new Date(this.createdAt).toLocaleTimeString("pt-BR", {timeZone: "America/Sao_Paulo"})}`
})

AtividadeSchema.set("toJSON", { getters: true })

const Atividade = mongoose.models.Atividade || mongoose.model("Atividade", AtividadeSchema, "Atividades");

module.exports = Atividade;
