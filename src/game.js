import gsap from "gsap";
import { Container, Sprite, Graphics, Text } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";
import LevelData from "./classes/LevelData";
import WordGrid from "./classes/WordGrid";
import LetterTray from "./classes/LetterTray";
import UI from "./classes/UI";
import Tutorial from "./classes/Tutorial";
import ParticleSystem from "./classes/ParticleSystem";
import ShuffleButton from "./classes/ShuffleButton";
import LevelManager from "./classes/LevelManager";
import Theme from "./classes/Theme";

/**
 * Game - Ana oyun sınıfı
 * Words of Wonders tarzı kelime oyunu
 */
export default class Game extends Container {
  constructor() {
    super();

    this.isGameOver = false;
    this.levelManager = new LevelManager();
    this.init();
  }

  init() {
    this.createBackground();
    this.loadCurrentLevel();
    this.createWordGrid();
    this.createLetterTray();
    this.createUI();
    this.createTutorial();
    this.createParticleSystem();
    this.playEntranceAnimations();
  }

  /**
   * Arka plan oluştur - Dark Purple Theme
   */
  createBackground() {
    // Gradient arka plan
    this.bg = new Graphics();
    this.bg.beginFill(Theme.bgDark);
    this.bg.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.bg.endFill();
    this.addChild(this.bg);
    
    // Dekoratif mor glow efekti
    this.glowTop = new Graphics();
    this.glowTop.beginFill(Theme.primary, 0.1);
    this.glowTop.drawEllipse(GAME_WIDTH / 2, 0, GAME_WIDTH, 200);
    this.glowTop.endFill();
    this.addChild(this.glowTop);
    
    this.glowBottom = new Graphics();
    this.glowBottom.beginFill(Theme.primary, 0.15);
    this.glowBottom.drawEllipse(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH * 0.8, 300);
    this.glowBottom.endFill();
    this.addChild(this.glowBottom);
  }

  /**
   * Mevcut level'ı yükle
   */
  loadCurrentLevel() {
    const level = this.levelManager.getCurrentLevel();
    this.levelData = new LevelData(level.letters, level.words);
    
    console.log("Level Loaded:", {
      id: level.id,
      name: level.name,
      letters: this.levelData.letters,
      words: this.levelData.words
    });
  }

  /**
   * Kelime grid'ini oluştur
   */
  createWordGrid() {
    this.wordGrid = new WordGrid(this.levelData, {
      cellSize: 55,
      cellGap: 6
    });
    this.wordGrid.x = GAME_WIDTH / 2;
    this.wordGrid.y = 200;
    this.addChild(this.wordGrid);
  }

  /**
   * Harf tepsisini oluştur
   */
  createLetterTray() {
    this.letterTray = new LetterTray(this.levelData.letters, {
      trayRadius: 100,
      letterRadius: 35,
      onWordSubmit: (word) => this.onWordSubmit(word),
      onWordChange: (word) => this.onWordChange(word)
    });
    this.letterTray.x = GAME_WIDTH / 2;
    this.letterTray.y = GAME_HEIGHT - 200;
    this.addChild(this.letterTray);
    
    // Shuffle butonu
    this.shuffleButton = new ShuffleButton({
      size: 50,
      onClick: () => this.letterTray.shuffleLetters()
    });
    this.shuffleButton.x = GAME_WIDTH / 2 + 150;
    this.shuffleButton.y = GAME_HEIGHT - 200;
    this.addChild(this.shuffleButton);
  }

  /**
   * UI oluştur
   */
  createUI() {
    this.ui = new UI({
      gameWidth: GAME_WIDTH,
      gameHeight: GAME_HEIGHT,
      levelManager: this.levelManager
    });
    this.addChild(this.ui);
    
    // İlk durumu göster
    this.ui.updateProgress(0, this.levelData.getTotalCount());
    this.ui.updateLevelInfo(this.levelManager.getCurrentLevelNumber(), this.levelManager.getCurrentLevel().name);
  }

  /**
   * Tutorial oluştur
   */
  createTutorial() {
    this.tutorial = new Tutorial(this.letterTray);
    this.tutorial.setPosition(GAME_WIDTH / 2, this.letterTray.y);
    this.addChild(this.tutorial);

    // İlk kelime için tutorial başlat
    this.startTutorial();
  }

