import {
  AudioPlayer,
  AudioResource,
  createAudioPlayer,
  VoiceConnection
} from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { YoutubeInfo } from './youtube';

const guildPlayers = new Map<string, AudioPlayer>();

export function getOrCreateAudioPlayer(
  voiceConnection: VoiceConnection
): AudioPlayer {
  const guildId = voiceConnection.joinConfig.guildId;
  let audioPlayer = guildPlayers.get(guildId);
  if (audioPlayer) return audioPlayer;

  audioPlayer = createAudioPlayer();
  guildPlayers.set(guildId, audioPlayer);
  return audioPlayer;
}

export function getAudioPlayer(
  voiceConnection: VoiceConnection
): AudioPlayer | undefined {
  const guildId = voiceConnection.joinConfig.guildId;
  return guildPlayers.get(guildId);
}

export function stopAudioPlayer(
  voiceConnection: VoiceConnection
): YoutubeInfo | undefined {
  const guildId = voiceConnection.joinConfig.guildId;
  const audioPlayer = guildPlayers.get(guildId);
  if (!audioPlayer) return undefined;

  let metadata: YoutubeInfo | undefined = undefined;
  if ('resource' in audioPlayer.state) {
    const resource = audioPlayer.state.resource as AudioResource<YoutubeInfo>;
    metadata = resource.metadata;
  }

  guildPlayers.delete(guildId);
  audioPlayer.stop();

  return metadata;
}
