# Амбиентный фон для glassmorphism: тёмный и светлый, с мягкими цветными свечениями.
Add-Type -AssemblyName System.Drawing

$outDir = $PSScriptRoot
$W = 760; $H = 1300

function Glow($g, $cx, $cy, $r, $col) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse([float]($cx-$r), [float]($cy-$r), [float]($r*2), [float]($r*2))
  $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
  $pgb.CenterColor = $col
  $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $col.R, $col.G, $col.B))
  $g.FillPath($pgb, $path)
}

function Build($name, $baseHex, $glows) {
  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $base = [System.Drawing.ColorTranslator]::FromHtml($baseHex)
  $g.Clear($base)
  foreach ($gl in $glows) {
    Glow $g $gl[0] $gl[1] $gl[2] ([System.Drawing.Color]::FromArgb($gl[3], $gl[4], $gl[5], $gl[6]))
  }
  $g.Dispose()
  $ms = New-Object System.IO.MemoryStream
  $jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
  $bmp.Save($ms, $jpeg, $ep)
  $b64 = [System.Convert]::ToBase64String($ms.ToArray()); $ms.Dispose(); $bmp.Dispose()
  Set-Content -Path (Join-Path $outDir "asset_$name.txt") -Value $b64 -Encoding ascii -NoNewline
  Write-Output "$name ok ($($b64.Length))"
}

# тёмный: мягкое синее/фиолетовое/бирюзовое свечение (приглушённое)
Build "ambient_dark" "#0C1120" @(
  @(600, 120, 600, 90, 55, 118, 171),
  @(90, 560, 620, 72, 120, 92, 220),
  @(700, 1120, 540, 60, 61, 214, 140),
  @(250, 1220, 460, 46, 255, 196, 84)
)

# светлый: едва заметные пастельные свечения
Build "ambient_light" "#EFF3FB" @(
  @(600, 130, 600, 80, 120, 165, 235),
  @(90, 560, 600, 70, 175, 150, 235),
  @(700, 1120, 520, 58, 130, 210, 180),
  @(250, 1220, 460, 48, 245, 205, 120)
)

Write-Output "glass done"
