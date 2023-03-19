sudo apt-get update
sudo apt-get install cmake -y


wget https://github.com/fpagliughi/sockpp/archive/refs/tags/v0.7.1.tar.gz

# Extract the tarball
tar zxvf v0.7.1.tar.gz

cd sockpp-0.7.1

# Install the library
cmake -Bbuild
sudo cmake --build build/ --target install
sudo ldconfig

cd ..

# delete the files
rm -rf sockpp-0.7.1
rm v0.7.1.tar.gz
