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
    // ── Home ──
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
    "home.prayerTimes": "Prayer Times",
    "home.viewSchedule": "View schedule",
    "home.qiblaFinder": "Qibla Finder",
    "home.findDirection": "Find Direction",
    "home.compassGuide": "Compass guide",
    "home.mosques": "Mosques",
    "home.joinRoom": "Join a Room",
    "home.sharedListening": "Shared listening",
    "home.goPremium": "Go Premium",
    "home.removeAds": "Remove Ads",
    "home.oneTime": "$15 one-time",
    "home.support": "Support",
    "home.donate": "Donate",
    "home.thankYouPremium": "Thank you for supporting Aqala ✨",
    "home.signIn": "Sign In",
    "home.premium": "Premium ✨",

    // ── Footer ──
    "footer.instagram": "Instagram",
    "footer.donate": "Donate",
    "footer.reviews": "Reviews",

    // ── Listen ──
    "listen.reference": "Reference",
    "listen.live": "Live",
    "listen.listening": "Listening...",
    "listen.waitingAudio": "Waiting for audio…",
    "listen.translateTo": "Translate to",
    "listen.translationWillAppear": "translation will appear here…",
    "listen.returnHome": "Return home",

    // ── Language Modal ──
    "modal.title": "Choose Your Language",
    "modal.subtitle": "Select your preferred language for translations",
    "modal.continue": "Continue",
    "modal.settingsNote": "You can change this anytime in settings",

    // ── Share ──
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

    // ── Navigation / Tab bar ──
    "nav.home": "Home",
    "nav.translate": "Translate",
    "nav.rooms": "Rooms",
    "nav.prayer": "Prayer",
    "nav.profile": "Profile",
    "nav.settings": "Settings",

    // ── Settings ──
    "settings.title": "Account Settings",
    "settings.signInRequired": "Sign in required",
    "settings.signInToAccess": "Please sign in to access settings",
    "settings.profile": "Profile",
    "settings.premiumMember": "Premium Member",
    "settings.freePlan": "Free Plan",
    "settings.language": "Language",
    "settings.wallpaper": "Wallpaper",
    "settings.wallpaperHint": "Choose a wallpaper for your home screen",
    "settings.plan": "Plan",
    "settings.premiumActive": "Premium Active",
    "settings.adFreeEnabled": "Ad-free experience enabled",
    "settings.manageSubscription": "Manage Subscription",
    "settings.upgradeToRemoveAds": "Upgrade to remove ads",
    "settings.goAdFree": "Go Ad-Free • $15 one-time",
    "settings.account": "Account",
    "settings.signOut": "Sign Out",
    "settings.signOutDesc": "Log out of your account",

    // ── Prayer ──
    "prayer.title": "Prayer Times",
    "prayer.qibla": "Qibla",
    "prayer.nextPrayer": "Next Prayer",
    "prayer.in": "in",
    "prayer.todaysPrayers": "Today's Prayers",
    "prayer.gettingLocation": "Getting your location...",
    "prayer.allowLocation": "Please allow location access",
    "prayer.locationRequired": "Location Required",
    "prayer.retryLocation": "Retry Location",
    "prayer.retryPrayerTimes": "Retry Prayer Times",
    "prayer.updateLocation": "Update location",
    "prayer.calculationMethod": "Calculation Method",
    "prayer.change": "Change",
    "prayer.hanafiSchool": "Hanafi School",
    "prayer.standard": "Standard",

    // ── Rooms ──
    "rooms.createRoom": "Create Room",
    "rooms.liveNow": "live now",
    "rooms.roomLiveNow": "room live now",
    "rooms.roomsLiveNow": "rooms live now",
    "rooms.title": "Live Translation Rooms",
    "rooms.subtitle": "Join official partner mosques or community-hosted sessions for real-time Khutbah translation",
    "rooms.partnerBroadcasts": "Partner Broadcasts",
    "rooms.communitySessions": "Community Sessions",
    "rooms.officialPartners": "Official Partners",
    "rooms.verifiedBroadcasts": "Verified mosque broadcasts",
    "rooms.userHosted": "User-hosted live rooms",
    "rooms.noLive": "No live broadcasts right now",
    "rooms.checkBack": "Check back later or start your own session!",
    "rooms.loadingRooms": "Loading rooms...",
    "rooms.live": "LIVE",
    "rooms.viewer": "viewer",
    "rooms.viewers": "viewers",
    "rooms.by": "by",

    // ── Profile ──
    "profile.signInToView": "Sign in to view your profile",
    "profile.signInDesc": "Create an account or sign in to access your profile, history, and more",
    "profile.editProfile": "Edit Profile",
    "profile.messages": "Messages",
    "profile.rooms": "Rooms",
    "profile.followers": "Followers",
    "profile.following": "Following",
    "profile.admin": "Admin",
    "profile.officialPartner": "Official Partner",
    "profile.proMember": "Pro Member",
    "profile.noActivity": "No room activity yet",
    "profile.noFollowers": "No followers yet",
    "profile.notFollowing": "Not following anyone yet",
    "profile.noSuggestions": "No suggestions yet",
    "profile.suggestionsHint": "Follow more people to get personalized suggestions",
    "profile.peopleYouMayKnow": "People you may know",
  },
  ar: {
    // ── Home ──
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
    "home.prayerTimes": "أوقات الصلاة",
    "home.viewSchedule": "عرض الجدول",
    "home.qiblaFinder": "محدد القبلة",
    "home.findDirection": "ابحث عن الاتجاه",
    "home.compassGuide": "دليل البوصلة",
    "home.mosques": "المساجد",
    "home.joinRoom": "انضم إلى غرفة",
    "home.sharedListening": "استماع مشترك",
    "home.goPremium": "اشترك بريميوم",
    "home.removeAds": "أزل الإعلانات",
    "home.oneTime": "١٥$ دفعة واحدة",
    "home.support": "ادعمنا",
    "home.donate": "تبرع",
    "home.thankYouPremium": "شكراً لدعمك عقالة ✨",
    "home.signIn": "تسجيل الدخول",
    "home.premium": "بريميوم ✨",

    // ── Footer ──
    "footer.instagram": "إنستغرام",
    "footer.donate": "تبرع",
    "footer.reviews": "التقييمات",

    // ── Listen ──
    "listen.reference": "المصدر",
    "listen.live": "مباشر",
    "listen.listening": "جارٍ الاستماع...",
    "listen.waitingAudio": "في انتظار الصوت…",
    "listen.translateTo": "ترجم إلى",
    "listen.translationWillAppear": "ستظهر الترجمة هنا…",
    "listen.returnHome": "العودة للرئيسية",

    // ── Language Modal ──
    "modal.title": "اختر لغتك",
    "modal.subtitle": "حدد لغتك المفضلة للترجمة",
    "modal.continue": "متابعة",
    "modal.settingsNote": "يمكنك تغيير هذا في أي وقت من الإعدادات",

    // ── Share ──
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

    // ── Navigation / Tab bar ──
    "nav.home": "الرئيسية",
    "nav.translate": "ترجمة",
    "nav.rooms": "الغرف",
    "nav.prayer": "الصلاة",
    "nav.profile": "الملف",
    "nav.settings": "الإعدادات",

    // ── Settings ──
    "settings.title": "إعدادات الحساب",
    "settings.signInRequired": "تسجيل الدخول مطلوب",
    "settings.signInToAccess": "يرجى تسجيل الدخول للوصول إلى الإعدادات",
    "settings.profile": "الملف الشخصي",
    "settings.premiumMember": "عضو بريميوم",
    "settings.freePlan": "الخطة المجانية",
    "settings.language": "اللغة",
    "settings.wallpaper": "الخلفية",
    "settings.wallpaperHint": "اختر خلفية لشاشتك الرئيسية",
    "settings.plan": "الخطة",
    "settings.premiumActive": "بريميوم مفعّل",
    "settings.adFreeEnabled": "تجربة بدون إعلانات مفعّلة",
    "settings.manageSubscription": "إدارة الاشتراك",
    "settings.upgradeToRemoveAds": "ترقّ لإزالة الإعلانات",
    "settings.goAdFree": "بدون إعلانات • ١٥$ دفعة واحدة",
    "settings.account": "الحساب",
    "settings.signOut": "تسجيل الخروج",
    "settings.signOutDesc": "الخروج من حسابك",

    // ── Prayer ──
    "prayer.title": "أوقات الصلاة",
    "prayer.qibla": "القبلة",
    "prayer.nextPrayer": "الصلاة التالية",
    "prayer.in": "في",
    "prayer.todaysPrayers": "صلوات اليوم",
    "prayer.gettingLocation": "جارٍ تحديد موقعك...",
    "prayer.allowLocation": "يرجى السماح بالوصول إلى الموقع",
    "prayer.locationRequired": "الموقع مطلوب",
    "prayer.retryLocation": "إعادة تحديد الموقع",
    "prayer.retryPrayerTimes": "إعادة محاولة",
    "prayer.updateLocation": "تحديث الموقع",
    "prayer.calculationMethod": "طريقة الحساب",
    "prayer.change": "تغيير",
    "prayer.hanafiSchool": "المذهب الحنفي",
    "prayer.standard": "قياسي",

    // ── Rooms ──
    "rooms.createRoom": "إنشاء غرفة",
    "rooms.liveNow": "مباشر الآن",
    "rooms.roomLiveNow": "غرفة مباشرة الآن",
    "rooms.roomsLiveNow": "غرف مباشرة الآن",
    "rooms.title": "غرف الترجمة المباشرة",
    "rooms.subtitle": "انضم إلى المساجد الشريكة أو جلسات المجتمع للترجمة الفورية للخطب",
    "rooms.partnerBroadcasts": "بث الشركاء",
    "rooms.communitySessions": "جلسات المجتمع",
    "rooms.officialPartners": "الشركاء الرسميون",
    "rooms.verifiedBroadcasts": "بث مساجد موثقة",
    "rooms.userHosted": "غرف يستضيفها المستخدمون",
    "rooms.noLive": "لا توجد بثوث مباشرة حالياً",
    "rooms.checkBack": "عُد لاحقاً أو ابدأ جلستك الخاصة!",
    "rooms.loadingRooms": "جارٍ تحميل الغرف...",
    "rooms.live": "مباشر",
    "rooms.viewer": "مشاهد",
    "rooms.viewers": "مشاهدين",
    "rooms.by": "بواسطة",

    // ── Profile ──
    "profile.signInToView": "سجّل الدخول لعرض ملفك",
    "profile.signInDesc": "أنشئ حساباً أو سجّل الدخول للوصول إلى ملفك وسجلك والمزيد",
    "profile.editProfile": "تعديل الملف",
    "profile.messages": "الرسائل",
    "profile.rooms": "الغرف",
    "profile.followers": "المتابعون",
    "profile.following": "المتابَعون",
    "profile.admin": "مشرف",
    "profile.officialPartner": "شريك رسمي",
    "profile.proMember": "عضو مميز",
    "profile.noActivity": "لا يوجد نشاط بعد",
    "profile.noFollowers": "لا يوجد متابعون بعد",
    "profile.notFollowing": "لا تتابع أحداً بعد",
    "profile.noSuggestions": "لا توجد اقتراحات بعد",
    "profile.suggestionsHint": "تابع المزيد للحصول على اقتراحات مخصصة",
    "profile.peopleYouMayKnow": "أشخاص قد تعرفهم",
  },
  tr: {
    // ── Home ──
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
    "home.prayerTimes": "Namaz Vakitleri",
    "home.viewSchedule": "Takvimi gör",
    "home.qiblaFinder": "Kıble Bulucu",
    "home.findDirection": "Yönü Bul",
    "home.compassGuide": "Pusula rehberi",
    "home.mosques": "Camiler",
    "home.joinRoom": "Odaya Katıl",
    "home.sharedListening": "Paylaşımlı dinleme",
    "home.goPremium": "Premium'a Geç",
    "home.removeAds": "Reklamları Kaldır",
    "home.oneTime": "15$ tek seferlik",
    "home.support": "Destek",
    "home.donate": "Bağış Yap",
    "home.thankYouPremium": "Aqala'yı desteklediğin için teşekkürler ✨",
    "home.signIn": "Giriş Yap",
    "home.premium": "Premium ✨",

    // ── Footer ──
    "footer.instagram": "Instagram",
    "footer.donate": "Bağış Yap",
    "footer.reviews": "Yorumlar",

    // ── Listen ──
    "listen.reference": "Kaynak",
    "listen.live": "Canlı",
    "listen.listening": "Dinliyor...",
    "listen.waitingAudio": "Ses bekleniyor…",
    "listen.translateTo": "Çevir",
    "listen.translationWillAppear": "çeviri burada görünecek…",
    "listen.returnHome": "Ana sayfaya dön",

    // ── Language Modal ──
    "modal.title": "Dilinizi Seçin",
    "modal.subtitle": "Çeviriler için tercih ettiğiniz dili seçin",
    "modal.continue": "Devam Et",
    "modal.settingsNote": "Bunu istediğiniz zaman ayarlardan değiştirebilirsiniz",

    // ── Share ──
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

    // ── Navigation / Tab bar ──
    "nav.home": "Ana Sayfa",
    "nav.translate": "Çeviri",
    "nav.rooms": "Odalar",
    "nav.prayer": "Namaz",
    "nav.profile": "Profil",
    "nav.settings": "Ayarlar",

    // ── Settings ──
    "settings.title": "Hesap Ayarları",
    "settings.signInRequired": "Giriş yapılması gerekiyor",
    "settings.signInToAccess": "Ayarlara erişmek için lütfen giriş yapın",
    "settings.profile": "Profil",
    "settings.premiumMember": "Premium Üye",
    "settings.freePlan": "Ücretsiz Plan",
    "settings.language": "Dil",
    "settings.wallpaper": "Duvar Kağıdı",
    "settings.wallpaperHint": "Ana ekranınız için bir duvar kağıdı seçin",
    "settings.plan": "Plan",
    "settings.premiumActive": "Premium Aktif",
    "settings.adFreeEnabled": "Reklamsız deneyim etkin",
    "settings.manageSubscription": "Aboneliği Yönet",
    "settings.upgradeToRemoveAds": "Reklamları kaldırmak için yükseltin",
    "settings.goAdFree": "Reklamsız • 15$ tek seferlik",
    "settings.account": "Hesap",
    "settings.signOut": "Çıkış Yap",
    "settings.signOutDesc": "Hesabınızdan çıkış yapın",

    // ── Prayer ──
    "prayer.title": "Namaz Vakitleri",
    "prayer.qibla": "Kıble",
    "prayer.nextPrayer": "Sonraki Namaz",
    "prayer.in": "kalan",
    "prayer.todaysPrayers": "Bugünün Namazları",
    "prayer.gettingLocation": "Konumunuz alınıyor...",
    "prayer.allowLocation": "Lütfen konum erişimine izin verin",
    "prayer.locationRequired": "Konum Gerekli",
    "prayer.retryLocation": "Konumu Yeniden Dene",
    "prayer.retryPrayerTimes": "Namaz Vakitlerini Yeniden Dene",
    "prayer.updateLocation": "Konumu güncelle",
    "prayer.calculationMethod": "Hesaplama Yöntemi",
    "prayer.change": "Değiştir",
    "prayer.hanafiSchool": "Hanefi Mezhebi",
    "prayer.standard": "Standart",

    // ── Rooms ──
    "rooms.createRoom": "Oda Oluştur",
    "rooms.liveNow": "şu an canlı",
    "rooms.roomLiveNow": "oda şu an canlı",
    "rooms.roomsLiveNow": "oda şu an canlı",
    "rooms.title": "Canlı Çeviri Odaları",
    "rooms.subtitle": "Hutbe çevirisi için resmi ortak camilere veya topluluk oturumlarına katılın",
    "rooms.partnerBroadcasts": "Ortak Yayınları",
    "rooms.communitySessions": "Topluluk Oturumları",
    "rooms.officialPartners": "Resmi Ortaklar",
    "rooms.verifiedBroadcasts": "Doğrulanmış cami yayınları",
    "rooms.userHosted": "Kullanıcı tarafından barındırılan odalar",
    "rooms.noLive": "Şu an canlı yayın yok",
    "rooms.checkBack": "Daha sonra tekrar deneyin veya kendi oturumunuzu başlatın!",
    "rooms.loadingRooms": "Odalar yükleniyor...",
    "rooms.live": "CANLI",
    "rooms.viewer": "izleyici",
    "rooms.viewers": "izleyici",
    "rooms.by": "tarafından",

    // ── Profile ──
    "profile.signInToView": "Profilinizi görmek için giriş yapın",
    "profile.signInDesc": "Profilinize, geçmişinize ve daha fazlasına erişmek için hesap oluşturun veya giriş yapın",
    "profile.editProfile": "Profili Düzenle",
    "profile.messages": "Mesajlar",
    "profile.rooms": "Odalar",
    "profile.followers": "Takipçiler",
    "profile.following": "Takip Edilen",
    "profile.admin": "Yönetici",
    "profile.officialPartner": "Resmi Ortak",
    "profile.proMember": "Pro Üye",
    "profile.noActivity": "Henüz oda etkinliği yok",
    "profile.noFollowers": "Henüz takipçi yok",
    "profile.notFollowing": "Henüz kimseyi takip etmiyorsunuz",
    "profile.noSuggestions": "Henüz öneri yok",
    "profile.suggestionsHint": "Kişiselleştirilmiş öneriler almak için daha fazla kişiyi takip edin",
    "profile.peopleYouMayKnow": "Tanıyor olabileceğiniz kişiler",
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
  const [mounted, setMounted] = useState(false);

  // Load saved language and first visit state from AsyncStorage
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
      } finally {
        setMounted(true);
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

  // Prevent rendering before preferences are loaded
  if (!mounted) {
    return null;
  }

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
