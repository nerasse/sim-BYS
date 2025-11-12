#!/bin/bash
# Juste pour marquer les fichiers à mettre à jour
echo "resources.combinations.tsx"
echo "resources.bonuses.tsx"
echo "resources.jokers.tsx"
echo "resources.characters.tsx"
echo "resources.levels.tsx"
EOF SCRIPT
chmod +x tmp_make_crud.sh && bash tmp_make_crud.sh && rm tmp_make_crud.sh
