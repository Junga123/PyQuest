# Генерация PNG-глифов курсов (белые силуэты, тинтуются акцентом курса).
Add-Type -AssemblyName System.Drawing
$outDir = $PSScriptRoot
$white = [System.Drawing.Color]::White
$transparent = [System.Drawing.Color]::FromArgb(0,0,0,0)

function New-G([int]$s) {
  $bmp = New-Object System.Drawing.Bitmap($s, $s)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  return @($bmp, $g)
}
function PF($x, $y) { New-Object System.Drawing.PointF([float]$x, [float]$y) }
function Save-B64($bmp, $name) {
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $b64 = [System.Convert]::ToBase64String($ms.ToArray()); $ms.Dispose()
  Set-Content -Path (Join-Path $outDir "asset_$name.txt") -Value $b64 -Encoding ascii -NoNewline
  Write-Output "$name ok ($($b64.Length))"
}
$S = 96
$wb = New-Object System.Drawing.SolidBrush($white)

# basics -> змейка (Python)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$pen = New-Object System.Drawing.Pen($white, 12)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawCurve($pen, [System.Drawing.PointF[]]@((PF 30 26),(PF 62 38),(PF 32 58),(PF 64 72)), 0.6)
$g.FillEllipse($wb, 56, 64, 20, 20)   # голова
$g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillEllipse((New-Object System.Drawing.SolidBrush($transparent)), 67, 70, 5, 5)  # глаз
$g.Dispose(); Save-B64 $bmp "course_basics"; $bmp.Dispose()

# loops -> круговая стрелка
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$pen2 = New-Object System.Drawing.Pen($white, 11)
$pen2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($pen2, 24, 22, 48, 48, 40, 285)
# стрелка на конце дуги (вверху справа)
$g.FillPolygon($wb, [System.Drawing.PointF[]]@((PF 70 22),(PF 82 36),(PF 62 40)))
$g.Dispose(); Save-B64 $bmp "course_loops"; $bmp.Dispose()

# functions -> пазл
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddRectangle((New-Object System.Drawing.RectangleF(26, 32, 44, 42)))
$g.FillPath($wb, $path)
$g.FillEllipse($wb, 40, 22, 16, 16)   # выступ сверху
$g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillEllipse((New-Object System.Drawing.SolidBrush($transparent)), 62, 44, 16, 16)  # вырез справа
$g.Dispose(); Save-B64 $bmp "course_functions"; $bmp.Dispose()

# collections -> стопка из 3 элементов
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
function Bar($g, $y) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $x=22;$w=52;$h=13;$rad=6
  $p.AddArc($x,$y,$rad*2,$rad*2,180,90); $p.AddArc($x+$w-$rad*2,$y,$rad*2,$rad*2,270,90)
  $p.AddArc($x+$w-$rad*2,$y+$h-$rad*2,$rad*2,$rad*2,0,90); $p.AddArc($x,$y+$h-$rad*2,$rad*2,$rad*2,90,90); $p.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $p)
}
Bar $g 26; Bar $g 44; Bar $g 62
$g.Dispose(); Save-B64 $bmp "course_collections"; $bmp.Dispose()

# oop -> граф из 3 узлов
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$lp = New-Object System.Drawing.Pen($white, 5)
$g.DrawLine($lp, 48, 28, 28, 64); $g.DrawLine($lp, 48, 28, 68, 64); $g.DrawLine($lp, 28, 64, 68, 64)
$g.FillEllipse($wb, 39, 16, 18, 18)
$g.FillEllipse($wb, 18, 56, 18, 18)
$g.FillEllipse($wb, 60, 56, 18, 18)
$g.Dispose(); Save-B64 $bmp "course_oop"; $bmp.Dispose()

Write-Output "courses done"
