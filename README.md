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

| Command                         | Description                                                                    |
|---------------------------------|--------------------------------------------------------------------------------|
| `npm install`                   | Installs all packages listed in `package.json`                                 |
| `npm run dev`                   | Starts the development environment including SCSS and JS watcher (Live Reload) |
| `npm run build`                 | Generates all CSS and JS files and ZIP packages in `.output`                   |
| `npx srl create component`      | Creates a component                                                            |
| `npx srl add components`        | Adds predefined components                                                     |
| `npx srl remove components`     | Removes one or more components                                                 |
| `npx srl add groups`            | Adds predefined groups and their components                                    |
| `npx srl remove groups`         | Removes one or more groups                                                     |

