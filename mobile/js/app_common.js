'use strict';

//< mm선언
var __mm__ = {
	__: {
		_isTouch: false,
		_isStage: false,
		_publishHomeUrl: '_stage.html',
		_realHomeUrl: '',
		_publishMainUrl: 'main.html',
		_realMainUrl: 'main',
	},
};

Object.defineProperty(window, 'mm', {
	get: function () {

		return __mm__;

	},
});
//> mm선언

//< 문자열 변환
mm.string = (function () {

	return {
		//- 템플릿 문자열
		template: function (__template, __replace) {

			var _result = '';
			var strings = (Array.isArray(__template)) ? __template : [__template];

			_.forEach(strings, function (__string, __index) {

				if (__index > 0) _result += '\n';

				var splits = __string.split('${');
				_.forEach(splits, function (__item, __i) {

					var _lastIndex = (__i === 0) ? -1 : __item.indexOf('}');

					if (_lastIndex > -1 && __item.startsWith(',,,')) {
						var _delimiterIndex = __item.indexOf('(');
						var _delimiter = __item.slice(_delimiterIndex + 1, __item.lastIndexOf(')'));
						var words = __replace[__item.slice(3, _delimiterIndex)];

						_.forEach(words, function (__val, __i) {

							_result += (__i === 0) ? __val : _delimiter + __val;
							if (__i === words.length - 1) _result += __item.slice(_lastIndex + 1);

						});
					}
					else _result += (_lastIndex > -1) ? __replace[__item.slice(0, _lastIndex)] + __item.slice(_lastIndex + 1) : __item;

				});

			});

			return _result;

		},
		//- 문자열 연결
		join: function (__string1, __string2, __strings) {

			return Object.values(arguments).join('');

		},
		//- escape RegExp
		escape: function (__string) {

			return __string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

		},
		//- constructor name
		constructor: function (__value) {

			return (typeof(__value) === 'function' && __value.name) ? __value.name : __value.constructor.toString().trim().replace(/^\S+\s+(\w+)[\S\s]+$/, '$1');

		},
	};

})();
//> 문자열 변환

//< 셀렉터 문자열 변환
mm.selector = function (__selector, __type) {

	var _selector = (typeof(__selector) === 'string') ? [__selector] : __selector;
	var _type = (typeof(__type) === 'string') ? __type : '';
	if (Array.isArray(_selector)) {
		switch (_type) {
			case '.':
				return mm.string.template('.${,,,LIST(, .)}', { LIST: _selector });
			case '#':
				return mm.string.template('#${,,,LIST(, #)}', { LIST: _selector });
			case '[]':
				return mm.string.template('[${,,,LIST(], [)}]', { LIST: _selector });
			default:
				return mm.string.template(mm.string.template('${TYPE}${WORD}LIST(, ${TYPE})}', { TYPE: _type, WORD: '${,,,' }), { LIST: _selector });
		}
	}
	else return null;

}
//> 셀렉터 문자열 변환

//< 숫자 변환
mm.number = (function () {

	return {
		//- 3자리 콤마 표시
		comma: function (__value) {

			if (Number.isFinite(__value)) return __value.toLocaleString();
			else return __value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

		},
		//- 단위 추가
		unit: function (__number, __unit) {

			return mm.string.join(__number, __unit || 'px');

		},
	};

})();
//> 숫자 변환

//< 쿼리스트링 변환
mm.query = (function () {

	return {
		//- 문자열을 object로 변환
		parse: function (__string) {


			if (typeof(__string) !== 'string' || !__string.includes('=')) return {};

			var _queryString = (__string.charAt(0) === '?') ? __string.slice(1) : __string;
			var queries = _queryString.split('&');
			var splits = _.partition(queries, function (__value) {

				return __value.includes('[');

			});

			var datas = _.chain(splits[1])
			.map(function (__value) {

				if (__value) return __value.split('=');

			})
			.fromPairs()
			.value();

			_.forEach(splits[0], function (__value) {

				var _index = __value.indexOf('[');
				var _key = __value.slice(0, _index);
				var _value = __value.split('=')[1];

				if (Array.isArray(datas[_key])) datas[_key].push(_value);
				else datas[_key] = [_value];

			});

			_.forEach(datas, function (__value, __key) {

				if (typeof(__value) === 'string') datas[__key] = decodeURIComponent(__value);

			});

			return datas;

		},
		//- object를 문자열로 변환
		stringify: function (__object, __isUrlSearch) {

			if (!mm.is.object(__object)) return '';

			var _str = (__isUrlSearch === true) ? '?' : '';
			_.forEach(__object, function (__value, __key) {

				if (Array.isArray(__value)) {
					_.forEach(__value, function (__val) {

						_str += mm.string.template('&${KEY}[]=${VALUE}', { KEY: __key, VALUE: __val });

					});
				}
				else _str += mm.string.template('&${KEY}=${VALUE}', { KEY: __key, VALUE: encodeURIComponent(__value) });

			});

			return _str.replace('&', '');

		}
	};

})();
//> 쿼리스트링 변환

//< 컬러 변환
mm.color = (function () {

	return {
		//- rgb/rgba 컬러를 hex로 변환
		hex: function (__value) {

			if (typeof(__value) !== 'string') return;

			if (__value.startsWith('rgb')) {
				var values = _.compact(__value.split(/rgb\(|rgba\(|\,|\)/g));
				var _value = '#';

				_.forEach(values, function (__val, __index) {

					var _number = (__index < 3) ? parseFloat(__val) : Math.round(parseFloat(__val) * 255);
					var _hex = _number.toString(16);
					_value += _hex.padStart(2, '0');

				});

				return _value;
			}
			else return __value;

		},
	};

})();
//> 컬러 변환

//< 오브젝트 깊은 복제/병합
mm.extend = function (__origins, __extends) {

	var base = {
		clone: function (__objs, __keys) {

			if (!__objs || !['Object', 'Array'].includes(__objs.constructor.name)) return __objs;

			var exts = (__keys) ? __keys : __objs.constructor();
			for (var _key in __objs) {
				if (__objs.hasOwnProperty(_key)) exts[_key] = base.clone(__objs[_key], exts[_key]);
			}

			return exts;

		},
	};

	var clones = base.clone(__origins);

	if (!clones || typeof(clones) !== 'object' || !__extends || typeof(__extends) !== 'object') return clones;
	else return base.clone(__extends, clones);

}
//> 오브젝트 깊은 복제/병합

//< 확인(true/false)
mm.is = (function () {

	var base = {
		isMobile: function (__type) {

			var type = {
				iphone: 'iphone',
				ipad: 'ipad',
				ipod: 'ipod',
				get ios() {
					return mm.string.template('${,,,IOS(|)}', { IOS: [this.iphone, this.ipad, this.ipod] });
				},
				android: 'android',
				blackberry: 'blackberry|bb10|playbook',
				window: 'iemobile|windows phone|windows mobile',
				opera: 'opera mini',
				app_ios: 'app_ios',
				app_android: 'app_android',
				get app() {
					return mm.string.template('${,,,APP(|)}', { APP: [this.app_ios, this.app_android] });
				},
				app_kitkat: 'android 4.4',
				app_first: 'app_first',
			}
			var _type = (!__type) ? mm.string.template('${,,,ALL(|)}|webos|bada|zunewp7|nokia', { ALL: [type.ios, type.android, type.blackberry, type.window, type.opera] }) : type[__type] || String(__type);

			return new RegExp(_type, 'i').test(navigator.userAgent);

		},
		isIE: function (__type) {

			var type = {
				ie6: 'msie 6',
				ie7: 'msie 7',
				ie8: 'msie 8',
				ie9: 'msie 9',
				ie10: 'msie 10',
				ie11: 'rv:11',
				get ie() {
					return mm.string.template('msie|${IE}', { IE: this.ie11 });
				},
				get ie9over() {
					return mm.string.template('${,,,IE(|)}', { IE: [this.ie9, this.ie10, this.ie11, this.edge] });
				},
				get ie10over() {
					return mm.string.template('${,,,IE(|)}', { IE: [this.ie10, this.ie11, this.edge] });
				},
				edge: 'edge',
			}
			var _type = (!__type) ? mm.string.template('${,,,ALL(|)}', { ALL: [type.ie, type.edge] }) : type[__type] || String(__type);

			return new RegExp(_type, 'i').test(navigator.userAgent);

		},
	};

	(function () {

		var classes = [];

		if (base.isMobile()) {
			classes.push('__mobile');

			if (base.isMobile('ios')) classes.push('__ios');
			if (base.isMobile('app')) {
				classes.push('__app');

				if (base.isMobile('app_kitkat')) classes.push('__kitkat');
			}
		}
		else {
			classes.push('__pc');

			if (base.isIE()) {
				if (base.isIE('ie6')) classes.push('__ie6');
				else if (base.isIE('ie7')) classes.push('__ie7');
				else if (base.isIE('ie8')) classes.push('__ie8');
				else if (base.isIE('ie9')) classes.push('__ie9');
				else if (base.isIE('ie10')) classes.push('__ie10');
				else if (base.isIE('ie11')) classes.push('__ie11');
				else if (base.isIE('edge')) classes.push('__edge');
			}

			if (/whale/i.test(navigator.userAgent)) classes.push('__whale');
		}

		_.forEach(classes, function (__class) {

			document.documentElement.classList.add(__class);

		});

	})();

	return {
		//- 모바일
		mobile: base.isMobile,
		//- 익스, 엣지
		ie: base.isIE,
		//- 홀수
		odd: function (__number) {

			var _number = parseFloat(__number);
			if (Number.isFinite(_number)) return (_number & 1) ? true : false;
			else return false;

		},
		//- 짝수
		even: function (__number) {

			var _number = parseFloat(__number);
			if (Number.isFinite(_number)) return (_number & 1) ? false : true;
			else return false;

		},
		//- 빈 값
		empty: function (__value, __excepts) {

			var _is = false;

			if (['undefined', 'null', 'NaN', 'Infinity'].includes(String(__value))) {
				_is = true;
			}
			else {
				switch (__value.constructor.name) {
					case 'String':
						if (__value.trim().length === 0) _is = true;
						break;
					case 'Function':
					case 'Window':
						_is = false;
						break;
					case 'Object':
						if (Object.keys(__value).length === 0) _is = true;
						break;
					default:
						if (__value.length === 0) _is = true;
				}
			}

			if (Array.isArray(__excepts) && __excepts.includes(__value)) _is = !_is;

			return _is;

		},
		//- 순수 오브젝트 {}
		object: function (__value) {

			return __value && __value.constructor.name === 'Object';

		},
		//- 순수 단일 엘리먼트 (jquery 제외)
		element: function (__value, __isExceptWindow) {

			if (!__value) return false;

			var _is = /(?=.*^HTML)(?=.*Element$)|HTMLDocument|Window/.test(__value.constructor.name);
			if (__isExceptWindow === true && __value.window) _is = false;

			return _is;

		},
		//- html 레이아웃
		layout: function (__type) {

			return document.documentElement.classList.contains(mm.string.template('__layout_${TYPE}__', { TYPE: __type }));

		},
		//- 화면 노출(display:none, append 전)
		display: function (__elements) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0) return false;

			return _.every($elements, function (__$el) {

				return __$el.offsetParent || __$el.offsetWidth;

			});

		},
		//- visibility
		visible: function (__elements) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0) return false;

			return _.every($elements, function (__$el) {

				return mm.element.style(__$el, 'visibility') === 'visible';

			});

		},
		//- 포커스
		focus: function (__element) {

			var $element = mm.find(__element)[0];
			return document.activeElement === $element;

		},
	};

})();
//> 확인

//< 변수
mm._isPublish = location.host.startsWith('publish') || location.host.startsWith('127.0.0.1');
mm._isModal = mm.is.layout('modal');
mm._isPopup = mm.is.layout('popup');
mm._isFrame = mm.is.layout('frame');
mm._isError = mm.is.layout('error');
mm._isExternal = mm.is.layout('external');
mm._isMain = mm.is.layout('main');
mm._isSide = mm.is.layout('side');
mm._isSearch = mm.is.layout('search');
mm._isProduct = mm.is.layout('product');

Object.defineProperties(mm, {
	//- 화면 터치
	_isTouch: {
		get: function () {

			return top.mm.__._isTouch;

		},
		set: function (__boolean) {

			top.mm.__._isTouch = __boolean;

		},
	},
	//- 스테이지 활성화
	_isStage: {
		get: function () {

			return top.mm.__._isStage;

		},
		set: function (__boolean) {

			top.mm.__._isStage = __boolean;

		},
	},
	//- 모바일 가로모드
	_isLandscape: {
		get: function () {

			var _orientation = window.orientation || (screen.orientation) ? screen.orientation.angle : 0;
			return Math.abs(_orientation) === 90;

		}
	},
	//- 홈 경로
	_homeUrl: {
		get: function () {

			if (mm._isPublish) {
				var paths = location.pathname.split('/');
				paths.splice(-1);
				return mm.string.template('${PATH}/${PAGE}', { PATH: paths.join('/'), PAGE: mm.__._publishHomeUrl });
			}
			else return mm.string.template('/${PATH}', { PATH: mm.__._realHomeUrl });

		},
	},
	//- 메인페이지 경로
	_mainUrl: {
		get: function () {

			if (mm._isPublish) {
				var paths = location.pathname.split('/');
				paths.splice(-1);
				return mm.string.template('${PATH}/${PAGE}', { PATH: paths.join('/'), PAGE: mm.__._publishMainUrl });
			}
			else return mm.string.template('/${PATH}', { PATH: mm.__._realMainUrl });

		},
	},
});
//> 변수

//< 시간(초, css transition)
mm.time = (function () {

	var base = {
		_faster: 0.1,
		_fast: 0.2,
		_base: 0.4,
		_slow: 0.7,
		_slower: 1,
		stamp: {},
	};

	return {
		get _faster() {

			return base._faster;

		},
		get _fast() {

			return base._fast;

		},
		get _base() {

			return base._base;

		},
		get _slow() {

			return base._slow;

		},
		get _slower() {

			return base._slower;

		},
		// 시간 간격 저장(가져오기)
		stamp: function (__key) {

			if (!__key) return 0;

			if (!base.stamp[__key]) {
				base.stamp[__key] = [window.performance.now()];

				return 0;
			}
			else {
				var stamps = base.stamp[__key];
				stamps.push(window.performance.now());

				return stamps[stamps.length - 1] - stamps[stamps.length - 2];
			}

		},
		// 시간 간격 종료(가져오기)
		stampEnd: function (__key) {

			if (!__key || !base.stamp[__key]) return 0;

			var stamps = base.stamp[__key];
			var _timeGap = window.performance.now() - stamps[stamps.length - 1];

			delete base.stamp[__key];

			return _timeGap;

		},
	};

})();
//> 시간

//< 지연함수(setTimeout 1ms)
mm.delay = (function () {

	var base = {
		delays: [],
		_count: 0,
		off: function (__name) {

			var temp = { _name: __name };

			var _i = 0;
			while (_i < base.delays.length) {
				var delayItem = base.delays[_i];
				if (_.isMatch(delayItem, temp)) {
					clearTimeout(delayItem.timeout);
					base.delays.splice(_i, 1);
				}
				else _i++;
			}

		},
	};

	return {
		on: function (__callback, __option) {

			var option = mm.extend({
				_time: 1,
				_isSec: false,
				_name: null,
				_isOverwrite: false,
				thisEl: null,
				params: [],
			}, __option);
			var _time = (option._isSec) ? option._time * 1000 : option._time;
			var _name = (typeof(option._name) === 'string') ? option._name : mm.string.template('DELAY_${COUNT}', { COUNT: base._count++ });
			var temp = { _name: _name };
			var _is = false;

			var _i = 0;
			while (_i < base.delays.length) {
				var delayItem = base.delays[_i];
				if (_.isMatch(delayItem, temp)) {
					if (option._isOverwrite === true) {
						clearTimeout(delayItem.timeout);
						base.delays.splice(_i, 1);
					}
					else {
						_is = true;
						break;
					}
				}
				else _i++;
			}

			if (_is === true) return;

			base.delays.push({ _name: _name, timeout: setTimeout(function () {

					base.off(_name);
					mm.apply(__callback, option.thisEl, option.params);

				}, _time),
			});

		},
		off: function (__name) {

			if (typeof(__name) !== 'string') return;

			base.off(__name);

		},
	};

})();
//> 지연함수(setTimeout 1ms)

//< DOM 요소 검색
mm.find = function (__elements, __parents) {

	var elements = [];
	if (!__elements || (arguments.length === 2 && !__parents)) return elements;

	function findString(__$parent) {

		var $parent = (__$parent.window) ? __$parent.document : __$parent;
		var _trim = __elements.trim();

		switch (_trim) {
			case 'html':
				return [$parent.documentElement];``
			case 'body':
				return [$parent.body];``
			default:
				if (_trim.startsWith('data-')) return $parent.querySelectorAll(mm.selector(_trim, '[]'));
				else {
					var splits = _trim.split(/\#|\.|\s|\[|\]/g);
					var splitTotal = (/\:|\,/.test(_trim)) ? 0 : splits.length;

					if (splitTotal === 1) return $parent.getElementsByTagName(_trim);
					else if (splitTotal === 2 && splits[0] === '') {
						if (_trim.charAt(0) === '.') return $parent.getElementsByClassName(splits[1]);
						else if (_trim.charAt(0) === '#') {
							var $id = ($parent.constructor.name === 'HTMLDocument') ? $parent.getElementById(splits[1]) : $parent.querySelector(_trim);
							return ($id) ? [$id] : [];
						}
					}
					else {
						if ($parent.constructor.name === 'HTMLDocument') $parent = document.documentElement;
						return $parent.querySelectorAll(mm.string.template(':scope ${SELECTOR}', { SELECTOR: _trim.replace(/\,/g, ', :scope ') }));
					}
				}
		}

	}

	if (typeof(__elements) === 'string') {
		if (__parents) {
			if (typeof(__parents) !== 'object') return elements;

			if (['HTMLCollection', 'NodeList'].includes(__parents.constructor.name) || Array.isArray(__parents)) {
				elements = _.chain(__parents).map(function (__$parent) {

					return (typeof(__$parent) === 'string') ? [] : Object.values(findString(__$parent.contentDocument || __$parent));

				}).flatten().uniq().value();
			}
			else elements = findString(__parents.contentDocument || __parents);
		}
		else elements = findString(document);
	}
	else {
		switch (__elements.constructor.name) {
			case 'HTMLCollection':
			case 'NodeList':
				elements = __elements;
				break;
			default:
				if (mm.is.element(__elements)) elements = [__elements];
				else if (__elements.jquery || Array.isArray(__elements)) elements = _.filter(__elements, function (__$el) { return mm.is.element(__$el); });
		}

		if (__parents) {
			var $parents = (mm.is.element(__parents)) ? [__parents] : __parents;
			elements = _.filter(elements, function (__$el) {

				return _.some($parents, function (__$parent) { return __$parent !== __$el && __$parent.contains(__$el); });

			});
		}
	}

	return (elements.length === 0) ? [] : elements;

}
//> DOM 요소 검색

//< DOM 형제 요소 검색
mm.siblings = function (__elements, __siblings) {

	var elements = [];
	if (!__elements || typeof(__elements) === 'string') return elements;

	var $elements = (['HTMLCollection', 'NodeList'].includes(__elements.constructor.name) || Array.isArray(__elements)) ? __elements : [__elements];

	elements = _.chain($elements).map(function (__$el) {

		if (typeof(__$el) === 'string' || !__$el.parentElement) return [];
		else {
			return _.filter(__$el.parentElement.children, function (__$child) {

				if (__siblings) {
					try {
						return __$child !== __$el && __$child.matches(__siblings);
					}
					catch (__error) {
						return false;
					}
				}
				else return __$child !== __$el;

			});
		}

	}).flatten().uniq().value();

	return (elements.length === 0) ? [] : elements;

}
//> DOM 형제 요소 검색

//< 상위 요소 검색
mm.closest = function (__elements, __closest) {

	var elements = [];
	if (!__elements || typeof(__elements) === 'string' || typeof(__closest) !== 'string') return elements;

	var $elements = (['HTMLCollection', 'NodeList'].includes(__elements.constructor.name) || Array.isArray(__elements)) ? __elements : [__elements];

	elements = _.chain($elements).map(function (__$el) {

		if (typeof(__$el) === 'string' || !mm.is.element(__$el)) return [];
		else return __$el.closest(__closest);

	}).flatten().uniq().value();

	return (elements.length === 0) ? [] : elements;

}
//> 상위 요소 검색

//< 콜백함수 실행
mm.apply = function (__callback, __thisEl, __params) {

	var $this = __thisEl || window;
	var applyWindow = (__thisEl === top) ? top : ($this.window) ? $this.window : ($this.ownerDocument) ? $this.ownerDocument.defaultView : window;

	if (typeof(__callback) === 'function') {
		if (applyWindow.__callback) return applyWindow.__callback.apply($this, __params);
		else return __callback.apply($this, __params);
	}
	else if (typeof(__callback) === 'string') {
		var callback = applyWindow;
		var splits = __callback.split('.');

		_.forEach(splits, function (__value) {

			if (callback !== undefined && __value) callback = callback[__value];

		});

		if (typeof(callback) === 'function') return callback.apply($this, __params);
		else return callback;
	}
	else return __callback;

}
//> 콜백함수 실행

//< 이벤트
mm.event = (function () {

	var base = {
		events: [],
		types: [],
		off: function (__$element, __type, __callback) {

			var temp = { $el: __$element, _type: __type };
			if (typeof(__callback) === 'function') temp.callback = __callback;

			var _i = 0;
			while (_i < base.events.length) {
				var eventItem = base.events[_i];
				if (_.isMatch(eventItem, temp)) {
					if (typeof(__callback) !== 'string' || (typeof(__callback) === 'string' && __callback === eventItem.callback.name)) {
						eventItem.$el.removeEventListener(eventItem._type, eventItem.handler);
						base.events.splice(_i, 1);
					}
					else _i++;
				}
				else _i++;
			}

		},
	};

	return {
		//- 연결
		on: function (__elements, __types, __callback, __option) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 || !__types || !__callback) return;

			var option = mm.extend({
				data: {},
				_isOnce: false,
				_isCapture: false,
				_isPassive: null,
				_isOverwrite: false,
			}, __option);
			var types = __types.split(' ');

			if (option._isOverwrite === true) mm.apply(mm.event.off, this, [__elements, __types, (__callback.name && __callback.name.trim().length > 0) ? __callback.name : __callback]);

			_.forEach($elements, function (__$el) {

				_.forEach(types, function (__type) {

					function eventHandler(__e) {

						if (__e.detail === -100) return;

						mm.apply(__callback, __$el, [__e, option.data]);
						if (option._isOnce) base.off(__$el, __type, __callback);

					}

					var eventOption = (mm.is.ie() || typeof(option._isPassive) !== 'boolean') ? option._isCapture : { capture: option._isCapture, passive: option._isPassive };
					__$el.addEventListener(__type, eventHandler, eventOption);
					base.events.push({ $el: __$el, _type: __type, callback: __callback, handler: eventHandler });

				});

			});

		},
		//- 해제
		off: function (__elements, __types, __callback) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 || !__types) return;

			var types = __types.split(' ');

			_.forEach($elements, function (__$el) {

				_.forEach(types, function (__type) {

					base.off(__$el, __type, __callback);

				});

			});

		},
		//- 실행
		dispatch: function (__elements, __types, __option) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 || !__types) return;

			var option = mm.extend({
				data: {},
			}, __option);
			var types = __types.split(' ');

			_.forEach($elements, function (__$el) {

				_.forEach(types, function (__type) {

					if (__type === 'click') __$el.dispatchEvent(new MouseEvent(__type, { detail: -100 }));

					__$el.dispatchEvent(new CustomEvent(__type, { detail: option.data, bubbles: true }));

				});

			});

		},
		//- 확인
		get: function (__element) {

			if (!__element) return base.events;

			var $element = mm.find(__element)[0];
			var returns = mm.extend(_.filter(base.events, { $el: $element }));

			return (returns.length === 0) ? [] : returns;

		},
		//- 커스텀 타입
		type: {
			set: function (__type) {

				if (typeof(__type) !== 'string') return;

				base.types[__type] = mm.string.template('MM_EVENT_${TYPE}', { TYPE: __type.toUpperCase() });

				Object.defineProperty(this, __type, {
					get: function () {

						return base.types[__type];

					}
				});

				return base.types[__type];

			},
		},
	}

})();
//> 이벤트

//< 이벤트 커스텀
mm.event.type.set('frame_ready');
mm.event.type.set('main_go');
mm.event.type.set('stage_add');
mm.event.type.set('stage_remove');
//> 이벤트 커스텀

//< 이벤트 레디
mm.ready = function (__callback) {

	if (typeof(__callback) !== 'function') return;
	mm.event.on(document, 'DOMContentLoaded', __callback, { _isOnce: true });

}
//> 이벤트 레디

//< 이벤트 로드
mm.load = function (__callback, __option) {

	if (typeof(__callback) !== 'function') return;

	var option = mm.extend({
		el: window,
		_isOnce: true,
	}, __option);
	var $elements = mm.find(option.el);
	if ($elements.length === 0) return;

	_.forEach($elements, function (__$el) {

		mm.event.on(__$el, 'load', __callback, { _isOnce: option._isOnce });

	});

}
//> 이벤트 로드

//< 이벤트 위임
mm.delegate = (function () {

	var base = {
		events: [],
		off: function (__$parent, __delegator, __type, __callback) {

			var temp = { $parent: __$parent, _type: __type };
			var _eventIndex = _.findIndex(base.events, temp);
			var event = base.events[_eventIndex];

			var target = { _delegator: __delegator };
			if (typeof(__callback) === 'function') target.callback = __callback;

			var _i = 0;
			while (_i < event.targets.length) {
				var targetItem = event.targets[_i];
				if (_.isMatch(targetItem, target)) {
					if (typeof(__callback) !== 'string' || (typeof(__callback) === 'string' && __callback === targetItem.callback.name)) {
						event.targets.splice(_i, 1);
					}
					else _i++;
				}
				else _i++;
			}

			if (event.targets.length === 0) {
				event.$parent.removeEventListener(event._type, event.handler);
				base.events.splice(_eventIndex, 1);
			}

		},
	};

	return {
		//- 연결
		on: function (__parents, __delegator, __types, __callback, __option) {

			var $parents = mm.find(__parents);
			if ($parents.length === 0 || !__delegator || !__types || !__callback) return;

			var option = mm.extend({
				data: {},
				_isOnce: false,
			}, __option);
			var types = __types.split(' ');

			_.forEach($parents, function (__$parent) {

				var $parent = (__$parent.window) ? __$parent.document : __$parent;

				_.forEach(types, function (__type) {

					var temp = { $parent: $parent, _type: __type };
					var event = _.find(base.events, temp);

					if (event) {
						var target = { _delegator: __delegator, callback: __callback };
						if (!_.some(event.targets, target)) event.targets.push(target);
					}
					else {
						var eventHandler = function (__e) {

							var $element = __e.target;
							event = _.find(base.events, temp);

							while ($parent.contains($element) && $element.tagName !== 'BODY') {
								var targets = _.filter(event.targets, function (__target) { return $element.matches(__target._delegator); });

								_.forEach(targets, function (__target) {

									mm.apply(__target.callback, $element, [__e, $parent, option.data]);
									if (option._isOnce) base.off($parent, __target._delegator, __type, __target.callback);

								});

								$element = $element.parentElement;
							}

						}

						$parent.addEventListener(__type, eventHandler, false);
						base.events.push({ $parent: $parent, _type: __type, targets: [{ _delegator: __delegator, callback: __callback }], handler: eventHandler });
					}

				});

			});

		},
		//- 해제
		off: function (__parents, __delegator, __types, __callback) {

			var $parents = mm.find(__parents);
			if ($parents.length === 0 || !__delegator || !__types) return;

			var types = __types.split(' ');

			_.forEach($parents, function (__$parent) {

				_.forEach(types, function (__type) {

					base.off(__$parent, __delegator, __type, __callback);

				});

			});

		},
		//- 확인
		get: function (__parent, __delegator) {

			if (!__parent || !__delegator) return base.events;

			var $parent = mm.find(__parent)[0];
			var returns = mm.extend(_.filter(base.events, { $parent: $parent }));

			if (__delegator) {
				_.forEach(returns, function (__return) {

					__return.targets = _.filter(__return.targets, { _delegator: __delegator });

				});
			}

			return (returns.length === 0) ? [] : returns;

		},
	}

})();
//> 이벤트 위임

