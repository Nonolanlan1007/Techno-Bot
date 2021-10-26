'use strict';

const { welcomechannel } = require("../configs/channels.json"),
      { mainguildid } = require("../configs/config.json"),
      { MessageEmbed } = require("discord.js"),
      { autorole } = require("../configs/roles.json"),
      { entre } = require("../configs/emojis.json")

module.exports = async(client, member) => {
    if (member.guild.id !== mainguildid) return;
    if (!member.user.bot) {
        client.channels.cache.get(welcomechannel).send(`**${entre} ➜ Un \`${member.user.username}\` sauvage tape l'incruste dans le serveur !**`)
        try {
            member.roles.add(autorole)
        }
        catch (err) {
            client.emit("error", err)
        }
    }
}