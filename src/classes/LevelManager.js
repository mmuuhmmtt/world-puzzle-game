/**
 * LevelManager - Çoklu level yönetimi
 * Dinamik olarak yeni leveller eklenebilir
 */
export default class LevelManager {
  constructor() {
    this.currentLevelIndex = 0;
    this.levels = this.initLevels();
  }

  /**
   * Tüm levelleri tanımla
   * Yeni level eklemek için buraya ekleme yapın
   */
  initLevels() {
    return [
      // Level 1 - Kolay
      // CAT yatay, CAR dikey (C'den), AT dikey (A'dan)
      {
        id: 1,
        name: "Başlangıç",
        letters: "C,A,T,R",
        words: "0,0,CAT,H|0,0,CAR,V|1,0,AT,V"
      },
      // Level 2
      // STAR yatay, ARTS dikey (A'dan)
      {
        id: 2,
        name: "Yıldızlar",
        letters: "S,T,A,R",
        words: "0,0,STAR,H|2,0,ARTS,V"
      },
      // Level 3
      // SUN yatay, USE dikey (U'dan), NUT dikey (N'den)
      {
        id: 3,
        name: "Güneş",
        letters: "S,U,N,T,E",
        words: "0,0,SUN,H|1,0,USE,V|2,0,NUT,V"
      },
      // Level 4
      // PLAY yatay, LAP dikey (L'den), PAY dikey (P'den)
      {
        id: 4,
        name: "Oyun",
        letters: "P,L,A,Y",
        words: "0,0,PLAY,H|0,0,PAY,V|1,0,LAP,V"
      },
      // Level 5
      // TIME yatay, ITEM dikey (I'dan), EMIT dikey (E'den)
      {
        id: 5,
        name: "Zaman",
        letters: "T,I,M,E",
        words: "0,0,TIME,H|1,0,ITEM,V"
      },
      // Level 6
      // HERO yatay, HER dikey (H'den), ORE dikey (O'dan)
      {
        id: 6,
        name: "Kahraman",
        letters: "H,E,R,O",
        words: "0,0,HERO,H|0,0,HER,V|3,0,ORE,V"
      },
      // Level 7
      // FIRE yatay, FIR dikey (F'den), IRE dikey (I'dan)
      {
        id: 7,
        name: "Ateş",
        letters: "F,I,R,E",
        words: "0,0,FIRE,H|0,0,FIR,V|1,0,IRE,V"
      },
      // Level 8
      // SNOW yatay, SON dikey (S'den), OWN dikey (O'dan), NOW dikey (N'den)
      {
        id: 8,
        name: "Kar",
        letters: "S,N,O,W",
        words: "0,0,SNOW,H|0,0,SON,V|2,0,OWN,V"
      },
      // Level 9
      // WATER yatay, WAR dikey (W'den), EAT dikey (A'dan)
      {
        id: 9,
        name: "Su",
        letters: "W,A,T,E,R",
        words: "0,0,WATER,H|0,0,WAR,V|1,0,ATE,V|3,0,EAR,V"
      },
      // Level 10
      // BRAIN yatay, BRA dikey, RAIN dikey, AIR dikey
      {
        id: 10,
        name: "Final",
        letters: "B,R,A,I,N",
        words: "0,0,BRAIN,H|0,0,BRA,V|2,0,RAIN,V"
      }
    ];
  }

  /**
   * Mevcut level'ı getir
   */
  getCurrentLevel() {
    return this.levels[this.currentLevelIndex];
  }

  /**
   * Sonraki level'a geç
   * @returns {Object|null} Sonraki level veya null (bittiyse)
   */
  nextLevel() {
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.currentLevelIndex++;
      return this.getCurrentLevel();
    }
    return null; // Tüm leveller bitti
  }

  /**
   * Belirli bir level'a git
   * @param {number} index - Level indeksi
   */
  goToLevel(index) {
    if (index >= 0 && index < this.levels.length) {
      this.currentLevelIndex = index;
      return this.getCurrentLevel();
    }
    return null;
  }

  /**
   * Level ekleme (dinamik)
   * @param {Object} levelData - { letters, words, name }
   */
  addLevel(levelData) {
    const newLevel = {
      id: this.levels.length + 1,
      name: levelData.name || `Level ${this.levels.length + 1}`,
      letters: levelData.letters,
      words: levelData.words
    };
    this.levels.push(newLevel);
    return newLevel;
  }

  /**
   * İlk level'a dön
   */
  restart() {
    this.currentLevelIndex = 0;
    return this.getCurrentLevel();
  }

  /**
   * Toplam level sayısı
   */
  getTotalLevels() {
    return this.levels.length;
  }

  /**
   * Mevcut level numarası (1'den başlayan)
   */
  getCurrentLevelNumber() {
    return this.currentLevelIndex + 1;
  }

  /**
   * Son level mi?
   */
  isLastLevel() {
    return this.currentLevelIndex === this.levels.length - 1;
  }

  /**
   * İlerleme yüzdesi
   */
  getProgress() {
    return ((this.currentLevelIndex + 1) / this.levels.length) * 100;
  }
}
