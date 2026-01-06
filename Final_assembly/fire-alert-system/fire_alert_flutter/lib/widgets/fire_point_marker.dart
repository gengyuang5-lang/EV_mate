import 'package:flutter/material.dart';
import '../utils/constants.dart';

class FirePointMarker extends StatelessWidget {
  final String level;

  const FirePointMarker({super.key, required this.level});

  Color _getMarkerColor() {
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

  double _getMarkerSize() {
    switch (level) {
      case 'warning':
        return 20;
      case 'alert':
        return 24;
      case 'critical':
        return 28;
      default:
        return 24;
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = _getMarkerSize();
    final color = _getMarkerColor();

    return Container(
      width: size * 2,
      height: size * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Center(
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Center(
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

