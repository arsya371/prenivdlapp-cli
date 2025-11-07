const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const MAX_FILE_SIZE = 35 * 1024 * 1024; // 50 MB in bytes

async function checkFileSize(url) {
  try {
    const response = await axios.head(url, { timeout: 10000 });
    const contentLength = parseInt(response.headers['content-length'], 10);
    return {
      size: contentLength,
      sizeInMB: (contentLength / (1024 * 1024)).toFixed(2),
      exceedsLimit: contentLength > MAX_FILE_SIZE
    };
  } catch (error) {
    return null;
  }
}

async function downloadFile(url, filename, spinner, basePath = 'resultdownload_preniv', maxSize = null) {
  try {
    if (maxSize) {
      const sizeInfo = await checkFileSize(url);
      if (sizeInfo && sizeInfo.exceedsLimit) {
        spinner.fail(chalk.red(`File size (${sizeInfo.sizeInMB} MB) exceeds maximum limit of ${maxSize / (1024 * 1024)} MB`));
        console.log(chalk.gray('   • This file is too large to download'));
        return null;
      }
      if (sizeInfo) {
        spinner.text = ` Downloading (${sizeInfo.sizeInMB} MB)...`;
      }
    }

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
    const fullPath = path.join(basePath, filename);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        spinner.succeed(chalk.green(`Downloaded: ${fullPath}`));
        resolve(fullPath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    spinner.fail(chalk.red(`Failed to download`));
    throw error;
  }
}

module.exports = { downloadFile, checkFileSize, MAX_FILE_SIZE };
