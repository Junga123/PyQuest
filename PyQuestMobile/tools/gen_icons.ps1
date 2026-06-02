# Генерация брендированной иконки PyQuest (все плотности + круглая) и логотипа.
# Использует System.Drawing (GDI+). Запуск: powershell -File tools\gen_icons.ps1
Add-Type -AssemblyName System.Drawing

$resRoot = Join-Path $PSScriptRoot "..\android\app\src\main\res"
$blue   = [System.Drawing.Color]::FromArgb(255, 55, 118, 171)   # #3776AB
$blue2  = [System.Drawing.Color]::FromArgb(255, 25, 60, 100)    # darker
$yellow = [System.Drawing.Color]::FromArgb(255, 255, 212, 59)   # #FFD43B
$white  = [System.Drawing.Color]::FromArgb(255, 234, 240, 251)

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Icon([int]$size, [bool]$round) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $blue, $blue2, 60.0)

  if ($round) {
    $g.FillEllipse($brush, 0, 0, $size, $size)
  } else {
    $r = [float]($size * 0.22)
    $path = New-RoundedPath 0 0 $size $size $r
    $g.FillPath($brush, $path)
    $path.Dispose()
  }

  # "Py" крупно, жёлтым
  $fontSize = [float]($size * 0.40)
  $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $yBrush = New-Object System.Drawing.SolidBrush($yellow)
  $textRect = New-Object System.Drawing.RectangleF(0, [float](-$size * 0.06), [float]$size, [float]$size)
  $g.DrawString("Py", $font, $yBrush, $textRect, $sf)

  # терминальный ">_" снизу, белым
  $fontSize2 = [float]($size * 0.17)
  $font2 = New-Object System.Drawing.Font("Consolas", $fontSize2, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $wBrush = New-Object System.Drawing.SolidBrush($white)
  $textRect2 = New-Object System.Drawing.RectangleF(0, [float]($size * 0.28), [float]$size, [float]$size)
  $g.DrawString(">_", $font2, $wBrush, $textRect2, $sf)

  $g.Dispose()
  return $bmp
}

$densities = @{
  "mipmap-mdpi"    = 48
  "mipmap-hdpi"    = 72
  "mipmap-xhdpi"   = 96
  "mipmap-xxhdpi"  = 144
  "mipmap-xxxhdpi" = 192
}

foreach ($d in $densities.Keys) {
  $sz = $densities[$d]
  $dir = Join-Path $resRoot $d
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }

  $sq = Draw-Icon $sz $false
  $sq.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $sq.Dispose()

  $rn = Draw-Icon $sz $true
  $rn.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $rn.Dispose()
  Write-Output "icon $d ($sz px) ok"
}

# Логотип 256px -> base64 для экрана загрузки / профиля
$logo = Draw-Icon 256 $false
$ms = New-Object System.IO.MemoryStream
$logo.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$logo.Dispose()
$b64 = [System.Convert]::ToBase64String($ms.ToArray())
$ms.Dispose()
$outJson = Join-Path $PSScriptRoot "logo_b64.txt"
Set-Content -Path $outJson -Value $b64 -Encoding ascii
Write-Output ("logo base64 length: " + $b64.Length)
