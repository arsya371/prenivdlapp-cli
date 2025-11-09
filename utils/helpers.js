const chalk = require('chalk');
const figlet = require('figlet');
const { version } = require('../package.json');
const { PLATFORM_CONFIG } = require('./config');

function showBanner() {
  console.clear();
  
  const asciiArt = figlet.textSync(' PRENIVDL', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  const lines = asciiArt.split('\n');
  const colors = [
    chalk.rgb(100, 200, 255),  // Light blue
    chalk.rgb(120, 180, 255),  // Blue
    chalk.rgb(140, 160, 255),  // Blue-purple
    chalk.rgb(160, 140, 255),  // Purple
    chalk.rgb(200, 120, 255),  // Pink-purple
    chalk.rgb(255, 100, 200)   // Pink
  ];
  
  lines.forEach((line, index) => {
    const colorIndex = Math.min(index, colors.length - 1);
    console.log(colors[colorIndex](line));
  });
  
  console.log(chalk.greenBright('    Github: https://github.com/arsya371/prenivdlapp-cli (Free)'));
  console.log('');
  console.log(chalk.gray('  Tips for getting started:'));
  console.log(chalk.gray('    1. Ask questions, edit files, or run commands.'));
  console.log(chalk.gray('    2. Be specific for the best results.'));
  console.log(chalk.gray('    3. ') + chalk.magenta('/help') + chalk.gray(' for more information.'));
  console.log('');
}

function showPrompt() {
  process.stdout.write(chalk.cyan('prenivapp ') + chalk.magenta('» '));
}

function showProcessing(platform, action) {
  console.log('');
  console.log(chalk.gray('  -- ') + chalk.cyan(platform) + chalk.gray(' ' + action));
  console.log('');
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function showHelp() {
  console.log('');
  console.log(chalk.cyan(' Available Commands:'));
  console.log(chalk.gray('   • ') + chalk.magenta('/help') + chalk.gray('      - Show this help message'));
  console.log(chalk.gray('   • ') + chalk.magenta('/tutor') + chalk.gray('     - Show quick tutorial'));
  console.log(chalk.gray('   • ') + chalk.magenta('/platform') + chalk.gray('  - List all supported platforms'));
  console.log(chalk.gray('   • ') + chalk.magenta('/clear') + chalk.gray('     - Clear the screen'));
  console.log(chalk.gray('   • ') + chalk.magenta('/path') + chalk.gray('      - Show current download path'));
  console.log(chalk.gray('   • ') + chalk.magenta('/setpath') + chalk.gray('   - Set custom download directory'));
  console.log(chalk.gray('   • ') + chalk.magenta('/quit') + chalk.gray('      - Exit the application'));
  
  console.log('');
  showStatusFooter();
}

function showStatusFooter() {
  const versionString = `prnvapp-${version}`;
  const status = '2025';
  console.log('');
  console.log(chalk.gray(`~/${versionString} `) + chalk.gray(`(${status})`.padStart(40)));
}

module.exports = {
  showBanner,
  showPrompt,
  showProcessing,
  isValidUrl,
  showHelp,
  showStatusFooter
};
