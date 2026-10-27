# Extracts approved Lavender dieline panel crops.
# Source: public/experience/lavender-dieline.jpeg (809 x 1246). Left unchanged.
# Coordinates are inclusive pixels, origin at the top-left of that file.
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File scripts/crop-lavender-dieline.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot "public\experience\lavender-dieline.jpeg"
$outputDir = Join-Path $projectRoot "public\experience\lavender"

$expectedWidth = 809
$expectedHeight = 1246

# name, x1, y1, x2, y2  (inclusive)
$crops = @(
    @{ Name = "front-top-flap";            X1 = 32;  Y1 = 0;    X2 = 300; Y2 = 141  },
    @{ Name = "front";                     X1 = 32;  Y1 = 143;  X2 = 300; Y2 = 1104 },
    @{ Name = "glue-tab";                  X1 = 0;   Y1 = 142;  X2 = 28;  Y2 = 1104 },
    @{ Name = "warning-side-top-flap";     X1 = 304; Y1 = 88;   X2 = 391; Y2 = 167  },
    # y=168 is the first row of the printed brand mark. y=178 cut through it.
    @{ Name = "warning-side";              X1 = 304; Y1 = 168;  X2 = 391; Y2 = 1104 },
    @{ Name = "warning-side-bottom-flap";  X1 = 304; Y1 = 1106; X2 = 391; Y2 = 1151 },
    @{ Name = "back";                      X1 = 395; Y1 = 142;  X2 = 664; Y2 = 1105 },
    @{ Name = "social-side-top-flap";      X1 = 668; Y1 = 88;   X2 = 756; Y2 = 176  },
    @{ Name = "social-side";               X1 = 668; Y1 = 182;  X2 = 756; Y2 = 1104 },
    @{ Name = "social-side-bottom-flap";   X1 = 668; Y1 = 1106; X2 = 756; Y2 = 1155 },
    @{ Name = "back-bottom-flap";          X1 = 395; Y1 = 1108; X2 = 664; Y2 = 1245 }
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
        if ($width -le 0 -or $height -le 0) {
            throw "$($crop.Name) has a non-positive size: ${width}x${height}."
        }

        $rect = New-Object System.Drawing.Rectangle $x1, $y1, $width, $height
        $piece = $source.Clone($rect, $source.PixelFormat)
        try {
            $outPath = Join-Path $outputDir ($crop.Name + ".png")
            $piece.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $saved = New-Object System.Drawing.Bitmap $outPath
            try {
                if ($saved.Width -ne $width -or $saved.Height -ne $height) {
                    throw "$($crop.Name) saved as $($saved.Width)x$($saved.Height), expected ${width}x${height}."
                }
            }
            finally {
                $saved.Dispose()
            }
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
