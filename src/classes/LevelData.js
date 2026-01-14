/**
 * LevelData - Level verisini parse eden ve yöneten sınıf
 * Format: lvlWords: "x,y,WORD,DIRECTION|..."
 * Direction: H = Horizontal, V = Vertical
 */
export default class LevelData {
  constructor(lvlLetters, lvlWords) {
    this.letters = this.parseLetters(lvlLetters);
    this.words = this.parseWords(lvlWords);
    this.gridSize = this.calculateGridSize();
    this.foundWords = new Set();
  }

  /**
   * Harfleri parse et
   * @param {string} lvlLetters - "G,O,D,L" formatında
   * @returns {string[]} Harf dizisi
   */
  parseLetters(lvlLetters) {
    return lvlLetters.split(',').map(letter => letter.trim().toUpperCase());
  }

  /**
   * Kelimeleri parse et
   * @param {string} lvlWords - "0,0,GOLD,H|0,0,GOD,V|..." formatında
   * @returns {Object[]} Kelime objeleri dizisi
   */
  parseWords(lvlWords) {
    const wordEntries = lvlWords.split('|');
    return wordEntries.map(entry => {
      const [x, y, word, direction] = entry.split(',');
      return {
        x: parseInt(x),
        y: parseInt(y),
        word: word.toUpperCase(),
        direction: direction.toUpperCase(), // H veya V
        isHorizontal: direction.toUpperCase() === 'H',
        isFound: false
      };
    });
  }

  /**
   * Grid boyutunu hesapla
   * @returns {Object} { width, height }
   */
  calculateGridSize() {
    let maxX = 0;
    let maxY = 0;

    this.words.forEach(wordData => {
      const wordLength = wordData.word.length;
      
      if (wordData.isHorizontal) {
        maxX = Math.max(maxX, wordData.x + wordLength);
        maxY = Math.max(maxY, wordData.y + 1);
      } else {
        maxX = Math.max(maxX, wordData.x + 1);
        maxY = Math.max(maxY, wordData.y + wordLength);
      }
    });

    return { width: maxX, height: maxY };
  }

  /**
   * Girilen kelimenin geçerli olup olmadığını kontrol et
   * @param {string} word - Kontrol edilecek kelime
   * @returns {Object|null} Bulunan kelime verisi veya null
   */
  checkWord(word) {
    const upperWord = word.toUpperCase();
    const wordData = this.words.find(w => w.word === upperWord && !w.isFound);
    return wordData || null;
  }

  /**
   * Kelimeyi bulunan olarak işaretle
   * @param {string} word - İşaretlenecek kelime
   */
  markWordAsFound(word) {
    const upperWord = word.toUpperCase();
    const wordData = this.words.find(w => w.word === upperWord);
    if (wordData) {
      wordData.isFound = true;
      this.foundWords.add(upperWord);
    }
  }

  /**
   * Tüm kelimelerin bulunup bulunmadığını kontrol et
   * @returns {boolean}
   */
  isLevelComplete() {
    return this.words.every(w => w.isFound);
  }

  /**
   * Bulunan kelime sayısını döndür
   * @returns {number}
   */
  getFoundCount() {
    return this.foundWords.size;
  }

  /**
   * Toplam kelime sayısını döndür
   * @returns {number}
   */
  getTotalCount() {
    return this.words.length;
  }

  /**
   * Belirli bir pozisyondaki hücrede hangi harfin olması gerektiğini bul
   * @param {number} x 
   * @param {number} y 
   * @returns {Object|null} { letter, wordData } veya null
   */
  getLetterAt(x, y) {
    for (const wordData of this.words) {
      const letters = wordData.word.split('');
      for (let i = 0; i < letters.length; i++) {
        let letterX = wordData.x;
        let letterY = wordData.y;
        
        if (wordData.isHorizontal) {
          letterX += i;
        } else {
          letterY += i;
        }

        if (letterX === x && letterY === y) {
          return { letter: letters[i], wordData };
        }
      }
    }
    return null;
  }

  /**
   * Grid'deki tüm hücreleri oluştur
   * @returns {Object[]} Hücre verileri dizisi
   */
  generateGridCells() {
    const cells = [];
    const cellMap = new Map();

    for (const wordData of this.words) {
      const letters = wordData.word.split('');
      for (let i = 0; i < letters.length; i++) {
        let x = wordData.x;
        let y = wordData.y;
        
        if (wordData.isHorizontal) {
          x += i;
        } else {
          y += i;
        }

        const key = `${x},${y}`;
        if (!cellMap.has(key)) {
          cellMap.set(key, {
            x,
            y,
            letter: letters[i],
            isRevealed: false,
            words: [wordData]
          });
        } else {
          // Kesişim noktası - aynı hücreye birden fazla kelime denk geliyor
          cellMap.get(key).words.push(wordData);
        }
      }
    }

    return Array.from(cellMap.values());
  }
}
