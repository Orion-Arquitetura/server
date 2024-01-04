const jwt = require("jsonwebtoken");
const User = require("../database/models/user.js");
const Session = require("../database/models/session.js");
const mongoose = require("mongoose");
const Notificacao = require("../database/models/notificacao.js");

const notificationsController = {
    getUserNotifications: async (req, res) => {
        try {
            const { userID } = req.params

            const data = await Notificacao.find({ receptor: userID }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Ok", data });
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: true, message: e.message });
        }
    },
    updateReadState: async (req, res) => {
        try {
            const { notificationID } = req.body;

            await Notificacao.updateOne({ _id: notificationID }, {
                $set: {
                    lida: true
                }
            }).catch(e => {
                throw new Error(e)
            })

            res.status(200).json({ error: false, message: "Estado modificado com sucesso." });
        } catch (e) {
            res.status(500).json({ error: true, message: e.message });
        }
    },
};

module.exports = notificationsController;
