'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var util = require('@firebase/util');
var logger$1 = require('@firebase/logger');
var app = require('@firebase/app');
var component = require('@firebase/component');

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Code = {
    OTHER: 'other',
    ALREADY_INITIALIZED: 'already-initialized',
    NOT_INITIALIZED: 'not-initialized',
    NOT_SUPPORTED: 'not-supported',
    INVALID_ARGUMENT: 'invalid-argument',
    PARTIAL_ERROR: 'partial-error',
    UNAUTHORIZED: 'unauthorized'
};
/** An error returned by a DataConnect operation. */
var DataConnectError = /** @class */ (function (_super) {
    tslib.__extends(DataConnectError, _super);
    /** @hideconstructor */
    function DataConnectError(
    /**
     * The backend error code associated with this error.
     */
    code, 
    /**
     * A custom error description.
     */
    message) {
        var _this = _super.call(this, code, message) || this;
        _this.code = code;
        _this.message = message;
        // HACK: We write a toString property directly because Error is not a real
        // class and so inheritance does not work correctly. We could alternatively
        // do the same "back-door inheritance" trick that FirebaseError does.
        _this.toString = function () { return "".concat(_this.name, ": [code=").concat(_this.code, "]: ").concat(_this.message); };
        return _this;
    }
    return DataConnectError;
}(util.FirebaseError));

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** The semver (www.semver.org) version of the SDK. */
var SDK_VERSION = '';
/**
 * SDK_VERSION should be set before any database instance is created
 * @internal
 */
function setSDKVersion(version) {
    SDK_VERSION = version;
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var logger = new logger$1.Logger('@firebase/data-connect');
function setLogLevel(logLevel) {
    logger.setLogLevel(logLevel);
}
function logDebug(msg) {
    logger.debug("DataConnect (".concat(SDK_VERSION, "): ").concat(msg));
}
function logError(msg) {
    logger.error("DataConnect (".concat(SDK_VERSION, "): ").concat(msg));
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var connectFetch = globalThis.fetch;
function initializeFetch(fetchImpl) {
    connectFetch = fetchImpl;
}
function getGoogApiClientValue(_isUsingGen) {
    var str = 'gl-js/ fire/' + SDK_VERSION;
    if (_isUsingGen) {
        str += ' web/gen';
    }
    return str;
}
function dcFetch(url, body, _a, appId, accessToken, appCheckToken, _isUsingGen) {
    var _this = this;
    var signal = _a.signal;
    if (!connectFetch) {
        throw new DataConnectError(Code.OTHER, 'No Fetch Implementation detected!');
    }
    var headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Client': getGoogApiClientValue(_isUsingGen)
    };
    if (accessToken) {
        headers['X-Firebase-Auth-Token'] = accessToken;
    }
    if (appId) {
        headers['x-firebase-gmpid'] = appId;
    }
    if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken;
    }
    var bodyStr = JSON.stringify(body);
    logDebug("Making request out to ".concat(url, " with body: ").concat(bodyStr));
    return connectFetch(url, {
        body: bodyStr,
        method: 'POST',
        headers: headers,
        signal: signal
    })
        .catch(function (err) {
        throw new DataConnectError(Code.OTHER, 'Failed to fetch: ' + JSON.stringify(err));
    })
        .then(function (response) { return tslib.__awaiter(_this, void 0, void 0, function () {
        var jsonResponse, e_1, message;
        return tslib.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jsonResponse = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, response.json()];
                case 2:
                    jsonResponse = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    throw new DataConnectError(Code.OTHER, JSON.stringify(e_1));
                case 4:
                    message = getMessage(jsonResponse);
                    if (response.status >= 400) {
                        logError('Error while performing request: ' + JSON.stringify(jsonResponse));
                        if (response.status === 401) {
                            throw new DataConnectError(Code.UNAUTHORIZED, message);
                        }
                        throw new DataConnectError(Code.OTHER, message);
                    }
                    return [2 /*return*/, jsonResponse];
            }
        });
    }); })
        .then(function (res) {
        if (res.errors && res.errors.length) {
            var stringified = JSON.stringify(res.errors);
            logError('DataConnect error while performing request: ' + stringified);
            throw new DataConnectError(Code.OTHER, stringified);
        }
        return res;
    });
}
function getMessage(obj) {
    if ('message' in obj) {
        return obj.message;
    }
    return JSON.stringify(obj);
}

