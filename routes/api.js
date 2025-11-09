const normalizer = require('../utils/normalizer');

const getApi = {
  tiktok: 'https://prenivapi.vercel.app/api/tiktok?url=',
  facebook: 'https://prenivapi.vercel.app/api/fbdl?url=',
  instagram: 'https://prenivapi.vercel.app/api/igdl?url=',
  twitter: 'https://prenivapi.vercel.app/api/twitter?url=',
  youtube: 'https://prenivapi.vercel.app/api/youtube?url=',
  douyin: 'https://prenivapi.vercel.app/api/douyin?url=',
  spotify: 'https://prenivapi.vercel.app/api/spotify?url=',
  pinterest: 'https://prenivapi.vercel.app/api/pinterest?url=',
  applemusic: 'https://prenivapi.vercel.app/api/applemusic?url=',
  capcut: 'https://prenivapi.vercel.app/api/capcut?url=',
  bluesky: 'https://prenivapi.vercel.app/api/bluesky?url=',
  rednote: 'https://prenivapi.vercel.app/api/rednote?url=',
  threads: 'https://prenivapi.vercel.app/api/threads?url=',
};

module.exports = { getApi, normalizer };