<template>
  <div>
	<div class="potree_container" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; ">
		<div id="potree_render_area"></div>
		<div id="potree_sidebar_container"> </div>
	</div>
  </div> 
</template>

<script>
/* eslint-disable */
import Potree from '../potree/potree'

export default {
  name: 'poview',
  data(){
    return {
      viewer: null,
    }
  },
  mounted(){
    this.initViewer();
  },
  methods:{
    initViewer(){
      this.viewer = new Potree.Viewer(document.getElementById('potree_render_area'));
    }
  }
};
</script>

<style scoped>

</style>

