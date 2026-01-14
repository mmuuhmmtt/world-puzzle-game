import { Container, Sprite, Graphics, Text } from "pixi.js";
import gsap from "gsap";
import Theme from "./Theme";

/**
 * ShuffleButton - Harfleri karıştırma butonu
 */
export default class ShuffleButton extends Container {
  constructor(options = {}) {
    super();
    
    this.size = options.size || 50;
    this.onClick = options.onClick || (() => {});
    
    this.init();
  }

  init() {
    // Arka plan dairesi
    this.bg = new Graphics();
    this.bg.beginFill(Theme.bgLight, 0.9);
    this.bg.lineStyle(2, Theme.primary, 0.5);
    this.bg.drawCircle(0, 0, this.size / 2);
    this.bg.endFill();
    this.addChild(this.bg);

    // İkon (shuffle sembolü - iki ok)
    this.icon = new Graphics();
    this.icon.lineStyle(3, Theme.primaryLight, 1);
    
    // Sağa dönüş oku
    this.icon.moveTo(-10, -5);
    this.icon.lineTo(10, -5);
    this.icon.lineTo(5, -10);
    this.icon.moveTo(10, -5);
    this.icon.lineTo(5, 0);
    
    // Sola dönüş oku  
    this.icon.moveTo(10, 5);
    this.icon.lineTo(-10, 5);
    this.icon.lineTo(-5, 0);
    this.icon.moveTo(-10, 5);
    this.icon.lineTo(-5, 10);
    
    this.addChild(this.icon);

    // Etkileşim
    this.eventMode = "static";
    this.cursor = "pointer";
    
    this.on("pointerdown", this.onPress, this);
    this.on("pointerup", this.onRelease, this);
    this.on("pointerupoutside", this.onRelease, this);
  }

  onPress() {
    gsap.to(this.scale, {
      x: 0.9,
      y: 0.9,
      duration: 0.1
    });
  }

  onRelease() {
    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.1
    });
    
    // Döndürme animasyonu
    gsap.to(this.icon, {
      rotation: this.icon.rotation + Math.PI * 2,
      duration: 0.4,
      ease: "power2.out"
    });
    
    this.onClick();
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
      duration: 0.4,
      ease: "back.out(2)"
    });
  }
}
