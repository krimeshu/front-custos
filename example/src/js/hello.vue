<template>
    <div class="container" :data-total="total">
        <p v-for="(item, idx) in list" :key="idx" v-text="item"></p>
        <p v-text="` -- ${name}`"></p>
    </div>
</template>

<script>
export default {
    props: ['name'],
    data() {
        return {
            list: ['Hello World'],
            total: 1
        }
    }
}
</script>

<style lang="scss" scoped>
%flex {
    display: flex;
}

.container {
    @extend %flex;
    background: #eff;
}
</style>