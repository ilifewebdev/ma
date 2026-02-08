#!/bin/bash
echo "----------------------------------------"
echo "   GitHub Update Script"
echo "----------------------------------------"

echo "1. Adding changes..."
git add .

echo "2. Committing changes..."
git commit -m "Update: Fix paths and improvements"

echo "3. Pushing to GitHub..."
git push origin main

echo "----------------------------------------"
echo "Done! Please wait 1-2 minutes for GitHub Pages to update."
echo "Then refresh your browser (Ctrl+F5)."
echo "----------------------------------------"
read -p "Press any key to exit..."