//< 이벤트 옵저버
mm.observer = (function () {

	var base = {
		events: [],
		off: function (__$element, __type) {

			var temp = {};
			if (__$element) temp.$el = __$element;
			if (__type) temp._type = __type;

			var _i = 0;
			while (_i < base.events.length) {
				var eventItem = base.events[_i];
				if (_.isMatch(eventItem, temp)) {
					eventItem.$el.removeEventListener(eventItem._type, eventItem.handler);
					base.events.splice(_i, 1);
				}
				else _i++;
			}

		},
	};

	return {
		//- 연결
		on: function (__elements, __type, __callback, __option) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 || !__type || !__callback) return;
			if (frameElement) {
				var params = [$elements].concat(Object.values(arguments).splice(1));
				mm.apply('mm.observer.on', top, params);
				return;
			}

			var option = mm.extend({
				data: {},
				_isOnce: false,
				_isOverwrite: false,
			}, __option);

			_.forEach($elements, function (__$el) {

				var temp = { $el: __$el, _type: __type };
				var _is = false;

				var _i = 0;
				while (_i < base.events.length) {
					var eventItem = base.events[_i];

					if (_.isMatch(eventItem, temp)) {
						if (option._isOverwrite === true) {
							eventItem.$el.removeEventListener(eventItem._type, eventItem.handler);
							base.events.splice(_i, 1);
						}
						else {
							_is = true;
							break;
						}
					}
					else _i++;
				}

				if (_is === true) return;

				function eventHandler(__e) {

					mm.apply(__callback, __$el, [__e, option.data]);
					if (option._isOnce) base.off(__$el, __type);

				}

				__$el.addEventListener(__type, eventHandler, false);
				base.events.push({ $el: __$el, _type: __type, callback: __callback, handler: eventHandler });

			});

		},
		//- 해제
		off: function (__elements, __type) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 && !__type) return;
			if (frameElement) {
				var params = [$elements].concat(Object.values(arguments).splice(1));
				mm.apply('mm.observer.off', top, params);
				return;
			}

			if ($elements.length > 0) {
				_.forEach($elements, function (__$el) {

					base.off(__$el, __type);

				});
			}
			else if (__type) base.off(null, __type);

		},
		//- 실행
		dispatch: function (__type, __option) {

			if (!__type) return;
			if (frameElement) {
				mm.apply('mm.observer.dispatch', top, [__type, mm.extend(__option || {}, { $frameWindow: window })]);
				return;
			}

			var option = mm.extend({
				_isLocal: false,
				$frameWindow: null,
				data: {},
			}, __option);
			var customEvent = new CustomEvent(__type, { detail: option.data, bubbles: false });
			var $document = (option.$frameWindow) ? option.$frameWindow.document : document;

			_.forEach(base.events, function (__event, __index) {

				if (!__event || __event._type !== __type) return;

				var _isContains = (__event.$el.window) ? $document.defaultView === __event.$el : $document.contains(__event.$el);
				if (option._isLocal === false || (option._isLocal === true && _isContains)) __event.$el.dispatchEvent(customEvent);

			});

		},
		//- 확인
		get: function (__target) {

			if (!__target) return base.events;

			var $element = mm.find(__target)[0];
			if (frameElement) {
				var params = ($element) ? $element : arguments;
				return mm.apply('mm.observer.get', top, params);
			}

			var returns = mm.extend(_.filter(base.events, ($element) ? { $el: $element } : { _type: __target }));

			return (returns.length === 0) ? [] : returns;

		},
	};

})();
//> 이벤트 옵저버

//< 인터섹션
mm.intersection = (function () {

	var base = {
		observers: [],
		targets: [],
		intersectionHandler: function (__entry, __io, __isForce) {

			var target = (__isForce === true) ? __entry : _.find(base.targets, { $el: __entry.target, io: __io });
			var entry = (__isForce === true) ? {
				target: target.$el,
				boundingClientRect: target.$el.getBoundingClientRect(),
				_isForce: true,
			} : __entry;

			if (__entry.isIntersecting || __isForce === true) {
				mm.apply(target.callback, __io, [entry, true, target.option.data]);
				if (target.option._isOnce) base.removeObserve(_.findIndex(base.targets, { $el: target.$el, callback: target.callback, io: target.io }));// 한 번만 실행
			}
			else mm.apply(target.callback, __io, [entry, false, target.option.data]);

		},
		removeObserve: function (__index) {

			var target = base.targets[__index];
			if (!target) return false;

			target.io.unobserve(target.$el);
			base.targets.splice(__index, 1);
			return true;

		},
	};

	return {
		//- 연결
		on: function (__elements, __callback, __option) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 || !__callback) return;

			var option = mm.extend({
				data: {},
				_isOnce: false,
				_isOverwrite: false,
				config: {
					root: null,
					rootMargin: '0px 0px 0px 0px',
					threshold: [0, 1],
				}
			}, __option);
			if (__option.config && !mm.is.empty(__option.config.threshold)) option.config.threshold = __option.config.threshold;

			_.forEach($elements, function (__$el) {

				var io = _.find(base.observers, function (__io) { return _.isMatch(__io, option.config); });
				var temp = { $el: __$el, callback: __callback, option: option };

				var _index = _.findIndex(base.targets, temp);
				if (_index > -1) {
					if (option._isOverwrite === true) base.removeObserve(_index);
					else return;
				}

				if (!io) {
					io = new IntersectionObserver(function (__entries, __io) {

						_.forEach(__entries, function (__entry) {

							base.intersectionHandler(__entry, __io);

						});

					}, option.config);
					base.observers.push(io);
				}

				io.observe(__$el);
				temp.io = io;
				base.targets.push(temp);

			});

		},
		//- 해제
		off: function (__elements, __callback, __io) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0) return;

			_.forEach($elements, function (__$el) {

				var temp = { $el: __$el };
				if (typeof(__callback) === 'function') temp.callback = __callback;
				if (__io) temp.io = __io;

				var _i = 0;
				while (_i < base.targets.length) {
					var targetItem = base.targets[_i];
					if (_.isMatch(targetItem, temp)) {
						if (typeof(__callback) !== 'string' || (typeof(__callback) === 'string' && __callback === targetItem.callback.name)) {
							base.removeObserve(_i);
						}
						else _i++;
					}
					else _i++;
				}

			});

		},
		//- 강제 실행
		force: function (__elements, __io) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0) return;

			_.forEach($elements, function (__$el) {

				var temp = { $el: __$el };
				if (__io) temp.io = __io;

				var targets = _.filter(base.targets, temp);
				_.forEach(targets, function (__target) {

					base.intersectionHandler(__target, __target.io, true);

				});

			});

		},
		//- 확인
		get: function (__element) {

			if (!__element) return base.targets;

			var $element = mm.find(__element)[0];
			var returns = mm.extend(_.filter(base.targets, { $el: $element }));

			return (returns.length === 0) ? [] : returns;

		},
	}

})();
//> 인터섹션

//< 포커스
mm.focus = (function () {

	return {
		//- 지정
		in: function (__element, __option) {

			var $element = mm.find(__element)[0];
			if (!$element) return;

			var option = mm.extend({
				_outline: '',
			}, __option);

			mm.element.attribute($element, { 'tabindex': '-1', 'style': { 'outline': option._outline } });
			mm.event.on($element, 'focusout', function () {

				mm.element.attribute($element, { 'tabindex': '', 'style': { 'outline': '' } });

			}, { _isOnce: true });

			$element.focus();
			mm.event.dispatch($element, 'focusin focus');

		},
		//- 해제
		out: function (__element) {

			var $element = mm.find(__element)[0];
			if (!$element) return;

			if (mm.is.focus($element)) {
				$element.blur();
				mm.event.dispatch($element, 'focusout blur');
			}

		}
	};

})();
//> 포커스

//< 스크롤
mm.scroll = (function () {

	var base = {
		_classNo: '__noscroll',
		find: function (__$element, __isClosest) {

			if (!__$element || __$element.tagName === 'HTML' || __$element.tagName === 'BODY') {
				var $scroll = mm.find('.mm_page > .mm_scroller')[0];
				return ($scroll) ? $scroll : window;
			}
			else if (__$element.classList.contains('mm_scroller')) return __$element;
			else return (__isClosest === true) ? __$element.closest('.mm_scroller') || window : mm.find('.mm_scroller', __$element)[0];

		},
		to: function (__target, __option) {

			var option = mm.extend({
				scroller: null,
				_direction: 'vertical',
				_margin: 0,
				_time: mm.time._fast,
				_isFocus: false,
				onStart: null,
				onStartParams: [],
				onComplete: null,
				onCompleteParams: [],
			}, __option);
			if (!option.scroller) option.scroller = base.find();

			mm.apply(option.onStart, option, option.onStartParams);

			var _scroll = (function (__isNumber) {

				if (__isNumber) return __target;
				else {
					var $target = mm.find(__target)[0];
					var position = mm.element.position($target);
					return (option._direction === 'vertical') ? position.top : position.left;
				}

			})(Number.isFinite(__target));

			if (mm.is.empty(_scroll)) return;
			_scroll -= option._margin;

			var tweenOption = { duration: option._time, ease: 'sine.out',
				onComplete: function () {

					if (option._isFocus === true) mm.delay.on(mm.focus.in, { _name: 'DELAY_FOCUS_SCROLL', _isOverwrite: true, params: [$target] });
					mm.apply(option.onComplete, option, option.onCompleteParams);

				},
			};
			tweenOption[(option._direction === 'vertical') ? 'scrollTop' : 'scrollLeft'] = _scroll;
			if (option.scroller === window) option.scroller = document.documentElement;

			gsap.to(option.scroller, tweenOption);

		},
		offset: function (__$element) {

			if (mm.is.element(__$element)) return (__$element.window) ? { top: __$element.pageYOffset, left: __$element.pageXOffset } : { top: __$element.scrollTop, left: __$element.scrollLeft };
			else return { top: 0, left: 0 };

		},
		toggle: function (__is) {

			var $html = document.documentElement;
			var _is = (typeof(__is) === 'boolean') ? __is : $html.classList.contains(base._classNo);

			if (_is === false || mm.class.some($html, ['__bom', '__modal'])) $html.classList.add(base._classNo);
			else if (_is === true) $html.classList.remove(base._classNo);

		},
	};

	return {
		//- 기본 스크롤
		get el() {

			return base.find();

		},
		//- 스크롤 요소 검색
		find: function (__element, __isClosest) {

			var $element = mm.find(__element)[0];
			if (__element && !$element) return null;
			else return base.find($element, __isClosest);

		},
		//- 위치/앵커 이동
		to: function (__target, __option) {

			if (arguments.length === 0) return;

			base.to(__target, __option);

		},
		//- 스크롤 위치
		offset: function (__element) {

			return base.offset(mm.find(__element)[0]);

		},
		//- 스크롤 허용
		on: function () {

			base.toggle(true);

		},
		//- 스크롤 차단
		off: function () {

			base.toggle(false);

		},
		//- 스크롤 토글
		toggle: function () {

			base.toggle();

		},
	}

})();
//> 스크롤

//< 아이프레임 리사이즈
mm.frameResize = function (__frameElements, __option) {

	var $iframes = mm.find(__frameElements);

	if ($iframes.length > 0) {
		_.forEach($iframes, function (__$iframe) {

			var $frameWindow = __$iframe.contentWindow;
			if ($frameWindow) {
				if ($frameWindow.mm) $frameWindow.mm.frameResize(null, __option);
				else {
					mm.load(function () {

						try {
							$frameWindow.mm.frameResize(null, __option);
						}
						catch (__error) {
							console.log(__error);
						}

					}, { el: __$iframe });
				}
			}

		});
	}
	else if (frameElement) {
		var option = mm.extend({
			_isLoad: false,
			_isEven: false,
			_extraHeight: null,
		}, __option);

		if (option._isLoad === false && Number.isFinite(option._extraHeight)) mm.element.attribute(frameElement, { 'data-iframe': { _extraHeight: option._extraHeight } });
		else option = mm.extend(option, mm.data.get(frameElement, 'data-iframe', true));

		var $target = (mm.scroll.el === window) ? mm.find('.mm_page')[0] : mm.scroll.el;
		var style = { 'height': '', 'width': '' };

		mm.element.style(document.body, { 'height': 0, 'min-height': 0 });

		var _frameHeight = Math.ceil($target.scrollHeight + mm.element.offset($target).top);
		if (Number.isFinite(option._extraHeight)) _frameHeight += option._extraHeight;
		if (option._isEven && mm.is.odd(_frameHeight)) _frameHeight += 1;
		style['height'] = mm.number.unit(_frameHeight + 2);

		var _frameWidth = Math.ceil(Math.min($target.scrollWidth, mm.find('.mm_page-content', $target)[0].scrollWidth));
		if (option._isEven && mm.is.odd(_frameWidth)) _frameWidth += 1;
		style['width'] = mm.number.unit(_frameWidth);

		mm.element.style(document.body, { 'height': '', 'min-height': '' });
		mm.element.style((mm._isModal) ? frameElement.parentElement : frameElement, style);
	}

}
//> 아이프레임 리사이즈

//< DOM data-속성
mm.data = (function () {


	var base = {
		get _mmKey() { return '__mm.data__'; },
	};

	return {
		//- 저장 후 결과 리턴
		set: function (__element, __dataName, __option) {

			var $element = mm.find(__element)[0];
			if (!$element || !__dataName) return null;

			var option = mm.extend({
				initial: null,
				_isOverwrite: false,
				append: null,
			}, __option);
			var mmData = $element[base._mmKey];
			if (!mmData) mmData = $element[base._mmKey] = {}
			var _ui = __dataName.replace('data-', '');

			return mmData[_ui] = (function () {

				var data = mm.extend({}, option.initial);
				if (option._isOverwrite === true && mmData[_ui]) data = mm.extend(data, mmData[_ui]);
				if (option.append) data = mm.extend(data, option.append);

				var _attr = $element.getAttribute(__dataName);
				if (_attr && _attr.charAt(0) === '{') data = mm.extend(data, JSON.parse(_attr.replace(/\'/g, '"').replace(/\t/g, ' ').replace(/\n/g, '\\n')));

				return data;

			})();

		},
		//- 가져오기
		get: function (__element, __dataName, __isDataAttr) {

			var $element = mm.find(__element)[0];
			if (!$element) return null;

			if (__isDataAttr === true) {
				var _attr = $element.getAttribute(__dataName);
				return (_attr && _attr.startsWith('{')) ? JSON.parse(_attr.replace(/\'/g, '"').replace(/\t/g, ' ').replace(/\n/g, '\\n')) : (!_attr || _attr.length === 0) ? {} : _attr;
			}
			else {
				var mmData = $element[base._mmKey];
				if (!mmData) mmData = $element[base._mmKey] = {}
				var _ui = (__dataName) ? __dataName.replace('data-', '') : null;

				return (!_ui) ? mmData : mmData[_ui];
			}

		},
		//- 삭제
		remove: function (__element, __dataName) {

			var $element = mm.find(__element)[0];
			if (!$element || !__dataName) return;

			var mmData = $element[base._mmKey];
			if (mmData) delete mmData[__dataName.replace('data-', '')];

		},
		//- 병합
		extend: function (__element, __dataName, __data) {

			var $element = mm.find(__element)[0];
			if (!$element || !__dataName) return null;

			var mmData = $element[base._mmKey];
			var _ui = __dataName.replace('data-', '');
			if (!mmData || !mmData[_ui]) return null;

			return mmData[_ui] = mm.extend(mmData[_ui], __data);

		}
	}

})();
//> DOM data-속성

//< 요소
mm.element = (function () {

	var base = {
		createNode: function (__html) {

			__html = __html.trim();

			var $template = document.createElement('template');
			$template.insertAdjacentHTML('afterbegin', __html);

			if (mm.is.ie() && /^<caption|^<colgroup|^<col|^<thead|^<tfoot|^<tbody|^<tr|^<th|^<td/i.test(__html.trim())) {
				$template.insertAdjacentHTML('afterbegin', mm.string.template('<table>${HTML}</table>', { HTML: __html }));

				if (/^<caption|^<colgroup|^<thead|^<tfoot|^<tbody/i.test(__html.trim())) $template = $template.firstElementChild;
				else if (/^<col|^<tr/i.test(__html.trim())) $template = $template.firstElementChild.firstElementChild;
				else if (/^<th|^<td/i.test(__html.trim())) $template = $template.firstElementChild.firstElementChild.firstElementChild;
			}

			return Object.values($template.childNodes);

		},
		insertNode: function (__$element, __appends, __local) {

			if (!__$element || !__appends) return;

			var appends = [];
			switch (__appends.constructor.name) {
				case 'String':
					appends = base.createNode(__appends);
					break;
				case 'HTMLCollection':
				case 'NodeList':
					appends = Object.values(__appends);
					break;
				case 'Array':
					appends = _.forEach(__appends, function (__append) {

						if (__append.nodeName) appends.push(__append);

					});
					break;
				default:
					if (__appends.nodeName) appends.push(__appends);
			}

			if (['after', 'prepend'].includes(__local)) appends.reverse();

			_.forEach(appends, function (__append) {

				switch (__local) {
					case 'after':
						__$element.parentElement.insertBefore(__append, __$element.nextSibling);
						break;
					case 'before':
						__$element.parentElement.insertBefore(__append, __$element);
						break;
					case 'append':
						__$element.append(__append);
						break;
					case 'prepend':
						__$element.prepend(__append);
						break;
				}

			});

		},
		setStyle: function (__$element, __style) {

			_.forEach(__style, function (__value, __key) {

				__$element.style[__key] = __value;

			});

		},
		toggleDisplay: function (__$element, __is) {

			var _is = (typeof(__is) === 'boolean') ? __is : !mm.is.display(__$element);
			if (_is) {
				if (mm.is.display(__$element)) return;

				base.setStyle(__$element, { 'display': (function (__value) {

					if (__value.includes('display:none')) return '';

					var _value = 'block';
					switch (__$element.tagName) {
						case 'LI':
							_value = 'list-item';
							break;
						case 'TABLE':
							_value = 'table';
							break;
						case 'CAPTION':
							_value = 'table-caption';
							break;
						case 'COLGROUP':
							_value = 'table-column-group';
							break;
						case 'COL':
							_value = 'table-column';
							break;
						case 'THEAD':
							_value = 'table-header-group';
							break;
						case 'TFOOT':
							_value = 'table-footer-group';
							break;
						case 'TBODY':
							_value = 'table-row-group';
							break;
						case 'TR':
							_value = 'table-row';
							break;
						case 'TD':
							_value = 'table-cell';
							break;
					}

					return _value;

				})(String(__$element.getAttribute('style')).replace(/ /g, '')) });
			}
			else {
				if (!mm.is.display(__$element)) return;

				base.setStyle(__$element, { 'display': 'none' });
			}

		},
		findIndex: function (__$lists, __element) {

			if (__$lists.length === 0 || !__element) return -1;

			if (mm.is.element(__element)) return __$lists.indexOf(__element);
			else if (typeof(__element) === 'string') return __$lists.indexOf(_.find(__$lists, function (__$item) { return __$item.matches(__element); }));

		},
	};

	return {
		//- 속성
		attribute: function (__elements, __attribute) {

			if (!mm.is.object(__attribute)) return;

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				_.forEach(__attribute, function (__value, __key) {

					if (mm.is.empty(__value) || __value === false) {
						__$el.removeAttribute(__key);
						return;
					}

					switch (__key) {
						case 'style':
							base.setStyle(__$el, (function () {

								if (mm.is.object(__value)) return __value;
								else if (typeof(__value) === 'string') {
									return _.chain(__value.split(';'))
									.map(function (__split) {

										return _.map(__split.split(':'), function (__bit) { return __bit.trim(); });

									}).fromPairs().value();
								}
								else return {};

							})());
							break;
						default:
							__$el.setAttribute(__key, (__value === true) ? '' : (typeof(__value) === 'object') ? JSON.stringify(__value).replace(/"/g, '\'') : __value);
					}

				});

			});

		},
		//- 프로퍼티
		property: function (__elements, __property) {

			if (!mm.is.object(__property)) return;

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				_.forEach(__property, function (__value, __key) {

					__$el[__key] = (mm.is.empty(__value)) ? false : __value;

				});

			});

		},
		//- 스타일
		style: function (__elements, __style) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0) return null;

			if (mm.is.object(__style)) {
				_.forEach($elements, function (__$el) {

					base.setStyle(__$el, __style);

				});
			}

			if ($elements.length === 1) {
				var style = getComputedStyle($elements[0]);
				return (typeof(__style) === 'string') ? style[__style] : style;
			}
			else return null;

		},
		//- 브라우저에서 보여지는 위치
		offset: function (__element) {

			var $element = mm.find(__element)[0];
			if (!mm.is.element($element)) return {};

			var rect = $element.getBoundingClientRect();

			return { top: rect.top, left: rect.left };

		},
		// 스크롤 영역에서 보여지는 위치
		client: function (__element) {

			var $element = mm.find(__element)[0];
			if (!mm.is.element($element)) return {};

			var $scroll = mm.scroll.find($element, true);
			var elementRect = $element.getBoundingClientRect();
			var scrollRect = (!$scroll || $scroll === window) ? { top: 0, left: 0 } : $scroll.getBoundingClientRect();

			return { top: elementRect.top - scrollRect.top, left: elementRect.left - scrollRect.left };

		},
		//- 스크롤 영역 내 실제 위치(scroll + offset)
		position: function (__element) {

			var $element = mm.find(__element)[0];
			if (!mm.is.element($element)) return {};

			var $scroll = mm.scroll.find($element, true);
			var elementRect = $element.getBoundingClientRect();
			var scrollRect = (!$scroll || $scroll === window) ? { top: 0, left: 0 } : $scroll.getBoundingClientRect();
			var scrollOffset = mm.scroll.offset($scroll);

			return { top: scrollOffset.top + elementRect.top - scrollRect.top, left: scrollOffset.left + elementRect.left - scrollRect.left };

		},
		//- 요소 인덱스
		index: function (__lists, __element) {

			if (typeof(__lists) !== 'object') return -1;

			var lists = (Array.isArray(__lists)) ? __lists : Object.values(__lists);
			return base.findIndex(lists, __element);

		},
		lastIndex: function (__lists, __element) {

			if (typeof(__lists) !== 'object') return -1;

			var lists = (Array.isArray(__lists)) ? __lists : Object.values(__lists);
			return base.findIndex(lists.reverse(), __element);

		},
		//- 보기/숨김
		show: function (__elements) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.toggleDisplay(__$el, true);

			});

		},
		hide: function (__elements) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.toggleDisplay(__$el, false);

			});

		},
		toggle: function (__elements) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.toggleDisplay(__$el);

			});

		},
		//- 생성
		create: function (__html) {

			if (typeof(__html) !== 'string') return null;

			return base.createNode(__html);

		},
		// 추가/이동
		after: function (__elements, __appends) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.insertNode(__$el, __appends, 'after');

			});

		},
		before: function (__elements, __appends) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.insertNode(__$el, __appends, 'before');

			});

		},
		append: function (__elements, __appends) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.insertNode(__$el, __appends, 'append');

			});

		},
		prepend: function (__elements, __appends) {

			var $elements = mm.find(__elements);

			_.forEach($elements, function (__$el) {

				base.insertNode(__$el, __appends, 'prepend');

			});

		},
		//- wrap/upwrap
		wrap: function (__elements, __wrapper, __isInner) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0 || typeof(__wrapper) !== 'string') return;

			var wrappers = [];

			_.forEach($elements, function (__$el) {

				var $wrapper = document.createElement(__wrapper);
				wrappers.push($wrapper);

				if (__isInner === true) {
					base.insertNode(__$el, $wrapper, 'prepend');
					base.insertNode($wrapper, _.drop(__$el.childNodes), 'append');
				}
				else {
					base.insertNode(__$el, $wrapper, 'before');
					base.insertNode($wrapper, __$el, 'append');
				}

			});

			return wrappers;

		},
		unwrap: function (__elements, __isParent) {

			var $elements = Object.values(mm.find(__elements));

			_.forEach($elements, function (__$el) {

				var $wrap = (__isParent === true) ? __$el.parentElement : __$el;
				base.insertNode($wrap, $wrap.childNodes, 'before');
				$wrap.remove();

			});

		},
		//- 다중 요소 삭제
		remove: function (__elements) {

			var $elements = Object.values(mm.find(__elements));

			_.forEach($elements, function (__$el) {

				__$el.remove();

			});

		},
	}

})();
//> 요소

//< 클래스
mm.class = (function () {

	var base = {
		toggle: function (__$element, __classes, __toggle) {

			_.forEach(__classes, function (__class) {

				__$element.classList[__toggle](__class);

			});

		},
	};

	return {
		// 클래스 추가
		add: function (__elements, __classes) {

			var classes = (typeof(__classes) === 'string') ? [__classes] : __classes;
			if (!Array.isArray(classes)) return;

			var $elements = Object.values(mm.find(__elements));

			_.forEach($elements, function (__$el) {

				try {
					__$el.classList.add(...classes);
				}
				catch (__error) {
					base.toggle(__$el, classes, 'add');
				}

			});

		},
		// 클래스 삭제
		remove: function (__elements, __classes) {

			var classes = (typeof(__classes) === 'string') ? [__classes] : __classes;
			if (!Array.isArray(classes)) return;

			var $elements = Object.values(mm.find(__elements));

			_.forEach($elements, function (__$el) {

				try {
					__$el.classList.remove(...classes);
				}
				catch (__error) {
					base.toggle(__$el, classes, 'remove');
				}

			});

		},
		// 클래스 토글
		toggle: function (__elements, __classes) {

			var classes = (typeof(__classes) === 'string') ? [__classes] : __classes;
			if (!Array.isArray(classes)) return;

			var $elements = Object.values(mm.find(__elements));

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, classes, 'toggle');

			});

		},
		// 클래스 전체 포함 여부
		every: function (__element, __classes) {

			var $element = mm.find(__element)[0];
			var classes = (typeof(__classes) === 'string') ? [__classes] : __classes;
			if (!$element || !Array.isArray(classes)) return;

			return _.every(classes, function (__class) {

				return $element.classList.contains(__class);

			});

		},
		// 클래스 일부 포함 여부
		some: function (__element, __classes) {

			var $element = mm.find(__element)[0];
			var classes = (typeof(__classes) === 'string') ? [__classes] : __classes;
			if (!$element || !Array.isArray(classes)) return;

			return _.some(classes, function (__class) {

				return $element.classList.contains(__class);

			});

		},
	};

})();
//> 클래스

