"use strict";
var photopage = (function(self, $) {

  ////////////////////////////////
  // Slideshow
  ////////////////////////////////
  function Slideshow(element) {
    this.el = document.querySelector(element);
    this.init();
  }

  Slideshow.prototype = {
    init: function () {
      this.wrapper = this.el.querySelector(".slideshow-wrapper");
      this.slides = this.el.querySelectorAll(".slide");
      this.index = 0;
      this.total = this.slides.length;
      this.timer = null;

      this.action();
    },
    _slideTo: function(slide) {
      var currentSlide = this.slides[slide];
      currentSlide.style.opacity = 1;

      for (var i = 0; i < this.slides.length; i++) {
        var slide = this.slides[i];
        if( slide !== currentSlide ) {
          slide.style.opacity = 0;
        }
      }
    },
    action: function() {
      var self = this;
      self.timer = setInterval(function() {
        self.index++;
        if( self.index == self.slides.length ) {
          self.index = 0;
        }
        self._slideTo( self.index );

      }, 3000);
    }		
  };

  document.addEventListener("DOMContentLoaded", function() {
    var slider = new Slideshow( "#slideshow" );
  });

  ////////////////////////////////
  // Stats Counters
  ////////////////////////////////

  // https://jsfiddle.net/shaaraddalvi/4rp09jL0/
  var scrollEventHandler = function() {
    if (isScrolledIntoView($('#tulip-stats').get(0)) || isScrolledIntoView($('#morning-stats').get(0))) {
      triggerCount();
      // Unbind scroll event handler
      $(document).off('scroll', scrollEventHandler);
    }
  }

  function isScrolledIntoView(el) {
    var elemTop = el.getBoundingClientRect().top;
    var elemBottom = el.getBoundingClientRect().bottom;

    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
  }

  var triggerCount = function() {
    var tulipRepostCountAnim = new CountUp("tulip-repost-count", 0, 300, 0, 3);
    if (!tulipRepostCountAnim.error) {
      tulipRepostCountAnim.start();
    } else {
      console.error(tulipRepostCountAnim.error);
    }

    var tulipFollowerCountAnim = new CountUp("tulip-follower-count", 0, 20, 0, 3);
    if (!tulipFollowerCountAnim.error) {
      tulipFollowerCountAnim.start();
    } else {
      console.error(tulipFollowerCountAnim.error);
    }

    var tulipLikeCountAnim = new CountUp("tulip-like-count", 0, 460, 0, 3);
    if (!tulipLikeCountAnim.error) {
      tulipLikeCountAnim.start();
    } else {
      console.error(tulipLikeCountAnim.error);
    }

    var morningViewCountAnim = new CountUp("morning-view-count", 0, 9.9, 1, 4);
    if (!morningViewCountAnim.error) {
      morningViewCountAnim.start();
    } else {
      console.error(morningViewCountAnim.error);
    }

    var morningDownloadCountAnim = new CountUp("morning-download-count", 0, 178, 0, 4);
    if (!morningDownloadCountAnim.error) {
      morningDownloadCountAnim.start();
    } else {
      console.error(morningDownloadCountAnim.error);
    }
  }

  $(document).scroll(scrollEventHandler);

  return self;
}(photopage || {}, jQuery));

