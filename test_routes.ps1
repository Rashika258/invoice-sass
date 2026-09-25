$routes = @(
    '/',
    '/invoices',
    '/customers',
    '/items',
    '/payments',
    '/store',
    '/store/example',
    '/work-queue',
    '/audit-logs',
    '/system-health',
    '/settings-history'
)

foreach ($r in $routes) {
  $url = "http://localhost:3000$r"
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -Method GET -ErrorAction Stop
    $code = $resp.StatusCode
  } catch {
    $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { 'ERROR' }
  }
  Write-Output "${r} => ${code}"
}
