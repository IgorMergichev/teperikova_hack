/*jshint esversion: 6 */
(function () {
	'use strict';
	let baseUrl = '';
	const isIos = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i);
	const isMobile = navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| isIos;

	let vkAuth = function (e) {

		this.init = function(params) {

			baseUrl = params[0];

			let desktopUrl = 'https:' + baseUrl + '&isMobileApp=0';

			if (!isMobile) {
				//e.preventDefault();
				const delayUrl = '/pl/vk/redirect/delay';
				fetch(delayUrl, {
					method: 'POST',
					mode: 'cors',
					cache: 'no-cache',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/json'
					},
					redirect: 'follow',
					referrerPolicy: 'no-referrer',
					body: JSON.stringify({redirect: baseUrl})
				}).then(() => {
					window.location = desktopUrl;
				}, error => {
					console.log(error);
				});
			}
		};
	};

	window.vkAuth = new vkAuth();
})();

var vkNativeApp = (function($) {
	"use strict";
	var Settings = {};
	var AppLaunchStrategyParameters =  {
		getAppUri : function() {
			return 'https:' + Settings.url;
		},
		getAppLauncherEl : function() {
			if (!Settings.appLauncherElId) {
				throw new Error('Settings does not have valid appLauncherElId');
			}
			return $('#' + Settings.appLauncherElId);
		},
		getAppStoreURI: function() {
			return 'https:' + Settings.url;
		}
	};

	var AndroidAppLaunchStrategyParameters = $.extend({}, AppLaunchStrategyParameters, {
		getIntentURI: function() {
			return "intent:" + Settings.mobileUrl + "/#Intent;scheme=vk;package="+ Settings.androidAppId +";end";
		},
		getAppUri: function () {
			return Settings.appUri;
		},
		getAppStoreURI: function () {
			return "https:" + Settings.url;
		}
	});

	var IOSAppLaunchStrategyParameters = $.extend({}, AppLaunchStrategyParameters, {
		getAppStoreURI: function () {
			return "https:" + Settings.url;
		},
		getUniversalLinkingUrl : function() {
			return Settings.universalLinkUrl;
		},
		getAppUri : function() {
			return Settings.appUri;
		},
	});

	var AppLaunchStrategy = function (strategyParameters) {
		this.strategyParameters = strategyParameters;
		this.init = function(){};
	};

	var DirectAppOnlyLaunchStrategy = function(strategyParameters) {
		this.init = function () {
			var el = strategyParameters.getAppLauncherEl();
			var appURI = strategyParameters.getAppUri();
			el.click(function(e){
				e.preventDefault();
				window.location.reload();
			});
			window.location = appURI;
		};
	};

	var DirectAppLaunchStrategy = function(strategyParameters) {
		AppLaunchStrategy.call(this, strategyParameters);
		var events = ["pagehide", "blur", "beforeunload"];
		var timeout = null;
		var preventDialog = function () {

			clearTimeout(timeout);
			timeout = null;
			$(window).unbind(events.join(" "));
		};

		var el = strategyParameters.getAppLauncherEl();

		var redirect = function () {
			window.location = strategyParameters.getAppUri();
			timeout = setTimeout(function() {
				window.top.location = strategyParameters.getAppStoreURI();
			}, 5000);
		};

		this.init = function() {
			$(window).on("pagehide", preventDialog);
			$(window).on("blur", preventDialog);
			$(window).on("beforeunload", preventDialog);

			el.unbind('click').on('click', function(e) {
				e.preventDefault();
				redirect();
			});
		};
	};

	var MiUIAppLaunchStrategy = function(strategyParameters) {
		AppLaunchStrategy.call(this, strategyParameters);
		const events = ["pagehide", "blur", "beforeunload"].join(" ");
		let timeout = null;
		const preventDialog = function () {
			clearTimeout(timeout);
			timeout = null;
			$(window).off(events);
		};

		const el = strategyParameters.getAppLauncherEl();

		const redirect = function () {
			//редирект в приложение вк если установлено
			window.location = strategyParameters.getAppUri();
			timeout = setTimeout(function() {
				// если не установлено, то через секунду редирект в браузере
				window.top.location = strategyParameters.getAppStoreURI();
			}, 1000);
		};

		this.init = function() {
			$(window).on(events, preventDialog);
			el.off('click').on('click', function(e) {
				e.preventDefault();
				redirect();
			});
		};
	};

	var CTAAppLaunchStrategy = function(strategyParameters) {
		AppLaunchStrategy.call(this, strategyParameters);

		this.init = function() {
			var directStrategy = new DirectAppLaunchStrategy(strategyParameters);
			var el = strategyParameters.getAppLauncherEl();
			var id = el.attr('id');
			$("body").on('click',  '#' + id, function(e) {
				e.preventDefault();
				directStrategy.init();
			});
		};
	};

	var CTAIntentAppLaunchStrategy = function(strategyParameters) {
		AppLaunchStrategy.call(this, strategyParameters);

		this.init = function() {
			strategyParameters.
			getAppLauncherEl().
			attr('href', strategyParameters.getIntentURI());
		};
	};

	var AppLaunchNotSupportedStrategy = function(strategyParameters) {
		AppLaunchStrategy.call(this, strategyParameters);
		this.init = function () {
			const id = strategyParameters.getAppLauncherEl().attr('id');
			$("body").on('click',  '#' + id, function(e) {
				e.preventDefault();
			});
		};
	};

	function createCookie(name, value, second) {
		var date = new Date();
		date.setTime(date.getTime()+(second * 1000));
		var expires = "; expires="+date.toGMTString();
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1,c.length);
			}
			if (c.indexOf(nameEQ) === 0) {
				return c.substring(nameEQ.length,c.length);
			}
		}
		return null;
	}

	function eraseCookie(name) {
		createCookie(name,"",-1);
	}

	var UniversalLinkingAppLaunchStrategy = function(strategyParameters) {
		var $cookieName = 'ul-app-detection-flag';
		function appNotInstalled() {
			return readCookie($cookieName) > 1;
		}

		function setCookie() {
			var $cookieValue = readCookie($cookieName);
			if (!$cookieValue || isNaN($cookieValue)) {
				createCookie($cookieName, 1, 60);
			} else {
				createCookie($cookieName, 2, 60);
			}
		}

		AppLaunchStrategy.call(this, strategyParameters);

		this.init = function() {
			var el = strategyParameters.getAppLauncherEl();
			var $location = strategyParameters.getUniversalLinkingUrl();

			if (appNotInstalled()) {
				window.location = strategyParameters.getAppStoreURI();
				eraseCookie();
			}
			el.attr('href', $location);

			$(window).on('blur', function() {
				eraseCookie($cookieName);
			});

			setCookie();
			el.click(function() {
				setCookie();
			});
		};
	};

	var BrowserChecker = function() {
		var userAgent = window.navigator.userAgent.toLowerCase();

		var isIOS = function() {
			return /(?:i(?:phone|p(?:o|a)d))/.test(userAgent);
		};

		var iOSVersion = function() {
			return isIOS() ? parseInt(userAgent.match(/os\s+(\d+)_/)[1], 10) : false;
		};

		var hasVersion = function() {
			return userAgent.indexOf('version') > -1;
		};

		var appleWebKitVersion = function() {
			var match = userAgent.match(/AppleWebKit\/([\d.]+)/);
			return match ? parseFloat(match[1]) : false;
		};

		var isFacebook = function () {
			return !!userAgent.match(/FBAV/i);
		};

		var isChrome = function () {
			return userAgent.indexOf('chrome') > -1;
		};

		var chromeVersion = function () {
			var raw = userAgent.match(/chrom(e|ium)\/([0-9]+)\./);
			return raw ? parseInt(raw[2], 10) : false;
		};

		var isTwitter = function () {
			return userAgent.indexOf('twitter') > -1;
		};

		var isInstagram = function () {
			return userAgent.indexOf('instagram') > -1;
		};

		var isMiBrowser = function () {
			return userAgent.indexOf('xiaomi/mi') > -1;
		};

		var isAndroid = function () {
			return userAgent.indexOf('android') > -1;
		};

		var androidVersion = function() {
			var match = userAgent.match(/android\s([\d.]*)/);
			return match ? parseFloat(match[1]) : false;
		};

		var isAndroidStockBrowser = function() {
			return isAndroid()
				&& isChrome()
				&& hasVersion()
				&& !isFacebook(); // FB uses this browser, but deep links with custom URI scheme.

		};

		var isAndroidNativeBrowser = function() {
			return !isFacebook()
				&& (isAndroid() && (appleWebKitVersion() && appleWebKitVersion() < 537)
					||
					(chromeVersion() && chromeVersion() < 37));
		};

		return {
			isIOS: isIOS(),
			iOSVersion: iOSVersion(),
			isAndroid: isAndroid(),
			androidVersion: androidVersion(),
			isAndroidStockBrowser: isAndroidStockBrowser(),
			isAndroidNativeBrowser: isAndroidNativeBrowser(),
			isFacebook: isFacebook(),
			isChrome: isChrome(),
			isTwitter: isTwitter(),
			isInstagram: isInstagram(),
			isMiBrowser: isMiBrowser(),
		};
	};

	var AppLaunchStrategyParameterFactory = function() {
		var strategyParameters = AppLaunchStrategyParameters;

		if (BrowserChecker().isIOS) {
			strategyParameters = IOSAppLaunchStrategyParameters;
		} else if (BrowserChecker().isAndroid) {
			strategyParameters = AndroidAppLaunchStrategyParameters;
		}
		return strategyParameters;
	};

	var AppLaunchStrategyFactory = function (strategyType) {
		var strategyParameters = AppLaunchStrategyParameterFactory();
		var appLaunchStrategy;
		if (strategyType === 'cta' || strategyType === undefined) {
			appLaunchStrategy = new CTAAppLaunchStrategy(strategyParameters);
		} else if(strategyType === 'direct') {
			appLaunchStrategy = new DirectAppLaunchStrategy(strategyParameters);
		} else if (strategyType === 'ul') {
			appLaunchStrategy =  new UniversalLinkingAppLaunchStrategy(strategyParameters);
		} else if (strategyType === 'mi') {
			appLaunchStrategy =  new MiUIAppLaunchStrategy(strategyParameters);
		} else if (strategyType === 'notsupported') {
			appLaunchStrategy =  new AppLaunchNotSupportedStrategy(strategyParameters);
		} else if (strategyType === 'directapponly') {
			appLaunchStrategy =  new DirectAppOnlyLaunchStrategy(strategyParameters);
		} else if (strategyType === 'intent_cta') {
			appLaunchStrategy =  new CTAIntentAppLaunchStrategy(strategyParameters);
		} else {
			throw new Error('Deeplinking: Unsupported deeplinking strategy type');
		}

		return appLaunchStrategy;
	};

	var AppLauncherFactory = function() {
		var browser = BrowserChecker();

		var deepLinkingStrategy = new AppLaunchStrategyFactory('cta');

		if (browser.isInstagram) {
			return new AppLaunchStrategyFactory('direct');
		}

		if (browser.isMiBrowser) {
			return new AppLaunchStrategyFactory('mi');
		}

		if (browser.isIOS) {
			if (browser.iOSVersion < 9) {
				deepLinkingStrategy = new AppLaunchStrategyFactory('direct');
				if (browser.isTwitter) {
					deepLinkingStrategy = new AppLaunchStrategyFactory('directapponly');
				}
			} else {
				deepLinkingStrategy = new AppLaunchStrategyFactory('direct');
				if (browser.isFacebook) {
					deepLinkingStrategy = new AppLaunchStrategyFactory('ul');
				}
			}
		} else if (browser.isAndroid) {
			deepLinkingStrategy = new AppLaunchStrategyFactory('intent_cta');
			if (browser.isAndroidNativeBrowser || browser.isAndroidStockBrowser) {
				deepLinkingStrategy = new AppLaunchStrategyFactory('notsupported');
			}
		}

		return deepLinkingStrategy;
	};

	var Init = function (settings) {
		Settings = settings;
		setTimeout(function() {
			return AppLauncherFactory().init();
		}, 1000);

	};

	var Utils = {};

	return {
		init: Init,
		browserChecker: BrowserChecker,
		util: Utils,
		androidParameters: AndroidAppLaunchStrategyParameters,
		iOSParameters:IOSAppLaunchStrategyParameters
	};
})(jQuery);
