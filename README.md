# 하고 쇼핑몰
하고 쇼핑몰 구축을 위한 PC/모바일/어드민 페이지 HTML 퍼블리싱 작업을 정리한 정리한 저장소입니다.  
시멘틱 마크업, 웹 표준, 접근성 등을 고려하여 제작했습니다.  
  
## 디렉토리 구성
+ pc: 데스크탑 웹 마크업
+ mobile: 모바일 웹 마크업 (모바일 웹뷰 대응)
+ admin: 어드민 마크업 (관리자 전용 화면)  
  
## 작업 기간 및 역할
+ 작업 기간: 2021.02 ~ 2021.07  
+ 역할: 전체 퍼블리싱 구조 설계 및 마크업, SCSS 설계, JavaScript 인터렉션 구현  

## 가이드
### 공통 스크립트
- **[모바일 common.js 설명 보기](MOBILE_JAVASCRIPT_COMMON.md)**
- **[PC common.js 설명 보기](PC_JAVASCRIPT_COMMON.md)**
- **app_common**
	* 공통으로 사용되는 컴포넌트 모듈입니다.  
	* 페이지 로드 시 바인딩됩니다.  
	* 노출함수를 이용하여 외부에서 사용할 수 있습니다.  
- **app_page-common**
	* 프로젝트 페이지에서 공통으로 사용되는 스크립트입니다.  
	* 폰트 로드, 디바이스 확인, 페이지관련 설정이 포함되어 있습니다.  
- **app_page-페이지이름**
	* 그 외 필요할 경우 js파일 생성하고 body하단에 추가합니다.  
  
