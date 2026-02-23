#!/bin/bash

# Fix all person.interests.map patterns to add filtering

files=(
  "/Users/achi/Sandboxes/Projects/connect/src/app/huddles/page.tsx"
  "/Users/achi/Sandboxes/Projects/connect/src/app/profile/page.tsx"
  "/Users/achi/Sandboxes/Projects/connect/src/app/safety/page.tsx"
  "/Users/achi/Sandboxes/Projects/connect/src/app/prayers/page.tsx"
  "/Users/achi/Sandboxes/Projects/connect/src/app/groups/create/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Use sed to add .filter(pi => pi.interest != null) before .map
    sed -i.bak 's/person\.interests\.map/person.interests.filter(pi => pi.interest != null).map/g' "$file"
    # Also change ...pi.interest to ...pi.interest!
    sed -i.bak2 's/\.\.\.pi\.interest,/...pi.interest!,/g' "$file"
    rm -f "$file.bak" "$file.bak2"
    echo "Fixed: $file"
  fi
done
