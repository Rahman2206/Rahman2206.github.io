# Denizaltı Savaş Oyunu (Submarine Combat Game)

Bu proje, modern JavaScript ve Nesne Tabanlı Programlama (OOP) prensipleri kullanılarak geliştirilmiş, modüler yapıya sahip 2D bir su altı savaş simülasyonudur.

## 🎯 Oyunun Hedefi ve Zorluklar 

**Temel Hedef:**
Oyuncu, kontrol ettiği yüksek teknolojiye sahip denizaltı ile düşman sularında hayatta kalmalı ve belirlenen imha hedefine (Kills) ulaşmalıdır.

**Zorluklar (Challenges):**
* **Dinamik Düşmanlar:** Düşman denizaltıları farklı hızlarda ve rastgele dikey konumlarda belirir.
* **Güdümsüz Torpidolar:** Düşman birimleri sadece üzerinize gelmekle kalmaz, aynı zamanda size karşı seri ateş açarlar.
* **Sınırlı Kaynak:** Oyuncunun sadece **5 canı** bulunmaktadır. Her çarpışma veya isabet alan düşman mermisi bir "kalp" kaybetmenize neden olur.
* **Sıvı Dinamiği:** Denizaltı, suyun direncini hissettiren sürtünme ve ivmelenme fiziğine sahiptir; bu da manevra yapmayı daha stratejik hale getirir.

## 🎮 Kontroller

Oyun, hem klavye hem de fare ile tam uyumlu hibrit bir kontrol sistemine sahiptir:

| Aksiyon | Tuş Kombinasyonu |
| :--- | :--- |
| **Hareket** | `W, A, S, D` veya `Ok Tuşları` |
| **Ateş Etme** | `F` Tuşu veya `Fare Sol Tık` |
| **Hedefleme** | `Fare İmleci` (Denizaltı fare yönüne göre döner) |
| **Duraklatma** | `ESC` Tuşu (Ana menüye dönme seçeneği sunar) |
| **Bilgi Paneli** | `I` Tuşu (Oyun içi kontrolleri hatırlatır) |

## 🛠️ Teknik Özellikler

Oyunun kod yapısı tamamen modüler ve genişletilebilir bir mimariyle kurulmuştur:
* **EntityManager:** Tüm varlıkların (düşmanlar, mermiler, parçacıklar) yaşam döngüsünü yönetir.
* **State Machine:** Denizaltının hareket durumlarına göre (Dalış, Yükselme, Sabit) animasyon geçişlerini kontrol eder.
* **Parallax System:** Derinlik algısı yaratan 6 katmanlı sonsuz döngü arkaplan sistemi.
* **SoundHandler:** Ses efektlerini ve arkaplan müziğini senkronize şekilde yönetir.

---
*Bu proje Bursa Teknik Üniversitesi (BTÜ) kapsamında bir modüler oyun geliştirme çalışması olarak hazırlanmıştır.*

<img width="1448" height="712" alt="image" src="https://github.com/user-attachments/assets/ff8be944-9e1a-4e9d-95ff-8731c9c703ea" />

<img width="1917" height="801" alt="image" src="https://github.com/user-attachments/assets/26f2eef2-feb3-44f8-8226-622214e06509" />

