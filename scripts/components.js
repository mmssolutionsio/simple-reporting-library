import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { glob } from 'glob';
import { copy, ensureDir } from 'fs-extra';
import { rm, statSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lddGroupNames } from './utils.js';
import { map } from '@multivisio/nswow/scripts/build.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagePath = resolve(__dirname, '../');
const CWD = process.cwd();

const { MultiSelect, Confirm, AutoComplete, Input } = require('enquirer');

/**
 * Adds groups of livingdocs to a specified output directory.
 * @returns {boolean} - Returns true if groups were added successfully.
 */
async function addGroups() {
  const outputPath = resolve(CWD, './livingdocs');
  const groupsPath = `${packagePath}/livingdocs`;
  const groups = readdirSync(groupsPath);
  const groupsExists = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    groupsExists.push({ name: lddGroupNames(group), value: group });
  }
  groupsExists.sort((a, b) => {
    const valueA = a.name.toUpperCase(); // ignore upper and lowercase
    const valueB = b.name.toUpperCase(); // ignore upper and lowercase
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });
  const prompt = new MultiSelect({
    name: (i) => {
      return i.value;
    },
    message:
      'Choose your livingdocs to add (space to select or deselect and enter to submit)',
    choices: groupsExists,
    limit: 10,
    result(names) {
      return this.map(names);
    },
  });

  prompt
    .run()
    .then(async (groups) => {
      let action = false;
      const installed = [];
      for (const key in groups) {
        const group = groups[key];
        const components = readdirSync(`${groupsPath}/${group}`);
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          try {
            await statSync(`${outputPath}/${group}/${component}`);
            console.log(`Component ${key} / ${component} allready exists!`);
          } catch (e) {
            action = true;
            await copy(
              `${groupsPath}/${group}/${component}`,
              `${outputPath}/${group}/${component}`,
            );
            console.log(`Component ${key} / ${component} installed!`);
          }
        }
      }
      return action;
    })
    .then((action) => {
      if (action) {
        map();
      }
      return action;
    })
    .catch(console.error);
  return true;
}

/**
 * Adds components from a specified directory to another directory.
 * Prompts the user to select which components to add.
 *
 * @async
 * @function addComponents
 *
 * @returns {Promise<void>} - A promise that resolves when the components are added successfully.
 */
async function addComponents() {
  const filesToAdd = await glob(`${packagePath}/livingdocs/**/*`, {
    maxDepth: 6,
  });
  const filesExists = await glob(`${CWD}/livingdocs/**/*`, { maxDepth: 3 });
  const livingdocsToAdd = [];
  const livingdocsExists = [];

  for (let x = 0; x < filesExists.length; x++) {
    const c = filesExists[x].replace(`${CWD}/livingdocs/`, '');
    livingdocsExists.push(c);
  }
  for (let x = 0; x < filesToAdd.length; x++) {
    const c = filesToAdd[x].replace(`${packagePath}/livingdocs/`, '');
    if (!livingdocsExists.includes(c) && c.indexOf('/') !== -1) {
      livingdocsToAdd.push({ name: lddGroupNames(c), value: c });
    }
  }

  if (livingdocsToAdd.length) {
    livingdocsToAdd.sort((a, b) => {
      const valueA = a.name.toUpperCase(); // ignore upper and lowercase
      const valueB = b.name.toUpperCase(); // ignore upper and lowercase
      if (valueA < valueB) {
        return -1;
      }
      if (valueA > valueB) {
        return 1;
      }
      return 0;
    });

    const prompt = new MultiSelect({
      name: (i) => {
        return i.value;
      },
      message:
        'Choose your livingdocs to add (space to select or deselect and enter to submit)',
      choices: livingdocsToAdd,
      limit: 10,
      result(names) {
        return this.map(names);
      },
    });

    prompt
      .run()
      .then(async (livingdocs) => {
        const oKeys = Object.keys(livingdocs);
        for (let x = 0; x < oKeys.length; x++) {
          await copy(
            `${packagePath}/livingdocs/${livingdocs[oKeys[x]]}`,
            `${CWD}/livingdocs/${livingdocs[oKeys[x]]}`,
          );
        }
        await map();
        console.log('Components installed!');
      })
      .catch(console.error);
  }
}

/**
 * Removes livingdocs groups from the specified directory.
 *
 * @returns {boolean} Returns true if the livingdocs groups were successfully removed, otherwise false.
 */
