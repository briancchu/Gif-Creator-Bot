import fetch from 'node-fetch';
import FormData from 'form-data';
import { ReadStream } from 'fs';

interface ImgurImageResponse {
  status: number,
  success: boolean,
  data: ImgurImageInfo
}

interface ImgurBaseImageInfo {
  id: string,
  deletehash: string,
  account_id: string | null,
  account_url: string | null,
  ad_type: string | null,
  ad_url: string | null,
  title: string | null,
  description: string | null,
  name: string,
  type: string,
  width: number,
  height: number,
  size: number,
  views: number,
  section: string | null,
  vote: string | null,
  bandwidth: number,
  animated: boolean,
  favorite: boolean,
  in_gallery: boolean,
  in_most_viral: boolean,
  has_sound: boolean,
  is_ad: boolean,
  nsfw: boolean | null,
  link: string,
  tags: string[],
  datetime: number,
  mp4: string,
  hls: string,
  gifv?: string,
  edited?: string,
}

interface ImgurMp4ImageInfo extends ImgurBaseImageInfo {
  mp4_size: number,
  type: 'video/mp4',
  processing: {
    status: 'pending' | 'completed'
  },
}

interface ImgurGifImageInfo extends ImgurBaseImageInfo {
  type: 'image/gif',
}

type ImgurImageInfo = ImgurMp4ImageInfo | ImgurGifImageInfo;

export async function uploadToImgur(
  clientId: string,
  imageData: Buffer | ReadStream
): Promise<ImgurImageResponse> {
  const formData = new FormData();
  formData.append('video', imageData);

  const response = await fetch('https://api.imgur.com/3/upload', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
    redirect: 'follow',
  });

  return response.json();
}


export async function getImageInfo(
  clientId: string,
  imgurImageId: string
): Promise<ImgurImageResponse> {
  const response = await fetch(
    'https://api.imgur.com/3/image/' + imgurImageId, 
    {
      method: 'GET',
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
      redirect: 'follow',
    }
  );

  return response.json();
}
