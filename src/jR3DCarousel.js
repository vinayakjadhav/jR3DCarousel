/**
 * Author: Vinayak Rangnathrao Jadhav
 * Project: jRCarousel
 * Version: 0.1
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(function($){
	
	$.fn.jRCarousel = function(options){
		var _defaults = {
				width : 1349,				/* largest allowed width */
				height: 668,				/* largest allowed height */
				slides : [], 				/* array of images source or gets slides by 'slide' class */
				slideLayout : 'fill', 		/* contain | fill | cover */
				animation: 'slide', 		/* slide | scroll | fade | zoomInSlide | zoomInScroll */
				animationSpeed: 700,
				animationInterval: 2000,
				autoplay: true,
				controls: true,
				navigation: null, 			/* circles | squares */
				onSlideShow: function(){}   /* callback when Slide show event occurs */
		}
		var _settings = $.extend( true, {}, _defaults, options );
		var _container = this;
		var _width = _settings.width;
		var _height = _settings.height;
		var _aspectRatio = _settings.width/_settings.height;
		var _wrapper = $( "<div class='jRCarousel' />" ).css({ display:'block', position: 'relative', overflow: 'hidden', width: '100%', height: '100%' })
														.appendTo(_container);
		var _currentSlide;
		var _targetSlideIndex;
		var _animations = new Animations();
		var _previousButton;
		var _nextButton;
		var _timer;
		
		(function setup(){
			
			/* create jRCarousel */
			createjRCarousel();
			
			/* create control buttons */
			if(_settings.controls){
				_createControls();
			}
			
			/* create navigation bar */
			if(_settings.navigation){
				_createNavigation();
			}
			
			/* start jRCarousel if autoplay */
			if(_settings.autoplay){
				_playjRCarousel();
			}
			
			/* adjust size according to device */
			addEventListener('resize', _makeResposive);
			_makeResposive();
			
			function createjRCarousel(){
				/* create jRCarousel stack, and keep first slide at top of stack */
				if(_settings.slides.length){
					for(var i = 0;  i < _settings.slides.length; i++){
						var slide = $( "<img class='slide' data-index="+i+" />" )
						.prop({src:_settings.slides[i].src, alt:"'"+_settings.slides[i].src+"'"}).detach();
						_wrapper.append(slide);
					}
				}else{
					_container.find('.slide').each(function(i){
						var slide = $(this).attr('data-index', i).detach();
						_wrapper.append(slide);
					});
				}
				_wrapper.find('.slide').css({position: 'absolute', left: 0, top:0, width:'100%', height:'100%', objectFit:_settings.slideLayout, backgroundColor:'#fff'});
				_wrapper.find('.slide img').css({ width:'100%', height:'100%', objectFit:_settings.slideLayout });
				
				_currentSlide = _wrapper.find('.slide').first().detach();
				_wrapper.append(_currentSlide);
				_container.css({width: _width+'px', height: _height+'px' });

			}
			
			function _createControls(){
				_previousButton = $( "<div class='previous controls' style='left: 9px; transform: rotate(-45deg);'></div>");
				_nextButton = $( "<div class='next controls' style='right: 9px; transform: rotate(135deg);'></div>");
				_previousButton.add(_nextButton).appendTo(_wrapper)
							   .css({position: 'absolute', top:'42%', zIndex:1, display: 'inline-block', padding: '18px', boxShadow: '7px 7px 0 1px #777 inset', cursor:'pointer',opacity:'0.7'})
							   .hide();
				
				 /* event handlers */
				_previousButton.on('click', function(){
					_wrapper.find('.controls').hide();
					_startCarousel(_getPreviousSlide());
				});
				_nextButton.on('click', function(){
					_wrapper.find('.controls').hide();
					_startCarousel(_getNextSlide());
				});
				
				/* event handlers */	
				_container.hover(function(){
					_wrapper.find('.controls').fadeIn();
				},function(){
					_wrapper.find('.controls').fadeOut();
				});
			}
			
			function _createNavigation(){
				var type = _settings.navigation;
				var _navigation = $('<div class=navigation />').css({ textAlign: 'right' });
				for(var i = 0;  i < _wrapper.find('.slide').length; i++){
					_navigation.append('<div class=nav></div>');
				}
				if(type == 'circles'){
					_navigation.find('.nav').css({ border: '0 dashed #ccc', borderRadius: '12px' });
				}else if(type == 'squares'){
					_navigation.find('.nav').css({ border: '0 dotted #fff' });
				}
				_navigation.find('.nav').css({ display: 'inline-block', margin: '4px', cursor: 'pointer', backgroundColor: '#777', width: '12px', height: '12px' })
										.first().css({ borderWidth: '2px' });
				_wrapper.after(_navigation);
				
				 /* event handler */
				_container.on('click', '.nav', function(){
					_startCarousel(_getSlideByIndex($(this).index()));
				})
				.css({ marginBottom: '24px' });
			}
			
			function _playjRCarousel(){
				_timer = setInterval(_startCarousel, _settings.animationInterval+_settings.animationSpeed);
				_wrapper.find('.controls').hide();
				
				/* event handlers */	
				_container.hover(function(){
					clearInterval(_timer);
					_timer = 0;
					_wrapper.find('.controls').fadeIn();
				},function(){
					_wrapper.find('.controls').fadeOut();
					_timer = setInterval(_startCarousel, _settings.animationInterval+_settings.animationSpeed);
				});
			}
			
			jQuery.fx.interval = 7;
			
		})();
		
		function _getPreviousSlide(){
			return _wrapper.find('.slide').eq(-2);
		}
		function _getCurrentSlide(){
			return _wrapper.find('.slide').last();
		}
		function _getNextSlide(){
			return _wrapper.find('.slide').first();
		}
		function _getSlideByIndex(idx){
			return _wrapper.find('.slide[data-index='+idx+']');
		}
		
		function Animations(){
			this.animations = {
					slide : _slide,
					scroll: _scroll,
					fade: _fade,
					zoomInSlide: _zoomInSlide,
					zoomInScroll: _zoomInScroll
				}
		}
		Animations.prototype.run = function run(animation, direction){
				this.animations[animation](direction);
		}
		
		function _startCarousel(slide){
			var targetSlide = slide || _getNextSlide();
			_currentSlide = _getCurrentSlide();
			
			_targetSlideIndex = targetSlide.data('index');
			var currentSlideIndex = _currentSlide.data('index');
			
			/* same slide */
			if(currentSlideIndex == _targetSlideIndex){
				return -1;
			}
			
			/* show current & target slide and hide all other */
			_wrapper.find('.slide').not(_currentSlide[0]).hide();
			targetSlide.show();
			
			/* target is in next slides */
			if(currentSlideIndex < _targetSlideIndex){
				/* get next slide & make it to appear on top of stack to run animation */
				while(_getCurrentSlide().data('index') != _targetSlideIndex){
					_currentSlide = _getNextSlide().detach().appendTo(_wrapper);
				}
				_animations.run(_settings.animation, 1);
			}
			/* target is in previous slides */
			else{
				/* get previous slide, run animation & make target slide to appear on top of stack after animation */
				_animations.run(_settings.animation, -1);
			}
			
			/* set active nav icon */
			_container.find('.nav').css({ borderWidth: 0 })
								   .eq(_targetSlideIndex).css({ borderWidth: '2px' });	
		}
		
		function _stopCarousel(){
			/* If continuous slideShow is not in progress */
			if(!_timer){
				_wrapper.find('.controls').show();
			}
			_settings.onSlideShow.call(this, _currentSlide);
		}
		
		/* direction is 1 = next & -1 = previous */
		function _slide(direction){
			if(direction == 1){
				_currentSlide.css({ left:_width+'px' })
				.animate({
					left: 0
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){	
						_stopCarousel();
					}
				})
			}else{
				_currentSlide
				.animate({
					left: _width+'px'
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_currentSlide.css({ left: 0 });
						/* make target slide to appear on top of stack after animation */
						while(_getCurrentSlide().data('index') != _targetSlideIndex){
							_currentSlide = _getCurrentSlide().detach().prependTo(_wrapper);
						}
						_currentSlide = _getCurrentSlide();
						_stopCarousel();						
					}
				})
			}
		}
		
		function _scroll(direction){
			if(direction == 1){
				_currentSlide.css({	top: _height+'px' })
				.animate({
					top: 0
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_stopCarousel();
					}
				})
				
			}else{
				_currentSlide
				.animate({
					top: _height+'px'
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_currentSlide.css({ top: 0 });
						/* make target slide to appear on top of stack after animation */
						while(_getCurrentSlide().data('index') != _targetSlideIndex){
							_currentSlide = _getCurrentSlide().detach().prependTo(_wrapper);
						}
						_currentSlide = _getCurrentSlide();
						_stopCarousel();
					}
				})
			}
		}
		
		function _fade(direction){
			if(direction==1){
				_currentSlide.css({	opacity: 0 })
				.animate({
					opacity: 1
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_stopCarousel();
					}
				})
			}else{
				_currentSlide
				.animate({
					opacity: 0
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_currentSlide.css({ opacity: 1 });
						/* make target slide to appear on top of stack after animation */
						while(_getCurrentSlide().data('index') != _targetSlideIndex){
							_currentSlide = _getCurrentSlide().detach().prependTo(_wrapper);
						}
						_currentSlide = _getCurrentSlide();
						_stopCarousel();
					}
				})
			}
		}
		
		function _zoomInScroll(direction){
			if(direction==1){
				_currentSlide.css({	height: 0 })
				.animate({
					height: '100%'
				},
				{
				duration: _settings.animationSpeed,
				complete: function(){
					_stopCarousel();
				}
			})
			}else{
				_currentSlide
				.animate({
					height: 0
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_currentSlide.css({ height:'100%' });
						/* make target slide to appear on top of stack after animation */
						while(_getCurrentSlide().data('index') != _targetSlideIndex){
							_currentSlide = _getCurrentSlide().detach().prependTo(_wrapper);
						}
						_currentSlide = _getCurrentSlide();
						_stopCarousel();
					}
				})
			}
		}
		
		function _zoomInSlide(direction){
			if(direction==1){
				_currentSlide.css({
					width: 0,
					left: _width+'px'
				})
				.animate({
					width: '100%',
					left:0
				},
				{
				duration: _settings.animationSpeed,
				complete: function(){
					_stopCarousel();
				}
			})
			}else{
				_currentSlide
				.animate({
					width: 0
				},
				{
					duration: _settings.animationSpeed,
					complete: function(){
						_currentSlide.css({ width:'100%' });
						/* make target slide to appear on top of stack after animation */
						while(_getCurrentSlide().data('index') != _targetSlideIndex){
							_currentSlide = _getCurrentSlide().detach().prependTo(_wrapper);
						}
						_currentSlide = _getCurrentSlide();
						_stopCarousel();
					}
				})
			}		
		}
		
		function _makeResposive(){
			_container.width('100%');
			_width = _container.width() < _settings.width ? _container.width() : _settings.width;
			_height = _width/_aspectRatio;
			_container.css({width: _width+'px', height: _height+'px' });
		}	
		
		/* public API */
		this.showSlide = function(index){
			_startCarousel(_getSlideByIndex(index));
		}
		this.getCurrentSlide = function(){
			return _getCurrentSlide();
		}
		this.getSlideByIndex = function(index){
			return _getSlideByIndex(index);
		}
		this.showPreviousSlide = function(){
			_startCarousel(_getPreviousSlide());
		}
		this.showNextSlide = function(){
			_startCarousel(_getNextSlide());
		}

		return this;
	}
	
});
