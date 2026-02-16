// SwiperJS Coverflow Slider
const swiper = new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 45,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

/* ---------- Orientation detection + lazy-loading for videos ---------- */
(function(){
  // Only target videos inside Highlights and Motion Graphic sections
  const videos = Array.from(document.querySelectorAll('.highlights-section video, .motion-graphics-section video'));

  // Wrap video in .video-orientation if not already wrapped
  function ensureWrapper(video){
    const parent = video.parentElement;
    if(parent && parent.classList.contains('video-orientation')) return parent;
    const wrapper = document.createElement('div');
    wrapper.className = 'video-orientation';
    parent.replaceChild(wrapper, video);
    wrapper.appendChild(video);
    return wrapper;
  }

  // Set orientation class based on loaded metadata
  function setOrientationClass(video){
    const wrapper = ensureWrapper(video);
    const w = video.videoWidth || 0;
    const h = video.videoHeight || 0;
    wrapper.classList.remove('portrait','landscape');
    if(h > w) wrapper.classList.add('portrait');
    else wrapper.classList.add('landscape');
  }

  // Attach source from data-src (lazy) or do nothing if sources already present
  function attachSourceIfNeeded(video){
    if(video._attached) return;
    const dataSrc = video.dataset.src;
    if(dataSrc){
      // clear existing <source> nodes and attach new one
      while(video.firstChild) video.removeChild(video.firstChild);
      const s = document.createElement('source');
      s.src = dataSrc;
      s.type = 'video/mp4';
      video.appendChild(s);
      if(video.dataset.poster) video.poster = video.dataset.poster;
      video._attached = true;
      // load metadata to detect dimensions
      video.addEventListener('loadedmetadata', function onm(){
        setOrientationClass(video);
        // try to start playback (muted autoplay allowed in modern browsers)
        try { video.play().catch(()=>{}); } catch(e){}
        video.removeEventListener('loadedmetadata', onm);
      });
      try{ video.load(); }catch(e){}
    } else {
      // if already has source, we can still listen for metadata
      if(video.readyState >= 1){
        setOrientationClass(video);
        try { video.play().catch(()=>{}); } catch(e){}
      } else {
        video.addEventListener('loadedmetadata', function onm(){
          setOrientationClass(video);
          try { video.play().catch(()=>{}); } catch(e){}
          video.removeEventListener('loadedmetadata', onm);
        });
      }
    }
  }

  // Lazy-load via IntersectionObserver: observe the video elements
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      for(const e of entries){
        if(e.isIntersecting){
          const vid = e.target;
          attachSourceIfNeeded(vid);
          obs.unobserve(vid);
        }
      }
    }, { root:null, rootMargin: '300px', threshold: 0.05 });
    videos.forEach(v => io.observe(v));
  } else {
    videos.forEach(attachSourceIfNeeded);
  }

  // Re-evaluate orientation on resize/orientationchange
  window.addEventListener('resize', () => {
    videos.forEach(v => { if(v._attached || v.currentSrc || v.querySelector('source')) setOrientationClass(v); });
  });

})();
