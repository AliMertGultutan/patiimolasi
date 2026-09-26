import React, { useState, useEffect } from 'react';
import { NoteColor, NoteItem, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface NotesViewProps {
  notes: NoteItem[];
  currentUser: UserProfile;
  catName: string;
  onShowToast: (title: string, subtitle?: string) => void;
}

type FilterType = 'all' | 'pinned' | 'selin' | 'mert';

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  currentUser,
  catName,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form draft state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedColor, setSelectedColor] = useState<NoteColor>('#F4F7F2');
  const [selectedTag, setSelectedTag] = useState('Genel');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Draft persistence in sessionStorage
  useEffect(() => {
    if (!editingNoteId) {
      const savedDraft = sessionStorage.getItem('pati_note_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.body) setBody(parsed.body);
          if (parsed.color) setSelectedColor(parsed.color);
          if (parsed.tag) setSelectedTag(parsed.tag);
        } catch {
          // Ignore
        }
      }
    }
  }, [editingNoteId]);

  const saveDraft = (t: string, b: string, c: NoteColor, tag: string) => {
    if (!editingNoteId) {
      sessionStorage.setItem(
        'pati_note_draft',
        JSON.stringify({ title: t, body: b, color: c, tag })
      );
    }
  };

  const handleOpenAdd = () => {
    setEditingNoteId(null);
    const savedDraft = sessionStorage.getItem('pati_note_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || '');
        setBody(parsed.body || '');
        setSelectedColor(parsed.color || '#F4F7F2');
        setSelectedTag(parsed.tag || 'Genel');
      } catch {
        setTitle('');
        setBody('');
      }
    } else {
      setTitle('');
      setBody('');
      setSelectedColor('#F4F7F2');
      setSelectedTag('Genel');
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setSelectedColor(note.color);
    setSelectedTag(note.tag || 'Genel');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNoteId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (editingNoteId) {
      StorageService.updateNote(editingNoteId, {
        title: title.trim(),
        body: body.trim(),
        color: selectedColor,
        tag: selectedTag,
      });
      onShowToast('Not güncellendi! ✨');
    } else {
      StorageService.addNote({
        title: title.trim(),
        body: body.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorEmoji: currentUser.emoji,
        color: selectedColor,
        isPinned: false,
        tag: selectedTag,
      });
      sessionStorage.removeItem('pati_note_draft');
      onShowToast('Yeni not panoya asıldı! 📌', 'Diğer kişi de anında görebilir.');
    }

    handleCloseModal();
  };

  const handleDelete = (noteId: string) => {
    StorageService.deleteNote(noteId);
    setDeleteConfirmId(null);
    onShowToast('Not panodan kaldırıldı.');
  };

  const handleToggleReaction = (noteId: string, emoji: '😄' | '👀' | '🐾' | '☕') => {
    StorageService.toggleNoteReaction(noteId, emoji, currentUser.id);
  };

  const handleTogglePin = (noteId: string) => {
    StorageService.togglePinNote(noteId);
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    if (filter === 'pinned') return note.isPinned;
    if (filter === 'selin') return note.authorId === 'selin';
    if (filter === 'mert') return note.authorId === 'mert';
    return true;
  });

  // Sort: pinned first, then newest first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const pinnedCount = notes.filter((n) => n.isPinned).length;

  return (
    <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-12 flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-primary font-label text-xs md:text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">push_pin</span>
            <span>Ortak Alan • İki Kişilik Hatıralar</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
            Ortak Not Panosu
          </h1>
          <p className="font-body text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed">
            Birbirinize bırakılan küçük düşünceler, hatırlatmalar ve tatlı öneriler. Masanın üzerindeki küçük kağıtlar gibi.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={handleOpenAdd}
            className="bg-primary-container text-on-primary font-label font-bold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_0_#304d38] active:translate-y-[2px] active:shadow-[0_2px_0_#304d38] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Yeni Not Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter Strip & Room Atmosphere */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-surface-container">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all ${
              filter === 'all'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Tümü ({notes.length})
          </button>

          <button
            onClick={() => setFilter('pinned')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'pinned'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">push_pin</span>
            <span>Sabitlenenler ({pinnedCount})</span>
          </button>

          <button
            onClick={() => setFilter('selin')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'selin'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>Selin'in Notları</span>
          </button>

          <button
            onClick={() => setFilter('mert')}
            className={`px-4 py-1.5 rounded-full font-label text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'mert'
                ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Mert'in Notları</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-on-surface-variant font-label text-xs bg-surface-container-low px-4 py-1.5 rounded-full border border-surface-container">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{catName} şu an odada dinleniyor • Masa aydınlık</span>
        </div>
      </div>

      {/* Masonry / Grid Note Cards Layout */}
      {sortedNotes.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-surface-container shadow-xs flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3">
            <span className="material-symbols-outlined text-[32px]">note_add</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Pano şimdilik sakin</h3>
          <p className="font-body text-sm text-on-surface-variant max-w-xs mb-4">
            Bir film önerisi veya günün yorgunluğunu alan küçük bir not bırak.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-primary-container text-on-primary font-label font-bold text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>İlk notu ekle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {sortedNotes.map((note) => {
            const isAuthor = note.authorId === currentUser.id;

            return (
              <article
                key={note.id}
                style={{ backgroundColor: note.color }}
                className="note-card relative text-on-surface p-5 md:p-6 rounded-2xl shadow-[0_4px_16px_-2px_rgba(88,118,94,0.08),0_2px_4px_-1px_rgba(47,55,50,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(88,118,94,0.12)] border border-black/5 transition-all flex flex-col justify-between group min-h-[220px]"
              >
                {/* Pin Decorative Accent */}
                {note.isPinned && (
                  <div
                    className="absolute -top-3 right-6 z-10 w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center shadow-md transform rotate-12 group-hover:rotate-0 transition-transform border border-secondary-fixed-dim"
                    title="Panoya Sabitlenmiş Not"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-secondary-fixed">
                      push_pin
                    </span>
                  </div>
                )}

                <div>
                  {/* Meta Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container-lowest/80 text-on-surface flex items-center justify-center font-label text-xs shadow-xs">
                        {note.authorEmoji}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label text-xs font-bold text-on-surface leading-tight">
                          {note.authorName}
                        </span>
                        <span className="font-body text-[11px] text-on-surface-variant leading-none">
                          {formatTime(note.createdAt)}
                        </span>
                      </div>
                    </div>

                    {note.tag && (
                      <span className="font-label text-[11px] px-2 py-0.5 rounded-md bg-surface-container-highest/60 text-primary font-semibold mr-5">
                        {note.tag}
                      </span>
                    )}
                  </div>

                  {/* Note Title & Body */}
                  <h2 className="font-headline font-bold text-base md:text-lg text-on-surface mb-1.5 leading-snug">
                    {note.title}
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3 whitespace-pre-line">
                    {note.body}
                  </p>

                  {/* Rich Mini Snippet Embed (if present) */}
                  {note.snippet && (
                    <div className="mb-3 p-2.5 rounded-xl bg-surface-container-lowest/80 border border-black/5 flex items-center gap-2.5 shadow-xs">
                      {note.snippet.icon && (
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">
                            {note.snippet.icon}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-label text-xs font-bold text-on-surface truncate">
                          {note.snippet.title}
                        </span>
                        <span className="font-body text-[11px] text-on-surface-variant truncate">
                          {note.snippet.subtitle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footnote & Interactive Reactions */}
                <div className="pt-2 flex flex-col gap-2.5 border-t border-black/5 mt-auto">
                  {/* Reaction Buttons Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['😄', '👀', '🐾', '☕'] as const).map((emoji) => {
                      const reaction = note.reactions.find((r) => r.emoji === emoji);
                      const count = reaction ? reaction.users.length : 0;
                      const hasReacted = reaction?.users.includes(currentUser.id);

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(note.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-xs font-label flex items-center gap-1 transition-all active:scale-95 shadow-xs ${
                            hasReacted
                              ? 'bg-secondary-fixed text-on-secondary-fixed font-bold border border-secondary-fixed-dim'
                              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-bright'
                          }`}
                          title={hasReacted ? `${emoji} tepkini kaldır` : `${emoji} ile tepki ver`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="text-[11px] font-bold">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Bar (Edit, Delete, Pin) */}
                  <div className="flex items-center justify-between text-on-surface-variant pt-1 text-xs font-label">
                    <div className="flex items-center gap-2">
                      {isAuthor ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(note)}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Düzenle</span>
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => setDeleteConfirmId(note.id)}
                            className="hover:text-error transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Sil</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-outline">
                          {note.authorName} tarafından asıldı
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={`transition-colors p-1 rounded hover:bg-surface-container ${
                        note.isPinned ? 'text-secondary font-bold' : 'text-outline-variant hover:text-primary'
                      }`}
                      title={note.isPinned ? 'Sabitlemeyi Kaldır' : 'Panoya Sabitle'}
                    >
                      <span className="material-symbols-outlined text-[17px]">push_pin</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-surface-container flex flex-col gap-3">
            <h3 className="font-headline font-bold text-base text-on-surface">Notu Silmek İstiyor musun?</h3>
            <p className="font-body text-sm text-on-surface-variant">
              Bu not panodan kaldırılacaktır. Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl font-label text-sm bg-error text-on-error font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Ephemera Footer Strip */}
      <div className="mt-4 p-4 bg-surface-container-low rounded-2xl border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-on-surface-variant font-body text-xs md:text-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">auto_stories</span>
          <span>Notlar 30 gün boyunca panoda kalır, ardından "Hatıra Defteri"ne taşınır.</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary font-label text-xs md:text-sm font-semibold">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>Yalnızca Selin ve Mert görebilir</span>
        </div>
      </div>

      {/* Interactive "Yeni Not As / Düzenle" Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">post_add</span>
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  {editingNoteId ? 'Notu Düzenle' : 'Yeni Not As'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
                aria-label="Kapat"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Live Card Preview Box */}
            <div
              style={{ backgroundColor: selectedColor }}
              className="p-4 rounded-xl border border-black/5 flex flex-col gap-1.5 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between text-on-surface-variant font-label text-[11px]">
                <span className="font-semibold flex items-center gap-1">
                  {currentUser.emoji} {currentUser.name}
                </span>
                <span className="text-primary flex items-center gap-1 font-semibold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                  Canlı Görünüm
                </span>
              </div>
              <h4 className="font-headline text-base font-bold text-on-surface truncate">
                {title.trim() || 'Not Başlığı'}
              </h4>
              <p className="font-body text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                {body.trim() || 'Buraya yazdığın düşünce veya hatırlatma görünecek...'}
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block font-label text-xs text-on-surface font-semibold mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    saveDraft(e.target.value, body, selectedColor, selectedTag);
                  }}
                  placeholder="Örn: Akşam yürüyüşü, Mama saati, Film adayı..."
                  className="w-full bg-surface-container-low px-4 py-2 rounded-xl font-body text-sm text-on-surface placeholder:text-outline border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-label text-xs text-on-surface font-semibold mb-1">
                  Notun
                </label>
                <textarea
                  rows={3}
                  maxLength={280}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    saveDraft(title, e.target.value, selectedColor, selectedTag);
                  }}
                  placeholder="Selin'e veya Mert'e ne söylemek istersin?"
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body text-sm text-on-surface placeholder:text-outline border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  required
                />
              </div>

              {/* Tag & Color Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tag Selection */}
                <div>
                  <label className="block font-label text-xs text-on-surface font-semibold mb-1">
                    Etiket
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => {
                      setSelectedTag(e.target.value);
                      saveDraft(title, body, selectedColor, e.target.value);
                    }}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl font-label text-xs text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest"
                  >
                    <option value="Genel">Genel</option>
                    <option value="Film Önerisi">Film Önerisi</option>
                    <option value="Önemli Mama Alarmı">Önemli Mama Alarmı</option>
                    <option value="Buluşma Fikri">Buluşma Fikri</option>
                    <option value="Kedi Günlüğü">Kedi Günlüğü</option>
                    <option value="Sakin Mola">Sakin Mola</option>
                  </select>
                </div>

                {/* Color Palette Selection */}
                <div>
                  <label className="block font-label text-xs text-on-surface font-semibold mb-1">
                    Kart Rengi
                  </label>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedColor('#F4F7F2');
                        saveDraft(title, body, '#F4F7F2', selectedTag);
                      }}
                      className={`w-8 h-8 rounded-full bg-[#F4F7F2] border flex items-center justify-center transition-all ${
                        selectedColor === '#F4F7F2'
                          ? 'ring-2 ring-primary border-primary scale-105'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      title="Adaçayı Yeşili"
                    >
                      {selectedColor === '#F4F7F2' && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedColor('#FCF8F2');
                        saveDraft(title, body, '#FCF8F2', selectedTag);
                      }}
                      className={`w-8 h-8 rounded-full bg-[#FCF8F2] border flex items-center justify-center transition-all ${
                        selectedColor === '#FCF8F2'
                          ? 'ring-2 ring-secondary border-secondary scale-105'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      title="Sıcak Kum"
                    >
                      {selectedColor === '#FCF8F2' && (
                        <span className="material-symbols-outlined text-[16px] text-secondary">check</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedColor('#F7F5FC');
                        saveDraft(title, body, '#F7F5FC', selectedTag);
                      }}
                      className={`w-8 h-8 rounded-full bg-[#F7F5FC] border flex items-center justify-center transition-all ${
                        selectedColor === '#F7F5FC'
                          ? 'ring-2 ring-tertiary border-tertiary scale-105'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      title="Huzurlu Lavanta"
                    >
                      {selectedColor === '#F7F5FC' && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Autosave Note */}
              <div className="flex items-center gap-1.5 text-on-surface-variant font-label text-[11px] pt-1">
                <span className="material-symbols-outlined text-[16px] text-primary">cloud_done</span>
                <span>Taslağın güvende, yazarken kaybolmaz.</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary font-label font-bold text-sm px-5 py-2 rounded-xl shadow-[0_4px_0_#304d38] active:translate-y-[2px] active:shadow-[0_2px_0_#304d38] transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">push_pin</span>
                  <span>{editingNoteId ? 'Güncelle' : 'Notu As'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for formatting note relative dates
function formatTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Az önce';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Dün';
  return `${diffDays} gün önce`;
}
