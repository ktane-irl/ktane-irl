# KTANEirl Backend

This code is the backend for the KTANEirl project. It is designed to run on a raspberry pi and communicate with the frontend via the API.

## Requirements

### **Node.js >= 18.12.0**

Download from [nodejs.org](https://nodejs.org/en/download/) or use

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

on Linux Ubuntu or use the [setup script](../setup-pi.sh) on the pi.

### **yarn >= 1.22.19**

use this to install yarn:

```bash
npm install -g yarn
```

## Setup

### Install dependencies

```bash
yarn install
```

## Usage

### Start in normal mode

This command builds and the starts the backend.

```bash
yarn serve
```

### Start in simulator mode

**Start with API dummy-mode:**  
Use this if the Backend does not yet have the needed Module.

```bash
yarn serve-api
```

**Start with simulated SPI:**  
If the Backend class is fully implemented, use this to simulate the SPI communication.
The simulated commands can be changed in [app.sim.ts](src/app.sim.ts)

```bash
yarn serve-sim
```

### Other commands

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `yarn build`    | Build the project                                |
| `yarn tsc`      | Automatically build the project on changes       |
| `yarn lint`     | Lint the project                                 |
| `yarn auto`     | Run in normal mode and restart on changes        |
| `yarn auto-api` | Run in dummy-mode and restart on changes         |
| `yarn auto-sim` | Run in simulated SPI mode and restart on changes |
| `yarn clean`    | Delete all build files                           |
| `yarn test`     | Run all tests                                    |
| `yarn autotest` | Automatically run all tests on changes           |
