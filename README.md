# mms-reporting-library

Starter Package for nswow development

## Installation

> npx @multivisio/nswow@latest init {{ project-name }}

### After installation

> cd {{ project-name }}

> npm install

## Usage

Run dev server:

> npm run dev

Build all required files.

> npm run build

## Important CLI commands

| Command                                                  | Description                                                                    |
|----------------------------------------------------------|--------------------------------------------------------------------------------|
| `npm install`                                            | Installs all packages listed in `package.json`                                 |
| `npm run dev`                                            | Starts the development environment including SCSS and JS watcher (Live Reload) |
| `npm run build`                                          | Generates all CSS and JS files and ZIP packages in `.output`                   |
| `npx @simple-reporting/base create component`            | Creates a component                                                            |
| `npx @simple-reporting/base add components`              | Adds predefined components                                                     |
| `npx @simple-reporting/base remove components`           | Removes one or more components                                                 |
| `npx @simple-reporting/base add groups`                  | Adds predefined groups and their components                                    |
| `npx @simple-reporting/base remove groups`               | Removes one or more groups                                                     |

