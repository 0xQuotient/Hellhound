#!/usr/bin/env bash
set -e

REPO_URL="https://github.com/0xQuotient/Hellhound.git"
INSTALL_DIR="$HOME/Hellhound"

echo "== Hellhound installer =="

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but was not found. Install git, then re-run this installer."
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js not found, installing..."
  if command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nodejs22 nodejs22-npm || sudo dnf install -y nodejs npm
  elif command -v apt >/dev/null 2>&1; then
    sudo apt update && sudo apt install -y nodejs npm
  elif command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy --noconfirm nodejs npm
  else
    echo "Could not detect a supported package manager (dnf/apt/pacman)."
    echo "Install Node.js 20+ manually, then re-run this installer."
    exit 1
  fi
fi

echo "Using Node $(node --version), npm $(npm --version)"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Existing install found at $INSTALL_DIR, pulling latest..."
  git -C "$INSTALL_DIR" pull
else
  echo "Cloning Hellhound into $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

echo "Installing dependencies..."
npm install

echo "Linking hellhound command..."
chmod +x "$INSTALL_DIR/bin/hellhound"
sudo ln -sf "$INSTALL_DIR/bin/hellhound" /usr/local/bin/hellhound

echo "Done. Run 'hellhound' from anywhere to launch."
