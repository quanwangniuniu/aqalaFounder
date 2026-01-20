"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

// Supported languages with native names and flags
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", flag: "🇵🇰" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇧🇩" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe", flag: "🇹🇷" },
  {
    code: "id",
    label: "Indonesian",
    nativeLabel: "Bahasa Indonesia",
    flag: "🇮🇩",
  },
  { code: "ms", label: "Malay", nativeLabel: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", flag: "🇧🇷" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", flag: "🇳🇱" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", flag: "🇮🇹" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", flag: "🇰🇷" },
  { code: "th", label: "Thai", nativeLabel: "ไทย", flag: "🇹🇭" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳" },
];

// Full app translations
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    // Homepage
    "home.headline1": "Don't just listen.",
    "home.headline2": "Understand.",
    "home.subheadline":
      "Aqala translates spoken Islamic word - Qur'an, khutbahs, and lectures - into clear, real-time meaning,",
    "home.subheadline2": "From any language - to any language.",
    "home.quranVerse": "Because Allah calls us to reflect, not merely recite.",
    "home.quranRef": "(Qur'an 47:24)",
    "home.startListening": "Start Listening",
    "home.helpKeepFree": "Help keep Aqala free",
    "home.freeForever": "Free forever",
    "home.shareThoughts": "Share your thoughts",
    // Footer
    "footer.instagram": "Instagram",
    "footer.donate": "Donate",
    "footer.reviews": "Reviews",
    // Listen page
    "listen.reference": "Reference",
    "listen.live": "Live",
    "listen.listening": "Listening...",
    "listen.waitingAudio": "Waiting for audio…",
    "listen.translateTo": "Translate to",
    "listen.translationWillAppear": "translation will appear here…",
    "listen.returnHome": "Return home",
    // Language modal
    "modal.title": "Choose Your Language",
    "modal.subtitle": "Select your preferred language for translations",
    "modal.continue": "Continue",
    "modal.settingsNote": "You can change this anytime in settings",
    // Share feature
    "share.copy": "Copy",
    "share.email": "Email",
    "share.copied": "Translation copied!",
    "share.nothingToCopy": "No translation to copy",
    "share.emailTitle": "Email Translation",
    "share.emailSubtitle": "Send your translation record via email",
    "share.emailPlaceholder": "Enter your email address",
    "share.emailPreviewHint":
      "You'll receive the full translation with source text",
    "share.send": "Send",
    "share.sending": "Sending...",
    "share.cancel": "Cancel",
    "share.emailSent": "Email sent successfully!",
    "share.emailError": "Failed to send email",
    "share.invalidEmail": "Please enter a valid email address",
  },
  ar: {
    "home.headline1": "لا تكتفِ بالاستماع.",
    "home.headline2": "افهم.",
    "home.subheadline":
      "عقالة تترجم الكلمة الإسلامية المنطوقة - القرآن والخطب والمحاضرات - إلى معنى واضح في الوقت الفعلي،",
    "home.subheadline2": "من أي لغة - إلى أي لغة.",
    "home.quranVerse": "لأن الله يدعونا للتدبر، لا مجرد التلاوة.",
    "home.quranRef": "(القرآن ٤٧:٢٤)",
    "home.startListening": "ابدأ الاستماع",
    "home.helpKeepFree": "ساعد في إبقاء عقالة مجانية",
    "home.freeForever": "مجاني للأبد",
    "home.shareThoughts": "شاركنا رأيك",
    "footer.instagram": "إنستغرام",
    "footer.donate": "تبرع",
    "footer.reviews": "التقييمات",
    "listen.reference": "المصدر",
    "listen.live": "مباشر",
    "listen.listening": "جارٍ الاستماع...",
    "listen.waitingAudio": "في انتظار الصوت…",
    "listen.translateTo": "ترجم إلى",
    "listen.translationWillAppear": "ستظهر الترجمة هنا…",
    "listen.returnHome": "العودة للرئيسية",
    "modal.title": "اختر لغتك",
    "modal.subtitle": "حدد لغتك المفضلة للترجمة",
    "modal.continue": "متابعة",
    "modal.settingsNote": "يمكنك تغيير هذا في أي وقت من الإعدادات",
    "share.copy": "نسخ",
    "share.email": "بريد إلكتروني",
    "share.copied": "تم نسخ الترجمة!",
    "share.nothingToCopy": "لا توجد ترجمة للنسخ",
    "share.emailTitle": "إرسال الترجمة",
    "share.emailSubtitle": "أرسل سجل الترجمة عبر البريد الإلكتروني",
    "share.emailPlaceholder": "أدخل بريدك الإلكتروني",
    "share.emailPreviewHint": "ستتلقى الترجمة الكاملة مع النص المصدر",
    "share.send": "إرسال",
    "share.sending": "جارٍ الإرسال...",
    "share.cancel": "إلغاء",
    "share.emailSent": "تم إرسال البريد بنجاح!",
    "share.emailError": "فشل إرسال البريد",
    "share.invalidEmail": "يرجى إدخال عنوان بريد إلكتروني صحيح",
  },
  ur: {
    "home.headline1": "صرف سنیں نہیں۔",
    "home.headline2": "سمجھیں۔",
    "home.subheadline":
      "عقالہ بولے جانے والے اسلامی الفاظ - قرآن، خطبات اور لیکچرز - کو واضح، حقیقی وقت میں معنی میں ترجمہ کرتا ہے،",
    "home.subheadline2": "کسی بھی زبان سے - کسی بھی زبان میں۔",
    "home.quranVerse":
      "کیونکہ اللہ ہمیں غور و فکر کرنے کی دعوت دیتا ہے، نہ کہ محض تلاوت۔",
    "home.quranRef": "(قرآن ٤٧:٢٤)",
    "home.startListening": "سننا شروع کریں",
    "home.helpKeepFree": "عقالہ کو مفت رکھنے میں مدد کریں",
    "home.freeForever": "ہمیشہ مفت",
    "home.shareThoughts": "اپنی رائے دیں",
    "footer.instagram": "انسٹاگرام",
    "footer.donate": "عطیہ",
    "footer.reviews": "جائزے",
    "listen.reference": "حوالہ",
    "listen.live": "براہ راست",
    "listen.listening": "سن رہا ہے...",
    "listen.waitingAudio": "آڈیو کا انتظار…",
    "listen.translateTo": "میں ترجمہ کریں",
    "listen.translationWillAppear": "ترجمہ یہاں ظاہر ہوگا…",
    "listen.returnHome": "واپس جائیں",
    "modal.title": "اپنی زبان منتخب کریں",
    "modal.subtitle": "ترجمہ کے لیے اپنی پسندیدہ زبان منتخب کریں",
    "modal.continue": "جاری رکھیں",
    "modal.settingsNote": "آپ اسے کسی بھی وقت ترتیبات میں تبدیل کر سکتے ہیں",
    "share.copy": "کاپی",
    "share.email": "ای میل",
    "share.copied": "ترجمہ کاپی ہو گیا!",
    "share.nothingToCopy": "کاپی کرنے کے لیے کوئی ترجمہ نہیں",
    "share.emailTitle": "ترجمہ ای میل کریں",
    "share.emailSubtitle": "اپنا ترجمہ ریکارڈ ای میل کے ذریعے بھیجیں",
    "share.emailPlaceholder": "اپنا ای میل پتہ درج کریں",
    "share.emailPreviewHint": "آپ کو مکمل ترجمہ اصل متن کے ساتھ ملے گا",
    "share.send": "بھیجیں",
    "share.sending": "بھیج رہا ہے...",
    "share.cancel": "منسوخ",
    "share.emailSent": "ای میل کامیابی سے بھیج دی گئی!",
    "share.emailError": "ای میل بھیجنے میں ناکامی",
    "share.invalidEmail": "براہ کرم درست ای میل پتہ درج کریں",
  },
  hi: {
    "home.headline1": "सिर्फ सुनो मत।",
    "home.headline2": "समझो।",
    "home.subheadline":
      "अकाला बोले गए इस्लामी शब्द - कुरान, खुतबे और व्याख्यान - को स्पष्ट, वास्तविक समय में अर्थ में अनुवाद करता है,",
    "home.subheadline2": "किसी भी भाषा से - किसी भी भाषा में।",
    "home.quranVerse":
      "क्योंकि अल्लाह हमें सोचने के लिए कहते हैं, न कि केवल पढ़ने के लिए।",
    "home.quranRef": "(कुरान 47:24)",
    "home.startListening": "सुनना शुरू करें",
    "home.helpKeepFree": "अकाला को मुफ्त रखने में मदद करें",
    "home.freeForever": "हमेशा मुफ्त",
    "home.shareThoughts": "अपने विचार साझा करें",
    "footer.instagram": "इंस्टाग्राम",
    "footer.donate": "दान करें",
    "footer.reviews": "समीक्षाएं",
    "listen.reference": "संदर्भ",
    "listen.live": "लाइव",
    "listen.listening": "सुन रहा है...",
    "listen.waitingAudio": "ऑडियो का इंतज़ार…",
    "listen.translateTo": "में अनुवाद करें",
    "listen.translationWillAppear": "अनुवाद यहां दिखाई देगा…",
    "listen.returnHome": "वापस जाएं",
    "modal.title": "अपनी भाषा चुनें",
    "modal.subtitle": "अनुवाद के लिए अपनी पसंदीदा भाषा चुनें",
    "modal.continue": "जारी रखें",
    "modal.settingsNote": "आप इसे कभी भी सेटिंग्स में बदल सकते हैं",
    "share.copy": "कॉपी करें",
    "share.email": "ईमेल",
    "share.copied": "अनुवाद कॉपी हो गया!",
    "share.nothingToCopy": "कॉपी करने के लिए कोई अनुवाद नहीं",
    "share.emailTitle": "अनुवाद ईमेल करें",
    "share.emailSubtitle": "अपना अनुवाद रिकॉर्ड ईमेल से भेजें",
    "share.emailPlaceholder": "अपना ईमेल पता दर्ज करें",
    "share.emailPreviewHint": "आपको स्रोत टेक्स्ट के साथ पूरा अनुवाद मिलेगा",
    "share.send": "भेजें",
    "share.sending": "भेज रहा है...",
    "share.cancel": "रद्द करें",
    "share.emailSent": "ईमेल सफलतापूर्वक भेजा गया!",
    "share.emailError": "ईमेल भेजने में विफल",
    "share.invalidEmail": "कृपया एक वैध ईमेल पता दर्ज करें",
  },
  bn: {
    "home.headline1": "শুধু শুনবেন না।",
    "home.headline2": "বুঝুন।",
    "home.subheadline":
      "আকালা কথ্য ইসলামী শব্দ - কুরআন, খুতবা এবং বক্তৃতা - স্পষ্ট, রিয়েল-টাইম অর্থে অনুবাদ করে,",
    "home.subheadline2": "যেকোনো ভাষা থেকে - যেকোনো ভাষায়।",
    "home.quranVerse": "কারণ আল্লাহ আমাদের চিন্তা করতে বলেন, শুধু পড়তে নয়।",
    "home.quranRef": "(কুরআন ৪৭:২৪)",
    "home.startListening": "শোনা শুরু করুন",
    "home.helpKeepFree": "আকালা বিনামূল্যে রাখতে সাহায্য করুন",
    "home.freeForever": "চিরকাল বিনামূল্যে",
    "home.shareThoughts": "আপনার মতামত জানান",
    "footer.instagram": "ইনস্টাগ্রাম",
    "footer.donate": "দান করুন",
    "footer.reviews": "পর্যালোচনা",
    "listen.reference": "রেফারেন্স",
    "listen.live": "লাইভ",
    "listen.listening": "শুনছে...",
    "listen.waitingAudio": "অডিও-এর জন্য অপেক্ষা করছে…",
    "listen.translateTo": "এ অনুবাদ করুন",
    "listen.translationWillAppear": "অনুবাদ এখানে দেখা যাবে…",
    "listen.returnHome": "হোমে ফিরুন",
    "modal.title": "আপনার ভাষা নির্বাচন করুন",
    "modal.subtitle": "অনুবাদের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন",
    "modal.continue": "চালিয়ে যান",
    "modal.settingsNote": "আপনি যেকোনো সময় সেটিংসে এটি পরিবর্তন করতে পারেন",
    "share.copy": "কপি",
    "share.email": "ইমেইল",
    "share.copied": "অনুবাদ কপি হয়েছে!",
    "share.nothingToCopy": "কপি করার জন্য কোনো অনুবাদ নেই",
    "share.emailTitle": "অনুবাদ ইমেইল করুন",
    "share.emailSubtitle": "ইমেইলে আপনার অনুবাদ রেকর্ড পাঠান",
    "share.emailPlaceholder": "আপনার ইমেইল ঠিকানা দিন",
    "share.emailPreviewHint": "আপনি সোর্স টেক্সট সহ সম্পূর্ণ অনুবাদ পাবেন",
    "share.send": "পাঠান",
    "share.sending": "পাঠানো হচ্ছে...",
    "share.cancel": "বাতিল",
    "share.emailSent": "ইমেইল সফলভাবে পাঠানো হয়েছে!",
    "share.emailError": "ইমেইল পাঠাতে ব্যর্থ",
    "share.invalidEmail": "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন",
  },
  tr: {
    "home.headline1": "Sadece dinleme.",
    "home.headline2": "Anla.",
    "home.subheadline":
      "Aqala sözlü İslami kelimeleri - Kur'an, hutbeler ve dersler - açık, gerçek zamanlı anlama çevirir,",
    "home.subheadline2": "Herhangi bir dilden - herhangi bir dile.",
    "home.quranVerse":
      "Çünkü Allah bizi düşünmeye çağırır, sadece okumaya değil.",
    "home.quranRef": "(Kur'an 47:24)",
    "home.startListening": "Dinlemeye Başla",
    "home.helpKeepFree": "Aqala'yı ücretsiz tutmaya yardım et",
    "home.freeForever": "Sonsuza kadar ücretsiz",
    "home.shareThoughts": "Düşüncelerinizi paylaşın",
    "footer.instagram": "Instagram",
    "footer.donate": "Bağış Yap",
    "footer.reviews": "Yorumlar",
    "listen.reference": "Kaynak",
    "listen.live": "Canlı",
    "listen.listening": "Dinliyor...",
    "listen.waitingAudio": "Ses bekleniyor…",
    "listen.translateTo": "Çevir",
    "listen.translationWillAppear": "çeviri burada görünecek…",
    "listen.returnHome": "Ana sayfaya dön",
    "modal.title": "Dilinizi Seçin",
    "modal.subtitle": "Çeviriler için tercih ettiğiniz dili seçin",
    "modal.continue": "Devam Et",
    "modal.settingsNote":
      "Bunu istediğiniz zaman ayarlardan değiştirebilirsiniz",
    "share.copy": "Kopyala",
    "share.email": "E-posta",
    "share.copied": "Çeviri kopyalandı!",
    "share.nothingToCopy": "Kopyalanacak çeviri yok",
    "share.emailTitle": "Çeviriyi E-posta ile Gönder",
    "share.emailSubtitle": "Çeviri kaydınızı e-posta ile gönderin",
    "share.emailPlaceholder": "E-posta adresinizi girin",
    "share.emailPreviewHint":
      "Kaynak metinle birlikte tam çeviriyi alacaksınız",
    "share.send": "Gönder",
    "share.sending": "Gönderiliyor...",
    "share.cancel": "İptal",
    "share.emailSent": "E-posta başarıyla gönderildi!",
    "share.emailError": "E-posta gönderilemedi",
    "share.invalidEmail": "Lütfen geçerli bir e-posta adresi girin",
  },
  id: {
    "home.headline1": "Jangan hanya mendengarkan.",
    "home.headline2": "Pahami.",
    "home.subheadline":
      "Aqala menerjemahkan kata-kata Islam yang diucapkan - Al-Qur'an, khutbah, dan ceramah - menjadi makna yang jelas secara real-time,",
    "home.subheadline2": "Dari bahasa apa pun - ke bahasa apa pun.",
    "home.quranVerse":
      "Karena Allah menyeru kita untuk merenungkan, bukan sekadar membaca.",
    "home.quranRef": "(Al-Qur'an 47:24)",
    "home.startListening": "Mulai Mendengarkan",
    "home.helpKeepFree": "Bantu Aqala tetap gratis",
    "home.freeForever": "Gratis selamanya",
    "home.shareThoughts": "Bagikan pendapat Anda",
    "footer.instagram": "Instagram",
    "footer.donate": "Donasi",
    "footer.reviews": "Ulasan",
    "listen.reference": "Referensi",
    "listen.live": "Langsung",
    "listen.listening": "Mendengarkan...",
    "listen.waitingAudio": "Menunggu audio…",
    "listen.translateTo": "Terjemahkan ke",
    "listen.translationWillAppear": "terjemahan akan muncul di sini…",
    "listen.returnHome": "Kembali ke beranda",
    "modal.title": "Pilih Bahasa Anda",
    "modal.subtitle": "Pilih bahasa pilihan Anda untuk terjemahan",
    "modal.continue": "Lanjutkan",
    "modal.settingsNote": "Anda dapat mengubah ini kapan saja di pengaturan",
    "share.copy": "Salin",
    "share.email": "Email",
    "share.copied": "Terjemahan disalin!",
    "share.nothingToCopy": "Tidak ada terjemahan untuk disalin",
    "share.emailTitle": "Kirim Terjemahan via Email",
    "share.emailSubtitle": "Kirim catatan terjemahan Anda via email",
    "share.emailPlaceholder": "Masukkan alamat email Anda",
    "share.emailPreviewHint":
      "Anda akan menerima terjemahan lengkap dengan teks sumber",
    "share.send": "Kirim",
    "share.sending": "Mengirim...",
    "share.cancel": "Batal",
    "share.emailSent": "Email berhasil dikirim!",
    "share.emailError": "Gagal mengirim email",
    "share.invalidEmail": "Silakan masukkan alamat email yang valid",
  },
  ms: {
    "home.headline1": "Jangan sekadar mendengar.",
    "home.headline2": "Fahami.",
    "home.subheadline":
      "Aqala menterjemah perkataan Islam yang dilafazkan - Al-Quran, khutbah, dan ceramah - kepada makna yang jelas dalam masa nyata,",
    "home.subheadline2": "Dari mana-mana bahasa - ke mana-mana bahasa.",
    "home.quranVerse":
      "Kerana Allah menyeru kita untuk berfikir, bukan sekadar membaca.",
    "home.quranRef": "(Al-Quran 47:24)",
    "home.startListening": "Mula Mendengar",
    "home.helpKeepFree": "Bantu kekalkan Aqala percuma",
    "home.freeForever": "Percuma selamanya",
    "home.shareThoughts": "Kongsi pendapat anda",
    "footer.instagram": "Instagram",
    "footer.donate": "Derma",
    "footer.reviews": "Ulasan",
    "listen.reference": "Rujukan",
    "listen.live": "Langsung",
    "listen.listening": "Mendengar...",
    "listen.waitingAudio": "Menunggu audio…",
    "listen.translateTo": "Terjemah ke",
    "listen.translationWillAppear": "terjemahan akan muncul di sini…",
    "listen.returnHome": "Kembali ke laman utama",
    "modal.title": "Pilih Bahasa Anda",
    "modal.subtitle": "Pilih bahasa pilihan anda untuk terjemahan",
    "modal.continue": "Teruskan",
    "modal.settingsNote": "Anda boleh menukar ini bila-bila masa dalam tetapan",
    "share.copy": "Salin",
    "share.email": "E-mel",
    "share.copied": "Terjemahan disalin!",
    "share.nothingToCopy": "Tiada terjemahan untuk disalin",
    "share.emailTitle": "E-mel Terjemahan",
    "share.emailSubtitle": "Hantar rekod terjemahan anda melalui e-mel",
    "share.emailPlaceholder": "Masukkan alamat e-mel anda",
    "share.emailPreviewHint":
      "Anda akan menerima terjemahan penuh dengan teks sumber",
    "share.send": "Hantar",
    "share.sending": "Menghantar...",
    "share.cancel": "Batal",
    "share.emailSent": "E-mel berjaya dihantar!",
    "share.emailError": "Gagal menghantar e-mel",
    "share.invalidEmail": "Sila masukkan alamat e-mel yang sah",
  },
  fr: {
    "home.headline1": "N'écoutez pas seulement.",
    "home.headline2": "Comprenez.",
    "home.subheadline":
      "Aqala traduit la parole islamique parlée - Coran, sermons et conférences - en un sens clair et en temps réel,",
    "home.subheadline2":
      "De n'importe quelle langue - vers n'importe quelle langue.",
    "home.quranVerse":
      "Car Allah nous appelle à réfléchir, pas seulement à réciter.",
    "home.quranRef": "(Coran 47:24)",
    "home.startListening": "Commencer à écouter",
    "home.helpKeepFree": "Aidez à garder Aqala gratuit",
    "home.freeForever": "Gratuit pour toujours",
    "home.shareThoughts": "Partagez vos pensées",
    "footer.instagram": "Instagram",
    "footer.donate": "Faire un don",
    "footer.reviews": "Avis",
    "listen.reference": "Référence",
    "listen.live": "En direct",
    "listen.listening": "Écoute en cours...",
    "listen.waitingAudio": "En attente de l'audio…",
    "listen.translateTo": "Traduire en",
    "listen.translationWillAppear": "la traduction apparaîtra ici…",
    "listen.returnHome": "Retour à l'accueil",
    "modal.title": "Choisissez votre langue",
    "modal.subtitle": "Sélectionnez votre langue préférée pour les traductions",
    "modal.continue": "Continuer",
    "modal.settingsNote":
      "Vous pouvez changer cela à tout moment dans les paramètres",
    "share.copy": "Copier",
    "share.email": "E-mail",
    "share.copied": "Traduction copiée !",
    "share.nothingToCopy": "Aucune traduction à copier",
    "share.emailTitle": "Envoyer la traduction par e-mail",
    "share.emailSubtitle":
      "Envoyez votre enregistrement de traduction par e-mail",
    "share.emailPlaceholder": "Entrez votre adresse e-mail",
    "share.emailPreviewHint":
      "Vous recevrez la traduction complète avec le texte source",
    "share.send": "Envoyer",
    "share.sending": "Envoi en cours...",
    "share.cancel": "Annuler",
    "share.emailSent": "E-mail envoyé avec succès !",
    "share.emailError": "Échec de l'envoi de l'e-mail",
    "share.invalidEmail": "Veuillez entrer une adresse e-mail valide",
  },
  de: {
    "home.headline1": "Hör nicht nur zu.",
    "home.headline2": "Verstehe.",
    "home.subheadline":
      "Aqala übersetzt gesprochene islamische Worte - Koran, Predigten und Vorträge - in klare Echtzeit-Bedeutung,",
    "home.subheadline2": "Von jeder Sprache - in jede Sprache.",
    "home.quranVerse":
      "Denn Allah ruft uns zum Nachdenken auf, nicht nur zum Rezitieren.",
    "home.quranRef": "(Koran 47:24)",
    "home.startListening": "Zuhören beginnen",
    "home.helpKeepFree": "Hilf, Aqala kostenlos zu halten",
    "home.freeForever": "Für immer kostenlos",
    "home.shareThoughts": "Teilen Sie Ihre Gedanken",
    "footer.instagram": "Instagram",
    "footer.donate": "Spenden",
    "footer.reviews": "Bewertungen",
    "listen.reference": "Referenz",
    "listen.live": "Live",
    "listen.listening": "Hört zu...",
    "listen.waitingAudio": "Warte auf Audio…",
    "listen.translateTo": "Übersetzen nach",
    "listen.translationWillAppear": "Übersetzung erscheint hier…",
    "listen.returnHome": "Zurück zur Startseite",
    "modal.title": "Wählen Sie Ihre Sprache",
    "modal.subtitle": "Wählen Sie Ihre bevorzugte Sprache für Übersetzungen",
    "modal.continue": "Weiter",
    "modal.settingsNote":
      "Sie können dies jederzeit in den Einstellungen ändern",
    "share.copy": "Kopieren",
    "share.email": "E-Mail",
    "share.copied": "Übersetzung kopiert!",
    "share.nothingToCopy": "Keine Übersetzung zum Kopieren",
    "share.emailTitle": "Übersetzung per E-Mail senden",
    "share.emailSubtitle": "Senden Sie Ihren Übersetzungsverlauf per E-Mail",
    "share.emailPlaceholder": "Geben Sie Ihre E-Mail-Adresse ein",
    "share.emailPreviewHint":
      "Sie erhalten die vollständige Übersetzung mit Quelltext",
    "share.send": "Senden",
    "share.sending": "Wird gesendet...",
    "share.cancel": "Abbrechen",
    "share.emailSent": "E-Mail erfolgreich gesendet!",
    "share.emailError": "E-Mail konnte nicht gesendet werden",
    "share.invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
  },
  es: {
    "home.headline1": "No solo escuches.",
    "home.headline2": "Comprende.",
    "home.subheadline":
      "Aqala traduce la palabra islámica hablada - Corán, sermones y conferencias - a un significado claro en tiempo real,",
    "home.subheadline2": "De cualquier idioma - a cualquier idioma.",
    "home.quranVerse":
      "Porque Allah nos llama a reflexionar, no solo a recitar.",
    "home.quranRef": "(Corán 47:24)",
    "home.startListening": "Empezar a escuchar",
    "home.helpKeepFree": "Ayuda a mantener Aqala gratis",
    "home.freeForever": "Gratis para siempre",
    "home.shareThoughts": "Comparte tus pensamientos",
    "footer.instagram": "Instagram",
    "footer.donate": "Donar",
    "footer.reviews": "Reseñas",
    "listen.reference": "Referencia",
    "listen.live": "En vivo",
    "listen.listening": "Escuchando...",
    "listen.waitingAudio": "Esperando audio…",
    "listen.translateTo": "Traducir a",
    "listen.translationWillAppear": "la traducción aparecerá aquí…",
    "listen.returnHome": "Volver al inicio",
    "modal.title": "Elige tu idioma",
    "modal.subtitle": "Selecciona tu idioma preferido para las traducciones",
    "modal.continue": "Continuar",
    "modal.settingsNote": "Puedes cambiar esto en cualquier momento en ajustes",
    "share.copy": "Copiar",
    "share.email": "Correo",
    "share.copied": "¡Traducción copiada!",
    "share.nothingToCopy": "No hay traducción para copiar",
    "share.emailTitle": "Enviar traducción por correo",
    "share.emailSubtitle":
      "Envía tu registro de traducción por correo electrónico",
    "share.emailPlaceholder": "Ingresa tu correo electrónico",
    "share.emailPreviewHint":
      "Recibirás la traducción completa con el texto fuente",
    "share.send": "Enviar",
    "share.sending": "Enviando...",
    "share.cancel": "Cancelar",
    "share.emailSent": "¡Correo enviado con éxito!",
    "share.emailError": "Error al enviar el correo",
    "share.invalidEmail": "Por favor ingresa un correo electrónico válido",
  },
  pt: {
    "home.headline1": "Não apenas ouça.",
    "home.headline2": "Entenda.",
    "home.subheadline":
      "Aqala traduz a palavra islâmica falada - Alcorão, sermões e palestras - em significado claro em tempo real,",
    "home.subheadline2": "De qualquer idioma - para qualquer idioma.",
    "home.quranVerse":
      "Porque Allah nos chama a refletir, não apenas a recitar.",
    "home.quranRef": "(Alcorão 47:24)",
    "home.startListening": "Começar a ouvir",
    "home.helpKeepFree": "Ajude a manter o Aqala gratuito",
    "home.freeForever": "Gratuito para sempre",
    "home.shareThoughts": "Compartilhe seus pensamentos",
    "footer.instagram": "Instagram",
    "footer.donate": "Doar",
    "footer.reviews": "Avaliações",
    "listen.reference": "Referência",
    "listen.live": "Ao vivo",
    "listen.listening": "Ouvindo...",
    "listen.waitingAudio": "Aguardando áudio…",
    "listen.translateTo": "Traduzir para",
    "listen.translationWillAppear": "a tradução aparecerá aqui…",
    "listen.returnHome": "Voltar ao início",
    "modal.title": "Escolha seu idioma",
    "modal.subtitle": "Selecione seu idioma preferido para traduções",
    "modal.continue": "Continuar",
    "modal.settingsNote":
      "Você pode mudar isso a qualquer momento nas configurações",
    "share.copy": "Copiar",
    "share.email": "E-mail",
    "share.copied": "Tradução copiada!",
    "share.nothingToCopy": "Nenhuma tradução para copiar",
    "share.emailTitle": "Enviar tradução por e-mail",
    "share.emailSubtitle": "Envie seu registro de tradução por e-mail",
    "share.emailPlaceholder": "Digite seu endereço de e-mail",
    "share.emailPreviewHint":
      "Você receberá a tradução completa com o texto fonte",
    "share.send": "Enviar",
    "share.sending": "Enviando...",
    "share.cancel": "Cancelar",
    "share.emailSent": "E-mail enviado com sucesso!",
    "share.emailError": "Falha ao enviar e-mail",
    "share.invalidEmail": "Por favor, insira um endereço de e-mail válido",
  },
  ru: {
    "home.headline1": "Не просто слушай.",
    "home.headline2": "Понимай.",
    "home.subheadline":
      "Aqala переводит произнесённое исламское слово - Коран, проповеди и лекции - в ясный смысл в реальном времени,",
    "home.subheadline2": "С любого языка - на любой язык.",
    "home.quranVerse":
      "Потому что Аллах призывает нас размышлять, а не просто читать.",
    "home.quranRef": "(Коран 47:24)",
    "home.startListening": "Начать слушать",
    "home.helpKeepFree": "Помогите сохранить Aqala бесплатным",
    "home.freeForever": "Бесплатно навсегда",
    "home.shareThoughts": "Поделитесь своими мыслями",
    "footer.instagram": "Инстаграм",
    "footer.donate": "Пожертвовать",
    "footer.reviews": "Отзывы",
    "listen.reference": "Источник",
    "listen.live": "Прямой эфир",
    "listen.listening": "Слушаю...",
    "listen.waitingAudio": "Ожидание аудио…",
    "listen.translateTo": "Перевести на",
    "listen.translationWillAppear": "перевод появится здесь…",
    "listen.returnHome": "Вернуться на главную",
    "modal.title": "Выберите язык",
    "modal.subtitle": "Выберите предпочтительный язык для переводов",
    "modal.continue": "Продолжить",
    "modal.settingsNote": "Вы можете изменить это в любое время в настройках",
    "share.copy": "Копировать",
    "share.email": "Эл. почта",
    "share.copied": "Перевод скопирован!",
    "share.nothingToCopy": "Нет перевода для копирования",
    "share.emailTitle": "Отправить перевод по почте",
    "share.emailSubtitle": "Отправьте запись перевода по электронной почте",
    "share.emailPlaceholder": "Введите адрес электронной почты",
    "share.emailPreviewHint": "Вы получите полный перевод с исходным текстом",
    "share.send": "Отправить",
    "share.sending": "Отправка...",
    "share.cancel": "Отмена",
    "share.emailSent": "Письмо успешно отправлено!",
    "share.emailError": "Не удалось отправить письмо",
    "share.invalidEmail":
      "Пожалуйста, введите действительный адрес электронной почты",
  },
  nl: {
    "home.headline1": "Luister niet alleen.",
    "home.headline2": "Begrijp.",
    "home.subheadline":
      "Aqala vertaalt gesproken islamitische woorden - Koran, preken en lezingen - naar duidelijke, real-time betekenis,",
    "home.subheadline2": "Van elke taal - naar elke taal.",
    "home.quranVerse":
      "Omdat Allah ons oproept om na te denken, niet alleen te reciteren.",
    "home.quranRef": "(Koran 47:24)",
    "home.startListening": "Begin met luisteren",
    "home.helpKeepFree": "Help Aqala gratis te houden",
    "home.freeForever": "Voor altijd gratis",
    "home.shareThoughts": "Deel uw gedachten",
    "footer.instagram": "Instagram",
    "footer.donate": "Doneren",
    "footer.reviews": "Recensies",
    "listen.reference": "Referentie",
    "listen.live": "Live",
    "listen.listening": "Luistert...",
    "listen.waitingAudio": "Wachten op audio…",
    "listen.translateTo": "Vertalen naar",
    "listen.translationWillAppear": "vertaling verschijnt hier…",
    "listen.returnHome": "Terug naar home",
    "modal.title": "Kies uw taal",
    "modal.subtitle": "Selecteer uw voorkeurstaal voor vertalingen",
    "modal.continue": "Doorgaan",
    "modal.settingsNote": "U kunt dit op elk moment wijzigen in instellingen",
    "share.copy": "Kopiëren",
    "share.email": "E-mail",
    "share.copied": "Vertaling gekopieerd!",
    "share.nothingToCopy": "Geen vertaling om te kopiëren",
    "share.emailTitle": "Vertaling e-mailen",
    "share.emailSubtitle": "Stuur uw vertaalrecord via e-mail",
    "share.emailPlaceholder": "Voer uw e-mailadres in",
    "share.emailPreviewHint": "U ontvangt de volledige vertaling met brontekst",
    "share.send": "Verzenden",
    "share.sending": "Verzenden...",
    "share.cancel": "Annuleren",
    "share.emailSent": "E-mail succesvol verzonden!",
    "share.emailError": "E-mail verzenden mislukt",
    "share.invalidEmail": "Voer een geldig e-mailadres in",
  },
  it: {
    "home.headline1": "Non limitarti ad ascoltare.",
    "home.headline2": "Comprendi.",
    "home.subheadline":
      "Aqala traduce la parola islamica parlata - Corano, sermoni e conferenze - in un significato chiaro in tempo reale,",
    "home.subheadline2": "Da qualsiasi lingua - a qualsiasi lingua.",
    "home.quranVerse":
      "Perché Allah ci chiama a riflettere, non solo a recitare.",
    "home.quranRef": "(Corano 47:24)",
    "home.startListening": "Inizia ad ascoltare",
    "home.helpKeepFree": "Aiuta a mantenere Aqala gratuito",
    "home.freeForever": "Gratuito per sempre",
    "home.shareThoughts": "Condividi i tuoi pensieri",
    "footer.instagram": "Instagram",
    "footer.donate": "Dona",
    "footer.reviews": "Recensioni",
    "listen.reference": "Riferimento",
    "listen.live": "Dal vivo",
    "listen.listening": "In ascolto...",
    "listen.waitingAudio": "In attesa dell'audio…",
    "listen.translateTo": "Traduci in",
    "listen.translationWillAppear": "la traduzione apparirà qui…",
    "listen.returnHome": "Torna alla home",
    "modal.title": "Scegli la tua lingua",
    "modal.subtitle": "Seleziona la tua lingua preferita per le traduzioni",
    "modal.continue": "Continua",
    "modal.settingsNote":
      "Puoi cambiare questo in qualsiasi momento nelle impostazioni",
    "share.copy": "Copia",
    "share.email": "Email",
    "share.copied": "Traduzione copiata!",
    "share.nothingToCopy": "Nessuna traduzione da copiare",
    "share.emailTitle": "Invia traduzione via email",
    "share.emailSubtitle": "Invia il tuo record di traduzione via email",
    "share.emailPlaceholder": "Inserisci il tuo indirizzo email",
    "share.emailPreviewHint":
      "Riceverai la traduzione completa con il testo sorgente",
    "share.send": "Invia",
    "share.sending": "Invio in corso...",
    "share.cancel": "Annulla",
    "share.emailSent": "Email inviata con successo!",
    "share.emailError": "Invio email fallito",
    "share.invalidEmail": "Inserisci un indirizzo email valido",
  },
  zh: {
    "home.headline1": "不要只是听。",
    "home.headline2": "要理解。",
    "home.subheadline":
      "Aqala将口语伊斯兰文字——古兰经、布道和讲座——实时翻译成清晰的含义，",
    "home.subheadline2": "从任何语言——到任何语言。",
    "home.quranVerse": "因为真主召唤我们去思考，而不仅仅是诵读。",
    "home.quranRef": "(古兰经 47:24)",
    "home.startListening": "开始收听",
    "home.helpKeepFree": "帮助保持Aqala免费",
    "home.freeForever": "永久免费",
    "home.shareThoughts": "分享您的想法",
    "footer.instagram": "Instagram",
    "footer.donate": "捐赠",
    "footer.reviews": "评论",
    "listen.reference": "参考",
    "listen.live": "实时",
    "listen.listening": "正在收听...",
    "listen.waitingAudio": "等待音频…",
    "listen.translateTo": "翻译成",
    "listen.translationWillAppear": "翻译将显示在这里…",
    "listen.returnHome": "返回首页",
    "modal.title": "选择您的语言",
    "modal.subtitle": "选择您偏好的翻译语言",
    "modal.continue": "继续",
    "modal.settingsNote": "您可以随时在设置中更改",
    "share.copy": "复制",
    "share.email": "邮件",
    "share.copied": "翻译已复制！",
    "share.nothingToCopy": "没有可复制的翻译",
    "share.emailTitle": "发送翻译邮件",
    "share.emailSubtitle": "通过邮件发送您的翻译记录",
    "share.emailPlaceholder": "输入您的邮箱地址",
    "share.emailPreviewHint": "您将收到包含源文本的完整翻译",
    "share.send": "发送",
    "share.sending": "发送中...",
    "share.cancel": "取消",
    "share.emailSent": "邮件发送成功！",
    "share.emailError": "邮件发送失败",
    "share.invalidEmail": "请输入有效的邮箱地址",
  },
  ja: {
    "home.headline1": "聞くだけじゃない。",
    "home.headline2": "理解しよう。",
    "home.subheadline":
      "Aqalaは話されたイスラムの言葉 - コーラン、説教、講義 - を明確なリアルタイムの意味に翻訳します、",
    "home.subheadline2": "どんな言語からでも - どんな言語へでも。",
    "home.quranVerse":
      "アッラーは私たちに暗唱だけでなく、熟考することを求めているから。",
    "home.quranRef": "(コーラン 47:24)",
    "home.startListening": "聴き始める",
    "home.helpKeepFree": "Aqalaを無料で維持するのを助けて",
    "home.freeForever": "永久に無料",
    "home.shareThoughts": "ご意見をお聞かせください",
    "footer.instagram": "インスタグラム",
    "footer.donate": "寄付する",
    "footer.reviews": "レビュー",
    "listen.reference": "参照",
    "listen.live": "ライブ",
    "listen.listening": "聴いています...",
    "listen.waitingAudio": "音声を待っています…",
    "listen.translateTo": "に翻訳",
    "listen.translationWillAppear": "翻訳がここに表示されます…",
    "listen.returnHome": "ホームに戻る",
    "modal.title": "言語を選択",
    "modal.subtitle": "翻訳に使用する言語を選択してください",
    "modal.continue": "続ける",
    "modal.settingsNote": "設定でいつでも変更できます",
    "share.copy": "コピー",
    "share.email": "メール",
    "share.copied": "翻訳をコピーしました！",
    "share.nothingToCopy": "コピーする翻訳がありません",
    "share.emailTitle": "翻訳をメールで送信",
    "share.emailSubtitle": "翻訳記録をメールで送信します",
    "share.emailPlaceholder": "メールアドレスを入力",
    "share.emailPreviewHint": "ソーステキスト付きの完全な翻訳を受け取れます",
    "share.send": "送信",
    "share.sending": "送信中...",
    "share.cancel": "キャンセル",
    "share.emailSent": "メールが正常に送信されました！",
    "share.emailError": "メールの送信に失敗しました",
    "share.invalidEmail": "有効なメールアドレスを入力してください",
  },
  ko: {
    "home.headline1": "듣기만 하지 마세요.",
    "home.headline2": "이해하세요.",
    "home.subheadline":
      "Aqala는 구어 이슬람 단어 - 꾸란, 설교 및 강의 - 를 명확한 실시간 의미로 번역합니다,",
    "home.subheadline2": "어떤 언어에서든 - 어떤 언어로든.",
    "home.quranVerse":
      "알라께서 우리에게 단순히 암송하는 것이 아니라 숙고하라고 부르시기 때문입니다.",
    "home.quranRef": "(꾸란 47:24)",
    "home.startListening": "듣기 시작",
    "home.helpKeepFree": "Aqala를 무료로 유지하는 데 도움을 주세요",
    "home.freeForever": "영원히 무료",
    "home.shareThoughts": "의견을 공유하세요",
    "footer.instagram": "인스타그램",
    "footer.donate": "기부하기",
    "footer.reviews": "리뷰",
    "listen.reference": "참조",
    "listen.live": "라이브",
    "listen.listening": "듣는 중...",
    "listen.waitingAudio": "오디오 대기 중…",
    "listen.translateTo": "로 번역",
    "listen.translationWillAppear": "번역이 여기에 표시됩니다…",
    "listen.returnHome": "홈으로 돌아가기",
    "modal.title": "언어 선택",
    "modal.subtitle": "번역에 사용할 언어를 선택하세요",
    "modal.continue": "계속",
    "modal.settingsNote": "설정에서 언제든지 변경할 수 있습니다",
    "share.copy": "복사",
    "share.email": "이메일",
    "share.copied": "번역이 복사되었습니다!",
    "share.nothingToCopy": "복사할 번역이 없습니다",
    "share.emailTitle": "번역 이메일 보내기",
    "share.emailSubtitle": "번역 기록을 이메일로 보내세요",
    "share.emailPlaceholder": "이메일 주소를 입력하세요",
    "share.emailPreviewHint": "원본 텍스트가 포함된 전체 번역을 받게 됩니다",
    "share.send": "보내기",
    "share.sending": "보내는 중...",
    "share.cancel": "취소",
    "share.emailSent": "이메일이 성공적으로 전송되었습니다!",
    "share.emailError": "이메일 전송 실패",
    "share.invalidEmail": "유효한 이메일 주소를 입력하세요",
  },
  th: {
    "home.headline1": "อย่าเพียงแค่ฟัง",
    "home.headline2": "เข้าใจ",
    "home.subheadline":
      "Aqala แปลคำพูดอิสลาม - อัลกุรอาน, คุตบะห์ และบรรยาย - เป็นความหมายที่ชัดเจนแบบเรียลไทม์,",
    "home.subheadline2": "จากภาษาใดก็ได้ - สู่ภาษาใดก็ได้",
    "home.quranVerse": "เพราะอัลลอฮ์เรียกร้องให้เราไตร่ตรอง ไม่ใช่แค่อ่าน",
    "home.quranRef": "(อัลกุรอาน 47:24)",
    "home.startListening": "เริ่มฟัง",
    "home.helpKeepFree": "ช่วยให้ Aqala ฟรีตลอดไป",
    "home.freeForever": "ฟรีตลอดไป",
    "home.shareThoughts": "แบ่งปันความคิดเห็นของคุณ",
    "footer.instagram": "อินสตาแกรม",
    "footer.donate": "บริจาค",
    "footer.reviews": "รีวิว",
    "listen.reference": "อ้างอิง",
    "listen.live": "สด",
    "listen.listening": "กำลังฟัง...",
    "listen.waitingAudio": "รอเสียง…",
    "listen.translateTo": "แปลเป็น",
    "listen.translationWillAppear": "คำแปลจะปรากฏที่นี่…",
    "listen.returnHome": "กลับหน้าแรก",
    "modal.title": "เลือกภาษาของคุณ",
    "modal.subtitle": "เลือกภาษาที่คุณต้องการสำหรับการแปล",
    "modal.continue": "ดำเนินการต่อ",
    "modal.settingsNote": "คุณสามารถเปลี่ยนได้ตลอดเวลาในการตั้งค่า",
    "share.copy": "คัดลอก",
    "share.email": "อีเมล",
    "share.copied": "คัดลอกคำแปลแล้ว!",
    "share.nothingToCopy": "ไม่มีคำแปลให้คัดลอก",
    "share.emailTitle": "ส่งคำแปลทางอีเมล",
    "share.emailSubtitle": "ส่งบันทึกคำแปลของคุณทางอีเมล",
    "share.emailPlaceholder": "กรอกที่อยู่อีเมลของคุณ",
    "share.emailPreviewHint": "คุณจะได้รับคำแปลเต็มพร้อมข้อความต้นฉบับ",
    "share.send": "ส่ง",
    "share.sending": "กำลังส่ง...",
    "share.cancel": "ยกเลิก",
    "share.emailSent": "ส่งอีเมลสำเร็จ!",
    "share.emailError": "ส่งอีเมลไม่สำเร็จ",
    "share.invalidEmail": "กรุณากรอกที่อยู่อีเมลที่ถูกต้อง",
  },
  vi: {
    "home.headline1": "Đừng chỉ nghe.",
    "home.headline2": "Hãy hiểu.",
    "home.subheadline":
      "Aqala dịch lời nói Hồi giáo - Kinh Qur'an, bài giảng và thuyết trình - thành ý nghĩa rõ ràng theo thời gian thực,",
    "home.subheadline2": "Từ bất kỳ ngôn ngữ nào - sang bất kỳ ngôn ngữ nào.",
    "home.quranVerse":
      "Bởi vì Allah kêu gọi chúng ta suy ngẫm, không chỉ đọc thuộc.",
    "home.quranRef": "(Qur'an 47:24)",
    "home.startListening": "Bắt đầu nghe",
    "home.helpKeepFree": "Giúp Aqala miễn phí mãi mãi",
    "home.freeForever": "Miễn phí mãi mãi",
    "home.shareThoughts": "Chia sẻ suy nghĩ của bạn",
    "footer.instagram": "Instagram",
    "footer.donate": "Quyên góp",
    "footer.reviews": "Đánh giá",
    "listen.reference": "Tham chiếu",
    "listen.live": "Trực tiếp",
    "listen.listening": "Đang nghe...",
    "listen.waitingAudio": "Đang chờ âm thanh…",
    "listen.translateTo": "Dịch sang",
    "listen.translationWillAppear": "bản dịch sẽ xuất hiện ở đây…",
    "listen.returnHome": "Về trang chủ",
    "modal.title": "Chọn ngôn ngữ của bạn",
    "modal.subtitle": "Chọn ngôn ngữ ưa thích cho bản dịch",
    "modal.continue": "Tiếp tục",
    "modal.settingsNote":
      "Bạn có thể thay đổi điều này bất cứ lúc nào trong cài đặt",
    "share.copy": "Sao chép",
    "share.email": "Email",
    "share.copied": "Đã sao chép bản dịch!",
    "share.nothingToCopy": "Không có bản dịch để sao chép",
    "share.emailTitle": "Gửi bản dịch qua email",
    "share.emailSubtitle": "Gửi bản ghi dịch của bạn qua email",
    "share.emailPlaceholder": "Nhập địa chỉ email của bạn",
    "share.emailPreviewHint":
      "Bạn sẽ nhận được bản dịch đầy đủ với văn bản gốc",
    "share.send": "Gửi",
    "share.sending": "Đang gửi...",
    "share.cancel": "Hủy",
    "share.emailSent": "Đã gửi email thành công!",
    "share.emailError": "Gửi email thất bại",
    "share.invalidEmail": "Vui lòng nhập địa chỉ email hợp lệ",
  },
};

