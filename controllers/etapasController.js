const Arquivo = require("../database/models/arquivo.js");
const Etapa = require("../database/models/etapa.js");
const mongoose = require("mongoose");

const etapasController = {
    getEtapas: async (req, res) => {
        try {
            const data = await Etapa.find().catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Ok", data });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    createEtapa: async (req, res) => {
        try {
            const { nome, sigla } = req.body;

            const jaExiste = await Etapa.findOne({
                $or: [
                    { sigla },
                    { nome }
                ]
            }).collation({ locale: "pt", strength: 2 })

            if (jaExiste) {
                throw new Error("Já existe uma etapa com esse nome ou sigla")
            }

            await Etapa.create({ nome, sigla }).catch((e) => {
                throw new Error(e);
            });

            res.status(201).json({ error: false, message: "Etapa criada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    updateEtapa: async (req, res) => {
        try {
            const { id, updatedData } = req.body;

            const jaExiste = await Etapa.findOne({
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
                throw new Error("Já existe uma etapa com esse nome ou sigla")
            }

            await Etapa.updateOne({ _id: id }, {
                $set: {
                    nome: updatedData.nome,
                    sigla: updatedData.sigla.toUpperCase()
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(201).json({ error: false, message: "Etapa modificada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteEtapa: async (req, res) => {
        try {
            const { id } = req.params;

            const etapa = await Etapa.findOne({ _id: id }).catch(e => { throw new Error(e) });

            const algumArquivoUsandoEtapa = await Arquivo.findOne({ etapa: etapa._id });

            if (algumArquivoUsandoEtapa) {
                throw new Error("Não é possível deletar: existe pelo menos um arquivo e/ou projeto usando esta etapa.");
            }

            await Etapa.deleteOne({_id: etapa._id}).catch(e => { throw new Error(e) });

            res.status(200).json({ error: false, message: "Etapa deletada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    }


};

module.exports = etapasController;
