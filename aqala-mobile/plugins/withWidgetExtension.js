/**
 * Expo Config Plugin – Adds the AqalaWidgets WidgetKit extension to the iOS build.
 *
 * What this plugin does:
 *   1. Adds App Groups entitlement to the main app target
 *   2. Copies widget source files from widgets/ios/ into ios/AqalaWidgets/
 *   3. Creates a new app-extension target in the Xcode project
 *   4. Manually wires up Sources, Resources, Frameworks build phases
 *   5. Configures build settings for the widget target
 *
 * Run `npx expo prebuild --clean` after modifying this plugin.
 */
const {
  withXcodeProject,
  withDangerousMod,
  withEntitlementsPlist,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// ── Constants ───────────────────────────────────────────────
const WIDGET_NAME = "AqalaWidgets";
const WIDGET_BUNDLE_ID = "com.aqala.app.widgets";
const APP_GROUP_ID = "group.com.aqala.app";
const DEPLOYMENT_TARGET = "17.0";

// ── Helpers ─────────────────────────────────────────────────

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getSwiftFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".swift"));
}

// ── Main Plugin ─────────────────────────────────────────────

function withWidgetExtension(config) {
  // Step 1: App Groups entitlement for main app
  config = withEntitlementsPlist(config, (cfg) => {
    if (!cfg.modResults["com.apple.security.application-groups"]) {
      cfg.modResults["com.apple.security.application-groups"] = [];
    }
    const groups = cfg.modResults["com.apple.security.application-groups"];
    if (!groups.includes(APP_GROUP_ID)) {
      groups.push(APP_GROUP_ID);
    }
    return cfg;
  });

  // Step 2: Copy widget source files into ios/
  config = withDangerousMod(config, [
    "ios",
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const widgetSrc = path.join(projectRoot, "widgets", "ios");
      const widgetDest = path.join(projectRoot, "ios", WIDGET_NAME);

      if (!fs.existsSync(widgetSrc)) {
        console.warn(`[withWidgetExtension] Source not found: ${widgetSrc}`);
        return cfg;
      }

      copyDirRecursive(widgetSrc, widgetDest);
      console.log(`[withWidgetExtension] Copied widget files → ${widgetDest}`);

      // Create main app entitlements
      const projectName = cfg.modRequest.projectName;
      const mainEnt = path.join(projectRoot, "ios", projectName, `${projectName}.entitlements`);
      if (!fs.existsSync(mainEnt)) {
        fs.writeFileSync(
          mainEnt,
          `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>${APP_GROUP_ID}</string>
\t</array>
</dict>
</plist>`
        );
        console.log(`[withWidgetExtension] Created main entitlements → ${mainEnt}`);
      }
      return cfg;
    },
  ]);

  // Step 3: Modify Xcode project
  config = withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const projectRoot = cfg.modRequest.projectRoot;
    const projectName = cfg.modRequest.projectName;

    try {
      addWidgetTarget(proj, projectRoot, projectName);
      console.log(`[withWidgetExtension] ✅ Widget target added successfully`);
    } catch (err) {
      console.error(`[withWidgetExtension] ❌ Failed:`, err.message || err);
    }

    return cfg;
  });

  return config;
}

// ── Xcode Project Modifications (low-level PBX hash approach) ──

