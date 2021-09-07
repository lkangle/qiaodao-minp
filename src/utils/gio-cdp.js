'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Utils = {
    // dev version
    devVer: 1,
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },
    getScreenHeight: function (info) {
        if (info.pixelRatio) {
            return Math.round(info.screenHeight * info.pixelRatio);
        }
        return info.screenHeight;
    },
    getScreenWidth: function (info) {
        if (info.pixelRatio) {
            return Math.round(info.screenWidth * info.pixelRatio);
        }
        return info.screenWidth;
    },
    getOS: function (system) {
        if (system) {
            const lowsys = system.toLowerCase();
            if (lowsys.indexOf('android') != -1) {
                return `${gioGlobal.platformConfig.name}-Android`;
            }
            else if (lowsys.indexOf('ios') != -1) {
                return `${gioGlobal.platformConfig.name}-iOS`;
            }
            else {
                return system;
            }
        }
    },
    getOSV: (version) => {
        return `${gioGlobal.platformConfig.name} ${version}`;
    },
    isEmpty: (obj) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    },
    compareVersion(v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        const len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);
            if (num1 > num2) {
                return 1;
            }
            else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    },
    /**
     * 解析地址中的query成对象
     * @param query 不带?号的query
     */
    queryParse(query) {
        const result = {};
        if (query) {
            const kvs = query.split('&');
            for (const kv of kvs) {
                const kvr = kv.split('='), len = kvr.length;
                if (len == 2) {
                    result[kvr[0]] = kvr[1];
                }
                else if (len == 1 && !!kvr[0]) {
                    result[kvr[0]] = '';
                }
            }
        }
        return result;
    },
    queryStringify(obj, ...excludes) {
        return Object.keys(obj)
            .filter((key) => !excludes || !excludes.includes(key))
            .map((key) => {
            return `${key}=${obj[key]}`;
        })
            .join('&');
    },
    /**
     * 清除连接中的分享参数
     * @param query 原查询参数
     */
    clearShareQuery(query) {
        if (!query) {
            return;
        }
        const qo = Utils.queryParse(query);
        delete qo.shareId;
        delete qo.contentType;
        return Utils.queryStringify(qo);
    }
};
const splitPath = (fullPath) => {
    if (fullPath) {
        const idx = fullPath.indexOf('?');
        if (idx !== -1) {
            const path = fullPath.substring(0, idx);
            const query = fullPath.substring(idx + 1);
            return [path, query];
        }
    }
    return [fullPath, ''];
};
const initGlobal = (platform) => {
    Object.defineProperty(Object.prototype, 'gioGlobal', {
        get() {
            if (platform === 'quickApp') {
                //@ts-ignore
                return global.__proto__;
            }
            else if (platform === 'my') {
                return $global;
            }
            else {
                return global;
            }
        },
        configurable: false,
        enumerable: false
    });
};
/**
 * 判断是不是在taro3中
 */
const isTaro3 = () => {
    let taro = gioGlobal.vdsConfig.taro;
    if (taro.vue) {
        return true;
    }
    if (taro && taro.taro) {
        taro = taro.taro;
    }
    return !!taro && !taro.createApp && !!document.getElementById;
};
const firstLowerCase = (str) => {
    return str.replace(str[0], str[0].toLowerCase());
};
const getDataByPath = (obj, url) => {
    if (!obj)
        return obj;
    const keys = url.split('.');
    let target = obj[keys.shift()];
    for (let i = 0, len = keys.length; i < len; i++) {
        const currentKeys = keys.shift();
        if (target) {
            target = target[currentKeys];
        }
        else {
            return target;
        }
    }
    return target;
};
const getManualImpInfo = (data) => {
    const result = {
        eventId: undefined,
        properties: {}
    };
    // 兼容老版本写法
    try {
        if (data.hasOwnProperty('gioTrack') && typeof data.gioTrack === 'object') {
            result.eventId = data.gioTrack.name;
            result.properties = data.gioTrack.properties;
            return result;
        }
        if (!data.gioImpTrack) {
            return result;
        }
        else {
            result.eventId = data.gioImpTrack;
        }
        const propReg = /^gioTrack(.+)/;
        const eventIdReg = /^\w+$/;
        for (const key in data) {
            let normKey;
            const matchArr = key.match(propReg);
            if (matchArr) {
                normKey = firstLowerCase(matchArr[1]);
                normKey === 'track'
                    ? (result.eventId = data[key])
                    : (result.properties[normKey] = data[key]);
            }
            if (!eventIdReg.test(result.eventId) ||
                parseInt(result.eventId[0]) < 10) {
                result.eventId = null;
                throw new Error();
            }
        }
    }
    catch (e) {
        console.warn('半打点IMP格式不正确, 事件名只能包含数字，字母和下划线，且不以数字开头, 请参考文档');
    }
    return result;
};
const stringifyVar = (properties) => {
    const varibles = properties;
    for (const item in properties) {
        if (typeof properties[item] !== 'string') {
            varibles[item] = JSON.stringify(properties[item]);
        }
    }
    return varibles;
};
const isString = (str) => {
    return str && typeof str === 'string' && str.constructor === String;
};
const getItem = (item) => {
    if (!item || typeof item !== 'object')
        return null;
    if (item.id && item.key) {
        const cItem = {
            id: typeof item.id === 'string' ? item.id : JSON.stringify(item.id),
            key: typeof item.key === 'string' ? item.key : JSON.stringify(item.key)
        };
        if (item.attributes) {
            cItem.attributes = item.attributes;
        }
        return cItem;
    }
    return null;
};
const defineInfoHook = (infoHook) => {
    return function () {
        try {
            const result = typeof infoHook !== 'function' ? {} : infoHook.apply(this, arguments);
            if (result instanceof Promise) {
                return result;
            }
            return Promise.resolve(result);
        }
        catch (e) {
            return Promise.reject(e);
        }
    };
};
const truth = (value) => {
    return value ? value : undefined;
};
const normalPath = (path) => {
    if (!/^\//.test(path)) {
        return '/' + path;
    }
    return path;
};
const SUPPORT_IGNORED_FIELDS = [
    'networkState',
    'screenHeight',
    'screenWidth',
    'deviceBrand',
    'deviceModel',
    'deviceType'
];
const getValidIgnoreFields = (ignoreFields) => {
    if (!ignoreFields)
        return null;
    ignoreFields = Array.isArray(ignoreFields) ? ignoreFields : [ignoreFields];
    return ignoreFields.filter((field) => SUPPORT_IGNORED_FIELDS.includes(field));
};
const omit = (obj, ...fields) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (fields.indexOf(key) == -1) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

// 当前页面参数中的分享id
let queryShareId = undefined;
/**
 * 在query上添加shareId和suid
 *
 * @param query  当前用户query
 * @param uid    当前uid
 * @param result 分享的return值
 */
function buildShareQuery(query, uid, result) {
    const shareQuery = { gioShareId: Utils.guid(), suid: uid };
    const queryObj = Object.assign(Utils.queryParse(query), shareQuery);
    const contentType = queryObj.contentType || result.contentType;
    const contentId = queryObj.contentId || result.contentId;
    if (contentType) {
        shareQuery.contentType = contentType;
    }
    if (contentId) {
        shareQuery.contentId = contentId;
    }
    if (queryShareId) {
        shareQuery.gioPreShareId = queryShareId;
    }
    return [Utils.queryStringify(queryObj), shareQuery];
}
function updateShareResult(observer, page, result) {
    const growingio = observer.growingio;
    if (growingio && growingio.vdsConfig.followShare) {
        const uid = growingio.info.uid;
        if (!result) {
            result = {};
        }
        if (!result.title) {
            result.title = observer.info.getPageTitle(page);
        }
        const currentPage = observer.currentPage;
        const [path, query] = splitPath(result.path);
        // 优先使用path中query string
        const [queryStr, shareQuery] = buildShareQuery(query || result.query, uid, result);
        result.query = queryStr;
        result.path = normalPath((path || currentPage.path) + '?' + queryStr);
        result.attributes = shareQuery;
    }
    return result;
}
function onPageShow(page) {
    const queryObj = Utils.queryParse(page.query);
    if (queryObj.gioShareId) {
        queryShareId = queryObj.gioShareId;
    }
}

let eventStopMap = {};
// 判断当前事件是不是被阻止了
function isPropagationStopped(event) {
    const tid = event.target.id;
    const cid = event.currentTarget.id;
    if (!cid || cid === tid) {
        return false;
    }
    return !!eventStopMap[tid];
}
function noEvent(event) {
    return !event || !event.target || !event.type;
}
function octopusNeedHook(actions, event) {
    if (noEvent(event))
        return;
    return actions.includes(event.type) && !isPropagationStopped(event);
}
// 事件执行后
function octopusHookEventAfter(event) {
    if (noEvent(event))
        return;
    const tid = event.target.id;
    if (event.isPropagationStopped) {
        eventStopMap[tid] = event.isPropagationStopped();
    }
}

/**
 * 在原来用户参数的基础上，设置分享时的参数，放在query或path中
 * {
 *   shareId: string,
 *   suid: string
 * }
 * @param page 小程序页面page实例
 * @param isShareTime 是不是分享朋友圈
 * @param result {path?: string, query?: string, ...}
 */
