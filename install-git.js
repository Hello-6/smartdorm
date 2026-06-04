const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gitDir = path.join(__dirname, 'portable-git');
const gitExe = path.join(gitDir, 'bin', 'git.exe');

if (fs.existsSync(gitExe)) {
  console.log('GIT_READY:' + gitExe);
  process.exit(0);
}

console.log('正在下载便携版 Git（约50MB），请稍候...');
const url = 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/PortableGit-2.47.1-64-bit.7z.exe';
const file = path.join(gitDir, 'PortableGit.exe');

try {
  fs.mkdirSync(gitDir, { recursive: true });
} catch(e) {}

function downloadAndExtract(downloadUrl) {
  https.get(downloadUrl, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      downloadAndExtract(res.headers.location);
      return;
    }
    const stream = fs.createWriteStream(file);
    let bytes = 0;
    res.pipe(stream);
    res.on('data', (chunk) => { bytes += chunk.length; });
    res.on('end', () => {
      stream.close();
      console.log('下载完成 (' + Math.round(bytes/1024/1024) + ' MB)，正在解压...');
      try {
        execSync('"' + file + '" -y', { cwd: gitDir, stdio: 'pipe', timeout: 60000 });
      } catch(e) {
        console.log('解压完成');
      }
      if (fs.existsSync(gitExe)) {
        console.log('GIT_READY:' + gitExe);
      } else {
        const result = execSync('dir /s /b "' + gitDir + '\\git.exe" 2>nul', { shell: 'cmd' }).toString().trim();
        if (result) {
          console.log('GIT_READY:' + result.split('\r\n')[0]);
        } else {
          console.log('Git 未找到，可能解压方式不同，尝试直接使用...');
          console.log('GIT_DIR:' + gitDir);
        }
      }
    });
  }).on('error', (e) => {
    console.error('下载失败:', e.message);
  });
}

downloadAndExtract(url);
