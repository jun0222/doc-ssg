// TODO: コメント入れるのと、変数化してわかりやすくする
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const hljs = require("highlight.js");

const inputDir = "./docs/";
const outputFile = "./index.html";

// Highlight.js settings
marked.setOptions({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  renderer: new marked.Renderer(),
});

// Modify the renderer to prepend ../docs/ to image paths
const renderer = new marked.Renderer();

renderer.image = function (imageObj, title, text) {
  const newHref = path.join("./docs/", imageObj.href);
  return `<img src="${newHref}" alt="${text}" title="${title || ""}" />`;
};

// Passwordセクションのコードブロックを隠す関数
function wrapPasswordWithMask(html) {
  // <h3>Password</h3> の後の <pre><code>...</code></pre> を検出して置換
  const passwordRegex =
    /(<h3[^>]*>Password<\/h3>\s*)(<pre><code[^>]*>)([\s\S]*?)(<\/code><\/pre>)/gi;

  return html.replace(passwordRegex, (match, h3, preOpen, password, preClose) => {
    const trimmedPassword = password.trim();
    const masked = "*".repeat(Math.min(trimmedPassword.length, 12));
    return `${h3}
<div class="password-wrapper">
  <div class="password-display">
    <span class="password-masked">${masked}</span>
    <span class="password-real" style="display:none;">${trimmedPassword}</span>
  </div>
  <button class="password-toggle" onclick="togglePassword(this)" title="表示/非表示">👁</button>
  <button class="password-copy" onclick="copyPassword(this)" title="コピー">Copy</button>
  <input type="hidden" class="password-value" value="${trimmedPassword.replace(/"/g, "&quot;")}">
</div>`;
  });
}


// 出力ファイルが既に存在する場合は削除
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

