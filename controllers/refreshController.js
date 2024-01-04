const Session = require("../database/models/session.js");
const User = require("../database/models/user.js");
const jwt = require("jsonwebtoken");

const refreshController = {
    refresh: async (req, res) => {
        const cookies = req.cookies;

        if (!cookies?.refreshToken) {
            return res.sendStatus(401);
        }
        const refreshToken = cookies.refreshToken;

        const session = await Session.findOne({ refreshToken }).populate("user").populate("user.notificacoes");
        await session.populate("user.notificacoes")

        if (!session) {
            res.sendStatus(403);
        }

        session.user.senha = "";

        jwt.verify(refreshToken, process.env.RT_SECRET, (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }
            const accessToken = jwt.sign({ id: decoded.id, tipo: decoded.tipo, nome: decoded.nome }, process.env.AT_SECRET, { expiresIn: 15 * 60 });

            res.json({ user: session.user, accessToken });
        });
    },
};

module.exports = refreshController;
