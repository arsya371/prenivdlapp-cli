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

    const { title, author, username, videoUrl, stats, meta } = data.data;
    const hasVideo = !!videoUrl;

    spinner.succeed(chalk.green(' Weibo media data fetched successfully!'));
    console.log('');
    console.log(chalk.cyan(' Post Information:'));
    if (title && title.trim()) {
      console.log(chalk.gray('   • ') + chalk.white(`Title: ${title}`));
    }
    if (author) console.log(chalk.gray('   • ') + chalk.white(`Author: ${author}`));
    if (username) console.log(chalk.gray('   • ') + chalk.white(`Username: ${username}`));
    if (stats) {
      console.log(chalk.gray('   • ') + chalk.white(`Views: ${stats.viewCount?.toLocaleString() || 0}`));
      console.log(chalk.gray('   • ') + chalk.white(`Likes: ${stats.likeCount?.toLocaleString() || 0}`));
      console.log(chalk.gray('   • ') + chalk.white(`Comments: ${stats.commentCount?.toLocaleString() || 0}`));
    }
    console.log(chalk.gray('   • ') + chalk.white(`Has Video: ${hasVideo ? 'Yes' : 'No'}`));
    console.log('');

    if (!hasVideo) {
      console.log(chalk.yellow(' No downloadable media found in this post.'));
      return;
    }

    const downloadChoices = buildDownloadChoices('weibo', {
      hasVideo,
      videos: hasVideo ? [{ url: videoUrl }] : [],
      images: []
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

    const downloadSpinner = ora(' Downloading media...').start();
    const options = getSelectedOption('weibo', { url: videoUrl, type: 'video' });
    const filename = generateFilename('weibo', { type: 'video' });
    await downloadFile(options.url, filename, downloadSpinner, basePath);

  } catch (error) {
    handleError(error, spinner);
  }
}

module.exports = { downloadWeibo };
