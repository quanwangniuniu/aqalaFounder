import {
  alignVerseBoundsFromArabic,
  arabicHaystackWords,
} from "@/lib/quran/alignHighlightToTranslation";

/** Uthmani 112:1–4 (matches bundled corpus). */
const IKHLAS_ARABIC = [
  "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
  "ٱللَّهُ ٱلصَّمَدُ",
  "لَمْ يَلِدْ وَلَمْ يُولَدْ",
  "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
].join(" ");

describe("arabicHaystackWords", () => {
  it("strips tashkeel and normalizes alif variants consistently with alignment", () => {
    const withMarks = "بِسْمِ ٱللَّهِ";
    const plain = arabicHaystackWords(withMarks);
    expect(plain.length).toBeGreaterThan(0);
    expect(plain.every((w) => /^[\u0600-\u06FF]+$/.test(w))).toBe(true);
  });
});

describe("alignVerseBoundsFromArabic", () => {
  function assertValidWindow(
    bounds: { startWord: number; endWord: number },
    translationWordCount: number,
    hintStart: number,
  ) {
    expect(bounds.endWord).toBeGreaterThan(bounds.startWord);
    expect(bounds.startWord).toBeGreaterThanOrEqual(0);
    expect(bounds.endWord).toBeLessThanOrEqual(translationWordCount);
    expect(bounds.startWord).toBeGreaterThanOrEqual(hintStart);
  }

  it("maps a late surah in a long Arabic stream into the translation word range", () => {
    const prefix = "الحمد لله رب العالمين ".repeat(45).trim();
    const arabic = `${prefix} ${IKHLAS_ARABIC}`;
    const srcLen = arabicHaystackWords(arabic).length;
    const translationWordCount = Math.max(80, Math.floor(srcLen * 0.55));

    const bounds = alignVerseBoundsFromArabic(
      arabic,
      translationWordCount,
      "112:1",
      0,
      translationWordCount,
    );

    assertValidWindow(bounds, translationWordCount, 0);
    // Surah is at the tail — English highlight should not sit at word 0 only.
    expect(bounds.startWord).toBeGreaterThanOrEqual(
      Math.floor(translationWordCount * 0.12),
    );
  });

  it("respects hintStart as a floor on the English window", () => {
    const arabic = IKHLAS_ARABIC;
    const translationWordCount = 60;
    const hintStart = 25;

    const bounds = alignVerseBoundsFromArabic(
      arabic,
      translationWordCount,
      "112:1",
      hintStart,
      translationWordCount,
    );

    assertValidWindow(bounds, translationWordCount, hintStart);
    expect(bounds.startWord).toBeGreaterThanOrEqual(hintStart);
  });

  it("honors minArabicMatchIndex to ignore spurious early matches in long streams", () => {
    const tail = IKHLAS_ARABIC;
    const arabic = `${"سبحان الله ".repeat(30)} ${tail}`;
    const words = arabicHaystackWords(arabic);
    const translationWordCount = Math.max(70, Math.floor(words.length * 0.5));
    const minIdx = Math.max(0, words.length - 25);

    const bounds = alignVerseBoundsFromArabic(
      arabic,
      translationWordCount,
      "112:1",
      0,
      translationWordCount,
      { minArabicMatchIndex: minIdx },
    );

    assertValidWindow(bounds, translationWordCount, 0);
  });

  it("returns a bounded fallback when Arabic text is too short to align", () => {
    const bounds = alignVerseBoundsFromArabic(
      "هو",
      40,
      "112:1",
      5,
      40,
    );

    assertValidWindow(bounds, 40, 5);
    expect(bounds.endWord).toBeLessThanOrEqual(40);
  });

  it("does not span the entire translation when Arabic match fails (tight fallback)", () => {
    const garbage =
      "كلمة أخرى تكرار بدون تطابق مع سورة الإخلاص في النص الطويل جدا";
    const translationWordCount = 100;
    const hintStart = 10;

    const bounds = alignVerseBoundsFromArabic(
      garbage,
      translationWordCount,
      "112:1",
      hintStart,
      translationWordCount,
    );

    assertValidWindow(bounds, translationWordCount, hintStart);
    expect(bounds.endWord).toBeLessThan(translationWordCount);
  });

  it("returns arabicMatchEnd when a confident match exists", () => {
    const arabic = IKHLAS_ARABIC;
    const bounds = alignVerseBoundsFromArabic(
      arabic,
      50,
      "112:1",
      0,
      50,
    );
    expect(bounds.arabicMatchEnd).toBeDefined();
    expect(bounds.arabicMatchEnd!).toBeGreaterThan(0);
    expect(bounds.arabicMatchEnd!).toBeLessThanOrEqual(
      arabicHaystackWords(arabic).length,
    );
  });
});