  /**
   * Tutorial'ı başlat
   */
  startTutorial() {
    const firstWord = this.levelData.words[0];
    if (!firstWord) return;

    // Harflerin pozisyonlarını hesapla
    const letterPositions = [];
    const word = firstWord.word;
    
    for (const char of word) {
      const circle = this.letterTray.letterCircles.find(c => 
        c.letter === char && !letterPositions.some(p => p.circle === c)
      );
      if (circle) {
        const globalPos = circle.getGlobalPosition();
        letterPositions.push({ 
          x: globalPos.x, 
          y: globalPos.y,
          circle 
        });
      }
    }

    // 2 saniye sonra tutorial başlat
    gsap.delayedCall(1.5, () => {
      this.tutorial.start(word, letterPositions);
    });
  }

  /**
   * Kelime gönderildiğinde
   * @param {string} word 
   */
  onWordSubmit(word) {
    if (this.isGameOver) return;

    const wordData = this.levelData.checkWord(word);
    
    if (wordData) {
      // Kelime bulundu!
      this.onWordFound(wordData);
    } else {
      // Kelime geçersiz
      this.onWordInvalid(word);
    }
  }

  /**
   * Kelime değiştiğinde
   * @param {string} word 
   */
  onWordChange(word) {
    // İsteğe bağlı: Kelime değişikliklerini takip et
  }

  /**
   * Geçerli kelime bulunduğunda
   * @param {Object} wordData 
   */
  onWordFound(wordData) {
    // Tutorial'ı durdur
    this.tutorial.stop();

    // Kelimeyi işaretle
    this.levelData.markWordAsFound(wordData.word);
    
    // Başarı animasyonu
    this.letterTray.playSuccessAnimation();
    
    // Grid'de kelimeyi aç
    this.wordGrid.revealWord(wordData, 0.08);
    
    // Parçacık efekti - grid hücrelerinde
    const cells = this.wordGrid.getCellsForWord(wordData);
    cells.forEach((cell, index) => {
      gsap.delayedCall(index * 0.08, () => {
        const globalPos = cell.getGlobalPosition();
        this.particleSystem.emitSuccess(globalPos.x, globalPos.y, 8);
      });
    });

    // UI güncelle
    this.ui.updateProgress(
      this.levelData.getFoundCount(),
      this.levelData.getTotalCount()
    );

    // Mesaj göster
    this.ui.showMessage("Harika! 🎉", "success", 1);

    // Level tamamlandı mı?
    if (this.levelData.isLevelComplete()) {
      this.onLevelComplete();
    }
  }

  /**
   * Geçersiz kelime girildiğinde
   * @param {string} word 
   */
  onWordInvalid(word) {
    this.letterTray.playFailAnimation();
    
    // Zaten bulunan kelime mi?
    if (this.levelData.foundWords.has(word.toUpperCase())) {
      this.ui.showMessage("Zaten buldun!", "info", 1);
    }
  }

  /**
   * Level tamamlandığında
   */
  onLevelComplete() {
    this.isGameOver = true;
    
    // Biraz bekle ve tamamlandı ekranını göster
    gsap.delayedCall(1, () => {
      const isLastLevel = this.levelManager.isLastLevel();
      this.ui.showLevelComplete(isLastLevel, () => this.goToNextLevel());
    });
  }

  /**
   * Sonraki level'a geç
   */
  goToNextLevel() {
    const nextLevel = this.levelManager.nextLevel();
    if (nextLevel) {
      this.restart();
    }
  }

  /**
   * ParticleSystem oluştur
   */
  createParticleSystem() {
    this.particleSystem = new ParticleSystem();
    this.addChild(this.particleSystem);
  }

  /**
   * Giriş animasyonları
   */
  playEntranceAnimations() {
    // Sıralı animasyonlar
    this.wordGrid.playEntranceAnimation();
    
    gsap.delayedCall(0.3, () => {
      this.letterTray.playEntranceAnimation();
    });
    
    gsap.delayedCall(0.4, () => {
      this.shuffleButton.playEntranceAnimation();
    });

    gsap.delayedCall(0.5, () => {
      this.ui.playEntranceAnimation();
    });
  }

  /**
   * Oyunu yeniden başlat
   */
  restart() {
    // Tüm çocukları temizle
    this.removeChildren();
    
    // Yeniden başlat
    this.isGameOver = false;
    this.init();
  }

  /**
   * Yeni level yükle
   * @param {string} letters - "A,B,C,D" formatında
   * @param {string} words - "x,y,WORD,DIR|..." formatında
   */
  loadLevel(letters, words) {
    Game.LEVEL_LETTERS = letters;
    Game.LEVEL_WORDS = words;
    this.restart();
  }
}

