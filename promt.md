🛠 Backend Architecture & Logic uchun Prompt

Mavzu: "Sentinel-OWASP" — minimalist va yuqori samaradorlikka ega Django backend.

## 1. General Principles

- Infrastructure: Docker va Redis ishlatilmasin. Standart Python virtual environment qo'llansin.
- Database: SQLite3 ishlatilsin. Baza diskda bitta fayl bo'lib saqlansin.
- Performance: I/O yukini kamaytirish uchun barcha audit natijalari bazada JSON formatida saqlansin.

## 2. Core Components (Models)

- User model: Django built-in `User`.
- `ScanModel`:
	- `url`: `URLField`
	- `score`: `IntegerField` (0-100)
	- `risk_data`: `JSONField` (High, Medium, Low sonlari)
	- `findings`: `JSONField` (topilgan barcha zaifliklar tafsiloti)
	- `status`: `CharField` (`Pending`, `Running`, `Completed`, `Failed`)

## 3. Lightweight Execution (Scanning Logic)

- Asynchronous processing uchun Celery o'rniga Python `threading.Thread` ishlatiladi.
- Foydalanuvchi "Scan" tugmasini bosganda yangi thread ishga tushadi.
- Backend darhol `200 OK` qaytaradi, sahifa esa HTMX orqali statusni polling qiladi.
- ZAP API wrapper sifatida `requests` kutubxonasi orqali OWASP ZAP API ga so'rovlar yuboriladi.
- Agar ZAP API mavjud bo'lmasa, `subprocess` orqali tizimdagi tayyor xavfsizlik utilitalari chaqirilishi mumkin.

## 4. API Endpoints (Minimalist)

- `POST /scan/start/`: Yangi auditni boshlaydi va thread ishga tushiradi.
- `GET /scan/status/<id>/`: HTMX uchun skanerlash holatini JSON formatida qaytaradi.
- `GET /dashboard/data/`: Chart.js uchun faqat kerakli agregatsiyalangan raqamlarni qaytaradi.

## 5. Backend-to-Frontend Integration

- Context processors global statistikani, masalan jami skanerlar soni va o'rtacha ballni, doim template'ga uzatish uchun ishlatiladi.
- HTMX polling yordamida skanerlash tugaguncha sahifaning kerakli qismi har 2-3 soniyada yangilanadi.
- `hx-get` va `hx-trigger` atributlari orqali dinamik yangilanish qo'llansin.

## 6. Security & Efficiency

- Input sanitization: URL'lar qat'iy tekshirilsin va faqat valid `http`/`https` qabul qilinsin.
- Query optimization: SQLite uchun ortiqcha optimizatsiya qilinmasin; JSONField o'qishda Python `dict` metodlaridan samarali foydalanilsin.


