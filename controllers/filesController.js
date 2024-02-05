const jwt = require("jsonwebtoken");
const User = require("../database/models/user.js");
const Session = require("../database/models/session.js");
const mongoose = require("mongoose");
const formidable = require("formidable");
const Projeto = require("../database/models/projeto.js");
const Disciplina = require("../database/models/disciplina.js");
const Etapa = require("../database/models/etapa.js");
const Conteudo = require("../database/models/conteudo.js");
const { createReadStream } = require("fs");
const dbconnection = require("../database/dbconn.js");
const { GridFSBucket } = require("mongodb");
const archiver = require('archiver');
const path = require("path");
const Revisao = require("../database/models/revisao.js");
const Arquivo = require("../database/models/arquivo.js");
const { readable } = require("stream")
const Comentario = require("../database/models/comentario.js");
const Atividade = require("../database/models/atividade.js");

const filesController = {
    createFile: async (req, res) => {
        try {
            const { bucket } = await dbconnection()
            const form = new formidable.IncomingForm({ keepExtensions: true });

            const [fields, files] = await form.parse(req).then(res => { console.log(res); return res });

            const numeroDaPrancha = fields.numeroDaPrancha[0];
            const visivelParaCliente = fields.visivelParaCliente[0] === "true" ? true : false
            const project = await Projeto.findOne({ _id: fields.projectID[0] });
            const disciplina = await Disciplina.findOne({ _id: fields.disciplina[0] });
            const conteudo = await Conteudo.findOne({ _id: fields.conteudo[0] });
            const etapa = await Etapa.findOne({ _id: fields.etapa[0] });

            const file = (files.arquivo)[0];
            const versao = file.originalFilename.match(/R\d{2}(?=\.)/)[0]

            const filename = `${project.ano}-${project.numero > 9 ? project.numero : `0${project.numero}`}-${project.nome}-${numeroDaPrancha}-${conteudo.sigla}-${disciplina.sigla}-${etapa.sigla}-${versao}`;

            const fileAlreadyExists = await Arquivo.findOne({ nome: filename })

            if (fileAlreadyExists) {
                throw new Error("Arquivo " + filename + " já existe.");
            }

            const fileExt = path.extname(file.originalFilename)

            const uploadStream = bucket.openUploadStream(filename);

            const gridID = uploadStream.id;

            uploadStream.on("finish", async () => {
                console.log("Upload finalizado")

                await Arquivo.createFile(filename, fileExt, project._id, numeroDaPrancha, disciplina._id, conteudo._id, etapa._id, versao.match(/\d{2}/)[0], req.user.id, gridID, visivelParaCliente)

                const atividade = await Atividade.create({
                    usuario: new mongoose.Types.ObjectId(req.user.id),
                    mensagem: `${req.user.nome} fez o upload do arquivo ${filename}.`
                }).catch(e => {
                    throw new Error(e)
                })

                await User.updateOne({ _id: req.user.id }, {
                    $addToSet: {
                        atividades: new mongoose.Types.ObjectId(atividade._id)
                    }
                }).catch(e => {
                    throw new Error(e)
                })

                res.status(201).json({ error: false, message: "Arquivo criado com sucesso", data: { projectID: project._id, disciplina: disciplina._id } })
            })

            uploadStream.on("error", (e) => {
                console.log(e)
                throw e
            })

            const readStream = createReadStream(file.filepath);

            readStream.pipe(uploadStream);
        } catch (e) {
            console.log(e);
            res.status(400).json({ error: true, message: e.message });
        }
    },
    deleteFile: async (req, res) => {
        try {

            const { fileID } = req.params

            const arquivo = await Arquivo.deleteFile(fileID).catch(e => {
                throw new Error(e)
            })

            const atividade = await Atividade.create({
                usuario: new mongoose.Types.ObjectId(req.user.id),
                mensagem: `${req.user.nome} excluiu o arquivo ${arquivo.nome}.`
            }).catch(e => {
                throw new Error(e)
            })

            await User.updateOne({ _id: req.user.id }, {
                $addToSet: {
                    atividades: new mongoose.Types.ObjectId(atividade._id)
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Arquivo deletado com sucesso", data: { projectID: arquivo.projeto, disciplina: arquivo.disciplina } })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    getOneFile: async (req, res) => {
        try {
            const { fileID } = req.params

            const file = await Arquivo.findOne({ _id: fileID }).populate("criadoPor projeto pedido_revisao conteudo disciplina etapa entregas comentarios atualizacoes comentarios.usuario").catch(e => {
                throw new Error(e)
            })

            const filePopulated = await file.populate("comentarios.usuario")

            console.log({ comments: filePopulated.comentarios })

            res.status(200).json({ error: false, message: "Ok", data: file })
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    getFilesByDiscipline: async (req, res) => {
        try {
            const { pid: projectID, did: disciplinaID } = req.query

            console.log({ projectID, disciplinaID })

            const arquivos = await Arquivo.find({ projeto: projectID, disciplina: disciplinaID }).populate("criadoPor pedido_revisao projeto").populate({ path: "pedido_revisao", populate: { path: "responsavel" } }).catch(e => {
                throw new Error(e)
            })


            res.status(200).json({ error: false, message: "Arquivos encontrados", data: arquivos });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeFileVisibility: async (req, res) => {
        try {
            const { fileID, fileVisibility } = req.body;

            const file = await Arquivo.findOneAndUpdate({ _id: fileID }, {
                $set: {
                    visivelParaCliente: !fileVisibility
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Ok", data: { projectID: file.projeto, disciplina: file.disciplina } })

        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    updateFile: async (req, res) => {
        try {
            const { bucket } = await dbconnection()

            const form = new formidable.IncomingForm({ keepExtensions: true });

            const [fields, files] = await form.parse(req).then(res => { console.log(res); return res });

            const revisao = Number(fields.revisao[0]) <= 9 ? fields.revisao[0].padStart(2, "0") : fields.revisao[0]

            const newFileName = files.arquivo[0].originalFilename.split(/R\d{2}.+/)[0] + `R${revisao}`

            const uploadStream = bucket.openUploadStream(newFileName);
            const gridID = uploadStream.id;

            uploadStream.on("finish", async () => {
                console.log("Upload finalizado")

                const arquivo = await Arquivo.findOneAndUpdate({ _id: fields.fileID[0] }, {
                    $set: {
                        nome: newFileName,
                        gridID,
                        revisao: Number(revisao)
                    }
                }).catch(e => {
                    throw new Error(e)
                })

                await bucket.delete(new mongoose.Types.ObjectId(fields.gridID[0])).catch(e => {
                    throw new Error(e)
                })

                const atividadeString = arquivo.revisao === Number(fields.revisao[0]) ?
                    `${req.user.nome} fez o upload de uma atualização do arquivo ${arquivo.nome} sem alterar o número de revisão.`
                    :
                    `${req.user.nome} fez o upload de uma atualização do arquivo ${arquivo.nome} alterando o número de revisão para R${revisao}.`

                const atividade = await Atividade.create({
                    usuario: new mongoose.Types.ObjectId(req.user.id),
                    mensagem: atividadeString
                }).catch(e => {
                    throw new Error(e)
                })

                await User.updateOne({ _id: req.user.id }, {
                    $addToSet: {
                        atividades: new mongoose.Types.ObjectId(atividade._id)
                    }
                }).catch(e => {
                    throw new Error(e)
                })

                res.status(200).json({ error: false, message: "Arquivo atualizado com sucesso", data: { projectID: arquivo.projeto, disciplina: arquivo.disciplina } })
            })

            uploadStream.on("error", (e) => {
                console.log(e)
                throw e
            })

            const readStream = createReadStream(files.arquivo[0].filepath);

            readStream.pipe(uploadStream);
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    addComment: async (req, res) => {
        try {
            const { fileID, comment, visivelParaCliente } = req.body;

            const comentario = await Comentario.create({
                conteudo: comment,
                usuario: new mongoose.Types.ObjectId(req.user.id),
                arquivo: new mongoose.Types.ObjectId(fileID),
                visivelParaCliente
            }).catch(e => {
                throw new Error(e)
            });

            await Arquivo.updateOne({ _id: fileID }, {
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

            await Arquivo.updateOne({ _id: comentario.projeto }, {
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
    getFileBinaries: async (req, res) => {
        try {
            const { gridID } = req.params;
            const { bucket } = await dbconnection();

            res.setHeader("Content-Type", "application/pdf");

            bucket.openDownloadStream(new mongoose.Types.ObjectId(gridID)).pipe(res);
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    downloadMultipleFiles: async (req, res) => {
        try {
            let filesIds = (req.query.fileIds).match(/[^,]+/g)

            const arquivo = await Arquivo.find({ gridID: { $in: filesIds } })

            const filesData = filesIds.map((fileId, index) => {
                return {
                    fileId,
                    nome: arquivo[index].nome,
                    extensao: arquivo[index].extensao
                }
            })

            const { bucket } = await dbconnection();

            res.set("Content-Type", "application/zip");
            res.set("Content-Disposition", `attachment; filename=files.zip`);

            const archive = archiver("zip", {
                zlib: { level: 9 },
            });

            archive.pipe(res);

            filesData.forEach(({ fileId, nome, extensao }) => {

                const downloadStream = bucket.openDownloadStream(
                    new mongoose.Types.ObjectId(fileId)
                );

                archive.append(downloadStream, { name: `${nome}${extensao}` });
            });

            archive.finalize();
        } catch (e) {
            console.log(e)
            return res.status(400).json({ error: true, message: e.message });
        }
    }
};

module.exports = filesController;
