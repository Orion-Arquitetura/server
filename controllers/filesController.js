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
const path = require("path");
const Revisao = require("../database/models/revisao.js");
const Arquivo = require("../database/models/arquivo.js");
const { readable } = require("stream")
const archiver = require("archiver");

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
            const versao = file.originalFilename.match(/\d{2}(?=\.)/)[0]

            const filename = `${project.ano}-${project.numero > 9 ? project.numero : `0${project.numero}`}-${project.nome}-${numeroDaPrancha}-${conteudo.sigla}-${disciplina.sigla}-${etapa.sigla}-R${versao}`;

            const fileAlreadyExists = await Arquivo.findOne({ nome: filename })

            if (fileAlreadyExists) {
                throw new Error("Arquivo já existe. Se deseja criar uma nova versão solicite uma revisão.");
            }

            const fileExt = path.extname(file.originalFilename)

            const uploadStream = bucket.openUploadStream(filename);

            const gridID = uploadStream.id;

            uploadStream.on("finish", async () => {
                console.log("Upload finalizado")

                await Arquivo.createFile(filename, fileExt, project._id, numeroDaPrancha, disciplina._id, conteudo._id, etapa._id, versao, req.user.id, gridID, visivelParaCliente)

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

            res.status(200).json({ error: false, message: "Arquivo deletado com sucesso", data: { projectID: arquivo.projeto, disciplina: arquivo.disciplina } })
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


    // IMPORTANTE REVISAR TODAS AS FUNCOES ABAIXO
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
    getOneFileMetadata: async (req, res) => {
        try {
            const { fileID } = req.params;
            const filesMetadataCollection = mongoose.connection.collection("Arquivos.files");
            const fileMetadata = await filesMetadataCollection.findOne({ _id: new mongoose.Types.ObjectId(fileID) })

            res.status(200).json({ error: false, message: "Ok", data: fileMetadata })

        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    createOneFile: async (req, res) => {
        try {
            const { bucket } = await dbconnection();

            const form = new formidable.IncomingForm({ keepExtensions: true });

            const [fields, files] = await form.parse(req).then(res => { console.log(res); return res })

            const parsedFields = fields.fileData.map((f, index) => ({ fileMetadata: JSON.parse(f), file: files.file[index] }))

            const projectData = await Projeto.findById(parsedFields[0].fileMetadata.projectID).exec()

            const fileName = `${projectData.ano}-${projectData.numero > 9 ? projectData.numero : `0${projectData.numero}`}-${projectData.nome}-${parsedFields[0].fileMetadata.numeroPrancha}-${parsedFields[0].fileMetadata.conteudo}-${parsedFields[0].fileMetadata.disciplina}-${parsedFields[0].fileMetadata.etapaDoProjeto}-R00`;

            const disciplinaData = await Disciplina.findOne({ sigla: parsedFields[0].fileMetadata.disciplina })

            const newFileMetadata = {
                projeto: {
                    id: new mongoose.Types.ObjectId(parsedFields[0].fileMetadata.projectID),
                    nome: projectData.nome,
                },
                numeroDaPrancha: parsedFields[0].fileMetadata.numeroPrancha,
                conteudo: parsedFields[0].fileMetadata.conteudo,
                disciplina: parsedFields[0].fileMetadata.disciplina,
                etapa: parsedFields[0].fileMetadata.etapaDoProjeto,
                versao: 0,
                ultimaVersao: true,
                emRevisao: false,
                revisao: null,
                criadoPor: {
                    userName: req.user.nome,
                    userId: req.user.id,
                },
                extensao: path.extname(files.file[0].originalFilename)
            };

            const fileAlreadyExists = await bucket
                .find({ filename: fileName })
                .toArray();

            if (fileAlreadyExists.length > 0) {
                throw new Error(
                    `Arquivo ${fileAlreadyExists[0].filename} já existe. Se deseja criar uma nova versão solicite uma revisão.`
                );
            }

            const uploadStream = bucket.openUploadStream(fileName, {
                metadata: newFileMetadata,
            });

            try {
                const newFileId = uploadStream.id;

                await Projeto.updateOne({ _id: projectData._id }, {
                    $addToSet: { arquivos: { arquivoID: newFileId, disciplina: disciplinaData._id } }
                })

                const readStream = createReadStream(parsedFields[0].file.filepath);

                readStream.pipe(uploadStream);

                uploadStream.on("finish", () => {
                    res.status(201).json({ error: false, message: "Arquivo criado com sucesso" })
                })

                uploadStream.on("error", (e) => {
                    throw e
                })

            } catch (e) {
                console.log(e)
                throw e
            }
        } catch (e) {
            console.log(e)
            res.status(400).json({ error: true, message: e.message });
            return;
        }
    },

    
    //DANGER ZONE: download multiple files
    downloadMultipleFiles: async (req, res) => {
        try {
            const filesIds = req.query.filesIds

            console.log({ filesIds })

            return res.status(200).json({ error: false, message: "Ok" });
        } catch (e) {
            console.log(e)
            return res.status(400).json({ error: true, message: e.message });
        }
    }
};

module.exports = filesController;
