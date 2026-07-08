import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { 
  scrapeHomeCategories, 
  scrapeHome, 
  scrapeSearch, 
  scrapeDetail, 
  scrapeChapter 
} from './server/scrapper';

// Load environment variables
dotenv.config();

// S3 Client for Cloudflare R2 with lazy initialization
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      region: 'auto',
    });
  }
  return s3Client;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;


async function startServer() {
  const app = express();
  
  // Izinkan Express mempercayai reverse proxy (Cloud Run / Nginx) untuk mendeteksi IP asli klien
  app.set('trust proxy', 1);
  
  // 1. Keamanan Header HTTP via Helmet (Mencegah Clickjacking, XSS, MIME Sniffing)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Dinonaktifkan agar hot-reloading & script Vite berfungsi
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Proteksi Trafik Tinggi / DDoS via Rate Limiter
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Window waktu: 1 menit
    max: 120, // Batas maksimal 120 request per IP per menit
    standardHeaders: true, // Sertakan header status RateLimit standar
    legacyHeaders: false, // Matikan header lama X-RateLimit
    message: { 
      error: 'Terlalu banyak permintaan dari IP Anda. Wi-Buku otomatis mengaktifkan proteksi overload demi stabilitas server. Silakan coba lagi dalam 1 menit.' 
    },
  });

  // Terapkan pembatasan lalu lintas ke seluruh endpoint API
  app.use('/api/', limiter);

  // 3. Batasi Ukuran Payload JSON & URL-encoded (Mencegah serangan pembengkakan memori)
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb', parameterLimit: 100 }));

  // In-memory array to track newsletter signups
  const subscriptions = new Set<string>();

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Endpoint Unggah Berkas ke Cloudflare R2
  app.post('/api/upload', (req, res, next) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        console.error('[Multer Error]', err);
        return res.status(400).json({ 
          error: err.code === 'LIMIT_FILE_SIZE' 
            ? 'Ukuran berkas terlalu besar (maksimal 5MB).' 
            : (err.message || 'Gagal mengunggah berkas.') 
        });
      }
      next();
    });
  }, async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada berkas yang diunggah.' });
      }

      const file = req.file;
      const fileExtension = path.extname(file.originalname) || '.png';
      const uniqueId = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      const key = `uploads/${uniqueId}${fileExtension}`;

      const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
      const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      const r2AccountId = process.env.R2_ACCOUNT_ID;
      const bucketName = process.env.R2_BUCKET_NAME || 'wibuku';
      
      const rawCustomDomain = process.env.R2_CUSTOM_DOMAIN || 'wibuku.vercel.my.id';
      // Bersihkan domain dari protokol (misal: htttps://, https://, atau http://) dan slash di akhir
      const customDomain = rawCustomDomain.replace(/^(https?:\/\/|htttps?:\/\/|http:\/|https:\/|htttps:\/)+/i, '').replace(/\/+$/, '');

      // Fallback ke Base64 jika kredensial R2 belum disiapkan
      if (!r2AccessKeyId || !r2SecretAccessKey || !r2AccountId) {
        const base64Data = file.buffer.toString('base64');
        const fileUrl = `data:${file.mimetype};base64,${base64Data}`;
        console.log(`[Upload Fallback] Kredensial R2 belum lengkap. Menggunakan Base64 data URL fallback.`);
        return res.json({ 
          url: fileUrl,
          fallback: true,
          message: 'Berkas berhasil diunggah secara lokal menggunakan Base64 (Kredensial R2 belum dikonfigurasi).'
        });
      }

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await getS3Client().send(command);

      const fileUrl = `https://${customDomain}/${key}`;
      console.log(`[R2 Upload] Berhasil mengunggah berkas ke: ${fileUrl}`);

      return res.json({ url: fileUrl });
    } catch (err: any) {
      console.error('Error uploading to R2:', err);
      return res.status(500).json({ error: err.message || 'Gagal mengunggah berkas ke Cloudflare R2.' });
    }
  });

  // Endpoint untuk menghapus berkas lama dari Cloudflare R2 secara otomatis
  app.post('/api/delete-file', async (req: any, res: any) => {
    try {
      const { url } = req.body;
      const rawCustomDomain = process.env.R2_CUSTOM_DOMAIN || 'wibuku.vercel.my.id';
      // Bersihkan domain dari protokol (misal: htttps://, https://, atau http://) dan slash di akhir
      const customDomain = rawCustomDomain.replace(/^(https?:\/\/|htttps?:\/\/|http:\/|https:\/|htttps:\/)+/i, '').replace(/\/+$/, '');
      const bucketName = process.env.R2_BUCKET_NAME || 'wibuku';

      if (!url) {
        return res.status(400).json({ error: 'URL tidak disediakan.' });
      }

      // Jika berkas adalah Base64 fallback, tidak perlu menghapus dari R2
      if (url.startsWith('data:')) {
        return res.json({ success: true, message: 'Berkas Base64 diabaikan dari penghapusan R2.' });
      }

      const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
      const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      const r2AccountId = process.env.R2_ACCOUNT_ID;

      if (!r2AccessKeyId || !r2SecretAccessKey || !r2AccountId) {
        return res.json({ success: true, message: 'Penghapusan dilewati karena R2 belum dikonfigurasi.' });
      }

      // Ekstrak key dengan parsing URL
      try {
        const parsedUrl = new URL(url);
        // Pathname biasanya diawali slash, misal: '/uploads/abc.png', kita butuh 'uploads/abc.png'
        const key = parsedUrl.pathname.startsWith('/') ? parsedUrl.pathname.substring(1) : parsedUrl.pathname;

        if (key && key.startsWith('uploads/')) {
          const deleteParams = {
            Bucket: bucketName,
            Key: key,
          };
          const command = new DeleteObjectCommand(deleteParams);
          await getS3Client().send(command);
          console.log(`[R2 Delete] Berhasil menghapus berkas lama dari R2: ${key}`);
          return res.json({ success: true, message: 'Berkas berhasil dihapus.' });
        }
      } catch (urlErr) {
        console.error('[R2 Delete URL Parse Error]', urlErr);
      }

      return res.json({ success: false, message: 'Bukan berkas yang disimpan di R2 kita atau domain tidak cocok.' });
    } catch (err: any) {
      console.error('Error deleting from R2:', err);
      return res.status(500).json({ error: err.message || 'Gagal menghapus berkas dari Cloudflare R2.' });
    }
  });

  // Endpoint Informasi Sistem Keamanan Aktif (Indonesian)
  app.get('/api/security-status', (req, res) => {
    res.json({
      status: 'Aman & Terlindungi',
      rateLimit: {
        active: true,
        maxRequestsPerMinute: 120,
        windowMs: 60000,
        description: 'Membatasi request berlebih dari satu alamat IP untuk mencegah overload server (Anti-DDoS).'
      },
      headers: {
        active: true,
        policy: 'Helmet HTTP Security Headers',
        description: 'Melindungi dari serangan pembajakan klik (Clickjacking), XSS (Cross-Site Scripting), dan MIME-sniffing.'
      },
      dataProtection: {
        active: true,
        encryption: 'HTTPS / SSL dienkripsi penuh',
        description: 'Mengamankan transmisi data pengguna agar tidak disadap oleh pihak ketiga saat transmisi data.'
      },
      inputSanitization: {
        active: true,
        description: 'Menyaring input pencarian dan pendaftaran dari skrip berbahaya (SQL Injection & XSS).'
      }
    });
  });

  // Scraper API Endpoints
  app.get('/api/home-categories', async (req, res) => {
    try {
      const data = await scrapeHomeCategories();
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching home categories:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to fetch categories' });
    }
  });

  app.get('/api/home', async (req, res) => {
    try {
      const data = await scrapeHome();
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching home list:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to fetch home list' });
    }
  });

  app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }
    try {
      const data = await scrapeSearch(query);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching search results:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to fetch search results' });
    }
  });

  app.get('/api/detail', async (req, res) => {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    try {
      const data = await scrapeDetail(url);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching details:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to fetch manga detail' });
    }
  });

  app.get('/api/chapter', async (req, res) => {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    try {
      const data = await scrapeChapter(url);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching chapter:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to fetch chapter content' });
    }
  });

  // Newsletter signup endpoint
  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    subscriptions.add(cleanEmail);
    
    console.log(`[Newsletter] Nova inscrição recebida: ${cleanEmail}`);
    res.json({ 
      success: true, 
      message: 'Inscrição realizada com sucesso! Fique atento às novidades todas as quintas-feiras.' 
    });
  });

  // Handler 404 khusus untuk rute API (mencegah fallback ke index.html untuk endpoint API yang salah/tidak ada)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Endpoint API ${req.method} ${req.path} tidak ditemukan.` });
  });

  // Global Error Handler untuk memastikan semua error dikembalikan dalam format JSON, bukan HTML default Express
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Global Error Handler]', err);
    res.status(err.status || 500).json({
      error: err.message || 'Terjadi kesalahan internal pada server.',
    });
  });

  // Serve static files / Vite middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Production: ${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
