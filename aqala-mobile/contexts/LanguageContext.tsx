import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

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
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩" },
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

// Full app translations (same as web)
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "home.headline1": "Don't just listen.",
    "home.headline2": "Understand.",
    "home.subheadline": "Aqala translates spoken Islamic word - Qur'an, khutbahs, and lectures - into clear, real-time meaning,",
    "home.subheadline2": "From any language - to any language.",
    "home.quranVerse": "Because Allah calls us to reflect, not merely recite.",
    "home.quranRef": "(Qur'an 47:24)",
    "home.startListening": "Start Listening",
    "home.helpKeepFree": "Help keep Aqala free",
    "home.freeForever": "Free forever",
    "home.shareThoughts": "Share your thoughts",
    "footer.instagram": "Instagram",
    "footer.donate": "Donate",
    "footer.reviews": "Reviews",
    "listen.reference": "Reference",
    "listen.live": "Live",
    "listen.listening": "Listening...",
    "listen.waitingAudio": "Waiting for audio…",
    "listen.translateTo": "Translate to",
    "listen.translationWillAppear": "translation will appear here…",
    "listen.returnHome": "Return home",
    "modal.title": "Choose Your Language",
    "modal.subtitle": "Select your preferred language for translations",
    "modal.continue": "Continue",
    "modal.settingsNote": "You can change this anytime in settings",
    "share.copy": "Copy",
    "share.email": "Email",
    "share.copied": "Translation copied!",
    "share.nothingToCopy": "No translation to copy",
    "share.emailTitle": "Email Translation",
    "share.emailSubtitle": "Send your translation record via email",
    "share.emailPlaceholder": "Enter your email address",
    "share.emailPreviewHint": "You'll receive the full translation with source text",
    "share.send": "Send",
    "share.sending": "Sending...",
    "share.cancel": "Cancel",
    "share.emailSent": "Email sent successfully!",
    "share.emailError": "Failed to send email",
    "share.invalidEmail": "Please enter a valid email address",
    // Navigation
    "nav.home": "Home",
    "nav.rooms": "Rooms",
    "nav.prayer": "Prayer",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
  },
  ar: {
    "home.headline1": "لا تكتفِ بالاستماع.",
    "home.headline2": "افهم.",
    "home.subheadline": "عقالة تترجم الكلمة الإسلامية المنطوقة - القرآن والخطب والمحاضرات - إلى معنى واضح في الوقت الفعلي،",
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
    "nav.home": "الرئيسية",
    "nav.rooms": "الغرف",
    "nav.prayer": "الصلاة",
    "nav.profile": "الملف",
    "nav.settings": "الإعدادات",
  },
  tr: {
    "home.headline1": "Sadece dinleme.",
    "home.headline2": "Anla.",
    "home.subheadline": "Aqala sözlü İslami kelimeleri - Kur'an, hutbeler ve dersler - açık, gerçek zamanlı anlama çevirir,",
    "home.subheadline2": "Herhangi bir dilden - herhangi bir dile.",
    "home.quranVerse": "Çünkü Allah bizi düşünmeye çağırır, sadece okumaya değil.",
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
    "modal.settingsNote": "Bunu istediğiniz zaman ayarlardan değiştirebilirsiniz",
    "share.copy": "Kopyala",
    "share.email": "E-posta",
    "share.copied": "Çeviri kopyalandı!",
    "share.nothingToCopy": "Kopyalanacak çeviri yok",
    "share.emailTitle": "Çeviriyi E-posta ile Gönder",
    "share.emailSubtitle": "Çeviri kaydınızı e-posta ile gönderin",
    "share.emailPlaceholder": "E-posta adresinizi girin",
    "share.emailPreviewHint": "Kaynak metinle birlikte tam çeviriyi alacaksınız",
    "share.send": "Gönder",
    "share.sending": "Gönderiliyor...",
    "share.cancel": "İptal",
    "share.emailSent": "E-posta başarıyla gönderildi!",
    "share.emailError": "E-posta gönderilemedi",
    "share.invalidEmail": "Lütfen geçerli bir e-posta adresi girin",
    "nav.home": "Ana Sayfa",
    "nav.rooms": "Odalar",
    "nav.prayer": "Namaz",
    "nav.profile": "Profil",
    "nav.settings": "Ayarlar",
  },
  // Other languages use English as fallback (same as web behavior)
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
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
        const firstVisitComplete = await AsyncStorage.getItem(FIRST_VISIT_KEY);

        if (savedLang) {
          setLanguageState(savedLang);
        }

        if (!firstVisitComplete) {
          setIsFirstVisit(true);
        }
      } catch (e) {
        console.error("Failed to load language preferences:", e);
      }
    };

    loadPreferences();
  }, []);

  const setLanguage = useCallback(async (code: string) => {
    setLanguageState(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      console.error("Failed to save language:", e);
    }

    // Handle RTL
    const shouldBeRTL = RTL_LANGUAGES.includes(code);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const completeFirstVisit = useCallback(async () => {
    setIsFirstVisit(false);
    try {
      await AsyncStorage.setItem(FIRST_VISIT_KEY, "true");
    } catch (e) {
      console.error("Failed to save first visit:", e);
    }
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

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isFirstVisit, completeFirstVisit, getLanguageOption, t, isRTL }}
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
