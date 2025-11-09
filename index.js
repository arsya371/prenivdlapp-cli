const { program } = require('commander');
const { version } = require('./package.json');
const { startInteractive, currentDownloadPath } = require('./utils/input');
const { showBanner, showStatusFooter } = require('./utils/helpers');
const { downloadTikTok } = require('./routes/tiktok');
const { downloadFacebook } = require('./routes/facebook');
const { downloadInstagram } = require('./routes/instagram');
const { downloadTwitter } = require('./routes/twitter');
const { downloadDouyin } = require('./routes/douyin');
const { downloadSpotify } = require('./routes/spotify');
const { downloadPinterest } = require('./routes/pinterest');
const { downloadAppleMusic } = require('./routes/applemusic');
const { downloadYouTube } = require('./routes/youtube');
const { downloadCapcut } = require('./routes/capcut');
const { downloadBluesky } = require('./routes/bluesky');

program
  .name('prnvapp')
  .description('Social Media Downloader CLI')
  .version(version)
  .option('-p, --path <directory>', 'Custom download directory (default: "resultdownload_preniv")', 'resultdownload_preniv');

program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(startInteractive);

program
  .command('tiktok <url>')
  .description('Download from TikTok')
  .action(async (url) => {
    showBanner();
    await downloadTikTok(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('facebook <url>')
  .alias('fb')
  .description('Download from Facebook')
  .action(async (url) => {
    showBanner();
    await downloadFacebook(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('instagram <url>')
  .alias('ig')
  .description('Download from Instagram')
  .action(async (url) => {
    showBanner();
    await downloadInstagram(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('twitter <url>')
  .alias('tw')
  .description('Download from Twitter')
  .action(async (url) => {
    showBanner();
    await downloadTwitter(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('douyin <url>')
  .alias('dy')
  .description('Download from Douyin')
  .action(async (url) => {
    showBanner();
    await downloadDouyin(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('spotify <url>')
  .alias('sp')
  .description('Download from Spotify')
  .action(async (url) => {
    showBanner();
    await downloadSpotify(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('pinterest <url>')
  .alias('pin')
  .description('Download from Pinterest')
  .action(async (url) => {
    showBanner();
    await downloadPinterest(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('applemusic <url>')
  .alias('am')
  .description('Download from Apple Music')
  .action(async (url) => {
    showBanner();
    await downloadAppleMusic(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('youtube <url>')
  .alias('yt')
  .description('Download from YouTube')
  .action(async (url) => {
    showBanner();
    await downloadYouTube(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('capcut <url>')
  .alias('cc')
  .description('Download from CapCut')
  .action(async (url) => {
    showBanner();
    await downloadCapcut(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

program
  .command('bluesky <url>')
  .alias('bsky')
  .description('Download from Bluesky')
  .action(async (url) => {
    showBanner();
    await downloadBluesky(url, program.opts().path || currentDownloadPath);
    showStatusFooter();
  });

if (process.argv.length === 2) {
  startInteractive();
} else {
  program.parse();
}
