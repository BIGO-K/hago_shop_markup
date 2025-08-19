'use strict';

//< 레디
mm.ready(function () {

	// 상품 상세정보 태그/속성 정리
	_.forEach(mm.find('.m_prodetail-frame-info'), function (__$el) {

		mm.element.remove(mm.find('link', __$el));

		_.forEach(mm.find('img'), function (__$img) {

			var attr = { style: { 'width': 'auto', 'max-width': '100%' } };
			_.forEach(__$img.attributes, function (__key) {

				if (!['id', 'class', 'src', 'alt'].includes(__key.name) && !__key.name.startsWith('data-')) attr[__key.name] = '';

			});
			mm.element.attribute(__$img, attr);

		});

		_.forEach(mm.find('[width]'), function (__$item) {

			mm.element.attribute('[width]', { 'width': '' });

		});

		_.forEach(mm.find('iframe'), function(__$iframe) {

			if (__$iframe.getAttribute('src').includes('youtube') && !__$iframe.parentElement.classList.contains('m__info-media')) {
				mm.element.wrap(__$iframe, 'div');
				__$iframe.parentElement.classList.add('m__info-media');
			}

		});

		_.forEach(mm.find(mm.selector(['font', 'center']), __$el), function (__$tag) {

			mm.element.wrap(__$tag, 'p');
			mm.element.unwrap(__$tag);

		});

		_.forEach(mm.find('data-lazyload'), function (__$loader) {

			var data = mm.data.get(__$loader).lazyload;
			data._isPass = false;
			data._isErrorImage = false;
			data.onComplete = mm.frameResize;
			data.onError = function () {

				mm.element.remove([this.closest('figure, li, i'), this]);
				mm.frameResize();

			}

		});
		mm.lazyload.update();

	});

});
//> 레디