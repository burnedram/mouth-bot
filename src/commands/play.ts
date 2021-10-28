import { Discord, Slash, SlashOption } from 'discordx';
import {
  createAudioResource,
  AudioPlayerStatus,
  AudioResource,
  VoiceConnectionStatus
} from '@discordjs/voice';
import { getYoutubeInfo, YoutubeInfo } from '../youtube';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { getOrCreateAudioPlayer, stopAudioPlayer } from '../players';
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
    await command.reply('Looking it up...');

    const member = getGuildMember(command);
    if (!member) return;

    const youtubeInfo = await getYoutubeInfo(query);

    const voiceConnection = join(command, member);
    if (!voiceConnection) return;

    command.editReply(`Found a ${youtubeInfo.provider} result for ${query}!`);

    const audioPlayer = getOrCreateAudioPlayer(voiceConnection);
    voiceConnection.subscribe(audioPlayer);
    audioPlayer.on('stateChange', (oldState, newState) => {
      if (
        oldState.status === AudioPlayerStatus.Idle &&
        'resource' in newState
      ) {
        const audioResource = newState.resource as AudioResource<YoutubeInfo>;
        const embed = new MessageEmbed().setDescription(
          `Now playing [${audioResource.metadata.info.videoDetails.title}](${audioResource.metadata.info.videoDetails.video_url})!`
        );
        command.editReply({ embeds: [embed] });
      } else if (newState.status === AudioPlayerStatus.Idle) {
        stopAudioPlayer(voiceConnection);
        if (voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
          voiceConnection.destroy();
      }
    });

    const audioResource = createAudioResource(youtubeInfo.chosenFormat.url, {
      metadata: youtubeInfo
    });
    audioPlayer.play(audioResource);
  }
}
