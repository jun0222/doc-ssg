const fs = require("fs");
const path = require("path");

// 現在の日付と時刻を取得して、yyyymmddHHMM形式にフォーマット
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0から始まるので+1
const day = String(date.getDate()).padStart(2, "0");
const hours = String(date.getHours()).padStart(2, "0");
const minutes = String(date.getMinutes()).padStart(2, "0");
const fileName = `${year}${month}${day}${hours}${minutes}.md`;

// ファイルの保存パス
const inputDir = "./docs/";
const filePath = path.join(inputDir, fileName);

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
}

// ファイルの初期内容
const content = `# ${year}-${month}-${day} ${hours}:${minutes}\n\n`;

// ファイルを作成して書き込み
fs.writeFile(filePath, content, (err) => {
  if (err) {
    console.error("Error creating file:", err);
  } else {
    console.log(`${fileName} has been created in ${inputDir}`);
  }
});
