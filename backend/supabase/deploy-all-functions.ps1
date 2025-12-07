# Deploy Supabase Edge Functions
# Run this from the backend/supabase directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Supabase Edge Functions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
Write-Host "Checking Supabase CLI installation..." -ForegroundColor Yellow
$supabaseCheck = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCheck) {
    Write-Host "ERROR: Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "Or see: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Deploy create-user function
Write-Host "1. Deploying create-user function..." -ForegroundColor Cyan
supabase functions deploy create-user

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ create-user deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to deploy create-user" -ForegroundColor Red
}
Write-Host ""

# Deploy delete-user function
Write-Host "2. Deploying delete-user function..." -ForegroundColor Cyan
supabase functions deploy delete-user

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ delete-user deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to deploy delete-user" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Functions are now available at:" -ForegroundColor Yellow
Write-Host "• create-user: https://[YOUR-PROJECT-REF].supabase.co/functions/v1/create-user" -ForegroundColor White
Write-Host "• delete-user: https://[YOUR-PROJECT-REF].supabase.co/functions/v1/delete-user/{userId}" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify functions in Supabase Dashboard → Edge Functions" -ForegroundColor White
Write-Host "2. Test user creation and deletion in your app" -ForegroundColor White
Write-Host "3. Check function logs if you encounter any errors" -ForegroundColor White
Write-Host ""
