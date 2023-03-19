# KTANEirl Frontend

This code is the frontend for the KTANEirl project. It is designed to run on a raspberry pi and communicate with the backend via the API.

## get started

* setup and start dev container (See <https://code.visualstudio.com/docs/devcontainers/create-dev-container>)
* `cd master/frontend`
* `yarn`
* `yarn serve`

<!-- ## create a vue app (don't do this, it's already created)
* `cd master`
* `vue create ktaneirl`  
  * Manually select features
  * Select Babel, TypeScript, Progressive Web App (PWA) Support, Router, Linter / Formatter, Unit Testing
  * 2.x (as vuetify does not support vue3 currently)
  * Confirm everything
* `cd ktaneirl`
* `vue add -D vuetify`
* `yarn add express typescript ts-node nodemon @types/node express @types/express`
* `yarn serve` -->

## add a module / version

1. `components/testmode`: Copy VersionComponentDummy and align to other module code
2. `views/TestmodeView.vue`: Import component; add to components const; add case in show_component_dialog

## initial setup for production

to setup backend and frontend on the pi, run the [setup script](../setup-pi.sh) on it.

## deployment

to deploy the frontend, run the [deploy script](../deploy-frontend.sh) on your local machine.
