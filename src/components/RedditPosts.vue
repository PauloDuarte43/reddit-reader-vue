<template>
  <div>
    <div class="top-bar">
      <div class="search-container">
        <input v-model="searchQuery" @keyup.enter="performSearch" type="text" placeholder="Pesquisar...">
        <button @click="performSearch">Pesquisar</button>
        <label>
          <input type="checkbox" :checked="includeOver18" @change="handleCheckboxChange">
          +18
        </label>
      </div>
      <div class="subreddit-buttons">
        <button @click="updateSubreddit('best', true)" v-if="!loading && posts.length > 0">Melhores</button>
        <button @click="updateSubreddit('new', true)" v-if="!loading && posts.length > 0">Mais Recentes</button>
        <button @click="updateSubreddit('top', true)" v-if="!loading && posts.length > 0">Mais Votados</button>
        <button @click="updateSubreddit('hot', true)" v-if="!loading && posts.length > 0">Mais Quentes</button>
      </div>
      <div class="current-subreddit">
        <h2>{{ this.currentSubreddit }}</h2>
        <select v-model="orderBy" @change="changeOrder" v-show="isSubbreddit()">
          <option value="best">Melhores</option>
          <option value="new">Mais Recentes</option>
          <option value="top">Mais Votados</option>
          <option value="hot">Mais Quentes</option>
          <option value="controversial">Mais Controversos</option>
        </select>
      </div>
    </div>

    <div v-for="post in posts" :key="post.data.id" class="post">
      <!-- <small>{{ post.data }}</small> -->
      <div
        v-if="post.data.over_18 && !showOver18Posts"
        class="overlay"
        @click="confirmOver18"
      >
        <p>Este post é marcado como conteúdo para maiores de 18 anos.</p>
        <p>Clique para confirmar que deseja ver o conteúdo.</p>
      </div>
      <h2>
        <a :href="post.data.url" target="_blank" class="post-link">
          {{ post.data.title }}
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="#ff0000" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M14.851 11.923c-.179-.641-.521-1.246-1.025-1.749-1.562-1.562-4.095-1.563-5.657 0l-4.998 4.998c-1.562 1.563-1.563 4.095 0 5.657 1.562 1.563 4.096 1.561 5.656 0l3.842-3.841.333.009c.404 0 .802-.04 1.189-.117l-4.657 4.656c-.975.976-2.255 1.464-3.535 1.464-1.28 0-2.56-.488-3.535-1.464-1.952-1.951-1.952-5.12 0-7.071l4.998-4.998c.975-.976 2.256-1.464 3.536-1.464 1.279 0 2.56.488 3.535 1.464.493.493.861 1.063 1.105 1.672l-.787.784zm-5.703.147c.178.643.521 1.25 1.026 1.756 1.562 1.563 4.096 1.561 5.656 0l4.999-4.998c1.563-1.562 1.563-4.095 0-5.657-1.562-1.562-4.095-1.563-5.657 0l-3.841 3.841-.333-.009c-.404 0-.802.04-1.189.117l4.656-4.656c.975-.976 2.256-1.464 3.536-1.464 1.279 0 2.56.488 3.535 1.464 1.951 1.951 1.951 5.119 0 7.071l-4.999 4.998c-.975.976-2.255 1.464-3.535 1.464-1.28 0-2.56-.488-3.535-1.464-.494-.495-.863-1.067-1.107-1.678l.788-.785z"/>
          </svg>
        </a>
      </h2>
      <p>{{ post.data.selftext }}</p>

      <div class="video-player">
        <video :data-video-id="getPostMedia(post).id + '_1'" v-if="getPostMedia(post).preview && getPostMedia(post).preview.reddit_video_preview && getPostMedia(post).preview.reddit_video_preview.fallback_url" controls>
          <source :src="getPostMedia(post).preview.reddit_video_preview.fallback_url">
        </video>
        <video :data-video-id="getPostMedia(post).id + '_2'" v-if="getPostMedia(post).media && getPostMedia(post).media.reddit_video && getPostMedia(post).media.reddit_video.fallback_url" controls>
          <source :src="getPostMedia(post).media.reddit_video.fallback_url">
        </video>
        <div v-if="!(getPostMedia(post).preview && getPostMedia(post).preview.reddit_video_preview && getPostMedia(post).preview.reddit_video_preview.fallback_url) && !(getPostMedia(post).preview && getPostMedia(post).preview.reddit_video_preview && getPostMedia(post).preview.reddit_video_preview.fallback_url)">
          <div v-if="hasSecureMediaEmbed(getPostMedia(post).secure_media_embed)">
            <div v-html="renderIframe(getPostMedia(post).secure_media_embed.content)"></div>
            <!-- <div v-html="renderIframe(post.data.secure_media_embed.content)"></div> -->
            <!-- <p><a :href="getIframeHref(post.data.secure_media_embed.content)">via RedGIFs</a></p> -->
          </div>
        </div>
      </div>

      <div v-if="getPostMedia(post).media_metadata && Object.keys(getPostMedia(post).media_metadata).length > 0" class="image-gallery">
        <div v-for="metadata in getPostMedia(post).media_metadata" class="galery-item">
          <img data-img-1 v-if="metadata.e ==='Image'" :src="urlDecode(metadata.s.u)" width="100%" >
        </div>
      </div>      

      <div v-if="getPostMedia(post).preview && getPostMedia(post).preview.images && !(getPostMedia(post).media && getPostMedia(post).media.reddit_video && getPostMedia(post).media.reddit_video.fallback_url) && !(getPostMedia(post).preview && getPostMedia(post).preview.reddit_video_preview && getPostMedia(post).preview.reddit_video_preview.fallback_url) && !hasSecureMediaEmbed(getPostMedia(post).secure_media_embed)">
        <div v-for="image in getPostMedia(post).preview.images">
          <img data-img-2 v-if="image.source" :src="urlDecode(image.source.url)" width="100%" >
        </div>
      </div>
      <div v-else>
        <div v-if="isImg(getPostMedia(post).link_url)">
          <img :src="getPostMedia(post).link_url" width="100%">
        </div>

        <div v-if="isImg(getPostMedia(post).url)">
          <img :src="getPostMedia(post).url" width="100%">
        </div>
      </div>

      <div class="post-details">
        <p>Score: {{ post.data.score }}</p>
        <p>Comments: {{ post.data.num_comments }}</p>
        <p>Author: <button @click="updateSubreddit('u/'+post.data.author)">{{ post.data.author }}</button></p>
        <button @click="updateSubreddit(post.data.subreddit_name_prefixed)">{{ post.data.subreddit_name_prefixed }}</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Carregando...</div>
    <button @click="returnToTop" class="return-to-top" v-show="posts.length > 0">
      Recarregar
    </button>
  </div>
