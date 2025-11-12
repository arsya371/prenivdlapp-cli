# PRENIVDL - Universal Social Media Downloader

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![Version](https://img.shields.io/github/package-json/v/arsya371/prenivdlapp-cli)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/arsya371/prenivdlapp-cli?style=social)](https://github.com/arsya371/prenivdlapp-cli)
[![GitHub Forks](https://img.shields.io/github/forks/arsya371/prenivdlapp-cli?style=social)](https://github.com/arsya371/prenivdlapp-cli/fork)

**PRENIVDL - Universal Social Media Downloader CLI.** Download videos, images, audio from TikTok, Instagram, YouTube, Twitter/X, Facebook, Spotify, RedNote, Threads, Kuaishou, Weibo & more. Cross-platform: Windows | Linux | macOS | Termux. Free & open-source.

## Key Features

- **TikTok Downloader** - Download videos/image with metadata and multiple quality options
- **Facebook Downloader** - Download videos in multiple qualities (HD/SD) and formats (MP4/MP3)
- **Instagram Downloader** - Download photos and videos from posts and stories
- **Twitter Downloader** - Download videos from Twitter/X posts with quality selection
- **Douyin Downloader** - Download videos from Douyin (Chinese TikTok) with multiple quality options
- **Spotify Downloader** - Download tracks (MP3) and cover images from Spotify
- **Pinterest Downloader** - Download images from Pinterest pins with multiple quality options
- **Apple Music Downloader** - Download tracks (MP3) and cover images from Apple Music
- **YouTube Downloader** - Download videos and audio from YouTube with format selection (video with audio, video only, audio only)
- **CapCut Downloader** - Download videos from CapCut with quality options (HD No Watermark, No Watermark, Watermark)
- **Bluesky Downloader** - Download images and videos from Bluesky posts
- **RedNote/Xiaohongshu Downloader** - Download videos and images from RedNote/Xiaohongshu posts with quality selection
- **Threads Downloader** - Download videos from Threads posts
- **Kuaishou Downloader** - Download videos from Kuaishou posts
- **Weibo Downloader** - Download videos and images from Weibo posts
- **Beautiful CLI Interface** - Colorful output with ASCII art banner and custom prompt
- **Interactive Mode** - User-friendly prompts and selections
- **Fast Downloads** - Efficient downloading with progress indicators

## Installation

<details>
  <summary>Linux (Ubuntu/Debian)</summary>

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
sudo apt install nodejs npm git -y

# Verify installation
node --version
npm --version

# Clone and install
git clone https://github.com/arsya371/prenivdlapp-cli.git
cd prenivdlapp-cli
npm install
```
</details>

<details>
  <summary>macOS</summary>
    
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node git

# Verify installation
node --version
npm --version

# Clone and install
git clone https://github.com/arsya371/prenivdlapp-cli.git
cd prenivdlapp-cli
npm install
```
</details>

<details>
  <summary>Windows</summary>
    
```bash
# Download Node.js from nodejs.org
# Install Git from git-scm.com
# Open Command Prompt or PowerShell

# Clone and install
git clone https://github.com/arsya371/prenivdlapp-cli.git
cd prenivdlapp-cli
npm install
```
</details>

<details>
  <summary>Termux (Android)</summary>

```bash
# Update packages
pkg update && pkg upgrade

# Install dependencies
pkg install nodejs git

# Clone and install
git clone https://github.com/arsya371/prenivdlapp-cli.git
cd prenivdlapp-cli
npm install
```
</details>

## Quick Start

```bash
# Linux/macOS/Termux:
node index.js

# Or use the shell script:
./prnvapp.sh

# Windows:
node index.js

# Or use the batch file:
prnvapp.bat
```

## Updating the Script

```bash
# Navigate to the prenivdlapp-cli directory
cd prenivdlapp-cli

# Fetch the latest updates from the repository
git pull origin main

# Install if there are additional dependencies
npm install
```

### Interactive Commands

Once in interactive mode, you can use these commands:

- **`/help`** - Show available commands
- **`/tutor`** - Show quick tutorial
- **`/platform`** - List all supported platforms
- **`/clear`** - Clear the screen
- **`/quit`** - Exit the application
- **`/path`** - Show current download directory
- **`/setpath <directory>`** - Set custom download directory

Example:
```
prenivdlapp » /setpath my_downloads
prenivdlapp » /path
Current download path: my_downloads
```

## URL Examples

Simply paste any of these URLs in interactive mode:

- **TikTok**: `https://www.tiktok.com/@username/video/1234567890`
- **Facebook**: `https://www.facebook.com/watch/?v=1234567890` or `https://fb.watch/abc123`
- **Instagram**: `https://www.instagram.com/p/ABC123/`
- **Twitter/X**: `https://twitter.com/user/status/1234567890` or `https://x.com/user/status/1234567890`
- **Douyin**: `https://www.douyin.com/video/1234567890`
- **Spotify**: `https://open.spotify.com/track/ABC123`
- **Pinterest**: `https://www.pinterest.com/pin/1234567890/` or `https://pin.it/abc123`
- **Apple Music**: `https://music.apple.com/id/album/song-name/123456?i=789012`
- **YouTube**: `https://www.youtube.com/watch?v=ABC123` or `https://youtu.be/ABC123`
- **CapCut**: `https://www.capcut.com/tv2/ABC123/`
- **Bluesky**: `https://bsky.app/profile/user.bsky.social/post/ABC123`
- **RedNote/Xiaohongshu**: `https://www.xiaohongshu.com/explore/ABC123` or `https://xhslink.com/ABC123`
- **Threads**: `https://www.threads.net/@username/post/ABC123`
- **Kuaishou**: `https://www.kuaishou.com/short-video/ABC123` or `https://ksurl.cn/ABC123`
- **Weibo**: `https://weibo.com/tv/show/ABC123`

All files are saved to the specified directory (default: `resultdownload_preniv`).

## Cross-Platform Compatibility

This CLI works on:
- [x] **Windows** (10, 11)
- [x] **Linux** (Ubuntu, Debian, CentOS, etc.)
- [x] **macOS** (Monterey, Ventura, Sonoma)
- [x] **Termux** (Android)
- [x] **WSL** (Windows Subsystem for Linux)

## Dependencies
- `axios` - HTTP client for API requests
- `chalk` - Terminal string styling
- `commander` - Command-line interface framework
- `inquirer` - Interactive command line prompts
- `ora` - Elegant terminal spinners
- `figlet` - ASCII art text generator

## Error Handling

The CLI includes comprehensive error handling for:

- Invalid URLs
- Network connectivity issues
- API failures
- File download errors
- User input validation

## Tips

1. **URL Validation**: Make sure to paste complete, valid URLs
2. **Network**: Ensure stable internet connection for downloads
3. **Storage**: Check available disk space before downloading
4. **Quality**: Higher quality files take longer to download

## License

> [!WARNING]
> This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

**This means**:
- ✅ **Free to use, modify, and distribute**
- ✅ **Source code must remain open**
- ✅ **Any modifications must also be GPL-3.0**
- ❌ **Cannot be sold as proprietary tools**

> [!CAUTION]
> **Do not sell this tool.** This project is free and open-source under GPL-3.0. Any distribution (free or paid) must include the source code and maintain the same license. Selling this as proprietary tools is strictly prohibited and violates the GPL-3.0 license terms.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Star this repository

> [!NOTE]
> This tool is for educational purposes. Please respect the terms of service of the respective social media platforms and only download content you have permission to download.