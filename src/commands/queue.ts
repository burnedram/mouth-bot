import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { Player } from '../player';
import { getGuildMember } from '../util';

@Discord()
class QueueCommand {
  @Slash('queue', { description: 'View queue' })
  async queue(command: CommandInteraction) {
    await command.deferReply();

    const member = getGuildMember(command);
    if (!member) return;
    const guild = member.guild;

    const player = Player.find(guild.id);
    if (!player) {
      command.editReply("I'm not playing anything");
      return;
    }

    const currentEmbed = new MessageEmbed()
      .setTitle('Currently playing')
      .setDescription(
        `[${player.current.info.videoDetails.title}](${player.current.info.videoDetails.video_url})`
      );

    const queue = player.getQueue();
    if (queue.length === 0) {
      command.editReply({ embeds: [currentEmbed] });
    } else {
      const queueEmbed = new MessageEmbed()
        .setTitle('Queue')
        .setDescription(
          queue
            .map(
              (info, idx) =>
                `#${idx + 1}: [${info.info.videoDetails.title}](${
                  info.info.videoDetails.video_url
                })`
            )
            .join('\n')
        );

      command.editReply({ embeds: [currentEmbed, queueEmbed] });
    }
  }
}
