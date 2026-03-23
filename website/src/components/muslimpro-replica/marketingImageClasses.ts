/**
 * App screenshots (JPEG). Use w-fit frames + max-height / w-auto so portrait shots are not letterboxed
 * in wide boxes. Inner rounded clip rounds the bitmap inside the bezel padding.
 *
 * `unoptimized`: serve files straight from /public so next/image never fails on these assets in prod.
 */
export const mpAqalaAboutImageProps = { unoptimized: true as const };

/** Hugs portrait screenshots; does not stretch full column width. */
export const mpPhoneShotFrameClass =
  "w-fit max-w-full mx-auto rounded-2xl border border-white/10 bg-[#021a12]/90 p-1.5 shadow-lg shadow-black/25";

/** Clips the actual image to rounded corners inside the frame padding. */
export const mpPhoneShotInnerRoundedClass = "overflow-hidden rounded-xl";

/** Hero / feature row mockups — tall cap, width follows asset aspect (avoid min() in arbitrary values for older engines). */
export const mpPhoneShotImgFeatureClass =
  "block h-auto w-auto max-h-[400px] sm:max-h-[420px] md:max-h-[440px] max-w-[280px] sm:max-w-[300px] object-contain object-center";

/** Features page screenshot grid — slightly shorter so rows stay even. */
export const mpPhoneShotImgGridClass =
  "block h-auto w-auto max-h-[232px] sm:max-h-[252px] md:max-h-[268px] lg:max-h-[284px] max-w-[240px] sm:max-w-[252px] object-contain object-center";
