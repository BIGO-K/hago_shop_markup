'use strict';

//< 기획전
mm.pageEvent = (function () {

	var base = {
		init: function () {

			_.forEach(mm.find('iframe'), function(__$iframe) {

				if (__$iframe.getAttribute('src').includes('youtube') && __$iframe.closest('.image_banner') && !__$iframe.parentElement.classList.contains('m__detail-media')) {
					mm.element.wrap(__$iframe, 'div');
					__$iframe.parentElement.classList.add('m__detail-media');
				}

			});

			var $lists = mm.find('.mm_event-list');
			var $anchor = mm.find('.mm_event-anchor')[0];
			if ($lists.length === 0 || !$anchor) return;

			var $header = mm.find('.mm_header')[0];
			var $btnAnchors = mm.find('a', $anchor);
			var _classSticky = '__anchor-sticky';
			var _classOn = '__anchor-on';
			var _anchorHeight = parseFloat(mm.element.style(mm.find('ul', $anchor)[0], 'height'));

			mm.element.style($anchor, { 'height': mm.number.unit(_anchorHeight) });

			function scrollEventHandler() {

				if (mm.element.offset($anchor).top - $header.offsetHeight - mm.element.offset($header).top < 0) $anchor.classList.add(_classSticky);
				else $anchor.classList.remove(_classSticky);

			}

			mm.event.off(mm.scroll.el, 'scroll', scrollEventHandler);
			mm.event.on(mm.scroll.el, 'scroll', scrollEventHandler);
			scrollEventHandler();

			mm.intersection.on($lists, function (__entry, __is) {

				if (__is) {
					mm.class.remove($btnAnchors, _classOn);
					mm.element.attribute($btnAnchors, { 'title': '' });

					var $btn = $btnAnchors[mm.element.index($lists, __entry.target)];
					mm.class.add($btn, _classOn);
					mm.element.attribute($btn, { 'title': '선택됨' });
				}

			}, {
				config: {
					rootMargin: '-35% 0px -65% 0px',
					threshold: [0, 1],
				}
			});

			mm.event.off($btnAnchors, 'click', 'clickInlineHandler');
			mm.event.on($btnAnchors, 'click', function clickInlineHandler(__e) {

				__e.preventDefault();

				mm.scroll.to(this.getAttribute('href'), { _margin: _anchorHeight });

			});

		},
	};

	(function () {

		base.init();

	})();

	return {
		// 이벤트 연결
		update: function () {

			base.init();

		},
	};

})();
//> 기획전