var name = "@firebase/data-connect";
var version = "0.1.0";

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @internal
 * Abstraction around AppCheck's token fetching capabilities.
 */
var AppCheckTokenProvider = /** @class */ (function () {
    function AppCheckTokenProvider(appName_, appCheckProvider) {
        var _this = this;
        this.appName_ = appName_;
        this.appCheckProvider = appCheckProvider;
        this.appCheck = appCheckProvider === null || appCheckProvider === void 0 ? void 0 : appCheckProvider.getImmediate({ optional: true });
        if (!this.appCheck) {
            void (appCheckProvider === null || appCheckProvider === void 0 ? void 0 : appCheckProvider.get().then(function (appCheck) { return (_this.appCheck = appCheck); }).catch());
        }
    }
    AppCheckTokenProvider.prototype.getToken = function (forceRefresh) {
        var _this = this;
        if (!this.appCheck) {
            return new Promise(function (resolve, reject) {
                // Support delayed initialization of FirebaseAppCheck. This allows our
                // customers to initialize the RTDB SDK before initializing Firebase
                // AppCheck and ensures that all requests are authenticated if a token
                // becomes available before the timoeout below expires.
                setTimeout(function () {
                    if (_this.appCheck) {
                        _this.getToken(forceRefresh).then(resolve, reject);
                    }
                    else {
                        resolve(null);
                    }
                }, 0);
            });
        }
        return this.appCheck.getToken(forceRefresh);
    };
    AppCheckTokenProvider.prototype.addTokenChangeListener = function (listener) {
        var _a;
        void ((_a = this.appCheckProvider) === null || _a === void 0 ? void 0 : _a.get().then(function (appCheck) { return appCheck.addTokenListener(listener); }));
    };
    return AppCheckTokenProvider;
}());

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// @internal
var FirebaseAuthProvider = /** @class */ (function () {
    function FirebaseAuthProvider(_appName, _options, _authProvider) {
        var _this = this;
        this._appName = _appName;
        this._options = _options;
        this._authProvider = _authProvider;
        this._auth = _authProvider.getImmediate({ optional: true });
        if (!this._auth) {
            _authProvider.onInit(function (auth) { return (_this._auth = auth); });
        }
    }
    FirebaseAuthProvider.prototype.getToken = function (forceRefresh) {
        var _this = this;
        if (!this._auth) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (_this._auth) {
                        _this.getToken(forceRefresh).then(resolve, reject);
                    }
                    else {
                        resolve(null);
                    }
                }, 0);
            });
        }
        return this._auth.getToken(forceRefresh).catch(function (error) {
            if (error && error.code === 'auth/token-not-initialized') {
                logDebug('Got auth/token-not-initialized error.  Treating as null token.');
                return null;
            }
            else {
                logError('Error received when attempting to retrieve token: ' +
                    JSON.stringify(error));
                return Promise.reject(error);
            }
        });
    };
    FirebaseAuthProvider.prototype.addTokenChangeListener = function (listener) {
        var _a;
        (_a = this._auth) === null || _a === void 0 ? void 0 : _a.addAuthTokenListener(listener);
    };
    FirebaseAuthProvider.prototype.removeTokenChangeListener = function (listener) {
        this._authProvider
            .get()
            .then(function (auth) { return auth.removeAuthTokenListener(listener); })
            .catch(function (err) { return logError(err); });
    };
    return FirebaseAuthProvider;
}());

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var QUERY_STR = 'query';
var MUTATION_STR = 'mutation';
var SOURCE_SERVER = 'SERVER';
var SOURCE_CACHE = 'CACHE';

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var encoderImpl;
function setEncoder(encoder) {
    encoderImpl = encoder;
}
setEncoder(function (o) { return JSON.stringify(o); });

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function setIfNotExists(map, key, val) {
    if (!map.has(key)) {
        map.set(key, val);
    }
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getRefSerializer(queryRef, data, source) {
    return function toJSON() {
        return {
            data: data,
            refInfo: {
                name: queryRef.name,
                variables: queryRef.variables,
                connectorConfig: tslib.__assign({ projectId: queryRef.dataConnect.app.options.projectId }, queryRef.dataConnect.getSettings())
            },
            fetchTime: Date.now().toLocaleString(),
            source: source
        };
    };
}
var QueryManager = /** @class */ (function () {
    function QueryManager(transport) {
        this.transport = transport;
        this._queries = new Map();
    }
    QueryManager.prototype.track = function (queryName, variables, initialCache) {
        var ref = {
            name: queryName,
            variables: variables,
            refType: QUERY_STR
        };
        var key = encoderImpl(ref);
        var newTrackedQuery = {
            ref: ref,
            subscriptions: [],
            currentCache: initialCache || null,
            lastError: null
        };
        // @ts-ignore
        setIfNotExists(this._queries, key, newTrackedQuery);
        return this._queries.get(key);
    };
    QueryManager.prototype.addSubscription = function (queryRef, onResultCallback, onErrorCallback, initialCache) {
        var _this = this;
        var key = encoderImpl({
            name: queryRef.name,
            variables: queryRef.variables,
            refType: QUERY_STR
        });
        var trackedQuery = this._queries.get(key);
        var subscription = {
            userCallback: onResultCallback,
            errCallback: onErrorCallback
        };
        var unsubscribe = function () {
            var trackedQuery = _this._queries.get(key);
            trackedQuery.subscriptions = trackedQuery.subscriptions.filter(function (sub) { return sub !== subscription; });
        };
        if (initialCache && trackedQuery.currentCache !== initialCache) {
            logDebug('Initial cache found. Comparing dates.');
            if (!trackedQuery.currentCache ||
                (trackedQuery.currentCache &&
                    compareDates(trackedQuery.currentCache.fetchTime, initialCache.fetchTime))) {
                trackedQuery.currentCache = initialCache;
            }
        }
        if (trackedQuery.currentCache !== null) {
            var cachedData = trackedQuery.currentCache.data;
            onResultCallback({
                data: cachedData,
                source: SOURCE_CACHE,
                ref: queryRef,
                toJSON: getRefSerializer(queryRef, trackedQuery.currentCache.data, SOURCE_CACHE),
                fetchTime: trackedQuery.currentCache.fetchTime
            });
            if (trackedQuery.lastError !== null && onErrorCallback) {
                onErrorCallback(undefined);
            }
        }
        trackedQuery.subscriptions.push({
            userCallback: onResultCallback,
            errCallback: onErrorCallback,
            unsubscribe: unsubscribe
        });
        if (!trackedQuery.currentCache) {
            logDebug("No cache available for query ".concat(queryRef.name, " with variables ").concat(JSON.stringify(queryRef.variables), ". Calling executeQuery."));
            var promise = this.executeQuery(queryRef);
            // We want to ignore the error and let subscriptions handle it
            promise.then(undefined, function (err) { });
        }
        return unsubscribe;
    };
    QueryManager.prototype.executeQuery = function (queryRef) {
        var key = encoderImpl({
            name: queryRef.name,
            variables: queryRef.variables,
            refType: QUERY_STR
        });
        var trackedQuery = this._queries.get(key);
        var result = this.transport.invokeQuery(queryRef.name, queryRef.variables);
        var newR = result.then(function (res) {
            var fetchTime = new Date().toString();
            var result = tslib.__assign(tslib.__assign({}, res), { source: SOURCE_SERVER, ref: queryRef, toJSON: getRefSerializer(queryRef, res.data, SOURCE_SERVER), fetchTime: fetchTime });
            trackedQuery.subscriptions.forEach(function (subscription) {
                subscription.userCallback(result);
            });
            trackedQuery.currentCache = {
                data: res.data,
                source: SOURCE_CACHE,
                fetchTime: fetchTime
            };
            return result;
        }, function (err) {
            trackedQuery.lastError = err;
            trackedQuery.subscriptions.forEach(function (subscription) {
                if (subscription.errCallback) {
                    subscription.errCallback(err);
                }
            });
            throw err;
        });
        return newR;
    };
    QueryManager.prototype.enableEmulator = function (host, port) {
        this.transport.useEmulator(host, port);
    };
    return QueryManager;
}());
function compareDates(str1, str2) {
    var date1 = new Date(str1);
    var date2 = new Date(str2);
    return date1.getTime() < date2.getTime();
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function urlBuilder(projectConfig, transportOptions) {
    var connector = projectConfig.connector, location = projectConfig.location, project = projectConfig.projectId, service = projectConfig.service;
    var host = transportOptions.host, sslEnabled = transportOptions.sslEnabled, port = transportOptions.port;
    var protocol = sslEnabled ? 'https' : 'http';
    var realHost = host || "firebasedataconnect.googleapis.com";
    var baseUrl = "".concat(protocol, "://").concat(realHost);
    if (typeof port === 'number') {
        baseUrl += ":".concat(port);
    }
    else if (typeof port !== 'undefined') {
        logError('Port type is of an invalid type');
        throw new DataConnectError(Code.INVALID_ARGUMENT, 'Incorrect type for port passed in!');
    }
    return "".concat(baseUrl, "/v1beta/projects/").concat(project, "/locations/").concat(location, "/services/").concat(service, "/connectors/").concat(connector);
}
function addToken(url, apiKey) {
    if (!apiKey) {
        return url;
    }
    var newUrl = new URL(url);
    newUrl.searchParams.append('key', apiKey);
    return newUrl.toString();
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var RESTTransport = /** @class */ (function () {
    function RESTTransport(options, apiKey, appId, authProvider, appCheckProvider, transportOptions, _isUsingGen) {
        if (_isUsingGen === void 0) { _isUsingGen = false; }
        var _this = this;
        var _a, _b;
        this.apiKey = apiKey;
        this.appId = appId;
        this.authProvider = authProvider;
        this.appCheckProvider = appCheckProvider;
        this._isUsingGen = _isUsingGen;
        this._host = '';
        this._location = 'l';
        this._connectorName = '';
        this._secure = true;
        this._project = 'p';
        this._accessToken = null;
        this._appCheckToken = null;
        this._lastToken = null;
        // TODO(mtewani): Update U to include shape of body defined in line 13.
        this.invokeQuery = function (queryName, body) {
            var abortController = new AbortController();
            // TODO(mtewani): Update to proper value
            var withAuth = _this.withRetry(function () {
                return dcFetch(addToken("".concat(_this.endpointUrl, ":executeQuery"), _this.apiKey), {
                    name: "projects/".concat(_this._project, "/locations/").concat(_this._location, "/services/").concat(_this._serviceName, "/connectors/").concat(_this._connectorName),
                    operationName: queryName,
                    variables: body
                }, // TODO(mtewani): This is a patch, fix this.
                abortController, _this.appId, _this._accessToken, _this._appCheckToken, _this._isUsingGen);
            });
            return {
                then: withAuth.then.bind(withAuth),
                catch: withAuth.catch.bind(withAuth)
            };
        };
        this.invokeMutation = function (mutationName, body) {
            var abortController = new AbortController();
            var taskResult = _this.withRetry(function () {
                return dcFetch(addToken("".concat(_this.endpointUrl, ":executeMutation"), _this.apiKey), {
                    name: "projects/".concat(_this._project, "/locations/").concat(_this._location, "/services/").concat(_this._serviceName, "/connectors/").concat(_this._connectorName),
                    operationName: mutationName,
                    variables: body
                }, abortController, _this.appId, _this._accessToken, _this._appCheckToken, _this._isUsingGen);
            });
            return {
                then: taskResult.then.bind(taskResult),
                // catch: taskResult.catch.bind(taskResult),
                // finally: taskResult.finally.bind(taskResult),
                cancel: function () { return abortController.abort(); }
            };
        };
        if (transportOptions) {
            if (typeof transportOptions.port === 'number') {
                this._port = transportOptions.port;
            }
            if (typeof transportOptions.sslEnabled !== 'undefined') {
                this._secure = transportOptions.sslEnabled;
            }
            this._host = transportOptions.host;
        }
        var location = options.location, project = options.projectId, connector = options.connector, service = options.service;
        if (location) {
            this._location = location;
        }
        if (project) {
            this._project = project;
        }
        this._serviceName = service;
        if (!connector) {
            throw new DataConnectError(Code.INVALID_ARGUMENT, 'Connector Name required!');
        }
        this._connectorName = connector;
        (_a = this.authProvider) === null || _a === void 0 ? void 0 : _a.addTokenChangeListener(function (token) {
            logDebug("New Token Available: ".concat(token));
            _this._accessToken = token;
        });
        (_b = this.appCheckProvider) === null || _b === void 0 ? void 0 : _b.addTokenChangeListener(function (result) {
            var token = result.token;
            logDebug("New App Check Token Available: ".concat(token));
            _this._appCheckToken = token;
        });
    }
    Object.defineProperty(RESTTransport.prototype, "endpointUrl", {
        get: function () {
            return urlBuilder({
                connector: this._connectorName,
                location: this._location,
                projectId: this._project,
                service: this._serviceName
            }, { host: this._host, sslEnabled: this._secure, port: this._port });
        },
        enumerable: false,
        configurable: true
    });
    RESTTransport.prototype.useEmulator = function (host, port, isSecure) {
        this._host = host;
        if (typeof port === 'number') {
            this._port = port;
        }
        if (typeof isSecure !== 'undefined') {
            this._secure = isSecure;
        }
    };
    RESTTransport.prototype.onTokenChanged = function (newToken) {
        this._accessToken = newToken;
    };
    RESTTransport.prototype.getWithAuth = function (forceToken) {
        var _a;
        if (forceToken === void 0) { forceToken = false; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var starterPromise, _b;
            var _this = this;
            return tslib.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        starterPromise = new Promise(function (resolve) {
                            return resolve(_this._accessToken);
                        });
                        if (!this.appCheckProvider) return [3 /*break*/, 2];
                        _b = this;
                        return [4 /*yield*/, this.appCheckProvider.getToken()];
                    case 1:
                        _b._appCheckToken = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.token;
                        _c.label = 2;
                    case 2:
                        if (this.authProvider) {
                            starterPromise = this.authProvider
                                .getToken(/*forceToken=*/ forceToken)
                                .then(function (data) {
                                if (!data) {
                                    return null;
                                }
                                _this._accessToken = data.accessToken;
                                return _this._accessToken;
                            });
                        }
                        else {
                            starterPromise = new Promise(function (resolve) { return resolve(''); });
                        }
                        return [2 /*return*/, starterPromise];
                }
            });
        });
    };
    RESTTransport.prototype._setLastToken = function (lastToken) {
        this._lastToken = lastToken;
    };
    RESTTransport.prototype.withRetry = function (promiseFactory, retry) {
        var _this = this;
        if (retry === void 0) { retry = false; }
        var isNewToken = false;
        return this.getWithAuth(retry)
            .then(function (res) {
            isNewToken = _this._lastToken !== res;
            _this._lastToken = res;
            return res;
        })
            .then(promiseFactory)
            .catch(function (err) {
            // Only retry if the result is unauthorized and the last token isn't the same as the new one.
            if ('code' in err &&
                err.code === Code.UNAUTHORIZED &&
                !retry &&
                isNewToken) {
                logDebug('Retrying due to unauthorized');
                return _this.withRetry(promiseFactory, true);
            }
            throw err;
        });
    };
    return RESTTransport;
}());

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 *
 * @param dcInstance Data Connect instance
 * @param mutationName name of mutation
 * @param variables variables to send with mutation
 * @returns `MutationRef`
 */
