const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { getApi } = require('./api');
const { downloadFile, MAX_FILE_SIZE } = require('../utils/download');

async function downloadSpotify(url, basePath = 'resultdownload_preniv') {
  const spinner = ora(' Fetching Spotify track data...').start();
  
  try {
    let response;
    let data;
    let apiUsed = 'default';

    try {
      response = await axios.get(`${getApi.spotify}${encodeURIComponent(url)}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
        }
      });
      data = response.data;
    } catch (error) {
      spinner.text = ' Trying alternative API...';
      response = await axios.get(`${getApi.spotifyV2}${encodeURIComponent(url)}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
        }
      });
      data = response.data;
      apiUsed = 'v2';
    }

    if (!data || !data.status) {
      spinner.fail(chalk.red(' Failed to fetch Spotify track data'));
      console.log(chalk.gray('   • The API returned an error or invalid response'));
      return;
    }

    let trackInfo, downloadUrl, coverUrl;

    if (apiUsed === 'default') {
      if (!data.data || !data.data.download) {
        spinner.fail(chalk.red(' Invalid track data received'));
        console.log(chalk.gray('   • The track may be unavailable'));
        return;
      }
      trackInfo = {
        title: data.data.title || 'No title',
        artist: data.data.artis || 'Unknown artist',
        duration: data.data.durasi ? `${Math.floor(data.data.durasi / 1000)}s` : null,
        type: data.data.type
      };
      downloadUrl = data.data.download;
      coverUrl = data.data.image;
    } else {
      if (!data.data || !data.data.mp3DownloadLink) {
        spinner.fail(chalk.red(' Invalid track data received'));
        console.log(chalk.gray('   • The track may be unavailable'));
        return;
      }
      trackInfo = {
        title: data.data.songTitle || 'No title',
        artist: data.data.artist || 'Unknown artist',
        description: data.data.description
      };
      downloadUrl = data.data.mp3DownloadLink;
      coverUrl = data.data.coverDownloadLink;
    }

    spinner.succeed(chalk.green(` Spotify track data fetched successfully! (${apiUsed} API)`));
    console.log('');
    console.log(chalk.cyan(' Track Information:'));
    console.log(chalk.gray('   • ') + chalk.white(`Title: ${trackInfo.title}`));
    console.log(chalk.gray('   • ') + chalk.white(`Artist: ${trackInfo.artist}`));
    if (trackInfo.duration) {
      console.log(chalk.gray('   • ') + chalk.white(`Duration: ${trackInfo.duration}`));
    }
    if (trackInfo.description) {
      console.log(chalk.gray('   • ') + chalk.white(`Description: ${trackInfo.description}`));
    }
    console.log('');

    const downloadChoices = [
      {
        name: ' Download MP3',
        value: { url: downloadUrl, type: 'audio' }
      },
      {
        name: ' Download Cover Image',
        value: { url: coverUrl, type: 'image' }
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
    const filename = `${trackInfo.title}_${selectedDownload.type}_${Date.now()}.${extension}`;
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
