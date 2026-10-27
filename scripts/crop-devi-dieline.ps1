# Extracts the Devi Sambrani Dhoop Cup sleeve panels.
# Source: public/experience/devi-dieline.jpg (1024 x 1018). Left unchanged.
# The sleeve wraps top band -> front -> bottom band -> back, with a glue strip below the back.
# Fold lines sit at y 118-119, 501-502, 578-579 and 961, and are excluded from the crops.
# Coordinates are inclusive pixels, origin at the top-left of that file.
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File scripts/crop-devi-dieline.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot "public\experience\devi-dieline.jpg"
$outputDir = Join-Path $projectRoot "public\experience\textures\devi"

$expectedWidth = 1024
$expectedHeight = 1018

# name, x1, y1, x2, y2  (inclusive)
$crops = @(
    @{ Name = "top-band";    X1 = 270; Y1 = 43;  X2 = 729; Y2 = 117 },
    @{ Name = "front";       X1 = 270; Y1 = 120; X2 = 729; Y2 = 500 },
    @{ Name = "bottom-band"; X1 = 270; Y1 = 503; X2 = 729; Y2 = 577 },
    @{ Name = "back";        X1 = 270; Y1 = 580; X2 = 729; Y2 = 960 }
)

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source dieline not found: $sourcePath"
}

$sourceBefore = Get-Item -LiteralPath $sourcePath
$sourceHashBefore = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash

$source = New-Object System.Drawing.Bitmap $sourcePath
try {
    if ($source.Width -ne $expectedWidth -or $source.Height -ne $expectedHeight) {
        throw "Expected ${expectedWidth}x${expectedHeight}, found $($source.Width)x$($source.Height)."
    }

    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

    foreach ($crop in $crops) {
        $x1 = [int]$crop.X1
        $y1 = [int]$crop.Y1
        $x2 = [int]$crop.X2
        $y2 = [int]$crop.Y2
        $width = $x2 - $x1 + 1
        $height = $y2 - $y1 + 1

        if ($x1 -lt 0 -or $y1 -lt 0 -or $x2 -ge $source.Width -or $y2 -ge $source.Height) {
            throw "$($crop.Name) is outside ${expectedWidth}x${expectedHeight}: x $x1-$x2, y $y1-$y2."
        }

        $rect = New-Object System.Drawing.Rectangle $x1, $y1, $width, $height
        $piece = $source.Clone($rect, $source.PixelFormat)
        try {
            $outPath = Join-Path $outputDir ($crop.Name + ".png")
            $piece.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
            "{0}`t{1}x{2}`tx {3}-{4}`ty {5}-{6}" -f $crop.Name, $width, $height, $x1, $x2, $y1, $y2
        }
        finally {
            $piece.Dispose()
        }
    }
}
finally {
    $source.Dispose()
}

$sourceAfter = Get-Item -LiteralPath $sourcePath
$sourceHashAfter = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
if ($sourceHashBefore -ne $sourceHashAfter -or $sourceBefore.Length -ne $sourceAfter.Length) {
    throw "Source dieline changed during cropping."
}

"SOURCE UNCHANGED`t$($sourceAfter.Length) bytes`t$sourceHashAfter"
