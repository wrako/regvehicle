
#!/bin/bash

echo "🔧 Backing up source files..."
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

echo "🔧 Commenting out duplicate entries in sources.list..."
sudo sed -i '/^deb .*noble/ s/^/#/' /etc/apt/sources.list

echo "🔧 Replacing sk.archive.ubuntu.com and security.ubuntu.com with archive.ubuntu.com..."
sudo sed -i 's|https://sk.archive.ubuntu.com|http://archive.ubuntu.com|g' /etc/apt/sources.list.d/ubuntu.sources
sudo sed -i 's|https://security.ubuntu.com|http://archive.ubuntu.com|g' /etc/apt/sources.list.d/ubuntu.sources

echo "🔧 Updating package lists using IPv4 only..."
sudo apt-get -o Acquire::ForceIPv4=true update

echo "✅ Done. You can now run 'sudo apt-get upgrade' if needed."