//< 링크
mm.link = function (__url, __option) {

	if (typeof(__url) !== 'string') return false;

	if (/^\/\/|^http\:|^https\:|www\./.test(__url) && !new RegExp(location.host, 'i').test(__url)) {
		console.log('도메인이 다릅니다.\nlocation.href/window.open/target="_blank"로 연결해주세요.');
		return false;
	}

	var _urlPathname = __url.replace(location.origin, '').split('#')[0];
	var option = mm.extend({
		_type: (_urlPathname === '/') ? 'home' : 'link',
		_isReloadStage: false,
		_isLinkStage: true,
		_historyDiff: 0,
		state: {},
	}, __option);
	if (_urlPathname === '/') option._type = 'home';

	switch (option._type) {
		case 'anchor':
			mm.scroll.to(__url, option);
			break;
		case 'modal':
			mm.modal.open(__url, option);
			break;
		case 'popup':
		case 'link':
			if (location.href.split('#')[0] !== __url.split('#')[0] && option._isLinkStage) {
				mm.modal.close();

				if (option._isProduct === true && option.openEl) {
					var $prodImage = mm.find('.image_product', option.openEl)[0];
					if ($prodImage) {
						var $cloneImage = $prodImage.cloneNode();
						mm.find('.mm_popup-items', top.document)[0].append($cloneImage);

						var $cloneWrap = mm.element.wrap($cloneImage, 'div')[0];
						$cloneWrap.classList.add('m_product-clone');

						top.gsap.fromTo($cloneWrap, (function () {

							var imageOffset = mm.element.offset($prodImage);
							var frameOffset = mm.element.offset(frameElement);

							return { top: imageOffset.top + frameOffset.top, left: imageOffset.left + frameOffset.left, width: $prodImage.offsetWidth, height: $prodImage.offsetHeight };

						})(), { top: 0, left: 0, paddingTop: 45, paddingRight: '2.66666%', width: '100%', height: '100%', duration: 0.2, ease: 'cubic.inOut', onComplete: mm.popup.open, onCompleteParams: [__url, option] });
					}
					else mm.popup.open(__url, option);
				}
				else {
					if (!option.openEl) option.openEl = document;
					mm.popup.open(__url, option);
				}
			}
			else {
				if (location.href.split('#')[0] === __url.split('#')[0]) location.replace(location.href.split('#')[0]);
				else {
					mm.history.replace({}, __url, { _isTop: false });
					mm.history.push({ _isNew: false }, __url);
					location.replace(__url.split('#')[0]);
				}
			}
			break;
		case 'home':
			var state = mm.history.state;
			var session = mm.history.session;
			var _mainHash = __url.split('#')[1];
			if (_mainHash && _mainHash.length > 0) mm.storage.set('session', '_mainHash', _mainHash);

			if (!state || state._pageIndex < 1) {
				if (frameElement && frameElement.src.replace(location.origin, '') === mm._mainUrl) location.replace(location.href.split('#')[0]);
				else {
					mm.history.replace(null, mm._homeUrl);
					top.location.reload();
				}
			}
			else {
				var _backCount = state._pageIndex + session.page.changes.length + option._historyDiff;

				session.history._isReloadStage = option._isReloadStage;
				session.page.changes = [];

				mm.history.session = session;
				mm.history.back(_backCount);

				mm.observer.dispatch(mm.event.type.main_go);
			}
			break;
	}

}
//> 링크

//< 클립보드복사
mm.copy = function (__text, __message) {

	var $copy = document.createElement('textarea');
	$copy.value = __text;
	mm.element.style($copy, { 'position': 'absolute', 'z-index': '-1', 'top': '-100px', 'left': '-100%', 'pointer-events': 'none' });
	document.body.append($copy);

	$copy.select();
	document.execCommand('copy');
	$copy.remove();

	if (__message && __message.trim().length > 0) mm.bom.alert(__message);

}
//> 클립보드복사

//< (디)싱커 전환
mm.changeSyncer = function (__elements, __is, __dataName) {

	var _class = mm.string.template('__${NAME}-use', { NAME: __dataName.replace('data-', '') });
	var $elements = mm.find(__elements);

	_.forEach($elements, function (__$el) {

		var data = mm.data.get(__$el, __dataName);
		if (mm.is.empty(data)) return;

		var $display = (__$el.tagName === 'OPTION') ? __$el.closest('select') : __$el;

		var $syncers = mm.find(data.syncer);
		_.forEach($syncers, function (__$syncer) {

			if (__is && mm.is.display($display)) {
				__$syncer.classList.add(_class);
				if (data._isSyncerUpdate === true) mm.ui.update(__$syncer);
			}
			else {
				__$syncer.classList.remove(_class);
				if (data._isSyncerUpdate === true) mm.form.update(__$syncer);
			}

		});

		var $desyncers = mm.find(data.desyncer);
		_.forEach($desyncers, function (__$desyncer) {

			if (__is && mm.is.display($display)) {
				__$desyncer.classList.add(_class);
				if (data._isDesyncerUpdate === true) mm.form.update(__$desyncer);
			}
			else {
				__$desyncer.classList.remove(_class);
				if (data._isDesyncerUpdate === true) mm.ui.update(__$desyncer);
			}

		});

	});

}
//> (디)싱커 전환

//< ajax(axios)
mm.ajax = (function () {

	return {
		//- 로드 + html append
		load: function (__url, __option) {

			if (typeof(__url) !== 'string') return;

			var option = mm.extend({
				config: {
					url: __url,
					method: 'get',
					responseType: 'html',
					maxContentLength: 2000,
				},
				container: null,
				_isAppend: true,
				_isClear: true,
				_isLoading: true,
				_loadingHeight: null,
				onAppendBefore: null,
				onAppendBeforeParams: [],
				onComplete: null,
				onCompleteParams: [],
				onError: null,
				onErrorParams: [],
			}, __option);
			var $container = mm.find(option.container)[0];

			if ($container && option._isClear) $container.innerHTML = '';
			if ($container && option._isLoading) mm.loading.show($container, { _minHeight: option._loadingHeight });

			axios(option.config)
			.then(function (__response) {

				var _data = __response.data;
				var _returnValue = mm.apply(option.onAppendBefore, option, [_data].concat(option.onAppendBeforeParams));
				if (_returnValue) _data = _returnValue;

				if ($container && option._isAppend) {
					mm.element.append($container, _data);
					mm.ui.update($container);
				}

				mm.apply(option.onComplete, option, [_data].concat(option.onCompleteParams));
				mm.loading.hide($container);

			})
			.catch(function (__error) {

				console.log(mm.string.template('${URL}\n${ERROR}', { URL: __url, ERROR: __error }));
				mm.apply(option.onError, option, [__error].concat(option.onErrorParams));
				mm.loading.hide($container);

			});

		},
	};

})();
//> ajax(axios)

//< 브라우저 쿠키
mm.cookie = (function () {

	var base = {
		cookie: function (__key, __value, __day, __isMidnight) {

			var _day = parseFloat(__day);
			var date = new Date();
			if (__isMidnight === true) date.setHours(0, 0, 0, 0);
			date.setTime(date.getTime() + (_day * 24 * 60 * 60 * 1000));

			var _value = (__value === undefined) ? true : __value;
			var _expireDay = (_day) ? mm.string.template('expires=${DATE}', { DATE: date.toUTCString() }) : '';
			document.cookie = mm.string.template('${KEY}=${VALUE}; ${EXPIRE}; path=/; domain=${DOMAIN}', { KEY: __key, VALUE: encodeURIComponent(_value), EXPIRE: _expireDay, DOMAIN: location.hostname });

		},
	};

	return {
		//- 쿠키 저장
		set: function (__key, __value, __day, __isMidnight) {

			if (!__key) return;

			base.cookie(__key, __value, __day, __isMidnight);

		},
		//- 쿠키 가져오기
		get: function (__key) {

			if (!__key) return;

			var _result = null;
			var cookies = document.cookie.split(';');

			_.forEach(cookies, function (__value) {

				var cookie = __value.trim().split('=');
				if (cookie[0] === __key) {
					_result = cookie[1];
					return false;
				}

			});

			return decodeURIComponent(_result);

		},
		//- 쿠키 삭제
		remove: function (__key) {

			if (!__key) return;

			base.cookie(__key, null, -1);

		},
	};

})();
//> 브라우저 쿠키

//< 로컬 쿠키(스토리지)
mm.local = (function () {

	var base = {
		remove: function (__key) {

			mm.storage.remove('local', __key);

		},
	};

	return {
		//- 로컬 저장
		set: function (__key, __value, __day, __isMidnight) {

			if (!__key) return;

			var _day = parseFloat(__day);
			var date = new Date();
			if (__isMidnight === true) date.setHours(0, 0, 0, 0);
			date.setTime(date.getTime() + (_day * 24 * 60 * 60 * 1000));

			var _value = (__value === undefined) ? true : __value;
			var _expireDay = (_day) ? date.toUTCString() : null;
			mm.storage.set('local', __key, { value: _value, _expire: _expireDay });

		},
		//- 로컬 가져오기
		get: function (__key) {

			if (!__key) return;

			var data = mm.storage.get('local', __key);
			if (!data) return null;

			var date = new Date();

			if (data._expire && data._expire < date.toUTCString()) {
				base.remove(__key);
				return undefined;
			}
			else return data.value;

		},
		//- 로컬 삭제
		remove: function (__key) {

			if (!__key) return;

			base.remove(__key);

		},
	};

})();
//> 로컬 쿠키(스토리지)

//< 스토리지 관리
mm.storage = (function () {

	var base = {
		storage: function (__type) {

			return (__type === 'session') ? sessionStorage : (__type === 'local') ? localStorage : null;

		},
	};

	return {
		//- 스토리지 저장
		set: function (__type, __key, __value) {

			var storage = base.storage(__type);
			if (!storage || arguments.length < 3) return;

			var item = { _type: Array.isArray(__value) ? 'array' : typeof(__value), value: __value };
			storage.setItem(__key, JSON.stringify(item));

		},
		//- 스토리지 가져오기
		get: function (__type, __key) {

			var storage = base.storage(__type);
			if (!storage || arguments.length < 2) return;

			var item = JSON.parse(storage.getItem(__key));
			if (!item) return;

			return (mm.is.empty(item.value)) ? null : item.value;

		},
		//- 스토리지 삭제
		remove: function (__type, __key) {

			var storage = base.storage(__type);
			if (!storage || arguments.length < 2) return;

			storage.removeItem(__key);

		},
		//- 스토리지 전체삭제
		clear: function (__type) {

			var storage = base.storage(__type);
			if (!storage) return;

			storage.clear();

		}
	};

})();
//> 스토리지 관리

//< 히스토리
mm.history = (function () {

	var base = {
		get state() {

			return top.history.state;

		},
		set state(__value) {

			base.replace(__value);

		},
		get session() {

			var state = base.state;
			var sessionHistories = mm.storage.get('session', 'history');

			if (!sessionHistories) return {};
			if (!state || mm.is.empty(state._sessionIndex)) return { histories: sessionHistories };

			var sessionHistory = sessionHistories[state._sessionIndex];

			return {
				histories: sessionHistories,
				history: sessionHistory,
				pages: sessionHistory.pages,
				page: sessionHistory.pages[state._pageIndex],
			};

		},
		set session(__value) {

			mm.storage.set('session', 'history', __value);

		},
		replace: function (__state, __url, __option) {

			var option = mm.extend({
				_isTop: true,
				_title: '',
			}, __option);

			var $window = (frameElement && option._isTop) ? top : window;
			var state = (__state === null || __state === 'null') ? null : mm.extend($window.history.state || {}, __state);
			var _url = __url || $window.location.href;

			$window.history.replaceState(state, option._title, _url);

		},
		push: function (__state, __url, __option) {

			var option = mm.extend({
				_isTop: true,
				_title: '',
			}, __option);

			var $window = (frameElement && option._isTop) ? top : window;
			var state = (__state === null || __state === 'null') ? null : mm.extend(__state || {}, { _sessionIndex: ($window.history.state) ? $window.history.state._sessionIndex : null });
			var session = base.session;

			session.pages.splice(session.history._stageIndex + 1);
			var sessionPage = {};

			state._pageIndex = session.history._stageIndex += 1;
			if (state._isNew) {
				state._keepIndex = 0;
				sessionPage.changes = [];
			}
			else {
				state._keepIndex = $window.history.state._keepIndex + 1;
				sessionPage.changes = _.last(session.pages).changes;
				sessionPage._pageType = 'keep';
			}
			$window.history.pushState(state, option._title, __url);

			sessionPage._pageUrl = $window.location.href.replace(location.origin, '');
			session.pages[state._pageIndex] = sessionPage;
			base.session = session.histories;

			mm.storage.set('session', 'stateBackup', state);

		},
		go: function (__index, __callback, __params) {

			top.history.go(__index);

			if (__callback) mm.apply(__callback, window, __params);

		},
	};

	return {
		//- 히스토리 state
		get state() {

			return base.state;

		},
		set state(__value) {

			base.state = __value;

		},
		//- 히스토리가 저장된 세션 검색
		get session() {

			return base.session;

		},
		set session(__value) {

			base.session = (__value.hasOwnProperty('histories')) ? __value.histories : __value;

		},
		//- 뒤로 가기
		back: function (__step, __callback, __params) {

			if (__step === 0) return;

			var state = base.state;
			if (state && ((state._pageIndex === 0 && location.pathname != mm._mainUrl) || (state._pageIndex > 0 && top.mm.find('.mm_popup-item').length === 0))) mm.link('/', { _isReloadStage: true });
			else base.go(-parseFloat(__step) || -1, __callback, __params);

		},
		//- 앞으로 가기
		forward: function (__step, __callback, __params) {

			if (__step === 0) return;

			base.go(parseFloat(__step) || 1, __callback, __params);

		},
		//- 히스토리 변경
		replace: function (__state, __url, __option) {

			if (!__state && !__url) return;

			base.replace(__state, __url, __option);

		},
		//- 히스토리 추가
		push: function (__state, __url, __option) {

			if (!__url) return;

			base.push(__state, __url, __option);

		},
	};

})();
//> 히스토리

//< 로딩
mm.loading = (function () {

	var base = {
		hide: function (__$element, __delay) {

			var $loadings = mm.find('.mm_loading', __$element);
			if ($loadings.length === 0) return;

			_.forEach($loadings, function (__$loading) {

				gsap.to(__$loading, {
					alpha: 0,
					duration: mm.time._fast,
					delay: (Number.isFinite(__delay) && __delay > 0) ? __delay : 0,
					ease: 'cubic.in',
					onComplete: function () {

						__$loading.remove();
						if (mm.find('.mm_loading', __$element).length === 0) mm.element.style(__$element, { 'position': '', 'min-height': '' });

					},
				});

			});

		},
	};

	return {
		//- 보기
		show: function (__element, __option) {

			var $element = mm.find(__element || '.mm_app')[0];
			if (!$element) return;

			var option = mm.extend({
				_minHeight: 0,
				_top: 0,
				_text: null,
				_size: null,
				_background: '',
			}, __option);
			var _isApp = ($element.tagName === 'HTML' || $element.tagName === 'BODY' || $element.classList.contains('mm_app')) ? true : false;

			base.hide($element);

			var $loading = mm.element.create(mm.string.template([
				'<div class="mm_loading">',
				'	<div class="mm_loading-inner">',
				'		<i class="mco_loading __mco-spin"></i>',
				'		<p class="mm_ir-blind">Loading...</p>',
				'	</div>',
				'</div>',
			]))[0];
			$element.append($loading);

			var elementStyle = mm.element.style($element);
			mm.element.style($element, {
				'position': (!['absolute', 'relative'].includes(elementStyle['position'])) ? 'relative' : '',
				'min-height': (option._minHeight) ? mm.number.unit(option._minHeight) : '',
			});

			mm.element.style($loading, {
				'position': (!_isApp) ? 'absolute' : '',
				'top': (option._top) ? mm.number.unit(option._top) : '',
				'background-color': option._background,
			});

			if (Number.isFinite(option._size)) mm.element.style(mm.find('.mco_loading', $loading)[0], { 'font-size': mm.number.unit(option._size) });
			if (typeof(option._text) === 'string') {
				var $text = mm.find('.mm_ir-blind', $loading)[0];
				$text.classList.remove('mm_ir-blind');
				$text.innerHTML = option._text;
			}

			return $loading;

		},
		//- 숨김/삭제
		hide: function (__elements, __delay) {

			var $elements = mm.find(__elements || '.mm_app');
			if ($elements.length === 0) return;

			_.forEach($elements, function (__$element) {

				base.hide(__$element, __delay);

			});

		},
	};

})();
//> 로딩

//< 소셜태그
mm.socialtag = (function () {

	var base = {
		get _selector() { return 'meta[property^=og]'; },
		append: function (__html) {

			var $metas = mm.find(base._selector, document.head);
			if ($metas.length === 0) $metas = mm.find('meta', document.head);

			if ($metas.length === 0) mm.element.append(document.head, __html);
			else mm.element.after(_.last($metas), __html);

		},
	};

	return {
		//- 가져오기
		get: function (__parents) {

			var $parents = mm.find(__parents);
			$parents = ($parents.length === 0) ? mm.find(base._selector, document.head) : mm.find(base._selector, $parents);

			return _.map($parents, function (__$parent) {

				return __$parent.outerHTML;

			}).join('\n');

		},
		//- 추가
		set: function (__html) {

			if (!__html) return;

			base.append(__html);

		},
		//- 변경
		change: function (__html) {

			if (!__html) return;

			var $meta = mm.find(base._selector);

			base.append(__html);
			mm.element.remove($meta);

		},
	};

})();
//> 소셜태그

//< 이미지
mm.image = (function () {

	return {
		//- 투명 1px gif
		get _empty() {

			return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

		},
		//- 없음 이미지
		none: function (__elements, __option) {

			var $elements = mm.find(__elements);
			if ($elements.length === 0) return;

			var option = mm.extend({
				_classNone: 'mco_image',
			}, __option);
			var _noneHtml = mm.string.template('<i class="mco_none ${NONE}"></i>', { NONE: option._classNone });

			_.forEach($elements, function (__$el) {

				var $parent = __$el.parentElement;

				if (__$el.tagName === 'I') __$el.classList.add('mco_none', option._classNone);
				else if (__$el.tagName === 'IMG') {
					mm.element.after(__$el, _noneHtml);
					mm.element.attribute(__$el.parentElement, { 'data-ir': __$el.getAttribute('alt') });
					__$el.remove();
				}
				else {
					mm.element.append(__$el, _noneHtml);
					$parent = __$el;
				}

				$parent.classList.add('mm_image-none');

			});

		},
	};

})();
//> 이미지

//< 요소(이미지, 아이프레임) 로드
mm.loadElement = function (__element, __dataName) {

	var $element = mm.find(__element)[0];
	var _dataName = (typeof(__dataName) === 'string') ? __dataName : 'data-preload';
	var data = mm.data.get($element, _dataName);
	if (!$element || !data) return;

	var _isIframe = $element.tagName === 'IFRAME';
	var _isImage = $element.tagName === 'IMG';
	var $event = $element;
	var mui = mm[_dataName.replace('data-', '')];

	if (_isIframe) {
		if (!$element.getAttribute('scrolling')) $element.setAttribute('scrolling', 'no');
	}
	else if (!_isImage) {
		$event = document.createElement('img');
		mm.element.attribute($event, { [_dataName]: data });
	}

	$element.classList.add(mui._classLoading);
	mm.apply(data.onBefore, $element, data.onBeforeParams);

	mm.event.on($event, 'load error', function (__e) {

		mm.event.off($event, 'load error');

		switch (__e.type) {
			case 'load':
				mm.class.remove($element, [mui._classLoading, mui._classError]);
				$element.classList.add(mui._classLoaded);

				if (_isIframe) {
					if (mm.is.ie() && $element.getAttribute('scrolling') === 'no') $element.contentDocument.body.scroll = 'no';
				}
				else {
					if (data._isRatio === true) {
						var _ratio = $event.naturalWidth / $event.naturalHeight;
						var _classRatio = '__image-square';
						if (_ratio > 1) _classRatio = (_ratio > 8) ? '__image-landscape-4x' : (_ratio > 4) ? '__image-landscape-3x' : (_ratio > 2) ? '__image-landscape-2x' : '__image-landscape';
						else if (_ratio < 1) _classRatio = (_ratio < 0.25) ? '__image-portrait-3x' : (_ratio < 0.5) ? '__image-portrait-2x' : '__image-portrait';

						$element.classList.add(_classRatio);
					}

					if (!_isImage) {
						mm.element.style($element, { 'background-image': mm.string.template('url("${SRC}")', { SRC: $event.getAttribute('src') }) });
						$event.remove();
					}
				}

				if ($element.closest('.mm_modal')) mm.modal.resize();

				mm.apply(data.onComplete, $element, data.onCompleteParams);
				break;
			case 'error':
				mm.class.remove($element, [mui._classLoading, mui._classLoaded]);

				if (data._src2) {
					data._src = data._src2;
					data._src2 = null;
					if ($element !== $event) $event.remove();

					mm.loadElement($element, _dataName);
				}
				else {
					$element.classList.add(mui._classError);
					console.log('error src : ' + $event.getAttribute('src'));

					if (data._isErrorImage === true) mm.image.none($element);

					mm.apply(data.onError, $element, data.onErrorParams);
				}
				break;
		}

	});

	var _loadSrc = data._src.trim();
	if (_loadSrc.length === 0 || _loadSrc === 'null') mm.event.dispatch($event, 'error');
	else $event.setAttribute('src', _loadSrc);

};
//> 요소(이미지, 아이프레임) 로드

//< 프리로드
mm.preload = (function () {

	var initial = {
		_src: null,
		_src2: null,
		_isErrorImage: true,
		_isRatio: false,
		_isPass: false,
		onBefore: null,
		onBeforeParams: [],
		onComplete: null,
		onCompleteParams: [],
		onError: null,
		onErrorParams: [],
	};

	var base = {
		get _dataName() { return 'data-preload'; },
		get _classLoading() { return '__preload-loading'; },
		get _classLoaded() { return '__preload-loaded'; },
		get _classError() { return '__preload-error'; },
	};

	return {
		_classLoading: base._classLoading,
		_classLoaded: base._classLoaded,
		_classError: base._classError,
		//- 프리로드 연결
		update: function (__elements, __option) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				if (mm.class.some(__$el, [base._classLoading, base._classLoaded, base._classError])) return;

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });
				if (mm.is.object(__option)) data = mm.data.extend(__$el, base._dataName, __option);
				if (data._isPass === true) return;

				mm.loadElement(__$el, base._dataName);

			});

		},
		//- 프리로드 강제연결
		force: function (__elements, __option) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				if (mm.class.some(__$el, [base._classLoading, base._classLoaded, base._classError])) return;

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });
				if (mm.is.object(__option)) data = mm.data.extend(__$el, base._dataName, __option);

				mm.loadElement(__$el, base._dataName);

			});

		},
		//- 프리로드 해제
		destroy: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				if (__$el.classList.contains(base._classLoaded) || __$el.classList.contains(base._classError)) return;

				__$el.removeAttribute('src');
				__$el.classList.remove(base._classLoading);

			});

		},
	};

})();
//> 프리로드

//< 레이지로드
mm.lazyload = (function () {

	var initial = {
		_src: null,
		_src2: null,
		_isErrorImage: true,
		_isRatio: false,
		_isPass: false,
		_rootMargin: '50% 0px',
		onBefore: null,
		onBeforeParams: [],
		onComplete: null,
		onCompleteParams: [],
		onError: null,
		onErrorParams: [],
	};

	var base = {
		get _dataName() { return 'data-lazyload'; },
		get _classLoading() { return '__lazyload-loading'; },
		get _classLoaded() { return '__lazyload-loaded'; },
		get _classError() { return '__lazyload-error'; },
		load: function (__entry, __is) {

			if (__is !== true) return;
			if (mm.class.some(__entry.target, [base._classLoading, base._classLoaded, base._classError])) return;

			if (__is) mm.loadElement(__entry.target, base._dataName);

		},
	};

	return {
		_classLoading: base._classLoading,
		_classLoaded: base._classLoaded,
		_classError: base._classError,
		//- 레이지로드 연결
		update: function (__elements, __option) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				if (mm.class.some(__$el, [base._classLoading, base._classLoaded, base._classError])) return;

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });
				if (mm.is.object(__option)) data = mm.data.extend(__$el, base._dataName, __option);
				if (data._isPass === true) return;

				mm.intersection.on(__$el, base.load, {
					data: data,
					_isOnce: true,
					config: {
						rootMargin: data._rootMargin,
					}
				});

			});

		},
		//- 레이지로드 해제
		destroy: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				if (__$el.classList.contains(base._classLoaded) || __$el.classList.contains(base._classError)) return;

				__$el.removeAttribute('src');
				__$el.classList.remove(base._classLoading);

				mm.intersection.off(__$el, base.load);

			});

		},
	};

})();
//> 레이지로드

//< 스위치(토글)
mm.switch = (function () {

	var initial = {
		_classOn: '__switch-on',
		_title: '선택됨',
		_defaultTitle: null,
		syncer: null,
		_isSyncerUpdate: true,
		desyncer: null,
		_isDesyncerUpdate: true,
		_isParent: false,
		_isParentUpdate: false,
		_parentSelector: null,
		_isReturnParams: true,
		onChange: null,
		onChangeParams: [],
	};

	var base = {
		get _dataName() { return 'data-switch'; },
		toggle: function (__$switch, __is) {

			if (!__$switch) return;

			var data = mm.data.get(__$switch, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$switch, base._dataName, { initial: initial });

			var $switch = (data._isParent !== true) ? __$switch : (typeof(data._parentSelector) === 'string') ? __$switch.closest(data._parentSelector) : __$switch.parentElement;
			var _is = (typeof(__is) === 'boolean') ? __is : !$switch.classList.contains(data._classOn);

			if (_is) {
				$switch.classList.add(data._classOn);
				__$switch.setAttribute('title', data._title);

				if (data._isParent && data._isParentUpdate) mm.ui.update(__$switch.parentElement);
			}
			else {
				$switch.classList.remove(data._classOn);
				if (data._defaultTitle) __$switch.setAttribute('title', data._defaultTitle);
				else __$switch.removeAttribute('title');
			}

			mm.changeSyncer($switch, _is, base._dataName);

			var params = (data._isReturnParams) ? [_is].concat(data.onChangeParams) : data.onChangeParams;
			mm.apply(data.onChange, __$switch, params);

			if (mm._isFrame && !mm._isMain) mm.frameResize();

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'click', function (__e) {

			__e.preventDefault();

			base.toggle(this);

		});

	})();

	return {
		//- 스위치 활성
		on: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, true);

			});

		},
		//- 스위치 비활성
		off: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, false);

			});

		},
		//- 스위치 토글
		toggle: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el);

			});

		},
	};

})();
//> 스위치(토글)

