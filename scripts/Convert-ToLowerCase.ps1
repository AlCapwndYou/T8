Get-ChildItem -Path ".\media" -File -Recurse -Filter *.mp4 | Rename-Item -NewName {$_.FullName.ToLower()}
