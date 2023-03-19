<template>
    <v-container>
        <!--todo own logo -->
        <v-row class="text-center">
            <v-col cols="12">
                <v-img :src="require('../assets/logo.svg')" class="my-3 g" contain height="200" />
            </v-col>

            <v-col class="mb-4">
                <h1 class="display-2 font-weight-bold mb-3">
                    Keep talking and nobody explodes - IN REAL LIFE!
                </h1>

                <p class="subheading font-weight-regular">
                    You have done it! You set up KTANEirl and know all about the project, I guess.
                    Otherwise, don't hesitate to check out the <a href="https://github.com/ktane-irl/ktane-irl">Github
                        repo</a>.
                </p>
                <br>
                <h2 class="headline">
                    Have fun playing!
                </h2>
            </v-col>

            <v-col class="mb-5" cols="12">
                <h2 class="headline font-weight-bold mb-3">
                    Bomb Manuals
                </h2>

                <v-row justify="center">
                    <a v-for="(manual, i) in manualLinks" :key="i" :href="manual.href" class="subheading mx-3"
                        target="_blank">
                        {{ manual.text }}
                    </a>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>


<script lang="ts">
import Vue from "vue"

export default Vue.extend({
    name: "AboutView",

    data: () => ({
        manualLinks: [
            {
                text: "English",
                href: "https://www.bombmanual.com/print/KeepTalkingAndNobodyExplodes-BombDefusalManual-v1.pdf",
            },
            {
                text: "German",
                href: "https://www.bombmanual.com/de/index.html",
            },
            {
                text: "Other languages",
                href: "https://www.bombmanual.com/language.html",
            },
        ],
    }),
})
</script>
