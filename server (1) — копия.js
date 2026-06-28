import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Папка для загруженных файлов
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Multer
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Данные (let — чтобы можно было мутировать)
let apps = [
  {
    id: 1,
    title: 'Атлас заметок',
    price: 0,
    free: true,
    category: 'productivity',
    image: 'https://s10.iimage.su/s/17/g13KUVrxzeCktaLvmzrAaAToBATvlCY0IrBg4I0Ub.png',
    description: 'Приложение для создания и организации заметок с картами и синхронизацией',
    rating: 4.8,
    downloads: '1.2M',
    screenshots: [],
  },
  {
    id: 2,
    title: 'Переводчик',
    price: 0,
    free: true,
    category: 'productivity',
    image: 'https://s10.iimage.su/s/17/gpEfVoNxZy13PCv2jovzFRg9i12bZkfHwjIiZDqAM.png',
    description: 'Мгновенный перевод текста на 100+ языков с поддержкой голоса',
    rating: 4.6,
    downloads: '5M',
    screenshots: [],
  },
  {
    id: 3,
    title: 'Json',
    price: 0,
    free: true,
    category: 'development',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    description: 'Редактор JSON с визуализацией структуры данных и валидацией',
    rating: 4.5,
    downloads: '800K',
    screenshots: [],
  },
  {
    id: 4,
    title: 'Линза',
    price: 0,
    free: true,
    category: 'productivity',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
    description: 'Лупа для увеличения текста и изображений на экране с настройками контраста',
    rating: 4.7,
    downloads: '2.1M',
    screenshots: [],
  },
  {
    id: 5,
    title: 'Почтовый клиент',
    price: 4.99,
    free: false,
    category: 'productivity',
    image: 'https://s10.iimage.su/s/17/gQcDC4vxMZhgbjgyVqEep7L08XS0CgkHlof1nZGjO.png',
    description: 'Профессиональный почтовый клиент с поддержкой шифрования и фильтрами',
    rating: 4.9,
    downloads: '3.5M',
    screenshots: [],
  },
  {
    id: 6,
    title: 'Видеоредактор',
    price: 9.99,
    free: false,
    category: 'design',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop',
    description: 'Мощный видеоредактор с эффектами, переходами и поддержкой 4K',
    rating: 4.7,
    downloads: '4.2M',
    screenshots: [],
  },
  {
    id: 7,
    title: 'Фотошоп',
    price: 14.99,
    free: false,
    category: 'design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    description: 'Профессиональное редактирование фотографий с AI-инструментами',
    rating: 4.8,
    downloads: '6.3M',
    screenshots: [],
  },
  {
    id: 8,
    title: 'Блокнот',
    price: 0,
    free: true,
    category: 'productivity',
    image: 'https://s10.iimage.su/s/17/gmNneqaxEiWNLOC9yOqCNs9eGz5XfNhQ3c8QiLeNM.png',
    description: 'Простой и быстрый блокнот для повседневных заметок без лишних функций',
    rating: 4.4,
    downloads: '900K',
    screenshots: [],
  },
];

let nextId = 9;

// === PUBLIC ROUTES ===

app.get('/api/apps', (req, res) => {
  let result = [...apps];

  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    result = result.filter(
      (a) => a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s)
    );
  }
  if (req.query.free === 'true') result = result.filter((a) => a.free === true);
  if (req.query.category) result = result.filter((a) => a.category === req.query.category);

  setTimeout(() => res.json(result), 500);
});

app.get('/api/apps/:id', (req, res) => {
  const app = apps.find((a) => a.id === parseInt(req.params.id));
  app ? res.json(app) : res.status(404).json({ error: 'Приложение не найдено' });
});

app.get('/api/categories', (req, res) => {
  res.json([...new Set(apps.map((a) => a.category))]);
});

app.get('/', (req, res) => res.json({ message: 'MiniStore API' }));

// === ADMIN ROUTES ===

// Создать
app.post('/api/admin/apps', (req, res) => {
  const newApp = { id: nextId++, screenshots: [], ...req.body };
  apps.push(newApp);
  res.status(201).json(newApp);
});

// Обновить
app.patch('/api/admin/apps/:id', (req, res) => {
  const idx = apps.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  apps[idx] = { ...apps[idx], ...req.body };
  res.json(apps[idx]);
});

// Удалить
app.delete('/api/admin/apps/:id', (req, res) => {
  const idx = apps.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  apps.splice(idx, 1);
  res.status(204).send();
});

// Загрузить изображение
app.post('/api/admin/uploads', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  const url = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ url });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});