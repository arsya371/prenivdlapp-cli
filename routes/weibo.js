const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi } = require('./api');
const { downloadFile } = require('../utils/download');
const { fetchJson, handleError, generateFilename, getSelectedOption, buildDownloadChoices } = require('../utils/functions');

async function downloadWeibo(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching Weibo media data...').start();
  
  try {
    const data = await fetchJson(`${getApi.weibo}${encodeURIComponent(url)}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
      }
    });

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch Weibo media data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }
    if (!data.data) {
      spinner.fail(chalk.red(' Invalid media data received'));
      console.log(chalk.gray('   • The post may be private or unavailable'));
      return;
    }

    spinner.succeed(chalk.green(' Weibo media data fetched successfully!'));
    console.log('');
    console.log(chalk.cyan(' Post Information:'));
    if (data.data.title && data.data.title.trim()) {
      console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.data.title}`));
    }
    console.log(chalk.gray('   • ') + chalk.white(`Has Video: ${data.data.hasVideo ? 'Yes' : 'No'}`));
    console.log(chalk.gray('   • ') + chalk.white(`Has Images: ${data.data.hasAtlas ? 'Yes' : 'No'}`));
    console.log('');

    const hasImages = data.data.hasAtlas && data.data.original && data.data.original.atlas && data.data.original.atlas.length > 0;
    const hasVideo = data.data.hasVideo;

    if (!hasVideo && !hasImages) {
      console.log(chalk.yellow(' No downloadable media found in this post.'));
      return;
    }

    const videos = hasVideo ? [{ url: data.data.original.videoUrl }] : [];
    const downloadChoices = buildDownloadChoices('weibo', { 
      hasVideo, 
      videos, 
      images: hasImages ? data.data.original.atlas : [] 
    });
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

    if (selectedDownload === 'all') {
      let downloadIndex = 0;
      const totalItems = (hasVideo ? 1 : 0) + (hasImages ? data.data.original.atlas.length : 0);
      
      if (hasVideo) {
        downloadIndex++;
        const downloadSpinner = ora(` Downloading video (${downloadIndex}/${totalItems})...`).start();
        const options = getSelectedOption('weibo', { url: data.data.original.videoUrl, type: 'video' });
        const filename = generateFilename('weibo', { type: 'video' });
        await downloadFile(options.url, filename, downloadSpinner, basePath);
      }
      
      if (hasImages) {
        for (let i = 0; i < data.data.original.atlas.length; i++) {
          downloadIndex++;
          const image = data.data.original.atlas[i];
          const downloadSpinner = ora(` Downloading image ${i + 1} (${downloadIndex}/${totalItems})...`).start();
          const options = getSelectedOption('weibo', { url: image, type: 'image' });
          const filename = generateFilename('weibo', { type: 'image', index: i });
          await downloadFile(options.url, filename, downloadSpinner, basePath);
        }
      }
    } else {
      const downloadSpinner = ora(' Downloading media...').start();
      const options = getSelectedOption('weibo', selectedDownload);
      if (selectedDownload.type === 'video') {
        const filename = generateFilename('weibo', { type: 'video' });
        await downloadFile(options.url, filename, downloadSpinner, basePath);
      } else if (selectedDownload.type === 'image') {
        const filename = generateFilename('weibo', { type: 'image' });
        await downloadFile(options.url, filename, downloadSpinner, basePath);
      }
    }
  } catch (error) {
    handleError(error, spinner);
  }
}

module.exports = { downloadWeibo };
