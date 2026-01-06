/**
 * WebSocket服务
 * 处理与后端的实时通信
 */

import { WS_URL } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.isConnected = false;
  }

  /**
   * 连接WebSocket
   */
  connect() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket连接成功');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.event, message.data);
        } catch (error) {
          console.error('解析WebSocket消息错误:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.isConnected = false;
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket连接关闭');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.attemptReconnect();
    }
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('达到最大重连次数，停止重连');
    }
  }

  /**
   * 发送消息
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket未连接，无法发送消息');
    return false;
  }

  /**
   * 订阅事件
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.isConnected = false;
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 导出单例
export default new WebSocketService();

