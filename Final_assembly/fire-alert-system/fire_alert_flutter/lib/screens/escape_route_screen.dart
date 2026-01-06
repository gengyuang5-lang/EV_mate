import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../services/path_planning_service.dart';
import '../utils/constants.dart';

class EscapeRouteScreen extends StatefulWidget {
  const EscapeRouteScreen({super.key});

  @override
  State<EscapeRouteScreen> createState() => _EscapeRouteScreenState();
}

class _EscapeRouteScreenState extends State<EscapeRouteScreen> {
  final MapController _mapController = MapController();
  bool _loading = true;
  bool _calculating = false;
  LatLng? _currentLocation;
  Map<String, dynamic>? _escapeRoute;
  Map<String, dynamic>? _exitLocation;
  List<Map<String, dynamic>> _firePoints = [];

  @override
  void initState() {
    super.initState();
    _initializeRoute();
  }

  Future<void> _initializeRoute() async {
    try {
      setState(() => _loading = true);

      final hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('需要位置权限才能使用此功能')),
          );
        }
        setState(() => _loading = false);
        return;
      }

      final position = await LocationService.getCurrentPosition();
      setState(() {
        _currentLocation = LatLng(position.latitude, position.longitude);
        _mapController.move(_currentLocation!, 15.0);
      });

      await _loadFirePoints();
      await _calculateRoute(position.latitude, position.longitude);
    } catch (error) {
      print('初始化路线失败: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('初始化失败: $error')),
        );
      }
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadFirePoints() async {
    try {
      final response = await ApiService.getActiveAlerts();
      if (response['success'] == true && response['data'] != null) {
        setState(() {
          _firePoints = (response['data'] as List)
              .where((alert) => alert['coordinates'] != null)
              .map<Map<String, dynamic>>((alert) {
                    final coords = alert['coordinates'] ?? {};
                    return {
                      'id': alert['id'],
                      'latitude': coords['lat'] ?? coords['latitude'] ?? 0.0,
                      'longitude': coords['lng'] ?? coords['longitude'] ?? 0.0,
                      'level': alert['level'],
                      'location': alert['location'],
                    };
                  })
              .toList();
        });
      }
    } catch (error) {
      print('加载火点失败: $error');
    }
  }

  Future<void> _calculateRoute(double startLat, double startLng) async {
    try {
      setState(() => _calculating = true);

      final exit = await PathPlanningService.getNearestExit(startLat, startLng, []);
      setState(() => _exitLocation = exit);

      final route = await PathPlanningService.calculateEscapeRoute(
        startLatitude: startLat,
        startLongitude: startLng,
        goalLatitude: exit['latitude'] as double,
        goalLongitude: exit['longitude'] as double,
        obstacles: _firePoints,
      );

      if (route['success'] == true) {
        setState(() => _escapeRoute = route);
        // 调整地图视图
        if (route['path'] != null && (route['path'] as List).isNotEmpty) {
          final path = route['path'] as List;
          final allPoints = [
            LatLng(startLat, startLng),
            LatLng(exit['latitude'] as double, exit['longitude'] as double),
            ...path.map((p) => LatLng(p['latitude'] as double, p['longitude'] as double)),
          ];

          double minLat = allPoints.map((p) => p.latitude).reduce((a, b) => a < b ? a : b);
          double maxLat = allPoints.map((p) => p.latitude).reduce((a, b) => a > b ? a : b);
          double minLng = allPoints.map((p) => p.longitude).reduce((a, b) => a < b ? a : b);
          double maxLng = allPoints.map((p) => p.longitude).reduce((a, b) => a > b ? a : b);

          final center = LatLng(
            (minLat + maxLat) / 2,
            (minLng + maxLng) / 2,
          );
          final zoom = 14.0;

          _mapController.move(center, zoom);
        }
      }
    } catch (error) {
      print('计算路线失败: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('计算路线失败')),
        );
      }
    } finally {
      setState(() => _calculating = false);
    }
  }

  Future<void> _handleRecalculate() async {
    if (_currentLocation != null) {
      await _calculateRoute(_currentLocation!.latitude, _currentLocation!.longitude);
    } else {
      await _initializeRoute();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('逃生路线')),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('正在计算路线...'),
            ],
          ),
        ),
      );
    }

    final routePath = _escapeRoute?['path'] as List?;

    return Scaffold(
      appBar: AppBar(title: const Text('逃生路线')),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLocation ??
                  LatLng(AppConstants.initialLatitude, AppConstants.initialLongitude),
              initialZoom: 15.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.firealertapp.fire_alert_app',
              ),
              if (_currentLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _currentLocation!,
                      width: 40,
                      height: 40,
                      child: const Icon(Icons.my_location, color: Color(AppConstants.colorSuccess), size: 32),
                    ),
                  ],
                ),
              if (_exitLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(
                        _exitLocation!['latitude'] as double,
                        _exitLocation!['longitude'] as double,
                      ),
                      width: 40,
                      height: 40,
                      child: const Icon(Icons.exit_to_app, color: Color(AppConstants.colorPrimary), size: 32),
                    ),
                  ],
                ),
              if (routePath != null && routePath.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: routePath
                          .map((p) => LatLng(p['latitude'] as double, p['longitude'] as double))
                          .toList(),
                      strokeWidth: 4,
                      color: const Color(AppConstants.colorWarning),
                    ),
                  ],
                ),
            ],
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    blurRadius: 4,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.directions_run, color: Color(AppConstants.colorPrimary)),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          '逃生路线',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        icon: _calculating
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.refresh),
                        onPressed: _calculating ? null : _handleRecalculate,
                      ),
                    ],
                  ),
                  if (_escapeRoute != null) ...[
                    const SizedBox(height: 16),
                    _buildInfoRow(Icons.straighten, '距离',
                        '${((_escapeRoute!['distance'] as num?) ?? 0).round()}m'),
                    _buildInfoRow(Icons.access_time, '预计时间',
                        '${((_escapeRoute!['estimatedTime'] as num?) ?? 0)}s'),
                    if (_exitLocation != null)
                      _buildInfoRow(Icons.exit_to_app, '出口', _exitLocation!['name'] ?? '最近出口'),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(AppConstants.colorTextSecondary)),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: const TextStyle(color: Color(AppConstants.colorTextSecondary)),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

