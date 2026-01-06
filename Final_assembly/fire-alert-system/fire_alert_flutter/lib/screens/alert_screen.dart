import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import '../utils/constants.dart';
import '../widgets/alert_popup.dart';

class AlertScreen extends StatefulWidget {
  const AlertScreen({super.key});

  @override
  State<AlertScreen> createState() => _AlertScreenState();
}

class _AlertScreenState extends State<AlertScreen> {
  List<Map<String, dynamic>> _alerts = [];
  bool _loading = true;
  bool _refreshing = false;
  Map<String, dynamic>? _selectedAlert;
  bool _showPopup = false;

  @override
  void initState() {
    super.initState();
    _loadAlerts();
    _setupWebSocket();
  }

  void _setupWebSocket() {
    final wsService = WebSocketService();
    wsService.on('alert', _handleNewAlert);
    wsService.on('alert_resolved', _handleAlertResolved);
  }

  void _handleNewAlert(dynamic data) {
    setState(() {
      if (!_alerts.any((a) => a['id'] == data['id'])) {
        _alerts.insert(0, data);
        _selectedAlert = data;
        _showPopup = true;
      }
    });
  }

  void _handleAlertResolved(dynamic data) {
    setState(() {
      _alerts.removeWhere((a) => a['id'] == data['alertId']);
    });
  }

  Future<void> _loadAlerts() async {
    try {
      final response = await ApiService.getActiveAlerts();
      if (response['success'] == true) {
        setState(() {
          _alerts = (response['data'] as List).cast<Map<String, dynamic>>();
          _loading = false;
          _refreshing = false;
        });
      }
    } catch (error) {
      print('加载预警失败: $error');
      setState(() {
        _loading = false;
        _refreshing = false;
      });
    }
  }

  Future<void> _resolveAlert(String alertId) async {
    try {
      final response = await ApiService.resolveAlert(alertId);
      if (response['success'] == true) {
        setState(() {
          _alerts.removeWhere((a) => a['id'] == alertId);
        });
      }
    } catch (error) {
      print('解决预警失败: $error');
    }
  }

  IconData _getAlertIcon(String type) {
    switch (type) {
      case 'temperature':
        return Icons.device_thermostat;
      case 'smoke':
        return Icons.cloud;
      case 'co':
        return Icons.warning;
      default:
        return Icons.warning;
    }
  }

  Color _getAlertColor(String level) {
    switch (level) {
      case 'warning':
        return const Color(AppConstants.colorWarning);
      case 'alert':
        return const Color(AppConstants.colorDanger);
      case 'critical':
        return const Color(AppConstants.colorCritical);
      default:
        return const Color(AppConstants.colorTextSecondary);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('预警列表'),
      ),
      body: _alerts.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 64,
                    color: const Color(AppConstants.colorSuccess),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '暂无活跃预警',
                    style: TextStyle(
                      fontSize: 18,
                      color: Color(AppConstants.colorTextSecondary),
                    ),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadAlerts,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _alerts.length,
                itemBuilder: (context, index) {
                  final alert = _alerts[index];
                  final level = alert['level'] as String? ?? 'alert';
                  final type = alert['type'] as String? ?? '';

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Icon(
                        _getAlertIcon(type),
                        color: _getAlertColor(level),
                        size: 32,
                      ),
                      title: Text(
                        alert['location'] ?? '未知位置',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(alert['message'] ?? '预警消息'),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: _getAlertColor(level),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              level,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.check_circle, color: Color(AppConstants.colorSuccess)),
                        onPressed: () => _resolveAlert(alert['id'] as String),
                      ),
                      onTap: () {
                        setState(() {
                          _selectedAlert = alert;
                          _showPopup = true;
                        });
                      },
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: _showPopup && _selectedAlert != null
          ? AlertPopup(
              alert: _selectedAlert!,
              onClose: () {
                setState(() {
                  _showPopup = false;
                  _selectedAlert = null;
                });
              },
              onResolve: () {
                if (_selectedAlert != null) {
                  _resolveAlert(_selectedAlert!['id'] as String);
                }
                setState(() {
                  _showPopup = false;
                  _selectedAlert = null;
                });
              },
            )
          : null,
    );
  }
}

