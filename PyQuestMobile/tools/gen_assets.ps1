# Генерация ассетов PyQuest: иконки табов (белые силуэты для тинта) и hero-градиент.
# Силуэты тинтуются в RN через <Image style={{tintColor}}> — рендерятся одинаково везде.
Add-Type -AssemblyName System.Drawing

$outDir = $PSScriptRoot
$white = [System.Drawing.Color]::White

function New-Bitmap([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  return @($bmp, $g)
}

function Save-B64([System.Drawing.Bitmap]$bmp, [string]$name) {
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $b64 = [System.Convert]::ToBase64String($ms.ToArray())
  $ms.Dispose()
  Set-Content -Path (Join-Path $outDir "asset_$name.txt") -Value $b64 -Encoding ascii -NoNewline
  Write-Output "$name : $($b64.Length) chars"
}

$S = 96
$brush = New-Object System.Drawing.SolidBrush($white)

# ---- book (открытая книга: две страницы) ----
$r = New-Bitmap $S $S; $bmp = $r[0]; $g = $r[1]
$left = @(
  (New-Object System.Drawing.PointF(48, 24)),
  (New-Object System.Drawing.PointF(14, 31)),
  (New-Object System.Drawing.PointF(14, 75)),
  (New-Object System.Drawing.PointF(48, 70))
)
$right = @(
  (New-Object System.Drawing.PointF(48, 24)),
  (New-Object System.Drawing.PointF(82, 31)),
  (New-Object System.Drawing.PointF(82, 75)),
  (New-Object System.Drawing.PointF(48, 70))
)
$g.FillPolygon($brush, [System.Drawing.PointF[]]$left)
$g.FillPolygon($brush, [System.Drawing.PointF[]]$right)
# зазор-корешок: вырезаем тонкую полоску по центру прозрачным
$gap = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0,0,0,0))
$g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillRectangle($gap, 45, 24, 6, 47)
$g.Dispose(); Save-B64 $bmp "book"; $bmp.Dispose()

# ---- chart (три столбца — рейтинг) ----
$r = New-Bitmap $S $S; $bmp = $r[0]; $g = $r[1]
function Bar([System.Drawing.Graphics]$g, $x, $top) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $w = 18; $rad = 7; $bottom = 80
  $h = $bottom - $top
  $path.AddArc($x, $top, $rad*2, $rad*2, 180, 90)
  $path.AddArc($x+$w-$rad*2, $top, $rad*2, $rad*2, 270, 90)
  $path.AddLine($x+$w, $top+$rad, $x+$w, $bottom)
  $path.AddLine($x+$w, $bottom, $x, $bottom)
  $path.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $path)
}
Bar $g 16 50
Bar $g 39 26
Bar $g 62 40
$g.Dispose(); Save-B64 $bmp "chart"; $bmp.Dispose()

# ---- medal (звезда в кружке-медали с лентой) ----
$r = New-Bitmap $S $S; $bmp = $r[0]; $g = $r[1]
# лента (две полоски-треугольника)
$g.FillPolygon($brush, [System.Drawing.PointF[]]@(
  (New-Object System.Drawing.PointF(34,16)),(New-Object System.Drawing.PointF(46,16)),
  (New-Object System.Drawing.PointF(44,52)),(New-Object System.Drawing.PointF(30,52))))
$g.FillPolygon($brush, [System.Drawing.PointF[]]@(
  (New-Object System.Drawing.PointF(50,16)),(New-Object System.Drawing.PointF(62,16)),
  (New-Object System.Drawing.PointF(66,52)),(New-Object System.Drawing.PointF(52,52))))
# кружок медали
$g.FillEllipse($brush, 28, 46, 40, 40)
# вырез звезды (прозрачным) внутри кружка
$cx = 48.0; $cy = 66.0; $rO = 15.0; $rI = 6.2
$pts = New-Object System.Collections.ArrayList
for ($i = 0; $i -lt 10; $i++) {
  $ang = [Math]::PI/2 + $i * [Math]::PI/5
  $rad = if ($i % 2 -eq 0) { $rO } else { $rI }
  [void]$pts.Add((New-Object System.Drawing.PointF([float]($cx + $rad*[Math]::Cos($ang)), [float]($cy - $rad*[Math]::Sin($ang)))))
}
$g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillPolygon((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0,0,0,0))), [System.Drawing.PointF[]]$pts.ToArray([System.Drawing.PointF]))
$g.Dispose(); Save-B64 $bmp "medal"; $bmp.Dispose()

# ---- person (голова + плечи) ----
$r = New-Bitmap $S $S; $bmp = $r[0]; $g = $r[1]
$g.FillEllipse($brush, 33, 16, 30, 30)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc(20, 52, 56, 56, 180, 180)
$path.AddLine(76, 80, 20, 80)
$path.CloseFigure()
$g.FillPath($brush, $path)
$g.Dispose(); Save-B64 $bmp "person"; $bmp.Dispose()

# ---- hero-градиент (диагональ blue -> violet -> magenta) ----
$W = 1000; $H = 520
$r = New-Bitmap $W $H; $bmp = $r[0]; $g = $r[1]
$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$lg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::Black, [System.Drawing.Color]::White, 35.0)
$cb = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$cb.Colors = @(
  [System.Drawing.Color]::FromArgb(255, 44, 111, 168),
  [System.Drawing.Color]::FromArgb(255, 99, 80, 210),
  [System.Drawing.Color]::FromArgb(255, 150, 80, 200)
)
$cb.Positions = @(0.0, 0.55, 1.0)
$lg.InterpolationColors = $cb
$g.FillRectangle($lg, $rect)
# мягкое световое пятно
$gp = New-Object System.Drawing.Drawing2D.GraphicsPath
$gp.AddEllipse(560, -160, 700, 520)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($gp)
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(70, 255, 255, 255)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pgb, $gp)
$g.Dispose(); Save-B64 $bmp "hero"; $bmp.Dispose()

Write-Output "done"
