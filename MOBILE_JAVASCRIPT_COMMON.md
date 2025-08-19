# common.js 파일 설명
+ 퍼블리싱에서 제작한 **_app_common.js_*_, _*_app_page-common.js_** 파일에 대한 설명입니다.
<br><br>
- - -
## app_common.js
+ 범용적으로 사용하는 컴포넌트&헬퍼 파일입니다.
+ **mm**(m.monstar) 오브젝트로 구성되어 있습니다.

### variables
+ mm.**\_isXXX**
	- 현재 상태를 **true/false**로 리턴합니다.
	```JavaScript
	mm._isPublish;// 퍼블 테스트 경로
	mm._isIframe;// 아이프레임 페이지
	mm._isModal;// 모달 페이지
	mm._isPopup;// 팝업 페이지
	mm._isFrame;// 컨텐츠 페이지
	mm._isError;// 에러 페이지
	mm._isMain;// 메인 페이지
	mm._isSide;// 사이드메뉴 페이지
	mm._isSearch;// 검색 페이지
	mm._isProduct;// 상품상세 페이지
	mm._isTouch;// 화면 터치 여부
	mm._isStage;// 스테이지 활성 여부
	mm._isLandscape;// 모바일 가로모드
	```
+ mm.**\_homeUrl**
	- 홈(스테이지) 경로를 퍼블 경로와 실서버 경로를 확인하여 리턴합니다.
	- getter로 값을 변경할 수 없습니다.
	```JavaScript
	mm._homeUrl;// 실서버(/), 퍼블(_stage.html)
	```
+ mm.**\_mainUrl**
	- 메인페이지 경로를 퍼블 경로와 실서버 경로를 확인하여 리턴합니다.
	- getter로 값을 변경할 수 없습니다.
	```JavaScript
	mm._mainUrl;// 실서버(/Main), 퍼블(main.html)
	```
+ mm.**time**
	- css transition과 동일한 시간을 적용하기 위해 사용합니다.
	```JavaScript
	mm.time._faster;// 0.1초
	mm.time._fast;// 0.2초
	mm.time._base;// 0.4초
	mm.time._slow;// 0.7초
	mm.time._slower;// 1초
	```
	- mm.**time.stamp**(_key:string_)
	- mm.**time.stampEnd**(_key:string_)
		* _key_ 값으로 구분하여 **mm.time.stamp** 함수의 실행 간격을 ms으로 리턴합니다.
		* **mm.time.stamp**로 여러 번 실행할 수 있고, **mm.time.stampEnd**로 종료합니다.
		```JavaScript
		mm.time.stamp('test');// 0
		mm.time.stamp('test');// 570.16500045
		mm.time.stamp('test');// 452.91239903
		mm.time.stampEnd('test');// 640.61999983
		```

+ mm.**event.type**
	- mm.observer 등에서 사용하는 커스텀 이벤트입니다.
	```JavaScript
	mm.event.type.frame_ready;// 아이프레임이 ready 일 때 부모 창에 상태를 알림
	mm.event.type.main_go;// 메인으로 이동
	mm.event.type.stage_add;// 스테이지에 생성된 페이지 요소 추가
	mm.event.type.stage_remove;// 스테이지에서 페이지 요소 삭제
	```

### method/function
+ mm.**is**
	- 상태를 **true/false**로 리턴합니다.
	- mm.**is.mobile**(_type:string_)
		* _type_ 값이 없으면 모바일 여부를 확인합니다.
		* 기본으로 제공되는 _type_ 값으로 **iphone, ipod, ipad, ios, android, blackberry, window, opera**가 있습니다.
		* 앱에서 userAgent를 커스터마이징하여 사용할 수 있는 _type_ 값으로 **app, app_ios, app_android, app_kitkat, app_first**가 있습니다.
		* 그 외 제공하지 않는 값을 적용하면 userAgent에서 찾아 결과를 리턴합니다.
		```JavaScript
		mm.is.mobile();// 모바일
		mm.is.mobile('ios');// iphone, ipod, ipad
		mm.is.mobile('app_first');// 앱 최초 실행
		```
	- mm.**is.ie**(_type:string_)
		* _type_ 값이 없으면 익스/엣지 여부를 확인합니다.
		* _type_ 값으로 **ie, ie6, ie7, ie8, ie9, ie10, ie11, ie9over, ie10over, edge**가 있습니다.
		* 그 외 제공하지 않는 값을 적용하면 userAgent에서 찾아 결과를 리턴합니다.
		```JavaScript
		mm.is.ie();// 익스/엣지
		mm.is.ie('ie10over');// ie10 이상 엣지포함
		mm.is.ie('edge');// 엣지
		```
	- mm.**is.odd**(_value:number_)
		* _value_ 가 홀수인지 확인합니다.
		```JavaScript
		mm.is.odd(1);// true
		mm.is.odd(2);// false
		```
	- mm.**is.even**(_value:number_)
		* _value_ 가 짝수인지 확인합니다.
		```JavaScript
		mm.is.even(1);// false
		mm.is.even(2);// true
		```
	- mm.**is.empty**(_value:all_, _excepts:array_)
		* _value_ 가 빈 값인지 확인합니다.
		* 0도 값이 있는 것으로 반영됩니다.
		* _excepts_ 배열로 예외어를 설정하면 결과가 반대로 리턴됩니다.
		```JavaScript
		mm.is.empty(0);// false
		mm.is.empty(true);// false
		mm.is.empty(false);// false
		mm.is.empty(함수);// false
		mm.is.empty({});// true
		mm.is.empty([]);// true
		// undefined, null, NaN, 'undefined', 'null', 'NaN'은 true를 리턴합니다.
		mm.is.empty(NaN, [NaN]);// false 예외어 설정
		mm.is.empty(0, [0, '0']);// true 예외어 설정
		// 그 외 jQuery selector의 length가 0보다 크면 false를 리턴합니다.
		```
	- mm.**is.object**(_value:all_)
		* _value_ 가 순수한 오브젝트{}인지 확인합니다.
		* 제이쿼리 셀렉터, DOM 요소, 배열은 제외됩니다.
		```JavaScript
		mm.is.object({});// true
		mm.is.object(window);// false
		mm.is.object([]);// false
		mm.is.object($('div'));// false
		```
	- mm.**is.element**(_value:all_, _isExceptWindow:boolean_)
		* _value_ 가 순수 DOM 엘리먼트인지 확인합니다.
		* 제이쿼리 셀렉터, DOM list는 제외됩니다.
		* _isExceptWindow_ 값이 true이면 window 객체는 제외되어 false로 리턴됩니다.
		```JavaScript
		mm.is.element(document);// true
		mm.is.element(mm.find('div')[0]);// true
		mm.is.element(mm.find('div'));// false
		mm.is.element('.class');// false
		mm.is.element($('div'));// false
		```
	- mm.**is.layout**(_type:string_)
		* html의 레이아웃 타입을 확인합니다.
		* type 값으로 **modal, popup, frame, error, main, side, search**가 있습니다.
		* mm._isXXX로 세팅된 값과 같습니다.
		```JavaScript
		mm.is.layout('modal');// true
		mm.is.layout('__layout_modal__');// false
		```
	- mm.**is.display**(_elements:element_)
		* 요소가 화면에 노출되고 있는지 확인합니다.
		* 다중 요소일 때는 전체 요소가 노출이 되고 있어야 true로 리턴됩니다.
		```JavaScript
		mm.is.display('body');// true
		mm.is.display(document.createElement('div'));// false
		```
	- mm.**is.visible**(_elements:element_)
		* 요소의 visibility를 확인합니다.
		* 다중 요소일 때는 전체 요소가 visible 일 때 true로 리턴됩니다.
		```JavaScript
		mm.is.visible('body');// true
		mm.is.visible(document.createElement('div'));// false
		```
	- mm.**is.focus**(_element:element_)
		* 단일 요소가 포커싱되었는지 확인합니다.
		* 다중 요소일 때는 첫 번째 요소로 확인됩니다.
		```JavaScript
		mm.is.focus('div');
		mm.is.focus(mm.find('div')[0]);
		```
