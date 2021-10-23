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
        const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]) || message.member;
        const db = await level.findOne()
    }
}

module.exports = new Rank;