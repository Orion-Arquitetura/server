const Projeto = require("../database/models/projeto.js");
const User = require("../database/models/user.js");
const Entrega = require("../database/models/entrega.js");
const mongoose = require("mongoose");
const Revisao = require("../database/models/revisao.js");
const Comentario = require("../database/models/comentario.js");
const Atualizacao = require("../database/models/atualizacao.js");

const projectsController = {
    getAllProjects: async (req, res) => {
        try {
            const projetos = await Projeto.find().catch(e => {
                throw new Error(e);
            });

            if (req.user.tipo === "administrador") {
                return res.status(200).json({ error: false, message: "Ok", data: projetos });
            }

            const user = await User.findOne({ _id: req.user.id }).catch(e => {
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

            const projeto = await Projeto.findOne({ _id: projectID }).populate("lider clientes engenheiros projetistas arquitetos comentarios entregas arquivos atualizacoes").catch(e => {
                throw new Error(e);
            });

            const projetoPopulado = await projeto.populate("etapa arquivos.disciplina arquivos.etapa arquivos.criadoPor arquivos.revisao comentarios.usuario atualizacoes.emissor")

            res.status(200).json({ error: false, message: "Ok - GetOneProject", data: projetoPopulado });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    createProject: async (req, res) => {
        try {
            const { nome, ano, numero } = req.body;

            console.log({ nome, ano, numero });

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
    addUserToProject: async (req, res) => {
        try {
            const { userID, projectID, role } = req.body;

            await User.updateOne({ _id: userID }, {
                $addToSet: {
                    projetos: {
                        projeto: new mongoose.Types.ObjectId(projectID),
                        funcao: role
                    }
                }
            }).catch(e => {
                throw new Error(e)
            });

            if (role === "líder") {
                const projeto = await Projeto.findOneAndUpdate({ _id: projectID }, {
                    $set: {
                        lider: new mongoose.Types.ObjectId(userID)
                    }
                }).catch(e => {
                    throw new Error(e)
                });

                if (projeto.lider) {
                    await User.updateOne({ _id: projeto.lider }, {
                        $pull: {
                            projetos: {
                                projeto: projectID,
                            }
                        }
                    }).catch(e => {
                        throw new Error(e)
                    });
                }

                console.log({ projeto })

                res.status(200).json({ error: false, message: "Usuário adicionado com sucesso" });

                return
            }

            await Projeto.updateOne({ _id: projectID }, {
                $addToSet: {
                    [`${role}s`]: new mongoose.Types.ObjectId(userID)
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Usuário adicionado com sucesso" });
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message });
        }
    },
    removeUserFromProject: async (req, res) => {
        try {
            const { userID, projectID, role } = req.body;
            console.log({ userID, projectID, role })

            await User.updateOne({ _id: userID }, {
                $pull: {
                    projetos: {
                        projeto: projectID,
                    }
                }
            }).catch(e => {
                throw new Error(e)
            });

            if (role === "líder") {
                console.log("aqui")
                await Projeto.updateOne({ _id: projectID }, {
                    $set: {
                        lider: null
                    }
                }).catch(e => {
                    throw new Error(e)
                });


                res.status(200).json({ error: false, message: "Usuário removido com sucesso" });

                return
            }

            await Projeto.updateOne({ _id: projectID }, {
                $pull: {
                    [`${role}s`]: userID
                }
            }).catch(e => {
                throw new Error(e)
            });


            res.status(200).json({ error: false, message: "Usuário removido com sucesso" });
        } catch (e) {
            console.log(e)
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
    },
    changeProjectName: async (req, res) => {
        try {
            const { projectID, newName } = req.body

            await Projeto.updateOne({ _id: projectID }, {
                $set: {
                    nome: newName
                }
            })

            res.status(200).json({ error: false, message: "Nome atualizado com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeProjectNumber: async (req, res) => {
        try {
            const { projectID, newNumber } = req.body

            await Projeto.updateOne({ _id: projectID }, {
                $set: {
                    numero: newNumber
                }
            })

            res.status(200).json({ error: false, message: "Número atualizado com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeProjectYear: async (req, res) => {
        try {
            const { projectID, newYear } = req.body

            await Projeto.updateOne({ _id: projectID }, {
                $set: {
                    ano: newYear
                }
            })

            res.status(200).json({ error: false, message: "Ano atualizado com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    //depois passar funcoes de comment para comment controller
    addComment: async (req, res) => {
        try {
            const { projectID, comment, visivelParaCliente } = req.body;

            const comentario = await Comentario.create({
                conteudo: comment,
                usuario: new mongoose.Types.ObjectId(req.user.id),
                projeto: new mongoose.Types.ObjectId(projectID),
                visivelParaCliente
            }).catch(e => {
                throw new Error(e)
            });

            await Projeto.updateOne({ _id: projectID }, {
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

            await Projeto.updateOne({ _id: comentario.projeto }, {
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
    //depois passar funcoes de atualizacao para atualizacao controller
    addAtualizacao: async (req, res) => {
        try {
            const { projectID, atualizacao } = req.body

            const atualizacaoDocument = await Atualizacao.create({
                projeto: new mongoose.Types.ObjectId(projectID),
                conteudo: atualizacao,
                emissor: new mongoose.Types.ObjectId(req.user.id)
            }).catch(e => {
                throw new Error(e)
            });

            await Projeto.updateOne({ _id: projectID }, {
                $addToSet: {
                    atualizacoes: new mongoose.Types.ObjectId(atualizacaoDocument._id)
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Atualização criada com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteAtualizacao: async (req, res) => {
        try {
            const { atualizacaoID } = req.params


            const atualizacaoDocument = await Atualizacao.findOneAndDelete({ _id: atualizacaoID }).catch(e => {
                throw new Error(e)
            });

            await Projeto.updateOne({ _id: atualizacaoDocument.projeto }, {
                $pull: {
                    atualizacoes: new mongoose.Types.ObjectId(atualizacaoDocument._id)
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Atualização deletada com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    editAtualizacao: async (req, res) => {
        try {
            const { atualizacaoID, atualizacao } = req.body

            await Atualizacao.updateOne({ _id: atualizacaoID }, {
                $set: {
                    conteudo: atualizacao
                }
            }).catch(e => {
                throw new Error(e)
            });

            res.status(200).json({ error: false, message: "Atualização editada com sucesso." })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    }
};

module.exports = projectsController;