const setShareResult = (page, isShareTime, result) => updateShareResult(VdsInstrumentAgent.observer, page, result);
const isPageShare = (key) => {
    return (key == gioGlobal.platformConfig.lisiteners.page.shareApp ||
        key == gioGlobal.platformConfig.lisiteners.page.shareTime);
};
const getConfigByPath = (path) => {
    const growingio = VdsInstrumentAgent.observer.growingio;
    return getDataByPath(growingio, `vdsConfig.${path}`);
};
const VdsInstrumentAgent = {
    defaultPageCallbacks: {},
    defaultAppCallbacks: {},
    appHandlers: null,
    pageHandlers: null,
    actionEventTypes: null,
    // videoHandlers: ['play', 'pause', 'ended', 'error'],
    originalPage: null,
    originalApp: null,
    originalComponent: null,
    originalBehavior: null,
    observer: null,
    /**
     * hook 对应的方法
     * @param name  方法名
     * @param method 方法体
     * @param _pageInstance 该方法所在的页面实例，若不设置则为this
     */
    hook: function (name, method, _pageInstance) {
        return function () {
            const pageInstance = _pageInstance || this;
            // 调用原方法
            let result;
            const event = arguments ? arguments[0] : undefined;
            const isOctopus = getConfigByPath('octopus');
            const invokeActionListener = () => {
                if (event &&
                    (event.currentTarget || event.target) &&
                    VdsInstrumentAgent.actionEventTypes.indexOf(event.type) != -1 &&
                    (_pageInstance || !isTaro3())) {
                    try {
                        VdsInstrumentAgent.observer.actionListener(event, name);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            };
            if (!isOctopus)
                invokeActionListener();
            const appLisiteners = gioGlobal.platformConfig.lisiteners.app;
            const pageLisiteners = gioGlobal.platformConfig.lisiteners.page;
            if (pageInstance._growing_app_ && name !== appLisiteners.appShow) {
                result = method.apply(this, arguments);
            }
            else if (pageInstance._growing_page_ &&
                [
                    pageLisiteners.pageShow,
                    pageLisiteners.pageClose,
                    pageLisiteners.pageLoad,
                    pageLisiteners.pageHide,
                    pageLisiteners.tabTap
                ].indexOf(name) === -1) {
                result = method.apply(this, arguments);
            }
            else if (!pageInstance._growing_app_ && !pageInstance._growing_page_) {
                result = method.apply(this, arguments);
            }
            // Hook App
            if (pageInstance._growing_app_) {
                if (!VdsInstrumentAgent.observer.cdpObserver) {
                    if (VdsInstrumentAgent.appHandlers.indexOf(name) !== -1) {
                        try {
                            VdsInstrumentAgent.defaultAppCallbacks[name].apply(this, arguments);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
                if (name === appLisiteners.appShow) {
                    result = method.apply(this, arguments);
                }
            }
            // Hook Page
            if (pageInstance._growing_page_) {
                if (VdsInstrumentAgent.pageHandlers.indexOf(name) !== -1) {
                    // for onShareAppMessage
                    if (pageLisiteners.shareTime == name) {
                        result = setShareResult(pageInstance, true, result);
                    }
                    else if (pageLisiteners.shareApp == name) {
                        result = setShareResult(pageInstance, false, result);
                    }
                    const args = Array.prototype.slice.call(arguments);
                    if (result) {
                        args.push(result);
                    }
                    try {
                        VdsInstrumentAgent.defaultPageCallbacks[name].apply(pageInstance, args);
                    }
                    catch (e) {
                        console.error(e);
                    }
                    if ([
                        pageLisiteners.pageShow,
                        pageLisiteners.pageClose,
                        pageLisiteners.pageLoad,
                        pageLisiteners.pageHide,
                        pageLisiteners.tabTap
                    ].indexOf(name) !== -1) {
                        result = method.apply(this, arguments);
                    }
                }
            }
            // 对于octopus框架需要后置执行hook
            if (isOctopus &&
                octopusNeedHook(VdsInstrumentAgent.actionEventTypes, event)) {
                invokeActionListener();
            }
            octopusHookEventAfter(event);
            return result;
        };
    },
    hookComponent: function (name, method) {
        return function () {
            // 调用原方法
            const event = arguments ? arguments[0] : undefined;
            if (event &&
                (event.currentTarget || event.target) &&
                VdsInstrumentAgent.actionEventTypes.indexOf(event.type) != -1) {
                try {
                    VdsInstrumentAgent.observer.actionListener(event, name);
                }
                catch (e) {
                    console.error(e);
                }
            }
            const result = method.apply(this, arguments);
            return result;
        };
    },
    /**
     * TODO: pvar事件（setPage）在onLoad中会出现p取值错误和发送早于page事件的问题
     * 原设计为放在onReady中，但文档上的示例放在了onShow中
     */
    hookPage(name, method) {
        return function () {
            let result = method.apply(this, arguments);
            // 重组分享结果
            if (name === gioGlobal.platformConfig.lisiteners.page.shareTime) {
                result = setShareResult(this, true, result);
            }
            else if (name === gioGlobal.platformConfig.lisiteners.page.shareApp) {
                result = setShareResult(this, false, result);
            }
            const args = Array.prototype.slice.call(arguments);
            if (result) {
                args.push(result);
            }
            VdsInstrumentAgent.observer.pageListener(this, name, args);
            return result;
        };
    },
    instrument: function (options) {
        const obj = {};
        const fillProperty = (key) => {
            if (typeof options[key] === 'function' && key !== 'constructor') {
                obj[key] = this.hook(key, options[key]);
            }
            else {
                obj[key] = options[key];
            }
        };
        Object.getOwnPropertyNames(options).forEach(fillProperty);
        if (options.__proto__ !== Object.prototype) {
            Object.getOwnPropertyNames(options.__proto__).forEach(fillProperty);
        }
        if (obj._growing_app_) {
            VdsInstrumentAgent.appHandlers.map(function (fun) {
                if (!obj[fun]) {
                    obj[fun] = VdsInstrumentAgent.defaultAppCallbacks[fun];
                }
            });
        }
        if (obj._growing_page_) {
            VdsInstrumentAgent.pageHandlers.map(function (fun) {
                // 补充页面中的生命周期回调，用与hook
                if (!obj[fun] &&
                    fun !== gioGlobal.platformConfig.lisiteners.page.shareApp &&
                    fun !== gioGlobal.platformConfig.lisiteners.page.shareTime) {
                    obj[fun] = VdsInstrumentAgent.defaultPageCallbacks[fun];
                }
            });
        }
        return obj;
    },
    instrumentPageComponent: function (methods) {
        if (!methods) {
            return;
        }
        VdsInstrumentAgent.pageHandlers.map(function (key) {
            if (typeof methods[key] === 'function') {
                methods[key] = VdsInstrumentAgent.hookPage(key, methods[key]);
            }
            else if (key !== gioGlobal.platformConfig.lisiteners.page.shareApp &&
                key !== gioGlobal.platformConfig.lisiteners.page.shareTime) {
                // 不自动hook分享，因为自动hook会帮用户把分享打开了
                const keyName = key;
                methods[key] = function () {
                    VdsInstrumentAgent.observer.pageListener(this, keyName, arguments);
                };
            }
        });
        return methods;
    },
    instrumentComponent: function (obj) {
        const isPageMethod = (name) => VdsInstrumentAgent.pageHandlers.indexOf(name) != -1;
        const asPage = obj._growing_aspage_;
        const methods = obj['methods'] || {};
        Object.entries(methods).forEach(([key, method]) => {
            if (typeof method != 'function')
                return;
            if (isPageMethod(key)) {
                methods[key] = asPage ? this.hookPage(key, method) : method;
            }
            else {
                methods[key] = this.hookComponent(key, method);
            }
        });
        if (asPage) {
            VdsInstrumentAgent.pageHandlers.map((key) => {
                if (!methods[key] && !isPageShare(key)) {
                    const keyName = key;
                    methods[key] = function () {
                        VdsInstrumentAgent.observer.pageListener(this, keyName, arguments);
                    };
                }
            });
        }
        obj['methods'] = methods;
        return obj;
    },
    GrowingPage: function (page) {
        page._growing_page_ = true;
        return VdsInstrumentAgent.originalPage(VdsInstrumentAgent.instrument(page));
    },
    GrowingComponent: function (component) {
        component._growing_aspage_ = gioGlobal.vdsConfig.comAsPage;
        return VdsInstrumentAgent.originalComponent(VdsInstrumentAgent.instrumentComponent(component));
    },
    GrowingBehavior: function (behavior) {
        return VdsInstrumentAgent.originalBehavior(VdsInstrumentAgent.instrumentComponent(behavior));
    },
    GrowingApp: function (app) {
        app._growing_app_ = true;
        return VdsInstrumentAgent.originalApp(VdsInstrumentAgent.instrument(app));
    },
    initPlatformInfo(config) {
        VdsInstrumentAgent.appHandlers = config.appHandlers;
        VdsInstrumentAgent.pageHandlers = config.pageHandlers;
        VdsInstrumentAgent.actionEventTypes = config.actionEventTypes;
        VdsInstrumentAgent.originalApp = config.originalApp;
        VdsInstrumentAgent.originalPage = config.originalPage;
        VdsInstrumentAgent.originalComponent = config.originalComponent;
        VdsInstrumentAgent.originalBehavior = config.originalBehavior;
    },
    initInstrument: function (observer) {
        VdsInstrumentAgent.initPlatformInfo(gioGlobal.platformConfig);
        VdsInstrumentAgent.observer = observer;
        VdsInstrumentAgent.pageHandlers.forEach(function (fun) {
            const funName = fun;
            VdsInstrumentAgent.defaultPageCallbacks[fun] = function () {
                VdsInstrumentAgent.observer.pageListener(this, funName, arguments);
            };
        });
        if (!VdsInstrumentAgent.observer.cdpObserver) {
            VdsInstrumentAgent.appHandlers.forEach(function (fun) {
                const funName = fun;
                VdsInstrumentAgent.defaultAppCallbacks[fun] = function () {
                    VdsInstrumentAgent.observer.appListener(this, funName, arguments);
                };
            });
        }
        if (gioGlobal.platformConfig.canHook) {
            const hooks = gioGlobal.platformConfig.hooks;
            if (hooks.App && !gioGlobal.growingAppInited) {
                App = function () {
                    return VdsInstrumentAgent.GrowingApp(arguments[0]);
                };
                // 保留百度挂载在originalApp切面上的属性
                if (gioGlobal.gio__platform === 'swan') {
                    for (const property in VdsInstrumentAgent.originalApp) {
                        App[property] = VdsInstrumentAgent.originalApp[property];
                    }
                }
                gioGlobal.growingAppInited = true;
            }
            if (hooks.Page && !gioGlobal.growingPageInited) {
                Page = function () {
                    return VdsInstrumentAgent.GrowingPage(arguments[0]);
                };
                if (gioGlobal.gio__platform === 'swan') {
                    for (const property in VdsInstrumentAgent.originalPage) {
                        Page[property] = VdsInstrumentAgent.originalPage[property];
                    }
                }
                gioGlobal.growingPageInited = true;
            }
            if (hooks.Component && !gioGlobal.growingComponentInited) {
                Component = function () {
                    return VdsInstrumentAgent.GrowingComponent(arguments[0]);
                };
                gioGlobal.growingComponentInited = true;
            }
            if (hooks.Behavior && !gioGlobal.growingBehaviorInited) {
                Behavior = function () {
                    return VdsInstrumentAgent.GrowingBehavior(arguments[0]);
                };
                gioGlobal.growingBehaviorInited = true;
            }
        }
        gioGlobal.GioPage = VdsInstrumentAgent.GrowingPage;
        gioGlobal.GioApp = VdsInstrumentAgent.GrowingApp;
        gioGlobal.GioComponent = VdsInstrumentAgent.GrowingComponent;
        gioGlobal.GioBehavior = VdsInstrumentAgent.GrowingBehavior;
        gioGlobal.trackApp = function () {
            const app = arguments[0];
            app._growing_app_ = true;
            return VdsInstrumentAgent.instrument(app);
        };
        gioGlobal.trackPage = function () {
            const page = arguments[0];
            page._growing_page_ = true;
            return VdsInstrumentAgent.instrument(page);
        };
        gioGlobal.trackComponent = function () {
            return VdsInstrumentAgent.instrument(arguments[0]);
        };
        gioGlobal.trackBehavior = function () {
            return VdsInstrumentAgent.instrument(arguments[0]);
        };
    }
};

if (!Object.hasOwnProperty('getOwnPropertyDescriptors')) {
  let ownKeys;

  if (typeof Reflect === 'object' && typeof Reflect.ownKeys === 'function') {
    ownKeys = Reflect.ownKeys;
  } else if (typeof Object.getOwnPropertySymbols === 'function') {
    ownKeys = function (o) {
      return Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));
    };
  } else {
    ownKeys = Object.getOwnPropertyNames;
  }

  Object.defineProperty(Object, 'getOwnPropertyDescriptors', {
    configurable: true,
    writable: true,
    value: function getOwnPropertyDescriptors(object) {
      return ownKeys(object).reduce((descriptors, key) => {
        return Object.defineProperty(descriptors, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: Object.getOwnPropertyDescriptor(object, key)
        });
      }, {});
    }
  });
}

if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array

    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

class BaseObserver {
    constructor(growingio) {
        this.growingio = growingio;
        this.esid = 0;
        this.info = growingio.info;
    }
    setUserAttributes() {
        // properties: { [key: string]: string }
        throw new Error('this a interface function');
    }
    setUserId() {
        // userId: string;
        throw new Error('this a interface function');
    }
    clearUserId() {
        throw new Error('this a interface function');
    }
    sendVisitEvent() {
        // args: any, getLocationType: getLocationType
        throw new Error('this a interface function');
    }
    track() {
        // name: string, properties: { [key: string]: string }
        throw new Error('this a interface function');
    }
    _sendEvent() {
        // event: any
        throw new Error('this a interface function');
    }
}

const eventTypeMap = {
  tap: ['tap', 'click'],
  longtap: ['longtap'],
  input: ['input'],
  blur: ['change', 'blur'],
  submit: ['submit'],
  focus: ['focus']
};
const fnExpRE = /^function[^(]*\([^)]+\).*[^.]+\.([^(]+)\(.*/;

function getComKey(vm) {
  return vm && vm.$attrs ? vm.$attrs['mpcomid'] : '0';
}

function isVmKeyMatchedCompkey(k, comkey, KEY_SEP$2) {
  if (!k || !comkey) {
    return false;
  } // 完全匹配 comkey = '1_0_1', k = '1_0_1'
  // 部分匹配 comkey = '1_0_10_1', k = '1_0_10'
  // k + KEY_SEP防止k = '1_0_1'误匹配comkey = '1_0_10_1'


  return comkey === k || comkey.indexOf(k + KEY_SEP$2) === 0;
}

function getVM(vm, comkeys, KEY_SEP$2) {
  if (comkeys === void 0) comkeys = [];
  var keys = comkeys.slice(1);

  if (!keys.length) {
    return vm;
  }

  var comkey = keys.join(KEY_SEP$2);
  var comidPrefix = '';
  return keys.reduce(function (res) {
    var len = res.$children.length;

    for (var i = 0; i < len; i++) {
      var v = res.$children[i];
      var k = getComKey(v);

      if (comidPrefix) {
        k = comidPrefix + KEY_SEP$2 + k;
      } // 找到匹配的父节点


      if (isVmKeyMatchedCompkey(k, comkey, KEY_SEP$2)) {
        comidPrefix = k;
        res = v;
        return res;
      }
    }

    return res;
  }, vm);
}

function getHandle(vnode, eventid, eventTypes) {
  if (eventTypes === void 0) eventTypes = [];
  var res = [];

  if (!vnode || !vnode.tag) {
    return res;
  }

  var ref = vnode || {};
  var data = ref.data;
  if (data === void 0) data = {};
  var children = ref.children;
  if (children === void 0) children = [];
  var componentInstance = ref.componentInstance;

  if (componentInstance) {
    // 增加 slot 情况的处理
    // Object.values 会多增加几行编译后的代码
    Object.keys(componentInstance.$slots).forEach(function (slotKey) {
      var slot = componentInstance.$slots[slotKey];
      var slots = Array.isArray(slot) ? slot : [slot];
      slots.forEach(function (node) {
        res = res.concat(getHandle(node, eventid, eventTypes));
      });
    });
  } else {
    // 避免遍历超出当前组件的 vm
    children.forEach(function (node) {
      res = res.concat(getHandle(node, eventid, eventTypes));
    });
  }

  var attrs = data.attrs;
  var on = data.on;

  if (attrs && on && attrs['eventid'] === eventid) {
    eventTypes.forEach(function (et) {
      var h = on[et];

      if (typeof h === 'function') {
        res.push(h);
      } else if (Array.isArray(h)) {
        res = res.concat(h);
      }
    });
  }

  return res;
}

const ONCE = '~';
const CUSTOM = '^';

function isMatchEventType(eventType, optType) {
  return eventType === optType || optType === 'regionchange' && (eventType === 'begin' || eventType === 'end');
}

class VueProxy {
  constructor(vueVM) {
    this.vueVM = vueVM;
  } // mpvue & 低版本uniapp


  getHandle(e) {
    var type = e.type;
    var target = e.target;
    if (target === void 0) target = {};
    var currentTarget = e.currentTarget;
    var ref = currentTarget || target;
    var dataset = ref.dataset;
    if (dataset === void 0) dataset = {};
    var comkey = dataset.comkey;
    if (comkey === void 0) comkey = '';
    var eventid = dataset.eventid;
    const KEY_SEP$2 = comkey.indexOf('_') !== -1 ? '_' : ',';
    var vm = getVM(this.vueVM, comkey.split(KEY_SEP$2), KEY_SEP$2);

    if (!vm) {
      return;
    }

    var webEventTypes = eventTypeMap[type] || [type];
    var handles = getHandle(vm._vnode, eventid, webEventTypes);

    if (handles.length) {
      var handle = handles[0];

      if (handle.isProxied) {
        return handle.proxiedName;
      } else {
        try {
          var handleString = handle.toString().replace('\n', '');

          if (handleString.match(fnExpRE)) {
            var matches = fnExpRE.exec(handleString);

            if (matches && matches.length > 1) {
              return matches[1];
            }
          }
        } catch (e) {//
        }

        return handle.name;
      }
    }
  } // 高版本uniapp


  handleEvent(event) {
    const eventType = event.type;
    let methodName;
    const dataset = (event.currentTarget || event.target).dataset;
    const eventOpts = dataset.eventOpts || dataset['event-opts'];
    eventOpts.forEach(eventOpt => {
      let type = eventOpt[0];
      const eventsArray = eventOpt[1];
      const isCustom = type.charAt(0) === CUSTOM;
      type = isCustom ? type.slice(1) : type;
      const isOnce = type.charAt(0) === ONCE;
      type = isOnce ? type.slice(1) : type;

      if (eventsArray && isMatchEventType(eventType, type)) {
        eventsArray.forEach(eventArray => {
          methodName = eventArray[0];
        });
      }
    });
    return methodName;
  }

}

function validVar (properties) {
    if (properties !== null &&
        Object.prototype.toString.call(properties) === '[object Object]') {
        if (Object.keys(properties).length > 0) {
            return true;
        }
    }
    return false;
}

const sdkVersion = '3.7.2';
const platformConfig = {
    wx: {
        name: 'Weixin',
        path: './weixin'
    },
    qq: {
        name: 'QQ',
        path: './qq'
    },
    my: {
        name: 'Alipay',
        path: './alipay'
    },
    swan: {
        name: 'Baidu',
        path: './baidu'
    },
    tt: {
        name: 'Bytedance',
        path: './bytedance'
    },
    quickApp: {
        name: 'Quickapp',
        path: './quickApp'
    },
    frame: {
        name: 'Frame',
        path: './multipleFrame'
    }
};

const Config = Object.assign(Object.assign({}, platformConfig.wx), { platform: 'MinP', scnPrefix: '', appHandlers: ['onShow', 'onHide', 'onError'], pageHandlers: [
        'onLoad',
        'onShow',
        'onShareAppMessage',
        'onShareTimeline',
        'onTabItemTap',
        'onHide',
        'onUnload'
    ], actionEventTypes: [
        'onclick',
        'tap',
        'longpress',
        'blur',
        'change',
        'submit',
        'confirm',
        'getuserinfo',
        'getphonenumber',
        'contact'
    ], originalApp: App, originalPage: Page, originalComponent: Component, originalBehavior: Behavior, 
    // 可以直接hook app等，例如插件版（低版本）不能修改APP，即不能直接hook
    canHook: true, hooks: {
        App: true,
        Page: true,
        Component: true,
        Behavior: true
    }, lisiteners: {
        app: {
            appShow: 'onShow',
            appClose: 'onHide',
            appError: 'onError'
        },
        page: {
            pageLoad: 'onLoad',
            pageShow: 'onShow',
            pageHide: 'onHide',
            pageClose: 'onUnload',
            tabTap: 'onTabItemTap',
            shareApp: 'onShareAppMessage',
            shareTime: 'onShareTimeline'
        },
        actions: {
            click: [
                'onclick',
                'tap',
                'longpress',
                'getuserinfo',
                'getphonenumber',
                'contact'
            ],
            change: ['blur', 'change', 'confirm'],
            submit: ['submit']
        }
    } });

var platformConfig$1 = Object.assign(Object.assign({}, Config), { sdkVer: sdkVersion });

/*!
 * EventEmitter v5.2.6 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - https://oli.me.uk/
 * @preserve
 */

/**
 * Class for managing events.
 * Can be extended to provide event functionality in other classes.
 *
 * @class EventEmitter Manages event registering and emitting.
 */
function EventEmitter() {//
} // Shortcuts to improve speed and size


var proto = EventEmitter.prototype;
var originalGlobalValue = exports.EventEmitter;
/**
 * Finds the index of the listener for the event in its storage array.
 *
 * @param {Function[]} listeners Array of listeners to search through.
 * @param {Function} listener Method to look for.
 * @return {Number} Index of the specified listener, -1 if not found
 * @api private
 */

function indexOfListener(listeners, listener) {
  var i = listeners.length;

  while (i--) {
    if (listeners[i].listener === listener) {
      return i;
    }
  }

  return -1;
}
/**
 * Alias a method while keeping the context correct, to allow for overwriting of target method.
 *
 * @param {String} name The name of the target method.
 * @return {Function} The aliased method
 * @api private
 */


function alias(name) {
  return function aliasClosure() {
    return this[name].apply(this, arguments);
  };
}
/**
 * Returns the listener array for the specified event.
 * Will initialise the event object and listener arrays if required.
 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
 * Each property in the object response is an array of listener functions.
 *
 * @param {String|RegExp} evt Name of the event to return the listeners from.
 * @return {Function[]|Object} All listener functions for the event.
 */


proto.getListeners = function getListeners(evt) {
  var events = this._getEvents();

  var response;
  var key; // Return a concatenated array of all matching events if
  // the selector is a regular expression.

  if (evt instanceof RegExp) {
    response = {};

    for (key in events) {
      if (events.hasOwnProperty(key) && evt.test(key)) {
        response[key] = events[key];
      }
    }
  } else {
    response = events[evt] || (events[evt] = []);
  }

  return response;
};
/**
 * Takes a list of listener objects and flattens it into a list of listener functions.
 *
 * @param {Object[]} listeners Raw listener objects.
 * @return {Function[]} Just the listener functions.
 */


proto.flattenListeners = function flattenListeners(listeners) {
  var flatListeners = [];
  var i;

  for (i = 0; i < listeners.length; i += 1) {
    flatListeners.push(listeners[i].listener);
  }

  return flatListeners;
};
/**
 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
 *
 * @param {String|RegExp} evt Name of the event to return the listeners from.
 * @return {Object} All listener functions for an event in an object.
 */


proto.getListenersAsObject = function getListenersAsObject(evt) {
  var listeners = this.getListeners(evt);
  var response;

  if (listeners instanceof Array) {
    response = {};
    response[evt] = listeners;
  }

  return response || listeners;
};

function isValidListener(listener) {
  if (typeof listener === 'function' || listener instanceof RegExp) {
    return true;
  } else if (listener && typeof listener === 'object') {
    return isValidListener(listener.listener);
  } else {
    return false;
  }
}
/**
 * Adds a listener function to the specified event.
 * The listener will not be added if it is a duplicate.
 * If the listener returns true then it will be removed after it is called.
 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
 *
 * @param {String|RegExp} evt Name of the event to attach the listener to.
 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.addListener = function addListener(evt, listener) {
  if (!isValidListener(listener)) {
    throw new TypeError('listener must be a function');
  }

  var listeners = this.getListenersAsObject(evt);
  var listenerIsWrapped = typeof listener === 'object';
  var key;

  for (key in listeners) {
    if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
      listeners[key].push(listenerIsWrapped ? listener : {
        listener: listener,
        once: false
      });
    }
  }

  return this;
};
/**
 * Alias of addListener
 */


proto.on = alias('addListener');
/**
 * Semi-alias of addListener. It will add a listener that will be
 * automatically removed after its first execution.
 *
 * @param {String|RegExp} evt Name of the event to attach the listener to.
 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
 * @return {Object} Current instance of EventEmitter for chaining.
 */

proto.addOnceListener = function addOnceListener(evt, listener) {
  return this.addListener(evt, {
    listener: listener,
    once: true
  });
};
/**
 * Alias of addOnceListener.
 */


proto.once = alias('addOnceListener');
/**
 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
 * You need to tell it what event names should be matched by a regex.
 *
 * @param {String} evt Name of the event to create.
 * @return {Object} Current instance of EventEmitter for chaining.
 */

proto.defineEvent = function defineEvent(evt) {
  this.getListeners(evt);
  return this;
};
/**
 * Uses defineEvent to define multiple events.
 *
 * @param {String[]} evts An array of event names to define.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.defineEvents = function defineEvents(evts) {
  for (var i = 0; i < evts.length; i += 1) {
    this.defineEvent(evts[i]);
  }

  return this;
};
/**
 * Removes a listener function from the specified event.
 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
 *
 * @param {String|RegExp} evt Name of the event to remove the listener from.
 * @param {Function} listener Method to remove from the event.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.removeListener = function removeListener(evt, listener) {
  var listeners = this.getListenersAsObject(evt);
  var index;
  var key;

  for (key in listeners) {
    if (listeners.hasOwnProperty(key)) {
      index = indexOfListener(listeners[key], listener);

      if (index !== -1) {
        listeners[key].splice(index, 1);
      }
    }
  }

  return this;
};
/**
 * Alias of removeListener
 */


proto.off = alias('removeListener');
/**
 * Adds listeners in bulk using the manipulateListeners method.
 * If you pass an object as the first argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
 * You can also pass it a regular expression to add the array of listeners to all events that match it.
 * Yeah, this function does quite a bit. That's probably a bad thing.
 *
 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
 * @param {Function[]} [listeners] An optional array of listener functions to add.
 * @return {Object} Current instance of EventEmitter for chaining.
 */

proto.addListeners = function addListeners(evt, listeners) {
  // Pass through to manipulateListeners
  return this.manipulateListeners(false, evt, listeners);
};
/**
 * Removes listeners in bulk using the manipulateListeners method.
 * If you pass an object as the first argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
 * You can also pass it an event name and an array of listeners to be removed.
 * You can also pass it a regular expression to remove the listeners from all events that match it.
 *
 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
 * @param {Function[]} [listeners] An optional array of listener functions to remove.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.removeListeners = function removeListeners(evt, listeners) {
  // Pass through to manipulateListeners
  return this.manipulateListeners(true, evt, listeners);
};
/**
 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
 * The first argument will determine if the listeners are removed (true) or added (false).
 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
 * You can also pass it an event name and an array of listeners to be added/removed.
 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
 *
 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
  var i;
  var value;
  var single = remove ? this.removeListener : this.addListener;
  var multiple = remove ? this.removeListeners : this.addListeners; // If evt is an object then pass each of its properties to this method

  if (typeof evt === 'object' && !(evt instanceof RegExp)) {
    for (i in evt) {
      if (evt.hasOwnProperty(i) && (value = evt[i])) {
        // Pass the single listener straight through to the singular method
        if (typeof value === 'function') {
          single.call(this, i, value);
        } else {
          // Otherwise pass back to the multiple function
          multiple.call(this, i, value);
        }
      }
    }
  } else {
    // So evt must be a string
    // And listeners must be an array of listeners
    // Loop over it and pass each one to the multiple method
    i = listeners.length;

    while (i--) {
      single.call(this, evt, listeners[i]);
    }
  }

  return this;
};
/**
 * Removes all listeners from a specified event.
 * If you do not specify an event then all listeners will be removed.
 * That means every event will be emptied.
 * You can also pass a regex to remove all events that match it.
 *
 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.removeEvent = function removeEvent(evt) {
  var type = typeof evt;

  var events = this._getEvents();

  var key; // Remove different things depending on the state of evt

  if (type === 'string') {
    // Remove all listeners for the specified event
    delete events[evt];
  } else if (evt instanceof RegExp) {
    // Remove all events matching the regex.
    for (key in events) {
      if (events.hasOwnProperty(key) && evt.test(key)) {
        delete events[key];
      }
    }
  } else {
    // Remove all listeners in all events
    delete this._events;
  }

  return this;
};
/**
 * Alias of removeEvent.
 *
 * Added to mirror the node API.
 */


proto.removeAllListeners = alias('removeEvent');
/**
 * Emits an event of your choice.
 * When emitted, every listener attached to that event will be executed.
 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
 * So they will not arrive within the array on the other side, they will be separate.
 * You can also pass a regular expression to emit to all events that match it.
 *
 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
 * @param {Array} [args] Optional array of arguments to be passed to each listener.
 * @return {Object} Current instance of EventEmitter for chaining.
 */

proto.emitEvent = function emitEvent(evt, args) {
  var listenersMap = this.getListenersAsObject(evt);
  var listeners;
  var listener;
  var i;
  var key;
  var response;

  for (key in listenersMap) {
    if (listenersMap.hasOwnProperty(key)) {
      listeners = listenersMap[key].slice(0);

      for (i = 0; i < listeners.length; i++) {
        // If the listener returns true then it shall be removed from the event
        // The function is executed either with a basic call or an apply if there is an args array
        listener = listeners[i];

        if (listener.once === true) {
          this.removeListener(evt, listener.listener);
        }

        response = listener.listener.apply(this, args || []);

        if (response === this._getOnceReturnValue()) {
          this.removeListener(evt, listener.listener);
        }
      }
    }
  }

  return this;
};
/**
 * Alias of emitEvent
 */


proto.trigger = alias('emitEvent');
/**
 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
 *
 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
 * @param {...*} Optional additional arguments to be passed to each listener.
 * @return {Object} Current instance of EventEmitter for chaining.
 */

proto.emit = function emit(evt) {
  var args = Array.prototype.slice.call(arguments, 1);
  return this.emitEvent(evt, args);
};
/**
 * Sets the current value to check against when executing listeners. If a
 * listeners return value matches the one set here then it will be removed
 * after execution. This value defaults to true.
 *
 * @param {*} value The new value to check for when executing listeners.
 * @return {Object} Current instance of EventEmitter for chaining.
 */


proto.setOnceReturnValue = function setOnceReturnValue(value) {
  this._onceReturnValue = value;
  return this;
};
/**
 * Fetches the current value to check against when executing listeners. If
 * the listeners return value matches this one then it should be removed
 * automatically. It will return true by default.
 *
 * @return {*|Boolean} The current value to check for or the default, true.
 * @api private
 */


proto._getOnceReturnValue = function _getOnceReturnValue() {
  if (this.hasOwnProperty('_onceReturnValue')) {
    return this._onceReturnValue;
  } else {
    return true;
  }
};
/**
 * Fetches the events object and creates one if required.
 *
 * @return {Object} The events storage object.
 * @api private
 */


proto._getEvents = function _getEvents() {
  return this._events || (this._events = {});
};
/**
 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
 *
 * @return {Function} Non conflicting EventEmitter class.
 */


EventEmitter.noConflict = function noConflict() {
  exports.EventEmitter = originalGlobalValue;
  return EventEmitter;
};

const gioEmitter = new EventEmitter();

class Page$1 {
    constructor() {
        this.queries = {};
        this.pvar = {};
    }
    touch(page) {
        this.path = page.route || page.__route__;
        this.time = Date.now();
        if (this.queries[page.route]) {
            this.query = this.queries[page.route];
        }
        else {
            this.query = undefined;
        }
    }
    addQuery(page, query) {
        if (query) {
            this.queries[page.route] = this._getQuery(query);
        }
        else {
            this.queries[page.route] = null;
        }
    }
    _getQuery(query) {
        return Object.keys(query || {})
            .filter((key) => key !== 'wxShoppingListScene')
            .map((key) => {
            return `${key}=${query[key]}`;
        })
            .join('&');
    }
    touchRelatedPvarData(event) {
        const key = `${event.p}?${event.q}`;
        if (this.pvar[key]) {
            this.pvar[key].push(event);
        }
        else {
            this.pvar[key] = [event];
        }
    }
    equalsPage(lastPageEvent) {
        const path = lastPageEvent.p, query = lastPageEvent.q;
        return path == this.path && query == this.query;
    }
}

class Observer extends BaseObserver {
    constructor(growingio) {
        super(growingio);
        this.growingio = growingio;
        this.info = growingio.info;
        this.currentPage = new Page$1();
        this._sessionId = null;
        this.uploadingMessages = [];
        this.isGettingUid = false;
        this.lastSentTime = null;
        this.lastScene = null;
        this.keepAlive = 300000;
        this.scene = undefined;
        this.currentScene = undefined;
        this.esid = this.info.esid === 0 ? 1 : this.info.esid;
        this.uid = this.info.uid;
        this.gioId = this.info.gioId;
        this.path = null;
        this.query = null;
        this.visitEvent = { context: undefined };
        this.isPauseSession = false;
        this.lastPageEvent = null;
        this.cdpObserver = true;
    }
    getGioInfo() {
        const uid = this.info.uid;
        const cs1 = this.getUserId();
        const sid = this.sessionId;
        const projectId = this.growingio.vdsConfig.projectId;
        const dataSourceId = this.growingio.vdsConfig.dataSourceId;
        const appId = this.growingio.vdsConfig.appId;
        const platform = gioGlobal.platformConfig.platform;
        return `giou=${uid}&gios=${sid}&giocs1=${cs1}&gioprojectid=${projectId}&gioappid=${appId}&gioplatform=${platform}&giodatasourceid=${dataSourceId}`;
    }
    pageListener(page, event, args) {
        const listeners = gioGlobal.platformConfig.lisiteners.page;
        if (!page.route) {
            this.info.getPagePath(page);
        }
        if (this.growingio.vdsConfig.debug) {
            console.log('Page.', page.route, '#', event, Date.now());
        }
        if (event === listeners.pageShow) {
            const query = getDataByPath(page, '$page.query');
            if (!Utils.isEmpty(query) && gioGlobal.gio__platform === 'quickApp') {
                this.currentPage.addQuery(page, query);
            }
            if (this.isPauseSession) {
                this.isPauseSession = false;
            }
            else {
                this.currentPage.touch(page);
                setTimeout(() => {
                    this.sendPage(page);
                }, 300);
            }
            onPageShow(this.currentPage);
        }
        else if (event === listeners.pageLoad) {
            const options = args[0];
            if (!Utils.isEmpty(options) && gioGlobal.gio__platform !== 'quickApp') {
                this.currentPage.addQuery(page, options);
            }
        }
        else if (event === listeners.shareApp || event === listeners.shareTime) {
            let options = null;
            let result = null;
            if (args.length >= 2) {
                options = args[0];
                result = args[1];
            }
            else if (args.length === 1) {
                if (args[0].from) {
                    options = args[0];
                }
                else if (args[0].title) {
                    result = args[0];
                }
            }
            this.isPauseSession = true;
            this.sendPageShare(page, options, result, event);
        }
        else if (event === 'onTabItemTap') {
            const item = args[0];
            this.sendTabClick(item);
        }
    }
    actionListener(event, method) {
        if (getDataByPath(event, 'currentTarget.dataset.growingIgnore') ||
            getDataByPath(event, 'target.dataset.growingIgnore')) {
            return;
        }
        const listeners = gioGlobal.platformConfig.lisiteners.actions;
        if (method === '_cmlEventProxy') {
            return;
        }
        if (method === 'handleProxy' && this.growingio.vueRootVMs) {
            if (this.growingio.vueRootVMs[this.currentPage.path]) {
                const vproxy = new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]);
                const handle = vproxy.getHandle(event);
                if (handle) {
                    method = handle;
                }
            }
        }
        if (method === '__e' && this.growingio.vueRootVMs) {
            if (this.growingio.vueRootVMs[this.currentPage.path]) {
                const vproxy = new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]);
                const handle = vproxy.handleEvent(event);
                if (handle) {
                    method = handle;
                }
            }
        }
        if (method === '_proxy' && this.growingio.wepyRootVMs) {
            const evtid = event.currentTarget.dataset.wpyEvt;
            const evttype = event.type;
            if (getDataByPath(this, `growingio.wepyRootVMs.${evtid}.${evttype}`)) {
                method = this.growingio.wepyRootVMs[evtid][evttype];
            }
        }
        if (getDataByPath(this, `growingio.taroRootVMs.${method}`)) {
            method = this.growingio.taroRootVMs[method];
        }
        if (this.growingio.vdsConfig.debug) {
            console.log('Click on ', method, Date.now());
        }
        if (listeners.click.indexOf(event.type) !== -1) {
            this.sendClick(event, method);
        }
        else if (listeners.change.indexOf(event.type) !== -1) {
            this.sendChange(event, method);
        }
        else if (listeners.submit.indexOf(event.type) !== -1) {
            this.sendSubmit(event, method);
        }
        if (event.type === 'getuserinfo') {
            if (getDataByPath(event, 'detail.userInfo')) ;
        }
    }
    get sessionId() {
        if (this._sessionId === null) {
            this._sessionId = Utils.guid();
        }
        return this._sessionId;
    }
    getUserId() {
        return this.info.userId || this.info.gioId;
    }
    // @ts-ignore
    setUserId(userId) {
        if (userId == null)
            return;
        const uid = String(userId);
        const last_sent_cs1 = this.growingio.info.gioId;
        if (uid && uid.length < 100) {
            this.info.userId = uid;
            this.info.gioId = uid;
            gioEmitter.emitEvent('setCs1', [uid]);
            if (last_sent_cs1 && last_sent_cs1 != uid) {
                this.sendVisitEvent(this.growingio.vdsConfig.getLocationType, true);
            }
        }
    }
    clearUserId() {
        this.info.userId = null;
        gioEmitter.emitEvent('clearCs1');
    }
    sendPage(page) {
        const rp = this.lastPageEvent
            ? this.lastPageEvent.context.page.path
            : undefined;
        const context = {
            page: {
                domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                path: this.currentPage.path,
                query: this.currentPage.query,
                title: this.info.getPageTitle(page)
            },
            referrer: {
                page: rp || `scn:${this.currentScene ? this.currentScene : 'NA'}`
            }
        };
        const event = {
            type: 'PAGE',
            sendTime: this.currentPage.time,
            context: Object.assign(Object.assign({}, this.visitEvent.context), context),
            session: this.sessionId,
            version: this.growingio.vdsConfig.sdkVer
        };
        this._sendEvent(event);
        this.lastPageEvent = event;
    }
    /**
     * 设置预设用户信息
     * @deprecated 将在下一个大版本后删除
     * @see setUserAttributes
     */
    setPlatformProfile(userInfo) {
        let prefix = '$basic_';
        switch (platformConfig$1.platform) {
            case 'alip':
                prefix = '$alipay_';
                break;
            case 'MinP':
                prefix = '$wechat_';
                break;
        }
        const uInfo = Object.entries(userInfo).reduce((target, [key, value]) => {
            return Object.assign(Object.assign({}, target), { [prefix + key]: value });
        }, {});
        this.setUserAttributes(uInfo);
    }
    // @ts-ignore
    setUserAttributes(properties) {
        if (validVar(properties)) {
            const event = {
                platform: platformConfig$1.platform,
                session: this.sessionId,
                attributes: stringifyVar(properties),
                context: this.visitEvent.context
            };
            this._sendEvent(event);
        }
    }
    // @ts-ignore
    track(name, properties, item) {
        const nameReg = /^\w+$/;
        if (typeof name !== 'string' ||
            name === null ||
            name === undefined ||
            name.length === 0 ||
            !name.match(nameReg) ||
            parseInt(name[0]) < 10) {
            console.warn('埋点格式不正确, 事件名只能包含数字，字母和下划线，且不以数字开头, 请参考文档');
            return;
        }
        const currentPage = this.info.getCurrentPage();
        const event = {
            type: 'CUSTOM_EVENT',
            eventKey: name,
            context: Object.assign(Object.assign({}, this.visitEvent.context), { page: {
                    domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                    path: this.path || this.info.getPagePath(),
                    query: this.currentPage.query || this.currentPage._getQuery(this.query),
                    title: this.info.getPageTitle(currentPage),
                    time: this.currentPage.time
                }, referrer: {
                    from: `scn:${this.currentScene ? this.currentScene : 'NA'}`
                }, network: {
                    type: undefined
                } }),
            session: this.sessionId
        };
        if (validVar(properties)) {
            event.attributes = properties;
        }
        const itemInfo = getItem(item);
        if (itemInfo) {
            event.item = itemInfo;
        }
        this.info.getNetworkType().then((res) => {
            if (res) {
                event.context.network.type = res.networkType;
            }
            this._sendEvent(event);
        });
    }
    sendCloseEvent() {
        if (this.isPauseSession)
            return;
        const event = Object.assign(Object.assign({}, this.visitEvent), { type: 'VISIT_CLOSED' });
        this._sendEvent(event);
    }
    // 发送分享事件，分享好友|朋友圈
    sendPageShare(page, options, result, name = 'onShareAppMessage') {
        if (!this.growingio.vdsConfig.followShare) {
            return;
        }
        const event = {
            type: 'CUSTOM_EVENT',
            eventKey: name,
            attributes: {
                from: options ? options.from : undefined,
                target: options && options.target ? options.target.id : undefined
            },
            context: Object.assign(Object.assign({}, this.visitEvent.context), { page: {
                    domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                    path: this.currentPage.path,
                    query: this.currentPage.query,
                    time: this.currentPage.time
                } }),
            session: this.sessionId,
            version: this.growingio.vdsConfig.sdkVer
        };
        if (result) {
            event.attributes = Object.assign(Object.assign(Object.assign({}, event.attributes), { title: result.title, path: result.path ? decodeURI(result.path) : undefined }), result.attributes);
        }
        this._sendEvent(event);
    }
    sendTabClick(item) {
        const event = {
            type: 'VIEW_CLICK',
            session: this.sessionId,
            context: Object.assign(Object.assign({}, this.visitEvent.context), { page: {
                    domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                    path: this.currentPage.path,
                    query: this.currentPage.query,
                    time: this.currentPage.time
                } }),
            elements: [
                {
                    x: '#onTabItemTap',
                    v: item.text,
                    idx: item.index,
                    h: typeof item.pagePath === 'string'
                        ? item.pagePath
                        : JSON.stringify(item.pagePath)
                }
            ]
        };
        this._sendEvent(event);
    }
    sendClick(e, method) {
        const event = {
            type: 'VIEW_CLICK',
            session: this.sessionId,
            context: Object.assign(Object.assign({}, this.visitEvent.context), { page: {
                    domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                    path: this.currentPage.path,
                    query: this.currentPage.query,
                    time: this.currentPage.time
                } })
        };
        const target = e.currentTarget || e.target;
        let id = target.id;
        if (!id ||
            (gioGlobal.gio__platform === 'swan' && /^_[0-9a-f]+/.test(id)) ||
            (isTaro3() && /^_n_[0-9]+$/.test(id))) {
            id = '';
        }
        const elem = { x: `${id}#${method}` };
        if (target.dataset.title) {
            elem.v = target.dataset.title;
        }
        if (target.dataset.src) {
            elem.h = target.dataset.src;
        }
        if (typeof target.dataset.index !== 'undefined') {
            if (/^[\d]+$/.test(target.dataset.index)) {
                elem.idx = parseInt(target.dataset.index);
            }
            else {
                elem.idx = -1;
            }
        }
        event.elements = [elem];
        this._sendEvent(event);
    }
    sendSubmit(e, method) {
        const event = {
            type: 'FORM_SUBMIT',
            session: this.sessionId,
            context: Object.assign(Object.assign({}, this.visitEvent.context), { page: {
                    domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                    path: this.currentPage.path,
                    query: this.currentPage.query,
                    time: this.currentPage.time
                } })
        };
        const target = e.currentTarget || e.target;
        let id = target.id;
        if (!id ||
            (gioGlobal.gio__platform === 'swan' && /^_[0-9a-f]+/.test(id)) ||
            (isTaro3() && /^_n_[0-9]+$/.test(id))) {
            id = '';
        }
        const elem = { x: `${id}#${method}` };
        event.elements = [elem];
        this._sendEvent(event);
    }
    sendChange(e, method) {
        const event = {
            type: 'VIEW_CHANGE',
            session: this.sessionId,
            context: Object.assign(Object.assign({}, this.visitEvent.context), { page: {
                    domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                    path: this.currentPage.path,
                    query: this.currentPage.query,
                    time: this.currentPage.time
                } })
        };
        const target = e.currentTarget || e.target;
        let id = target.id;
        if (!id ||
            (gioGlobal.gio__platform === 'swan' && /^_[0-9a-f]+/.test(id)) ||
            (isTaro3() && /^_n_[0-9]+$/.test(id))) {
            id = '';
        }
        const elem = { x: `${id}#${method}` };
        let value = getDataByPath(e, 'detail.value') || getDataByPath(e, 'target.attr.value');
        if (target.dataset &&
            (target.dataset.growingTrack || target.dataset.growingtrack)) {
            if (!(!(typeof value === 'boolean') && (!value || value.length === 0))) {
                // 不采v
                if (Object.prototype.toString.call(value) === '[object Array]') {
                    value = value.join(',');
                    if (value) {
                        elem.v = value;
                    }
                }
                else {
                    elem.v = value;
                }
            }
        }
        if (e.type === 'change' &&
            getDataByPath(e, 'detail.source') === 'autoplay') {
            return;
        }
        event.elements = [elem];
        this._sendEvent(event);
    }
    /**
     * 登录鉴权，设置openId和unionId
     * openId后面会被用来作为u一直使用
     * @param openid
     * @param unionid 不需要
     */
    identify(openid) {
        if (typeof openid === 'undefined' ||
            openid === null ||
            openid.length === 0) {
            return;
        }
        this.growingio.login(openid);
    }
    // @ts-ignore
    sendVisitEvent(getLocationType, force) {
        if (!force) {
            if (this.isPauseSession)
                return;
            const now = Date.now();
            if (now - this.lastSentTime < this.keepAlive &&
                this.lastScene === this.currentScene) {
                return;
            }
            else {
                this._sessionId = null;
            }
        }
        const currentPage = this.info.getCurrentPage();
        const that = this;
        const getSystem = this.info.getSystemInfo();
        const getNetwork = this.info.getNetworkType();
        Promise.all([getSystem, getNetwork]).then(([systemInfo, network]) => {
            const info = systemInfo || {};
            const event = {
                type: 'VISIT',
                version: this.growingio.vdsConfig.sdkVer,
                context: {
                    app: {
                        id: this.growingio.vdsConfig.appId,
                        version: this.growingio.vdsConfig.appVer,
                        channel: `scn:${this.currentScene ? this.currentScene : 'NA'}`
                    },
                    screen: {
                        width: Utils.getScreenWidth(info),
                        height: Utils.getScreenHeight(info)
                    },
                    device: {
                        brand: info.brand,
                        model: info.model,
                        platform: platformConfig$1.platform
                    },
                    operationSystem: {
                        name: Utils.getOS(info.platform),
                        version: platformConfig$1.name + ' ' + info.version
                    },
                    page: {
                        domain: this.growingio.vdsConfig.appId || this.info.getAppId(),
                        path: this.path || this.info.getPagePath(),
                        query: truth(this.currentPage._getQuery(this.query)),
                        title: truth(this.info.getPageTitle(currentPage))
                    },
                    locale: {
                        language: info.language
                    },
                    network: {
                        type: undefined
                    },
                    location: {
                        latitude: undefined,
                        longitude: undefined
                    }
                },
                session: this.sessionId
            };
            that.visitEvent = event;
            if (network) {
                event.context.network.type = network.networkType;
                this._sendEvent(event);
                if (this.growingio.vdsConfig.getLocation.autoGet) {
                    if (!getLocationType ||
                        ['wgs84', 'gcj02', 0, 1, 2].indexOf(getLocationType) === -1) {
                        getLocationType = gioGlobal.gio__platform === 'my' ? 0 : 'wgs84';
                    }
                    this.info.getLocation(getLocationType).then((res) => {
                        if (res) {
                            const secondVisit = JSON.parse(JSON.stringify(event));
                            secondVisit.context.location.latitude = res.latitude;
                            secondVisit.context.location.longitude = res.longitude;
                            this._sendEvent(secondVisit);
                            that.visitEvent = secondVisit;
                        }
                    });
                }
            }
        });
    }
    // @ts-ignore
    _sendEvent(event) {
        // 关闭数据采集时不发送事件
        if (!this.growingio.vdsConfig.dataCollect) {
            return;
        }
        // 关闭无埋点时不发送事件
        const autotrackTypes = ['VIEW_CLICK', 'VIEW_CHANGE', 'FORM_SUBMIT'];
        if (!this.growingio.vdsConfig.autotrack &&
            autotrackTypes.includes(event.type)) {
            return;
        }
        event.version = this.growingio.vdsConfig.sdkVer;
        event.projectKey = this.growingio.vdsConfig.projectId;
        event.dataSourceId = this.growingio.vdsConfig.dataSourceId;
        event.anonymousId = this.info.uid;
        event.timestamp = +Date.now();
        this.lastSentTime = +Date.now();
        this.lastScene = this.currentScene;
        event.esid = this.esid;
        if (this.info.userId) {
            event.userId = this.info.userId;
        }
        if (this.info.gioId) {
            event.gioId = this.info.gioId;
        }
        if (this.uid && this.gioId) {
            this.growingio.upload(event);
        }
        else if (this.isGettingUid) {
            this.uploadingMessages.push(event);
        }
        else {
            this.isGettingUid = true;
            const getUid = this.info.getStorage(this.info.uidKey);
            const getGioId = this.info.getStorage(this.info.gioIdKey);
            Promise.all([getUid, getGioId]).then(([uid, gioId]) => {
                // 优先使用内存中的值，避免人为的清空缓存
                const anonymousId = this.info.uid || uid || Utils.guid();
                if (gioId) {
                    // 避免在回调执行前，执行setUserId更新gioId
                    this.info.gioId = this.info.gioId || gioId;
                    // 闭包。之前数据保持不变
                    event.gioId = event.gioId || gioId;
                }
                this.info.uid = anonymousId;
                event.anonymousId = anonymousId;
                this.isGettingUid = false;
                this.growingio.upload(event);
                while (this.uploadingMessages.length !== 0) {
                    const message = this.uploadingMessages.shift();
                    if (gioId) {
                        message['gioId'] = message['gioId'] || gioId;
                    }
                    message['anonymousId'] = message['anonymousId'] || anonymousId;
                    this.growingio.upload(message);
                }
            });
        }
        this.esid++;
        if (this.growingio.vdsConfig.canHide) {
            this.info.esid = this.esid;
        }
    }
}

// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
const f = String.fromCharCode;
const LZString = {
  compressToUTF16: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function (a) {
      return f(a + 32);
    }) + " ";
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i,
        value,
        context_dictionary = {},
        context_dictionaryToCreate = {},
        context_c = "",
        context_wc = "",
        context_w = "",
        context_enlargeIn = 2,
        // Compensate for the first entry which should not count
    context_dictSize = 3,
        context_numBits = 2,
        context_data = [],
        context_data_val = 0,
        context_data_position = 0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);

      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;

      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1;

              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }

            value = context_w.charCodeAt(0);

            for (i = 0; i < 8; i++) {
              context_data_val = context_data_val << 1 | value & 1;

              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }

              value = value >> 1;
            }
          } else {
            value = 1;

            for (i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1 | value;

              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }

              value = 0;
            }

            value = context_w.charCodeAt(0);

            for (i = 0; i < 16; i++) {
              context_data_val = context_data_val << 1 | value & 1;

              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }

              value = value >> 1;
            }
          }

          context_enlargeIn--;

          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }

          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];

          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;

            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = value >> 1;
          }
        }

        context_enlargeIn--;

        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        } // Add wc to the dictionary.


        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    } // Output the code for w.


    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1;

            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }

          value = context_w.charCodeAt(0);

          for (i = 0; i < 8; i++) {
            context_data_val = context_data_val << 1 | value & 1;

            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = value >> 1;
          }
        } else {
          value = 1;

          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value;

            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = 0;
          }

          value = context_w.charCodeAt(0);

          for (i = 0; i < 16; i++) {
            context_data_val = context_data_val << 1 | value & 1;

            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = value >> 1;
          }
        }

        context_enlargeIn--;

        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }

        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];

        for (i = 0; i < context_numBits; i++) {
          context_data_val = context_data_val << 1 | value & 1;

          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }

          value = value >> 1;
        }
      }

      context_enlargeIn--;

      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    } // Mark the end of the stream


    value = 2;

    for (i = 0; i < context_numBits; i++) {
      context_data_val = context_data_val << 1 | value & 1;

      if (context_data_position == bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }

      value = value >> 1;
    } // Flush the last char


    while (true) {
      context_data_val = context_data_val << 1;

      if (context_data_position == bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      } else context_data_position++;
    }

    return context_data.join('');
  }
};

