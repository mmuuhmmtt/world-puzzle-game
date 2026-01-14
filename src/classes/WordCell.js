import { Container, Sprite, Text, Graphics } from "pixi.js";
import gsap from "gsap";
import Theme from "./Theme";

/**
 * WordCell - Grid'deki her bir hücreyi temsil eden sınıf
 */
export default class WordCell extends Container {
  constructor(cellData, cellSize = 60) {
    super();
    
    this.cellData = cellData;
    this.cellSize = cellSize;
    this.letter = cellData.letter;
    this.isRevealed = false;
    
    this.init();
  }

  init() {
    // Arka plan (gizli durum - koyu mor)
    this.bgHidden = new Graphics();
    this.bgHidden.beginFill(Theme.bgLight);
    this.bgHidden.lineStyle(2, Theme.primary, 0.3);
    this.bgHidden.drawRoundedRect(-this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize, 8);
    this.bgHidden.endFill();
    this.addChild(this.bgHidden);

    // Arka plan (açık durum - parlak mor)
    this.bgRevealed = new Graphics();
    this.bgRevealed.beginFill(Theme.primary);
    this.bgRevealed.drawRoundedRect(-this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize, 8);
    this.bgRevealed.endFill();
    this.bgRevealed.alpha = 0;
    this.addChild(this.bgRevealed);

    // Harf metni
    this.letterText = new Text(this.letter, {
      fontFamily: "Sniglet",
      fontSize: this.cellSize * 0.6,
      fill: Theme.textPrimary,
      fontWeight: "bold",
      align: "center"
    });
    this.letterText.anchor.set(0.5);
    this.letterText.alpha = 0;
    this.addChild(this.letterText);
  }

  /**
   * Hücreyi aç ve harfi göster
   * @param {boolean} animate - Animasyonlu mu?
   */
  reveal(animate = true) {
    if (this.isRevealed) return;
    
    this.isRevealed = true;
    this.cellData.isRevealed = true;

    if (animate) {
      // Pop animasyonu
      gsap.to(this.scale, {
        x: 1.2,
        y: 1.2,
        duration: 0.15,
        ease: "back.out(2)",
        onComplete: () => {
          gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: 0.1
          });
        }
      });

      // Arka plan geçişi
      gsap.to(this.bgHidden, {
        alpha: 0,
        duration: 0.2
      });

      gsap.to(this.bgRevealed, {
        alpha: 1,
        duration: 0.2
      });

      // Harf görünümü
      gsap.to(this.letterText, {
        alpha: 1,
        duration: 0.2
      });
    } else {
      this.bgHidden.alpha = 0;
      this.bgRevealed.alpha = 1;
      this.letterText.alpha = 1;
    }
  }

  /**
   * Geçici olarak harfi göster (ipucu için)
   */
  showHint() {
    if (this.isRevealed) return;

    gsap.to(this.letterText, {
      alpha: 0.5,
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  }

  /**
   * Hücrenin açık olup olmadığını döndür
   */
  getIsRevealed() {
    return this.isRevealed;
  }
}
