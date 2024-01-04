const mongoose = require("mongoose")
const Revisao = require("../database/models/revisao")
const nodemailer = require('nodemailer');
const User = require("../database/models/user");
const formidable = require("formidable");
const dbconnection = require("../database/dbconn");
const path = require("path");
const { createReadStream } = require("fs");
const Arquivo = require("../database/models/arquivo");
const Notificacao = require("../database/models/notificacao");

const reviewsController = {
    createReviewRequest: async (req, res) => {
        try {
            const { file, responsavel, prazo, texto } = req.body

            let review = await Revisao.create({
                arquivoInicial: file._id,
                projeto: new mongoose.Types.ObjectId(file.projeto._id),
                atribuidaPor: new mongoose.Types.ObjectId(req.user.id),
                responsavel: new mongoose.Types.ObjectId(responsavel),
                prazo: prazo === "" ? null : prazo,
                textoRequerimento: texto
            }).catch(e => {
                throw new Error(e)
            })

            review = await review.populate("responsavel atribuidaPor projeto").catch(e => {
                throw new Error(e)
            })

            const arquivo = await Arquivo.findOneAndUpdate({ _id: file._id }, {
                revisao: review._id
            }).catch(e => {
                throw new Error(e)
            })

            const notificacao = await Notificacao.create({
                emissor: new mongoose.Types.ObjectId(req.user.id),
                receptor: new mongoose.Types.ObjectId(responsavel),
                mensagem: `${review.atribuidaPor.nome} pediu uma revisão do arquivo ${arquivo.nome}.`,
                link: `${process.env.DEV_ORIGIN}/reviews/${review._id}`
            })

            const responsavelPelaRevisao = await User.findOneAndUpdate({ _id: review.responsavel._id }, {
                $addToSet: {
                    revisoes: review._id,
                    notificacoes: notificacao._id
                },
            }).catch(e => {
                throw new Error(e)
            })

            const transport = nodemailer.createTransport({
                host: 'smtp.hostinger.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAIL_PW,
                },
            });

            const email = {
                from: 'admin@orionarquitetura.com',
                to: responsavelPelaRevisao.email,
                subject: 'Nova solicitação de revisão',
                html: `
                <p>Olá, ${review.responsavel.nome}. <br></br>
                Foi solicitada uma revisão do documento <a href="${process.env.DEV_ORIGIN}/reviews/${review._id}">${file.nome}</a>.</p><br></br>
                <p>Prazo: ${prazo ? new Date(prazo).toLocaleDateString("pt-BR") : "sem prazo para entrega."}</p>
                `
            };

            transport.sendMail(email, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email enviado: ' + info.response);
                }
            });

            res.status(200).json({ error: false, message: "Pedido de revisão solicitado com sucesso.", data: { projectID: file.projeto._id, disciplina: file.disciplina } })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    cancelReviewRequest: async (req, res) => {
        try {
            const { reviewID } = req.params;

            const revisao = await Revisao.findOneAndDelete({ _id: reviewID })

            const file = await Arquivo.findOneAndUpdate({ _id: revisao.arquivoInicial }, {
                $set: {
                    revisao: null
                }
            }).catch(e => {
                throw new Error(e)
            })

            await User.updateOne({ _id: revisao.responsavel._id }, {
                $pull: {
                    revisoes: revisao._id
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Pedido de revisão cancelado com sucesso.", data: { projectID: file.projeto, disciplina: file.disciplina } })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    getReviewData: async (req, res) => {
        try {
            const revisao = await Revisao.findOne({ _id: req.params.reviewID }).populate("atribuidaPor projeto arquivoInicial arquivoFinal").exec()

            res.status(200).json({ error: false, message: "Ok", data: revisao })

        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    setReviewedFile: async (req, res) => {
        try {
            const form = new formidable.IncomingForm({ keepExtensions: true });

            const [fields, files] = await form.parse(req).then(res => res);

            const revisao = JSON.parse(fields.review)

            const fileExt = path.extname(files.file[0].originalFilename)

            const filename = files.file[0].originalFilename.replace(fileExt, "")

            //MAIS TARDE FAZER CHECAGEM SE O ARQUIVO ENVIADO É A SEQUENCIA DO ARQUIVO INICIAL (R00 PARA R01 POR EXEMPLO)

            const { bucket } = await dbconnection()

            const uploadStream = bucket.openUploadStream(filename);

            const newFileId = uploadStream.id;

            uploadStream.on("finish", async () => {
                console.log("Arquivo criado")

                const novoArquivo = await Arquivo.createNewVersionFile(
                    filename,
                    fileExt,
                    revisao.arquivoInicial.projeto,
                    revisao.arquivoInicial.versao + 1,
                    revisao.arquivoInicial.numeroDaPrancha,
                    revisao.arquivoInicial.disciplina,
                    revisao.arquivoInicial.conteudo,
                    revisao.arquivoInicial.etapa,
                    req.user.id,
                    newFileId,
                    revisao._id
                ).catch(e => {
                    throw new Error(e)
                })

                await Revisao.updateOne({ _id: revisao._id }, {
                    $set: {
                        arquivoFinal: novoArquivo._id,
                        status: "Entregue",
                        textoResposta: fields.reviewResponse[0],
                        dataFinalizacao: new Date().toISOString(),
                    }
                }).catch(e => {
                    throw new Error(e)
                })

                await Arquivo.updateOne({ _id: revisao.arquivoInicial._id }, {
                    $set: {
                        ultimaVersao: false
                    }
                })

                const transport = nodemailer.createTransport({
                    host: 'smtp.hostinger.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.MAIL,
                        pass: process.env.MAIL_PW,
                    },
                });

                const email = {
                    from: 'admin@orionarquitetura.com',
                    to: revisao.atribuidaPor.email,
                    subject: `Revisão do arquivo ${revisao.arquivoInicial.nome} finalizada`,
                    html: `
                    A revisão do arquivo <a href="${process.env.DEV_ORIGIN}/reviews/${revisao._id}">${revisao.arquivoInicial.nome}</a> foi finalizada.</p>
                    `
                };

                transport.sendMail(email, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email enviado: ' + info.response);
                    }
                });

                res.status(201).json({ error: false, message: "Arquivo criado com sucesso", data: { projectID: revisao.arquivoInicial.projeto, disciplina: revisao.arquivoInicial.disciplina } })
            })

            uploadStream.on("error", (e) => {
                throw e
            })

            const readStream = createReadStream(files.file[0].filepath);

            readStream.pipe(uploadStream);

        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    changeReviewResponsavel: async (req, res) => {
        try {
            const { responsavelID, reviewID } = req.body

            await Revisao.updateOne({ _id: reviewID }, {
                $set: {
                    responsavel: new mongoose.Types.ObjectId(responsavelID)
                }
            })

        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    }
}


module.exports = reviewsController