// Markdownファイルを変換してHTMLに追加
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // 逆順にする必要がなければこの行を削除してください
  const filesR = files.reverse();

  let combinedContent = "";

  for (const fileName of filesR) {
    // .mdファイルのみ処理
    if (path.extname(fileName) !== ".md") {
      continue;
    }

    const filePath = path.join(inputDir, fileName);

    // ファイル読み込み
    const fileContent = fs.readFileSync(filePath, "utf8");

    // MarkdownをHTMLに変換
    const htmlContent = marked(fileContent, { renderer });

    // Passwordセクションを隠す
    const wrappedContent = wrapPasswordWithMask(htmlContent);

    // ファイル名をセクションとして追加（h1を折りたたみ可能に）
    combinedContent += `
      <details class="file-section">
        <summary><h1>${fileName.replace(".md", "")}</h1></summary>
        <div class="file-content">
          ${wrappedContent}
        </div>
      </details>
      <hr>
    `;
  }

  // 最終的なHTMLコンテンツ
  const finalHtml = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>開発ドキュメント</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/default.min.css" id="highlight-light">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/github-dark.min.css" id="highlight-dark" disabled>
      <style>
        /* Light mode (default) */
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f4f4f9; 
          color: #333;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .container { 
          max-width: 800px; 
          margin: auto; 
          background: #fff; 
          padding: 20px; 
          border-radius: 10px; 
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }

        /* はみ出し防止 */
        .container {
          overflow: hidden;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        pre {
          overflow-x: auto;
          max-width: 100%;
        }
        code {
          word-break: break-all;
        }
        p, li, td, th {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* ファイルセクション折りたたみスタイル */
        details.file-section {
          margin: 15px 0;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        details.file-section > summary {
          cursor: pointer;
          padding: 0;
          background-color: #333;
          list-style: none;
          display: flex;
          align-items: center;
        }
        details.file-section > summary::-webkit-details-marker {
          display: none;
        }
        details.file-section > summary::before {
          content: "▶";
          color: #fff;
          padding: 15px;
          font-size: 14px;
          transition: transform 0.2s;
        }
        details.file-section[open] > summary::before {
          transform: rotate(90deg);
        }
        details.file-section > summary h1 {
          display: inline;
          margin: 0;
          font-size: 24px;
          color: #fff;
          background: none;
          padding: 10px 15px 10px 0;
        }
        .file-content {
          padding: 15px;
        }
        pre { position: relative; }
        .copy-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #4CAF50;
          color: #fff;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 3px;
          display: none;
        }
        pre:hover .copy-button {
          display: block;
        }

        /* パスワード表示スタイル */
        .password-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f5f5f5;
          padding: 10px 15px;
          border-radius: 5px;
          margin: 10px 0;
          font-family: monospace;
        }
        .password-display {
          flex: 1;
          font-size: 16px;
          letter-spacing: 2px;
        }
        .password-masked {
          color: #666;
        }
        .password-real {
          color: #333;
        }
        .password-toggle, .password-copy {
          background: #666;
          color: #fff;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 14px;
        }
        .password-toggle:hover, .password-copy:hover {
          background: #888;
        }
        .password-copy.copied {
          background: #4CAF50;
        }

        /* Theme toggle button */
        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #333;
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          z-index: 1000;
          transition: background-color 0.3s ease;
        }
        
        .theme-toggle:hover {
          background: #555;
        }
        
        /* Dark mode styles */
        body.dark-mode {
          background-color: #1a1a1a;
          color: #e0e0e0;
        }
        
        body.dark-mode .container {
          background: #2d2d2d;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }
        
        body.dark-mode .theme-toggle {
          background: #e0e0e0;
          color: #333;
        }
        
        body.dark-mode .theme-toggle:hover {
          background: #ccc;
        }
        
        body.dark-mode hr {
          border-top: 1px solid #555;
        }
        
        body.dark-mode h1 {
          background-color: #444 !important;
          color: #fff !important;
        }
        
        body.dark-mode code {
          background-color: #3d3d3d;
          color: #e0e0e0;
        }
        
        body.dark-mode blockquote {
          border-left: 4px solid #555;
          background-color: #333;
          color: #ccc;
        }
        
        body.dark-mode table {
          background-color: #2d2d2d;
        }
        
        body.dark-mode th {
          background-color: #444;
          color: #e0e0e0;
        }
        
        body.dark-mode td {
          border-color: #555;
          color: #e0e0e0;
        }

        body.dark-mode details.file-section {
          border-color: #555;
        }
        body.dark-mode details.file-section > summary {
          background-color: #444;
        }
        body.dark-mode details.file-section > summary:hover {
          background-color: #555;
        }

        body.dark-mode .password-wrapper {
          background: #3d3d3d;
        }
        body.dark-mode .password-masked {
          color: #aaa;
        }
        body.dark-mode .password-real {
          color: #e0e0e0;
        }
      </style>
    </head>
    <body>
      <button class="theme-toggle" onclick="toggleTheme()">🌙 </button>
      <div class="container">
        ${combinedContent}
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/highlight.min.js"></script>
      <script>
        // Highlight.js initialization
        document.querySelectorAll('pre code').forEach((el) => {
          hljs.highlightElement(el);
        });
        
        // Copy button functionality
        document.querySelectorAll('pre').forEach((pre) => {
          const button = document.createElement('button');
          button.className = 'copy-button';
          button.innerText = 'Copy';
          button.addEventListener('click', () => {
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
              button.innerText = 'Copied';
              setTimeout(() => { button.innerText = 'Copy'; }, 2000);
            });
          });
          pre.appendChild(button);
        });
        
        // Password toggle functionality
        function togglePassword(btn) {
          const wrapper = btn.closest('.password-wrapper');
          const masked = wrapper.querySelector('.password-masked');
          const real = wrapper.querySelector('.password-real');

          if (masked.style.display === 'none') {
            masked.style.display = 'inline';
            real.style.display = 'none';
            btn.textContent = '👁';
          } else {
            masked.style.display = 'none';
            real.style.display = 'inline';
            btn.textContent = '🙈';
          }
        }

        // Password copy functionality
        function copyPassword(btn) {
          const wrapper = btn.closest('.password-wrapper');
          const password = wrapper.querySelector('.password-value').value;

          navigator.clipboard.writeText(password).then(() => {
            btn.textContent = 'Copied';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.textContent = 'Copy';
              btn.classList.remove('copied');
            }, 2000);
          });
        }

        // Dark mode functionality
        function toggleTheme() {
          const body = document.body;
          const themeToggle = document.querySelector('.theme-toggle');
          const lightTheme = document.getElementById('highlight-light');
          const darkTheme = document.getElementById('highlight-dark');
          
          if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '🌙 ';
            lightTheme.disabled = false;
            darkTheme.disabled = true;
            localStorage.setItem('theme', 'light');
          } else {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '☀️';
            lightTheme.disabled = true;
            darkTheme.disabled = false;
            localStorage.setItem('theme', 'dark');
          }
        }
        
        // Load saved theme on page load
        document.addEventListener('DOMContentLoaded', function() {
          const savedTheme = localStorage.getItem('theme');
          const themeToggle = document.querySelector('.theme-toggle');
          const lightTheme = document.getElementById('highlight-light');
          const darkTheme = document.getElementById('highlight-dark');
          
          if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '☀️';
            lightTheme.disabled = true;
            darkTheme.disabled = false;
          } else {
            themeToggle.innerHTML = '🌙 ';
            lightTheme.disabled = false;
            darkTheme.disabled = true;
          }
        });
      </script>
    </body>
    </html>
  `;

  // HTMLファイルに書き込み
  fs.writeFileSync(outputFile, finalHtml, "utf8");
  console.log("Markdown files have been combined and saved as", outputFile);
});
