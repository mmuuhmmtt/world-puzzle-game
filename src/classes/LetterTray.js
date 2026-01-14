import { Container, Sprite, Graphics, Text, Circle } from "pixi.js";
import gsap from "gsap";
import LetterCircle from "./LetterCircle";
import Theme from "./Theme";

/**
 * LetterTray - Harf tepsisi ve bağlantı çizgisi sistemini yöneten sınıf
 */
export default class LetterTray extends Container {
  constructor(letters, options = {}) {
    super();
    
    this.letters = letters;
    this.trayRadius = options.trayRadius || 120;
    this.letterRadius = options.letterRadius || 35;
    this.letterCircles = [];
    this.selectedLetters = [];
    this.isDragging = false;
    
    // Callback fonksiyonları
    this.onWordSubmit = options.onWordSubmit || (() => {});
    this.onWordChange = options.onWordChange || (() => {});
    
    this.init();
  }

  init() {
    this.createBackground();
    this.createLetters();
    this.createConnectionLine();
    this.createCurrentWordDisplay();
    this.setupInteraction();
  }

  /**
   * Arka plan çemberini oluştur
   */
  createBackground() {
    // Ana arka plan dairesi
    this.bgCircle = new Graphics();
    this.bgCircle.beginFill(Theme.trayBg, 0.9);
    this.bgCircle.drawCircle(0, 0, this.trayRadius + 20);
    this.bgCircle.endFill();
    this.addChild(this.bgCircle);

    // Dış parlama
    this.outerGlow = new Graphics();
    this.outerGlow.lineStyle(3, Theme.primary, 0.4);
    this.outerGlow.drawCircle(0, 0, this.trayRadius + 20);
    this.addChild(this.outerGlow);

    // İç çizgi
    this.innerRing = new Graphics();
    this.innerRing.lineStyle(2, Theme.trayRing, 0.5);
    this.innerRing.drawCircle(0, 0, this.trayRadius - 10);
    this.addChild(this.innerRing);
  }

  /**
   * Harfleri daire üzerine yerleştir
   */
  createLetters() {
    const letterCount = this.letters.length;
    const angleStep = (Math.PI * 2) / letterCount;
    const startAngle = -Math.PI / 2; // Üstten başla

    this.letters.forEach((letter, index) => {
      const angle = startAngle + (angleStep * index);
      const x = Math.cos(angle) * this.trayRadius;
      const y = Math.sin(angle) * this.trayRadius;

      const letterCircle = new LetterCircle(letter, this.letterRadius);
      letterCircle.x = x;
      letterCircle.y = y;
      letterCircle.saveOriginalPosition();
      
      this.addChild(letterCircle);
      this.letterCircles.push(letterCircle);
    });
  }

  /**
   * Bağlantı çizgisi için grafik oluştur
   */
  createConnectionLine() {
    this.connectionLine = new Graphics();
    this.addChildAt(this.connectionLine, 1); // Arka planın üstüne
  }

  /**
   * Anlık kelime gösterimi
   */
  createCurrentWordDisplay() {
    this.currentWordText = new Text("", {
      fontFamily: "Sniglet",
      fontSize: 28,
      fill: 0xffffff,
      fontWeight: "bold",
      align: "center",
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 2,
      dropShadowAlpha: 0.5
    });
    this.currentWordText.anchor.set(0.5);
    this.currentWordText.y = -this.trayRadius - 80;
    this.addChild(this.currentWordText);
  }

  /**
   * Etkileşim olaylarını ayarla
   */
  setupInteraction() {
    // Tüm tray alanı için etkileşim
    this.eventMode = "static";
    this.hitArea = new Circle(0, 0, this.trayRadius + 50);
    
    // Pointer olayları
    this.on("pointerdown", this.onPointerDown, this);
    this.on("pointermove", this.onPointerMove, this);
    this.on("pointerup", this.onPointerUp, this);
    this.on("pointerupoutside", this.onPointerUp, this);

    // Her harf için de olay ekle
    this.letterCircles.forEach(circle => {
      circle.on("pointerdown", (e) => {
        e.stopPropagation();
        this.startDrag(circle);
      });
    });
  }

  /**
   * Sürüklemeyi başlat
   */
  startDrag(letterCircle) {
    this.isDragging = true;
    this.selectLetter(letterCircle);
  }

  /**
   * Pointer down olayı
   */
  onPointerDown(e) {
    const localPos = this.toLocal(e.global);
    const letterCircle = this.getLetterAtPosition(localPos);
    
    if (letterCircle) {
      this.startDrag(letterCircle);
    }
  }

  /**
   * Pointer hareket olayı
   */
  onPointerMove(e) {
    if (!this.isDragging) return;

    const localPos = this.toLocal(e.global);
    const letterCircle = this.getLetterAtPosition(localPos);
    
    if (letterCircle && !letterCircle.isSelected) {
      this.selectLetter(letterCircle);
    }

    // Bağlantı çizgisini güncelle
    this.updateConnectionLine(localPos);
  }

