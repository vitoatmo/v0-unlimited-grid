#!/bin/bash
git clone --depth=1 https://github.com/vitoatmo/isometric-icon.git temp-icons
cp temp-icons/data.json ./public/data.json
mkdir -p ./public/imgs
cp -r temp-icons/imgs/* ./public/imgs/
rm -rf temp-icons



