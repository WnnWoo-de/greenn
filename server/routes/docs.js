import express from 'express';
import { apiDocs } from '../utils/apiDocs.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Swagger UI页面
router.get('/', (req, res) => {
  const html = apiDocs.generateHTML();
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// OpenAPI JSON规范
router.get('/openapi.json', (req, res) => {
  const openapi = apiDocs.generateOpenAPI();
  res.json(openapi);
});

// Markdown文档
router.get('/markdown', (req, res) => {
  const markdown = apiDocs.generateMarkdown();
  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', 'attachment; filename="api-docs.md"');
  res.send(markdown);
});

// API测试页面
router.get('/test', authenticateToken, (req, res) => {
  const testPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API 测试工具</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #27ae60;
            padding-bottom: 10px;
        }
        .test-section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background-color: #fafafa;
        }
        .test-form {
            display: grid;
            gap: 15px;
        }
        label {
            font-weight: 600;
            color: #34495e;
        }
        input, select, textarea {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        button:hover {
            background: #219a52;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            border-radius: 4px;
        }
        .response pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .error {
            border-left-color: #dc3545;
            background: #f8d7da;
        }
        .success {
            border-left-color: #28a745;
            background: #d4edda;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 API 测试工具</h1>
        <p>使用此工具测试各种API端点。请确保您已经登录并具有适当的权限。</p>
        
        <div class="test-section">
            <h3>🔐 认证测试</h3>
            <div class="test-form">
                <label>测试类型:</label>
                <select id="authTestType">
                    <option value="profile">获取用户资料</option>
                    <option value="updateProfile">更新用户资料</option>
                </select>
                <button onclick="testAuth()">执行测试</button>
                <div id="authResponse" class="response" style="display:none;"></div>
            </div>
        </div>

        <div class="test-section">
            <h3>🌱 活动测试</h3>
            <div class="test-form">
                <label>测试类型:</label>
                <select id="activityTestType">
                    <option value="list">获取活动列表</option>
                    <option value="create">创建新活动</option>
                    <option value="join">参加活动</option>
                </select>
                <label>活动标题 (仅创建时需要):</label>
                <input type="text" id="activityTitle" placeholder="输入活动标题">
                <label>活动描述 (仅创建时需要):</label>
                <textarea id="activityDescription" placeholder="输入活动描述"></textarea>
                <button onclick="testActivity()">执行测试</button>
                <div id="activityResponse" class="response" style="display:none;"></div>
            </div>
        </div>

        <div class="test-section">
            <h3>💬 反馈测试</h3>
            <div class="test-form">
                <label>反馈类型:</label>
                <select id="feedbackType">
                    <option value="feature">功能建议</option>
                    <option value="bug">错误报告</option>
                    <option value="general">一般反馈</option>
                </select>
                <label>主题:</label>
                <input type="text" id="feedbackSubject" placeholder="反馈主题">
                <label>内容:</label>
                <textarea id="feedbackMessage" placeholder="详细描述您的反馈"></textarea>
                <label>评分 (1-5):</label>
                <input type="number" id="feedbackRating" min="1" max="5" value="5">
                <button onclick="testFeedback()">提交反馈</button>
                <div id="feedbackResponse" class="response" style="display:none;"></div>
            </div>
        </div>

        <div class="test-section">
            <h3>🏥 系统健康检查</h3>
            <div class="test-form">
                <button onclick="testHealth()">检查系统状态</button>
                <div id="healthResponse" class="response" style="display:none;"></div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin;
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        async function makeRequest(url, options = {}) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': \`Bearer \${token}\` })
                }
            };
            
            const response = await fetch(API_BASE + url, {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            });
            
            const data = await response.json();
            return { response, data };
        }

        function showResponse(elementId, response, data) {
            const element = document.getElementById(elementId);
            element.style.display = 'block';
            element.className = 'response ' + (response.ok ? 'success' : 'error');
            element.innerHTML = \`
                <strong>状态: \${response.status} \${response.statusText}</strong>
                <pre>\${JSON.stringify(data, null, 2)}</pre>
            \`;
        }

        async function testAuth() {
            const testType = document.getElementById('authTestType').value;
            
            try {
                if (testType === 'profile') {
                    const { response, data } = await makeRequest('/api/users/profile');
                    showResponse('authResponse', response, data);
                } else if (testType === 'updateProfile') {
                    const { response, data } = await makeRequest('/api/users/profile', {
                        method: 'PUT',
                        body: JSON.stringify({
                            bio: '通过API测试工具更新的个人简介 - ' + new Date().toLocaleString()
                        })
                    });
                    showResponse('authResponse', response, data);
                }
            } catch (error) {
                showResponse('authResponse', { ok: false, status: 'ERROR', statusText: 'Network Error' }, { error: error.message });
            }
        }

        async function testActivity() {
            const testType = document.getElementById('activityTestType').value;
            
            try {
                if (testType === 'list') {
                    const { response, data } = await makeRequest('/api/activities?page=1&limit=5');
                    showResponse('activityResponse', response, data);
                } else if (testType === 'create') {
                    const title = document.getElementById('activityTitle').value || '测试活动 - ' + new Date().toLocaleString();
                    const description = document.getElementById('activityDescription').value || '这是一个通过API测试工具创建的测试活动';
                    
                    const { response, data } = await makeRequest('/api/activities', {
                        method: 'POST',
                        body: JSON.stringify({
                            title,
                            description,
                            category: '测试分类',
                            location: '测试地点',
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 86400000).toISOString()
                        })
                    });
                    showResponse('activityResponse', response, data);
                }
            } catch (error) {
                showResponse('activityResponse', { ok: false, status: 'ERROR', statusText: 'Network Error' }, { error: error.message });
            }
        }

        async function testFeedback() {
            const type = document.getElementById('feedbackType').value;
            const subject = document.getElementById('feedbackSubject').value || '测试反馈 - ' + new Date().toLocaleString();
            const message = document.getElementById('feedbackMessage').value || '这是一个通过API测试工具提交的测试反馈';
            const rating = parseInt(document.getElementById('feedbackRating').value);
            
            try {
                const { response, data } = await makeRequest('/api/feedback', {
                    method: 'POST',
                    body: JSON.stringify({ type, subject, message, rating })
                });
                showResponse('feedbackResponse', response, data);
            } catch (error) {
                showResponse('feedbackResponse', { ok: false, status: 'ERROR', statusText: 'Network Error' }, { error: error.message });
            }
        }

        async function testHealth() {
            try {
                const { response, data } = await makeRequest('/health/detailed');
                showResponse('healthResponse', response, data);
            } catch (error) {
                showResponse('healthResponse', { ok: false, status: 'ERROR', statusText: 'Network Error' }, { error: error.message });
            }
        }

        // 页面加载时检查token
        window.onload = function() {
            if (!token) {
                document.body.innerHTML = \`
                    <div class="container">
                        <h1>⚠️ 需要登录</h1>
                        <p>请先登录获取访问令牌，然后将令牌保存到浏览器的localStorage或sessionStorage中。</p>
                        <p>令牌键名: <code>token</code></p>
                        <p>您可以通过以下方式获取令牌:</p>
                        <ol>
                            <li>使用 <code>POST /api/auth/login</code> 端点登录</li>
                            <li>从响应中复制JWT令牌</li>
                            <li>在浏览器控制台中运行: <code>localStorage.setItem('token', 'your-jwt-token')</code></li>
                            <li>刷新此页面</li>
                        </ol>
                    </div>
                \`;
            }
        };
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(testPage);
});

// API状态概览
router.get('/status', (req, res) => {
  const routes = apiDocs.routes;
  const routesByTag = {};
  
  routes.forEach(route => {
    const tag = route.tags[0] || 'Default';
    if (!routesByTag[tag]) {
      routesByTag[tag] = [];
    }
    routesByTag[tag].push({
      method: route.method,
      path: route.path,
      summary: route.summary
    });
  });

  res.json({
    totalRoutes: routes.length,
    routesByTag,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;