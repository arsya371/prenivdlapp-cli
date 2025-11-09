const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { getApi } = require('./api');
const { downloadFile } = require('../utils/download');

async function downloadBluesky(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching Bluesky post data...').start();
  
  try {
    const response = await axios.get(`${getApi.bluesky}${encodeURIComponent(url)}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
      }
    });
    const data = response.data;

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch Bluesky post data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }
    if (!data.data || !data.data.downloadLink) {
      spinner.fail(chalk.red(' Invalid post data received'));
      console.log(chalk.gray('   • The post may be private or unavailable'));
      return;
    }

    spinner.succeed(chalk.green(' Bluesky post data fetched successfully!'));
    console.log('');
    console.log(chalk.cyan(' Post Information:'));
    if (data.data.profile) {
      console.log(chalk.gray('   • ') + chalk.white(`Author: ${data.data.profile.name} (${data.data.profile.handle})`));
    }
    if (data.data.caption && data.data.caption.trim()) {
      const shortCaption = data.data.caption.length > 100 
        ? data.data.caption.substring(0, 100) + '...' 
        : data.data.caption;
      console.log(chalk.gray('   • ') + chalk.white(`Caption: ${shortCaption}`));
    }
    
    const mediaType = data.data.videoUrl ? 'video' : 'image';
    console.log(chalk.gray('   • ') + chalk.white(`Media Type: ${mediaType}`));
    console.log('');

    const downloadSpinner = ora(` Downloading ${mediaType}...`).start();
    const extension = mediaType === 'video' ? 'mp4' : 'jpg';
    const handle = data.data.profile?.handle?.replace(/[@.]/g, '_') || 'bluesky';
    const filename = `bluesky_${handle}_${Date.now()}.${extension}`;
    
    await downloadFile(data.data.downloadLink, filename, downloadSpinner, basePath);
    
  } catch (error) {
    spinner.fail(chalk.red(' Error fetching Bluesky post'));
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

module.exports = { downloadBluesky };
