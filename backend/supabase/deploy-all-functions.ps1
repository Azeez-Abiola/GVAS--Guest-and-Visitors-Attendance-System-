# Deploy Supabase Edge Functions

Write-Host "Deploying Supabase Edge Functions..." -ForegroundColor Cyan

# Check for supabase command
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    $cmd = "supabase"
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    $cmd = "npx supabase"
} else {
    Write-Error "Supabase CLI not found. Please install it."
    exit 1
}

# Deploy functions
$functions = @("create-user", "delete-user", "update-user")

foreach ($func in $functions) {
    Write-Host "Deploying $func..." -ForegroundColor Yellow
    Invoke-Expression "$cmd functions deploy $func"
}

Write-Host "Deployment complete." -ForegroundColor Green
