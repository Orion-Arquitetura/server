const mongoose = require("mongoose");
const Disciplina = require("../database/models/disciplina.js");
const Arquivo = require("../database/models/arquivo.js");

const disciplinasController = {
    getDisciplinas: async (req, res) => {
        try {
            const data = await Disciplina.find().catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Ok", data });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    createDisciplina: async (req, res) => {
        try {
            const { nome, sigla } = req.body;

            const jaExiste = await Disciplina.findOne({
                $or: [
                    { sigla },
                    { nome }
                ]
            }).collation({ locale: "pt", strength: 2 })

            if (jaExiste) {
                throw new Error("Já existe uma disciplina com esse nome ou sigla")
            }

            await Disciplina.create({ nome, sigla }).catch((e) => {
                throw new Error(e);
            });

            res.status(201).json({ error: false, message: "Disciplina criada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    updateDisciplina: async (req, res) => {
        try {
            const { id, updatedData } = req.body;

            const jaExiste = await Disciplina.findOne({
                $and: [
                    {
                        $or: [
                            { sigla: updatedData.sigla },
                            { nome: updatedData.nome }
                        ]
                    },
                    {
                        _id: {
                            $ne: id
                        }
                    }
                ]
            }).collation({ locale: "pt", strength: 2 })

            if (jaExiste) {
                throw new Error("Já existe uma disciplina com esse nome ou sigla")
            }

            await Disciplina.updateOne({ _id: id }, {
                $set: {
                    nome: updatedData.nome,
                    sigla: updatedData.sigla.toUpperCase()
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(201).json({ error: false, message: "Disciplina modificada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteDisciplina: async (req, res) => {
        try {
            const { id } = req.params;

            const disciplina = await Disciplina.findOne({ _id: id }).catch(e => { throw new Error(e) })

            const algumArquivoUsandoDisciplina = await Arquivo.findOne({ disciplina: disciplina._id })

            if (algumArquivoUsandoDisciplina) {
                throw new Error("Não é possível deletar: existe pelo menos um arquivo usando esta disciplina.")
            }

            await Disciplina.deleteOne({ _id: disciplina._id }).catch(e => { throw new Error(e) })

            res.status(200).json({ error: false, message: "Disciplina deletada com sucesso." });
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    }

};

module.exports = disciplinasController;
