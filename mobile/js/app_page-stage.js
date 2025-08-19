'use strict';

mm.stage = (function () {

	var base = {
		pages: [],
		replaceIframe() {

			var state = mm.history.state;
			var $window = mm.find('iframe', base.pages[state._pageIndex - state._keepIndex])[0].contentWindow;

			$window.mm.history.replace(mm.history.states, top.location.href, { _isTop: false });
			$window.location.replace(top.location.href.split('#')[0]);

		},
		addStage(__sessionPage, __option) {

			mm.popup.open(__sessionPage._pageUrl, mm.extend({ _isHistorySave: false }, __option));

		},
		removeStage() {

			var $removePages = base.pages.splice(mm.history.state._pageIndex + 1);
			mm.element.remove($removePages);

			var $items = Object.values(mm.find('.mm_popup-item'));
			var $pages = _.compact(base.pages);
			_.forEach($items, function (__$item) {

				if (!$pages.includes(__$item)) __$item.remove();

			});

		},
		sortStage(__isAdd) {

			mm.delay.on(function () {

				var state = mm.history.state;

				mm.element.remove('.m_product-clone');
				mm.element.hide(_.reject(base.pages, function (__$page, __index) { return __index >= state._pageIndex - state._keepIndex; }));

				mm.element.show(base.pages[state._pageIndex - state._keepIndex]);

			}, { _time: (__isAdd) ? mm.time._base : 0, _isSec: true, _name: 'DELAY_SORT_HIDE', _isOverwrite: true });

		},
		findNotKeepIndex(__sessionPage, __index) {

			var takePages = _.take(mm.history.session.pages, __index + 1);
			return _.findLastIndex(takePages, function (__page) { return __page._pageType !== 'keep'; });

		},
	};

	(function () {

		mm._isStage = true;

		var _directUrl = mm.storage.get('session', 'directPage');
		if (!_directUrl) _directUrl = mm._mainUrl;

		mm.storage.remove('session', 'directPage');

		// 첫 페이지
		var stateBackup = mm.storage.get('session', 'stateBackup');
		var _sessionIndex = (stateBackup) ? stateBackup._sessionIndex : null;
		var _isNewSession = true;

		// 이전 세션으로 연결
		var session = mm.history.session;
		var sessionHistory = (mm.is.empty(session)) ? null : session.histories[_sessionIndex];
		if (Number.isFinite(_sessionIndex) && sessionHistory && _directUrl === sessionHistory.pages[sessionHistory._stageIndex]._pageUrl) {
			_isNewSession = false;
			mm.history.state = stateBackup;
			mm.history.replace(stateBackup, _directUrl);
		}
		// 새로운 세션으로 연결
		else {
			if (!session.histories) session.histories = [];
			session.histories.push({});

			_sessionIndex = session.histories.length - 1;
			session.histories[_sessionIndex] = {
				_stageIndex: 0,
				_isReloadStage: false,
				pages: [{
					changes: [],
					_pageUrl: mm._mainUrl,
					_pageType: 'main',
				}],
			};

			mm.history.session = session;
			mm.history.replace({ _isNew: true, _sessionIndex: _sessionIndex, _pageIndex: 0, _keepIndex: 0 }, mm._mainUrl);

			if (_directUrl === mm._mainUrl) _isNewSession = false;
		}

		mm.popup.open(_directUrl, { _isHistorySave: _isNewSession });

		// 히스토리 변경
		mm.event.on(window, 'popstate', function (__e) {

			var state = mm.history.state;
			var session = mm.history.session;
			var sessionHistory = session.history;
			var _beforeIndex = sessionHistory._stageIndex;
			var _isReloadStage = sessionHistory._isReloadStage;
			var currentSessionPage = session.pages[state._pageIndex];
			var beforeSessionPage = session.pages[_beforeIndex];

			sessionHistory._stageIndex = state._pageIndex;
			sessionHistory._isReloadStage = false;
			mm.history.session = session;

			mm.storage.set('session', 'stateBackup', state);

			if (mm.storage.get('session', 'isCancelPopstate') === true) {
				mm.storage.remove('session', 'isCancelPopstate');
				return;
			}

			mm.modal.close();

			if (state._pageIndex < _beforeIndex) {
				if (beforeSessionPage._pageType === 'keep' && base.findNotKeepIndex(currentSessionPage, state._pageIndex) === base.findNotKeepIndex(beforeSessionPage, _beforeIndex)) {
					base.replaceIframe();
				}
				else {
					if (base.pages[state._pageIndex - state._keepIndex]) {
						base.sortStage();
						mm.popup.close({ _isHistoryBack: true });
						mm.loading.hide();

						if (session.pages[state._pageIndex + 1]._pageType === 'keep') base.replaceIframe();
					}
					else {
						base.addStage(currentSessionPage, { _isHistoryBack: true });
					}
				}

				if (_isReloadStage && session.page._pageType === 'main') location.reload();// 전체 새로고침
			}
			else {
				if (currentSessionPage._pageType === 'keep' && base.findNotKeepIndex(currentSessionPage, state._pageIndex) === base.findNotKeepIndex(beforeSessionPage, _beforeIndex)) {
					base.replaceIframe();
				}
				else {
					base.addStage(currentSessionPage);
				}
			}

		});

		// 커스텀이벤트
		mm.observer.on(window, mm.event.type.stage_add, function (__e) {

			mm.delay.on(function () {

				var $page = mm.find('.mm_popup-item.__popup-on')[0];
				if ($page) {
					base.pages[mm.history.state._pageIndex] = $page;
					base.sortStage(true);

					if (__e.detail._isRemove === true) base.removeStage();
				}

			}, { _name: 'DELAY_STAGE_ADD', _isOverwrite: true });

		});
		mm.observer.on(window, mm.event.type.stage_remove, function (__e) {

			base.removeStage();

		});

	})();

	return {
		//- 스테이지에 저장된 페이지 전체
		get pages() {

			return base.pages;

		},
		//- 현재 활성화된 페이지
		get activePage() {

			var state = mm.history.state;
			return base.pages[state._pageIndex - state._keepIndex];

		},
	};

})();
