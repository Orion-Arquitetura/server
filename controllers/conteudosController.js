const Arquivo = require("../database/models/arquivo.js");
const Conteudo = require("../database/models/conteudo.js");
const mongoose = require("mongoose");

const conteudosController = {
    getConteudos: async (req, res) => {
        try {
            const data = await Conteudo.find().catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Ok", data });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    createConteudo: async (req, res) => {
        try {
            const { nome, sigla } = req.body

            const jaExiste = await Conteudo.findOne({
                $or: [
                    { sigla },
                    { nome }
                ]
            }).collation({ locale: "pt", strength: 2 })

            if (jaExiste) {
                throw new Error("Já existe um conteúdo com esse nome ou sigla")
            }
            await Conteudo.create({ nome, sigla }).catch(e => {
                throw new Error(e)
            })

            res.status(201).json({ error: false, message: "Conteúdo criado com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    updateConteudo: async (req, res) => {
        try {
            const { id, updatedData } = req.body;

            const jaExiste = await Conteudo.findOne({
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
                throw new Error("Já existe um conteúdo com esse nome ou sigla")
            }

            await Conteudo.updateOne({ _id: id }, {
                $set: {
                    nome: updatedData.nome,
                    sigla: updatedData.sigla.toUpperCase()
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(201).json({ error: false, message: "Conteúdo modificada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteConteudo: async (req, res) => {
        try {
            const { id } = req.params;

            const conteudo = await Conteudo.findOne({ _id: id }).exec();

            const algumArquivoUsandoConteudo = await Arquivo.findOne({ conteudo: conteudo._id });

            if (algumArquivoUsandoConteudo) {
                throw new Error("Não é possível deletar: existe pelo menos um arquivo usando este conteúdo.");
            }

            await Conteudo.deleteOne({_id: conteudo._id});

            res.status(201).json({ error: false, message: "Conteúdo deletado com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(401).json({ error: true, message: e.message });
        }
    }

};

module.exports = conteudosController;
