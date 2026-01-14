import { Container, Sprite, Text, Graphics } from "pixi.js";
import gsap from "gsap";
import Theme from "./Theme";

/**
 * UI - Oyun arayüzü bileşenlerini yöneten sınıf
 * Dark Purple Theme
 */
export default class UI extends Container {
  constructor(options = {}) {
    super();
    
    this.gameWidth = options.gameWidth || 480;
    this.gameHeight = options.gameHeight || 800;
    this.levelManager = options.levelManager || null;
    
    this.init();
  }

  init() {
    this.createLevelDisplay();
    this.createProgressDisplay();
    this.createMessageDisplay();
  }

  /**
   * Level bilgisi gösterimi
   */
  createLevelDisplay() {
    this.levelContainer = new Container();
    this.levelContainer.x = this.gameWidth / 2;
    this.levelContainer.y = 30;
    this.addChild(this.levelContainer);

    // Level numarası
    this.levelText = new Text("Level 1", {
      fontFamily: "Sniglet",
      fontSize: 18,
      fill: Theme.textSecondary,
      fontWeight: "bold"
    });
    this.levelText.anchor.set(0.5);
    this.levelContainer.addChild(this.levelText);

    // Level adı
    this.levelNameText = new Text("Başlangıç", {
      fontFamily: "Sniglet",
      fontSize: 14,
      fill: Theme.textMuted
    });
    this.levelNameText.anchor.set(0.5);
    this.levelNameText.y = 22;
    this.levelContainer.addChild(this.levelNameText);
  }

  /**
   * İlerleme göstergesi oluştur
   */
  createProgressDisplay() {
    this.progressContainer = new Container();
    this.progressContainer.x = this.gameWidth / 2;
    this.progressContainer.y = 75;
    this.addChild(this.progressContainer);

    // Arka plan
    this.progressBg = new Graphics();
    this.progressBg.beginFill(Theme.bgLight, 0.9);
    this.progressBg.lineStyle(2, Theme.primary, 0.5);
    this.progressBg.drawRoundedRect(-70, -18, 140, 36, 18);
    this.progressBg.endFill();
    this.progressContainer.addChild(this.progressBg);

    // İlerleme metni
    this.progressText = new Text("0 / 4", {
      fontFamily: "Sniglet",
      fontSize: 22,
      fill: Theme.textPrimary,
      fontWeight: "bold"
    });
    this.progressText.anchor.set(0.5);
    this.progressContainer.addChild(this.progressText);
  }

  /**
   * Mesaj gösterimi oluştur
   */
  createMessageDisplay() {
    this.messageText = new Text("", {
      fontFamily: "Sniglet",
      fontSize: 36,
      fill: Theme.textPrimary,
      fontWeight: "bold",
      align: "center",
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 3,
      dropShadowAlpha: 0.5
    });
    this.messageText.anchor.set(0.5);
    this.messageText.x = this.gameWidth / 2;
    this.messageText.y = this.gameHeight / 2;
    this.messageText.alpha = 0;
    this.addChild(this.messageText);
  }

  /**
   * Level bilgisini güncelle
   */
  updateLevelInfo(levelNumber, levelName) {
    this.levelText.text = `Level ${levelNumber}`;
    this.levelNameText.text = levelName;
    
    // Animasyon
    gsap.fromTo(this.levelContainer.scale,
      { x: 1.3, y: 1.3 },
      { x: 1, y: 1, duration: 0.3, ease: "back.out(2)" }
    );
  }

  /**
   * İlerlemeyi güncelle
   * @param {number} found - Bulunan kelime sayısı
   * @param {number} total - Toplam kelime sayısı
   */
  updateProgress(found, total) {
    this.progressText.text = `${found} / ${total}`;
    
    // Animasyon
    gsap.fromTo(this.progressContainer.scale,
      { x: 1.2, y: 1.2 },
      { x: 1, y: 1, duration: 0.2, ease: "back.out(2)" }
    );
  }