//< 토스트(토글, 드래그)
mm.toast = (function () {

	var initial = {
		_classOn: '__toast-on',
		_title: '접어놓기',
		_defaultTitle: '펼쳐보기',
		_isReturnParams: true,
		onChange: null,
		onChangeParams: [],
		__: {
			_updateValue: null,
		},
	};

	var base = {
		get _dataName() { return 'data-toast'; },
		toggle: function (__$toast, __is) {

			if (!__$toast) return;

			var data = mm.data.get(__$toast, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$toast, base._dataName, { initial: initial });

			var $btnToast = mm.find('.btn_toast', __$toast)[0];
			var _is = (typeof(__is) === 'boolean') ? __is : !__$toast.classList.contains(data._classOn);
			if (_is) {
				__$toast.classList.add(data._classOn);
				mm.element.attribute($btnToast, { 'title': data._title });
			}
			else {
				__$toast.classList.remove(data._classOn);
				mm.element.attribute($btnToast, { 'title': data._defaultTitle });
			}

			var params = (data._isReturnParams) ? [_is].concat(data.onChangeParams) : data.onChangeParams;
			mm.apply(data.onChange, __$toast, params);

		},
		gsapUpdate: function (__$element, __isUp) {

			var data = mm.data.get(__$element, base._dataName);
			var _value = data.__._updateValue * 100;

			mm.element.style(__$element, { 'transform': mm.string.template('translateY(${VALUE}%)', { VALUE: Math.max(0, Math.min(100, _value)) }) });

		},
	};

	(function () {

		mm.delegate.on(document, mm.string.template('[${NAME}] .btn_toast', { NAME: base._dataName }), 'touchstart', function (__e) {

			var $toast = this.closest(mm.selector(base._dataName, '[]'));
			var data = mm.data.get($toast, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($toast, base._dataName, { initial: initial });

			if (gsap.isTweening(data.__)) return;

			mm.time.stamp('toast');

			var startTouch = __e.touches[0];
			var beforeTouch = startTouch;
			var _startValue = ($toast.classList.contains(data._classOn)) ? 0 : 1;
			var _isUp = null;

			mm.event.on($toast, 'touchmove touchend', function timedealTouchInlineHandler(__e) {

				__e.preventDefault();

				var touch = (__e.type === 'touchend') ? __e.changedTouches[0] : __e.touches[0];
				mm.element.style($toast, { 'transition': 'none' });

				var _progress = (startTouch.screenY - touch.screenY) / $toast.offsetHeight;
				data.__._updateValue = _startValue - _progress;

				_isUp = (touch.screenY < beforeTouch.screenY) ? true : (touch.screenY > beforeTouch.screenY) ? false : _isUp;

				if (__e.type === 'touchmove') {
					base.gsapUpdate($toast, _isUp);
					beforeTouch = touch;
				}
				else {
					var _touchTime = mm.time.stampEnd('toast') / 1000;
					if (_touchTime > 0.2) {
						gsap.to(data.__, {
							_updateValue: (_isUp) ? 0 : 1,
							duration: 0.2,
							ease: 'cubic.out',
							onUpdate: function() {

								base.gsapUpdate($toast, _isUp);

							},
							onComplete: function () {

								if (_isUp) base.toggle($toast, true);
								else base.toggle($toast, false);
								mm.element.style($toast, { 'transform': '', 'transition': '' });

							},
						});
					}
					else {
						mm.element.style($toast, { 'transform': '', 'transition': '' });
						base.toggle($toast);
					}

					mm.event.off($toast, 'touchmove touchend', timedealTouchInlineHandler);
				}

			});

		});

	})();

	return {
		//- 토스트 활성
		on: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, true);

			});

		},
		//- 토스트 비활성
		off: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, false);

			});

		},
		//- 토스트 토글
		toggle: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el);

			});

		},
	};

})();
//> 토스트(토글, 드래그)

//< 드롭다운(아코디언)
mm.dropdown = (function () {

	var initial = {
		_classOn: '__dropdown-on',
		_time: 0,
		_group: null,
		_isGroupToggle: true,
		_isReturnParams: true,
		onChange: null,
		onChangeParams: [],
		__: {
			_is: null,
		},
	};

	var base = {
		get _dataName() { return 'data-dropdown'; },
		find: function (__elements, __$ui) {

			var $elements = mm.find(__elements, __$ui);
			return _.find($elements, function (__$el) { return __$el.closest(mm.selector(base._dataName, '[]')) === __$ui; });

		},
		toggle: function (__$ui, __is, __time) {

			if (!__$ui) return;

			var data = mm.data.get(__$ui, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$ui, base._dataName, { initial: initial });

			if (typeof(__is) === 'boolean' && data.__._is === __is) return;

			var $btn = base.find('.btn_dropdown', __$ui);
			var $item = base.find('.mm_dropdown-item', __$ui);
			var _isTable = $item.tagName === 'TBODY' || $item.tagName === 'TR';
			var _is = (typeof(__is) === 'boolean') ? __is : !__$ui.classList.contains(data._classOn);
			var _time = (Number.isFinite(__time)) ? __time : (__time === 'auto' || data._time === 'auto') ? mm.time._fast : 0;

			data.__._is = __is;

			if (_isTable) _time = 0;

			if (_is) {
				__$ui.classList.add(data._classOn);
				$btn.setAttribute('title', '접어놓기');

				if (_isTable) mm.element.show($item);
				else {
					if (_time > 0) gsap.to($item, { height: mm.find('> .mm_dropdown-item-inner', $item)[0].offsetHeight, duration: _time, ease: 'cubic.out' });
					else mm.element.style($item, { 'height': 'auto' });
				}

				var $groups = mm.find(mm.string.template('[${KEY}*="\'_group\'"][${KEY}*="${GROUP}"]', { KEY: base._dataName, GROUP: data._group }));
				$groups = _.reject($groups, function (__$group) { return __$group === __$ui; });

				_.forEach($groups, function (__$group) {

					base.toggle(__$group, false, _time);

				});

				mm.ui.update($item);
			}
			else {
				__$ui.classList.remove(data._classOn);
				$btn.setAttribute('title', '펼쳐보기');

				if (_isTable) mm.element.hide($item);
				else {
					if (_time > 0) gsap.to($item, { height: 0, duration: _time, ease: 'cubic.out' });
					else mm.element.style($item, { 'height': '' });
				}
			}

			var params = (data._isReturnParams) ? [_is].concat(data.onChangeParams) : data.onChangeParams;
			mm.apply(data.onChange, __$ui, params);

			if (__$ui.closest('.mm_modal')) mm.modal.resize();
			else if (mm._isFrame && !mm._isMain) mm.frameResize();

		},
	};

	(function () {

		mm.delegate.on(document, mm.string.template('[${UI}] .btn_dropdown', { UI: base._dataName }), 'click', function (__e) {

			__e.preventDefault();

			var $dropdown = this.closest(mm.selector(base._dataName, '[]'));
			var data = mm.data.get($dropdown, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($dropdown, base._dataName, { initial: initial });

			if (!data._group || data._isGroupToggle === true) base.toggle($dropdown);
			else if (!$dropdown.classList.contains(data._classOn)) base.toggle($dropdown, true);

		});

	})();

	return {
		//- 드롭다운 연결
		update: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });

				base.toggle(__$el, __$el.classList.contains(data._classOn), 0);

			});

		},
		//- 드롭다운 열기
		open: function (__elements, __time) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, true, __time);

			});

		},
		//- 드롭다운 닫기
		close: function (__elements, __time) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, false, __time);

			});

		},
		//- 드롭다운 토글
		toggle: function (__elements, __time) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.toggle(__$el, null, __time);

			});

		},
	};

})();
//> 드롭다운(아코디언)

//< 탭
mm.tab = (function () {

	var initial = {
		_classOn: '__tab-on',
		_classBtn: 'btn_tab',
		_title: '선택됨',
		_isToggle: false,
		onChange: null,
		onChangeParams: [],
	};

	var base = {
		get _dataName() { return 'data-tab'; },
		find: function (__elements, __$ui) {

			var $elements = mm.find(__elements, __$ui);

			return _.filter($elements, function (__$el) { return __$el.closest(mm.selector(base._dataName, '[]')) === __$ui; });

		},
		change: function (__$ui, __target) {

			var data = mm.data.get(__$ui, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$ui, base._dataName, { initial: initial });

			var $btns = base.find(mm.selector(data._classBtn, '.'), __$ui);
			var $items = base.find('.mm_tab-item', __$ui);
			var _isTarget = !mm.is.empty(__target);

			var _index;
			if (!_isTarget) _index = base.index(__$ui);
			else {
				if (Number.isFinite(__target)) _index = (__target < 0) ? 0 : __target;
				else if (mm.is.element(__target, true)) {
					if (__target.classList.contains(data._classBtn)) _index = mm.element.index($btns, __target);
					else if (__target.classList.contains('mm_tab-item')) _index = mm.element.index($items, __target);
				}
			}
			if (!Number.isFinite(_index)) return;

			if (_isTarget && _index === mm.element.index($btns, mm.selector(data._classOn, '.'))) {
				if (data._isToggle === true) _index = -1;
				else return;
			}

			_.forEach($btns, function (__$btn, __i) {

				if (__i === _index) {
					__$btn.setAttribute('title', data._title);
					__$btn.classList.add(data._classOn);
					$items[__i].classList.add(data._classOn);
				}
				else {
					__$btn.removeAttribute('title');
					__$btn.classList.remove(data._classOn);
					$items[__i].classList.remove(data._classOn);
				}

			});

			if (_index > -1) mm.ui.update($items[_index]);
			if (mm._isFrame && !mm._isMain) mm.frameResize();

			mm.apply(data.onChange, __$ui, [{ _index: _index, $buttons: $btns, $items: $items }].concat(data.onChangeParams));

		},
		index: function (__$ui) {

			var data = mm.data.get(__$ui, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$ui, base._dataName, { initial: initial });

			var $btns = base.find(mm.selector(data._classBtn, '.'), __$ui);
			var _index = mm.element.index($btns, mm.selector(data._classOn, '.'));

			return (_index < 0 && !data._isToggle) ? 0 : _index;

		},
	};

	(function () {

		mm.delegate.on(document, mm.string.template('[${UI}] a, [${UI}] button', { UI: base._dataName }), 'click', function (__e) {

			var $ui = this.closest(mm.selector(base._dataName, '[]'));
			var data = mm.data.get($ui, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($ui, base._dataName, { initial: initial });

			if (this.classList.contains(data._classBtn)) {
				__e.preventDefault();

				base.change($ui, this);
			}

		});

	})();

	return {
		//- 탭 연결
		update: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				base.change(__$el);

			});

		},
		//- 탭 변경
		change: function (__elements, __target) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.change(__$el, __target);

			});

		},
		//- 탭 인덱스
		index: function (__element) {

			var $element = mm.ui.element(base._dataName, __element)[0];
			if (!$element) return -1;

			return base.index($element);

		},
	};

})();
//> 탭

//< 캐러셀(영역 전체 이동)
mm.carousel = (function () {

	var initial = {
		_index: 0,
		_effect: 'slide',
		_direction: 'horizontal',
		_autoDelay: 0,
		_speed: 0.2,
		_sensitiveTime: 0.2,
		_isAutoHeight: false,
		_isPreload: true,
		_isErrorRemove: false,
		_isMoreSide: false,
		_classOn: '__carousel-on',
		_classClone: '__carousel-clone',
		pagination: {
			_isInner: true,
			_el: '.btn_carousel-page',
		},
		control: {
			_isInner: true,
			_prev: '.btn_carousel-prev',
			_next: '.btn_carousel-next',
		},
		count: {
			_isInner: true,
			_pad: '0',
			_el: '.mm_carousel-count',
		},
		onReady: null,
		onReadyParams: [],
		onUpdate: null,
		onUpdateParams: [],
		onStart: null,
		onStartParams: [],
		onComplete: null,
		onCompleteParams: [],
		__: {
			_oldIndex: null,
			_updateValue: null,
			_isDirection: null,
			interval: null,
			$items: [],
			$pages: [],
			$count: null,
		},
	};

	var base = {
		get _dataName() { return 'data-carousel'; },
		update: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			if (data.__.$items.length > 0) return;

			var $inner = mm.find('.mm_carousel-inner', __$element)[0];
			var $items = data.__.$items = mm.find('.mm_carousel-item', $inner);
			if ($items.length === 0) return;

			var $btnPages = (data.pagination._isInner) ? mm.find(data.pagination._el, __$element) : mm.find(data.pagination._el);
			var $btnPrev = (data.control._isInner) ? mm.find(data.control._prev, __$element)[0] : mm.find(data.control._prev)[0];
			var $btnNext = (data.control._isInner) ? mm.find(data.control._next, __$element)[0] : mm.find(data.control._next)[0];
			var $count = (data.count._isInner) ? mm.find(data.count._el, __$element)[0] : mm.find(data.count._el)[0];

			if ($btnPages.length > 0) data.__.$pages = $btnPages;
			if ($count) data.__.$count = $count;

			__$element.classList.add('__carousel-ready');

			if ($items.length === 1) {
				$items[0].classList.add(data._classOn);
				mm.element.remove([$btnPrev, $btnNext, $count]);
				mm.element.remove($btnPages);
				base.set(__$element);

				mm.apply(data.onReady, __$element, data.onReadyParams);
				return;
			}

			data.__._oldIndex = data._index;

			_.forEach($items, function (__$item, __index) {

				if (__index === data._index) {
					__$item.classList.add(data._classOn);
					if ($btnPages.length > 0) $btnPages[__index].classList.add(data._classOn);
				}

			});

			if ($items.length === 2 || (data._effect === 'slide' && $items.length === 3)) {
				_.forEach($items, function (__$item) {

					if (__$item.parentElement.classList.contains('mm_carousel-group')) return false;

					var $clone = __$item.cloneNode(true);
					$clone.classList.remove(data._classOn);
					$clone.classList.add(data._classClone);
					mm.element.attribute($clone, { 'tabindex': '-1' });
					__$item.parentElement.append($clone);

					mm.preload.destroy($clone);
					mm.preload.update($clone);
					mm.lazyload.destroy($clone);
					mm.lazyload.update($clone);

				});
			}

			mm.event.on($inner, 'touchstart', function carouselTouchStartInlineHandler(__e) {

				if (gsap.isTweening(data.__)) return;

				clearInterval(data.__.interval);
				mm.time.stamp('carousel');

				var startTouch = (__e.detail && __e.detail.touches) ? __e.detail.touches[0] : __e.touches[0];
				var _touchCount = 0;
				data.__._isDirection = null;

				mm.event.on($inner, 'touchmove touchend', function carouselTouchInlineHandler(__e) {

					var touch = (__e.detail && __e.detail.touches) ? __e.detail.touches[0] : (__e.type === 'touchend') ? __e.changedTouches[0] : __e.touches[0];

					if (data.__._isDirection === null) {
						var _moveX = Math.abs(touch.screenX - startTouch.screenX);
						var _moveY = Math.abs(touch.screenY - startTouch.screenY);
						var _limit = 1.5;

						if (data._direction === 'horizontal' && _moveX / _moveY > _limit) data.__._isDirection = true;
						else if (data._direction === 'vertical' && _moveY / _moveX > _limit) data.__._isDirection = true;
						else {
							mm.event.off($inner, 'touchmove touchend', carouselTouchInlineHandler);
							base.interval(__$element);
						}

						return;
					}
					else if (data.__._isDirection === true) {
						__e.preventDefault();

						data.__._updateValue = (data._direction === 'horizontal') ? (startTouch.screenX - touch.screenX) / $inner.offsetWidth : (startTouch.screenY - touch.screenY) / $inner.offsetHeight;

						var _index = (data.__._updateValue > 0) ? data._index + 1 : data._index - 1;
						var _direction = (_index > data._index) ? 'next' : 'prev';
						_index = (_index < 0) ? data.__.$items.length - 1 : (_index > data.__.$items.length - 1) ? 0 : _index;

						if (__e.type === 'touchmove') base.gsapUpdate(__$element, _index, data._index, _direction);
						else {
							var _touchTime = mm.time.stampEnd('carousel') / 1000;
							var _threshold = (_touchCount > 1 && _touchTime < data._sensitiveTime) ? 0.005 : 0.5;

							base.gsapTo(__$element, _index, _direction, 'cubic.out', Math.abs(data.__._updateValue) < _threshold);
						}

						_touchCount++;
					}

					if (__e.type === 'touchend') {
						mm.event.off($inner, 'touchmove touchend', carouselTouchInlineHandler);
						base.interval(__$element);
					}

				});

			});

			if ($btnPrev) {
				mm.event.on($btnPrev, 'click', function carouselPrevInlineHandler(__e) {

					var _index = data._index - 1;
					if (_index < 0) _index = data.__.$items.length - 1;
					base.change(__$element, _index, 'prev');
					base.interval(__$element);

				}, { _isOverwrite: true });
			}
			if ($btnNext) {
				mm.event.on($btnNext, 'click', function carouselNextInlineHandler(__e) {

					var _index = data._index + 1;
					if (_index > data.__.$items.length - 1) _index = 0;
					base.change(__$element, _index, 'next');
					base.interval(__$element);

				}, { _isOverwrite: true });
			}

			if ($btnPages.length > 0) {
				mm.event.on($btnPages, 'click', function carouselPageInlineHandler(__e) {

					var _index = mm.element.index($btnPages, this);
					if (_index !== base._index) {
						base.change(__$element, _index);
						base.interval(__$element);
					}

				}, { _isOverwrite: true });
			}

			base.reposition(__$element);
			base.set(__$element);
			base.interval(__$element);

			mm.apply(data.onReady, __$element, data.onReadyParams);

		},
		gsapTo: function (__$element, __index, __direction, __ease, __isBack) {

			var data = mm.data.get(__$element, base._dataName);

			gsap.to(data.__, {
				_updateValue: (__isBack === true) ? 0 : (__direction === 'next') ? 1 : -1,
				duration: data._speed,
				ease: __ease,
				onUpdate: function () {

					if (__isBack === true) base.gsapUpdate(__$element, __index, data._index, __direction, __isBack);
					else base.gsapUpdate(__$element, data._index, data.__._oldIndex, __direction, __isBack);

				},
				onStart: function () {

					if (!__isBack) {
						data.__._oldIndex = data._index;
						data._index = __index;

						mm.element.hide(_.reject(data.__.$items, function (__$item, __index) { return __index === data.__._oldIndex || __index === data._index; }));
						if (!mm.is.display(data.__.$items[data._index])) mm.element.show(data.__.$items[data._index]);

						base.set(__$element);
					}

					mm.apply(data.onStart, __$element, [!__isBack].concat(data.onStartParams));

				},
				onComplete: function () {

					base.reposition(__$element);

					mm.apply(data.onComplete, __$element, [!__isBack].concat(data.onCompleteParams));

				}
			});

		},
		gsapUpdate: function (__$element, __index, __oldIndex, __direction, __isBack) {

			var data = mm.data.get(__$element, base._dataName);
			var $oldItem = data.__.$items[__oldIndex];
			var $item = data.__.$items[__index];
			var _value;

			if (!mm.is.display($item)) {
				mm.element.show($item);
				mm.preload.update($item);
			}

			mm.element.style(data.__.$items, { 'z-index': '' });

			if (data._direction === 'horizontal') {
				switch (data._effect) {
					case 'slide':
						_value = -data.__._updateValue * 100;
						mm.element.style($oldItem, { 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: _value }) });
						mm.element.style($item, { 'z-index': 2, 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: (__direction === 'next') ? _value + 100 : _value - 100 }) });

						if (data.__.$items.length > 2) {
							var $sideItem = _.nth(data.__.$items, (__direction === 'next') ? __oldIndex - 1 : __oldIndex + 1 - data.__.$items.length);
							mm.element.style($sideItem, { 'z-index': 2, 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: (__direction === 'next') ? _value - 100 : _value + 100 }) });

							if (data._isMoreSide === true) {
								var $moreItem = _.nth(data.__.$items, (__direction === 'next') ? __index + 1 - data.__.$items.length : __index - 1);
								mm.element.show($moreItem);
								mm.element.style($moreItem, { 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: (__direction === 'next') ? _value + 200 : _value - 200 }) });
							}
						}
						break;
					case 'fade':
						if (__direction === 'next') {
							mm.element.style($oldItem, { 'opacity': 1 });
							mm.element.style($item, { 'z-index': 2, 'opacity': data.__._updateValue });
						}
						else {
							mm.element.style($item, { 'opacity': 1 });
							mm.element.style($oldItem, { 'z-index': 2, 'opacity': data.__._updateValue + 1 });
						}
						break;
					case 'cover':
						if (__direction === 'next') {
							mm.element.style($oldItem, { 'transform': 'translateX(0%)' });
							mm.element.style($item, { 'z-index': 2, 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: -data.__._updateValue * 100 + 100 }) });

							if (data._isMoreSide === true) {
								var $moreItem = _.nth(data.__.$items, __index + 1 - data.__.$items.length);
								mm.element.show($moreItem);
								mm.preload.update($moreItem);
							}
						}
						else {
							mm.element.style($item, { 'transform': 'translateX(0%)' });
							mm.element.style($oldItem, { 'z-index': 2, 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: -data.__._updateValue * 100 }) });
						}
						break;
					case 'strip':
						if (__direction === 'next') {
							mm.element.style($item, { 'transform': 'translateX(0%)' });
							mm.element.style($oldItem, { 'z-index': 2, 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: -data.__._updateValue * 100 }) });
						}
						else {
							mm.element.style($oldItem, { 'transform': 'translateX(0%)' });
							mm.element.style($item, { 'z-index': 2, 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: -data.__._updateValue * 100 - 100 }) });
						}
						break;
					case 'none':
						break;
				}
			}
			else {
			}

			mm.apply(data.onUpdate, __$element, [__index, __oldIndex, __direction].concat(data.onUpdateParams));

		},
		change: function (__$element, __index, __direction) {

			var data = mm.data.get(__$element, base._dataName);
			if (gsap.isTweening(data.__) || data._index === __index) return;

			var _direction = (__direction) ? __direction : (__index > data._index) ? 'next' : 'prev';
			data.__._updateValue = 0;
			base.gsapTo(__$element, __index, _direction, (data._effect === 'fade') ? 'sine.out': 'sine.inOut');

		},
		set: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);

			if (data.__.$pages.length > 0) {
				mm.class.remove(data.__.$pages, data._classOn);

				if (data.__.$items[data._index].classList.contains(data._classClone) && data._index >= data.__.$pages.length) data.__.$pages[data._index - data.__.$pages.length].classList.add(data._classOn);
				else data.__.$pages[data._index].classList.add(data._classOn);
			}

			if (data.__.$count) {
				var _total = _.reject(data.__.$items, function (__$item) { return __$item.classList.contains(data._classClone); }).length;
				var _index = data._index + 1;
				var _pad = data.count._pad || '';
				if (_index > _total) _index -= _total;
				mm.find('.text_carousel-index', data.__.$count)[0].textContent = String(_index).padStart(_pad.length, _pad);
				mm.find('.text_carousel-total', data.__.$count)[0].textContent = String(_total).padStart(_pad.length, _pad);
			}

			if (data._isAutoHeight) {
				gsap.to(mm.find('.mm_carousel-list', __$element)[0], { height: data.__.$items[data._index].offsetHeight, duration: data._speed, ease: 'cubic.out' });
			}

		},
		reposition: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			var $items = data.__.$items;

			mm.class.remove($items, data._classOn);
			mm.element.hide($items);

			for (var _i = 0; _i < $items.length; _i++) {
				var $item = _.nth($items, data._index - _i);
				if (_i === 0) $item.classList.add(data._classOn);

				if (data._direction === 'horizontal') {
					switch (data._effect) {
						case 'slide':
							mm.element.style($item, { 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: (_i === 0) ? 0 : (_i === 1) ? -100 : 100 }) });
							if (_i < 2 || _i === $items.length - 1) mm.element.show($item);
							break;
						case 'fade':
							mm.element.style($item, { 'z-index': '', 'opacity': (_i === 0) ? 1 : 0 });
							if (_i < 2 || _i === $items.length - 1) mm.element.show($item);
							break;
						case 'cover':
							mm.element.style($item, { 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: (_i === 0) ? 0 : 100 }) });
							if (_i === 0 || _i === $items.length - 1) mm.element.show($item);
							break;
						case 'strip':
							mm.element.style($item, { 'transform': mm.string.template('translateX(${VALUE}%)', { VALUE: (_i === 0) ? 0 : -100 }) });
							if (_i < 2) mm.element.show($item);
							break;
						case 'none':
							break;
					}
				}
				else {
				}
			}

			if (data._isPreload === true) mm.preload.update($items);

			return;

		},
		interval: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			clearInterval(data.__.interval);

			if (data._autoDelay > 0) {
				data.__.interval = setInterval(function () {

					if (!mm.is.display(__$element)) return;

					var _index = data._index + 1;
					if (_index > data.__.$items.length - 1) _index = 0;

					base.change(__$element, _index, 'next');

				}, data._autoDelay * 1000);
			}

		},
	};

	return {
		//- 캐러셀 연결
		update: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });
				var $inner = mm.find('.mm_carousel-inner', __$el)[0];
				var $loadItems = mm.find(mm.selector(['data-preload', 'data-lazyload'], '[]'), $inner);

				if ($loadItems.length > 0 && (data._isErrorRemove === true || data._isAutoHeight === true)) {
					_.forEach($loadItems, function (__$item) {

						var itemData = mm.data.get(__$item, (__$item.hasAttribute('data-lazyload')) ? 'data-lazyload' : 'data-preload', true);
						itemData._isPass = true;
						mm.element.attribute(__$item, { 'data-lazyload': '', 'data-preload': itemData });

					});
					var _loadCount = 0;

					(function callee(__is) {

						if (typeof(__is) === 'boolean') {
							if (__is === false && data._isErrorRemove === true) this.closest('.mm_carousel-item').remove();

							_loadCount++;
							if (_loadCount === $loadItems.length) {
								data._isPreload = false;
								data._isErrorRemove = false;
								base.update(__$el);
							}
						}
						else mm.preload.force($loadItems, { onComplete: callee, onCompleteParams: [true], onError: callee, onErrorParams: [false] });

					})();
				}
				else base.update(__$el);

			});

		},
		//- 캐러셀 변경
		change: function (__elements, __index, __direction) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (!data || data._index === __index || __index > data.__.$items.length - 1 || __index < 0) return;

				base.change(__$el, __index, __direction);

			});

		},
		//- 캐러셀 항목 추가/삭제로 인한 재정렬
		reload: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (!data) return;

				clearInterval(data.__.interval);
				gsap.killTweensOf(data.__);

				var _itemTotal = data.__.$items.length;
				_.forEach(Object.values(data.__.$items), function (__$item, __index) {

					if (__$item.classList.contains(data._classClone)) {
						__$item.remove();
						if (__index === data._index) data._index = Math.floor(__index / (_itemTotal / 2));
					}

				});

				data.__.$items = [];
				data.__.$pages = [];
				data.__.$count = null;

				var $inner = mm.find('.mm_carousel-inner', __$el)[0];
				mm.event.off($inner, 'touchstart', 'carouselTouchStartInlineHandler');

				base.update(__$el);

			});

		},
		//- autoplay
		play: function (__elements, __autoDelay) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				if (Number.isFinite(__autoDelay)) {
					var data = mm.data.get(__$el, base._dataName);
					data._autoDelay = __autoDelay;
				}
				base.interval(__$el);

			});

		},
		stop: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				clearInterval(data.__.interval);

			});

		},
	};

})();
//> 캐러셀

