import {
  DiscordGatewayAdapterCreator,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection
} from '@discordjs/voice';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { Player } from '../player';
import { getGuildMember } from '../util';

@Discord()
class JoinCommand {
  @Slash('join')
  async join(command: CommandInteraction) {
    await command.deferReply();
    const member = getGuildMember(command);
    if (!member) return;

    join(command, member, true);
  }
}

export function join(
  command: CommandInteraction,
  member: GuildMember,
  verbose?: boolean
): VoiceConnection | undefined {
  const guild = member.guild;
  const me = guild.me;
  if (!me) return undefined;

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    command.editReply("You're not in a voice channel!");
    return undefined;
  }

  let voiceConnection = getVoiceConnection(guild.id);
  if (
    !voiceConnection ||
    voiceConnection.joinConfig.channelId !== voiceChannel.id
  ) {
    const permissions = voiceChannel.permissionsFor(me);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      command.editReply("I can't speak in your channel!");
      return undefined;
    }

    voiceConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
    });
    command.editReply(`Joined ${voiceChannel.name}!`);

    const player = Player.find(guild.id);
    if (player) player.subscribe(voiceConnection);
  } else if (verbose) {
    command.editReply(`I'm already here!`);
  }

  return voiceConnection;
}
