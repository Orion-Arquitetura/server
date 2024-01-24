const jwt = require("jsonwebtoken");
const User = require("../database/models/user.js");
const Session = require("../database/models/session.js");
const mongoose = require("mongoose");

const authController = {
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            const user = await User.login({ email, senha }).catch(e => {
                throw new Error(e.message)
            });

            if (user.tipo === "cliente") {
                throw new Error("Usuário não encontrado.")
            }

            const accessToken = jwt.sign({ id: user._id, tipo: user.tipo, nome: `${user.nome} ${user.sobrenome}` }, process.env.AT_SECRET, { expiresIn: 60 * 15 });
            const refreshToken = jwt.sign({ id: user._id, tipo: user.tipo, nome: `${user.nome} ${user.sobrenome}` }, process.env.RT_SECRET, { expiresIn: '1d' });

            await Session.create({
                user: user._id,
                refreshToken
            });

            const cookieSettings = process.env.NODE_ENV === "production" ? { httpOnly: true, maxAge: 60 * 60 * 24 * 1000, secure: true, sameSite: "None" } : { httpOnly: true, maxAge: 60 * 60 * 24 * 1000 }

            res.cookie('refreshToken', refreshToken, cookieSettings);

            res.status(200).json({ error: false, message: "Logado com sucesso.", data: { user, accessToken } });
        } catch (e) {
            res.status(401).json({ error: true, message: e.message });
        }
    },
    loginClient: async (req, res) => {
        try {
            const { email, senha } = req.body;

            const user = await User.login({ email, senha }).catch(e => {
                throw new Error(e.message)
            });

            if (user.tipo !== "cliente") {
                throw new Error("Usuário não encontrado.")
            }

            const accessToken = jwt.sign({ id: user._id, tipo: user.tipo, nome: `${user.nome} ${user.sobrenome}` }, process.env.AT_SECRET, { expiresIn: 60 * 15 });
            const refreshToken = jwt.sign({ id: user._id, tipo: user.tipo, nome: `${user.nome} ${user.sobrenome}` }, process.env.RT_SECRET, { expiresIn: '1d' });

            await Session.create({
                user: user._id,
                refreshToken
            });

            const cookieSettings = process.env.NODE_ENV === "production" ? { httpOnly: true, maxAge: 60 * 60 * 24 * 1000, secure: true, sameSite: "None" } : { httpOnly: true, maxAge: 60 * 60 * 24 * 1000 }

            res.cookie('refreshToken', refreshToken, cookieSettings);

            res.status(200).json({ error: false, message: "Logado com sucesso.", data: { user, accessToken } });
        } catch (e) {
            res.status(401).json({ error: true, message: e.message });
        }
    }
};

module.exports = authController;
