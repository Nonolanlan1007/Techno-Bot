'use strict'; // Defines that JavaScript code should be executed in 'strict mode'.

const { token } = require('./configs/config.json'),
      Discord = require('discord.js'),
      { Client, Collection }= require('discord.js'),
      { readdirSync } = require('fs'),
      { join } = require("path"),
      { green, red, blue } = require('colors'),
      { text } = require('figlet'),
      { loadavg, cpus, totalmem } = require("os"),
      { no, yes } = require("./configs/emojis.json"),
      { botlogs } = require("./configs/channels.json"),
      { version } = require("./package.json"),
      mongoconnection = require('./fonctions/mongoose')

class Class extends Client {
    constructor(token) {
        super({ 
            partials:["USER","CHANNEL","GUILD_MEMBER","MESSAGE","REACTION"],
            intents: ["GUILDS","GUILD_MEMBERS","GUILD_BANS","GUILD_EMOJIS_AND_STICKERS","GUILD_INTEGRATIONS","GUILD_INVITES","GUILD_VOICE_STATES","GUILD_PRESENCES","GUILD_MESSAGES","GUILD_MESSAGE_REACTIONS","GUILD_MESSAGE_TYPING","DIRECT_MESSAGES","DIRECT_MESSAGE_REACTIONS","DIRECT_MESSAGE_TYPING"] });
        this.config = require('./configs/config.json');
        this.color = this.config.color;
        this.yes = yes;
        this.no = no;
        this.version = version;
        this.cooldowns = new Collection();
        mongoconnection.init()
        //Reload Command Function
        /**
         * @param {String} reload_command - Command file name without .js
         * @return {Promise<String>}
         */
        this.reloadCommand = function(reload_command) {
            return new Promise((resolve) => {
                const folders = readdirSync(join(__dirname, "commands"));
                for (let i = 0; i < folders.length; i++) {
                    const commands = readdirSync(join(__dirname, "commands", folders[i]));
                    if (commands.includes(`${reload_command}.js`)) {
                        try {
                            delete require.cache[require.resolve(join(__dirname, "commands", folders[i], `${reload_command}.js`))]
                            const command = require(join(__dirname, "commands", folders[i], `${reload_command}.js`));
                            this.commands.delete(command.name)
                            this.commands.set(command.name, command);
                            console.log(`${green('[COMMANDS]')} Commande ${reload_command} recharg??e avec succ??s !`)
                            this.channels.cache.get(botlogs).send(`**${yes} ??? Commande \`${reload_command}\` recharg??e avec succ??s !**`);
                            resolve(`**${yes} ??? Commande \`${reload_command}\` recharg??e avec succ??s !**`)
                        } catch (error) {
                            console.log(`${red('[COMMANDS]')} Une erreur est survenue lors du rechargement de la commande ${reload_command} : ${error.stack || error}`)
                            resolve(`**${no} ??? Impossible de recharger la commande \`${reload_command}\` !**`)
                        }
                    }
                }
                resolve(`**${no} ??? Commande introuvable !**`)
            })
        }
        /**
         * @param {String} reload_event - Event file name without .js
         * @return {Promise<String>}
         */
        this.reloadEvent = function(reload_event) {
            return new Promise((resolve) => {
                const files = readdirSync(join(__dirname, "events"));
                files.forEach((e) => {
                    try {
                        const fileName = e.split('.')[0];
                        if(fileName === reload_event) {
                            const file = require(join(__dirname, "events", e));
                            const res = this.listeners(fileName)
                            this.off(fileName, res[0]);
                            this.on(fileName, file.bind(null, this));
                            delete require.cache[require.resolve(join(__dirname, "events", e))];
                            console.log(`${green('[EVENTS]')} ??ven??ment ${reload_event} recharg?? avec succ??s !`)
                            this.channels.cache.get(botlogs).send(`**${yes} ??? ??v??nement \`${reload_event}\` recharg?? avec succ??s !**`);
                            resolve(`**${yes} ??? ??v??nement \`${reload_event}\` recharg?? avec succ??s !**`)
                        }
                    } catch (error) {
                        console.log(`${red('[EVENTS]')} Une erreur est survenue lors du rechargement de l?????v??nement ${e} : ${error.stack || error}`)
                        resolve(`**${no} ??? Impossible de recharger l?????v??nement \`${reload_event}\` !**`)
                    }
                });
                resolve(`**${no} ??? ??v??nement \`${reload_event}\` introuvable !**`)
            })
        }
        this.reloadAllCommands = function() {
            return new Promise((resolve) => {
                let count = 0;
                const folders = readdirSync(join(__dirname, "commands"));
                for (let i = 0; i < folders.length; i++) {
                    const commands = readdirSync(join(__dirname, "commands", folders[i]));
                    count = count + commands.length;
                    for(const c of commands){
                        try {
                            this.reloadCommand(c.replace('.js',''));
                        } catch (error) {
                            console.log(`${red('[COMMANDS]')} Impossible de recharger la commande ${c} : ${error.stack || error}`)
                        }
                    }
                }
                console.log(`${green('[COMMANDS]')} ${this.commands.size}/${count} Commandes recharg??es !`);
                resolve(`**${yes} ??? \`${this.commands.size}\`/\`${count}\` commandes recharg??es !**`)
                this.channels.cache.get(botlogs).send(`**${yes} ??? \`${this.commands.size}\`/\`${count}\` commandes recharg??es !**`)
            })
        }
        this.reloadAllEvents = function() {
            return new Promise((resolve) => {
                let count = 0;
                const files = readdirSync(join(__dirname, "events"));
                files.forEach((e) => {
                    try {
                        count++;
                        const fileName = e.split('.')[0];
                        this.reloadEvent(fileName);
                    } catch (error) {
                        console.log(`${red('[EVENTS]')} Impossible de recharger l?????v??nement ${e} : ${error.stack || error}`)
                    }
                });
                console.log(`${green('[EVENTS]')} ${count}/${files.length} ??v??nements recharg??s !`);
                resolve(`**${yes} ??? \`${count}\`/\`${files.length}\` ??v??nements recharg??s !**`)
                this.channels.cache.get(botlogs).send(`**${yes} ??? \`${count}\`/\`${files.length}\` ??v??nements recharg??s !**`)
            })
        };
        /**
         * @param {String} reload_event - Event file name without .js
         * @return {Promise<String>}
         */
         this.reloadSlashCommand = function(reload_command) {
            return new Promise((resolve) => {
                const folders = readdirSync(join(__dirname, "slashs"));
                for (let i = 0; i < folders.length; i++) {
                    const commands = readdirSync(join(__dirname, "slashs", folders[i]));
                    if (commands.includes(`${reload_command}.js`)) {
                        try {
                            delete require.cache[require.resolve(join(__dirname, "slashs", folders[i], `${reload_command}.js`))]
                            const command = require(join(__dirname, "slashs", folders[i], `${reload_command}.js`));
                            this.slashs.delete(command.name)
                            this.slashs.set(command.name, command);
                            console.log(`${green('[SLASHCOMMANDS]')} Commande slash ${reload_command} recharg??e avec succ??s !`)
                            resolve(`**${this.yes} ??? Commande slash \`${reload_command}\` recharg??e avec succ??s !**`)
                        } catch (error) {
                            console.log(`${red('[SLASHCOMMANDS]')} Une erreur est survenue lors du rechargement de la commande ${reload_command}: ${error.stack || error}`)
                            resolve(`**${this.no} ??? Impossible de recharger la commande \`${reload_command}\` !**`)
                        }
                    }
                }
                resolve(`**${this.no} ??? Commande slash introuvable !**`)
            })
        }
        this.reloadAllSlashCommands = function() {
            return new Promise((resolve) => {
                let count = 0;
                const folders = readdirSync(join(__dirname, "slashs"));
                for (let i = 0; i < folders.length; i++) {
                    const commands = readdirSync(join(__dirname, "slashs", folders[i]));
                    count = count + commands.length;
                    for(const c of commands){
                        try {
                            this.reloadSlashCommand(c.replace('.js',''));
                        } catch (error) {
                            throw new Error(`${red('[SLASHCOMMANDS]')} Une erreur est survenue lors du rechargement de la commande ${c}: ${error.stack || error}`)
                        }
                    }
                }
                console.log(`${green('[SLASHCOMMANDS]')} ${this.slashs.size}/${count} commandes slash recharg??e(s)`);
                resolve(`**${this.yes} ??? \`${this.slashs.size}\`/\`${count}\` commande(s) slash recharg??e(s) !**`)
            })
        }
        try {
            this.launch().then(() => { console.log(blue('Tout est pr??t, connexion ?? Discord !')); })
        } catch (e) {
            throw new Error(e)
        }
        this.login(token);
    }

