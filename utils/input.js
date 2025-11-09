const chalk = require('chalk');
const readline = require('readline');
const { showBanner, showProcessing, showHelp, showStatusFooter } = require('./helpers');
const { PLATFORM_CONFIG, matchPlatform } = require('./config');

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
        showBanner();
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
        showBanner();
        console.log('');
        console.log(chalk.cyan(' Current download path: ') + chalk.white(currentDownloadPath));
        console.log(chalk.gray(' Use /setpath <new_path> to change download location'));
        console.log('');
        return true;
      case 'setpath':
        showBanner();
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
      case 'platform':
      case 'platforms':
        showBanner();
        console.log('');
        console.log(chalk.cyan(' Supported Platforms:'));
        console.log('');
        PLATFORM_CONFIG.forEach((platform, index) => {
          const domainsText = platform.domains.join(', ');
          const aliasText = platform.alias ? chalk.gray(` (alias: ${platform.alias})`) : '';
          console.log(chalk.gray(`   ${index + 1}. `) + chalk.white(platform.name) + aliasText);
          console.log(chalk.gray(`      Domains: ${domainsText}`));
          console.log(chalk.gray(`      Command: ${platform.command}`));
          if (platform.exampleUrl) {
            console.log(chalk.gray(`      Example: ${platform.exampleUrl}`));
          }
          console.log('');
        });
        showStatusFooter();
        return true;
      case 'tutor':
      case 'tutorial':
        showBanner();
        console.log('');
        console.log(chalk.cyan(' Quick Tutorial:'));
        console.log('');
        console.log(chalk.white(' 1. Interactive Mode (Current):'));
        console.log(chalk.gray('    • Just paste any supported URL and press Enter'));
        console.log(chalk.gray('    • The app will auto-detect the platform'));
        console.log(chalk.gray('    • Follow the prompts to select quality/format'));
        console.log('');
        console.log(chalk.white(' 2. Command Line Mode:'));
        console.log(chalk.gray('    • Use: ') + chalk.cyan('node index.js <platform> <url>'));
        console.log(chalk.gray('    • Example: ') + chalk.cyan('node index.js tiktok https://tiktok.com/@user/video/123'));
        console.log(chalk.gray('    • With alias: ') + chalk.cyan('node index.js ig https://instagram.com/p/ABC/'));
        console.log('');
        console.log(chalk.white(' 3. Custom Download Path:'));
        console.log(chalk.gray('    • Interactive: ') + chalk.magenta('/setpath my_downloads'));
        console.log(chalk.gray('    • Command: ') + chalk.cyan('node index.js -p my_downloads tiktok <url>'));
        console.log('');
        console.log(chalk.white(' 4. Available Commands:'));
        console.log(chalk.gray('    • ') + chalk.magenta('/help') + chalk.gray(' - Show all commands'));
        console.log(chalk.gray('    • ') + chalk.magenta('/platform') + chalk.gray(' - List all supported platforms'));
        console.log(chalk.gray('    • ') + chalk.magenta('/path') + chalk.gray(' - Show current download path'));
        console.log(chalk.gray('    • ') + chalk.magenta('/clear') + chalk.gray(' - Clear screen'));
        console.log(chalk.gray('    • ') + chalk.magenta('/quit') + chalk.gray(' - Exit application'));
        console.log('');
        console.log(chalk.white(' Tips:'));
        console.log(chalk.gray('    • Downloads are saved to: ') + chalk.cyan(currentDownloadPath));
        console.log(chalk.gray('    • Most platforms offer multiple quality options'));
        console.log(chalk.gray('    • Some platforms support batch downloads'));
        console.log('');
        showStatusFooter();
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
    
    const platform = matchPlatform(hostname, url);
    
    if (platform) {
      showProcessing('Fetching', ` Analyzing ${platform.name} ${platform.mediaType}...`);
      await platform.handler(url, currentDownloadPath);
    } else {
      const supportedPlatforms = PLATFORM_CONFIG.map(p => p.name).join(', ');
      console.log('');
      console.log(chalk.red(` • Unsupported platform. Please provide ${supportedPlatforms} URLs.`));
      showStatusFooter();
    }
  } else {
    const supportedPlatforms = PLATFORM_CONFIG.map(p => p.name).join(', ');
    console.log('');
    console.log(chalk.gray(' • Please provide a social media URL to download from.'));
    console.log(chalk.gray(` • Supported platforms: ${supportedPlatforms}`));
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