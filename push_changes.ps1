param(
    [string]$Branch = "master",
    [string]$CommitMessage = "Update car rental system files"
)

$ErrorActionPreference = "Stop"

Write-Host "Committing and pushing changes to GitHub..."

if (Test-Path "move_admin_folders.ps1") {
    Remove-Item "move_admin_folders.ps1" -Force
}

git add -A

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "No changes detected. Skipping commit."
} else {
    git commit -m $CommitMessage
}

git push origin $Branch
Write-Host "Done."
