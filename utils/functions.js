const axios = require('axios');
const chalk = require('chalk');

const MAX_FILE_SIZE = 35 * 1024 * 1024; // 50 MB in bytes

const fetchJson = async (url, options = {}) => {
  try {
    const result = await (await axios.get(url, { ...options })).data;
    return result;
  } catch (e) {
    return ({ status: false, msg: e.message });
  }
}

async function checkFileSize(url) {
  try {
    const response = await axios.head(url, { timeout: 10000 });
    const contentLength = parseInt(response.headers['content-length'], 10);
    return {
      size: contentLength,
      sizeInMB: (contentLength / (1024 * 1024)).toFixed(2),
      exceedsLimit: contentLength > MAX_FILE_SIZE
    };
  } catch (error) {
    return null;
  }
}

const handleError = (error, spinner) => {
  spinner.fail(chalk.red(' Error fetching data'));
  if (error.code === 'ECONNABORTED') {
    console.log(chalk.gray(' • Request timeout - please try again'));
  } else if (error.response) {
    console.log(chalk.gray(` • API Error: ${error.response.status}`));
    if (error.response.data && error.response.data.message) {
      console.log(chalk.gray(` • ${error.response.data.message}`));
    }
  } else if (error.request) {
    console.log(chalk.gray(' • Network error - please check your connection'));
  } else {
    console.log(chalk.gray(` • ${error.message}`));
  }
}

const generateFilename = (platform, data = {}) => {
  const timestamp = Date.now();
  const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  
  const filenames = {
    applemusic: () => {
      const artist = sanitize(data.artist || 'AppleMusic');
      const type = data.type || 'audio';
      const ext = type === 'audio' ? 'mp3' : 'jpg';
      return `applemusic_${artist}_${type}_${timestamp}.${ext}`;
    },
    bluesky: () => {
      const handle = sanitize(data.handle || 'bluesky');
      const type = data.type || 'video';
      const ext = type === 'video' ? 'mp4' : 'jpg';
      return `bluesky_${handle}_${timestamp}.${ext}`;
    },
    capcut: () => {
      const id = sanitize(data.id || 'capcut');
      const quality = sanitize(data.quality || 'default');
      const ext = data.ext || 'mp4';
      return `capcut_${id}_${quality}_${timestamp}.${ext}`;
    },
    douyin: () => {
      const quality = sanitize(data.quality || 'default');
      return `douyin_video_${quality}_${timestamp}.mp4`;
    },
    facebook: () => {
      const resolution = sanitize(data.resolution || 'default');
      const ext = data.ext || 'mp4';
      return `facebook_${resolution}_${timestamp}.${ext}`;
    },
    instagram: () => {
      const index = data.index !== undefined ? data.index + 1 : 1;
      const ext = data.ext || 'jpg';
      return `instagram_media_${index}_${timestamp}.${ext}`;
    },
    kuaishou: () => {
      const type = data.type || 'media';
      const index = data.index !== undefined ? data.index : '';
      const ext = type === 'video' ? 'mp4' : 'jpg';
      return `kuaishou_${type}${index ? '_' + index : ''}_${timestamp}.${ext}`;
    },
    pinterest: () => {
      const quality = sanitize(data.quality || 'default');
      const ext = data.ext || 'jpg';
      return `pinterest_${quality}_${timestamp}.${ext}`;
    },
    rednote: () => {
      const type = data.type || 'media';
      const quality = sanitize(data.quality || '');
      const index = data.index !== undefined ? data.index : '';
      const ext = type === 'video' ? 'mp4' : 'jpg';
      return `rednote_${type}${quality ? '_' + quality : ''}${index ? '_' + index : ''}_${timestamp}.${ext}`;
    },
    spotify: () => {
      const title = sanitize(data.title || 'track');
      const type = data.type || 'audio';
      const ext = data.ext || 'mp3';
      return `${title}_${type}_${timestamp}.${ext}`;
    },
    threads: () => {
      return `threads_video_${timestamp}.mp4`;
    },
    tiktok: () => {
      const type = data.type || 'video';
      const index = data.index !== undefined ? `_${data.index + 1}` : '';
      const ext = data.ext || (type === 'audio' ? 'mp3' : type === 'image' ? 'jpg' : 'mp4');
      return `tiktok_${type}${index}_${timestamp}.${ext}`;
    },
    twitter: () => {
      const quality = data.quality || 'default';
      return `twitter_video_${quality}p_${timestamp}.mp4`;
    },
    weibo: () => {
      const type = data.type || 'media';
      const index = data.index !== undefined ? data.index : '';
      const ext = type === 'video' ? 'mp4' : 'jpg';
      return `weibo_${type}${index ? '_' + index : ''}_${timestamp}.${ext}`;
    },
    youtube: () => {
      const title = sanitize(data.title || 'video');
      const quality = sanitize(data.quality || 'default');
      const ext = data.format || data.ext || 'mp4';
      return `${title}_${quality}.${ext}`;
    }
  };
  
  const generator = filenames[platform.toLowerCase()];
  return generator ? generator() : `download_${timestamp}`;
}

