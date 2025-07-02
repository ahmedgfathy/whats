# PowerShell script to delete unwanted backup files
$filesToDelete = @(
    "c:\Users\Administrator\Downloads\whats\src\components\ChatImportSimple.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\ChatImport_New.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\ChatImport_Old.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\Dashboard_New.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\Dashboard_Old.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\EnhancedDashboard.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\PropertyDetailsModal_New.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\PropertyDetailsModal_Old.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\PropertyStats_New.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\PropertyStats_Old.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\SearchResults_New.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\SearchResults_Old.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\SimpleDashboardWorking.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\SimpleDashboard_Complete.jsx",
    "c:\Users\Administrator\Downloads\whats\src\components\SimpleDashboard_Fixed.jsx"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Cleanup completed!"
