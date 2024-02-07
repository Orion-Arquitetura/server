const Relatorio = require("../database/models/relatorio.js")
const { GridFSBucket } = require("mongodb");
const dbconnection = require("../database/dbconn.js");
const { mongoose } = require("mongoose");
const formidable = require("formidable")
const path = require("path");
const { createReadStream } = require("fs");
const Projeto = require("../database/models/projeto.js");

const relatoriosController = {
    createRelatorio: async (req, res) => {
        try {
            const { bucket } = await dbconnection()

            const form = new formidable.IncomingForm({ keepExtensions: true });
            const [fields, files] = await form.parse(req).then(res => res);

            const projetoID = fields.projetoID[0]
            const visibilidade = fields.visibilidade[0] === "visivel" ? true : false
            const nomeDoArquivo = files.arquivo[0].originalFilename
            const extensaoDoArquivo = path.extname(files.arquivo[0].originalFilename)

            const uploadStream = bucket.openUploadStream(nomeDoArquivo);

            const gridID = uploadStream.id;

            uploadStream.on("finish", async () => {
                console.log("Upload finalizado")

                await Relatorio.create({
                    nome: nomeDoArquivo,
                    gridID,
                    emissor: new mongoose.Types.ObjectId(req.user._id),
                    visivelParaCliente: visibilidade,
                    extensao: extensaoDoArquivo,
                    projeto: new mongoose.Types.ObjectId(projetoID)
                }).then(async (relatorio) => {
                    await Projeto.updateOne({ _id: projetoID }, {
                        $addToSet: {
                            relatorios: new mongoose.Types.ObjectId(relatorio._id)
                        }
                    })
                })

                res.status(201).json({ error: false, message: "Relatório criado com sucesso." })
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
    deleteRelatorio: async (req, res) => {
        try {
            const { relatorioID } = req.params

            const { bucket } = await dbconnection()

            await Relatorio.findOneAndDelete({ _id: relatorioID }).then(async (relatorio) => {
                await bucket.delete(new mongoose.Types.ObjectId(relatorio.gridID))
                await Projeto.updateOne({_id: relatorio.projeto}, {
                    $pull: {
                        relatorios: relatorio._id
                    }
                })
            })

            res.status(200).json({ error: false, message: "Relatório excluído com sucesso." })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    },
    updateRelatorio: async (req, res) => {
        try {

            res.status(200).json({ error: false, message: "Relatório atualizado com sucesso." })
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message })
        }
    }
}

module.exports = relatoriosController