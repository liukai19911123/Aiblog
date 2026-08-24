$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$archivePath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'luck-tech-blog.zip'))

if (-not $archivePath.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Archive path is outside the project root.'
}

$relativeFiles = @(
    'index.html'
    'about.md'
    'css\styles.css'
    'js\app.js'
    'js\config.js'
    'posts\build-a-calm-digital-garden.md'
    'posts\javascript-without-frameworks.md'
    'posts\write-to-think.md'
)

foreach ($relativeFile in $relativeFiles) {
    $sourcePath = Join-Path $projectRoot $relativeFile
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        throw "Missing deployment file: $relativeFile"
    }
}

if (Test-Path -LiteralPath $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archiveStream = [System.IO.File]::Open(
    $archivePath,
    [System.IO.FileMode]::CreateNew,
    [System.IO.FileAccess]::ReadWrite,
    [System.IO.FileShare]::None
)

try {
    $archive = [System.IO.Compression.ZipArchive]::new(
        $archiveStream,
        [System.IO.Compression.ZipArchiveMode]::Create,
        $true
    )
    try {
        foreach ($relativeFile in $relativeFiles) {
            $sourcePath = Join-Path $projectRoot $relativeFile
            $entryName = $relativeFile.Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $sourcePath,
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
    finally {
        $archive.Dispose()
    }
}
finally {
    $archiveStream.Dispose()
}

$checkArchive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
try {
    $entryNames = @($checkArchive.Entries | ForEach-Object { $_.FullName })
    $invalidEntries = @($entryNames | Where-Object {
        $_ -match '\\' -or
        ($_ -split '/' | Where-Object { $_ -match '[:*?"<>|]' }).Count -gt 0
    })

    if ($invalidEntries.Count -gt 0) {
        throw "Invalid ZIP entry names: $($invalidEntries -join ', ')"
    }
    if (($entryNames | Where-Object { $_ -eq 'index.html' }).Count -ne 1) {
        throw 'The ZIP must contain exactly one root-level index.html.'
    }
    if ($entryNames.Count -ne $relativeFiles.Count) {
        throw "Unexpected ZIP entry count: $($entryNames.Count)"
    }

    $checkArchive.Entries |
        Sort-Object FullName |
        Select-Object FullName, Length, CompressedLength |
        Format-Table -AutoSize
}
finally {
    $checkArchive.Dispose()
}

$hash = Get-FileHash -LiteralPath $archivePath -Algorithm SHA256
Write-Output "ARCHIVE $archivePath"
Write-Output "SIZE $((Get-Item -LiteralPath $archivePath).Length)"
Write-Output "SHA256 $($hash.Hash)"
