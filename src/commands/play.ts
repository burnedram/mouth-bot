import { Discord, Slash, SlashOption } from 'discordx';
import { getYoutubeInfo } from '../youtube';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Player } from '../player';
import { join } from './join';
import { getGuildMember } from '../util';

@Discord()
class PlayCommand {
  @Slash('play', { description: 'Play some music' })
  async play(
    @SlashOption('query', {
      required: true,
      description: 'A URL or id of a video or playlist, or a search query'
    })
    query: string,
    command: CommandInteraction
  ) {
    await command.deferReply();

    const member = getGuildMember(command);
    if (!member) return;

    command.editReply('Looking it up on YouTube...');

    const info = await getYoutubeInfo(query);

    const voiceConnection = join(command, member);
    if (!voiceConnection) return;

    command.editReply(`Found a ${info.provider} result for ${query}!`);

    let player = Player.find(member.guild.id);
    if (!player) {
      const embed = new MessageEmbed().setDescription(
        `Now playing [${info.info.videoDetails.title}](${info.info.videoDetails.video_url})!`
      );
      command.editReply({ embeds: [embed] });
      player = Player.create(member.guild.id, info);
    } else {
      const embed = new MessageEmbed().setDescription(
        `Queued [${info.info.videoDetails.title}](${info.info.videoDetails.video_url})!`
      );
      command.editReply({ embeds: [embed] });
      player.enqueue(info);
    }
  }
}
