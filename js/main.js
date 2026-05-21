import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { Enemy } from './enemy.js';
import { Particle } from './particle.js'; 
import { UI } from './UI.js';
import { SoundHandler } from './SoundHandler.js';
import { EntityManager } from './EntityManager.js';

window.addEventListener('load', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    class Game {
        constructor(canvasElement) {
            // Ekran boyutları ve temel hız tanımlamaları
            this.width = canvasElement.width;
            this.height = canvasElement.height;
            this.speed = 2;
            
            // Oyun durum takibi ve istatistikler
            this.gameState = 'home';
            this.score = 0;
            this.lives = 5;
            this.victoryCondition = 5; // Kazanma için gerekli avlanma sayısı
            this.showInfo = false;

            // Paralaks arka planın bilgi ekranında durması için kontrol değişkeni
            this.showinfocondition = false;

            // Sistem Modüllerinin Başlatılması (Dependency Injection)
            this.sounds = new SoundHandler();
            this.entities = new EntityManager(this);
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(canvasElement);
            this.ui = new UI(this);
        }

        update(deltaTime) {
            // Arka planı her karede günceller (Paralaks kaydırma efekti)
            this.background.update();

            // --- 1. GLOBAL DURAKLATMA (ESC) KONTROLÜ ---
            // Bu kontrolün en üstte olması oyun hangi durumda olursa olsun tetiklenebilmesini sağlar
            if (this.input.keys.includes('Escape')) {
                if (this.gameState === 'playing') {
                    this.gameState = 'pausing';
                } else if (this.gameState === 'pausing') {
                    this.gameState = 'playing';
                }
                // Tuşun her karede ardı ardına tetiklenmesini engellemek için listeyi temizler
                this.input.keys = this.input.keys.filter(k => k !== 'Escape');
            }

            // --- 2. MENÜ VE STATİK DURUMLAR ---
            // Eğer oyun aktif oynanma aşamasında değilse menü etkileşimlerini yönetir ve fiziği durdurur
            if (this.gameState !== 'playing') {
                this.handleMenuStates();
                return; 
            }

            // --- 3. AKTİF OYUN MANTIĞI ---
            // Bilgi ekranı açık değilse aktif seviye güncellemelerini çalıştırır
            if (!this.showInfo) {
                this.updateActiveLevel(deltaTime);
            }

            // Bilgi Ekranı Açma/Kapatma Paneli (I Tuşu)
            if (this.input.keys.includes('Info')) {
                this.showinfocondition = !this.showinfocondition;
                this.showInfo = !this.showInfo;
                this.input.keys = this.input.keys.filter(k => k !== 'Info');
            }
        }

        // Aktif oynanış esnasında çalışan fizik, hareket ve çarpışma motoru
        updateActiveLevel(deltaTime) {
            this.player.update(this.input, deltaTime); // Oyuncu hareketleri ve sınırları
            this.entities.update(deltaTime);           // Düşmanların, mermilerin ve efektlerin hareketi
            this.handleCollisions(deltaTime);          // Tüm çarpışma algoritmaları
        }

        // Giriş ekranı, oyun bitti ve pause menülerindeki tıklama kontrolleri
        handleMenuStates() {
            if (this.input.mouse.pressed) {
                // Oyuncu yenildiğinde, kazandığında veya ilk açılışta ekrana tıklarsa oyunu sıfırlayıp başlatır
                if (this.gameState === 'home' || this.gameState === 'victory' || this.gameState === 'gameOver') {
                    this.resetGame();
                    this.gameState = 'playing';
                    this.sounds.playMusic();
                } else if (this.gameState === 'pausing') {
                    this.handlePauseInput();
                }
                this.input.mouse.pressed = false;
            }
        }

        // Duraklatma menüsündeki EVET / HAYIR butonlarının tıklama alanı hesaplaması
        handlePauseInput() {
            const centerX = this.width / 2;
            // EVET Butonu tıklama alanı kontrolü (Sol bölge) -> Ana Menüye Döner
            if (this.input.mouse.x > centerX - 100 && this.input.mouse.x < centerX - 20) {
                this.gameState = 'home';
                this.sounds.resetMusic();
            // HAYIR Butonu tıklama alanı kontrolü (Sağ bölge) -> Oyuna Devam Eder
            } else if (this.input.mouse.x > centerX + 20 && this.input.mouse.x < centerX + 100) {
                this.gameState = 'playing';
            }
        }

        // Bir düşman oyuncu torpidosuyla vurulduğunda tetiklenen yok etme mantığı
        destroyEnemy(enemy, projectile) {
            enemy.markedForDeletion = true;
            projectile.markedForDeletion = true;
            this.score++;

            // Patlama efekti oluşturma: Vurulan düşmanın merkezinde 15 adet parçacık türetir
            for (let i = 0; i < 15; i++) {
                this.entities.particles.push(
                    new Particle(
                        this, 
                        enemy.x + enemy.width / 2, 
                        enemy.y + enemy.height / 2
                    )
                );
            }

            // Zafer durumu kontrolü
            if (this.score >= this.victoryCondition) {
                this.gameState = 'victory';
                this.sounds.pauseMusic();
            }
        }

        // Oyunun kaybedilme durumunu tetikleyen fonksiyon
        triggerGameOver() {
            this.gameState = 'gameOver';
            this.sounds.resetMusic(); 
        }

        // Tüm oyun içi nesnelerin birbiriyle olan geometrik temaslarını yöneten döngü
        handleCollisions(deltaTime) {
            // Düşman denizaltıları eksenli çarpışmalar
            this.entities.enemies.forEach(enemy => {
                // 1. Düşman denizaltısı ile Oyuncu denizaltısının doğrudan çarpışması
                if (this.checkCollision(this.player, enemy)) {
                    this.triggerGameOver(); 
                }

                // 2. Oyuncunun fırlattığı torpidoların düşmana isabet etme kontrolü
                this.entities.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        this.destroyEnemy(enemy, projectile); 
                    }
                });
            });

            // 3. Düşman mermilerinin Oyuncu denizaltısına isabet etme kontrolü
            this.entities.enemyProjectiles.forEach(ep => {
                if (this.checkCollision(ep, this.player)) {
                    ep.markedForDeletion = true; // İsabet eden mermiyi sil
                    this.lives--;               // Oyuncunun canını azalt
                    
                    // Can kalmadıysa oyunu bitir
                    if (this.lives <= 0) {
                        this.triggerGameOver();
                    }
                }
            });
        }

        // Ekrana çizim işlemlerini yapan ana dağıtıcı metot
        draw(context) {
            this.background.draw(context); // İlk olarak arka plan katmanları çizilir
            
            // Sadece oyun oynanırken veya duraklatılmışken oyun içi dinamik varlıkları çizer
            if (this.gameState === 'playing' || this.gameState === 'pausing') {
                this.player.draw(context);
                this.entities.draw(context);
            }
            
            // Kullanıcı arayüzü (UI) her zaman en üst katmanda görünür
            this.ui.draw(context);
        }

        // İki dikdörtgen nesnenin çakışıp çakışmadığını hesaplayan AABB çarpışma algoritması
        checkCollision(r1, r2) {
            const w1 = r1.renderWidth || r1.width;
            const h1 = r1.renderHeight || r1.height;
            const w2 = r2.renderWidth || r2.width;
            const h2 = r2.renderHeight || r2.height;
            return (r1.x < r2.x + w2 && r1.x + w1 > r2.x && r1.y < r2.y + h2 && r1.y + h1 > r2.y);
        }

        // Oyun yeniden başlatıldığında tüm verileri ilk konumuna getiren temizlik fonksiyonu
        resetGame() {
            this.score = 0;
            this.lives = 5;
            this.entities.clear(); // EntityManager içindeki tüm mermi ve düşman listelerini boşaltır
            this.player.x = this.width / 2 - this.player.renderWidth / 2;
            this.player.y = this.height / 2 - this.player.renderHeight / 2;
        }

        // Pencere boyutları değiştiğinde oyun alanının sınırlarını günceller
        resize(newWidth, newHeight) {
            this.width = newWidth;
            this.height = newHeight;
        }
    }

    // Oyun Nesnesinin Örneklenmesi (Initialization)
    const game = new Game(canvas);

    // Tarayıcı ekran boyutu değiştiğinde canvası yeniden boyutlandıran yapı
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        game.resize(canvas.width, canvas.height);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // İlk açılışta ekran boyutunu oturtur

    // Delta Time tabanlı ana animasyon döngüsü (Game Loop)
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime || 0;
        lastTime = timeStamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Ekranı temizler
        game.update(deltaTime);                            // Pozisyonları ve mantığı hesaplar
        game.draw(ctx);                                    // Yeni kareyi ekrana çizer
        
        requestAnimationFrame(animate);                    // Sonraki kare için tarayıcıdan onay ister
    }
    requestAnimationFrame(animate);
});