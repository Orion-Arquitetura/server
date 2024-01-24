const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
        },
        sobrenome: {
            type: String,
            default: ""
        },
        data_aniversario: {
            type: Date,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        senha: {
            type: String,
            required: true,
            select: false,
        },
        tipo: {
            type: String,
            enum: ["administrador", "funcionario", "cliente"],
            required: true,
        },
        projetos: {
            type: [
                {
                    projeto: {
                        type: mongoose.Types.ObjectId,
                        ref: "Projeto",
                    },
                    funcao: {
                        type: String,
                        enum: ["cliente", "projetista", "engenheiro", "arquiteto"]
                    }
                },
            ],
            default: [],
        },
        revisoes: {
            type: [{ type: mongoose.Types.ObjectId, ref: "Revisao" }],
            default: [],
        },
        notificacoes: {
            type: [{ type: mongoose.Types.ObjectId, ref: "Notificacao" }],
            default: [],
        },
        aprovacoes: {
            type: [{ type: mongoose.Types.ObjectId, ref: "Aprovacao" }],
            default: [],
        },
    },
    { timestamps: true }
);

UserSchema.virtual("idade").get(function () {
    const currentDate = new Date();
    const birthDate = this.data_aniversario;
    const age = currentDate.getFullYear() - birthDate.getFullYear();

    // Adjust age based on the month and day
    if (currentDate.getMonth() < birthDate.getMonth() ||
        (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
        return age - 1;
    } else {
        return age;
    }
});

UserSchema.virtual("nome_completo").get(function () {
    return `${this.nome} ${this.sobrenome}`
})

UserSchema.virtual("data_aniversario_formatada").get(function () {
    return new Date(this.data_aniversario).toLocaleDateString("pt-br", {timeZone: "UTC"})
})

UserSchema.set("toJSON", { getters: true })

UserSchema.statics.createUser = async function ({ nome, email, tipo, sobrenome = "", data_aniversario = ""}) {
    if (!nome) {
        throw Error("O nome é obrigatório.");
    }

    if (!email) {
        throw Error("O email é obrigatório.");
    }

    if (!validator.isEmail(email)) {
        throw Error("Email inválido.");
    }

    const emailExists = await this.findOne({ email }).select("+senha");

    if (emailExists) {
        throw Error("Email já cadastrado.");
    }

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash("senha", salt);

    const user = await this.create({
        nome,
        sobrenome: sobrenome ? sobrenome : "",
        email,
        tipo,
        senha: hash,
        data_aniversario,
    });

    user.senha = "";

    return user;
};

UserSchema.statics.login = async function ({ email, senha }) {
    if (!email) {
        throw Error("O email é obrigatório.");
    }

    if (!senha) {
        throw Error("A senha é obrigatória.");
    }

    if (!validator.isEmail(email)) {
        throw Error("Email inválido.");
    }

    const user = await this.findOne({ email }).select("+senha").populate("notificacoes");

    if (!user) {
        throw Error("Usuário não encontrado.");
    }

    if (user.excluido) {
        throw Error("Usuário não encontrado.");
    }

    const match = await bcrypt.compare(senha, user.senha);

    if (!match) {
        throw Error("Senha incorreta.");
    }

    user.senha = "";

    return user;
};

UserSchema.statics.changePassword = async function ({ userID, newPassword }) {
    const user = await this.findOne({ _id: userID }).catch(e => {
        throw new Error(e)
    })

    if (!user) {
        throw new Error("Usuário não encontrado.")
    }

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash(newPassword, salt);

    return await this.updateOne({ _id: userID }, {
        senha: hash
    })
}

UserSchema.statics.changeEmail = async function ({ userID, newEmail }) {

    if (!newEmail) {
        throw Error("O email é obrigatório.");
    }

    if (!validator.isEmail(newEmail)) {
        throw Error("Email inválido.");
    }

    const user = await this.findOne({ _id: userID }).catch(e => { throw new Error(e) })

    const emailExists = await this.findOne({ email: newEmail })

    if (!user) {
        throw new Error("Usuário não encontrado.")
    }

    if (emailExists) {
        throw Error("Email já cadastrado.");
    }

    return await this.updateOne({ _id: userID }, {
        $set: {
            email: newEmail
        }
    })
}

const User = mongoose.models.User || mongoose.model("User", UserSchema, "Users");

module.exports = User;