const getSelectedOption = (platform, selectedDownload) => {
  const options = {
    applemusic: () => ({
      url: selectedDownload.url,
      type: selectedDownload.type,
      maxSize: selectedDownload.type === 'audio' ? 10485760 : null
    }),
    bluesky: () => ({
      url: selectedDownload.downloadLink || selectedDownload.url,
      type: selectedDownload.type || 'video'
    }),
    capcut: () => ({
      url: selectedDownload.url,
      quality: selectedDownload.quality,
      ext: selectedDownload.extension
    }),
    douyin: () => ({
      url: selectedDownload.url,
      label: selectedDownload.label
    }),
    facebook: () => ({
      url: selectedDownload.url,
      resolution: selectedDownload.resolution,
      ext: selectedDownload.ext
    }),
    instagram: () => ({
      url: selectedDownload.url,
      index: selectedDownload.index,
      ext: selectedDownload.ext
    }),
    kuaishou: () => ({
      url: selectedDownload.url,
      type: selectedDownload.type
    }),
    pinterest: () => ({
      url: selectedDownload.url,
      quality: selectedDownload.quality,
      format: selectedDownload.format
    }),
    rednote: () => ({
      url: selectedDownload.url || selectedDownload.data,
      type: selectedDownload.type,
      data: selectedDownload.data
    }),
    spotify: () => ({
      url: selectedDownload.url,
      type: selectedDownload.type,
      format: selectedDownload.format,
      maxSize: selectedDownload.type === 'audio' ? 10485760 : null
    }),
    threads: () => ({
      url: selectedDownload.url
    }),
    tiktok: () => ({
      url: selectedDownload.url,
      type: selectedDownload.type,
      text: selectedDownload.text
    }),
    twitter: () => ({
      url: selectedDownload.url,
      quality: selectedDownload.quality
    }),
    weibo: () => ({
      url: selectedDownload.url,
      type: selectedDownload.type
    }),
    youtube: () => ({
      url: selectedDownload.url,
      type: selectedDownload.type,
      quality: selectedDownload.quality,
      format: selectedDownload.format,
      maxSize: selectedDownload.type === 'video' ? 10485760 : null
    })
  };
  
  const extractor = options[platform.toLowerCase()];
  return extractor ? extractor() : selectedDownload;
}

