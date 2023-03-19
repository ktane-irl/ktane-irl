# KTANEirl Package Simulator

This code is the package simulator for the KTANEirl project. It is designed to run on a raspberry pi and send simulated SPI commands to the connected module.

## Setup

### Install dependencies

```bash
yarn install
```

## Usage

First, change the byte string, which should represent the SPI command, in [app.ts](src/app.ts).

Then, start the simulator:

```bash
yarn serve
```

The output then shows the sent and received bytes from the module.
