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
  <button class="password-toggle" onclick="togglePassword(this)" title="表示/非表示"><i class="fa-solid fa-eye"></i></button>
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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        /* Light mode (default) */
        * {
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f9;
          color: #333;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* メインレイアウト */
        .main-wrapper {
          display: flex;
          gap: 0;
          max-width: 1800px;
          margin: 0 auto;
          position: relative;
        }

        .container {
          flex: 1;
          min-width: 0;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          margin-right: 0;
        }

        .main-wrapper.widget-open .container {
          margin-right: 10px;
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

        /* ツールバー */
        .toolbar {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 1000;
        }

        .toolbar button {
          background: #333;
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        .toolbar button:hover {
          background: #555;
        }

        /* ウィジェットパネル */
        .widget-panel {
          width: 400px;
          min-width: 280px;
          max-width: 800px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          display: none;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .main-wrapper.widget-open .widget-panel {
          display: flex;
        }

        /* リサイズハンドル */
        .resize-handle {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: transparent;
          cursor: ew-resize;
          transition: background-color 0.2s;
        }

        .resize-handle:hover,
        .resize-handle.active {
          background: #4CAF50;
        }

        .widget-panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          padding-left: 20px;
        }

        .widget-header {
          padding: 15px 20px;
          background: #333;
          color: #fff;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .widget-section {
          margin-bottom: 20px;
        }

        .widget-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 2px solid #333;
          margin-bottom: 10px;
          cursor: pointer;
          user-select: none;
        }

        .widget-section-header h3 {
          margin: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .widget-section-header .toggle-icon {
          transition: transform 0.2s;
        }

        .widget-section.collapsed .toggle-icon {
          transform: rotate(-90deg);
        }

        .widget-section.collapsed .widget-section-content {
          display: none;
        }

        /* カレンダー */
        .calendar-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .calendar-nav button {
          background: #eee;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .calendar-nav button:hover {
          background: #ddd;
        }

        .calendar-nav span {
          font-weight: bold;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          text-align: center;
        }

        .calendar-grid .day-header {
          font-weight: bold;
          font-size: 11px;
          padding: 5px 2px;
          color: #666;
        }

        .calendar-grid .day {
          padding: 8px 2px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s;
        }

        .calendar-grid .day:hover {
          background: #e0e0e0;
        }

        .calendar-grid .day.today {
          background: #4CAF50;
          color: #fff;
          font-weight: bold;
        }

        .calendar-grid .day.other-month {
          color: #bbb;
        }

        .calendar-grid .day.sunday {
          color: #e53935;
        }

        .calendar-grid .day.saturday {
          color: #1e88e5;
        }

        .calendar-grid .day.today.sunday,
        .calendar-grid .day.today.saturday {
          color: #fff;
        }

        .calendar-grid .day.holiday {
          color: #e53935;
        }

        .calendar-grid .day.today.holiday {
          color: #fff;
        }

        .calendar-grid .day.holiday.other-month {
          color: #f8b0b0;
        }

        .calendar-grid .day[title] {
          position: relative;
        }

        .calendar-grid .day[title]:hover::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          z-index: 100;
        }

        /* TODOリスト */
        .todo-input-wrapper {
          display: flex;
          gap: 5px;
          margin-bottom: 10px;
        }

        .todo-input-wrapper input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
        }

        .todo-input-wrapper button {
          padding: 8px 12px;
          background: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .todo-input-wrapper button:hover {
          background: #45a049;
        }

        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .todo-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .todo-item span {
          flex: 1;
          font-size: 13px;
        }

        .todo-item.completed span {
          text-decoration: line-through;
          color: #999;
        }

        .todo-item button {
          background: transparent;
          border: none;
          color: #e53935;
          cursor: pointer;
          font-size: 16px;
          padding: 0 5px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .todo-item:hover button {
          opacity: 1;
        }

        /* メモ */
        .memo-textarea {
          width: 100%;
          min-height: 150px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          font-family: inherit;
          resize: vertical;
          line-height: 1.5;
        }

        .memo-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 5px;
        }

        .memo-btn-group {
          display: flex;
          gap: 5px;
        }

        .memo-add-btn, .memo-copy-btn {
          width: 28px;
          height: 28px;
          background: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .memo-add-btn {
          font-size: 18px;
        }

        .memo-add-btn:hover, .memo-copy-btn:hover {
          background: #45a049;
        }

        .memo-copy-btn.copied {
          background: #2196F3;
        }

        .memo-status {
          font-size: 11px;
          color: #999;
          text-align: right;
        }

        .memo-status.saved {
          color: #4CAF50;
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

        body.dark-mode .toolbar button {
          background: #e0e0e0;
          color: #333;
        }

        body.dark-mode .toolbar button:hover {
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

        /* ウィジェットパネル ダークモード */
        body.dark-mode .widget-panel {
          background: #2d2d2d;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        body.dark-mode .widget-header {
          background: #444;
        }

        body.dark-mode .widget-section-header {
          border-bottom-color: #555;
        }

        body.dark-mode .calendar-nav button {
          background: #444;
          color: #e0e0e0;
        }

        body.dark-mode .calendar-nav button:hover {
          background: #555;
        }

        body.dark-mode .calendar-grid .day-header {
          color: #999;
        }

        body.dark-mode .calendar-grid .day:hover {
          background: #444;
        }

        body.dark-mode .calendar-grid .day.other-month {
          color: #555;
        }

        body.dark-mode .calendar-grid .day.holiday.other-month {
          color: #8b5a5a;
        }

        body.dark-mode .calendar-grid .day[title]:hover::after {
          background: #555;
        }

        body.dark-mode .todo-input-wrapper input {
          background: #3d3d3d;
          border-color: #555;
          color: #e0e0e0;
        }

        body.dark-mode .todo-item {
          border-bottom-color: #444;
        }

        body.dark-mode .todo-item.completed span {
          color: #666;
        }

        body.dark-mode .memo-textarea {
          background: #3d3d3d;
          border-color: #555;
          color: #e0e0e0;
        }

        body.dark-mode .memo-add-btn {
          background: #4CAF50;
        }

        body.dark-mode .memo-add-btn:hover {
          background: #45a049;
        }

        body.dark-mode .resize-handle:hover,
        body.dark-mode .resize-handle.active {
          background: #4CAF50;
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button class="widget-toggle" onclick="toggleWidgetPanel()">Widgets</button>
        <button class="theme-toggle" onclick="toggleTheme()"></button>
      </div>
      <div class="main-wrapper">
        <div class="container">
          ${combinedContent}
        </div>
        <div class="widget-panel">
          <div class="resize-handle"></div>
          <div class="widget-header">
            <span>Widgets</span>
          </div>
          <div class="widget-panel-content">
            <!-- カレンダー -->
            <div class="widget-section" id="calendar-section">
              <div class="widget-section-header" onclick="toggleSection('calendar-section')">
                <h3><span class="toggle-icon">▼</span> Calendar</h3>
              </div>
              <div class="widget-section-content">
                <div class="calendar-nav">
                  <button onclick="changeMonth(-1)">&lt;</button>
                  <span id="calendar-title"></span>
                  <button onclick="changeMonth(1)">&gt;</button>
                </div>
                <div class="calendar-grid" id="calendar-grid"></div>
              </div>
            </div>

            <!-- TODOリスト -->
            <div class="widget-section" id="todo-section">
              <div class="widget-section-header" onclick="toggleSection('todo-section')">
                <h3><span class="toggle-icon">▼</span> TODO</h3>
              </div>
              <div class="widget-section-content">
                <div class="todo-input-wrapper">
                  <input type="text" id="todo-input" placeholder="Add new task..." onkeypress="handleTodoKeypress(event)">
                  <button onclick="addTodo()">Add</button>
                </div>
                <ul class="todo-list" id="todo-list"></ul>
              </div>
            </div>

            <!-- メモ -->
            <div class="widget-section" id="memo-section">
              <div class="widget-section-header" onclick="toggleSection('memo-section')">
                <h3><span class="toggle-icon">▼</span> Memo</h3>
              </div>
              <div class="widget-section-content">
                <textarea class="memo-textarea" id="memo-textarea" placeholder="Write your notes here..."></textarea>
                <div class="memo-footer">
                  <div class="memo-btn-group">
                    <button class="memo-add-btn" onclick="insertMemoTemplate()" title="テンプレートを挿入">+</button>
                    <button class="memo-copy-btn" onclick="copyMemo(this)" title="メモをコピー"><i class="fa-solid fa-copy"></i></button>
                  </div>
                  <div class="memo-status" id="memo-status"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          const icon = btn.querySelector('i');

          if (masked.style.display === 'none') {
            masked.style.display = 'inline';
            real.style.display = 'none';
            icon.className = 'fa-solid fa-eye';
          } else {
            masked.style.display = 'none';
            real.style.display = 'inline';
            icon.className = 'fa-solid fa-eye-slash';
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
            themeToggle.innerHTML = '🌙';
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

        // Widget panel toggle
        function toggleWidgetPanel() {
          const wrapper = document.querySelector('.main-wrapper');
          const isOpen = wrapper.classList.toggle('widget-open');
          localStorage.setItem('widgetPanelOpen', isOpen);
        }

        // Widget section toggle
        function toggleSection(sectionId) {
          const section = document.getElementById(sectionId);
          section.classList.toggle('collapsed');
          const collapsed = JSON.parse(localStorage.getItem('widgetCollapsed') || '{}');
          collapsed[sectionId] = section.classList.contains('collapsed');
          localStorage.setItem('widgetCollapsed', JSON.stringify(collapsed));
        }

        // Resize handle functionality
        (function() {
          const panel = document.querySelector('.widget-panel');
          const handle = document.querySelector('.resize-handle');
          let isResizing = false;

          handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            handle.classList.add('active');
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
          });

          document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const containerRight = document.querySelector('.main-wrapper').getBoundingClientRect().right;
            const newWidth = containerRight - e.clientX;
            const clampedWidth = Math.max(280, Math.min(800, newWidth));
            panel.style.width = clampedWidth + 'px';
            localStorage.setItem('widgetPanelWidth', clampedWidth);
          });

          document.addEventListener('mouseup', () => {
            if (isResizing) {
              isResizing = false;
              handle.classList.remove('active');
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
            }
          });
        })();

        // Calendar functionality
        let currentDate = new Date();

        // 日本の祝日計算
        function getJapaneseHolidays(year) {
          const holidays = {};

          // 固定祝日
          holidays[year + '-01-01'] = '元日';
          holidays[year + '-02-11'] = '建国記念の日';
          holidays[year + '-02-23'] = '天皇誕生日';
          holidays[year + '-04-29'] = '昭和の日';
          holidays[year + '-05-03'] = '憲法記念日';
          holidays[year + '-05-04'] = 'みどりの日';
          holidays[year + '-05-05'] = 'こどもの日';
          holidays[year + '-08-11'] = '山の日';
          holidays[year + '-11-03'] = '文化の日';
          holidays[year + '-11-23'] = '勤労感謝の日';

          // ハッピーマンデー（第N月曜日）
          function getNthMonday(y, m, n) {
            const first = new Date(y, m - 1, 1);
            const firstMonday = first.getDay() === 1 ? 1 : (8 - first.getDay() + 1) % 7 + 1;
            return firstMonday + (n - 1) * 7;
          }
          holidays[year + '-01-' + String(getNthMonday(year, 1, 2)).padStart(2, '0')] = '成人の日';
          holidays[year + '-07-' + String(getNthMonday(year, 7, 3)).padStart(2, '0')] = '海の日';
          holidays[year + '-09-' + String(getNthMonday(year, 9, 3)).padStart(2, '0')] = '敬老の日';
          holidays[year + '-10-' + String(getNthMonday(year, 10, 2)).padStart(2, '0')] = 'スポーツの日';

          // 春分の日（3月20日または21日）
          const springEquinox = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
          holidays[year + '-03-' + String(springEquinox).padStart(2, '0')] = '春分の日';

          // 秋分の日（9月22日または23日）
          const autumnEquinox = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
          holidays[year + '-09-' + String(autumnEquinox).padStart(2, '0')] = '秋分の日';

          // 振替休日（祝日が日曜の場合、翌平日が振替休日）
          const substituteHolidays = {};
          Object.keys(holidays).forEach(dateStr => {
            const d = new Date(dateStr);
            if (d.getDay() === 0) { // 日曜日
              let substitute = new Date(d);
              substitute.setDate(substitute.getDate() + 1);
              let subStr = substitute.toISOString().split('T')[0];
              while (holidays[subStr] || substituteHolidays[subStr]) {
                substitute.setDate(substitute.getDate() + 1);
                subStr = substitute.toISOString().split('T')[0];
              }
              substituteHolidays[subStr] = '振替休日';
            }
          });
          Object.assign(holidays, substituteHolidays);

          // 国民の休日（祝日に挟まれた平日）
          // 敬老の日と秋分の日の間
          const keiro = year + '-09-' + String(getNthMonday(year, 9, 3)).padStart(2, '0');
          const shubun = year + '-09-' + String(autumnEquinox).padStart(2, '0');
          const keiroDate = new Date(keiro);
          const shubunDate = new Date(shubun);
          const diff = (shubunDate - keiroDate) / (1000 * 60 * 60 * 24);
          if (diff === 2) {
            const middle = new Date(keiroDate);
            middle.setDate(middle.getDate() + 1);
            const middleStr = middle.toISOString().split('T')[0];
            if (!holidays[middleStr]) {
              holidays[middleStr] = '国民の休日';
            }
          }

          return holidays;
        }

        function formatDateKey(y, m, d) {
          return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        }

        function renderCalendar() {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const today = new Date();

          document.getElementById('calendar-title').textContent =
            year + '年 ' + (month + 1) + '月';

          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const startDay = firstDay.getDay();
          const daysInMonth = lastDay.getDate();

          // 祝日を取得（前後の年も含む）
          const holidays = {
            ...getJapaneseHolidays(year - 1),
            ...getJapaneseHolidays(year),
            ...getJapaneseHolidays(year + 1)
          };

          const grid = document.getElementById('calendar-grid');
          grid.innerHTML = '';

          const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
          dayNames.forEach((name, i) => {
            const header = document.createElement('div');
            header.className = 'day-header';
            if (i === 0) header.style.color = '#e53935';
            if (i === 6) header.style.color = '#1e88e5';
            header.textContent = name;
            grid.appendChild(header);
          });

          // Previous month days
          const prevMonth = month === 0 ? 11 : month - 1;
          const prevYear = month === 0 ? year - 1 : year;
          const prevLastDay = new Date(year, month, 0).getDate();
          for (let i = startDay - 1; i >= 0; i--) {
            const dayNum = prevLastDay - i;
            const day = document.createElement('div');
            day.className = 'day other-month';
            const dateKey = formatDateKey(prevYear, prevMonth, dayNum);
            if (holidays[dateKey]) {
              day.classList.add('holiday');
              day.title = holidays[dateKey];
            }
            day.textContent = dayNum;
            grid.appendChild(day);
          }

          // Current month days
          for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            const dayOfWeek = new Date(year, month, i).getDay();
            day.className = 'day';

            const dateKey = formatDateKey(year, month, i);
            if (holidays[dateKey]) {
              day.classList.add('holiday');
              day.title = holidays[dateKey];
            } else {
              if (dayOfWeek === 0) day.classList.add('sunday');
              if (dayOfWeek === 6) day.classList.add('saturday');
            }

            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
              day.classList.add('today');
            }
            day.textContent = i;
            grid.appendChild(day);
          }

          // Next month days
          const nextMonth = month === 11 ? 0 : month + 1;
          const nextYear = month === 11 ? year + 1 : year;
          const totalCells = startDay + daysInMonth;
          const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
          for (let i = 1; i <= remaining; i++) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            const dateKey = formatDateKey(nextYear, nextMonth, i);
            if (holidays[dateKey]) {
              day.classList.add('holiday');
              day.title = holidays[dateKey];
            }
            day.textContent = i;
            grid.appendChild(day);
          }
        }

        function changeMonth(delta) {
          currentDate.setMonth(currentDate.getMonth() + delta);
          renderCalendar();
        }

        // TODO functionality
        let todos = JSON.parse(localStorage.getItem('widgetTodos') || '[]');

        function renderTodos() {
          const list = document.getElementById('todo-list');
          list.innerHTML = '';

          todos.forEach((todo, index) => {
            const item = document.createElement('li');
            item.className = 'todo-item' + (todo.completed ? ' completed' : '');
            item.innerHTML = \`
              <input type="checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${index})">
              <span>\${escapeHtml(todo.text)}</span>
              <button onclick="deleteTodo(\${index})">×</button>
            \`;
            list.appendChild(item);
          });
        }

        function addTodo() {
          const input = document.getElementById('todo-input');
          const text = input.value.trim();
          if (!text) return;

          todos.unshift({ text, completed: false });
          localStorage.setItem('widgetTodos', JSON.stringify(todos));
          input.value = '';
          renderTodos();
        }

        function handleTodoKeypress(e) {
          if (e.key === 'Enter') addTodo();
        }

        function toggleTodo(index) {
          todos[index].completed = !todos[index].completed;
          localStorage.setItem('widgetTodos', JSON.stringify(todos));
          renderTodos();
        }

        function deleteTodo(index) {
          todos.splice(index, 1);
          localStorage.setItem('widgetTodos', JSON.stringify(todos));
          renderTodos();
        }

        function escapeHtml(text) {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        // Memo functionality
        let memoSaveTimeout;

        function initMemo() {
          const textarea = document.getElementById('memo-textarea');
          const status = document.getElementById('memo-status');

          textarea.value = localStorage.getItem('widgetMemo') || '';

          textarea.addEventListener('keyup', () => {
            status.textContent = 'Saving...';
            status.classList.remove('saved');

            clearTimeout(memoSaveTimeout);
            memoSaveTimeout = setTimeout(() => {
              localStorage.setItem('widgetMemo', textarea.value);
              status.textContent = 'Saved';
              status.classList.add('saved');
              setTimeout(() => {
                status.textContent = '';
              }, 2000);
            }, 300);
          });
        }

        function insertMemoTemplate() {
          const textarea = document.getElementById('memo-textarea');
          const status = document.getElementById('memo-status');
          const template = '## \\n\\n- \\n\\n--- \\n';

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;

          textarea.value = text.substring(0, start) + template + text.substring(end);

          // カーソルを ## の後ろに移動
          const newCursorPos = start + 3;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();

          // 保存
          localStorage.setItem('widgetMemo', textarea.value);
          status.textContent = 'Saved';
          status.classList.add('saved');
          setTimeout(() => {
            status.textContent = '';
          }, 2000);
        }

        function copyMemo(btn) {
          const textarea = document.getElementById('memo-textarea');
          const text = textarea.value;

          if (!text) return;

          navigator.clipboard.writeText(text).then(() => {
            btn.classList.add('copied');
            setTimeout(() => {
              btn.classList.remove('copied');
            }, 2000);
          });
        }

        // Load saved theme and widget state on page load
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
            themeToggle.innerHTML = '🌙';
            lightTheme.disabled = false;
            darkTheme.disabled = true;
          }

          // Widget panel state
          const widgetOpen = localStorage.getItem('widgetPanelOpen') === 'true';
          if (widgetOpen) {
            document.querySelector('.main-wrapper').classList.add('widget-open');
          }

          // Widget panel width
          const savedWidth = localStorage.getItem('widgetPanelWidth');
          if (savedWidth) {
            document.querySelector('.widget-panel').style.width = savedWidth + 'px';
          }

          // Section collapsed state
          const collapsed = JSON.parse(localStorage.getItem('widgetCollapsed') || '{}');
          Object.keys(collapsed).forEach(sectionId => {
            if (collapsed[sectionId]) {
              document.getElementById(sectionId)?.classList.add('collapsed');
            }
          });

          // Initialize widgets
          renderCalendar();
          renderTodos();
          initMemo();
        });
      </script>
    </body>
    </html>
  `;

  // HTMLファイルに書き込み
  fs.writeFileSync(outputFile, finalHtml, "utf8");
  console.log("Markdown files have been combined and saved as", outputFile);
});
