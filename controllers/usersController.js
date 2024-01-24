const Session = require("../database/models/session.js");
const User = require("../database/models/user.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const usersController = {
    createUser: async (req, res) => {
        try {
            const { nome, sobrenome, email, data_aniversario, tipo } = req.body;

            const user = await User.createUser({
                nome,
                sobrenome,
                email,
                data_aniversario,
                tipo,
            }).catch((e) => {
                console.log(e);
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Usuário criado com sucesso." });
        } catch (e) {
            res.status(500).json({ error: true, message: e.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { userID } = req.params;

            await User.deleteOne({ _id: userID }).catch((e) => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Usuário excluído com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find()
                .populate("projetos.projeto")
                .catch((e) => {
                    throw new Error(e.message);
                });

            res.status(200).json({ error: false, message: "Ok", data: users });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    getOneUser: async (req, res) => {
        try {
            const { userID } = req.params;

            const user = await User.findOne({ _id: userID })
                .populate({
                    path: "revisoes",
                    populate: [
                        { path: "projeto", model: "Projeto" },
                        { path: "atribuidaPor", model: "User" },
                        { path: "arquivoInicial", model: "Arquivo" },
                        { path: "arquivoFinal", model: "Arquivo" },
                    ],
                })
                .exec()
                .catch((e) => {
                    throw new Error(e);
                });

            res.status(200).json({ error: false, message: "Ok", data: user });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    getFuncionarios: async (req, res) => {
        try {
            const funcionarios = await User.find({
                tipo: { $in: ["funcionario", "administrador"] },
            }).catch((e) => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Ok", data: funcionarios });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeUserName: async (req, res) => {
        try {
            const { userID, firstName, lastName } = req.body;

            await User.updateOne(
                { _id: userID },
                {
                    $set: {
                        nome: firstName,
                        sobrenome: lastName,
                    },
                }
            ).catch((e) => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Nome alterado com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeUserPassword: async (req, res) => {
        try {
            const { userID, newPassword } = req.body;

            await User.changePassword({ userID, newPassword }).catch((e) => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Senha alterada com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeUserEmail: async (req, res) => {
        try {
            const { userID, newEmail } = req.body;

            await User.changeEmail({ userID, newEmail }).catch((e) => {
                throw new Error(e);
            });

            res.status(200).json({ error: false, message: "Email alterado com sucesso." });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
    changeUserAniversario: async (req, res) => {
        try {
            const { userID, newAniversario } = req.body;

            const aniversario = new Date(newAniversario);

            const user = await User.findOneAndUpdate(
                { _id: userID },
                {
                    $set: {
                        data_aniversario: aniversario,
                    },
                },
                { new: true }
            ).catch((e) => {
                throw new Error(e);
            });

            console.log({ user });

            res
                .status(200)
                .json({
                    error: false,
                    message: "Data alterada com sucesso.",
                    data: {
                        data_aniversario: user.data_aniversario,
                        idade: user.idade,
                        data_aniversario_formatada: new Date(user.data_aniversario).toLocaleDateString(
                            "pt-br",
                            { timeZone: "UTC" }
                        ),
                    },
                });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: true, message: e.message });
        }
    },
};

module.exports = usersController;
