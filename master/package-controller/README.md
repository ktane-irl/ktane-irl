# KTANEirl Package Controller

This code is the package controller for the KTANEirl project. It is designed to run on a raspberry pi and create a connection with the backend through TCP and with the modules thorugh SPI.

## Setup
For the setup of the package controller two libarires must be installed. In order to do so the following two scripts need to be executed on the raspberry pi:
* install-bcm.sh
* install-sockpp.sh

## Usage
To start the the package controlle the file spi-package-controller needs to be executed. This can be done with the following command:
* sudo spi-package-controller

## Building the code
For building the project a Makefile has been created. After changed to the code this can be executed through the following command:
* make
