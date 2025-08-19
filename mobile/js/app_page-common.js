'use strict';

//< 최초(레디 전)
(function () {

	// 우클릭 및 드래그 방지
	function returnHandler(__e) {

		__e.preventDefault();

	}

	window.addEventListener('contextmenu', returnHandler);
	document.addEventListener('dragstart', returnHandler);

	if (!mm._isStage && !mm._isFrame && !mm._isModal && !mm._isError && !mm._isExternal) {
		if (mm._isPublish) {
			mm.storage.set('session', 'directPage', location.href.replace(location.origin, ''));
			mm.history.replace(null, mm._homeUrl);
			location.reload();
		}
		else {
			try {
				App.pageScript.common.goStage();
			}
			catch (__error) {
				console.log('App.pageScript.common.goStage(); 오류:', __error);
			}
		}
	}

	if (mm.is.mobile('ios') && frameElement && !mm.history.state) mm.history.state = mm.storage.get('session', 'stateBackup');

})();
//> 최초(레디 전)

//< 레디
mm.ready(function () {

	if (mm._isPopup) {
		var state = mm.history.state;
		var _keepIndex = (state) ? state._keepIndex : 0;

		if (_keepIndex > 0) mm.find('[data-href*="back"]')[0].classList.remove('__off');
	}

	if (frameElement) {
		mm.observer.dispatch(mm.event.type.frame_ready, { data: { this: window } });

		if (mm._isFrame) {
			if (!mm._isMain) mm.frameResize(null, { _isLoad: true });

			var $carousel = frameElement.closest('[data-carousel]');
			if ($carousel) {
				var $touch = mm.find('.mm_page-inner')[0];
				var data = mm.data.get($carousel).carousel;

				function carouselFrameHandler(__e) {

					mm.event.dispatch(mm.find('.mm_carousel-inner', $carousel)[0], __e.type, { data: { touches: (__e.type === 'touchend') ? __e.changedTouches : __e.touches, target: __e.target } });
					if (__e.type === 'touchmove' && data.__._isDirection === true) __e.preventDefault();
					if (__e.type === 'touchend') mm.event.off($touch, 'touchmove touchend', carouselFrameHandler);

				}

				mm.event.on($touch, 'touchstart', function (__e) {

					var $scroll = mm.scroll.find(__e.target, true);
					if ($scroll.window) $scroll = null;
					if (__e.target.closest('[data-carousel]') || ($scroll && $scroll !== mm.scroll.el)) return;

					carouselFrameHandler(__e);
					mm.event.on($touch, 'touchmove touchend', carouselFrameHandler);

				});
			}
		}
	}

	mm.ui.update();

	// autofill 감지
	mm.event.on('[data-text]', 'animationstart', function (__e) {

		var $text = this.closest('.mm_form-text');
		if (!$text) return;

		switch (__e.animationName) {
			case 'autofill-on':
				$text.classList.add('__text-on');
				break;
			case 'autofill-cancel':
				if (this.value.trim().length === 0) $text.classList.remove('__text-on');
				break;
		}

	});

	if (!mm.is.mobile('app')) {
		mm.event.on(window, 'orientationchange', function () {

			location.reload();

		});
	}

	// 터치이벤트 확인
	mm.event.on(document, 'touchstart touchend', function (__e) {

		switch (__e.type) {
			case 'touchstart':
				mm._isTouch = true;
				break;
			case 'touchend':
				mm._isTouch = false;
				break;
		}

	});

	// 아이폰 위/아래 스크롤 막기
	if (mm.is.mobile('ios')) {
		var _touchCount = 0;
		var _touchBefore = 0;

		mm.event.on('.mm_scroller:not(.__scroller_x__)', 'touchstart touchmove', function (__e) {

			if (__e.detail && __e.detail.touches) return;

			var $scroll = mm.scroll.find(__e.target, true);
			if ($scroll.scrollHeight <= $scroll.offsetHeight) return;

			var touch = __e.touches[0];

			switch (__e.type) {
				case 'touchstart':
					_touchBefore = touch.pageY;
					_touchCount = 0;
					break;
				case 'touchmove':
					var _touchMove = touch.pageY;
					if (_touchMove - _touchBefore < 0) {
						if (_touchCount < 0) _touchCount = 0;
						_touchCount++;
					}
					else if (_touchMove - _touchBefore > 0) {
						if (_touchCount > 0) _touchCount = 0;
						_touchCount--;
					}
					_touchBefore = _touchMove;
					break;
			}

			var _scrollHeight = $scroll.scrollHeight - $scroll.offsetHeight;
			if ($scroll === this && ($scroll.scrollTop <= 0 && _touchCount < 0) || ($scroll.scrollTop >= _scrollHeight && _touchCount > 0)) {
				__e.preventDefault();
			}

		});
	}

	// a 링크
	mm.delegate.on(document, 'a[data-href]', 'click', function (__e) {

		if (this.target.toLowerCase() === 'blank') return;

		__e.preventDefault();

		var initial = {
			openEl: this,
			_type: null,
			_frameId: null,
			_frameName: null,
			_step: 1,
		};

		var data = mm.data.get(this, 'data-href', { initial: initial });
		if (mm.is.empty(data)) data = mm.data.set(this, 'data-href', { initial: initial });
		var _attrHref = this.getAttribute('href');
		var _href = this.href;

		if (!data._type) return false;

		if (['link', 'popup'].includes(data._type)) {
			if (!_href.includes(location.host)) {
				window.open(_href);
				return false;
			}
			else {
				if (_attrHref.replace('#', '').trim().length === 0 || _attrHref.toLowerCase().includes('javascript:')) return false;

				if (_href.split('#')[0] === location.href.split('#')[0]) {
					if (_href.includes('#')) data._type = 'anchor';
					else data._type = 'reload';
				}
			}
		}

		switch (data._type) {
			case 'reload':
				location.replace(location.href.split('#')[0]);
				break;
			case 'back':
				mm.history.back(data._step);
				break;
			case 'forward':
				mm.history.forward(data._step);
				break;
			case 'anchor':
				mm.scroll.to(_attrHref, data);
				break;
			case 'modal':
			case 'popup':
			case 'link':
			case 'home':
				mm.link(_href, data);
				break;
		}

	});

	// 당겨서 새로고침
	(function (__$scroll) {

		if (!__$scroll || __$scroll === window || (mm._isMain && !mm._isFrame) || mm._isModal || mm._isSide) return;

		mm.element.before(__$scroll, mm.string.template([
			'<!-- 당겨서 새로고침 -->',
			'<!-- (D) 해당영역은 스크립트로 자동 생성됩니다. -->',
			'<div class="mm_refresh">',
			'	<div class="ico_loading"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
			'	<p>아래로 당겨 새로고침</p>',
			'</div>',
			'<!--// 당겨서 새로고침 -->',
		]));

		mm.event.on(__$scroll, 'touchstart', function (__e) {

			if (!__e.touches) return;

			var startTouch = __e.touches[0];
			var _isDirection = null;

			mm.event.on(__$scroll, 'touchmove touchend', function touchInlineHandler(__e) {

				var touch = (__e.type === 'touchend') ? __e.changedTouches[0] : __e.touches[0];

				if (_isDirection === null) {
					var _moveX = Math.abs(touch.screenX - startTouch.screenX);
					var _moveY = Math.abs(touch.screenY - startTouch.screenY);
					var _limit = 1.6;

					if (_moveY / _moveX > _limit) _isDirection = true;
					else mm.event.off(__$scroll, 'touchmove touchend', touchInlineHandler);
				}
				else {
					var _y = Math.max((touch.screenY - startTouch.screenY) * 0.4, 0);

					switch (__e.type) {
						case 'touchmove':
							if (__$scroll.scrollTop > 0) return mm.event.off(__$scroll, 'touchmove touchend', touchInlineHandler);

							gsap.set(__$scroll, { marginTop: _y });
							break;
						case 'touchend':
							if (_y < 130) gsap.to(__$scroll, { marginTop: 0, duration: 0.2, ease: 'sine.inOut' });
							else {
								gsap.to(__$scroll, { marginTop: 130, duration: 0.2, ease: 'sine.inOut', onComplete: function () {

										location.replace(location.href);

									}
								});
							}
							break;
					}
				}

				if (__e.type === 'touchend') mm.event.off(__$scroll, 'touchmove touchend', touchInlineHandler);

			});

		});

	})(mm.scroll.el);

	// 푸터 앱 설치배너
	var $appInstall = mm.find('.mm_footer .btn_download')[0];
	if ($appInstall && mm.is.mobile('app')) $appInstall.remove();

	// 스크롤이벤트
	(function (__$scrolls) {

		var $header = (frameElement && mm._isMain && mm._isFrame) ? mm.find('.mm_header', parent.document)[0] : mm.find('.mm_header')[0];
		var $footer = mm.find('.mm_footer')[0];
		var $btnTop = mm.find('.btn_topmost')[0];
		var $prodList = _.filter(mm.find('.mm_product-list'), function (__$list) { return !__$list.parentElement.classList.contains('mm_scroller') && __$list.parentElement.classList.contains('mm_inner'); })[0];
		var $btnGender = mm.find('.mm_filter-gender')[0];
		var $toast = mm.siblings(__$scrolls[0], '.mm_toast')[0];
		var _scrollBefore = 0;
		var _scrollCount = 0;
		var _scrollThreshold = (mm.is.mobile('ios')) ? 10 : 10;
		var _classHeaderHide = '__header-hide';

		if ($toast) {
			var $btnToast = mm.find('.btn_toast', $toast)[0];
			if ($btnToast) mm.element.style('.mm_page-inner', { 'padding-bottom': mm.number.unit($btnToast.offsetHeight) });
		}

		function scrollEventHandler(__$scroller) {

			var $html = (mm._isMain) ? parent.document.documentElement : document.documentElement;
			var _scroll = __$scroller.scrollTop;

			var _isScrollEnd = (__$scroller.scrollHeight - __$scroller.offsetHeight) === __$scroller.scrollTop;
			var _direction = (_scroll - _scrollBefore > 0) ? 'down' : 'up';

			if ($header && !mm._isModal) {
				if (_direction === 'down') _scrollCount = (_scrollCount < 0) ? 0 : _scrollCount + 1;
				else _scrollCount = (_scrollCount > 0) ? 0 : _scrollCount - 1;

				if (_scroll > $header.offsetHeight * 2 && !_isScrollEnd) {
					if (_scrollCount > _scrollThreshold) $html.classList.add(_classHeaderHide);
					else if (_scrollCount < -_scrollThreshold) $html.classList.remove(_classHeaderHide);
				}
				else $html.classList.remove(_classHeaderHide);

				if (mm._isMain) {
					var $frameHtml = document.documentElement;
					if ($html.classList.contains(_classHeaderHide)) {
						$frameHtml.classList.add(_classHeaderHide);
					}
					else $frameHtml.classList.remove(_classHeaderHide);
				}
			}

			// 탑버튼 노출/숨김
			if ($btnTop) {
				if (!$html.classList.contains(_classHeaderHide) && __$scroller.scrollHeight > window.innerHeight * 1.5 && (_scroll > window.innerHeight * 0.5 || _isScrollEnd)) $btnTop.classList.add('__on');
				else $btnTop.classList.remove('__on');
			}

			// 상품 리스트 성별 필터
			if ($btnGender) {
				if (mm.element.offset($prodList).top > window.innerHeight * 0.5 || mm.element.offset($footer).top < __$scroller.offsetHeight - parseFloat(mm.element.style(__$scroller, 'padding-bottom')) - 9) $btnGender.classList.add('__gender-bottom');
				else $btnGender.classList.remove('__gender-bottom');
			}

		}

		_.forEach(__$scrolls, function (__$scroller) {

			scrollEventHandler(__$scroller);

		});

		mm.event.on(__$scrolls, 'scroll', function (__e) {

			if (gsap.isTweening(this)) return;

			scrollEventHandler(this);
			_scrollBefore = this.scrollTop;

		});

	})((mm._isSide) ? mm.find('.mm_scroller:not(.__scroller_x__', mm.scroll.el) : mm.scroll.el);

	// 상품목록 상단
	mm.event.on('.mm_product-list-head select', 'update change', function (__e) {

		mm.find('.text_selected', this.parentElement)[0].textContent = this.options[this.selectedIndex].text;

	});

	// 단계별 입력(mm_process)
	var $processItems = mm.find('.mm_process-item');
	mm.delegate.on($processItems, '.mm_foot .mm_btn', 'click', function (__e) {

		var $currentItem = __e.target.closest('.mm_process-item');
		var _index = mm.element.index($processItems, $currentItem);

		if (this.tagName !== 'BUTTON' || (_index === $processItems.length - 1 && !this.classList.contains('btn_back'))) return;

		var _classOn = '__process-on';

		$currentItem.classList.remove(_classOn);
		mm.scroll.to(0, { '_time': 0 });

		if (this.classList.contains('btn_back')) $currentItem.previousElementSibling.classList.add(_classOn);
		else $currentItem.nextElementSibling.classList.add(_classOn);

	});

	// SNS 공유 모달 (브랜드샵, 상품상세)
	mm.event.on('.btn_sns-share', 'click', function () {

		var $btnShare = this;
		var $page = mm.find('.mm_page')[0];
		var $snsLayer = mm.find('.mm_sns')[0];
		var $snsList = mm.find('.mm_sns-list', $snsLayer)[0];

		$page.append($snsLayer);
		mm.element.style($snsList, { 'top': mm.number.unit(this.getBoundingClientRect().top + 14) });

		mm.event.on('.btn_sns-close', 'click', function () {

			mm.element.after($btnShare, $snsLayer);
			mm.element.style($snsList, { 'top': '' });

		}, { _isOnce: true });

	});

});
//> 레디