+ mm.**string**
	- 문자열을 변환합니다.
	- mm.**string.template**(_template:string/array_, _replace:object_)
		* 백틱 템플릿 리터럴을 대신하는 기능입니다.
		* _template_ 타입은 기본적으로 **string**으로 사용하고, 여러 줄일 때 **array**로 사용합니다.
		* 문자열 내 **${VAR}** 형식으로 교체할 문자열을 표시하고, **replace.VAR**에 값을 넣어줍니다.
		* **'A/B/C/D/E'**와 같이 반복 구문으로 교체할 때는 **${,,,VAR(/)}** 형식으로 **,,,**로 반복됨을 알리고, 구분자는 **괄호()** 안에 넣은 후, **replace.VAR** 값을 배열로 넣어줍니다.
		```JavaScript
		mm.string.template('div[${ATTR}] .${CLASS}', { ATTR: 'class=box', CLASS: 'inner' });// div[class=box] .inner
		mm.string.template('abc ${A} and ${B}', { A: 'de' + 1, B: 2 * 3 + 4 });// abc de1 and 10
		mm.string.template('a ${,,,LIST(/)}', { LIST: [1, 2, 3, 4] });// a 1/2/3/4
		mm.string.template([
			'<div class="${CLASS}">',
			'	<p>${TEXT}</p>',
			'</div>,
		], { CLASS: 'box', TEXT: 'hello' });
		// <div class="box">
		// 	<p>hello</p>
		// </div>
		```
	- mm.**string.join**(_strings:array_)
		* 배열 내 모든 문자열을 연결합니다.(_array.join\(\)_)
		```JavaScript
		mm.string.join(['a', 'b', 'c', 'd'])// abcd
		```
	- mm.**string.escape**(_string:string_)
		* 특수문자가 포함된 문자열을 정규식(RegExp)에서 규칙을 피해 문자 그대로 사용하기위해 치환합니다.
		```JavaScript
		mm.string.escape('abc! "1/2" de.')// abc!\ "1/2"\ de\.
		```
+ mm.**selector**(_selector:string/array_, _type:string_)
	- 셀렉터 문자열로 변환합니다.
	- _selector_ 타입은 기본적으로 **string**으로 사용하고, 다중 셀렉터일 때 **array**로 사용합니다.
	- _type_ 값이 없으면 _selector_만 묶어서 리턴합니다.
	```JavaScript
	mm.selector('data-text', '[]')// [data-text]
	mm.selector('mm_app', '#')// #mm_app
	mm.selector(['mm_text', 'mm_image', 'mm_box'], '.')// .mm_text, .mm_image, .mm_box
	```
+ mm.**number**
	- 숫자를 변환합니다.
	- mm.**number.comma**(_value:number/string_)
		* 숫자의 3자리마다 **콤마(,)**를 표시합니다.
		* _value_ 타입이 **string**이면 문자열 내 모든 숫자에 적용됩니다.
		```JavaScript
		mm.number.comma(1234567)// 1,234,567
		mm.number.comma('상품의 가격은 200000원, 남은 수량은 1000개');// 상품의 가격은 200,000원, 남은 수량은 1,000개"
		```
	- mm.**number.unit**(_number:number_, _unit:string_)
		* 타입을 **string**으로 변환하면서 단위(_unit_)를 추가합니다.
		* _unit_ 값이 없으면 **px**로 적용됩니다.
		```JavaScript
		mm.number.unit(100)// 100px
		mm.number.unit(100, 'em')// 100em
		```
+ mm.**query**
	- &#38;로 구분된 문자열 변수(query string)를 **오브젝트**로, 오브젝트를 **문자열 변수**로 변환합니다.
	- _location.search_ 에서 활용할 수 있습니다.
	- mm.**query.parse**(_string:string_)
		* _aa=1&#38;bb=2&#38;cc[]=3&#38;cc[]=4_ 처럼 **&#38;**로 구분된 문자열 변수(query string)를 **오브젝트**로 변환합니다.
		* _string_ 에 _location.search_ 를 그대로 넣어도 함수에서 **?**를 제거하고 변환합니다.
		```JavaScript
		mm.query.parse(location.search);// 값이 없으면 {}, 있으면 { a: 1, b: 2 } 형식으로 리턴
		mm.query.parse('a=1&b=2&c[]=3&c[]=4');// { a: 1, b: 2, c: [3, 4] }
		```
	- mm.**query.stringify**(_object:object_, _isUrlSearch:boolean_)
		* 오브젝트를 **&#38;**로 구분된 **문자열 변수**로 변환합니다.
		* _isUrlSearch_ 값이 **true**이면 문자열 앞에 **?**를 넣어 _location.search_ 형식으로 리턴됩니다.
		```JavaScript
		mm.query.stringify({ a: 1, b: 2, c: [3, 4] });// a=1&b=2&c[]=3&c[]=4
		mm.query.stringify({ a: 1 }, true);// '?a=1';
		```
+ mm.**extend**(_origins:object/array_, _extends:object/array_)
	- _origins_ 를 깊은 복제합니다.
	- _extends_ 값이 있으면 복제한 _origins_ 에 병합합니다.
	```JavaScript
	mm.extend({ a: 1 });// { a: 1 }
	mm.extend({ a: 1 }, { a: 2, b: [2, 3] });// { a: 2, b: [2, 3] }
	```
+ mm.**delay**
	- mm.**delay.on**(_callback:function_, _option:object_)
		* _callback_ 의 지연 실행을 위해 _setTimeout_ 을 대신해서 사용합니다.
		* 단위는 **ms**이고, 기본 시간은 **1ms**입니다.
		* _option_ 으로 \_time:number(딜레이 시간), \_isSec:boolean(\_time 단위를 초로 변경), \_name:string(on/off 컨트롤을 위한 딜레이 이름), \_isOverwrite:boolean(중복 적용될 때 덮어쓰기\/), thisEl:object(_callback.apply_ this 요소), params:array(_callback_ 파라미터)를 설정할 수 있습니다.
		* 
		```JavaScript
		// 일반적인 1ms 후에 실행하는 setTimeout 설정
		setTimeout(function() {
			실행할 함수
		}, 1);

		mm.delay.on(실행할 함수)// 1ms 후에 실행하는 함수 설정
		mm.delay.on(실행할 함수, { _time: 2, _isSec: true });// 2초 후에 실행하는 함수 설정
		mm.delay.on(실행할 함수, { _time: 100, thisEl: window, params: ['a', 'b'] });// 100ms(0.1초) 후에 함수를 실행할 때 파라미터로 'a', 'b' 전달
		mm.delay.on(실행할 함수, { _name: 'name' });// 이름을 설정하여 중복으로 실행이 안되도록 적용
		mm.delay.on(실행할 함수, { _name: 'name', _isOverwrite: true });// 이름의 딜레이를 취소하고, 현재 딜레이로 적용
		```
	- mm.**delay.off**(_name:string_)
		* _name_ 의 _callback_ 지연 실행을 취소합니다.
		```JavaScript
		// 일반적인 setTimeout 취소
		clearInterval('name')

		mm.delay.off('name');// 이름의 딜레이 취소
		```
+ mm.**find**(_elements:all_, _parents:element_)
	- DOM에서 _element_ 요소를 검색합니다.
	- _parents_ 는 **String** 타입이 아닌 **HTMLCollection, NodeList, HTML...Element** 요소와 **Array** 타입만 지원됩니다.
	```JavaScript
	mm.find('#element');// [document.getElementById('#element')];
	mm.find('.element');// document.getElementsByClassName('.element');
	mm.find('div');// document.getElementsByTagName('div');
	mm.find('.element .sub')// document.querySelectorAll('.element .sub');
	mm.find('.element', mm.find('div'))// 검색된 div 요소에서 element 클래스가 있는 요소를 검색
	```
