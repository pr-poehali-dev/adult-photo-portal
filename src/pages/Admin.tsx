import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { loadData, saveData, SiteData, SiteLink } from '@/lib/store';

const Admin = () => {
  const [data, setData] = useState<SiteData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  if (!data) return null;

  const update = (patch: Partial<SiteData>) => setData({ ...data, ...patch });

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ videoUrl: url, videoName: file.name });
    toast({ title: 'Видео добавлено', description: file.name });
  };

  const updateLink = (id: string, patch: Partial<SiteLink>) =>
    update({ links: data.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  const removeLink = (id: string) =>
    update({ links: data.links.filter((l) => l.id !== id) });

  const addLink = () =>
    update({
      links: [
        ...data.links,
        { id: Date.now().toString(), title: 'Новая ссылка', url: '#', icon: 'Link' },
      ],
    });

  const save = () => {
    saveData(data);
    toast({ title: 'Сохранено', description: 'Изменения применены на сайте' });
  };

  return (
    <div className="min-h-screen bg-background grid-bg text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              <Icon name="ArrowLeft" size={20} />
            </Link>
            <h1 className="font-display font-bold text-lg">Админка</h1>
          </div>
          <Button onClick={save} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-2xl space-y-6">
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2">
            <Icon name="Type" size={18} className="text-primary" /> Описание
          </h2>
          <div className="space-y-2">
            <Label>Заголовок сайта</Label>
            <Input value={data.title} onChange={(e) => update({ title: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              rows={4}
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Текст предупреждения 18+</Label>
            <Input value={data.ageWarning} onChange={(e) => update({ ageWarning: e.target.value })} className="rounded-xl" />
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2">
            <Icon name="Video" size={18} className="text-primary" /> Видео
          </h2>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
          {data.videoUrl ? (
            <div className="space-y-3">
              <video src={data.videoUrl} controls className="w-full aspect-video rounded-xl bg-black" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate">{data.videoName || 'Видео'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => update({ videoUrl: '', videoName: '' })}
                  className="rounded-lg text-destructive border-border"
                >
                  <Icon name="Trash2" size={15} className="mr-1.5" /> Удалить
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-10 rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
            >
              <Icon name="Upload" size={28} className="text-primary" />
              <span className="font-semibold">Загрузить видео с компьютера</span>
              <span className="text-xs">MP4, WebM, MOV</span>
            </button>
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold flex items-center gap-2">
              <Icon name="Link" size={18} className="text-primary" /> Ссылки
            </h2>
            <Button onClick={addLink} variant="outline" size="sm" className="rounded-lg border-border">
              <Icon name="Plus" size={15} className="mr-1.5" /> Добавить
            </Button>
          </div>
          <div className="space-y-3">
            {data.links.map((link) => (
              <div key={link.id} className="bg-secondary/40 rounded-xl p-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Иконка (напр. Send)"
                    value={link.icon}
                    onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                    className="w-36 rounded-lg"
                  />
                  <Input
                    placeholder="Название"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, { title: e.target.value })}
                    className="flex-1 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeLink(link.id)}
                    className="rounded-lg text-destructive border-border shrink-0"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
