import 'package:flutter/material.dart';
import '../utils/constants.dart';

class AlertPopup extends StatelessWidget {
  final Map<String, dynamic> alert;
  final VoidCallback onClose;
  final VoidCallback onResolve;

  const AlertPopup({
    super.key,
    required this.alert,
    required this.onClose,
    required this.onResolve,
  });

  IconData _getAlertIcon(String? type) {
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

  Color _getAlertColor(String? level) {
    switch (level) {
      case 'warning':
        return const Color(AppConstants.colorWarning);
      case 'alert':
        return const Color(AppConstants.colorDanger);
      case 'critical':
        return const Color(AppConstants.colorCritical);
      default:
        return const Color(AppConstants.colorDanger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final level = alert['level'] as String? ?? 'alert';
    final type = alert['type'] as String? ?? '';
    final color = _getAlertColor(level);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: color,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  Icon(_getAlertIcon(type), color: Colors.white, size: 32),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      '收到预警',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: onClose,
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow(Icons.location_on, '位置', alert['location'] ?? '未知位置'),
                  const SizedBox(height: 12),
                  _buildInfoRow(Icons.info, '状态', level, color: color),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      alert['message'] ?? '预警消息',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    onResolve();
                    onClose();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(AppConstants.colorSuccess),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        '解决预警',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, {Color? color}) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(AppConstants.colorTextSecondary)),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(color: Color(AppConstants.colorTextSecondary)),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ),
      ],
    );
  }
}