//< 슬라이더 (모바일에서는 기본 가로 스크롤을 사용하고, 컨텐츠 단위로 멈춤이 필요할 때 사용)
mm.slider = (function () {

	var initial = {
		_index: 0,
		_direction: 'horizontal',
		_autoDelay: 0,
		_speed: 0.2,
		_sensitiveTime: 0.2,
		_rootMargin: '10px 1px',
		_isLoop: true,
		_isErrorRemove: false,
		_classIntersecting: '__slider-intersecting',
		_classOn: '__slider-on',
		_classClone: '__slider-clone',
		pagination: {
			_isInner: true,
			_el: '.btn_slider-page',
		},
		control: {
			_isInner: true,
			_prev: '.btn_slider-prev',
			_next: '.btn_slider-next',
		},
		onReady: null,
		onReadyParams: [],
		onUpdate: null,
		onUpdateParams: [],
		onStart: null,
		onStartParams: [],
		onComplete: null,
		onCompleteParams: [],
		onActive: null,
		onActiveParams: [],
		__: {
			_total: 0,
			_updateValue: null,
			_isDirection: null,
			interval: null,
			$items: [],
			$activeItem: null,
			$pages: [],
			$inner: null,
			$list: null,
			$btnPrev: null,
			$btnNext: null,
			innerPadding: {
				left: 0,
				right: 0,
			}
		},
	};

	var base = {
		get _dataName() { return 'data-slider'; },
		update: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			if (data.__.$items.length > 0) return;

			var $btnPages = (data.pagination._isInner) ? mm.find(data.pagination._el, __$element) : mm.find(data.pagination._el);
			var $inner = data.__.$inner = mm.find('.mm_slider-inner', __$element)[0];
			var $list = data.__.$list = mm.find('.mm_slider-list', __$element)[0];
			var $items = data.__.$items = mm.find('.mm_slider-item', $list);
			if ($items.length === 0) return;

			var $btnPrev = data.__.$btnPrev = (data.control._isInner) ? mm.find(data.control._prev, __$element)[0] : mm.find(data.control._prev)[0];
			var $btnNext = data.__.$btnNext = (data.control._isInner) ? mm.find(data.control._next, __$element)[0] : mm.find(data.control._next)[0];

			if ($btnPages.length > 0) data.__.$pages = $btnPages;

			data.__._total = $items.length;
			__$element.classList.add('__slider-ready');

			var innerStyle = mm.element.style($inner);
			data.__.innerPadding = { left: parseFloat(innerStyle.paddingLeft), right: parseFloat(innerStyle.paddingRight) }

			if ($list.offsetWidth <= $inner.offsetWidth - data.__.innerPadding.left - data.__.innerPadding.right) {
				mm.class.add($items, [data._classIntersecting, data._classOn]);
				mm.element.remove([$btnPrev, $btnNext]);
				mm.element.remove($btnPages);
				mm.element.style($inner, { 'text-align': 'center' });

				mm.apply(data.onReady, __$element, data.onReadyParams);

				return;
			}

			_.forEach($items, function (__$item, __index) {

				__$item.dataset.sliderIndex = __index;

			});

			if (data._isLoop === true) {
				var $firstItem = $items[0];
				_.forEach(Object.values($items), function (__$item, __index) {

					var $clone = __$item.cloneNode(true);
					$clone.classList.add(data._classClone);
					mm.class.remove($clone, [data._classIntersecting, data._classOn]);
					mm.element.attribute($clone, { 'tabindex': '-1' });

					__$item.parentElement.append($clone);

					var $cloneBefore = $clone.cloneNode(true);
					mm.element.before($firstItem, $cloneBefore);

					mm.preload.destroy([$clone, $cloneBefore]);
					mm.preload.update([$clone, $cloneBefore]);
					mm.lazyload.destroy([$clone, $cloneBefore]);
					mm.lazyload.update([$clone, $cloneBefore]);

				});

				mm.element.style($list, { 'margin-left': mm.number.unit(-$list.offsetWidth / 3) });
			}

			mm.intersection.on($items, function (__entry, __is) {

				if (__is === true) {
					__entry.target.classList.add(data._classIntersecting);

					if (__entry.intersectionRatio === 1) {
						__entry.target.classList.add(data._classOn);
						base.set(__$element);
					}
					else __entry.target.classList.remove(data._classOn);
				}
				else mm.class.remove(__entry.target, [data._classIntersecting, data._classOn]);

			}, { config: {
				root: $inner,
				rootMargin: data._rootMargin,
			} });

			mm.event.on($inner, 'touchstart', function sliderTouchStartInlineHandler(__e) {

				if (gsap.isTweening(data.__)) return;

				clearInterval(data.__.interval);
				mm.time.stamp('slider');

				var startTouch = (__e.detail && __e.detail.touches) ? __e.detail.touches[0] : __e.touches[0];
				var _startValue = data.__._updateValue || 0;
				var _touchCount = 0;
				data.__._isDirection = null;

				mm.event.on($inner, 'touchmove touchend', function sliderTouchInlineHandler(__e) {

					var touch = (__e.detail && __e.detail.touches) ? __e.detail.touches[0] : (__e.type === 'touchend') ? __e.changedTouches[0] : __e.touches[0];

					if (data.__._isDirection === null) {
						var _moveX = Math.abs(touch.screenX - startTouch.screenX);
						var _moveY = Math.abs(touch.screenY - startTouch.screenY);
						var _limit = 1.5;

						if (data._direction === 'horizontal' && _moveX / _moveY > _limit) data.__._isDirection = true;
						else if (data._direction === 'vertical' && _moveY / _moveX > _limit) data.__._isDirection = true;
						else {
							mm.event.off($inner, 'touchmove touchend', sliderTouchInlineHandler);
							base.interval(__$element);
						}

						return;
					}
					else if (data.__._isDirection === true) {
						__e.preventDefault();

						data.__._updateValue = ((data._direction === 'horizontal') ? startTouch.screenX - touch.screenX : startTouch.screenY - touch.screenY) + _startValue;
						var _direction = (data.__._updateValue > _startValue) ? 'next' : 'prev';

						if (__e.type === 'touchmove') base.gsapUpdate(__$element, _direction);
						else {
							var _touchTime = mm.time.stampEnd('slider') / 1000;
							var _index = null;
							if (_touchCount > 1 && _touchTime < data._sensitiveTime) {
								if (_direction === 'prev' && data._index > 0) _index = data._index - 1;
								else if (_direction === 'next' && data._index < data.__._total - 1) _index = data._index + 1;
							}

							base.gsapTo(__$element, _direction, 'cubic.out', _index);
						}

						_touchCount++;
					}

					if (__e.type === 'touchend') {
						mm.event.off($inner, 'touchmove touchend', sliderTouchInlineHandler);
						base.interval(__$element);
					}

				});

			});

			if ($btnPrev) {
				mm.event.on($btnPrev, 'click', function sliderPrevInlineHandler(__e) {

					var _index = data._index - 1;
					if (_index < 0) _index = data.__._total - 1;
					base.change(__$element, _index, 'prev');
					base.interval(__$element);

				}, { _isOverwrite: true });
			}
			if ($btnNext) {
				mm.event.on($btnNext, 'click', function sliderNextInlineHandler(__e) {

					var _index = data._index + 1;
					if (_index > data.__._total - 1) _index = 0;
					base.change(__$element, _index, 'next');
					base.interval(__$element);

				}, { _isOverwrite: true });
			}

			if ($btnPages.length > 0) {
				mm.event.on($btnPages, 'click', function carouselPageInlineHandler(__e) {

					var _index = mm.element.index($btnPages, this);
					if (_index !== base._index) {
						base.change(__$element, _index);
						base.interval(__$element);
					}

				}, { _isOverwrite: true });
			}

			data.__._updateValue = $items[(data._isLoop === true) ? data._index + data.__._total : data._index].getBoundingClientRect().left - $inner.getBoundingClientRect().left - data.__.innerPadding.left;
			mm.element.style($list, { 'transform': mm.string.template('translateX(${VALUE}px)', { VALUE: -data.__._updateValue }) });

			base.interval(__$element);

			mm.apply(data.onReady, __$element, data.onReadyParams);

		},
		gsapTo: function (__$element, __direction, __ease, __index) {

			var data = mm.data.get(__$element, base._dataName);
			var _value = 0;
			var innerRect = data.__.$inner.getBoundingClientRect();

			if (Number.isFinite(__index)) {
				var $targetItem = (function () {

					var $items = Object.values(data.__.$items);
					var _itemIndex = mm.element.index($items, data.__.$activeItem);
					var _selector = mm.string.template('[data-slider-index="${INDEX}"]', { INDEX: __index });

					if (__direction === 'next') return _.find($items.slice(_itemIndex), function (__$item) { return __$item.matches(_selector); });
					else return _.findLast($items.slice(0, _itemIndex), function (__$item) { return __$item.matches(_selector); });

				})();
				_value = $targetItem.getBoundingClientRect().left - data.__.$activeItem.getBoundingClientRect().left - (innerRect.left + data.__.innerPadding.left - data.__.$activeItem.getBoundingClientRect().left);
			}
			else {
				var $firstItem = _.filter(data.__.$items, function (__$item) { return __$item.classList.contains(data._classIntersecting); })[0];
				if (!$firstItem) $firstItem = (__direction === 'prev') ? data.__.$items[0] : _.last(data.__.$items);
				var _target = innerRect.left + data.__.innerPadding.left - $firstItem.getBoundingClientRect().left;

				_value = (_target > $firstItem.offsetWidth / 2) ? $firstItem.offsetWidth - _target : -_target;
			}
			_value = data.__._updateValue + _value;

			if (data._isLoop !== true) {
				var _max = data.__.$list.offsetWidth - data.__.$inner.offsetWidth + data.__.innerPadding.left + data.__.innerPadding.right;
				if (_value < 0) _value = 0;
				else if (_value > _max) _value = _max;
			}

			gsap.to(data.__, {
				_updateValue: _value,
				duration: data._speed,
				ease: __ease,
				onUpdate: function () {

					base.gsapUpdate(__$element, __direction);

				},
				onStart: function () {

					mm.apply(data.onStart, __$element, data.onStartParams);

				},
				onComplete: function () {

					base.set(__$element);

					mm.apply(data.onComplete, __$element, data.onCompleteParams);

				}
			});

		},
		gsapUpdate: function (__$element, __direction, __isBack) {

			var data = mm.data.get(__$element, base._dataName);

			if (data._direction === 'horizontal') mm.element.style(data.__.$list, { 'transform': mm.string.template('translateX(${VALUE}px)', { VALUE: -data.__._updateValue }) });
			else {}

			mm.apply(data.onUpdate, __$element, [__direction].concat(data.onUpdateParams));

		},
		change: function (__$element, __index, __direction) {

			var data = mm.data.get(__$element, base._dataName);
			if (gsap.isTweening(data.__) || __index === data._index) return;

			var _direction = (__direction) ? __direction : (function () {

				if (__index > data._index) return (__index - data._index < data._index + data.__._total - __index) ? 'next' : 'prev';
				else return (__index - data._index < __index + data.__._total - data._index) ? 'prev' : 'next';

			})();

			base.gsapTo(__$element, _direction, 'sine.inOut', __index);

		},
		set: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			var $firstItem = _.filter(data.__.$items, function (__$item) { return __$item.classList.contains(data._classOn); })[0];
			if (!$firstItem) return;

			data._index = parseFloat($firstItem.dataset.sliderIndex);
			data.__.$activeItem = $firstItem;

			if (data.__.$pages.length > 0 && !mm._isTouch) {
				mm.class.remove(data.__.$pages, data._classOn);
				data.__.$pages[data._index].classList.add(data._classOn);
			}

			if (data._isLoop !== true) {
				var _max = data.__.$list.offsetWidth - data.__.$inner.offsetWidth;
				mm.element.attribute([data.__.$btnPrev, data.__.$btnNext], { 'disabled': false });

				if (data.__._updateValue < 0.5) mm.element.attribute(data.__.$btnPrev, { 'disabled': true });
				else if (data.__._updateValue > _max - 0.5) mm.element.attribute(data.__.$btnNext, { 'disabled': true });
			}

			base.reposition(__$element);

			mm.apply(data.onActive, __$element, data.onActiveParams);

		},
		reposition: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			if (data._isLoop !== true) return;

			var $items = data.__.$items;
			var $onItems = _.filter($items, function (__$item) { return __$item.classList.contains(data._classOn); });
			if ($onItems.length < 1) return;

			var _beforeTotal = mm.element.index($items, $onItems[0]);
			var _afterTotal = $items.length - $onItems.length - _beforeTotal;
			var _appendTotal = Math.floor(Math.abs(_beforeTotal - _afterTotal) / 2);
			var _margin = 0;

			if (_appendTotal > 0) {
				var _count = 0;
				var $item;
				while (_count < _appendTotal) {
					if (_beforeTotal > _afterTotal) {
						$item = $items[0];
						_margin += (data._direction === 'horizontal') ? $item.offsetWidth : $item.offsetHeight;
						$item.parentElement.append($item);
					}
					else {
						$item = $items[$items.length - 1];
						_margin -= (data._direction === 'horizontal') ? $item.offsetWidth : $item.offsetHeight;
						$item.parentElement.prepend($item);
					}
					_count++;
				}

				if (data._direction === 'horizontal') mm.element.style($item.parentElement, { 'margin-left': mm.number.unit(parseFloat(mm.element.style($item.parentElement, 'margin-left')) + _margin) });
				else mm.element.style($item.parentElement, { 'margin-top': mm.number.unit(parseFloat(mm.element.style($item.parentElement, 'margin-top')) + _margin) });
			}

			return;

		},
		interval: function (__$element) {

			var data = mm.data.get(__$element, base._dataName);
			clearInterval(data.__.interval);

			if (data._autoDelay > 0) {
				data.__.interval = setInterval(function () {

					if (!mm.is.display(__$element)) return;

					var _index = data._index + 1;
					if (_index > data.__._total - 1) _index = 0;

					base.change(__$element, _index, 'next');

				}, data._autoDelay * 1000);
			}

		},
	};

	return {
		//- 슬라이더 연결
		update: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });
				var $loadItems = mm.find(mm.selector(['data-preload', 'data-lazyload'], '[]'), __$el);

				if ($loadItems.length > 0 && (data._isErrorRemove === true || data._isAutoHeight === true)) {
					_.forEach($loadItems, function (__$item) {

						var itemData = mm.data.get(__$item, (__$item.hasAttribute('data-lazyload')) ? 'data-lazyload' : 'data-preload', true);
						itemData._isPass = true;
						mm.element.attribute(__$item, { 'data-lazyload': '', 'data-preload': itemData });

					});
					var _loadCount = 0;

					(function callee(__is) {

						if (typeof(__is) === 'boolean') {
							if (__is === false && data._isErrorRemove === true) this.closest('.mm_slider-item').remove();

							_loadCount++;
							if (_loadCount === $loadItems.length) {
								data._isPreload = false;
								data._isErrorRemove = false;
								base.update(__$el);
							}
						}
						else mm.preload.force($loadItems, { onComplete: callee, onCompleteParams: [true], onError: callee, onErrorParams: [false] });

					})();
				}
				else base.update(__$el);

			});

		},
		//- 슬라이더 변경
		change: function (__elements, __index, __direction) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (!data || data._index === __index || __index > data.__._total - 1 || __index < 0) return;

				base.change(__$el, __index, __direction);

			});

		},
		//- 슬라이더 항목 추가/삭제로 인한 재정렬
		reload: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (!data) return;

				clearInterval(data.__.interval);
				gsap.killTweensOf(data.__);

				_.forEach(Object.values(data.__.$items), function (__$item, __index) {

					if (__$item.classList.contains(data._classClone)) __$item.remove();

				});

				mm.intersection.off(data.__.$items);
				data.__.$items = [];
				data.__.$pages = [];

				mm.event.off(data.__.$inner, 'touchstart', 'sliderTouchStartInlineHandler');

				base.update(__$el);

			});

		},
		//- autoplay
		play: function (__elements, __autoDelay) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				if (Number.isFinite(__autoDelay)) {
					var data = mm.data.get(__$el, base._dataName);
					data._autoDelay = __autoDelay;
				}
				base.interval(__$el);

			});

		},
		stop: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				clearInterval(data.__.interval);

			});

		},
	};

})();
//> 슬라이더

//< 수량 스테퍼
mm.stepper = (function () {

	var initial = {
		_min: 1,
		_max: 99,
		onChange: null,
		onChangeParams: [],
	};

	var base = {
		get _dataName() { return 'data-stepper'; },
		change: function (__$ui, __target) {

			var data = mm.data.get(__$ui, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$ui, base._dataName, { initial: initial });

			var $formText = mm.find('.text_stepper', __$ui)[0];
			var _value = (Number.isFinite(__target) && __target > -1) ? __target : parseFloat($formText.value);
			_value = Math.max(Math.min(_value, data._max), data._min);
			if (!_value) _value = (__target && __target.type === 'keyup') ? '' : data._min;

			$formText.value = _value;

			mm.element.attribute(mm.find('.btn_stepper-subtract', __$ui)[0], { 'disabled': _value <= data._min });
			mm.element.attribute(mm.find('.btn_stepper-add', __$ui)[0], { 'disabled': _value >= data._max });

			mm.apply(data.onChange, __$ui, data.onChangeParams);

		},
	};

	(function () {

		mm.delegate.on(document, mm.string.template('[${UI}] .btn_stepper-subtract, [${UI}] .btn_stepper-add', { UI: base._dataName }), 'click', function (__e) {

			__e.preventDefault();

			var $stepper = this.closest(mm.selector(base._dataName, '[]'));
			if (!$stepper) return;

			var $formText = mm.find('.text_stepper', $stepper)[0];
			var _value = parseFloat($formText.value) || 1;

			if (this.classList.contains('btn_stepper-subtract')) _value--;
			else _value++;

			base.change($stepper, _value);

		});

	})();

	return {
		//- 수량 연결
		update: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				base.change(__$el);

			});

		},
		//- 수량 변경
		change: function (__elements, __target) {

			if (__target && __target.type === 'keyup' && !/(\d)|\.|\-/.test(__target.key)) return;

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.change(__$el, __target);

			});

		},
	};

})();
//> 수량 스테퍼

//< 폼 요소
mm.form = (function () {

	var base = {
		get checkers() { return ['data-text', 'data-check', 'data-radio', 'data-select', 'data-file', 'data-multiple']; },
		get _classAlert() { return 'text_alert' },
		get _classValid() { return 'text_valid' },
		formElement: function (__elements) {

			var _checker = mm.selector(base.checkers, '[]');
			var $elements = mm.find(__elements);
			var $filtered = _.filter($elements, function (__$el) { return __$el.matches(_checker); });

			if ($filtered.length > 0) return $filtered;
			else return mm.find(_checker, $elements);

		},
		appendFormText: function (__$form, __messageHtml) {

			base.liftFormText(__$form);

			var $text = mm.element.create(__messageHtml)[0];
			mm.element.after(__$form.closest('label'), $text);

			var $btn = mm.find('> button', __$form.closest('[class*="mm_form-"]'));
			_.forEach($btn, function (__$btn) {

				var _btnTop = parseFloat(mm.element.style(__$btn, 'margin-top')) || 0;
				mm.element.style(__$btn, { 'margin-top': mm.number.unit(-$text.offsetHeight / 2 + _btnTop) });

			});

			return $text;

		},
		liftFormText: function (__$element) {

			var _selector = mm.selector([base._classAlert, base._classValid], '.');
			var $label = (__$element.matches(_selector)) ? mm.siblings(__$element, 'label')[0] : __$element.closest('label');
			var $ui = $label.closest('[class*="mm_form-"]');

			var _i = 0;
			while (_i < $ui.classList.length) {
				var _class = $ui.classList[_i];
				if (_class.startsWith('__text-alert') || _class.startsWith('__text-valid')) $ui.classList.remove(_class);
				else _i++;
			}

			var $btn = mm.find('> button', $ui);
			_.forEach($btn, function (__$btn) {

				mm.element.style(__$btn, { 'margin-top': '' });

			});

			mm.element.remove(mm.find(_selector, $ui));

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(['data-text', 'data-select'], '[]'), 'focusin focusout', function (__e) {

			if (this.tagName === 'INPUT' && !['text', 'password', 'email', 'number', 'search', 'tel', 'url', 'date', 'month', 'time', 'week'].includes(this.type)) return;
			if (mm.is.mobile('ios') && (this.readOnly || this.disabled)) mm.focus.out(this);

			switch (__e.type) {
				case 'focusin':
					if (this.hasAttribute('data-text')) document.documentElement.classList.add('__focus');
					if (!this.hasAttribute('autocomplete')) this.setAttribute('autocomplete', 'off');

					var $scroll = mm.scroll.find(this, true);

					if (mm.is.mobile('android') && $scroll && this.tagName !== 'SELECT') {
						mm.scroll.to(this, { scroller: $scroll, _margin: (function () {

							var $header = mm.find('.mm_header')[0];
							var _space = 50;
							return ($header) ? $header.offsetHeight + _space : _space;

						})() });
					}

					if (mm.is.mobile()) {
						mm.event.on($scroll, 'scroll', function formScrollInlineHandler(__e) {

							var $focus = document.activeElement;
							if ($focus && mm._isTouch) {
								mm.focus.out($focus);
								mm.event.off($scroll, 'scroll', formScrollInlineHandler);
							}

						});
					}
					break;
				case 'focusout':
					document.documentElement.classList.remove('__focus');
					break;
			}

		});

	})();

	return {
		//- 폼 요소 업데이트
		update: function (__elements) {

			var $elements = base.formElement(__elements || '.mm_app');
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			mm.event.dispatch($elements, 'update');

		},
		//- 폼 요소 값 변경
		value: function (__elements, __value) {

			var $elements = base.formElement(__elements);
			if ($elements.length === 0 || __value === undefined) return;

			_.forEach($elements, function (__$el) {

				if (__$el.matches(mm.selector('data-text', '[]'))) {
					__$el.value = __value;
				}
				else if (__$el.matches(mm.selector(['data-check', 'data-radio'], '[]'))) {
					__$el.checked = __value;
				}
				else if (__$el.matches(mm.selector('data-select', '[]'))) {
					__$el.value = __value;
					if (__$el.selectedIndex < 0) __$el.selectedIndex = 0;
				}

			});

			mm.event.dispatch($elements, 'change');

		},
		//- 폼 요소 오류
		alert: function (__elements, __message) {

			var $elements = base.formElement(__elements);
			if ($elements.length === 0 || typeof(__message) !== 'string') return;

			var _message = __message.replace(/\n/ig, '<br>');

			_.forEach($elements, function (__$el) {

				base.appendFormText(__$el, mm.string.template('<p class="${CLASS}">${MESSAGE}</p>', { CLASS: base._classAlert, MESSAGE: _message }));

				var $ui = __$el.closest('[class*="mm_form-"]');
				$ui.classList.add('__text-alert');

				mm.scroll.to($ui, { scroller: mm.scroll.find(__$el, true), _margin: (function () {

					var $header = mm.find('.mm_header')[0];
					var _space = 50;
					return ($header) ? $header.offsetHeight + _space : _space;

				})() });

			});

		},
		//- 폼 요소 유효
		valid: function (__elements, __message, __condition) {

			var $elements = base.formElement(__elements);
			if ($elements.length === 0 || typeof(__message) !== 'string') return;

			var _message = __message.replace(/\n/ig, '<br>');

			_.forEach($elements, function (__$el) {

				var $text = base.appendFormText(__$el, mm.string.template('<p class="${CLASS}"><i class="mco_form-valid"></i>${MESSAGE}</p>', { CLASS: base._classValid, MESSAGE: _message }));

				var $ui = __$el.closest('[class*="mm_form-"]');
				var _condition;

				if (__condition) _condition = __condition.toLowerCase();
				else {
					if (__message.startsWith('보통')) _condition = 'normal';
					else if (__message.startsWith('위험')) _condition = 'danger';
					else if (__message.startsWith('사용불가')) _condition = 'invalid';
					else _condition = 'valid';
				}

				$text.classList.add(mm.string.template('__valid-${CLASS}', { CLASS: _condition }));
				$ui.classList.add(mm.string.template('__text-valid-${CONDITION}', { CONDITION: _condition }));

			});

		},
		//- 오류/유효 해제
		lift: function (__elements) {

			var $elements = (__elements) ? base.formElement(__elements) : mm.find(mm.selector([base._classAlert, base._classValid], '.'));

			_.forEach($elements, function (__$el) {

				base.liftFormText(__$el);

			});

		},
	};

})();
//> 폼 요소

