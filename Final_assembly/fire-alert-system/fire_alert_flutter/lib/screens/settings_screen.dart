import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../services/websocket_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _selectedLanguage = 'zh';
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    _checkConnection();
  }

  void _checkConnection() {
    setState(() {
      _isConnected = WebSocketService().isConnected;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('设置')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.language),
              title: const Text('语言'),
              subtitle: Text(_selectedLanguage == 'zh' ? '中文' : 'English'),
              trailing: DropdownButton<String>(
                value: _selectedLanguage,
                items: const [
                  DropdownMenuItem(value: 'zh', child: Text('中文')),
                  DropdownMenuItem(value: 'en', child: Text('English')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedLanguage = value;
                    });
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              leading: Icon(
                Icons.wifi,
                color: _isConnected
                    ? const Color(AppConstants.colorSuccess)
                    : Colors.grey,
              ),
              title: const Text('连接状态'),
              subtitle: Text(_isConnected ? '已连接' : '未连接'),
              trailing: IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _checkConnection,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