const buildDownloadChoices = (platform, data = {}) => {
  const choices = [];
  
  const builders = {
    applemusic: () => {
      const { downloads = [] } = data;
      downloads.forEach((item) => {
        choices.push({
          name: ` ${item.type} - ${item.quality}`,
          value: item
        });
      });
      return choices;
    },
    bluesky: () => {
      return choices;
    },
    capcut: () => {
      const { medias = [] } = data;
      medias.forEach((media, index) => {
        choices.push({
          name: ` ${media.quality}`,
          value: { url: media.url, quality: media.quality, extension: media.extension, index }
        });
      });
      return choices;
    },
    douyin: () => {
      const { downloads = [] } = data;
      downloads.forEach((item, index) => {
        choices.push({
          name: ` ${item.label}`,
          value: { url: item.url, label: item.label, index }
        });
      });
      return choices;
    },
    facebook: () => {
      const { downloads = [] } = data;
      downloads.forEach((item, index) => {
        choices.push({
          name: ` ${item.resolution}`,
          value: { url: item.url, resolution: item.resolution, ext: item.ext, index }
        });
      });
      return choices;
    },
    instagram: () => {
      const { media = [] } = data;
      media.forEach((item, index) => {
        const ext = item.ext || 'jpg';
        choices.push({
          name: ` Media ${index + 1} (${ext === 'mp4' ? 'Video' : 'Photo'})`,
          value: { url: item.url, thumbnail: item.thumbnail, index, ext }
        });
      });
      choices.push({
        name: ' Download All',
        value: 'all'
      });
      return choices;
    },
    kuaishou: () => {
      const { videos = [], images = [] } = data;
      if (videos.length > 0) {
        choices.push({
          name: chalk.bold.cyan(' Videos'),
          disabled: true
        });
        videos.forEach((video, index) => {
          choices.push({
            name: ` ${video.quality}`,
            value: { url: video.url, type: 'video', quality: video.quality, index }
          });
        });
      }
      if (images.length > 0) {
        choices.push({
          name: chalk.bold.yellow(' Images'),
          disabled: true
        });
        images.forEach((image, index) => {
          choices.push({
            name: ` Image ${index + 1}`,
            value: { url: image, type: 'image', index }
          });
        });
      }
      choices.push({
        name: ' Download All',
        value: 'all'
      });
      return choices;
    },
    pinterest: () => {
      const { downloads = [] } = data;
      downloads.forEach((media) => {
        choices.push({
          name: ` ${media.quality} - ${media.format}`,
          value: media
        });
      });
      choices.push({
        name: ' Download All Qualities',
        value: 'all'
      });
      return choices;
    },
    rednote: () => {
      const { videos = [], images = [] } = data;
      if (videos.length > 0) {
        choices.push({
          name: chalk.bold.cyan(' Videos'),
          disabled: true
        });
        videos.forEach((video, index) => {
          choices.push({
            name: ` ${video.quality}`,
            value: { type: 'video', data: video, index }
          });
        });
      }
      if (images.length > 0) {
        choices.push({
          name: chalk.bold.yellow(' Images'),
          disabled: true
        });
        images.forEach((image, index) => {
          choices.push({
            name: ` Image ${index + 1}`,
            value: { type: 'image', data: image, index }
          });
        });
      }
      choices.push({
        name: ' Download All',
        value: 'all'
      });
      return choices;
    },
    spotify: () => {
      const { downloads = [] } = data;
      downloads.forEach((item) => {
        choices.push({
          name: ` ${item.type} - ${item.quality}`,
          value: item
        });
      });
      return choices;
    },
    threads: () => {
      return choices;
    },
    tiktok: () => {
      const { videos = [], audios = [], images = [] } = data;
      videos.forEach((url, index) => {
        choices.push({
          name: ` Video ${index + 1}`,
          value: { url, text: `Video ${index + 1}`, type: 'video' }
        });
      });
      audios.forEach((url, index) => {
        choices.push({
          name: ` Audio ${index + 1}`,
          value: { url, text: `Audio ${index + 1}`, type: 'audio' }
        });
      });
      images.forEach((url, index) => {
        choices.push({
          name: ` Image ${index + 1}`,
          value: { url, text: `Image ${index + 1}`, type: 'image' }
        });
      });
      if (images.length > 1) {
        choices.push({
          name: ` Download All Images (${images.length})`,
          value: { urls: images, text: `All Images`, type: 'all-images' }
        });
      }
      return choices;
    },
    twitter: () => {
      const { media = [] } = data;
      media.forEach((item, index) => {
        choices.push({
          name: ` ${item.quality}p`,
          value: { url: item.url, quality: item.quality, index }
        });
      });
      return choices;
    },
    weibo: () => {
      const { hasVideo = true, videos = [], images = [] } = data;
      if (hasVideo) {
        choices.push({
          name: chalk.bold.cyan(' Video'),
          disabled: true
        });
        videos.forEach((video, index) => {
          choices.push({
            name: ` Video ${index + 1}`,
            value: { type: 'video', url: video.url, index }
          });
        });
      }
      if (images.length > 0) {
        choices.push({
          name: chalk.bold.yellow(' Images'),
          disabled: true
        });
        images.forEach((image, index) => {
          choices.push({
            name: ` Image ${index + 1}`,
            value: { type: 'image', url: image, index }
          });
        });
      }
      choices.push({
        name: ' Download All',
        value: 'all'
      });
      return choices;
    },
    youtube: () => {
      const { videoWithAudio = [], videoOnly = [], audioOnly = [] } = data;
      
      if (videoWithAudio.length > 0) {
        choices.push({
          name: chalk.bold.cyan(' Video with Audio'),
          disabled: true
        });
        videoWithAudio.forEach((format, index) => {
          choices.push({
            name: ` ${format.quality}`,
            value: { url: format.url, type: 'video', format: format.format, quality: format.quality, index }
          });
        });
      }
      
      if (videoOnly.length > 0) {
        choices.push({
          name: chalk.bold.yellow(' Video Only (no audio)'),
          disabled: true
        });
        videoOnly.forEach((format, index) => {
          choices.push({
            name: ` ${format.quality}`,
            value: { url: format.url, type: 'video', format: format.format, quality: format.quality, index }
          });
        });
      }
      
      if (audioOnly.length > 0) {
        choices.push({
          name: chalk.bold.green(' Audio Only'),
          disabled: true
        });
        audioOnly.forEach((format, index) => {
          choices.push({
            name: ` ${format.quality}`,
            value: { url: format.url, type: 'audio', format: format.format, quality: format.quality, index }
          });
        });
      }
      
      return choices;
    }
  };
  
  const builder = builders[platform.toLowerCase()];
  return builder ? builder() : [];
}

module.exports = { fetchJson, checkFileSize, handleError, generateFilename, getSelectedOption, buildDownloadChoices, MAX_FILE_SIZE };
