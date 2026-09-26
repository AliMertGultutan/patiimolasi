import React, { useState } from 'react';
import { ActiveTab, UserProfile, WishlistCategory, WishlistItem } from '../types';
import { StorageService } from '../services/storage';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  currentUser: UserProfile;
  otherUser: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  patiBalance: number;
  onShowToast: (title: string, subtitle?: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  currentUser,
  otherUser,
  setActiveTab,
  patiBalance,
  onShowToast,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WishlistCategory>('film');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState<UserProfile>(currentUser);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeItems = wishlist.filter((item) => !item.isCompleted);
  const completedItems = wishlist.filter((item) => item.isCompleted);

  // Category counts
  const countFilm = wishlist.filter((i) => i.category === 'film').length;
  const countKahve = wishlist.filter((i) => i.category === 'kahve').length;
  const countOyun = wishlist.filter((i) => i.category === 'oyun').length;
  const countDiger = wishlist.filter((i) => i.category === 'diger').length;

  const filteredActive = activeItems.filter((item) => {
    if (selectedCat === 'all') return true;
    return item.category === selectedCat;
  });

  const handleToggleComplete = (itemId: string, titleText: string, currentStatus: boolean) => {
    StorageService.toggleWishlistCompleted(itemId);
    if (!currentStatus) {
      onShowToast(`Harika! '${titleText}' tamamlandı! 🎉`, 'Birlikte yapılan bir anı daha birikti.');
    } else {
      onShowToast(`'${titleText}' tekrar yapılacaklar listesine alındı.`);
    }
  };

  const handleToggleLike = (itemId: string) => {
    StorageService.toggleWishlistLike(itemId, currentUser.id);
  };

  const handleDelete = (itemId: string) => {
    StorageService.deleteWishlistItem(itemId);
    onShowToast('Fikir listeden kaldırıldı.');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    StorageService.addWishlistItem({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      authorId: author.id,
      authorName: author.name,
      authorEmoji: author.emoji,
    });

    setTitle('');
    setDescription('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 1600);

    onShowToast('Yeni fikir ortak listeye eklendi! ✨', 'Zamanı gelince birlikte bakarız.');
  };

  const getCategoryDetails = (cat: WishlistCategory) => {
    switch (cat) {
      case 'film':
        return { name: 'Film / Dizi', icon: 'movie', bg: 'bg-tertiary-fixed text-on-tertiary-fixed' };
      case 'kahve':
        return { name: 'Kahve / Mekân', icon: 'local_cafe', bg: 'bg-secondary-fixed text-on-secondary-fixed' };
      case 'oyun':
        return { name: 'Oyun', icon: 'sports_esports', bg: 'bg-surface-container-high text-on-surface' };
      case 'diger':
        return { name: 'Diğer', icon: 'pets', bg: 'bg-primary-fixed text-on-primary-fixed' };
    }
  };

  return (
    <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-12 flex flex-col gap-6">
      {/* Top Hero Pill & Title */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/40 text-secondary w-fit mb-2">
            <span className="text-xs leading-none">🌱</span>
            <span className="font-label text-[11px] font-bold tracking-wider uppercase">
              Ortak İstek Köşesi
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-on-surface tracking-tight">
            Bir Ara Yapalım
          </h1>
          <p className="font-body text-base md:text-lg text-on-surface-variant mt-1 leading-relaxed">
            Baskı yok, zorunluluk yok. Aklımıza geldikçe birlikte yapabileceğimiz rahat, küçük fikirler.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl border border-surface-container shadow-xs">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-[11px] font-bold text-on-secondary-fixed shadow-xs">
                S
              </div>
              <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-[11px] font-bold text-on-primary-fixed shadow-xs">
                M
              </div>
            </div>
            <span className="font-label text-xs md:text-sm text-on-surface-variant font-semibold">
              {activeItems.length} açık fikir bekliyor
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 border-b border-surface-container">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              selectedCat === 'all'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Hepsi</span>
            <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCat('film')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              selectedCat === 'film'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Film / Dizi</span>
            <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{countFilm}</span>
          </button>

          <button
            onClick={() => setSelectedCat('kahve')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              selectedCat === 'kahve'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Kahve / Mekân</span>
            <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{countKahve}</span>
          </button>

          <button
            onClick={() => setSelectedCat('oyun')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              selectedCat === 'oyun'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Oyun</span>
            <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{countOyun}</span>
          </button>

          <button
            onClick={() => setSelectedCat('diger')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              selectedCat === 'diger'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Diğer</span>
            <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{countDiger}</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant font-label text-xs shrink-0">
          <span className="material-symbols-outlined text-[16px] text-primary">spa</span>
          <span>Acelesiz bir ritim</span>
        </div>
      </div>

      {/* Main Grid: Left Items List (8 Cols), Right Creation Drawer (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Wishlist Items */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Ideas Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <h2 className="font-headline font-bold text-base md:text-lg text-on-surface">
                  Yapılacaklar (Açık Öneriler)
                </h2>
              </div>
              <span className="font-label text-xs text-on-surface-variant">
                {filteredActive.length} fikir
              </span>
            </div>

            {filteredActive.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container shadow-xs text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-2xl mb-2">
                  ✨
                </div>
                <h4 className="font-headline font-bold text-sm text-on-surface">Aklına geleni buraya bırak</h4>
                <p className="font-body text-xs text-on-surface-variant max-w-xs mt-1">
                  Hemen plan yapmak zorunda değilsiniz. Sağdaki formdan aklına gelen fikri yaz.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredActive.map((item) => {
                  const catDetails = getCategoryDetails(item.category);
                  const hasLiked = item.likes.includes(currentUser.id);

                  return (
                    <div
                      key={item.id}
                      className="group bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-surface-container shadow-xs hover:shadow-md transition-all flex items-start gap-4 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container/60 rounded-l" />

                      {/* Check Completion Button */}
                      <button
                        onClick={() => handleToggleComplete(item.id, item.title, item.isCompleted)}
                        className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-transparent flex items-center justify-center transition-all group/btn border border-surface-container"
                        title="Tamamlandı olarak işaretle"
                        aria-label={`${item.title} tamamlandı`}
                      >
                        <span className="material-symbols-outlined text-[17px] group-hover/btn:text-on-primary">
                          check
                        </span>
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-label text-[11px] font-semibold flex items-center gap-1 ${catDetails.bg}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {catDetails.icon}
                            </span>
                            <span>{catDetails.name}</span>
                          </span>
                        </div>

                        <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="font-body text-xs md:text-sm text-on-surface-variant leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Metadata Footer */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-surface-container/60">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{item.authorEmoji}</span>
                            <span className="font-label text-xs text-on-surface-variant">
                              Ekleyen: <strong className="text-on-surface">{item.authorName}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleLike(item.id)}
                              className={`p-1.5 rounded-lg flex items-center gap-1 text-xs transition-colors ${
                                hasLiked
                                  ? 'text-secondary font-bold'
                                  : 'text-on-surface-variant hover:text-primary'
                              }`}
                              title={hasLiked ? 'Beğenildi' : 'Beğen'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {hasLiked ? 'favorite' : 'favorite_border'}
                              </span>
                              {item.likes.length > 0 && <span>{item.likes.length}</span>}
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-outline-variant hover:text-error transition-colors"
                              title="Sil"
                              aria-label="Fikri sil"
                            >
                              <span className="material-symbols-outlined text-[17px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Accordion Section */}
          {completedItems.length > 0 && (
            <div className="bg-surface-container-low rounded-2xl p-4 md:p-5 border border-surface-container">
              <button
                onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                  </span>
                  <span className="font-headline font-bold text-sm text-on-surface">Tamamlananlar</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-[11px] font-bold">
                    {completedItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant group-hover:text-on-surface">
                  <span className="font-label text-xs">
                    {isCompletedOpen ? 'Gizle' : 'Göster'}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                      isCompletedOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {isCompletedOpen && (
                <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-surface-container">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[15px]">check</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline text-xs md:text-sm line-through text-on-surface-variant font-semibold truncate">
                            {item.title}
                          </span>
                          <span className="font-body text-[11px] text-outline">
                            Birlikte tamamlandı • {item.authorName} eklemişti
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleComplete(item.id, item.title, true)}
                        className="text-xs text-primary font-label hover:underline shrink-0"
                        title="Geri Al"
                      >
                        Geri Al
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ambient Visual / Quote Box */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-fixed/40 to-primary-fixed/30 p-5 md:p-6 border border-surface-container flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-2xl shadow-sm shrink-0">
                🐈
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-on-surface">Miso'nun Notu</p>
                <p className="font-body text-xs md:text-sm text-on-surface-variant mt-0.5">
                  "Birlikte yapılan hiçbir şey boşa gitmez, sadece huzur biriktirir."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Create Form & Cozy Prompt Box */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
          {/* Add Idea Form Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-surface-container shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">edit_note</span>
                <h2 className="font-headline font-bold text-base text-on-surface">Yeni Fikir Ekle</h2>
              </div>
              <span className="text-xs">✨</span>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
              {/* Idea Title */}
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs text-on-surface font-semibold">
                  Aklına gelen ne var?
                </label>
                <input
                  type="text"
                  maxLength={70}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Hafta sonu seramik atölyesi..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body text-xs md:text-sm border border-surface-container focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  required
                />
              </div>

              {/* Category Selector Pills */}
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs text-on-surface font-semibold">Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('film')}
                    className={`py-2 px-2.5 rounded-xl text-center font-label text-xs transition-all flex items-center justify-center gap-1.5 border ${
                      category === 'film'
                        ? 'bg-primary-container text-on-primary font-bold border-primary-container shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">movie</span>
                    <span>Film / Dizi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('kahve')}
                    className={`py-2 px-2.5 rounded-xl text-center font-label text-xs transition-all flex items-center justify-center gap-1.5 border ${
                      category === 'kahve'
                        ? 'bg-primary-container text-on-primary font-bold border-primary-container shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">local_cafe</span>
                    <span>Kahve / Mekân</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('oyun')}
                    className={`py-2 px-2.5 rounded-xl text-center font-label text-xs transition-all flex items-center justify-center gap-1.5 border ${
                      category === 'oyun'
                        ? 'bg-primary-container text-on-primary font-bold border-primary-container shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sports_esports</span>
                    <span>Oyun</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('diger')}
                    className={`py-2 px-2.5 rounded-xl text-center font-label text-xs transition-all flex items-center justify-center gap-1.5 border ${
                      category === 'diger'
                        ? 'bg-primary-container text-on-primary font-bold border-primary-container shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                    <span>Diğer</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs text-on-surface font-semibold">
                  Kısa açıklama <span className="text-outline font-normal">(isteğe bağlı)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Aklında belirli bir yer ya da detay var mı?"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body text-xs md:text-sm border border-surface-container focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all resize-none"
                />
              </div>

              {/* Ekleyen Seçimi (Co-presence Duo) */}
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-xl border border-surface-container">
                <span className="font-label text-xs text-on-surface-variant font-medium">
                  Ekleyen kim?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuthor(currentUser.id === 'selin' ? currentUser : otherUser)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      author.name === 'Selin'
                        ? 'bg-secondary-fixed text-on-secondary-fixed ring-2 ring-secondary font-bold shadow-xs'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    title="Selin"
                  >
                    🌿
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthor(currentUser.id === 'mert' ? currentUser : otherUser)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      author.name === 'Mert'
                        ? 'bg-primary-fixed text-on-primary-fixed ring-2 ring-primary font-bold shadow-xs'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    title="Mert"
                  >
                    ☕
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-primary-container text-on-primary font-label font-bold text-sm shadow-[0_4px_0_#304d38] active:translate-y-1 active:shadow-[0_1px_0_#304d38] transition-all flex items-center justify-center gap-2 mt-1"
              >
                <span className="material-symbols-outlined text-[19px]">bookmark_add</span>
                <span>{isSubmitted ? 'Eklendi! ✨' : 'Listeye Ekle'}</span>
              </button>
            </form>
          </div>

          {/* Gentle Reassurance Card */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-on-secondary-fixed shrink-0 text-lg">
              ☁️
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-headline font-bold text-xs md:text-sm text-on-surface">
                Zamanlama Baskısı Yok
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Aklına geleni buraya bırak. Hemen plan yapmak ya da randevulaşmak zorunda değilsiniz. İkinizin de enerjisi denk gelince bakarsınız.
              </p>
            </div>
          </div>

          {/* Shared Room Progress Quick Mini-Card */}
          <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🐾</span>
              <div className="flex flex-col">
                <span className="font-label text-xs md:text-sm text-on-surface font-bold">
                  {patiBalance} Pati Birikti
                </span>
                <span className="font-body text-[11px] text-on-surface-variant">
                  Birlikte eşya seçmeye az kaldı
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('esyalar')}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary font-label text-xs font-bold transition-colors shadow-xs"
            >
              Göz At
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
