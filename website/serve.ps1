# =========================================================
#  Pan African Women Freelancers — local preview server
#  Pure PowerShell. No Node, no Python, no installs.
#  Usage:  powershell -ExecutionPolicy Bypass -File .\serve.ps1
# =========================================================

param(
  [int]$Port = 5500,
  [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

# Make sure we serve the folder this script lives in
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Get-Location).Path }
$Root = (Resolve-Path $Root).Path

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".webp" = "image/webp"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".ttf"  = "font/ttf"
  ".txt"  = "text/plain; charset=utf-8"
  ".webmanifest" = "application/manifest+json"
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "  Could not bind $prefix" -ForegroundColor Red
  Write-Host "  Port $Port may already be in use. Try:  .\serve.ps1 -Port 5501" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "  Pan African Women Freelancers & Tech Talent" -ForegroundColor Magenta
Write-Host "  Serving : $Root" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Preview : $prefix" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor DarkGray
Write-Host ""

# Best-effort: open the default browser
try { Start-Process $prefix | Out-Null } catch { }

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch {
    break
  }

  $req = $ctx.Request
  $res = $ctx.Response

  # --- Security headers -------------------------------------------------
  $res.Headers["X-Content-Type-Options"] = "nosniff"
  $res.Headers["X-Frame-Options"]        = "SAMEORIGIN"
  $res.Headers["Referrer-Policy"]        = "strict-origin-when-cross-origin"
  $res.Headers["Permissions-Policy"]     = "geolocation=(), microphone=(), camera=()"
  $csp = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
  $res.Headers["Content-Security-Policy"] = $csp

  try {
    $relPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
    $relPath = $relPath -replace "/", "\"

    $fullPath = Join-Path $Root $relPath
    $resolved = [System.IO.Path]::GetFullPath($fullPath)

    # --- Directory traversal guard --------------------------------------
    if (-not $resolved.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $res.StatusCode = 403
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.Close()
      continue
    }

    # Directory -> index.html
    if (Test-Path -LiteralPath $resolved -PathType Container) {
      $resolved = Join-Path $resolved "index.html"
    }

    if (Test-Path -LiteralPath $resolved -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($resolved).ToLower()
      $type = $mime[$ext]
      if (-not $type) { $type = "application/octet-stream" }
      $res.ContentType = $type
      $res.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate"

      $bytes = [System.IO.File]::ReadAllBytes($resolved)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("  200  " + $req.HttpMethod + "  " + $req.Url.AbsolutePath) -ForegroundColor DarkGray
    } else {
      $res.StatusCode = 404
      $body = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>404</title></head>" +
              "<body style='font-family:system-ui;background:#2D0635;color:#F6EEF6;display:grid;place-items:center;height:100vh;margin:0'>" +
              "<div style='text-align:center'><h1 style='color:#DFA02A'>404</h1><p>Not found: /$relPath</p>" +
              "<a href='/' style='color:#F8C238'>Back to home</a></div></body></html>"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
      $res.ContentType = "text/html; charset=utf-8"
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("  404  " + $req.HttpMethod + "  " + $req.Url.AbsolutePath) -ForegroundColor DarkYellow
    }
  } catch {
    try {
      $res.StatusCode = 500
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("500 Server Error")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch { }
  } finally {
    try { $res.Close() } catch { }
  }
}
