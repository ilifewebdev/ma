#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting git commit process...${NC}"

# Add all changes
echo "Adding files..."
git add .

# Commit changes
echo "Committing..."
git commit -m "v4.0 Gold Master: Complete Feature Release (Account System, Calendar, Share Optimization)"

echo -e "${GREEN}Commit completed successfully!${NC}"
read -p "Press any key to exit..."
