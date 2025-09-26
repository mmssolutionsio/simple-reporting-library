#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'fs/promises';
import {
  addComponents,
  removeComponents,
  createComponent,
  addGroups,
  removeGroups,
  createGroup,
} from './scripts/components.js';
import { build, ddev, map, mapJs } from './scripts/build.js';
import { beaver } from './scripts/beaver.js';
import prepare from './scripts/prepare.js';

const packageJson = JSON.parse(
  await readFile(new URL('./package.json', import.meta.url)),
);

import { init } from './scripts/init.js';

const commander = new Command();

commander
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

commander
  .command('init')
  .description('Install development environment for nswow')
  .argument('<folder>', 'Folder where to install the entrypoint')
  .action(init);

commander
  .command('add')
  .description('Add components or groups to development')
  .argument('[action]', 'Chose action. Could be components or groups')
  .action((action, options) => {
    if (action === 'components') {
      addComponents();
    } else if (action === 'groups') {
      addGroups();
    } else {
      console.error('You can add components or groups!');
    }
  });

commander
  .command('remove')
  .description('Remove components or groups from development')
  .argument('[action]', 'Chose action. Could be components or groups')
  .action((action, options) => {
    if (action === 'components') {
      removeComponents();
    } else if (action === 'groups') {
      removeGroups();
    } else {
      console.error('You can remove components or groups!');
    }
  });

commander
  .command('create')
  .description('Create component or group from development')
  .argument('[action]', 'Chose action. Could be component or group')
  .argument('[name]', 'The name of component or group.')
  .action((action, name, options) => {
    if (action === 'component') {
      createComponent(name);
    } else if (action === 'group') {
      createGroup(name);
    } else {
      console.error('You can create component or group!');
    }
  });

commander
  .command('build')
  .description('Build ldd, app, pdf and word for production')
  .argument('[version]', 'The name of component or group.')
  .option('-c, --customer <customer>', 'The customer to build for')
  .action(async (version, options) => {
    await build(version, options);
  });

commander
  .command('ddev')
  .description('Build app for ddev')
  .action(async () => {
    await ddev();
  });

commander
  .command('map')
  .description('Build all necessary scss and livingdocs entries for production')
  .action(async () => {
    await map();
  });

commander
  .command('mapjs')
  .description(
    'Build all necessary javascript and typescript entries for production',
  )
  .action(async () => {
    await mapJs();
  });

commander
  .command('beaver')
  .description('Update beaver configuration')
  .action(() => {
    beaver(1);
  });

commander
  .command('prepare')
  .description('Prepare development environment')
  .action(prepare);

commander.parse();
