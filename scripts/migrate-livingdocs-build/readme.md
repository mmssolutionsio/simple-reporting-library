# Installation

    sudo npm i --location=global git@github.com:mmssolutionsio/migrate-livingdocs-build.git

## Update

    sudo npm update migrate-livingdocs-build --location=global

# Usage

## Node Version

    at least "16.15.1"

## Custom configuration

default values which can be overwritten in package.json of the current ld project

      {
      "nhs-design-builder": {
        "configurationSelector": "[type=\"ld-conf\"]",
        "build": {
          "design": "./src/config.json",
          "components": "./src/components/**/*.html",
          "requiredFolders": [
            "./src/css",
            "./src/fonts",
            "./src/svg",
            "./src/images"
          ],
          "dist": "./dist",
          "dest": "./",
          "archiveName": "design.zip"
        },
        "migration": {
          "design": "./src/config.json",
          "components": "./src/components/**/*.html",
          "dest": "./design-v2",
        }
      }
    }

| prop                  | desc                                                  |
| --------------------- | ----------------------------------------------------- |
| configurationSelector | querySelector string for script tag in html component |
| build.design          | location of base ld-design.json file                  |
| build.components      | location of html templates                            |
| build.requiredFolders | array of folders which are copied into the dist       |
| build.dist            | dist folder, will be created and deleted              |
| build.dest            | destination for the archive                           |
| build.archiveName     | zipped design file name                               |
| migration.design      | location of base ld-design.json file                  |
| migration.components  | location of html templates                            |
| dest                  | folder in which all migrated files will be written    |

## Build

cli command `nhs-ld-build` in ld project folder to make dist, build design and zip dist.

## Migrate

cli command `nhs-ld-migrate` in ld project folder to migrate html components and config.json, and write into a new location.
