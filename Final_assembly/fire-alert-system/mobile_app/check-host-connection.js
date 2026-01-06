/**
 * 检查虚拟机到宿主机的连接
 * 在虚拟机中运行: node check-host-connection.js
 */

const http = require('http');
const WebSocket = require('ws');

// 配置宿主机 IP（根据实际情况修改）
const HOST_IP = process.argv[2] || '192.168.1.100';
const API_PORT = 3000;
const WS_PORT = 3000;

console.log('🔍 检查虚拟机到宿主机的连接...\n');
console.log(`宿主机 IP: ${HOST_IP}`);
console.log(`API 端口: ${API_PORT}`);
console.log(`WebSocket 端口: ${WS_PORT}\n`);

// 测试 HTTP API
function testHTTP() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST_IP,
      port: API_PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ HTTP API 连接成功');
          console.log(`   响应: ${data}`);
          resolve(true);
        } else {
          console.log(`❌ HTTP API 连接失败: 状态码 ${res.statusCode}`);
          reject(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ HTTP API 连接失败: ${error.message}`);
      reject(false);
    });

    req.on('timeout', () => {
      console.log('❌ HTTP API 连接超时');
      req.destroy();
      reject(false);
    });

    req.end();
  });
}

// 测试 WebSocket
function testWebSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${HOST_IP}:${WS_PORT}`);
    const timeout = setTimeout(() => {
      ws.close();
      console.log('❌ WebSocket 连接超时');
      reject(false);
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      console.log('✅ WebSocket 连接成功');
      ws.close();
      resolve(true);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`❌ WebSocket 连接失败: ${error.message}`);
      reject(false);
    });
  });
}

// 主函数
async function main() {
  console.log('开始测试...\n');
  
  let httpOk = false;
  let wsOk = false;

  try {
    await testHTTP();
    httpOk = true;
  } catch (e) {
    httpOk = false;
  }

  console.log('');

  try {
    await testWebSocket();
    wsOk = true;
  } catch (e) {
    wsOk = false;
  }

  console.log('\n' + '='.repeat(50));
  console.log('测试结果总结:');
  console.log(`  HTTP API:  ${httpOk ? '✅ 正常' : '❌ 失败'}`);
  console.log(`  WebSocket:  ${wsOk ? '✅ 正常' : '❌ 失败'}`);
  console.log('='.repeat(50));

  if (httpOk && wsOk) {
    console.log('\n✅ 所有连接测试通过！可以在 App 中使用以下配置:');
    console.log(`   API_URL = 'http://${HOST_IP}:${API_PORT}'`);
    console.log(`   WS_URL = 'ws://${HOST_IP}:${WS_PORT}'`);
    process.exit(0);
  } else {
    console.log('\n❌ 连接测试失败，请检查:');
    console.log('   1. 宿主机 IP 地址是否正确');
    console.log('   2. 宿主机服务是否正在运行');
    console.log('   3. 防火墙设置是否允许连接');
    console.log('   4. 虚拟机网络配置是否正确');
    process.exit(1);
  }
}

// 运行测试
main().catch(console.error);

