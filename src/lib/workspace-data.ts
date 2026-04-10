export type WorkspaceFolder = {
  id: string;
  key: "templates" | "normatives" | "legal" | "contacts";
  color: string;
};

export type WorkspaceDoc = {
  id: string;
  title: string;
  folderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export const WORKSPACE_FOLDERS: WorkspaceFolder[] = [
  { id: "templates", key: "templates", color: "#6366f1" },
  { id: "normatives", key: "normatives", color: "#0ea5e9" },
  { id: "legal", key: "legal", color: "#f59e0b" },
  { id: "contacts", key: "contacts", color: "#10b981" },
];

const TZ_TEMPLATE = `# Texnik Topshiriq (TT) — O'z DSt 1987:2018

---

## 1. Umumiy ma'lumotlar

**Loyiha nomi:**
**Buyurtmachi tashkilot:**
**Ijrochi tashkilot:**
**Hujjat sanasi:**
**Versiya:** 1.0

---

## 2. Maqsad va vazifalar

Loyihaning asosiy maqsadi va hal etilishi kerak bo'lgan muammolarni aniq ko'rsating.

---

## 3. Funksional talablar

Tizim bajarishi kerak bo'lgan funksiyalar va imkoniyatlar ro'yxati:

- [ ] Funksiya 1
- [ ] Funksiya 2
- [ ] Funksiya 3

---

## 4. Texnik talablar

| Parametr | Talab |
|----------|-------|
| Platforma | |
| Dasturlash tili | |
| Ma'lumotlar bazasi | |
| Minimal server talablari | |

---

## 5. Xavfsizlik talablari

O'z DSt 1987:2018 va ПКМ №425 talablariga muvofiq:

- Kiberhavfsizlik markazi (ЦКБ) bilan muvofiqlashtirish
- Ma'lumotlarni himoya qilish siyosati
- Kirish va autentifikatsiya talablari

---

## 6. Integratsiya talablari

Bog'lanishi kerak bo'lgan tizimlar va xizmatlar:

- Reestr.uz
- EPIGУ (Yagona portal)
- Boshqa davlat tizimlari

---

## 7. Bajarish muddatlari

| Bosqich | Boshlanish | Tugash | Mas'ul |
|---------|------------|--------|--------|
| TT ishlab chiqish | | | |
| Loyihalash | | | |
| Rivojlantirish | | | |
| Sinov (alpha) | | | |
| Sinov (beta) | | | |
| Ishga tushirish | | | |

---

## 8. Qabul qilish mezonlari

Loyiha muvaffaqiyatli deb hisoblanishi uchun:

1. Barcha funksional talablar bajarilgan
2. Xavfsizlik auditi o'tkazilgan
3. Foydalanuvchi qo'llanmasi tayyorlangan
4. Davlat sinovidan o'tgan

---

*Ushbu shablon O'z DSt 1987:2018 "Axborot texnologiyalari. Dasturiy ta'minot mahsulotlari" standarti asosida tuzilgan.*`;

const DEMO_DOCS_RAW: Omit<WorkspaceDoc, "createdAt" | "updatedAt">[] = [
  {
    id: "doc-tz-template",
    title: "TT Shabloni (O'z DSt 1987:2018)",
    folderId: "templates",
    content: TZ_TEMPLATE,
  },
  {
    id: "doc-contract-template",
    title: "Shartnoma shabloni",
    folderId: "templates",
    content: `# Xizmat ko'rsatish shartnomasi

**Shartnoma №:** ___
**Sana:** ___

---

## Tomonlar

**Buyurtmachi:**
Tashkilot nomi: ___
Manzil: ___
STIR: ___

**Ijrochi:**
Tashkilot nomi: ___
Manzil: ___
STIR: ___

---

## Shartnoma predmeti

Ijrochi buyurtmachi topshirig'i bilan quyidagi ishlarni bajaradi:
...

---

## Narx va to'lov shartlari

Umumiy narx: ___ so'm (QQS bilan / QQSsiz)

---

## Tomonlarning imzolari

Buyurtmachi: ___________
Ijrochi: ___________`,
  },
  {
    id: "doc-pkm-425",
    title: "ПКМ №425 — Asosiy qoidalar",
    folderId: "normatives",
    content: `# O'zbekiston Respublikasi Vazirlar Mahkamasining
## 2021-yil 6-oktabrdagi 425-son Qarorlari

**Mavzu:** Sun'iy intellekt texnologiyalarini joriy etish tartibi

---

## Asosiy qoidalar

1. Davlat tashkilotlari sun'iy intellekt loyihalarini amalga oshirishda ushbu qoidalarga rioya etishi shart.

2. Har bir loyiha quyidagi bosqichlardan o'tishi kerak:
   - Texnik topshiriq (TT) ishlab chiqish
   - Raqamli texnologiyalar vazirligi tasdiqlovi
   - Kiberhavfsizlik markazi (ЦКБ) ko'rib chiqishi
   - НАПП ko'rib chiqishi
   - Reestr.uz ro'yxatga olish
   - Xarid jarayoni (zakupka)
   - Kompleks ekspertiza markazi (ЦКЭ) ko'rib chiqishi

3. Loyihalar Reestr.uz davlat reestrida ro'yxatga olinishi majburiy.

---

*To'liq matn rasmiy manbadan yuklab olinsin.*`,
  },
  {
    id: "doc-dst-1987",
    title: "O'z DSt 1987:2018 Standarti",
    folderId: "normatives",
    content: `# O'z DSt 1987:2018
## Axborot texnologiyalari. Dasturiy ta'minot mahsulotlari.
### Sifat talablari va sinovlar

---

## Asosiy bo'limlar

### 1. Qo'llanish sohalari
Ushbu standart O'zbekiston Respublikasida ishlab chiqilgan va qo'llaniladigan barcha dasturiy mahsulotlarga tegishli.

### 2. Normativ havolalar
- ISO/IEC 25010:2011
- ISO/IEC 12207:2008

### 3. Atamalar va ta'riflar
...

### 4. Sifat ko'rsatkichlari
- Funksionallik
- Ishonchlilik
- Foydalanish qulayligi
- Samaradorlik
- Xavfsizlik

---

*Standartning to'liq matni O'zstandart saytidan yuklab olinsin.*`,
  },
  {
    id: "doc-ckb-requirements",
    title: "ЦКБ — Ariza talablari",
    folderId: "legal",
    content: `# Kiberhavfsizlik markazi (ЦКБ)
## Ko'rib chiqish uchun hujjatlar ro'yxati

---

### Taqdim etiladigan hujjatlar

1. **Ariza** — belgilangan shaklda
2. **Texnik topshiriq (TT)** — tasdiqlangan nusxa
3. **Arxitektura sxemasi** — tizim komponentlari bilan
4. **Xavfsizlik modeli** — tahdidlar tahlili bilan
5. **Penetratsion test hisoboti** (agar mavjud bo'lsa)
6. **Ma'lumotlarni himoya qilish siyosati**

### Ko'rib chiqish muddati

Standart holat: **30 ish kuni**
Tezlashtirilgan: **15 ish kuni** (qo'shimcha to'lov bilan)

### Aloqa

**Manzil:** Toshkent, ___
**Tel:** ___
**Email:** info@ckb.uz`,
  },
  {
    id: "doc-contacts",
    title: "Asosiy kontaktlar",
    folderId: "contacts",
    content: `# Asosiy kontaktlar va manzillar

---

## Raqamli texnologiyalar vazirligi

**Manzil:** Toshkent sh., Shayxontohur tumani
**Veb-sayt:** https://mict.uz
**Email:** info@mict.uz

---

## Kiberhavfsizlik markazi (ЦКБ)

**Veb-sayt:** https://ckb.uz
**Email:** info@ckb.uz

---

## НАПП (Milliy agentlik)

**Veb-sayt:** https://napp.uz
**Email:** info@napp.uz

---

## Reestr.uz

**Veb-sayt:** https://reestr.uz
**Email:** info@reestr.uz

---

## ЦКЭ (Kompleks ekspertiza markazi)

**Email:** info@cke.uz`,
  },
];

// Mutable in-memory docs array
export const WORKSPACE_DOCS: WorkspaceDoc[] = DEMO_DOCS_RAW.map((d) => ({
  ...d,
  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2025-01-15"),
}));

// Per-project notes — mutable in-place
export const PROJECT_NOTES: Record<string, string> = {};

export function getWorkspaceDocs(): WorkspaceDoc[] {
  return WORKSPACE_DOCS;
}

export function getWorkspaceDoc(id: string): WorkspaceDoc | null {
  return WORKSPACE_DOCS.find((d) => d.id === id) ?? null;
}

export function updateWorkspaceDoc(id: string, content: string, title?: string): WorkspaceDoc | null {
  const doc = WORKSPACE_DOCS.find((d) => d.id === id);
  if (!doc) return null;
  doc.content = content;
  if (title !== undefined) doc.title = title;
  doc.updatedAt = new Date();
  return doc;
}

export function createWorkspaceDoc(folderId: string, title: string): WorkspaceDoc {
  const doc: WorkspaceDoc = {
    id: `doc-${Date.now()}`,
    title,
    folderId,
    content: `# ${title}\n\n`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  WORKSPACE_DOCS.push(doc);
  return doc;
}

export function deleteWorkspaceDoc(id: string): boolean {
  const idx = WORKSPACE_DOCS.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  WORKSPACE_DOCS.splice(idx, 1);
  return true;
}

export function getProjectNotes(projectId: string): string {
  return PROJECT_NOTES[projectId] ?? "";
}

export function setProjectNotes(projectId: string, notes: string): void {
  PROJECT_NOTES[projectId] = notes;
}
