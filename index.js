const DiscordSmith = require('discord.js');
const smithmta = require('gamedig');
const smithconfig = require('./config.json');

const smithbot = new DiscordSmith.Client({ intents: [DiscordSmith.Intents.FLAGS.GUILDS] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { config } = require('process');

const commands = [
	new SlashCommandBuilder().setName('server').setDescription('mta server status'),
    new SlashCommandBuilder().setName('player').setDescription('player in game'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(smithconfig.token);

smithbot.once('ready', () => {
	console.log(`Logged : ${smithbot.user.tag}`);
    setInterval(() => {
        smithmta.query({
            type: 'mtasa',
            host: smithconfig.server_ip,
            port: smithconfig.server_port
        }).then((state) => {
            smithbot.user.setActivity(`DSRP: ${state.raw.numplayers}/${state.maxplayers}`);
        }).catch(err => {
            console.log(err);
        });
    }, 5000);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(smithbot.user.id, smithconfig.guildId),
                { body: commands },
            );
    
            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});


smithbot.on('interactionCreate', async smithmsg => {
	if (!smithmsg.isCommand()) return;

	const { commandName } = smithmsg;

	if (commandName === 'server') {
		smithmta.query({
            type: 'mtasa',
            host: smithconfig.server_ip,
            port: smithconfig.server_port
        }).then(async (state) => {
            console.log(state)
            var smithembed = new DiscordSmith.MessageEmbed()
            .setTitle(state.name)
            .setColor(`RED`)
            .addField(`:map:▸Mapa`,`- Republica Dominicana -`,true)
            .addField(`:video_game:▸Gametype`,`- Roleplay -`,true)
            .addField(`:gear:▸Desarrollador`,`- miguel_one -`,true)
            .addField(`:green_circle:▸Jugadores`,`- ${state.raw.numplayers}/${state.maxplayers} -`,true)
            .addField(`:round_pushpin:▸Ping`,`- ${state.ping}ms -`,true)
            .addField(`:link:▸IP`,`- ${state.connect} -`,true)
            .setTimestamp()
            .setFooter(`Solicitado por ${smithmsg.member.user.tag}`,smithmsg.member.user.avatarURL());

            await smithmsg.reply({ embeds: [smithembed] });
        }).catch(err => {
            console.log(err);
        });
	} 
});

smithbot.login(smithconfig.token);