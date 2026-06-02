# Генерация PNG-глифов достижений (белые силуэты, тинтуются в RN).
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

# star
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$cx=48.0;$cy=50.0;$rO=36.0;$rI=15.0; $pts=New-Object System.Collections.ArrayList
for ($i=0;$i -lt 10;$i++){ $a=[Math]::PI/2+$i*[Math]::PI/5; $rad= if($i%2 -eq 0){$rO}else{$rI}; [void]$pts.Add((PF ($cx+$rad*[Math]::Cos($a)) ($cy-$rad*[Math]::Sin($a)))) }
$g.FillPolygon($wb,[System.Drawing.PointF[]]$pts.ToArray([System.Drawing.PointF])); $g.Dispose(); Save-B64 $bmp "star"; $bmp.Dispose()

# bolt (молния)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 56 10),(PF 28 54),(PF 45 54),(PF 38 86),(PF 70 40),(PF 51 40)))
$g.Dispose(); Save-B64 $bmp "bolt"; $bmp.Dispose()

# crown (корона)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 16 70),(PF 16 36),(PF 33 50),(PF 48 28),(PF 63 50),(PF 80 36),(PF 80 70)))
$g.FillRectangle($wb, 16, 70, 64, 8)
$g.Dispose(); Save-B64 $bmp "crown"; $bmp.Dispose()

# flame (пламя)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 48 12),(PF 60 32),(PF 66 50),(PF 64 66),(PF 54 80),(PF 42 82),(PF 32 72),(PF 30 54),(PF 40 40),(PF 44 52),(PF 46 34)))
$g.Dispose(); Save-B64 $bmp "flame"; $bmp.Dispose()

# target (мишень)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$g.FillEllipse($wb, 14, 16, 68, 68)
$g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillEllipse((New-Object System.Drawing.SolidBrush($transparent)), 25, 27, 46, 46)
$g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceOver
$g.FillEllipse($wb, 35, 37, 26, 26)
$g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillEllipse((New-Object System.Drawing.SolidBrush($transparent)), 43, 45, 10, 10)
$g.Dispose(); Save-B64 $bmp "target"; $bmp.Dispose()

# rocket (ракета)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 48 10),(PF 62 34),(PF 62 62),(PF 54 70),(PF 42 70),(PF 34 62),(PF 34 34)))
# плавники
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 34 50),(PF 22 70),(PF 34 66)))
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 62 50),(PF 74 70),(PF 62 66)))
# пламя снизу
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 42 70),(PF 48 86),(PF 54 70)))
# иллюминатор (вырез)
$g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillEllipse((New-Object System.Drawing.SolidBrush($transparent)), 41, 33, 14, 14)
$g.Dispose(); Save-B64 $bmp "rocket"; $bmp.Dispose()

# trophy (кубок)
$r = New-G $S; $bmp=$r[0]; $g=$r[1]
$g.FillPolygon($wb,[System.Drawing.PointF[]]@((PF 28 20),(PF 68 20),(PF 64 44),(PF 48 54),(PF 32 44)))
$g.FillRectangle($wb, 44, 54, 8, 14)
$g.FillRectangle($wb, 32, 68, 32, 8)
# ручки (дуги толстым пером)
$pen = New-Object System.Drawing.Pen($white, 5)
$g.DrawArc($pen, 16, 20, 20, 26, 90, 180)
$g.DrawArc($pen, 60, 20, 20, 26, 270, 180)
$g.Dispose(); Save-B64 $bmp "trophy"; $bmp.Dispose()

Write-Output "badges done"
