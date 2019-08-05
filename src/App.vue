<template>
    <div id="app" style="margin: 20px 0;">
        <daterange-picker
                locale="de"
                submit-title="Ok"
                from="2019-08-04T14:46:58.570Z"
                to="2019-08-05T14:46:58.570Z"
                begin="2016-02-19T00:00:00.000+01:00"
                @update="checkUpdate"
                @reset="checkReset"
        />
    </div>
</template>

<script>
    import DaterangePicker from './components/DaterangePicker'

    export default {
        name: 'app',
        components: {
            DaterangePicker
        },
        methods: {

            checkUpdate (values) {
                console.info('update', values)
            },
            checkReset (values) {
                console.info('reset', values)
            }
        }
    }

</script>

<style lang="scss">
    #app {
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        padding: 5vw;
    }
</style>
