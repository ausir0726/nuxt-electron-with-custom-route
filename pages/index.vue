<template>
  <div>
    <h1>Welcome!</h1>
    <nuxt-link to="/about">About page</nuxt-link>
    <ul v-if="malscraper.length">
      <li v-for="item in malscraper">title : {{item.title}}</li>
    </ul>
    <div v-else>
      <p>mal-scraper is on fetching data... please wait..</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return  { malscraper: [] };
  },
  async mounted() {
    const { data } = await axios.get(`malScraper.json?year=2016&season=fall`);
    this.malscraper = data ;
  }
};
</script>