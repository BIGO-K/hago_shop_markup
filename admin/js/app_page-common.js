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

		//< gnb
		_.forEach(mm.find('.mm_gnb > ul'), function (__$gnb) {

			var _gnbLeft = mm.element.offset(__$gnb).left;
			var _gnbWidth = __$gnb.offsetWidth;

			_.forEach(mm.find('.mm_gnb-depth2', __$gnb), function (__$second) {

				var _secondLeft = mm.element.offset(__$second).left;
				var _secondWidth = __$second.offsetWidth;

				if (mm.is.odd(_secondWidth)) mm.element.style(__$second, { 'width': mm.number.unit(_secondWidth + 1) });

				if (_secondLeft < _gnbLeft) {
					mm.element.style(__$second, { 'margin-right': mm.number.unit(Math.ceil(_secondLeft - _gnbLeft)) });
				}
				else if (_secondWidth + _secondLeft > _gnbWidth + _gnbLeft) {
					mm.element.style(__$second, { 'margin-right': mm.number.unit((_secondWidth + _secondLeft) - (_gnbWidth + _gnbLeft)) });
				}

			});

			mm.event.on(__$gnb, 'mouseenter', function () {

				if (document.activeElement.tagName === 'SELECT') document.activeElement.blur();

			});

		});
		//> gnb

		//< 사이드바
		var _classSticky = '__sidebar-sticky';
		var $sidebar = mm.find('.mm_sidebar')[0];

		mm.event.on(window, 'load scroll resize', function (__e) {

			if ($sidebar) {
				var $inner = $sidebar.children[0];
				var offset = mm.element.offset($sidebar);
				if (offset.top > 0) {
					$sidebar.classList.remove(_classSticky);
					mm.element.style($inner, { 'margin-left': '', 'width': '' });
				}
				else {
					$sidebar.classList.add(_classSticky);
					mm.element.style($inner, { 'width': mm.number.unit($sidebar.offsetWidth) });

					if (__e.type === 'scroll') mm.element.style($inner, { 'margin-left': mm.number.unit(-window.pageXOffset) });
				}
			}

		});
		//> 사이드바

		//< 순서변경
		(function () {

			var initial = {
				_isHideFirst: true,
				onChange: null,
				onChangeParams: [],
			}
			var _dataName = 'data-sort';
			var _classSort = '__list-sortable';
			var _classExcepted = '__sortable-excepted';
			var defaultLists = [];

			mm.delegate.on(document, '[data-sort]', 'click', function (__e) {

				__e.preventDefault();

				var $ui = this.closest('.__table_sortable__, .__form_sortable__');
				if (!$ui) return false;

				var $sort = mm.find('.mm_table, .mm_form', $ui)[0];
				var $sortList = mm.find('tbody', $sort)[0];
				var $sortItems = mm.find('> tr', $sortList);
				var $sortExcepts = mm.find('.__sortable_excepted__', $ui);
				var data = mm.data.get(this, _dataName);
				if (mm.is.empty(data)) data = mm.data.set(this, _dataName, { initial: initial });

				$ui.classList.add(_classSort);

				var $checks = mm.find('.__checked', $ui);
				mm.class.remove($checks, '__checked');
				mm.class.add($checks, '__checked-temp');

				if ($sortExcepts.length !== 0) {
					mm.element.after($sortList, mm.string.template('<tbody class="${CLASS}"></tbody>', { CLASS: _classExcepted }));
					mm.element.append(mm.find(mm.selector(_classExcepted, '.'))[0], $sortExcepts);
				}

				var $firstItems = mm.find('> td:first-child, > th:first-child', $sortItems);
				var _checkHtml = mm.string.template([
					'<label class="mm_form-check __check-sortable">',
					'	<input type="checkbox" data-check>',
					'	<b class="mm_block">',
					'		<i class="ico_form-check"></i>',
					'		<span class="text_label mm_ir-blind">항목선택</span>',
					'	</b>',
					'</label>'
				]);

				if (data._isHideFirst) {
					mm.class.add(mm.element.wrap(mm.find('> .mm_table-item', $firstItems), 'div'), 'mm_table-hidden');
					mm.element.append($firstItems, _checkHtml);
					mm.class.add(mm.element.wrap(mm.find('.__check-sortable', $firstItems), 'div'), 'mm_table-item');
				}
				else mm.element.prepend($firstItems, _checkHtml);

				mm.form.update($sortList);

				_.forEach(mm.find('> tr', $sortList), function (__$tr, __index) {

					defaultLists[__index] = __$tr;
					if (__$tr.offsetHeight < 10) mm.element.remove(mm.find('.__check-sortable', __$tr.firstElementChild));

				});

				var $btnEdits = mm.find('[data-sort]', $ui);
				mm.element.after($btnEdits, mm.string.template([
					'<button type="button" class="mm_btn btn_sort-cancel __btn_line__"><i class="ico_sortable-cancel"></i><b>순서편집 취소</b></button>',
					'<button type="button" class="mm_btn btn_sort-complete __btn_secondary__"><i class="ico_sortable-complete"></i><b>순서편집 적용</b></button>',
					'<button type="button" class="mm_btn btn_sort-top"><b>최상단 이동</b></button>',
					'<button type="button" class="mm_btn btn_sort-bottom"><b>최하단 이동</b></button>',
					'<button type="button" class="mm_btn btn_sort-up"><b>위로 1칸 이동</b></button>',
					'<button type="button" class="mm_btn btn_sort-down"><b>아래로 1칸 이동</b></button>',
				]));

				var $buttons = mm.siblings($btnEdits, '[class*="btn_sort-"]');
				mm.event.on($buttons, 'click', function (__e) {

					function resetSortable() {

						mm.event.off($buttons, 'click');
						mm.element.remove($buttons);

						$ui.classList.remove(_classSort);
						mm.class.remove(mm.find('.__checked', $ui), '__checked');

						var $temps = mm.find('.__checked-temp');
						mm.class.remove($temps, '__checked-temp');
						mm.class.add($temps, '__checked');

						mm.element.append($sortList, $sortExcepts);
						mm.element.remove(mm.find(mm.selector(_classExcepted, '.'), $sort));

						if (data._isHideFirst) {
							mm.element.remove(mm.find('td:first-child > .mm_table-item', $sortList));
							mm.element.unwrap(mm.find('td:first-child .mm_table-hidden', $sortList));
						}
						else mm.element.remove(mm.find('th:first-child .__check-sortable', $sortList));

						mm.form.update($sortList);

						if (mm.is.ie('ie')) {
							var _ieCount = 0;
							var ieInterval = setInterval(function () {

								if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
									mm.scroll.off();
									mm.delay.on(mm.scroll.on);

									clearInterval(ieInterval);
								}

								_ieCount++;
								if (_ieCount > 100) clearInterval(ieInterval);

							}, 10);
						}

					}

					var $clicked = this;
					var $sortItems = mm.find('> tr', $sortList);
					var $sortExcepts = mm.find('.__sortable_excepted__', $ui);

					if ($clicked.classList.contains('btn_sort-cancel')) {
						mm.bom.confirm('순서변경을 취소하시겠습니까?', function (__is) {

							if (__is === true) {
								_.forEach(defaultLists, function (__$list) {

									mm.element.append($sortList, __$list);

								});
								resetSortable();
							}

						});
					}
					else if ($clicked.classList.contains('btn_sort-complete')) {
						mm.bom.confirm('순서변경을 적용하시겠습니까?', function (__is) {

							if (__is === true) {
								resetSortable();
								mm.apply(data.onChange, $clicked, data.onChangeParams);
							}

						});
					}
					else {
						var sortables = _.filter($sortItems, function (__$item) {

							var $sortCheck = mm.find('.__check-sortable [data-check]', __$item)[0];
							return $sortCheck && $sortCheck.checked;

						});
						if ($sortItems.length === sortables.length) return;

						var _isForm = $sort.classList.contains('mm_form');
						var _index;

						if ($clicked.classList.contains('btn_sort-up')) {
							_index = mm.element.index($sortItems, sortables[0]);
							if (_index === 0 || (_isForm && _index === 1)) return;

							_.forEach(sortables, function (__$item) {

								mm.element.before(__$item.previousElementSibling, __$item);

							});
						}
						else if ($clicked.classList.contains('btn_sort-down')) {
							_index = mm.element.index($sortItems, sortables[sortables.length - 1]);
							if (_index === $sortItems.length - 1) return;

							_.forEach(_.reverse(sortables.concat()), function (__$item) {

								mm.element.after(__$item.nextElementSibling, __$item);

							});
						}
						else if ($clicked.classList.contains('btn_sort-top')) {
							_index = mm.element.index($sortItems, sortables[0]);
							if (sortables.length === 1 && (_index === 0 || _isForm && _index === 1)) return;

							var _targetIndex = (_isForm) ? 1 : 0;
							var $target = mm.find('> tr', $sortList)[_targetIndex];

							if ($target === sortables[0]) {
								$target = sortables.shift();
								mm.element.after($target, sortables);
							}
							else mm.element.before($target, sortables);
						}
						else {
							_index = mm.element.index($sortItems, sortables[sortables.length - 1]);
							if (sortables.length === 1 && _index === $sortItems.length - 1) return;

							mm.element.append($sortList, sortables);
						}
					}

				});

			});

		})();
		//> 순서변경

		//< 테이블 이미지 미리보기
		mm.delegate.on(document, '.btn_preview-toggle', 'click', function () {

			var $table = this.closest('.mm_table');
			var $toggleBtn = mm.find('.btn_preview-toggle', $table);
			var $previewIcon = mm.find('i[class*="ico_image-"]', $toggleBtn);

			$table.classList.toggle('__preview-on');
			mm.class.remove($previewIcon, ['ico_image-show', 'ico_image-hide']);

			if (mm.class.every($table, '__preview-on')) {
				mm.element.attribute($toggleBtn, { 'title': '이미지 미리보기 끄기' });
				mm.class.add($previewIcon, 'ico_image-hide');
				mm.preload.destroy($table);
				mm.preload.update($table);
			}
			else {
				mm.element.attribute($toggleBtn, { 'title': '이미지 미리보기 켜기' });
				mm.class.add($previewIcon, 'ico_image-show');
			}

			mm.table.resize($table);

		});
		//> 테이블 이미지 미리보기

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

