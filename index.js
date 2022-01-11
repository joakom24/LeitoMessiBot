// Importar dotenv
const dotenv = require("dotenv");
// Importar discord.js
const { Client, Intents } = require("discord.js");
const Discord = require("discord.js");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
dotenv.config();
// Objeto 'queue' donde guardamos todas las canciones que agregaremos
const queue = new Map();
/* Este cliente es en parte cómo interactúa con la API de Discord
y cómo le notificará eventos como mensajes nuevos. El cliente representa el bot de Discord.*/
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// Prefijo a utilizar
const prefix = "!";

client.on("ready", () => {
  console.log("ARRANQUE PERRRO");
  client.user.setPresence({
    activity: {
      name: `Argentina - Por Mil Noches (Emotivo)`,
      type: "WATCHING",
    },
    status: "dnd",
  });
});
client.on("error", (error) => {
  console.log(error);
  return;
});

// Se ejecuta cada vez que se envía un mensaje
client.on("message", async (message) => {
  const embedDatos = new Discord.MessageEmbed()
    .setTitle("Hola!")
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setColor(0x00ae86)
    .setDescription(
      `Tu nariz contra mis bolas. Comiste brother ${message.author} `
    )
    .setImage(message.author.displayAvatarURL())
    .setThumbnail(message.author.displayAvatarURL())
    .setTimestamp();
  // Comandos
  // Comprueba si el autor del mensaje es un bot y, si es así, deja de procesar el comando.
  if (message.author.bot) return;
  //  Comprueba si el contenido del mensaje que el bot está procesando comienza con el prefijo "!" y si no lo hace deja de procesarlo.
  if (!message.content.startsWith(prefix)) return;
  // Elimina el prefijo del contenido de mensaje y asigna el resultado a la constante
  // Toma el mensaje con el prefijo eliminado
  const args = message.content.slice(prefix.length).trim().split(" ");
  /*Esto le permite aislar el nombre de comando y dejar solo argumentos en la matriz.
  Los comandos no suelen distinguir entre minúsculas y mayúsculas en bots de Discord */
  const command = args.shift().toLowerCase();
  //Handler///
  const fs = require("fs");
  const commandFiles = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"));
  client.commands = new Discord.Collection();
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
  }

  // Comandos
  if (command === "ajno") {
    client.commands.get("ajno").execute(message, args);
  } else if (command === "franco") {
    client.commands.get("franco").execute(message, args);
  } else if (command === "violeta") {
    client.commands.get("violeta").execute(message, args);
  } else if (command === "mevoyacomer") {
    client.commands.get("mevoyacomer").execute(message, args);
  } else if (command === "abril") {
    client.commands.get("abril").execute(message, args);
  } else if (command === "teamobot") {
    message.channel.send(
      "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
    );
  } else if (command === "hola") {
    message.channel.send(embedDatos);
  } else if (command === "comandos") {
    client.commands.get("comandos").execute(message, args);
  } else if (command === "play") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send("Metete a un canal mostro");
    }
    const song = args.join(" ");
    if (!song) {
      message.channel.send("Escribí que queres escuchar la puta que te parió");
    } else {
      distube.play(message, args.join(" "));
    }
  } else if (["repeat", "loop"].includes(command)) {
    const mode = distube.setRepeatMode(message);
    message.channel.send(
      `Modo loop paa \`${
        mode ? (mode === 2 ? "Toda la cola" : "Esta canción") : "Off"
      }\``
    );
  } else if (command === "stop") {
    distube.stop(message);
    message.channel.send("Ahi le pegué un cachetazo");
  } else if (command === "leave") {
    distube.voices.get(message)?.leave();
  } else if (command === "skip") {
    distube.skip(message);
  } else if (command === "queue") {
    const queue = distube.getQueue(message);
    if (!queue) {
      message.channel.send("Reproduciendo ahora!");
    } else {
      message.channel.send(
        `En cola:\n${queue.songs
          .map(
            (song, id) =>
              `**${id ? id : "Reproduciendo ahora"}**. ${song.name} - \`${
                song.formattedDuration
              }\``
          )
          .slice(0, 10)
          .join("\n")}`
      );
    }
  } else {
    message.reply("Escribí un comando que exista la concha de tu madre.");
  }
});
client.on("messageDelete", async (message) => {
  let canal = client.channels.cache.get("930184160054759505");
  canal.send(`**${message.author.username}** Que borrás puto?`);
});

//Distube
const Distube = require("distube").default;
const distube = new Distube(client, {
  emitNewSongOnly: true,
  searchCooldown: 30,
  searchSongs: 3,
  leaveOnStop: false,
  leaveOnFinish: false,
  leaveOnEmpty: true,
  plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
});
distube.on("addList", (queue, playlist) =>
  queue.textChannel.send(
    `Agregada\`${playlist.name}\` playlist (${playlist.songs.length} canciones) a la cola!`
  )
);
distube.on("addSong", (queue, song) =>
  queue.textChannel.send(
    `Agregada ${song.name} - \`${song.formattedDuration}\``
  )
);
distube.on("playSong", (queue, song) =>
  queue.textChannel.send(
    `Reproduciendo \`${song.name}\` - \`${song.formattedDuration}\`\n`
  )
);
distube.on("playList", (queue, playList) =>
  queue.textChannel.send(
    `Reproduciendo \`${playList.name}\` - \`${playList.formattedDuration}\`\n`
  )
);
distube.on("initQueue", (queue) => {
  queue.autoplay = false;
  queue.volume = 100;
});
distube.on("error", (textChannel, e) => {
  console.error(e);
  textChannel.send(`Rompiste todo: ${e.slice(0, 2000)}`);
});
distube.on("finishSong", (queue) =>
  queue.textChannel.send("Terminó tu canción de mierda!")
);
distube.on("disconnect", (queue) => queue.textChannel.send("Me fuí!"));
distube.on("empty", (queue) => queue.textChannel.send("eh!"));
// DisTubeOptions.searchSongs > 1
distube.on("searchResult", (message, result) => {
  let i = 0;
  message.channel.send(
    `**Elegí una pelotudo**\n${result
      .map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``)
      .join(
        "\n"
      )}\n*Ingresá cualquier otra cosa o esperá 30 segundos para cancelar*`
  );
});
distube.on("searchCancel", (message) =>
  message.channel.send(`Busqueda cancelada por hijo de puta`)
);
distube.on("searchInvalidAnswer", (message) =>
  message.channel.send(`Terminaste el secundario?`)
);
distube.on("searchNoResult", (message) =>
  message.channel.send(`No hay nada la concha bien celosa de tu hermana `)
);
distube.on("done", () => {});
// Consume el token creado en config.json
client.login(process.env.BOT_TOKEN);