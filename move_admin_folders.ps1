Write-Host "Reorganizing project folder structure..."

$newAdminDir = "src/app/admin"
if (!(Test-Path $newAdminDir)) {
    New-Item -ItemType Directory -Force -Path $newAdminDir
}

$oldAdminDir = "src/app/dashboard/admin"
if (Test-Path $oldAdminDir) {
    Write-Host "Moving admin files to $newAdminDir..."
    Move-Item -Path "$oldAdminDir/*" -Destination $newAdminDir -Force
    Remove-Item -Path $oldAdminDir -Recurse -Force
}

$clientDir = "src/app/dashboard/client"
if (Test-Path $clientDir) {
    Write-Host "Cleaning up legacy client directory..."
    Remove-Item -Path $clientDir -Recurse -Force
}

Write-Host "Folder reorganization complete!"
