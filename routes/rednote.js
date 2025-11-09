const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi } = require('./api');
const { downloadFile } = require('../utils/download');

async function downloadRedNote(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching RedNote/Xiaohongshu media data...').start();
  
  try {
    const response = await axios.get(`${getApi.rednote}${encodeURIComponent(url)}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
      }
    });
    const data = response.data;

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch RedNote media data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }
    if (!data.data) {
      spinner.fail(chalk.red(' Invalid media data received'));
      console.log(chalk.gray('   • The post may be private or unavailable'));
      return;
    }

    spinner.succeed(chalk.green(' RedNote media data fetched successfully!'));
    console.log('');
    console.log(chalk.cyan(' Post Information:'));
    if (data.data.title && data.data.title.trim()) {
      console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.data.title}`));
    }
    if (data.data.nickname && data.data.nickname.trim()) {
      console.log(chalk.gray('   • ') + chalk.white(`Creator: ${data.data.nickname}`));
    }
    if (data.data.desc && data.data.desc.trim()) {
      console.log(chalk.gray('   • ') + chalk.white(`Description: ${data.data.desc}`));
    }
    if (data.data.duration) {
      console.log(chalk.gray('   • ') + chalk.white(`Duration: ${data.data.duration}`));
    }
    if (data.data.engagement) {
      console.log(chalk.gray('   • ') + chalk.white(`Likes: ${data.data.engagement.likes} | Comments: ${data.data.engagement.comments} | Collects: ${data.data.engagement.collects}`));
    }
    console.log('');

    const hasVideos = data.data.downloads && data.data.downloads.length > 0;
    const hasImages = data.data.images && data.data.images.length > 0;

    if (!hasVideos && !hasImages) {
      console.log(chalk.yellow(' No downloadable media found in this post.'));
      return;
    }

    const downloadChoices = [];
    if (hasVideos) {
      data.data.downloads.forEach((video, index) => {
        downloadChoices.push({
          name: ` Video - ${video.quality}`,
          value: { type: 'video', data: video, index }
        });
      });
    }

    if (hasImages) {
      data.data.images.forEach((image, index) => {
        downloadChoices.push({
          name: ` Image ${index + 1}`,
          value: { type: 'image', data: image, index }
        });
      });
    }

    if (downloadChoices.length > 1) {
      downloadChoices.push({
        name: ' Download All',
        value: 'all'
      });
    }

    downloadChoices.push({
      name: chalk.gray(' Cancel'),
      value: 'cancel'
    });

    const { selectedDownload } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedDownload',
        message: 'Select media to download:',
        choices: downloadChoices
      }
    ]);

    if (selectedDownload === 'cancel') {
      console.log(chalk.yellow('\n Download cancelled.'));
      return;
    }

    if (selectedDownload === 'all') {
      let downloadIndex = 0;
      const totalItems = (hasVideos ? data.data.downloads.length : 0) + (hasImages ? data.data.images.length : 0);
      if (hasVideos) {
        for (let i = 0; i < data.data.downloads.length; i++) {
          downloadIndex++;
          const video = data.data.downloads[i];
          const downloadSpinner = ora(` Downloading video ${video.quality} (${downloadIndex}/${totalItems})...`).start();
          const safeQuality = video.quality.replace(/[^a-zA-Z0-9]/g, '_');
          const filename = `rednote_video_${safeQuality}_${Date.now()}_${i}.mp4`;
          await downloadFile(video.url, filename, downloadSpinner, basePath);
        }
      }
      
      if (hasImages) {
        for (let i = 0; i < data.data.images.length; i++) {
          downloadIndex++;
          const image = data.data.images[i];
          const downloadSpinner = ora(` Downloading image ${i + 1} (${downloadIndex}/${totalItems})...`).start();
          const filename = `rednote_image_${Date.now()}_${i}.jpg`;
          await downloadFile(image, filename, downloadSpinner, basePath);
        }
      }
    } else {
      const downloadSpinner = ora(' Downloading media...').start();
      if (selectedDownload.type === 'video') {
        const video = selectedDownload.data;
        const safeQuality = video.quality.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `rednote_video_${safeQuality}_${Date.now()}.mp4`;
        await downloadFile(video.url, filename, downloadSpinner, basePath);
      } else if (selectedDownload.type === 'image') {
        const image = selectedDownload.data;
        const filename = `rednote_image_${Date.now()}.jpg`;
        await downloadFile(image, filename, downloadSpinner, basePath);
      }
    }
  } catch (error) {
    spinner.fail(chalk.red(' Error fetching RedNote media'));
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

module.exports = { downloadRedNote };
