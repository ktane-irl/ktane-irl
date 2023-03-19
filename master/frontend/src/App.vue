<template>
    <v-app id="inspire">
        <v-navigation-drawer v-model="drawer" app>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="title">
                        KTANEirl
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        KTANE in real life!
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list dense nav>
                <v-list-item v-for="item in items" :key="item.title" :to="item.to" link>
                    <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

            <v-toolbar-title>KTANEirl</v-toolbar-title>

            <v-spacer></v-spacer>

            <div>
                <v-tooltip v-if="!$vuetify.theme.dark" bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" color="info" small fab @click="toggleDarkTheme()">
                            <v-icon class="mr-1">mdi-moon-waxing-crescent</v-icon>
                        </v-btn>
                    </template>
                    <span>Dark Mode On</span>
                </v-tooltip>

                <v-tooltip v-else bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" color="info" small fab @click="toggleDarkTheme()">
                            <v-icon color="yellow">mdi-white-balance-sunny</v-icon>
                        </v-btn>
                    </template>
                    <span>Dark Mode Off</span>
                </v-tooltip>
            </div>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
    name: "App",
    data: () => ({
        drawer: false,
        items: [
            { title: "Configure & play", icon: "mdi-wrench-cog", to: "/" },
            { title: "Test modules", icon: "mdi-test-tube", to: "/testmode" },
            { title: "About", icon: "mdi-help-box", to: "/about" }
        ],
    }),
    methods: {
        toggleDarkTheme() {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark
        },
    }
})
</script>
