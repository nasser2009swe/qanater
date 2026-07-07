# 🌊 القناطر الخيرية - دليل الخدمات

موقع شامل لخدمات مدينة القناطر الخيرية - موبايل فيرست، يعمل بدون قاعدة بيانات.

---

## 🚀 تشغيل الموقع محلياً

**الطريقة 1 - ملف الباتش (الأسهل):**
```
اضغط دبل كليك على start-server.bat
افتح المتصفح على: http://localhost:8080
```

**الطريقة 2 - Python:**
```bash
cd qanater
python -m http.server 8080
```

---

## 📁 هيكل المشروع

```
qanater/
│
├── index.html              ← الصفحة الرئيسية
├── start-server.bat        ← تشغيل الموقع
│
├── pages/
│   ├── service.html        ← صفحة الخدمة والتخصصات
│   └── detail.html         ← صفحة تفاصيل الطبيب/المكان
│
├── admin/
│   ├── login.html          ← تسجيل دخول الأدمن
│   ├── dashboard.html      ← لوحة التحكم
│   └── dashboard.js        ← منطق الأدمن
│
├── css/
│   └── style.css           ← كل الستايلات
│
├── js/
│   ├── app.js              ← الصفحة الرئيسية
│   ├── service.js          ← صفحة الخدمة
│   └── detail.js           ← صفحة التفاصيل
│
└── data/
    ├── services.json       ← أنواع الخدمات والتخصصات
    ├── listings.json       ← بيانات الأطباء والأماكن (BASE)
    └── config.json         ← إعدادات الموقع
```

---

## 🔐 لوحة التحكم (Admin)

- **الرابط:** `/admin/login.html`
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `qanater2024`

### ماذا يمكن للأدمن؟
- ✅ إضافة أطباء جدد بكل تفاصيلهم
- ✅ إضافة أماكن (صيدليات، مطاعم، إلخ)
- ✅ حذف أي طبيب أو مكان
- ✅ تصدير البيانات كـ `listings.json` لرفعها على GitHub

---

## 🗄️ نظام البيانات

الموقع يستخدم **طبقتين** للبيانات:

1. **localStorage** (الأولوية): بيانات اللي الأدمن بضيفها - تظهر فوراً
2. **listings.json** (الأساس): البيانات المحفوظة على GitHub

### لرفع البيانات الجديدة على GitHub:
1. الأدمن يضيف البيانات من لوحة التحكم
2. يضغط "تصدير listings.json"
3. يرفع الملف على GitHub في مكانه

---

## 📱 الخدمات المتاحة

| الخدمة | ID |
|--------|-----|
| عيادات (باطني، أسنان، عظام...) | clinics |
| صيدليات | pharmacies |
| معامل تحاليل | labs |
| مراكز أشعة | radiology |
| مطاعم | restaurants |
| كافيهات | cafes |
| مخابز وحلواني | bakeries |
| مدارس | schools |
| سوبر ماركت | supermarkets |
| جيم ورياضة | gyms |
| صالونات تجميل | beauty |
| إلكترونيات | electronics |

---

## 🌐 رفع على GitHub Pages

1. ارفع المشروع على GitHub
2. فعّل GitHub Pages من Settings > Pages
3. اختار الـ Branch: `main` والـ folder: `/ (root)`
4. الموقع هيبقى متاح على: `https://username.github.io/qanater`

---

## ✏️ إضافة تخصص جديد لعيادات

افتح `data/services.json` وأضف في subcategories الخاصة بـ clinics:
```json
{ "id": "cardiology", "name": "قلب وأوعية دموية", "icon": "❤️" }
```

## ✏️ إضافة نوع خدمة جديد

أضف في مصفوفة services في `data/services.json`:
```json
{
  "id": "hotels",
  "name": "فنادق",
  "icon": "🏨",
  "color": "#3F51B5",
  "description": "فنادق بالقناطر الخيرية",
  "subcategories": []
}
```