class Uploader {
    constructor(growingio) {
        this.growingio = growingio;
        this.maxRequests = 3;
        this.requestCount = 0;
        this.timeout = 5000;
        this.messageQueue = [];
        this.uploadingQueue = [];
        this.uploadTimer = null;
        this.projectId = this.growingio.vdsConfig.projectId;
        this.appId = this.growingio.vdsConfig.appId;
        this.host = this.growingio.vdsConfig.host;
        this.compress = this.growingio.vdsConfig.compress;
        this.url = `${this.host}/projects/${this.projectId}/apps/${this.appId}/collect`;
    }
    upload(event) {
        this.messageQueue.push(event);
        const queueLength = this.messageQueue.length;
        if (queueLength > 100) {
            this.messageQueue = this.messageQueue.slice(queueLength - 100);
        }
        if (!this.uploadTimer) {
            this.uploadTimer = setTimeout(() => {
                this._flush();
                this.uploadTimer = null;
            }, 1000);
        }
    }
    forceFlush() {
        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
            this.uploadTimer = null;
        }
        this._flush();
    }
    _flush() {
        if (this.requestCount >= this.maxRequests) {
            return;
        }
        const recursionFlush = () => {
            if (this.messageQueue.length > 0) {
                this._flush();
            }
        };
        this.uploadingQueue = this.messageQueue.slice();
        this.messageQueue = [];
        if (this.uploadingQueue.length > 0) {
            this.requestCount++;
            let data = this.uploadingQueue;
            const header = {
                'content-type': 'application/json'
            };
            if (this.compress) {
                data = LZString.compressToUTF16(JSON.stringify(data));
                header['X-Compress-Codec'] = '1';
            }
            this.growingio.info.request({
                url: `${this.url}?stm=${Date.now()}`,
                method: 'POST',
                header,
                data,
                timeout: this.timeout,
                success: () => {
                    this.requestCount--;
                    recursionFlush();
                },
                fail: ((queue) => {
                    return (res) => {
                        this.requestCount--;
                        // 有的傻逼平台只认为200是success
                        if (res.status === 204) {
                            recursionFlush();
                            return;
                        }
                        // 将发送失败的事件再次缓存，下次重新发送
                        this.messageQueue = queue.concat(this.messageQueue);
                    };
                })(this.uploadingQueue)
            });
        }
    }
}

