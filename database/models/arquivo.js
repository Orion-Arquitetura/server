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
    pedido_revisao: {
        type: mongoose.Types.ObjectId,
        ref: "Revisao",
        default: null
    },
    status: {
        type: [String],
        enum: ["Aprovado pelo cliente", "Aprovado pelo arquiteto", "Aprovado pelo engenheiro",
            "Reprovado pelo cliente", "Reprovado pelo arquiteto", "Reprovado pelo engenheiro"]
    },
    revisao: {
        type: Number,
        default: 0,
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
    comentarios: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Comentario"
        }],
    },
    visivelParaCliente: {
        type: Boolean,
        required: true,
        default: false
    },
    atualizacoes: {
        type: [{ type: mongoose.Types.ObjectId, ref: "Atualizacao" }],
        default: []
    }
}, { timestamps: true })

ArquivoSchema.virtual("revisao_string").get(function () {
    const reviewString = this.revisao.toString();
    return "R" + (this.revisao < 9 ? reviewString.padStart(2, "0") : reviewString)
})

ArquivoSchema.set('toJSON', { virtuals: true })

ArquivoSchema.statics.createFile = async function (filename, fileExt, projeto, numeroDaPrancha, disciplina, conteudo, etapa, versao, criadoPor, gridID, visivelParaCliente) {
    const newFile = await this.create({
        nome: filename,
        extensao: fileExt,
        projeto,
        numeroDaPrancha,
        disciplina,
        conteudo,
        etapa,
        versao,
        criadoPor: new mongoose.Types.ObjectId(criadoPor),
        gridID,
        visivelParaCliente
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

//IMPORTANTE!!!!!!! ATUALIZAR METODOS ABAIXO PARA NOVA FORMA DE UPLOAD ONDE O USUARIO DEFINIRÁ A VERSAO (R**)

// ArquivoSchema.statics.createNewVersionFile = async function (filename, fileExt, projeto, versao, numeroDaPrancha, disciplina, conteudo, etapa, criadoPor, gridID, revisaoGeratriz) {

//     const newFile = await this.create({
//         nome: filename,
//         extensao: fileExt,
//         projeto,
//         numeroDaPrancha,
//         disciplina,
//         conteudo,
//         etapa,
//         versao,
//         criadoPor,
//         gridID,
//         revisaoGeratriz
//     }).catch(e => {
//         throw new Error(e)
//     })

//     await Projeto.updateOne({ _id: projeto }, {
//         $addToSet: {
//             arquivos: newFile._id
//         }
//     }).catch(e => {
//         throw new Error(e)
//     })

//     return newFile
// }


ArquivoSchema.statics.deleteFile = async function (id) {

    // const arquivoDocument = await this.findOneAndDelete({ _id: id }).populate("revisaoGeratriz").catch(e => {
    //     throw new Error(e)
    // })
    const arquivoDocument = await this.findOneAndDelete({ _id: id }).catch(e => {
        throw new Error(e)
    })

    console.log({ arquivoDocument })
    console.log({ id })

    // if (arquivoDocument.entregas.length > 0) {
    //     throw new Error("Para excluir o arquivo primeiro retire-o de todas as entregas das quais faz parte.")
    // }

    // if (arquivoDocument.revisaoGeratriz) {
    //     await this.updateOne({ _id: arquivoDocument.revisaoGeratriz.arquivoInicial }, {
    //         $set: {
    //             ultimaVersao: true,
    //             revisao: null
    //         }
    //     }).catch(e => {
    //         throw new Error(e)
    //     })
    // }

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