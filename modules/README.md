# KTANEirl Modules

This folder structure contains the [**firmware code**](#firmware), [**circuit schematics**](#circuit-schematics) and [**3D files**](#3d-files) of the KTANEirl modules.

## Firmware

This code is the firmware for the KTANEirl project. Each module has a specific firmware code  which runs on the module's Arduino nano.

### Requirements

#### VSCode with PlatformIO

- Install VSCode from the official [Website](https://code.visualstudio.com/)

- install the [PlatformIO IDE](https://marketplace.visualstudio.com/items?itemName=platformio.platformio-ide) extension from the marketplace via the extensions menu on the left on VSCode

#### Install dependencies

Dependencies should be installed automatically by PlatformIO.
It uses a *platform.ini* file from each specific module directory to find the required dependencies.

### Usage

Open the [firmware.code-workspace](../firmware.code-workspace)

### Build

- Select the Module to be built in the bottom bar in VSCode
- Build it using CTRL+ALT+B

### Deploy

- Connect your device to the USB port of the Arduino nano
- Upload the firmware with the keybinding CTRL+ALT+U

### Monitor

- Open the Serial Port Monitor with CTRL+ALT+S

## Circuit schematics

The circuit schematics are made with KiCad. To open the schematics, you need to install KiCad from the official [Website](https://kicad.org/).

## 3D files

The 3D files are created in Onshape and exported as STL files.

To add or change 3D files, you need to create an account on [Onshape](https://www.onshape.com/). Then you can copy [this project](https://cad.onshape.com/documents/d60e5291216102ee16b1bc50/w/64ba86776bbcf32b675bc0db/e/fd5f7a77dd2c26ad647590be?renderMode=0&uiState=63de8efb57d2cb48785a0d47) and make your changes.
