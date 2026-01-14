import { Container, Graphics, Sprite, BlurFilter } from "pixi.js";
import gsap from "gsap";
import Theme from "./Theme";

/**
 * Particle - Tek bir parçacık
 */
class Particle extends Container {
  constructor(options = {}) {
    super();
    
    this.color = options.color || 0xffffff;
    this.size = options.size || 10;
    this.lifetime = options.lifetime || 1;
    this.velocity = options.velocity || { x: 0, y: 0 };
    this.gravity = options.gravity || 0;
    this.elapsed = 0;
    
    this.init();
  }

  init() {
    this.graphic = new Graphics();
    this.graphic.beginFill(this.color);
    this.graphic.drawCircle(0, 0, this.size);
    this.graphic.endFill();
    this.addChild(this.graphic);
  }

  update(delta) {
    this.elapsed += delta;
    
    // Pozisyon güncelle
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    this.velocity.y += this.gravity * delta;
    
    // Alpha ve scale fade
    const progress = this.elapsed / this.lifetime;
    this.alpha = 1 - progress;
    this.scale.set(1 - progress * 0.5);
    
    return progress >= 1;
  }
}

/**
 * ParticleSystem - Parçacık efektleri sistemi
 */
export default class ParticleSystem extends Container {
  constructor() {
    super();
    
    this.particles = [];
    this.isRunning = false;
  }

  /**
   * Başarı parçacıkları oluştur
   */
  emitSuccess(x, y, count = 15) {
    const colors = Theme.particles;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 100 + Math.random() * 100;
      
      const particle = new Particle({
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        lifetime: 0.5 + Math.random() * 0.5,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        gravity: 200
      });
      
      particle.x = x;
      particle.y = y;
      
      this.addChild(particle);
      this.particles.push(particle);
    }
    
    this.startUpdate();
  }

  /**
   * Yıldız parlaması efekti
   */
  emitStars(x, y, count = 8) {
    const colors = [0xffd700, 0xffec8b, 0xffffff];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 50 + Math.random() * 80;
      
      const particle = new Particle({
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3,
        lifetime: 0.3 + Math.random() * 0.3,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        gravity: 0
      });
      
      particle.x = x;
      particle.y = y;
      
      this.addChild(particle);
      this.particles.push(particle);
    }
    
    this.startUpdate();
  }

  /**
   * Harf seçim efekti
   */
  emitSelection(x, y) {
    const colors = [0xffaa00, 0xff8800, 0xffcc00];
    
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 40;
      
      const particle = new Particle({
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 2,
        lifetime: 0.2 + Math.random() * 0.2,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        gravity: 0
      });
      
      particle.x = x;
      particle.y = y;
      
      this.addChild(particle);
      this.particles.push(particle);
    }
    
    this.startUpdate();
  }

  /**
   * Güncelleme döngüsünü başlat
   */
  startUpdate() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = Date.now();
    this.updateLoop();
  }

  /**
   * Güncelleme döngüsü
   */
  updateLoop() {
    const currentTime = Date.now();
    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Parçacıkları güncelle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const isDead = particle.update(delta);
      
      if (isDead) {
        this.removeChild(particle);
        this.particles.splice(i, 1);
      }
    }

    // Parçacık kaldıysa devam et
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.updateLoop());
    } else {
      this.isRunning = false;
    }
  }

  /**
   * Tüm parçacıkları temizle
   */
  clear() {
    this.particles.forEach(p => this.removeChild(p));
    this.particles = [];
    this.isRunning = false;
  }
}
