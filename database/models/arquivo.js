const mongoose = require("mongoose")
const User = require("./user")
const Projeto = require("./projeto")
const Revisao = require("./revisao")
const Conteudo = require("./conteudo")
const Disciplina = require("./disciplina")
const Etapa = require("./etapa")
const Entrega = require("./entrega")
const dbconnection = require("../dbconn")

const ArquivoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        set: function (value) {
            return value.toUpperCase();
        }
    },
    criadoPor: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    projeto: {
        type: mongoose.Types.ObjectId,
        ref: "Projeto",
        required: true
    },
    equipe: {
        type: mongoose.Types.ObjectId,
        ref: "Equipe",
        required: true
    },
    pedido_revisao: {
        type: mongoose.Types.ObjectId,
        ref: "Revisao",
        default: null
    },
    revisao: {
        type: String,
        default: "R00",
        required: true
    },
    ultimaVersao: {
        type: Boolean,
        default: true,
    },
    extensao: {
        type: String,
        required: true
    },
    numeroDaPrancha: {
        type: String,
        required: true
    },
    conteudo: {
        type: mongoose.Types.ObjectId,
        ref: "Conteudo",
        required: true
    },
    disciplina: {
        type: mongoose.Types.ObjectId,
        ref: "Disciplina",
        required: true
    },
    etapa: {
        type: mongoose.Types.ObjectId,
        ref: "Etapa",
        required: true
    },
    entregas: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Entrega",
        }],
        default: []
    },
    gridID: {
        type: String,
        required: true
    },
    comentarios_funcionarios: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Comentario"
        }],
    },
    comentarios_clientes: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Comentario"
        }],
    }
}, { timestamps: true })

ArquivoSchema.statics.createFirstVersionFile = async function (filename, fileExt, projeto, numeroDaPrancha, disciplina, conteudo, etapa, criadoPor, gridID) {

    const newFile = await this.create({
        nome: filename,
        extensao: fileExt,
        projeto,
        numeroDaPrancha,
        disciplina,
        conteudo,
        etapa,
        versao: 0,
        criadoPor,
        gridID
    }).catch(e => {
        throw new Error(e)
    })

    await Projeto.updateOne({ _id: projeto }, {
        $addToSet: {
            arquivos: newFile._id
        }
    }).catch(e => {
        throw new Error(e)
    })

    return newFile
}

ArquivoSchema.statics.createNewVersionFile = async function (filename, fileExt, projeto, versao, numeroDaPrancha, disciplina, conteudo, etapa, criadoPor, gridID, revisaoGeratriz) {

    const newFile = await this.create({
        nome: filename,
        extensao: fileExt,
        projeto,
        numeroDaPrancha,
        disciplina,
        conteudo,
        etapa,
        versao,
        criadoPor,
        gridID,
        revisaoGeratriz
    }).catch(e => {
        throw new Error(e)
    })

    await Projeto.updateOne({ _id: projeto }, {
        $addToSet: {
            arquivos: newFile._id
        }
    }).catch(e => {
        throw new Error(e)
    })

    return newFile
}


ArquivoSchema.statics.deleteFile = async function (id) {

    const arquivoDocument = await this.findOneAndDelete({ _id: id }).populate("revisaoGeratriz").catch(e => {
        throw new Error(e)
    })

    if (arquivoDocument.entregas.length > 0) {
        throw new Error("Para excluir o arquivo primeiro retire-o de todas as entregas das quais faz parte.")
    }

    if (arquivoDocument.revisaoGeratriz) {
        await this.updateOne({ _id: arquivoDocument.revisaoGeratriz.arquivoInicial }, {
            $set: {
                ultimaVersao: true,
                revisao: null
            }
        }).catch(e => {
            throw new Error(e)
        })
    }

    Projeto.updateOne({ _id: arquivoDocument.projeto }, {
        $pull: {
            arquivos: arquivoDocument._id
        }
    }).catch(e => {
        throw new Error(e)
    })

    const { bucket } = await dbconnection()

    await bucket.delete(new mongoose.Types.ObjectId(arquivoDocument.gridID)).catch(e => {
        throw new Error(e)
    })

    return arquivoDocument
}


const Arquivo = mongoose.models.Arquivo || mongoose.model("Arquivo", ArquivoSchema, "Arquivos")

module.exports = Arquivo