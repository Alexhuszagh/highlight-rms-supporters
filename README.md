# Highlight RMS Supporters
A cross-platform utility to highlight RMS support letter signers.

# Table Of Contents

- [Prebuilt Extensions/Userscripts](#)
- [Design](#design)
- [Developing](#developing)
- [Installation](#installation)
- [Bad Faith Criticism](#bad-faith-criticism)
- [License](#license)
- [Contributing](#contributing)

# Prebuilt Extensions/Userscripts

Pre-built extensions and userscripts are provided under the [dist](/tree/main/dist) directories. 

# Design

This browser extension/userscript fetches and parses a list of signers to the RMS support letter, and then uses local storage to store stylesheets to highlight their names on Github or Gitlab. 

# Developing

In order to create a simple, cross-platform browser extension with code re-use, we have a single `src` folder and `icons` directory, which are then distributed with the platform-specific manifests to create the package. All the tools to generate these dist packages can be found under `tools`.

The following dependencies are required for building your own `dist` packages:
- Node.js
- Bash
- Rollup.js

Rollup.js may be installed by:

```bash
npm install --global rollup
```

# Installation

Chrome and Firefox do not allow installing packages outside the app stores for security reasons. However, the preferred way is installing a Tampermonkey userscript.

First, if desired, build the desired extensions. If using the prebuilt files, skip this step.

```bash
# Build the Tampermonkey extension.
tools/make-userscript.sh

# Build the Firefox extension.
tools/make-firefox.sh

# Build the Chrome/Chromium extension.
tools/make-chromium.sh
```

*Tampermonkey/GreaseMonkey*

Click on the Tampermonkey or Greasemonkey extension icon, click "Create a new script..." or "New user script..." and copy and paste the contents of `dist/userscript/main.js` into the script, and save the contents.

*Chrome*

Go to settings (`chrome://settings/` in the URL bar), click "Extensions", and activate "Developer Mode" in the top-right corner. Next, click "Load Unpacked" in the top-left corner. Then, navigate to `dist/chromium` and load the folder.

*Firefox*

Go to `about:debugging` in the URL bar, click "This Firefox" on the left tab, go under "Temporary Extensions", and click "Load Temporary Add-on…". Then navigate to `dist/firefox`, and load `manifest.json`.

This extension will be removed every time you reset Firefox or your computer, and therefore this is *not* a recommended solution.

# Bad Faith Criticism

> But what about GDPR/User Privacy?
This script stores no user data on any server, only locally, and is fetched from a public list of signatories. You are free to remove your name from the RMS support letter at any time.

> Won't this condone harassment?
First, nothing compares to the serial harassment Richard Stallman has perpetuated over decades. But no, all it does it provide a stylesheet highlighting names on developer websites, and does not provide external contact information.

> What about free speech?
Free speech does not protect you from criticisms of said speech. You are not entitled to a platform.

![Free Speech](https://imgs.xkcd.com/comics/free_speech.png)

# License

All code is dual licensed under the Apache 2.0 license as well as the MIT license. See the LICENCE-MIT and the LICENCE-APACHE files for the licenses. All icons are shared from their [creator](https://www.iconfinder.com/kmgdesignid) under a [Creative Commons 3.0 Unported](https://creativecommons.org/licenses/by/3.0/) license.

This project will not use a GPL license. Thanks for asking.

# Contributing

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in highlight-rms-supporters by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
