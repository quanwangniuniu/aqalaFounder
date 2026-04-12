import { findVerseReference, normalize } from "@/lib/quran/findVerse";

// ── Helpers ──────────────────────────────────────────────────────────

function expectVerse(
  result: Awaited<ReturnType<typeof findVerseReference>>,
  opts: {
    surah?: RegExp | string;
    verseKey?: string | RegExp;
    maxEndVerse?: number;
    minConfidence?: number;
  },
) {
  expect(result).not.toBeNull();
  if (opts.surah) {
    const re = typeof opts.surah === "string" ? new RegExp(opts.surah) : opts.surah;
    expect(result!.reference).toMatch(re);
  }
  if (opts.verseKey) {
    if (typeof opts.verseKey === "string") {
      expect(result!.verseKey).toBe(opts.verseKey);
    } else {
      expect(result!.verseKey).toMatch(opts.verseKey);
    }
  }
  if (opts.maxEndVerse != null) {
    const end = parseInt(result!.verseKey.split(":")[1].split("-").pop()!, 10);
    expect(end).toBeLessThanOrEqual(opts.maxEndVerse);
  }
  if (opts.minConfidence != null) {
    expect(result!.confidence).toBeGreaterThanOrEqual(opts.minConfidence);
  }
}

// ── Short surahs (should detect in full) ─────────────────────────────

describe("short surah detection", () => {
  it("Al-Ikhlas 112 (4 verses)", async () => {
    const stt = "قل هو الله أحد الله الصمد لم يلد ولم يولد ولم يكن له كفوا أحد";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Ikhlas/, verseKey: /^112:/, minConfidence: 0.5 });
  });

  it("Al-Falaq 113 (5 verses)", async () => {
    const stt =
      "قل أعوذ برب الفلق من شر ما خلق ومن شر غاسق إذا وقب ومن شر النفاثات في العقد ومن شر حاسد إذا حسد";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Falaq/, verseKey: /^113:/ });
  });

  it("An-Nas 114 (6 verses)", async () => {
    const stt =
      "قل أعوذ برب الناس ملك الناس إله الناس من شر الوسواس الخناس الذي يوسوس في صدور الناس من الجنة والناس";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /An-Nas/, verseKey: /^114:/ });
  });

  it("Al-'Asr 103 (3 verses)", async () => {
    const stt =
      "والعصر إن الإنسان لفي خسر إلا الذين آمنوا وعملوا الصالحات وتواصوا بالحق وتواصوا بالصبر";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-'Asr/, verseKey: /^103:/ });
  });

  it("Al-Kawthar 108 (3 verses)", async () => {
    const stt = "إنا أعطيناك الكوثر فصل لربك وانحر إن شانئك هو الأبتر";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Kawthar/, verseKey: /^108:/ });
  });

  it("Al-Fatihah 1 (7 verses)", async () => {
    const stt =
      "بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Fatihah/, verseKey: /^1:/ });
  });

  it("Al-Kafirun 109 (6 verses)", async () => {
    const stt =
      "قل يا أيها الكافرون لا أعبد ما تعبدون ولا أنتم عابدون ما أعبد ولا أنا عابد ما عبدتم ولا أنتم عابدون ما أعبد لكم دينكم ولي دين";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Kafirun/, verseKey: /^109:/ });
  });
});

// ── Long chapters — partial recitation (2–5 verses) ─────────────────

describe("long chapter partial recitation (2-5 verses)", () => {
  it("Al-Baqarah 2:1-5 (opening)", async () => {
    const stt =
      "الم ذلك الكتاب لا ريب فيه هدى للمتقين الذين يؤمنون بالغيب ويقيمون الصلاة ومما رزقناهم ينفقون والذين يؤمنون بما أنزل إليك وما أنزل من قبلك وبالآخرة هم يوقنون أولئك على هدى من ربهم وأولئك هم المفلحون";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Baqarah/, maxEndVerse: 10, minConfidence: 0.25 });
  });

  it("Ayatul Kursi — Al-Baqarah 2:255 (single long verse)", async () => {
    const stt =
      "الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم له ما في السماوات وما في الأرض من ذا الذي يشفع عنده إلا بإذنه يعلم ما بين أيديهم وما خلفهم";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Baqarah/, verseKey: "2:255" });
  });

  it("Ya-Sin 36:1-5 (opening)", async () => {
    const stt =
      "يس والقرآن الحكيم إنك لمن المرسلين على صراط مستقيم تنزيل العزيز الرحيم";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Ya-Sin/, maxEndVerse: 10 });
  });

  it("Ar-Rahman 55:1-4 (opening)", async () => {
    const stt = "الرحمن علم القرآن خلق الإنسان علمه البيان";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Ar-Rahman/, maxEndVerse: 10 });
  });

  it("Al-Mulk 67:1-3 (opening)", async () => {
    const stt =
      "تبارك الذي بيده الملك وهو على كل شيء قدير الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور الذي خلق سبع سماوات طباقا";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Mulk/, maxEndVerse: 8 });
  });

  it("Al-Kahf 18:1-4 (opening — legitimate recitation)", async () => {
    const stt =
      "الحمد لله الذي أنزل على عبده الكتاب ولم يجعل له عوجا قيما لينذر بأسا شديدا من لدنه ويبشر المؤمنين الذين يعملون الصالحات أن لهم أجرا حسنا";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Kahf/, maxEndVerse: 8 });
  });

  it("Al-Hashr 59:22-24 (last 3 verses)", async () => {
    const stt =
      "هو الله الذي لا إله إلا هو عالم الغيب والشهادة هو الرحمن الرحيم هو الله الذي لا إله إلا هو الملك القدوس السلام المؤمن المهيمن العزيز الجبار المتكبر سبحان الله عما يشركون هو الله الخالق البارئ المصور له الأسماء الحسنى";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Hashr/ });
    const end = parseInt(r!.verseKey.split(":")[1].split("-").pop()!, 10);
    expect(end).toBeGreaterThanOrEqual(22);
  });

  it("Al-Baqarah 2:285-286 (last 2 verses)", async () => {
    const stt =
      "آمن الرسول بما أنزل إليه من ربه والمؤمنون كل آمن بالله وملائكته وكتبه ورسله لا نفرق بين أحد من رسله وقالوا سمعنا وأطعنا غفرانك ربنا وإليك المصير";
    const r = await findVerseReference(stt);
    expectVerse(r, { surah: /Al-Baqarah/ });
    const end = parseInt(r!.verseKey.split(":")[1].split("-").pop()!, 10);
    expect(end).toBeGreaterThanOrEqual(285);
  });
});

