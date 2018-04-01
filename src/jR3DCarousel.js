/**
 * Author: Vinayak Rangnathrao Jadhav
 * Project: jR3DCarousel
 * Version: 1.0.5
 **/
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(function($){
	
	$.fn.jR3DCarousel = function(options){
		var _defaults = {
				width : innerWidth,				/* largest allowed width */
				height: innerHeight,			/* largest allowed height */
				slides : [], 					/* array of images source, optional in case of custom template  */
				slideLayout : 'fill', 			/* contain | fill | cover */
				perspective: 0,					/* perspective - default is dynamic, perpendicular */
				animation: 'slide3D', 			/* slide | slide3D | scroll | scroll3D | fade */
				animationCurve: 'ease',			/* ease | ease-in | ease-out | ease-in-out | linear | bezier */
				animationDuration: 700,			/* duration of animation transition in milliseconds*/
				animationInterval: 2000,		/* interval between transitions or show time of per slide in milliseconds */
				autoplay: true,					/* start playing Carousel continuously, pauses when slide is hovered  */
				controls: true,					/* control buttons */
				slideClass: 'jR3DCarouselSlide',/* name of the css class of slides in custom template */
				navigation: 'circles',			/* circles | squares | '' */
				rotationDirection: 'rtl',		/* rtl - right to left | ltr - left to right */
				onSlideShow: function(){}		/* callback when Slide show event occurs */
		}
		
		var _settings = $.extend( true, {}, _defaults, options );
		var _container = this;
		var _width = _settings.width;
		var _height = _settings.height;
		var _aspectRatio = _settings.width/_settings.height;
		var _jR3DCarouselDiv = $( "<div class='jR3DCarousel' />" )
								.css({ width: '100%', height: '100%', transition:'transform '+_settings.animationDuration+'ms '+_settings.animationCurve, 'transformStyle': 'preserve-3d' })
								.appendTo(_container);
		var _currentSlideIndex = 0;
		var _targetSlideIndex = 1;
		var _animations = new Animations();
		var _previousButton;
		var _nextButton;
		var _timer;
		var _baseAngle;
		var _rotationAngle = 0;
		var _translateZ;
		var _perspective;
		var _transform;
		var _noOfSlides = _settings.slides.length || _container.find('.'+_settings.slideClass).length;
		
		(function setup(){
			
			/* create jR3DCarousel */
			createjR3DCarousel();
			
			/* create control buttons */
			if(_settings.controls){
				_createControls();
			}
			
			/* create navigation bar */
			if(_settings.navigation){
				_createNavigation();
			}
			
			/* adjust size according to device */
			addEventListener('resize', _maintainResposive);
			
			_maintainResposive();
			
			/* start jR3DCarousel if autoplay */
			if(_settings.autoplay){
				
				/* event handlers */
				document.addEventListener('visibilitychange', handleVisibilityChange);
				
				addEventListener("beforeunload", function () {
					  document.removeEventListener('visibilitychange', handleVisibilityChange);
				});
				
				function handleVisibilityChange() {
				    if (document.hidden) {
				        //console.log("hidden.. stop running expensive task")
						_pausejR3DCarousel();
				    } else {
				        //console.log("not hidden.. page has focus, begin running task")
						_playjR3DCarousel();
				    }
				}
				
				_container.hover(function(){
					clearTimeout($(this).data('timeout'));
					_pausejR3DCarousel();					
				},function(){					
					$(this).data('timeout', setTimeout(function(){
												_playjR3DCarousel();
					}, _settings.animationInterval+_settings.animationDuration));
				});
				
				/* start jR3DCarousel if autoplay */
				_playjR3DCarousel();
					
			}
			
			function createjR3DCarousel(){
				/* compute translate and perspective */
				if(_settings.animation.indexOf('slide')!=-1){
					_translateZ = (_width/2) / Math.tan(Math.PI/_noOfSlides);
					_perspective = (_width/2) * Math.tan(2*Math.PI/_noOfSlides)+'px';
				}else if(_settings.animation.indexOf('scroll')!=-1){
					_translateZ = (_height/2) / Math.tan(Math.PI/_noOfSlides);
					_perspective = (_height/2) * Math.tan(2*Math.PI/_noOfSlides)+'px';
				}else if(_settings.animation == 'fade'){
					_translateZ = (_width/2) / Math.tan(Math.PI/_noOfSlides);
					_perspective = (_width/2) * Math.tan(2*Math.PI/_noOfSlides)+'px';
				}
				
				/* compute base angle */
				_baseAngle = 360 / _noOfSlides;

				/* create jR3DCarousel slide stack */
				if(_settings.slides.length){					
					for(var i = 0;  i < _settings.slides.length; i++){
						var slide = $( "<div class='jR3DCarouselSlide' data-index="+i+" />" )
									.append( "<img src='"+_settings.slides[i].src+"' alt='"+_settings.slides[i].alt+"' />" );
						if(_settings.animation.indexOf('slide')!=-1){
							_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}else if(_settings.animation.indexOf('scroll')!=-1){
							_transform = 'rotateX('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}else if(_settings.animation == 'fade'){
							_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}
						slide.css({ transform: _transform });
						_jR3DCarouselDiv.append(slide);
					}
				}else{
					_container.find('.'+_settings.slideClass).each(function(i){
						var slide = $(this).attr('data-index', i);
						if(_settings.animation.indexOf('slide')!=-1){
							_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}else if(_settings.animation.indexOf('scroll')!=-1){
							_transform = 'rotateX('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}else if(_settings.animation == 'fade'){
							_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}
						slide = slide.css({ transform: _transform }).detach();
						_jR3DCarouselDiv.append(slide);
					});
				}
				_jR3DCarouselDiv.find('.'+_settings.slideClass).css({position: 'absolute', left: 0, top:0, width:'100%', height:'100%', backfaceVisibility: 'hidden'})
								.find('img').css({ width:'100%', height:'100%', objectFit:_settings.slideLayout });
				_perspective = _settings.perspective || _perspective;
				_container.css({ perspective: _perspective, width: _width+'px', height: _height+'px', position: "relative", overflow: 'visible'});
			}
			
			function _createControls(){
				if(_settings.rotationDirection == 'rtl'){
					_previousButton = $( "<div class='previous controls' style='left: 0.1em;'>&lang;</div>");
					_nextButton = $( "<div class='next controls' style='right: 0.1em;'>&rang;</div>");
				}else{
					_previousButton = $( "<div class='previous controls' style='right: 0.1em;'>&rang;</div>");
					_nextButton = $( "<div class='next controls' style='left: 0.1em;'>&lang;</div>");
				}
				
				_previousButton.add(_nextButton)
							   .css({position: 'absolute', top:'50%', zIndex:1, transform: 'translateY(-50%)', fontSize: '4em', color: 'rgba(255, 255, 255, 0.97)', cursor:'pointer', userSelect: 'none'})
							   .appendTo(_container)
							   .hide();
				
				 /* event handlers */
				_previousButton.on('click', function(){
					_playPreviousSlide();
				});
				_nextButton.on('click', function(){
					_playNextSlide();
				});
				
				/* event handlers */
				_container.on('mouseenter touchstart',function(){
					_previousButton.add(_nextButton).show();
				})
				.on('mouseleave touchcancel',function(){
					_previousButton.add(_nextButton).hide();
				})
				
				_previousButton.hover(function(){
					_previousButton.css({color: 'rgba(201, 201, 201, 0.97)'});
				},function(){
					_previousButton.css({color: 'rgba(255, 255, 255, 0.97)'});
				});
				_nextButton.hover(function(){
					_nextButton.css({color: 'rgba(201, 201, 201, 0.97)'});
				},function(){
					_nextButton.css({color: 'rgba(255, 255, 255, 0.97)'});
				});
				
				/* keyboard navigation keys support */
				$(document).on('keydown', function(e){
					var rect = _container[0].getBoundingClientRect();
				    var inView = rect.bottom > 0 &&  rect.right > 0 &&
				        rect.left < (innerWidth || document.documentElement.clientWidth) &&
				        rect.top < (innerHeight || document.documentElement.clientHeight);
					
					if(inView && e.which == 37){
						_pausejR3DCarousel();
						if(_settings.rotationDirection == 'rtl'){
							_previousButton.click();
						}else{
							_nextButton.click();
						}
					}else if(inView && e.which == 39){
						_pausejR3DCarousel();
						if(_settings.rotationDirection == 'rtl'){
							_nextButton.click();
						}else{
							_previousButton.click();
						}
					}
				});
				
				/* touch navigation support */
				_swipedetect(_container, function(swipedir){
					_pausejR3DCarousel();
				    /* swipedir contains either "none", "left", "right", "up", or "down" */
					if (swipedir =='left'){
						_nextButton.click();
					}else if (swipedir =='right'){
						_previousButton.click();
					}else if(_settings.animation.indexOf('scroll')!=-1){
						if (swipedir =='down'){
							_nextButton.click();
						}else if (swipedir =='up'){
							_previousButton.click();
						}
					}
				});
			}
				
			function _createNavigation(){
				var _navigation = $('<div class=navigation />').css({ position: 'absolute', bottom: 0, right: 0 });
				for(var i = 0;  i < _noOfSlides; i++){
					_navigation.append('<div class=nav></div>');
				}
				if(_settings.navigation == 'circles'){
					_navigation.find('.nav').css({ borderRadius: '12px' });
				}
				_navigation.find('.nav').css({ display: 'inline-block', margin: '5px', cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.77)', width: '12px', height: '12px', transition: 'all '+_settings.animationDuration+'ms ease' })
										.first().css({ backgroundColor: 'rgba(0, 0, 0, 1)' });
				_jR3DCarouselDiv.after(_navigation);
				
				 /* event handler */
				_container.on('click', '.nav', function(){
					_playSlideByIndex($(this).index());
				});
			}
			
		})();
		
		function _playjR3DCarousel(){
			_pausejR3DCarousel();
			_timer = setInterval(_playNextSlide, _settings.animationInterval+_settings.animationDuration);
			//console.log("_playjR3DCarousel called "+_timer);
		}
		function _pausejR3DCarousel(){
			if(_timer){
				//console.log("_pausejR3DCarousel called "+_timer);
				clearInterval(_timer);
			}
		}
		
		function _playNextSlide(){
			_targetSlideIndex = _currentSlideIndex + 1;
			_animations.run(_settings.animation, _targetSlideIndex);
			_slideCarouseld();
		}
		
		function _playPreviousSlide(){
			_targetSlideIndex = _currentSlideIndex - 1;
			_animations.run(_settings.animation, _targetSlideIndex);
			_slideCarouseld();
		}
		
		function _playSlideByIndex(relativeSlideIndex){
			var _currentRoundNo = Math.floor(_currentSlideIndex / _noOfSlides);
			_targetSlideIndex =  _currentRoundNo *_noOfSlides + relativeSlideIndex;
			_animations.run(_settings.animation, _targetSlideIndex);
			_slideCarouseld();
		}
		
		function _getPreviousSlide(){
			return _jR3DCarouselDiv.find('.'+_settings.slideClass).eq((_currentSlideIndex-1) % _noOfSlides);
		}
		function _getCurrentSlide(){
			return _jR3DCarouselDiv.find('.'+_settings.slideClass).eq(_currentSlideIndex % _noOfSlides);
		}
		function _getNextSlide(){
			return _jR3DCarouselDiv.find('.'+_settings.slideClass).eq((_currentSlideIndex+1) % _noOfSlides);
		}
		function _getSlideByIndex(idx){
			return _jR3DCarouselDiv.find('.'+_settings.slideClass+'[data-index='+idx+']');
		}
		
		function Animations(){
			this.animations = {
					slide : _slide,
					slide3D : _slide3D,
					scroll: _scroll,
					scroll3D: _scroll3D,
					fade: _fade
				}
		}
		Animations.prototype.run = function run(animation, targetSlideIndex){
				this.animations[animation](targetSlideIndex);
		}
		
		function _slide(targetSlideIndex){
			_container.css({ perspective: '', overflow: 'hidden' });
			_rotationAngle = _baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)' });
		}
		
		function _slide3D(targetSlideIndex){
			_container.css({ perspective: _perspective, overflow: 'visible' });
			_rotationAngle = _baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)' });
		}
		
		function _scroll(targetSlideIndex){
			_container.css({ perspective: '', overflow: 'hidden' });
			_rotationAngle=_baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateX('+-_rotationAngle+'deg)' });
		}
		
		function _scroll3D(targetSlideIndex){
			_container.css({ perspective: _perspective, overflow: 'visible' });
			_rotationAngle=_baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateX('+-_rotationAngle+'deg)' });
		}
		
		function _fade(targetSlideIndex){
			_jR3DCarouselDiv.css({ transition: 'opacity '+ _settings.animationDuration+'ms '+_settings.animationCurve, opacity: 0});
			_rotationAngle = _baseAngle * targetSlideIndex;			
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)'});
			_jR3DCarouselDiv.css({ opacity: 1 });
		}
		
		function _slideCarouseld(){
			_container.find('.nav').css({  backgroundColor: 'rgba(255, 255, 255, 0.77)' })
			   .eq(_targetSlideIndex % _noOfSlides).css({ backgroundColor: 'rgba(0, 0, 0, 0.77)' });
			
			_currentSlideIndex = Math.round(_rotationAngle/_baseAngle);
			//console.log("_currentSlideIndex " +_currentSlideIndex)
			_settings.onSlideShow.call(this, _getCurrentSlide());
		}
		
		function _maintainResposive(){
			_container.width('100%');
			_jR3DCarouselDiv.hide();
			_width = _container.width() < _settings.width ? _container.width() : _settings.width;
			_height = _width/_aspectRatio;
			_container.css({width: _width+'px', height: _height+'px' });
			
			if(_settings.animation.indexOf('slide')!=-1){
				_translateZ = (_width/2) / Math.tan(Math.PI/_noOfSlides);
				_perspective = (_width/2) * Math.tan(2*Math.PI/_noOfSlides)+'px';
			}else if(_settings.animation.indexOf('scroll')!=-1){
				_translateZ = (_height/2) / Math.tan(Math.PI/_noOfSlides);
				_perspective = (_height/2) * Math.tan(2*Math.PI/_noOfSlides)+'px';
			}else if(_settings.animation == 'fade'){
				_translateZ = (_width/2) / Math.tan(Math.PI/_noOfSlides);
				_perspective = (_width/2) * Math.tan(2*Math.PI/_noOfSlides)+'px';
			}
			_container.find('.'+_settings.slideClass).each(function(i){
				var slide = $(this);
				if(_settings.animation.indexOf('slide')!=-1){
					_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
				}else if(_settings.animation.indexOf('scroll')!=-1){
					_transform = 'rotateX('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
				}else if(_settings.animation == 'fade'){
					_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
				}
				slide.css({ transform: _transform });
			});
			_perspective = _settings.perspective || _perspective;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)' });
			_jR3DCarouselDiv.show();
			_container.css({ perspective: _perspective });
		}	
		
		function _swipedetect(el, handleswipe){
			var touchsurface = el, swipedir, startX, startY, distX,	distY,
			threshold = 20, //required min distance traveled to be considered swipe
			restraint = 100, // maximum distance allowed at the same time in perpendicular direction
			allowedTime = 700, // maximum time allowed to travel that distance
			elapsedTime, startTime

			touchsurface.on('touchstart', function(e){
				var touchobj = e.originalEvent.changedTouches[0]
				swipedir = 'none'
				startX = touchobj.pageX
				startY = touchobj.pageY
				startTime = new Date().getTime() // record time when finger first makes contact with surface
				//e.preventDefault()
			})
			.on('touchmove', function(e){
				e.preventDefault() // prevent scrolling when inside DIV
			})
			.on('touchend', function(e){
				var touchobj = e.originalEvent.changedTouches[0]
				distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
				distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
				elapsedTime = new Date().getTime() - startTime // get time elapsed
				if (elapsedTime <= allowedTime){ // first condition for awipe met
					if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
						swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
					}
					else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
						swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
					}
				}
				handleswipe(swipedir)
				//e.preventDefault()
			})
		}
		
		/* public API */		
		this.showSlide = function(index){
			var relativeSlideIndex = index % _noOfSlides;
			_playSlideByIndex(relativeSlideIndex);
		}
		this.getCurrentSlide = function(){
			return _getCurrentSlide();
		}
		this.getSlideByIndex = function(index){
			return _getSlideByIndex(index);
		}
		this.showPreviousSlide = function(){
			_previousButton.click();
		}
		this.showNextSlide = function(){
			_nextButton.click();
		}
		this.playCarousel = function(){
			_playjR3DCarousel();
		}
		this.pauseCarousel = function(){
			_pausejR3DCarousel();
		}

		return this;
	}
	
});
