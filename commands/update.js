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
  const angularVersion = '^12';

  updateDependencies({
    '@angular/cli': angularVersion,
    '@angular/core': angularVersion,
    '@angular-eslint/schematics': angularVersion,
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
    '@angular-eslint/builder': angularVersion,
    '@angular-eslint/eslint-plugin': angularVersion,
    '@angular-eslint/eslint-plugin-template': angularVersion,
    '@angular-eslint/template-parser': angularVersion,
    eslint: '^7',
  });

  updateDependencies({
    prettier: '^2',
  });

  hardenPackageDependencies();
};
