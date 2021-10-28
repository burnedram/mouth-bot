import { getVoiceConnection } from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { stopAudioPlayer } from '../players';
import { getGuildMember } from '../util';

@Discord()
class PlayCommand {
  @Slash('stop')
  async stop(command: CommandInteraction) {
    await command.reply('Stopping current song...');
    const member = getGuildMember(command);
    if (!member) return;
    const guild = member.guild;

    const voiceConnection = getVoiceConnection(guild.id);
    const voiceChannel = member.voice.channel;
    if (
      !voiceConnection ||
      !voiceChannel ||
      voiceChannel.id !== voiceConnection.joinConfig.channelId
    ) {
      command.editReply("You're not listening to me :)");
      return;
    }

    const metadata = stopAudioPlayer(voiceConnection);
    if (!metadata) command.editReply('Nothing to stop :)');
    else command.editReply(`Stopped ${metadata.info.videoDetails.title}!`);
  }
}