    async launch() {
        console.log(green(`[BOT]`) + " Bot pr??t !");
        this.commands = new Collection();
        this.slashs = new Collection();
        this._commandsHandler();
        this._slashHandler();
        this._eventsHandler();
        this._processEvent();
        this._startingMessage();

    }

    _commandsHandler() {
        let count = 0;
        const folders = readdirSync(join(__dirname, "commands"));
        for (let i = 0; i < folders.length; i++) {
            const commands = readdirSync(join(__dirname, "commands", folders[i]));
            count = count + commands.length;
            for(const c of commands){
                try {
                    const command = require(join(__dirname, "commands", folders[i], c));
                    this.commands.set(command.name, command);
                } catch (error) {
                    console.log(`${red('[COMMANDS]')} Une erreur est survenue lors du rechargement de la commande ${c} : ${error.stack || error}`)
                }
            }
        }
        console.log(`${green('[COMMANDS]')} ${this.commands.size}/${count} commandes charg??e(s) !`)
    }

    _slashHandler() {
        let count = 0;
        const folders = readdirSync(join(__dirname, "slashs"));
        for (let i = 0; i < folders.length; i++) {
            const slashs = readdirSync(join(__dirname, "slashs", folders[i]));
            count = count + slashs.length;
            for(const c of slashs){
                try {
                    const slash = require(join(__dirname, "slashs", folders[i], c));
                    this.slashs.set(slash.name, slash);
                } catch (error) {
                    console.log(`${red('[SLASHCOMMANDS]')} Une erreur est survenue lors du chargement de la commande ${c} : ${error.stack || error}`)
                }
            }
        }
        console.log(`${green('[SLASHCOMMANDS]')} ${this.slashs.size}/${count} commandes slash charg??e(s)`)
    }

