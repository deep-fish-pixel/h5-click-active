/*
 * 对exp通用的功能封装
 * @author mawei
 */
;if(typeof template == 'undefined'){
	var template = {};
}
var Exp = (function($, template){
	var ua = navigator.userAgent;
	var Exp = {
		mobile: !!ua.match(/AppleWebKit.*Mobile.*/)||typeof window.orientation !== 'undefined',
		/*
		 * function 事件注册
		 * @param  {[Element]} $el [触发对象]
		 * @param  {[string]} eventName [事件名称]
		 * @param  {[string]} selector [选择器]
		 * @param  {[function]} handler [事件回调]
		 * author: mawei
		 */
		registerListener: function($el, eventName, selector, handler){
			if(!handler){
				handler = selector;
				selector = undefined;
			}
			var mobile = Exp.mobile,
				eventNames = {
					touchstart: {
						name: mobile ? "touchstart" : "mousedown",
						path: "touches"
					},
					touchmove: {
						name: mobile ? "touchmove" : "mousemove",
						path: "touches"
					},
					touchend: {
						name: mobile ? "touchend" : "mouseup",
						path: "changedTouches"
					},
					touchcancel: {
						name: mobile ? "touchcancel" : "mouseup",
						path: "touches"
					}
				},
				config = eventNames[eventName],
				newListener = function(event){
					var evt = event[config.path]?event[config.path][0]:event, self = this;
					if(handler){
						return handler.call(self, evt, event);
					}
				},
				args = [config.name, selector, newListener];
			if(!selector){
				args = [config.name, newListener];
			}
			$el.on.apply($el, args);
		},
		/*
		 * function 拖动开始事件
		 * @param  {[Element]} $el [触发对象]
		 * @param  {[string]} selector [选择器]
		 * @param  {[function]} handler [事件回调]
		 * author: mawei
		 */
		touchstart: function($el, selector, handler){
			this.registerListener($el, "touchstart", selector, handler);
		},
		/*
		 * function 拖动移动事件
		 * @param  {[Element]} $el [触发对象]
		 * @param  {[string]} selector [选择器]
		 * @param  {[function]} handler [事件回调]
		 * author: mawei
		 */
		touchmove: function($el, selector, handler){
			this.registerListener($el, "touchmove", selector, handler);
		},
		/*
		 * function 拖动结束事件
		 * @param  {[Element]} $el [触发对象]
		 * @param  {[string]} selector [选择器]
		 * @param  {[function]} handler [事件回调]
		 * author: mawei
		 */
		touchend: function($el, selector, handler){
			this.registerListener($el, "touchend", selector, handler);
		},
		/*
		 * function 拖动取消事件
		 * @param  {[Element]} $el [触发对象]
		 * @param  {[string]} selector [选择器]
		 * @param  {[function]} handler [事件回调]
		 * @param  {[object]} data [绑定数据]
		 * author: mawei
		 */
		touchcancel: function($el, selector, handler, data){
			this.registerListener($el, "touchcancel", selector, handler, data);
		},
		/*
		 * function 点击事件
		 * @param  {[Element]} $el [触发对象]
		 * @param  {[string]} selector [选择器]
		 * @param  {[function]} handler [事件回调]
		 * @param  {[Boolean]} immediate [是否立即执行]
		 * @author: mawei
		 */
		click: function($el, selector, handler, immediate, data){
			var sub, touchstart, touchend;
			if(typeof arguments[1] == 'function'){
				data = immediate;
				immediate = handler;
				handler = selector;
				selector = undefined;
				touchstart = data&&data.touchstart;
				touchend = data&&data.touchend;
			}
			this.touchstart($el, selector, function(event){
				if(touchstart){
					touchstart.call(this, event, data);
				}
				if(sub)return;
				sub = {x:event.clientX, y:event.clientY, target:this};
			});
			this.touchend($el, selector, function(event){
				var self = this;
				if(!sub || this != sub.target)return;
				if(Math.abs(event.clientX - sub.x) <= 10 && Math.abs(event.clientY - sub.y) <= 10){
					if(handler){
						//使点击active有效
						if(immediate === true){
							sub = null;
							return handler.call(this, event, data);
						}else if((typeof immediate)  === 'number'){
							setTimeout(function(){handler.call(self, event);}, immediate);
						}else{
							setTimeout(function(){
								handler.call(self, event, data);
							}, 30);
						}
					}
				}
				if(touchend){
					touchend.call(this, event, data);
				}
				sub = null;
			});
			this.touchcancel($el, selector, function(event){
				sub = null;
			});
		},
		/*
		 * function 添加可点击active状态，通过检测data-clickactive属性，clickactive可自定义颜色值
		 * @param  {[Element]} $el [父元素] 默认document.body
		 * author: mawei
		 */
		clickActive: function(parent){
			if(!parent){
				parent = $(document.body)
			}

			function getBackgroundColor($dom) {
				var bgColor = "";
				while($dom[0].tagName.toLowerCase() != "html") {
					bgColor = $dom.css("background-color");
					if(bgColor != "rgba(0, 0, 0, 0)" && bgColor != "transparent") {
						break;
					}
					$dom = $dom.parent();
				}
				return bgColor;
			}
			//色差推算
			function subColor(color){
				var colors = color.match(/\d+/ig), value, ret='rgb(';
				for(var i=0; i<3; i++){
					value = Math.ceil(colors[i] - (256-colors[i])/8 - 21);
					value = value<0?0:value;
					ret += value;
					if(i!=2){
						ret += ',';
					}
				}
				ret += ')';
				return ret;

			}
			var Exp = this,
				colorReg = /^(#\d+|change)$/,
				animateTimeReg = /^[.\d]+s$/,
				methodReg = /^(normal|long|wave)$/;

			var waves = [],
		        position,
		        surviveTime = 2000;

		    function addRelative(el){
	    		el.css('position', 'relative|absolute|fixed'.indexOf(el.css('position'))<0 ? 'relative' : '');
				el.css('overflow', 'hidden'.indexOf(el.css('overflow'))<1 ? 'hidden' : '');
		    }
			parent.find('[data-clickactive]').each(function(i, e){
				var e = $(e), point, valid = false, validLonger = 100, timer,
					colors = e.data('clickactive').split(','),
					color,
					animateTime,
					method = 'normal',
					href = e.data('href'),
					change,
					forbidden,
					tempForbidden,
					createWave;
				colors.forEach(function (c, i) {
					if(c.match(colorReg)){
						color = c
						if(color == 'change'){
							change = true;
						}
					}
					else if(c.match(animateTimeReg)){
						animateTime = c
					}
					else if(c.match(methodReg)){
						method = c
					}
				});
				if(!color){
					color = subColor(getBackgroundColor(e));
				}

				//保持父元素相对定位
				if(method ==='wave'){
					addRelative(e);
				}
				e.removeAttr('data-clickactive').removeAttr('data-href');
				if(animateTime && navigator.userAgent.indexOf(/MQQBrowser/) === -1){
					Exp.css(e, 'transition', 'background-color '+(animateTime ||'.1s'));
				}
				function setBackGround($target,event){
					if(method ==='wave')return;
					if(valid){
						e.addClass('click-active');
						e.css('background-color', color);
					}
					else{
						e.css('background-color', '');
						e.removeClass('click-active');
					}
				}
				Exp.touchstart(e, function(event){
					if(timer)clearInterval(timer);
					if(event.target && e.is('[data-clickforbidden]')){
						tempForbidden = true;
						return;
					}
					tempForbidden = false;
					if(change){
						forbidden = e.is('[data-clickforbidden]');
						if(forbidden)return;
					}
					point = {
						x:event.clientX, 
						y:event.clientY,
						px:event.pageX, 
						py:event.pageY
					};
					valid = true;

					if( method === 'wave' ){
						createWave = function (){
							var dotX = point.px - e.offset().left - 25,
			                	dotY = point.py - e.offset().top - 25;
			                	//get color instance
			                	color = subColor(getBackgroundColor(e));
					        waves.push({
					            el:$('<div class="wave" style="left:'+dotX+'px;top:'+dotY+'px;background-color:'+color+'"></div>').appendTo(e),
					            timer: setTimeout(function () {
					                remove();
					            }, surviveTime)
					        });
					        timer = 0;
						}
						timer = setTimeout(createWave, validLonger);
					}
					else{
						timer = setInterval(setBackGround, validLonger);
						if(change){
							color = subColor(getBackgroundColor(e))
						};
					}
				});
				Exp.touchmove(e, function(event){
					if(change && forbidden || tempForbidden){
						return;
					}
					valid = false;
					clearInterval(timer);
					setBackGround(e, event);
		            remove();
				});
				Exp.touchend(e, function(event){
					if(change && forbidden || tempForbidden){
						return;
					}
					if(point){
						var x = event.clientX, y = event.clientY;
						if(Math.abs(point.x - x) <= 10 && Math.abs(point.y - y) <= 10){
							setBackGround(e, event);
							valid = false;
							setTimeout(setBackGround, method=='long'? validLonger*10 : validLonger);
							if(href){
								setTimeout(function(){
									window.location.href = href;
								}, validLonger + 400);
							}
							if(method === 'wave'){
								if(timer){
									clearTimeout(timer);
									createWave();
								}
							}
						}
						else{
							valid = false;
							setBackGround(e, event);
						}
						if(method === 'wave'){
							clearTimeout(timer);
							remove(0);
						}
						else{
							clearInterval(timer);
						}
						
					}
					point = null;
					valid = false;
				});
				e.on('touchcancel', function(event){
					valid = false;
					remove(3500);
				});
			});
			function remove(time){
		        var wave = waves.shift();
		        if(wave){
		            wave.el.addClass('wave-large');
		            setTimeout(function(){
		                wave.el.remove();
		            },time || 1000);
		        }
		    }
		},
		init: function(){
			this.clickActive();
		}
	}
	Exp.click($(document.body), function(){});//解决webkit不触发点击事件
	Exp.init();
	return Exp;
})($, template);
