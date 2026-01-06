import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

/// API服务
/// 处理与后端的HTTP请求
class ApiService {
  static const String baseUrl = AppConstants.apiUrl;
  static const Duration timeout = Duration(seconds: 10);

  /// 获取活跃预警
  static Future<Map<String, dynamic>> getActiveAlerts() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/api/alerts/active'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('获取活跃预警失败: ${response.statusCode}');
      }
    } catch (error) {
      print('获取活跃预警失败: $error');
      rethrow;
    }
  }

  /// 获取预警统计
  static Future<Map<String, dynamic>> getAlertStatistics() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/api/alerts/statistics'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('获取预警统计失败: ${response.statusCode}');
      }
    } catch (error) {
      print('获取预警统计失败: $error');
      rethrow;
    }
  }

  /// 解决预警
  static Future<Map<String, dynamic>> resolveAlert(String alertId) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/api/alerts/resolve'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({'alertId': alertId}),
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('解决预警失败: ${response.statusCode}');
      }
    } catch (error) {
      print('解决预警失败: $error');
      rethrow;
    }
  }

  /// 发送求助请求
  static Future<Map<String, dynamic>> requestHelp({
    required String location,
    required double latitude,
    required double longitude,
    String? message,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/api/help/request'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'location': location,
              'coordinates': {
                'lat': latitude,
                'lng': longitude,
              },
              'message': message ?? '我需要帮助！',
              'userId': 'mobile-user-${DateTime.now().millisecondsSinceEpoch}',
            }),
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('发送求助请求失败: ${response.statusCode}');
      }
    } catch (error) {
      print('发送求助请求失败: $error');
      rethrow;
    }
  }

  /// 获取传感器统计数据
  static Future<Map<String, dynamic>> getSensorStatistics() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/api/sensor/statistics'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('获取传感器统计失败: ${response.statusCode}');
      }
    } catch (error) {
      print('获取传感器统计失败: $error');
      rethrow;
    }
  }

  /// 获取最近传感器数据
  static Future<Map<String, dynamic>> getRecentSensorData({int limit = 10}) async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/api/sensor/recent?limit=$limit'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('获取最近传感器数据失败: ${response.statusCode}');
      }
    } catch (error) {
      print('获取最近传感器数据失败: $error');
      rethrow;
    }
  }
}

