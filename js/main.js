// 初始化Marked.js
marked.setOptions({
    breaks: true,
    gfm: true
});

// 默认加载首页文章
window.addEventListener('DOMContentLoaded', function () {
    loadArticle('articles/HomePage.md', 'article-content');

    // 设置导航点击事件
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // 移除所有active类
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // 添加active类到当前点击的链接和对应的内容
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // 根据标签加载相应内容
            switch (tabId) {
                case 'articles':
                    loadArticle('articles/HomePage.md', 'article-content');
                    break;
                case 'works':
                    loadArticle('works/Works.md', 'works-content');
                    break;
                case 'tools':
                    loadArticle('tools/Tools.md', 'tools-content');
                    break;
                case 'downloads':
                    loadDownloads();
                    break;
            }
        });
    });
});

// 加载Markdown文件的函数
function loadArticle(filePath, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loader"></div>';

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('文件加载失败: ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            container.innerHTML = marked(text);
        })
        .catch(error => {
            container.innerHTML = `
                <div class="error-message">
                    <h3>加载内容时出错</h3>
                    <p>${error.message}</p>
                    <p>请检查文件路径是否正确: ${filePath}</p>
                </div>
            `;
        });
}

// 加载下载列表
function loadDownloads() {
    const downloadList = document.getElementById('download-list');

    if (!downloadList) return;

    downloadList.innerHTML = '<div class="loader"></div>';

    // 从downloads.json文件加载数据
    fetch('downloads.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('下载列表加载失败: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            renderDownloads(data);
        })
        .catch(error => {
            downloadList.innerHTML = `
                <div class="error-message">
                    <h3>加载下载列表时出错</h3>
                    <p>${error.message}</p>
                    <p>请确保downloads.json文件存在且格式正确</p>
                </div>
            `;
        });
}

// 渲染下载列表
function renderDownloads(data) {
    const downloadList = document.getElementById('download-list');

    if (!downloadList) return;

    let html = '';
    for (const item of data) {
        const { filename, remark, links } = item;

        html += `
            <div class="download-item">
                <div class="download-header">
                    <span class="download-name">${filename}</span>
                    <button class="download-btn" data-links='${JSON.stringify(links)}' data-filename="${filename}">下载</button>
                </div>
                <p class="download-desc">${remark}</p>
            </div>
        `;
    }

    downloadList.innerHTML = html;

    // 为每个下载按钮绑定点击事件
    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', () => {
            const links = JSON.parse(button.dataset.links);
            const filename = button.dataset.filename;

            // 更新弹窗标题
            document.getElementById('download-title').textContent = `选择下载 - ${filename}`;

            // 动态生成版本按钮
            const versionButtons = document.getElementById('version-buttons');
            versionButtons.innerHTML = ''; // 清空之前的按钮
            for (const [version, link] of Object.entries(links)) {
                const versionButton = document.createElement('button');
                versionButton.textContent = version;
                versionButton.className = 'version-button';
                versionButton.addEventListener('click', () => {
                    window.open(link, '_blank');
                    closeDownloadModal();
                });
                versionButtons.appendChild(versionButton);
            }

            // 显示弹窗
            const modal = document.getElementById('download-modal');
            modal.style.display = 'flex';
        });
    });
}

// 关闭下载弹窗
function closeDownloadModal() {
    const modal = document.getElementById('download-modal');
    modal.style.display = 'none';
}

// 绑定关闭弹窗按钮事件
document.getElementById('close-download-modal').addEventListener('click', closeDownloadModal);

// 初始化加载下载列表
document.addEventListener('DOMContentLoaded', () => {
    loadDownloads();
});



// 加载文章列表
function loadArticleList() {
    const articleList = document.getElementById("article-list");
    articleList.innerHTML = '<div class="loader"></div>';
    
    // 从articles.json文件加载文章列表
    fetch('articles/articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('文章列表加载失败: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            renderArticleList(data);
        })
        .catch(error => {
            articleList.innerHTML = `
                <div class="error-message">
                    <h3>加载文章列表时出错</h3>
                    <p>${error.message}</p>
                    <p>请确保articles.json文件存在且格式正确</p>
                </div>
            `;
        });
}

// 渲染文章列表
function renderArticleList(data) {
    const articleList = document.getElementById("article-list");
    articleList.innerHTML = "";
    data.forEach(article => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = article.title;
        a.dataset.file = article.file;
        a.addEventListener("click", () => loadArticle(article.file, "article-content"));
        li.appendChild(a);
        articleList.appendChild(li);
    });
}

// 加载文章内容
function loadArticleContent(id) {
    const article = articles.find(a => a.id === id);
    const articleContent = document.getElementById("article-content");
    if (article) {
        articleContent.innerHTML = `<h1>${article.title}</h1><p>${article.content}</p>`;
    } else {
        articleContent.innerHTML = "<p>文章未找到。</p>";
    }
}

// 搜索文章
document.getElementById("search-articles").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const filteredArticles = articles.filter(article => article.title.toLowerCase().includes(query));
    const articleList = document.getElementById("article-list");
    articleList.innerHTML = "";
    filteredArticles.forEach(article => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = article.title;
        a.dataset.id = article.id;
        a.addEventListener("click", () => loadArticleContent(article.id));
        li.appendChild(a);
        articleList.appendChild(li);
    });
});

// ...existing code...

// 头像点击事件
document.getElementById('avatar').addEventListener('click', function () {
    const modal = document.getElementById('avatar-modal');
    modal.style.display = 'flex';
});

// 关闭弹窗
document.getElementById('close-modal').addEventListener('click', function () {
    const modal = document.getElementById('avatar-modal');
    modal.style.display = 'none';
});

// 点击弹窗外部关闭弹窗
window.addEventListener('click', function (event) {
    const modal = document.getElementById('avatar-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
// 初始化
document.addEventListener("DOMContentLoaded", () => {
    loadArticleList();
});

// 切换主题功能
const themeToggleButton = document.getElementById('theme-toggle');

// 监听键盘快捷键（例如双击 "T" 键）
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 't') {
        document.body.classList.toggle('dark-theme');
    }
});

// 监听按钮点击事件（备用）
themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});