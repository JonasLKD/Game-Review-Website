#!/bin/bash

# SETUP SCRIPT
# run this script to install all the required tools and packages.

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

echo
echo "========= CHANGING DIRECTORY TO ${green}FILES${reset} =============="
echo
if [[ -f "./files" ]]
then
    cd files
fi
chmod +x .githooks/*
echo
echo "============= INSTALLING ${green}DEBIAN${reset} TOOLS =============="
echo
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y psmisc lsof tree sqlite3 sqlite3-doc build-essential
echo
echo "========= INSTALLING NODE USING ${green}NODESOURCE${reset} ========="
echo
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
echo
echo "=========== INSTALLING THE ${green}NODE PACKAGES${reset} ==========="
echo
npm install
npm audit fix
echo
echo "============== RUNNING THE ${green}UNIT TESTS${reset} =============="
echo
npm test
echo
echo "================ RUNNING THE ${green}LINTER${reset} ================"
echo
npm run linter
echo
echo "===== CHECKING THE VERSION OF ${green}NODEJS${reset} INSTALLED ====="
echo
node -v
echo "================= ${green}SETUP COMPLETED ${reset} ================="
