/**
 * Injects App Intents Swift into the iOS app target, App Group + Keychain entitlements,
 * Siri usage copy, and iOS 16 deployment target. Do not hand-edit gitignored ios/.
 */
const fs = require('fs');
const path = require('path');
const {
  withAppDelegate,
  withXcodeProject,
  withEntitlementsPlist,
  withInfoPlist,
  withPodfileProperties,
  IOSConfig,
} = require('@expo/config-plugins');

const DISCOVERY_START_MARKER = 'PantryIntentsDiscovery.start()';

const PLUGIN_IOS_DIR = path.join(__dirname, 'ios');
const APP_GROUP_ID = 'group.com.askewsoft.pantryplus';
const DEPLOYMENT_TARGET = '16.0';
const SIRI_USAGE =
  'Pantry Plus uses Siri to add items to your shopping lists and check whether an item is already on a list.';
const DISPLAY_NAME = 'Pantry Plus';
const ALTERNATIVE_APP_NAMES = [
  {
    INAlternativeAppName: 'pantryPlus',
    INAlternativeAppNamePronunciationHint: 'pantry plus',
  },
  {
    INAlternativeAppName: 'Pantry',
    INAlternativeAppNamePronunciationHint: 'pantry',
  },
];

function collectSwiftFiles(dir, relativeRoot = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSwiftFiles(absolutePath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.swift')) {
      files.push({ relativePath, absolutePath });
    }
  }
  return files;
}

function buildConfigSwift(appleTeamId) {
  const keychainAccessGroup = appleTeamId ? `${appleTeamId}.${APP_GROUP_ID}` : '';
  return `import Foundation

enum PantryIntentsConfig {
  static let appGroupId = "${APP_GROUP_ID}"
  static let keychainAccessGroup = "${keychainAccessGroup}"
  static let keychainService = "com.askewsoft.pantryplus.intents"
  static let keychainAccount = "session"
  static let cacheFileName = "intent-cache.json"
}
`;
}

function withPantryIntentsDeploymentTarget(config) {
  config = withPodfileProperties(config, (cfg) => {
    cfg.modResults['ios.deploymentTarget'] = DEPLOYMENT_TARGET;
    return cfg;
  });

  return withXcodeProject(config, (cfg) => {
    const configurations = cfg.modResults.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configurations)) {
      const buildSettings = configurations[key]?.buildSettings;
      if (buildSettings) {
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = DEPLOYMENT_TARGET;
      }
    }
    return cfg;
  });
}

function withPantryIntentsEntitlements(config) {
  return withEntitlementsPlist(config, (cfg) => {
    cfg.modResults['com.apple.developer.siri'] = true;

    const groups = cfg.modResults['com.apple.security.application-groups'];
    const nextGroups = new Set(Array.isArray(groups) ? groups : []);
    nextGroups.add(APP_GROUP_ID);
    cfg.modResults['com.apple.security.application-groups'] = [...nextGroups];

    const keychain = cfg.modResults['keychain-access-groups'];
    const nextKeychain = new Set(Array.isArray(keychain) ? keychain : []);
    nextKeychain.add('$(AppIdentifierPrefix)$(CFBundleIdentifier)');
    nextKeychain.add(`$(AppIdentifierPrefix)${APP_GROUP_ID}`);
    cfg.modResults['keychain-access-groups'] = [...nextKeychain];
    return cfg;
  });
}

function withPantryIntentsInfoPlist(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.NSSiriUsageDescription = SIRI_USAGE;
    cfg.modResults.CFBundleDisplayName = DISPLAY_NAME;
    cfg.modResults.INAlternativeAppNames = ALTERNATIVE_APP_NAMES;
    return cfg;
  });
}

function withPantryIntentsAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      return cfg;
    }

    let contents = cfg.modResults.contents;
    if (contents.includes(DISCOVERY_START_MARKER)) {
      return cfg;
    }

    const needle =
      'launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {\n';
    if (!contents.includes(needle)) {
      throw new Error(
        'withPantryIntents: could not find AppDelegate didFinishLaunchingWithOptions to inject PantryIntentsDiscovery.start()'
      );
    }

    contents = contents.replace(
      needle,
      `${needle}    ${DISCOVERY_START_MARKER}\n\n`
    );
    cfg.modResults.contents = contents;
    return cfg;
  });
}

function withPantryIntentsSwiftSources(config) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName ?? IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    const nativeRoot = cfg.modRequest.platformProjectRoot;
    const destRoot = path.join(nativeRoot, projectName, 'PantryIntents');
    const appleTeamId = cfg.ios?.appleTeamId ?? config.ios?.appleTeamId ?? '';

    fs.mkdirSync(destRoot, { recursive: true });

    const sources = collectSwiftFiles(PLUGIN_IOS_DIR).map((file) => {
      if (file.relativePath.replace(/\\/g, '/').endsWith('Services/PantryIntentsConfig.swift')) {
        return {
          ...file,
          contents: buildConfigSwift(appleTeamId),
        };
      }
      return {
        ...file,
        contents: fs.readFileSync(file.absolutePath, 'utf8'),
      };
    });

    IOSConfig.XcodeUtils.ensureGroupRecursively(project, `${projectName}/PantryIntents`);

    for (const file of sources) {
      const destPath = path.join(destRoot, file.relativePath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, file.contents, 'utf8');

      const projectRelativePath = path.posix.join(projectName, 'PantryIntents', file.relativePath.replace(/\\/g, '/'));
      if (!project.hasFile(projectRelativePath)) {
        IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
          filepath: projectRelativePath,
          groupName: `${projectName}/PantryIntents`,
          project,
        });
      }
    }

    cfg.modResults = project;
    return cfg;
  });
}

function withPantryIntents(config) {
  config.ios = config.ios ?? {};
  config.ios.infoPlist = {
    ...(config.ios.infoPlist ?? {}),
    NSSiriUsageDescription: SIRI_USAGE,
    CFBundleDisplayName: DISPLAY_NAME,
    INAlternativeAppNames: ALTERNATIVE_APP_NAMES,
  };
  config.ios.entitlements = {
    ...(config.ios.entitlements ?? {}),
    'com.apple.developer.siri': true,
    'com.apple.security.application-groups': [
      ...new Set([
        ...((config.ios.entitlements ?? {})['com.apple.security.application-groups'] ?? []),
        APP_GROUP_ID,
      ]),
    ],
    'keychain-access-groups': [
      ...new Set([
        ...((config.ios.entitlements ?? {})['keychain-access-groups'] ?? []),
        '$(AppIdentifierPrefix)$(CFBundleIdentifier)',
        `$(AppIdentifierPrefix)${APP_GROUP_ID}`,
      ]),
    ],
  };

  config = withPantryIntentsInfoPlist(config);
  config = withPantryIntentsEntitlements(config);
  config = withPantryIntentsDeploymentTarget(config);
  config = withPantryIntentsSwiftSources(config);
  config = withPantryIntentsAppDelegate(config);
  return config;
}

module.exports = withPantryIntents;