//< 로드
mm.load(function () {

	if (mm._isPopup) mm.popup.resize();
	else if (mm._isModal) mm.modal.resize({ _isLoad: true });

	if (mm._isFrame && !mm._isMain) mm.frameResize(null, { _isLoad: true });

	if (mm.is.ie()) mm.form.value('[checked]', true);

	Object.freeze(mm);

});
//> 로드

//< 사이드바
mm.side = (function () {

	return {
		//- 사이드바 열기
		open(__url) {

			if (mm.history.session.page._pageType === 'side') return;

			if (mm.history.state._pageIndex > 0) {
				mm.storage.set('session', 'isCancelPopstate', true);
				mm.link('/');
			}

			mm.popup.open(__url, { onReady: function () {

				mm.delay.on(mm.observer.dispatch, { _time: mm.time._base, _isSec: true, _name: 'DELAY_SIDE_OPEN', _isOverwrite: true, params: [mm.event.type.stage_add, { data: { _isRemove: true } }] });

			} });

		},
		//- 사이드바 닫기
		close() {

			mm.history.back();

		},
	};

})();
//> 사이드바

//< 상세검색
mm.filter = (function () {

	return {
		//- 상세검색 열기
		open(__url) {

			mm.modal.open(__url, { _isFull: true, openEl: document, classes: ['__modal-motion-left'], _isCloseOutside: true });

		},
		//- 상세검색 닫기
		close() {

			mm.modal.close();

		},
	};

})();
//> 상세검색

