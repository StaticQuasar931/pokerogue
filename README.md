<!--
SPDX-FileCopyrightText: 2024-2026 Pagefault Games

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

<div align="center"><picture><img src="https://github.com/pagefaultgames/pokerogue-assets/blob/beta/images/logo.png?raw=true" width="300" alt="PokéRogue"></picture>

[![Discord Static Badge](https://img.shields.io/badge/Community_Discord-blurple?style=flat&logo=discord&logoSize=auto&labelColor=white&color=5865F2)](https://discord.gg/pokerogue)
[![Test Coverage Endpoint Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Bertie690/9cdfc49361824d1d5a57b7e8b38855d8/raw/coverage-badge.json)](https://github.com/pagefaultgames/pokerogue/actions/workflows/tests.yml) \
[![Docs Coverage Static Badge](https://pagefaultgames.github.io/pokerogue/beta/coverage.svg)](https://pagefaultgames.github.io/pokerogue/beta)
[![Biome Linting Static Badge](https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![GNU AGPLv3 License Static Badge](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
</div>

PokéRogue is a browser based Pokémon fangame heavily inspired by the roguelite genre. Battle endlessly while gathering stacking items, exploring many different biomes, fighting trainers, bosses, and more!

# Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md), this includes instructions on how to set up the game locally.

## Play this prepared copy on Windows

Double-click **PLAY.cmd** in this folder. It opens the game in your browser. Keep the launcher window open while you play. Node.js is required and is already installed on this computer.

The launcher serves the finished files in **dist** at **http://127.0.0.1:8457/**. It does not need an account, a game-server API, or an internet connection to play the prepared copy. Open the game through the launcher rather than opening index.html directly.

Use the arrow keys to move, **Z** or **Space** to select and confirm, **X** or **Backspace** to go back, and **M** or **Escape** for the menu. On the starter screen, highlight a Pokémon, press **Z**, choose **Add to Party**, and press **Z** again. After choosing your team, press **Enter** to start and confirm the prompt.

Saves stay in that browser. Use **Menu > Manage Data** to export a backup or import it later. A different browser, port, or the GitHub Pages site has its own saves. Account sync, online rankings, and server administration are unavailable in this standalone copy.

## Rebuild or set up a fresh clone

Building requires Node.js 24.9 or newer, pnpm 10, and internet access for the initial downloads.

1. Clone with the required submodules: `git clone --recurse-submodules YOUR-REPOSITORY-URL`.
2. If already cloned, run `git submodule update --init --recursive` in the project folder.
3. Install dependencies: `pnpm install --frozen-lockfile --ignore-scripts`.
4. Build the entire standalone game: `pnpm build`.
5. Double-click **PLAY.cmd**, or run `npm start`.

Both `pnpm build` and `pnpm build:pages` enable local saves, include all artwork/audio/translations, correct the app paths, and reject any output file over 20,000,000 bytes. `pnpm dev` starts the development server when editing the source.

## Publish with GitHub Pages

Push this source repository and its submodule references to your GitHub repository. In **Settings > Pages**, select **GitHub Actions** as the build source. The **Deploy standalone game to GitHub Pages** workflow publishes from your repository's default branch. You can also run it from the Actions tab. Relative paths support both a repository URL and a custom domain.

The assets and translations are pinned public Git submodules. GitHub Actions downloads them when building, then includes them in the published site. Gameplay reads those files from the same site and uses browser saves. Review the licensing notes below when redistributing the game.

# 📝 Credits

> If this project contains assets you have produced and you do not see your name, **please** reach out, either [here on GitHub](https://github.com/pagefaultgames/pokerogue/issues/new) or via [Discord](https://discord.gg/pokerogue).

Thank you to all the wonderful people that have contributed to the PokéRogue project! You can find the credits [here](./CREDITS.md).

# Licensing

This repository seeks to be [REUSE compliant](https://reuse.software/): copyright and/or licensing information for each file is stored
either in the file itself or in an associated `REUSE.toml` file.

The full licensing information for each file can be found by utilizing [REUSE's tooling](https://github.com/fsfe/reuse-tool), such as via `reuse spdx`. \
An abbreviated summary of said information is as follows:
- All source code belonging to the project, unless otherwise noted, is licensed under [AGPL-v3.0-only](LICENSES/AGPL-3.0-only.txt).
- All forms of documentation (both Markdown files[^1] and any comments explicitly documenting source code) are licensed under [CC-BY-NC-SA-4.0](LICENSES/CC-BY-NC-SA-4.0.txt).
- Auto-generated files produced by external tools or files of insignificant originality are not copyrighted and are licensed under [CC0-1.0](LICENSES/CC0-1.0.txt).
- To the extent that the assets we provide are [licensable and applicable](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en#ref-exception-or-limitation), they are licensed under [CC-BY-NC-SA-4.0](LICENSES/CC-BY-NC-SA-4.0.txt) unless otherwise noted.
  Exceptions can be found in associated `REUSE.toml` files.
  - ⚠️ Files in `assets/` that are not explicitly licensed via `REUSE.toml` files should be considered to have _no_ licensing / copyright information.

[^1]: Including this README
