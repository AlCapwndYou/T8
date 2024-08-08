$CSV = Import-Csv .\media\movelist.csv | Sort-Object -Property Character
$Character = [PSCustomObject]@{
    character = ""
    moves = @()
}
$CharacterList = @()
$MoveArray = @()

foreach ($x in $CSV) {
    
    $move = [PSCustomObject]@{
        name = ""
        input = ""
        dmg = @()
        hitranges = @()
        hitsgrounded = ""
        startupframes = ""
        framesonblock = ""
        framesonhit = ""
        framesonctrhit = ""
        transitionstance = ""
        properties = @()
        extensions = @()
        videofilename = ""
        videourl = ""
    }

    if ($CharacterList -contains $x.Character) {
        # Character already added, so can skip that part, parse the rest...
        Write-Host "adding move to $($Character.character)"
        $shortname = $x.FileName.Split(".")
        $move.input = $shortname[0]
        $move.name = $shortname[0]
        $move.videofilename = $x.FileName
        $move.videourl = $x.MediaURL
        $MoveArray += $move
    }
    else {
        # First time encountering, so save any previous and create a new obj to populate...
        if ($null -eq $Character.character){
            Write-Host "First character..."
            $CharacterList += $x.Character
            #$JSONFileName = "$($x.Character).json"
            #Out-File $JSONFileName -Force
        }
        elseif ($Character.character -ne $x.Character){
            Write-Host "New character..."
            $x.Character
            Write-Host "saving previous..."
            $Character.character
            $Character.moves = $MoveArray
            $Character | ConvertTo-Json | Out-File "$($Character.character).json" -Append
            $MoveArray = @()
            $CharacterList += $x.Character
        }
        
        $Character = [PSCustomObject]@{
            character = $x.Character
            moves = @()
        }
        $shortname = $x.FileName.Split(".")
        $move.input = $shortname[0]
        $move.name = $shortname[0]
        $move.videofilename = $x.FileName
        $move.videourl = $x.MediaURL
        $MoveArray += $move
        }
    }