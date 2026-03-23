/**
 * App screenshots (JPEG). Use w-fit frames + max-height / w-auto so portrait shots are not letterboxed
 * in wide boxes. Inner rounded clip rounds the bitmap inside the bezel padding.
 */

/** Hugs portrait screenshots; does not stretch full column width. */
export const mpPhoneShotFrameClass =
  "w-fit max-w-full mx-auto rounded-2xl border border-white/10 bg-[#021a12]/90 p-1.5 shadow-lg shadow-black/25";

/** Clips the actual image to rounded corners inside the frame padding. */
export const mpPhoneShotInnerRoundedClass = "overflow-hidden rounded-xl";

/** Hero / feature row mockups — tall cap, width follows asset aspect. */
export const mpPhoneShotImgFeatureClass =
  "block max-h-[min(58vh,400px)] sm:max-h-[420px] md:max-h-[440px] w-auto h-auto max-w-[min(100vw-2.5rem,300px)] object-contain object-center";

/** Features page screenshot grid — slightly shorter so rows stay even. */
export const mpPhoneShotImgGridClass =
  "block max-h-[232px] sm:max-h-[252px] md:max-h-[268px] lg:max-h-[284px] w-auto h-auto max-w-[min(100vw-2.5rem,252px)] object-contain object-center";