+ mm.**siblings**(_elements:element_, _siblings:string_)
	- _element_ 의 형제 요소를 검색합니다.
	- _element_ 는 **String** 타입이 아닌 **HTMLCollection, NodeList, HTML...Element** 요소와 **Array** 타입만 지원됩니다.
	- _siblings_ 은 **DOM selector**형식으로 사용합니다.
	- _siblings_ 값이 없으면 형제 요소 전체, 값이 있으면 해당 형제 요소만 리턴됩니다.
	```JavaScript
	mm.siblings(mm.find('div')[0]);
	mm.siblings(mm.find('div')[0], '.element');
	```
+ mm.**apply**(_callback:function/string_, _thisEl_:object_, _params:array_)
	- **function, string** 타입의 함수를 실행합니다.
	- _thisEl_ 를 설정하지 않으면 기본 값은 **window** 입니다.
	```JavaScript
	mm.apply(function() { });// 함수 직접실행
	mm.apply(mm.popup.open, $selector);// this 요소를 $selector로 하여 mm.popup.open 함수 실행
	mm.apply('mm.find', window, ['a']);// this 요소를 window로 하여 문자열 함수 mm.find('a') 실행
	```
+ mm.**event**
	- mm.**event.on**(_elements:element/string_, _types:string_, _callback:function_, _option:object_)
		* _elements_ 요소에 이벤트 _types_ 를 연결합니다.
		* _types_ 는 띄어쓰기로 구분하여 여러 타입을 설정할 수 있습니다.
		* _option_ 으로 data:object(초기 데이터), \_isOnce:boolean(한 번만 실행), \_isCapture:boolean(버블링 방향 반대), \_isPassive:boolean를 설정할 수 있습니다.
		* _option.data_ 값은 _callback_ 의 2번째 파라미터로 전달됩니다.
		```JavaScript
		mm.event.on(document, 'click', clickHandler);
		mm.event.on(document, 'click', clickHandler, { _isOnce: true });// 한 번만 실행
		```
	- mm.**event.off**(_elements:element/string_, _types:string_, _callback:function/string_)
		* _elements_ 요소에 연결된 이벤트를 해제합니다.
		* _types_ 는 띄어쓰기로 구분하여 여러 타입을 설정할 수 있습니다.
		* _callback_ 타입이 **string**이면 **function.name** 값으로 비교합니다.
		* _callback_ 이 없으면 _elements_ + _types_ 에 연결된 _callback_ 전체를 해제합니다.
		```JavaScript
		mm.event.off(document, 'click', clickHandler);
		mm.event.off(document, 'click');// document에 연결된 모든 click 이벤트 해제
		```
	- mm.**event.dispatch**(_elements:element, _types:string_, _option:object_)
		* _elements_ 에 연결된 이벤트 _types_ 를 실행합니다.
		* _types_ 는 띄어쓰기로 구분하여 여러 타입을 설정할 수 있습니다.
		* _option_ 으로 data:object(전달 데이터)를 설정할 수 있습니다.
		* _option.data_ 값은 _callback_ 1번째 파라미터 _event.detail_ 속성으로 전달됩니다.
		```JavaScript
		mm.event.dispatch(document, 'click');
		mm.event.dispatch(document, 'click', { data: { a: 1 } });// document에 click 이벤트 실행하면서 event.detail.a 로 데이터 전달
		```
	- mm.**event.get**(_element:element_)
		* _element_ 의 첫 번째 단일 요소만 적용됩니다.
		* _element_ 에 연결된 이벤트 전체를 리턴합니다.
		* _element_ 값이 없으면 모든 요소에 연결된 이벤트 전체가 리턴됩니다.
		```JavaScript
		mm.event.get(document);// document에 연결된 이벤트 보기
		mm.event.get();// 모든 요소에 연결된 이벤트 보기
		```
	- mm.**event.type.set**(_type:string_)
		* 공통 관리를 위한 커스텀 이벤트 타입을 생성합니다.
		* 생성된 이벤트는 **mm.event.type.name** 형식으로 사용할 수 있습니다.
		```JavaScript
		mm.event.type.set('popup_open');// mm.event.type.popup_open으로 사용
		```
+ mm.**ready**(_callback:function_)
	- DOM이 **ready(DOMContentLoaded)** 상태일 때 실행합니다.
	```JavaScript
	mm.ready(function() {});
	```
+ mm.**load**(_callback:function_, _option:object_)
	- DOM 또는 _option.el_ 요소의 로드가 완료되었을 때 실행합니다.
	- _option_ 으로 el:element(연결할 요소), \_isOnce(한 번만 실행)를 설정할 수 있습니다.
	- _option.el_ 값이 없으면 **window**에 연결됩니다.
	```JavaScript
	mm.load(function() {});
	mm.load(imageLoadHandler, { el: 'img', _isOnce: true });// img 로드가 완료되면 imageLoadHandler를 실행하고, 연결 해제
	```
+ mm.**delegate**
	- 동적 생성되는 요소의 이벤트를 위해 상위 요소에 위임합니다.
	- 이벤트 위임으로 **mm.delegate.dispatch** 실행 함수가 없습니다.
	- mm.**delegate.on**(_parents:element_, _delegator:string_, _types:string_, _callback:function_, _option:object_)
		* _parents_ 요소에 _delegator_ 의 이벤트 _types_ 를 위임합니다.
		- _delegator_ 는 **DOM selector**형식으로 사용합니다.
		* _types_ 는 띄어쓰기로 구분하여 여러 타입을 설정할 수 있습니다.
		* _option_ 으로 data:object(초기 데이터), \_isOnce:boolean(한 번만 실행)를 설정할 수 있습니다.
		* _option.data_ 값은 _callback_ 의 2번째 파라미터로 전달됩니다.
		```JavaScript
		mm.delegate.on(document, '.element', 'click', clickHandler);
		mm.delegate.on(document, '.element', 'click', clickHandler, { _isOnce: true });// 한 번만 실행
		```
	- mm.**delegate.off**(_parents:element_, _delegator:string_, _types:string_, _callback:function/string_)
		* _parents_ 요소에 위임된 이벤트 _types_ 를 해제합니다.
		- _delegator_ 는 **DOM selector**형식으로 사용합니다.
		* _types_ 는 띄어쓰기로 구분하여 여러 타입을 설정할 수 있습니다.
		* _callback_ 타입이 **string**이면 **function.name** 값으로 비교합니다.
		* _callback_ 이 없으면 _parents_ + _delegator_ + _types_ 에 연결된 _callback_ 전체를 해제합니다.
		```JavaScript
		mm.delegate.off(document, '.element', 'click', clickHandler);
		mm.delegate.off(document, '.element', 'click');// document에 .element로 위임된 모든 click 이벤트 해제
		```
	- mm.**delegate.get**(_parent:element_, _delegator:string_)
		* _parent_ 의 첫 번째 단일 요소만 적용됩니다.
		* _parent_ 에 위임된 _delegator_ 의 이벤트 전체를 리턴합니다.
		* _delegator_ 값이 없으면 _parent_ 에 위임된 이벤트 전체를 리턴합니다.
		* _parent_ 값이 없으면 모든 요소에 위임된 이벤트 전체가 리턴됩니다.
		```JavaScript
		mm.delegate.get(document, '.element');// document에 .element로 위임된 이벤트 보기
		mm.delegate.get(document);// document에 위임된 모든 이벤트 보기
		mm.delegate.get();// 모든 요소에 연결된 이벤트 보기
		```
