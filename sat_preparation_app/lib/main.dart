import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WebView Navigation App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: BottomNavPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class BottomNavPage extends StatefulWidget {
  @override
  _BottomNavPageState createState() => _BottomNavPageState();
}

class _BottomNavPageState extends State<BottomNavPage> {
  int _selectedIndex = 0;

  final List<String> _urls = [
    'https://fibipals.com/info',     // Home URL
    'https://example.com/course', // Course URL (replace with your own)
    'https://example.com/test',  // Tests URL (replace with your own)
  ];

  late final List<WebViewController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = _urls.map((url) {
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..loadRequest(Uri.parse(url));
      return controller;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(['Home', 'Course', 'Tests'][_selectedIndex]),
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: _controllers
            .map((controller) => WebViewWidget(controller: controller))
            .toList(),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_book), label: 'Course'),
          BottomNavigationBarItem(icon: Icon(Icons.quiz), label: 'Tests'),
        ],
        onTap: (index) => setState(() => _selectedIndex = index),
      ),
    );
  }
}
