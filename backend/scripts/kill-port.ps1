# PowerShell script to kill process using port 8080
$port = 8080
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "Killing process $pid on port $port"
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Port $port cleared"
} else {
    Write-Host "No process found on port $port"
}

