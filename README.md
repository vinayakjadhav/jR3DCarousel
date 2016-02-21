# jR3DCarousel
**j**Query **R**esponsive **3D** **Carousel** - __jR3DCarousel__ by Vinayak Rangnathrao Jadhav

jR3DCarousel is a derived from the origin project - [jRCarousel](https://github.com/vinayakjadhav/jRCarousel)

###### jR3DCarousel is a jQuery plugin for responsive 3d carousel with modern effects and multiple options.

## Features
- Modern effects
- Responsive
- Fullscreen Carousel
- Tiny plugin (gzipped ~ 2.01KB, uncompressed ~ 4.95KB)
- Touch devices support
- Infinite scroll
- Multiple slideLayouts to maintain aspect ratio of images
- Keyboard navigation & mouse drag slide support
- Minimal configuration, easy to install
- Useful public API for extending the functionalities like custom nav buttons.
 
## Live Demo
   [Click here](http://vinayakjadhav.github.io/jR3DCarousel/) for Live Demo.

   ![animationnew](https://cloud.githubusercontent.com/assets/7734229/11457324/f46c4d30-96cb-11e5-9281-b0141721b755.gif)

## Installation
#### Using npm
``` 
npm install jr3dcarousel
```

#### Using bower
```
bower install jR3DCcarousel					Or					bower install jr3dcarousel
```

#### old school way

	<!-- add jQuery if not already present in your project -->
``` javascript
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js'></script>
```
	<!-- add jR3DCarousel plugin -->
``` javascript
<script src="https://cdn.rawgit.com/vinayakjadhav/jR3DCarousel/v0.0.8/dist/jR3DCarousel.min.js"></script>
```

##### Setup images source
```
var slides = [
	{src: 'http://lorempixel.com//1366/768'},
	{src: 'http://lorempixel.com//1366/761'},
	{src: 'http://lorempixel.com//1366/762'},
	{src: 'http://lorempixel.com//1366/763'},
	{src: 'http://lorempixel.com//1366/764'},
	{src: 'http://lorempixel.com//1366/765'},
	{src: 'http://lorempixel.com//1366/766'}
];
```

##### Minimal configuration with defaults
```
$('.jR3DCarouselGallery').jR3DCarousel({
					slides: slides
				});
```

##### Configuring all available options
```
$('.jR3DCarouselGallery').jR3DCarousel({
 	width: 800, 				/* largest allowed width */
	height: 356, 				/* largest allowed height */
	slides: slides, 			/* array of images source or gets slides by 'slide' class */
	slideLayout : 'contain',  	/* "contain"-fit as per to aspect ratio | "fill"-stretches to fill |  "cover"-overflows but maintains ratio */
	animation: 'scroll', 		/* slide | slide3D | scroll | scroll3D | fade */
	animationDuration: 400,    	/* animation speed in milliseconds */
	animationInterval: 4000,	/* Interval between transitions or per slide show time in milliseconds */
	autoplay: true,         	/* start playing Carousel continuously, pauses when slide is hovered */
	onSlideShow: shown,			/* callback when Slide show event occurs */
	navigation: 'circles'		/* circles | squares | '' */
});
```
##### Images source provided in javascript
```
<div class="jR3DCarouselGallery"></div>
```

##### Slides using custom template by adding class `slide`
```
<div class="jR3DCarouselGallery">
  <div class="slide"><img src="http://lorempixel.com//800/351" /></div>
  <div class="slide"><img src="http://lorempixel.com//800/352" /></div>
  <div class="slide"><img src="http://lorempixel.com//800/353" /></div>
  <div class="slide"><img src="http://lorempixel.com//800/354" /></div>
  <div class="slide"><img src="http://lorempixel.com//800/355" /></div>
</div>
```
## Public API
- ##### showSlide(slideIndex) 	:
		shows the slide specified by the slideIndex by running animation, the slideIndex starts from 0.

- ##### showPreviousSlide()		:
		shows the previous slide from current slide by running animation

- ##### showNextSlide()		:
		shows the slide specified by the slideIndex by running animation

- ##### getSlideByIndex(slideIndex)	:
		returns the slide's jquery object specified by the slideIndex

- ##### getCurrentSlide()		:
		returns the current slide's jQuery object

- ###### Usage
```
var myjR3DCarousel = $('.jR3DCarouselGallery')
						.jR3DCarousel({
							slides: slides
						});

myjR3DCarousel.showSlide(0);
myjR3DCarousel.showPreviousSlide();
myjR3DCarousel.showNextSlide();
var slide = myjR3DCarousel.getSlideByIndex(1);
var currentSlide = myjR3DCarousel.getCurrentSlide();
```
------------------------------------------------------------------------------------------------------------------
