// 全局变量存储软件数据
let softwareData = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    loadSoftwareData();
    initModal();
    setupSearch();
});

// 从JSON文件加载数据
async function loadSoftwareData() {
    const container = document.getElementById('softwareList');
    
    try {
        const response = await fetch('data/download.json');
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        
        softwareData = await response.json();
        
        if (!Array.isArray(softwareData) || softwareData.length === 0) {
            throw new Error('数据格式无效');
        }
        
        renderSoftwareList(softwareData);
    } catch (err) {
        console.error('加载失败:', err);
        container.innerHTML = `
            <div class="error-message">
                <h3>数据加载失败</h3>
                <p>${err.message}</p>
                <button onclick="location.reload()">刷新重试</button>
            </div>
        `;
    }
}

// 渲染软件列表
function renderSoftwareList(data) {
    const container = document.getElementById('softwareList');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="empty">没有找到匹配的软件</div>';
        return;
    }

    data.forEach(software => {
        const tags = software.remark.match(/#\w+/g) || [];
        
        const item = document.createElement('div');
        item.className = 'software-item';
        item.innerHTML = `
            <div class="software-header">
                <div>
                    <h3 class="software-title">${software.filename}</h3>
                    <div class="tag-container">
                        ${tags.map(tag => `<span class="software-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <button class="download-btn" data-id="${software.filename}">下载</button>
            </div>
            <p class="software-remark">${software.remark.replace(/#\w+/g, '')}</p>
        `;
        
        container.appendChild(item);
    });

    // 添加按钮事件
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const softwareId = this.getAttribute('data-id');
            showDownloadOptions(softwareId);
        });
    });
}

// 搜索功能
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim().toLowerCase();
        
        if (!keyword) {
            renderSoftwareList(softwareData);
            return;
        }
        
        const filtered = softwareData.filter(item => 
            item.filename.toLowerCase().includes(keyword) || 
            item.remark.toLowerCase().includes(keyword)
        );
        
        renderSoftwareList(filtered);
    });
}



// 初始化弹窗
function initModal() {
    const modal = document.getElementById('downloadModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// 显示下载选项
function showDownloadOptions(softwareId) {
    const software = softwareData.find(item => item.filename === softwareId);
    if (!software) return;
    
    const modal = document.getElementById('downloadModal');
    const title = document.getElementById('modalTitle');
    const optionsContainer = document.getElementById('downloadOptions');
    
    title.textContent = `下载 ${software.filename}`;
    optionsContainer.innerHTML = '';
    
    for (const [version, url] of Object.entries(software.links)) {
        const option = document.createElement('div');
        option.className = 'download-option';
        
        option.innerHTML = `
            <span class="download-version">${version}</span>
            <a href="${url}" class="download-link" target="_blank" rel="noopener">立即下载</a>
        `;
        
        optionsContainer.appendChild(option);
    }
    
    modal.style.display = 'block';
}

// 如果您使用的是实际JSON文件，可以用fetch加载
/*
async function loadSoftwareData() {
    try {
        const response = await fetch('data/software.json');
        if (!response.ok) throw new Error('加载失败');
        softwareData = await response.json();
        renderSoftwareList();
    } catch (err) {
        console.error(err);
        document.getElementById('softwareList').innerHTML = 
            '<div class="error">加载软件列表失败</div>';
    }
}
*/