'use strict';

//< 최초
(function () {

	mm.event.on(window, 'unload', function (__e) {

		mm.loading.hide();

	});

})();
//< 최초

//< 레디
mm.ready(function () {

	if (frameElement) {
		mm.observer.dispatch(mm.event.type.frame_ready, { data: { this: window } });

		if (mm._isFrame) mm.frameResize(null, { _isLoad: true });
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

	// 터치이벤트 확인
	mm.event.on(document, 'mousedown mouseup', function (__e) {

		switch (__e.type) {
			case 'mousedown':
				mm._isTouch = true;
				break;
			case 'mouseup':
				mm._isTouch = false;
				break;
		}

	});

	// a 링크
	mm.delegate.on(document, 'a[data-href]', 'click', function (__e) {

		if (this.target.toLowerCase() === 'blank') return;

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
		if (data._type === 'link') {
			if (_attrHref.replace('#', '').trim().length === 0 || _attrHref.toLowerCase().includes('javascript:')) return false;

			if (_href.split('#')[0] === location.href.split('#')[0]) data._type = 'reload';
			if (data._type === 'reload' && _href.includes('#')) data._type = 'anchor';
		}

		__e.preventDefault();

		if (['link', 'popup'].includes(data._type)) {
			if (!_href.includes(location.host)) {
				window.open(_href);
				return false;
			}
		}

		switch (data._type) {
			case 'reload':
				location.reload();
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

	(function () {

		var $header = mm.find('.mm_header')[0];
		var $footer = mm.find('.mm_footer')[0];

		if (mm.is.ie() && mm._isError) {

			var $view = mm.find('.mm_view')[0];
			var _footerHeight = ($footer) ? $footer.offsetHeight : 0;
			var _pageHeight = $view.offsetHeight - _footerHeight - parseFloat(mm.element.style($view, 'padding-top'));
			var _contentHeight = mm.find('.mm_page-content')[0].offsetHeight;

			if (_pageHeight > _contentHeight) mm.element.style('.mm_page', { 'height': '100%' });
		}

		_.forEach(mm.find('.m_prodetail-thumbnail'), function (__$thumb) {

			var $thumbImage = mm.find('.image_thumbnail', __$thumb)[0];
			var $btnThumbs = mm.find('.btn_thumbnail', __$thumb);
			var _classOn = '__thumbnail-on';

			mm.event.on($btnThumbs, 'click', function (__e) {

				mm.class.remove($btnThumbs, _classOn);
				mm.element.attribute($btnThumbs, { 'title': '' });
				this.classList.add(_classOn);
				this.setAttribute('title', '선택됨');
				mm.element.style($thumbImage, { 'background-image': mm.string.template('url(${URL})', { URL: mm.data.get(mm.find('i', this)[0]).preload._src }) });

			});

			mm.event.dispatch($btnThumbs[0], 'click');

		});

		if (mm._isModal) return;

		// 스크롤 이벤트
		var $prodList = _.filter(mm.find('.mm_product-list'), function (__$list) { return __$list.nextElementSibling && __$list.nextElementSibling.classList.contains('mm_pagination'); })[0];
		var $genderFilter = mm.find('.mm_filter-gender')[0];
		var $rankingGnb = mm.find('.m_ranking-gnb')[0];
		var $stickies = mm.find('data-horizon');

		var _headerHeight = ($header) ? $header.offsetHeight : null;
		var _classStickyHeader = '__header-sticky';
		var _classHoldFilter = '__filter-hold';
		var _classSticky = '__sticky-on';

		var $side = mm.find('.mm_sidebar')[0];
		var $sideRight = mm.find('.mm_sidebar-rside-inner', $side)[0];
		var $btnAnchors = mm.find('[class*="btn_anchor"]', $side);
		var $btnKakaoplus = mm.find('.btn_kakaoplus', $side);
		var _isShowAnchor = false;

		mm.event.on(mm.scroll.el, 'load scroll', function (__e) {

			var scrollOffset = mm.scroll.offset(this);

			if ($header) {
				if (scrollOffset.top > _headerHeight) $header.classList.add(_classStickyHeader);
				else $header.classList.remove(_classStickyHeader);
			}

			if ($genderFilter) {
				if (mm.element.offset($prodList).top > window.innerHeight * 0.5 || mm.element.offset($footer).top < document.documentElement.offsetHeight) $genderFilter.classList.add(_classHoldFilter);
				else $genderFilter.classList.remove(_classHoldFilter);
			}

			if ($rankingGnb) {
				if (mm.element.offset($rankingGnb).top - $header.offsetHeight - mm.element.offset($header).top < 0) $rankingGnb.classList.add(_classSticky);
				else $rankingGnb.classList.remove(_classSticky);
			}

			if ($stickies) mm.element.style($stickies, { 'left': mm.number.unit(-scrollOffset.left) });
			if ($side) {
				if (scrollOffset.top > _headerHeight && !_isShowAnchor) {
					_isShowAnchor = true;

					gsap.to($sideRight, { height: 214, duration: 0.3, ease: 'sine.out' });
					gsap.to($btnAnchors, { autoAlpha: 1, duration: 0.2, delay: 0.2, ease: 'sine.out' });
					gsap.to($btnKakaoplus, { autoAlpha: 1, duration: 0.2, delay: 0.2, ease: 'sine.out' });
				}
				else if (scrollOffset.top < _headerHeight && _isShowAnchor) {
					_isShowAnchor = false;

					gsap.to($sideRight, { height: 76, duration: 0.3, ease: 'sine.inOut' });
					gsap.to($btnAnchors, { autoAlpha: 0, duration: 0.2, ease: 'sine.out' });
					gsap.to($btnKakaoplus, { autoAlpha: 0, duration: 0.2, ease: 'sine.out' });
				}
			}

		});

		var _classSmall = '__sidebar-sm';

		if ($side) {
			mm.event.on(window, 'load resize', function (__e) {

				if (window.innerWidth <= 1360 + 106) $side.classList.add(_classSmall);
				else $side.classList.remove(_classSmall);

			});
		}

		// 헤더 검색
		(function (__$search) {

			if (!__$search) return;

			var $searchInput = mm.find('data-text', __$search)[0];
			var $recentWord = mm.find('.mm_search-keyword', __$search)[0];
			var $recommendWord = mm.find('.mm_header-search-auto', __$search)[0];
			var _classOn = '__search-on';

			// 키보드 방향키 제어
			function keyDownFocus(__e, __$el) {

				if (!__$el) return;

				__e.preventDefault();

				mm.delay.on(function () {

					mm.class.remove(mm.find('.__over', __$search), '__over');
					__$el.classList.add('__over');

					$searchInput.value = _.last(mm.find('b:not(.text_rank):not(.text_shortcut)', __$el)).textContent;

				});

			}

			mm.element.attribute(__$search, { 'tabindex': 0, 'style': { 'cursor': 'auto' } });

			mm.event.on($searchInput, 'click change keydown keyup', function (__e) {

				var _isKeyword = this.value.trim().length > 0;
				switch (__e.type) {
					case 'click':
					case 'keydown':
						if (__$search.classList.contains(_classOn)) return;

						__$search.classList.add(_classOn);
					case 'change':
						if (__e.detail && __e.detail._isUpdate === true) return;
					case 'keyup':
						if (__e.type === 'keyup' && __e.keyCode > 36 && __e.keyCode < 41) return;

						mm.class.remove([$recommendWord, $recentWord], _classOn);
						if (_isKeyword) $recommendWord.classList.add(_classOn);
						else $recentWord.classList.add(_classOn);
						break;
				}

			});

			mm.event.on(__$search, 'keydown mouseover mouseenter mouseleave focusin focusout', function (__e) {

				var $searchOn = mm.find(mm.selector(_classOn, '.'), __$search);
				mm.delay.off('DELAY_SEARCH_CLOSE');

				switch (__e.type) {
					case 'keydown':
						if ($searchOn.length === 0) return;

						var $active = mm.find('.__over', __$search)[0] || document.activeElement;
						var $items = mm.find('li > a, dd > a', $searchOn);
						var _itemIndex = mm.element.index($items, $active);
						var _isText = $active.matches('[data-text]');

						if (__e.keyCode === 38) {
							if (_isText) return;

							if ($active.tagName !== 'A' || _itemIndex === 0) keyDownFocus(__e, $items[$items.length - 1]);
							else keyDownFocus(__e, $items[_itemIndex - 1]);
						}
						else if (__e.keyCode === 40) {
							if ($active.tagName === 'A' && _itemIndex === $items.length - 1) keyDownFocus(__e, $items[0]);
							else keyDownFocus(__e, $items[_itemIndex + 1]);
						}
						break;
					case 'mouseover':
						mm.class.remove(mm.find('.__over', __$search), '__over');
						if (document.activeElement.tagName === 'A') mm.focus.in($searchInput);

						var $searchItem = __e.target.closest('a');
						if ($searchItem) $searchItem.classList.add('__over');
						break;
					case 'mouseleave':
					case 'focusout':
						mm.delay.on(function () {

							mm.class.remove([__$search, $recentWord, $recommendWord], _classOn);

						}, { _time: (__e.type === 'mouseleave') ? 1 : 0, _isSec: true, _name: 'DELAY_SEARCH_CLOSE', _isOverwrite: true });
						break;
				}

			});

		})(mm.find('.mm_header-search')[0]);

		// 헤더 카테고리 메뉴 컨트롤
		var $cate = mm.find('.mm_catemenu')[0]
		var $cateBox = mm.find('.mm_catemenu-item > nav', $cate)[0];
		var $cateList = mm.find('> ul', $cateBox)[0];
		var $cateItems = mm.find('> li', $cateList);
		var _classCateOn = '__catemenu-on';
		var _cateMoveHeight;
		var _cateLimit;

		mm.event.on($cateBox, 'mouseenter mouseleave', function (__e) {

			switch (__e.type) {
				case 'mouseenter':
					_cateLimit = $cateList.children[0].offsetHeight;
					_cateMoveHeight = $cateList.offsetHeight - $cateBox.offsetHeight;

					if (_cateMoveHeight > 0 && !__e.target.closest('.mm_catemenu-item-depth')) {
						mm.event.on($cateBox, 'mousemove', function cateMouseMoveHandler(__e) {

							if (__e.target.closest('.mm_catemenu-item-depth')) return;

							var _ratioY = (__e.clientY - mm.element.offset($cateBox).top - _cateLimit) / ($cateBox.offsetHeight - _cateLimit * 2);
							_ratioY = Math.max(0, Math.min(_ratioY, 1));
							gsap.to($cateList, { 'margin-top': -_cateMoveHeight * _ratioY, duration: 0.4, ease: 'quad.out' });

						});
					}
					break;
				case 'mouseleave':
					mm.event.off($cateBox, 'mousemove', 'cateMouseMoveHandler');
					break;
			}

		});

		mm.event.on($cateItems, 'mouseenter mouseleave', function (__e) {

			var $btn = mm.find('> a', this)[0];
			var $subBox = mm.find('> .mm_catemenu-item-depth', this)[0];

			if ($subBox.contains(__e.target)) return;

			switch (__e.type) {
				case 'mouseenter':
					$btn.classList.add(_classCateOn);
					gsap.to($cateBox, { width: $btn.offsetWidth + $subBox.offsetWidth, duration: mm.time._base, ease: 'sine.inOut', overwrite: true });
					break;
				case 'mouseleave':
					$btn.classList.remove(_classCateOn);
					gsap.to($cateBox, { width: $btn.offsetWidth, duration: mm.time._fast, delay: 0.1, ease: 'sine.inOut', overwrite: true });
					break;
			}

		});

		// 카테고리 메뉴 마우스 컨트롤(숨김)
		mm.observer.on($cate, 'CATE_MENU_SWITCH', function (__e) {

			if ($cate.classList.contains('__switch-on')) {
				mm.event.on($cate, 'mouseenter mouseleave', function cateMouseHandler(__e) {

					switch (__e.type) {
						case 'mouseenter':
							mm.delay.off('DELAY_CATE_OFF');
							break;
						case 'mouseleave':
							mm.delay.on(function () {

								mm.switch.off(mm.find('.btn_catemenu', $cate));
								mm.event.off($cate, 'mouseenter mouseleave', cateMouseHandler);

							}, { _time: 500, _name: 'DELAY_CATE_OFF', _isOverwrite: true });
							break;
					}

				});
			}
			else mm.event.off($cate, 'mouseenter mouseleave', 'cateMouseHandler');

		});

		// 최근본상품 마우스 컨트롤(숨김)
		var $recent = mm.find('.mm_header-gnb-recent')[0];
		mm.observer.on($recent, 'RECENT_SWITCH', function (__e) {

			if ($recent.classList.contains('__switch-on')) {
				mm.event.on($recent, 'mouseenter mouseleave', function cateMouseHandler(__e) {

					switch (__e.type) {
						case 'mouseenter':
							mm.delay.off('DELAY_RECENT_OFF');
							break;
						case 'mouseleave':
							mm.delay.on(function () {

								mm.switch.off(mm.find('.btn_recent', $recent));
								mm.event.off($recent, 'mouseenter mouseleave', cateMouseHandler);

							}, { _time: 500, _name: 'DELAY_RECENT_OFF', _isOverwrite: true });
							break;
					}

				});
			}
			else mm.event.off($recent, 'mouseenter mouseleave', 'cateMouseHandler');

		});

	})();

});
//> 레디

//< 로드
mm.load(function () {

	if (mm._isPopup) mm.popup.resize();
	else if (mm._isModal) mm.modal.resize({ _isLoad: true });

	if (mm._isFrame) mm.frameResize(null, { _isLoad: true });
	if (mm.is.ie()) {
		var $checked = mm.find('[checked]');
		_.forEach($checked, function (__$check) {

			__$check.checked = true;

		});

		mm.form.update($checked);
	}

	Object.freeze(mm);

});
//> 로드

//< 상품 찜하기
function changeLikeProduct(__is, __url, __offCallback, __offParam) {

	var $switch = this;

	if (__is) {
		mm.modal.open(__url, { openEl: $switch, onReady: function () {

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

		gsap.to($likeIcon, { alpha: 0.3, scale: 0.3, duration: 0.15, ease: 'sine.out', onComplete: function () {

			gsap.set($likeIcon, { scale: 1.5 });
			gsap.to($likeIcon, { alpha: 1, scale: 1, duration: 0.2, ease: 'cubic.out' });

		} });
	}

}
//> 브랜드 찜하기 활성화