class Normalizer {
  /**
   * Normalize TikTok data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeTikTok(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        author: data.author || null,
        downloads: {
          video: Array.isArray(data.video) ? data.video : [],
          audio: Array.isArray(data.audio) ? data.audio : [],
          image: Array.isArray(data.image) ? data.image : []
        },
        metadata: {
          audio_title: data.title_audio || null
        }
      };
    }
    
    let videoDownloads = [];
    let audioDownloads = [];
    let imageDownloads = [];
    
    if (Array.isArray(data.downloads)) {
      videoDownloads = data.downloads;
    } else if (data.downloads && typeof data.downloads === 'object') {
      if (data.downloads.video) {
        const videos = Array.isArray(data.downloads.video) ? data.downloads.video : [data.downloads.video];
        videos.forEach(url => {
          if (typeof url === 'string') {
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.includes('.jpeg') || lowerUrl.includes('.jpg') || lowerUrl.includes('.png') || lowerUrl.includes('.webp')) {
              imageDownloads.push(url);
            } else {
              videoDownloads.push(url);
            }
          } else {
            videoDownloads.push(url);
          }
        });
      }
      audioDownloads = Array.isArray(data.downloads.audio) ? data.downloads.audio : [];
      if (data.downloads.image) {
        imageDownloads = Array.isArray(data.downloads.image) ? data.downloads.image : [data.downloads.image];
      }
    } else if (data.video) {
      videoDownloads = Array.isArray(data.video) ? data.video : [data.video];
    }
    
    return {
      title: data.title || null,
      thumbnail: data.thumbnail || null,
      author: data.author || null,
      downloads: {
        video: videoDownloads,
        audio: audioDownloads,
        image: imageDownloads
      },
      metadata: {
        audio_title: data.title_audio || data.metadata?.audio_title || null
      }
    };
  }

  /**
   * Normalize Facebook data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeFacebook(data, source = 'primary') {
    if (source === 'v1') {
      return {
        quality: {
          sd: data.sd || null,
          hd: data.hd || null
        },
        downloads: [
          data.sd && { quality: 'SD', url: data.sd },
          data.hd && { quality: 'HD', url: data.hd }
        ].filter(Boolean)
      };
    }
    
    let downloads = [];
    if (Array.isArray(data)) {
      downloads = data;
    } else if (data && typeof data === 'object') {
      if (data.downloads) {
        downloads = Array.isArray(data.downloads) ? data.downloads : [data.downloads];
      } else if (data.sd || data.hd) {
        downloads = [
          data.sd && { quality: 'SD', url: data.sd, resolution: 'SD' },
          data.hd && { quality: 'HD', url: data.hd, resolution: 'HD' }
        ].filter(Boolean);
      } else {
        downloads = [data];
      }
    }
    
    return {
      quality: {},
      downloads: downloads
    };
  }

  /**
   * Normalize Instagram data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeInstagram(data, source = 'primary') {
    if (source === 'v1') {
      return {
        media: Array.isArray(data) ? data.map(item => ({
          thumbnail: item.thumbnail || null,
          url: item.url || null,
          type: 'unknown'
        })) : []
      };
    }
    
    let media = [];
    if (Array.isArray(data)) {
      media = data;
    } else if (data && typeof data === 'object') {
      if (data.media) {
        media = Array.isArray(data.media) ? data.media : [data.media];
      } else if (data.url) {
        media = [data];
      }
    }
    
    return {
      media: media
    };
  }

  /**
   * Normalize YouTube data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeYouTube(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        author: data.author || null,
        duration: null,
        downloads: {
          video: data.mp4 ? [{ quality: 'auto', url: data.mp4, format: 'mp4' }] : [],
          audio: data.mp3 ? [{ quality: '128kbps', url: data.mp3, format: 'mp3' }] : []
        }
      };
    }

    let formats = data.formats || data.downloads || [];
    if (!Array.isArray(formats)) {
      if (formats.video || formats.audio) {
        // Already in the correct structure
        return {
          title: data.title || null,
          thumbnail: data.thumbnail || null,
          author: data.author || null,
          duration: data.duration || null,
          downloads: {
            video: Array.isArray(formats.video) ? formats.video : [],
            audio: Array.isArray(formats.audio) ? formats.audio : []
          }
        };
      }
      formats = [];
    }
    
    const normalizeFormat = (f) => {
      const normalized = { ...f };
      if (!normalized.format && !normalized.ext) {
        if (normalized.type === 'audio' || (normalized.quality && normalized.quality.toLowerCase().includes('audio'))) {
          normalized.format = 'mp3';
        } else {
          normalized.format = 'mp4';
        }
      } else if (normalized.ext && !normalized.format) {
        normalized.format = normalized.ext;
      }
      return normalized;
    };
    
    return {
      title: data.title || null,
      thumbnail: data.thumbnail || null,
      author: data.author || null,
      duration: data.duration || null,
      downloads: {
        video: formats
          .filter(f => f.type === 'video' || f.type === 'video_with_audio' || (!f.type && f.format && f.format.includes('mp4')))
          .map(normalizeFormat),
        audio: formats
          .filter(f => f.type === 'audio' || (!f.type && f.format && (f.format.includes('mp3') || f.format.includes('m4a'))))
          .map(normalizeFormat)
      }
    };
  }

  /**
   * Normalize Spotify data from any source
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalizeSpotify(data, source = 'primary') {
    if (source === 'v1') {
      return {
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        author: null,
        duration: data.duration || null,
        album: null,
        downloads: data.formats?.map(f => ({
          url: f.url,
          quality: f.quality || 'unknown',
          format: f.ext || 'mp3'
        })) || []
      };
    }
    
    let downloads = [];
    if (data.downloadLinks && Array.isArray(data.downloadLinks)) {
      downloads = data.downloadLinks.map(link => ({
        url: link.url,
        quality: link.quality || 'unknown',
        format: link.extension || 'mp3'
      }));
    } else if (data.downloads && Array.isArray(data.downloads)) {
      downloads = data.downloads.map(d => ({
        url: d.url,
        quality: d.quality || 'unknown',
        format: d.format || d.ext || 'mp3'
      }));
    } else if (data.formats && Array.isArray(data.formats)) {
      downloads = data.formats.map(f => ({
        url: f.url,
        quality: f.quality || 'unknown',
        format: f.ext || f.format || 'mp3'
      }));
    } else if (data.url) {
      downloads = [{
        url: data.url,
        quality: 'default',
        format: 'mp3'
      }];
    }
    
    return {
      title: data.title || null,
      thumbnail: data.thumbnail || null,
      author: data.author || data.artist || null,
      duration: data.duration || null,
      album: data.album || null,
      downloads: downloads
    };
  }

  /**
   * Auto-detect and normalize data based on platform
   * @param {string} platform - Platform name (tiktok, facebook, instagram, youtube, spotify)
   * @param {Object} data - Raw data from API
   * @param {string} source - Source identifier ('primary' or 'v1')
   * @returns {Object} Normalized data
   */
  normalize(platform, data, source = 'primary') {
    const normalizers = {
      tiktok: this.normalizeTikTok,
      facebook: this.normalizeFacebook,
      instagram: this.normalizeInstagram,
      youtube: this.normalizeYouTube,
      spotify: this.normalizeSpotify
    };

    const normalizer = normalizers[platform.toLowerCase()];
    if (!normalizer) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return normalizer.call(this, data, source);
  }
}

module.exports = new Normalizer();