//< 폼 요소(텍스트)
mm.form.text = (function () {

	var initial = {
		_default: '',
		_classOn: '__text-on',
		_classOff: '__text-off',
		_format: null,
		_isResize: false,
		_resizeMin: null,
		_resizeMax: null,
		_isAutoComplete: false,
		__: {
			$autocomplete: null,
		},
	};

	var base = {
		get _dataName() { return 'data-text'; },
		autocomplete: function (__$text) {

			var $ui = __$text.closest('.mm_form-text, .mm_form-textarea');
			var data = mm.data.get(__$text, base._dataName);
			if (!$ui || data.__.$autocomplete) return;

			var _classOn = '__auto-on';
			var DELAY_CLOSE = mm.string.template('DELAY_AUTOCOMPLETE_CLOSE_${ID}', { ID: new Date().valueOf() });

			data.__.$autocomplete = mm.find('.mm_form-text-autocomplete', $ui)[0];
			if (!data.__.$autocomplete) {
				data.__.$autocomplete = mm.element.create(mm.string.template([
					'<div class="mm_form-text-autocomplete">',
					'	<div class="mm_scroller">',
					'		<ul>',
					'			<li><button type="button"><b>자동<strong class="mm_text-primary">완성</strong>샘플, 내용(li 요소) 교체 필요</b></button></li>',
					'		</ul>',
					'	</div>',
					'</div>',
				]))[0];
				$ui.append(data.__.$autocomplete);
			}

			function keyDownFocus(__e, __$el) {

				__e.preventDefault();

				mm.delay.on(function () {

					mm.class.remove(mm.find('.__over', data.__.$autocomplete), '__over');
					__$el.classList.add('__over');

					__$text.value = _.last(mm.find('b:not(.text_date)', __$el)).textContent;

				});

			}

			mm.event.on(__$text, 'change keyup', function (__e) {

				switch (__e.type) {
					case 'change':
						if (__e.detail && __e.detail._isUpdate === true) return;
					case 'keyup':
						if (__e.type === 'keyup' && __e.keyCode > 36 && __e.keyCode < 41) return;

						if (this.value.trim().length > 0) data.__.$autocomplete.classList.add(_classOn);
						else data.__.$autocomplete.classList.remove(_classOn);
						break;
				}

			});

			mm.event.on($ui, 'keydown mouseover mouseenter mouseleave focusin focusout', function (__e) {

				mm.delay.off(DELAY_CLOSE);
				if (!data.__.$autocomplete.classList.contains(_classOn)) return;

				switch (__e.type) {
					case 'keydown':
						var $active = mm.find('.__over', data.__.$autocomplete)[0] || document.activeElement;
						var $items = mm.find('li > button', data.__.$autocomplete);
						var _itemIndex = mm.element.index($items, $active);
						var _isText = $active.matches('[data-text]');

						if (__e.keyCode === 38) {
							if (_isText) return;

							if ($active.tagName !== 'BUTTON' || _itemIndex === 0) keyDownFocus(__e, $items[$items.length - 1]);
							else keyDownFocus(__e, $items[_itemIndex - 1]);
						}
						else if (__e.keyCode === 40) {
							if ($active.tagName === 'BUTTON' && _itemIndex === $items.length - 1) keyDownFocus(__e, $items[0]);
							else keyDownFocus(__e, $items[_itemIndex + 1]);
						}
						break;
					case 'mouseover':
						mm.class.remove(mm.find('.__over', data.__.$autocomplete), '__over');
						if (document.activeElement.tagName === 'BUTTON') mm.focus.in(__$text);

						var $autoItem = __e.target.closest('button');
						if ($autoItem) $autoItem.classList.add('__over');
						break;
					case 'mouseleave':
					case 'focusout':
						mm.delay.on(function () {

							data.__.$autocomplete.classList.remove(_classOn);

						}, { _time: (__e.type === 'mouseleave') ? 1 : 0, _isSec: true, _name: DELAY_CLOSE, _isOverwrite: true });
						break;
				}

			});

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'update change paste keydown keyup focusout', function (__e) {

			var $text = this;
			var $ui = $text.closest('.mm_form-text, .mm_form-textarea');
			if (!$ui) return;

			var data = mm.data.get($text, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($text, base._dataName, { initial: initial });
			var _classToggle = ($text.readOnly || $text.disabled) ? data._classOff : data._classOn;
			var _value = $text.value;

			switch (__e.type) {
				case 'paste':
				case 'keydown':
					$ui.classList.add(_classToggle);
					break;
				case 'update':
					if ($text.type === 'number' && mm.is.empty($text.inputMode)) {
						$text.pattern = '[0-9]*';
						$text.inputMode = 'numeric';
					}
					if (!mm.is.mobile() && ['tel', 'number', 'date', 'month', 'time'].includes($text.type)) $text.type = 'text';
					if (data._isAutoComplete) base.autocomplete($text);
				case 'focusout':
					if (_value.trim().length === 0) $text.value = data._default;
					mm.event.dispatch($text, 'change', { data: { _isUpdate: true } });
					break;
				case 'change':
					$text.value = _value = _value.trim();
				case 'keyup':
					if (_value.length > 0) {
						var _maxlength = parseFloat($text.getAttribute('maxlength'));
						if ((mm.is.mobile('android') || mm.is.mobile('ios') && $text.type === 'number') && Number.isFinite(_maxlength) && _value.length > _maxlength) $text.value = _value.substr(0, _maxlength);
						$ui.classList.add(_classToggle);
					}
					else $ui.classList.remove(_classToggle);

					if (data._default.trim().length > 0) {
						if (data._default !== _value) $ui.classList.add('__text-changed');
						else $ui.classList.remove('__text-changed');
					}

					if ($text.tagName === 'TEXTAREA' && data._isResize === true) {
						var textStyle = mm.element.style($text);
						var _padding = parseFloat(textStyle.paddingTop) + parseFloat(textStyle.paddingBottom);
						var _lineHeight = parseFloat(textStyle.lineHeight);
						var $scroller = mm.scroll.find($text, true);
						var _scrollTop = $scroller.scrollTop;

						mm.element.style($text, { 'height': mm.number.unit(_padding + _lineHeight + 2) });

						if (!data._resizeMin) data._resizeMin = 2;
						if (!data._resizeMax) data._resizeMax = 99999;

						var _lineTotal = ($text.scrollHeight === $text.offsetHeight) ? data._resizeMin : Math.ceil(($text.scrollHeight - _padding) / _lineHeight);
						var _lineNum = (_lineTotal < data._resizeMin) ? data._resizeMin : (_lineTotal > data._resizeMax) ? data._resizeMax : _lineTotal;

						mm.element.style($text, { 'height': mm.number.unit(_padding + _lineNum * _lineHeight) });
						$scroller.scrollTop = _scrollTop;
					}

					if (['date', 'month'].includes($text.type)) {
						mm.siblings($text, '.text_date')[0].textContent = _value;
					}

					if ($text.type === 'time') {
						mm.siblings($text, '.text_date')[0].textContent = _value;
					}

					if ($text.classList.contains('text_stepper')) mm.stepper.change($text.closest('[data-stepper]'), __e);
					break;
			}

		});

		// 텍스트 내용 삭제
		mm.delegate.on(document, '.btn_text-clear', 'click', function (__e) {

			__e.preventDefault();

			var $text = mm.find(base._dataName, this.closest('.mm_form-text, .mm_form-textarea'))[0];
			if (!$text || $text.readOnly || $text.disabled) return;

			var data = mm.data.get($text, base._dataName);
			mm.form.value($text, data._default);

			mm.event.dispatch($text, 'clear');
			if (!['date', 'month', 'time'].includes($text.type)) mm.focus.in($text);

		});

		// 비밀번호 토글
		mm.delegate.on(document, '.btn_text-pw', 'click', function (__e) {

			__e.preventDefault();

			var $text = mm.find(base._dataName, this.closest('.mm_form-text'))[0];
			if (!$text || $text.readOnly || $text.disabled) return;

			if ($text.type === 'password') $text.type = 'text';
			else $text.type = 'password';

			var $mco = mm.find('.mco_pw-show, .mco_pw-hide', this)[0];
			if ($mco) {
				mm.class.toggle($mco, ['mco_pw-show', 'mco_pw-hide']);
				$mco.nextElementSibling.textContent = ($mco.classList.contains('mco_pw-show')) ? '비밀번호 숨기기' : '비밀번호 보기';
			}

		});

	})();

})();
//> 폼 요소(텍스트)

//< 폼 요소(체크박스)
mm.form.check = (function () {

	var initial = {
		_type: 'check_box',
		_group: null,
		_min: null,
		syncer: null,
		_isSyncerUpdate: true,
		desyncer: null,
		_isDesyncerUpdate: true,
		onChange: null,
		onChangeParams: [],
	};

	var base = {
		get _dataName() { return 'data-check'; },
		checkGroup: function (__$groups, __group) {

			var allData;
			var $all = _.find(__$groups, function (__$group) {

				var groupData = mm.data.get(__$group, base._dataName);
				if (mm.is.empty(groupData)) groupData = mm.data.set(__$group, base._dataName, { initial: initial });

				var _isAll = false;
				if (groupData._type === 'check_all') {
					if (groupData._group) _isAll = groupData._group === __group;
					else _isAll = (__$group.name.includes('[')) ? __$group.name.startsWith(__group) : __$group.name === __group;
				}
				if (_isAll) allData = groupData;

				return _isAll;

			});

			if ($all) {
				var _min = (Number.isFinite(allData._min)) ? allData._min : __$groups.length - 1;
				var _count = _.filter(__$groups, function (__$group) {

					var groupData = mm.data.get(__$group, base._dataName);
					if (mm.is.empty(groupData)) groupData = mm.data.set(__$group, base._dataName, { initial: initial });

					if (!__$group.checked || __$group === $all) return false;
					else {
						if (groupData._group) return groupData._group.includes(__group);
						else return (__$group.name.includes('[')) ? __$group.name.startsWith(__group) : __$group.name === __group;
					}

				}).length;

				var _isChecked = $all.checked;
				if (_count < _min) $all.checked = false;
				else $all.checked = true;

				if (_isChecked !== $all.checked) mm.changeSyncer($all, $all.checked, base._dataName);
			}

		},
		checkCount: function (__group) {

			if (!__group) return;

			var $groups = mm.find(mm.string.template('[${KEY}*="\'_group\'"][${KEY}*="${GROUP}"]', { KEY: base._dataName, GROUP: __group.split(' ')[0] }));
			var $counts = _.filter($groups, function (__$group) {

				var groupData = mm.data.get(__$group, base._dataName);
				if (mm.is.empty(groupData)) groupData = mm.data.set(__$group, base._dataName, { initial: initial });

				return groupData._type === 'check_count';

			});

			_.forEach($counts, function (__$count) {

				var countData = mm.data.get(__$count, base._dataName);
				if (mm.is.empty(countData)) countData = mm.data.set(__$count, base._dataName, { initial: initial });

				var _count = _.filter($groups, function (__$group) {

					var groupData = mm.data.get(__$group, base._dataName);
					if (mm.is.empty(groupData)) groupData = mm.data.set(__$group, base._dataName, { initial: initial });

					if (!__$group.checked || (groupData._group === countData._group && groupData._type === 'check_all')) return false;
					else return __$group.type === 'checkbox' && groupData._group.includes(countData._group);

				}).length;

				if (__$count.tagName === 'INPUT' || __$count.tagName === 'TEXTAREA') mm.form.value(__$count, _count);
				else __$count.textContent = _count;

			});

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'update change', function (__e) {

			var $check = this;
			if ($check.type !== 'checkbox') return;

			var data = mm.data.get($check, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($check, base._dataName, { initial: initial });

			var _name = $check.name;
			var $groups = (function () {

				if (data._group) return mm.find(mm.string.template('[${KEY}*="\'_group\'"][${KEY}*="${GROUP}"]', { KEY: base._dataName, GROUP: data._group }));
				else {
					if (mm.is.empty(_name)) return [];

					var _index = _name.indexOf('[');
					if (_index > 0) _name = _name.slice(0, _index + 1);

					return mm.find(mm.string.template('[${KEY}][name^="${NAME}"]', { KEY: base._dataName, NAME: _name }));
				}

			})();

			$groups = _.reject($groups, function (__$group) { return __$group.type !== 'checkbox'; });

			if ($groups.length > 1) {
				if (data._type === 'check_all') {
					_.forEach($groups, function (__$group) {

						if (__$group !== $check && __$group.checked !== $check.checked) {
							var groupData = mm.data.get(__$group, base._dataName);
							if (mm.is.empty(groupData)) groupData = mm.data.set(__$group, base._dataName, { initial: initial });

							if (__e.type === 'update') {
								if ($check.checked) __$group.checked = true;
							}
							else __$group.checked = $check.checked;

							mm.changeSyncer(__$group, __$group.checked, base._dataName);
						}

					});
				}
				else base.checkGroup($groups, (data._group) ? data._group : _name);

				if (data._group) {
					var _parentGroup = data._group;
					while (_parentGroup.includes(' ')) {
						_parentGroup = _parentGroup.slice(0, _parentGroup.lastIndexOf(' '));
						var $parentGroups = mm.find(mm.string.template('[${KEY}*="\'_group\'"][${KEY}*="${GROUP}"]', { KEY: base._dataName, GROUP: _parentGroup }));
						$parentGroups = _.reject($parentGroups, function (__$group) { return __$group.type !== 'checkbox'; });

						base.checkGroup($parentGroups, _parentGroup);
					}
				}

				base.checkCount(data._group);
			}

			mm.changeSyncer($check, $check.checked, base._dataName);
			mm.apply(data.onChange, $check, data.onChangeParams);

			if (mm._isFrame && !mm._isMain) mm.frameResize();

		});

	})();

})();
//> 폼 요소(체크박스)

//< 폼 요소(라디오)
mm.form.radio = (function () {

	var initial = {
		syncer: null,
		_isSyncerUpdate: true,
		desyncer: null,
		_isDesyncerUpdate: true,
		onChange: null,
		onChangeParams: [],
	};

	var base = {
		get _dataName() { return 'data-radio'; },
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'update change', function (__e) {

			var $radio = this;
			var data = mm.data.get($radio, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($radio, base._dataName, { initial: initial });

			var _name = $radio.name;
			var $groups = (function () {

				if (mm.is.empty(_name)) return [];

				var _index = _name.indexOf('[');
				if (_index > 0) _name = _name.slice(0, _index + 1);

				return mm.find(mm.string.template('[${KEY}][name^="${NAME}"]', { KEY: base._dataName, NAME: _name }));

			})();

			$groups = _.reject($groups, function (__$group) { return __$group.type !== 'radio'; });

			var $checked = $radio;
			var checkedData = data;

			if ($groups.length > 1) {
				$checked = _.find($groups, function (__$group) { return __$group.checked; });

				var $displayed = _.find($groups, mm.is.display);
				if ($checked && !mm.is.display($checked)) {
					$checked = $displayed;
					$checked.checked = true;
				}

				var _radioIndex = mm.element.index($groups, $radio);
				if ((!$checked && $radio !== $displayed) || ($checked && mm.element.index($groups, $checked) !== _radioIndex)) return;

				_.forEach($groups, function (__$group) {

					var groupData = mm.data.get(__$group, base._dataName);
					if (mm.is.empty(groupData)) groupData = mm.data.set(__$group, base._dataName, { initial: initial });

					if (__$group !== $checked) mm.changeSyncer(__$group, __$group.checked, base._dataName);
					else checkedData = groupData;

				});
			}

			if ($checked) {
				mm.changeSyncer($checked, $checked.checked, base._dataName);
				mm.apply(checkedData.onChange, $checked, checkedData.onChangeParams);
			}

			if (mm._isFrame && !mm._isMain) mm.frameResize();

		});

	})();

})();
//> 폼 요소(라디오)

//< 폼 요소(셀렉트)
mm.form.select = (function () {

	var initial = {
		select: {
			onChange: null,
			onChangeParams: [],
			__: {
				_beforeIndex: null,
			},
		},
		option: {
			syncer: null,
			_isSyncerUpdate: true,
			desyncer: null,
			_isDesyncerUpdate: true,
			onSelect: null,
			onSelectParams: [],
		},
	};

	var base = {
		get _dataName() { return 'data-select'; },
		get _optionDataName() { return 'data-option'; },
		checkOption: function (__$option) {

			if (!__$option || !__$option.hasAttribute(base._optionDataName)) return;

			var $select = __$option.closest(mm.selector(base._dataName, '[]'));
			var data = mm.data.get(__$option, base._optionDataName);
			if (mm.is.empty(data)) data = mm.data.set(__$option, base._optionDataName, { initial: initial.option });

			mm.changeSyncer(__$option, __$option.selected, base._optionDataName);

			if (__$option.index === $select.selectedIndex) mm.apply(data.onSelect, __$option, data.onSelectParams);

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'update change', function (__e) {

			var $select = this;
			if ($select.selectedIndex < 0) return;

			var data = mm.data.get($select, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($select, base._dataName, { initial: initial.select });

			$select.nextElementSibling.textContent = $select.options[$select.selectedIndex].text;

			if (Number.isFinite(data.__._beforeIndex)) base.checkOption($select.options[data.__._beforeIndex]);
			else {
				_.forEach($select.options, function (__$option) {

					if (__$option.index !== $select.selectedIndex) base.checkOption(__$option);

				});
			}

			if ($select.selectedIndex > -1) {
				base.checkOption($select.options[$select.selectedIndex]);
				data.__._beforeIndex = $select.selectedIndex;
			}

			mm.apply(data.onChange, $select, data.onChangeParams);

			if (mm._isFrame && !mm._isMain) mm.frameResize();

		});

	})();

})();
//> 폼 요소(셀렉트)

//< 폼 요소(파일)
mm.form.file = (function () {

	var initial = {
		file: {
			_classOn: '__file-on',
			_fileName: null,
			_fileSize: null,
			_default: null,
			onChange: null,
			onChangeParams: [],
			onCancel: null,
			onCancelParams: [],
			onError: null,
			onErrorParams: [],
			file: {},
			__: {
				clone: null,
			},
		},
		image: {
			_classOn: '__image-on',
			_fileName: null,
			_fileSize: null,
			_orientation: null,
			_imageRatio: null,
			_imageSize: 'fit',
			_imagePosition: 'center center',
			_imageBgColor: '#fff',
			_default: null,
			onChange: null,
			onChangeParams: [],
			onCancel: null,
			onCancelParams: [],
			onError: null,
			onErrorParams: [],
			file: {},
			__: {
				clone: null,
				$canvas: null,
			}
		},
	};

	var base = {
		get _dataName() { return 'data-file'; },
		get _classFull() { return '__image-full'; },
		get _classFit() { return '__image-fit'; },
		initial: function (__$file) {

			if (__$file.closest('.mm_form-image')) return initial.image;
			else return initial.file;

		},
		check: function (__$file) {

			var data = mm.data.get(__$file, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$file, base._dataName, { initial: base.initial(__$file) });

			var _accept = __$file.getAttribute('accept');
			if (_accept && _accept.includes('.')) {
				var accepts = _accept.split(',');
				var _isAccept = _.some(accepts, function (__accept) {

					return data.file.name.toLowerCase().endsWith(__accept.trim().toLowerCase());

				});

				if (!_isAccept) {
					base.error(__$file, mm.string.template('${EXTENSION} 확장자의 파일만<br>등록할 수 있습니다.', { EXTENSION: _accept }));
					return;
				}
			}

			if (data._fileName && !data.file.name.endsWith(data._fileName, data.file.name.lastIndexOf('.'))) {
				base.error(__$file, mm.string.template('${NAME} 이름의 파일만<br>등록할 수 있습니다.', { NAME: data._fileName }));
				return;
			}

			if (data._fileSize && data.file.size > data._fileSize * 1024) {
				var _size = data._fileSize / 1000;
				_size = (_size < 1) ? mm.number.unit(data._fileSize, 'kb') : mm.number.unit(_size, 'mb');
				base.error(__$file, mm.string.template('${SIZE}까지 등록할 수 있습니다.', { SIZE: mm.number.comma(_size) }));
				return;
			}

			base.load(__$file, base.set);

		},
		set: function (__$file) {

			var data = mm.data.get(__$file, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$file, base._dataName, { initial: base.initial(__$file) });

			var $ui = __$file.closest('.mm_form-file, .mm_form-image');
			if (mm.is.empty(data.file)) $ui.classList.remove(data._classOn);
			else $ui.classList.add(data._classOn);

			base.preview(__$file);

			mm.apply(data.onChange, __$file, data.onChangeParams);

		},
		load: function (__$file, __callback) {

			var data = mm.data.get(__$file, base._dataName);

			if (__$file.closest('.mm_form-image')) {
				var target = (data.file.type) ? data.originFile : data.file.result;
				var config = {
					orientation: true,
					canvas: true,
					crossOrigin: 'Anonymous',
					imageSmoothingQuality: 'high',
				}

				loadImage(target, function (__$canvas, __meta) {

					if (__$canvas.type === 'error') {
						if (typeof(target) === 'string') {
							var $preview = mm.find('.mm_form-image-preview', __$file.closest('.mm_form-image'))[0];
							mm.image.none($preview);

							mm.apply(data.onError, __$file, data.onErrorParams);
						}
						else base.error(__$file, '이미지만 등록할 수 있습니다.');
						return;
					}

					switch (data._orientation) {
						case 'landscape':
							if (__$canvas.width <= __$canvas.height) {
								base.error(__$file, '가로형 이미지만 등록할 수 있습니다.');
								return;
							}
							break;
						case 'portrait':
							if (__$canvas.width >= __$canvas.height) {
								base.error(__$file, '세로형 이미지만 등록할 수 있습니다.');
								return;
							}
							break;
						case 'square':
							if (__$canvas.width !== __$canvas.height) {
								base.error(__$file, '정방형 이미지만 등록할 수 있습니다.');
								return;
							}
							break;
					}

					data.file.type = (function (__name) {

						var _extension = _.last(__name.split('?')[0].split('.'));
						switch (_extension) {
							case 'jpg':
							case 'jpeg':
								return 'image/jpeg';
							case 'png':
								return 'image/png';
							case 'gif':
								return 'image/gif';
							case 'svg':
								return 'image/svg+xmll';
							default:
								return 'image/jpeg';
						}

					})(data.file.name);

					data.file.result = __$canvas.toDataURL(data.file.type, 0.95);
					data.file.width = __$canvas.width;
					data.file.height = __$canvas.height;
					data.file.orientation = (!__meta.exif) ? 1 : __meta.exif.get('Orientation');
					data.__.$canvas = __$canvas;

					delete data.originFile;

					mm.apply(__callback, __$file, [__$file, __$canvas]);

				}, config);
			}
			else {
				var target = (data.file.type) ? data.file : data.file.result;
				var reader = new FileReader();
				reader.onload = function (__e) {

					data.file.result = reader.result;

					mm.apply(__callback, __$file, [__$file, __e]);

				}
				reader.onerror = function (__e) {

					base.error(__$file, '파일을 불러올 수 없습니다.');

				}
				reader.readAsDataURL(target);
			}

		},
		error: function (__$file, __alert) {

			base.clear(__$file);
			mm.bom.alert(__alert);

			var data = mm.data.get(__$file, base._dataName);
			data.file = data.__.clone;
			data.__.clone = null;

			mm.apply(data.onError, __$file, data.onErrorParams);

		},
		clear: function (__$file, __isSet) {

			var data = mm.data.get(__$file, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$file, base._dataName, { initial: base.initial(__$file) });
			data.file = {};

			if (mm.is.ie('ie9over')) {
				__$file.type = 'text';
				__$file.type = 'file';
			}
			else __$file.value = '';

			if (__isSet === true) base.set(__$file);

		},
		preview: function (__$file) {

			var data = mm.data.get(__$file, base._dataName);

			var $ui = __$file.closest('.mm_form-image');
			if ($ui) {
				var $preview = mm.find('.mm_form-image-preview', $ui)[0];
				if (!$preview) return;

				mm.element.style($ui, { 'width': '' });
				mm.class.remove($ui, [base._classFit, base._classFull]);
				$preview.innerHTML = '';
				$preview.classList.remove('mm_image-none');
				if (mm.is.empty(data.file)) return;

				if (data.__.$canvas) base.appendImage(__$file, data.__.$canvas);
				else base.load(__$file, base.appendImage);
			}
			else {
				var $preview = mm.find('.text_path', __$file.closest('.mm_form-file'))[0];
				if (!$preview) return;

				$preview.innerHTML = '';
				if (mm.is.empty(data.file)) return;

				$preview.textContent = data.file.name;
			}

		},
		appendImage: function (__$file, __$canvas) {

			var data = mm.data.get(__$file, base._dataName);
			var $ui = __$file.closest('.mm_form-image');
			var $preview = mm.find('.mm_form-image-preview', $ui)[0];

			if (typeof(data._imageRatio === 'string')) data._imageRatio = new Function(mm.string.template('return ${RATIO}', { RATIO: data._imageRatio }))();
			if (Number.isFinite(data._imageRatio)) {
				data._imageSize = 'cover';
				$ui.classList.add('__image-ratio');
				mm.element.style($preview, { 'padding-top': mm.number.unit(1 / data._imageRatio * 100, '%') });
			}

			var positions = data._imagePosition.split(' ');
			var _ratio = __$canvas.width / __$canvas.height;
			var _viewRatio = $preview.offsetWidth / $preview.offsetHeight;

			var context = __$canvas.getContext('2d');
			var $viewCanvas = document.createElement('canvas');
			var viewContext = $viewCanvas.getContext('2d');

			$viewCanvas.width = __$canvas.width;
			$viewCanvas.height = __$canvas.height;
			viewContext.drawImage(__$canvas, 0, 0);

			switch (data._imageSize) {
				case 'fit':
					var ratios = { x: __$canvas.width / $preview.offsetWidth, y: __$canvas.height / $preview.offsetHeight };
					__$canvas.width = __$canvas.width / Math.max(ratios.x, ratios.y);
					__$canvas.height = __$canvas.height / Math.max(ratios.x, ratios.y);
					$ui.classList.add(base._classFit);
					break;
				case 'full':
					mm.element.style($ui, { 'width': mm.number.unit(__$canvas.width) });
					$ui.classList.add(base._classFull);
					break;
				case 'contain':
					if (_ratio < _viewRatio) $viewCanvas.width = $viewCanvas.height * _viewRatio;
					else $viewCanvas.height = $viewCanvas.width / _viewRatio;

					var _x = (positions[0] === 'left') ? 0 : (positions[0] === 'right') ? $viewCanvas.width - __$canvas.width : ($viewCanvas.width - __$canvas.width) / 2;
					var _y = (positions[1] === 'top') ? 0 : (positions[1] === 'bottom') ? $viewCanvas.height - __$canvas.height : ($viewCanvas.height - __$canvas.height) / 2;
					viewContext.fillStyle = data._imageBgColor;
					viewContext.fillRect(0, 0, $viewCanvas.width, $viewCanvas.height);
					viewContext.drawImage(__$canvas, _x, _y, __$canvas.width, __$canvas.height);

					__$canvas.width = $preview.offsetWidth;
					__$canvas.height = $preview.offsetHeight;
					break;
				case 'cover':
					if (_ratio > _viewRatio) $viewCanvas.width = $viewCanvas.height * _viewRatio;
					else $viewCanvas.height = $viewCanvas.width / _viewRatio;

					var _x = (positions[0] === 'left') ? 0 : (positions[0] === 'right') ? $viewCanvas.width - __$canvas.width : ($viewCanvas.width - __$canvas.width) / 2;
					var _y = (positions[1] === 'top') ? 0 : (positions[1] === 'bottom') ? $viewCanvas.height - __$canvas.height : ($viewCanvas.height - __$canvas.height) / 2;
					viewContext.drawImage(__$canvas, _x, _y);

					__$canvas.width = $preview.offsetWidth;
					__$canvas.height = $preview.offsetHeight;
					break;
			}

			data.file.view = {
				result: $viewCanvas.toDataURL(data.file.type, 0.95),
				width: $viewCanvas.width,
				height: $viewCanvas.height
			}
			$viewCanvas.remove();

			context.imageSmoothingQuality = 'high';
			context.drawImage($viewCanvas, 0, 0, __$canvas.width, __$canvas.height);

			$preview.append(__$canvas);

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'update change click', function (__e) {

			var $file = this;
			var data = mm.data.get($file, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($file, base._dataName, { initial: base.initial($file) });

			mm.form.lift($file);

			switch (__e.type) {
				case 'click':
					data.__.clone = $file.cloneNode();
					break;
				case 'update':
					data.__.clone = null;
					if (!mm.is.display($file) || !mm.is.empty(data.file)) return;

					data.file = {};

					if (data._default) {
						data.file.name = data._default;
						data.file.result = data._default;
						delete data._default;
						base.set($file);
					}
					break;
				case 'change':
					if ($file.files.length > 0) {
						data.__.clone = data.file;

						if ($file.closest('.mm_form-image')) {
							data.originFile = $file.files[0];
							data.file = {};
							for (var __key in data.originFile) {
								data.file[__key] = data.originFile[__key];
							}
						}
						else data.file = $file.files[0];

						base.check($file);
					}
					else {
						$file.replaceWith(data.__.clone);
						$file = data.__.clone;

						var replaceData = mm.data.set($file, base._dataName, { initial: base.initial($file) });
						_.forEach(data, function (__value, __key) {

							replaceData[__key] = __value;

						});

						data.__.clone = null;

						mm.apply(data.onCancel, $file, data.onCancelParams);
					}
					break;
			}

		});

		mm.delegate.on(document, '.btn_remove-file', 'click', function (__e) {

			__e.preventDefault();

			var $file = mm.find(base._dataName, this.closest('.mm_form-file, .mm_form-image'))[0];
			if (!$file || $file.readOnly || $file.disabled) return;

			base.clear($file, true);

		});

	})();

	return {
		// 파일 데이터
		getData: function (__element) {

			var $element = mm.ui.element(base._dataName, __element)[0];
			if (!$element) return null;

			var data = mm.data.get($element, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($element, base._dataName, { initial: base.initial($element) });

			return data;

		},
		// 파일 내용 삭제
		clear: function (__elements, __isSet) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.clear(__$el, __isSet);

			});

		},
		// 파일 확인
		check: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.check(__$el);

			});

		},
		// 파일 적용
		set: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.set(__$el);

			});

		},
	};

})();
//> 폼 요소(파일)