+ mm.**observer**
	- **observer**에 요소와 이벤트를 저장하고, **dispatch**를 이용하여 이벤트를 실행합니다.
	- 요소가 아닌 이벤트 타입을 기준으로 컨트롤이 가능하여 이벤트 타입에 작업을 분배하고 필요한 요소만 컨트롤하는 OOP, 팩토리 패턴에서 사용할 수 있습니다.
	- 이벤트 타입은 mm.event.type.set으로 생성하여 사용할 수 있습니다.
	- mm.**observer.on**(_elements:element_, _type:string_, _callback:function_, _option:object_)
		* _type_ 은 단일 타입으로 사용합니다.
		* _option_ 으로 data:object(초기 데이터), \_isOnce:boolean(한 번만 실행), \_isOverwrite(중복 시 덮어쓰기)를 설정할 수 있습니다.
		* _option.data_ 값은 _callback_ 의 2번째 아규먼트로 전달됩니다.
		* _option.\_isOverwrite_ 값이 **true**면 중복일 때 교체 저장합니다.
		* 하나의 _elements_ 의 _type_ 에 다른 _callback_ 을 추가로 저장할 수 없습니다.
		```JavaScript
		mm.observer.on('.element', 'CUSTOM_EVENT', function(__e) {
			//
		});// .element 전체 요소에 'CUSTOM_EVENT' 이벤트 타입을 연결하고 observer에 저장
		mm.observer.on(mm.find('.element')[0], mm.event.type.set('element_remove'), function(__e, __data) {
			console.log(__data.a, __data.b);
		}, { datas: { a: 1, b: 2 } });// .element 0번째 단일 요소에 'MM_EVENT_ELEMENT_REMOVE' 이벤트 타입을 연결하고 observer에 저장
		```
	- mm.**observer.off**(_elements:element, _type:string_)
		* _type_ 은 단일 타입으로 사용합니다.
		* **observer**에 저장된 _elements_ 요소의 _type_ 을 삭제합니다.
		* _elements_ 가 없으면 저장된 _type_ 전체가 삭제됩니다.
		* _type_ 이 없으면 저장된 _elements_ 전체가 삭제됩니다.
		```JavaScript
		mm.observer.off('.element', 'CUSTOM_EVENT');// observer에 저장된 '.element'의 'CUSTOM_EVENT'만 삭제
		mm.observer.off('.element');// observer에 저장된 '.element' 전체 삭제
		mm.observer.off(null, 'CUSTOM_EVENT');// observer에 저장된 'CUSTOM_EVENT' 전체 삭제
		```
	- mm.**observer.dispatch**(_type:string_, _option:object_)
		* **observer**에서 _type_ 이 연결된 모든 _element_ 의 _callback_ 을 실행합니다.
		* _options.datas_ 로 전달 값을 설정할 수 있습니다.
		* _options.datas_ 값은 **mm.observer.on** 에 연결된 _callback_ 의 1번째 아규먼트 _event.detail_ 속성으로 전달됩니다.
		* 버블링되지 않습니다.
		``` JavaScript
		mm.observer.dispatch('CUSTOM_EVENT');// 'CUSTOM_EVENT'가 연결된 모든 요소의 함수 실행
		mm.observer.dispatch('CUSTOM_EVENT', { datas: { a: 1, b: 2 } });// 함수의 1번째 아규먼트 event.detail 속성으로 datas 전달
		```
	- mm.**observer.get**(_target:object/string_)
		* **observer**에 적용된 _element_ 와 _type_ 전체를 배열로 가져옵니다.
		```JavaScript
		// [{ _el: Window, _type: 'CUSTOM_EVENT', callback: function, handler: function }, { _el: Window, _type: 'CUSTOM_EVENT', callback: function, handler: function }] 배열로 리턴
		mm.observer.get();
		```
+ mm.**focus**
	- mm.**focus.in**(_element:object_, _options:array_)
		* _element_ 요소에 포커스를 적용합니다.
		* _options_ 로 요소에 \_outline 아웃라인 스타일을 설정할 수 있습니다.
	- mm.**focus.out**(_element:object_)
		* _element_ 요소에 적용된 포커스를 해제합니다.
	```JavaScript
	mm.focus.in('.element');// .element에 포커스 적용
	mm.focus.in('.element', '1px solid red');// .element에 포커스 적용하고, CSS outline:1pc solid red를 적용
	mm.focus.out('.element');// .element에 포커스 해제
	```
+ mm.**scroll**
	- 페이지/컨테이너 스크롤 요소를 찾거나 이동, 제어합니다.
	- 모바일 등에서 스크롤 요소가 겹쳐있을 때 뒤에 기본 스크롤이 합께 움직이는 현상을 **on**, **off**, **toggle** 로 제어할 수 있습니다.
	- 스크롤 차단은 스크립트로 _\__noscroll_ 클래스를 컨트롤하고, css에서 적용됩니다.
	- mm.**scroll.el**
		* 페이지 **기본 스크롤** 요소를 리턴합니다.
		* pc에서는 **body** 요소를 리턴합니다.
		```JavaScript
		mm.scroll.el// 페이지 스크롤 요소(mm.scroll.find()와 동일)
		```
	- mm.**scroll.find**(_element:object_, _isClosest:boolean_)
		* **_element_ 내 스크롤** 요소를 리턴합니다.
		* _element_ 요소가 있으면 **mm_scroller** 요소만 리턴합니다.
		```JavaScript
		mm.scroll.find();// 페이지 스크롤 요소
		mm.scroll.find('div');// div의 스크롤 요소
		```
	- mm.**scroll.to**(_target:element/string/number_, _options:array_)
		* *target* 위치로 스크롤을 이동합니다.
		* *target* 이 _:element_/_:string_ 타입일 때 요소가 있으면, 해당 위치로 이동 후 포커스가 적용됩니다.
		* *target* 이 _:number_ 타입이면, _target_ 위치로 이동합니다.
		* *options* 로 scroller (스크롤 요소), \_direction (스크롤 방향/string), \_margin (_target_ 과의 간격 :number), \_time (이동 시간/sec), \_isFocus (이동 후 포커스 여부 :boolean), onStart (스크롤 시작 콜백 :function), onStartArgs (:array), onComplete (스크롤 완료 콜백 :function), onCompleteArgs (:array)을 설정할 수 있습니다.
		```JavaScript
		mm.scroll.to('div');// div 위치로 스크롤 이동
		mm.scroll.to(200);// scrollTop 200px 위치로 스크롤 이동
		// container요소 안의 가로스크롤을 div요소 left -10px의 위치로 0.5초 동안 이동(포커싱 안함)
		mm.scroll.to('div', { scroller: mm.scroll.find('container'), _direction: 'horizontal', _margin: -10, _time: 0.5, _isFocus: false });
		```
	- mm.**scroll.on**()
		* 페이지 스크롤을 허용합니다.
		```JavaScript
		mm.scroll.on();// 페이지 기본 스크롤 허용
		```
	- mm.**scroll.off**()
		* 페이지 스크롤을 차단합니다.
		```JavaScript
		mm.scroll.off();// 페이지 기본 스크롤 차단
		```
	- mm.**scroll.toggle**()
		* 페이지 스크롤을 허용/차단을 토글로 적용합니다.
		```JavaScript
		mm.scroll.toggle();// 페이지 스크롤 허용/차단 토글
		```
	- mm.**scroll.touchReset**()
		* _-webkit-overflow-scrolling_: **_touch_** 상태에서 _display: none_ 등 다양한 오류가 발생할 시 리셋을 적용합니다.
		```JavaScript
		mm.scroll.touchReset();// overflow scrolling 리셋
		```
+ mm.**frameResize**(_iframe:object_)
	- 컨텐츠 아이프레임(레이아웃 _\_\_layout_frame\_\__)을 리사이징합니다.
	```JavaScript
	mm.frameResize();// 컨텐츠 아이프레임 리사이즈
	mm.frameResize('iframe');// iframe 리사이즈
	```
+ mm.**element**
	- mm.**element.datas**(_element:object_, _attribute:string_, _defaults:array_, _isSave:boolean_)
		* _element_ 의 _attribute_ 값이 JSON타입일 때 object 타입으로 변환하여 리턴합니다.
		* _defaults_ 는 결과 값과 extend 할 기본 값입니다.
		* _isSave_ 값을 **true**로 설정하면 $el.data('mm.attr')형식으로 값을 저장합니다.
		```JavaScript
		mm.element.datas('div', 'data-name');// JSON.parse($('div').attr('data-name')) json형식인 data-name의 값들을 object 타입으로 변환하여 리턴
		mm.element.datas('div', 'data-name', { a: 1, b: 2 });// div의 data-name의 값을 object로 변환하고 { a: 1, b: 2 }의 값을 extend
		mm.element.datas('div', 'data-name', { a: 1, b: 2 }, true);// mm.name형식으로 저장되고 { a: 1, b: 2 }의 값이 extend 되어 jquery 형식으로 사용 가능
		```
	- mm.**element.position**(_target:object_)
		* _target_ 의 scroll + offset 위치 값을 배열로 리턴합니다.
		```JavaScript
		mm.element.position('div');// div의 위치값을 [{ top: 0, left: 0 }] 배열로 리턴
		```
