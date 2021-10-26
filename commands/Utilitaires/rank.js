'use strict';

const Command = require("../../structure/Command.js"),
      level = require("../../models/level");

class Rank extends Command {
    constructor() {
        super({
            name: 'rank',
            category: 'utils',
            description: 'Voir des informations sur le iveau d\'un membre.',
            usage: 'rank [utilisateur]',
            example: ["rank", "rank 692374264476860507"],
            cooldown: 5
        });
    }

    async run(client, message, args) {
        const member = message.mentions.users.first() || message.author;
        const db = await level.findOne({ userID: member.id });
        if (!db) return message.reply(`**${client.no} ➜ \`${member.tag}\` n'a pas encore envoyé de messages.**`)
        message.reply(`**\`${member.tag}\` est au niveau \`${db.level}\`. Il a envoyé \`${db.msg_count}\` message(s). Il lui manque \`${db.xp_restant}\` avant de pouvoir passer au niveau \`${db.level + 1}\` !**`)
    }
}

module.exports = new Rank;