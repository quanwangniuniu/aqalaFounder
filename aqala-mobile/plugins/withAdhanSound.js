/**
 * Expo Config Plugin – bundles Azan.mp3 into the native builds
 * so it can be used as a custom notification sound.
 *
 * iOS  → copies to the Xcode project and adds to "Copy Bundle Resources"
 * Android → copies to res/raw/azan.mp3 (must be lowercase)
 */
const {
  withXcodeProject,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SOUND_FILENAME = "azan.mp3";
const ANDROID_SOUND = "azan.mp3"; // Android raw resources must be lowercase

function withAdhanSound(config) {
  // ── iOS ──────────────────────────────────────────────
  config = withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const projectRoot = cfg.modRequest.projectRoot;
    const projectName = cfg.modRequest.projectName;
    const soundSrc = path.join(projectRoot, "assets", SOUND_FILENAME);

    if (!fs.existsSync(soundSrc)) {
      console.warn(`[withAdhanSound] ${soundSrc} not found – skipping iOS`);
      return cfg;
    }

    // Copy into the iOS project directory
    const targetDir = path.join(projectRoot, "ios", projectName);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(soundSrc, path.join(targetDir, SOUND_FILENAME));

    // ── Direct PBX hash manipulation (avoids addResourceFile crash) ──
    const objects = proj.hash.project.objects;

    // Check if already added
    const fileRefs = objects["PBXFileReference"] || {};
    let existingRefUuid = null;
    for (const key in fileRefs) {
      if (typeof fileRefs[key] === "string") continue;
      const ref = fileRefs[key];
      if (
        ref &&
        (ref.name === `"${SOUND_FILENAME}"` ||
          ref.path === `"${SOUND_FILENAME}"` ||
          ref.name === SOUND_FILENAME ||
          ref.path === SOUND_FILENAME)
      ) {
        existingRefUuid = key;
        break;
      }
    }

    if (existingRefUuid) {
      console.log(`[withAdhanSound] ${SOUND_FILENAME} already in project`);
      return cfg;
    }

    // Create PBXFileReference
    const fileRefUuid = proj.generateUuid();
    if (!objects["PBXFileReference"]) objects["PBXFileReference"] = {};
    objects["PBXFileReference"][fileRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "audio.mp3",
      name: `"${SOUND_FILENAME}"`,
      path: `"${SOUND_FILENAME}"`,
      sourceTree: '"<group>"',
    };
    objects["PBXFileReference"][`${fileRefUuid}_comment`] = SOUND_FILENAME;

    // Create PBXBuildFile for the Resources phase
    const buildFileUuid = proj.generateUuid();
    if (!objects["PBXBuildFile"]) objects["PBXBuildFile"] = {};
    objects["PBXBuildFile"][buildFileUuid] = {
      isa: "PBXBuildFile",
      fileRef: fileRefUuid,
      fileRef_comment: SOUND_FILENAME,
    };
    objects["PBXBuildFile"][`${buildFileUuid}_comment`] = `${SOUND_FILENAME} in Resources`;

    // Find the main app target's Resources build phase
    const firstTarget = proj.getFirstTarget();
    if (!firstTarget) {
      console.warn("[withAdhanSound] No target found – skipping");
      return cfg;
    }

    const nativeTarget = objects["PBXNativeTarget"][firstTarget.uuid];
    if (nativeTarget && nativeTarget.buildPhases) {
      for (const phase of nativeTarget.buildPhases) {
        const phaseUuid = phase.value || phase;
        const resourcePhase =
          objects["PBXResourcesBuildPhase"] &&
          objects["PBXResourcesBuildPhase"][phaseUuid];
        if (resourcePhase) {
          resourcePhase.files.push({
            value: buildFileUuid,
            comment: `${SOUND_FILENAME} in Resources`,
          });
          break;
        }
      }
    }

    // Add file ref to the main app group
    const mainGroupKey = proj.getFirstProject().firstProject.mainGroup;
    const mainGroup = objects["PBXGroup"][mainGroupKey];
    if (mainGroup) {
      // Find the project-name subgroup (e.g. "Aqala")
      let appGroupKey = null;
      for (const child of mainGroup.children) {
        const childKey = child.value || child;
        const childGroup = objects["PBXGroup"][childKey];
        if (
          childGroup &&
          (childGroup.name === `"${projectName}"` ||
            childGroup.path === `"${projectName}"` ||
            childGroup.name === projectName ||
            childGroup.path === projectName)
        ) {
          appGroupKey = childKey;
          break;
        }
      }

      const targetGroup = appGroupKey
        ? objects["PBXGroup"][appGroupKey]
        : mainGroup;

      targetGroup.children.push({
        value: fileRefUuid,
        comment: SOUND_FILENAME,
      });
    }

    console.log(`[withAdhanSound] ✅ Added ${SOUND_FILENAME} to iOS project`);
    return cfg;
  });

  // ── Android ──────────────────────────────────────────
  config = withDangerousMod(config, [
    "android",
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const rawDir = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res",
        "raw"
      );
      const soundSrc = path.join(projectRoot, "assets", SOUND_FILENAME);

      if (!fs.existsSync(soundSrc)) {
        console.warn(`[withAdhanSound] ${soundSrc} not found – skipping Android`);
        return cfg;
      }

      if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
      fs.copyFileSync(soundSrc, path.join(rawDir, ANDROID_SOUND));

      return cfg;
    },
  ]);

  return config;
}

module.exports = withAdhanSound;
