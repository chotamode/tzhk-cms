# Статус: tzhk-cms + сайты

Один мульти-тенант Payload CMS (`tzhk-cms`) кормит несколько декуплд-сайтов.
Каждый сайт читает контент по REST (ISR) и **всегда имеет локальный fallback**,
поэтому с пустым `CMS_URL` рендерится встроенный контент.

```
сайты (Next.js)  ──►  @/lib/content (адаптеры → наши типы)  ──►  Payload REST (tzhk-cms)
                       fallback на seed, если CMS нет
```

Тенанты: `tatushka` (татушки), `alfaag` (мамин сайт, вязание), `portfolio` (моё портфолио).

---

## Что есть / частично / нет

### CMS (`tzhk-cms`)
- ✅ Мульти-тенант, Postgres, S3/R2, email, локализация en/cs/ru, drafts
- ✅ Блок-билдер страницы: Hero, About, Gallery, Products, FAQ, Reviews, RichText
- ✅ Контакты / соцсети / SEO как настройки сайта
- ✅ Теги: коллекция `Tags` (name локализован, slug, kind) + `Media.tags` (тег на фото)
- ✅ Галерея: режимы `curated` (руками) и `byTags` (сама по тегам)
- ✅ Товары-витрина (цена = число → задел под магазин)
- ✅ Импорт контента: `seed:content` + кнопка «Import content» в админке
- ✅ Миграции (авто-применяются в проде)
- 🟡 Блоки FAQ/Reviews есть в схеме, но не засижены
- ❌ Магазин (корзина/оплата), дедуп media по имени, join-поле тегов, preview черновиков на фронт

### Мамин сайт (`next-knitting-portfolio`, tenant `alfaag`)
- ✅ Главная (hero + «Обо мне»), футер (контакты/соцсети) — из CMS
- ✅ Галерея «Примеры работ» + фильтр по тегам
- ✅ Товары — витрина из CMS
- ✅ Fallback без CMS, SEO/sitemap/PWA
- 🟡 FAQ, Отзывы, форма Контактов — пока хардкод; режим `byTags` доступен, не включён
- ❌ Реальные контакты/Instagram (сейчас плейсхолдеры `t.me/username`)

### Татушки (`tatushkiii-nextjs`, tenant `tatushka`)
- ✅ Лендинг из CMS (Hero/About/портфолио), booking OpnForm
- ✅ Портфолио-галерея + фильтр по тегам, en/cs/ru, SEO
- 🟡 Старый статический `PortfolioSection` (заглушки-градиенты) ещё в коде

### Моё портфолио (`chotamode/portfolio`, tenant `portfolio`)
- ⚠️ Фронт НЕ обновлён под блоки (нет доступа к репо из этой сессии) — после миграции
  CMS он читает несуществующие старые поля → покажет fallback/пусто, пока не обновить.
- ⚠️ Старый контент этого тенанта в CMS (поля hero/about/portfolio) дропается миграцией —
  нужно перезаполнить блоками (через админку или свой `content.json`).

---

## Деплой (после мёржа PR-ов)

> ⚠️ Это ломающая смена схемы: старые колонки `hero/about/cta/portfolio` дропаются для
> ВСЕХ тенантов. После миграции контент надо пере-залить (сидом или в админке).

1. **Деплой `tzhk-cms`** → миграции применятся на старте (`prodMigrations`).
2. **Пере-сидеть тенанты** (нужен доступ к БД / Payload CLI):
   ```bash
   SEED_DIR=./content/tatushka pnpm seed:content
   SEED_DIR=./content/alfaag   pnpm seed:content
   ```
   Тенант `portfolio` сидом не покрыт — перезаполнить его в админке (уже блоками) или
   завести `content/portfolio/content.json` по образцу.
3. **Логин маме в админку** (один раз):
   ```bash
   pnpm seed:tenant --name "Альфия" --slug alfaag --email <маме> --password <пароль>
   ```
4. **Env на фронтах** (`tatushka`, `alfaag`, `portfolio`) → редеплой:
   ```
   CMS_URL=https://<cms-host>
   PAYLOAD_URL=https://<cms-host>     # хост картинок для next/image
   CMS_TENANT_SLUG=tatushka | alfaag | portfolio
   CMS_REVALIDATE_SECRETS / REVALIDATE_SECRET=<секрет>
   ```
   Оставить `CMS_URL` пустым → сайт работает на встроенном контенте (безопасно).

---

## Как протестировать

**CMS** (`https://<cms-host>/admin`)
- Заходит, видны коллекции Site content / Media / Tags / Tenants.
- У `alfaag`: Site content → секции Hero/About/Gallery(5, с тегами)/Products(4, цены); Tags = Шапки/Шарфы/Пледы/Варежки.
- У `tatushka`: Hero/About/Gallery(3); Tags = Орнаментал/Лайнворк/Абстракция.

**Мамин сайт**
- `/` — заголовок + «Обо мне» из CMS.
- `/examples` — галерея + панель фильтра (Все / Шапки / Шарфы / …); клик фильтрует.
- `/products` — 4 товара с ценами.
- Футер — контакты/соцсети.

**Татушки**
- `/` — Hero/About из CMS, портфолио-галерея + фильтр по тегам.

**Ревалидация (мгновенное обновление при правке)**
- Поменять текст в админке → `POST https://<site>/api/revalidate?secret=<секрет>` →
  на сайте обновилось без редеплоя.

**Быстрый sanity без захода в админку:**
```bash
curl "https://<cms-host>/api/tenants?where[slug][equals]=alfaag&depth=0"
curl "https://<cms-host>/api/tags?where[tenant][equals]=<id>&locale=ru"
```

**Локально (если нужно поднять у себя):**
```bash
# tzhk-cms: DATABASE_URI + PAYLOAD_SECRET в .env → pnpm dev → pnpm seed:content
# сайт: CMS_URL=http://localhost:3000 CMS_TENANT_SLUG=alfaag npm run dev
```

---

## Идеи на потом
- FAQ / Отзывы маминого сайта → из CMS (блоки уже есть).
- Включить `byTags`-галерею (растёт сама при добавлении фото).
- Фильтр по тегам на «Товарах».
- Магазин: корзина + оплата (цена уже число).
- Привести `chotamode/portfolio` к тому же виду (фронт на блоки + сид).
- Мелочи CMS: дедуп фото, join-поле тегов, preview черновиков.
