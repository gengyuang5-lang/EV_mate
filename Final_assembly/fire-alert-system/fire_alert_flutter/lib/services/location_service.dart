import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

/// 位置服务
class LocationService {
  /// 请求位置权限
  static Future<bool> requestLocationPermission() async {
    final status = await Permission.location.request();
    return status.isGranted;
  }

  /// 获取当前位置
  static Future<Position> getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('位置服务未启用');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('位置权限被拒绝');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('位置权限被永久拒绝');
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
      timeLimit: const Duration(seconds: 15),
    );
  }

  /// 监听位置变化
  static Stream<Position> watchPosition({
    LocationAccuracy accuracy = LocationAccuracy.high,
    int distanceFilter = 10,
    Duration interval = const Duration(seconds: 5),
  }) {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: accuracy,
        distanceFilter: distanceFilter,
        timeLimit: interval,
      ),
    );
  }
}

