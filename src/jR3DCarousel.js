/**
 * Author: Vinayak Rangnathrao Jadhav
 * Project: jR3DCarousel
 * Version: 0.0.3
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
				width : 1349,				/* largest allowed width */
				height: 668,				/* largest allowed height */
				slides : [], 				/* array of images source or gets slides by 'slide' class */
				slideLayout : 'contain', 	/* contain | fill | cover */
				animation: 'slide', 		/* slide | scroll | fade | zoomInSlide | zoomInScroll */
				animationCurve: 'ease',		/* ease | ease-in | ease-out | ease-in-out | linear | bezier */
				animationDuration: 700,
				animationInterval: 2000,
				autoplay: true,
				controls: true,
				navigation: 'circles', 			/* circles | squares */
				onSlideShow: function(){}   /* callback when Slide show event occurs */
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
		var _noOfSlides = _settings.slides.length || _container.find('.slide').length;
		
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
			
			/* start jR3DCarousel if autoplay */
			if(_settings.autoplay){
				_playjR3DCarousel();
			}
			
			/* adjust size according to device */
			addEventListener('resize', _maintainResposive);
			_maintainResposive();
			
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
				
				_baseAngle = 360 / _noOfSlides;

				/* create jR3DCarousel slide stack */
				if(_settings.slides.length){					
					for(var i = 0;  i < _settings.slides.length; i++){
						var slide = $( "<div class='slide' data-index="+i+" />" )
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
					_container.find('.slide').each(function(i){
						var slide = $(this).attr('data-index', i);
						if(_settings.animation.indexOf('slide')!=-1){
							_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}else if(_settings.animation.indexOf('scroll')!=-1){
							_transform = 'rotateX('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}else if(_settings.animation == 'fade'){
							_transform = 'rotateY('+_baseAngle*i+'deg) translateZ('+_translateZ+'px)';
						}
						slide.css({ transform: _transform }).detach();
						_jR3DCarouselDiv.append(slide);
					});
				}
				_jR3DCarouselDiv.find('.slide').css({position: 'absolute', left: 0, top:0, width:'100%', height:'100%', backfaceVisibility: 'hidden'});
				_jR3DCarouselDiv.find('.slide img').css({ width:'100%', height:'100%', objectFit:_settings.slideLayout });
				
				_container.css({ perspective: _perspective, width: _width+'px', height: _height+'px', position: "relative", overflow: 'visible'});
	
			}
			
			function _createControls(){
				_previousButton = $( "<div class='previous controls' style='left: 7px; transform: rotate(-45deg);'></div>");
				_nextButton = $( "<div class='next controls' style='right: 7px; transform: rotate(135deg);'></div>");
				_previousButton.add(_nextButton).appendTo(_container)
							   .css({position: 'absolute', top:'42%', zIndex:1, display: 'inline-block', padding: '14px', boxShadow: '4px 4px 0 rgba(177,177,177,0.7) inset', cursor:'pointer'})
							   .hide();
				
				 /* event handlers */
				_previousButton.on('click', function(){
					_currentSlideIndex = Math.round(_rotationAngle/_baseAngle);
					_targetSlideIndex = _currentSlideIndex-1;
					_animations.run(_settings.animation, _targetSlideIndex);
				});
				_nextButton.on('click', function(){
					_currentSlideIndex = Math.round(_rotationAngle/_baseAngle);
					_targetSlideIndex = _currentSlideIndex+1;
					_animations.run(_settings.animation, _targetSlideIndex);
				});
				
				/* event handlers */	
				_container.hover(function(){
					_previousButton.add(_nextButton).fadeIn();
				},function(){
					_previousButton.add(_nextButton).fadeOut();
				});
				
				var mousePressed = false;
				var oldPageX = 0;
				var moveDirection;
				_container.on('mousedown', function(e){
					e.preventDefault();
					mousePressed = true;
					oldPageX = e.pageX;
					moveDirection = "";
				})
				.on('mousemove', function(e){
					e.preventDefault();
					if(mousePressed && Math.abs(oldPageX - e.pageX) > 20){
							moveDirection = (oldPageX > e.pageX) ? "left" : "right";
					}
				})
				.on('mouseup', function(){
					mousePressed = false;
					if(moveDirection == "left"){
						_nextButton.click();
					}
					else if(moveDirection == "right"){
						_previousButton.click();
					}
				});
				
			}
			
			function _createNavigation(){
				var type = _settings.navigation;
				var _navigation = $('<div class=navigation />').css({ position: 'absolute', bottom: 0, right: 0 });
				for(var i = 0;  i < _noOfSlides; i++){
					_navigation.append('<div class=nav></div>');
				}
				if(type == 'circles'){
					_navigation.find('.nav').css({ border: '1px dashed #ccc', borderRadius: '12px' });
				}else if(type == 'squares'){
					_navigation.find('.nav').css({ border: '1px ridge #fff' });
				}
				_navigation.find('.nav').css({ display: 'inline-block', margin: '5px', cursor: 'pointer', backgroundColor: 'rgba(77, 77, 77, 0.7)', width: '12px', height: '12px' })
										.first().css({ backgroundColor: 'rgba(07, 07, 07, 1)' });
				_jR3DCarouselDiv.after(_navigation);
				
				 /* event handler */
				_container.on('click', '.nav', function(){
					_targetSlideIndex =  $(this).index();
					_animations.run(_settings.animation, _targetSlideIndex);
				});
			}
			
			function _playjR3DCarousel(){
				_timer = setInterval(function(){
								_currentSlideIndex = Math.round(_rotationAngle/_baseAngle);
								_targetSlideIndex = _currentSlideIndex+1;
								_animations.run(_settings.animation, _targetSlideIndex);
							}, _settings.animationInterval+_settings.animationDuration);
				
				/* event handlers */	
				_container.hover(function(){
					clearInterval(_timer);
				},function(){
					_timer = setInterval(function(){
									_currentSlideIndex = Math.round(_rotationAngle/_baseAngle);
									_targetSlideIndex = _currentSlideIndex+1;
									_animations.run(_settings.animation, _targetSlideIndex);
								}, _settings.animationInterval+_settings.animationDuration);
				});
			}
						
		})();
		
		function _getPreviousSlide(){
			return _jR3DCarouselDiv.find('.slide').eq((_currentSlideIndex-1)%_noOfSlides);
		}
		function _getCurrentSlide(){
			return _jR3DCarouselDiv.find('.slide').eq(_currentSlideIndex);
		}
		function _getNextSlide(){
			return _jR3DCarouselDiv.find('.slide').eq((_currentSlideIndex+1)%_noOfSlides);
		}
		function _getSlideByIndex(idx){
			return _jR3DCarouselDiv.find('.slide[data-index='+idx+']');
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
		
		function _slideCarouseld(){
			/* set active nav icon */
			_container.find('.nav').css({  backgroundColor: 'rgba(77, 77, 77, 0.4)' })
								   .eq(_targetSlideIndex % _noOfSlides).css({ backgroundColor: 'rgba(07, 07, 07, 1)' });
			_currentSlideIndex = (Math.round(_rotationAngle /_baseAngle) - 1) % _noOfSlides;
			_settings.onSlideShow.call(this, _getNextSlide());
		}
		function _slide(targetSlideIndex){
			_container.css({ perspective: '', overflow: 'hidden' });
			_rotationAngle = _baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)' });
			_slideCarouseld();
		}
		
		function _slide3D(targetSlideIndex){
			_container.css({ perspective: _perspective, overflow: 'visible' });
			_rotationAngle = _baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)' });
			_slideCarouseld();
		}
		
		function _scroll(targetSlideIndex){
			_container.css({ perspective: '', overflow: 'hidden' });
			_rotationAngle=_baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateX('+-_rotationAngle+'deg)' });
			_slideCarouseld();
		}
		
		function _scroll3D(targetSlideIndex){
			_container.css({ perspective: _perspective, overflow: 'visible' });
			_rotationAngle=_baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateX('+-_rotationAngle+'deg)' });
			_slideCarouseld();
		}
		
		function _fade(targetSlideIndex){
			_jR3DCarouselDiv.css({transition: 'opacity 0ms'});
			_jR3DCarouselDiv.css({opacity: 0});
			_jR3DCarouselDiv.css('opacity');
			_jR3DCarouselDiv.css({transition: 'opacity '+ _settings.animationDuration+'ms '+_settings.animationCurve});
			
			_rotationAngle = _baseAngle * targetSlideIndex;
			_jR3DCarouselDiv.css({ transform: 'translateZ('+-_translateZ+'px) rotateY('+-_rotationAngle+'deg)', opacity: 1 });
			_slideCarouseld();
		}
		
		function _maintainResposive(){
			_container.width('100%');
			_width = _container.width() < _settings.width ? _container.width() : _settings.width;
			_height = _width/_aspectRatio;
			_container.css({width: _width+'px', height: _height+'px' });
		}	
		
		/* public API */
		this.showSlide = function(index){
			_jR3DCarouselDiv.find('.nav').eq((index-1)%_noOfSlides).click();
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

		return this;
	}
	
});
