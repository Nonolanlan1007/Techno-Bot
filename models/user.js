const { Schema, model } = require("mongoose"),

userShema = new Schema({
    userID: { type: String, required: false },
    cmdbl: { type: Boolean, required: false },
    ticketsbl: { type: Boolean, required: false }
}),

usersShema = module.exports = model("user", userShema);
