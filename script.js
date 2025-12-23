let discussions = [];
let currentView = 'list';
let selectedThreadId = null;
let filterCategory = 'all';
let searchQuery = '';

function initializeStorage() {
    const stored = localStorage.getItem('csfhk_discussions');
    if (stored) {
        discussions = JSON.parse(stored);
    } else {
        discussions = [];
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem('csfhk_discussions', JSON.stringify(discussions));
}

function getNextId() {
    if (discussions.length === 0) return 1;
    return Math.max(...discussions.map(d => d.id)) + 1;
}

document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    renderDiscussions();
    setupEventListeners();
    animateTerminal();
    updateStats();
});

function renderDiscussions() {
    const container = document.getElementById('threadsContainer');
    
    if (currentView === 'thread') {
        renderThreadDetail();
        return;
    }
    
    container.innerHTML = '';
    
    let filtered = discussions;
    
    if (filterCategory !== 'all') {
        filtered = filtered.filter(t => t.category === filterCategory);
    }
    
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.content.toLowerCase().includes(query) ||
            t.author.toLowerCase().includes(query)
        );
    }
    
    filtered.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">暫無討論主題，成為第一個發表的人吧！</p>';
        return;
    }

    filtered.forEach(thread => {
        const threadElement = createThreadElement(thread);
        container.appendChild(threadElement);
    });
}

