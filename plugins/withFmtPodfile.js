/**
 * Injects a post_install hook for the `fmt` CocoaPods target (C++17 + FMT_USE_CONSTEVAL=0).
 * Needed with Apple Clang 16+ / Xcode 16+ and FMT_STRING consteval; see react-native#55601, fmtlib#2361.
 */
const { withPodfile } = require('@expo/config-plugins');

const MARKER = '# @generated expo-config-plugin: with-fmt-podfile';

const FMT_RUBY = `
    ${MARKER}
    # fmt: Apple Clang 16+ / Xcode 16+ + FMT_STRING consteval; see react-native#55601, fmtlib#2361
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'

      target.build_configurations.each do |cfg|
        cfg.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        defs = cfg.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
        defs = case defs
               when nil
                 ['$(inherited)']
               when Array
                 defs.dup
               else
                 [defs]
               end
        unless defs.any? { |d| d.to_s.include?('FMT_USE_CONSTEVAL') }
          defs << 'FMT_USE_CONSTEVAL=0'
        end
        cfg.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
      end
    end`;

function withFmtPodfile(config) {
  return withPodfile(config, (cfg) => {
    const contents = cfg.modResults.contents;
    if (contents.includes(MARKER)) {
      return cfg;
    }

    const rnPostInstall = /react_native_post_install\([\s\S]*?\n\s*\)/m;
    if (rnPostInstall.test(contents)) {
      cfg.modResults.contents = contents.replace(rnPostInstall, (m) => `${m}${FMT_RUBY}`);
      return cfg;
    }

    const postInstallOpen = /(post_install do \|installer\|\n)/;
    if (postInstallOpen.test(contents)) {
      cfg.modResults.contents = contents.replace(postInstallOpen, `$1${FMT_RUBY}`);
      return cfg;
    }

    throw new Error(
      '[with-fmt-podfile] Could not find `post_install` / `react_native_post_install` in Podfile. Update plugins/withFmtPodfile.js for your Expo / React Native template.'
    );
  });
}

module.exports = withFmtPodfile;
