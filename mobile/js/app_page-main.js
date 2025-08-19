'use strict';

//< 메인
mm.pageMain = (function () {

	var base = {
		$navs: mm.find('.mm_gnb li > a'),
		$content: mm.find('.m_main > .mm_carousel')[0],
		_classUpdated: '__carousel-updated',
		changeNav(__index, __time) {

			var $gnb = mm.find('.mm_gnb')[0];
			var $activeNav = base.$navs[__index];

			var _target = mm.element.position($activeNav).left - ($gnb.offsetWidth - $activeNav.offsetWidth) / 2;
			mm.scroll.to(_target, { scroller: mm.scroll.find($gnb), _direction: 'horizontal', _time: __time || mm.time._fast });

			mm.class.remove(base.$navs, '__on');
			$activeNav.classList.add('__on');

			document.documentElement.classList.remove('__header-hide');

		},
		changeContent(__index) {

			mm.carousel.change(base.$content, __index);

		},
		get _hashIndex() {

			var _mainHash = mm.storage.get('session', '_mainHash');
			mm.storage.remove('session', '_mainHash');

			return _.findIndex(base.$navs, function (__$item) { return __$item.getAttribute('href').replace('#', '') === _mainHash; });

		},
	};

	(function () {

		var _hashIndex = base._hashIndex;
		if (_hashIndex < 0) _hashIndex = 0;

		var $gnbInner = mm.find('.mm_gnb-inner')[0];
		if ($gnbInner.scrollWidth <= $gnbInner.offsetWidth) $gnbInner.parentElement.classList.add('__gnb-flex');

		base.changeNav(_hashIndex, 0);

		mm.event.on(base.$navs, 'click', function (__e) {

			__e.preventDefault();

			if (this.classList.contains('__on')) return;

			var _index = mm.element.index(base.$navs, this);
			base.changeContent(_index);

		});

		var carouselData = mm.data.get(base.$content, 'data-carousel', true);
		mm.element.attribute(base.$content, { 'data-carousel': mm.extend(carouselData, { _index: _hashIndex, _isPreload: false, onReady: 'mm.pageMain.__.changeStart', onStart: 'mm.pageMain.__.changeStart' }) });

		_.forEach(mm.find('iframe', base.$content), function (__$item, __index) {

			var data = mm.data.get(__$item, 'data-preload', true);
			if (__index === _hashIndex) data._isPass = false;
			else data._isPass = true;

			mm.element.attribute(__$item, { 'data-preload': data });

		});

		mm.observer.on(base.$content, mm.event.type.main_go, function () {

			if (mm.storage.get('session', 'isCancelPopstate') === true) return;

			var _index = base._hashIndex;
			if (_index < 0) _index = 0;

			base.changeContent(_index);

			var data = mm.data.get(base.$content).carousel;
			if (_index === 0) {
				var $frameScroll = mm.find('iframe', data.__.$items[0])[0].contentWindow.mm.scroll.el;
				(function callee() {

					if (!mm.is.display($frameScroll)) mm.delay.on(callee);
					else $frameScroll.scrollTop = 0;

				})();
			}

		});

	})();

	return {
		//- 변경
		change(__index) {

			if (typeof(__index) === 'string') {
				mm.storage.set('session', '_mainHash', __index);
				__index = base._hashIndex;
				if (__index < 0) __index = 0;
			}
			base.changeContent(__index);

		},
		__: {
			changeStart(__isChange) {

				var data = mm.data.get(this).carousel;

				base.changeNav(data._index);

				var $iframes = mm.find('iframe', data.__.$items);
				var $selectedFrame = $iframes[data._index];

				if (!$selectedFrame.classList.contains('__preload-loaded')) {
					mm.preload.force($selectedFrame, { onComplete: function () {

						$selectedFrame.classList.add(base._classUpdated);
						mm.preload.force($iframes[data._index + 1]);

					}});
				}
				else {
					if (!$selectedFrame.classList.contains(base._classUpdated)) {
						$selectedFrame.classList.add(base._classUpdated);
						$selectedFrame.contentWindow.mm.ui.update();
					}

					mm.preload.force($iframes[data._index + 1]);
				}

			},
		},
	};

})();
//> 메인