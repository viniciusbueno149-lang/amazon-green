# 🌿 Amazon Green — Monitoramento Ambiental de Manaus

> **Plataforma de vigilância atmosférica, microclima equatorial e silvicultura urbana corretiva para os 63 bairros de Manaus, Amazonas.**

Inspirado na estética editorial e científica do template **Dantora** (GetLayers), o **Amazon Green** combina telemetria meteorológica contínua em tempo real, cartografia geoespacial gratuita e modelos de cálculo de recomposição de biomassa para regeneração da qualidade do ar.

---

## 🚀 Funcionalidades Principais

- **63 Bairros de Manaus Georreferenciados**: Coordenadas reais de latitude e longitude cobrindo as 6 zonas da cidade (Norte, Sul, Leste, Oeste, Centro-Sul e Centro-Oeste).
- **Cálculo de Qualidade do Ar (IQA)**: Diagnóstico em 6 patamares: *Excelente, Ótima, Boa, Regular, Ruim e Péssima*.
- **Estimativa Silvicultural de Mudas**: Equação baseada no déficit entre o IQA medido e o patamar Excelente, considerando área territorial e taxa de absorção de CO₂ (22 kg/ano por árvore madura).
- **Cartografia 100% Gratuita**: Mapa interativo com **Leaflet.js** e o tileLayer público **CartoDB Dark Matter** (`dark_all`), sem necessidade de chaves de API, cobranças ou billing.
- **Telemetria Meteorológica em Tempo Real (Open-Meteo API)**:
  - Temperatura de superfície (2m)
  - Camada limite sobre o dossel florestal (80m) para medição de inversão térmica
  - Umidade relativa do ar (%)
  - Visibilidade atmosférica (km)
  - Série temporal histórica dos últimos 7 dias (`past_days=7`)
- **8 Espécies Nativas da Amazônia**: Recomendações adaptadas para arborização urbana (*Castanheira, Seringueira, Açaizeiro, Mogno Brasileiro, Andiroba, Sumaúma, Ipê-amarelo e Pau-rosa*).

---

## 📁 Estrutura de Arquivos

```
amazon-green/
├── index.html           # Estrutura editorial, navegação em cápsula e seções
├── styles.css           # Design system Dantora (Paleta névoa, verde floresta e lime elétrico)
├── app.js               # Lógica de renderização, mapa Leaflet e telemetria Open-Meteo
├── data.js              # Base dos 63 bairros com geolocalização e conexão com Open-Meteo
├── deploy-github.ps1    # Script PowerShell para publicar no GitHub com 1 comando
├── deploy-github.bat    # Script Batch para Windows
└── README.md            # Documentação completa
```

---

## 💻 Como Publicar no GitHub pelo Terminal

### Opção 1: Via Script Automatizado (Mais Rápido)

No PowerShell, na pasta do projeto:
```powershell
.\deploy-github.ps1
```
O script solicitará a URL do seu repositório no GitHub (ex: `https://github.com/SEU_USUARIO/amazon-green.git`) e fará o envio automaticamente!

---

### Opção 2: Passo a Passo no Terminal

1. **Crie um repositório vazio no GitHub**:
   - Acesse [github.com/new](https://github.com/new)
   - Nome do repositório: `amazon-green`
   - Deixe **desmarcada** a opção "Add a README file" (já temos o README pronto)
   - Clique em **Create repository**

2. **No Terminal (PowerShell ou Git Bash) na pasta do projeto**:
   ```bash
   cd C:\Users\Vinicius.santos\.gemini\antigravity\scratch\amazon-green

   # Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu usuário do GitHub)
   git remote add origin https://github.com/SEU_USUARIO/amazon-green.git

   # Enviar os arquivos para o GitHub
   git push -u origin main
   ```

---

## 🌐 Como Ativar o Site no GitHub Pages (Hospedagem Gratuita)

Depois de enviar o projeto para o GitHub:
1. Acesse o seu repositório no GitHub: `https://github.com/SEU_USUARIO/amazon-green`
2. Clique na aba **Settings** (Configurações)
3. No menu lateral esquerdo, clique em **Pages**
4. Em **Build and deployment > Branch**, selecione:
   - Branch: `main`
   - Pasta: `/ (root)`
   - Clique em **Save**
5. Em cerca de 1 a 2 minutos, seu aplicativo estará online gratuitamente no endereço:
   `https://SEU_USUARIO.github.io/amazon-green/`

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Moderno** (Variáveis CSS, CSS Grid, Flexbox, Glassmorphism)
- **Vanilla JavaScript (ES6+)**
- **Leaflet.js (v1.9.4)**
- **CartoDB Dark Matter Basemap**
- **Open-Meteo Weather API**
- **Google Fonts (Plus Jakarta Sans & JetBrains Mono)**

---

*Desenvolvido para preservação, vigilância climática e regeneração sustentável de Manaus, Amazonas.*
