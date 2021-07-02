import fetch from 'node-fetch';
import { XKCDData } from '@/types/xkcd.data';
import { computeBounds } from '@/util/discord.util';
import { MessageEmbed } from 'discord.js';
import { log } from '@/service/logger';

const URL = 'https://xkcd.com/';
const FILE = '/info.0.json';
let bounds = -1;

async function request(id: number, dry?: boolean): Promise<XKCDData | boolean> {
  let response = await fetch(URL + id + FILE);
  if(response.status === 200) {
    if(dry) return true;
    let body: XKCDData = await response.json();
    return body;
  }
  log.error(`[Zettai-Bot/XKCDUtil] Failed to load Comic ${id}.`);
  return false;
}

function format(data: XKCDData) {
  const embed: MessageEmbed = new MessageEmbed();
  embed.setTitle(data.title);
  embed.setImage(data.img);
  embed.setDescription(data.alt);
  embed.setFooter(`${data.num} | from ${data.month}/${data.day}/${data.year}`);
  return embed;
}

async function getComic(id: number) {
  const data = await request(id);
  return (typeof data === 'boolean') ? null : format(data);
}

async function getRandom() {
  if(bounds === -1) {
    bounds = await computeBounds(1500, 500, request);
  }
  const random = Math.floor(Math.random()*bounds);
  return getComic(random);
}

export { getComic, getRandom };