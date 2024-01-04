const Projeto = require("../database/models/projeto.js");
const User = require("../database/models/user.js");
const Entrega = require("../database/models/entrega.js");
const mongoose = require("mongoose");
const Revisao = require("../database/models/revisao.js");

const projectsController = {
    getAllProjects: async (req, res) => {
        try {
            const projetos = await Projeto.find({ excluido: false }).catch(e => {
                throw new Error(e);
            });

            if (req.user.tipo === "administrador") {
                return res.status(200).json({ error: false, message: "Ok", data: projetos });
            }

            const user = await User.findOne({_id: req.user.id}).catch(e => {
                throw new Error(e)
            })

            const userProjects = user.projetos.map(p => p.projeto.toString()) 

            const projetosPermitidos = projetos.filter(projeto => {
                return userProjects.includes(projeto._id.toString())
            })

            res.status(200).json({ error: false, message: "Ok", data: projetosPermitidos });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    getOneProject: async (req, res) => {
        try {
            const { projectID } = req.params;

            const projeto = await Projeto.findOne({ _id: projectID }).populate("clientes projetistas entregas lider arquivos").catch(e => {
                throw new Error(e);
            });

            const projetoD = await projeto.populate("etapa arquivos.disciplina arquivos.etapa arquivos.criadoPor arquivos.revisao")

            res.status(200).json({ error: false, message: "Ok - GetOneProject", data: projetoD });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    createProject: async (req, res) => {
        try {
            const { nome, ano, numero } = req.body;

            console.log({ nome, ano });

            await Projeto.create({
                nome,
                ano,
                numero
            });

            res.status(200).json({ error: false, message: "Projeto criado com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteProject: async (req, res) => {
        try {
            const { projectID } = req.params;

            const project = await Projeto.findOneAndDelete({ _id: projectID });

            const users = [];

            if (project.lider) {
                users.push(project.lider)
            }

            if (project.projetistas.length > 0) {
                users.push(...project.projetistas)
            }

            if (project.clientes.length > 0) {
                users.push(...project.clientes)
            }

            if (users.length > 0) {
                await User.updateMany({ _id: { $in: users } }, {
                    $pull: {
                        projetos: {
                            projeto: project._id
                        }
                    }
                })
            }

            if (project.entregas.length > 0) {
                await Entrega.deleteMany({ projeto: projectID })
            }

            res.status(200).json({ error: false, message: "Projeto excluído com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    addClienteToProject: async (req, res) => {
        try {
            const { projectID, userID } = req.body;

            console.log({ projectID, userID });

            await Projeto.updateOne({ _id: projectID }, {
                $addToSet: { clientes: userID }
            }).catch(e => {
                throw new Error(e);
            });

            await User.updateOne({ _id: userID }, {
                $addToSet: {
                    projetos: {
                        projeto: projectID,
                        funcao: "cliente"
                    }
                }
            }).catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Cliente adicionado com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    addProjetistaToProject: async (req, res) => {
        try {
            const { projectID, userID } = req.body;

            await Projeto.updateOne({ _id: projectID }, {
                $addToSet: { projetistas: userID }
            }).catch(e => {
                throw new Error(e);
            });

            await User.updateOne({ _id: userID }, {
                $addToSet: {
                    projetos: {
                        projeto: projectID,
                        funcao: "projetista"
                    }
                }
            }).catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Projetista adicionado com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    addLiderToProject: async (req, res) => {
        try {
            const { projectID, userID } = req.body;

            const projeto = await Projeto.findOneAndUpdate({ _id: projectID }, {
                $set: { lider: userID }
            }).catch(e => {
                throw new Error(e);
            });

            await User.updateOne({ _id: projeto.lider }, {
                $pull: {
                    projetos: {
                        projeto: new mongoose.Types.ObjectId(projeto._id)
                    }
                }
            })

            await User.updateOne({ _id: userID }, {
                $addToSet: {
                    projetos: { projeto: projectID, funcao: "lider" }
                }
            }).catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Cliente adicionado com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    removeClienteFromProject: async (req, res) => {
        try {
            const { projectID, userID } = req.body;

            await Projeto.updateOne({ _id: projectID }, {
                $pull: { clientes: userID }
            }).catch(e => {
                throw new Error(e);
            });

            await User.updateOne({ _id: userID }, {
                $pull: {
                    projetos: { projeto: projectID }
                }
            }).catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Cliente removido com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    removeProjetistaFromProject: async (req, res) => {
        try {
            const { projectID, userID } = req.body;

            await Projeto.updateOne({ _id: projectID }, {
                $pull: { projetistas: userID }
            }).catch(e => {
                throw new Error(e);
            });

            const user = await User.findOneAndUpdate({ _id: userID }, {
                $pull: {
                    projetos: { projeto: projectID }
                }
            }).populate("revisoes").catch(e => {
                throw new Error(e);
            });

            // const revisoesDoProjeto = user.revisoes.filter(revisao => {
            //     return revisao.projeto.toString() === (projectID && (revisao.status !== "Entregue"))
            // })

            // console.log({ revisoesDoProjeto })

            // await User.updateOne({ _id: userID }, {
            //     $pull: {
            //         revisoes: { $in: revisoesDoProjeto }
            //     }
            // })

            // await Revisao.findByIdAndDelete({ _id: { $in: revisoesDoProjeto } })

            res.status(200).json({ error: false, message: "Projetista removido com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    removeLiderFromProject: async (req, res) => {
        try {
            const { projectID, userID } = req.body;

            await Projeto.updateOne({ _id: projectID }, {
                $set: { lider: null }
            }).catch(e => {
                throw new Error(e);
            });

            await User.updateOne({ _id: userID }, {
                $pull: {
                    projetos: { projeto: projectID }
                }
            }).catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Líder removido com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeProjectEtapa: async (req, res) => {
        try {
            const { projectID, novaEtapaID } = req.body;

            await Projeto.updateOne({ _id: projectID }, {
                $set: {
                    etapa: novaEtapaID
                }
            }).catch(e => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Etapa alterada com sucesso" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    }
};

module.exports = projectsController;