+ mm.**link**(_url:object_, _options:array_)
	- 링크를 이동할 때 특정 위치의 html 소스, 스크롤 위치 등 특정 값을 *history.state* 에 저장하거나, 로딩 이미지 노출이 필요할 때 사용합니다.
	- _options._type:string_ 으로 link, popup, modal, anchor, home이 있습니다.
	- _options._isBeforeClose:boolean_ 는 _type_ 값이 _popup_ 일 때 팝업을 닫고 실행합니다.
	- _options._isHomeReload:boolean_ 는 _type_ 값이 _home_ 일 때 메인으로 이동 후 새로고침합니다.
	- _options.states:object_ 는 _history.state_ 에 추가로 저장할 값입니다.
	- 그 외 mm.scroll.to 등 _options_ 에 전달할 변수 추가가 가능합니다.
	```JavaScript
	mm.link('/url');// 현재 스크롤과 .mm_page-content HTML을 저장하고, 로딩을 노출하며 이동
	mm.link('/url', { states: { a: 1, b: '가' } });// 기본 외 추가로 a와 b를 저장하고, 로딩을 노출하며 이동
	```
+ mm.**copy**(_text:string_, _message:string_)
	- 클립보드 복사
	- _message_ 로 복사가 완료되었을 때 알림 문구를 변경할 수 있습니다.
	```JavaScript
	mm.copy('블라블라 텍스트');
	mm.copy('블라블라 텍스트', '클립보드에 복사했습니다.')
	```
+ mm.**escapeRegExp**(_text:string_)
	- _text_ (정규식 패턴의 문자열) 중 _RegExp_ 의 옵션으로 사용되는 특수문자를 치환합니다.
+ mm.**numberComma**(_number:number_)
	- 3자리 단위마다 콤마를 표시합니다.
	```JavaScript
	mm.numberComma(1000);// 1,000
	```
+ mm.**ajax**
	- _jQuery ajax_ 대신 **axios** 를 사용합니다.
	- _promise_ 기반으로 원활한 브라우저 지원을 위해 _polyfill_ 을 적용해야 합니다.
	- mm.**ajax.load**(_url:string_, _options:array_)
		* _url_ 을 _axios_ 로 로드합니다.
		* _responseType_ 이 _html_ 일 때, _options_ 로 _container_ 를 설정하면 _complete_ 시점에 리턴받은 데이터를 **append** 할 수 있습니다.
		```JavaScript
		mm.ajax.load('/ajax url', {
			configs: {
				// axios config로 자세한 설정은 axios github 참고
				url: __url,
				method: 'get',
				responseType: 'html',
				maxContentLength: 2000,// 보안 취약점 발견으로 추가 필요
			},
			_container: null,// responseType이 html일 때 로드한 html을 append 할 대상($element, '.target')
			_isAppend: true,// append 여부
			_isClear: true,// append 하기 전 container 내용 삭제
			_isLoading: true,// 로딩 노출
			_loadingHeight: null,// 로딩영역 높이 설정
			onAppendBefore: null,// 로드 후 append 전에 실행할 함수
			onAppendBeforeArgs: [],// onAppendBefore 함수의 아규먼트
			onComplete: null,// append 완료 후 실행할 함수
			onCompleteArgs: [],// onComplete 함수의 아규먼트
			onError: null,// 로드 실패 시 실행할 함수
			onErrorArgs: []// onError 함수의 아규먼트
		}, __options);

		mm.ajax.load('/ajax url', { _container: '.element' });// 기본 사용으로 .element 내용을 ajax url에서 로드한 html 소스로 교체
		// 교체 후 onComplete 함수 실행
		mm.ajax.load('/ajax url', { _container: '.element',
			onComplete: function(__data) {
				console.log('로드 완료')
			}
		});
		```
+ mm.**cookie**
	- 브라우저 쿠키를 컨트롤합니다.
	- 삭제 시점을 설정할 수 있습니다.
	- 브라우저에서 쿠키설정을 막으면 저장되지 않습니다.
	- 쿠키 저장 용량은 브라우저마다 다르지만 기본 **4kb** 입니다.
	- _key_ 이름은 통일을 위해 **대문자 + _언더스코어** 조합으로 사용합니다.(KEY_NAME_STYLE)
	- mm.**cookie.set**(_key:string_, _value:all_, _day:number_, _isMidnight:boolean_)
		* 브라우저에 쿠키를 저장합니다.
		* _value_ 값이 없으면 **true** 로 설정됩니다.
		* _day_ 값이 없으면 무기한으로 설정됩니다.
		* _isMidnight_ 값을 **true** 로 설정하면 0시 자정을 기준으로 설정됩니다.
		```javascript
		mm.cookie.set('KEY_NAME');// 'KEY_NAME'을 브라우저에 저장
		mm.cookie.set('KEY_NAME', 1, 1, true);// 'KEY_NAME': 1, 0시 기준으로 1일 후 제거
		```
	- mm.**cookie.get**(_key:string_)
		* 브라우저에 저장된 _key_ 값을 가져옵니다.
		```JavaScript
		mm.cookie.get('KEY_NAME');// 'KEY_NAME'에 저장된 value값
		```
	- mm.**cookie.remove**(_key:string_)
		* 브라우저에 저장된 _key_ 를 삭제합니다.
		```JavaScript
		mm.cookie.remove('KEY_NAME');// 'KEY_NAME' 쿠키 삭제
		```
+ mm.**local**
	-  mm.cookie와 사용방법이 같습니다.
	-  도메인 기준으로 저장이 됩니다.
	-  브라우저를 닫아도 다시 접속하면 쿠키가 살아있습니다.(개인정보 등 저장 위험)
	-  5mb까지 저장이 가능합니다.
	-  mm.**local.set**(_key:string_, _value:all_, _day:number_, _isMidnight:boolean_)
		* 로컬 스토리지에 쿠키를 저장합니다.
		* _value_ 값이 없으면 **true** 로 설정됩니다.
		* _day_ 값이 없으면 무기한으로 설정됩니다.
		* _isMidnight_ 값을 **true**로 설정하면 자정(0시)를 기준으로 설정됩니다.
		```JavaScript
		mm.local.set('KEY_NAME');// 'KEY_NAME'을 로컬 스토리지에 저장
		mm.local.set('KEY_NAME', 1, 1, true);// 'KEY_NAME': 1, 0시 기준으로 1일 후 제거
		```
	- mm.**local.get**(_key:string_)
		* 로컬 스토리지에 저장된 _key_ 값을 가져옵니다.
		```JavaScript
		mm.local.get('KEY_NAME');// 'KEY_NAME'에 저장된 value값
		```
	- mm.**local.remove**(_key:string_)
		* 로컬 스토리지에 저장된 _key_ 를 삭제합니다.
		```JavaScript
		mm.local.remove('KEY_NAME');// 'KEY_NAME' 쿠키 삭제
		```