//< 폼 요소(멀티 파일)
mm.form.multiple = (function () {

	var initial = {
		_isMax: false,
		_isAuto: true,
		_max: 9,
		_isDrop: false,
		defaults: [],
		__: {
			_appendHTML: null,
		},
	};

	var base = {
		get _dataName() { return 'data-multiple'; },
		append: function (__$multiple, __total) {

			var _total = (Number.isFinite(__total)) ? __total : 1;
			if (_total < 1) return [];

			var data = mm.data.get(__$multiple, base._dataName);
			var $list = mm.find('> ul', __$multiple.closest('.mm_form-multiple'))[0];
			var $files = [];

			while ($files.length < _total) {
				var $item = mm.element.create(data.__._appendHTML)[0];
				$list.append($item);

				$files.push(mm.find('data-file', $item)[0]);
			}

			base.convert(__$multiple, $files);
			return $files;

		},
		convert: function (__$multiple, __$files) {

			var data = mm.data.get(__$multiple, base._dataName);

			_.forEach(__$files, function (__$file) {

				var fileData = mm.form.file.getData(__$file);
				var onFileChange = fileData.onChange;
				var onFileChangeParams = fileData.onChangeParams;

				fileData.onChange = function () {

					mm.apply(onFileChange, __$file, onFileChangeParams);
					base.checkLast(__$multiple);

				}

				if (data._isMax === true && data._isAuto === false) return;

				var $btnRemove = mm.find('.btn_remove-file', __$file.closest('.mm_form-file, .mm_form-image'))[0];
				mm.event.on($btnRemove, 'click', function btnRemoveInlineHandler(__e) {

					__e.preventDefault();
					__e.stopPropagation();

					this.closest('li').remove();
					base.checkLast(__$multiple);

				}, { _isOnce: true, _isOverwrite: true });

			});

			base.checkButton(__$multiple);

		},
		checkButton: function (__$multiple) {

			var $ui = __$multiple.closest('.mm_form-multiple');

			if (mm.find('.__image-on', $ui).length > 1) mm.element.show(mm.find('.btn_remove-all, .mm_form-multiple-sortable', $ui));
			else mm.element.hide(mm.find('.btn_remove-all, .mm_form-multiple-sortable', $ui));

		},
		checkLast: function (__$multiple) {

			base.checkButton(__$multiple);

			var data = mm.data.get(__$multiple, base._dataName);
			if (data._isAuto !== true) return;

			var $files = mm.find('data-file', __$multiple.closest('.mm_form-multiple'));
			var lastData = ($files.length > 0) ? mm.form.file.getData(_.last($files)) : null;

			if ($files.length < data._max && (data._isMax === true || !lastData || !mm.is.empty(lastData.file))) base.append(__$multiple);

		},
		exceed: function (__max) {

			mm.bom.alert(mm.string.template('파일은 최대 ${MAX}개까지 추가할 수 있습니다.', { MAX: __max }));

		},
		change: function (__$multiple, __files) {

			var data = mm.data.get(__$multiple, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set(__$multiple, base._dataName, { initial: initial });

			var $ui = __$multiple.closest('.mm_form-multiple');

			var $files = mm.find('data-file', $ui);
			var $emptyFiles = _.filter($files, function (__$file) {

				var fileData = mm.form.file.getData(__$file);
				return mm.is.empty(fileData.file);

			});

			var _fileTotal = $files.length + __files.length - $emptyFiles.length;
			var _appendTotal = __files.length - $emptyFiles.length;
			if (_fileTotal > data._max) {
				_appendTotal -= _fileTotal - data._max;
				base.exceed(data._max);
			}

			$emptyFiles = $emptyFiles.concat(base.append(__$multiple, _appendTotal));

			_.forEach($emptyFiles, function (__$empty, __index) {

				var emptyData = mm.form.file.getData(__$empty);

				if (__$empty.closest('.mm_form-image')) {
					emptyData.originFile = __files[__index];
					emptyData.file = {};
					for (var __key in emptyData.originFile) {
						emptyData.file[__key] = emptyData.originFile[__key];
					}
				}
				else emptyData.file = __files[__index];

				if (!mm.is.empty(emptyData.file)) mm.form.file.check(__$empty);

			});

		},
		remove: function (__$multiple) {

			var data = mm.data.get(__$multiple, base._dataName);
			var $ui = __$multiple.closest('.mm_form-multiple');

			if (data._isMax === true) mm.form.file.clear(mm.find('data-file', $ui), true);
			else {
				mm.element.remove(mm.find('li', $ui));
				base.checkLast(__$multiple);
			}

		},
	};

	(function () {

		mm.delegate.on(document, mm.selector(base._dataName, '[]'), 'update change click', function (__e) {

			var $multiple = this;
			var data = mm.data.get($multiple, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($multiple, base._dataName, { initial: initial });

			var $ui = $multiple.closest('.mm_form-multiple');

			switch (__e.type) {
				case 'click':
					if (mm.is.ie('ie9over')) {
						$multiple.type = 'text';
						$multiple.type = 'file';
					}
					else $multiple.value = '';
					break;
				case 'update':
					if (!mm.is.display($multiple)) return;

					var _isInit = (!data.__._appendHTML) ? true : false;
					if (_isInit) data.__._appendHTML = mm.find('> ul > li', $ui)[0].outerHTML;

					var $files = mm.find('data-file', $ui);
					base.convert($multiple, $files);

					var $appends = [];

					if (_isInit && Array.isArray(data.defaults) && data.defaults.length > 0) {
						if ($files.length < data.defaults.length) $appends = base.append($multiple, data.defaults.length - $files.length);

						$files = Object.values($files).concat($appends);
						_.forEach($files, function (__$file, __index) {

							var fileData = mm.form.file.getData(__$file);
							fileData.file.name = data.defaults[__index];
							fileData.file.result = data.defaults[__index];
							mm.form.file.set(__$file);

						});
					}

					if (data._isMax === true && $files.length < data._max) $appends = base.append($multiple, data._max - $files.length);
					break;
				case 'change':
					if ($multiple.files.length === 0) return;

					base.change($multiple, $multiple.files);
					break;
			}

		});

		mm.delegate.on(document, '.mm_form-multiple .btn_remove-all', 'click', function (__e) {

			__e.preventDefault();

			base.remove(mm.find(base._dataName, this.closest('.mm_form-multiple'))[0]);

		});

		mm.delegate.on(document, '.mm_form-multiple', 'dragover dragenter dragleave dragend drop', function (__e) {

			__e.preventDefault();
			__e.stopPropagation();

			var $ui = this;
			var $multiple = mm.find(base._dataName, $ui)[0];
			if (!$multiple) return;

			var data = mm.data.get($multiple, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($multiple, base._dataName, { initial: initial });
			if (data._isDrop !== true) return;

			switch (__e.type) {
				case 'drop':
					if (__e.dataTransfer.files.length === 0) return;// 선택 취소

					base.change($multiple, __e.dataTransfer.files);
					break;
			}

		});

		mm.delegate.on(document, '.mm_form-multiple [class*=btn_sort]', 'click', function (__e) {

			var $ui = this.closest('.mm_form-multiple');
			var $fileList = mm.find('> ul', $ui)[0];
			var $multiple = mm.find(base._dataName, $ui)[0];
			var data = mm.data.get($multiple, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($multiple, base._dataName, { initial: initial });

			if (this.classList.contains('btn_sort')) {
				$ui.classList.add('__multiple-sortable');
				mm.element.append(mm.find('.mm_form-image', $fileList), '<i class="mco_file-sortable"></i>');

				if (!data._isMax && data._isAuto) {
					var $reject = mm.closest(_.filter(mm.find('.mm_form-image', $ui), function (__$item) { return !__$item.classList.contains('__image-on'); }), 'li');
					mm.element.hide($reject);
				}

				data.Sortable = Sortable.create($fileList, { forceFallback: true });
				_.forEach(mm.find('li', $fileList), function (__$item, __index){

					mm.data.get(__$item)._sortIndex = __index;

				});
			}
			else {
				if (this.classList.contains('btn_sort-cancel')) {
					var $fileItems = _.sortBy(mm.find('li', $fileList), [function (__$item) { return mm.data.get(__$item)._sortIndex; }]);
					mm.element.append($fileList, $fileItems);
				}
				else if (this.classList.contains('btn_sort-apply')) {
					//
				}

				$ui.classList.remove('__multiple-sortable');
				mm.element.remove(mm.find('.mm_form-image .mco_file-sortable', $fileList));

				data.Sortable.destroy();
				delete data.Sortable;

				if (!data._isMax && data._isAuto) mm.element.show(mm.closest(mm.find('.mm_form-image', $ui), 'li'));
			}

		});

	})();

	return {
		// 파일 요소 추가
		append: function (__elements, __total) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });

				var $files = mm.find('data-file', __$el.closest('.mm_form-multiple'));
				if ($files.length < data._max) base.append(__$el);
				else base.exceed(data._max);

			});

		},
		// 파일 요소 전체 삭제
		remove: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);

			_.forEach($elements, function (__$el) {

				base.remove(__$el);

			});

		},
	};

})();
//> 폼 요소(멀티 파일)

//< 브라우저 팝업
mm.bom = (function () {

	var base = {
		$bom: null,
		get _classOn() { return '__bom-on'; },
		appendBom: function () {

			base.$bom = mm.element.create(mm.string.template([
				// '<!-- 브라우저 팝업 -->',
				'<div class="mm_bom">',
				'	<div class="mm_bom-dim"></div>',
				'	<div class="mm_bom-items"></div>',
				'</div>',
				// '<!--// 브라우저 팝업 -->',
			]))[0];
			mm.find('.mm_app')[0].append(base.$bom);

		},
		removeBom: function () {

			base.$bom.remove();
			base.$bom = null;

		},
		resizeBom: function (__$bomItem) {

			var $container = (__$bomItem) ? mm.find('> .mm_bom-item-inner', __$bomItem)[0] : mm.find('.mm_bom-item.__bom-on > .mm_bom-item-inner', base.$bom)[0];
			var containerStyle = mm.element.style($container, { 'height': '' });

			mm.element.style($container, { 'height': (function () {

					var _value = parseFloat(containerStyle.height);
					if (mm.is.odd(_value)) _value += 1;

					return mm.number.unit(_value);

				})(),
			});

		},
		appendItem: function (__text, __title, __buttons) {

			if (!base.$bom) base.appendBom();

			var $items = mm.find('.mm_bom-item', base.$bom);
			mm.class.remove($items, base._classOn);

			if ($items.length === 0) mm.scroll.off();
			document.documentElement.classList.add('__bom');

			var _text = (typeof(__text) === 'number') ? __text.toString() : __text;
			var $bomItem = mm.element.create(mm.string.template([
				'<div class="mm_bom-item">',
				'	<div class="mm_bom-item-inner">',
				'		<i class="mco_bom-alert"></i>',
				'		<div class="mm_box">',
				'			<div class="mm_bom-item-text">',
				'				<h2>${TITLE}</h2>',
				'				<p>${TEXT}</p>',
				'			</div>',
				'			<div class="mm_bom-item-btnbox">',
				'				<ul class="mm_flex __flex_equal__">',
				'					<li><button type="button" class="btn_no"><b>${CANCEL}</b></button></li>',
				'					<li><button type="button" class="btn_ok"><b>${OK}</b></button></li>',
				'				</ul>',
				'			</div>',
				'		</div>',
				'	</div>',
				'</div>',
			], { TITLE: __title, TEXT: _text.replace(/\n/ig, '<br>'), CANCEL: __buttons[1] || '취소', OK: __buttons[0] || '확인' }))[0];

			var $bomItemText = mm.find('.mm_bom-item-text', $bomItem)[0];
			if (__title.replace(/\<br\>/g, '').trim().length === 0) mm.find('h2', $bomItemText)[0].remove();
			if (_text.replace(/\<br\>/g, '').trim().length === 0) mm.find('p', $bomItemText)[0].remove();
			if ($bomItemText.children.length === 0) $bomItemText.remove();

			mm.find('.mm_bom-items', base.$bom)[0].append($bomItem);
			base.resizeBom($bomItem);

			mm.delay.on(mm.class.add, { params: [$bomItem, base._classOn] });
			mm.delay.on(mm.focus.in, { _time: mm.time._faster, _isSec: true, _name: 'DELAY_FOCUS_BOM', _isOverwrite: true, params: [mm.find('.btn_ok', $bomItem)[0]] });

			return $bomItem;

		},
		closeItem: function (__callback, __params, __isClose) {

			var $items = mm.find('.mm_bom-item', base.$bom);
			if ($items.length === 0) return;

			var $lastItem = _.last($items);

			if (__isClose !== false) {
				mm.event.on($lastItem, 'transitionEnd webkitTransitionEnd MSTransitionEnd', function (__e) {

					mm.event.off($lastItem, 'transitionEnd webkitTransitionEnd MSTransitionEnd');
					$lastItem.remove();

					if ($items.length === 0) {
						base.removeBom();
						mm.scroll.on();
					}

				});

				mm.event.off(mm.find('.btn_ok, .btn_no', $lastItem), 'click');

				$lastItem.classList.remove(base._classOn);

				if ($items.length > 1) {
					var $prevItem = $lastItem.previousElementSibling;
					$prevItem.classList.add(base._classOn);
					mm.focus.in(mm.find('.btn_ok', $prevItem));
				}
				else {
					document.documentElement.classList.remove('__bom');
				}
			}

			mm.apply(__callback, window, __params);

		},
	};

	return {
		//- 얼럿
		alert: function (__text, __callback, __option) {

			if (!['string', 'number'].includes(typeof(__text))) return;
			if (frameElement) return mm.apply('mm.bom.alert', top, arguments);

			var option = mm.extend({
				_isClose: true,
				_title: '알림',
				buttons: [],
				params: [],
			}, __option);
			var $bomItem = base.appendItem(__text, option._title, option.buttons);

			mm.find('.btn_no', $bomItem)[0].closest('li').remove();
			mm.event.on(mm.find('.btn_ok', $bomItem), 'click', function (__e) {

				__e.preventDefault();

				base.closeItem(__callback, option.params, option._isClose);

			}, { _isOnce: option._isClose });

		},
		//- 컨펌
		confirm: function (__text, __callback, __option) {

			if (!['string', 'number'].includes(typeof(__text))) return;
			if (frameElement) return mm.apply('mm.bom.confirm', top, arguments);

			var option = mm.extend({
				_isClose: true,
				_title: '확인',
				buttons: [],
				params: [],
			}, __option);
			var $bomItem = base.appendItem(__text, option._title, option.buttons);

			mm.event.on(mm.find('.btn_ok, .btn_no', $bomItem), 'click', function (__e) {

				__e.preventDefault();

				base.closeItem(__callback, [this.classList.contains('btn_ok')].concat(option.params), option._isClose);

			}, { _isOnce: option._isClose });

		},
		//- 프롬프트
		prompt: function (__text, __callback, __option) {

			if (!['string', 'number'].includes(typeof(__text))) return;
			if (frameElement) return mm.apply('mm.bom.prompt', top, arguments);

			var option = mm.extend({
				_isClose: true,
				_title: '입력',
				buttons: [],
				params: [],
				forms: [{ _type: 'text', _placeholder: '입력' }],
			}, __option);
			var $bomItem = base.appendItem(__text, option._title, option.buttons);
			var $itemForm = mm.element.create('<ul class="mm_bom-item-form"></ul>')[0];

			mm.element.before(mm.find('.mm_bom-item-btnbox', $bomItem)[0], $itemForm);

			_.forEach(option.forms, function (__form) {

				var $form;
				var $li = mm.element.create('<li></li>')[0];
				$itemForm.append($li);

				switch (__form._type) {
					case 'select':
						if (mm.is.empty(__form.options)) return;

						var $item = mm.element.create(mm.string.template([
							'<div class="mm_form-select">',
							'	<label>',
							'		<select data-select></select>',
							'		<b class="text_selected"></b>',
							'		<i class="mco_form-select"></i>',
							'	</label>',
							'</div>',
						]))[0];
						$li.append($item);

						$form = mm.find('data-select', $item)[0];

						_.forEach(__form.options, function (__option) {

							mm.element.append($form, mm.string.template('<option value="${VALUE}">${TEXT}</option>', { VALUE: __option._value, TEXT: __option._text }));

						});
						break;
					default:
						var _isDate = ['date', 'month', 'time'].includes(__form._type);
						if (!mm.is.mobile() && !['textarea', 'password'].includes(__form._type)) __form._type = 'text';

						var itemTemplate = (__form._type === 'textarea') ? { CLASS: 'mm_form-textarea', FORM: '<textarea class="textfield" data-text></textarea>' } : { CLASS: 'mm_form-text', FORM: mm.string.template('<input type="${TYPE}" class="textfield" data-text>', { TYPE: __form._type }) };
						itemTemplate.PLACEHOLDER = (typeof(__form._placeholder) === 'string') ? __form._placeholder : (!_isDate) ? '입력' : (__form._type === 'time') ? '시간' : '날짜';

						var $item = mm.element.create(mm.string.template([
							'<div class="${CLASS}">',
							'	<button type="button" class="btn_text-clear"><i class="mco_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
							'	<label>',
							'		${FORM}<i class="bg_text"></i>',
							'		<span class="text_placeholder">${PLACEHOLDER}</span>',
							'	</label>',
							'</div>',
						], itemTemplate))[0];
						$li.append($item);

						$form = mm.find('data-text', $item)[0];

						if (__form._type === 'password') mm.element.before(mm.find('.btn_text-clear', $item), '<button type="button" class="btn_text-pw"><i class="mco_pw-hide"></i><b class="mm_ir-blind">비밀번호 보기</b></button>');

						if (_isDate) {
							if (!mm.is.empty(__form._format)) mm.element.attribute($form, { 'data-text': { _format: __form._format } });
							if (mm.is.mobile()) mm.element.before($form, '<span class="textfield text_date"></span>');
							else if (mm.datepicker) {
								$item.classList.add('__text_calendar__');
								$form.setAttribute('data-datepicker', '');
								mm.element.append($form.closest('label'), '<i class="mco_datepicker-calendar"></i>');
								if (!mm.is.empty(__form._format)) mm.element.attribute($form, { 'data-datepicker': { _format: __form._format } });
							}
						}
				}

				if (mm.is.object(__form.attribute)) {
					_.forEach(__form.attribute, function (__value, __key) {

						if (__key === 'class') {
							var classes = __value.split(' ');
							_.forEach(classes, function (__class) {

								$form.classList.add(__class);

							});
						}
						else $form.setAttribute(__key, __value);

					});
				}

				if (!mm.is.empty(__form._value)) $form.value = __form._value;

			});
			mm.form.update($itemForm);

			base.resizeBom($bomItem);

			mm.event.on(mm.find('.btn_ok, .btn_no', $bomItem), 'click', function (__e) {

				__e.preventDefault();

				var $forms = mm.find(mm.selector(['data-text', 'data-select'], '[]'), $itemForm);
				base.closeItem(__callback, [this.classList.contains('btn_ok'), _.map($forms, 'value')].concat(option.params), option._isClose);

			}, { _isOnce: option._isClose });

		},
		//- 닫기
		close: function (__callback, __params) {

			if (frameElement) return mm.apply('mm.bom.close', top, arguments);

			base.closeItem(__callback, __params);

		},
	};

})();
//> 브라우저 팝업

//< 페이지 팝업
mm.popup = (function () {

	var base = {
		$popup: null,
		_isReady: true,
		waits: [],
		get _classOn() { return '__popup-on'; },
		get _classOld() { return '__popup-old'; },
		get opener() {

			if (mm._isPopup) return window.opener;

			var $openEl = base.openEl;
			var $openDoc = ($openEl) ? $openEl.ownerDocument : document;
			if (!$openDoc) $openDoc = ($openEl.document) ? $openEl.document : $openEl;

			return $openDoc.defaultView;

		},
		get openEl() {

			if (mm._isPopup) return window.opener;

			var $popupItem = mm.find(mm.selector(base._classOn, '.'), base.$popup)[0];
			var data = mm.data.get($popupItem, 'popup');

			return (data) ? data.openEl : null;

		},
		closeItem: function (__option) {

			if (mm._isPopup) {
				if (!base.opener) mm.link('/', { _isReloadStage: true });
				else window.close();
				return;
			}

			var option = mm.extend({
				_historyDiff: 0,
				_isHistoryBack: false,
				onClose: null,
				onCloseParams: [],
			}, __option);
			var state = mm.history.state;

			if (!option._isHistoryBack) {
				var session = mm.history.session;
				var _backCount = state._keepIndex + session.page.changes.length + option._historyDiff + 1;

				mm.history.back(_backCount);
			}
			else {
				var $items = mm.find('.mm_popup-item', base.$popup);
				var $popupItem = _.findLast($items, function (__$item) { return mm.class.some(__$item, [base._classOn, base._classOld]); });
				if (!$popupItem) return;

				if ($popupItem.classList.contains('__popup-product')) mm.class.toggle($popupItem, ['__popup-motion-fade', '__popup-motion-left']);

				mm.class.remove($popupItem, [base._classOn, base._classOld]);
				mm.event.on($popupItem, 'transitionEnd webkitTransitionEnd MSTransitionEnd', function (__e) {

					mm.event.off($popupItem, 'transitionEnd webkitTransitionEnd MSTransitionEnd');
					mm.observer.dispatch(mm.event.type.stage_remove);

				});

				if ($items.length > 1) {
					_.forEach($items, function (__$item) {

						var data = mm.data.get(__$item, 'popup');
						if (data._index === state._pageIndex - state._keepIndex) {
							__$item.classList.remove(base._classOld);
							__$item.classList.add(base._classOn);
						}

					});
				}
				else mm.delay.on(base.forceMain, { _isSec: true, _name: 'DELAY_REMOVE_POPUP', _isOverwrite: true });
			}

			mm.apply(option.onClose, window, option.onCloseParams);

		},
		forceMain: function () {

			if (mm.find('.mm_popup-item', base.$popup).length > 1) return;

			mm.history.replace(null, mm._homeUrl);
			top.location.reload();

		},
	};

	return {
		//- 팝업열기
		open: function (__url, __option) {

			if (!__url) return;
			if (frameElement) return mm.apply('mm.popup.open', top, arguments);

			if (!base._isReady) return base.waits.push([__url, __option]);
			base._isReady = false;

			mm.modal.close();

			var option = mm.extend({
				openEl: null,
				focusEl: null,
				_frameId: null,
				_frameName: null,
				_frameTitle: null,
				_isCloseBefore: false,
				_isHistoryBack: false,
				_isHistorySave: true,
				onReady: null,
				onReadyParams: [],
			}, __option);

			if (option._isCloseBefore) {
				mm.storage.set('session', 'isCancelPopstate', true);
				base.closeItem();
			}

			mm.delay.off('DELAY_REMOVE_POPUP');
			mm.loading.show();

			mm.delay.on(base.forceMain, { _time: 5, _isSec: true, _name: 'DELAY_LINK_MAIN', _isOverwrite: true });

			if (!base.$popup) {
				base.$popup = mm.element.create(mm.string.template([
					// '<!-- 페이지 팝업 -->',
					'<div class="mm_popup">',
					'	<div class="mm_popup-dim"></div>',
					'	<div class="mm_popup-items"></div>',
					'</div>',
					// '<!--// 페이지 팝업 -->',
				]))[0];
				mm.find('.mm_app')[0].append(base.$popup);
			};

			document.documentElement.classList.add('__popup');

			var $items = mm.find('.mm_popup-item', base.$popup);
			mm.class.remove($items, base._classOn);
			mm.class.add($items, base._classOld);

			var $popupItem = mm.element.create(mm.string.template([
				'<div class="mm_popup-item">',
				'	<button type="button" class="btn_popup-close" onclick="mm.popup.close();">',
				'		<i class="mco_popup-close"></i>',
				'		<b class="mm_ir-blind">팝업닫기</b>',
				'	</button>',
				'	<iframe scrolling="no" onload="mm.popup.onload(this);"></iframe>',
				'</div>',
			]))[0];
			var $iframe = mm.find('iframe', $popupItem)[0];

			mm.observer.on($popupItem, mm.event.type.frame_ready, function (__e) {

				if ($items.length === 0 || option._isHistoryBack) $popupItem.classList.add('__popup-nomotion');

				var session = mm.history.session;
				var sessionPage = session.page;
				var $frameWindow = __e.detail.this;
				var _isTypeLink = sessionPage._pageType === 'keep';

				if ($frameWindow.mm._isMain) {
					sessionPage._pageType = 'main';
					$popupItem.classList.add('__popup-motion-none');
				}
				else if ($frameWindow.mm._isSide) {
					sessionPage._pageType = 'side';
					$popupItem.classList.add('__popup-motion-right');
				}
				else if ($frameWindow.mm._isPopup) {
					sessionPage._pageType = 'popup';
					$popupItem.classList.add('__popup-motion-up');
				}
				else if ($frameWindow.mm._isProduct) {
					sessionPage._pageType = 'product';
					mm.class.add($popupItem, ['__popup-motion-fade', '__popup-product']);
				}
				else if ($frameWindow.mm._isSearch) sessionPage._pageType = 'search';
				else sessionPage._pageType = 'sub';

				if (_isTypeLink) sessionPage._pageType = 'keep';
				if ($popupItem.getAttribute('class').indexOf('__popup-motion-') < 0) $popupItem.classList.add('__popup-motion-left');

				mm.history.session = session;
				if (sessionPage._pageType !== 'popup' || mm.find('.btn_popup-close', $iframe)[0]) mm.element.remove(mm.find('.btn_popup-close', $popupItem));

				mm.loading.hide();
				mm.delay.off('DELAY_LINK_MAIN');

				mm.delay.on(function () {

					var $focus = mm.find(mm.data.get($popupItem, 'popup').focusEl, $iframe)[0];
					if (!$focus) $focus = $popupItem;
					mm.delay.on(mm.focus.in, { _time: ($popupItem.classList.contains('__popup-nomotion')) ? 0 : mm.time._base, _isSec: true, _name: 'DELAY_FOCUS_POPUP', _isOverwrite: true, params: [$focus] });

					$popupItem.classList.add(base._classOn);
					mm.delay.on(mm.class.remove, { _time: 100, params: [$popupItem, '__popup-nomotion'] });

					if (option._isHistoryBack) base.closeItem({ _isHistoryBack: true });

					var _isRemoveStage = (sessionPage._pageType === 'side') ? false : (option._isCloseBefore) ? true : !option._isHistoryBack;
					mm.delay.on(mm.observer.dispatch, { _time: (option._isCloseBefore) ? mm.time._base : 0, _isSec: true, params: [mm.event.type.stage_add, { data: { _isRemove: _isRemoveStage } }] });

					base._isReady = true;
					if (base.waits.length > 0) {
						mm.apply(mm.popup.open, window, base.waits[0]);
						base.waits.splice(0, 1);
					}

					mm.apply(option.onReady, $popupItem, option.onReadyParams);

				}, { _time: 50 });

			}, { _isOnce: true });

			mm.delay.on(function () {

				if (option._isHistorySave) mm.history.push({ _isNew: true }, __url);

				mm.data.set($popupItem, 'popup', { initial: { openEl: option.openEl, focusEl: option.focusEl, _index: mm.history.state._pageIndex } });

				var $lastItem = _.last($items);

				if (option._isHistoryBack && $lastItem) mm.element.before($lastItem, $popupItem);
				else mm.find('.mm_popup-items', base.$popup)[0].append($popupItem);

				mm.element.attribute($iframe, { 'id': option._frameId, 'name': option._frameName, 'title': option._frameTitle, 'data-preload': { _src: __url.split('#')[0], onError: 'mm.popup.close' } });
				mm.preload.update($iframe);

			}, { _time: 10 });

			return $popupItem;

		},
		//- 팝업 닫기
		close: function (__option) {

			if (frameElement) {
				mm.apply('mm.popup.close', top, arguments);
				return;
			}

			base.closeItem(__option);

		},
		//- 팝업 아이프레임 로드 완료(세션에 저장)
		onload: function (__frameElement) {

			if (!__frameElement) return;

			var frameLocation = __frameElement.contentWindow.location;
			var _frameUrl = '';

			try {
				_frameUrl = frameLocation.href;
				if (_frameUrl.length < 5 || _frameUrl === 'about:blank') _frameUrl = '';
			}
			catch (__error) {
				_frameUrl = '/external/crossdomain/' + new Date().getTime();
			}
			_frameUrl = _frameUrl.replace(location.origin, '');

			var session = mm.history.session;

			if (_frameUrl.length > 0 && _frameUrl !== __frameElement.src.replace(location.origin, '')) {
				var _changesIndex = session.page.changes.indexOf(_frameUrl);
				if (_changesIndex > 0) session.page.changes.splice(_changesIndex + 1);
				else session.page.changes.push(_frameUrl);

				mm.history.session = session;
			}

		},
		//- 팝업 리사이즈
		resize: function () {

			if (!frameElement && mm._isPopup) {
				var $frameContent = mm.find('.mm_page-content');
				var outerWidth = window.outerWidth - window.innerWidth;
				var outerHeight = window.outerHeight - window.innerHeight;

				window.resizeTo($frameContent.offsetWidth + outerWidth, $frameContent.offsetHeight + outerHeight + mm.find('.mm_header')[0].offsetHeight);
			}

		},
		//- 오프너(window)
		get opener() {

			if (frameElement) return top.mm.popup.opener;
			else return base.opener;

		},
		//- 오픈엘리먼트(element, 팝업 열때 클릭한 요소)
		get openEl() {

			if (frameElement) return top.mm.popup.openEl;
			else return base.openEl;

		},
	};

})();
//> 페이지 팝업

