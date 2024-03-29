const mongoose = require("mongoose");
const Entrega = require("../database/models/entrega");
const Projeto = require("../database/models/projeto");
const Arquivo = require("../database/models/arquivo");
const Comentario = require("../database/models/comentario");


const entregasController = {
    createEntrega: async (req, res) => {
        try {
            const { nome, project } = req.body

            console.log(project._id)

            const nomeJaExiste = await Entrega.findOne({ nome }).collation({ locale: "pt", strength: 2 })

            if (nomeJaExiste) {
                throw new Error("Já existe uma entrega com esse nome.")
            }

            const entrega = await Entrega.create({
                nome,
                projeto: project._id
            }).catch(e => {
                throw new Error(e)
            })

            await Projeto.updateOne({ _id: project._id }, {
                $addToSet: {
                    entregas: entrega._id
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(201).json({ error: false, message: "Entrega criada com sucesso." })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    deleteEntrega: async (req, res) => {
        try {
            const { entregaID } = req.params

            const entrega = await Entrega.findOneAndDelete({ _id: entregaID })

            await Projeto.updateOne({ _id: entrega.projeto }, {
                $pull: {
                    entregas: entrega._id
                }
            }).catch(e => {
                throw new Error(e)
            })

            await Arquivo.updateMany({ entregas: entregaID }, {
                $pull: {
                    entregas: entregaID
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Entrega deletada com sucesso." })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    addFileToEntrega: async (req, res) => {
        try {
            const { entregaID, fileID } = req.body

            const entrega = await Entrega.findOneAndUpdate({ _id: entregaID }, {
                $addToSet: {
                    arquivos: fileID
                }
            }).catch(e => {
                throw new Error(e)
            })

            const arquivo = await Arquivo.findOneAndUpdate({ _id: fileID }, {
                $addToSet: {
                    entregas: entregaID
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Arquivo adicionado com sucesso.", data: { projetoID: entrega.projeto, disciplinaID: arquivo.disciplina } })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    removeFileFromEntrega: async (req, res) => {
        try {
            const { entregaID, fileID } = req.body

            await Entrega.updateOne({ _id: entregaID }, {
                $pull: {
                    arquivos: fileID
                }
            }).catch(e => {
                throw new Error(e)
            })

            await Arquivo.updateOne({ _id: fileID }, {
                $pull: {
                    entregas: entregaID
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Arquivo removido da entrega com sucesso." })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    getEntrega: async (req, res) => {
        try {
            const { entregaID } = req.params

            const entrega = await Entrega.findOne({ _id: entregaID }).populate("projeto arquivos").catch(e => {
                throw new Error(e)
            })

            const entregaPopulated = await entrega.populate("arquivos.disciplina arquivos.criadoPor")

            res.status(200).json({ error: false, message: "Ok", data: entregaPopulated })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    setText: async (req, res) => {
        try {
            const { entregaID, text } = req.body

            await Entrega.updateOne({ _id: entregaID }, {
                $set: {
                    texto: text
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Texto modificado com sucesso." })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    changeEntregaName: async (req, res) => {
        try {
            const { entregaID, newName } = req.body

            const nomeJaExiste = await Entrega.findOne({ nome: newName }).collation({ locale: "pt", strength: 2 })

            if (nomeJaExiste) {
                throw new Error("Já existe uma entrega com esse nome.")
            }

            const entrega = await Entrega.findOneAndUpdate({ _id: entregaID }, {
                $set: {
                    nome: newName
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Nome modificado com sucesso.", data: { projeto: entrega.projeto } })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    addComment: async (req, res) => {
        try {
            const { entregaID, comment, visivelParaCliente } = req.body;

            const comentario = await Comentario.create({
                conteudo: comment,
                usuario: new mongoose.Types.ObjectId(req.user.id),
                entrega: new mongoose.Types.ObjectId(entregaID),
                visivelParaCliente
            }).catch(e => {
                throw new Error(e)
            });

            await Entrega.updateOne({ _id: entregaID }, {
                $addToSet: {
                    comentarios: new mongoose.Types.ObjectId(comentario._id)
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Comentário adicionado com sucesso." })

        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteComment: async (req, res) => {
        try {
            const { commentID } = req.params

            const comentario = await Comentario.findOneAndDelete({ _id: commentID }).catch(e => {
                throw new Error(e)
            });

            await Entrega.updateOne({ _id: comentario.entrega }, {
                $pull: {
                    comentarios: commentID
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Comentário excluído com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    editComment: async (req, res) => {
        try {
            const { commentID, comment } = req.body

            await Comentario.updateOne({ _id: commentID }, {
                $set: {
                    conteudo: comment
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Comentário editada com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
}

module.exports = entregasController