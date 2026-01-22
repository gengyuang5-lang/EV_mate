# 启动后端服务
Write-Host "正在启动后端服务..." -ForegroundColor Green
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
Write-Host "后端服务已在新窗口启动，端口: 3000" -ForegroundColor Green