// RTL languages
export const RTL_LANGUAGES = ["ar", "ur"];

const STORAGE_KEY = "aqala_preferred_language";
const FIRST_VISIT_KEY = "aqala_first_visit_complete";

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  isFirstVisit: boolean;
  completeFirstVisit: () => void;
  getLanguageOption: (code: string) => LanguageOption | undefined;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("en");
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Load saved language and first visit state
  useEffect(() => {
    setMounted(true);

    // Check for reset query param (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("reset_language") === "true") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FIRST_VISIT_KEY);
      // Remove the query param from URL
      window.history.replaceState({}, "", window.location.pathname);
    }

    const savedLang = localStorage.getItem(STORAGE_KEY);
    const firstVisitComplete = localStorage.getItem(FIRST_VISIT_KEY);

    if (savedLang) {
      setLanguageState(savedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0];
      const supported = LANGUAGE_OPTIONS.find((l) => l.code === browserLang);
      if (supported) {
        setLanguageState(browserLang);
      }
    }

    // Only show modal if this is truly the first visit
    if (!firstVisitComplete) {
      setIsFirstVisit(true);
    }
  }, []);

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const completeFirstVisit = useCallback(() => {
    setIsFirstVisit(false);
    localStorage.setItem(FIRST_VISIT_KEY, "true");
  }, []);

  const getLanguageOption = useCallback((code: string) => {
    return LANGUAGE_OPTIONS.find((l) => l.code === code);
  }, []);

  // Translation function
  const t = useCallback(
    (key: string): string => {
      const translations = TRANSLATIONS[language] || TRANSLATIONS["en"];
      return translations[key] || TRANSLATIONS["en"][key] || key;
    },
    [language]
  );

  // Check if current language is RTL
  const isRTL = RTL_LANGUAGES.includes(language);

  // Prevent flash before hydration
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isFirstVisit,
        completeFirstVisit,
        getLanguageOption,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