// ── False positive rejection ─────────────────────────────────────────

describe("false positive rejection", () => {
  it("rejects khutbah speech about prayer/remembrance (was falsely matching Al-Kahf)", async () => {
    // This is the exact scenario from the bug: a khateeb speaking about prayer
    // and remembrance using common Islamic vocabulary. Words like صلاه, ذكرنا,
    // هواه, فرطا appear in Al-Kahf 18:28 but aren't actual recitation.
    const khutbahSpeech =
      "في صلاته ولا تطع من اغفلنا قلبه عن ذكرنا ترك الصلاه الصلاه هي افضل الذكر واتبع هواه وكان امره فرطا وقل الذين امنوا فيعلمون ان الحق";
    const r = await findVerseReference(khutbahSpeech);
    if (r) {
      // If it detects anything, it must NOT be Al-Kahf with low confidence
      if (r.reference.includes("Al-Kahf")) {
        expect(r.confidence).toBeGreaterThanOrEqual(0.5);
      }
    }
  });

  it("rejects generic du'a / praise speech", async () => {
    const stt =
      "الحمد لله نحمده ونستعينه ونستغفره ونعوذ بالله من شرور أنفسنا ومن سيئات أعمالنا من يهده الله فلا مضل له ومن يضلل فلا هادي له";
    const r = await findVerseReference(stt);
    if (r) {
      expect(r.confidence).toBeLessThan(0.5);
    }
  });

  it("rejects hadith text that shares words with Quran", async () => {
    const stt =
      "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله";
    const r = await findVerseReference(stt);
    // Should be null or very low confidence — this is hadith, not Quran
    if (r) {
      expect(r.confidence).toBeLessThan(0.4);
    }
  });

  it("rejects very short non-Quran input", async () => {
    const stt = "بسم الله";
    const r = await findVerseReference(stt);
    expect(r).toBeNull();
  });
});

// ── Mixed: khutbah then real recitation ──────────────────────────────

describe("khutbah then real recitation", () => {
  it("detects Al-Baqarah after khutbah preamble", async () => {
    const khutbah =
      "أيها الناس اتقوا الله حق تقاته ولا تموتن إلا وأنتم مسلمون";
    const baqarah =
      "الم ذلك الكتاب لا ريب فيه هدى للمتقين الذين يؤمنون بالغيب ويقيمون الصلاة";
    const r = await findVerseReference(`${khutbah} ${baqarah}`);
    expectVerse(r, { surah: /Al-Baqarah/ });
  });

  it("detects Al-Ikhlas after khutbah noise", async () => {
    const khutbah =
      "أما بعد فإن أصدق الحديث كتاب الله وخير الهدي هدي محمد صلى الله عليه وسلم";
    const ikhlas = "قل هو الله أحد الله الصمد لم يلد ولم يولد ولم يكن له كفوا أحد";
    const r = await findVerseReference(`${khutbah} ${ikhlas}`);
    expectVerse(r, { surah: /Al-Ikhlas/ });
  });

  it("detects Ya-Sin after extended khutbah", async () => {
    const khutbah =
      "أيها المسلمون إن الله تعالى أمرنا بالتقوى والإحسان في كل أعمالنا وأن نتوب إليه ونستغفره في كل حين أقول قولي هذا";
    const yasin =
      "يس والقرآن الحكيم إنك لمن المرسلين على صراط مستقيم تنزيل العزيز الرحيم";
    const r = await findVerseReference(`${khutbah} ${yasin}`);
    expectVerse(r, { surah: /Ya-Sin/ });
  });
});

// ── normalize unit tests ─────────────────────────────────────────────

describe("normalize", () => {
  it("strips Uthmani diacritics and unifies alef variants", () => {
    const words = normalize("بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ");
    expect(words).toEqual(
      expect.arrayContaining(["بسم", "الله", "الرحمان", "الرحيم"]),
    );
  });

  it("normalizes taa marbutah to haa", () => {
    const words = normalize("الصلاة والزكاة");
    expect(words[0]).toBe("الصلاه");
    expect(words[1]).toBe("والزكاه");
  });

  it("handles empty and whitespace-only input", () => {
    expect(normalize("")).toEqual([]);
    expect(normalize("   ")).toEqual([]);
  });
});
