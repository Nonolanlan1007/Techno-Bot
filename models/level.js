const { Schema, model } = require("mongoose"),

lvlShema = new Schema({
    userID: { type: String, required: false },
    level: { type: Number, required: false },
    xp_restant: { type: Number, required: false },
    lvl: { type: Number, required: false },
    msg_count: { type: Number, required: false }
}),

lvlsShema = module.exports = model("level", lvlShema);
