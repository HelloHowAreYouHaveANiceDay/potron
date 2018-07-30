<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    
   -->
   <main>
       <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
      </div>
      <poview></poview>
    </main>
  </div>
</template>

<script>
  import Poview from './poview';

  export default {
    name: 'landing-page',
    components: { Poview },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
      },
    },
  };
</script>

<style>

</style>
