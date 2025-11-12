const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi, normalizer } = require('./api');
const { downloadFile } = require('../utils/download');

async function downloadTikTok(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching TikTok video data...').start();
  
  let data = null;
  let apiVersion;
  
  try {
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
      spinner.text = ' Fetching TikTok video data (v1 fallback)...';
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
        const errorMsg = response.data?.message || defaultError.message || 'Both default and v1 APIs failed';
        throw new Error(errorMsg);
      }
    }

    if (!data || (!data.downloads.video.length && !data.downloads.audio.length && !data.downloads.image.length)) {
      spinner.fail(chalk.red(' Failed to fetch TikTok video data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }

    spinner.succeed(chalk.green(` TikTok video data fetched successfully! (using ${apiVersion})`));
    console.log('');
    console.log(chalk.cyan(' Video Information:'));
    console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.title || 'No title'}`));
    if (data.author) {
      console.log(chalk.gray('   • ') + chalk.white(`Author: ${data.author}`));
    }
    if (data.metadata.audio_title) {
      console.log(chalk.gray('   • ') + chalk.white(`Audio: ${data.metadata.audio_title}`));
    }
    console.log('');

    const downloadChoices = [];

    data.downloads.video.forEach((url, index) => {
      downloadChoices.push({
        name: ` Video ${index + 1}`,
        value: { url, text: `Video ${index + 1}`, type: 'video' }
      });
    });
    
    data.downloads.audio.forEach((url, index) => {
      downloadChoices.push({
        name: ` Audio ${index + 1}`,
        value: { url, text: `Audio ${index + 1}`, type: 'audio' }
      });
    });
    
    data.downloads.image.forEach((url, index) => {
      downloadChoices.push({
        name: ` Image ${index + 1}`,
        value: { url, text: `Image ${index + 1}`, type: 'image' }
      });
    });
    
    if (data.downloads.image.length > 1) {
      downloadChoices.push({
        name: ` Download All Images (${data.downloads.image.length})`,
        value: { urls: data.downloads.image, text: `All Images`, type: 'all-images' }
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
        message: 'Select download option:',
        choices: downloadChoices
      }
    ]);
    
    if (selectedDownload === 'cancel') {
      console.log(chalk.yellow('\n Download cancelled.'));
      return;
    }
    
    if (selectedDownload.type === 'all-images') {
      const downloadSpinner = ora(` Downloading all images...`).start();
      const timestamp = Date.now();
      
      for (let i = 0; i < selectedDownload.urls.length; i++) {
        const url = selectedDownload.urls[i];
        const urlLower = url.toLowerCase();
        let extension = 'jpg';
        
        if (urlLower.includes('.jpeg') || urlLower.includes('.jpg')) {
          extension = 'jpg';
        } else if (urlLower.includes('.png')) {
          extension = 'png';
        } else if (urlLower.includes('.webp')) {
          extension = 'webp';
        }
        
        const filename = `tiktok_${timestamp}_image_${i + 1}.${extension}`;
        await downloadFile(url, filename, downloadSpinner, basePath);
      }
      
      downloadSpinner.succeed(chalk.green(` Downloaded ${selectedDownload.urls.length} images successfully!`));
      return;
    }
    
    const downloadSpinner = ora(` Downloading ${selectedDownload.text}...`).start();
    let extension = 'mp4';
    if (selectedDownload.type === 'audio') {
      extension = 'mp3';
    } else if (selectedDownload.type === 'image') {
      const url = selectedDownload.url.toLowerCase();
      if (url.includes('.jpeg') || url.includes('.jpg')) {
        extension = 'jpg';
      } else if (url.includes('.png')) {
        extension = 'png';
      } else if (url.includes('.webp')) {
        extension = 'webp';
      }
    }
    const filename = `tiktok_${Date.now()}.${extension}`;
    await downloadFile(selectedDownload.url, filename, downloadSpinner, basePath);
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
