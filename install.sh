#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Installing Hellhound dependencies..."
cd "$DIR"
npm install

echo "Linking hellhound command..."
chmod +x "$DIR/bin/hellhound"
ln -sf "$DIR/bin/hellhound" /usr/local/bin/hellhound

echo "Done. Run 'hellhound' from anywhere to launch."