    _eventsHandler() {
        let count = 0;
        const files = readdirSync(join(__dirname, "events"));
        files.forEach((e) => {
            try {
                count++;
                const fileName = e.split('.')[0];
                const file = require(join(__dirname, "events", e));
                this.on(fileName, file.bind(null, this));
                delete require.cache[require.resolve(join(__dirname, "events", e))];
            } catch (error) {
                throw new Error(`${red('[EVENTS]')} Une erreur est survenue lors du chargement de l'??v??nement ${e} : ${error.stack || error}`)
            }
        });
        console.log(`${green('[EVENTS]')} ${count}/${files.length} ??v??nements charg??(s) !`)
    }

    _startingMessage() {
        const cpuCores = cpus().length;
        //Custom Starting Message
        text('Tchno-Bot', {
            font: "Standard"
        }, function(err, data) {
            if (err) {
                console.log('Quelque chose ne va pas...');
                console.dir(err);
                return;
            }
            const data2 = data;
            text('By Nolhan#2508', {
            }, function(err, data) {
                if (err) {
                    console.log('Quelque chose ne va pas...');
                    console.dir(err);
                    return;
                }
                console.log("================================================================================================================================"+"\n"+
                                data2+"\n\n"+ data +"\n"+
                            "================================================================================================================================"+ "\n"+
                                `CPU: ${(loadavg()[0]/cpuCores).toFixed(2)}% / 100%` + "\n" +
                                `RAM: ${Math.trunc((process.memoryUsage().heapUsed) / 1000 / 1000)} MB / ${Math.trunc(totalmem() / 1000 / 1000)} MB` + "\n" +
                                //`Discord WebSocket Ping: ${this.ws.ping}` + "\n" +
                            "================================================================================================================================"
                );
            });

        });
    }


   _processEvent() {
        process.on('unhandledRejection', error => {
            if(error.code === 50007) return
            console.error(green('Une erreur est survenue : ') + red(error.stack));
            let details = `\`\`\`\nName : ${error.name}\nMessage : ${error.message}`
            if (error.path) details += `\nChemin : ${error.path}`
            if (error.code) details += `\nCode d'erreur : ${error.code}`
            if (error.method) details += `\nM??thode: ${error.method}`
            if (this.channels.cache.get(botlogs)) this.channels.cache.get(botlogs).send({
                content: `<@${this.config.owner}>`,
                embeds: [{
                    description: `???? **Une erreur est survenue :**\n\`\`\`js\n${error}\`\`\``,
                    color: this.color,
                    fields: [
                        {
                            name: "???? D??tails :",
                            value: `${details}\`\`\``
                        }
                    ]
                }]
            })
        });
    }
}

module.exports = new Class(token);

