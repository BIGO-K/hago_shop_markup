'use strict';

function cartOption(__json) {

	var _dataName = 'data-product';

	var $element = mm.ui.element(_dataName);
	var $product = mm.find('.mm_product-item', $element);
	var data = __json;

	var _classSelect = '__option-select';

	// 옵션 초기화
	function optionInit(__product, __$prod, __selectedOption) {

		var options = __product.options;
		var $optionBox = mm.find('.m_product-option-select', __$prod);
		var dataOptionSub = {};
		var dataOption = options.find(function (__option) {

			return dataOptionSub = __option.sub.find(function (__optionSub) {

				if (__selectedOption) return (__selectedOption._code === __optionSub._code);
				else return true;

			});

		});

		var _optionType = (__product._isFunding || options.length >= 15 || options[0].sub.length >= 15) ? 'select' : 'button';
		switch (_optionType) {
			case 'select':
				var $dropdown = mm.find('.mm_dropdown', $optionBox);
				mm.element.remove(mm.find('li', $dropdown));

				_.forEach($dropdown, function (__$dropdown, __index) {

					if (__index === 0) {
						mm.class.remove(__$dropdown, _classSelect);
						mm.find('.btn_dropdown b', __$dropdown)[0].textContent = '옵션명1';
					}
					var $list = mm.find('ul', __$dropdown);

					_.forEach((__index === 0) ? options : dataOption.sub, function (__option) {

						var _isSoldoutAll = false;
						var _isSoldout = false;
						if (__index === 0) {
							var _soldoutCount = 0;

							_.forEach(__option.sub, function (__optionSub) {

								if (__optionSub._qty === 0) _soldoutCount++;
								if (_soldoutCount === __option.sub.length) _isSoldoutAll = true;

							});
						}
						else {
							if (dataOptionSub._qty === 0) return false;
							_isSoldout = (__option._qty === 0) ? true : false;
						}

						var $option = createOption(_optionType, __option, (__index === 0) ? _isSoldoutAll : _isSoldout);

						if (__index != 0) {
							if (!_isSoldout && __option._qty <= 5) mm.element.append(mm.find('.btn_option', $option), mm.string.template('<b>(${STOCK}개)</b>', { STOCK: __option._qty }));
						}

						if (dataOptionSub._qty > 0) {
							if ((dataOption._name === __option._name) || (__selectedOption._code === __option._code)) {
								mm.find('.btn_dropdown b', __$dropdown)[0].textContent = __option._name;
								mm.class.add(__$dropdown, _classSelect);
							}
						}

						mm.element.append($list, $option);

					});

				});

				break;

			case 'button':
				var $scroller = mm.find('.mm_scroller', $optionBox);
				mm.element.remove(mm.find('li', $scroller));

				_.forEach($scroller, function (__$scroller, __index) {

					_.forEach((__index === 0) ? options : dataOption.sub, function (__option) {

						var _isSoldoutAll = false;
						var _isSoldout = false;

						if (__index === 0) {
							var _soldoutCount = 0;

							_.forEach(__option.sub, function (__optionSub) {

								if (__optionSub._qty === 0) _soldoutCount++;
								if (_soldoutCount === dataOption.sub.length) _isSoldoutAll = true;

							});
						}
						else {
							if (__selectedOption) _isSoldout = (__option._qty === 0 && dataOptionSub._qty > 0) ? true : false;
						}

						var $option = createOption(_optionType, __option, (__index === 0) ? _isSoldoutAll : _isSoldout);

						if (__selectedOption && !_isSoldoutAll && dataOptionSub._qty > 0) {
							if ((dataOption._name === __option._name) || (dataOptionSub._code === __option._code)) mm.class.add(mm.find('.btn_option', $option), _classSelect);
						}

						mm.element.append(mm.find('ul', __$scroller), $option);

					});

				});

				break;
		}

		var $stepper = mm.find('[data-stepper]', __$prod);
		mm.data.get($stepper, 'data-stepper')._max = (dataOptionSub._qty === 0) ? 1 : dataOptionSub._qty;
		mm.stepper.change($stepper, (__selectedOption) ? __selectedOption._qty : 1);

		var $stock = mm.find('.text_stock', __$prod)[0];
		$stock.textContent = '';
		if (dataOptionSub._qty > 0 && dataOptionSub._qty <= 5) $stock.textContent = mm.string.template('구매가능 수량 ${STOCK}개', { STOCK: dataOptionSub._qty });

	}

	// 옵션 생성
	function createOption(__type, __option, __isSoldout) {

		var $option = mm.element.create(mm.string.template('<li><button type="button" class="btn_option mm_flex"><b>${OPTION}</b></button></li>', { OPTION: __option._name }));

		switch (__type) {
			case 'select':
				if (__isSoldout) {
					mm.element.remove(mm.find('.btn_option', $option));
					mm.element.append($option, mm.string.template('<span class="btn_option mm_flex"><b>${OPTION}</b><b>(품절)</b></span>', { OPTION: __option._name }));
				}
				break;
			case 'button':
				if (__isSoldout) {
					mm.element.remove(mm.find('.btn_option', $option));
					mm.element.append($option, mm.string.template([
						'<span class="btn_option" title="품절">',
							'<b>${OPTION}</b>',
							'<svg><line x1="0" y1="100%" x2="100%" y2="0" stroke="#cdcdcd" stroke-width="1" /></svg>',
						'</span>',
					], { OPTION: __option._name }));
				}
				break;
		}

		mm.data.get(mm.find('.btn_option', $option))._name = __option._name;

		return $option;

	}

	_.forEach($product, function (__$prod, __prodIndex) {

		var dataProduct = mm.extend(data.product[__prodIndex]);
		if (!dataProduct.options) return;

		var _optionType = (dataProduct._isFunding || dataProduct.options.length >= 15 || dataProduct.options[0].sub.length >= 15) ? 'select' : 'button';

		var $optionBox = mm.find('.m_product-option-select', __$prod);
		var $stepper = mm.find('[data-stepper]', __$prod);

		var selectedOption = mm.extend(dataProduct.selected);

		var dataOptionSub = {};
		var dataOption = dataProduct.options.find(function (__option) {

			return dataOptionSub = __option.sub.find(function (__optionSub) {

				return (selectedOption._code === __optionSub._code);

			});

		});

		var _beforeOption = (dataOptionSub._qty != 0) ? mm.extend(dataOption._name) : null;
		var _beforeOptionSub = (dataOptionSub._qty != 0) ? mm.extend(dataOptionSub._name) : null;

		switch (_optionType) {
			case 'select':
				if (!mm.find('.mm_dropdown', $optionBox)[0]) {
					mm.element.append($optionBox, mm.string.template([
						'<div class="mm_dropdown" data-dropdown>',
							'<h6 class="mm_strapline"><b>옵션1</b></h6>',
							'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명1</b><i class="mco_dropdown-bold"></i></button>',
							'<div class="mm_dropdown-item">',
								'<div class="mm_dropdown-item-inner">',
									'<div class="mm_scroller"><ul></ul></div>',
								'</div>',
							'</div>',
						'</div>',
						'<div class="mm_dropdown" data-dropdown>',
							'<h6 class="mm_strapline"><b>옵션2</b></h6>',
							'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명2</b><i class="mco_dropdown-bold"></i></button>',
							'<div class="mm_dropdown-item">',
								'<div class="mm_dropdown-item-inner">',
									'<div class="mm_scroller"><ul></ul></div>',
								'</div>',
							'</div>',
						'</div>'
					]));

					mm.element.attribute(mm.find('.mm_dropdown', $optionBox)[0], { 'data-dropdown': { _group: 'dev_option-select' + mm.element.index($product, __$prod) }});
					mm.element.attribute(mm.find('.mm_dropdown', $optionBox)[1], { 'data-dropdown': { _group: 'dev_option-select' + mm.element.index($product, __$prod) }});
				}
				break;
			case 'button':
				if (!mm.find('.mm_scroller', $optionBox)[0]) {
					mm.element.append($optionBox, mm.string.template([
						'<h6 class="mm_strapline"><b>옵션1</b></h6>',
						'<div class="mm_scroller __scroller_x__"><ul></ul></div>',
						'<h6 class="mm_strapline"><b>옵션2</b></h6>',
						'<div class="mm_scroller __scroller_x__"><ul></ul></div>'
					]));
				}
				break;
		}

		mm.stepper.update($element);
		optionInit(dataProduct, __$prod, selectedOption);

		if (dataOptionSub._qty === 0) mm.event.dispatch(mm.find('.btn_option-switch', __$prod), 'click');

		// 옵션/수량변경 열기/닫기
		mm.event.on(mm.find('.btn_option-switch', __$prod), 'click', function () {

			var _isOpen = !this.getAttribute('title');
			if (!_isOpen) {
				optionInit(dataProduct, __$prod, selectedOption);

				dataProduct.options.find(function (__option) {

					return __option.sub.find(function (__optionSub) {

						if (__optionSub._code === selectedOption._code) {
							if (__optionSub._qty != 0) {
								_beforeOption = __option._name;
								_beforeOptionSub = __optionSub._name;
							}
							else {
								_beforeOption = null;
								_beforeOptionSub = null;
							}

							return true;
						}

					});

				});

				if (mm.find('.mm_dropdown', __$prod)[0]) mm.dropdown.close(mm.find('.mm_dropdown', __$prod));
			}

			// 옵션 1개 선택 숨김
			var $selected = mm.find('.m_product-option-select', __$prod)[0];
			if (dataProduct.options.length === 1 && dataProduct.options[0].sub.length === 1) $selected.classList.add('__selected-single');
			else $selected.classList.remove('__selected-single');

		});

		// 옵션변경 취소
		mm.event.on(mm.find('.btn_option-cancel', __$prod), 'click', function () {

			mm.event.dispatch(mm.find('.btn_option-switch', __$prod), 'click');

		});

		// 옵션선택
		mm.delegate.on($optionBox, '.btn_option', 'click', function () {

			var $this = this;
			var _selectOptionName = mm.data.get($this)._name;

			var $stock = mm.find('.text_stock', __$prod)[0];
			$stock.textContent = '';

			switch (_optionType) {
				case 'select':
					var $dropdown = $this.closest('.mm_dropdown');
					var _optionIndex = mm.element.index(mm.find('.mm_dropdown', __$prod), $dropdown);
					var $list = mm.find('ul', $dropdown.nextElementSibling);

					var $btnDropdown = mm.find('.btn_dropdown', $dropdown);

					if (_optionIndex === 0) {
						_beforeOption = _selectOptionName;
						_beforeOptionSub = null;
					}
					else _beforeOptionSub = _selectOptionName;

					if (_optionIndex === 0) {
						mm.find('.btn_dropdown b', $dropdown.nextElementSibling)[0].textContent = '옵션명2';
						mm.find('b', $btnDropdown)[0].textContent = _beforeOption;

						var options = dataProduct.options.find(function (__option) {

							return (__option._name === _selectOptionName);

						});

						mm.element.remove(mm.find('li', $list));
						_.forEach(options.sub, function (__optionSub) {

							var _isSoldout = (__optionSub._qty === 0) ? true : false;
							var $option = createOption(_optionType, __optionSub, _isSoldout);

							if (!_isSoldout && __optionSub._qty <= 5) mm.element.append(mm.find('.btn_option', $option), mm.string.template('<b>(${STOCK}개)</b>', { STOCK: __optionSub._qty }));

							mm.data.get(mm.find('.btn_option', $option))._name = __optionSub._name;
							mm.element.append($list, $option);

						});

						mm.class.add($dropdown, _classSelect);
						mm.dropdown.open($dropdown.nextElementSibling);
					}
					else {
						mm.find('b', $btnDropdown)[0].textContent = _beforeOptionSub;
						mm.dropdown.close($dropdown);
					}
					break;
				case 'button':
					var $scroller = mm.find('.mm_scroller', __$prod);
					var _optionIndex = mm.element.index($scroller, $this.closest('.mm_scroller'));
					var $list = mm.find('ul', $scroller[Math.abs(_optionIndex - 1)]);

					mm.class.remove(mm.find(mm.selector(_classSelect, '.'), $this.closest('.mm_scroller')), _classSelect);

					if (_optionIndex === 0) {
						if (_beforeOption === _selectOptionName) {
							mm.element.remove(mm.find('li', $list));
							_.forEach(dataProduct.options[0].sub, function (__optionSub) {

								var $option = mm.element.create(mm.string.template('<li><button type="button" class="btn_option"><b>${OPTION}</b></button></li>', { OPTION: __optionSub._name }));

								mm.data.get(mm.find('.btn_option', $option))._name = __optionSub._name;
								mm.element.append($list, $option);

							});

							_beforeOption = null;
							_beforeOptionSub = null;

							return;
						}

						_beforeOption = _selectOptionName;
					}
					else {
						if (_beforeOptionSub === _selectOptionName) {
							if (!_beforeOption) optionInit(dataProduct, __$prod);

							_beforeOptionSub = null;

							return;
						}

						_beforeOptionSub = _selectOptionName;
					}

					mm.class.add($this, _classSelect);

					if (_optionIndex === 0) {
						var options = dataProduct.options.find(function (__option) {

							return (__option._name === _selectOptionName);

						});

						mm.element.remove(mm.find('li', $list));
						_.forEach(options.sub, function (__optionSub) {

							var _isSoldout = (__optionSub._qty === 0) ? true : false;
							var $option = createOption(_optionType, __optionSub, _isSoldout);

							if (_beforeOptionSub === __optionSub._name) {
								if (_isSoldout) _beforeOptionSub = null;
								else mm.class.add(mm.find('.btn_option', $option), _classSelect);
							}

							mm.element.append($list, $option);

						});

						if (_beforeOptionSub) {
							mm.element.remove(mm.find('li', $scroller[0]));
							_.forEach(dataProduct.options, function (__option) {

								var _isSoldoutAll = false;
								var _soldoutCount = 0;

								_.forEach(__option.sub, function (__optionSub) {

									if (__optionSub._qty === 0) _soldoutCount++;
									if (_soldoutCount === __option.sub.length) _isSoldoutAll = true;

								});

								var $option = createOption(_optionType, __option, _isSoldoutAll);

								if (!_isSoldoutAll && (_beforeOption === __option._name)) mm.class.add(mm.find('.btn_option', $option), _classSelect);
								mm.element.append(mm.find('ul', $scroller[0]), $option);

							});
						}
					}
					else {
						if (!_beforeOption) {
							mm.element.remove(mm.find('li', $list));
							_.forEach(dataProduct.options, function (__option) {

								var _isSoldout = false;
								_.forEach(__option.sub, function (__optionSub) {

									if (__optionSub._name === _selectOptionName && __optionSub._qty === 0) {
										_isSoldout = true;

										return false;
									}

								});

								mm.element.append($list, createOption(_optionType, __option, _isSoldout));

							});
						}
					}
					break;
			}

			if (_beforeOption && _beforeOptionSub) {
				var changeOptionDetail = null;
				dataProduct.options.find(function (__option) {

					if (_beforeOption === __option._name) {
						return changeOptionDetail = __option.sub.find(function (__optionSub) {

							return (_beforeOptionSub === __optionSub._name);

						});
					}

				});

				mm.data.get($stepper, 'data-stepper')._max = changeOptionDetail._qty;
				mm.stepper.update($stepper);

				$stock.textContent = '';
				if (changeOptionDetail._qty > 0 && changeOptionDetail._qty <= 5) $stock.textContent = mm.string.template('구매가능 수량 ${STOCK}개', { STOCK: changeOptionDetail._qty });
			}

		});

		// 옵션변경 적용
		mm.event.on(mm.find('.btn_option-change', __$prod), 'click', function () {

			if (!_beforeOption || !_beforeOptionSub) {
				mm.bom.alert('선택된 옵션이 없습니다.');
				return;
			}

			var _isOverwrite = false;
			dataOption = dataProduct.options.find(function (__option) {

				if (_beforeOption === __option._name) {
					return dataOptionSub = __option.sub.find(function (__optionSub) {

						if (selectedOption._code === __optionSub._code) {
							if (dataOption._name === _beforeOption && dataOptionSub._name === _beforeOptionSub) _isOverwrite = true;
						}

						return (_beforeOptionSub === __optionSub._name);

					});
				}

			});

			var _qty = Number(mm.find('.text_stepper', $stepper)[0].value);
			var _price = dataOptionSub._price * _qty;

			if (_isOverwrite && selectedOption._qty === _qty) {
				mm.bom.alert('이미 선택된 옵션입니다.');
				return;
			}

			mm.find('.text_option', __$prod)[0].textContent = mm.string.template('${OPTION} ${SUBOPTION} / ${QTY}개', { OPTION: _beforeOption, SUBOPTION: _beforeOptionSub, QTY: _qty });;
			mm.find('.text_price strong', __$prod)[0].textContent = mm.number.comma(_price);

			selectedOption._code = dataOptionSub._code;
			selectedOption._qty = _qty;

			if (this.closest('.__select-soldout')) {
				mm.class.remove(this.closest('.__select-soldout'), '__select-soldout');
				mm.class.remove(mm.find('.text_option', $product), 'mm_text-secondary');
			}

			mm.event.dispatch(mm.find('.btn_option-switch', __$prod), 'click');

			mm.apply(data.onChange, this, [selectedOption._code, selectedOption._qty, _price, 'change']);

		});

	});

}