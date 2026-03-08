# 俄罗斯方块游戏 - 故障排除指南

## 🐛 常见问题

### 问题 1: 无法开始游戏

#### 可能原因：

1. **浏览器兼容性问题**
   - 某些旧浏览器不支持 ES6+ 语法
   - 解决：使用现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）

2. **JavaScript 加载失败**
   - 检查浏览器控制台是否有错误（F12 → Console）
   - 解决：确保 `tetris.js` 文件在正确位置

3. **Canvas 元素未找到**
   - 游戏依赖 `<canvas id="gameCanvas">` 元素
   - 解决：确保 HTML 正确加载

#### 解决步骤：

1. **打开浏览器开发者工具**
   - 按 `F12` 或右键 → 检查
   - 查看 Console 标签页是否有错误

2. **检查网络请求**
   - 在 Network 标签页中，确保 `tetris.js` 成功加载（状态 200）
   - 如果失败，检查文件路径是否正确

3. **测试诊断页面**
   - 访问 `diagnose.html` 查看详细诊断信息
   - 这会检查所有必需的 DOM 元素和函数

4. **清除浏览器缓存**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)
   - 有时旧版本代码会缓存

### 问题 2: 游戏无法暂停

#### 检查项：
- 确保游戏已经开始（不是在初始状态）
- 确保没有游戏结束（gameOver = false）
- 确保当前有活动的方块（currentPiece 不为 null）

### 问题 3: 按键无响应

#### 检查项：
- 确保游戏窗口已获得焦点（点击游戏区域）
- 检查是否启用了禁用某些按键的浏览器扩展
- 尝试使用移动端控制按钮（如果可见）

### 问题 4: 移动端无响应

#### 检查项：
- 确保触摸事件被正确绑定
- 检查 `initMobileControls()` 是否被调用
- 在 `diagnose.html` 中检查移动端控制元素

### 问题 5: 样式显示异常

#### 检查项：
- 确保 `style.css` 成功加载
- 检查 Network 标签页，确保 CSS 文件状态为 200
- 清除浏览器缓存

---

## 🔧 开发者调试

### 使用诊断工具

1. **本地测试诊断页面**
   ```bash
   cd /root/.openclaw/workspace-dev/projects/tetris
   python3 -m http.server 8080
   ```
   然后访问 `http://localhost:8080/diagnose.html`

2. **查看诊断日志**
   - 点击"运行诊断"按钮
   - 查看所有 DOM 元素是否正确加载
   - 检查游戏函数是否正确定义

### 测试脚本

运行 Node.js 测试：
```bash
cd /root/.openclaw/workspace-dev/projects/tetris
node test-game.js
```

### 检查 JavaScript 语法

```bash
node -c tetris.js
```

---

## 📱 部署问题

### GitHub Pages 无法访问

**检查清单：**
1. ✓ GitHub Pages 已启用（Settings → Pages）
2. ✓ 分支设置为 `main` 或 `master`
3. ✓ 文件夹设置为 `/`（根目录）
4. ✓ `.github/workflows/deploy.yml` 存在
5. ✓ 代码已推送到 GitHub

**如果仍然无法访问：**
1. 检查 GitHub Actions 构建状态
2. 查看构建日志是否有错误
3. 等待 1-2 分钟让部署完成
4. 清除浏览器缓存

---

## 🎯 快速修复步骤

### 1. 打开游戏
访问: https://xgame.ai/tetris/

### 2. 打开开发者工具
按 `F12` → Console

### 3. 运行诊断
在 Console 中粘贴：
```javascript
console.log('检查游戏状态:');
console.log('currentPiece:', typeof currentPiece !== 'undefined' ? currentPiece : '未定义');
console.log('gameOver:', typeof gameOver !== 'undefined' ? gameOver : '未定义');
console.log('isPaused:', typeof isPaused !== 'undefined' ? isPaused : '未定义');
console.log('startGame 函数:', typeof startGame);
console.log('init 函数:', typeof init);
```

### 4. 尝试手动启动
在 Console 中运行：
```javascript
if (typeof init === 'function') {
    init();
    console.log('✓ init() 已调用');
} else {
    console.log('✗ init 函数不存在');
}

if (typeof startGame === 'function') {
    startGame();
    console.log('✓ startGame() 已调用');
} else {
    console.log('✗ startGame 函数不存在');
}
```

### 5. 如果仍然失败
1. 检查 Console 中的错误信息
2. 截图并分享错误信息
3. 检查 Network 标签页，确保所有资源加载成功

---

## 🆘 获取帮助

如果以上步骤都无法解决问题：

1. **截图错误信息**
   - Console 标签页的错误
   - Network 标签页的失败请求

2. **提供浏览器信息**
   - 浏览器名称和版本
   - 操作系统
   - 访问的 URL

3. **检查 GitHub Issues**
   - 访问项目 GitHub 仓库
   - 搜索相似问题

---

## ✅ 预期的正常状态

游戏正常时，Console 应该显示：
```
[INFO] 页面加载完成
[INFO] 浏览器: ...
[SUCCESS] ✓ 找到元素: gameCanvas
[SUCCESS] ✓ 找到元素: nextCanvas
[SUCCESS] ✓ 找到元素: startBtn
[SUCCESS] ✓ 找到元素: pauseBtn
...
```

**没有红色错误信息！**

---

*最后更新: 2026-03-08*
