import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import WordCell from "./WordCell";

/**
 * WordGrid - Kelime ızgarasını yöneten sınıf
 */
export default class WordGrid extends Container {
  constructor(levelData, options = {}) {
    super();
    
    this.levelData = levelData;
    this.cellSize = options.cellSize || 55;
    this.cellGap = options.cellGap || 5;
    this.cells = new Map(); // "x,y" -> WordCell
    
    this.init();
  }

  init() {
    this.createGrid();
    this.centerGrid();
  }

  /**
   * Grid hücrelerini oluştur
   */
  createGrid() {
    const cellsData = this.levelData.generateGridCells();
    
    cellsData.forEach(cellData => {
      const cell = new WordCell(cellData, this.cellSize);
      
      // Pozisyonu ayarla
      cell.x = cellData.x * (this.cellSize + this.cellGap);
      cell.y = cellData.y * (this.cellSize + this.cellGap);
      
      this.addChild(cell);
      this.cells.set(`${cellData.x},${cellData.y}`, cell);
    });
  }

  /**
   * Grid'i ortala
   */
  centerGrid() {
    const gridSize = this.levelData.gridSize;
    const totalWidth = gridSize.width * (this.cellSize + this.cellGap) - this.cellGap;
    const totalHeight = gridSize.height * (this.cellSize + this.cellGap) - this.cellGap;
    
    this.pivot.set(totalWidth / 2, totalHeight / 2);
  }

  /**
   * Kelimeyi grid'de aç
   * @param {Object} wordData - Kelime verisi
   * @param {number} delay - Her harf arası gecikme
   */
  revealWord(wordData, delay = 0.1) {
    const letters = wordData.word.split('');
    const cellsToReveal = [];

    for (let i = 0; i < letters.length; i++) {
      let x = wordData.x;
      let y = wordData.y;
      
      if (wordData.isHorizontal) {
        x += i;
      } else {
        y += i;
      }

      const cell = this.cells.get(`${x},${y}`);
      if (cell && !cell.isRevealed) {
        cellsToReveal.push(cell);
      }
    }

    // Sırayla animasyonlu aç
    cellsToReveal.forEach((cell, index) => {
      gsap.delayedCall(index * delay, () => {
        cell.reveal(true);
      });
    });

    return cellsToReveal.length;
  }

  /**
   * Belirli pozisyondaki hücreyi al
   * @param {number} x 
   * @param {number} y 
   * @returns {WordCell|null}
   */
  getCell(x, y) {
    return this.cells.get(`${x},${y}`) || null;
  }

  /**
   * Tüm hücrelerin açılıp açılmadığını kontrol et
   * @returns {boolean}
   */
  isAllRevealed() {
    for (const cell of this.cells.values()) {
      if (!cell.isRevealed) return false;
    }
    return true;
  }

  /**
   * Giriş animasyonu
   */
  playEntranceAnimation() {
    this.alpha = 0;
    this.scale.set(0.8);
    
    gsap.to(this, {
      alpha: 1,
      duration: 0.5,
      ease: "power2.out"
    });
    
    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      ease: "back.out(1.5)"
    });
  }

  /**
   * Kelimenin pozisyon bilgisine göre hücreleri getir
   * @param {Object} wordData 
   * @returns {WordCell[]}
   */
  getCellsForWord(wordData) {
    const cells = [];
    const letters = wordData.word.split('');
    
    for (let i = 0; i < letters.length; i++) {
      let x = wordData.x;
      let y = wordData.y;
      
      if (wordData.isHorizontal) {
        x += i;
      } else {
        y += i;
      }
      
      const cell = this.cells.get(`${x},${y}`);
      if (cell) cells.push(cell);
    }
    
    return cells;
  }
}