//< 성별필터
function switchGenderFilter() {

	mm.siblings(this)[0].classList.remove('__switch-on');

}
//> 성별필터

//< 상품목록 스타일변경
function toggleStyleProduct(__is) {

	var $productList = this.closest('.mm_product-list');
	if (!$productList) $productList = mm.find('.mm_product-list')[0];
	var $icon = mm.find('> i', this)[0];

	if (__is) {
		this.setAttribute('title', '1열로 보기');
		$icon.classList.remove('mco_array-card');
		$icon.classList.add('mco_array-wide');
	}
	else {
		this.setAttribute('title', '2열로 보기');
		$icon.classList.remove('mco_array-wide');
		$icon.classList.add('mco_array-card');
	}

}
//> 상품목록 스타일변경

//< 상품 찜하기
function changeLikeProduct(__is, __url, __offCallback, __offParam) {

	var $switch = this;

	if (__is) {
		mm.modal.open(__url, { _isFull: true, openEl: $switch, classes: ['__modal-motion-up'], _isCloseOutside: true, onReady: function () {

			mm.event.on(mm.find('.btn_modal-close', mm.find('iframe', this)[0])[0], 'click', function () {

				var data = mm.data.get($switch).switch;
				var onChange = data.onChange;

				data.onChange = null;
				mm.switch.off($switch);
				data.onChange = onChange;

			});

		} });
	}
	else mm.apply(__offCallback, $switch, [__offParam]);

}
//> 상품 찜하기

//< 브랜드 찜하기 활성화
function toggleLikeBrand(__is) {

	if (__is) {
		var $likeIcon = this.children[0];

		gsap.to($likeIcon, { alpha: 0.5, scale: 0.5, duration: 0.15, ease: 'sine.out', onComplete: function () {

			gsap.set($likeIcon, { scale: 2 });
			gsap.to($likeIcon, { alpha: 1, scale: 1, duration: 0.2, ease: 'cubic.out' });

		} });
	}

}
//> 브랜드 찜하기 활성화