//< 모달 팝업
mm.modal = (function () {

	// UI 고유 객체
	var base = {
		$modal: null,
		get _classOn() { return '__modal-on'; },
		get _classOld() { return '__modal-old'; },
		get opener() {

			if (mm._isModal) return window.opener;

			var $openEl = base.openEl;
			var $openDoc = ($openEl) ? $openEl.ownerDocument : document;
			if (!$openDoc) $openDoc = ($openEl.document) ? $openEl.document : $openEl;

			return $openDoc.defaultView;

		},
		get openEl() {

			if (mm._isModal) return window.opener;

			var $modalItem = mm.find(mm.selector(base._classOn, '.'), base.$modal)[0];
			var data = mm.data.get($modalItem, 'modal');

			return (data) ? data.openEl : null;

		},
		appendModal: function () {

			base.$modal = mm.element.create(mm.string.template([
				// '<!-- 모달 팝업 -->',
				'<div class="mm_modal">',
				'	<div class="mm_modal-items"></div>',
				'</div>',
				// '<!--// 모달 팝업 -->',
			]))[0];
			mm.find('.mm_app')[0].append(base.$modal);

		},
		removeModal: function () {

			base.$modal.remove();
			base.$modal = null;

		},
		resizeModal: function (__option) {

			var option = mm.extend({
				_isEven: true,
				_extraHeight: null,
			}, __option);

			if (mm._isModal) {
				if (!frameElement) {
					var $frameContent = mm.find('.mm_page-content')[0];
					var outerWidth = window.outerWidth - window.innerWidth;
					var outerHeight = window.outerHeight - window.innerHeight;

					window.resizeTo($frameContent.offsetWidth + outerWidth, $frameContent.offsetHeight + outerHeight + mm.find('.mm_header')[0].offsetHeight);;
				}
				else mm.frameResize(null, option);
			}
			else {
				var $frame = top.mm.find(mm.string.template('.${ITEM} iframe', { ITEM: base._classOn }), base.$modal)[0];
				mm.frameResize($frame, option);
			}

		},
	};

	return {
		//- 모달 열기
		open: function (__url, __option) {

			if (!__url) return;
			if (frameElement) return mm.apply('mm.modal.open', top, arguments);

			var option = mm.extend({
				openEl: null,
				_frameId: null,
				_frameName: null,
				_frameTitle: null,
				_isFull: false,
				_isHeader: true,
				_isCloseOutside: false,
				classes: [],
				onReady: null,
				onReadyParams: [],
				onLoad: null,
				onLoadParams: [],
			}, __option);

			if (!base.$modal) base.appendModal();

			var $items = mm.find('.mm_modal-item', base.$modal);
			mm.class.remove($items, base._classOn);
			mm.class.add($items, base._classOld);

			if ($items.length === 0) mm.scroll.off();
			document.documentElement.classList.add('__modal');

			var $modalItem = mm.element.create(mm.string.template([
				'<div class="mm_modal-item">',
				'	<div class="mm_modal-item-dim"></div>',
				'	<div class="mm_modal-item-inner">',
				'		<button type="button" class="btn_modal-close" onclick="mm.modal.close();">',
				'			<i class="mco_modal-close"></i>',
				'			<b class="mm_ir-blind">모달 닫기</b>',
				'		</button>',
				'		<iframe scrolling="no"></iframe>',
				'	</div>',
				'</div>',
			]))[0];

			if (option._isCloseOutside) mm.element.attribute(mm.find('.mm_modal-item-dim', $modalItem), { 'tabindex': 0, 'onclick': 'mm.modal.close();' });
			if (option._isFull) $modalItem.classList.add('__modal-full');
			if (!mm.is.empty(option.classes)) mm.class.add($modalItem, option.classes);

			mm.data.set($modalItem, 'modal', { initial: { openEl: option.openEl} });
			mm.find('.mm_modal-items', base.$modal)[0].append($modalItem);

			mm.observer.on($modalItem, mm.event.type.frame_ready, function (__e) {

				$modalItem.classList.add(base._classOn);

				mm.apply(option.onReady, $modalItem, option.onReadyParams);

			}, { _isOnce: true });

			var $iframe = mm.find('iframe', $modalItem)[0];
			mm.element.attribute($iframe, (function () {

				var attr = { 'data-preload': { _src: __url.split('#')[0] } };
				if (option._frameId) attr.id = option._frameId;
				if (option._frameName) attr.name = option._frameName;
				if (option._frameTitle) attr.title = option._frameTitle;

				return attr;

			})());

			mm.preload.update($iframe, { onComplete: function () {

				var $modalItem = this.closest('.mm_modal-item');

				if (option._isHeader !== true) mm.find('.mm_header', this)[0].remove();
				if (mm.find('.btn_modal-close', this)[0]) mm.element.remove(mm.find('.btn_modal-close', $modalItem));
				base.resizeModal();

				mm.delay.on(mm.focus.in, { _time: mm.time._base, _isSec: true, _name: 'DELAY_FOCUS_MODAL', _isOverwrite: true, params: [$modalItem] });

				mm.apply(option.onLoad, $modalItem, option.onLoadParams);

			}, onError: mm.modal.close });

			return $modalItem;

		},
		//- 모달 닫기
		close: function (__callback, __params) {

			if (frameElement) {
				mm.apply('mm.modal.close', top, arguments);
				return;
			}

			if (mm._isModal) {
				window.close();
				return;
			}

			if (!base.$modal) return;

			var $items = mm.find('.mm_modal-item', base.$modal);
			if ($items.length === 0) return;

			var $lastItem = _.last($items);

			mm.event.on($lastItem, 'transitionEnd webkitTransitionEnd MSTransitionEnd', function (__e) {

				mm.event.off($lastItem, 'transitionEnd webkitTransitionEnd MSTransitionEnd');
				$lastItem.remove();

				if ($items.length === 0) {
					base.removeModal();
					mm.scroll.on();
				}

			});

			$lastItem.classList.remove(base._classOn);

			if ($items.length > 1) {
				var $prevItem = $lastItem.previousElementSibling;
				$prevItem.classList.remove(base._classOld);
				$prevItem.classList.add(base._classOn);
			}
			else {
				document.documentElement.classList.remove('__modal');
			}

			mm.apply(__callback, window, __params);

		},
		//- 모달 리사이즈
		resize: function (__option) {

			base.resizeModal(__option);

		},
		//- 오프너(window)
		get opener() {

			if (frameElement) return top.mm.modal.opener;
			else return base.opener;

		},
		//- 오픈 요소(element, 모달 열때 클릭한 요소)
		get openEl() {

			if (frameElement) return top.mm.modal.openEl;
			else return base.openEl;

		},
	};

})();
//> 모달 팝업

//< 컬러픽커
mm.colorpicker = (function () {

	var initial = {
		onChange: null,
		onChangeParams: [],
	};

	var base = {
		get _dataName() { return 'data-colorpicker'; },
		$picker: null,
		_classCheck: 'mco_colorpicker-check',
		appendPicker: function () {

			var colors = [
				['#ffebed', '#ffccd2', '#ef9998', '#e27570', '#ee5253', '#f6413a', '#e5383a', '#d32e34', '#c4282c', '#b61c1c'],
				['#fbe4ec', '#f9bbd0', '#f48fb1', '#f06292', '#ec407a', '#ea1e63', '#d81a60', '#c2175b', '#ad1457', '#890e4f'],
				['#f3e5f6', '#e1bee8', '#cf93d9', '#b968c7', '#aa47bc', '#9c28b1', '#8e24aa', '#7a1fa2', '#6a1b9a', '#4a148c'],
				['#eee8f6', '#d0c4e8', '#b39ddb', '#9675ce', '#7e57c2', '#673bb7', '#5d35b0', '#512da7', '#45289f', '#301b92'],
				['#e8eaf6', '#c5cae8', '#9ea8db', '#7986cc', '#5c6bc0', '#3f51b5', '#3949ab', '#303e9f', '#283593', '#1a237e'],
				['#e4f2fd', '#bbdefa', '#90caf8', '#64b5f6', '#42a5f6', '#2196f3', '#1d89e4', '#1976d3', '#1564c0', '#0e47a1'],
				['#e1f5fe', '#b3e5fc', '#81d5fa', '#4fc2f8', '#28b6f6', '#03a9f5', '#039be6', '#0288d1', '#0277bd', '#00579c'],
				['#dff7f9', '#b2ebf2', '#80deea', '#4dd0e2', '#25c6da', '#00bcd5', '#00acc2', '#0098a6', '#00828f', '#016064'],
				['#e0f2f2', '#b2dfdc', '#80cbc4', '#4cb6ac', '#26a59a', '#009788', '#00887a', '#00796a', '#00695b', '#004c3f'],
				['#e8f6e9', '#c8e6ca', '#a5d6a7', '#80c783', '#66bb6a', '#4bb050', '#43a047', '#398e3d', '#2f7d32', '#1c5e20'],
				['#f1f7e9', '#ddedc8', '#c5e1a6', '#aed582', '#9ccc66', '#8bc24c', '#7db343', '#689f39', '#548b2e', '#33691e'],
				['#f9fbe6', '#f0f4c2', '#e6ee9b', '#dde776', '#d4e056', '#cddc39', '#c0ca33', '#b0b42b', '#9e9e24', '#817716'],
				['#fffde8', '#fffac3', '#fff59c', '#fff176', '#ffee58', '#ffeb3c', '#fdd734', '#fac02e', '#f9a825', '#f47f16'],
				['#fef8e0', '#ffecb2', '#ffe083', '#ffd54f', '#ffc928', '#fec107', '#ffb200', '#ff9f00', '#ff8e01', '#ff6f00'],
				['#fff2df', '#ffe0b2', '#ffcc80', '#ffb64d', '#ffa827', '#ff9700', '#fb8c00', '#f67c01', '#ef6c00', '#e65100'],
				['#fbe9e7', '#ffccbb', '#ffab91', '#ff8a66', '#ff7143', '#fe5722', '#f5511e', '#e64a19', '#d64316', '#bf360c'],
				['#efebe8', '#d7ccc8', '#bcaba4', '#a0887e', '#8c6e63', '#795547', '#6d4d42', '#5d4038', '#4d342f', '#3e2622'],
				['#ebeff2', '#cfd8dd', '#b0bfc6', '#90a4ad', '#78909c', '#607d8b', '#546f7a', '#465a65', '#36474f', '#273238']
			];
			var grays = ['#ffffff', '#f6f6f6', '#ebebeb', '#dfdfdf', '#d6d6d6', '#cbcbcb', '#bebebe', '#b4b4b4', '#a7a7a7', '#949494', '#828282', '#737373', '#5e5e5e', '#535353', '#454545', '#2c2c2c', '#191919', '#000000'];

			base.$picker = mm.element.create(mm.string.template([
				'<div class="mm_colorpicker">',
				'	<div class="mm_colorpicker-list">',
				'		<ul></ul>',
				'		<ul></ul>',
				'	</div>',
				'	<div class="mm_colorpicker-foot">',
				'		<div class="mm_form-text">',
				'			<button type="button" class="btn_text-clear"><i class="mco_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
				'			<label>',
				'				<input type="text" class="textfield" data-text maxlength="6"><i class="bg_text"></i>',
				'				<span class="text_placeholder">직접입력(000000)</span>',
				'			</label>',
				'		</div>',
				'		<div class="mm_btnbox">',
				'			<div class="mm_inline">',
				'				<button type="button" class="mm_btn btn_color-cancel __btn_line__"><b>취소</b></button>',
				'				<button type="button" class="mm_btn btn_color-select"><b>적용</b></button>',
				'			</div>',
				'		</div>',
				'	</div>',
				'</div>',
			]))[0];
			var $colorLists = mm.find('.mm_colorpicker-list ul', base.$picker);
			var $pickerText = mm.find('.textfield', base.$picker)[0];

			mm.find('.mm_app')[0].append(base.$picker);

			for (var _i = 0; _i < 10; _i++) {
				_.forEach(colors, function (__items) {

					var $item = base.appendColor($colorLists[0], __items[_i]);
					if (_i > 3) mm.find('.btn_color-chip', $item)[0].classList.add('__check-white');

				});
			}

			_.forEach(grays, function (__gray, __index) {

				var $item = base.appendColor($colorLists[1], __gray, 1);
				if (__index > 5) mm.find('.btn_color-chip', $item)[0].classList.add('__check-white');

			});

			mm.event.on(mm.find('.btn_color-chip', base.$picker), 'click', function (__e) {

				if (mm.find(mm.selector(base._classCheck, '.'), this).length > 0) return base.selectColor();

				mm.class.remove(mm.find(mm.selector(base._classCheck, '.'), base.$picker), base._classCheck);
				mm.find('.bg_color', this)[0].classList.add(base._classCheck);

				mm.form.value($pickerText, mm.data.get(this, 'data-value', true));

			});

			mm.event.on(mm.find('.btn_color-select', base.$picker), 'click', base.selectColor);
			mm.event.on(mm.find('.btn_color-cancel', base.$picker), 'click', base.closePicker);

		},
		closePicker: function () {

			mm.event.off(document, 'click', 'colorClickInlineHandler');
			mm.event.off(window, 'scroll', 'colorScrollInlineHandler');

			if (!base.$picker) return;
			mm.element.style(base.$picker, { 'margin-top': '' });
			mm.find('.mm_app')[0].append(base.$picker);

		},
		appendColor: function (__$parent, __color) {

			var $item = mm.element.create(mm.string.template([
				'<li>',
				'	<button type="button" class="btn_color-chip" style="background-color:${COLOR}" data-value="${VALUE}">',
				'		<i class="bg_color"></i>',
				'		<b class="mm_ir-blind">${COLOR}</b>',
				'	</button>',
				'</li>',
			], { COLOR: __color, VALUE: __color.replace('#', '').toUpperCase() }))[0];

			__$parent.append($item);

			return $item;

		},
		selectColor: function () {

			var $ui = base.$picker.closest(mm.selector(base._dataName, '[]'));
			var $pickerText = mm.find('.textfield', base.$picker)[0];
			var $colorText = mm.siblings(base.$picker, '.colorfield')[0];
			var _color = $pickerText.value.trim();
			var _decimal = Number(mm.string.template('0x${COLOR}', { COLOR: _color }));

			if (_.isNaN(_decimal) || _decimal < 0 || _decimal > 16777215) return;

			$colorText.value = mm.string.join('#', _color);
			mm.element.style(mm.find('.bg_color', mm.siblings(base.$picker, '.btn_picker')[0]), { 'background-color': $colorText.value });

			base.closePicker();

			var data = mm.data.get($ui, base._dataName);
			if (mm.is.empty(data)) data = mm.data.set($ui, base._dataName, { initial: initial });
			mm.apply(data.onChange, $ui, [$colorText.value].concat(data.onChangeParams));

		},
	};

	(function () {

		mm.delegate.on(document, mm.string.template('[${UI}] .btn_picker', { UI: base._dataName }), 'click', function (__e) {

			__e.preventDefault();

			var $picker = mm.siblings(this, '.mm_colorpicker')[0];
			if ($picker) base.closePicker();
			else mm.colorpicker.open(this);

		});

	})();

	return {
		//- 열기
		open: function (__$element) {

			base.closePicker();

			if (!base.$picker) base.appendPicker();

			var $pickerText = mm.find('.textfield', base.$picker)[0];
			var $colorText = mm.siblings(__$element, '.colorfield')[0];
			var _color = $colorText.value.replace(/#/g, '').toUpperCase();

			mm.class.remove(mm.find(mm.selector(base._classCheck, '.'), base.$picker), base._classCheck);
			mm.class.add(mm.find(mm.string.template('[data-value="${COLOR}"] .bg_color', { COLOR: _color }), base.$picker)[0], base._classCheck);
			mm.form.value($pickerText, _color);

			mm.element.after(__$element, base.$picker);

			var _marginTop = mm.element.offset(__$element).top - mm.element.offset(base.$picker).top + __$element.offsetHeight;
			mm.element.style(base.$picker, { 'margin-top': mm.number.unit(_marginTop) });
			if (window.innerHeight < mm.element.offset(base.$picker).top + base.$picker.offsetHeight) {
				_marginTop += window.innerHeight - (mm.element.offset(base.$picker).top + base.$picker.offsetHeight);
				mm.element.style(base.$picker, { 'margin-top': mm.number.unit(_marginTop) });
			}

			mm.event.on(document, 'click', function colorClickInlineHandler(__e) {

				if (!__e.target.closest('.mm_colorpicker')) base.closePicker();

			});

			mm.event.on(window, 'scroll', function colorScrollInlineHandler(__e) {

				base.closePicker();

			}, { _isCapture: true });

		},
		//- 닫기
		close: function () {

			base.closePicker();

		},
	};

})();
//> 컬러픽커

//< 핀치줌
mm.pinchzoom = (function () {

	var initial = {
		_scale: 1,
		_scaleMin: 1,
		_scaleMax: 3,
		_classWrapper: 'mm_pinchzoom-wrapper',
		padding: {
			_top: 0,
			_bottom: 0
		}
	};

	var base = {
		get _dataName() { return 'data-pinchzoom'; },
		onTouch: function (__element, __data) {

			var $element = __element;
			var $pinch = mm.find(mm.selector(__data._classWrapper, '.'), $element)[0];
			var $scroller = (mm.scroll.el === window) ? parent.mm.scroll.el : mm.scroll.el;

			var _isOnZoom = false;
			var _isOnDrag = false;

			var zoom = { _scale: __data._scale, _beforeScale: __data._scale };
			var touch = {
				start: { _x: 0, _y: 0, distance: 0 },
				move: { _x: 0, _y: 0, _distance: 0 },
				between: { _x: 0, _y: 0 }
			};
			var translate = { _x: 0, _y: 0, _minX: 0, _maxX: 0, _minY: 0, _maxY: 0, _beforeX: 0, _beforeY: 0 };
			var _frameTop = (!frameElement) ? parent.mm.element.position($element).top : parent.mm.element.position(mm.find(frameElement)).top;

			function translateMinmax() {

				var _pinchWidth = $element.offsetWidth;
				var _pinchHeight = $element.offsetHeight;

				var _maxTop = $scroller.scrollTop - (_frameTop + $pinch.offsetTop) + __data.padding._top;
				var _maxBottom = _maxTop + parent.innerHeight - (_pinchHeight * zoom._scale) - __data.padding._bottom;

				translate._maxX = _pinchWidth * (1 - zoom._scale);
				translate._minY = Math.max(0, _maxTop);
				translate._maxY = Math.min(_maxBottom, _pinchHeight * (1 - zoom._scale));

			}

			mm.event.on($element, 'dblclick', function (__e) {

				if (zoom._scale > __data._scaleMin) {
 					var _offsetTop = _frameTop + $pinch.offsetTop;
					var _ratio = zoom._scale / __data._scaleMin;
					var _changeScroll = (-translate._y / _ratio) + _offsetTop + (($scroller.scrollTop - _offsetTop) / _ratio) - __e.screenY;

					mm.scroll.to(_changeScroll, { _time: 0, scroller: $scroller });

					zoom._scale = __data._scaleMin;
					translate._x = -__e.layerX * (__data._scaleMin - 1);
					translate._y = 0;
				}
				else {
					zoom._scale = __data._scaleMax;
					translate._x = -__e.layerX * (__data._scaleMax - 1);
					translate._y = -__e.layerY * (__data._scaleMax - 1);
				}

				translateMinmax();
				gsap.set($pinch, { scale: zoom._scale, x: translate._x, y: translate._y, ease: Power0.easeNone });

			});

			mm.event.on($element, 'touchstart', function pinchTouchInlineHandler(__e) {

				var touchData = __e.touches;
				var _isSingleTouch = (touchData.length === 1) ? true : false;

				if (!touchData || _isSingleTouch && zoom._scale === 1) return;

				zoom._beforeScale = zoom._scale = gsap.getProperty($pinch, 'scaleX');

				translate._beforeX = gsap.getProperty($pinch, 'x');
				translate._beforeY = gsap.getProperty($pinch, 'y');

				mm.event.on($element, 'touchmove touchend', function (__e) {

					touchData = __e.touches;
					_isSingleTouch = (touchData.length === 1) ? true : false;
					var _isMultiTouch = (touchData.length > 1) ? true : false;

					switch (__e.type) {
						case 'touchmove':
							if (_isMultiTouch && !_isOnZoom) {
								touch.start._x = touchData[0].clientX - touchData[1].clientX;
								touch.start._y = touchData[0].clientY - touchData[1].clientY;
								touch.start._distance = Math.sqrt(Math.pow(touch.start._x, 2) + Math.pow(touch.start._y, 2));

								touch.between._x = ((touchData[0].clientX + touchData[1].clientX) / 2) - $element.getBoundingClientRect().left;
								touch.between._y = ((touchData[0].clientY + touchData[1].clientY) / 2) - $element.getBoundingClientRect().top;

								_isOnZoom = true;
							}
							else if (_isSingleTouch && !_isOnDrag) {
								touch.start._x = touchData[0].clientX;
								touch.start._y = touchData[0].clientY;
								translateMinmax();

								_isOnDrag = true;
							}

							if (_isOnDrag || _isOnZoom) {
								__e.preventDefault();
								__e.stopPropagation();

								if (_isOnZoom) {
									touch.move._x = touchData[0].clientX - touchData[1].clientX;
									touch.move._y = touchData[0].clientY - touchData[1].clientY;

									touch.move._distance = Math.sqrt(Math.pow(touch.move._x, 2) + Math.pow(touch.move._y, 2));

									var _changScale = (zoom._beforeScale * (touch.move._distance / touch.start._distance)).toFixed(5);
									zoom._scale = Math.min(Math.max(_changScale, __data._scaleMin), __data._scaleMax);

									var _scaleFactor = (zoom._scale / zoom._beforeScale) - 1;

									var _centerRatioX = (touch.between._x - translate._beforeX) / $element.offsetWidth;
									var _centerRatioY = (touch.between._y - translate._beforeY) / $element.offsetHeight;

									translate._x = translate._beforeX - ($element.offsetWidth * _scaleFactor) * _centerRatioX;
									translate._y = translate._beforeY - ($element.offsetHeight * _scaleFactor) * _centerRatioY;

									translateMinmax();
								}
								else {
									touch.move._x = touchData[0].clientX;
									touch.move._y = touchData[0].clientY;

									translate._x = translate._beforeX - (touch.start._x - touch.move._x);
									translate._y = translate._beforeY - (touch.start._y - touch.move._y);
								}

								translate._x = Math.min(Math.max(translate._x, translate._maxX), translate._minX);
								translate._y = Math.min(Math.max(translate._y, translate._maxY), translate._minY);

								gsap.set($pinch, { scale: zoom._scale, x: translate._x, y: translate._y, ease: Power0.easeNone });
							}
							break;
						case 'touchend':
							if (_isSingleTouch && _isOnZoom) {
								translate._beforeX = translate._x;
								translate._beforeY = translate._y;
							}

							if (zoom._scale <= 1) {
								var _changeScroll = $scroller.scrollTop - gsap.getProperty($pinch, 'y');

								mm.scroll.to(_changeScroll, { _time: 0, scroller: $scroller });

								translate._x = 0;
								translate._y = 0;
								gsap.set($pinch, { x: translate._x, y: translate._y, ease: Power0.easeNone });
							}

							_isOnDrag = false;
							_isOnZoom = false;

							mm.event.off($element, 'touchmove touchend');
							break;
					}

				});

			});

		}
	};

	return {
		//- 핀치 연결
		update: function (__elements) {

			var $elements = mm.ui.element(base._dataName, __elements);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });

			_.forEach($elements, function (__$el) {

				var $pinch = mm.find(mm.selector(initial._classWrapper, '.'), __$el);
				var data = mm.data.get(__$el, base._dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, base._dataName, { initial: initial });

				base.onTouch(__$el, data);
				gsap.set($pinch, { transformOrigin: '0% 0%', scale: data._scale, x: 0, y: 0 });

			});

		},
	};

})();
//> 핀치줌

//< UI 영역
// * 코드 마지막에 유지
mm.ui = (function () {

	var base = {
		updates: ['tab', 'dropdown', 'stepper', 'carousel', 'slider', 'form', 'preload', 'lazyload'],// 업데이트 항목
	};

	return {
		//- UI 요소 검색
		element: function (__dataName, __elements) {

			if (!__dataName || !__dataName.startsWith('data-')) return [];

			if (__elements) {
				var $elements = mm.find(__elements);

				if ($elements.length > 0) {
					var $filtered = _.chain($elements).filter(function (__$el) {

						return typeof(__$el.hasAttribute) === 'function' && __$el.hasAttribute(__dataName);

					}).value();

					if ($filtered.length > 0) return $filtered;
					else return mm.find(__dataName, $elements);
				}
				else return [];
			}
			else return mm.find(__dataName);

		},
		//- UI 업데이트
		update: function (__elements) {

			_.forEach(base.updates, function (__ui) {

				mm.apply(mm.string.template('mm.${UI}.update', { UI: __ui }), window, [__elements]);

			});

		},
		//- UI 업데이트 항목 추가
		add: function (__ui) {

			if (typeof(__ui) !== 'string') return;

			base.updates.push(__ui);

		},
	};

})();
//> UI 영역