//< 테이블
mm.table = (function () {

	var initial = {
		_isGrid: false,
		_height: 0,
		onOrderBy: null,
		onOrderByArgs: [],
		onColumnChange: null,
		onColumnChangeArgs: [],
	};
	var _dataName = 'data-table';

	function getTableElement(__element) {

		var $el = (__element) ? $(__element) : $(mm.string.template('[${A}]', { A: _dataName }));
		return ($el[0] && ($el[0] === document || !$el[0].hasAttribute(_dataName))) ? $el.find(mm.string.template('[${A}]', { A: _dataName })) : $el;

	}

	function tableOrderBy(__$thisTh, __$table) {

		var _classDesc = '__descending';
		var _classAsc = '__ascending';
		var _isDescending = !mm.class.some(__$thisTh[0], [_classDesc, _classAsc]);
		var _isAscending = !_isDescending && __$thisTh[0].classList.contains(_classDesc);
		var $tableTh = __$table.find('th');
		var data = mm.data.get(__$table, _dataName);
		if (mm.is.empty(data)) data = mm.data.set(__$table, _dataName, { initial: initial });

		$tableTh.removeClass([_classDesc, _classAsc])
		.find('.ico_table-sort').remove();

		if (_isDescending || _isAscending) {
			__$thisTh.addClass(function () {

				return (_isDescending) ? _classDesc : _classAsc;

			}).find('.mm_table-item').append('<i class="ico_table-sort" />');
		}

		mm.apply(data.onOrderBy, __$table, [{ el: __$thisTh, _index: $tableTh.index(__$thisTh), _isDescending: (_isDescending) ? true : (_isAscending) ? false : null }].concat(data.onOrderByArgs));

	}

	function tableColumnChange(__$thisTh, __$table) {

		var data = mm.data.get(__$table[0], _dataName);
		mm.apply(data.onColumnChange, __$table, [{ el: __$thisTh, ths: __$table.find('th') }].concat(data.onColumnChangeArgs));

	}

	(function () {

		mm.ready(function () {

			mm.ui.add('table');
			mm.table.update(document);

		});

		mm.load(function () {

			if (mm.is.ie()) mm.table.resize(document);

		});

	})();

	return {
		//- 테이블 분할 변경
		update: function (__element) {

			return getTableElement(__element).each(function () {

				var $table = $(this);
				var $tableContent = $table.children('.mm_scroller');
				if (!$tableContent[0] || !mm.is.display($table)) return;

				var $tableLeft;
				var $tableRight;
				var $colgroup = $table.find('colgroup');
				var _fixedTotal = 0;
				var _classFixed = '__table-fixed';
				var _classAutosize = '__table-autosize';
				var _isSpan = ($table.find('[colspan], [rowspan]')[0]) ? true : false;
				var data = mm.data.get(this, _dataName);
				if (mm.is.empty(data)) data = mm.data.set(this, _dataName, { initial: initial });

				(function () {

					if (parseFloat(data._height) > 0) $tableContent.css({ 'max-height': parseFloat(data._height) });

					var $colCheck = $table.find('.col_check');
					$table.on('update change', '[type="checkbox"]', function () {

						var $check = $(this);
						if (!$check.closest($colCheck)[0] && $check.closest('td').index() !== $colCheck.index()) return;

						var $tr = $check.closest('.mm_table').find('tbody:first-of-type tr');
						var _classChecked = '__checked';
						var checkData = mm.data.get(this).check;
						var _isCheckAll = checkData && checkData._type === 'check_all';

						if (_isCheckAll) {
							if ($check.prop('checked')) {
								$tr.addClass(_classChecked);
								$tr.has('.text_check-none').removeClass(_classChecked);
							}
							else $tr.removeClass(_classChecked);
						}
						else {
							var _rowspan = $check.closest('td, th').attr('rowspan') || 1;
							$tr = $tr.filter(mm.string.template(':nth-child(${INDEX})', { INDEX: $check.closest('tr').index() + 1 }));

							for (var _i = 0; _i < _rowspan; _i++) {
								if ($check.prop('checked')) $tr.addClass(_classChecked);
								else $tr.removeClass(_classChecked);
								$tr = $tr.next();
							}
						}

					});

					$table.find('.mm_table-item').each(function () {

						var $this = $(this);
						var _trim = $this.text().trim();

						var $num = $this.find('.text_comma, .text_price');
						$num.each(function () {

							var _number = $(this).text();
							if (_trim.length > 0) $(this).text(mm.number.comma(_number));
							else $(this).text(0);

						});

						if ($this.closest('tfoot')[0]) return;

						var _trim = $this.text().trim();
						if (_trim.length === 0 || _trim === 'null') {
							$this.text('-');
							return;
						}

					});

					if (!$colgroup[0]) {

						var widths = [];
						var _colTotal = 0;
						var _rowCount = 0;

						$table.addClass(_classAutosize)
						.find('tr').each(function (__index) {

							if (_rowCount > 0) {
								_rowCount--;
								return;
							}

							var _colIndex = 0;

							$(this).children().each(function () {

								var $this = $(this);
								var _colLength = $this[0].colSpan;
								if (!_colLength) _colLength = 1;

								widths[_colIndex] = (_colLength === 1) ? Math.ceil($this.outerWidth()) : null;

								_colIndex += _colLength;
								if (__index === 0) {
									_colTotal = _colIndex;
									if ($this.hasClass(_classFixed)) _fixedTotal = _colIndex;
								}

								_rowCount = $this[0].rowSpan - 1;
								if (!_rowCount) _rowCount = 0;

							});
							if (_.compact(widths).length === _colTotal) return false;

						});

						$colgroup = $('<colgroup />');
						_.each(widths, function (__value, __index) {

							var $col = $(mm.string.template('<col style="width:${A}px;" data-table-col="${A}" />', { A: __value })).appendTo($colgroup);
							var $periodTd = $table.find('tbody td').eq(__index).has('.mm_formmix-period');
							if ($periodTd.length > 0) $table.find('thead th').eq(__index).attr({ 'data-period': true });

						});
						$table.find('table').prepend($colgroup);
					}
					else {
						mm.data.get($table).table._colHtml = $colgroup[0].outerHTML;
					}

				})();

				(function () {

					var _tableHtml = mm.string.template([
						'<div class="mm_table-${A}">',
						'	<table>',
						'		<colgroup></colgroup>',
						'		<t${A}></t${A}>',
						'	</table>',
						'</div>',
					], { A: '${A}' });
					var _tableHeadHtml = mm.string.template(_tableHtml, { A: 'head' });
					var _tableBodyHtml = mm.string.template(_tableHtml, { A: 'body' });
					var _tableFootHtml = mm.string.template(_tableHtml, { A: 'foot' });

					var $col = $colgroup.children();

					var widths = _.map($col.slice(0, _fixedTotal), function (__$item) { return parseFloat(__$item.dataset.tableCol); });
					var _leftWidth = (!mm.is.empty(widths)) ? widths.reduce(function (__sum, __value) { return __sum + __value; }) : 0;
					$tableLeft = $(mm.string.template([
						'<div class="mm_table-lside" style="width:${WIDTH}px">',
						'	${A}',
						'	${B}',
						'	${C}',
						'</div>',
					], { A: _tableHeadHtml, B: _tableBodyHtml, C: _tableFootHtml, WIDTH: _leftWidth })).insertBefore($tableContent);

					$tableLeft.find('colgroup')
					.next(':not(tr)').append(function () {

						var $this = $(this);
						var $fragment = $(document.createDocumentFragment());

						var $tBox = ($this.is('thead')) ? $tableContent.find('thead') : ($this.is('tfoot')) ? $tableContent.find('tfoot') : $tableContent.find('tbody');
						$tBox.find('tr').each(function () {
							var $contentTr = $(this);
							$fragment.append($('<tr />').css({ 'height': $contentTr.height() }).append($contentTr.find(mm.selector(_classFixed, '.'))));

						});

						return $fragment;

					})
					.end().append($col.splice(0, _fixedTotal));
					if (_fixedTotal === 0) $tableLeft.hide();

					$tableRight = $('<div class="mm_table-rside" />').css({ 'padding-left': _leftWidth }).append(_tableHeadHtml, $tableContent.addClass('mm_table-body'), _tableFootHtml).insertAfter($tableLeft);
					$tableRight.find('colgroup').not(function () {

						return ($(this).closest($tableContent)[0]) ? true : false;

					}).append($col.clone())
					.next('thead').replaceWith($tableContent.find('thead'))
					.end().next('tfoot').replaceWith($tableContent.find('tfoot'));

					mm.table.resize($table);

				})();

				var $tableLeftBody = $tableLeft.find('.mm_table-body');
				var $tableRightHead = $tableContent.prev('.mm_table-head');
				var $tableRightFoot = $tableContent.next('.mm_table-foot');
				var _isLeft = $tableLeft.is(':visible');
				var _isFoot = $tableRightFoot.find('td')[0] ? true : false;

				if (!_isLeft) $tableLeft.remove();
				if (!_isFoot) $table.find('.mm_table-foot').remove();

				var _scrollTop = $tableContent.scrollTop();
				var _scrollLeft = $tableContent.scrollLeft();
				$tableContent.on('scroll', function () {

					var $this = $(this);
					var _y = $this.scrollTop();
					var _x = $this.scrollLeft();

					if (_scrollTop !== _y && _isLeft) {
						gsap.set($tableLeftBody, { y: -_y });
						_scrollTop = _y;
					}
					if (_scrollLeft !== _x) {
						gsap.set([$tableRightHead, $tableRightFoot.children()], { x: -_x });
						_scrollLeft = _x;
					}

				});

				var $firstLineTh = $tableRightHead.find('tr:nth-child(1) th');

				if ($table.hasClass(_classAutosize) && !_isSpan) {
					var _classResize = '__table-resize';
					$('<button type="button" class="btn_resize" />').on('mousedown', function (__e) {

						var _startX = __e.originalEvent.pageX;
						var $window = $(window);

						var $fromTh = _.take($firstLineTh, $(this).closest('th').index() + 1);
						var _colIndex = _.sumBy($fromTh, function (__th) { return $(__th)[0].colSpan; });
						var $targetCol = $tableRight.find(mm.string.template('col:nth-child(${A})', { A: _colIndex }));
						var _defaultWidth = parseFloat($targetCol.css('width'));
						var _minWidth = Math.min(_defaultWidth, 124);

						$window.on('mousemove mouseup', function (__eA) {

							switch (__eA.type) {
								case 'mousemove':
									$table.addClass(_classResize);

									var _moveX = __eA.originalEvent.pageX - _startX;
									var _width = Math.max(_defaultWidth + _moveX, _minWidth);
									$targetCol.css({ 'width': _width });
									break;
								case 'mouseup':
									$window.off('mousemove mouseup');
									$table.removeClass(_classResize);
									break;
							}

							mm.table.resize($table);

						});

					}).appendTo($tableRightHead.find('tr:nth-child(1) th:not(.col_check, [data-period])'));
				}

				mm.form.update($table);

				if (data._isGrid !== true) return;

				var $clickTable = (_isSpan) ? $table : $tableLeft;
				$clickTable.on('click', '[tabindex]', function () {

					tableOrderBy($(this), $table);

				});

				mm.table.resize($table);
				if (_isSpan) return;

				var _classDrag = '__drag';
				$firstLineTh.on('mousedown', function (__e) {

					var $th = $(this);
					if ($th.hasClass('col_check') || $(__e.target).closest('.btn_resize')[0]) return;

					var _startIndex = $th.index();
					var _moveCount = 0;
					var $window = $(window);
					var $point;
					var $clone;

					$window.on('mousemove mouseup', function (__eA) {

						var $target = $(__eA.target);
						if (!$target.is('th')) $target = $target.closest('th');

						switch (__eA.type) {
							case 'mousemove':
								if (_moveCount > 2) {
									if (!$point) {
										$table.addClass(_classDrag);
										$point = $(mm.string.template([
											'<div class="mm_table-point">',
											'	<i class="ico_table-drag"></i>',
											'	<i class="ico_table-drag"></i>',
											'</div>',
										])).css({ 'height': $th.outerHeight() }).insertBefore($table);
										$clone = $(mm.string.template([
											'<div class="mm_table-clone">',
											'	${A}',
											'</div>',
										], { A: $th.html() })).css({ 'width': $th.outerWidth(), 'height': $th.outerHeight() }).prependTo($table);
									}

									var _tableLeft = $table.position().left;
									var _pointLeft = (!$target[0] || !$target.closest($tableRight)[0]) ? -10000 : $target.offset().left;
									if (__eA.originalEvent.offsetX > $target.width() / 2) _pointLeft += $target.outerWidth();
									_pointLeft -= parseFloat($('.mm_page-content').css('padding-left')) || 0;
									if (_pointLeft < $tableLeft.width() + _tableLeft - 1 || _pointLeft > $table.outerWidth() + _tableLeft) _pointLeft = -10000;

									$point.css({ 'left': _pointLeft });
									$clone.css({ 'left': __eA.originalEvent.pageX - $table.offset().left - $clone.outerWidth() / 2 });
								}
								else _moveCount++;
								break;
							case 'mouseup':
								$window.off('mousemove mouseup');

								if ($table.hasClass(_classDrag)) {
									$table.removeClass(_classDrag);
									$point.remove();
									$clone.remove();

									if (!$target[0] || !$target.closest($tableRight)[0]) return;

									var _endIndex = $target.index();
									var _changeFunc = (__eA.originalEvent.offsetX < $target.width() / 2) ? 'before' : 'after';
									if (_endIndex === _startIndex || (_changeFunc === 'before' && _endIndex - 1 === _startIndex) || (_changeFunc === 'after' && _endIndex + 1 === _startIndex)) return;

									$target[_changeFunc]($th);
									$tableRight.find(mm.string.template('col:nth-child(${A}), td:nth-child(${A})', { A: _startIndex + 1 })).each(function () {

										$(this).siblings().addBack().eq(_endIndex)[_changeFunc](this);

									});

									tableColumnChange($th, $table);
								}
								else {
									if ($th.is('[tabindex]')) tableOrderBy($th, $table);
								}
								break;
						}

					});

				});

			});

		},
		//- 테이블 삭제
		remove: function (__element) {

			return getTableElement(__element).each(function () {

				var $table = $(this);
				$table.removeClass('__table-autosize').off('click')
				.find('.mm_scroller').off('scroll')
				.end().find('.mm_table-lside, .mm_table-rside').remove();

			});

		},
		//- 테이블 해제
		destroy: function (__element) {

			return getTableElement(__element).each(function () {

				var $table = $(this);
				var data = mm.data.get($table).table;
				if ($table.find('.mm_table-rside').length === 0 || (!mm.is.empty(data) && data._colHtml)) return;

				var $reset = $(mm.string.template([
					'<div class="mm_scroller">',
					'	<table></table>',
					'</div>',
				]));
				var $resetTable = $reset.find('table');
				var _isLside = $table.find('.mm_table-lside').length > 0;

				_.forEach(['thead', 'tbody', 'tfoot'], function (__el) {

					$table.find(__el).each(function (__index) {

						if (__index === 0) $resetTable.append(this.outerHTML);
						else {
							if (_isLside) {
								var $resetTarget = $resetTable.find(__el).children('tr');
								$(this).children('tr').each(function (__i) {

									$resetTarget.eq(__i).append(this.innerHTML);

								});
							}
							else $resetTable.find(__el).append(this.innerHTML);
						}

					});

				});
				mm.table.remove($table);
				$reset.find('th .btn_resize').remove();
				$table.append($reset);

			});

		},
		//- 테이블 리사이즈
		resize: function (__element) {

			return getTableElement(__element).each(function () {

				var $table = $(this);
				var $tableLeftTr = $table.find('.mm_table-lside tr');
				var _isLeft = $tableLeftTr.is(':visible');

				if (_isLeft) {
					$table.find('.mm_table-rside tr').each(function (__index) {

						$tableLeftTr.eq(__index).css({ 'height': '' });
						$(this).css({ 'height': '' });

						var _thisHeight = $(this).height();
						var _leftHeight = $tableLeftTr.eq(__index).height();
						var _height = (_thisHeight > _leftHeight) ? _thisHeight : _leftHeight;

						$tableLeftTr.eq(__index).css({ 'height': _height });
						$(this).css({ 'height': _height });

					});
				}

				if (mm.is.ie()) {
					$table.find('.btn_resize').css({ 'height': $table.find('th').height() });
				}

				var $tableContent = $table.find('.mm_scroller');
				var $tableRightHead = $tableContent.prev('.mm_table-head');
				var _spaceWidth = $tableContent.width() - $tableContent.children().width()
				if (_spaceWidth > 0) $tableRightHead.css({ 'padding-right': _spaceWidth });
				else $tableRightHead.css({ 'padding-right': '' })

			});

		},
	}

})();
//> 테이블
