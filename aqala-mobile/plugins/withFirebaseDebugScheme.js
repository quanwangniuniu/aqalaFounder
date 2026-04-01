/**
 * Adds -FIRAnalyticsDebugEnabled launch argument to the Xcode scheme so that
 * Firebase DebugView receives events in development builds.
 *
 * This flag is stripped on every `expo prebuild --clean` because the scheme
 * file is regenerated from scratch. This plugin re-applies it automatically.
 *
 * The flag is only injected in __DEV__ / Debug scheme runs; Release builds
 * (Archive / TestFlight) are unaffected because Xcode ignores launch args
 * during archiving.
 *
 * Remove this plugin (or set isEnabled = "NO") before submitting to App Store
 * if you do not want debug analytics in production builds.
 */
const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const FIR_ARG = "-FIRAnalyticsDebugEnabled";
const MARKER = "FIRAnalyticsDebugEnabled";

function withFirebaseDebugScheme(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const schemesDir = path.join(
        cfg.modRequest.platformProjectRoot,
        `${cfg.modRequest.projectName}.xcodeproj`,
        "xcshareddata",
        "xcschemes"
      );

      // The scheme file is named after the project (e.g. Aqala.xcscheme)
      const schemeFile = path.join(schemesDir, `${cfg.modRequest.projectName}.xcscheme`);

      if (!fs.existsSync(schemeFile)) {
        console.warn(`[withFirebaseDebugScheme] Scheme not found at ${schemeFile}, skipping.`);
        return cfg;
      }

      let contents = fs.readFileSync(schemeFile, "utf8");

      // Idempotent: skip if already present
      if (contents.includes(MARKER)) {
        return cfg;
      }

      // Inject <CommandLineArguments> block right before </LaunchAction>
      const closeTag = "</LaunchAction>";
      if (!contents.includes(closeTag)) {
        console.warn("[withFirebaseDebugScheme] Could not find </LaunchAction> in scheme, skipping.");
        return cfg;
      }

      const injection = `      <CommandLineArguments>
         <CommandLineArgument
            argument = "${FIR_ARG}"
            isEnabled = "YES">
         </CommandLineArgument>
      </CommandLineArguments>
   `;

      contents = contents.replace(closeTag, injection + closeTag);
      fs.writeFileSync(schemeFile, contents, "utf8");
      console.log(`[withFirebaseDebugScheme] Injected ${FIR_ARG} into ${schemeFile}`);

      return cfg;
    },
  ]);
}

module.exports = withFirebaseDebugScheme;
