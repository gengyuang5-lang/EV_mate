import 'dart:math' as math;
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

/// 路径规划服务
class PathPlanningService {
  static const String baseUrl = AppConstants.apiUrl;

  /// 计算逃生路线
  static Future<Map<String, dynamic>> calculateEscapeRoute({
    required double startLatitude,
    required double startLongitude,
    required double goalLatitude,
    required double goalLongitude,
    List<Map<String, dynamic>> obstacles = const [],
  }) async {
    try {
      // 尝试调用后端API
      final response = await http
          .post(
            Uri.parse('$baseUrl/api/path/calculate'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'start': {
                'x': startLongitude,
                'y': startLatitude,
                'floor': 0,
              },
              'goal': {
                'x': goalLongitude,
                'y': goalLatitude,
                'floor': 0,
              },
              'obstacles': obstacles.map((ob) => {
                    'x': ob['longitude'] ?? ob['coordinates']?['lng'] ?? ob['lng'] ?? 0.0,
                    'y': ob['latitude'] ?? ob['coordinates']?['lat'] ?? ob['lat'] ?? 0.0,
                    'radius': ob['radius'] ?? 50.0,
                  }).toList(),
            }),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        if (data['success'] == true && data['path'] != null) {
          return {
            'success': true,
            'path': (data['path'] as List).map((point) => {
                  'latitude': point['y'] ?? point['lat'] ?? point['latitude'],
                  'longitude': point['x'] ?? point['lng'] ?? point['longitude'],
                }).toList(),
            'distance': data['distance'] ?? 0.0,
            'estimatedTime': data['estimatedTime'] ?? 0,
          };
        }
      }
    } catch (error) {
      print('后端路径规划失败，使用简化算法: $error');
    }

