
wget https://www.airspayce.com/mikem/bcm2835/bcm2835-1.71.tar.gz

# Extract the tarball
tar zxvf bcm2835-1.71.tar.gz

cd bcm2835-1.71

# Configure the library
./configure

# Build the library
make

sudo make check

# Install the library
sudo make install

cd ..

# delete the files
rm -rf bcm2835-1.71
rm bcm2835-1.71.tar.gz
