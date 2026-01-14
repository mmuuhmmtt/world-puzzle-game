import { Container, Sprite, Text, Graphics } from "pixi.js";
import gsap from "gsap";

/**
 * Tutorial - Oyun içi tutorial ve autoplay sistemi
 */
export default class Tutorial extends Container {
  constructor(letterTray, options = {}) {
    super();
    
    this.letterTray = letterTray;
    this.isActive = false;
    this.isAutoplay = options.autoplay || false;
    this.tutorialStep = 0;
    
    this.init();
  }

  init() {
    this.createHand();
    this.createInstructionText();
  }

  /**
   * El imleci oluştur
   */
  createHand() {
    this.hand = Sprite.from("hand");
    this.hand.anchor.set(0.2, 0.1);
    this.hand.scale.set(0.8);
    this.hand.alpha = 0;
    this.addChild(this.hand);
  }

  /**
   * Talimat metni oluştur
   */
  createInstructionText() {
    this.instructionText = new Text("Harfleri sürükleyerek\nkelime oluştur!", {
      fontFamily: "Sniglet",
      fontSize: 22,
      fill: 0xffffff,
      fontWeight: "bold",
      align: "center",
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 2,
      dropShadowAlpha: 0.5
    });
    this.instructionText.anchor.set(0.5);
    this.instructionText.alpha = 0;
    this.addChild(this.instructionText);
  }

  /**
   * Tutorial'ı başlat
   * @param {string} word - Gösterilecek kelime
   * @param {Array} letterPositions - Harf pozisyonları [{x, y}, ...]
   */
  start(word, letterPositions) {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentWord = word;
    this.letterPositions = letterPositions;
    
    this.showInstruction();
    this.animateHand();
  }

  /**
   * Talimat metnini göster
   */
  showInstruction() {
    gsap.to(this.instructionText, {
      alpha: 1,
      duration: 0.5
    });

    // 3 saniye sonra gizle
    gsap.to(this.instructionText, {
      alpha: 0,
      delay: 3,
      duration: 0.5
    });
  }

  /**
   * El animasyonunu başlat
   */
  animateHand() {
    if (this.letterPositions.length < 2) return;

    this.hand.alpha = 1;
    
    // İlk harfe git
    const firstPos = this.letterPositions[0];
    this.hand.x = firstPos.x;
    this.hand.y = firstPos.y;

    // Sırayla harflerin üzerinden geç
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    
    // Başlangıç pozisyonunda bekle
    timeline.to(this.hand.scale, {
      x: 0.7,
      y: 0.7,
      duration: 0.2
    });

    // Harfler arasında gez
    for (let i = 1; i < this.letterPositions.length; i++) {
      const pos = this.letterPositions[i];
      timeline.to(this.hand, {
        x: pos.x,
        y: pos.y,
        duration: 0.3,
        ease: "power2.inOut"
      });
    }

    // Bırak
    timeline.to(this.hand.scale, {
      x: 0.8,
      y: 0.8,
      duration: 0.2
    });

    // İlk pozisyona dön
    timeline.to(this.hand, {
      x: firstPos.x,
      y: firstPos.y,
      duration: 0.3,
      ease: "power2.inOut"
    });

    this.handTimeline = timeline;
  }

  /**
   * Tutorial'ı durdur
   */
  stop() {
    this.isActive = false;
    
    if (this.handTimeline) {
      this.handTimeline.kill();
    }

    gsap.to(this.hand, {
      alpha: 0,
      duration: 0.3
    });

    gsap.to(this.instructionText, {
      alpha: 0,
      duration: 0.3
    });
  }

  /**
   * Autoplay - Kelimeyi otomatik oluştur
   * @param {string} word - Oluşturulacak kelime
   * @param {Function} callback - Tamamlandığında çağrılacak fonksiyon
   */
  autoplayWord(word, callback) {
    if (!this.letterTray) return;

    const letterCircles = this.letterTray.letterCircles;
    const targetCircles = [];

    // Kelimeyi oluşturan harfleri bul
    const usedIndices = new Set();
    for (const char of word) {
      const index = letterCircles.findIndex((circle, idx) => 
        circle.letter === char && !usedIndices.has(idx)
      );
      if (index !== -1) {
        targetCircles.push(letterCircles[index]);
        usedIndices.add(index);
      }
    }

    if (targetCircles.length !== word.length) {
      console.warn("Autoplay: Kelime harfleri bulunamadı");
      return;
    }

    // Eli göster ve harfler üzerinde gez
    this.hand.alpha = 1;
    const firstCircle = targetCircles[0];
    
    // Global pozisyonları hesapla
    const getGlobalPos = (circle) => {
      const global = circle.getGlobalPosition();
      return { x: global.x, y: global.y };
    };

    const firstPos = getGlobalPos(firstCircle);
    this.hand.x = firstPos.x;
    this.hand.y = firstPos.y;

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.to(this.hand, { alpha: 0, duration: 0.3 });
        if (callback) callback();
      }
    });

    // İlk harfe tıkla
    timeline.call(() => {
      this.letterTray.startDrag(firstCircle);
    });

    timeline.to(this.hand.scale, {
      x: 0.7,
      y: 0.7,
      duration: 0.2
    });

    // Diğer harflere git
    for (let i = 1; i < targetCircles.length; i++) {
      const circle = targetCircles[i];
      const pos = getGlobalPos(circle);
      
      timeline.to(this.hand, {
        x: pos.x,
        y: pos.y,
        duration: 0.25,
        ease: "power2.inOut",
        onComplete: () => {
          this.letterTray.selectLetter(circle);
          this.letterTray.updateConnectionLine();
        }
      });
    }

    // Bırak
    timeline.to(this.hand.scale, {
      x: 0.8,
      y: 0.8,
      duration: 0.15
    });

    timeline.call(() => {
      this.letterTray.onPointerUp();
    });
  }

  /**
   * Tutorial pozisyonunu ayarla
   * @param {number} x 
   * @param {number} y 
   */
  setPosition(x, y) {
    this.instructionText.x = x;
    this.instructionText.y = y - 200;
  }
}
