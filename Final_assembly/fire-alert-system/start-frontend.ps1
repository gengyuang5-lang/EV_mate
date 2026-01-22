# 启动前端服务（会自动使用3001端口，因为3000被后端占用）
Write-Host "正在启动前端服务..." -ForegroundColor Green
cd frontend
$env:PORT = "3001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
Write-Host "前端服务已在新窗口启动，端口: 3001" -ForegroundColor Green
Write-Host "请访问: http://localhost:3001" -ForegroundColor Yellow

