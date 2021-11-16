const crossSpawn = require('cross-spawn');
const fs = require('fs-extra');
const path = require('path');
const hardenPackageDependencies = require('../utilities/harden-package-dependencies');

function getPackageJson() {
  return fs.readJsonSync(path.join(process.cwd(), 'package.json'));
}

function filterInstalledDependencies(dependencies, packageJson) {
  const filtered = {};
  for (const packageName in dependencies) {
    if (
      packageJson.dependencies[packageName] ||
      packageJson.devDependencies[packageName]
    ) {
      filtered[packageName] = dependencies[packageName];
    } else {
      console.log(
        `Package ${packageName} not found in package.json. Skipping.`
      );
    }
  }
  return filtered;
}

function runNgCommand(command, args = []) {
  crossSpawn.sync('npx', ['-p', '@angular/cli', 'ng', command, ...args], {
    stdio: 'inherit',
  });
}

function updateDependencies(dependencies) {
  const packageJson = getPackageJson();
  const filtered = filterInstalledDependencies(dependencies, packageJson);
  const packages = Object.keys(filtered).map(
    (packageName) => `${packageName}@${filtered[packageName]}`
  );
  console.log(`---\n> Updating ${packages.join(', ')}...`);
  runNgCommand('update', [...packages, '--allow-dirty', '--force']);
  console.log(`Done updating ${packages.join(', ')}.`);
}

module.exports = function (_args) {
  const angularVersion = '^13';
  const angularEslintVersion = '^13.0.0-0';
  const giftdibsVersion = '^13.0.0-0';

  updateDependencies({
    '@angular/cli': angularVersion,
    '@angular/core': angularVersion,
    '@angular-eslint/schematics': angularEslintVersion,
  });

  const schematicsPackageJson = fs.readJsonSync(
    path.join(
      process.cwd(),
      'node_modules',
      '@schematics/angular/utility/latest-versions/package.json'
    )
  );

  updateDependencies(schematicsPackageJson.dependencies);

  updateDependencies({
    '@angular-eslint/builder': angularEslintVersion,
    '@angular-eslint/eslint-plugin': angularEslintVersion,
    '@angular-eslint/eslint-plugin-template': angularEslintVersion,
    '@angular-eslint/template-parser': angularEslintVersion,
    eslint: '^7',
  });

  updateDependencies({
    prettier: '^2',
  });

  updateDependencies({
    '@giftdibs/ux': giftdibsVersion,
    '@giftdibs/session': giftdibsVersion,
  });

  hardenPackageDependencies();
};
