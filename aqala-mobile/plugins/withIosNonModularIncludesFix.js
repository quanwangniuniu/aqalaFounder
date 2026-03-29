/**
 * use_frameworks static (Firebase) + RNFirebase + LiveKit WebRTC need
 * CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES for React headers, and
 * DEFINES_MODULE so RNFBAnalytics sees RNFBApp (RCTBridgeModule module import order).
 */
const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MARKER = "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES";

function withIosNonModularIncludesFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf8");
      if (contents.includes(MARKER)) return cfg;

      const anchor = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )`;

      if (!contents.includes(anchor)) return cfg;

      const injection = `

    # ${MARKER} + DEFINES_MODULE: RNFirebase module graph vs React-Core / static Firebase
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['${MARKER}'] = 'YES'
        build_config.build_settings['DEFINES_MODULE'] = 'YES'
      end
    end`;

      contents = contents.replace(anchor, anchor + injection);
      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withIosNonModularIncludesFix;
