/* ==========
  Version 1.1
  Before After Slider in Squarespace
  Copyright Will Myers
========== */

(function(){
  /*Variables*/
  const ps = {
    cssId: 'wm-before-after-slider',
    cssFile: 'https://cdn.jsdelivr.net/gh/willmyethewebsiteguy/beforeAfter@1/styles.min.css'
  };

  /*Functions*/
  let wmBeforeAfter = (function(){

    function createResizeEventListener(instance) {
      function handleEvent() {
        instance.settings.size = instance.settings.container.clientWidth;
      }

      window.addEventListener('resize', handleEvent)
    }
    function createLoadEventListener(instance) {
      let startingPos = parseFloat(instance.settings.startingPos);
      if (startingPos > 1) startingPos = 0.9;
      if (startingPos < 0) startingPos = 0.1;
      if (!isNumber(startingPos)) startingPos = 0.5;

      function isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
      }
      function handleEvent() {
        instance.settings.size = instance.settings.container.clientWidth;
        instance.settings.position = startingPos;
      }

      window.addEventListener('DOMContentLoaded', handleEvent)
    }
    function attachEvents(instance) {
      let el = instance.settings.container
      el.wmBeforeAfter = {};
      let ns = el.wmBeforeAfter;
      ns.settings = instance.settings;
    }
    function createSlideEvent(instance) {
      let settings = instance.settings;
      let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
      settings.lock = true;
      let mouseDown = false;
      
      function handleEvent(e){
        if (settings.lock) return;
        if (e.target.closest('.caption')) return;

        let imgLeft = settings.container.getBoundingClientRect().left,
            dividerWidth = settings.dividerWidth,
            posX = (e.clientX || e.touches[0].clientX) - imgLeft,
            percent = posX / settings.width;

        if (percent >= 1) {percent = 1}
        if (percent <= 0) {percent = 0}

        settings.position = percent;
      }

      //Disable Unlock on Hover 
      
      settings.container.addEventListener('mouseenter', function(){
        if (!settings.disableHoverSlide) {
          settings.lock = false;
        }
      })

      //Touch
      settings.container.addEventListener('touchstart', function(e) {
        settings.lock = false;
        mouseDown = true;
        handleEvent(e);
      })
      settings.container.addEventListener('touchmove', handleEvent);
      settings.container.addEventListener('touchend', function(e) {
        settings.lock = true;
        mouseDown = false;
      })

      //Mouse
      settings.container.addEventListener('mousedown', function(e) {
        settings.lock = false;
        mouseDown = true;
        handleEvent(e);
      })
      settings.container.addEventListener('mousemove', handleEvent);
      settings.container.addEventListener('mouseup', function(e) {
        settings.lock = true;
        mouseDown = false;
      })
      settings.container.addEventListener('mouseleave', function() {
        if (!mouseDown) settings.lock = true;
      })
    }

    function getProperty(el, property, backup){
      let styles = window.getComputedStyle(el),
          value = styles.getPropertyValue(property) || backup;

      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      return value;
    }

    function Constructor(el) {
      let self = this;
      this.addCSS();
      this.settings = {
        lock:false,
        container: el,
        width: 500,
        disableHoverSlide: getProperty(el, '--disable-hover', false),
        startingPos: getProperty(el, '--starting-position', 0.5),
        get handle() {
          return this.container.querySelector('.handle');
        },
        get divider() {
          return this.container.querySelector('.divider');
        },
        get dividerWidth() {
          return this.divider.querySelector('.line-top').offsetWidth
        },
        set size(width) {
          this.container.style.setProperty('--image-width', `${width}px`);
          this.width = width;
        },
        set position(percent) {
          this.container.style.setProperty('--slider-position', `calc(${percent * 100}%)`);
        }
      };

      //resizeEventListener
      createResizeEventListener(this);

      //resizeEventListener
      createLoadEventListener(this);

      //attach Events
      attachEvents(this);

      //create Mouseover
      createSlideEvent(this);

      // Breakdown when in Edit Mode
    }

    /**
       * Destroy this instance
       */
    Constructor.prototype.destroy = function (instance) {
    };

    /* Add CSS */
    Constructor.prototype.addCSS = function () {
      let cssFile = document.querySelector(`#${ps.cssId}-css`);
      function addCSSFile() {
        let url = `${ps.cssFile}`;
        let head = document.getElementsByTagName("head")[0],
            link = document.createElement("link");
        link.rel = "stylesheet";
        link.id = `${ps.cssId}-css`;
        link.type = "text/css";
        link.href = url;
        link.onload = function () {
          loaded();
        };

        head.prepend(link);
      }

      function loaded() {
        const event = new Event(`${ps.cssId}:css-loaded`);
        window.dispatchEvent(event);
        document.querySelector("body").classList.add(`#${ps.cssId}-css-loaded`);
      }

      if (!cssFile) {
        addCSSFile();
      } else {
        document.head.prepend(cssFile);
        loaded();
      }
    };

    return Constructor
  }());

  /*Build the HTML Structure*/
  let buildFromTargets = (function(){
    let isValidHttpUrl = (string) => {
      let url;

      try {
        url = new URL(string);
      } catch (_) {
        return false;  
      }

      return url.protocol === "http:" || url.protocol === "https:";
    }

    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      container.classList = 'wm-before-after-slider loaded';

      let template = `<div class="overflow-wrapper">
    <div class="after">
      <img src="${instance.settings.afterImg}" alt="After Image">
    </div>
    <div class="before-overflow">
      <img src="${instance.settings.beforeImg}" alt="Before Image">
    </div>
    <div class="divider">
      <div class="line-top"></div>
      <div class="line-bottom"></div>
      <div class="handle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>Adjust Image</title>
          <path data-name="leftArrow" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M20 14 L3 32 L20 50" stroke-linejoin="round" stroke-linecap="round"></path>
          <path data-name="rightArrow" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M44 14 L61 32 L44 50" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
      </div>
    </div>
    <div class="before-title caption">${instance.settings.getValue('--before-text', 'Before')}</div>
    <div class="after-title caption">${instance.settings.getValue('--after-text', 'After')}</div>
  </div>`;

      container.innerHTML = template;
      return template;
    }

    function Constructor(el) { 
      this.settings = {
        container: el,
        data: el.dataset,
        getValue: function(property, backup) {
          let styles = window.getComputedStyle(this.container),
              value = styles.getPropertyValue(property) || backup;
          return value
        },
        get beforeImg() {
          let string = this.data.before,
              imgSrc;

          if (isValidHttpUrl(string)) { imgSrc = string; }
          if (document.querySelector(this.data.before)) {
            let beforeEl = document.querySelector(this.data.before),
                img = beforeEl.querySelector('img');
            imgSrc = img.dataset.src;
            if (!imgSrc) imgSrc = img.src;
            beforeEl.classList.add('hide-block');
            beforeEl.closest('.fe-block')?.classList.add('hide-block');
          }
          return imgSrc
        },
        get afterImg() {
          let string = this.data.after, imgSrc;

          if (isValidHttpUrl(string)) { imgSrc = string; }
          if (document.querySelector(this.data.after)) {

            let afterEl = document.querySelector(this.data.after),
                img = afterEl.querySelector('img');
            imgSrc = img.dataset.src;
            if (!imgSrc) imgSrc = img.src;
            afterEl.classList.add('hide-block');
            afterEl.closest('.fe-block')?.classList.add('hide-block');
          }
          return imgSrc
        }
      }

      injectTemplate(this)

      new wmBeforeAfter(this.settings.container);
    }

    return Constructor;
  }());
  
  let buildFromStackedBlocks = (function(){

    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      container.classList = 'wm-before-after-slider loaded';

      let template = `<div class="overflow-wrapper">
    <div class="after">
      <img src="${instance.settings.afterImg}" alt="After Image">
    </div>
    <div class="before-overflow">
      <img src="${instance.settings.beforeImg}" alt="Before Image">
    </div>
    <div class="divider">
      <div class="line-top"></div>
      <div class="line-bottom"></div>
      <div class="handle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>Adjust Image</title>
          <path data-name="leftArrow" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M20 14 L3 32 L20 50" stroke-linejoin="round" stroke-linecap="round"></path>
          <path data-name="rightArrow" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M44 14 L61 32 L44 50" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
      </div>
    </div>
    <div class="before-title caption">${instance.settings.getValue('--before-text', 'Before')}</div>
    <div class="after-title caption">${instance.settings.getValue('--after-text', 'After')}</div>
  </div>`;

      container.innerHTML = template;

      let before = instance.settings.getValue('--before-text');

      return template;
    }

    function Constructor(el) { 
      this.settings = {
        container: el,
        data: el.dataset,
        getValue: function(property, backup) {
          let styles = window.getComputedStyle(this.container),
              value = styles.getPropertyValue(property) || backup;
          return value
        },
        get beforeImg() {
          let beforeBlock = el.closest('.sqs-block').previousSibling.previousSibling,
              imgSrc = beforeBlock.querySelector('img').dataset.src;

          beforeBlock.classList.add('hide-block');

          return imgSrc
        },
        get afterImg() {
          let afterBlock = el.closest('.sqs-block').previousSibling,
              imgSrc = afterBlock.querySelector('img').dataset.src;

          afterBlock.classList.add('hide-block');

          return imgSrc
        }
      }

      injectTemplate(this)

      new wmBeforeAfter(this.settings.container);
    }

    return Constructor;
}());


  const init = () => {
    let els = document.querySelectorAll('[data-wm-plugin="before-after-slider"]:not(.loaded)');

    els.forEach(el => {
      if (el.dataset.before) {
        new buildFromTargets(el);
      } else {
        new buildFromStackedBlocks(el);
      }
    });
  };

  init();

  /*Event Listeners & Init*/
  window.wmBeforeAfter = {
    init: () => init(),
  };
}());
