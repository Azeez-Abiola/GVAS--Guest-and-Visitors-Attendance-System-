# Deploy Supabase Edge Function: create-user
# Run this from the backend/supabase directory

Write-Host "Deploying create-user Edge Function..." -ForegroundColor Cyan

# Deploy the function
supabase functions deploy create-user

Write-Host "`nEdge Function deployed successfully!" -ForegroundColor Green
Write-Host "`nThe function is now available at:" -ForegroundColor Yellow
Write-Host "https://[YOUR-PROJECT-REF].supabase.co/functions/v1/create-user" -ForegroundColor White
Write-Host "`nMake sure to:" -ForegroundColor Yellow
Write-Host "1. Set SUPABASE_SERVICE_ROLE_KEY in your Supabase dashboard" -ForegroundColor White
Write-Host "2. Configure email templates in Authentication > Email Templates" -ForegroundColor White
