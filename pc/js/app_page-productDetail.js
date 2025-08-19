'use strict';

//< 옵션 선택
mm.prodOption = (function () {

	var base = {
		get _dataName() { return 'data-product'; },
		create: function (__elements, __data, __type) {

			var $optionList = mm.find('.m_prodetail-option-list', __elements);
			var $selected = mm.find('.m_prodetail-option-selected', __elements);
			var $optionSum = mm.find('.m_prodetail-option-sum', __elements);

			var dataOption = __data.product.options;

			var optionObj = null;
			var _selectOption = null;
			var _selectOptionSub = null;

			var _classSelect = '__option-select';

			var PROD_OPTION_QTY = 'PROD_OPTION_QTY';
			var PROD_OPTION_SELECT = 'PROD_OPTION_SELECT';

			function init(__$list) {

				optionObj = null;
				_selectOption = null;
				_selectOptionSub = null;

				if (__type === 'button') {
					mm.class.remove(mm.find(mm.selector(_classSelect, '.'), $optionList), _classSelect);

					_.forEach((__$list) ? [__$list] : $optionList, function (__$list) {

						if (mm.is.empty(mm.find('ul', __$list))) {
							mm.element.append(__$list, mm.string.template([
								'<div class="m_prodetail-option-item">',
									'<h6><b>옵션1</b></h6>',
									'<ul></ul>',
								'</div>',
								'<div class="m_prodetail-option-item">',
									'<h6><b>옵션2</b></h6>',
									'<ul></ul>',
								'</div>',
							]));

						}
						else mm.element.remove(mm.find('li', __$list));

						_.forEach(mm.find('ul', __$list), function (__$optionList, __index) {

							if (mm.find('li', __$optionList)[0]) mm.element.remove(mm.find('li', __$optionList));

							if (__index === 0) {
								_.forEach(dataOption, function (__option) {

									var _itemHtml = mm.string.template('<li><button type="button" class="btn_option"><b>${OPTION}</b></button></li>', { OPTION: __option._name });

									var _soldoutCount = 0;
									_.forEach(__option.sub, function (__optionSub) {

										if (__optionSub._qty === 0) _soldoutCount++;
										if (_soldoutCount === __option.sub.length) {
											_itemHtml = mm.string.template([
												'<li>',
													'<span class="btn_option" title="품절">',
														'<b>${OPTION}</b>',
														'<svg><line x1="0" y1="100%" x2="100%" y2="0" stroke="#cdcdcd" stroke-width="1" /></svg>',
													'</span>',
												'</li>'
											], { OPTION: __option._name });
										}

									});

									var $item = mm.element.create(_itemHtml);
									mm.element.append(__$optionList, $item);
									mm.data.get(mm.find('.btn_option', $item))._name = __option._name;

								});
							}
							else {
								_.forEach(dataOption[0].sub, function (__optionSub) {

									var $item = mm.element.create(mm.string.template('<li><button type="button" class="btn_option"><b>${OPTION}</b></button></li>', { OPTION: __optionSub._name }));

									mm.element.append(__$optionList, $item);
									mm.data.get(mm.find('.btn_option', $item))._name = __optionSub._name;

								});
							}

						});

					});
				}
				else {
					mm.dropdown.close(mm.find('.mm_dropdown', $optionList));
					mm.class.remove(mm.find(mm.selector(_classSelect, '.'), $optionList), _classSelect);

					_.forEach((__$list) ? [__$list] : $optionList, function (__$list, __optionIndex) {

						_.forEach(mm.find('.mm_dropdown', __$list), function (__$dropdown, __index) {

							mm.find('.btn_dropdown b', __$dropdown)[0].textContent = '옵션명' + (__index + 1);

							mm.element.remove(mm.find('.mm_scroller', __$dropdown));
							mm.element.append(mm.find('.mm_dropdown-item-inner', __$dropdown), mm.element.create('<div class="mm_scroller"><ul></ul></div>'));

							var optionArray = (__index === 0) ? dataOption : dataOption[0].sub;
							if (__index === 0) {
								_.forEach(optionArray, function (__option) {

									var _itemHtml = mm.string.template('<li><button type="button" class="btn_option"><b>${OPTION}</b></button></li>', { OPTION: __option._name });

									if (__index === 0) {
										var _isSoldout = false;
										var _soldoutCount = 0;

										_.forEach(__option.sub, function (__subOption) {

											if (__subOption._qty === 0) _soldoutCount++;
											if (__option.sub.length === _soldoutCount) _isSoldout = true;

										});

										if (_isSoldout) _itemHtml = mm.string.template('<li><span class="btn_option mm_flex"><b>${OPTION}</b><b class="mm_text-secondary">(품절)</b></span></li>', { OPTION: __option._name });
									}

									var $item = mm.element.create(_itemHtml);
									mm.element.append(mm.find('ul', __$dropdown)[0], $item);
									mm.data.get(mm.find('.btn_option', $item))._name = __option._name;

								});
							}
							else mm.element.attribute(mm.find('.btn_dropdown', __$dropdown), { disabled: true });

						});

					});
				}

			}

			_.forEach($optionList, function (__$option, __optionIndex) {

				init(__$option);

				var _option = null;
				var _optionSub = null;

				if (__type === 'button') {
					var $list = mm.find('ul', __$option);

					_.forEach($list, function (__$list, __index) {

						mm.delegate.on(__$list, '.btn_option', 'click', function (__e) {

							var _value = mm.data.get(this)._name;
							if (__index === 0) _option = _value;
							else _optionSub = _value;

							if (mm.find(mm.selector(_classSelect, '.'), __$list)[0] != this) mm.class.remove(mm.find(mm.selector(_classSelect, '.'), __$list), _classSelect);
							else {
								if (__index === 0) _option = null;
								else _optionSub = null;

								init();

								return false;
							}

							mm.class.toggle(this, _classSelect);
							this.setAttribute('title', '선택됨');

							if (__index === 0) {
								optionObj = dataOption.find(function (__option) {

									return (__option._name === _option);

								});

								if (!_optionSub) {
									var $optionListSub = $list[1];
									mm.element.remove(mm.find('li', $optionListSub));

									_.forEach(optionObj.sub, function (__optionSub) {

										var _itemHtml = mm.string.template('<li><button type="button" class="btn_option mm_flex"><b>${OPTION}</b></button></li>', { OPTION: __optionSub._name });
										if (__optionSub._qty === 0) {
											_itemHtml = mm.string.template([
												'<li>',
													'<span class="btn_option" title="품절">',
														'<b>${OPTION}</b>',
														'<svg><line x1="0" y1="100%" x2="100%" y2="0" stroke="#cdcdcd" stroke-width="1" /></svg>',
													'</span>',
												'</li>'
											], { OPTION: __optionSub._name });
										}

										var $item = mm.element.create(_itemHtml);
										mm.element.append($optionListSub, $item);
										mm.data.get(mm.find('.btn_option', $item))._name = __optionSub._name;

									});
								}
							}
							else {
								if (!_option) {
									mm.element.remove(mm.find('li', $list[0]));

									_.forEach(dataOption, function (__option) {

										var _itemHtml = mm.string.template('<li><button type="button" class="btn_option mm_flex"><b>${OPTION}</b></button></li>', { OPTION: __option._name });

										_.forEach(__option.sub, function (__optionSub) {

											if (__optionSub._name === _optionSub && __optionSub._qty === 0) {

												_itemHtml = mm.string.template([
													'<li>',
														'<span class="btn_option" title="품절">',
															'<b>${OPTION}</b>',
															'<svg><line x1="0" y1="100%" x2="100%" y2="0" stroke="#cdcdcd" stroke-width="1" /></svg>',
														'</span>',
													'</li>'
												], { OPTION: __option._name });

												return false;
											}

										});

										var $item = mm.element.create(_itemHtml);
										mm.element.append($list[0], $item);
										mm.data.get(mm.find('.btn_option', $item))._name = __option._name;

									});
								}
							}

							if (_option && _optionSub) {

								var _isDuplicate = false;
								_.forEach(mm.find('.text_option', $selected[__optionIndex]), function (__$option) {

									if (__$option.firstChild.textContent === mm.string.template('${FIRSTOPTION}/${SECONDOPTION}', { FIRSTOPTION: _option, SECONDOPTION: _optionSub })) {
										_isDuplicate = true;

										mm.bom.alert('이미 선택된 옵션입니다.', function () {

											if (__optionIndex === 1) mm.event.dispatch(mm.find('.btn_option-select'), 'click');

										});

										return false;
									}

								});

								_selectOption = _option;
								_selectOptionSub = _optionSub;
								_option = null;
								_optionSub = null;

								if (!_isDuplicate) mm.observer.dispatch(PROD_OPTION_SELECT);

								mm.delay.on(init, { _time: 100 });
							}

						});

					});
				}
				else {
					_.forEach(mm.find('.mm_dropdown', __$option), function (__$dropdown, __index) {

						mm.event.on(mm.find('.btn_dropdown', __$dropdown), 'click', function (__e) {

							if (__$dropdown.classList.contains('__dropdown-on')) return;

							var optionArray = dataOption;
							if (__index === 1) {
								optionArray = (!_option) ? dataOption[0].sub : dataOption.find(function (__option) {

									if (__option._name === _option) return __option;

								});

								mm.element.remove(mm.find('li', __$dropdown));

								_.forEach(optionArray.sub, function (__optionSub) {

									var _optionHtml = mm.string.template('<li><button type="button" class="btn_option mm_flex"><b>${OPTION}</b></button></li>', { OPTION: __optionSub._name });
									if (__optionSub._qty === 0) _optionHtml = mm.string.template('<li><span class="btn_option mm_flex"><b>${OPTION}</b><b class="mm_text-secondary">(품절)</b></span></li>', { OPTION: __optionSub._name });

									var $item = mm.element.create(_optionHtml);

									if (__optionSub._qty >= 1 && __optionSub._qty <= 5) mm.element.append(mm.find('.btn_option', $item), mm.string.template('<b class="mm_text-primary-dark">(${STOCK}개)</b>', { STOCK: __optionSub._qty }));
									mm.element.append(mm.find('ul', __$dropdown), $item);
									mm.data.get(mm.find('.btn_option', $item))._name = __optionSub._name;

								});
							}

						});

						mm.delegate.on(__$dropdown, '.btn_option', 'click', function (__e) {

							var _value = mm.data.get(this)._name;
							mm.find('.btn_dropdown b', __$dropdown)[0].textContent = _value;

							if (__index === 0) _option = _value;
							else _optionSub = _value;

							mm.dropdown.close(__$dropdown);

							if (!_optionSub) {
								var $optionItem = __$dropdown.closest('.m_prodetail-option-item');

								mm.element.attribute(mm.find('.btn_dropdown', $optionItem.nextElementSibling)[0], { disabled: false });
								mm.event.dispatch(mm.find('.btn_dropdown', $optionItem.nextElementSibling)[0], 'click');

								mm.class.add($optionItem, _classSelect);
							}
							else {
								optionObj = dataOption.find(function (__option) {

									return (__option._name === _option);

								});

								var _isDuplicate = false;
								_.forEach(mm.find('.text_option', $selected[__optionIndex]), function (__$option) {

									if (__$option.firstChild.textContent === mm.string.template('${FIRSTOPTION}/${SECONDOPTION}', { FIRSTOPTION: _option, SECONDOPTION: _optionSub })) {
										_isDuplicate = true;

										mm.bom.alert('이미 선택된 옵션입니다.', function () {

											if (__optionIndex === 1) mm.event.dispatch(mm.find('.btn_option-select'), 'click');

										});

										return false;
									}

								});

								_selectOption = _option;
								_selectOptionSub = _optionSub;
								_option = null;
								_optionSub = null;

								mm.class.remove(mm.find(mm.selector(_classSelect, '.'), __$option), _classSelect);
								if (!_isDuplicate) mm.observer.dispatch(PROD_OPTION_SELECT);

								mm.delay.on(init, { _time: 100 });
							}

						});

					});
				}

			});

			mm.observer.on($selected, PROD_OPTION_SELECT, function(__e) {

				var $scroller = mm.find('.mm_scroller', __e.target);
				if (mm.is.empty($scroller)) {
					$scroller = mm.element.create('<div class="mm_scroller"><ul></ul></div>');
					mm.element.append(__e.target, $scroller);
				}

				var optionDetail = optionObj.sub.find(function (__optionSub) {

					return __optionSub._name === _selectOptionSub;

				});

				var _stock = optionDetail._qty;
				var $selectedItem = mm.element.create(mm.string.template([
					'<li data-option>',
						'<div class="m__selected-item">',
							'<p class="text_option"><span>${OPTION}/${OPTIONSUB}</span><strong class="text_stock">남은수량 ${STOCK}개</strong></p>',
							'<div class="mm_stepper" data-stepper>',
								'<div class="mm_form-text">',
									'<label>',
										'<input type="text" class="textfield text_stepper" data-text><i class="bg_text"></i>',
										'<span class="mm_ir-blind text_placeholder">수량</span>',
									'</label>',
								'</div>',
								'<button type="button" class="btn_stepper-subtract"><i class="ico_stepper-subtract"></i><b class="mm_ir-blind">수량 빼기</b></button>',
								'<button type="button" class="btn_stepper-add"><i class="ico_stepper-add"></i><b class="mm_ir-blind">수량 더하기</b></button>',
							'</div>',
							'<p class="text_price"><strong>${PRICE}</strong></p>',
							'<button type="button" class="btn_option-remove"><i class="mco_option-remove"></i><b class="mm_ir-blind">옵션삭제</b></button>',
						'</div>',
					'</li>',
				], { PRICE: mm.number.comma(optionDetail._price), OPTION: _selectOption, OPTIONSUB: _selectOptionSub, STOCK: _stock }));

				var $optionText = mm.find('.text_option > span', $selectedItem)[0];
				$optionText.textContent = $optionText.textContent.replace(/^\-\/|\/\-$/g, '');
				if ($optionText.textContent === '-') $optionText.textContent = __data.product._name;

				if (_stock > 5) mm.element.remove(mm.find('.text_stock', $selectedItem));

				mm.element.attribute($selectedItem, { 'data-option': { _code: optionDetail._code, _price: optionDetail._price }});
				mm.element.append(mm.find('ul', $scroller), $selectedItem);

				if ($scroller[0].scrollHeight != $scroller[0].offsetHeight) mm.class.add($selected, '__selected-scroll');
				else mm.class.remove($selected, '__selected-scroll');

				var $stepper = mm.find('[data-stepper]', $selectedItem);
				mm.element.attribute($stepper, { 'data-stepper': { _max: _stock }});
				mm.stepper.update($stepper);

				mm.data.get($stepper, 'data-stepper').onChange = function () { base.calcPrice(this, __elements); }
				mm.form.update($selectedItem);

				if (mm.is.mobile('android')) {
					mm.delegate.on($stepper, '.text_stepper', 'focusin focusout', function (__e) {

						switch (__e.type) {
							case 'focusin':
								mm.element.hide($optionSum);
								break;
							case 'focusout':
								if (!mm.is.display($optionSum)) mm.element.show($optionSum);
								break;
						}

					});
				}

				if (__type === 'select') mm.delay.on(init, { _time: 100 });
				if (mm.element.index($selected, __e.target)) mm.apply(__data.onChange, $selected, [optionDetail._code, 'add']);

			});

			mm.observer.on($selected, PROD_OPTION_QTY, function(__e) {

				var _index = mm.element.index($selected, __e.target);
				var _totalPrice = 0;

				_.forEach(mm.find('li', __e.target), function (__$item, __index) {

					var $target = __e.detail.element;
					if ($target && __index === mm.element.index(mm.find('li', $target.closest('ul')), $target.closest('li'))) {
						mm.find('.textfield', __$item)[0].value = mm.find('.textfield', __e.detail.element)[0].value;
						mm.stepper.update(mm.find('.textfield', __$item)[0]);
					}

					var _price = __data.product._price * parseFloat(mm.find('[data-stepper] .text_stepper', __$item)[0].value);
					mm.find('.text_price > strong', __$item)[0].textContent = mm.number.comma(_price);

					_totalPrice += _price;

				});

				mm.find('.text_price > strong', $optionSum[_index])[0].textContent = mm.number.comma(_totalPrice);

			});

			mm.delegate.on($selected, '.btn_option-remove', 'click', function (__e) {

				var $item = this.closest('li');
				var removeOption = base.removeOption(this, $selected, dataOption);

				base.calcPrice(mm.find('[data-stepper]', $item)[0], __elements);

				mm.apply(__data.onChange, $item, [removeOption._code, 'remove']);

			});

			if (__type === 'result') {
				optionObj = dataOption[0];
				_selectOption = optionObj._name;
				_selectOptionSub = optionObj.sub[0]._name;

				mm.observer.dispatch(PROD_OPTION_SELECT);

				mm.class.add('.m__selected-item', '__selected-single');
			}

		},
		removeOption: function (__$element, __$selected, __data) {

			var $list = __$element.closest('ul');
			var _removeIndex = mm.element.index(mm.find('li', $list), __$element.closest('li'));
			var removeOption = null;

			var option = mm.find('.text_option > span', __$element.closest('li'))[0].textContent.split('/');

			_.forEach(__$selected, function (__$el) {

				mm.element.remove(mm.find('li', __$el)[_removeIndex]);
				if (!mm.find('li', __$el)[0]) mm.element.remove($list.closest('.mm_scroller'));

			});

			__data.find(function (__option) {

				if (__option._name === option[0]) {
					return removeOption = __option.sub.find(function (__optionSub) {

						return __optionSub._name === option[1];

					});
				}

			});

			return removeOption;

		},
		calcPrice: function (__$stepper, __$element) {

			_.forEach(__$element, function (__$el) {

				var $selected = mm.find('.m_prodetail-option-selected', __$el);
				var $optionSum = mm.find('.m_prodetail-option-sum', __$el);

				var _totalPrice = 0;
				_.forEach(mm.find('li', $selected), function (__$item, __index) {
					if (!mm.find(__$stepper, __$el)[0] && __index === mm.element.index(mm.find('li', __$stepper.closest('ul')), __$stepper.closest('li'))) {
						mm.find('[data-stepper] .text_stepper', __$item)[0].value = parseFloat(mm.find('.textfield', __$stepper)[0].value);
					}

					var data = mm.data.get(__$item, 'data-option', true);
					var _price = data._price * parseFloat(mm.find('[data-stepper] .text_stepper', __$item)[0].value);
					mm.find('.text_price > strong', __$item)[0].textContent = mm.number.comma(_price);

					_totalPrice += _price;

				});

				mm.find('.text_price > strong', $optionSum)[0].textContent = mm.number.comma(_totalPrice);

			});

		},
	};

	(function () {


	})();

	return {
		// 이벤트 연결
		update: function (__elements, __json) {

			if (!__json) return;

			var $elements = mm.ui.element(base._dataName, __elements);
			var data = __json;

			if (data.product.options.length === 1 && data.product.options[0].sub.length === 1) {
				base.create($elements, data, 'result');
				return;
			}

			if (data.product._isFunding || data.product.options.length >= 15 || data.product.options[0].sub.length >= 15) {
				mm.class.add($elements, '__option_select__');

				_.forEach($elements, function (__$el, __index) {

					var $optionList = mm.find('.m_prodetail-option-list', __$el);
					var _dropdownHtml = mm.string.template([
						'<div class="m_prodetail-option-item">',
							'<h6><b>옵션1</b></h6>',
							'<div class="mm_dropdown" data-dropdown>',
								'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명1</b><i class="mco_dropdown-bold"></i></button>',
								'<div class="mm_dropdown-item">',
									'<div class="mm_dropdown-item-inner"></div>',
								'</div>',
							'</div>',
						'</div>',
					]);

					if (data.product.options[0].sub) {
						_dropdownHtml += mm.string.template([
							'<div class="m_prodetail-option-item">',
								'<h6><b>옵션2</b></h6>',
								'<div class="mm_dropdown" data-dropdown>',
									'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명2</b><i class="mco_dropdown-bold"></i></button>',
									'<div class="mm_dropdown-item">',
										'<div class="mm_dropdown-item-inner"></div>',
									'</div>',
								'</div>',
							'</div>',
						]);
					}

					mm.element.prepend($optionList, _dropdownHtml);

					var $dropdown = mm.find('[data-dropdown]', $optionList);
					mm.element.attribute($dropdown, { 'data-dropdown': { _group: 'dev_accrodion-option' + __index }});
					mm.dropdown.update($dropdown);

				});

				base.create($elements, data, 'select');
			}
			else base.create($elements, data, 'button');

		},
	};

})();
//> 옵션 선택

