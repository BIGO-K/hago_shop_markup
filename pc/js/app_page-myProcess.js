'use strict';

mm.ready(function () {

	var $process = mm.find('.m_my-order-process');

	mm.event.on(mm.find('.mm_foot [class*="btn_process"]', $process), 'click', function (__e) {

		__e.preventDefault();

		var $this = this;
		var $header = mm.find('.mm_header');
		var _classOn = '__process-on';

		mm.scroll.to('.mm_page-content-inner', { _margin: parseInt(mm.element.style($header, 'height')) + 50, _time: 0 });

		if ($this.classList.contains('btn_process-complete')) {
			$process[0].classList.add(_classOn);
			mm.form.update($process);
			mm.preload.update($process);
		}
		else if ($this.classList.contains('btn_process-select')) $process[0].classList.remove(_classOn);

	});

});