async function removeGroups() {
  const livingdocsPath = resolve(CWD, './livingdocs');
  const groupsExists = [];
  const groupsList = await readdirSync(livingdocsPath);
  for (let i = 0; i < groupsList.length; i++) {
    const group = groupsList[i];
    groupsExists.push({ name: lddGroupNames(group), value: group });
  }
  groupsExists.sort((a, b) => {
    const valueA = a.name.toUpperCase(); // ignore upper and lowercase
    const valueB = b.name.toUpperCase(); // ignore upper and lowercase
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });

  const prompt = new MultiSelect({
    name: (i) => {
      return i.value;
    },
    message:
      'Choose your livingdocs groups to remove (space to select or deselect and enter to submit)',
    choices: groupsExists,
    result(names) {
      return this.map(names);
    },
  });

  prompt
    .run()
    .then((groups) => {
      const oKeys = Object.keys(groups);
      if (oKeys.length) {
        const prompt = new Confirm({
          name: 'question',
          message: 'Should the selected livingdocs groups really be deleted?',
        });

        prompt.run().then(async (remove) => {
          if (remove) {
            oKeys.forEach(async (k) => {
              await rm(
                `${CWD}/livingdocs/${groups[k]}`,
                { recursive: true, force: true },
                (err) => {
                  if (err) {
                    console.error(err);
                  }
                },
              );
            });
            await map();
            console.log('Groups removed!');
          }
        });
      }
    })
    .catch(console.error);
  return true;
}

/**
 * Removes livingdocs components based on user selection.
 *
 * @returns {Promise<void>} A promise that resolves once the components are removed.
 */
async function removeComponents() {
  const filesExists = await glob(`${CWD}/livingdocs/**/*`, { maxDepth: 3 });
  const livingdocsExists = [];
  for (let x = 0; x < filesExists.length; x++) {
    const c = filesExists[x].replace(`${CWD}/livingdocs/`, '');
    if (c.indexOf('/') !== -1) {
      const p = c.split('/');
      let group = p[0].replace('_and_', ' / ').replace('_', ' ');
      livingdocsExists.push({
        name: lddGroupNames(`${group} / ${p[1]}`),
        value: c,
      });
    }
  }
  livingdocsExists.sort((a, b) => {
    const valueA = a.name.toUpperCase(); // ignore upper and lowercase
    const valueB = b.name.toUpperCase(); // ignore upper and lowercase
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });

  const prompt = new MultiSelect({
    name: (i) => {
      return i.value;
    },
    message:
      'Choose your livingdocs components to remove (space to select or deselect and enter to submit)',
    choices: livingdocsExists,
    result(names) {
      return this.map(names);
    },
  });

  prompt
    .run()
    .then((livingdocs) => {
      const oKeys = Object.keys(livingdocs);
      if (oKeys.length) {
        const prompt = new Confirm({
          name: 'question',
          message:
            'Should the selected livingdocs components really be deleted?',
        });

        prompt.run().then(async (remove) => {
          if (remove) {
            oKeys.forEach(async (k) => {
              await rm(
                `${CWD}/livingdocs/${livingdocs[k]}`,
                { recursive: true, force: true },
                (err) => {
                  if (err) {
                    console.error(err);
                  }
                },
              );
            });
            await map();
            console.log('Components removed!');
          }
        });
      }
    })
    .catch(console.error);
}

/**
 * Maps the given component name to a component object containing group and name properties.
 *
 * @param {string} name - The name of the component.
 * @return {object} - An object with group and name properties representing the mapped component.
 */
function mapComponentName(name) {
  const component = {
    group: false,
    name: false,
  };
  if (name) {
    const n = name.split('/');
    if (n.length > 1) {
      component.group = n[0];
      component.name = n[1];
    } else {
      component.name = name;
    }
  }
  return component;
}

/**
 * Creates a component in the specified group with the given name.
 * @param {string} group - The group for the component.
 * @param {string} name - The name of the component.
 * @return {boolean} - Returns true if the component is successfully created, false otherwise.
 */
