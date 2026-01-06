import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import '../utils/constants.dart';
import '../widgets/fire_point_marker.dart';
import 'escape_route_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final MapController _mapController = MapController();
  List<Map<String, dynamic>> _firePoints = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFirePoints();
    _setupWebSocket();
  }

  void _setupWebSocket() {
    final wsService = WebSocketService();
    wsService.on('fire_point', _handleFirePoint);
    wsService.on('alert', _handleAlert);
    wsService.on('alert_resolved', _handleAlertResolved);
  }

  void _handleFirePoint(dynamic data) {
    setState(() {
      final index = _firePoints.indexWhere((p) => p['location'] == data['location']);
      if (index >= 0) {
        _firePoints[index] = {..._firePoints[index], ...data};
      } else {
        _firePoints.add(data);
      }
    });
  }

  void _handleAlert(dynamic data) {
    if (data['coordinates'] != null) {
      _handleFirePoint({
        'location': data['location'],
        'coordinates': data['coordinates'],
        'level': data['level'],
        'type': data['type'],
      });
    }
  }

  void _handleAlertResolved(dynamic data) {
    setState(() {
      _firePoints.removeWhere((p) => p['location'] == data['location']);
    });
  }

  Future<void> _loadFirePoints() async {
    try {
      final response = await ApiService.getActiveAlerts();
      if (response['success'] == true) {
        setState(() {
          _firePoints = (response['data'] as List)
              .map<Map<String, dynamic>>((alert) {
                    final coords = alert['coordinates'] ?? {};
                    return {
                      'id': alert['id'],
                      'location': alert['location'],
                      'latitude': coords['lat'] ?? coords['latitude'] ?? AppConstants.initialLatitude,
                      'longitude': coords['lng'] ?? coords['longitude'] ?? AppConstants.initialLongitude,
                      'level': alert['level'] ?? 'alert',
                      'type': alert['type'],
                    };
                  })
              .toList();
          _loading = false;
        });
      }
    } catch (error) {
      print('加载火点失败: $error');
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: LatLng(AppConstants.initialLatitude, AppConstants.initialLongitude),
              initialZoom: 13.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.firealertapp.fire_alert_app',
              ),
              MarkerLayer(
                markers: _firePoints
                    .map((point) => Marker(
                          point: LatLng(
                            point['latitude'] as double,
                            point['longitude'] as double,
                          ),
                          width: 40,
                          height: 40,
                          child: FirePointMarker(
                            level: point['level'] as String,
                          ),
                        ))
                    .toList(),
              ),
            ],
          ),
          Positioned(
            top: 10,
            left: 10,
            right: 10,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                '活跃预警: ${_firePoints.length}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(AppConstants.colorTextPrimary),
                ),
              ),
            ),
          ),
          if (_loading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const EscapeRouteScreen(),
            ),
          );
        },
        icon: const Icon(Icons.directions_run),
        label: const Text('逃生路线'),
        backgroundColor: const Color(AppConstants.colorPrimary),
      ),
    );
  }
}

