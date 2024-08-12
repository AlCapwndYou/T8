# Import necessary modules
Import-Module BitsTransfer
Import-Module Microsoft.PowerShell.Utility

# Define constants
$WAVU_API_URL = "https://wavu.wiki/w/api.php"
$WAVU_FILE_LINK = "https://wavu.wiki/t/Special:Redirect/file/"

# Define available fields for the Move table in the Wavu DB
$FIELDS = @(
    "id", "name", "input", "parent", "target", "damage", "startup", "recv", "tot",
    "crush", "block", "hit", "ch", "notes", "alias", "image", "video", "alt", "_pageNamespace=ns"
)

# Define function to get Wavu API response
function Get-WavuResponse {
    param(
        [string]$character_name,
        [string]$format = "json"
    )
    
    $params = @{
        action = "cargoquery"
        tables = "Move"
        fields = ($FIELDS -join ",")
        where = "id LIKE '$($character_name.ToUpper())%'"
        having = ""
        order_by = "id"
        limit = "500"
        format = $format
    }
    
    $response = Invoke-RestMethod -Uri $WAVU_API_URL -Method Get -Body $params
    return $response
}

# Define function to process dotlist
function Process-Dotlist {
    param([string]$dotlist)
    
    return ($dotlist -replace "\* ", "") -split "`n"
}

# Define function to remove HTML tags
function Remove-HTMLTags {
    param([string]$data)
    
    $result = $data -replace "\<.*?\>", ""
    return $result.Trim()
}

# Define function to convert JSON move to WavuMove object
function Convert-JSONMove {
    param([hashtable]$move_json)

    $move = @{
        id = $move_json["id"]
        parent = $move_json["parent"]
        name = $move_json["name"]
        input = $move_json["input"]
        target = $move_json["target"]
        damage = $move_json["damage"]
        on_block = Remove-HTMLTags($move_json["block"])
        on_hit = Remove-HTMLTags($move_json["hit"])
        on_ch = if ($move_json["ch"]) { Remove-HTMLTags($move_json["ch"]) } else { $move_json["hit"] }
        startup = $move_json["startup"]
        recovery = $move_json["recv"]
        notes = Remove-HTMLTags($move_json["notes"]).Trim()
        alias = if ($move_json["alias"]) { Process-Dotlist($move_json["alias"]) } else { @() }
        alt = if ($move_json["alt"]) { Process-Dotlist($move_json["alt"]) } else { @() }
        image = if ($move_json["image"]) { "$WAVU_FILE_LINK$($move_json["image"].Split(":")[-1] -replace " ", "_")" } else { "" }
        video = if ($move_json["video"]) { "$WAVU_FILE_LINK$($move_json["video"].Split(":")[-1] -replace " ", "_")" } else { "" }
    }
    
    return $move
}

# Define function to convert JSON movelist to WavuMove objects
function Convert-JSONMovelist {
    param([array]$movelist_json)
    
    $movelist = @()
    foreach ($move in $movelist_json) {
        $movelist += Convert-JSONMove $move
    }
    
    return $movelist
}

# Define main script execution
$character_name = "Alisa"  # Replace with actual character name
$response = Get-WavuResponse -character_name $character_name
$movelist = Convert-JSONMovelist -movelist_json $response.cargoquery
$movelist | ForEach-Object { Write-Output $_ }
