# Builds the favicons, app icons and the social share image from public/logo.png.
#   powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
# Re-run it if the logo changes. Windows only (uses System.Drawing).

Add-Type -AssemblyName System.Drawing
$public = Join-Path $PSScriptRoot "..\public" | Resolve-Path
$logo = [System.Drawing.Image]::FromFile((Join-Path $public "logo.png"))

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.InterpolationMode = "HighQualityBicubic"
  $g.PixelOffsetMode = "HighQuality"
  $g.TextRenderingHint = "AntiAliasGridFit"
  return @($bmp, $g)
}

# Square icons: the logo on a transparent (favicon) or dark (app icon) square.
function Save-Icon([string]$name, [int]$size, [bool]$background, [double]$padding) {
  $bmp, $g = New-Canvas $size $size
  if ($background) { $g.Clear([System.Drawing.Color]::FromArgb(12, 10, 9)) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  $inner = [int]($size * (1 - 2 * $padding))
  $offset = [int](($size - $inner) / 2)
  $g.DrawImage($logo, $offset, $offset, $inner, $inner)
  $bmp.Save((Join-Path $public $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Save-Icon "favicon-32.png" 32 $false 0
Save-Icon "favicon-48.png" 48 $false 0
# Small transparent logo for the navbar, footer and dashboard (logo.png is
# 1.4 MB and should never be shown on a page).
Save-Icon "logo-96.png" 96 $false 0
Save-Icon "apple-touch-icon.png" 180 $true 0.12
Save-Icon "icon-192.png" 192 $true 0.12
Save-Icon "icon-512.png" 512 $true 0.12
# Maskable icons need the artwork inside the central safe zone.
Save-Icon "icon-maskable-512.png" 512 $true 0.22

# 1200x630 share image for Facebook, WhatsApp, X and LinkedIn previews.
$bmp, $g = New-Canvas 1200 630
$g.Clear([System.Drawing.Color]::FromArgb(12, 10, 9))
$glow = New-Object System.Drawing.Drawing2D.GraphicsPath
$glow.AddEllipse(700, -250, 700, 700)
$brush = New-Object System.Drawing.Drawing2D.PathGradientBrush $glow
$brush.CenterColor = [System.Drawing.Color]::FromArgb(70, 245, 158, 11)
$brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 245, 158, 11))
$g.FillPath($brush, $glow)
$g.DrawImage($logo, 80, 175, 280, 280)

$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(250, 250, 249))
$amber = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(251, 191, 36))
$grey = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(168, 162, 158))
$g.DrawString("Grontho", (New-Object System.Drawing.Font "Segoe UI", 64, ([System.Drawing.FontStyle]::Bold)), $white, 400, 170)
$g.DrawString("Bilash", (New-Object System.Drawing.Font "Segoe UI", 64, ([System.Drawing.FontStyle]::Bold)), $amber, 735, 170)
# "গ্রন্থবিলাস" built from code points: Windows PowerShell 5.1 misreads
# non-ASCII text in script files saved without a BOM.
$banglaName = -join [char[]](0x0997, 0x09CD, 0x09B0, 0x09A8, 0x09CD, 0x09A5, 0x09AC, 0x09BF, 0x09B2, 0x09BE, 0x09B8)
$g.DrawString($banglaName, (New-Object System.Drawing.Font "Nirmala UI", 34, ([System.Drawing.FontStyle]::Bold)), $grey, 408, 280)
$g.DrawString("Buy & sell used books, notes and exam", (New-Object System.Drawing.Font "Segoe UI", 28), $white, 408, 360)
$g.DrawString("suggestions in Bangladesh", (New-Object System.Drawing.Font "Segoe UI", 28), $white, 408, 405)
$g.DrawString("gronthobilash.com", (New-Object System.Drawing.Font "Segoe UI Semibold", 22), $amber, 408, 480)

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
$bmp.Save((Join-Path $public "og-image.jpg"), $jpeg, $params)
$g.Dispose(); $bmp.Dispose(); $logo.Dispose()

Get-ChildItem $public -Include favicon-*.png, apple-touch-icon.png, icon-*.png, og-image.jpg -Recurse |
  ForEach-Object { "{0,-24} {1,6} KB" -f $_.Name, [math]::Round($_.Length / 1KB, 1) }
