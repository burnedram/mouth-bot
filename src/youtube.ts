import fs from 'fs';
import { Readable } from 'stream';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr from 'ytsr';

const KEBAB_ID = '0uz5qwjRrfU';
const KEBAB = `https://www.youtube.com/watch?v=${KEBAB_ID}`;

export interface YoutubeInfo {
  provider: 'video' | 'playlist' | 'search';
  info: ytdl.videoInfo;
  chosenFormat: ytdl.videoFormat;
}

export async function getYoutubeInfo(query: string): Promise<YoutubeInfo> {
  let provider: YoutubeInfo['provider'];
  let urlOrId: string;

  if ((await ytdl.validateID(query)) || (await ytdl.validateURL(query))) {
    provider = 'video';
    urlOrId = query;
  } else if (await ytpl.validateID(query)) {
    // Validates both ID and url:s
    provider = 'playlist';
    console.warn('Playlists are not fully implemented, returning first item');
    const playlist = await ytpl(query);
    urlOrId = playlist.items[0].id;
  } else {
    provider = 'search';
    const filters = await ytsr.getFilters(query);

    const typeFilters = filters.get('Type');
    if (!typeFilters)
      throw new Error(`Unable to fetch 'Type' filters for query '${query}'`);

    const videoFilter = typeFilters.get('Video');
    if (!videoFilter)
      throw new Error(`Unable to fetch 'Video' filter for query '${query}'`);

    const queryUrl = videoFilter.url;
    if (!queryUrl)
      throw new Error(
        `Unable to fetch url of 'Video' filter for query '${query}'`
      );

    const search = await ytsr(queryUrl, {
      limit: 1
    });
    const firstItem = search.items[0];
    if (firstItem.type !== 'video')
      throw new Error(`ytsr is borken, query was '${query}'`);
    urlOrId = firstItem.id;
  }

  const info = await ytdl.getInfo(urlOrId);
  const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
  const chosenFormat = ytdl.chooseFormat(audioFormats, {
    quality: 'highestaudio'
  });
  return {
    provider,
    info,
    chosenFormat
  };
}

interface YoutubeStream {
  info: ytdl.videoInfo;
  chosenFormat: ytdl.videoFormat;
  readable: Readable;
}

async function downloadYoutube(urlOrId: string): Promise<YoutubeStream> {
  if (!ytdl.validateURL(urlOrId)) {
    throw new Error(`Unable to validate '${urlOrId}'`);
  }

  let info = await ytdl.getInfo(urlOrId);
  let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
  let format = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
  info.formats = [format];

  return await new Promise<YoutubeStream>((resolve, reject) => {
    let readable = ytdl
      .downloadFromInfo(info)
      .once('error', (reason) => reject(reason))
      .once('info', (info: ytdl.videoInfo, chosenFormat: ytdl.videoFormat) => {
        console.log('info');
        console.dir({
          videoId: info.videoDetails.videoId,
          title: info.videoDetails.title,
          authorId: info.videoDetails.author.id,
          authorName: info.videoDetails.author.name,
          lengthSeconds: info.videoDetails.lengthSeconds
        });
        console.log('format');
        console.dir({
          itag: format.itag,
          mimeType: format.mimeType,
          container: format.container,
          contentLength: format.contentLength,
          approxDurationMs: format.approxDurationMs,
          hasAudio: format.hasAudio,
          hasVideo: format.hasVideo
        });

        resolve({
          info,
          chosenFormat,
          readable
        });
      })
      .on(
        'progress',
        (chunkLength: number, downloadedBytes: number, totalBytes: number) =>
          console.log(
            `${downloadedBytes}/${totalBytes} (${(
              downloadedBytes / totalBytes
            ).toFixed(0)})`
          )
      )
      .once('end', () => console.log('Download completed'));
  });
}

async function main() {
  let yt = await downloadYoutube(KEBAB);
  yt.readable.pipe(
    fs.createWriteStream(`./kebab.${yt.chosenFormat.container}`)
  );
}