// 하단 구매옵션 열기/닫기 이벤트
function changeSidePosition (__is) {

	var $sidebar = mm.find('.mm_sidebar')[0];

	var _classSideOptionUp = '__sidebar-up';
	var _classSideOptionOpen = '__sidebar-upper';

	if (__is) {
		$sidebar.classList.remove(_classSideOptionUp);
		$sidebar.classList.add(_classSideOptionOpen);
	}
	else {
		$sidebar.classList.remove(_classSideOptionOpen);
		$sidebar.classList.add(_classSideOptionUp);
	}

	var $optionDropdown = mm.find('.m_prodetail-buy .mm_dropdown');
	if ($optionDropdown[0]) mm.dropdown.close($optionDropdown);

}

mm.ready(function () {

	(function (__$stock) {

		if (!__$stock) return;

		gsap.fromTo('.m_prodetail-head-stock .mco_clock', { rotate: -15 }, { rotate: 15, duration: 0.05, ease: 'linear.none', yoyo: true, yoyoEase: 'linear.none', repeat: 100 });
		gsap.to('.m_prodetail-head-stock .mco_clock', { scale: 1.4, duration: 0.4, delay: 0.5, ease: 'bounce.out', yoyo: true, repeat: 5, yoyoEase: 'back.in',
			onComplete: function () {

				gsap.to(__$stock, { autoAlpha: 0, height: 0, duration: 0.4, delay: 2, ease: 'cubic.inOut' });

			},
		});

	})(mm.find('.m_prodetail-head-stock')[0]);

	_.forEach(mm.find('.m_prodetail-tab'), function (__$tab) {

		var $option = mm.find('.m_prodetail-buy')[0];
		var $header = mm.find('.mm_header')[0];
		var $sidebar = mm.find('.mm_sidebar')[0];
		var $scroll = mm.scroll.el;

		var _classSticky = '__tab-sticky';
		var _classStickyEnd = '__tab-stickyEnd';
		var _classBuySticky = '__buy-sticky';
		var _classBuySwitch = '__switch-on';
		var _classSideOptionUp = '__sidebar-up';
		var _classSideOptionOpen = '__sidebar-upper';

		var data = mm.data.get(__$tab).tab;
		data.onChange = function() {

			mm.frameResize(mm.find('.mm_tab-item.__tab-on iframe', __$tab))
			mm.event.dispatch($scroll, 'scroll');

			if (mm.class.some(__$tab, [_classSticky, _classStickyEnd])) mm.scroll.to(__$tab, { _time: 0, _margin: $header.offsetHeight });

		};

		mm.event.on(mm.scroll.el, 'load scroll', function (__e) {

			var _tabTop = mm.element.offset(__$tab).top;
			if (_tabTop - $header.offsetHeight - mm.element.offset($header).top < 0) {
				if (_tabTop > -__$tab.offsetHeight + document.documentElement.offsetHeight * 0.33) {
					__$tab.classList.remove(_classStickyEnd);
					__$tab.classList.add(_classSticky);
				}
				else {
					__$tab.classList.remove(_classSticky);
					__$tab.classList.add(_classStickyEnd);
				}

				$sidebar.classList.add(_classSideOptionUp);
				if ($option) $option.classList.add(_classBuySticky);
			}
			else {
				__$tab.classList.remove(_classSticky);
				mm.class.remove($sidebar, [_classSideOptionUp, _classSideOptionOpen]);

				if ($option) {
					mm.class.remove($option, [_classBuySticky, _classBuySwitch]);

					var $optionDropdown = mm.find('.m_prodetail-option-list .mm_dropdown',  $option);
					if ($optionDropdown[0]) mm.dropdown.close($optionDropdown);
				}
			}

		});

	});

});
