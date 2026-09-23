$ErrorActionPreference = 'Stop'
$env:PYTHONIOENCODING = 'utf-8'

try {
    $env:MAPBOX_ACCESS_TOKEN = gcloud secrets versions access latest `
        --secret=MAPBOX_ACCESS_TOKEN `
        --project=terroir-trail

    if ([string]::IsNullOrWhiteSpace($env:MAPBOX_ACCESS_TOKEN)) {
        throw 'Mapbox secret could not be loaded.'
    }

    python "$PSScriptRoot\validate_mapbox_matrix.py"
    if ($LASTEXITCODE -ne 0) {
        throw 'Mapbox Matrix validation failed.'
    }
}
finally {
    Remove-Item Env:MAPBOX_ACCESS_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:PYTHONIOENCODING -ErrorAction SilentlyContinue
}