const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
}, {
    expires: 24 * 60 * 60
});

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema, "Sessions");

module.exports = Session;
