# Prenivdlapp CLI (PRENIVDL)

Prenivdlapp CLI is a powerful command-line interface for downloading videos and media from TikTok, Facebook, Instagram, Twitter, Douyin, Spotify, Pinterest, Apple Music, YouTube, CapCut, and Bluesky. Designed with beautiful ASCII art and interactive prompts.

## Features

- **TikTok Downloader** - Download videos with metadata and multiple quality options (MP4/MP3)
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
- **Beautiful CLI Interface** - Colorful output with ASCII art banner and custom prompt
- **Interactive Mode** - User-friendly prompts and selections
- **Fast Downloads** - Efficient downloading with progress indicators

## Installation

### Linux (Ubuntu/Debian)
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

### macOS
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

### Windows
```bash
# Download Node.js from nodejs.org
# Install Git from git-scm.com
# Open Command Prompt or PowerShell

# Clone and install
git clone https://github.com/arsya371/prenivdlapp-cli.git
cd prenivdlapp-cli
npm install
```

### Termux (Android)
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

## Usage

### Interactive Mode (Recommended)

Simply run the application without any arguments to start interactive mode:

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

### Interactive Commands

Once in interactive mode, you can use these commands:

- **`/help`** - Show available commands
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

### Supported Platforms & URL Examples

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

All files are saved to the specified directory (default: `resultdownload_preniv`).

### Cross-Platform Compatibility

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

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

This means:
- ✅ **Free to use, modify, and distribute**
- ✅ **Source code must remain open**
- ✅ **Any modifications must also be GPL-3.0**
- ❌ **Cannot be sold as proprietary tools**

> [!CAUTION]
> **Do not sell this tool.** This project is free and open-source under GPL-3.0. Any distribution (free or paid) must include the source code and maintain the same license. Selling this as proprietary tools is strictly prohibited and violates the GPL-3.0 license terms.

## Contributing

Feel free to submit issues and enhancement requests!

---

> [!NOTE]
> This tool is for educational purposes. Please respect the terms of service of the respective social media platforms and only download content you have permission to download.
