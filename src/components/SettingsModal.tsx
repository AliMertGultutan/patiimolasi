import React, { useState } from 'react';
import { AppSettings, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  currentUser: UserProfile;
  otherUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  onShowToast: (title: string, subtitle?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentUser,
  otherUser,
  onSwitchUser,
  onShowToast,
}) => {
  const [catNameInput, setCatNameInput] = useState(settings.catName);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFirebaseInfo, setShowFirebaseInfo] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    StorageService.updateSettings({
      catName: catNameInput.trim() || 'Miso',
      soundEnabled,
      reducedMotion,
    });
    onShowToast('Ayarlar kaydedildi! ✨');
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onShowToast('Davet kodu panoya kopyalandı! 📋', 'Partnerine göndererek odaya davet edebilirsin.');
  };

  const handleResetData = () => {
    StorageService.resetToDemoDefault();
    setShowResetConfirm(false);
    onShowToast('Demo verileri sıfırlandı 🔄', 'Oda başlangıç haline döndü.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
            <h2 className="font-headline font-bold text-lg text-on-surface">Oda ve Uygulama Ayarları</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Section 1: Active Persona / Co-presence Switcher */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-surface-container">
          <span className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
            Demo Kullanıcı Geçişi (İki Kişilik Deneyim)
          </span>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Şu anda <strong className="text-on-surface">{currentUser.name}</strong> olarak bakıyorsun. Diğer partnerin gözünden görmek için geçiş yapabilirsin:
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onSwitchUser('selin')}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                currentUser.id === 'selin'
                  ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed-dim ring-2 ring-secondary font-bold shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container'
              }`}
            >
              <span>🌿</span>
              <span className="font-label text-xs">Selin Olarak Gir</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchUser('mert')}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                currentUser.id === 'mert'
                  ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim ring-2 ring-primary font-bold shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container'
              }`}
            >
              <span>☕</span>
              <span className="font-label text-xs">Mert Olarak Gir</span>
            </button>
          </div>
        </div>

        {/* Section 2: Cat & Room Name */}
        <div className="flex flex-col gap-2">
          <label className="font-label text-xs font-bold text-on-surface">
            Ortak Kedinin Adı
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={24}
              value={catNameInput}
              onChange={(e) => setCatNameInput(e.target.value)}
              className="w-full bg-surface-container-low px-4 py-2 rounded-xl font-body text-sm text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Örn: Miso"
            />
          </div>
          <span className="font-body text-[11px] text-outline">
            Bu isim ikinizin ortak odasındaki her yerde güncellenir.
          </span>
        </div>

        {/* Section 3: Room Invite Code (2 People Limit) */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold text-on-surface">
              Ortak Oda Davet Kodu
            </span>
            <span className="font-label text-[11px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
              2 / 2 Kişi Dolu
            </span>
          </div>
          <p className="font-body text-xs text-on-surface-variant">
            Bu oda iki kişi için özeldir. Dışarıdan üçüncü bir kişi katılamaz.
          </p>

          <div className="flex items-center justify-between bg-surface-container-lowest px-4 py-2 rounded-xl border border-surface-container">
            <span className="font-display font-bold text-base text-primary tracking-wider">
              {settings.roomCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs font-label text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedCode ? 'done' : 'content_copy'}
              </span>
              <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Section 4: Accessibility & Experience Toggles */}
        <div className="flex flex-col gap-3">
          <span className="font-label text-xs font-bold text-on-surface">Tercihler</span>

          {/* Sound Toggle */}
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="flex flex-col">
              <span className="font-label text-xs md:text-sm text-on-surface font-semibold">
                Ses Efektleri
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Mama, sevme ve mini oyun sesleri (varsayılan: kapalı)
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </label>

          {/* Reduced Motion Toggle */}
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="flex flex-col">
              <span className="font-label text-xs md:text-sm text-on-surface font-semibold">
                Hareketi Azalt (Reduce Motion)
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Kedi nefes alma ve zıplama animasyonlarını durdurur
              </span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Section 5: Mode & Firebase Integration Guide */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-label text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-[17px] text-primary">cloud</span>
              <span>Çalışma Modu: Demo (Yerel + Çoklu Sekme Senkron)</span>
            </div>
            <button
              onClick={() => setShowFirebaseInfo(!showFirebaseInfo)}
              className="text-xs text-primary font-label hover:underline"
            >
              {showFirebaseInfo ? 'Gizle' : 'Bulut Detayı'}
            </button>
          </div>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Şu an harici servis kurulumu gerektirmeden çalışmaktadır. Yeni bir sekmede açtığınızda iki farklı cihaz/sekme gibi aynı odayı canlı senkronize eder.
          </p>

          {showFirebaseInfo && (
            <div className="mt-2 p-3 bg-surface-container-lowest rounded-xl border border-surface-container text-xs font-body text-on-surface-variant flex flex-col gap-2">
              <span className="font-bold text-on-surface">Gerçek Ortak Kullanım (Firebase) Kurulum Bilgisi:</span>
              <p>
                İki farklı telefondan kalıcı ortak kullanım için Firebase Authentication ve Cloud Firestore veritabanı gereklidir.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Firestore koleksiyonları: <code className="bg-surface-container px-1 rounded">rooms/{'{roomId}'}</code>, <code className="bg-surface-container px-1 rounded">notes</code>, <code className="bg-surface-container px-1 rounded">wishlist</code>.</li>
                <li>Maksimum 2 kişi kuralı veritabanı güvenlik kurallarıyla (<code className="bg-surface-container px-1 rounded">firestore.rules</code>) kilitlenir.</li>
                <li>Dilediğinde ayarlar menüsünden Firebase projesine bağlanabilir.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 6: Reset Demo Data Action */}
        <div className="pt-2 border-t border-surface-container flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-label text-error hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Demo Verilerini Sıfırla</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label font-bold text-sm shadow-[0_4px_0_#304d38] active:translate-y-1 active:shadow-[0_1px_0_#304d38] transition-all"
            >
              Kaydet
            </button>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest p-6 rounded-2xl max-w-sm w-full border border-surface-container shadow-2xl flex flex-col gap-3">
              <h4 className="font-headline font-bold text-base text-on-surface">
                Tüm Veriler Sıfırlansın mı?
              </h4>
              <p className="font-body text-xs text-on-surface-variant">
                Tüm notlar, kedi durumu ve istek listesi başlangıç demo haline dönecektir.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-xl font-label text-xs text-on-surface-variant hover:bg-surface-container"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-1.5 rounded-xl font-label text-xs bg-error text-on-error font-bold shadow-sm"
                >
                  Evet, Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
