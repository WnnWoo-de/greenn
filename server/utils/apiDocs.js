/**
 * API Documentation Generator
 * 自动生成API文档的工具类
 */

export class ApiDocGenerator {
  constructor() {
    this.routes = [];
    this.schemas = {};
  }

  /**
   * 添加路由文档
   */
  addRoute(config) {
    const route = {
      method: config.method.toUpperCase(),
      path: config.path,
      summary: config.summary,
      description: config.description,
      tags: config.tags || [],
      parameters: config.parameters || [],
      requestBody: config.requestBody,
      responses: config.responses || {},
      security: config.security || [],
      examples: config.examples || {}
    };
    
    this.routes.push(route);
    return this;
  }

  /**
   * 添加数据模型
   */
  addSchema(name, schema) {
    this.schemas[name] = schema;
    return this;
  }

  /**
   * 生成OpenAPI 3.0规范
   */
  generateOpenAPI() {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: 'Green Environmental API',
        version: '1.0.0',
        description: '绿色环保应用后端API文档',
        contact: {
          name: 'API Support',
          email: 'support@greenn.com'
        }
      },
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:3001',
          description: '开发服务器'
        }
      ],
      paths: {},
      components: {
        schemas: this.schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };

    // 生成路径文档
    this.routes.forEach(route => {
      const path = route.path;
      const method = route.method.toLowerCase();
      
      if (!openapi.paths[path]) {
        openapi.paths[path] = {};
      }
      
      openapi.paths[path][method] = {
        summary: route.summary,
        description: route.description,
        tags: route.tags,
        parameters: route.parameters,
        responses: route.responses,
        security: route.security
      };
      
      if (route.requestBody) {
        openapi.paths[path][method].requestBody = route.requestBody;
      }
    });

    return openapi;
  }

  /**
   * 生成HTML文档
   */
  generateHTML() {
    const openapi = this.generateOpenAPI();
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Green Environmental API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/docs/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
  }

  /**
   * 生成Markdown文档
   */
  generateMarkdown() {
    let markdown = `# Green Environmental API Documentation

## 概述
绿色环保应用后端API文档

## 基础信息
- **Base URL**: ${process.env.API_BASE_URL || 'http://localhost:3001'}
- **版本**: 1.0.0
- **认证方式**: Bearer Token (JWT)

## 认证
大部分API需要在请求头中包含JWT token：
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## API端点

`;

    // 按标签分组路由
    const routesByTag = {};
    this.routes.forEach(route => {
      const tag = route.tags[0] || 'Default';
      if (!routesByTag[tag]) {
        routesByTag[tag] = [];
      }
      routesByTag[tag].push(route);
    });

    // 生成每个标签的文档
    Object.keys(routesByTag).forEach(tag => {
      markdown += `### ${tag}\n\n`;
      
      routesByTag[tag].forEach(route => {
        markdown += `#### ${route.method} ${route.path}\n\n`;
        markdown += `**描述**: ${route.description || route.summary}\n\n`;
        
        if (route.parameters && route.parameters.length > 0) {
          markdown += `**参数**:\n`;
          route.parameters.forEach(param => {
            markdown += `- \`${param.name}\` (${param.in}): ${param.description}\n`;
          });
          markdown += '\n';
        }
        
        if (route.requestBody) {
          markdown += `**请求体**:\n\`\`\`json\n${JSON.stringify(route.requestBody.content['application/json'].example || {}, null, 2)}\n\`\`\`\n\n`;
        }
        
        markdown += `**响应**:\n`;
        Object.keys(route.responses).forEach(code => {
          const response = route.responses[code];
          markdown += `- \`${code}\`: ${response.description}\n`;
        });
        markdown += '\n---\n\n';
      });
    });

    return markdown;
  }
}

// 预定义的API文档配置
export const apiDocs = new ApiDocGenerator();

// 认证相关API
apiDocs
  .addRoute({
    method: 'POST',
    path: '/api/auth/register',
    summary: '用户注册',
    description: '创建新用户账户',
    tags: ['认证'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
              username: { type: 'string', example: 'john_doe' },
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              password: { type: 'string', minLength: 6, example: 'password123' }
            }
          }
        }
      }
    },
    responses: {
      '201': { description: '注册成功' },
      '400': { description: '请求参数错误' },
      '409': { description: '用户已存在' }
    }
  })
  .addRoute({
    method: 'POST',
    path: '/api/auth/login',
    summary: '用户登录',
    description: '用户登录获取JWT token',
    tags: ['认证'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              password: { type: 'string', example: 'password123' }
            }
          }
        }
      }
    },
    responses: {
      '200': { description: '登录成功，返回JWT token' },
      '401': { description: '认证失败' }
    }
  });

// 用户相关API
apiDocs
  .addRoute({
    method: 'GET',
    path: '/api/users/profile',
    summary: '获取用户资料',
    description: '获取当前登录用户的详细资料',
    tags: ['用户'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': { description: '成功获取用户资料' },
      '401': { description: '未授权访问' }
    }
  })
  .addRoute({
    method: 'PUT',
    path: '/api/users/profile',
    summary: '更新用户资料',
    description: '更新当前登录用户的资料信息',
    tags: ['用户'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              email: { type: 'string', format: 'email' },
              bio: { type: 'string' },
              avatar: { type: 'string' }
            }
          }
        }
      }
    },
    responses: {
      '200': { description: '资料更新成功' },
      '400': { description: '请求参数错误' },
      '401': { description: '未授权访问' }
    }
  });

