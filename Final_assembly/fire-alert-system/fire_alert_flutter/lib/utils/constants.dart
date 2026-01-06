/// 应用常量配置
class AppConstants {
  // API配置
  static const String apiUrl = 'http://localhost:3000';
  static const String wsUrl = 'ws://localhost:3000';

  // 预警级别
  static const String alertLevelNormal = 'normal';
  static const String alertLevelWarning = 'warning';
  static const String alertLevelAlert = 'alert';
  static const String alertLevelCritical = 'critical';

  // 传感器类型
  static const String sensorTypeTemperature = 'temperature';
  static const String sensorTypeSmoke = 'smoke';
  static const String sensorTypeCO = 'co';

  // 地图配置
  static const double initialLatitude = 39.9042;
  static const double initialLongitude = 116.4074;
  static const double initialDelta = 0.01;

  // 颜色配置
  static const int colorPrimary = 0xFFDC2626;
  static const int colorPrimaryLight = 0xFFEF4444;
  static const int colorPrimaryDark = 0xFFB91C1C;
  static const int colorSuccess = 0xFF22C55E;
  static const int colorWarning = 0xFFF59E0B;
  static const int colorDanger = 0xFFDC2626;
  static const int colorCritical = 0xFF991B1B;
  static const int colorBackground = 0xFFFFFFFF;
  static const int colorTextPrimary = 0xFF1F2937;
  static const int colorTextSecondary = 0xFF6B7280;

  // 默认语言
  static const String defaultLanguage = 'zh';
}

