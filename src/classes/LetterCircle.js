import { Container, Sprite, Text, Graphics, Circle } from "pixi.js";
import gsap from "gsap";

/**
 * LetterCircle - Tray'deki her bir harfi temsil eden sınıf
 */
export default class LetterCircle extends Container {
  constructor(letter, radius = 40) {
    super();
    
    this.letter = letter;
    this.radius = radius;
    this.isSelected = false;
    this.originalPosition = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    // Dış çember (normal durum)
    this.outerCircle = Sprite.from("circle-out");
    this.outerCircle.anchor.set(0.5);
    this.outerCircle.width = this.radius * 2;
    this.outerCircle.height = this.radius * 2;
    this.addChild(this.outerCircle);

    // İç çember (seçili durum)
    this.innerCircle = Sprite.from("circle-in");
    this.innerCircle.anchor.set(0.5);
    this.innerCircle.width = this.radius * 2;
    this.innerCircle.height = this.radius * 2;
    this.innerCircle.alpha = 0;
    this.addChild(this.innerCircle);

    // Harf metni
    this.letterText = new Text(this.letter, {
      fontFamily: "Sniglet",
      fontSize: this.radius * 1.1,
      fill: 0xffffff,
      fontWeight: "bold",
      align: "center"
    });
    this.letterText.anchor.set(0.5);
    this.addChild(this.letterText);

    // Etkileşim ayarları
    this.eventMode = "static";
    this.cursor = "pointer";
    this.hitArea = new Circle(0, 0, this.radius);
  }

  /**
   * Seçim durumunu ayarla
   * @param {boolean} selected 
   */
  setSelected(selected) {
    if (this.isSelected === selected) return;
    
    this.isSelected = selected;

    if (selected) {
      gsap.to(this.innerCircle, {
        alpha: 1,
        duration: 0.15
      });
      gsap.to(this.outerCircle, {
        alpha: 0.3,
        duration: 0.15
      });
      gsap.to(this.scale, {
        x: 1.15,
        y: 1.15,
        duration: 0.15,
        ease: "back.out(2)"
      });
    } else {
      gsap.to(this.innerCircle, {
        alpha: 0,
        duration: 0.15
      });
      gsap.to(this.outerCircle, {
        alpha: 1,
        duration: 0.15
      });
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: 0.15
      });
    }
  }

  /**
   * Orijinal pozisyonu kaydet
   */
  saveOriginalPosition() {
    this.originalPosition = { x: this.x, y: this.y };
  }

  /**
   * Orijinal pozisyona dön
   */
  resetPosition() {
    gsap.to(this, {
      x: this.originalPosition.x,
      y: this.originalPosition.y,
      duration: 0.2
    });
  }

  /**
   * Bounce animasyonu
   */
  bounce() {
    gsap.to(this.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
  }

  /**
   * Shake animasyonu (yanlış kelime için)
   */
  shake() {
    gsap.to(this, {
      x: this.x + 5,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: "power2.inOut"
    });
  }

  /**
   * Harfi al
   * @returns {string}
   */
  getLetter() {
    return this.letter;
  }

  /**
   * Seçili mi?
   * @returns {boolean}
   */
  getIsSelected() {
    return this.isSelected;
  }
}
