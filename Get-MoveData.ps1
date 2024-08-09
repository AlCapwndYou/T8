# Load necessary assemblies
Add-Type -AssemblyName System.Web

# Set the URL of the character's move list page
$url = "https://wavu.wiki/t/$character`_movelist"

# Load the HTML from the webpage
$webClient = New-Object System.Net.WebClient
$html = $webClient.DownloadString($url)

# Load the HTML into an HTML document object
$htmlDoc = New-Object HtmlAgilityPack.HtmlDocument
$htmlDoc.LoadHtml($html)

# Initialize an array to store move data
$moveDataList = @()

# Select all move nodes
$moveNodes = $htmlDoc.DocumentNode.SelectNodes("//div[contains(@class, 'movedata hover-bg-grey-03')]")

# Loop through each move node and extract relevant data
foreach ($moveNode in $moveNodes) {
    $moveData = @{}
    
    # Extract the ID
    $idNode = $moveNode.SelectSingleNode(".//div[@class='movedata-id']/a")
    if ($null -ne $idNode) {
        $moveData["id"] = $idNode.InnerText.TrimStart('#')
    }

    # Extract the move name
    $nameNode = $moveNode.SelectSingleNode(".//div[contains(@class, 'movedata-name')]")
    if ($null -ne $nameNode) {
        $moveData["name"] = $nameNode.InnerText.Trim()
    }

    # Extract the input
    $inputNode = $moveNode.SelectSingleNode(".//span[@class='movedata-input']")
    if ($null -ne $inputNode) {
        $moveData["input"] = $inputNode.InnerText.Trim()
    }

    # Extract the target
    $targetNode = $moveNode.SelectSingleNode(".//div[@class='movedata-target-ctn']/span[@class='movedata-target']")
    if ($null -ne $targetNode) {
        $moveData["target"] = $targetNode.InnerText.Trim()
        # Remove zero-width space and other HTML entities
        $targetNode = $targetNode -replace '\u200B', '' 
        $targetNode = $targetNode -replace '&.*?;', '' 
        $targetNode = $targetNode.Trim()
        $moveData["target"] = $targetNode
    }

    # Extract the damage data and clean up
    $damageNode = $moveNode.SelectSingleNode(".//div[@class='movedata-damage-ctn']/span[@class='movedata-damage']")
    if ($null -ne $damageNode) {
        $damage = $damageNode.InnerText
        # Remove zero-width space and other HTML entities
        $damage = $damage -replace '\u200B', '' 
        $damage = $damage -replace '&.*?;', '' 
        $damage = $damage.Trim()
        $moveData["damage"] = $damage
    }

    # Extract block frame data
    $blockNode = $moveNode.SelectSingleNode(".//div[@class='movedata-block']")
    if ($null -ne $blockNode) {
        $moveData["block"] = $blockNode.InnerText.Trim()
    }

    # Extract hit frame data
    $hitNode = $moveNode.SelectSingleNode(".//div[@class='movedata-hit']")
    if ($null -ne $hitNode) {
        $moveData["hit"] = $hitNode.InnerText.Trim()
    }

    # Extract counter-hit frame data
    $chNode = $moveNode.SelectSingleNode(".//div[@class='movedata-ch']")
    if ($null -ne $chNode) {
        $moveData["ch"] = $chNode.InnerText.Trim()
    }

    # Extract startup frame data
    $startupNode = $moveNode.SelectSingleNode(".//div[@class='movedata-startup']")
    if ($null -ne $startupNode) {
        $moveData["startup"] = $startupNode.InnerText.Trim()
    }

    # Extract recovery data
    $recvNode = $moveNode.SelectSingleNode(".//div[@class='movedata-recv-ctn']/span[@class='movedata-recv']")
    if ($null -ne $recvNode) {
        $moveData["recv"] = $recvNode.InnerText.Trim()
    }

    # Extract notes
    $notesNode = $moveNode.SelectSingleNode(".//div[@class='movedata-notes']")
    if ($null -ne $notesNode) {
        $notes = $notesNode.InnerText.Trim()
        # Remove any zero-width space and other unwanted characters
        $notes = $notes -replace '\u200B', ''
        $notes = $notes -replace '&.*?;', ''
        $moveData["notes"] = $notes
    }

    # Add the move data to the list
    $moveDataList += $moveData
}

# Convert the move data list to JSON format and export to a file
$json = $moveDataList | ConvertTo-Json -Depth 3
$json | Out-File -FilePath "C:/Temp/AlisaMoveList.json" -Encoding utf8

# Output the path to the generated JSON file
Write-Output "JSON data saved to AlisaMoveList.json"
