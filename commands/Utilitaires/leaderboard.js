'use strict';

const { MessageEmbed } = require("discord.js")
const Command = require("../../structure/Command.js"),
      level = require("../../models/level");

class Leaderboard extends Command {
    constructor() {
        super({
            name: 'leaderboard',
            category: 'utils',
            description: 'Voir les classements du serveur.',
            aliases: ["lb", "top"],
            example: ["lb staff", "top likes"],
            perms: 'everyone',
            usage: 'leaderboard <likes | staff | bumps>',
            cooldown: 5
        });
    }

    async run(client, message, args) {     
    const usersdata = await level.find({ serverID: mainguildid });

    if (usersdata.length < 2) return message.channel.send(`**${client.no} ➜ Il n'y a pas assez de membres dans le classement pour que je puisse afficher en afficher un.**`)
    let array = usersdata.sort((a, b) => (a.msg_count < b.msg_count) ? 1 : -1).slice(0, 10);
    let forfind = usersdata.sort((a, b) => (a.msg_count < b.msg_count) ? 1 : -1);

    function estUser(user) {
        return user.uID === message.author.id;
    }
    const user = forfind.find(estUser);
    const userTried = (element) => element === user;
    let ranked = forfind.findIndex(userTried) + 1
    let first;
    if (ranked === 1) {
        first = "1"
    } else {
        first = `${ranked}`
    }
    const e = new MessageEmbed()
    .setTitle("Classement des membres du serveur :")
    .setColor(client.color)
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setDescription(array.map((r, i) => `#${i + 1} **${client.users.cache.get(r.userID).tag}** avec \`${r.msg_count}\` messages et \`${r.level}\` niveau(x) passé(s) !`).join("\n"))
    message.channel.send({ embeds: [e] })
    }
}

module.exports = new Leaderboard;