class CdpUploader extends Uploader {
    constructor(growingio) {
        super(growingio);
        this.growingio = growingio;
        const scheme = this.growingio.vdsConfig.scheme;
        this.url = `${scheme}${this.host}/v3/projects/${this.projectId}/collect`;
    }
}

// @ts-ignore
class Info {
    constructor(growing) {
        this.growing = growing;
        this._uid = undefined;
        this._esid = undefined;
        this._gioId = undefined;
        this._userId = undefined;
        this._systemInfo = null;
        this.uidKey = '_growing_uid_';
        this.esidKey = '_growing_esid_';
        this.gioIdKey = '_growing_gioId_';
        this.userIdKey = '_growing_userId_';
        this.platform = gioGlobal.platformConfig.platform;
        this.sdkVer = gioGlobal.platformConfig.sdkVer;
        this.scnPrefix = gioGlobal.platformConfig.scnPrefix;
        if (gioGlobal.platformConfig.platform !== 'quickapp') {
            this.initUserInfo();
        }
    }
    set esid(esid) {
        this._esid = esid;
        this.setStorage(this.esidKey, this._esid);
    }
    get esid() {
        return this._esid;
    }
    set uid(uid) {
        this._uid = uid;
        this.setStorage(this.uidKey, this._uid);
    }
    get uid() {
        return this._uid;
    }
    set gioId(gioId) {
        this._gioId = gioId;
        this.setStorage(this.gioIdKey, this._gioId);
    }
    get userId() {
        return this._userId;
    }
    set userId(userId) {
        this._userId = userId;
        this.setStorage(this.userIdKey, this._userId);
    }
    get gioId() {
        return this._gioId;
    }
    get systemInfo() {
        return this._systemInfo;
    }
    initUserInfo() {
        this.uid = this.getStorageSync(this.uidKey) || Utils.guid();
        this.esid = Number(this.getStorageSync(this.esidKey));
        this.gioId = this.getStorageSync(this.gioIdKey);
        this._userId = this.getStorageSync(this.userIdKey);
    }
    syncStorage() {
        this.getStorage(this.uidKey).then((res) => {
            if (!res) {
                this.setStorage(this.uidKey, this._uid);
            }
        });
    }
    // 不同平台的差异，各自实现
    getAppId() {
        throw new Error('this a interface function');
    }
    getAppSource() {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    getPageTitle(page) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    getPagePath(page) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    getStorage(key) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    getStorageSync(key) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    setStorage(key, value) {
        throw new Error('this a interface function');
    }
    getSystemInfo() {
        throw new Error('this a interface function');
    }
    getNetworkType() {
        throw new Error('this a interface function');
    }
    getLocation(
    // eslint-disable-next-line
    getLocationType) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    request({ url, header, method, data, timeout, success, fail }) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    collectImp(collectPage, selector = null) {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    initShareAppMessage(growingio) {
        throw new Error('this a interface function');
    }
    getCurrentPage() {
        throw new Error('this a interface function');
    }
    getQuery() {
        throw new Error('this a interface function');
    }
    getReferrer() {
        throw new Error('this a interface function');
    }
    getInitPath() {
        throw new Error('this a interface function');
    }
    // eslint-disable-next-line
    onAppShow(cb) {
        throw new Error('this is a interdace function');
    }
    // eslint-disable-next-line
    onAppHide(cb) {
        throw new Error('this is a interface function');
    }
    timeoutAbort(task, timeout) {
        if (task && task.abort) {
            setTimeout(() => {
                task.abort();
            }, (timeout || 10000) + 10);
        }
    }
    navigateToMiniProgram() {
        // opt: NavigateToMiniProgramOption
        throw new Error('this is a interface function');
    }
}

class Weixin extends Info {
    constructor(growingio) {
        super(growingio);
        this.growingio = growingio;
    }
    getAppId() {
        if (!this._systemInfo) {
            this._systemInfo = wx.getSystemInfoSync();
        }
        const WxSDKVersion = this._systemInfo.SDKVersion;
        let appId = undefined;
        if (Utils.compareVersion(WxSDKVersion, '2.2.2') >= 0) {
            appId = wx.getAccountInfoSync().miniProgram.appId;
        }
        return appId;
    }
    getPagePath() {
        const page = this.getCurrentPage();
        return page && page.route;
    }
    getCurrentPage() {
        const pageStack = getCurrentPages();
        return pageStack[pageStack.length - 1];
    }
    getPageTitle(page) {
        let title = '';
        try {
            if (page.data.title && page.data.title.length > 0) {
                if (Array.isArray(page.data.title)) {
                    title = page.data.title.join(' ');
                }
                else {
                    title = page.data.title;
                }
            }
            if (title.length === 0) {
                if (__wxConfig) {
                    if (__wxConfig.tabBar) {
                        const tabPage = __wxConfig.tabBar.list.find((p) => {
                            return (p.pathPath == page.route || p.pagePath == `${page.route}.html`);
                        });
                        if (tabPage && tabPage.text) {
                            title = tabPage.text;
                        }
                    }
                    if (title.length == 0) {
                        const pageInfo = __wxConfig.page[page.route] ||
                            __wxConfig.page[`${page.route}.html`];
                        if (pageInfo) {
                            title = pageInfo.window.navigationBarTitleText;
                        }
                        else {
                            title = __wxConfig.global.window.navigationBarTitleText;
                        }
                    }
                }
            }
        }
        catch (e) {
            return '';
        }
        return title;
    }
    getStorage(key) {
        return new Promise((resolve) => {
            wx.getStorage({
                key,
                success: (res) => resolve(res.data),
                fail: () => resolve('')
            });
        });
    }
    getStorageSync(key) {
        return wx.getStorageSync(key);
    }
    setStorage(key, value) {
        wx.setStorage({ key, data: value });
    }
    getSystemInfo() {
        return new Promise((resolve) => {
            wx.getSystemInfo({
                success: (res) => {
                    this._systemInfo = res;
                    resolve(res);
                },
                fail: () => resolve(null)
            });
        });
    }
    getNetworkType() {
        return new Promise((resolve) => {
            wx.getNetworkType({
                success: (res) => resolve(res),
                fail: () => resolve(null)
            });
        });
    }
    getSetting() {
        return new Promise((resolve) => {
            wx.getSetting({ success: resolve, fail: resolve });
        });
    }
    getLocation(getLocationType) {
        return new Promise((resolve) => {
            wx.getLocation({
                type: getLocationType,
                success: (res) => resolve(res),
                fail: () => resolve(null)
            });
        });
    }
    request({ url, header, method, data, timeout, success, fail, complete }) {
        const task = wx.request({
            url,
            header,
            method,
            data,
            timeout,
            success,
            fail,
            complete
        });
        super.timeoutAbort(task, timeout);
        return task;
    }
    getImageInfo(opt) {
        return wx.getImageInfo(opt);
    }
    collectImp(collectPage, selector = null) {
        let _relative = null;
        if (this.growingio.vdsConfig.vue) {
            collectPage = collectPage.$mp.page;
        }
        if (this.growingio.vdsConfig.taro) {
            collectPage = collectPage.$scope;
        }
        const sendedData = {};
        if (this.growingio._observer)
            this.growingio._observer.disconnect();
        if (collectPage.isComponent) {
            this.growingio._observer = collectPage.createIntersectionObserver({
                observeAll: true
            });
        }
        else {
            this.growingio._observer = wx.createIntersectionObserver(collectPage, {
                observeAll: true
            });
        }
        if (selector) {
            _relative = this.growingio._observer.relativeTo(selector);
        }
        else {
            _relative = this.growingio._observer.relativeToViewport();
        }
        _relative.observe('.growing_collect_imp', (res) => {
            if (!res.id || sendedData[res.id])
                return;
            const dataset = getManualImpInfo(res.dataset);
            const { eventId, properties } = dataset;
            if (eventId && res.id && !sendedData[res.id]) {
                this.growingio.observer.track(eventId, properties);
                sendedData[res.id] = true;
            }
        });
    }
    setStorageSync(key, value) {
        wx.setStorageSync(key, JSON.stringify(value));
    }
    removeStorageSync(key) {
        wx.removeStorageSync(key);
    }
    navigateTo(opt) {
        wx.navigateTo(opt);
    }
    switchTab(opt) {
        wx.switchTab(opt);
    }
    onAppShow(cb) {
        wx.onAppShow(cb);
    }
    onAppHide(cb) {
        wx.onAppHide(cb);
    }
    navigateToMiniProgram(opt) {
        wx.navigateToMiniProgram(opt);
    }
}

class Config$1 {
    constructor(growingio) {
        this.growingio = growingio;
    }
    setDataCollect(collect) {
        if (typeof collect === 'boolean') {
            this.growingio.vdsConfig.dataCollect = collect;
            console.log(`GrowingIO：已${collect ? '开启' : '关闭'}数据采集`);
        }
        else {
            console.log('GrowingIO：开启/关闭数据采集失败，请检查参数');
        }
    }
    enableDebug(debug) {
        if (debug && console) {
            this.growingio.vdsConfig.debug = debug;
        }
    }
    setTrackerScheme(scheme) {
        const schemeLow = String(scheme).toLocaleLowerCase();
        if (schemeLow === 'http' || schemeLow === 'https') {
            this.growingio.vdsConfig.scheme = `${scheme}://`;
        }
    }
    setTrackerHost(host) {
        if (isString(host))
            this.growingio.vdsConfig.host = host;
    }
    setAutotrack(track) {
        if (typeof track === 'boolean') {
            this.growingio.vdsConfig.autotrack = track;
            console.log(`GrowingIO：已${track ? '开启' : '关闭'}无埋点事件`);
        }
        else {
            console.log('GrowingIO：开启/关闭无埋点事件失败，请检查参数');
        }
    }
}

/**
 * 创建hook的方法
 * @param pageInstance 当前方法所在的页面实例
 * @param method  要被拦截的方法
 * @param methodName 要拦截的方法名
 * @private
 */
const _wrapHook = (pageInstance, method, methodName = '') => {
    if (method.__gio__)
        return method;
    const wrap = VdsInstrumentAgent.hook(methodName || method.name, method, pageInstance);
    wrap.__gio__ = true;
    if (typeof method._stop === 'boolean') {
        wrap._stop = method._stop;
    }
    return wrap;
};
/**
 * 代理taro3的dispatch方法
 * @param dispatch 真实的dispatchEvent方法
 */
const proxyDispatchEvent = (dispatch) => {
    return function () {
        const node = this;
        const event = arguments[0];
        const pageInstance = getDataByPath(node, '_root.ctx') || {
            _growing_page_: true
        };
        const listeners = node.__handlers[event.type];
        // 事件触发执行前重定义用户方法
        if (Array.isArray(listeners)) {
            listeners.forEach((listener, idx) => {
                listeners[idx] = _wrapHook(pageInstance, listeners[idx]);
            });
        }
        return dispatch.apply(this, arguments);
    };
};
/**
 * 代理vue的方法
 * @param vm  当前vue实例
 * @param name 代理的方法名
 * @param method 代理的方法
 * @param context growing实例
 */
const proxyVueMethod = (vm, name, method, context) => {
    if (typeof method !== 'function')
        return method;
    return function () {
        let pageInstance = getDataByPath(vm, '$el._root.ctx');
        if (!pageInstance) {
            pageInstance = context.info.getCurrentPage() || {};
        }
        return _wrapHook(pageInstance, method, name).apply(this, arguments);
    };
};
function proxyTaro3(taro, context) {
    if (taro.vue) {
        // 使用vue框架
        taro.vue.mixin({
            created() {
                const methods = this.$options.methods;
                if (!methods)
                    return;
                const vm = this;
                // 代理vue实例上的所有方法，key即为方法名
                Object.keys(methods).forEach((key) => {
                    Object.defineProperty(vm, key, {
                        value: proxyVueMethod(vm, key, vm[key], context),
                        configurable: true,
                        writable: true
                    });
                });
            }
        });
    }
    else {
        // 使用react框架
        const TaroNode = document.__proto__.__proto__;
        const dispatchEvent = TaroNode.dispatchEvent;
        Object.defineProperty(TaroNode, 'dispatchEvent', {
            value: proxyDispatchEvent(dispatchEvent),
            enumerable: false,
            configurable: true
        });
    }
}

const proxyVue = (vue, context) => {
    if (typeof vue.mixin !== 'undefined') {
        vue.mixin({
            created: function () {
                if (!this.$options.methods) {
                    return;
                }
                const methods = Object.keys(this.$options.methods);
                for (const key of Object.keys(this)) {
                    if (methods.indexOf(key) >= 0 && typeof this[key] === 'function') {
                        Object.defineProperty(this[key], 'proxiedName', {
                            value: key
                        });
                        Object.defineProperty(this[key], 'isProxied', { value: true });
                    }
                }
            },
            beforeMount: function () {
                const rootVueVM = this.$root;
                if (rootVueVM.$mp && rootVueVM.$mp.mpType === 'page') {
                    if (rootVueVM.$mp.page) {
                        context.vueRootVMs[rootVueVM.$mp.page.route] = rootVueVM;
                    }
                }
                else if (rootVueVM.mpType === 'page' && this.mpType === 'page') {
                    // uniapp升级后重构了。。。需要hookpage
                    if (rootVueVM.$mp.page) {
                        context.vueRootVMs[rootVueVM.$mp.page.route || rootVueVM.$mp.page.is] = rootVueVM;
                        if (['wx', 'qq', 'tt'].indexOf(gioGlobal.gio__platform) !== -1) {
                            // 这框架也是醉了，只有wx需要hook 另外baidu不支持 method目前
                            VdsInstrumentAgent.instrumentPageComponent(rootVueVM.$mp.page);
                        }
                    }
                }
            }
        });
    }
    console.log('prox', context.vueRootVMs);
};
const proxyTaro = (taro, context, vdsConfig) => {
    // 针对Taro3实现无埋点
    if (isTaro3()) {
        return proxyTaro3(taro, context);
    }
    const originCreateComponent = taro.createComponent;
    const usePlugin = vdsConfig.usePlugin;
    originCreateComponent &&
        (taro.createComponent = function (ComponentClass, isPage) {
            let tempComponentClass = ComponentClass;
            while (tempComponentClass && tempComponentClass.prototype) {
                const keys = Object.keys(Object.getOwnPropertyDescriptors(tempComponentClass.prototype) || {});
                for (let i = 0; i < keys.length; i++) {
                    if (keys[i].startsWith('func__')) {
                        const componentName = tempComponentClass.name;
                        const methodHash = keys[i].slice(6);
                        const name = ComponentClass.prototype[keys[i]]
                            .toString()
                            .match(/this\.__triggerPropsFn\("(.+)",/)[1];
                        context.taroRootVMs[keys[i]] =
                            componentName + '_' + name + '_' + methodHash;
                    }
                }
                tempComponentClass = Object.getPrototypeOf(tempComponentClass);
            }
            const weappComponentConf = originCreateComponent(ComponentClass, isPage);
            const isMinpOrQq = ['MinP', 'qq'].indexOf(platformConfig$1.platform) !== -1;
            const methods = isMinpOrQq
                ? weappComponentConf && weappComponentConf.methods
                : weappComponentConf;
            if (usePlugin) {
                //VdsInstrumentAgent.instrument(methods);
                if (isPage) {
                    VdsInstrumentAgent.instrumentPageComponent(methods);
                }
            }
            else if (isPage && isMinpOrQq) {
                VdsInstrumentAgent.instrumentPageComponent(methods);
            }
            return weappComponentConf;
        });
    if (usePlugin && taro.createApp) {
        const originCreateApp = taro.createApp;
        taro.createApp = function (AppClass) {
            const weappAppConf = originCreateApp(AppClass);
            weappAppConf._growing_app_ = true;
            VdsInstrumentAgent.instrument(weappAppConf);
            return weappAppConf;
        };
    }
};
// eslint-disable-next-line
const proxyCml = (cml, context) => {
    const OriginCreateApp = cml.createApp;
    const OriginCreateComponent = cml.createComponent;
    cml.createApp = function (options) {
        options._growing_app_ = true;
        return OriginCreateApp(VdsInstrumentAgent.instrument(options));
    };
    cml.createComponent = function (options) {
        if (options.data && options.data.isComponent) {
            return OriginCreateComponent(Object.assign(Object.assign({}, options), { methods: VdsInstrumentAgent.instrument(options.methods) }));
        }
        return OriginCreateComponent(options);
    };
};
const proxyWepy = (wepy, context, vdsConfig) => {
    const OriginPage = wepy.page;
    const getRealName = function (handlers) {
        const keys = Object.keys(handlers);
        for (let i = 0; i < keys.length; i++) {
            const eventTypes = Object.keys(handlers[keys[i]]);
            for (let j = 0; j < eventTypes.length; j++) {
                if (typeof handlers[keys[i]][eventTypes[j]] === 'function') {
                    const nameMatched = handlers[keys[i]][eventTypes[j]]
                        .toString()
                        .match(/_vm\.(.+)\(.*\)/);
                    if (nameMatched && nameMatched[1]) {
                        if (!context.wepyRootVMs[keys[i]]) {
                            context.wepyRootVMs[keys[i]] = {};
                        }
                        context.wepyRootVMs[keys[i]][eventTypes[j]] = nameMatched[1];
                    }
                    if (vdsConfig.usePlugin) {
                        handlers[keys[i]][eventTypes[j]] = VdsInstrumentAgent.hook('_proxy', handlers[keys[i]][eventTypes[j]]);
                    }
                }
            }
        }
    };
    wepy.page = function (page, rel) {
        if (rel.handlers) {
            getRealName(rel.handlers);
        }
        VdsInstrumentAgent.instrumentPageComponent(page);
        return OriginPage(page, rel);
    };
    const OriginComponent = wepy.component;
    wepy.component = function (component, rel) {
        if (rel.handlers) {
            getRealName(rel.handlers);
        }
        return OriginComponent(component, rel);
    };
    if (vdsConfig.usePlugin) {
        const OriginApp = wepy.app;
        wepy.app = function (app, rel) {
            app._growing_app_ = true;
            return OriginApp(VdsInstrumentAgent.instrument(app), rel);
        };
    }
};

const getNewType = (type) => {
    if (!type) {
        return 'LOGIN_USER_ATTRIBUTES';
    }
    if (type == 'CUSTOM_EVENT') {
        return 'CUSTOM';
    }
    if (type == 'VISIT_CLOSED') {
        return 'APP_CLOSED';
    }
    return type;
};
const buildContext = (event, type) => {
    const context = event.context;
    let newContext = {
        deviceId: event.anonymousId,
        userId: event.userId,
        gioId: event.gioId,
        sessionId: event.session,
        dataSourceId: event.dataSourceId,
        eventType: type,
        globalSequenceId: event.esid,
        timestamp: event.timestamp
    };
    if (context && context.page) {
        newContext = Object.assign(Object.assign({}, newContext), { domain: context.page.domain, path: context.page.path, query: context.page.query, title: context.page.title });
    }
    if (context && context.operationSystem) {
        newContext = Object.assign(Object.assign({}, newContext), { platform: context.device.platform, platformVersion: context.operationSystem.version });
    }
    const addContext = buildAddContext(event);
    return Object.assign(Object.assign({}, newContext), addContext);
};
const buildAddContext = (event) => {
    const context = event.context;
    return {
        networkState: context.network.type,
        appChannel: context.app.channel,
        appVersion: context.app.version,
        screenWidth: context.screen.width,
        screenHeight: context.screen.height,
        deviceBrand: context.device.brand,
        deviceModel: context.device.model,
        deviceType: context.operationSystem.name,
        language: context.locale.language,
        latitude: context.location.latitude,
        longitude: context.location.longitude,
        sdkVersion: event.version
    };
};
const verifyContext = (event) => {
    const context = event.context;
    return context && context.network && context.app && context.screen;
};
const buildPage = (event) => {
    const context = event.context;
    return {
        sdkVersion: event.version,
        appVersion: context.app.version,
        timestamp: event.sendTime,
        referralPage: context.referrer ? context.referrer.page : undefined
    };
};
const buildCustom = (event) => {
    const context = event.context;
    return {
        eventName: event.eventKey,
        pageShowTimestamp: context.page.time,
        attributes: event.attributes,
        resourceItem: event.item
    };
};
const buildAppClose = (event) => {
    const context = event.context;
    return {
        networkState: context.network.type
    };
};
const buildLocalUser = (event) => {
    let attributes = event.attributes || {};
    const profile = event.profile;
    if (profile) {
        attributes = Object.values(profile).reduce((target, cur) => Object.assign(target, cur), attributes);
    }
    return { attributes };
};
const buildAction = (context, event, eventSequenceId) => {
    const pageShowTimestamp = event.context.page.time;
    return event.elements.map((elem) => {
        return Object.assign(Object.assign({}, context), { pageShowTimestamp, textValue: elem.v, xpath: elem.x, index: elem.idx, hyperlink: elem.h, eventSequenceId });
    });
};
const buildNewIdMap = ((idMap) => {
    return (type) => {
        if (idMap) {
            const eventSequenceId = idMap[type] ? +idMap[type] + 1 : 1;
            return Object.assign(idMap, { [type]: eventSequenceId });
        }
        return (idMap = { [type]: 1 });
    };
})();
const eventCache = [];
const toEvent3WithCache = (info, currentEvent) => {
    const context = currentEvent.context;
    const cacheEvent3s = eventCache.reduce((target, event) => {
        event.context = Object.assign(Object.assign({}, context), event.context);
        return target.concat(toEvent3(info, event));
    }, []);
    // 清空缓存
    eventCache.splice(0, eventCache.length);
    return [...cacheEvent3s, ...toEvent3(info, currentEvent)];
};
const toEvent3 = (info, event) => {
    const type = getNewType(event.type);
    const context = buildContext(event, type);
    const idMap = buildNewIdMap(type);
    switch (type) {
        case 'VISIT':
            return [Object.assign(Object.assign({}, context), { eventSequenceId: idMap[type] })];
        case 'PAGE':
            return [
                Object.assign(Object.assign(Object.assign({}, context), buildPage(event)), { eventSequenceId: idMap[type] })
            ];
        case 'CUSTOM':
            return [
                Object.assign(Object.assign(Object.assign({}, context), buildCustom(event)), { eventSequenceId: idMap[type] })
            ];
        case 'APP_CLOSED':
            return [
                Object.assign(Object.assign(Object.assign({}, context), buildAppClose(event)), { eventSequenceId: idMap[type] })
            ];
        case 'LOGIN_USER_ATTRIBUTES':
            return [
                Object.assign(Object.assign(Object.assign({}, context), buildLocalUser(event)), { eventSequenceId: idMap[type] })
            ];
        case 'VIEW_CLICK':
        case 'FORM_SUBMIT':
        case 'VIEW_CHANGE':
            return buildAction(context, event, idMap[type]);
    }
};
// V3版本后，埋点事件不和page事件关联，这样情况下pageShowTimestamp就可能是没有的！！
const cdpEventV2ToV3 = (info, event) => {
    if (!verifyContext(event)) {
        eventCache.push(event);
        return [];
    }
    else {
        return toEvent3WithCache(info, event);
    }
};

const sdkVer = '3.2.4';
class growingio {
    constructor() {
        this.config = new Config$1(this);
        this.uploadingMessages = [];
        this.launcher = [];
    }
    init(projectId, dataSourceId, appId, options) {
        if (this.start) {
            return;
        }
        if (appId && typeof appId !== 'string') {
            options = appId;
            appId = undefined;
        }
        if (!appId && !options) {
            appId = undefined;
            options = {};
        }
        if (!options.host || !dataSourceId || !projectId) {
            console.error('GrowingIO SDK初始化失败，请检查你的dataSourceId, projectId 和 host 是否配置正确');
            return;
        }
        if (platformConfig$1.platform === 'alip' &&
            (options.vue || options.taro || options.cml || options.wepy)) {
            platformConfig$1.canHook = true;
        }
        if (options.usePlugin) {
            platformConfig$1.canHook = false;
        }
        this.vdsConfig = {
            projectId,
            dataSourceId,
            appId,
            appVer: options.version || '',
            sdkVer,
            dataCollect: options.dataCollect === false ? options.dataCollect : true,
            host: options.host,
            gtouchHost: options.gtouchHost,
            scheme: options.scheme || 'https://',
            getLocation: options.getLocation || false,
            debug: options.debug,
            usePlugin: options.usePlugin || false,
            vue: options.vue || false,
            taro: options.taro || false,
            cml: options.cml || false,
            wepy: options.wepy || false,
            getInfoHook: defineInfoHook(options.getInfoHook),
            followShare: typeof options.followShare === 'undefined'
                ? false
                : options.followShare,
            forceLogin: options.forceLogin || false,
            comAsPage: options.comAsPage || false,
            compress: options.compress || false,
            autotrack: options.autotrack === false ? options.autotrack : true,
            ignoreFields: getValidIgnoreFields(options.ignoreFields)
        };
        gioGlobal.vdsConfig = this.vdsConfig;
        gioGlobal.platformConfig = platformConfig$1;
        this.setTrackerHost(options.host);
        this.setTrackerScheme(options.scheme);
        this.info = new Weixin(this);
        this.observer = new Observer(this);
        this.uploader = new CdpUploader(this);
        if (!appId) {
            this.vdsConfig.appId = this.info.getAppId();
        }
        this._start();
        if (this.vdsConfig.ignoreFields) {
            console &&
                console.log('%cGrowingIO 忽略以下字段上报: [' +
                    this.vdsConfig.ignoreFields.join(', ') +
                    ']。', 'color: #C2950D');
        }
    }
    setConfig(option) {
        const projectId = option.projectId;
        const dataSourceId = option.dataSourceId;
        const appId = option.appId;
        this.init(projectId, dataSourceId, appId, option);
    }
    send() {
        this.start = true;
        if (this.vdsConfig.dataCollect && this.vdsConfig.host) {
            this.appListener();
        }
    }
    setTrackerScheme(scheme) {
        this.config.setTrackerScheme(scheme);
    }
    setTrackerHost(host) {
        this.config.setTrackerHost(host);
    }
    enableDebug(debug) {
        this.config.enableDebug(debug);
    }
    setDataCollect(collect) {
        this.config.setDataCollect(collect);
    }
    setAutotrack(track) {
        this.config.setAutotrack(track);
    }
    appListener() {
        this.observer.sendVisitEvent();
        if (this.launcher.length > 0) {
            this.launcher.map((lch) => {
                this.observer[lch[0]].apply(this.observer, lch[1]);
            });
        }
    }
    proxy(name, args) {
        try {
            if (name == 'login') {
                return;
            }
            if (this[name]) {
                this[name].apply(this, args);
            }
            else if (this.observer && this.observer[name]) {
                if (this.start ||
                    ['setUserId', 'clearUserId', 'getGioInfo'].includes(name)) {
                    return this.observer[name].apply(this.observer, args);
                }
                else {
                    this.launcher.push([name, args]);
                }
            }
        }
        catch (e) {
            console && console.error(e);
        }
    }
    /**
     * 使用openId登录，来作为之后的 anonymousId (u)
     */
    login(openId) {
        if (this.vdsConfig.forceLogin) {
            this.info.uid = openId;
            this.vdsConfig.forceLogin = false;
            for (const message of this.uploadingMessages) {
                message.anonymousId = openId;
                this.upload(message);
            }
        }
        else {
            console.error('GrowingIO: 无效操作！forceLogin为false。');
        }
    }
    upload(event) {
        if (!this.vdsConfig.forceLogin) {
            const ignoreFields = this.vdsConfig.ignoreFields;
            gioEmitter.emitEvent('upload', [event]);
            cdpEventV2ToV3(this.info, event).forEach((v3Event) => {
                if (ignoreFields) {
                    v3Event = omit(v3Event, ...ignoreFields);
                }
                if (this.vdsConfig.debug) {
                    console.info('generate new event', JSON.stringify(v3Event, 0, 2));
                }
                this.uploader.upload(v3Event);
            });
        }
        else {
            console.warn('GrowingIO: [ForceLogin] is set to true, but openID is null, data collection has been suspended! Call the [identify] function to report openID to resume data collection.');
            this.uploadingMessages.push(event);
        }
    }
    _start() {
        if (this.info.onAppShow) {
            this.info.onAppShow((option) => {
                this._getOption(option);
                this.send();
            });
        }
        else {
            this.send();
        }
        if (this.info.onAppHide) {
            this.info.onAppHide(() => {
                this.info.esid = this.observer.esid;
                this.observer.lastSentTime = +Date.now();
                this.observer.sendCloseEvent();
            });
        }
        else {
            this.vdsConfig.canHide = true;
        }
        this._hookPage();
    }
    _getOption(option) {
        this.observer.currentScene = option.scene;
        this.observer.path = option.path;
        this.observer.query = option.query;
    }
    _hookPage() {
        if (this.vdsConfig.taro) {
            this.taroRootVMs = {};
            proxyTaro(this.vdsConfig.taro, this, this.vdsConfig);
        }
        else if (this.vdsConfig.wepy) {
            this.wepyRootVMs = {};
            proxyWepy(this.vdsConfig.wepy, this, this.vdsConfig);
        }
        else if (this.vdsConfig.cml) {
            gioGlobal.platformConfig.hooks.Component = false;
            proxyCml(this.vdsConfig.cml);
        }
        else if (this.vdsConfig.vue) {
            this.vueRootVMs = {};
            proxyVue(this.vdsConfig.vue, this);
        }
        VdsInstrumentAgent.initInstrument(this.observer);
        try {
            if (gioGlobal && platformConfig$1.canHook) {
                if (platformConfig$1.hooks.Page) {
                    gioGlobal.Page = Page;
                }
            }
        }
        catch (e) {
            //
        }
    }
}

function isEqual(prev, next) {
  if (typeof prev !== typeof next) return false;
  if (typeof prev === 'string' || typeof prev === 'number' || typeof prev === 'boolean' || typeof prev === 'function' || prev == void 0 || next == void 0) return Object.is(prev, next);

  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) return false;
    return prev.every((item, index) => isEqual(item, next[index]));
  }

  if (Object.prototype.toString.call(prev) === '[object Object]' && Object.prototype.toString.call(next) === '[object Object]') {
    const prevKeys = Object.keys(prev);
    const nextkeys = Object.keys(next);
    if (prevKeys.every(key => next.hasOwnProperty(key) && isEqual(prev[key], next[key])) && nextkeys.every(key => prev.hasOwnProperty(key) && isEqual(next[key], prev[key]))) return true;
    return false;
  }

  return false;
}

const getParameterByName = (name, url) => {
    if (typeof url !== 'string') {
        return;
    }
    url[0] !== '?' && (url = '?' + url);
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

class BaseUserStorage {
    constructor(growingio) {
        this.growingio = growingio;
        this.namespace = 'push-user-status';
        this.userTagDuration = 50 * 24 * 3600 * 1000;
        this.eventTagDuration = 24 * 3600 * 1000;
        this.handleCs1 = this.handleCs1.bind(this);
        this.handleClearCs1 = this.handleClearCs1.bind(this);
    }
    handleCs1(cs1) {
        const storeCs1 = this.get('cs1');
        if (cs1 !== storeCs1) {
            this.set('cs1', cs1);
            this.set('bcs', void 0);
            gioEmitter.emit('cs1Refresh');
        }
    }
    handleClearCs1() {
        this.set('cs1', void 0);
        this.set('bcs', void 0);
    }
    setIsPreview(event) {
        if (!event.q) {
            return;
        }
        const scene = getParameterByName('scene', event.q);
        if (!scene) {
            return;
        }
        const messageId = getParameterByName('gioMessageId', scene);
        if (!messageId) {
            return;
        }
        // 因小程序url长度限制，做一下map
        const msgTypeMap = {
            s: 'splash',
            pw: 'popupWindow',
            p: 'push',
            b: 'banner',
            ab: 'abTest'
        };
        const msgType = msgTypeMap[getParameterByName('mt', scene)] || '';
        gioGlobal.__growing__.marketingPreview = {
            messageId,
            msgType
        };
    }
    storeFilters(event, generateKeyFunc, formatFunc) {
        const key = generateKeyFunc();
        const oldVars = (this.get(key, this.eventTagDuration) ||
            []);
        const vars = formatFunc.call(this, event);
        const finalVars = [...oldVars, ...vars];
        this.set(key, finalVars);
    }
    generateEventKey(key) {
        const userTag = this.get('cs1') || '';
        return `${key}#${userTag}`;
    }
    _get(key) {
        return this.growingio.info.getStorageSync(`${this.namespace}#${key}`);
    }
    getUserAttrs() {
        const key = this.generateEventKey('userAttrs');
        return (this.get(key) || []);
    }
    getTriggerAttrs() {
        const key = this.generateEventKey('triggerAttrs');
        return (this.get(key) || []);
    }
    set(key, value) {
        const oldV = this._get(key);
        const now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        const newV = {
            startAt: now.getTime(),
            value
        };
        if (oldV && isEqual(newV.value, JSON.parse(oldV).value)) {
            return;
        }
        this.growingio.info.setStorageSync(`${this.namespace}#${key}`, newV);
    }
    get(key, duration = this.userTagDuration) {
        const v = this._get(key);
        if (!v) {
            return;
        }
        const _v = JSON.parse(v);
        // 超时返回undefined
        if (Date.now() <= _v.startAt + duration) {
            return _v.value;
        }
        return;
    }
    getCs1() {
        return this.get('cs1');
    }
}

class UserStorage extends BaseUserStorage {
    constructor(growingio) {
        super(growingio);
        this.growingio = growingio;
        this.handleEvent = this.handleEvent.bind(this);
        this.addEventListener();
    }
    addEventListener() {
        gioEmitter.on('appOpen', this.handleEvent);
        gioEmitter.on('upload', this.handleEvent);
        gioEmitter.on('setCs1', this.handleCs1);
        gioEmitter.on('clearCs1', this.handleClearCs1);
    }
    handleEvent(event) {
        if (!event)
            return;
        const type = event.type || 'USER_EVENT';
        switch (type) {
            case 'VISIT':
                this.storeFilters(event, this.generateEventKey.bind(this, 'userAttrs'), this.formatUserFilterVars);
                break;
            case 'CUSTOM_EVENT':
                this.storeFilters(event, this.generateEventKey.bind(this, 'triggerAttrs'), this.formatEventFilterVars);
            // eslint-disable-next-line
            case 'PAGE':
                this.setIsPreview(event);
                break;
            case 'USER_EVENT':
                this.storeFilters(event, this.generateEventKey.bind(this, 'userAttrs'), this.formatUserFilterVars);
                break;
        }
    }
    formatUserFilterVars(event) {
        const vars = event.attributes;
        if (!vars)
            return [];
        return Object.keys(vars).map((key) => ({
            key,
            value: vars[key]
        }));
    }
    formatEventFilterVars(event) {
        const vars = event.attributes;
        return [
            {
                key: event.eventKey,
                value: '',
                event_variable: vars
                    ? Object.keys(vars).map((key) => ({
                        key,
                        value: vars[key]
                    }))
                    : []
            }
        ];
    }
}

try {
    // 判断build平台，并实现平台差异变量gioGlobal
    const gio_platform = 'wx';
    initGlobal(gio_platform);
    if (gio_platform !== 'frame') {
        gioGlobal.gio__platform = gio_platform;
    }
}
catch (e) {
    //
}
const growingio$1 = new growingio();
const gio = function () {
    const name = arguments[0];
    if (!name) {
        return;
    }
    const args = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
    if (name === 'init') {
        if (gioGlobal.vdsConfig) {
            console.warn('SDK已经初始化成功，请检查是否加载过其他平台sdk');
            return;
        }
        if (args.length < 1) {
            console.log('初始化 GrowingIO SDK 失败。请使用 gio("init", "你的GrowingIO项目ID", "你的应用APP_ID", options);');
            return;
        }
        const projectId = args[0];
        const dataSourceId = args[1];
        const appId = args[2];
        const options = args[3];
        if (options && options.autotrack === false) {
            console.log('GrowingIO：已关闭无埋点事件');
        }
        growingio$1.init(projectId, dataSourceId, appId, options);
    }
    else if (name === 'setConfig') {
        if (!args[0]) {
            console.log('初始化 GrowingIO SDK 失败。请检查你的config文件是否引入正确');
            return;
        }
        if (!args[0].projectId) {
            console.log('初始化 GrowingIO SDK 失败。请检查你的 GrowingIO项目ID, 你的应用APP_ID 是否填写正确');
            return;
        }
        growingio$1.setConfig(args[0]);
    }
    else {
        return growingio$1.proxy(name, args);
    }
};
console.log('init growingio...');
const GioPage = VdsInstrumentAgent.GrowingPage;
const GioComponent = VdsInstrumentAgent.GrowingComponent;
const GioBehavior = VdsInstrumentAgent.GrowingBehavior;
const gioEmitter$1 = gioEmitter;
const userStorage = new UserStorage(growingio$1);
gioGlobal.__growing__ = {
    gioEmitter: gioEmitter$1,
    gio,
    growingio: growingio$1,
    userStorage,
    marketingPreview: void 0,
    entry: 'cdp'
};
gioGlobal.gio = gio;

exports.GioBehavior = GioBehavior;
exports.GioComponent = GioComponent;
exports.GioPage = GioPage;
exports.default = gio;
exports.gioEmitter = gioEmitter$1;
exports.growingio = growingio$1;