async function writeComponent(group, name) {
  if (!group) {
    console.error('Component could not be created. The group is not set!');
    return false;
  }
  if (!name) {
    console.error('Component could not be created. The name is not set!');
    return false;
  }

  try {
    const stat = await statSync(`${CWD}/livingdocs/${group}/${name}`);
    console.error(`Component ${group}/${name} already exist!`);
  } catch (e) {
    try {
      await statSync(`${CWD}/livingdocs/${group}`);
    } catch (e) {
      await mkdirSync(`${CWD}/livingdocs/${group}`);
    }

    await mkdirSync(`${CWD}/livingdocs/${group}/${name}`);
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/${name}.html`,
      `<script type="ld-conf">
{
  "name": "${name}",
  "label": "${name}",
  "properties": [
    "web-width",
    "pdf-width"
  ]
}
</script>
<p class="srl-${name} srl-article__grid srl-article__grid--content">
  <span class="srl-article__grid--inner" doc-editable="text">
    Editable Text
  </span>
</p>
`,
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/general.scss`,
      `@use "nswow";

.srl-${name} {

}
`,
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/_web.scss`,
      '@use "nswow";',
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/_print.scss`,
      '@use "nswow";',
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/ldd.scss`,
      '@use "_web";',
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/app.scss`,
      '@use "_web";',
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/pdf.scss`,
      '@use "_print";',
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/word.scss`,
      '@use "_print";',
    );
    await writeFileSync(
      `${CWD}/livingdocs/${group}/${name}/properties.json`,
      '{}',
    );
    await map();
    console.log(`Component ${group}/${name} created!`);
  }
  return true;
}

/**
 * Create a component with the given name. If the component name is not provided, it prompts the user to enter a name.
 * If the component name does not have a group, it prompts the user to select a group.
 * Once the component name and group are determined, it writes the component.
 *
 * @param {string} name - The name of the component (optional)
 * @return {boolean} - Returns true
 */
async function createComponent(name) {
  let component = mapComponentName(name);

  if (!component.name) {
    const { Input } = require('enquirer');
    const prompt = new Input({
      message: 'What is your component name?',
      description: 'You can combine $group/$component',
    });

    prompt
      .run()
      .then(async (name) => {
        component = mapComponentName(name);
        if (!component.group) {
          const groupFolders = await glob(`${CWD}/livingdocs/*`);
          const groups = [];
          for (let x = 0; x < groupFolders.length; x++) {
            const f = groupFolders[x].split('/');
            groups.push(f.pop());
          }
          groups.sort((a, b) => {
            if (a < b) {
              return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;
          });

          const prompt = new AutoComplete({
            name: 'group',
            message: 'Group',
            choices: groups,
          });

          prompt
            .run()
            .then(async (group) => {
              await writeComponent(group, component.name);
            })
            .catch(console.error);
        } else {
          await writeComponent(component.group, component.name);
        }
      })
      .catch(console.error);
  } else if (!component.group) {
    const groupFolders = await glob(`${CWD}/livingdocs/*`);
    const groups = [];
    for (let x = 0; x < groupFolders.length; x++) {
      const f = groupFolders[x].split('/');
      groups.push(f.pop());
    }
    groups.sort((a, b) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });

    const prompt = new AutoComplete({
      name: 'group',
      message: 'Group',
      choices: groups,
    });

    prompt
      .run()
      .then(async (group) => {
        await writeComponent(group, component.name);
      })
      .catch(console.error);
  } else {
    await writeComponent(component.group, component.name);
  }
  return true;
}

/**
 * Creates a new group folder for saving living documents.
 *
 * @param {string} group - The name of the group to create.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the group was created successfully, otherwise false.
 */
async function writeGroup(group) {
  if (!group) {
    console.error('No group name set!');
    return false;
  }
  const path = resolve(CWD, `./livingdocs/${group}`);
  try {
    const stat = await statSync(path);
    console.error(`Group "${group}" allready exist!`);
    return false;
  } catch (e) {
    await mkdirSync(path);
    console.log(`Group "${group}" created!`);
  }
  return true;
}

/**
 * Creates a group.
 *
 * @param {string} group - The name of the group to be created. If not provided, user will be prompted to enter the group name.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating if the group was successfully created or not.
 */
async function createGroup(group) {
  if (!group) {
    const { Input } = require('enquirer');
    const prompt = new Input({
      message: 'What is your group name?',
    });

    return await prompt
      .run()
      .then(async (group) => {
        return await writeGroup(group);
      })
      .catch(console.error);
  } else {
    return await writeGroup(group);
  }
  return false;
}

export {
  addComponents,
  addGroups,
  removeComponents,
  removeGroups,
  createComponent,
  createGroup,
};
