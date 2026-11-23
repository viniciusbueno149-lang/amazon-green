# ============================================================================
# Amazon Green — Script de Publicação Automática no GitHub
# ============================================================================

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   🌿 AMAZON GREEN — Deploy no GitHub" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

# Verificar se Git esta instalado
try {
    $gitVer = git --version
    Write-Host "[OK] $gitVer detectado." -ForegroundColor Cyan
} catch {
    Write-Host "[ERRO] O Git nao esta instalado ou nao esta no PATH." -ForegroundColor Red
    exit 1
}

# Inicializar repositorio se necessario
if (-not (Test-Path ".git")) {
    Write-Host "[INFO] Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Verificar se ha commits
git add .
$status = git status --porcelain
if ($status) {
    Write-Host "[INFO] Criando commit das alteracoes..." -ForegroundColor Yellow
    git commit -m "feat: Amazon Green environmental monitoring platform for Manaus"
} else {
    Write-Host "[OK] Todos os arquivos estao commitados." -ForegroundColor Cyan
}

# Verificar remote atual
$currentRemote = ""
try {
    $currentRemote = git remote get-url origin 2>$null
} catch {}

if ($currentRemote) {
    Write-Host ""
    Write-Host "Repositorio remoto atual configurado:" -ForegroundColor Cyan
    Write-Host "  -> $currentRemote" -ForegroundColor Green
    Write-Host ""
    $resp = Read-Host "Deseja enviar agora para este repositorio? (S/N)"
    if ($resp -match "^[Ss]") {
        Write-Host "[INFO] Enviando para o GitHub (git push -u origin main)..." -ForegroundColor Yellow
        git push -u origin main
        Write-Host ""
        Write-Host "[SUCESSO] Projeto enviado com sucesso para o GitHub!" -ForegroundColor Green
        exit 0
    }
}

Write-Host ""
Write-Host "Para vincular seu repositorio do GitHub, cole a URL abaixo." -ForegroundColor White
Write-Host "Exemplo: https://github.com/SEU_USUARIO/amazon-green.git" -ForegroundColor Gray
Write-Host ""
$repoUrl = Read-Host "Cole a URL do seu repositorio no GitHub"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[AVISO] Nenhuma URL informada. Abortando deploy." -ForegroundColor Yellow
    exit 0
}

# Configurar remote
try {
    git remote remove origin 2>$null
} catch {}

git remote add origin $repoUrl
Write-Host "[OK] Remote 'origin' configurado para: $repoUrl" -ForegroundColor Cyan

# Push
Write-Host "[INFO] Enviando arquivos para o branch 'main'..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   🎉 SUCESSO! Projeto publicado no GitHub com exito!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Acesse seu repositorio em: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[AVISO] Nao foi possivel realizar o push automaticamente." -ForegroundColor Yellow
    Write-Host "Verifique se voce esta autenticado no GitHub com suas credenciais ou chave SSH." -ForegroundColor White
}
