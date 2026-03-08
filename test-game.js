// 测试脚本 - 模拟游戏初始化
console.log('开始测试俄罗斯方块游戏...');

// 模拟全局对象
global.document = {
  getElementById: function(id) {
    console.log('获取元素: ' + id);
    if (id === 'game' || id === 'gameCanvas') {
      return {
        width: 300,
        height: 600,
        getContext: function() {
          return {
            fillStyle: null,
            fillRect: function() {},
            strokeStyle: null,
            strokeRect: function() {}
          };
        }
      };
    }
    if (id === 'next' || id === 'nextCanvas') {
      return {
        width: 100,
        height: 100,
        getContext: function() {
          return {
            fillStyle: null,
            fillRect: function() {}
          };
        }
      };
    }
    if (id === 'startBtn' || id === 'pauseBtn') {
      return {
        textContent: '',
        addEventListener: function() {}
      };
    }
    if (id === 'score' || id === 'level' || id === 'lines') {
      return {
        textContent: ''
      };
    }
    if (id === 'mobileControls' || id === 'effectsCanvas' || id === 'comboDisplay' || id === 'startHint') {
      return null;
    }
    if (id === 'mobileScoreValue' || id === 'mobileLevelValue') {
      return { textContent: '' };
    }
    return null;
  },
  querySelector: function() {
    return null;
  },
  querySelectorAll: function() {
    return [];
  },
  createElement: function(tag) {
    return {
      style: {},
      addEventListener: function() {},
      appendChild: function() {},
      classList: {
        add: function() {},
        remove: function() {}
      }
    };
  },
  body: {
    appendChild: function() {},
    removeChild: function() {}
  },
  addEventListener: function() {}
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: function() {}
};

global.requestAnimationFrame = function(callback) {
  // 不实际运行动画循环
};

// 加载游戏代码
var gameCode = require('fs').readFileSync('./tetris.js', 'utf8');

try {
  console.log('执行游戏代码...');
  eval(gameCode);
  console.log('✓ 游戏代码执行成功');
} catch (error) {
  console.error('✗ 错误:', error.message);
  console.error('堆栈:', error.stack);
  process.exit(1);
}

console.log('✓ 所有测试通过！');
