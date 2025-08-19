'use strict';

//< 옵션 선택
mm.prodOption = (function () {

	var base = {
		get _dataName() { return 'data-product'; },
		removeOption: function (__$element, __data) {

			var $list = __$element.closest('ul');
			var _removeIndex = mm.element.index(mm.find('li', $list), __$element.closest('li'));
			var removeOption = null;

			var option = mm.find('.text_option', __$element.closest('li'))[0].textContent.split('/');

			mm.element.remove(mm.find('li', $list)[_removeIndex]);
			if (!mm.find('li', $list)[0]) mm.element.remove($list);

			__data.find(function (__option) {

				if (__option._name === option[0]) {
					return removeOption = __option.sub.find(function (__optionSub) {

						return __optionSub._name === option[1];

					});
				}

			});

			return removeOption;

		},
		calcPrice: function (__$element) {

			var $selected = mm.find('.m_product-option-selected', __$element);
			var $optionSum = mm.find('.m_product-option-footer', __$element);

			var _totalPrice = 0;
			_.forEach(mm.find('li', $selected), function (__$item) {

				var data = mm.data.get(__$item, 'data-option', true);
				var _price = data._price * parseFloat(mm.find('[data-stepper] .text_stepper', __$item)[0].value);
				mm.find('.text_price > strong', __$item)[0].textContent = mm.number.comma(_price);

				_totalPrice += _price;

			});

			mm.find('.text_price > strong', $optionSum)[0].textContent = mm.number.comma(_totalPrice);

		},
	};

	return {
		// 이벤트 연결
		update: function (__elements, __json) {

			if (!__json) return;

			var $elements = mm.ui.element(base._dataName, __elements);
			var data = __json;
			var _isResult = data.product.options.length === 1 && data.product.options[0].sub.length === 1;

			if (data.product._isFunding || data.product.options.length >= 15 || data.product.options[0].sub.length >= 15) {
				mm.class.add($elements, '__option_select__');
				mm.prodOption.select($elements, data, _isResult);
			}
			else mm.prodOption.button($elements, data, _isResult);

			mm.delegate.on(document, '.btn_product-buy, .btn_option-close', 'click', function (__e) {

				var $buy = mm.find('.m_product-option')[0];
				var _classOn = '__option-open';

				if (mm.find(mm.selector(_classOn, '.'))[0]) {
					gsap.to($elements, { height: '' });
					mm.class.remove($buy, _classOn);
				}
				else mm.class.add($buy, _classOn);

				if (mm.find(mm.selector(_classOn, '.'))[0]) {
					mm.event.on(mm.scroll.el, 'scroll', function () {

						mm.event.dispatch('.btn_option-close', 'click');

					}, { _isOnce: true });
				}

			});

		},
		// 셀렉트형 옵션 선택
		select: function (__elements, __data, __isResult) {

			var $optionList = mm.find('.m_product-option-select', __elements);
			var $selected = mm.find('.m_product-option-selected', __elements);
			var $optionSum = mm.find('.m_product-option-footer', __elements);

			var dataOption = __data.product.options;

			var optionObj = null;
			var _selectOption = null;
			var _selectOptionSub = null;

			function init(__$list) {

				optionObj = null;
				_selectOption = null;
				_selectOptionSub = null;

				_.forEach((__$list) ? [__$list] : $optionList, function (__$list, __optionIndex) {

					_.forEach(mm.find('.mm_dropdown', __$list), function (__$dropdown, __index) {

						mm.find('.btn_dropdown b', __$dropdown)[0].textContent = '옵션명' + (__index + 1);

						mm.element.remove(mm.find('.mm_scroller', __$dropdown));
						mm.element.append(mm.find('.mm_dropdown-item-inner', __$dropdown), '<div class="mm_scroller"><ul></ul></div>');

						var optionArray = (__index === 0) ? dataOption : dataOption[0].sub;
						if (__index === 0) {
							_.forEach(optionArray, function (__option) {

								var _itemHtml = mm.string.template('<li><button type="button" class="btn_option mm_flex"><b>${OPTION}</b></button></li>', { OPTION: __option._name });

								if (__index === 0) {
									var _isSoldout = false;
									var _soldoutCount = 0;

									_.forEach(__option.sub, function (__subOption) {

										if (__subOption._qty === 0) _soldoutCount++;
										if (__option.sub.length === _soldoutCount) _isSoldout = true;

									});

									if (_isSoldout) _itemHtml = mm.string.template('<li><span class="btn_option mm_flex"><b>${OPTION}</b><b class="mm_text-secondary">(품절)</b></span></li>', { OPTION: __option._name });
								}

								var $item = mm.element.create(_itemHtml)[0];
								mm.find('ul', __$dropdown)[0].append($item);
								mm.data.get(mm.find('.btn_option', $item))._name = __option._name;

							});
						}
						else mm.element.attribute(mm.find('.btn_dropdown', __$dropdown), { disabled: true });

						mm.class.remove(__$dropdown, '__option-select');
						mm.element.style(__$dropdown, { height: '' });
						mm.dropdown.close(__$dropdown);
						mm.element.style($selected, { visibility: '' });

					});

				});

			}

			mm.delegate.on(document, '.btn_product-buy, .btn_option-close', 'click', function (__e) {

				init();

			});

			_.forEach(__elements, function (__$el, __index) {

				var _dropdownHtml = mm.string.template([
					'<div class="mm_dropdown" data-dropdown>',
						'<h6 class="mm_strapline"><b>옵션1</b></h6>',
						'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명1</b><i class="mco_dropdown-bold"></i></button>',
						'<div class="mm_dropdown-item">',
							'<div class="mm_dropdown-item-inner"></div>',
						'</div>',
					'</div>',
					'<div class="mm_dropdown" data-dropdown>',
						'<h6 class="mm_strapline"><b>옵션2</b></h6>',
						'<button type="button" class="btn_dropdown" title="펼쳐보기" disabled><b>옵션명2</b><i class="mco_dropdown-bold"></i></button>',
						'<div class="mm_dropdown-item">',
							'<div class="mm_dropdown-item-inner"></div>',
						'</div>',
					'</div>'
				]);

				mm.element.append($optionList, _dropdownHtml);
				mm.element.attribute(mm.find('.mm_dropdown', $optionList), { 'data-dropdown': { _group: 'dev_accrodion-option' + __index }});
				mm.dropdown.update(mm.find('.mm_dropdown', $optionList));

			});

			_.forEach($optionList, function (__$list, __listIndex) {

				init(__$list);

				var $dropdown = mm.find('.mm_dropdown', __$list);
				_.forEach($dropdown, function (__$dropdown, __index) {

					mm.event.on(mm.find('.btn_dropdown', __$dropdown), 'click', function (__e) {

						if (__$dropdown.classList.contains('__dropdown-on')) {
							mm.element.style($dropdown, { height: '' });
							mm.element.style($selected, { visibility: '' });

							return;
						}
						else {
							mm.element.style(__$dropdown, { height: mm.find('.mm_scroller', __$dropdown)[0].offsetHeight + 42 + 'px' });
							if (!mm.is.empty(mm.find('li', $selected))) mm.element.style($selected, { visibility: 'hidden' });
						}

						var optionArray = dataOption;
						if (__index === 1) {
							mm.element.remove(mm.find('li', __$dropdown));

							optionArray = (!_selectOption) ? dataOption[0].sub : dataOption.find(function (__option) {

								if (__option._name === _selectOption) return __option;

							});

							_.forEach(optionArray.sub, function (__optionSub) {

								var _optionHtml = mm.string.template('<li><button type="button" class="btn_option mm_flex"><b>${OPTION}</b></button></li>', { OPTION: __optionSub._name });
								if (__optionSub._qty === 0) _optionHtml = mm.string.template('<li><span class="btn_option mm_flex"><b>${OPTION}</b><b class="mm_text-secondary">(품절)</b></span></li>', { OPTION: __optionSub._name });

								var $item = mm.element.create(_optionHtml);

								if (__optionSub._qty >= 1 && __optionSub._qty <= 5) mm.element.append(mm.find('.btn_option', $item), mm.string.template('<b class="mm_text-primary">(${STOCK}개)</b>', { STOCK: __optionSub._qty }));
								mm.element.append(mm.find('ul', __$dropdown), $item);
								mm.data.get(mm.find('.btn_option', $item))._name = __optionSub._name;

							});
						}

					});

					mm.delegate.on(__$dropdown, '.btn_option', 'click', function (__e) {

						var _value = mm.data.get(this)._name;
						mm.find('.btn_dropdown b', __$dropdown)[0].textContent = _value;

						if (__index === 0) _selectOption = _value;
						else _selectOptionSub = _value;

						mm.dropdown.close(__$dropdown);

						if (!_selectOptionSub) {
							mm.element.attribute(mm.find('.btn_dropdown', __$dropdown.nextElementSibling), { disabled: false });
							mm.event.dispatch(mm.find('.btn_dropdown', __$dropdown.nextElementSibling), 'click');

							mm.class.add(__$dropdown, '__option-select');
							mm.element.style(__$dropdown, { height: '' });
							mm.element.style(__$dropdown.nextElementSibling, { height: mm.find('.mm_scroller', __$dropdown.nextElementSibling)[0].offsetHeight + 42 + 'px' });
						}
						else {
							if (__isResult !== true) gsap.to(__elements, { height: '75%', duration: mm.time._fast });

							var _isDuplicate = false;
							_.forEach(mm.find('.text_option', $selected[0]), function (__$option) {

								if (__$option.textContent === mm.string.template('${OPTION}/${OPTIONSUB}', { OPTION: _selectOption, OPTIONSUB: _selectOptionSub })) {
									_isDuplicate = true;
									init();

									mm.element.style($dropdown, { height: '' });
									mm.element.style($selected, { visibility: '' });
									mm.bom.alert('이미 선택된 옵션입니다.');

									return false;
								}

							});
							if (_isDuplicate) return false;

							var $selectList = mm.find('ul', $selected);
							if (mm.is.empty($selectList)) {
								$selectList = mm.element.create('<ul></ul>');
								mm.element.append($selected, $selectList);
							}

							optionObj = dataOption.find(function (__option) {

								return (__option._name === _selectOption);

							});

							var optionDetail = optionObj.sub.find(function (__optionSub) {

								return __optionSub._name === _selectOptionSub;

							});

							var _stock = optionDetail._qty;
							var $selectedItem = mm.element.create(mm.string.template([
								'<li>',
									'<div class="m__selected-info">',
										'<p class="text_product">${PRODUCT}</p>',
										'<p class="text_option">${OPTION}/${OPTIONSUB}</p>',
										'<p class="text_stock">남은수량 <span>${STOCK}</span>개</p>',
									'</div>',
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
								'</li>'
							], { PRODUCT: __data.product._name, PRICE: mm.number.comma(optionDetail._price), OPTION: _selectOption, OPTIONSUB: _selectOptionSub, STOCK: _stock }));

							var $optionText = mm.find('.text_option', $selectedItem)[0];
							$optionText.textContent = $optionText.textContent.replace(/^\-\/|\/\-$/g, '');
							if ($optionText.textContent === '-') $optionText.remove();

							if (_stock > 5) mm.element.remove(mm.find('.text_stock', $selectedItem));

							mm.element.attribute($selectedItem, { 'data-option': { _code: optionDetail._code, _price: optionDetail._price }});
							mm.element.append($selectList, $selectedItem);

							var $stepper = mm.find('[data-stepper]', $selectedItem);
							mm.element.attribute($stepper, { 'data-stepper': { _max: _stock }});
							mm.stepper.update($stepper);

							mm.data.get($stepper, 'data-stepper').onChange = function () { base.calcPrice(__elements); }
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

							mm.class.remove(__$dropdown.previousElementSibling, '__option-select');
							mm.element.style($selected, { visibility: '' });

							mm.apply(__data.onChange, $selected, [optionDetail._code, 'add']);

							mm.delay.on(init, { _time: 100 });

							mm.delegate.on($selectedItem, '.btn_option-remove', 'click', function (__e) {

								var removeOption = base.removeOption(this, dataOption);

								base.calcPrice(__elements);
								mm.apply(__data.onChange, $selectedItem, [removeOption._code, 'remove']);

							});
						}

					});

				});

			});

			if (__isResult === true) {
				optionObj = dataOption[0];
				_selectOption = optionObj._name;
				_selectOptionSub = optionObj.sub[0]._name;

				mm.event.dispatch(mm.find('.btn_option', $optionList)[0], 'click');
				mm.element.remove(mm.siblings(mm.find('.btn_size', $optionList)[0]));

				mm.class.add(mm.find('li', $selected)[0], '__selected-single');
			}

		},
		// 버튼형 옵션 선택
		button: function (__elements, __data, __isResult) {

			var $optionList = mm.find('.m_product-option-select', __elements);
			var $selected = mm.find('.m_product-option-selected', __elements);
			var $optionSum = mm.find('.m_product-option-footer', __elements);

			var dataOption = __data.product.options;

			var optionObj = null;
			var _selectOption = null;
			var _selectOptionSub = null;

			var _classSelect = '__option-select';

			function init(__$list) {

				optionObj = null;
				_selectOption = null;
				_selectOptionSub = null;

				mm.class.remove(mm.find(mm.selector(_classSelect, '.')), _classSelect);

				_.forEach((__$list) ? [__$list] : $optionList, function (__$list) {

					_.forEach(mm.find('ul',__$list), function (__$optionList, __index) {

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

			mm.delegate.on(document, '.btn_product-buy, .btn_option-close', 'click', function (__e) {

				init();

			});

			if (mm.is.empty(mm.find('ul', $optionList))) {
				mm.element.append($optionList, mm.string.template([
					'<h6 class="mm_strapline"><b>옵션1</b></h6>',
					'<div class="mm_scroller __scroller_x__">',
						'<ul></ul>',
					'</div>',
					'<h6 class="mm_strapline"><b>옵션2</b></h6>',
					'<div class="mm_scroller __scroller_x__">',
						'<ul></ul>',
					'</div>',
				]));
			}

			_.forEach($optionList, function (__$optionList, __optionIndex) {

				init();

				var $list = mm.find('ul', __$optionList);

				_.forEach($list, function (__$list, __index) {

					mm.delegate.on(__$list, '.btn_option', 'click', function (__e) {

						var $this = this;

						var _value = __e.target.textContent;
						if (__index === 0) _selectOption = _value;
						else _selectOptionSub = _value;

						if (mm.find(mm.selector(_classSelect, '.'), __$list)[0] != this) mm.class.remove(mm.find(mm.selector(_classSelect, '.'), __$list), _classSelect);
						else {
							init();

							return false;
						}

						mm.class.toggle($this, _classSelect);
						$this.setAttribute('title', '선택됨');

						if (__index === 0) {
							optionObj = dataOption.find(function (__option) {

								return (__option._name === _selectOption);

							});

							if (!_selectOptionSub) {
								var $optionListSub = $list[1];
								mm.element.remove(mm.find('li', $optionListSub));

								_.forEach(optionObj.sub, function (__optionSub) {

									var _itemHtml = mm.string.template('<li><button type="button" class="btn_option"><b>${OPTION}</b></button></li>', { OPTION: __optionSub._name });
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
							if (!_selectOption) {
								mm.element.remove(mm.find('li', $list[0]));

								_.forEach(dataOption, function (__option) {

									var _itemHtml = mm.string.template('<li><button type="button" class="btn_option"><b>${OPTION}</b></button></li>', { OPTION: __option._name });

									_.forEach(__option.sub, function (__optionSub) {

										if (__optionSub._name === _selectOptionSub && __optionSub._qty === 0) {

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

						if (_selectOption && _selectOptionSub) {
							if (__isResult !== true) gsap.to(__elements, { height: '75%', duration: mm.time._fast });

							var _isDuplicate = false;
							_.forEach(mm.find('.text_option', $selected[0]), function (__$option) {

								if (__$option.textContent === mm.string.template('${OPTION}/${OPTIONSUB}', { OPTION: _selectOption, OPTIONSUB: _selectOptionSub })) {
									_isDuplicate = true;
									init();

									mm.bom.alert('이미 선택된 옵션입니다.');

									return false;
								}

							});
							if (_isDuplicate) return false;

							var $selectList = mm.find('ul', $selected);
							if (mm.is.empty($selectList)) {
								$selectList = mm.element.create('<ul></ul>');
								mm.element.append($selected, $selectList);
							}

							var optionDetail = optionObj.sub.find(function (__optionSub) {

								return __optionSub._name === _selectOptionSub;

							});

							var _stock = optionDetail._qty;
							var $selectedItem = mm.element.create(mm.string.template([
								'<li>',
									'<div class="m__selected-info">',
										'<p class="text_product">${PRODUCT}</p>',
										'<p class="text_option">${OPTION}/${OPTIONSUB}</p>',
										'<p class="text_stock">남은수량 <span>${STOCK}</span>개</p>',
									'</div>',
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
								'</li>'
							], { PRODUCT: __data.product._name, PRICE: mm.number.comma(optionDetail._price), OPTION: _selectOption, OPTIONSUB: _selectOptionSub, STOCK: _stock }));

							var $optionText = mm.find('.text_option', $selectedItem)[0];
							$optionText.textContent = $optionText.textContent.replace(/^\-\/|\/\-$/g, '');
							if ($optionText.textContent === '-') $optionText.remove();

							if (_stock > 5) mm.element.remove(mm.find('.text_stock', $selectedItem));

							mm.element.attribute($selectedItem, { 'data-option': { _code: optionDetail._code, _price: optionDetail._price }});
							mm.element.append($selectList, $selectedItem);

							var $stepper = mm.find('[data-stepper]', $selectedItem);
							mm.element.attribute($stepper, { 'data-stepper': { _max: _stock }});
							mm.stepper.update($stepper);

							mm.data.get($stepper, 'data-stepper').onChange = function () { base.calcPrice(__elements); }
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

							mm.apply(__data.onChange, $selected, [optionDetail._code, 'add']);

							mm.delay.on(init, { _time: 100 });

							mm.delegate.on($selectedItem, '.btn_option-remove', 'click', function (__e) {

								var removeOption = base.removeOption(this, dataOption);

								base.calcPrice(__elements);
								mm.apply(__data.onChange, $selectedItem, [removeOption._code, 'remove']);

							});
						}

					});

				});

			});

			if (__isResult === true) {
				optionObj = dataOption[0];
				_selectOption = optionObj._name;
				_selectOptionSub = optionObj.sub[0]._name;

				mm.event.dispatch(mm.find('.btn_option', $optionList)[0], 'click');
				mm.element.remove(mm.siblings(mm.find('.btn_size', $optionList)[0]));

				mm.class.add(mm.find('li', $selected)[0], '__selected-single');
			}

		}
	};

})();
//> 옵션 선택

//< 레디
mm.ready(function () {

	// 품절임박 숨김
	(function (__$stock) {

		if (!__$stock) return;

		gsap.fromTo('.m_prodetail-head-stock .mco_clock', { rotate: -15 }, { rotate: 15, duration: 0.05, ease: 'linear.none', yoyo: true, yoyoEase: 'linear.none', repeat: 100 });
		gsap.to('.m_prodetail-head-stock .mco_clock', { scale: 1.4, duration: 0.4, delay: 0.5, ease: 'bounce.out', yoyo: true, repeat: 5, yoyoEase: 'back.in',
			onComplete: function () {

				gsap.to(__$stock, { autoAlpha: 0, height: 0, y: 0, duration: 0.4, delay: 2, ease: 'cubic.inOut' });

			},
		});

	})(mm.find('.m_prodetail-head-stock')[0]);

	// 탭메뉴 fixed
	var $header = mm.find('.mm_header')[0];
	var $tab = mm.find('.m_prodetail-tab .mm_tabmenu')[0];
	var _tabLimit = mm.element.position($tab).top - $header.offsetHeight - mm.element.position($header).top;
	var _classSticky = '__tabmenu-sticky';

	function tabSticky () {

		if (mm.element.offset($tab).top < $header.offsetHeight + mm.element.position($header).top) $tab.classList.add(_classSticky);
		else $tab.classList.remove(_classSticky);

	}

	mm.event.on(mm.scroll.el, 'scroll', tabSticky);
	tabSticky();

	mm.event.on(mm.find('.btn_tab', $tab), 'click', function (__e) {

		__e.preventDefault();

		if ($tab.classList.contains(_classSticky)) mm.scroll.to(_tabLimit);

	});

	// 남은 수량의 글자가 영역을 넘어 길어지는 경우 '9999+'로 대체
	(function (__$timeSale) {

		if (!__$timeSale) return;

		var $stock = mm.find('.text_stock strong', __$timeSale)[0];
		if ($stock.textContent.trim() > 9999) $stock.textContent = '9999+';

		mm.event.on(window, 'load resize', function () {

			var __$timeSale = mm.find('.m_prodetail-special')[0];
			if (!__$timeSale.classList.contains('__switch-on')) mm.element.style(__$timeSale, { 'width': mm.number.unit(window.outerWidth - 28) });

		});

	})(mm.find('.m_prodetail-special')[0]);

});
//> 레디
