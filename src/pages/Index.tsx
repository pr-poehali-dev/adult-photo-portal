import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { fetchData, SiteData } from '@/lib/store';

const Index = () => {
  const [data, setData] = useState<SiteData | null>(null);
  const [ageOk, setAgeOk] = useState(false);

  useEffect(() => {
    fetchData().then(setData).catch(() => setData(null));
    setAgeOk(sessionStorage.getItem('age_ok') === '1');
  }, []);

  const confirmAge = () => {
    sessionStorage.setItem('age_ok', '1');
    setAgeOk(true);
  };

  if (!data) return null;

  if (data.showAgeGate && !ageOk) {
    return (
      <div className="min-h-screen gradient-mesh grid-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 text-center animate-fade-up neon-glow">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Icon name="ShieldAlert" size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3 neon-text">18+</h1>
          <p className="text-muted-foreground mb-8">{data.ageWarning}</p>
          <div className="flex gap-3">
            <Button
              onClick={confirmAge}
              className="flex-1 h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
            >
              Мне есть 18
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = 'https://google.com')}
              className="flex-1 h-12 text-base rounded-xl border-border"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh grid-bg text-foreground overflow-x-hidden">
      <header className="container py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 animate-fade-up">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="Flame" size={20} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">{data.title}</span>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">
          18+
        </span>
      </header>

      <main className="container pb-20">
        <section className="text-center max-w-3xl mx-auto pt-8 pb-12">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-accent mb-5 animate-fade-up">
            Оживление фото & видео
          </span>
          <h1
            className="font-display font-black text-5xl md:text-7xl leading-[0.95] mb-6 neon-text animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            {data.title}
          </h1>
          <p
            className="text-muted-foreground text-lg leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            {data.description}
          </p>
        </section>

        <section
          className="max-w-4xl mx-auto mb-12 animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="relative rounded-3xl overflow-hidden border border-border bg-card neon-glow">
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            {data.videoUrl ? (
              <video
                src={data.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full aspect-video bg-black object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-secondary/50 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-float">
                  <Icon name="Play" size={28} className="text-primary ml-1" />
                </div>
                <p className="text-muted-foreground text-sm">Видео не загружено</p>
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="rounded-lg border-border">
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить в админке
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section
          className="max-w-md mx-auto space-y-3 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          {data.links.map((link, i) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur border border-border hover:border-primary/60 hover:bg-card transition-all hover:scale-[1.02]"
              style={{ animationDelay: `${0.4 + i * 0.08}s` }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Icon name={link.icon} fallback="Link" size={20} className="text-primary" />
              </div>
              <span className="font-semibold flex-1">{link.title}</span>
              <Icon
                name="ArrowUpRight"
                size={20}
                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
              />
            </a>
          ))}
        </section>
      </main>

      <footer className="container py-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {data.title}. 18+</p>
        <Link
          to="/admin"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <Icon name="Settings" size={15} />
          Админка
        </Link>
      </footer>
    </div>
  );
};

export default Index;