function createThreadElement(thread) {
    const threadDiv = document.createElement('div');
    threadDiv.className = 'thread-item';
    const repliesCount = thread.replies ? thread.replies.length : 0;
    threadDiv.innerHTML = `
        <div class="thread-header">
            <div class="thread-title-section">
                <div class="thread-title" onclick="viewThread(${thread.id})">${escapeHtml(thread.title)}</div>
            </div>
            <div class="thread-actions">
                <span class="thread-category">${getCategoryName(thread.category)}</span>
                <button class="btn-delete-thread" onclick="deleteThread(${thread.id}, event)" title="刪除">×</button>
            </div>
        </div>
        <div class="thread-content" onclick="viewThread(${thread.id})">${escapeHtml(thread.content.substring(0, 200))}${thread.content.length > 200 ? '...' : ''}</div>
        <div class="thread-meta">
            <span>👤 ${escapeHtml(thread.author)}</span>
            <span>📅 ${thread.date} ${thread.time || ''}</span>
            <span>💬 ${repliesCount} 回覆</span>
            <span>👁️ ${thread.views || 0} 瀏覽</span>
        </div>
    `;
    return threadDiv;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function viewThread(id) {
    selectedThreadId = id;
    currentView = 'thread';
    renderDiscussions();
}

function renderThreadDetail() {
    const container = document.getElementById('threadsContainer');
    const thread = discussions.find(t => t.id === selectedThreadId);
    
    if (!thread) {
        currentView = 'list';
        renderDiscussions();
        return;
    }
    
    thread.views = (thread.views || 0) + 1;
    saveToStorage();
    
    const replies = thread.replies || [];
    container.innerHTML = `
        <div class="thread-detail-actions">
            <button class="btn-back" onclick="backToList()">← 返回列表</button>
        </div>
        <div class="thread-detail">
            <div class="thread-detail-header">
                <h2 class="thread-detail-title">${escapeHtml(thread.title)}</h2>
                <span class="thread-category">${getCategoryName(thread.category)}</span>
            </div>
            <div class="thread-detail-meta">
                <span>👤 ${escapeHtml(thread.author)}</span>
                <span>📅 ${thread.date} ${thread.time || ''}</span>
                <span>👁️ ${thread.views} 瀏覽</span>
            </div>
            <div class="thread-detail-content">${escapeHtml(thread.content).replace(/\n/g, '<br>')}</div>
        </div>
        <div class="replies-section">
            <h3 class="replies-title">回覆 (${replies.length})</h3>
            <div class="replies-container" id="repliesContainer">
                ${replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-header">
                            <strong>${escapeHtml(reply.author)}</strong>
                            <span class="reply-date">${reply.date} ${reply.time || ''}</span>
                        </div>
                        <div class="reply-content">${escapeHtml(reply.content).replace(/\n/g, '<br>')}</div>
                    </div>
                `).join('')}
            </div>
            <div class="reply-form-container">
                <h4>發表回覆</h4>
                <form id="replyForm" onsubmit="submitReply(event)">
                    <div class="form-group">
                        <label for="replyAuthor">您的名稱</label>
                        <input type="text" id="replyAuthor" required>
                    </div>
                    <div class="form-group">
                        <label for="replyContent">回覆內容</label>
                        <textarea id="replyContent" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn-submit">發表回覆</button>
                </form>
            </div>
        </div>
    `;
}

function backToList() {
    currentView = 'list';
    selectedThreadId = null;
    renderDiscussions();
}

function submitReply(event) {
    event.preventDefault();
    const thread = discussions.find(t => t.id === selectedThreadId);
    if (!thread) return;
    
    const author = document.getElementById('replyAuthor').value;
    const content = document.getElementById('replyContent').value;
    const now = new Date();
    
    if (!thread.replies) thread.replies = [];
    
    thread.replies.push({
        id: Date.now(),
        author: author,
        content: content,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5)
    });
    
    saveToStorage();
    renderThreadDetail();
    document.getElementById('replyForm').reset();
    showNotification('回覆發布成功！', 'success');
}

function deleteThread(id, event) {
    event.stopPropagation();
    if (confirm('確定要刪除此主題嗎？')) {
        discussions = discussions.filter(t => t.id !== id);
        saveToStorage();
        renderDiscussions();
        showNotification('主題已刪除', 'success');
    }
}

function getCategoryName(category) {
    const categoryMap = {
        'ctf': 'CTF 題目',
        'security': '網絡安全',
        'general': '一般討論',
        'news': '新聞分享'
    };
    return categoryMap[category] || category;
}

function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterCategory = category;
            document.getElementById('discussions').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('categoryFilter').value = category;
            renderDiscussions();
        });
    });

    const newPostBtn = document.getElementById('newPostBtn');
    const newPostModal = document.getElementById('newPostModal');
    const closeModal = document.getElementById('closeModal');
    const newPostForm = document.getElementById('newPostForm');

    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            newPostModal.classList.add('active');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            newPostModal.classList.remove('active');
        });
    }

    if (newPostModal) {
        newPostModal.addEventListener('click', (e) => {
            if (e.target === newPostModal) {
                newPostModal.classList.remove('active');
            }
        });
    }

    if (newPostForm) {
        newPostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createNewPost();
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderDiscussions();
        });
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterCategory = e.target.value;
            renderDiscussions();
        });
    }
}

function createNewPost() {
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value.trim();
    const author = document.getElementById('postAuthor').value.trim();

    if (!title || !content || !author) {
        showNotification('請填寫所有必填欄位', 'error');
        return;
    }

    const now = new Date();
    const newThread = {
        id: getNextId(),
        title: title,
        category: category,
        content: content,
        author: author,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        replies: [],
        views: 0
    };

    discussions.unshift(newThread);
    saveToStorage();
    renderDiscussions();
    
    document.getElementById('newPostModal').classList.remove('active');
    document.getElementById('newPostForm').reset();
    
    showNotification('主題發布成功！', 'success');
    
    document.getElementById('discussions').scrollIntoView({ behavior: 'smooth' });
}

function animateTerminal() {
    const terminalOutput = document.querySelector('.terminal-output');
    if (!terminalOutput) return;
    const lines = terminalOutput.querySelectorAll('p');
    
    lines.forEach((line, index) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.transition = 'opacity 0.5s ease';
            line.style.opacity = '1';
        }, index * 200);
    });
}

function updateStats() {
    const userCountElement = document.getElementById('userCount');
    const topicCountElement = document.getElementById('topicCount');
    
    if (userCountElement) {
        const uniqueAuthors = new Set(discussions.map(d => d.author).concat(
            discussions.flatMap(d => (d.replies || []).map(r => r.author))
        )).size;
        userCountElement.textContent = uniqueAuthors || 0;
    }
    
    if (topicCountElement) {
        topicCountElement.textContent = discussions.length;
    }
    
    const categoryCounts = {
        'web': 0,
        'crypto': 0,
        'forensics': 0,
        'reverse': 0,
        'pwn': 0,
        'misc': 0
    };
    
    discussions.forEach(d => {
        if (categoryCounts.hasOwnProperty(d.category)) {
            categoryCounts[d.category]++;
        }
    });
    
    document.querySelectorAll('.category-card').forEach((card) => {
        const category = card.getAttribute('data-category');
        if (category && categoryCounts[category] !== undefined) {
            const statsSpan = card.querySelector('.category-discussion-count');
            if (statsSpan) {
                statsSpan.textContent = `${categoryCounts[category]} 討論`;
            }
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--danger)' : 'var(--accent-cyan)';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: var(--bg-primary);
        padding: 1rem 2rem;
        border-radius: 4px;
        font-weight: bold;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
        font-family: 'JetBrains Mono', monospace;
    `;
    notification.textContent = message;
    
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

const terminalCommand = document.querySelector('.command');
if (terminalCommand) {
    const commandText = terminalCommand.textContent;
    terminalCommand.textContent = '';
    let index = 0;
    
    function typeCommand() {
        if (index < commandText.length) {
            terminalCommand.textContent += commandText.charAt(index);
            index++;
            setTimeout(typeCommand, 100);
        }
    }
    
    setTimeout(typeCommand, 1000);
}

setInterval(updateStats, 10000);


