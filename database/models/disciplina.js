const mongoose = require("mongoose");

const DisciplinaSchema = new mongoose.Schema({
    nome: { type: String, unique: true },
    sigla: { type: String, unique: true }
});

const Disciplina = mongoose.models.Disciplina || mongoose.model("Disciplina", DisciplinaSchema, "Disciplinas");

module.exports = Disciplina;
