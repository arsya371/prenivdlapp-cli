const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi } = require('./api');
const { downloadFile } = require('../utils/download');

async function downloadTikTok(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching TikTok video data...').start();
  
  let data = null;
  let apiVersion;
  
  try {
    try {
      spinner.text = ' Fetching TikTok video data (v2)...';
      const response = await axios.get(`${getApi.tiktok}${encodeURIComponent(url)}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
        }
      });
      
      if (response.data && response.data.status && response.data.data && response.data.data.urls && response.data.data.urls.length > 0) {
        data = response.data;
        apiVersion = 'v2';
      } else {
        throw new Error('Invalid v2 response');
      }
    } catch (v2Error) {
      spinner.text = ' Fetching TikTok video data (v1 fallback)...';
      const response = await axios.get(`${getApi.tiktokV1}${encodeURIComponent(url)}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
        }
      });
      
      if (response.data && response.data.status && response.data.data && response.data.data.download && response.data.data.download.video) {
        data = response.data;
        apiVersion = 'v1';
      } else {
        throw new Error('Both v2 and v1 APIs failed');
      }
    }

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch TikTok video data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }

    spinner.succeed(chalk.green(` TikTok video data fetched successfully! (using ${apiVersion})`));
    console.log('');
    console.log(chalk.cyan(' Video Information:'));
    
    if (apiVersion === 'v2') {
      console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.data.metadata.title || 'No title'}`));
      console.log(chalk.gray('   • ') + chalk.white(`Description: ${data.data.metadata.description || 'No description'}`));
      console.log(chalk.gray('   • ') + chalk.white(`Creator: ${data.data.metadata.creator || 'Unknown'}`));
      console.log('');

      const downloadChoices = data.data.urls.map((videoUrl, index) => ({
        name: ` Video Quality ${index + 1}`,
        value: { url: videoUrl, type: 'video', index }
      }));
      
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
      
      const downloadSpinner = ora(' Downloading video...').start();
      const filename = `tiktok_video_${Date.now()}.mp4`;
      await downloadFile(selectedDownload.url, filename, downloadSpinner, basePath);
    } else {
      console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.data.metadata.title || 'No title'}`));
      console.log(chalk.gray('   • ') + chalk.white(`Description: ${data.data.metadata.description || 'No description'}`));
      console.log(chalk.gray('   • ') + chalk.white(`Likes: ${data.data.metadata.stats.likeCount || 0}`));
      console.log(chalk.gray('   • ') + chalk.white(`Views: ${data.data.metadata.stats.playCount || 0}`));
      console.log(chalk.gray('   • ') + chalk.white(`Comments: ${data.data.metadata.stats.commentCount || 0}`));
      console.log(chalk.gray('   • ') + chalk.white(`Shares: ${data.data.metadata.stats.shareCount || 0}`));
      console.log('');

      if (data.data.metadata.hashtags && data.data.metadata.hashtags.length > 0) {
        console.log(chalk.gray('   • ') + chalk.white(`Hashtags: ${data.data.metadata.hashtags.join(', ')}`));
        console.log('');
      }
      
      const downloadChoices = data.data.download.video.map((videoUrl, index) => ({
        name: ` Video Quality ${index + 1}`,
        value: { url: videoUrl, type: 'video', index }
      }));
      
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
      
      const downloadSpinner = ora(' Downloading video...').start();
      const filename = `tiktok_video_${Date.now()}.mp4`;
      await downloadFile(selectedDownload.url, filename, downloadSpinner, basePath);
    }
  } catch (error) {
    spinner.fail(chalk.red(' Error fetching TikTok video'));
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
