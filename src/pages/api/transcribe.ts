// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getUnixTimeStamp } from '@/utils/helpers';
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path';
import fs from "fs";
import ytdl from "ytdl-core";
import internal from 'stream';
import { Blob } from "buffer";


type Data = {
  isError: boolean,
  errorMessage: string,
  text: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { url, openAiKey } = req.body;
  const timeStamp = getUnixTimeStamp();
  const fileName = `${timeStamp}.mp4`;
  const outPath = path.join(process.cwd(), 'data', fileName);

  // get info from youtube about the formats available for youtube url
  const info = await ytdl.getInfo(url);

  // filter our only 1 audio format
  const format = info.formats.find(
    (f) =>
      f.audioQuality === "AUDIO_QUALITY_MEDIUM" &&
      f.hasAudio === true &&
      f.container === "mp4" &&
      f.audioBitrate &&
      f.audioBitrate > 0
  );

  // if valid audio format not available then return error message
  if (!format) {
    res.status(200).json({
      isError: true,
      errorMessage: "No audio format available for provided youtube url.",
      text: ""
    })
    return 0;
  }

  // set youtube audio stream
  const youtubeAudio = ytdl(url, { format: format });

  // create filesystem stream to save audio file.
  const stream = fs.createWriteStream(outPath, { flags: 'a' });

  // fetch and save audio from youtube in file.
  youtubeAudio.on("data", (chunk) => {
    stream.write(chunk);
  });

  // wait for audio file to finish
  await waitForYoutubeStreamEnd(youtubeAudio, stream);

  let transcribedText = "";


  try {
    let buffer = fs.readFileSync(outPath);
    let blob = new Blob([buffer]);

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + openAiKey);

    var formdata = new FormData();
    formdata.append("file", blob as any, fileName);
    formdata.append("model", "whisper-1");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
    };

    const resOpenAI = await fetch("https://api.openai.com/v1/audio/transcriptions", requestOptions as any);

    const resJson: any = await resOpenAI.json();

    transcribedText = resJson.text;
    
    // remove existing file.
    try {
      fs.unlinkSync(outPath);
    } catch (error) { }

    res.status(200).json({
      isError: false,
      errorMessage: "",
      text: transcribedText
    });
    return 0;

  } catch (error: any) {
    res.status(200).json({
      isError: true,
      errorMessage: error.message,
      text: ""
    });
    return 0;
  }
}


const waitForYoutubeStreamEnd = (youtubeStream: internal.Readable, stream: fs.WriteStream) => {
  return new Promise<void>((res, rej) => {
    youtubeStream.on("end", () => {
      stream.close();
      res();
    });
    youtubeStream.on("error", rej);
  });
};