function addWidgetTarget(proj, projectRoot, projectName) {
  const widgetDir = path.join(projectRoot, "ios", WIDGET_NAME);
  const objects = proj.hash.project.objects;

  // Bail if target already exists
  if (proj.pbxTargetByName(WIDGET_NAME)) {
    console.log(`[withWidgetExtension] Target already exists, skipping`);
    return;
  }

  // ── 1. Create the target via addTarget (handles PBXNativeTarget, build configs,
  //       product file, Copy Files embed phase, and target dependency automatically) ──
  const target = proj.addTarget(WIDGET_NAME, "app_extension", WIDGET_NAME, WIDGET_BUNDLE_ID);
  if (!target) throw new Error("addTarget returned null");
  const targetUuid = target.uuid;

  // ── 2. Create build phases for the widget target ──
  //    addTarget leaves buildPhases empty — we populate them manually.

  const sourcePhaseUuid = proj.generateUuid();
  const resourcePhaseUuid = proj.generateUuid();
  const frameworkPhaseUuid = proj.generateUuid();

  ensureSection(objects, "PBXSourcesBuildPhase");
  ensureSection(objects, "PBXResourcesBuildPhase");
  ensureSection(objects, "PBXFrameworksBuildPhase");

  objects["PBXSourcesBuildPhase"][sourcePhaseUuid] = {
    isa: "PBXSourcesBuildPhase",
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXSourcesBuildPhase"][`${sourcePhaseUuid}_comment`] = "Sources";

  objects["PBXResourcesBuildPhase"][resourcePhaseUuid] = {
    isa: "PBXResourcesBuildPhase",
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXResourcesBuildPhase"][`${resourcePhaseUuid}_comment`] = "Resources";

  objects["PBXFrameworksBuildPhase"][frameworkPhaseUuid] = {
    isa: "PBXFrameworksBuildPhase",
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXFrameworksBuildPhase"][`${frameworkPhaseUuid}_comment`] = "Frameworks";

  // Wire phases into the target
  objects["PBXNativeTarget"][targetUuid].buildPhases = [
    { value: sourcePhaseUuid, comment: "Sources" },
    { value: resourcePhaseUuid, comment: "Resources" },
    { value: frameworkPhaseUuid, comment: "Frameworks" },
  ];

  // ── 3. Add Swift source files ──
  const groupChildren = [];
  const swiftFiles = getSwiftFiles(widgetDir);

  ensureSection(objects, "PBXFileReference");
  ensureSection(objects, "PBXBuildFile");

  for (const fileName of swiftFiles) {
    const fileRefUuid = proj.generateUuid();
    const buildFileUuid = proj.generateUuid();

    // PBXFileReference
    objects["PBXFileReference"][fileRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "sourcecode.swift",
      path: `"${fileName}"`,
      sourceTree: '"<group>"',
    };
    objects["PBXFileReference"][`${fileRefUuid}_comment`] = fileName;

    // PBXBuildFile → Sources phase
    objects["PBXBuildFile"][buildFileUuid] = {
      isa: "PBXBuildFile",
      fileRef: fileRefUuid,
      fileRef_comment: fileName,
    };
    objects["PBXBuildFile"][`${buildFileUuid}_comment`] = `${fileName} in Sources`;

    objects["PBXSourcesBuildPhase"][sourcePhaseUuid].files.push({
      value: buildFileUuid,
      comment: `${fileName} in Sources`,
    });

    groupChildren.push({ value: fileRefUuid, comment: fileName });
  }

  // ── 4. Add Assets.xcassets ──
  if (fs.existsSync(path.join(widgetDir, "Assets.xcassets"))) {
    const assetsRefUuid = proj.generateUuid();
    const assetsBuildUuid = proj.generateUuid();

    objects["PBXFileReference"][assetsRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "folder.assetcatalog",
      path: '"Assets.xcassets"',
      sourceTree: '"<group>"',
    };
    objects["PBXFileReference"][`${assetsRefUuid}_comment`] = "Assets.xcassets";

    objects["PBXBuildFile"][assetsBuildUuid] = {
      isa: "PBXBuildFile",
      fileRef: assetsRefUuid,
      fileRef_comment: "Assets.xcassets",
    };
    objects["PBXBuildFile"][`${assetsBuildUuid}_comment`] = "Assets.xcassets in Resources";

    objects["PBXResourcesBuildPhase"][resourcePhaseUuid].files.push({
      value: assetsBuildUuid,
      comment: "Assets.xcassets in Resources",
    });

    groupChildren.push({ value: assetsRefUuid, comment: "Assets.xcassets" });
  }

  // ── 5. Add Info.plist + entitlements as file references (not in a build phase) ──
  if (fs.existsSync(path.join(widgetDir, "Info.plist"))) {
    const plistRefUuid = proj.generateUuid();
    objects["PBXFileReference"][plistRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "text.plist.xml",
      path: '"Info.plist"',
      sourceTree: '"<group>"',
    };
    objects["PBXFileReference"][`${plistRefUuid}_comment`] = "Info.plist";
    groupChildren.push({ value: plistRefUuid, comment: "Info.plist" });
  }

  const entFile = `${WIDGET_NAME}.entitlements`;
  if (fs.existsSync(path.join(widgetDir, entFile))) {
    const entRefUuid = proj.generateUuid();
    objects["PBXFileReference"][entRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "text.plist.entitlements",
      path: `"${entFile}"`,
      sourceTree: '"<group>"',
    };
    objects["PBXFileReference"][`${entRefUuid}_comment`] = entFile;
    groupChildren.push({ value: entRefUuid, comment: entFile });
  }

  // ── 6. Add system frameworks (WidgetKit + SwiftUI) ──
  addSystemFramework("WidgetKit", proj, objects, frameworkPhaseUuid);
  addSystemFramework("SwiftUI", proj, objects, frameworkPhaseUuid);

  // ── 7. Create PBXGroup for widget files ──
  ensureSection(objects, "PBXGroup");
  const groupUuid = proj.generateUuid();

  objects["PBXGroup"][groupUuid] = {
    isa: "PBXGroup",
    children: groupChildren,
    name: `"${WIDGET_NAME}"`,
    path: `"${WIDGET_NAME}"`,
    sourceTree: '"<group>"',
  };
  objects["PBXGroup"][`${groupUuid}_comment`] = WIDGET_NAME;

  // Add to root project group
  const mainGroupKey = proj.getFirstProject().firstProject.mainGroup;
  if (objects["PBXGroup"][mainGroupKey]) {
    objects["PBXGroup"][mainGroupKey].children.push({
      value: groupUuid,
      comment: WIDGET_NAME,
    });
  }

  // ── 8. Configure build settings ──
  const configs = proj.pbxXCBuildConfigurationSection();
  for (const key in configs) {
    if (typeof configs[key] === "string") continue;
    const cfg = configs[key];
    if (!cfg.buildSettings) continue;

    // Widget target build settings
    if (cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === `"${WIDGET_BUNDLE_ID}"`) {
      Object.assign(cfg.buildSettings, {
        IPHONEOS_DEPLOYMENT_TARGET: DEPLOYMENT_TARGET,
        SWIFT_VERSION: "5.0",
        TARGETED_DEVICE_FAMILY: '"1,2"',
        CODE_SIGN_ENTITLEMENTS: `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`,
        ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: '"AccentColor"',
        ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: '"WidgetBackground"',
        INFOPLIST_FILE: `"${WIDGET_NAME}/Info.plist"`,
        GENERATE_INFOPLIST_FILE: "NO",
        MARKETING_VERSION: "1.0",
        CURRENT_PROJECT_VERSION: "1",
        SWIFT_EMIT_LOC_STRINGS: "YES",
        ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES: "YES",
      });
    }

    // Main target: point at entitlements file
    if (cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === '"com.aqala.app"') {
      if (!cfg.buildSettings.CODE_SIGN_ENTITLEMENTS) {
        cfg.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${projectName}/${projectName}.entitlements"`;
      }
    }
  }
}

// ── Utility helpers ─────────────────────────────────────────

function ensureSection(objects, section) {
  if (!objects[section]) objects[section] = {};
}

function addSystemFramework(name, proj, objects, frameworkPhaseUuid) {
  const refUuid = proj.generateUuid();
  const buildUuid = proj.generateUuid();

  objects["PBXFileReference"][refUuid] = {
    isa: "PBXFileReference",
    lastKnownFileType: "wrapper.framework",
    name: `"${name}.framework"`,
    path: `"System/Library/Frameworks/${name}.framework"`,
    sourceTree: "SDKROOT",
  };
  objects["PBXFileReference"][`${refUuid}_comment`] = `${name}.framework`;

  objects["PBXBuildFile"][buildUuid] = {
    isa: "PBXBuildFile",
    fileRef: refUuid,
    fileRef_comment: `${name}.framework`,
  };
  objects["PBXBuildFile"][`${buildUuid}_comment`] = `${name}.framework in Frameworks`;

  objects["PBXFrameworksBuildPhase"][frameworkPhaseUuid].files.push({
    value: buildUuid,
    comment: `${name}.framework in Frameworks`,
  });
}

module.exports = withWidgetExtension;
