const fs = require('fs');
const path = require('path');

// 要搜索的字符串
const oldPath = 'G:\\nationicon.png';
const newPath = '../nationalicon/nationicon.png';

// 遍历目录查找HTML文件
function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      traverseDir(filePath);
    } else if (file.endsWith('.html')) {
      replaceInFile(filePath);
    }
  }
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 替换所有出现的路径 - 使用字符串替换
  const oldPath = 'G:\\nationicon.png';
  const newPath = '../nationalicon/nationicon.png';

  // 简单的字符串替换（全局）
  content = content.split(oldPath).join(newPath);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// 从当前目录开始
traverseDir(__dirname);
console.log('Image path replacement completed.');