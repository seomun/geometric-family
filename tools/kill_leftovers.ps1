# 시험이 남긴 playwright chrome·시험 node 를 정리하고 개수를 출력한다(작가의 일반 chrome·서버 python 은 건드리지 않음)
$p = Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'chrome.exe' -and $_.CommandLine -match 'remote-debugging-pipe') -or ($_.Name -eq 'node.exe' -and $_.CommandLine -match 'tools[\/][A-Za-z_0-9]+\.js') }
$n = @($p).Count
$p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Write-Output $n
