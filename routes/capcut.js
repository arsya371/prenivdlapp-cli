const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi } = require('./api');
const { downloadFile } = require('../utils/download');

async function downloadCapcut(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching CapCut video data...').start();
  
  try {
    const response = await axios.get(`${getApi.capcut}${encodeURIComponent(url)}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
      }
    });
    const data = response.data;

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch CapCut video data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }
    if (!data.data || !data.data.medias || data.data.medias.length === 0) {
      spinner.fail(chalk.red(' Invalid video data received'));
      console.log(chalk.gray('   • The video may be private or unavailable'));
      return;
    }

    spinner.succeed(chalk.green(' CapCut video data fetched successfully!'));
    console.log('');
    console.log(chalk.cyan(' Video Information:'));
    console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.data.title || 'No title'}`));
    console.log(chalk.gray('   • ') + chalk.white(`Author: ${data.data.author || 'Unknown'}`));
    console.log(chalk.gray('   • ') + chalk.white(`Duration: ${Math.floor(data.data.duration / 1000)}s`));
    console.log(chalk.gray('   • ') + chalk.white(`ID: ${data.data.id}`));
    console.log('');

    if (data.data.medias.length === 1) {
      const media = data.data.medias[0];
      const downloadSpinner = ora(` Downloading ${media.quality}...`).start();
      const filename = `capcut_${data.data.unique_id}_${Date.now()}.${media.extension}`;
      await downloadFile(media.url, filename, downloadSpinner, basePath);
    } else {
      const downloadChoices = data.data.medias.map((media, index) => ({
        name: ` ${media.quality}`,
        value: { url: media.url, quality: media.quality, extension: media.extension, index }
      }));
      
      downloadChoices.push({
        name: chalk.gray(' Cancel'),
        value: 'cancel'
      });

      const { selectedDownload } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedDownload',
          message: 'Select quality to download:',
          choices: downloadChoices
        }
      ]);

      if (selectedDownload === 'cancel') {
        console.log(chalk.yellow('\n Download cancelled.'));
        return;
      }

      const downloadSpinner = ora(` Downloading ${selectedDownload.quality}...`).start();
      const filename = `capcut_${data.data.unique_id}_${selectedDownload.quality.replace(/\s+/g, '_')}_${Date.now()}.${selectedDownload.extension}`;
      await downloadFile(selectedDownload.url, filename, downloadSpinner, basePath);
    }
  } catch (error) {
    spinner.fail(chalk.red(' Error fetching CapCut video'));
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

module.exports = { downloadCapcut };
