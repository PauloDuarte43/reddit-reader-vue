<template>
  <div id="app" class="container">
    <RedditPosts />
  </div>
</template>

<script>
import RedditPosts from './components/RedditPosts.vue';

export default {
  name: 'App',
  components: {
    RedditPosts
  }
};
</script>

<style>
#app {
  margin-top: 20px;
}
</style>
