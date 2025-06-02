#!/bin/bash

SRC_ROOT=../isometric-icon
DEST_ROOT=../v0-unlimited-grid/public/images

mkdir -p "$DEST_ROOT"

IMPORTED=()
SKIPPED=()

for FOLDER in 01_animals 02_things 03_persona 04_dogs; do
  for SRC_FILE in "$SRC_ROOT/$FOLDER"/*; do
    if [ -f "$SRC_FILE" ]; then
      FILENAME=$(basename "$SRC_FILE")
      FILENAME_CLEAN=$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
      DEST_FILE="$DEST_ROOT/$FILENAME_CLEAN"
      if [ ! -f "$DEST_FILE" ]; then
        cp "$SRC_FILE" "$DEST_FILE"
        IMPORTED+=("$FILENAME_CLEAN")
      else
        SKIPPED+=("$FILENAME_CLEAN")
      fi
    fi
  done
done

echo ""
echo "=== Imported Files ==="
for FILE in "${IMPORTED[@]}"; do
  echo "$FILE"
done

# echo ""
# echo "=== Skipped (Already Exists) ==="
# for FILE in "${SKIPPED[@]}"; do
#   echo "$FILE"
# done