function mutationRef(dcInstance, mutationName, variables) {
    dcInstance.setInitialized();
    var ref = {
        dataConnect: dcInstance,
        name: mutationName,
        refType: MUTATION_STR,
        variables: variables
    };
    return ref;
}
/**
 * @internal
 */
var MutationManager = /** @class */ (function () {
    function MutationManager(_transport) {
        this._transport = _transport;
        this._inflight = [];
    }
    MutationManager.prototype.executeMutation = function (mutationRef) {
        var _this = this;
        var result = this._transport.invokeMutation(mutationRef.name, mutationRef.variables);
        var withRefPromise = result.then(function (res) {
            var obj = tslib.__assign(tslib.__assign({}, res), { source: SOURCE_SERVER, ref: mutationRef, fetchTime: Date.now().toLocaleString() });
            return obj;
        });
        this._inflight.push(result);
        var removePromise = function () {
            return (_this._inflight = _this._inflight.filter(function (promise) { return promise !== result; }));
        };
        result.then(removePromise, removePromise);
        return withRefPromise;
    };
    return MutationManager;
}());
/**
 * Execute Mutation
 * @param mutationRef mutation to execute
 * @returns `MutationRef`
 */
function executeMutation(mutationRef) {
    return mutationRef.dataConnect._mutationManager.executeMutation(mutationRef);
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var FIREBASE_DATA_CONNECT_EMULATOR_HOST_VAR = 'FIREBASE_DATA_CONNECT_EMULATOR_HOST';
/**
 *
 * @param fullHost
 * @returns TransportOptions
 * @internal
 */
function parseOptions(fullHost) {
    var _a = fullHost.split('://'), protocol = _a[0], hostName = _a[1];
    var isSecure = protocol === 'https';
    var _b = hostName.split(':'), host = _b[0], portAsString = _b[1];
    var port = Number(portAsString);
    return { host: host, port: port, sslEnabled: isSecure };
}
/**
 * Class representing Firebase Data Connect
 */
var DataConnect = /** @class */ (function () {
    // @internal
    function DataConnect(app, 
    // TODO(mtewani): Replace with _dataConnectOptions in the future
    dataConnectOptions, _authProvider, _appCheckProvider) {
        this.app = app;
        this.dataConnectOptions = dataConnectOptions;
        this._authProvider = _authProvider;
        this._appCheckProvider = _appCheckProvider;
        this.isEmulator = false;
        this._initialized = false;
        this._isUsingGeneratedSdk = false;
        if (typeof process !== 'undefined' && process.env) {
            var host = process.env[FIREBASE_DATA_CONNECT_EMULATOR_HOST_VAR];
            if (host) {
                logDebug('Found custom host. Using emulator');
                this.isEmulator = true;
                this._transportOptions = parseOptions(host);
            }
        }
    }
    // @internal
    DataConnect.prototype._useGeneratedSdk = function () {
        if (!this._isUsingGeneratedSdk) {
            this._isUsingGeneratedSdk = true;
        }
    };
    DataConnect.prototype._delete = function () {
        app._removeServiceInstance(this.app, 'data-connect', JSON.stringify(this.getSettings()));
        return Promise.resolve();
    };
    // @internal
    DataConnect.prototype.getSettings = function () {
        var copy = JSON.parse(JSON.stringify(this.dataConnectOptions));
        delete copy.projectId;
        return copy;
    };
    // @internal
    DataConnect.prototype.setInitialized = function () {
        if (this._initialized) {
            return;
        }
        if (this._transportClass === undefined) {
            logDebug('transportClass not provided. Defaulting to RESTTransport.');
            this._transportClass = RESTTransport;
        }
        if (this._authProvider) {
            this._authTokenProvider = new FirebaseAuthProvider(this.app.name, this.app.options, this._authProvider);
        }
        if (this._appCheckProvider) {
            this._appCheckTokenProvider = new AppCheckTokenProvider(this.app.name, this._appCheckProvider);
        }
        this._initialized = true;
        this._transport = new this._transportClass(this.dataConnectOptions, this.app.options.apiKey, this.app.options.appId, this._authTokenProvider, this._appCheckTokenProvider, undefined, this._isUsingGeneratedSdk);
        if (this._transportOptions) {
            this._transport.useEmulator(this._transportOptions.host, this._transportOptions.port, this._transportOptions.sslEnabled);
        }
        this._queryManager = new QueryManager(this._transport);
        this._mutationManager = new MutationManager(this._transport);
    };
    // @internal
    DataConnect.prototype.enableEmulator = function (transportOptions) {
        if (this._initialized) {
            logError('enableEmulator called after initialization');
            throw new DataConnectError(Code.ALREADY_INITIALIZED, 'DataConnect instance already initialized!');
        }
        this._transportOptions = transportOptions;
        this.isEmulator = true;
    };
    return DataConnect;
}());
/**
 * Connect to the DataConnect Emulator
 * @param dc Data Connect instance
 * @param host host of emulator server
 * @param port port of emulator server
 * @param sslEnabled use https
 */
function connectDataConnectEmulator(dc, host, port, sslEnabled) {
    if (sslEnabled === void 0) { sslEnabled = false; }
    dc.enableEmulator({ host: host, port: port, sslEnabled: sslEnabled });
}
function getDataConnect(appOrOptions, optionalOptions) {
    var app$1;
    var dcOptions;
    if ('location' in appOrOptions) {
        dcOptions = appOrOptions;
        app$1 = app.getApp();
    }
    else {
        dcOptions = optionalOptions;
        app$1 = appOrOptions;
    }
    if (!app$1 || Object.keys(app$1).length === 0) {
        app$1 = app.getApp();
    }
    var provider = app._getProvider(app$1, 'data-connect');
    var identifier = JSON.stringify(dcOptions);
    if (provider.isInitialized(identifier)) {
        var dcInstance = provider.getImmediate({ identifier: identifier });
        var options = provider.getOptions(identifier);
        var optionsValid = Object.keys(options).length > 0;
        if (optionsValid) {
            logDebug('Re-using cached instance');
            return dcInstance;
        }
    }
    validateDCOptions(dcOptions);
    logDebug('Creating new DataConnect instance');
    // Initialize with options.
    return provider.initialize({
        instanceIdentifier: identifier,
        options: dcOptions
    });
}
/**
 *
 * @param dcOptions
 * @returns {void}
 * @internal
 */
function validateDCOptions(dcOptions) {
    var fields = ['connector', 'location', 'service'];
    if (!dcOptions) {
        throw new DataConnectError(Code.INVALID_ARGUMENT, 'DC Option Required');
    }
    fields.forEach(function (field) {
        if (dcOptions[field] === null || dcOptions[field] === undefined) {
            throw new DataConnectError(Code.INVALID_ARGUMENT, "".concat(field, " Required"));
        }
    });
    return true;
}
/**
 * Delete DataConnect instance
 * @param dataConnect DataConnect instance
 * @returns
 */
function terminate(dataConnect) {
    return dataConnect._delete();
    // TODO(mtewani): Stop pending tasks
}

function registerDataConnect(variant) {
    setSDKVersion(app.SDK_VERSION);
    app._registerComponent(new component.Component('data-connect', function (container, _a) {
        var settings = _a.instanceIdentifier, options = _a.options;
        var app = container.getProvider('app').getImmediate();
        var authProvider = container.getProvider('auth-internal');
        var appCheckProvider = container.getProvider('app-check-internal');
        var newOpts = options;
        if (settings) {
            newOpts = JSON.parse(settings);
        }
        if (!app.options.projectId) {
            throw new DataConnectError(Code.INVALID_ARGUMENT, 'Project ID must be provided. Did you pass in a proper projectId to initializeApp?');
        }
        return new DataConnect(app, tslib.__assign(tslib.__assign({}, newOpts), { projectId: app.options.projectId }), authProvider, appCheckProvider);
    }, "PUBLIC" /* ComponentType.PUBLIC */).setMultipleInstances(true));
    app.registerVersion(name, version, variant);
    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
    app.registerVersion(name, version, 'cjs5');
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Execute Query
 * @param queryRef query to execute.
 * @returns `QueryPromise`
 */
function executeQuery(queryRef) {
    return queryRef.dataConnect._queryManager.executeQuery(queryRef);
}
/**
 * Execute Query
 * @param dcInstance Data Connect instance to use.
 * @param queryName Query to execute
 * @param variables Variables to execute with
 * @param initialCache initial cache to use for client hydration
 * @returns `QueryRef`
 */
function queryRef(dcInstance, queryName, variables, initialCache) {
    dcInstance.setInitialized();
    dcInstance._queryManager.track(queryName, variables, initialCache);
    return {
        dataConnect: dcInstance,
        refType: QUERY_STR,
        name: queryName,
        variables: variables
    };
}
/**
 * Converts serialized ref to query ref
 * @param serializedRef ref to convert to `QueryRef`
 * @returns `QueryRef`
 */
function toQueryRef(serializedRef) {
    var _a = serializedRef.refInfo, name = _a.name, variables = _a.variables, connectorConfig = _a.connectorConfig;
    return queryRef(getDataConnect(connectorConfig), name, variables);
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The generated SDK will allow the user to pass in either the variable or the data connect instance with the variable,
 * and this function validates the variables and returns back the DataConnect instance and variables based on the arguments passed in.
 * @param connectorConfig
 * @param dcOrVars
 * @param vars
 * @param validateVars
 * @returns {DataConnect} and {Variables} instance
 * @internal
 */
function validateArgs(connectorConfig, dcOrVars, vars, validateVars) {
    var dcInstance;
    var realVars;
    if (dcOrVars && 'enableEmulator' in dcOrVars) {
        dcInstance = dcOrVars;
        realVars = vars;
    }
    else {
        dcInstance = getDataConnect(connectorConfig);
        realVars = dcOrVars;
    }
    if (!dcInstance || (!realVars && validateVars)) {
        throw new DataConnectError(Code.INVALID_ARGUMENT, 'Variables required.');
    }
    return { dc: dcInstance, vars: realVars };
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Subscribe to a `QueryRef`
 * @param queryRefOrSerializedResult query ref or serialized result.
 * @param observerOrOnNext observer object or next function.
 * @param onError Callback to call when error gets thrown.
 * @param onComplete Called when subscription completes.
 * @returns `SubscriptionOptions`
 */
function subscribe(queryRefOrSerializedResult, observerOrOnNext, onError, onComplete) {
    var ref;
    var initialCache;
    if ('refInfo' in queryRefOrSerializedResult) {
        var serializedRef = queryRefOrSerializedResult;
        var data = serializedRef.data, source = serializedRef.source, fetchTime = serializedRef.fetchTime;
        initialCache = {
            data: data,
            source: source,
            fetchTime: fetchTime
        };
        ref = toQueryRef(serializedRef);
    }
    else {
        ref = queryRefOrSerializedResult;
    }
    var onResult = undefined;
    if (typeof observerOrOnNext === 'function') {
        onResult = observerOrOnNext;
    }
    else {
        onResult = observerOrOnNext.onNext;
        onError = observerOrOnNext.onErr;
        observerOrOnNext.onComplete;
    }
    if (!onResult) {
        throw new DataConnectError(Code.INVALID_ARGUMENT, 'Must provide onNext');
    }
    return ref.dataConnect._queryManager.addSubscription(ref, onResult, onError, initialCache);
}

/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
initializeFetch(fetch);
registerDataConnect('node');

exports.DataConnect = DataConnect;
exports.MUTATION_STR = MUTATION_STR;
exports.MutationManager = MutationManager;
exports.QUERY_STR = QUERY_STR;
exports.SOURCE_CACHE = SOURCE_CACHE;
exports.SOURCE_SERVER = SOURCE_SERVER;
exports.connectDataConnectEmulator = connectDataConnectEmulator;
exports.executeMutation = executeMutation;
exports.executeQuery = executeQuery;
exports.getDataConnect = getDataConnect;
exports.mutationRef = mutationRef;
exports.parseOptions = parseOptions;
exports.queryRef = queryRef;
exports.setLogLevel = setLogLevel;
exports.subscribe = subscribe;
exports.terminate = terminate;
exports.toQueryRef = toQueryRef;
exports.validateArgs = validateArgs;
exports.validateDCOptions = validateDCOptions;
//# sourceMappingURL=index.node.cjs.js.map
