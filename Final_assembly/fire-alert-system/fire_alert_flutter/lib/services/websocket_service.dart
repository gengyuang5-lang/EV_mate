import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../utils/constants.dart';

/// WebSocket服务
/// 处理与后端的实时通信
class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;
  WebSocketService._internal();

  WebSocketChannel? _channel;
  bool _isConnected = false;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 3);
  Timer? _reconnectTimer;

  final Map<String, List<Function>> _listeners = {};

  bool get isConnected => _isConnected;

  /// 连接WebSocket
  void connect() {
    try {
      _channel?.sink.close();
      _channel = WebSocketChannel.connect(Uri.parse(AppConstants.wsUrl));

      _channel!.stream.listen(
        (message) {
          try {
            final data = json.decode(message);
            final event = data['event'] as String?;
            final eventData = data['data'];
            if (event != null) {
              _emit(event, eventData);
            }
          } catch (error) {
            print('解析WebSocket消息错误: $error');
          }
        },
        onError: (error) {
          print('WebSocket错误: $error');
          _isConnected = false;
          _emit('error', error);
          _attemptReconnect();
        },
        onDone: () {
          print('WebSocket连接关闭');
          _isConnected = false;
          _emit('disconnected', null);
          _attemptReconnect();
        },
      );

      _isConnected = true;
      _reconnectAttempts = 0;
      _emit('connected', null);
      print('WebSocket连接成功');
    } catch (error) {
      print('WebSocket连接失败: $error');
      _attemptReconnect();
    }
  }

  /// 断开连接
  void disconnect() {
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _isConnected = false;
    _channel = null;
  }

  /// 发送消息
  bool send(Map<String, dynamic> data) {
    if (_isConnected && _channel != null) {
      try {
        _channel!.sink.add(json.encode(data));
        return true;
      } catch (error) {
        print('发送消息失败: $error');
        return false;
      }
    }
    return false;
  }

  /// 订阅事件
  void on(String event, Function callback) {
    if (!_listeners.containsKey(event)) {
      _listeners[event] = [];
    }
    _listeners[event]!.add(callback);
  }

  /// 取消订阅
  void off(String event, Function callback) {
    _listeners[event]?.remove(callback);
  }

  /// 触发事件
  void _emit(String event, dynamic data) {
    _listeners[event]?.forEach((callback) {
      try {
        callback(data);
      } catch (error) {
        print('事件回调错误: $error');
      }
    });
  }

  /// 尝试重连
  void _attemptReconnect() {
    if (_reconnectAttempts < _maxReconnectAttempts) {
      _reconnectAttempts++;
      _reconnectTimer?.cancel();
      _reconnectTimer = Timer(_reconnectDelay, () {
        print('尝试重连 (${_reconnectAttempts}/$_maxReconnectAttempts)...');
        connect();
      });
    } else {
      print('达到最大重连次数，停止重连');
    }
  }
}