+ mm.**storage**
	- **storage**는 값 저장 시 _string_ 만 지원해서 JSON 으로 변환하는 부분을 추가합니다.
	- 스토리지에 저장하면 도메인을 기준으로 저장됩니다.
	- _sessionStorage_ 는 브라우저를 닫으면 삭제되고, _localStorage_ 는 브라우저를 닫아도 삭제되지 않으므로 사용할 때 보안에 주의해야 합니다.
	- 스토리지 저장 용량은 브라우저마다 다르지만 기본 **5mb** 입니다.
	- 공통 파라미터 _type_ 값은 **'session', 'local'** 만 사용할 수 있습니다.
	- mm.**storage.set**(_type:string_, _key:string_, _value:all_)
		* _type_ 스토리지에 _key_, _value_ 를 저장합니다.
		* _value_ 에는 **string** 뿐만 아닌, **object, array, boolean, number** 타입으로도 저장할 수 있습니다.
		```JavaScript
		mm.storage.set('local', 'KEYNAME', true);// localStorage.KEYNAME에 true boolean 타입 저장
		mm.storage.set('local', 'KEYNAME', { a: 1, b: 2 });// localStorage.KEYNAME에 { a:1, b: 2 } object 타입 저장
		mm.storage.set('local', 'KEYNAME', [1, 2, 3]);// localStorage.KEYNAME에 [1, 2, 3] array 타입 저장
		```
	- mm.**storage.get**(_type:string_, _key:string_)
		* _type_ 스토리지에 저장된 _key_ 값을 가져옵니다.
		* 저장된 타입에 맞게 변환하여 값을 리턴합니다.
		```JavaScript
		mm.storage.get('session', 'KEYNAME');// sessionStorage.KEYNAME 값 리턴
		```
	- mm.**storage.remove**(_type:string_, _key:string_)
		* _type_ 스토리지의 _key_ 를 삭제합니다.
		```JavaScript
		mm.storage.remove('local', 'KEYNAME');// localStorage.KEYNAME 값 삭제
		```
	- mm.**storage.clear**(_type:string_)
		* _type_ 스토리지 내용 전체를 삭제합니다.
		```JavaScript
		mm.storage.clear('session');// sessionStorage 내용 전체를 삭제합니다.
		```
+ mm.**history**
	- 브라우저 _history_ 를 컨트롤합니다.
	- _url_ 을 기준으로 저장됩니다.
	- _history.state_ 는 브라우저를 닫으면 삭제되지만, 브라우저만 닫지 않으면 url이 바뀌었다 돌아와도 데이터가 살아있습니다.
		_url_ 은 같아도 브라우저의 히스토리 순서가 다르면 다른 페이지로 인식됩니다.
	- _history.state_ 저장 용량은 브라우저마다 다르지만 기본 **640kb** 입니다.
	- mm.**history.back**(_step:number_)
		* _step_ 값이 없으면 **1** 이 기본입니다.
		* _step_ 만큼 이전 페이지로 히스토리를 이동합니다.
		```JavaScript
		mm.history.back();// 히스토리 이전 페이지로 이동
		mm.history.back(2);// 히스토리 2번째 전 페이지로 이동
		```
	- mm.**history.forward**(_step:number_)
		* _step_ 값이 없으면 **1** 이 기본입니다.
		* _step_ 만큼 다음 페이지로 히스토리를 이동합니다.
		```JavaScript
		mm.history.forward();// 히스토리 다음 페이지로 이동
		mm.history.forward(3);// 히스토리 3번째 후 페이지로 이동
		```
	- mm.**history.push**(_states:all_, _url:string_, _options:array_)
		* 페이지 이동 없이 _url_ 을 변경합니다.
		* _url_ 은 **필수항목**입니다.
		* _states_ 에 변경될 _url_ 에 전달할 데이터를 저장할 수 있습니다.
		```JavaScript
		mm.history.push(null, '/change url');// history.state에 저장하는 데이터 없이 url만 변경
		mm.history.push({ a: 1 }, '/change url');// '/change url'로 url을 변경하고, 변경된 url에 { a: 1 } 저장
		```
	- mm.**history.replace**(_states:all_, _url:string_, _options:array_)
		* 현재 페이지 _url_ 을 히스토리에 저장하지 않고, 페이지 이동 없이 _url_ 을 변경합니다.
		* _url_ 값 없이 _states_ 만 넣어 사용하면, 현재 페이지의 _history.state_ 데이터를 저장할 수 있습니다.
		```JavaScript
		mm.history.replalce({ a: 1, b: 2 });// 현재 url의 history.state에 { a: 1, b: 2 } 저장
		mm.history.replace({ a: 1 }, '/change url');// '/change url'로 url을 변경하고, 변경된 url에 { a: 1 } 저장(변경 전 페이지로 뒤로가기 안됨)
		```
	- mm.**history.add**()
		* **link**이동이나 **popup**을 띄울 때 히스토리와 세션의 순서를 저장합니다.
	- mm.**history.states**
		* getter와 setter로 설정되어 있습니다.
		* 공통된 _history.state_ 를 관리하기 위해 사용합니다.
	- mm.**history.sessions**
		* getter와 setter로 설정되어 있습니다.
		* _sessionStorage_ 에 저장된 history의 _key_ 값을 관리하기 위해 사용합니다.

### component
+ mm.**loading**
	- mm.**loading.show**(_element:object_, _options:array_)
		* 로딩을 노출시킵니다.
		* _options_ 로 \_minHeight:number, \_size:number (로딩 이미지 사이즈), \_text:string (로딩에 텍스트 노출) 을 설정할 수 있습니다.
		* _options.minHeight_ 값이 0이면 _element_ 의 offset.top과 툴바 높이를 제외한 높이를 적용하고, 0보다 크면 해당 값을 적용합니다.
		* ios에서 링크가 바뀔 때 css keyframes로 적용된 모션 중 _:before, :after_ 요소는 움직이지 않습니다.
		```JavaScript
		mm.loading.show('.mm_app', { _minHeight: 0, _size: 100, _text: '로딩중' });// mm_app요소에 사이즈가 100인 로딩 이미지와 함께 '로딩중' 텍스트 표시
		```
	- mm.**loading.hide**(_element:object_, _delay:number_)
		* 로딩을 숨깁니다.
		* _delay_ (딜레이 시간)은 초단위입니다.
+ ~~mm.**progress**~~
	- ~~구현 안됨~~
+ mm.**scrollbar**
	- _pc_ 에서 기본 브라우저 스크롤바를 적용하기 어려울 때 사용합니다.
	- 기본적으로 _.mm_scroller_ 요소 중 _data-scrollbar_ 속성이 있을 때 적용됩니다.
	- mm.**scrollbar.update**(_element:object_, _options:array_)
		* _element_ 값이 없으면 페이지 전체 _.mm_scroller_ 요소 중 _data-scrollbar_ 속성이 있는 요소를 찾아 적용합니다.
		* _data-scrollbar_ 에 값이 없으면 기본 옵션으로 적용됩니다.
		* _data-scrollbar_ 에 json으로 옵션을 설정할 수 있습니다.
+ mm.**socialtag**
	- _meta_ 의 _property_ 가 og로 시작하는 소셜태그를 가져오거나 추가/교체 합니다.
	- mm.**socialtag.get**(_element:object_)
		* _meta og_ 또는 _element_ 의 meta html 소스를 가져옵니다.
		```JavaScript
		mm.socialtag.get();// 페이지 내 전체 meta og html 소스를 리턴
		mm.socialtag.get('meta');// element가 meta면 선택한 meta html 소스만 리턴
		mm.socialtag.get('div');// div 안에 meta og 소스가 있으면 리턴
		```
	- mm.**socialtag.set**(_html:string_)
		* _head_ 의 마지막 _meta og_ 요소 뒤에 _html_ 을 추가합니다.
		```JavaScript
		// meta 마지막에 html 소스 추가
		mm.socialtag.set('<meta property="og:title" content=""><meta property="og:description" content="">');
		```
	- mm.**socialtag.change**(_html:string_)
		* _head_ 의 _meta og_ 를 _html_ 로 교체합니다.
		```JavaScript
		// meta og를 html 소스로 교체
		mm.socialtag.change('<meta property="og:title" content=""><meta property="og:description" content="">');
		```
+ mm.**image**
	- mm.**image._empty**
		* 투명 1px gif입니다.
	- mm.**image.none**(_element:object_, _options:array_)
		* 없음 이미지를 노출합니다.
