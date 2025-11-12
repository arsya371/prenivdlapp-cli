const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi, normalizer } = require('./api');
const { downloadFile } = require('../utils/download');
const TiktokDL = require('@tobyg74/tiktok-api-dl');

async function downloadTikTok(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching TikTok data...').start();

  let data = null;
  let apiVersion;

  try {
    // Try the new TikTok-API-DL first (supports images)
    try {
      spinner.text = ' Fetching TikTok data (enhanced API)...';
      const result = await TiktokDL.Downloader(url, { version: "v1" });

      if (result && result.status === 'success' && result.result) {
        const rawData = result.result;

        // Normalize the response to our format
        data = {
          title: rawData.title || rawData.desc || null,
          thumbnail: rawData.cover || rawData.dynamicCover || null,
          author: rawData.author?.nickname || rawData.author?.unique_id || null,
          downloads: {
            video: [],
            audio: [],
            images: []
          },
          metadata: {
            audio_title: rawData.music?.title || rawData.music_info?.title || null
          }
        };

        // Handle images (photo posts)
        if (rawData.images && Array.isArray(rawData.images) && rawData.images.length > 0) {
          data.downloads.images = rawData.images.map((imgUrl, index) => ({
            url: imgUrl,
            text: `Photo ${index + 1}`,
            quality: 'HD'
          }));
        }

        // Handle video
        if (rawData.video) {
          // Add different quality options if available
          if (rawData.video.noWatermark) {
            data.downloads.video.push({
              url: rawData.video.noWatermark,
              text: 'HD Video (No Watermark)',
              quality: 'HD'
            });
          }
          if (rawData.video.watermark) {
            data.downloads.video.push({
              url: rawData.video.watermark,
              text: 'SD Video (Watermark)',
              quality: 'SD'
            });
          }
          // Fallback to array format
          if (Array.isArray(rawData.video)) {
            rawData.video.forEach((v, i) => {
              data.downloads.video.push({
                url: v,
                text: `Video ${i + 1}`,
                quality: 'HD'
              });
            });
          }
        }

        // Handle audio/music
        if (rawData.music?.play_url || rawData.music_info?.play) {
          data.downloads.audio.push({
            url: rawData.music?.play_url || rawData.music_info?.play,
            text: 'Download MP3',
            quality: 'Audio'
          });
        }

        apiVersion = 'tiktok-api-dl';
      } else {
        throw new Error('Enhanced API returned invalid response');
      }
    } catch (enhancedError) {
      // Fallback to original API
      spinner.text = ' Fetching TikTok data (fallback API)...';
      try {
        const response = await axios.get(`${getApi.tiktok}${encodeURIComponent(url)}`, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
          }
        });

        if (response.data && response.data.status && response.data.data) {
          data = normalizer.normalizeTikTok(response.data.data, 'primary');
          apiVersion = 'default';
        } else {
          const errorMsg = response.data?.message || 'Invalid default response';
          throw new Error(errorMsg);
        }
      } catch (defaultError) {
        spinner.text = ' Fetching TikTok data (v1 fallback)...';
        const response = await axios.get(`${getApi.tiktokV1}${encodeURIComponent(url)}`, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
          }
        });

        if (response.data && response.data.status && response.data.data) {
          data = normalizer.normalizeTikTok(response.data.data, 'v1');
          apiVersion = 'v1';
        } else {
          const errorMsg = response.data?.message || defaultError.message || 'All APIs failed';
          throw new Error(errorMsg);
        }
      }
    }

    if (!data || (!data.downloads.video.length && !data.downloads.audio.length && !data.downloads.images.length)) {
      spinner.fail(chalk.red(' Failed to fetch TikTok data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }

    // Determine content type
    const isPhotoPost = data.downloads.images.length > 0 && data.downloads.video.length === 0;
    const contentType = isPhotoPost ? 'Photo Post' : 'Video';

    spinner.succeed(chalk.green(` TikTok ${contentType.toLowerCase()} data fetched successfully! (using ${apiVersion})`));
    console.log('');
    console.log(chalk.cyan(` ${contentType} Information:`));
    console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.title || 'No title'}`));
    if (data.author) {
      console.log(chalk.gray('   • ') + chalk.white(`Author: ${data.author}`));
    }
    if (isPhotoPost && data.downloads.images.length > 1) {
      console.log(chalk.gray('   • ') + chalk.white(`Images: ${data.downloads.images.length} photos`));
    }
    if (data.metadata.audio_title) {
      console.log(chalk.gray('   • ') + chalk.white(`Audio: ${data.metadata.audio_title}`));
    }
    console.log('');

    const allDownloads = [...data.downloads.video, ...data.downloads.audio];
    const downloadChoices = allDownloads.map((item, index) => ({
      name: ` ${item.text || item.quality || 'Download'}`,
      value: { url: item.url, text: item.text || item.quality, index, type: 'single' }
    }));

    // Add individual image options
    if (data.downloads.images.length > 0) {
      data.downloads.images.forEach((item, index) => {
        downloadChoices.push({
          name: ` Photo ${index + 1}${item.text ? ` - ${item.text}` : ''}`,
          value: { url: item.url, text: `Photo ${index + 1}`, index, type: 'image' }
        });
      });

      // Add "Download All Images" option if there are multiple images
      if (data.downloads.images.length > 1) {
        downloadChoices.unshift({
          name: chalk.green(` Download All Images (${data.downloads.images.length} photos)`),
          value: { type: 'all_images', images: data.downloads.images, count: data.downloads.images.length }
        });
      }
    }

    downloadChoices.push({
      name: chalk.gray(' Cancel'),
      value: 'cancel'
    });

    const { selectedDownload } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedDownload',
        message: 'Select download option:',
        choices: downloadChoices
      }
    ]);

    if (selectedDownload === 'cancel') {
      console.log(chalk.yellow('\n Download cancelled.'));
      return;
    }

    // Handle downloading all images
    if (selectedDownload.type === 'all_images') {
      console.log(chalk.cyan(`\n Downloading ${selectedDownload.count} images...`));
      const timestamp = Date.now();
      let successCount = 0;

      for (let i = 0; i < selectedDownload.images.length; i++) {
        const image = selectedDownload.images[i];
        const downloadSpinner = ora(` Downloading photo ${i + 1}/${selectedDownload.count}...`).start();
        const filename = `tiktok_${timestamp}_photo_${i + 1}.jpg`;

        try {
          await downloadFile(image.url, filename, downloadSpinner, basePath);
          successCount++;
        } catch (error) {
          downloadSpinner.fail(chalk.red(` Failed to download photo ${i + 1}`));
        }
      }

      console.log(chalk.green(`\n Successfully downloaded ${successCount}/${selectedDownload.count} images!`));
      return;
    }

    // Handle single download
    const downloadSpinner = ora(` Downloading ${selectedDownload.text}...`).start();
    let extension = 'mp4';

    if (selectedDownload.text.toLowerCase().includes('mp3')) {
      extension = 'mp3';
    } else if (selectedDownload.type === 'image') {
      extension = 'jpg';
    }

    const filename = `tiktok_${Date.now()}.${extension}`;
    await downloadFile(selectedDownload.url, filename, downloadSpinner, basePath);
  } catch (error) {
    spinner.fail(chalk.red(' Error fetching TikTok content'));
    if (error.code === 'ECONNABORTED') {
      console.log(chalk.gray(' • Request timeout - please try again'));
    } else if (error.response) {
      console.log(chalk.gray(` • API Error: ${error.response.status}`));
    } else if (error.request) {
      console.log(chalk.gray(' • Network error - please check your connection'));
    } else {
      console.log(chalk.gray(` • ${error.message}`));
    }
  }
}

module.exports = { downloadTikTok };
