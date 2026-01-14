# 🎮 Word Puzzle Mini Game

Words of Wonders tarzı kelime bulmaca oyunu. PixiJS ile geliştirildi.

## 🎯 Özellikler

- 10 farklı level
- Sürükle-bırak kelime oluşturma
- Güzel animasyonlar ve parçacık efektleri
- Karanlık mor tema
- Mobil uyumlu

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)

### 🛠 Installation and Setup

```bash
# 1. Install Packages
npm install

# 2. Run the Project (Development)
npm start

# 3. Build the Project (Production)
npm run build
```

## 🌐 GitHub Pages Deployment

1. GitHub'da yeni bir repository oluştur
2. Projeyi push et:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
git push -u origin main
```

3. GitHub'da repo ayarlarına git: **Settings** → **Pages**
4. **Source** kısmında:
   - Branch: `main`
   - Folder: `/dist`
5. **Save** butonuna tıkla

Birkaç dakika içinde oyunun şu adreste yayınlanacak:
`https://KULLANICI_ADIN.github.io/REPO_ADIN/`

## 🛠 Technologies

- [PixiJS](https://pixijs.com/) - 2D WebGL Rendering
- [GSAP](https://greensock.com/gsap/) - Animations
- [Webpack](https://webpack.js.org/) - Module Bundler