### HTML
+ 참고 사이트
	- [w3schools](https://www.w3schools.com/)
	- [caniuse](https://caniuse.com/)
+ 웹 표준 검사 필수
	- [kldp validator (한글)](http://validator.kldp.org/)
	- [kldp가 오류날 경우 해외사이트 이용](https://validator.w3.org/)
	- [간단한 웹 접근성 검사](https://accessibility.kr/nia/check.php)
	- kldp validator를 필수로 하고, 오류 0/경고 최소화 할 수 있도록 작업
	- 최소한의 웹 접근성 적용 : alt, 대체 텍스트, 탭 이동
+ 크로스브라우징
 	- PC : **IE10** 
	- 모바일 : **android 5** (android 4.4 G3에서 알아볼 수 있는 정도, 노트2는 버그가 많아 제외)
+ 시멘틱 마크업
+ 주석 사용
	- 시작과 끝 : \<!-- 영역시작 -->, \<!--// 영역끝 -->
	- 개발설명, 참고사항 : \<!-- (D) 설명 -->
+ id는 앵커 이동이 필요한 영역 (팝업 등) 또는 레이아웃 영역에만 사용 (개발에서 사용할 수 있도록 최소화)
+ **속성 사용 순서**
	```
	type/rel href/src/resource target id class name alt title data readonly disabled checked/selected auto*** style onscript
	```
+ class
	- 네이밍 뎁스는 최대 4단계까지
	- 컴포넌트 (공통영역) : mm_컴포넌트-하위-하위
	- 개별 페이지 컨텐츠 : m-페이지-컨텐츠-하위
	- 뎁스가 많을 때 : m--상위-하위-하위
	- 상태 변경 : \__이름-상태 (예, m-parent-name __name-on)
	- 모양 변경 : \__이름_모양1_모양2_모양3\_\_ (예, mm_btn \__btn_sm_line_primary\_\_)
	- 속성 프리픽스 : 속성_이름-상태 (btn_, text_, image_, bg_, ico_, mco_ 등)  
		btn, bg를 제외하고 text, image는 풀네임으로 적용(txt, img 사용 안함)
+ a태그 속성 사용 (스크립트 연동)
	- 링크이동 : **data-href="link"** (로딩 노출)  
		mm.link(url); 스크립트 실행
	- 앵커이동 : **data-href="anchor"**  
		mm.anchor(target, options); 스크립트 실행
	- 히스토리이동 : **data-href="back"**, **data-href="forward"**  
		mm.history.back(number);, mm.history.forward(number); 스크립트 실행
	- 팝업 : **data-href="popup"**  
		mm.popup.open(url, options); 스크립트 실행
+ 팝업 페이지는 mm_app 클래스에 \__app_popup\_\_을 추가 (**class="mm_app \__app_popup\_\_"**)
+ 자주쓰는 유니코드 (entity code)
	- **\<** : \&#60; \&lt;
	- **\>** : \&#62; \&gt;
	- **\&** : \&#38; \&amp;
	- **빈칸** : \&#160; \&nbsp;
	- **©** : \&#169; \&copy;

#### head
+ title을 뎁스에 맞게 넣어주세요.(SEO, 웹 접근성 준수)
	- 기본 : **사이트**
	- 1뎁스 : **1뎁스 - 사이트**
	- 2뎁스 이상 : **3뎁스 < 2뎁스 < 1뎁스 - 사이트**
	- 검색 : **"ㅇㅇ"으로 검색한 결과 - 사이트**
	- 상품/글 상세 : **"ㅇㅇ" 상세보기 - 사이트**, **"ㅇㅇ" 상품정보 - 사이트**
	- 팝업 : **(팝업) 페이지 이름 - 사이트**
+ 공유에 사용하는 소셜태그는 기본 항목만 있습니다.  
	필요에 따라 추가 삭제하시면 됩니다.
	```
	<meta property="og:title" content="">
	<meta property="og:description" content="">
	<meta property="og:image" content="">
	<meta property="og:url" content="">
	<meta property="og:site_name" content="">
	```
+ 웹폰트는 동기식으로 스크립트에서 로드합니다.
	- ~~*webfontloader* 사용~~
	- *app_page-common.js* 에서 로드
	- 속도를 위해 페이지 레디 후에 전체를 로드하도록 적용
	- CDN 사용 시 스크립트 없이 바로 적용해도 됨
+ js파일은 **폴리필** 과 **라이브러리** 만 head에 넣고, 나머지는 body하단에 추가합니다.

#### body
+ 페이지를 로드할 때 **app_common.js** 에서 **팝업, 모달, BOM** 관련 html태그를 추가합니다.

### tag
+ 텍스트에 사용하는 b와 i요소는 inline요소의 구조화를 위해 변형해서 사용합니다.
	- b는 div처럼 활용하여 **b**lock, inline-**b**lock 속성을 적용하여 요소를 묶어주는 역할을 합니다.
	- i는 **i**mage, background, icon 등 이미지 요소에 적용합니다.
+ 텍스트 요소
	- p : 문장
	- span : 일반 문자열
	- small : 작은 문자열
	- strong : 강조가 필요한 문자열 (b대신 사용)
	- em : strong보다는 약하지만 강조가 필요한 문자열 (i대신 사용하여 italic 적용)
	- sub, sup : sub는 하단, sup는 상단 작은 문자열에 사용하지만 small로 대신 사용 가능
<br><br>
- - -

### CSS/SCSS
+ SCSS를 사용하여 작업합니다.
+ CSS는 SCSS watch를 이용하여 자동변환합니다.
	```
	scss --watch -E utf-8 scss:css --style compressed
	한글 주석 사용을 위해 -E utf-8을 추가하고,
	파일이 아닌 scss:css를 사용하여 폴더에 watch를 연결합니다.
	--style compressed로 최대압축을 적용합니다.
	```
+ 주석사용
	- 시작과 끝 : /// 영역시작, ///-- 영역끝
	- 설명 : // 한 줄 설명, /* 여러 줄 설명 \*/
+ transition 모션은 퍼포먼스를 위해 **opacity, transform** 에만 적용합니다.  
	그 외 모션은 **tweenmax** 스크립트 모션으로 사용합니다.
+ font-weight는 normal, bold 대신 **400, 700 등** 숫자로 사용
+ Noto webfont의 weight는 **thin 100, light 300, demilight/regular 400, medium 500, bold 700, black 900** 으로 적용
+ Gothic A1 webfont의 weight는 **thin 100, extra light 200, light 300, regular 400, medium 500, semi bold 600, bold 700, extra bold 800, black 900** 으로 적용
+ 모바일에서 **position: fixed** 속성은 안드로이드 낮은 버전관 ios에서 오류가 많아 사용에 주의
+ 값을 지정할 때 사용하는 **calc()** 와 수치에 사용하는 **vmax, vmin** 등은 안드로이드 4.4에서 지원하지 않으므로 사용에 주의
+ CSS3 속성 사용은 [caniuse](https://caniuse.com/)에서 크로스브라우징 확인 필수
+ **CSS 사용 순서**
	```
	display, visibility, overflow(x, y), box(sizing, shadow),
	flex(wrap, direction, grow, shrink, basis),
	align(content, items, self), justify-content,
	clear, float,
	position, z-index, top, right, bottom, left,
	margin(top, right, bottom, left), padding(top, right, bottom, left),
	width(min, max), height(min, max), border(size, style, color, radius), outline
	background(image, color, repeat, position, size, origin),
	vertical-align, list-style,
	font(style, weight, size, family), line-height,
	text(align, indent, overflow, shadow), letter-spacing, white-space, word(wrap, break, spacing),
	counter(reset, increment), content,
	opacity, transform(origin, style),
	transition(property, duration, timing, delay),
	pointer-events, 그 외 속성
	```
+ 그 외 참고사항
	- **:before, :after** : inline-block 속성이 적용되어 있습니다.  
	적용할 때 content: ""만 설정하면 width와 height 등을 바로 설정할 수 있습니다.
	- **i, b** : 태그를 변형해서 사용하기위해 inline-block 속성이 적용되어 있습니다.
<br><br>
- - -

### JAVASCRIPT
+ 라이브러리 (플러그인) 파일은 아래 경로를 통해 **CDN, git URL** 을 확인할 수 있습니다.
	- [cdnjs](https://cdnjs.com/)
	- [jsdelivr](https://www.jsdelivr.com/)
+ 규칙
	- 일반 변수명 **앞에 \_언더스코어** 추가 (\_var)
	- 엘리먼트 변수명은 \_없이 **문자 그대로** 사용 (element)
	- 오브젝트와 배열의 변수명은 \_없이 **뒤에 s를** 추가 (objects, arrays)
	- jQuery 셀렉터는 **앞에 $** 추가 ($selector)
	- 함수 (function)의 파라미터에는 **앞에 \__언더스코어 2개** 추가 (\__args)
	- 변수명과 함수명은 **카멜타입** 으로 사용 (aaBbCc)
	- 문자열은 "더블퀏"이 아닌 **'싱글퀏'** 으로 사용
+ 라이브러리 (플러그인)
	- [jQuery](https://github.com/jquery/jquery)
		* slim버전을 사용합니다.
		* slim버전에서는 animate와 ajax 등 일부 기능이 제거됐습니다.
	- [axios](https://github.com/axios/axios)
		* jQuery ajax 대신 사용하는 ajax 플러그인 입니다.
		* promise 기반으로 IE10 이하 지원을 위해 폴리필 ***es6-promise.auto-4.2.4.min.js*** 을 추가합니다.
		* 요청 취소 등 디테일한 설정이 가능합니다.
	- [lodash](https://github.com/lodash/lodash)
		* object, array 등을 손쉽게 변환/사용할 수 있도록 지원하는 라이브러리입니다.
	- [load-image](https://github.com/blueimp/JavaScript-Load-Image)
		* 이미지의 EXIF 속성을 확인할 수 있습니다.
		* 이미지를 로드할 때 img, canvas 등으로 설정할 수 있습니다.
		* EXIF 속성으로 카메라로 찍은 사진의 회전 값을 확인할 수 있습니다.
	- [gsap](https://github.com/greensock/GSAP)
		* DOM 모션 플러그인입니다.
		* CSS transition보다 퍼포먼스가 좋습니다. (opacity, transform 제외)
	- [moment](https://github.com/moment/moment)
		* 다양한 date 포멧을 지원합니다.
	- [sortable](https://github.com/RubaXa/Sortable)
		* jQuery UI의 sortable보다 퍼포먼스가 좋습니다.
		* 컨텐츠의 순서를 변경할 때 사용합니다.
		* 드래그하는 요소에 ```touch-action: none``` CSS를 적용해야 브라우저 console창에 오류가 표시되지 않습니다.
	- [chart](https://github.com/chartjs/Chart.js)
		* 다양한 차트를 svg가 아닌 canvas로 구현합니다.
		* svg보다 생성하는 DOM개수가 월등히 적습니다.
	- ~~[swiper](https://github.com/nolimits4web/Swiper)~~
		* 컨텐츠 슬라이드 플러그인입니다.
	- ~~[pikaday](https://github.com/dbushell/Pikaday)~~
		* jQuery UI의 datepicker보다 퍼포먼스가 좋습니다.
	- ~~[overlay scrollbars](https://github.com/KingSora/OverlayScrollbars)~~
		* 커스텀 스크롤바 플러그인입니다.
	- ~~[ckeditor4](https://github.com/ckeditor/ckeditor-dev)~~
		* WYSIWYG 텍스트 에디터입니다.
		* IE 브라우저 지원을 위해 **4 full 버전** 으로 기능을 최소화하여 사용합니다.
		* 최소화와 최적화를 위해 *config.js* 와 *contents.css* 를 수정했습니다.
	- ~~[template7](https://github.com/nolimits4web/Template7)~~
		* javascript template 플러그인입니다.
		* handlebars보다 사용자는 적지만 퍼포먼스가 좋습니다.
	- ~~[handlebars](https://github.com/wycats/handlebars.js)~~
		* javascript template 플러그인입니다.
		* mustache 기반으로 사용자가 가장 많습니다.
	- ~~[vue](https://github.com/vuejs/vue)~~
		* javascript template 플러그인입니다.
		* 데이터 바인딩을 지원합니다.
	- ~~[vue-router](https://github.com/vuejs/vue-router)~~
		* history 이동 등 SPA를 구현할 때 사용합니다.