+ mm.**preload**
	- mm.**preload.update**(_element:object_, _options:array_)
		* 프리로드를 연결합니다.
		```JavaScript
		mm.preload.update();// mm_preload 요소에 적용(기본)
		mm.preload.update('div', { _isElement: true });// div요소만 적용
		```
	- mm.**preload.force**(_element:object_, _options:array_)
		* 프리로드를 강제로 연결합니다.
		* 숨겨진 요소나 _isPass 값이 true인 요소 모두 무시하고 연결합니다.
		```JavaScript
		mm.preload.force();// mm_preload 요소에 적용(기본)
		mm.preload.force('div', { _isElement: true });// div요소만 적용
		```
	- mm.**preload.destroy**(_element:object_)
		* 프리로드를 해제합니다.
		* \_classLoading 상태만 적용됩니다.
		```JavaScript
		mm.preload.destroy(div);// div요소의 프리로드를 해제합니다.
		```
+ mm.**toggle**
	- mm.**toggle.update**(_element:object_, _options:array_)
	- mm.**toggle.on**(_element:object_, _options:array_)
		* 토글을 활성화시킵니다.
	- mm.**toggle.off**(_element:object_, _options:array_)
		 * 토글을 비활성화 시킵니다.
+ mm.**dropdown**
 	- mm.**dropdown.update**(_element:object_)
 		* _element_ 에 드롭다운을 연결시킵니다.
 	- mm.**dropdown.open**(_element:object_, _time:number_)
 		* _element_ 의 드롭다운이 _time_ (단위ms)동안 열립니다.
 	- mm.**dropdown.close**(_element:object_, _time:number_)
 		* _element_ 의 드롭다운이 _time_ (단위ms)동안 닫힙니다.
+ mm.**tab**
	- mm.**tab.update**(_element:object_)
		* _element_ 에 tab을 연결시킵니다.
	- mm.**tab.change**(_element:object_, _options:array_)
	- mm.**tab.index**(_element:object_)
		* _element_ 의 탭 인덱스 값을 리턴합니다.
+ mm.**carousel**
	- mm.**carousel.update**(_elements:element_)
		* _elements_ 에 carousel을 연결합니다.
	- mm.**carousel.change**(_elements:element_, _index:number_, _direction:string_)
		* _elements_ 에 연결된 carousel을 _index_ 항목으로 이동합니다.
		* _direction_ 값으로 **prev, next**을 설정하여 강제로 이동 방향을 지정할 수 있습니다.
+ mm.**stepper**
	- mm.**stepper.update**(_input:object_, _event_)
+ mm.**form**
	- mm.**form.update**(_element:object_)
		* 페이지 내 폼요소가 **초기화/변경** 될 때 실행합니다.
		* _element_ 가 빈 값이면 페이지 전체 폼요소를 찾아 업데이트합니다.
			_element_ 가 폼요소일 경우, 해당 요소만 업데이트합니다.
			_element_ 가 폼요소가 아닐 경우, child에 업데이트합니다.
		```JavaScript
		mm.form.update();// 페이지 전체 폼요소 업데이트
		mm.form.update('.container');// '.container' 내 전체 폼요소 업데이트
		mm.form.update('input');// 'input' 업데이트
		mm.form.update($('input').val('내용'));// 'input' 변경 + 업데이트 동시 적용
		```
	- mm.**form.alert**(_element:object_, _message:string_)
		* 폼요소가 잘못 작성되었을 때 경고 메시지를 표시합니다.
		* 텍스트, 셀렉트, 파일요소에 적용됩니다.
		* ckeditor에 적용 시에는 _.ck_contents_ 의 위치에 적용됩니다.
		```JavaScript
		mm.form.alert('input.test', '대문자로 입력하세요.');// 'input.test'에 '대문자로 입력하세요.' 경고 메시지 표시
		```
	- mm.**form.valid**(_element:object_, _message:string_, _condition:string_)
		* 폼요소의 유효성 메시지를 표시합니다.
		* 텍스트, 셀렉트, 파일요소에 적용됩니다.
		* _message_ 가 **보통/위험/사용불가** 이면 자동으로 색상이 추가됩니다.
		* _condition_ 으로 강제로 **normal(보통)/danger(위험)/invalid(사용불가)** 색상을 적용할 수 있습니다.
		```JavaScript
		mm.form.valid('input.test', '안전');// 'input.test'에 '안전' 유효성 메시지 표시
		mm.form.valid('input.test', '사용불가');// 'input.test'에 '사용가능' 유효성 메시지 표시(붉은색 자동 적용)
		mm.form.valid('input.test', '주의', 'danger');// 'input.test'에 '주의' 유효성 메시지 표시(위험 색상으로 적용)
		```
	- mm.**form.lift**(_element:object_)
		* 폼요소에 적용된 경고/유효성 메시지를 삭제합니다.
		* _element_ 를 설정하지 않으면 페이지 내 전체 _.text_alert, .text_valid_ 를 해제합니다.
		```JavaScript
		mm.form.lift('input.test');// 'input.test'에 적용된 경고 메시지 삭제
		```
+ mm.**form.file**
	- mm.**form.file.update**(_$file_)
		* 파일 요소를 업데이트합니다.
		* 업데이트 할 때 설정한 제한사항(파일 사이즈, 이름, 크기 등)을 함께 확인합니다.
	- mm.**form.file.set**(_$file_)
		* 선택한 파일을 파일 요소의 $file.data('mm.file')에 저장합니다.
	- mm.**form.file.preview**(_$file_)
		* 미리보기(파일명)를 노출합니다.
+ mm.**form.image**
	- _mm.form.file_ 과 기본적인 구성은 같습니다.
	- 이미지 미리보기가 필요한 파일요소에 사용합니다.
	- mm.**form.image.update**(_$file_)
		* 파일 요소를 업데이트합니다.
		* 업데이트 할 때 설정한 제한사항(파일 사이즈, 이름, 크기 등)을 함께 확인합니다.
	- mm.**form.image.set**(_$file_)
		* 선택한 파일을 파일 요소의 $element.data('mm.file')에 저장합니다.
	- mm.**form.image.preview**(_$file_)
		* 미리보기(파일명)를 노출합니다.
+ mm.**component**
	- mm.**component.update**(_element:object_)
		* _element_ 내 컴포넌트 요소들을 업데이트합니다.
		* 현재 업데이트 요소는 _드롭다운, 탭, 스와이퍼, 프리로드, 폼요소_ 입니다.
		* 업데이트 요소를 포함한 내용이 생성될 경우 사용합니다.
+ mm.**popup**
	- mm.**popup.open**(_url:string_, _options:array_)
		* 연결된 _url_ 의 팝업을 오픈합니다.
	- mm.**popup.on**()
		* 팝업을 노출시켜줍니다.
		* iframe onComplete 적용이 가능합니다.
	- mm.**popup.close**(_callback:function_, _options:array_)
		* 오픈된 팝업을 닫아줍니다.
		* opener가 없으면 팝업을 닫을 시 메인으로 이동합니다.
		* _callback_ 이 우선순위로 적용됩니다.
	- mm.**popup.resize**()
		* 팝업 사이즈를 재조정합니다.
		* windoow 팝업만 적용됩니다.
	- mm.**popup.onload**(_iframe:object_)
		* 팝업 아이프레임의 로드 완료시점(src/href 변경)
	- mm.**popup.opener**()
		* getter로 설정되어 있습니다.
		* 팝업을 오픈한 window 요소를 리턴합니다.
	- mm.**popup.openEl**()
		* getter로 설정되어 있습니다.
		* 팝업을 오픈할 때 클릭한 요소를 리턴합니다.
+ mm.**modal**
	- mm.**modal.open**(_url:string_, _options:array_)
		* 연결된 _url_ 의 모달을 오픈합니다.
	- mm.**modal.on**(_element:object_)
		* 모달을 노출시킵니다.
		* iframe onComplete 적용이 가능합니다.
	- mm.**modal.close**(_callback:function_, _params:array_)
		 * 오픈된 모달을 닫아줍니다.
	- mm.**modal.resize**()
		* 모달의 사이즈와 위치를 재조정합니다.
	- mm.**modal.opener**()
		* getter로 설정되어 있습니다.
		* 모달을 오픈한 window 요소를 리턴합니다.
	- mm.**modal.openEl**()
		* getter로 설정되어 있습니다.
		* 모달을 오픈할 때 클릭한 요소를 리턴합니다.