    // 使用简化算法
    return _simpleRoute(
      startLatitude,
      startLongitude,
      goalLatitude,
      goalLongitude,
      obstacles,
    );
  }

  /// 简化的路径规划
  static Map<String, dynamic> _simpleRoute(
    double startLat,
    double startLng,
    double goalLat,
    double goalLng,
    List<Map<String, dynamic>> obstacles,
  ) {
    final distance = _calculateDistance(startLat, startLng, goalLat, goalLng);

    // 检查是否有障碍物
    final pathBlocked = obstacles.any((ob) {
      final obLat = ob['latitude'] ?? ob['coordinates']?['lat'] ?? ob['lat'] ?? 0.0;
      final obLng = ob['longitude'] ?? ob['coordinates']?['lng'] ?? ob['lng'] ?? 0.0;
      final radius = (ob['radius'] ?? 50.0) / 111000.0; // 转换为度
      return _isPointOnPath(startLat, startLng, goalLat, goalLng, obLat, obLng, radius);
    });

    if (!pathBlocked) {
      return {
        'success': true,
        'path': [
          {'latitude': startLat, 'longitude': startLng},
          {'latitude': goalLat, 'longitude': goalLng},
        ],
        'distance': distance,
        'estimatedTime': (distance / 1.4).ceil(),
      };
    }

    // 计算绕行路径
    return _calculateDetourRoute(startLat, startLng, goalLat, goalLng, obstacles);
  }

  /// 计算绕行路径
  static Map<String, dynamic> _calculateDetourRoute(
    double startLat,
    double startLng,
    double goalLat,
    double goalLng,
    List<Map<String, dynamic>> obstacles,
  ) {
    final path = [
      {'latitude': startLat, 'longitude': startLng},
    ];

    // 找到最近的障碍物
    double? minDistance;
    Map<String, dynamic>? nearestObstacle;

    for (final ob in obstacles) {
      final obLat = ob['latitude'] ?? ob['coordinates']?['lat'] ?? ob['lat'] ?? 0.0;
      final obLng = ob['longitude'] ?? ob['coordinates']?['lng'] ?? ob['lng'] ?? 0.0;
      final dist = _distanceToLine(startLat, startLng, goalLat, goalLng, obLat, obLng);
      final radius = (ob['radius'] ?? 50.0) / 111000.0;

      if (dist < radius && (minDistance == null || dist < minDistance)) {
        minDistance = dist;
        nearestObstacle = {'latitude': obLat, 'longitude': obLng, 'radius': radius};
      }
    }

    if (nearestObstacle != null) {
      // 计算绕行点
      final midLat = (startLat + goalLat) / 2;
      final midLng = (startLng + goalLng) / 2;
      final bearing = _calculateBearing(startLat, startLng, goalLat, goalLng);
      final offset = 100.0 / 111000.0; // 100米转换为度

      final detourPoint = _calculateDestination(
        midLat,
        midLng,
        bearing + 90,
        offset,
      );

      path.add(detourPoint);
    }

    path.add({'latitude': goalLat, 'longitude': goalLng});

    final totalDistance = _calculatePathDistance(path);

    return {
      'success': true,
      'path': path,
      'distance': totalDistance,
      'estimatedTime': (totalDistance / 1.4).ceil(),
    };
  }

  /// 计算两点间距离（米）
  static double _calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    const double R = 6371000; // 地球半径（米）
    final dLat = _toRad(lat2 - lat1);
    final dLng = _toRad(lng2 - lng1);
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.sin(dLng / 2) *
            math.sin(dLng / 2) *
            math.cos(_toRad(lat1)) *
            math.cos(_toRad(lat2));
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return R * c;
  }

  /// 计算路径总距离
  static double _calculatePathDistance(List<Map<String, dynamic>> path) {
    double total = 0;
    for (int i = 1; i < path.length; i++) {
      total += _calculateDistance(
        path[i - 1]['latitude'] as double,
        path[i - 1]['longitude'] as double,
        path[i]['latitude'] as double,
        path[i]['longitude'] as double,
      );
    }
    return total;
  }

  /// 判断点是否在路径上
  static bool _isPointOnPath(
    double startLat,
    double startLng,
    double endLat,
    double endLng,
    double pointLat,
    double pointLng,
    double radius,
  ) {
    final distToLine = _distanceToLine(startLat, startLng, endLat, endLng, pointLat, pointLng);
    return distToLine < radius;
  }

  /// 计算点到直线的距离
  static double _distanceToLine(
    double startLat,
    double startLng,
    double endLat,
    double endLng,
    double pointLat,
    double pointLng,
  ) {
    final A = pointLat - startLat;
    final B = pointLng - startLng;
    final C = endLat - startLat;
    final D = endLng - startLng;

    final dot = A * C + B * D;
    final lenSq = C * C + D * D;
    final param = lenSq != 0 ? dot / lenSq : -1;

    double xx, yy;
    if (param < 0) {
      xx = startLat;
      yy = startLng;
    } else if (param > 1) {
      xx = endLat;
      yy = endLng;
    } else {
      xx = startLat + param * C;
      yy = startLng + param * D;
    }

    final dx = pointLat - xx;
    final dy = pointLng - yy;
    return math.sqrt(dx * dx + dy * dy) * 111000; // 转换为米
  }

  /// 计算方位角
  static double _calculateBearing(double lat1, double lng1, double lat2, double lng2) {
    final dLng = _toRad(lng2 - lng1);
    final lat1Rad = _toRad(lat1);
    final lat2Rad = _toRad(lat2);

    final y = math.sin(dLng) * math.cos(lat2Rad);
    final x = math.cos(lat1Rad) * math.sin(lat2Rad) -
        math.sin(lat1Rad) * math.cos(lat2Rad) * math.cos(dLng);

    return _toDeg(math.atan2(y, x));
  }

  /// 计算目标点
  static Map<String, double> _calculateDestination(
    double lat,
    double lng,
    double bearing,
    double distance,
  ) {
    const double R = 6371000;
    final latRad = _toRad(lat);
    final lngRad = _toRad(lng);
    final brng = _toRad(bearing);
    final d = distance;

    final lat2 = math.asin(
      math.sin(latRad) * math.cos(d / R) +
          math.cos(latRad) * math.sin(d / R) * math.cos(brng),
    );

    final lng2 = lngRad +
        math.atan2(
          math.sin(brng) * math.sin(d / R) * math.cos(latRad),
          math.cos(d / R) - math.sin(latRad) * math.sin(lat2),
        );

    return {
      'latitude': _toDeg(lat2),
      'longitude': _toDeg(lng2),
    };
  }

  /// 角度转弧度
  static double _toRad(double degrees) => degrees * math.pi / 180;

  /// 弧度转角度
  static double _toDeg(double radians) => radians * 180 / math.pi;

  /// 获取最近的出口
  static Future<Map<String, dynamic>> getNearestExit(
    double currentLatitude,
    double currentLongitude,
    List<Map<String, dynamic>> exits,
  ) async {
    if (exits.isEmpty) {
      return {
        'latitude': currentLatitude + 0.001,
        'longitude': currentLongitude + 0.001,
        'name': '最近出口',
      };
    }

    Map<String, dynamic>? nearest;
    double minDistance = double.infinity;

    for (final exit in exits) {
      final exitLat = exit['latitude'] ?? exit['lat'] ?? 0.0;
      final exitLng = exit['longitude'] ?? exit['lng'] ?? 0.0;
      final distance = _calculateDistance(currentLatitude, currentLongitude, exitLat, exitLng);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          ...exit,
          'latitude': exitLat,
          'longitude': exitLng,
          'distance': distance,
        };
      }
    }

    return nearest ?? {
      'latitude': currentLatitude + 0.001,
      'longitude': currentLongitude + 0.001,
      'name': '最近出口',
    };
  }
}

