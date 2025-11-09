const chalk = require('chalk');
const readline = require('readline');
const { showBanner, showProcessing, showHelp, showStatusFooter } = require('./helpers');
const { downloadTikTok } = require('../routes/tiktok');
const { downloadFacebook } = require('../routes/facebook');
const { downloadInstagram } = require('../routes/instagram');
const { downloadTwitter } = require('../routes/twitter');
const { downloadDouyin } = require('../routes/douyin');
const { downloadSpotify } = require('../routes/spotify');
const { downloadPinterest } = require('../routes/pinterest');
const { downloadAppleMusic } = require('../routes/applemusic');
const { downloadYouTube } = require('../routes/youtube');
const { downloadCapcut } = require('../routes/capcut');

const major = parseInt(process.versions.node.split('.')[0], 10);
if (major < 20) {
  console.error(chalk.red(
    `\n❌ This script requires Node.js 20+ to run reliably.\n` +
    `   You are using Node.js ${process.versions.node}.\n` +
    `   Please upgrade to Node.js 20+ to proceed.\n`
  ));
  process.exit(1);
}

let currentDownloadPath = 'resultdownload_preniv';

async function processUserInput(input) {
  const trimmedInput = input.trim();
  
  if (trimmedInput.startsWith('/')) {
    const command = trimmedInput.slice(1).toLowerCase();
    switch (command) {
      case 'help':
        console.clear();
        showHelp();
        return true;
      case 'quit':
      case 'exit':
        console.log(chalk.gray('\n Thanks for using PRENIVDL CLI! 👋'));
        showStatusFooter();
        return false;
      case 'clear':
        console.clear();
        showBanner();
        return true;
      case 'path':
        console.log('');
        console.log(chalk.cyan(' Current download path: ') + chalk.white(currentDownloadPath));
        console.log(chalk.gray(' Use /setpath <new_path> to change download location'));
        console.log('');
        return true;
      case 'setpath':
        const parts = trimmedInput.split(' ');
        if (parts.length < 2 || parts[1].trim() === '') {
          console.log('');
          console.log(chalk.red(' Please provide a path. Usage: /setpath <directory_name>'));
          console.log('');
        } else {
          const newPath = parts.slice(1).join(' ').trim();
          currentDownloadPath = newPath;
          console.log('');
          console.log(chalk.green(` Download path set to: ${newPath}`));
          console.log('');
        }
        return true;
      default:
        console.log(chalk.red(` Unknown command: /${command}`));
        console.log(chalk.gray(' Type /help for available commands.'));
        showStatusFooter();
        return true;
    }
  }
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = trimmedInput.match(urlRegex);
  
  if (urls && urls.length > 0) {
    const url = urls[0];
    let platform = '';
    let hostname = '';
    
    try {
      const urlObj = new URL(url);
      hostname = urlObj.hostname.toLowerCase();
    } catch (error) {
      console.log('');
      console.log(chalk.red(' • Invalid URL format.'));
      showStatusFooter();
      return true;
    }
    
    if (hostname.endsWith('tiktok.com') || hostname === 'tiktok.com') {
      platform = 'TikTok';
      showProcessing('Fetching', ` Analyzing ${platform} video...`);
      await downloadTikTok(url, currentDownloadPath);
    } else if (hostname.endsWith('facebook.com') || hostname === 'facebook.com' || hostname.endsWith('fb.watch') || hostname === 'fb.watch') {
      platform = 'Facebook';
      showProcessing('Fetching', ` Analyzing ${platform} video...`);
      await downloadFacebook(url, currentDownloadPath);
    } else if (hostname.endsWith('instagram.com') || hostname === 'instagram.com') {
      platform = 'Instagram';
      showProcessing('Fetching', ` Analyzing ${platform} media...`);
      await downloadInstagram(url, currentDownloadPath);
    } else if (hostname.endsWith('twitter.com') || hostname === 'twitter.com' || hostname === 'x.com') {
      platform = 'Twitter';
      showProcessing('Fetching', ` Analyzing ${platform} video...`);
      await downloadTwitter(url, currentDownloadPath);
    } else if (hostname.endsWith('douyin.com') || hostname === 'douyin.com') {
      platform = 'Douyin';
      showProcessing('Fetching', ` Analyzing ${platform} video...`);
      await downloadDouyin(url, currentDownloadPath);
    } else if (hostname.endsWith('spotify.com') || hostname === 'spotify.com') {
      platform = 'Spotify';
      showProcessing('Fetching', ` Analyzing ${platform} track...`);
      await downloadSpotify(url, currentDownloadPath);
    } else if (hostname.endsWith('pinterest.com') || hostname === 'pinterest.com' || hostname.endsWith('pin.it') || hostname === 'pin.it') {
      platform = 'Pinterest';
      showProcessing('Fetching', ` Analyzing ${platform} pin...`);
      await downloadPinterest(url, currentDownloadPath);
    } else if (hostname.endsWith('apple.com') && url.includes('music.apple.com')) {
      platform = 'Apple Music';
      showProcessing('Fetching', ` Analyzing ${platform} track...`);
      await downloadAppleMusic(url, currentDownloadPath);
    } else if (hostname.endsWith('youtube.com') || hostname === 'youtube.com' || hostname.endsWith('youtu.be') || hostname === 'youtu.be') {
      platform = 'YouTube';
      showProcessing('Fetching', ` Analyzing ${platform} video...`);
      await downloadYouTube(url, currentDownloadPath);
    } else if (hostname.endsWith('capcut.com') || hostname === 'capcut.com') {
      platform = 'CapCut';
      showProcessing('Fetching', ` Analyzing ${platform} video...`);
      await downloadCapcut(url, currentDownloadPath);
    } else {
      console.log('');
      console.log(chalk.red(' • Unsupported platform. Please provide TikTok, Facebook, Instagram, Twitter, Douyin, Spotify, Pinterest, Apple Music, YouTube, or CapCut URLs.'));
      showStatusFooter();
    }
  } else {
    console.log('');
    console.log(chalk.gray(' • Please provide a social media URL to download from.'));
    console.log(chalk.gray(' • Supported platforms: TikTok, Facebook, Instagram, Twitter, Douyin, Spotify, Pinterest, Apple Music, YouTube, CapCut'));
    showStatusFooter();
  }
  
  return true;
}

async function startInteractive() {
  console.clear();
  showBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  while (true) {
    try {
      const input = await new Promise((resolve) => {
        rl.question(chalk.cyan('prenivdlapp ') + chalk.magenta('» '), (answer) => {
          resolve(answer);
        });
      });

      const shouldContinue = await processUserInput(input);
      if (!shouldContinue) {
        rl.close();
        break;
      }

      console.log('');
    } catch (error) {
      console.log('');
      console.log(chalk.red(` • An error occurred: ${error.message}`));
      rl.close();
      break;
    }
  }
}

module.exports = {
  startInteractive,
  currentDownloadPath
};