+ mm.**bom**
	- 브라우저 기본 **얼럿, 컨펌, 프롬프트**를 대신해서 사용합니다.
	- 공통 파라미터 _text:string_ 은 안내 문구로 없을 경우, '' 빈 값으로 사용할 수 있습니다.
	- 공통 파라미터 _callback:function_ 은 **확인/취소** 버튼을 클릭했을 때 실행하는 함수입니다.
		얼럿을 제외하고, 확인은 **true**, 취소는 **false** 로 함수의 첫 번째 아규먼트로 전달합니다.
	- mm.**bom.alert**(_text:string_, _callback:function_, _options:array_)
		* _options_ 의 _title_ 로 얼럿 제목을 변경할 수 있습니다.
		* _options_ 의 _params_ 로 _callback:function_ 의 아규먼트를 설정할 수 있습니다.
		```JavaScript
		mm.bom.alert('안내문구 입니다.');// '알림' 타이틀과, 설정한 문구 노출
		mm.bom.alert('안내문구 입니다.', null, { _title: '' });// 타이틀 없이 설정한 문구만 노출
		mm.bom.alert('', null, { _title: '경고' });// 설정한 문구 없이 타이틀만 '경고'로 변경하여 노출

		// 확인 버튼을 클릭하면 함수를 실행
		mm.bom.alert('안내문구 입니다.', function() {
			console.log('버튼 클릭');
		});

		// 확인 버튼을 클릭하면 함수를 실행하고, 아규먼트로 1, 2, 3을 전달
		mm.bom.alert('안내문구 입니다.', function(args) {
			console.log(arguments);
		}, { args: [1, 2, 3] });
		```
	- mm.**bom.confirm**(_text:string_, _callback:function_, _options:array_)
		* 기본 사용은 _mm.bom.alert_ 과 같습니다.
		* _options_ 의 _params_ 로 _callback:function_ 을 실행할 때 추가로 아규먼트를 전달할 수 있습니다.
		* 버튼 클릭 시 _callback_ 첫 번째 파라미터에 확인(true)/취소(false)를 전달하고, _params_ 는 두 번째부터 적용됩니다.
		```JavaScript
		// 확인/취소 버튼을 클릭하면 함수를 실행하고, 아규먼트 true/false, 1, 2, 3을 전달
		mm.bom.confirm('안내문구를 확인합니다.', function(args) {
			console.log(arguments);
		}, { args: [1, 2, 3] });
		```
	- mm.**bom.prompt**(_text:string_, _callback:function_, _options:array_)
		* 기본 사용은 _mm.bom.confirm_ 과 같습니다.
		* 버튼 클릭 시 _callback_ 마지막 파라미터에 **form value(배열)**과 **확인(true)/취소(false)**를 전달합니다.
		* _options_ 의 _arg_ 로 _callback:function_ 을 실행할 때 추가로 아규먼트를 전달할 수 있습니다.
			첫 번째는 확인(true)/취소(false)값, 두 번째부터 프롬프트 내부 _form value_ 가 개수대로 적용되고, 이 후 _arg_ 가 적용됩니다.
		* _options_ 의 _forms_ (입력창 기본 값)가 없으면 _input:text_ 한 개만 노출됩니다.
			_forms_ 의 _type_ 값은 **input 입력요소**(text,tel, number.email, search, url, password, date. month, time)와 **textarea, select**입니다.
			**select** 를 제외한 요소에는 _placeholder_ 와 _value_ 를 추가로 설정할 수 있습니다.
			**select** 의 **options** 은 options: [{ _text: '텍스트', _value: '값', _selected: true }] 형식으로 배열에 내용을 추가하면 됩니다.
		* 추가/변경할 때는 { forms: [{ _type: '속성', _placeholder: '텍스트', value: '텍스트' }] }의 _forms_ 배열에 오브젝트를 추가합니다.
		* date, time의 노출 방식은 _format: '값'_ 으로 변경할 수 있습니다.
		* attrs 값이 빈 값이 아니면 폼요소에 attr을 적용합니다.({ _dataNameText: '{ '_isResize': true }', 'style': 'background:red' } 등)
		```JavaScript
		// 확인/취소 버튼을 클릭하면 함수를 실행하고, 아규먼트 true/false, text value, 1, 2, 3을 전달
		mm.bom.prompt('안내문구를 작성해주세요.', function(args) {
			console.log(arguments);
		}, { args: [1, 2, 3] });

		// 설정 문구 없이 1234 값이 있는 input:password, input:number, textarea, 옵션 3개가 있는 select 생성
		// 아규먼트 true/false, password, number, textarea, select value를 전달
		mm.bom.prompt('', function(args) {
			console.log(arguments);
		}, { forms: [
			{ _type: 'password', _placeholder: '비밀번호 입력', _value: '1234' },
			{ _type: 'number', _placeholder: '숫자 입력' },
			{ _type: 'textarea', _placeholder: '내용 작성' },
			{ _type: 'select', options:[{ _text: '옵션1', _value: '1' }, { _text: '옵션2', _value: '2', _selected: true }, { _text: '옵션3', _value: '3' }] },
		] });
		```
	- mm.**bom.close**(_callback:function_, _params:array_)
		* **확인/취소** 버튼을 제외하고 외부에서 팝업을 닫을 때 사용합니다.
	- mm.**bom.resize**()
		* bom의 위치를 재조정할 때 사용합니다.
+ mm.**colorpicker**
	- mm.**colorpicker.open**(_element:object_)
		* 컬러픽커를 오픈합니다.
	- mm.**colorpicker.close**(_element:object_)
		* 오픈되어 있는 컬러픽커를 닫습니다.
+ mm.**datepicker**
	- PC에서만 사용합니다.
	- mm.**datepicker.update**(_element:object_)
		* 데이터픽커를 설정합니다.
		* 기본적으로 data-datepicker 속성이 있는 요소에 적용됩니다.
		* 데이트픽커 오픈시 body의 가장 아래에 데이트픽커가 생성되며, inline을 지정할 경우 data-datepicker 속성 요소 아래에 생성됩니다.
		* data-datepicker="{ 'onSelect': callback }" 으로 callback 함수를 지정할 경우 object 형식의 date와 string 형태의 date를 배열로 리턴합니다.
		* 데이트픽커의 _disableBeforeDate와 _disableAfterDate 의 형식은 항상 _format을 기준으로 작성합니다.
		* _multipleMonth 옵션과 _isSelectMonth 옵션을 같이 사용할 경우 캘린더는 항상 1개만 생성됩니다.
		```JavaScript
		data-datepicker="{
			'configs': {
				_format: 'YYYY-MM-DD', // 날짜형식
				_firstDay: 0, // Weekdays 배열을 기준으로 시작일을 지정합니다 (0: 일요일)
				weekdays: ['일', '월', '화', '수', '목', '금', '토'],
				_multipleMonth: 1, // 여러달 표시
				_isSelectMonth: false, // 월 선택
				_isInline: false, // 인라인
				_disableBeforeDate: null, // 특정일 이전의 날짜 disable
				_disableAfterDate: null, // 특정일 이후의 날짜 disable
			}
		}"
		```
	- mm.**datepicker.clear**(_element:object_)
		* 오픈되어 있는 데이터픽커를 닫습니다.
	- mm.**datepicker.change**(_element:object, date:string)
		* 지정 element의 value를 특정일로 변경합니다.
		* 항상 element, date의 parameter를 전달해야 합니다.
		* change로 전달하는 date parameter는 항상 configs의 format과 형식이 같아야합니다.
+ mm.**pinchzoom**
	- mm.**pinchzoom.update**(_element:object_)
		* _element_ 에 줌 동작을 설정합니다.
		* 브라우저 자체 확대기능이 있는 일부 브라우저와의 충돌 방지를 위해 userAgent에서 일부 브라우저는 핀치줌을 적용하지 않도록 합니다.
<br><br>
- - -
## app_page-common.js
+ 현재 사이트 페이지에만 공통으로 사용하는 파일입니다.
