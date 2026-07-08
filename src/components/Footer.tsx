import React, { useState } from 'react';
import { 
  Play, 
  Twitter, 
  Instagram, 
  Youtube, 
  Github, 
  ArrowRight,
  Mail,
  MessageSquare
} from 'lucide-react';
import CatLogo from './CatLogo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Respons server tidak valid (bukan JSON).');
      }

      if (response.ok && data.success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setErrorMessage(data.error || 'Terjadi kesalahan saat berlangganan.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal terhubung dengan server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-[#0d0f12] border-t border-gray-800/80 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
          
          {/* Logo & Description Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2 group">
              <CatLogo size={36} className="drop-shadow-[0_0_10px_rgba(130,195,65,0.4)] group-hover:scale-105 transition-all duration-300" />
              <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-[#82C341] transition-colors duration-300">
                wi-<span className="text-[#82C341]">buku</span>
              </span>
            </a>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Wi-Buku. Temukan, jelajahi, dan kelola manga dan manhwa favorit Anda. Sumber informasi terlengkap tentang rilisan terbaru, ulasan chapter, dan berita manga/manhwa terkini. Panduan lengkap bagi para otaku Indonesia.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3.5 mt-2">
              <a href="#" className="text-gray-500 hover:text-[#82C341] transition-colors" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#82C341] transition-colors" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#82C341] transition-colors" aria-label="Discord">
                <MessageSquare size={16} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#82C341] transition-colors" aria-label="YouTube">
                <Youtube size={16} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#82C341] transition-colors" aria-label="GitHub">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Links Column 4: INSTITUCIONAL */}
          <div className="lg:col-start-5">
            <h4 className="font-display font-bold text-[11px] text-gray-500 uppercase tracking-widest mb-4">
              Informasi
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              <li><a href="#" className="hover:text-[#82C341] transition-colors">Tim Kami</a></li>
              <li><a href="#" className="hover:text-[#82C341] transition-colors">Pencarian</a></li>
              <li><a href="#" className="hover:text-[#82C341] transition-colors">Tentang</a></li>
              <li><a href="#" className="hover:text-[#82C341] transition-colors">Kontak</a></li>
              <li><a href="#" className="hover:text-[#82C341] transition-colors">Syarat Ketentuan</a></li>
              <li><a href="#" className="hover:text-[#82C341] transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

        </div>

        {/* Legal Bottom line */}
        <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[10px] text-gray-500">
          <span>&copy; {new Date().getFullYear()} Wi-Buku. Hak cipta dilindungi undang-undang.</span>
          
          <div className="flex items-center gap-1.5">
            <span>Data disediakan oleh</span>
            <a href="#" className="text-gray-400 hover:text-[#82C341] transition-colors">Ikan AIS</a>
            <span>dan</span>
            <a href="#" className="text-gray-400 hover:text-[#82C341] transition-colors">MeuAnimeList</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
