const mongoose = require("mongoose");

const EquipeSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    arquiteto_lider: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    engenheiros: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    projetistas: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    disciplinas: {
        type: [{ type: mongoose.Types.ObjectId, ref: "Disciplina" }],
        required: true
    }
}, { timestamps: true });

EquipeSchema.statics.createEquipe = async function ({ }) {

}

const Equipe = mongoose.models.Equipe || mongoose.model("Equipe", EquipeSchema, "Equipes");

module.exports = Equipe;