  /**
   * Pointer up olayı
   */
  onPointerUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.submitWord();
    this.clearSelection();
  }

  /**
   * Pozisyondaki harfi bul
   */
  getLetterAtPosition(pos) {
    for (const circle of this.letterCircles) {
      const dx = pos.x - circle.x;
      const dy = pos.y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.letterRadius + 10) {
        return circle;
      }
    }
    return null;
  }

  /**
   * Harfi seç
   */
  selectLetter(letterCircle) {
    // Zaten seçili değilse ekle
    if (!this.selectedLetters.includes(letterCircle)) {
      letterCircle.setSelected(true);
      this.selectedLetters.push(letterCircle);
      this.updateCurrentWord();
      letterCircle.bounce();
    }
  }

  /**
   * Seçimi temizle
   */
  clearSelection() {
    this.selectedLetters.forEach(circle => {
      circle.setSelected(false);
    });
    this.selectedLetters = [];
    this.connectionLine.clear();
    this.updateCurrentWord();
  }

  /**
   * Bağlantı çizgisini güncelle
   */
  updateConnectionLine(currentPos = null) {
    this.connectionLine.clear();
    
    if (this.selectedLetters.length === 0) return;

    this.connectionLine.lineStyle(8, Theme.connectionLine, 0.8);
    
    // İlk harften başla
    const firstCircle = this.selectedLetters[0];
    this.connectionLine.moveTo(firstCircle.x, firstCircle.y);

    // Diğer harflere çiz
    for (let i = 1; i < this.selectedLetters.length; i++) {
      const circle = this.selectedLetters[i];
      this.connectionLine.lineTo(circle.x, circle.y);
    }

    // Eğer sürükleme devam ediyorsa, mouse pozisyonuna da çiz
    if (currentPos && this.isDragging) {
      const lastCircle = this.selectedLetters[this.selectedLetters.length - 1];
      this.connectionLine.lineTo(currentPos.x, currentPos.y);
    }
  }

  /**
   * Anlık kelimeyi güncelle
   */
  updateCurrentWord() {
    const word = this.getCurrentWord();
    this.currentWordText.text = word;
    
    // Animasyon
    if (word.length > 0) {
      gsap.fromTo(this.currentWordText.scale, 
        { x: 1.2, y: 1.2 },
        { x: 1, y: 1, duration: 0.15 }
      );
    }
    
    this.onWordChange(word);
  }

  /**
   * Seçilen harflerden kelime oluştur
   */
  getCurrentWord() {
    return this.selectedLetters.map(c => c.letter).join("");
  }

  /**
   * Kelimeyi gönder
   */
  submitWord() {
    const word = this.getCurrentWord();
    if (word.length >= 2) {
      this.onWordSubmit(word);
    }
  }

  /**
   * Başarılı kelime animasyonu
   */
  playSuccessAnimation() {
    // Yeşil parlama efekti
    this.selectedLetters.forEach((circle, index) => {
      gsap.to(circle.scale, {
        x: 1.3,
        y: 1.3,
        duration: 0.15,
        delay: index * 0.05,
        yoyo: true,
        repeat: 1
      });
    });
  }

  /**
   * Başarısız kelime animasyonu
   */
  playFailAnimation() {
    this.selectedLetters.forEach(circle => {
      circle.shake();
    });

    // Kırmızı flash
    gsap.to(this.currentWordText, {
      pixi: { tint: 0xff0000 },
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.currentWordText.tint = 0xffffff;
      }
    });
  }

  /**
   * Harfleri karıştır (shuffle)
   */
  shuffleLetters() {
    // Rastgele yeni açılar oluştur
    const letterCount = this.letters.length;
    const angleStep = (Math.PI * 2) / letterCount;
    const startAngle = -Math.PI / 2 + (Math.random() * Math.PI * 2);

    this.letterCircles.forEach((circle, index) => {
      const angle = startAngle + (angleStep * index);
      const x = Math.cos(angle) * this.trayRadius;
      const y = Math.sin(angle) * this.trayRadius;

      gsap.to(circle, {
        x: x,
        y: y,
        duration: 0.4,
        ease: "back.out(1.5)",
        onComplete: () => {
          circle.saveOriginalPosition();
        }
      });
    });
  }

  /**
   * Giriş animasyonu
   */
  playEntranceAnimation() {
    this.alpha = 0;
    this.scale.set(0);
    
    gsap.to(this, {
      alpha: 1,
      duration: 0.3
    });
    
    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      ease: "back.out(1.7)"
    });

    // Harfleri sırayla göster
    this.letterCircles.forEach((circle, index) => {
      circle.scale.set(0);
      gsap.to(circle.scale, {
        x: 1,
        y: 1,
        duration: 0.3,
        delay: 0.1 + index * 0.08,
        ease: "back.out(2)"
      });
    });
  }
}