</template>

<script>
export default {
  name: 'RedditPosts',
  data() {
    return {
      posts: [],
      after: null,
      loading: false,
      showOver18Posts: false,
      includeOver18: false,
      currentSubreddit: 'best',
      orderBy: 'best',
      history: [],
      searchQuery: ''
    };
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    const subredditFromQuery = urlParams.get('subreddit');
    if (subredditFromQuery) {
      dataLayer.push({ event: 'subreddit', subredditValue: subredditFromQuery });
      this.currentSubreddit = subredditFromQuery;
    }
    this.fetchPosts();
    window.addEventListener('scroll', this.handleScroll);
    this.showOver18Posts = localStorage.getItem('showOver18Posts') === 'true';
    this.includeOver18 = localStorage.getItem('includeOver18') === 'true';
    this.orderBy = localStorage.getItem('orderBy') || 'best';
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.removeQueryString();
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', this.handlePopState);
  },
  beforeDestroy() {
    window.removeEventListener('popstate', this.handlePopState);
  },
  methods: {
    removeQueryString() {
      const url = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.history.replaceState({ path: url }, '', url);
    },
    isImg(url) {
      return url && (url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.jpeg'));
    },
    handlePopState(event) {
      window.history.pushState(null, document.title, window.location.href);
      this.executeCustomAction();
    },
    executeCustomAction() {
      let newSubreddit = this.history.pop();
      if (!newSubreddit) {
        newSubreddit = 'best';
      }
      this.updateSubreddit(newSubreddit);
      console.log('Navegação interceptada e ação executada.');
    },
    handleCheckboxChange(event) {
      if (event.target.checked) {
        if (confirm('Este conteúdo é para maiores de 18 anos. Deseja incluí-lo na pesquisa?')) {
          this.includeOver18 = true;
        } else {
          event.target.checked = false;
        }
      } else {
        this.includeOver18 = false;
      }
      localStorage.setItem('includeOver18', this.includeOver18);
      this.currentSubreddit = 'best';
      this.returnToTop();
    },
    changeOrder() {
      localStorage.setItem('orderBy', this.orderBy);
      dataLayer.push({ event: 'orderBy', orderByValue: this.orderBy });
      this.returnToTop();
    },
    confirmOver18() {
      if (confirm('Este conteúdo é para maiores de 18 anos. Deseja vê-lo?')) {
        this.showOver18Posts = true;
      }
      localStorage.setItem('showOver18Posts', this.showOver18Posts);
    },
    async fetchPosts() {
      if (this.loading) return;
      this.loading = true;

      try {
        let isSubbreddit = false;
        if (this.currentSubreddit.startsWith('r/') || this.currentSubreddit.startsWith('user/')) {
          isSubbreddit = true;
        }

        let url = `https://www.reddit.com/${this.currentSubreddit}`;

        if (isSubbreddit) {
          url += `/${this.orderBy}.json`;
        } else {
          url += `.json`;
        }

        url += `${this.after ? `?after=${this.after}&limit=5` : '?limit=5'}`;

        if (this.currentSubreddit === 'search') {
          url = `https://www.reddit.com/search.json?q=${encodeURIComponent(this.searchQuery)}&nsfw=1&sort=${this.orderBy}&include_over_18=${this.includeOver18 ? 'on' : 'off'}${this.after ? `&after=${this.after}` : ''}`;
          // this.searchQuery = '';s
          document.activeElement.blur();
        }

        // this fetch need to follow redirect and cors policy
        const response = await fetch(url, { redirect: 'follow', mode: 'cors' });
        const data = await response.json();

        this.after = data.data.after;
        this.posts.push(...data.data.children);
        this.$nextTick(this.initVideoObservers);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        this.loading = false;
      }
    },
    isSubbreddit() {
      return this.currentSubreddit === 'search' || this.currentSubreddit.startsWith('r/') || this.currentSubreddit.startsWith('user/');
    },
    getPostMedia(post){
      if (post.data && post.data.crosspost_parent_list) {
        if (post.data.crosspost_parent_list.length > 0) {
          return post.data.crosspost_parent_list[0];
        }
      }
      return post.data;
    },
    initVideoObservers() {
      const options = {
        threshold: 0.5 // Define o threshold conforme necessário
      };

      const videoElements = this.$el.querySelectorAll('.video-player video');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(error => {
              console.error('Erro ao reproduzir vídeo:', error);
            });
          } else {
            video.pause();
          }
        });
      }, options);

      videoElements.forEach(video => {
        observer.observe(video);
      });
    },
    async handleScroll() {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        this.fetchPosts();
      }
    },
    async updateSubreddit(subredditName, clearSearch = false) {
      if (this.loading) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (subredditName.startsWith('u/')) {
        subredditName = subredditName.replace('u/', 'user/');
      }
      if (clearSearch) {
        this.searchQuery = '';
      }
      this.history.push(this.currentSubreddit);
      this.currentSubreddit = subredditName;
      dataLayer.push({ event: 'subreddit', subredditValue: subredditName });
      this.posts = [];
      this.after = null;
      this.fetchPosts();
    },
    async performSearch() {
      if (this.loading) return;
      this.currentSubreddit = 'search';
      this.posts = [];
      this.after = null;
      window.dataLayer.push({ event: 'searchQuery', searchValue: this.searchQuery });
      this.fetchPosts();
    },
    decodeHTML(html) {
      html = html.replace(/position:absolute/g, 'position:relative');
      const txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    },
    makeVideoIframe() {
    },
    hasSecureMediaEmbed(secureMediaEmbed) {
      return secureMediaEmbed && Object.keys(secureMediaEmbed).length > 0;
    },
    renderIframe(content) {
      const regex = /src=['"]([^'"]+)['"]/;
      const match = content.match(regex);
      const url = match ? match[1] : '';

      if (url.includes('redgifs.com')) {
        return `<div style='position:relative; padding-bottom:177.78%'><iframe src='${url}' frameBorder='0' scrolling='no' width='100%' height='100%' style='position:absolute; top:0; left:0;' allowFullScreen></iframe></div>`;
      }
      return this.decodeHTML(content);
    },
    renderIframeUrl(url) {
      return `<div style='position:relative; padding-bottom:177.78%'><iframe src='${url}' frameBorder='0' scrolling='no' width='100%' height='100%' style='position:absolute; top:0; left:0;' allowFullScreen></iframe></div>`;
    },
    getIframeHref(content) {
      const regex = /src=['"]([^'"]+)['"]/;
      const match = content.match(regex);
      if (match && match[1]) {
        return match[1].replace('/ifr/', '/watch/');
      } else {
        return '';
      }
    },
    decodeHtmlEntities(html) {
      
    },
    urlDecode(encodedUrl) {
      try {
        var txt = document.createElement('textarea');
        txt.innerHTML = encodedUrl;
        return txt.value;
      } catch (error) {
        console.error('Error decoding URL:', error);
        return encodedUrl;
      }
    },
    async returnToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.posts = [];
      this.after = null;
      this.fetchPosts();
      // this.returnToBestJson();
    },
  }
};
</script>

<style scoped>
.post {
  position: relative;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  overflow: hidden;
}

.current-subreddit {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.subreddit-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

}

.top-bar {
  background: var(--color-background);
  position: sticky;
  top: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 20px;
  z-index: 100;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  z-index: 10;
}

.gallery-item {
  max-width: 100%;
  margin-bottom: 10px;
}

.gallery-item img {
  height: auto;
  display: block;
}

.post-details {
  margin-top: 10px;
  font-size: 0.8em;
  color: #666;
}

.media-embed {
  width: 100%;
}

.video-player {
  max-width: 100%;
  overflow: hidden;
  margin: 0 auto;
}

.video-player video {
  display: block;
  width: 100%;
}

.loading {
  text-align: center;
  margin: 20px 0;
}

.return-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
} 
</style>
