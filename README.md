# HEDWIG

*If viewing README file in VS Code - use **right-click -> open preview** on the file for a more readable format.*

**Version 1.0.5 Release Notes:**

- Added .arb to .yaml support for EPT migrated messages. New command: `npm run parse-arb`
- Updated the l10n folder - now includes two new folders: **arb**, **ept-yaml**.
- Added a section for [Exporting files for translation](#exporting-files-for-translation) instructions
- Updated the **plain_text** filter to support macro calls and superscript conversion.
- Added a filter for .DS_Store to fix a bug occuring on `npm create-yaml` and `npm create-json` commands.

### Table of contents
- [Prerequisites](#prerequisites)<br />
- [Creating your local development environment](#creating-your-local-development-environment)<br />
- [Working within the Hawkeye Agency Github Organization](#working-within-the-hawkeye-agency-github-organization)
  - [Creating or duplicating a campaign](#creating-or-duplicating-a-campaign)
  - [Pushing and pulling](#github-pushing-and-pulling)

- [Basic usage](#basic-usage)
  - [Creating new messages inside a campaign](#creating-new-messages-inside-a-campaign)
  - [For first time users](#for-first-time-users)
  - [Shared assets](#shared-assets)
  - [Development](#development)
  - [Adding and using body copy](#adding-and-using-body-copy)
  - [Copy splits (YAML-specific)](#copy-splits-yaml-specific)
  - [Formatting rules (JSON/YAML)](#Formatting-rules-JSONYAML)
  - [Macros and partials](#macros-and-partials)
  - [Environment variables](#environment-variables)
  - [Configuration options](#configuration-options)

- [Plain text](#plain-text)

- [AMP support](#amp-support)<br />
- [Landing pages](#landing-pages)<br />
  - [LP stylesheet naming rules](#lp-stylesheet-naming-rules)
  - [Adding the LP HTML code directly](#adding-the-lp-html-code-directly)
  - [Building LP as a traditional email message](#building-lp-as-a-traditional-email-message)

- [Localization](#localization)<br />
  - [Localized copy files](#localized-copy-files)
  - [Localized LESS files](#localized-less-files)
  - [Supported languages codes](#supported-language-codes)
  - [Exporting files for translation](#exporting-files-for-translation)
    - [How it worked in EPT](#how-it-worked-in-EPT)
    - [How it works in HEDWIG](#how-it-works-in-HEDWIG)

- [Compiling the final output](#compiling-the-final-output)<br />
  
- [Using build-on-save](#using-build-on-save)<br />
- [Using shared vs local file paths](#Using-shared-vs-local-file-paths)<br />
- [Dev scripts](#dev-scripts)


## Prerequisites

Freemarker pre-flight setup is required initialize the template rendering module . Follow the steps below to get started:

#### Setting up a local Freemarker environment

1. Visit go/softwarecenter and download the JDK 11(Java Development Kit)

2. Set JAVA_HOME to your local bash_profile. Launch the terminal and run this command:
```shell
echo export 'JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.bash_profile
```

## Creating your local development environment

Create an empty folder on your local machine and name it `LDP`. 

**Note:** This folder will be the top level directory for all your campaigns and projects. When working with live repositories, clone them into `LDP`.

Download the global `node_modules` zip file from [Google Drive](https://drive.google.com/file/d/1gLUeaFXOnk5ikHEzNp3sCP4_BxRew6j5/view?usp=sharing) and unzip the contents to your `LDP` folder.

Since `node_modules` is added to the `LDP` level you do **not** need to run `npm install`.

## Working within the Hawkeye Agency Github Organization

This section covers the process of adding a new repository to the Hawkeye Github org.

#### Creating or duplicating a campaign

Open the Hawkeye Agency Org on **[github](https://github.com/Hawkeye-Google-Email-Dev)** and create a ***private*** repository for your campaign.

Naming rules:
  - Use lower case letters only for repository names.
  - Use dashes in place of spaces. For example: "sunfish campaign" should be "sunfish-campaign".

Start by cloning the `campaign-boilerplate` repo(or the repo of your choice if duplicating a live campaign) to your `LDP` folder:
```shell
git clone https://github.com/Hawkeye-Google-Email-Dev/campaign-boilerplate.git
```

**IMPORTANT: Rename the `campaign-boilerplate` folder you just cloned to the same name as your newly created repo. You can rename in finder or directly in VS Code.** For the rest of this example we will rename 'campaign-boilerplate' to `sunfish-campaign` but keep in mind that this will be different for you in real time.

Change your working directory in the terminal to the campaign folder:
```shell
cd sunfish-campaign
```

To push a clean copy to the new empty repository on Hawkeye organization, first remove the .git folder inside the campaign folder using the following command:
```shell
rm -rf .git
```

Init the new .git repo:
```shell
git init
```

Stage your files and push to the newly created repo in Hawkeye organization:
```shell
git add .
git commit -m "init repo"
git remote add origin https://github.com/Hawkeye-Google-Email-Dev/my-new-repository.git
git push -u origin master


# IMPORTANT: Replace 'my-new-repository' with your new repo name
```

Now you will have a clean local copy that is not linked to the **[campaign-boilerplate](https://github.com/Hawkeye-Google-Email-Dev/campaign-boilerplate)** repo. Any future commits / pushes will go to the new repo you created.

To verify your remote origin has successfully changed, use:
```bash
git remote -v

# This should return the current url. Verify it matches with the new repo you created.
```

## Github: pushing and pulling

When working with a shared repo, make sure to pull the newest copy at the beginning of your day and push your latest copy at EOD.

### Pull an existing repo

```shell
git clone <git_repo_address_here>
```

or if you already have a local copy, navigate to your local repo in terminal and pull

```shell
git pull
```

### Pushing your code to github
```shell
git add .
git commit -m "message"
git push
```

### Common git commands
|    Command      |    Description    |
| ----------- | ------------- | 
| git add . | Add files to staging. "." adds ALL files.  | 
| git commit -m "message" | Commit your changed files. Always include a descriptive message about the changes. | 
| git push | Push your changed files to the repo. | 
| git remote -v | Shows which remote repo you're connected to (your "origin") | 
| git remote set-url origin <git_repo_address_here> | Changes your remote repo | 
| git push -u origin master | Force your local repo to overrite the remote repo. This should almost NEVER be used!! |

## Basic usage

#### For first time users 

It is recommended to look through the folder structure to get an understanding of how you would structure things when adding new messages to a campaign.

#### Creating new messages inside a campaign

The `campaign-boilerplate` includes a `message-template` that can be used to create additional messages. Make a copy of this folder and place it on the campaign level(the same level as the original `message-template` folder).

**Note:** Always make a copy to start new messages. Do not use `message-template` as your first message.

#### Shared assets

All shared or global files(layouts,base styles, macros, partials, etc) should be stored in the `assets` folder.

#### Development

Development is done in the `src` folder of a message. Each message is it's own folder and has it's own `src` folder. There are also `layout`, `partial`, and `less` folders inside a message for cases where you want to override things from the global `assets` folder. ***Important:*** *See [Using shared vs local file paths](#Using-shared-vs-local-file-paths) for key differences in importing and extending assets locally vs globally(shared).*

#### Adding and using body copy

The following file types are supported:
- JSON
- YAML

Depending on which file type you are using, there are two subfolders inside the `copy` folder. Add JSON files to `copy/json/` and YAML files to `copy/yaml/`. You can also temporarily store copy files for any language you do not want to be compiled under the `copy/unused/` folder.

**IMPORTANT:** You must set the `COPY_FILE_TYPE` variable in the **.env** file to the file type you are using for copies. For example, if you are using JSON files:

```shell
COPY_FILE_TYPE=json
```
*See [Environment variables](#environment-variables) for available .env options.*

Remember to follow formatting rules for each file type to avoid template rendering errors.

JSON copies
```json
{
  "from": "Test <noreply@gmail.com>",
  "subject": "This is a subject line",
  "headline": "This is a headline",
  "subhead": "This is a subhead",
  "cta": "Call to action"
}
```

YAML copies
```yaml
from: 'Test <noreply@gmail.com>'
subject: 'This is a subject line'
headline: 'This is a headline'
subhead: 'This is a subhead'
cta: 'Call to action'
```

**IMPORTANT NOTE:** The latest version of LDP no longer requires copy variables to be called with a `copy.` prefix. They can now be called directly by variable name:
```shell
{{ from }}
{{ subject }}
{{ headline }}
{{ subhead }}
{{ cta }}
```

#### Copy splits (YAML-specific)

There are two ways to split copies for YAML files.

**Option A** - Using a delimiter to split your copies, and declaring the split in your message using |split():
- YAML file:
```yaml
headlines: 'headline 1[=]headline 2[=]headline 3'
```
- index.html:
```jinja
{% set headlines = headlines|split('[=]') %}

{{ headline[0] }}
{{ headline[1] }}
{{ headline[2] }}
```

**Option B** - Using YAML's native split delimiter(hyphen). You do not need to declare the split in your message with this method:
- YAML file:
```yaml
headlines:
  - 'headline 1'
  - 'headline 2'
  - 'headline 3'
```
- index.html:
```jinja
{# copy vars can be called directly with Option B #}

{{ headlines[0] }}
{{ headlines[1] }}
{{ headlines[2] }}
```

#### Formatting rules (JSON/YAML)

In the context of using HEDWIG, there are a few syntax rules to keep in mind when creating copy variables.

*(will add more as needed)*

**JSON**
- If you are using the same type of quotes in a string, you will need to escape them with a backslash:
```json
{
  "headline": "This is a \"quoted\" text"
}
```

**YAML**
- Use the multiline block style indicator `>-` when you have long copies or any copies with code in it:
```yaml
headline: >-
  This headline <span>copy</span> contains <a href="${headline_link}">code</a> and some "quotes" of various 'types'.
```

#### Macros and partials

You can add custom macros to the `macro_base.html` file or create additional macro files as needed. ***Important:*** *See [Using shared vs local file paths](#Using-shared-vs-local-file-paths) for key differences in importing and extending assets locally vs globally(shared):*
```jinja
{%- import "assets/partial/macro_base.html" as base with context %}
```
In the example above `macro_base.html` is imported as 'base' so its macros would be with the 'base.' prefix. For example:
```jinja
{{ base.spacer(25) }}
```
**Note:** Using the "with context" option extends the global scope to other partials and layouts.

#### Environment variables

|    Name      |    Description    |
| ----------- | ------------- | 
| env.language.short_name | Language code - follows EPT and Gamma format | 
| env.content_type | Environment type of the current file | 
| env.render.gamma(**WIP**) | Boolean to check for Gamma environment and A/B testing (defaults to `false`) |

#### Configuration options

Additionally there is also a **.env** file in each message where you can configure options that apply during build time. The only configuration option that is required is the `COPY_FILE_TYPE` option, it must be set to either 'json' or 'yaml'.

|    Option      |    Description    |    Default(left blank)   |
| ----------- | ------------- | ------------- | 
| PROJECT_NAME | file name the message will be exported as | archive.zip | 
| COPY_FILE_TYPE (REQUIRED) | file type to be used when parsing copy, options: **json** or **yaml** |  |
| DATA_FILE | data file to be used | data.csv | 
| PORT | listener port for message preview | 3000 | 
| EXPORT | list of files to export (files not listed are omitted) | html,pt |

## Plain text

Plain text can be added to `plain.html`. Most of our emails going forward will need to include a full-pt build for [a11y](https://docs.google.com/spreadsheets/d/1b5KAVMVF27bHDECNnviO3NLmSQD1ndl45OtxeU84A6U/edit?ts=5ef3d438#gid=2098872878) purposes.

The `plain.html` file contains a `plain_text` block filter that will remove HTML while protecting freemarker code from copy vars. Keep in mind using a block is optional. You can also call the filter manually on each individual copy variable. See below for examples of each use case:

Using a block filter:
```jinja
From: {{ from }}
Subject: {{ subject }}

{% filter plain_text %}

{{ copy_var1 }}

{{ copy_var2 }}

{{ copy_var3 }}

{{ google_address }}

{{ optout }}

{% endfilter %}
```
***Note:*** *line breaks between copy var calls will be preserved.*

Calling the `plain_text` filter on individual copy variables:
```jinja
From: {{ from }}
Subject: {{ subject }}

{# Note: you do not need to call the filter on From or Subject since they should not have HTML or links in them #}

{{ copy_var1|plain_text }}

{{ copy_var2|plain_text }}

{{ copy_var3|plain_text }}
```

For best practices if you have links that are using the track() function or hard-coded links:
```html
Some copy with linked <a href="${track('https://google.com', 'track_name')}">text</a>.

<!-- or -->

Some copy with linked <a href="https://google.com">text</a>.
```

You may need to create a plain-text version of the copy var and replace it with a freemarker assigned link:
```jinja
Some copy with linked <a href="${link}">text</a>
```

## AMP support

AMP support is available and development can be done in the `amp.html` file. To compile AMP code for GAMMA run this command: `npm run build-amp`

## Landing pages

Add landing page contents to the `landing.html` template. For stylesheets, you can add LP .less files in either the global `assets/less/lp/` folder, or locally in the `src/less/lp/` folder. There are some important rules for adding styles to landing pages which varies on which method you are using to build the landing page. See below:

#### LP stylesheet naming rules

All LP stylesheets should follow this naming convention: `langCode-lp.less`

For example:
- `en-us-lp.less`
- `en-gb-lp.less`
- `de-lp.less`
- `ja-lp.less`
- etc

**Note:** You do **NOT** need to create a stylesheet for each language. If you only need one stylesheet: `en-us-lp.less`, the system will know to use this globally. Additionally if you don't have any stylesheets for LP at all, the system will refer to the message's `en-us.less` styles by default.

#### Adding the LP HTML code directly

The first option is to add the full HTML code directly. You will see this style of building LPs used most of the time. It is the same concept as adding the full HTML code to the message level in EPT. Meaning you'd add the entire HTML string, including doctype, html, head, and body tags to the message level. In HEDWIG's case we will add this to `landing.html`.

Keep in mind of a couple important differences when doing this in HEDWIG:
- you must link to your stylesheet using the ```<link>``` tag.
- change the stylesheet extension to **.css** instead of **.less**. See example below:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns:v="urn:schemas-microsoft-com:vml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Landing Page</title>
    <link href="en-us-lp.css" rel="stylesheet" />
  </head>
  <body>    
    LANDING PAGE CONTENT
  </body>
</html>
```

#### Building LP as a traditional email message

The second option is to build your landing page like you would in `index.html`, meaning you are extending layouts and building the template components which will get compiled at build time to generate the final code output to GAMMA.

When building landing pages this way you can simply add your **.less** files to the preferred(global or local) `less/lp/` folder. On build time it will pull the necessary styles as long as you are following the [naming convention rules](#LP-LESS-naming-rule) above.

This is a viable alternative method to use if your landing page is more sophisticated and is more similar to an webpage than a basic "Thank you for your feedback." LP.

## Localization

There are a few important rules to follow when working with multiple languages.

#### Localized copy files

- To add a new language, create a new .yml file inside the `copy` folder. Copy files must ***always*** be placed in the `copy` folder so the build script can detect multiple languages.

- For naming convention, use the language codes used in GAMMA/EPT. *See [Supported languages codes](#supported-language-codes) for a full list codes.*
  - Example: `en-us.yml`, `en-gb.yml`, `ja.yml`, etc

#### Localized LESS files

If language specific CSS is needed you can create additional LESS files in the `src/less` folder. ***Important:*** *Do not put language specific .less files in the global `assets/less` folder. It should only be used for base styles shared across the entire campaign.*

Language specific LESS files should follow the same naming convention your YAML files.

It is also important to `@import` your `en-us.less` file at the top of your localized less files(unless not applicable).
```less
@import './en-us.less';
```

**Note:** If a language does **not** need any CSS overrides you do not need to create a .less file for it. The builder will simply point to `en-us` styles by default if it does not detect a .less file for a certain language.

#### Supported language code

***Language names for .yml and .less files are not case sensitive.***

|   Language  | Language Code |
| ----------- | ------------- |
| Afrikaans	| af |
| Albanian | sq |
| Amharic	| am |
| Arabic | ar |
| Armenian | hy |
| Azerbaijani	| az |
| Basque | eu |
| Belarusian | be |
| Bengali	| bn |
| Bosnian	| bs |
| Bulgarian	| bg |
| Burmese	| my |
| Catalan	| ca |
| Chinese	| zh |
| ChineseHongKong	| zh-HK |
| ChineseTaiwan	| zh-TW |
| Croatian | hr |
| Czech	| cs |
| Danish | da |
| Dutch	| nl |
| English	| en |
| EnglishAU	| en-AU |
| EnglishUK	| en-GB |
| EnglishUS	| en-US |
| Estonian | et |
| Filipino | fil |
| Finnish | fi |
| French | fr |
| FrenchCanada | fr-CA |
| Galician | gl |
| German | de |
| Gerogian | ka |
| Greek	| el |
| Gujarati | gu |
| Hebrew | iw | 
| Hindi	| hi |
| Hungarian	| hu |
| Icelandic	| is |
| Indonesian | id |
| Irish	| ga |
| Italian	| it |
| Japanese | ja |
| Kannada	| kn |
| Kazakh | kk |
| Khmer	| km |
| Korean | ko |
| Kyrgyz | ky |
| Lao	| lo |
| Latvian	| lv |
| Lithuanian | lt |
| Macedonian | mk |
| Malay	| ms |
| Malayalam	| ml |
| Marathi	| mr |
| Mongolian	| mn |
| Nepali | ne |
| Norwegian	| no |
| Persian | fa |
| Polish | pl |
| Portuguese | pt |
| PortugueseBrazil | pt-BR |
| PortuguesePortugal | pt-PT |
| Punjabi	| pa |
| Romanian | ro |
| Russian	| ru |
| Serbian	| sr |
| Sinhala	| si |
| Slovak | sk |
| Slovenian	| sl |
| Spanish	| es |
| SpanishLatinAmerica	| es-419 |
| Swahili	| sw |
| Swedish	| sv |
| Tamil	| ta |
| Telugu | te |
| Thai | th |
| Turkish	| tr |
| Ukranian | uk |
| Urdu | ur |
| Uzbek	| uz |
| Vietnamese | vi |
| Welsh	| cy |
| Zulu | zu |

## Exporting files for translation

#### How it worked in EPT

When submitting files to go/localize for translation we used to export the en-US .arb file to hand-off to the project manager. Once translation is complete they would send us the translated .arb files to upload back into EPT.

#### How it works in HEDWIG

The process in HEDWIG is very similar except for that we will be using a .json file for go/localize translation requests. The .json file is used strictly for translation purposes only and should not be used in development(building your emails). For development, yaml is still the preferred file type.

If you're on the latest version of HEDWIG, your `src/copy/l10n` folder should contain the following subfolders:

- arb
- ept-yaml
- exports
- translated-json
- translated-yaml

When you receive a WorkFront request to pull a YAML/JSON file for translation, you can use the `npm run create-json` command to convert your yaml files into a polyglot friendly json file. This command will output the json file in the **exports** folder. This is the json file that you will hand off to the PM.

After the json file has gone through polyglot you will receive all the translated files back from your PM. Extract these files into the **translated-json** folder and run the `npm run create-yaml` command. This will convert the json files back into yaml format and output the results in the **translated-yaml** folder.

Move the translated yaml files into your main **yaml** folder located one level up (src/copy/yaml) so they can be used in your message.

## Compiling the final output

To compile your code run the build command `npm run build`. This will generate 3 new folders inside your message folder:

**IMPORTANT:** `npm run build` will compile the message in the current working directory of your terminal. If you have multiple messages, always double check you are in the correct directory before compiling.

- `stage` contains the compiled nunjucks and LESS->CSS files. This is used only as a staging process for the compiler and can be ignored.

- `proof` contains the HTML with rendered Freemarker code, similar to turning customer data ON in EPT.

- `build` contains the HTML with raw Freemarker code, similar to turning customer data OFF in EPT and also the same code that would go into GAMMA.

**Note:** See [dev scripts](#dev-scripts) for list of available npm commands.

## Using build-on-save

*This feature is currently under maintenance and not support for this version of LDP. Please use `npm run build` as an alternative.*

## Using shared vs local file paths

There are some key differences for file pathing in LDP vs EPT. When importing, including, or extending files in Nunjucks the file path is relative to the campaign level.

```jinja
{%- extends 'assets/layout/sublayout.html' %}
```
In the example above the file path is pointing to the global 'assets' folder which contains another global folder 'layout' containing 'sublayout.html'.

'sublayout.html' lives in a global folder so it will be available to all messages in the campaign. To override a global asset file with a local version, change the file path to your message level.

For example, if you are working on `message-1` (campaign-boilerplate --> message-1) and want to use a local 'sublayout.html' file inside message-1's `src/layout/` folder:
  
change the file path from
```jinja
{%- extends 'assets/layout/sublayout.html' %}
```
 to 
 ```jinja
{%- extends 'message-1/src/layout/sublayout.html' %}
 ```
 *When importing, including, or extending files in Nunjucks the file path is relative to the campaign level.*

#### Importing shared vs local LESS files

When importing files in LESS you will need to add a prefix to the file path depending on whether you are importing from the global or local `less` folder.

If importing styles from the global folder add the prefix `./../` to the file path.   
  - For example: 
  ```less
    @import './../assets/less/base_styles.less';
  ```

If importing styles from a local folder you do NOT need the file path and only the prefix `./` is required.
  - For example: 
  ```less
    @import './base_styles.less';
  ```

## Dev scripts

|    Prefix      |    Command    | Description  |
| ----------- | ------------- | ------------ |
| npm         | `install`     | Installs project dependencies |
| ~~npm&nbsp;run~~ | ~~`dev`~~    | **NOT SUPPORTED IN THIS VERSION** ~~Watches for file changes in development HTML and LESS files and runs `npm run build` on save~~ |
| npm run     | `build`       | Manually run the gulp tasks 'build-html' and 'build-pt' (also outputs a `proof` directory for browser preview and rendered freemarker)  |
| npm run     | `build-g`     | Same as `npm run build` but skips the the freemarker rendering (May be helpful for builds with lots of languages) |
| npm run     | `build-amp`   | Compiles an AMP version |
| npm run     | `preview`     | Starts preview mode with rendered Freemarker and ability to cycle through recipient data |
| npm run     | `create-json` | Converts yaml file to json file (results stored in src/copy/l10n/exports) |
| npm run     | `create-yaml` | Converts translated json files to yaml (results stored in src/copy/l10n/translated-yaml) |
| npm run     | `parse-arb`   | Converts .arb file to yaml (results stored in src/copy/l10n/ept-yaml) |
| npm run     | `export`      | Creates a zip archive for GAMMA upload |
| npm run     | `json`        | Converts yaml files to json format for l10n requests, output folder: copy/l10n |
| gulp        | `export`      | Alternative for `npm run export` |

# DOCS WIP...