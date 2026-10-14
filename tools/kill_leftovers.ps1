# 시험이 남긴 playwright chrome·시험 node 를 정리하고 개수를 출력한다(작가의 일반 chrome·서버 python 은 건드리지 않음)
# C22: tools/rc/browser_server.js(RC 공용 브라우저)와 그 자손 chrome 은 살려 둔다.
param([switch]$All)      # -All: 공용 브라우저 서버까지 모두 정리(RC 끝·재시작)
$procs = Get-CimInstance Win32_Process
$keep = New-Object 'System.Collections.Generic.HashSet[int]'
$roots = @($procs | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'tools[\/]rc[\/]browser_server' })
$queue = New-Object System.Collections.Queue
if (-not $All) { foreach ($r in $roots) { [void]$keep.Add([int]$r.ProcessId); $queue.Enqueue([int]$r.ProcessId) } }
while ($queue.Count -gt 0) { $cur = $queue.Dequeue(); foreach ($c in @($procs | Where-Object { $_.ParentProcessId -eq $cur })) { if ($keep.Add([int]$c.ProcessId)) { $queue.Enqueue([int]$c.ProcessId) } } }
$p = @($procs | Where-Object { (($_.Name -eq 'chrome.exe' -and ($_.CommandLine -match 'remote-debugging-pipe' -or $_.CommandLine -match 'playwright_chromiumdev_profile')) -or ($_.Name -eq 'node.exe' -and ($_.CommandLine -match 'tools[\/][A-Za-z_0-9]+\.js' -or ($All -and $_.CommandLine -match 'tools[\/]rc[\/]browser_server')))) -and -not $keep.Contains([int]$_.ProcessId) })
$n = @($p).Count
$p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Write-Output $n
