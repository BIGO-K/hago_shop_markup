'use strict';

//< 옵션 변경
function cartOption(__json) {

	var _dataName = 'data-product';

	var $element = mm.ui.element(_dataName);
	var $product = mm.find('.mm_product-item', $element);
	var $cart = mm.find('.m_cart-option', $element);
	var $layer = mm.find('.mm_layer');
	var $optionBox = mm.find('.m_prodetail-option-list', $layer);
	var $stepper = mm.find('[data-stepper]', $layer);

	var data = __json;

	var _classOpen = '__layer-open';
	var _classSelect = '__option-select';

	function optionInit(__product, __$cart, __selectedOption) {

		var options = __product.options;

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
				var $optionList = mm.find('ul', $optionBox);
				mm.element.remove(mm.find('li', $optionList));

				_.forEach($optionList, function (__$optionList, __index) {

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

						mm.element.append(__$optionList, $option);

					});

				});
				break;
		}

		mm.data.get($stepper, 'data-stepper')._max = (dataOptionSub._qty === 0) ? 1 : dataOptionSub._qty;
		mm.stepper.change($stepper, (__selectedOption) ? __selectedOption._qty : 1);

		var $stock = mm.find('.text_stock', $layer)[0];
		$stock.textContent = '';
		if (dataOptionSub._qty > 0 && dataOptionSub._qty <= 5) $stock.textContent = mm.string.template('구매가능 수량 ${STOCK}개', { STOCK: dataOptionSub._qty });

	}

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

	_.forEach($cart, function (__$cart, __index) {

		var dataProduct = mm.extend(data.product[__index]);
		if (!dataProduct.options) return;

		var _optionType = (dataProduct._isFunding || dataProduct.options.length >= 15 || dataProduct.options[0].sub.length >= 15) ? 'select' : 'button';

		var selectedOption = mm.extend(dataProduct.selected);
		var _beforeOption = null;
		var _beforeOptionSub = null;

		var $btnChange = mm.find('.btn_option-change', __$cart);

		var dataOptionSub = {};
		var dataOption = dataProduct.options.find(function (__option) {

			return dataOptionSub = __option.sub.find(function (__optionSub) {

				return (selectedOption._code === __optionSub._code);

			});

		});

		mm.event.on($btnChange, 'click', function (__e) {

			if (mm.class.every($layer, _classOpen)) {
				mm.class.remove($layer, _classOpen);
				return;
			}

			_beforeOption = (dataOptionSub._qty != 0) ? mm.extend(dataOption._name) : null;
			_beforeOptionSub = (dataOptionSub._qty != 0) ? mm.extend(dataOptionSub._name) : null;

			mm.element.remove(mm.find('.m_prodetail-option-item', $optionBox));

			switch (_optionType) {
				case 'select':
					if (!mm.find('.mm_dropdown', $optionBox)[0]) {
						mm.element.append($optionBox, mm.string.template([
							'<div class="m_prodetail-option-item">',
								'<h6><b>옵션1</b></h6>',
								'<div class="mm_dropdown" data-dropdown>',
									'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명1</b><i class="mco_dropdown-bold"></i></button>',
									'<div class="mm_dropdown-item">',
										'<div class="mm_dropdown-item-inner">',
											'<div class="mm_scroller"><ul></ul></div>',
										'</div>',
									'</div>',
								'</div>',
							'</div>',
							'<div class="m_prodetail-option-item">',
								'<h6><b>옵션2</b></h6>',
								'<div class="mm_dropdown" data-dropdown>',
									'<button type="button" class="btn_dropdown" title="펼쳐보기"><b>옵션명2</b><i class="mco_dropdown-bold"></i></button>',
									'<div class="mm_dropdown-item">',
										'<div class="mm_dropdown-item-inner">',
											'<div class="mm_scroller"><ul></ul></div>',
										'</div>',
									'</div>',
								'</div>',
							'</div>',
						]));

						mm.element.attribute(mm.find('.mm_dropdown', $optionBox)[0], { 'data-dropdown': { _group: 'dev_option-select' }});
						mm.element.attribute(mm.find('.mm_dropdown', $optionBox)[1], { 'data-dropdown': { _group: 'dev_option-select' }});
					}

					mm.class.add($optionBox, '__list_select__');
					break;
				case 'button':
					if (!mm.find('ul', $optionBox)[0]) {
						mm.element.append($optionBox, mm.string.template([
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
					mm.class.remove($optionBox, '__list_select__');
					break;
			}

			mm.class.add($layer, _classOpen);
			mm.element.append(this.closest('.m_cart-option'), $layer);
			mm.stepper.update($layer);

			optionInit(dataProduct, __$cart, selectedOption);

			if (dataProduct.options.length === 1 && dataProduct.options[0].sub.length === 1) $layer[0].classList.add('__selected-single');
			else $layer[0].classList.remove('__selected-single');

		});

		mm.delegate.on(__$cart, '.btn_option', 'click', function () {

			var $this = this;
			var _selectOptionName = mm.data.get($this)._name;

			var $stock = mm.find('.text_stock', $layer)[0];
			$stock.textContent = '';

			switch (_optionType) {
				case 'select':
					var $dropdown = $this.closest('.mm_dropdown');
					var $optionItem = $dropdown.closest('.m_prodetail-option-item');
					var $nextOptionItem = $optionItem.nextElementSibling;

					var _optionIndex = mm.element.index(mm.find('.m_prodetail-option-item', $optionBox), $optionItem);
					var $list = mm.find('ul', $nextOptionItem);

					var $btnDropdown = mm.find('.btn_dropdown', $dropdown);

					if (_optionIndex === 0) {
						_beforeOption = _selectOptionName;
						_beforeOptionSub = null;
					}
					else _beforeOptionSub = _selectOptionName;

					if (_optionIndex === 0) {
						mm.find('.btn_dropdown b', $nextOptionItem)[0].textContent = '옵션명2';
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
						mm.dropdown.open(mm.find('.mm_dropdown', $nextOptionItem));
					}
					else {
						mm.find('b', $btnDropdown)[0].textContent = _beforeOptionSub;
						mm.dropdown.close($dropdown);
					}
					break;
				case 'button':
					var $optionList = mm.find('ul', $optionBox);
					var _optionIndex = mm.element.index($optionList, $this.closest('ul'));
					var $list = $optionList[Math.abs(_optionIndex - 1)];

					mm.class.remove(mm.find(mm.selector(_classSelect, '.'), $this.closest('ul')), _classSelect);

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
							if (!_beforeOption) optionInit(dataProduct, $optionBox);

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
							mm.element.remove(mm.find('li', $optionList[0]));
							_.forEach(dataProduct.options, function (__option) {

								var _isSoldoutAll = false;
								var _soldoutCount = 0;

								_.forEach(__option.sub, function (__optionSub) {

									if (__optionSub._qty === 0) _soldoutCount++;
									if (_soldoutCount === __option.sub.length) _isSoldoutAll = true;

								});

								var $option = createOption(_optionType, __option, _isSoldoutAll);

								if (!_isSoldoutAll && (_beforeOption === __option._name)) mm.class.add(mm.find('.btn_option', $option), _classSelect);
								mm.element.append($optionList[0], $option);

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

		mm.delegate.on(__$cart, '.btn_option-apply', 'click', function () {

			if (!_beforeOption || !_beforeOptionSub) {
				mm.bom.alert('선택된 옵션이 없습니다.');
				return;
			}

			var $this = this;
			var _isOverwrite = false;
			var _classSoldout = '__select-soldout';

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

			selectedOption._code = dataOptionSub._code;
			selectedOption._qty = _qty;

			var $textOption = mm.find('.text_option', $product[__index])[0];
			$textOption.textContent = mm.string.template('${OPTION} ${SUBOPTION} / ${QTY}개', { OPTION: _beforeOption, SUBOPTION: _beforeOptionSub, QTY: _qty });
			mm.find('.text_price strong', __$cart.closest('li'))[0].textContent = mm.number.comma(_price);

			if (mm.class.every($btnChange, _classSoldout)) {
				mm.class.remove($btnChange, _classSoldout);
				mm.class.remove($textOption, 'mm_text-secondary');
				mm.element.remove(mm.find('span', $textOption));
			}

			mm.class.remove($layer[0], _classOpen);
			mm.apply(data.onChange, $this, [selectedOption._code, selectedOption._qty, _price, 'change']);

		});

	});

}
//> 옵션 변경

//< 레디
mm.ready(function () {

	mm.event.on(document, 'click', function (__e) {

		if (!mm.find('.mm_layer')[0].classList.contains('__layer-open') || __e.target.closest('.mm_bom')) return;

		if (__e.target.classList.contains('btn_option') || __e.target.classList.contains('btn_option-change')) return;
		else if (!__e.target.closest('.mm_layer') || __e.target.closest('.btn_layer-close')) mm.find('.mm_layer')[0].classList.remove('__layer-open');

	});

});
//> 레디