// 活动相关API
apiDocs
  .addRoute({
    method: 'GET',
    path: '/api/activities',
    summary: '获取活动列表',
    description: '获取环保活动列表，支持分页和筛选',
    tags: ['活动'],
    parameters: [
      { name: 'page', in: 'query', description: '页码', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', description: '每页数量', schema: { type: 'integer', default: 10 } },
      { name: 'category', in: 'query', description: '活动分类', schema: { type: 'string' } },
      { name: 'status', in: 'query', description: '活动状态', schema: { type: 'string' } }
    ],
    responses: {
      '200': { description: '成功获取活动列表' }
    }
  })
  .addRoute({
    method: 'POST',
    path: '/api/activities',
    summary: '创建新活动',
    description: '创建新的环保活动',
    tags: ['活动'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'description', 'category'],
            properties: {
              title: { type: 'string', example: '社区垃圾清理活动' },
              description: { type: 'string', example: '组织社区居民进行垃圾清理' },
              category: { type: 'string', example: '环境清洁' },
              location: { type: 'string', example: '中央公园' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    responses: {
      '201': { description: '活动创建成功' },
      '400': { description: '请求参数错误' },
      '401': { description: '未授权访问' }
    }
  });

// 反馈相关API
apiDocs
  .addRoute({
    method: 'POST',
    path: '/api/feedback',
    summary: '提交反馈',
    description: '用户提交反馈意见或建议',
    tags: ['反馈'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['type', 'subject', 'message'],
            properties: {
              type: { type: 'string', enum: ['bug', 'feature', 'general'], example: 'feature' },
              subject: { type: 'string', example: '建议添加碳足迹计算功能' },
              message: { type: 'string', example: '希望能够添加个人碳足迹计算和跟踪功能' },
              rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 }
            }
          }
        }
      }
    },
    responses: {
      '201': { description: '反馈提交成功' },
      '400': { description: '请求参数错误' },
      '401': { description: '未授权访问' }
    }
  });

// 健康检查API
apiDocs
  .addRoute({
    method: 'GET',
    path: '/health',
    summary: '基础健康检查',
    description: '检查服务器基本状态',
    tags: ['系统'],
    responses: {
      '200': { description: '服务正常运行' }
    }
  })
  .addRoute({
    method: 'GET',
    path: '/health/detailed',
    summary: '详细健康检查',
    description: '获取详细的系统状态信息',
    tags: ['系统'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': { description: '成功获取详细状态信息' },
      '401': { description: '未授权访问' }
    }
  });

// 监控端点
apiDocs
  .addRoute({
    method: 'GET',
    path: '/api/monitoring/performance',
    summary: '系统性能监控',
    description: '获取系统性能指标，包括内存、CPU、数据库等信息',
    tags: ['监控'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': { 
        description: '成功获取性能指标',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                system: {
                  type: 'object',
                  properties: {
                    uptime: { type: 'number', description: '系统运行时间（秒）' },
                    memory: { type: 'object', description: '内存使用情况' },
                    cpu: { type: 'object', description: 'CPU信息' },
                    platform: { type: 'string', description: '操作系统平台' },
                    nodeVersion: { type: 'string', description: 'Node.js版本' }
                  }
                },
                database: { type: 'object', description: '数据库性能指标' },
                cache: { type: 'object', description: '缓存统计信息' }
              }
            }
          }
        }
      },
      '401': { description: '未授权访问' }
    }
  })
  .addRoute({
    method: 'GET',
    path: '/api/monitoring/cache',
    summary: '缓存统计信息',
    description: '获取详细的缓存使用统计，包括命中率、键数量等',
    tags: ['监控'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': { 
        description: '成功获取缓存统计',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                global: { type: 'object', description: '全局缓存统计' },
                activity: { type: 'object', description: '活动缓存统计' },
                user: { type: 'object', description: '用户缓存统计' },
                summary: {
                  type: 'object',
                  properties: {
                    totalKeys: { type: 'number', description: '总键数' },
                    totalHits: { type: 'number', description: '总命中数' },
                    totalMisses: { type: 'number', description: '总未命中数' },
                    overallHitRate: { type: 'string', description: '总体命中率' }
                  }
                }
              }
            }
          }
        }
      },
      '401': { description: '未授权访问' }
    }
  })
  .addRoute({
    method: 'POST',
    path: '/api/monitoring/cache/clear',
    summary: '清理缓存',
    description: '清理指定类型的缓存或全部缓存',
    tags: ['监控'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              type: { 
                type: 'string', 
                enum: ['global', 'activity', 'user', 'all'],
                description: '要清理的缓存类型，默认为all'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': { 
        description: '缓存清理成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                clearedCaches: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      '400': { description: '请求参数错误' },
      '401': { description: '未授权访问' }
    }
  })
  .addRoute({
    method: 'GET',
    path: '/api/monitoring/database',
    summary: '数据库性能监控',
    description: '获取数据库查询统计和性能指标',
    tags: ['监控'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': { 
        description: '成功获取数据库性能指标',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                queryStats: { type: 'object', description: '查询统计信息' },
                slowQueries: { type: 'array', description: '慢查询列表' },
                cacheHitRate: { type: 'string', description: '查询缓存命中率' },
                connectionPool: { type: 'object', description: '连接池状态' }
              }
            }
          }
        }
      },
      '401': { description: '未授权访问' }
    }
  })
  .addRoute({
    method: 'POST',
    path: '/api/monitoring/database/reset-stats',
    summary: '重置数据库统计',
    description: '重置数据库查询统计信息',
    tags: ['监控'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': { 
        description: '统计信息重置成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                resetTime: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      },
      '401': { description: '未授权访问' }
    }
  });

export default apiDocs;