  /**
   * Mesaj göster
   * @param {string} message - Gösterilecek mesaj
   * @param {string} type - Mesaj tipi (success, error, info)
   * @param {number} duration - Görünme süresi
   */
  showMessage(message, type = "info", duration = 1.5) {
    this.messageText.text = message;
    
    // Renk ayarla
    switch (type) {
      case "success":
        this.messageText.style.fill = Theme.success;
        break;
      case "error":
        this.messageText.style.fill = Theme.error;
        break;
      default:
        this.messageText.style.fill = Theme.textPrimary;
    }

    // Animasyon
    gsap.killTweensOf(this.messageText);
    this.messageText.alpha = 0;
    this.messageText.scale.set(0.5);
    
    gsap.to(this.messageText, {
      alpha: 1,
      duration: 0.3
    });
    
    gsap.to(this.messageText.scale, {
      x: 1,
      y: 1,
      duration: 0.3,
      ease: "back.out(2)"
    });

    // Otomatik gizle
    gsap.to(this.messageText, {
      alpha: 0,
      delay: duration,
      duration: 0.3
    });
  }

  /**
   * Level tamamlandı ekranı
   * @param {boolean} isLastLevel - Son level mi?
   * @param {Function} onNextLevel - Sonraki level callback
   */
  showLevelComplete(isLastLevel = false, onNextLevel = null) {
    // Overlay
    this.overlay = new Graphics();
    this.overlay.beginFill(Theme.bgDark, 0.85);
    this.overlay.drawRect(0, 0, this.gameWidth, this.gameHeight);
    this.overlay.endFill();
    this.overlay.alpha = 0;
    this.addChild(this.overlay);

    // Başarı ikonu - Mor glow
    this.successGlow = new Graphics();
    this.successGlow.beginFill(Theme.primary, 0.3);
    this.successGlow.drawCircle(this.gameWidth / 2, this.gameHeight / 2 - 60, 80);
    this.successGlow.endFill();
    this.successGlow.alpha = 0;
    this.addChild(this.successGlow);

    // Tebrik mesajı
    const completeMessage = isLastLevel 
      ? "🏆 Tüm Leveller\nTamamlandı! 🏆" 
      : "🎉 Level Tamamlandı! 🎉";
      
    this.completeText = new Text(completeMessage, {
      fontFamily: "Sniglet",
      fontSize: 32,
      fill: Theme.primaryLight,
      fontWeight: "bold",
      align: "center",
      dropShadow: true,
      dropShadowColor: Theme.primary,
      dropShadowDistance: 0,
      dropShadowBlur: 10,
      dropShadowAlpha: 0.8
    });
    this.completeText.anchor.set(0.5);
    this.completeText.x = this.gameWidth / 2;
    this.completeText.y = this.gameHeight / 2 - 50;
    this.completeText.alpha = 0;
    this.completeText.scale.set(0);
    this.addChild(this.completeText);

    // Sonraki level butonu (son level değilse)
    if (!isLastLevel && onNextLevel) {
      this.nextButton = this.createButton("Sonraki Level →", () => {
        this.hideOverlay();
        onNextLevel();
      });
      this.nextButton.x = this.gameWidth / 2;
      this.nextButton.y = this.gameHeight / 2 + 60;
      this.nextButton.alpha = 0;
      this.nextButton.scale.set(0);
      this.addChild(this.nextButton);
    }

    // Animasyonlar
    gsap.to(this.overlay, {
      alpha: 1,
      duration: 0.5
    });

    gsap.to(this.successGlow, {
      alpha: 1,
      duration: 0.5,
      delay: 0.2
    });

    // Glow pulse animasyonu
    gsap.to(this.successGlow.scale, {
      x: 1.2,
      y: 1.2,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(this.completeText, {
      alpha: 1,
      duration: 0.5,
      delay: 0.3
    });

    gsap.to(this.completeText.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      delay: 0.3,
      ease: "elastic.out(1, 0.5)"
    });

    if (this.nextButton) {
      gsap.to(this.nextButton, {
        alpha: 1,
        duration: 0.3,
        delay: 0.6
      });
      gsap.to(this.nextButton.scale, {
        x: 1,
        y: 1,
        duration: 0.4,
        delay: 0.6,
        ease: "back.out(2)"
      });
    }

    // Konfeti
    this.createConfetti();
  }

  /**
   * Buton oluştur
   */
  createButton(text, onClick) {
    const button = new Container();
    
    // Arka plan
    const bg = new Graphics();
    bg.beginFill(Theme.primary);
    bg.drawRoundedRect(-100, -25, 200, 50, 25);
    bg.endFill();
    button.addChild(bg);

    // Hover efekti için üst katman
    const highlight = new Graphics();
    highlight.beginFill(Theme.primaryLight, 0.3);
    highlight.drawRoundedRect(-100, -25, 200, 25, 25);
    highlight.endFill();
    button.addChild(highlight);

    // Metin
    const label = new Text(text, {
      fontFamily: "Sniglet",
      fontSize: 20,
      fill: Theme.textPrimary,
      fontWeight: "bold"
    });
    label.anchor.set(0.5);
    button.addChild(label);

    // Etkileşim
    button.eventMode = "static";
    button.cursor = "pointer";
    
    button.on("pointerdown", () => {
      gsap.to(button.scale, { x: 0.95, y: 0.95, duration: 0.1 });
    });
    
    button.on("pointerup", () => {
      gsap.to(button.scale, { x: 1, y: 1, duration: 0.1 });
      onClick();
    });
    
    button.on("pointerupoutside", () => {
      gsap.to(button.scale, { x: 1, y: 1, duration: 0.1 });
    });

    return button;
  }

  /**
   * Overlay'i gizle
   */
  hideOverlay() {
    if (this.overlay) {
      gsap.to(this.overlay, { alpha: 0, duration: 0.3 });
      gsap.to(this.completeText, { alpha: 0, duration: 0.3 });
      gsap.to(this.successGlow, { alpha: 0, duration: 0.3 });
      if (this.nextButton) {
        gsap.to(this.nextButton, { alpha: 0, duration: 0.3 });
      }
      
      gsap.delayedCall(0.3, () => {
        if (this.overlay) this.removeChild(this.overlay);
        if (this.completeText) this.removeChild(this.completeText);
        if (this.successGlow) this.removeChild(this.successGlow);
        if (this.nextButton) this.removeChild(this.nextButton);
      });
    }
  }

  /**
   * Konfeti efekti
   */
  createConfetti() {
    for (let i = 0; i < 50; i++) {
      const particle = new Graphics();
      particle.beginFill(Theme.confetti[Math.floor(Math.random() * Theme.confetti.length)]);
      particle.drawRect(-5, -5, 10, 10);
      particle.endFill();
      
      particle.x = Math.random() * this.gameWidth;
      particle.y = -20;
      particle.rotation = Math.random() * Math.PI * 2;
      this.addChild(particle);

      gsap.to(particle, {
        y: this.gameHeight + 50,
        x: particle.x + (Math.random() - 0.5) * 200,
        rotation: particle.rotation + Math.random() * Math.PI * 4,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: "power1.in",
        onComplete: () => {
          this.removeChild(particle);
        }
      });
    }
  }

  /**
   * Giriş animasyonu
   */
  playEntranceAnimation() {
    this.levelContainer.alpha = 0;
    this.levelContainer.y = 10;
    this.progressContainer.alpha = 0;
    this.progressContainer.y = 55;
    
    gsap.to(this.levelContainer, {
      alpha: 1,
      y: 30,
      duration: 0.4,
      ease: "back.out(1.5)"
    });
    
    gsap.to(this.progressContainer, {
      alpha: 1,
      y: 75,
      duration: 0.5,
      delay: 0.1,
      ease: "back.out(1.5)"
    });
  }
}
