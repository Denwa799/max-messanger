# MAX Messenger

Клиент мессенджера MAX (GREEN-API) на React 19 + TanStack Start/Router + Tailwind 4, FSD-архитектура.

## Требования

- **Node.js ≥ 24** (см. раздел [Установка Node.js](#установка-nodejs) ниже, если он ещё не установлен).
- **npm ≥ 11** — идёт в комплекте с Node.js 24, отдельно ставить не нужно.

Проверить текущие версии:

```bash
node -v   # должно быть v24.x или выше
npm -v    # должно быть 11.x или выше
```

## Установка Node.js

Если команда `node -v` не найдена или показывает версию ниже 24 — установите Node.js одним из способов ниже.

### Windows

**1. Официальный установщик (самый простой)**

1. Откройте https://nodejs.org/ и скачайте **LTS**-версию (`node-v24.x.x-x64.msi`).
2. Запустите установщик, оставьте галочку «Add to PATH».
3. Откройте **новое** окно терминала (PowerShell) и проверьте: `node -v`.

**2. winget (встроен в Windows 10/11)**

```powershell
winget install OpenJS.NodeJS.LTS
```

**3. Chocolatey**

```powershell
choco install nodejs-lts -y
```

**4. nvm-windows (если нужно несколько версий Node)**

1. Скачайте `nvm-setup.exe` со страницы https://github.com/coreybutler/nvm-windows/releases.
2. Установите и в **новом** терминале выполните:

```powershell
nvm install 24
nvm use 24
```

### macOS

**1. Официальный установщик**

1. Скачайте **LTS**-версию (`node-v24.x.x.pkg`) с https://nodejs.org/.
2. Запустите `.pkg` и пройдите установку.

**2. Homebrew**

```bash
brew install node@24
brew link --overwrite --force node@24   # чтобы node стал доступен в PATH
```

**3. nvm (менеджер версий)**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# перезапустите терминал, затем:
nvm install 24
nvm use 24
```

### Linux

**1. nvm (рекомендуется — не требует прав root и легко менять версии)**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# перезапустите терминал, затем:
nvm install 24
nvm use 24
```

**2. NodeSource (системный Node.js 24)**

Debian / Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

RHEL / Fedora / CentOS:

```bash
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo -E bash -
sudo dnf install -y nodejs
```

**3. Пакетный менеджер дистрибутива**

```bash
sudo apt install nodejs npm      # Debian / Ubuntu
sudo dnf install nodejs npm      # Fedora
sudo pacman -S nodejs npm        # Arch
```

> Проверьте версию (`node -v`): в репозиториях дистрибутивов она часто устаревшая.
> Если младше 24 — используйте nvm или NodeSource.

## Локальный запуск

```bash
npm ci                 # установка зависимостей строго по package-lock.json
cp .env.example .env   # затем укажите VITE_GREEN_API_MAX_URL в .env
npm run dev            # http://localhost:3000
```

> В Windows PowerShell вместо `cp` используйте `Copy-Item .env.example .env`.

Переменные окружения:

| Переменная               | Назначение                                                            |
| ------------------------ | --------------------------------------------------------------------- |
| `VITE_GREEN_API_MAX_URL` | Базовый URL MAX API (обязательна, иначе приложение падает при старте) |
| `VITE_BASE_PATH`         | Базовый путь сборки для деплоя в подпапку (по умолчанию `/`)          |

## Скрипты

| Скрипт                  | Что делает                                                     |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Vite dev-сервер (порт 3000)                                    |
| `npm run build`         | typecheck + прод-сборка в `dist/client` (SPA-режим)            |
| `npm run preview`       | предпросмотр прод-сборки                                       |
| `npm run test`          | тесты в watch-режиме (Vitest)                                  |
| `npm run test:run`      | тесты один раз (Vitest)                                        |
| `npm run test:coverage` | тесты с отчётом покрытия                                       |
| `npm run lint`          | линтер (oxlint)                                                |
| `npm run lint:fsd`      | проверка FSD-архитектуры (steiger)                             |
| `npm run format`        | форматирование (Prettier)                                      |
| `npm run typecheck`     | проверка типов (tsc)                                           |
| `npm run check`         | формат + линтеры + FSD + typecheck + тесты                     |
| `npm run prepare-push`  | format + lint + FSD-линт + build (запускается в pre-push хуке) |

## Деплой на GitHub Pages

Сайт живёт по адресу https://denwa799.github.io/max-messanger/

- Проект собирается как SPA (`dist/client`) и работает в подпути без правок кода: base-путь
  задаётся переменной `VITE_BASE_PATH` (по умолчанию `/`), а `vite.config.ts` подставляет её в `base`.
  От `base` зависят и ссылки на файлы из `public/` (`src/shared/ui/space-pattern-background`
  собирает URL из `import.meta.env.BASE_URL`), и `basepath` роутера — TanStack Start выставляет его сам.
- GitHub Pages не поддерживает history fallback для SPA — при сборке `index.html`
  копируется в `404.html`, поэтому прямые ссылки на `/chat/<id>` открываются корректно.
- Публикация идёт из Actions: **Actions → Deploy to GitHub Pages → Run workflow**
  (workflow `.github/workflows/deploy-pages.yml`, артефакт — `dist/client`).
- Перед первым запуском в **Settings → Pages** должен быть выбран
  **Source: GitHub Actions**.
