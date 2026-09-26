import React, { useState } from 'react';
import { ShopCategory, ShopItem, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface ShopViewProps {
  items: ShopItem[];
  patiBalance: number;
  currentUser: UserProfile;
  otherUser: UserProfile;
  catName: string;
  onShowToast: (title: string, subtitle?: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  items,
  patiBalance,
  currentUser,
  otherUser,
  catName,
  onShowToast,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [onlyOwned, setOnlyOwned] = useState<boolean>(false);

  const handleBuy = (item: ShopItem) => {
    const result = StorageService.buyShopItem(item.id);
    if (result.success) {
      onShowToast(result.message, `${otherUser.name} de artık bunu ortak odada görebilir.`);
    } else {
      onShowToast('İşlem yapılamadı', result.message);
    }
  };

  const handlePlace = (item: ShopItem) => {
    const result = StorageService.placeShopItem(item.id);
    if (result.success) {
      onShowToast(result.message, `${catName} yeni eşyayı incelemeye gidiyor.`);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (onlyOwned && !item.isOwned) return false;
    if (selectedCat === 'all') return true;
    return item.category === selectedCat;
  });

  const ownedCount = items.filter((i) => i.isOwned).length;

  return (
    <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-12 flex flex-col gap-6">
      {/* Top Heroic Context Bar */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-2xl p-5 md:p-8 border border-surface-container shadow-xs">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-16 w-56 h-56 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-primary font-label text-xs uppercase tracking-wider mb-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>Ortak Oda Mağazası &amp; Envanter</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-4xl text-on-surface tracking-tight">
              Oda Eşyaları
            </h1>
            <p className="font-body text-sm md:text-base text-on-surface-variant mt-1.5 leading-relaxed">
              {catName}'nun odasını birlikte güzelleştirin. Burada gerçek para yok; sadece günün sakin anlarında kazandığınız ortak pati ödülleri var.
            </p>
          </div>

          {/* Joint Currency Balance Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-surface-container-lowest rounded-2xl p-4 md:p-5 border border-surface-container shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-secondary-fixed/60 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
                🐾
              </div>
              <div className="flex flex-col">
                <span className="font-label text-xs text-on-surface-variant">Ortak Bakiye</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-2xl md:text-3xl text-primary">
                    {patiBalance}
                  </span>
                  <span className="font-headline font-semibold text-sm text-primary">Pati</span>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-surface-container hidden sm:block" />

            <div className="flex flex-col justify-center max-w-[210px]">
              <span className="font-label text-xs text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">favorite</span> Birlikte Kazanıldı
              </span>
              <span className="font-body text-[11px] text-on-surface-variant mt-0.5 leading-tight">
                Günde bir {catName} ile oynayarak ve bakım yaparak pati kazanırsınız.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sync Alert Pill */}
      <div className="bg-secondary-fixed/30 rounded-xl px-4 py-2.5 border border-secondary-fixed-dim/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
            sync
          </span>
          <p className="font-body text-xs md:text-sm text-on-surface truncate">
            <span className="font-bold text-secondary">Eşzamanlı Alan:</span> Eşya satın alındığında veya yerleştirildiğinde {otherUser.name} ve senin odana otomatik olarak anında yansır.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 shrink-0 font-label text-xs text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span>Bağlantı canlı</span>
        </div>
      </div>

      {/* Filter Pills & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCat === 'all'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Tümü</span>
            <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCat('minderler')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCat === 'minderler'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Minderler</span>
            <span className="opacity-60 text-[10px]">
              {items.filter((i) => i.category === 'minderler').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCat('oyuncaklar')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCat === 'oyuncaklar'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Oyuncaklar</span>
            <span className="opacity-60 text-[10px]">
              {items.filter((i) => i.category === 'oyuncaklar').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCat('kaplar')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCat === 'kaplar'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Mama Kapları</span>
            <span className="opacity-60 text-[10px]">
              {items.filter((i) => i.category === 'kaplar').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCat('susler')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCat === 'susler'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Oda Süsleri</span>
            <span className="opacity-60 text-[10px]">
              {items.filter((i) => i.category === 'susler').length}
            </span>
          </button>
        </div>

        <div className="flex items-center self-end md:self-auto gap-1 bg-surface-container-low p-1 rounded-full border border-surface-container text-xs font-label">
          <span className="px-2 py-1 text-on-surface-variant">Görünüm:</span>
          <button
            onClick={() => setOnlyOwned(false)}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              !onlyOwned
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span> Tümü
          </button>
          <button
            onClick={() => setOnlyOwned(true)}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              onlyOwned
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">inventory_2</span> Sahip Olunanlar ({ownedCount})
          </button>
        </div>
      </div>

      {/* Items Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const canAfford = patiBalance >= item.price;
          const missingPati = item.price - patiBalance;

          return (
            <div
              key={item.id}
              className="group flex flex-col bg-surface-container-lowest rounded-2xl p-4 border border-surface-container shadow-xs hover:shadow-md transition-all"
            >
              {/* Image Preview Box */}
              <div className="relative w-full h-48 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center p-3 border border-surface-container">
                {/* Status Badges */}
                {item.isPlaced && (
                  <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">check</span> Odada Aktif
                  </span>
                )}
                {!item.isPlaced && item.isOwned && (
                  <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">inventory</span> Sandıkta
                  </span>
                )}
                {!item.isOwned && item.badge && (
                  <span className="absolute top-2.5 right-2.5 z-10 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-[11px] font-medium">
                    {item.badge}
                  </span>
                )}

                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to emoji representation gracefully
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const div = document.createElement('div');
                      div.className = 'text-5xl select-none';
                      div.innerText = item.fallbackEmoji;
                      parent.appendChild(div);
                    }
                  }}
                />
              </div>

              {/* Item Details */}
              <div className="flex flex-col mt-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-headline font-bold text-base text-on-surface">{item.name}</h3>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-label text-xs md:text-sm text-primary font-bold shrink-0 bg-surface-container-low px-2 py-1 rounded-lg border border-surface-container">
                    <span>🐾</span>
                    <span>{item.price}</span>
                  </div>
                </div>

                {/* Dynamic Action Button */}
                <div className="mt-auto pt-4">
                  {item.isPlaced ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high text-on-surface-variant font-label text-xs md:text-sm flex items-center justify-center gap-2 cursor-default border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        check_circle
                      </span>
                      <span>Odada Kullanılıyor</span>
                    </button>
                  ) : item.isOwned ? (
                    <button
                      onClick={() => handlePlace(item)}
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs active:translate-y-0.5 border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        add_home
                      </span>
                      <span>Odaya Yerleştir</span>
                    </button>
                  ) : canAfford ? (
                    <button
                      onClick={() => handleBuy(item)}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_#304d38] active:translate-y-1 active:shadow-[0_1px_0_#304d38] transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      <span>Satın Al ({item.price} Pati)</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container text-outline font-label text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      <span>Yetersiz Bakiye ({missingPati} pati eksik)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cooperative Ritual Hint Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container-low rounded-2xl p-5 md:p-6 border border-surface-container">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-sm shrink-0">
            1
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface">Günün Rutinini Paylaşın</h4>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
              Biri mamayı tazelerken diğeri tüyleri tarayabilir. Her ortak bakım 10–15 pati kazandırır.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-sm shrink-0">
            2
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface">Birlikte Karar Verin</h4>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
              Harcamalar tek bir ortak havuzdan yapılır. Odayı birlikte dekore etmek bağı güçlendirir.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-sm shrink-0">
            3
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface">{catName}'nun Tepkilerini İzleyin</h4>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
              Yeni minder veya oyuncak eklendiğinde {catName} odada hemen onunla etkileşime geçer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
