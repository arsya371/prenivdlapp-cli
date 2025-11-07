const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi } = require('./api');
const { downloadFile, MAX_FILE_SIZE } = require('../utils/download');

async function downloadSpotify(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching Spotify track data...').start();
  
  try {
    const response = await axios.get(`${getApi.spotify}${encodeURIComponent(url)}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
      }
    });
    const data = response.data;

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch Spotify track data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }
    if (!data.data || !data.data.mp3DownloadLink) {
      spinner.fail(chalk.red(' Invalid track data received'));
      console.log(chalk.gray('   • The track may be unavailable'));
      return;
    }

    spinner.succeed(chalk.green(' Spotify track data fetched successfully!'));
    console.log('');
    console.log(chalk.cyan(' Track Information:'));
    console.log(chalk.gray('   • ') + chalk.white(`Title: ${data.data.songTitle || 'No title'}`));
    console.log(chalk.gray('   • ') + chalk.white(`Artist: ${data.data.artist || 'Unknown artist'}`));
    if (data.data.description) {
      console.log(chalk.gray('   • ') + chalk.white(`Description: ${data.data.description}`));
    }
    console.log('');

    const downloadChoices = [
      {
        name: ' Download MP3',
        value: { url: data.data.mp3DownloadLink, type: 'audio' }
      },
      {
        name: ' Download Cover Image',
        value: { url: data.data.coverDownloadLink, type: 'image' }
      },
      {
        name: chalk.gray(' Cancel'),
        value: 'cancel'
      }
    ];

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

    const downloadSpinner = ora(` Downloading ${selectedDownload.type}...`).start();
    const extension = selectedDownload.type === 'audio' ? 'mp3' : 'jpg';
    const filename = `${data.data.songTitle || 'Spotify'}_${selectedDownload.type}_${Date.now()}.${extension}`;
    const maxSize = selectedDownload.type === 'audio' ? MAX_FILE_SIZE : null;
    await downloadFile(selectedDownload.url, filename, downloadSpinner, basePath, maxSize);
    
  } catch (error) {
    spinner.fail(chalk.red(' Error fetching Spotify track'));
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

module.exports = { downloadSpotify };
