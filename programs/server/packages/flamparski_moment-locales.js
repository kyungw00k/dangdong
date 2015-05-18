(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var moment;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/flamparski:moment-locales/bower_components/moment/moment.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
//! moment.js                                                                                                          // 1
//! version : 2.8.3                                                                                                    // 2
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors                                                         // 3
//! license : MIT                                                                                                      // 4
//! momentjs.com                                                                                                       // 5
                                                                                                                       // 6
(function (undefined) {                                                                                                // 7
    /************************************                                                                              // 8
        Constants                                                                                                      // 9
    ************************************/                                                                              // 10
                                                                                                                       // 11
    var moment,                                                                                                        // 12
        VERSION = '2.8.3',                                                                                             // 13
        // the global-scope this is NOT the global object in Node.js                                                   // 14
        globalScope = typeof global !== 'undefined' ? global : this,                                                   // 15
        oldGlobalMoment,                                                                                               // 16
        round = Math.round,                                                                                            // 17
        hasOwnProperty = Object.prototype.hasOwnProperty,                                                              // 18
        i,                                                                                                             // 19
                                                                                                                       // 20
        YEAR = 0,                                                                                                      // 21
        MONTH = 1,                                                                                                     // 22
        DATE = 2,                                                                                                      // 23
        HOUR = 3,                                                                                                      // 24
        MINUTE = 4,                                                                                                    // 25
        SECOND = 5,                                                                                                    // 26
        MILLISECOND = 6,                                                                                               // 27
                                                                                                                       // 28
        // internal storage for locale config files                                                                    // 29
        locales = {},                                                                                                  // 30
                                                                                                                       // 31
        // extra moment internal properties (plugins register props here)                                              // 32
        momentProperties = [],                                                                                         // 33
                                                                                                                       // 34
        // check for nodeJS                                                                                            // 35
        hasModule = (typeof module !== 'undefined' && module.exports),                                                 // 36
                                                                                                                       // 37
        // ASP.NET json date format regex                                                                              // 38
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,                                                                       // 39
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,                              // 40
                                                                                                                       // 41
        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html                   // 42
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere                                   // 43
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,
                                                                                                                       // 45
        // format tokens                                                                                               // 46
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,                                              // 48
                                                                                                                       // 49
        // parsing token regexes                                                                                       // 50
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99                                                                  // 51
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999                                                             // 52
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999                                                             // 53
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999                                              // 54
        parseTokenDigits = /\d+/, // nonzero number of digits                                                          // 55
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z                                 // 57
        parseTokenT = /T/i, // T (ISO separator)                                                                       // 58
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123                                   // 59
        parseTokenOrdinal = /\d{1,2}/,                                                                                 // 60
                                                                                                                       // 61
        //strict parsing regexes                                                                                       // 62
        parseTokenOneDigit = /\d/, // 0 - 9                                                                            // 63
        parseTokenTwoDigits = /\d\d/, // 00 - 99                                                                       // 64
        parseTokenThreeDigits = /\d{3}/, // 000 - 999                                                                  // 65
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999                                                                 // 66
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999                                                      // 67
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf                                                             // 68
                                                                                                                       // 69
        // iso 8601 regex                                                                                              // 70
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)   // 71
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
                                                                                                                       // 73
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',                                                                            // 74
                                                                                                                       // 75
        isoDates = [                                                                                                   // 76
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],                                                                 // 77
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],                                                                       // 78
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],                                                                       // 79
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],                                                                            // 80
            ['YYYY-DDD', /\d{4}-\d{3}/]                                                                                // 81
        ],                                                                                                             // 82
                                                                                                                       // 83
        // iso time formats and regexes                                                                                // 84
        isoTimes = [                                                                                                   // 85
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],                                                             // 86
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],                                                                       // 87
            ['HH:mm', /(T| )\d\d:\d\d/],                                                                               // 88
            ['HH', /(T| )\d\d/]                                                                                        // 89
        ],                                                                                                             // 90
                                                                                                                       // 91
        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']                                         // 92
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,                                                                      // 93
                                                                                                                       // 94
        // getter and setter names                                                                                     // 95
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),                                 // 96
        unitMillisecondFactors = {                                                                                     // 97
            'Milliseconds' : 1,                                                                                        // 98
            'Seconds' : 1e3,                                                                                           // 99
            'Minutes' : 6e4,                                                                                           // 100
            'Hours' : 36e5,                                                                                            // 101
            'Days' : 864e5,                                                                                            // 102
            'Months' : 2592e6,                                                                                         // 103
            'Years' : 31536e6                                                                                          // 104
        },                                                                                                             // 105
                                                                                                                       // 106
        unitAliases = {                                                                                                // 107
            ms : 'millisecond',                                                                                        // 108
            s : 'second',                                                                                              // 109
            m : 'minute',                                                                                              // 110
            h : 'hour',                                                                                                // 111
            d : 'day',                                                                                                 // 112
            D : 'date',                                                                                                // 113
            w : 'week',                                                                                                // 114
            W : 'isoWeek',                                                                                             // 115
            M : 'month',                                                                                               // 116
            Q : 'quarter',                                                                                             // 117
            y : 'year',                                                                                                // 118
            DDD : 'dayOfYear',                                                                                         // 119
            e : 'weekday',                                                                                             // 120
            E : 'isoWeekday',                                                                                          // 121
            gg: 'weekYear',                                                                                            // 122
            GG: 'isoWeekYear'                                                                                          // 123
        },                                                                                                             // 124
                                                                                                                       // 125
        camelFunctions = {                                                                                             // 126
            dayofyear : 'dayOfYear',                                                                                   // 127
            isoweekday : 'isoWeekday',                                                                                 // 128
            isoweek : 'isoWeek',                                                                                       // 129
            weekyear : 'weekYear',                                                                                     // 130
            isoweekyear : 'isoWeekYear'                                                                                // 131
        },                                                                                                             // 132
                                                                                                                       // 133
        // format function strings                                                                                     // 134
        formatFunctions = {},                                                                                          // 135
                                                                                                                       // 136
        // default relative time thresholds                                                                            // 137
        relativeTimeThresholds = {                                                                                     // 138
            s: 45,  // seconds to minute                                                                               // 139
            m: 45,  // minutes to hour                                                                                 // 140
            h: 22,  // hours to day                                                                                    // 141
            d: 26,  // days to month                                                                                   // 142
            M: 11   // months to year                                                                                  // 143
        },                                                                                                             // 144
                                                                                                                       // 145
        // tokens to ordinalize and pad                                                                                // 146
        ordinalizeTokens = 'DDD w W M D d'.split(' '),                                                                 // 147
        paddedTokens = 'M D H h m s w W'.split(' '),                                                                   // 148
                                                                                                                       // 149
        formatTokenFunctions = {                                                                                       // 150
            M    : function () {                                                                                       // 151
                return this.month() + 1;                                                                               // 152
            },                                                                                                         // 153
            MMM  : function (format) {                                                                                 // 154
                return this.localeData().monthsShort(this, format);                                                    // 155
            },                                                                                                         // 156
            MMMM : function (format) {                                                                                 // 157
                return this.localeData().months(this, format);                                                         // 158
            },                                                                                                         // 159
            D    : function () {                                                                                       // 160
                return this.date();                                                                                    // 161
            },                                                                                                         // 162
            DDD  : function () {                                                                                       // 163
                return this.dayOfYear();                                                                               // 164
            },                                                                                                         // 165
            d    : function () {                                                                                       // 166
                return this.day();                                                                                     // 167
            },                                                                                                         // 168
            dd   : function (format) {                                                                                 // 169
                return this.localeData().weekdaysMin(this, format);                                                    // 170
            },                                                                                                         // 171
            ddd  : function (format) {                                                                                 // 172
                return this.localeData().weekdaysShort(this, format);                                                  // 173
            },                                                                                                         // 174
            dddd : function (format) {                                                                                 // 175
                return this.localeData().weekdays(this, format);                                                       // 176
            },                                                                                                         // 177
            w    : function () {                                                                                       // 178
                return this.week();                                                                                    // 179
            },                                                                                                         // 180
            W    : function () {                                                                                       // 181
                return this.isoWeek();                                                                                 // 182
            },                                                                                                         // 183
            YY   : function () {                                                                                       // 184
                return leftZeroFill(this.year() % 100, 2);                                                             // 185
            },                                                                                                         // 186
            YYYY : function () {                                                                                       // 187
                return leftZeroFill(this.year(), 4);                                                                   // 188
            },                                                                                                         // 189
            YYYYY : function () {                                                                                      // 190
                return leftZeroFill(this.year(), 5);                                                                   // 191
            },                                                                                                         // 192
            YYYYYY : function () {                                                                                     // 193
                var y = this.year(), sign = y >= 0 ? '+' : '-';                                                        // 194
                return sign + leftZeroFill(Math.abs(y), 6);                                                            // 195
            },                                                                                                         // 196
            gg   : function () {                                                                                       // 197
                return leftZeroFill(this.weekYear() % 100, 2);                                                         // 198
            },                                                                                                         // 199
            gggg : function () {                                                                                       // 200
                return leftZeroFill(this.weekYear(), 4);                                                               // 201
            },                                                                                                         // 202
            ggggg : function () {                                                                                      // 203
                return leftZeroFill(this.weekYear(), 5);                                                               // 204
            },                                                                                                         // 205
            GG   : function () {                                                                                       // 206
                return leftZeroFill(this.isoWeekYear() % 100, 2);                                                      // 207
            },                                                                                                         // 208
            GGGG : function () {                                                                                       // 209
                return leftZeroFill(this.isoWeekYear(), 4);                                                            // 210
            },                                                                                                         // 211
            GGGGG : function () {                                                                                      // 212
                return leftZeroFill(this.isoWeekYear(), 5);                                                            // 213
            },                                                                                                         // 214
            e : function () {                                                                                          // 215
                return this.weekday();                                                                                 // 216
            },                                                                                                         // 217
            E : function () {                                                                                          // 218
                return this.isoWeekday();                                                                              // 219
            },                                                                                                         // 220
            a    : function () {                                                                                       // 221
                return this.localeData().meridiem(this.hours(), this.minutes(), true);                                 // 222
            },                                                                                                         // 223
            A    : function () {                                                                                       // 224
                return this.localeData().meridiem(this.hours(), this.minutes(), false);                                // 225
            },                                                                                                         // 226
            H    : function () {                                                                                       // 227
                return this.hours();                                                                                   // 228
            },                                                                                                         // 229
            h    : function () {                                                                                       // 230
                return this.hours() % 12 || 12;                                                                        // 231
            },                                                                                                         // 232
            m    : function () {                                                                                       // 233
                return this.minutes();                                                                                 // 234
            },                                                                                                         // 235
            s    : function () {                                                                                       // 236
                return this.seconds();                                                                                 // 237
            },                                                                                                         // 238
            S    : function () {                                                                                       // 239
                return toInt(this.milliseconds() / 100);                                                               // 240
            },                                                                                                         // 241
            SS   : function () {                                                                                       // 242
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);                                               // 243
            },                                                                                                         // 244
            SSS  : function () {                                                                                       // 245
                return leftZeroFill(this.milliseconds(), 3);                                                           // 246
            },                                                                                                         // 247
            SSSS : function () {                                                                                       // 248
                return leftZeroFill(this.milliseconds(), 3);                                                           // 249
            },                                                                                                         // 250
            Z    : function () {                                                                                       // 251
                var a = -this.zone(),                                                                                  // 252
                    b = '+';                                                                                           // 253
                if (a < 0) {                                                                                           // 254
                    a = -a;                                                                                            // 255
                    b = '-';                                                                                           // 256
                }                                                                                                      // 257
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);                      // 258
            },                                                                                                         // 259
            ZZ   : function () {                                                                                       // 260
                var a = -this.zone(),                                                                                  // 261
                    b = '+';                                                                                           // 262
                if (a < 0) {                                                                                           // 263
                    a = -a;                                                                                            // 264
                    b = '-';                                                                                           // 265
                }                                                                                                      // 266
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);                            // 267
            },                                                                                                         // 268
            z : function () {                                                                                          // 269
                return this.zoneAbbr();                                                                                // 270
            },                                                                                                         // 271
            zz : function () {                                                                                         // 272
                return this.zoneName();                                                                                // 273
            },                                                                                                         // 274
            X    : function () {                                                                                       // 275
                return this.unix();                                                                                    // 276
            },                                                                                                         // 277
            Q : function () {                                                                                          // 278
                return this.quarter();                                                                                 // 279
            }                                                                                                          // 280
        },                                                                                                             // 281
                                                                                                                       // 282
        deprecations = {},                                                                                             // 283
                                                                                                                       // 284
        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];                                 // 285
                                                                                                                       // 286
    // Pick the first defined of two or three arguments. dfl comes from                                                // 287
    // default.                                                                                                        // 288
    function dfl(a, b, c) {                                                                                            // 289
        switch (arguments.length) {                                                                                    // 290
            case 2: return a != null ? a : b;                                                                          // 291
            case 3: return a != null ? a : b != null ? b : c;                                                          // 292
            default: throw new Error('Implement me');                                                                  // 293
        }                                                                                                              // 294
    }                                                                                                                  // 295
                                                                                                                       // 296
    function hasOwnProp(a, b) {                                                                                        // 297
        return hasOwnProperty.call(a, b);                                                                              // 298
    }                                                                                                                  // 299
                                                                                                                       // 300
    function defaultParsingFlags() {                                                                                   // 301
        // We need to deep clone this object, and es5 standard is not very                                             // 302
        // helpful.                                                                                                    // 303
        return {                                                                                                       // 304
            empty : false,                                                                                             // 305
            unusedTokens : [],                                                                                         // 306
            unusedInput : [],                                                                                          // 307
            overflow : -2,                                                                                             // 308
            charsLeftOver : 0,                                                                                         // 309
            nullInput : false,                                                                                         // 310
            invalidMonth : null,                                                                                       // 311
            invalidFormat : false,                                                                                     // 312
            userInvalidated : false,                                                                                   // 313
            iso: false                                                                                                 // 314
        };                                                                                                             // 315
    }                                                                                                                  // 316
                                                                                                                       // 317
    function printMsg(msg) {                                                                                           // 318
        if (moment.suppressDeprecationWarnings === false &&                                                            // 319
                typeof console !== 'undefined' && console.warn) {                                                      // 320
            console.warn('Deprecation warning: ' + msg);                                                               // 321
        }                                                                                                              // 322
    }                                                                                                                  // 323
                                                                                                                       // 324
    function deprecate(msg, fn) {                                                                                      // 325
        var firstTime = true;                                                                                          // 326
        return extend(function () {                                                                                    // 327
            if (firstTime) {                                                                                           // 328
                printMsg(msg);                                                                                         // 329
                firstTime = false;                                                                                     // 330
            }                                                                                                          // 331
            return fn.apply(this, arguments);                                                                          // 332
        }, fn);                                                                                                        // 333
    }                                                                                                                  // 334
                                                                                                                       // 335
    function deprecateSimple(name, msg) {                                                                              // 336
        if (!deprecations[name]) {                                                                                     // 337
            printMsg(msg);                                                                                             // 338
            deprecations[name] = true;                                                                                 // 339
        }                                                                                                              // 340
    }                                                                                                                  // 341
                                                                                                                       // 342
    function padToken(func, count) {                                                                                   // 343
        return function (a) {                                                                                          // 344
            return leftZeroFill(func.call(this, a), count);                                                            // 345
        };                                                                                                             // 346
    }                                                                                                                  // 347
    function ordinalizeToken(func, period) {                                                                           // 348
        return function (a) {                                                                                          // 349
            return this.localeData().ordinal(func.call(this, a), period);                                              // 350
        };                                                                                                             // 351
    }                                                                                                                  // 352
                                                                                                                       // 353
    while (ordinalizeTokens.length) {                                                                                  // 354
        i = ordinalizeTokens.pop();                                                                                    // 355
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);                                   // 356
    }                                                                                                                  // 357
    while (paddedTokens.length) {                                                                                      // 358
        i = paddedTokens.pop();                                                                                        // 359
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);                                            // 360
    }                                                                                                                  // 361
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);                                                 // 362
                                                                                                                       // 363
                                                                                                                       // 364
    /************************************                                                                              // 365
        Constructors                                                                                                   // 366
    ************************************/                                                                              // 367
                                                                                                                       // 368
    function Locale() {                                                                                                // 369
    }                                                                                                                  // 370
                                                                                                                       // 371
    // Moment prototype object                                                                                         // 372
    function Moment(config, skipOverflow) {                                                                            // 373
        if (skipOverflow !== false) {                                                                                  // 374
            checkOverflow(config);                                                                                     // 375
        }                                                                                                              // 376
        copyConfig(this, config);                                                                                      // 377
        this._d = new Date(+config._d);                                                                                // 378
    }                                                                                                                  // 379
                                                                                                                       // 380
    // Duration Constructor                                                                                            // 381
    function Duration(duration) {                                                                                      // 382
        var normalizedInput = normalizeObjectUnits(duration),                                                          // 383
            years = normalizedInput.year || 0,                                                                         // 384
            quarters = normalizedInput.quarter || 0,                                                                   // 385
            months = normalizedInput.month || 0,                                                                       // 386
            weeks = normalizedInput.week || 0,                                                                         // 387
            days = normalizedInput.day || 0,                                                                           // 388
            hours = normalizedInput.hour || 0,                                                                         // 389
            minutes = normalizedInput.minute || 0,                                                                     // 390
            seconds = normalizedInput.second || 0,                                                                     // 391
            milliseconds = normalizedInput.millisecond || 0;                                                           // 392
                                                                                                                       // 393
        // representation for dateAddRemove                                                                            // 394
        this._milliseconds = +milliseconds +                                                                           // 395
            seconds * 1e3 + // 1000                                                                                    // 396
            minutes * 6e4 + // 1000 * 60                                                                               // 397
            hours * 36e5; // 1000 * 60 * 60                                                                            // 398
        // Because of dateAddRemove treats 24 hours as different from a                                                // 399
        // day when working around DST, we need to store them separately                                               // 400
        this._days = +days +                                                                                           // 401
            weeks * 7;                                                                                                 // 402
        // It is impossible translate months into days without knowing                                                 // 403
        // which months you are are talking about, so we have to store                                                 // 404
        // it separately.                                                                                              // 405
        this._months = +months +                                                                                       // 406
            quarters * 3 +                                                                                             // 407
            years * 12;                                                                                                // 408
                                                                                                                       // 409
        this._data = {};                                                                                               // 410
                                                                                                                       // 411
        this._locale = moment.localeData();                                                                            // 412
                                                                                                                       // 413
        this._bubble();                                                                                                // 414
    }                                                                                                                  // 415
                                                                                                                       // 416
    /************************************                                                                              // 417
        Helpers                                                                                                        // 418
    ************************************/                                                                              // 419
                                                                                                                       // 420
                                                                                                                       // 421
    function extend(a, b) {                                                                                            // 422
        for (var i in b) {                                                                                             // 423
            if (hasOwnProp(b, i)) {                                                                                    // 424
                a[i] = b[i];                                                                                           // 425
            }                                                                                                          // 426
        }                                                                                                              // 427
                                                                                                                       // 428
        if (hasOwnProp(b, 'toString')) {                                                                               // 429
            a.toString = b.toString;                                                                                   // 430
        }                                                                                                              // 431
                                                                                                                       // 432
        if (hasOwnProp(b, 'valueOf')) {                                                                                // 433
            a.valueOf = b.valueOf;                                                                                     // 434
        }                                                                                                              // 435
                                                                                                                       // 436
        return a;                                                                                                      // 437
    }                                                                                                                  // 438
                                                                                                                       // 439
    function copyConfig(to, from) {                                                                                    // 440
        var i, prop, val;                                                                                              // 441
                                                                                                                       // 442
        if (typeof from._isAMomentObject !== 'undefined') {                                                            // 443
            to._isAMomentObject = from._isAMomentObject;                                                               // 444
        }                                                                                                              // 445
        if (typeof from._i !== 'undefined') {                                                                          // 446
            to._i = from._i;                                                                                           // 447
        }                                                                                                              // 448
        if (typeof from._f !== 'undefined') {                                                                          // 449
            to._f = from._f;                                                                                           // 450
        }                                                                                                              // 451
        if (typeof from._l !== 'undefined') {                                                                          // 452
            to._l = from._l;                                                                                           // 453
        }                                                                                                              // 454
        if (typeof from._strict !== 'undefined') {                                                                     // 455
            to._strict = from._strict;                                                                                 // 456
        }                                                                                                              // 457
        if (typeof from._tzm !== 'undefined') {                                                                        // 458
            to._tzm = from._tzm;                                                                                       // 459
        }                                                                                                              // 460
        if (typeof from._isUTC !== 'undefined') {                                                                      // 461
            to._isUTC = from._isUTC;                                                                                   // 462
        }                                                                                                              // 463
        if (typeof from._offset !== 'undefined') {                                                                     // 464
            to._offset = from._offset;                                                                                 // 465
        }                                                                                                              // 466
        if (typeof from._pf !== 'undefined') {                                                                         // 467
            to._pf = from._pf;                                                                                         // 468
        }                                                                                                              // 469
        if (typeof from._locale !== 'undefined') {                                                                     // 470
            to._locale = from._locale;                                                                                 // 471
        }                                                                                                              // 472
                                                                                                                       // 473
        if (momentProperties.length > 0) {                                                                             // 474
            for (i in momentProperties) {                                                                              // 475
                prop = momentProperties[i];                                                                            // 476
                val = from[prop];                                                                                      // 477
                if (typeof val !== 'undefined') {                                                                      // 478
                    to[prop] = val;                                                                                    // 479
                }                                                                                                      // 480
            }                                                                                                          // 481
        }                                                                                                              // 482
                                                                                                                       // 483
        return to;                                                                                                     // 484
    }                                                                                                                  // 485
                                                                                                                       // 486
    function absRound(number) {                                                                                        // 487
        if (number < 0) {                                                                                              // 488
            return Math.ceil(number);                                                                                  // 489
        } else {                                                                                                       // 490
            return Math.floor(number);                                                                                 // 491
        }                                                                                                              // 492
    }                                                                                                                  // 493
                                                                                                                       // 494
    // left zero fill a number                                                                                         // 495
    // see http://jsperf.com/left-zero-filling for performance comparison                                              // 496
    function leftZeroFill(number, targetLength, forceSign) {                                                           // 497
        var output = '' + Math.abs(number),                                                                            // 498
            sign = number >= 0;                                                                                        // 499
                                                                                                                       // 500
        while (output.length < targetLength) {                                                                         // 501
            output = '0' + output;                                                                                     // 502
        }                                                                                                              // 503
        return (sign ? (forceSign ? '+' : '') : '-') + output;                                                         // 504
    }                                                                                                                  // 505
                                                                                                                       // 506
    function positiveMomentsDifference(base, other) {                                                                  // 507
        var res = {milliseconds: 0, months: 0};                                                                        // 508
                                                                                                                       // 509
        res.months = other.month() - base.month() +                                                                    // 510
            (other.year() - base.year()) * 12;                                                                         // 511
        if (base.clone().add(res.months, 'M').isAfter(other)) {                                                        // 512
            --res.months;                                                                                              // 513
        }                                                                                                              // 514
                                                                                                                       // 515
        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));                                              // 516
                                                                                                                       // 517
        return res;                                                                                                    // 518
    }                                                                                                                  // 519
                                                                                                                       // 520
    function momentsDifference(base, other) {                                                                          // 521
        var res;                                                                                                       // 522
        other = makeAs(other, base);                                                                                   // 523
        if (base.isBefore(other)) {                                                                                    // 524
            res = positiveMomentsDifference(base, other);                                                              // 525
        } else {                                                                                                       // 526
            res = positiveMomentsDifference(other, base);                                                              // 527
            res.milliseconds = -res.milliseconds;                                                                      // 528
            res.months = -res.months;                                                                                  // 529
        }                                                                                                              // 530
                                                                                                                       // 531
        return res;                                                                                                    // 532
    }                                                                                                                  // 533
                                                                                                                       // 534
    // TODO: remove 'name' arg after deprecation is removed                                                            // 535
    function createAdder(direction, name) {                                                                            // 536
        return function (val, period) {                                                                                // 537
            var dur, tmp;                                                                                              // 538
            //invert the arguments, but complain about it                                                              // 539
            if (period !== null && !isNaN(+period)) {                                                                  // 540
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;                                                                 // 542
            }                                                                                                          // 543
                                                                                                                       // 544
            val = typeof val === 'string' ? +val : val;                                                                // 545
            dur = moment.duration(val, period);                                                                        // 546
            addOrSubtractDurationFromMoment(this, dur, direction);                                                     // 547
            return this;                                                                                               // 548
        };                                                                                                             // 549
    }                                                                                                                  // 550
                                                                                                                       // 551
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {                                  // 552
        var milliseconds = duration._milliseconds,                                                                     // 553
            days = duration._days,                                                                                     // 554
            months = duration._months;                                                                                 // 555
        updateOffset = updateOffset == null ? true : updateOffset;                                                     // 556
                                                                                                                       // 557
        if (milliseconds) {                                                                                            // 558
            mom._d.setTime(+mom._d + milliseconds * isAdding);                                                         // 559
        }                                                                                                              // 560
        if (days) {                                                                                                    // 561
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);                                          // 562
        }                                                                                                              // 563
        if (months) {                                                                                                  // 564
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);                                          // 565
        }                                                                                                              // 566
        if (updateOffset) {                                                                                            // 567
            moment.updateOffset(mom, days || months);                                                                  // 568
        }                                                                                                              // 569
    }                                                                                                                  // 570
                                                                                                                       // 571
    // check if is an array                                                                                            // 572
    function isArray(input) {                                                                                          // 573
        return Object.prototype.toString.call(input) === '[object Array]';                                             // 574
    }                                                                                                                  // 575
                                                                                                                       // 576
    function isDate(input) {                                                                                           // 577
        return Object.prototype.toString.call(input) === '[object Date]' ||                                            // 578
            input instanceof Date;                                                                                     // 579
    }                                                                                                                  // 580
                                                                                                                       // 581
    // compare two arrays, return the number of differences                                                            // 582
    function compareArrays(array1, array2, dontConvert) {                                                              // 583
        var len = Math.min(array1.length, array2.length),                                                              // 584
            lengthDiff = Math.abs(array1.length - array2.length),                                                      // 585
            diffs = 0,                                                                                                 // 586
            i;                                                                                                         // 587
        for (i = 0; i < len; i++) {                                                                                    // 588
            if ((dontConvert && array1[i] !== array2[i]) ||                                                            // 589
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {                                             // 590
                diffs++;                                                                                               // 591
            }                                                                                                          // 592
        }                                                                                                              // 593
        return diffs + lengthDiff;                                                                                     // 594
    }                                                                                                                  // 595
                                                                                                                       // 596
    function normalizeUnits(units) {                                                                                   // 597
        if (units) {                                                                                                   // 598
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');                                                  // 599
            units = unitAliases[units] || camelFunctions[lowered] || lowered;                                          // 600
        }                                                                                                              // 601
        return units;                                                                                                  // 602
    }                                                                                                                  // 603
                                                                                                                       // 604
    function normalizeObjectUnits(inputObject) {                                                                       // 605
        var normalizedInput = {},                                                                                      // 606
            normalizedProp,                                                                                            // 607
            prop;                                                                                                      // 608
                                                                                                                       // 609
        for (prop in inputObject) {                                                                                    // 610
            if (hasOwnProp(inputObject, prop)) {                                                                       // 611
                normalizedProp = normalizeUnits(prop);                                                                 // 612
                if (normalizedProp) {                                                                                  // 613
                    normalizedInput[normalizedProp] = inputObject[prop];                                               // 614
                }                                                                                                      // 615
            }                                                                                                          // 616
        }                                                                                                              // 617
                                                                                                                       // 618
        return normalizedInput;                                                                                        // 619
    }                                                                                                                  // 620
                                                                                                                       // 621
    function makeList(field) {                                                                                         // 622
        var count, setter;                                                                                             // 623
                                                                                                                       // 624
        if (field.indexOf('week') === 0) {                                                                             // 625
            count = 7;                                                                                                 // 626
            setter = 'day';                                                                                            // 627
        }                                                                                                              // 628
        else if (field.indexOf('month') === 0) {                                                                       // 629
            count = 12;                                                                                                // 630
            setter = 'month';                                                                                          // 631
        }                                                                                                              // 632
        else {                                                                                                         // 633
            return;                                                                                                    // 634
        }                                                                                                              // 635
                                                                                                                       // 636
        moment[field] = function (format, index) {                                                                     // 637
            var i, getter,                                                                                             // 638
                method = moment._locale[field],                                                                        // 639
                results = [];                                                                                          // 640
                                                                                                                       // 641
            if (typeof format === 'number') {                                                                          // 642
                index = format;                                                                                        // 643
                format = undefined;                                                                                    // 644
            }                                                                                                          // 645
                                                                                                                       // 646
            getter = function (i) {                                                                                    // 647
                var m = moment().utc().set(setter, i);                                                                 // 648
                return method.call(moment._locale, m, format || '');                                                   // 649
            };                                                                                                         // 650
                                                                                                                       // 651
            if (index != null) {                                                                                       // 652
                return getter(index);                                                                                  // 653
            }                                                                                                          // 654
            else {                                                                                                     // 655
                for (i = 0; i < count; i++) {                                                                          // 656
                    results.push(getter(i));                                                                           // 657
                }                                                                                                      // 658
                return results;                                                                                        // 659
            }                                                                                                          // 660
        };                                                                                                             // 661
    }                                                                                                                  // 662
                                                                                                                       // 663
    function toInt(argumentForCoercion) {                                                                              // 664
        var coercedNumber = +argumentForCoercion,                                                                      // 665
            value = 0;                                                                                                 // 666
                                                                                                                       // 667
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {                                                          // 668
            if (coercedNumber >= 0) {                                                                                  // 669
                value = Math.floor(coercedNumber);                                                                     // 670
            } else {                                                                                                   // 671
                value = Math.ceil(coercedNumber);                                                                      // 672
            }                                                                                                          // 673
        }                                                                                                              // 674
                                                                                                                       // 675
        return value;                                                                                                  // 676
    }                                                                                                                  // 677
                                                                                                                       // 678
    function daysInMonth(year, month) {                                                                                // 679
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();                                                    // 680
    }                                                                                                                  // 681
                                                                                                                       // 682
    function weeksInYear(year, dow, doy) {                                                                             // 683
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;                                          // 684
    }                                                                                                                  // 685
                                                                                                                       // 686
    function daysInYear(year) {                                                                                        // 687
        return isLeapYear(year) ? 366 : 365;                                                                           // 688
    }                                                                                                                  // 689
                                                                                                                       // 690
    function isLeapYear(year) {                                                                                        // 691
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;                                               // 692
    }                                                                                                                  // 693
                                                                                                                       // 694
    function checkOverflow(m) {                                                                                        // 695
        var overflow;                                                                                                  // 696
        if (m._a && m._pf.overflow === -2) {                                                                           // 697
            overflow =                                                                                                 // 698
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :                                                          // 699
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :                           // 700
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :                                                             // 701
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :                                                       // 702
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :                                                       // 703
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :                                       // 704
                -1;                                                                                                    // 705
                                                                                                                       // 706
            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {                                    // 707
                overflow = DATE;                                                                                       // 708
            }                                                                                                          // 709
                                                                                                                       // 710
            m._pf.overflow = overflow;                                                                                 // 711
        }                                                                                                              // 712
    }                                                                                                                  // 713
                                                                                                                       // 714
    function isValid(m) {                                                                                              // 715
        if (m._isValid == null) {                                                                                      // 716
            m._isValid = !isNaN(m._d.getTime()) &&                                                                     // 717
                m._pf.overflow < 0 &&                                                                                  // 718
                !m._pf.empty &&                                                                                        // 719
                !m._pf.invalidMonth &&                                                                                 // 720
                !m._pf.nullInput &&                                                                                    // 721
                !m._pf.invalidFormat &&                                                                                // 722
                !m._pf.userInvalidated;                                                                                // 723
                                                                                                                       // 724
            if (m._strict) {                                                                                           // 725
                m._isValid = m._isValid &&                                                                             // 726
                    m._pf.charsLeftOver === 0 &&                                                                       // 727
                    m._pf.unusedTokens.length === 0;                                                                   // 728
            }                                                                                                          // 729
        }                                                                                                              // 730
        return m._isValid;                                                                                             // 731
    }                                                                                                                  // 732
                                                                                                                       // 733
    function normalizeLocale(key) {                                                                                    // 734
        return key ? key.toLowerCase().replace('_', '-') : key;                                                        // 735
    }                                                                                                                  // 736
                                                                                                                       // 737
    // pick the locale from the array                                                                                  // 738
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each                       // 739
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {                                                                                     // 741
        var i = 0, j, next, locale, split;                                                                             // 742
                                                                                                                       // 743
        while (i < names.length) {                                                                                     // 744
            split = normalizeLocale(names[i]).split('-');                                                              // 745
            j = split.length;                                                                                          // 746
            next = normalizeLocale(names[i + 1]);                                                                      // 747
            next = next ? next.split('-') : null;                                                                      // 748
            while (j > 0) {                                                                                            // 749
                locale = loadLocale(split.slice(0, j).join('-'));                                                      // 750
                if (locale) {                                                                                          // 751
                    return locale;                                                                                     // 752
                }                                                                                                      // 753
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {                           // 754
                    //the next array item is better than a shallower substring of this one                             // 755
                    break;                                                                                             // 756
                }                                                                                                      // 757
                j--;                                                                                                   // 758
            }                                                                                                          // 759
            i++;                                                                                                       // 760
        }                                                                                                              // 761
        return null;                                                                                                   // 762
    }                                                                                                                  // 763
                                                                                                                       // 764
    function loadLocale(name) {                                                                                        // 765
        var oldLocale = null;                                                                                          // 766
        if (!locales[name] && hasModule) {                                                                             // 767
            try {                                                                                                      // 768
                oldLocale = moment.locale();                                                                           // 769
                require('./locale/' + name);                                                                           // 770
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);                                                                              // 772
            } catch (e) { }                                                                                            // 773
        }                                                                                                              // 774
        return locales[name];                                                                                          // 775
    }                                                                                                                  // 776
                                                                                                                       // 777
    // Return a moment from input, that is local/utc/zone equivalent to model.                                         // 778
    function makeAs(input, model) {                                                                                    // 779
        return model._isUTC ? moment(input).zone(model._offset || 0) :                                                 // 780
            moment(input).local();                                                                                     // 781
    }                                                                                                                  // 782
                                                                                                                       // 783
    /************************************                                                                              // 784
        Locale                                                                                                         // 785
    ************************************/                                                                              // 786
                                                                                                                       // 787
                                                                                                                       // 788
    extend(Locale.prototype, {                                                                                         // 789
                                                                                                                       // 790
        set : function (config) {                                                                                      // 791
            var prop, i;                                                                                               // 792
            for (i in config) {                                                                                        // 793
                prop = config[i];                                                                                      // 794
                if (typeof prop === 'function') {                                                                      // 795
                    this[i] = prop;                                                                                    // 796
                } else {                                                                                               // 797
                    this['_' + i] = prop;                                                                              // 798
                }                                                                                                      // 799
            }                                                                                                          // 800
        },                                                                                                             // 801
                                                                                                                       // 802
        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),  // 803
        months : function (m) {                                                                                        // 804
            return this._months[m.month()];                                                                            // 805
        },                                                                                                             // 806
                                                                                                                       // 807
        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),                                   // 808
        monthsShort : function (m) {                                                                                   // 809
            return this._monthsShort[m.month()];                                                                       // 810
        },                                                                                                             // 811
                                                                                                                       // 812
        monthsParse : function (monthName) {                                                                           // 813
            var i, mom, regex;                                                                                         // 814
                                                                                                                       // 815
            if (!this._monthsParse) {                                                                                  // 816
                this._monthsParse = [];                                                                                // 817
            }                                                                                                          // 818
                                                                                                                       // 819
            for (i = 0; i < 12; i++) {                                                                                 // 820
                // make the regex if we don't have it already                                                          // 821
                if (!this._monthsParse[i]) {                                                                           // 822
                    mom = moment.utc([2000, i]);                                                                       // 823
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');                             // 824
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');                                    // 825
                }                                                                                                      // 826
                // test the regex                                                                                      // 827
                if (this._monthsParse[i].test(monthName)) {                                                            // 828
                    return i;                                                                                          // 829
                }                                                                                                      // 830
            }                                                                                                          // 831
        },                                                                                                             // 832
                                                                                                                       // 833
        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),                             // 834
        weekdays : function (m) {                                                                                      // 835
            return this._weekdays[m.day()];                                                                            // 836
        },                                                                                                             // 837
                                                                                                                       // 838
        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),                                                     // 839
        weekdaysShort : function (m) {                                                                                 // 840
            return this._weekdaysShort[m.day()];                                                                       // 841
        },                                                                                                             // 842
                                                                                                                       // 843
        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),                                                              // 844
        weekdaysMin : function (m) {                                                                                   // 845
            return this._weekdaysMin[m.day()];                                                                         // 846
        },                                                                                                             // 847
                                                                                                                       // 848
        weekdaysParse : function (weekdayName) {                                                                       // 849
            var i, mom, regex;                                                                                         // 850
                                                                                                                       // 851
            if (!this._weekdaysParse) {                                                                                // 852
                this._weekdaysParse = [];                                                                              // 853
            }                                                                                                          // 854
                                                                                                                       // 855
            for (i = 0; i < 7; i++) {                                                                                  // 856
                // make the regex if we don't have it already                                                          // 857
                if (!this._weekdaysParse[i]) {                                                                         // 858
                    mom = moment([2000, 1]).day(i);                                                                    // 859
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');                                  // 861
                }                                                                                                      // 862
                // test the regex                                                                                      // 863
                if (this._weekdaysParse[i].test(weekdayName)) {                                                        // 864
                    return i;                                                                                          // 865
                }                                                                                                      // 866
            }                                                                                                          // 867
        },                                                                                                             // 868
                                                                                                                       // 869
        _longDateFormat : {                                                                                            // 870
            LT : 'h:mm A',                                                                                             // 871
            L : 'MM/DD/YYYY',                                                                                          // 872
            LL : 'MMMM D, YYYY',                                                                                       // 873
            LLL : 'MMMM D, YYYY LT',                                                                                   // 874
            LLLL : 'dddd, MMMM D, YYYY LT'                                                                             // 875
        },                                                                                                             // 876
        longDateFormat : function (key) {                                                                              // 877
            var output = this._longDateFormat[key];                                                                    // 878
            if (!output && this._longDateFormat[key.toUpperCase()]) {                                                  // 879
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {          // 880
                    return val.slice(1);                                                                               // 881
                });                                                                                                    // 882
                this._longDateFormat[key] = output;                                                                    // 883
            }                                                                                                          // 884
            return output;                                                                                             // 885
        },                                                                                                             // 886
                                                                                                                       // 887
        isPM : function (input) {                                                                                      // 888
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays                         // 889
            // Using charAt should be more compatible.                                                                 // 890
            return ((input + '').toLowerCase().charAt(0) === 'p');                                                     // 891
        },                                                                                                             // 892
                                                                                                                       // 893
        _meridiemParse : /[ap]\.?m?\.?/i,                                                                              // 894
        meridiem : function (hours, minutes, isLower) {                                                                // 895
            if (hours > 11) {                                                                                          // 896
                return isLower ? 'pm' : 'PM';                                                                          // 897
            } else {                                                                                                   // 898
                return isLower ? 'am' : 'AM';                                                                          // 899
            }                                                                                                          // 900
        },                                                                                                             // 901
                                                                                                                       // 902
        _calendar : {                                                                                                  // 903
            sameDay : '[Today at] LT',                                                                                 // 904
            nextDay : '[Tomorrow at] LT',                                                                              // 905
            nextWeek : 'dddd [at] LT',                                                                                 // 906
            lastDay : '[Yesterday at] LT',                                                                             // 907
            lastWeek : '[Last] dddd [at] LT',                                                                          // 908
            sameElse : 'L'                                                                                             // 909
        },                                                                                                             // 910
        calendar : function (key, mom) {                                                                               // 911
            var output = this._calendar[key];                                                                          // 912
            return typeof output === 'function' ? output.apply(mom) : output;                                          // 913
        },                                                                                                             // 914
                                                                                                                       // 915
        _relativeTime : {                                                                                              // 916
            future : 'in %s',                                                                                          // 917
            past : '%s ago',                                                                                           // 918
            s : 'a few seconds',                                                                                       // 919
            m : 'a minute',                                                                                            // 920
            mm : '%d minutes',                                                                                         // 921
            h : 'an hour',                                                                                             // 922
            hh : '%d hours',                                                                                           // 923
            d : 'a day',                                                                                               // 924
            dd : '%d days',                                                                                            // 925
            M : 'a month',                                                                                             // 926
            MM : '%d months',                                                                                          // 927
            y : 'a year',                                                                                              // 928
            yy : '%d years'                                                                                            // 929
        },                                                                                                             // 930
                                                                                                                       // 931
        relativeTime : function (number, withoutSuffix, string, isFuture) {                                            // 932
            var output = this._relativeTime[string];                                                                   // 933
            return (typeof output === 'function') ?                                                                    // 934
                output(number, withoutSuffix, string, isFuture) :                                                      // 935
                output.replace(/%d/i, number);                                                                         // 936
        },                                                                                                             // 937
                                                                                                                       // 938
        pastFuture : function (diff, output) {                                                                         // 939
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];                                             // 940
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);                      // 941
        },                                                                                                             // 942
                                                                                                                       // 943
        ordinal : function (number) {                                                                                  // 944
            return this._ordinal.replace('%d', number);                                                                // 945
        },                                                                                                             // 946
        _ordinal : '%d',                                                                                               // 947
                                                                                                                       // 948
        preparse : function (string) {                                                                                 // 949
            return string;                                                                                             // 950
        },                                                                                                             // 951
                                                                                                                       // 952
        postformat : function (string) {                                                                               // 953
            return string;                                                                                             // 954
        },                                                                                                             // 955
                                                                                                                       // 956
        week : function (mom) {                                                                                        // 957
            return weekOfYear(mom, this._week.dow, this._week.doy).week;                                               // 958
        },                                                                                                             // 959
                                                                                                                       // 960
        _week : {                                                                                                      // 961
            dow : 0, // Sunday is the first day of the week.                                                           // 962
            doy : 6  // The week that contains Jan 1st is the first week of the year.                                  // 963
        },                                                                                                             // 964
                                                                                                                       // 965
        _invalidDate: 'Invalid date',                                                                                  // 966
        invalidDate: function () {                                                                                     // 967
            return this._invalidDate;                                                                                  // 968
        }                                                                                                              // 969
    });                                                                                                                // 970
                                                                                                                       // 971
    /************************************                                                                              // 972
        Formatting                                                                                                     // 973
    ************************************/                                                                              // 974
                                                                                                                       // 975
                                                                                                                       // 976
    function removeFormattingTokens(input) {                                                                           // 977
        if (input.match(/\[[\s\S]/)) {                                                                                 // 978
            return input.replace(/^\[|\]$/g, '');                                                                      // 979
        }                                                                                                              // 980
        return input.replace(/\\/g, '');                                                                               // 981
    }                                                                                                                  // 982
                                                                                                                       // 983
    function makeFormatFunction(format) {                                                                              // 984
        var array = format.match(formattingTokens), i, length;                                                         // 985
                                                                                                                       // 986
        for (i = 0, length = array.length; i < length; i++) {                                                          // 987
            if (formatTokenFunctions[array[i]]) {                                                                      // 988
                array[i] = formatTokenFunctions[array[i]];                                                             // 989
            } else {                                                                                                   // 990
                array[i] = removeFormattingTokens(array[i]);                                                           // 991
            }                                                                                                          // 992
        }                                                                                                              // 993
                                                                                                                       // 994
        return function (mom) {                                                                                        // 995
            var output = '';                                                                                           // 996
            for (i = 0; i < length; i++) {                                                                             // 997
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];                        // 998
            }                                                                                                          // 999
            return output;                                                                                             // 1000
        };                                                                                                             // 1001
    }                                                                                                                  // 1002
                                                                                                                       // 1003
    // format date using native date object                                                                            // 1004
    function formatMoment(m, format) {                                                                                 // 1005
        if (!m.isValid()) {                                                                                            // 1006
            return m.localeData().invalidDate();                                                                       // 1007
        }                                                                                                              // 1008
                                                                                                                       // 1009
        format = expandFormat(format, m.localeData());                                                                 // 1010
                                                                                                                       // 1011
        if (!formatFunctions[format]) {                                                                                // 1012
            formatFunctions[format] = makeFormatFunction(format);                                                      // 1013
        }                                                                                                              // 1014
                                                                                                                       // 1015
        return formatFunctions[format](m);                                                                             // 1016
    }                                                                                                                  // 1017
                                                                                                                       // 1018
    function expandFormat(format, locale) {                                                                            // 1019
        var i = 5;                                                                                                     // 1020
                                                                                                                       // 1021
        function replaceLongDateFormatTokens(input) {                                                                  // 1022
            return locale.longDateFormat(input) || input;                                                              // 1023
        }                                                                                                              // 1024
                                                                                                                       // 1025
        localFormattingTokens.lastIndex = 0;                                                                           // 1026
        while (i >= 0 && localFormattingTokens.test(format)) {                                                         // 1027
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);                               // 1028
            localFormattingTokens.lastIndex = 0;                                                                       // 1029
            i -= 1;                                                                                                    // 1030
        }                                                                                                              // 1031
                                                                                                                       // 1032
        return format;                                                                                                 // 1033
    }                                                                                                                  // 1034
                                                                                                                       // 1035
                                                                                                                       // 1036
    /************************************                                                                              // 1037
        Parsing                                                                                                        // 1038
    ************************************/                                                                              // 1039
                                                                                                                       // 1040
                                                                                                                       // 1041
    // get the regex to find the next token                                                                            // 1042
    function getParseRegexForToken(token, config) {                                                                    // 1043
        var a, strict = config._strict;                                                                                // 1044
        switch (token) {                                                                                               // 1045
        case 'Q':                                                                                                      // 1046
            return parseTokenOneDigit;                                                                                 // 1047
        case 'DDDD':                                                                                                   // 1048
            return parseTokenThreeDigits;                                                                              // 1049
        case 'YYYY':                                                                                                   // 1050
        case 'GGGG':                                                                                                   // 1051
        case 'gggg':                                                                                                   // 1052
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;                                          // 1053
        case 'Y':                                                                                                      // 1054
        case 'G':                                                                                                      // 1055
        case 'g':                                                                                                      // 1056
            return parseTokenSignedNumber;                                                                             // 1057
        case 'YYYYYY':                                                                                                 // 1058
        case 'YYYYY':                                                                                                  // 1059
        case 'GGGGG':                                                                                                  // 1060
        case 'ggggg':                                                                                                  // 1061
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;                                            // 1062
        case 'S':                                                                                                      // 1063
            if (strict) {                                                                                              // 1064
                return parseTokenOneDigit;                                                                             // 1065
            }                                                                                                          // 1066
            /* falls through */                                                                                        // 1067
        case 'SS':                                                                                                     // 1068
            if (strict) {                                                                                              // 1069
                return parseTokenTwoDigits;                                                                            // 1070
            }                                                                                                          // 1071
            /* falls through */                                                                                        // 1072
        case 'SSS':                                                                                                    // 1073
            if (strict) {                                                                                              // 1074
                return parseTokenThreeDigits;                                                                          // 1075
            }                                                                                                          // 1076
            /* falls through */                                                                                        // 1077
        case 'DDD':                                                                                                    // 1078
            return parseTokenOneToThreeDigits;                                                                         // 1079
        case 'MMM':                                                                                                    // 1080
        case 'MMMM':                                                                                                   // 1081
        case 'dd':                                                                                                     // 1082
        case 'ddd':                                                                                                    // 1083
        case 'dddd':                                                                                                   // 1084
            return parseTokenWord;                                                                                     // 1085
        case 'a':                                                                                                      // 1086
        case 'A':                                                                                                      // 1087
            return config._locale._meridiemParse;                                                                      // 1088
        case 'X':                                                                                                      // 1089
            return parseTokenTimestampMs;                                                                              // 1090
        case 'Z':                                                                                                      // 1091
        case 'ZZ':                                                                                                     // 1092
            return parseTokenTimezone;                                                                                 // 1093
        case 'T':                                                                                                      // 1094
            return parseTokenT;                                                                                        // 1095
        case 'SSSS':                                                                                                   // 1096
            return parseTokenDigits;                                                                                   // 1097
        case 'MM':                                                                                                     // 1098
        case 'DD':                                                                                                     // 1099
        case 'YY':                                                                                                     // 1100
        case 'GG':                                                                                                     // 1101
        case 'gg':                                                                                                     // 1102
        case 'HH':                                                                                                     // 1103
        case 'hh':                                                                                                     // 1104
        case 'mm':                                                                                                     // 1105
        case 'ss':                                                                                                     // 1106
        case 'ww':                                                                                                     // 1107
        case 'WW':                                                                                                     // 1108
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;                                            // 1109
        case 'M':                                                                                                      // 1110
        case 'D':                                                                                                      // 1111
        case 'd':                                                                                                      // 1112
        case 'H':                                                                                                      // 1113
        case 'h':                                                                                                      // 1114
        case 'm':                                                                                                      // 1115
        case 's':                                                                                                      // 1116
        case 'w':                                                                                                      // 1117
        case 'W':                                                                                                      // 1118
        case 'e':                                                                                                      // 1119
        case 'E':                                                                                                      // 1120
            return parseTokenOneOrTwoDigits;                                                                           // 1121
        case 'Do':                                                                                                     // 1122
            return parseTokenOrdinal;                                                                                  // 1123
        default :                                                                                                      // 1124
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));                                // 1125
            return a;                                                                                                  // 1126
        }                                                                                                              // 1127
    }                                                                                                                  // 1128
                                                                                                                       // 1129
    function timezoneMinutesFromString(string) {                                                                       // 1130
        string = string || '';                                                                                         // 1131
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),                                              // 1132
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],                                           // 1133
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],                                         // 1134
            minutes = +(parts[1] * 60) + toInt(parts[2]);                                                              // 1135
                                                                                                                       // 1136
        return parts[0] === '+' ? -minutes : minutes;                                                                  // 1137
    }                                                                                                                  // 1138
                                                                                                                       // 1139
    // function to convert string input to date                                                                        // 1140
    function addTimeToArrayFromToken(token, input, config) {                                                           // 1141
        var a, datePartArray = config._a;                                                                              // 1142
                                                                                                                       // 1143
        switch (token) {                                                                                               // 1144
        // QUARTER                                                                                                     // 1145
        case 'Q':                                                                                                      // 1146
            if (input != null) {                                                                                       // 1147
                datePartArray[MONTH] = (toInt(input) - 1) * 3;                                                         // 1148
            }                                                                                                          // 1149
            break;                                                                                                     // 1150
        // MONTH                                                                                                       // 1151
        case 'M' : // fall through to MM                                                                               // 1152
        case 'MM' :                                                                                                    // 1153
            if (input != null) {                                                                                       // 1154
                datePartArray[MONTH] = toInt(input) - 1;                                                               // 1155
            }                                                                                                          // 1156
            break;                                                                                                     // 1157
        case 'MMM' : // fall through to MMMM                                                                           // 1158
        case 'MMMM' :                                                                                                  // 1159
            a = config._locale.monthsParse(input);                                                                     // 1160
            // if we didn't find a month name, mark the date as invalid.                                               // 1161
            if (a != null) {                                                                                           // 1162
                datePartArray[MONTH] = a;                                                                              // 1163
            } else {                                                                                                   // 1164
                config._pf.invalidMonth = input;                                                                       // 1165
            }                                                                                                          // 1166
            break;                                                                                                     // 1167
        // DAY OF MONTH                                                                                                // 1168
        case 'D' : // fall through to DD                                                                               // 1169
        case 'DD' :                                                                                                    // 1170
            if (input != null) {                                                                                       // 1171
                datePartArray[DATE] = toInt(input);                                                                    // 1172
            }                                                                                                          // 1173
            break;                                                                                                     // 1174
        case 'Do' :                                                                                                    // 1175
            if (input != null) {                                                                                       // 1176
                datePartArray[DATE] = toInt(parseInt(input, 10));                                                      // 1177
            }                                                                                                          // 1178
            break;                                                                                                     // 1179
        // DAY OF YEAR                                                                                                 // 1180
        case 'DDD' : // fall through to DDDD                                                                           // 1181
        case 'DDDD' :                                                                                                  // 1182
            if (input != null) {                                                                                       // 1183
                config._dayOfYear = toInt(input);                                                                      // 1184
            }                                                                                                          // 1185
                                                                                                                       // 1186
            break;                                                                                                     // 1187
        // YEAR                                                                                                        // 1188
        case 'YY' :                                                                                                    // 1189
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);                                                     // 1190
            break;                                                                                                     // 1191
        case 'YYYY' :                                                                                                  // 1192
        case 'YYYYY' :                                                                                                 // 1193
        case 'YYYYYY' :                                                                                                // 1194
            datePartArray[YEAR] = toInt(input);                                                                        // 1195
            break;                                                                                                     // 1196
        // AM / PM                                                                                                     // 1197
        case 'a' : // fall through to A                                                                                // 1198
        case 'A' :                                                                                                     // 1199
            config._isPm = config._locale.isPM(input);                                                                 // 1200
            break;                                                                                                     // 1201
        // 24 HOUR                                                                                                     // 1202
        case 'H' : // fall through to hh                                                                               // 1203
        case 'HH' : // fall through to hh                                                                              // 1204
        case 'h' : // fall through to hh                                                                               // 1205
        case 'hh' :                                                                                                    // 1206
            datePartArray[HOUR] = toInt(input);                                                                        // 1207
            break;                                                                                                     // 1208
        // MINUTE                                                                                                      // 1209
        case 'm' : // fall through to mm                                                                               // 1210
        case 'mm' :                                                                                                    // 1211
            datePartArray[MINUTE] = toInt(input);                                                                      // 1212
            break;                                                                                                     // 1213
        // SECOND                                                                                                      // 1214
        case 's' : // fall through to ss                                                                               // 1215
        case 'ss' :                                                                                                    // 1216
            datePartArray[SECOND] = toInt(input);                                                                      // 1217
            break;                                                                                                     // 1218
        // MILLISECOND                                                                                                 // 1219
        case 'S' :                                                                                                     // 1220
        case 'SS' :                                                                                                    // 1221
        case 'SSS' :                                                                                                   // 1222
        case 'SSSS' :                                                                                                  // 1223
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);                                                 // 1224
            break;                                                                                                     // 1225
        // UNIX TIMESTAMP WITH MS                                                                                      // 1226
        case 'X':                                                                                                      // 1227
            config._d = new Date(parseFloat(input) * 1000);                                                            // 1228
            break;                                                                                                     // 1229
        // TIMEZONE                                                                                                    // 1230
        case 'Z' : // fall through to ZZ                                                                               // 1231
        case 'ZZ' :                                                                                                    // 1232
            config._useUTC = true;                                                                                     // 1233
            config._tzm = timezoneMinutesFromString(input);                                                            // 1234
            break;                                                                                                     // 1235
        // WEEKDAY - human                                                                                             // 1236
        case 'dd':                                                                                                     // 1237
        case 'ddd':                                                                                                    // 1238
        case 'dddd':                                                                                                   // 1239
            a = config._locale.weekdaysParse(input);                                                                   // 1240
            // if we didn't get a weekday name, mark the date as invalid                                               // 1241
            if (a != null) {                                                                                           // 1242
                config._w = config._w || {};                                                                           // 1243
                config._w['d'] = a;                                                                                    // 1244
            } else {                                                                                                   // 1245
                config._pf.invalidWeekday = input;                                                                     // 1246
            }                                                                                                          // 1247
            break;                                                                                                     // 1248
        // WEEK, WEEK DAY - numeric                                                                                    // 1249
        case 'w':                                                                                                      // 1250
        case 'ww':                                                                                                     // 1251
        case 'W':                                                                                                      // 1252
        case 'WW':                                                                                                     // 1253
        case 'd':                                                                                                      // 1254
        case 'e':                                                                                                      // 1255
        case 'E':                                                                                                      // 1256
            token = token.substr(0, 1);                                                                                // 1257
            /* falls through */                                                                                        // 1258
        case 'gggg':                                                                                                   // 1259
        case 'GGGG':                                                                                                   // 1260
        case 'GGGGG':                                                                                                  // 1261
            token = token.substr(0, 2);                                                                                // 1262
            if (input) {                                                                                               // 1263
                config._w = config._w || {};                                                                           // 1264
                config._w[token] = toInt(input);                                                                       // 1265
            }                                                                                                          // 1266
            break;                                                                                                     // 1267
        case 'gg':                                                                                                     // 1268
        case 'GG':                                                                                                     // 1269
            config._w = config._w || {};                                                                               // 1270
            config._w[token] = moment.parseTwoDigitYear(input);                                                        // 1271
        }                                                                                                              // 1272
    }                                                                                                                  // 1273
                                                                                                                       // 1274
    function dayOfYearFromWeekInfo(config) {                                                                           // 1275
        var w, weekYear, week, weekday, dow, doy, temp;                                                                // 1276
                                                                                                                       // 1277
        w = config._w;                                                                                                 // 1278
        if (w.GG != null || w.W != null || w.E != null) {                                                              // 1279
            dow = 1;                                                                                                   // 1280
            doy = 4;                                                                                                   // 1281
                                                                                                                       // 1282
            // TODO: We need to take the current isoWeekYear, but that depends on                                      // 1283
            // how we interpret now (local, utc, fixed offset). So create                                              // 1284
            // a now version of current config (take local/utc/offset flags, and                                       // 1285
            // create now).                                                                                            // 1286
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);                                    // 1287
            week = dfl(w.W, 1);                                                                                        // 1288
            weekday = dfl(w.E, 1);                                                                                     // 1289
        } else {                                                                                                       // 1290
            dow = config._locale._week.dow;                                                                            // 1291
            doy = config._locale._week.doy;                                                                            // 1292
                                                                                                                       // 1293
            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);                                // 1294
            week = dfl(w.w, 1);                                                                                        // 1295
                                                                                                                       // 1296
            if (w.d != null) {                                                                                         // 1297
                // weekday -- low day numbers are considered next week                                                 // 1298
                weekday = w.d;                                                                                         // 1299
                if (weekday < dow) {                                                                                   // 1300
                    ++week;                                                                                            // 1301
                }                                                                                                      // 1302
            } else if (w.e != null) {                                                                                  // 1303
                // local weekday -- counting starts from begining of week                                              // 1304
                weekday = w.e + dow;                                                                                   // 1305
            } else {                                                                                                   // 1306
                // default to begining of week                                                                         // 1307
                weekday = dow;                                                                                         // 1308
            }                                                                                                          // 1309
        }                                                                                                              // 1310
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);                                                  // 1311
                                                                                                                       // 1312
        config._a[YEAR] = temp.year;                                                                                   // 1313
        config._dayOfYear = temp.dayOfYear;                                                                            // 1314
    }                                                                                                                  // 1315
                                                                                                                       // 1316
    // convert an array to a date.                                                                                     // 1317
    // the array should mirror the parameters below                                                                    // 1318
    // note: all values past the year are optional and will default to the lowest possible value.                      // 1319
    // [year, month, day , hour, minute, second, millisecond]                                                          // 1320
    function dateFromConfig(config) {                                                                                  // 1321
        var i, date, input = [], currentDate, yearToUse;                                                               // 1322
                                                                                                                       // 1323
        if (config._d) {                                                                                               // 1324
            return;                                                                                                    // 1325
        }                                                                                                              // 1326
                                                                                                                       // 1327
        currentDate = currentDateArray(config);                                                                        // 1328
                                                                                                                       // 1329
        //compute day of the year from weeks and weekdays                                                              // 1330
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {                                        // 1331
            dayOfYearFromWeekInfo(config);                                                                             // 1332
        }                                                                                                              // 1333
                                                                                                                       // 1334
        //if the day of the year is set, figure out what it is                                                         // 1335
        if (config._dayOfYear) {                                                                                       // 1336
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);                                                       // 1337
                                                                                                                       // 1338
            if (config._dayOfYear > daysInYear(yearToUse)) {                                                           // 1339
                config._pf._overflowDayOfYear = true;                                                                  // 1340
            }                                                                                                          // 1341
                                                                                                                       // 1342
            date = makeUTCDate(yearToUse, 0, config._dayOfYear);                                                       // 1343
            config._a[MONTH] = date.getUTCMonth();                                                                     // 1344
            config._a[DATE] = date.getUTCDate();                                                                       // 1345
        }                                                                                                              // 1346
                                                                                                                       // 1347
        // Default to current date.                                                                                    // 1348
        // * if no year, month, day of month are given, default to today                                               // 1349
        // * if day of month is given, default month and year                                                          // 1350
        // * if month is given, default only year                                                                      // 1351
        // * if year is given, don't default anything                                                                  // 1352
        for (i = 0; i < 3 && config._a[i] == null; ++i) {                                                              // 1353
            config._a[i] = input[i] = currentDate[i];                                                                  // 1354
        }                                                                                                              // 1355
                                                                                                                       // 1356
        // Zero out whatever was not defaulted, including time                                                         // 1357
        for (; i < 7; i++) {                                                                                           // 1358
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];                       // 1359
        }                                                                                                              // 1360
                                                                                                                       // 1361
        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);                                      // 1362
        // Apply timezone offset from input. The actual zone can be changed                                            // 1363
        // with parseZone.                                                                                             // 1364
        if (config._tzm != null) {                                                                                     // 1365
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);                                          // 1366
        }                                                                                                              // 1367
    }                                                                                                                  // 1368
                                                                                                                       // 1369
    function dateFromObject(config) {                                                                                  // 1370
        var normalizedInput;                                                                                           // 1371
                                                                                                                       // 1372
        if (config._d) {                                                                                               // 1373
            return;                                                                                                    // 1374
        }                                                                                                              // 1375
                                                                                                                       // 1376
        normalizedInput = normalizeObjectUnits(config._i);                                                             // 1377
        config._a = [                                                                                                  // 1378
            normalizedInput.year,                                                                                      // 1379
            normalizedInput.month,                                                                                     // 1380
            normalizedInput.day,                                                                                       // 1381
            normalizedInput.hour,                                                                                      // 1382
            normalizedInput.minute,                                                                                    // 1383
            normalizedInput.second,                                                                                    // 1384
            normalizedInput.millisecond                                                                                // 1385
        ];                                                                                                             // 1386
                                                                                                                       // 1387
        dateFromConfig(config);                                                                                        // 1388
    }                                                                                                                  // 1389
                                                                                                                       // 1390
    function currentDateArray(config) {                                                                                // 1391
        var now = new Date();                                                                                          // 1392
        if (config._useUTC) {                                                                                          // 1393
            return [                                                                                                   // 1394
                now.getUTCFullYear(),                                                                                  // 1395
                now.getUTCMonth(),                                                                                     // 1396
                now.getUTCDate()                                                                                       // 1397
            ];                                                                                                         // 1398
        } else {                                                                                                       // 1399
            return [now.getFullYear(), now.getMonth(), now.getDate()];                                                 // 1400
        }                                                                                                              // 1401
    }                                                                                                                  // 1402
                                                                                                                       // 1403
    // date from string and format string                                                                              // 1404
    function makeDateFromStringAndFormat(config) {                                                                     // 1405
        if (config._f === moment.ISO_8601) {                                                                           // 1406
            parseISO(config);                                                                                          // 1407
            return;                                                                                                    // 1408
        }                                                                                                              // 1409
                                                                                                                       // 1410
        config._a = [];                                                                                                // 1411
        config._pf.empty = true;                                                                                       // 1412
                                                                                                                       // 1413
        // This array is used to make a Date, either with `new Date` or `Date.UTC`                                     // 1414
        var string = '' + config._i,                                                                                   // 1415
            i, parsedInput, tokens, token, skipped,                                                                    // 1416
            stringLength = string.length,                                                                              // 1417
            totalParsedInputLength = 0;                                                                                // 1418
                                                                                                                       // 1419
        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];                                // 1420
                                                                                                                       // 1421
        for (i = 0; i < tokens.length; i++) {                                                                          // 1422
            token = tokens[i];                                                                                         // 1423
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];                               // 1424
            if (parsedInput) {                                                                                         // 1425
                skipped = string.substr(0, string.indexOf(parsedInput));                                               // 1426
                if (skipped.length > 0) {                                                                              // 1427
                    config._pf.unusedInput.push(skipped);                                                              // 1428
                }                                                                                                      // 1429
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);                               // 1430
                totalParsedInputLength += parsedInput.length;                                                          // 1431
            }                                                                                                          // 1432
            // don't parse if it's not a known token                                                                   // 1433
            if (formatTokenFunctions[token]) {                                                                         // 1434
                if (parsedInput) {                                                                                     // 1435
                    config._pf.empty = false;                                                                          // 1436
                }                                                                                                      // 1437
                else {                                                                                                 // 1438
                    config._pf.unusedTokens.push(token);                                                               // 1439
                }                                                                                                      // 1440
                addTimeToArrayFromToken(token, parsedInput, config);                                                   // 1441
            }                                                                                                          // 1442
            else if (config._strict && !parsedInput) {                                                                 // 1443
                config._pf.unusedTokens.push(token);                                                                   // 1444
            }                                                                                                          // 1445
        }                                                                                                              // 1446
                                                                                                                       // 1447
        // add remaining unparsed input length to the string                                                           // 1448
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;                                              // 1449
        if (string.length > 0) {                                                                                       // 1450
            config._pf.unusedInput.push(string);                                                                       // 1451
        }                                                                                                              // 1452
                                                                                                                       // 1453
        // handle am pm                                                                                                // 1454
        if (config._isPm && config._a[HOUR] < 12) {                                                                    // 1455
            config._a[HOUR] += 12;                                                                                     // 1456
        }                                                                                                              // 1457
        // if is 12 am, change hours to 0                                                                              // 1458
        if (config._isPm === false && config._a[HOUR] === 12) {                                                        // 1459
            config._a[HOUR] = 0;                                                                                       // 1460
        }                                                                                                              // 1461
                                                                                                                       // 1462
        dateFromConfig(config);                                                                                        // 1463
        checkOverflow(config);                                                                                         // 1464
    }                                                                                                                  // 1465
                                                                                                                       // 1466
    function unescapeFormat(s) {                                                                                       // 1467
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {                   // 1468
            return p1 || p2 || p3 || p4;                                                                               // 1469
        });                                                                                                            // 1470
    }                                                                                                                  // 1471
                                                                                                                       // 1472
    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript            // 1473
    function regexpEscape(s) {                                                                                         // 1474
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');                                                            // 1475
    }                                                                                                                  // 1476
                                                                                                                       // 1477
    // date from string and array of format strings                                                                    // 1478
    function makeDateFromStringAndArray(config) {                                                                      // 1479
        var tempConfig,                                                                                                // 1480
            bestMoment,                                                                                                // 1481
                                                                                                                       // 1482
            scoreToBeat,                                                                                               // 1483
            i,                                                                                                         // 1484
            currentScore;                                                                                              // 1485
                                                                                                                       // 1486
        if (config._f.length === 0) {                                                                                  // 1487
            config._pf.invalidFormat = true;                                                                           // 1488
            config._d = new Date(NaN);                                                                                 // 1489
            return;                                                                                                    // 1490
        }                                                                                                              // 1491
                                                                                                                       // 1492
        for (i = 0; i < config._f.length; i++) {                                                                       // 1493
            currentScore = 0;                                                                                          // 1494
            tempConfig = copyConfig({}, config);                                                                       // 1495
            if (config._useUTC != null) {                                                                              // 1496
                tempConfig._useUTC = config._useUTC;                                                                   // 1497
            }                                                                                                          // 1498
            tempConfig._pf = defaultParsingFlags();                                                                    // 1499
            tempConfig._f = config._f[i];                                                                              // 1500
            makeDateFromStringAndFormat(tempConfig);                                                                   // 1501
                                                                                                                       // 1502
            if (!isValid(tempConfig)) {                                                                                // 1503
                continue;                                                                                              // 1504
            }                                                                                                          // 1505
                                                                                                                       // 1506
            // if there is any input that was not parsed add a penalty for that format                                 // 1507
            currentScore += tempConfig._pf.charsLeftOver;                                                              // 1508
                                                                                                                       // 1509
            //or tokens                                                                                                // 1510
            currentScore += tempConfig._pf.unusedTokens.length * 10;                                                   // 1511
                                                                                                                       // 1512
            tempConfig._pf.score = currentScore;                                                                       // 1513
                                                                                                                       // 1514
            if (scoreToBeat == null || currentScore < scoreToBeat) {                                                   // 1515
                scoreToBeat = currentScore;                                                                            // 1516
                bestMoment = tempConfig;                                                                               // 1517
            }                                                                                                          // 1518
        }                                                                                                              // 1519
                                                                                                                       // 1520
        extend(config, bestMoment || tempConfig);                                                                      // 1521
    }                                                                                                                  // 1522
                                                                                                                       // 1523
    // date from iso format                                                                                            // 1524
    function parseISO(config) {                                                                                        // 1525
        var i, l,                                                                                                      // 1526
            string = config._i,                                                                                        // 1527
            match = isoRegex.exec(string);                                                                             // 1528
                                                                                                                       // 1529
        if (match) {                                                                                                   // 1530
            config._pf.iso = true;                                                                                     // 1531
            for (i = 0, l = isoDates.length; i < l; i++) {                                                             // 1532
                if (isoDates[i][1].exec(string)) {                                                                     // 1533
                    // match[5] should be 'T' or undefined                                                             // 1534
                    config._f = isoDates[i][0] + (match[6] || ' ');                                                    // 1535
                    break;                                                                                             // 1536
                }                                                                                                      // 1537
            }                                                                                                          // 1538
            for (i = 0, l = isoTimes.length; i < l; i++) {                                                             // 1539
                if (isoTimes[i][1].exec(string)) {                                                                     // 1540
                    config._f += isoTimes[i][0];                                                                       // 1541
                    break;                                                                                             // 1542
                }                                                                                                      // 1543
            }                                                                                                          // 1544
            if (string.match(parseTokenTimezone)) {                                                                    // 1545
                config._f += 'Z';                                                                                      // 1546
            }                                                                                                          // 1547
            makeDateFromStringAndFormat(config);                                                                       // 1548
        } else {                                                                                                       // 1549
            config._isValid = false;                                                                                   // 1550
        }                                                                                                              // 1551
    }                                                                                                                  // 1552
                                                                                                                       // 1553
    // date from iso format or fallback                                                                                // 1554
    function makeDateFromString(config) {                                                                              // 1555
        parseISO(config);                                                                                              // 1556
        if (config._isValid === false) {                                                                               // 1557
            delete config._isValid;                                                                                    // 1558
            moment.createFromInputFallback(config);                                                                    // 1559
        }                                                                                                              // 1560
    }                                                                                                                  // 1561
                                                                                                                       // 1562
    function map(arr, fn) {                                                                                            // 1563
        var res = [], i;                                                                                               // 1564
        for (i = 0; i < arr.length; ++i) {                                                                             // 1565
            res.push(fn(arr[i], i));                                                                                   // 1566
        }                                                                                                              // 1567
        return res;                                                                                                    // 1568
    }                                                                                                                  // 1569
                                                                                                                       // 1570
    function makeDateFromInput(config) {                                                                               // 1571
        var input = config._i, matched;                                                                                // 1572
        if (input === undefined) {                                                                                     // 1573
            config._d = new Date();                                                                                    // 1574
        } else if (isDate(input)) {                                                                                    // 1575
            config._d = new Date(+input);                                                                              // 1576
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {                                                 // 1577
            config._d = new Date(+matched[1]);                                                                         // 1578
        } else if (typeof input === 'string') {                                                                        // 1579
            makeDateFromString(config);                                                                                // 1580
        } else if (isArray(input)) {                                                                                   // 1581
            config._a = map(input.slice(0), function (obj) {                                                           // 1582
                return parseInt(obj, 10);                                                                              // 1583
            });                                                                                                        // 1584
            dateFromConfig(config);                                                                                    // 1585
        } else if (typeof(input) === 'object') {                                                                       // 1586
            dateFromObject(config);                                                                                    // 1587
        } else if (typeof(input) === 'number') {                                                                       // 1588
            // from milliseconds                                                                                       // 1589
            config._d = new Date(input);                                                                               // 1590
        } else {                                                                                                       // 1591
            moment.createFromInputFallback(config);                                                                    // 1592
        }                                                                                                              // 1593
    }                                                                                                                  // 1594
                                                                                                                       // 1595
    function makeDate(y, m, d, h, M, s, ms) {                                                                          // 1596
        //can't just apply() to create a date:                                                                         // 1597
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);                                                                     // 1599
                                                                                                                       // 1600
        //the date constructor doesn't accept years < 1970                                                             // 1601
        if (y < 1970) {                                                                                                // 1602
            date.setFullYear(y);                                                                                       // 1603
        }                                                                                                              // 1604
        return date;                                                                                                   // 1605
    }                                                                                                                  // 1606
                                                                                                                       // 1607
    function makeUTCDate(y) {                                                                                          // 1608
        var date = new Date(Date.UTC.apply(null, arguments));                                                          // 1609
        if (y < 1970) {                                                                                                // 1610
            date.setUTCFullYear(y);                                                                                    // 1611
        }                                                                                                              // 1612
        return date;                                                                                                   // 1613
    }                                                                                                                  // 1614
                                                                                                                       // 1615
    function parseWeekday(input, locale) {                                                                             // 1616
        if (typeof input === 'string') {                                                                               // 1617
            if (!isNaN(input)) {                                                                                       // 1618
                input = parseInt(input, 10);                                                                           // 1619
            }                                                                                                          // 1620
            else {                                                                                                     // 1621
                input = locale.weekdaysParse(input);                                                                   // 1622
                if (typeof input !== 'number') {                                                                       // 1623
                    return null;                                                                                       // 1624
                }                                                                                                      // 1625
            }                                                                                                          // 1626
        }                                                                                                              // 1627
        return input;                                                                                                  // 1628
    }                                                                                                                  // 1629
                                                                                                                       // 1630
    /************************************                                                                              // 1631
        Relative Time                                                                                                  // 1632
    ************************************/                                                                              // 1633
                                                                                                                       // 1634
                                                                                                                       // 1635
    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize                          // 1636
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {                                      // 1637
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);                                    // 1638
    }                                                                                                                  // 1639
                                                                                                                       // 1640
    function relativeTime(posNegDuration, withoutSuffix, locale) {                                                     // 1641
        var duration = moment.duration(posNegDuration).abs(),                                                          // 1642
            seconds = round(duration.as('s')),                                                                         // 1643
            minutes = round(duration.as('m')),                                                                         // 1644
            hours = round(duration.as('h')),                                                                           // 1645
            days = round(duration.as('d')),                                                                            // 1646
            months = round(duration.as('M')),                                                                          // 1647
            years = round(duration.as('y')),                                                                           // 1648
                                                                                                                       // 1649
            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||                                             // 1650
                minutes === 1 && ['m'] ||                                                                              // 1651
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||                                               // 1652
                hours === 1 && ['h'] ||                                                                                // 1653
                hours < relativeTimeThresholds.h && ['hh', hours] ||                                                   // 1654
                days === 1 && ['d'] ||                                                                                 // 1655
                days < relativeTimeThresholds.d && ['dd', days] ||                                                     // 1656
                months === 1 && ['M'] ||                                                                               // 1657
                months < relativeTimeThresholds.M && ['MM', months] ||                                                 // 1658
                years === 1 && ['y'] || ['yy', years];                                                                 // 1659
                                                                                                                       // 1660
        args[2] = withoutSuffix;                                                                                       // 1661
        args[3] = +posNegDuration > 0;                                                                                 // 1662
        args[4] = locale;                                                                                              // 1663
        return substituteTimeAgo.apply({}, args);                                                                      // 1664
    }                                                                                                                  // 1665
                                                                                                                       // 1666
                                                                                                                       // 1667
    /************************************                                                                              // 1668
        Week of Year                                                                                                   // 1669
    ************************************/                                                                              // 1670
                                                                                                                       // 1671
                                                                                                                       // 1672
    // firstDayOfWeek       0 = sun, 6 = sat                                                                           // 1673
    //                      the day of the week that starts the week                                                   // 1674
    //                      (usually sunday or monday)                                                                 // 1675
    // firstDayOfWeekOfYear 0 = sun, 6 = sat                                                                           // 1676
    //                      the first week is the week that contains the first                                         // 1677
    //                      of this day of the week                                                                    // 1678
    //                      (eg. ISO weeks use thursday (4))                                                           // 1679
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {                                                   // 1680
        var end = firstDayOfWeekOfYear - firstDayOfWeek,                                                               // 1681
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),                                                        // 1682
            adjustedMoment;                                                                                            // 1683
                                                                                                                       // 1684
                                                                                                                       // 1685
        if (daysToDayOfWeek > end) {                                                                                   // 1686
            daysToDayOfWeek -= 7;                                                                                      // 1687
        }                                                                                                              // 1688
                                                                                                                       // 1689
        if (daysToDayOfWeek < end - 7) {                                                                               // 1690
            daysToDayOfWeek += 7;                                                                                      // 1691
        }                                                                                                              // 1692
                                                                                                                       // 1693
        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');                                                        // 1694
        return {                                                                                                       // 1695
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),                                                           // 1696
            year: adjustedMoment.year()                                                                                // 1697
        };                                                                                                             // 1698
    }                                                                                                                  // 1699
                                                                                                                       // 1700
    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday          // 1701
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {                           // 1702
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;                                             // 1703
                                                                                                                       // 1704
        d = d === 0 ? 7 : d;                                                                                           // 1705
        weekday = weekday != null ? weekday : firstDayOfWeek;                                                          // 1706
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);            // 1707
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;                                       // 1708
                                                                                                                       // 1709
        return {                                                                                                       // 1710
            year: dayOfYear > 0 ? year : year - 1,                                                                     // 1711
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear                                   // 1712
        };                                                                                                             // 1713
    }                                                                                                                  // 1714
                                                                                                                       // 1715
    /************************************                                                                              // 1716
        Top Level Functions                                                                                            // 1717
    ************************************/                                                                              // 1718
                                                                                                                       // 1719
    function makeMoment(config) {                                                                                      // 1720
        var input = config._i,                                                                                         // 1721
            format = config._f;                                                                                        // 1722
                                                                                                                       // 1723
        config._locale = config._locale || moment.localeData(config._l);                                               // 1724
                                                                                                                       // 1725
        if (input === null || (format === undefined && input === '')) {                                                // 1726
            return moment.invalid({nullInput: true});                                                                  // 1727
        }                                                                                                              // 1728
                                                                                                                       // 1729
        if (typeof input === 'string') {                                                                               // 1730
            config._i = input = config._locale.preparse(input);                                                        // 1731
        }                                                                                                              // 1732
                                                                                                                       // 1733
        if (moment.isMoment(input)) {                                                                                  // 1734
            return new Moment(input, true);                                                                            // 1735
        } else if (format) {                                                                                           // 1736
            if (isArray(format)) {                                                                                     // 1737
                makeDateFromStringAndArray(config);                                                                    // 1738
            } else {                                                                                                   // 1739
                makeDateFromStringAndFormat(config);                                                                   // 1740
            }                                                                                                          // 1741
        } else {                                                                                                       // 1742
            makeDateFromInput(config);                                                                                 // 1743
        }                                                                                                              // 1744
                                                                                                                       // 1745
        return new Moment(config);                                                                                     // 1746
    }                                                                                                                  // 1747
                                                                                                                       // 1748
    moment = function (input, format, locale, strict) {                                                                // 1749
        var c;                                                                                                         // 1750
                                                                                                                       // 1751
        if (typeof(locale) === 'boolean') {                                                                            // 1752
            strict = locale;                                                                                           // 1753
            locale = undefined;                                                                                        // 1754
        }                                                                                                              // 1755
        // object construction must be done this way.                                                                  // 1756
        // https://github.com/moment/moment/issues/1423                                                                // 1757
        c = {};                                                                                                        // 1758
        c._isAMomentObject = true;                                                                                     // 1759
        c._i = input;                                                                                                  // 1760
        c._f = format;                                                                                                 // 1761
        c._l = locale;                                                                                                 // 1762
        c._strict = strict;                                                                                            // 1763
        c._isUTC = false;                                                                                              // 1764
        c._pf = defaultParsingFlags();                                                                                 // 1765
                                                                                                                       // 1766
        return makeMoment(c);                                                                                          // 1767
    };                                                                                                                 // 1768
                                                                                                                       // 1769
    moment.suppressDeprecationWarnings = false;                                                                        // 1770
                                                                                                                       // 1771
    moment.createFromInputFallback = deprecate(                                                                        // 1772
        'moment construction falls back to js Date. This is ' +                                                        // 1773
        'discouraged and will be removed in upcoming major ' +                                                         // 1774
        'release. Please refer to ' +                                                                                  // 1775
        'https://github.com/moment/moment/issues/1407 for more info.',                                                 // 1776
        function (config) {                                                                                            // 1777
            config._d = new Date(config._i);                                                                           // 1778
        }                                                                                                              // 1779
    );                                                                                                                 // 1780
                                                                                                                       // 1781
    // Pick a moment m from moments so that m[fn](other) is true for all                                               // 1782
    // other. This relies on the function fn to be transitive.                                                         // 1783
    //                                                                                                                 // 1784
    // moments should either be an array of moment objects or an array, whose                                          // 1785
    // first element is an array of moment objects.                                                                    // 1786
    function pickBy(fn, moments) {                                                                                     // 1787
        var res, i;                                                                                                    // 1788
        if (moments.length === 1 && isArray(moments[0])) {                                                             // 1789
            moments = moments[0];                                                                                      // 1790
        }                                                                                                              // 1791
        if (!moments.length) {                                                                                         // 1792
            return moment();                                                                                           // 1793
        }                                                                                                              // 1794
        res = moments[0];                                                                                              // 1795
        for (i = 1; i < moments.length; ++i) {                                                                         // 1796
            if (moments[i][fn](res)) {                                                                                 // 1797
                res = moments[i];                                                                                      // 1798
            }                                                                                                          // 1799
        }                                                                                                              // 1800
        return res;                                                                                                    // 1801
    }                                                                                                                  // 1802
                                                                                                                       // 1803
    moment.min = function () {                                                                                         // 1804
        var args = [].slice.call(arguments, 0);                                                                        // 1805
                                                                                                                       // 1806
        return pickBy('isBefore', args);                                                                               // 1807
    };                                                                                                                 // 1808
                                                                                                                       // 1809
    moment.max = function () {                                                                                         // 1810
        var args = [].slice.call(arguments, 0);                                                                        // 1811
                                                                                                                       // 1812
        return pickBy('isAfter', args);                                                                                // 1813
    };                                                                                                                 // 1814
                                                                                                                       // 1815
    // creating with utc                                                                                               // 1816
    moment.utc = function (input, format, locale, strict) {                                                            // 1817
        var c;                                                                                                         // 1818
                                                                                                                       // 1819
        if (typeof(locale) === 'boolean') {                                                                            // 1820
            strict = locale;                                                                                           // 1821
            locale = undefined;                                                                                        // 1822
        }                                                                                                              // 1823
        // object construction must be done this way.                                                                  // 1824
        // https://github.com/moment/moment/issues/1423                                                                // 1825
        c = {};                                                                                                        // 1826
        c._isAMomentObject = true;                                                                                     // 1827
        c._useUTC = true;                                                                                              // 1828
        c._isUTC = true;                                                                                               // 1829
        c._l = locale;                                                                                                 // 1830
        c._i = input;                                                                                                  // 1831
        c._f = format;                                                                                                 // 1832
        c._strict = strict;                                                                                            // 1833
        c._pf = defaultParsingFlags();                                                                                 // 1834
                                                                                                                       // 1835
        return makeMoment(c).utc();                                                                                    // 1836
    };                                                                                                                 // 1837
                                                                                                                       // 1838
    // creating with unix timestamp (in seconds)                                                                       // 1839
    moment.unix = function (input) {                                                                                   // 1840
        return moment(input * 1000);                                                                                   // 1841
    };                                                                                                                 // 1842
                                                                                                                       // 1843
    // duration                                                                                                        // 1844
    moment.duration = function (input, key) {                                                                          // 1845
        var duration = input,                                                                                          // 1846
            // matching against regexp is expensive, do it on demand                                                   // 1847
            match = null,                                                                                              // 1848
            sign,                                                                                                      // 1849
            ret,                                                                                                       // 1850
            parseIso,                                                                                                  // 1851
            diffRes;                                                                                                   // 1852
                                                                                                                       // 1853
        if (moment.isDuration(input)) {                                                                                // 1854
            duration = {                                                                                               // 1855
                ms: input._milliseconds,                                                                               // 1856
                d: input._days,                                                                                        // 1857
                M: input._months                                                                                       // 1858
            };                                                                                                         // 1859
        } else if (typeof input === 'number') {                                                                        // 1860
            duration = {};                                                                                             // 1861
            if (key) {                                                                                                 // 1862
                duration[key] = input;                                                                                 // 1863
            } else {                                                                                                   // 1864
                duration.milliseconds = input;                                                                         // 1865
            }                                                                                                          // 1866
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {                                                  // 1867
            sign = (match[1] === '-') ? -1 : 1;                                                                        // 1868
            duration = {                                                                                               // 1869
                y: 0,                                                                                                  // 1870
                d: toInt(match[DATE]) * sign,                                                                          // 1871
                h: toInt(match[HOUR]) * sign,                                                                          // 1872
                m: toInt(match[MINUTE]) * sign,                                                                        // 1873
                s: toInt(match[SECOND]) * sign,                                                                        // 1874
                ms: toInt(match[MILLISECOND]) * sign                                                                   // 1875
            };                                                                                                         // 1876
        } else if (!!(match = isoDurationRegex.exec(input))) {                                                         // 1877
            sign = (match[1] === '-') ? -1 : 1;                                                                        // 1878
            parseIso = function (inp) {                                                                                // 1879
                // We'd normally use ~~inp for this, but unfortunately it also                                         // 1880
                // converts floats to ints.                                                                            // 1881
                // inp may be undefined, so careful calling replace on it.                                             // 1882
                var res = inp && parseFloat(inp.replace(',', '.'));                                                    // 1883
                // apply sign while we're at it                                                                        // 1884
                return (isNaN(res) ? 0 : res) * sign;                                                                  // 1885
            };                                                                                                         // 1886
            duration = {                                                                                               // 1887
                y: parseIso(match[2]),                                                                                 // 1888
                M: parseIso(match[3]),                                                                                 // 1889
                d: parseIso(match[4]),                                                                                 // 1890
                h: parseIso(match[5]),                                                                                 // 1891
                m: parseIso(match[6]),                                                                                 // 1892
                s: parseIso(match[7]),                                                                                 // 1893
                w: parseIso(match[8])                                                                                  // 1894
            };                                                                                                         // 1895
        } else if (typeof duration === 'object' &&                                                                     // 1896
                ('from' in duration || 'to' in duration)) {                                                            // 1897
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));                                   // 1898
                                                                                                                       // 1899
            duration = {};                                                                                             // 1900
            duration.ms = diffRes.milliseconds;                                                                        // 1901
            duration.M = diffRes.months;                                                                               // 1902
        }                                                                                                              // 1903
                                                                                                                       // 1904
        ret = new Duration(duration);                                                                                  // 1905
                                                                                                                       // 1906
        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {                                                // 1907
            ret._locale = input._locale;                                                                               // 1908
        }                                                                                                              // 1909
                                                                                                                       // 1910
        return ret;                                                                                                    // 1911
    };                                                                                                                 // 1912
                                                                                                                       // 1913
    // version number                                                                                                  // 1914
    moment.version = VERSION;                                                                                          // 1915
                                                                                                                       // 1916
    // default format                                                                                                  // 1917
    moment.defaultFormat = isoFormat;                                                                                  // 1918
                                                                                                                       // 1919
    // constant that refers to the ISO standard                                                                        // 1920
    moment.ISO_8601 = function () {};                                                                                  // 1921
                                                                                                                       // 1922
    // Plugins that add properties should also add the key here (null value),                                          // 1923
    // so we can properly clone ourselves.                                                                             // 1924
    moment.momentProperties = momentProperties;                                                                        // 1925
                                                                                                                       // 1926
    // This function will be called whenever a moment is mutated.                                                      // 1927
    // It is intended to keep the offset in sync with the timezone.                                                    // 1928
    moment.updateOffset = function () {};                                                                              // 1929
                                                                                                                       // 1930
    // This function allows you to set a threshold for relative time strings                                           // 1931
    moment.relativeTimeThreshold = function (threshold, limit) {                                                       // 1932
        if (relativeTimeThresholds[threshold] === undefined) {                                                         // 1933
            return false;                                                                                              // 1934
        }                                                                                                              // 1935
        if (limit === undefined) {                                                                                     // 1936
            return relativeTimeThresholds[threshold];                                                                  // 1937
        }                                                                                                              // 1938
        relativeTimeThresholds[threshold] = limit;                                                                     // 1939
        return true;                                                                                                   // 1940
    };                                                                                                                 // 1941
                                                                                                                       // 1942
    moment.lang = deprecate(                                                                                           // 1943
        'moment.lang is deprecated. Use moment.locale instead.',                                                       // 1944
        function (key, value) {                                                                                        // 1945
            return moment.locale(key, value);                                                                          // 1946
        }                                                                                                              // 1947
    );                                                                                                                 // 1948
                                                                                                                       // 1949
    // This function will load locale and then set the global locale.  If                                              // 1950
    // no arguments are passed in, it will simply return the current global                                            // 1951
    // locale key.                                                                                                     // 1952
    moment.locale = function (key, values) {                                                                           // 1953
        var data;                                                                                                      // 1954
        if (key) {                                                                                                     // 1955
            if (typeof(values) !== 'undefined') {                                                                      // 1956
                data = moment.defineLocale(key, values);                                                               // 1957
            }                                                                                                          // 1958
            else {                                                                                                     // 1959
                data = moment.localeData(key);                                                                         // 1960
            }                                                                                                          // 1961
                                                                                                                       // 1962
            if (data) {                                                                                                // 1963
                moment.duration._locale = moment._locale = data;                                                       // 1964
            }                                                                                                          // 1965
        }                                                                                                              // 1966
                                                                                                                       // 1967
        return moment._locale._abbr;                                                                                   // 1968
    };                                                                                                                 // 1969
                                                                                                                       // 1970
    moment.defineLocale = function (name, values) {                                                                    // 1971
        if (values !== null) {                                                                                         // 1972
            values.abbr = name;                                                                                        // 1973
            if (!locales[name]) {                                                                                      // 1974
                locales[name] = new Locale();                                                                          // 1975
            }                                                                                                          // 1976
            locales[name].set(values);                                                                                 // 1977
                                                                                                                       // 1978
            // backwards compat for now: also set the locale                                                           // 1979
            moment.locale(name);                                                                                       // 1980
                                                                                                                       // 1981
            return locales[name];                                                                                      // 1982
        } else {                                                                                                       // 1983
            // useful for testing                                                                                      // 1984
            delete locales[name];                                                                                      // 1985
            return null;                                                                                               // 1986
        }                                                                                                              // 1987
    };                                                                                                                 // 1988
                                                                                                                       // 1989
    moment.langData = deprecate(                                                                                       // 1990
        'moment.langData is deprecated. Use moment.localeData instead.',                                               // 1991
        function (key) {                                                                                               // 1992
            return moment.localeData(key);                                                                             // 1993
        }                                                                                                              // 1994
    );                                                                                                                 // 1995
                                                                                                                       // 1996
    // returns locale data                                                                                             // 1997
    moment.localeData = function (key) {                                                                               // 1998
        var locale;                                                                                                    // 1999
                                                                                                                       // 2000
        if (key && key._locale && key._locale._abbr) {                                                                 // 2001
            key = key._locale._abbr;                                                                                   // 2002
        }                                                                                                              // 2003
                                                                                                                       // 2004
        if (!key) {                                                                                                    // 2005
            return moment._locale;                                                                                     // 2006
        }                                                                                                              // 2007
                                                                                                                       // 2008
        if (!isArray(key)) {                                                                                           // 2009
            //short-circuit everything else                                                                            // 2010
            locale = loadLocale(key);                                                                                  // 2011
            if (locale) {                                                                                              // 2012
                return locale;                                                                                         // 2013
            }                                                                                                          // 2014
            key = [key];                                                                                               // 2015
        }                                                                                                              // 2016
                                                                                                                       // 2017
        return chooseLocale(key);                                                                                      // 2018
    };                                                                                                                 // 2019
                                                                                                                       // 2020
    // compare moment object                                                                                           // 2021
    moment.isMoment = function (obj) {                                                                                 // 2022
        return obj instanceof Moment ||                                                                                // 2023
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));                                                      // 2024
    };                                                                                                                 // 2025
                                                                                                                       // 2026
    // for typechecking Duration objects                                                                               // 2027
    moment.isDuration = function (obj) {                                                                               // 2028
        return obj instanceof Duration;                                                                                // 2029
    };                                                                                                                 // 2030
                                                                                                                       // 2031
    for (i = lists.length - 1; i >= 0; --i) {                                                                          // 2032
        makeList(lists[i]);                                                                                            // 2033
    }                                                                                                                  // 2034
                                                                                                                       // 2035
    moment.normalizeUnits = function (units) {                                                                         // 2036
        return normalizeUnits(units);                                                                                  // 2037
    };                                                                                                                 // 2038
                                                                                                                       // 2039
    moment.invalid = function (flags) {                                                                                // 2040
        var m = moment.utc(NaN);                                                                                       // 2041
        if (flags != null) {                                                                                           // 2042
            extend(m._pf, flags);                                                                                      // 2043
        }                                                                                                              // 2044
        else {                                                                                                         // 2045
            m._pf.userInvalidated = true;                                                                              // 2046
        }                                                                                                              // 2047
                                                                                                                       // 2048
        return m;                                                                                                      // 2049
    };                                                                                                                 // 2050
                                                                                                                       // 2051
    moment.parseZone = function () {                                                                                   // 2052
        return moment.apply(null, arguments).parseZone();                                                              // 2053
    };                                                                                                                 // 2054
                                                                                                                       // 2055
    moment.parseTwoDigitYear = function (input) {                                                                      // 2056
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);                                                       // 2057
    };                                                                                                                 // 2058
                                                                                                                       // 2059
    /************************************                                                                              // 2060
        Moment Prototype                                                                                               // 2061
    ************************************/                                                                              // 2062
                                                                                                                       // 2063
                                                                                                                       // 2064
    extend(moment.fn = Moment.prototype, {                                                                             // 2065
                                                                                                                       // 2066
        clone : function () {                                                                                          // 2067
            return moment(this);                                                                                       // 2068
        },                                                                                                             // 2069
                                                                                                                       // 2070
        valueOf : function () {                                                                                        // 2071
            return +this._d + ((this._offset || 0) * 60000);                                                           // 2072
        },                                                                                                             // 2073
                                                                                                                       // 2074
        unix : function () {                                                                                           // 2075
            return Math.floor(+this / 1000);                                                                           // 2076
        },                                                                                                             // 2077
                                                                                                                       // 2078
        toString : function () {                                                                                       // 2079
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');                               // 2080
        },                                                                                                             // 2081
                                                                                                                       // 2082
        toDate : function () {                                                                                         // 2083
            return this._offset ? new Date(+this) : this._d;                                                           // 2084
        },                                                                                                             // 2085
                                                                                                                       // 2086
        toISOString : function () {                                                                                    // 2087
            var m = moment(this).utc();                                                                                // 2088
            if (0 < m.year() && m.year() <= 9999) {                                                                    // 2089
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');                                                // 2090
            } else {                                                                                                   // 2091
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');                                              // 2092
            }                                                                                                          // 2093
        },                                                                                                             // 2094
                                                                                                                       // 2095
        toArray : function () {                                                                                        // 2096
            var m = this;                                                                                              // 2097
            return [                                                                                                   // 2098
                m.year(),                                                                                              // 2099
                m.month(),                                                                                             // 2100
                m.date(),                                                                                              // 2101
                m.hours(),                                                                                             // 2102
                m.minutes(),                                                                                           // 2103
                m.seconds(),                                                                                           // 2104
                m.milliseconds()                                                                                       // 2105
            ];                                                                                                         // 2106
        },                                                                                                             // 2107
                                                                                                                       // 2108
        isValid : function () {                                                                                        // 2109
            return isValid(this);                                                                                      // 2110
        },                                                                                                             // 2111
                                                                                                                       // 2112
        isDSTShifted : function () {                                                                                   // 2113
            if (this._a) {                                                                                             // 2114
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }                                                                                                          // 2116
                                                                                                                       // 2117
            return false;                                                                                              // 2118
        },                                                                                                             // 2119
                                                                                                                       // 2120
        parsingFlags : function () {                                                                                   // 2121
            return extend({}, this._pf);                                                                               // 2122
        },                                                                                                             // 2123
                                                                                                                       // 2124
        invalidAt: function () {                                                                                       // 2125
            return this._pf.overflow;                                                                                  // 2126
        },                                                                                                             // 2127
                                                                                                                       // 2128
        utc : function (keepLocalTime) {                                                                               // 2129
            return this.zone(0, keepLocalTime);                                                                        // 2130
        },                                                                                                             // 2131
                                                                                                                       // 2132
        local : function (keepLocalTime) {                                                                             // 2133
            if (this._isUTC) {                                                                                         // 2134
                this.zone(0, keepLocalTime);                                                                           // 2135
                this._isUTC = false;                                                                                   // 2136
                                                                                                                       // 2137
                if (keepLocalTime) {                                                                                   // 2138
                    this.add(this._dateTzOffset(), 'm');                                                               // 2139
                }                                                                                                      // 2140
            }                                                                                                          // 2141
            return this;                                                                                               // 2142
        },                                                                                                             // 2143
                                                                                                                       // 2144
        format : function (inputString) {                                                                              // 2145
            var output = formatMoment(this, inputString || moment.defaultFormat);                                      // 2146
            return this.localeData().postformat(output);                                                               // 2147
        },                                                                                                             // 2148
                                                                                                                       // 2149
        add : createAdder(1, 'add'),                                                                                   // 2150
                                                                                                                       // 2151
        subtract : createAdder(-1, 'subtract'),                                                                        // 2152
                                                                                                                       // 2153
        diff : function (input, units, asFloat) {                                                                      // 2154
            var that = makeAs(input, this),                                                                            // 2155
                zoneDiff = (this.zone() - that.zone()) * 6e4,                                                          // 2156
                diff, output, daysAdjust;                                                                              // 2157
                                                                                                                       // 2158
            units = normalizeUnits(units);                                                                             // 2159
                                                                                                                       // 2160
            if (units === 'year' || units === 'month') {                                                               // 2161
                // average number of days in the months in the given dates                                             // 2162
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2                   // 2163
                // difference in months                                                                                // 2164
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());                           // 2165
                // adjust by taking difference in days, average number of days                                         // 2166
                // and dst in the given months.                                                                        // 2167
                daysAdjust = (this - moment(this).startOf('month')) -                                                  // 2168
                    (that - moment(that).startOf('month'));                                                            // 2169
                // same as above but with zones, to negate all dst                                                     // 2170
                daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -                                  // 2171
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4;                                   // 2172
                output += daysAdjust / diff;                                                                           // 2173
                if (units === 'year') {                                                                                // 2174
                    output = output / 12;                                                                              // 2175
                }                                                                                                      // 2176
            } else {                                                                                                   // 2177
                diff = (this - that);                                                                                  // 2178
                output = units === 'second' ? diff / 1e3 : // 1000                                                     // 2179
                    units === 'minute' ? diff / 6e4 : // 1000 * 60                                                     // 2180
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60                                                 // 2181
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst                   // 2182
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst             // 2183
                    diff;                                                                                              // 2184
            }                                                                                                          // 2185
            return asFloat ? output : absRound(output);                                                                // 2186
        },                                                                                                             // 2187
                                                                                                                       // 2188
        from : function (time, withoutSuffix) {                                                                        // 2189
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);             // 2190
        },                                                                                                             // 2191
                                                                                                                       // 2192
        fromNow : function (withoutSuffix) {                                                                           // 2193
            return this.from(moment(), withoutSuffix);                                                                 // 2194
        },                                                                                                             // 2195
                                                                                                                       // 2196
        calendar : function (time) {                                                                                   // 2197
            // We want to compare the start of today, vs this.                                                         // 2198
            // Getting start-of-today depends on whether we're zone'd or not.                                          // 2199
            var now = time || moment(),                                                                                // 2200
                sod = makeAs(now, this).startOf('day'),                                                                // 2201
                diff = this.diff(sod, 'days', true),                                                                   // 2202
                format = diff < -6 ? 'sameElse' :                                                                      // 2203
                    diff < -1 ? 'lastWeek' :                                                                           // 2204
                    diff < 0 ? 'lastDay' :                                                                             // 2205
                    diff < 1 ? 'sameDay' :                                                                             // 2206
                    diff < 2 ? 'nextDay' :                                                                             // 2207
                    diff < 7 ? 'nextWeek' : 'sameElse';                                                                // 2208
            return this.format(this.localeData().calendar(format, this));                                              // 2209
        },                                                                                                             // 2210
                                                                                                                       // 2211
        isLeapYear : function () {                                                                                     // 2212
            return isLeapYear(this.year());                                                                            // 2213
        },                                                                                                             // 2214
                                                                                                                       // 2215
        isDST : function () {                                                                                          // 2216
            return (this.zone() < this.clone().month(0).zone() ||                                                      // 2217
                this.zone() < this.clone().month(5).zone());                                                           // 2218
        },                                                                                                             // 2219
                                                                                                                       // 2220
        day : function (input) {                                                                                       // 2221
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();                                            // 2222
            if (input != null) {                                                                                       // 2223
                input = parseWeekday(input, this.localeData());                                                        // 2224
                return this.add(input - day, 'd');                                                                     // 2225
            } else {                                                                                                   // 2226
                return day;                                                                                            // 2227
            }                                                                                                          // 2228
        },                                                                                                             // 2229
                                                                                                                       // 2230
        month : makeAccessor('Month', true),                                                                           // 2231
                                                                                                                       // 2232
        startOf : function (units) {                                                                                   // 2233
            units = normalizeUnits(units);                                                                             // 2234
            // the following switch intentionally omits break keywords                                                 // 2235
            // to utilize falling through the cases.                                                                   // 2236
            switch (units) {                                                                                           // 2237
            case 'year':                                                                                               // 2238
                this.month(0);                                                                                         // 2239
                /* falls through */                                                                                    // 2240
            case 'quarter':                                                                                            // 2241
            case 'month':                                                                                              // 2242
                this.date(1);                                                                                          // 2243
                /* falls through */                                                                                    // 2244
            case 'week':                                                                                               // 2245
            case 'isoWeek':                                                                                            // 2246
            case 'day':                                                                                                // 2247
                this.hours(0);                                                                                         // 2248
                /* falls through */                                                                                    // 2249
            case 'hour':                                                                                               // 2250
                this.minutes(0);                                                                                       // 2251
                /* falls through */                                                                                    // 2252
            case 'minute':                                                                                             // 2253
                this.seconds(0);                                                                                       // 2254
                /* falls through */                                                                                    // 2255
            case 'second':                                                                                             // 2256
                this.milliseconds(0);                                                                                  // 2257
                /* falls through */                                                                                    // 2258
            }                                                                                                          // 2259
                                                                                                                       // 2260
            // weeks are a special case                                                                                // 2261
            if (units === 'week') {                                                                                    // 2262
                this.weekday(0);                                                                                       // 2263
            } else if (units === 'isoWeek') {                                                                          // 2264
                this.isoWeekday(1);                                                                                    // 2265
            }                                                                                                          // 2266
                                                                                                                       // 2267
            // quarters are also special                                                                               // 2268
            if (units === 'quarter') {                                                                                 // 2269
                this.month(Math.floor(this.month() / 3) * 3);                                                          // 2270
            }                                                                                                          // 2271
                                                                                                                       // 2272
            return this;                                                                                               // 2273
        },                                                                                                             // 2274
                                                                                                                       // 2275
        endOf: function (units) {                                                                                      // 2276
            units = normalizeUnits(units);                                                                             // 2277
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');               // 2278
        },                                                                                                             // 2279
                                                                                                                       // 2280
        isAfter: function (input, units) {                                                                             // 2281
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');                              // 2282
            if (units === 'millisecond') {                                                                             // 2283
                input = moment.isMoment(input) ? input : moment(input);                                                // 2284
                return +this > +input;                                                                                 // 2285
            } else {                                                                                                   // 2286
                return +this.clone().startOf(units) > +moment(input).startOf(units);                                   // 2287
            }                                                                                                          // 2288
        },                                                                                                             // 2289
                                                                                                                       // 2290
        isBefore: function (input, units) {                                                                            // 2291
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');                              // 2292
            if (units === 'millisecond') {                                                                             // 2293
                input = moment.isMoment(input) ? input : moment(input);                                                // 2294
                return +this < +input;                                                                                 // 2295
            } else {                                                                                                   // 2296
                return +this.clone().startOf(units) < +moment(input).startOf(units);                                   // 2297
            }                                                                                                          // 2298
        },                                                                                                             // 2299
                                                                                                                       // 2300
        isSame: function (input, units) {                                                                              // 2301
            units = normalizeUnits(units || 'millisecond');                                                            // 2302
            if (units === 'millisecond') {                                                                             // 2303
                input = moment.isMoment(input) ? input : moment(input);                                                // 2304
                return +this === +input;                                                                               // 2305
            } else {                                                                                                   // 2306
                return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);                           // 2307
            }                                                                                                          // 2308
        },                                                                                                             // 2309
                                                                                                                       // 2310
        min: deprecate(                                                                                                // 2311
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',   // 2312
                 function (other) {                                                                                    // 2313
                     other = moment.apply(null, arguments);                                                            // 2314
                     return other < this ? this : other;                                                               // 2315
                 }                                                                                                     // 2316
         ),                                                                                                            // 2317
                                                                                                                       // 2318
        max: deprecate(                                                                                                // 2319
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',    // 2320
                function (other) {                                                                                     // 2321
                    other = moment.apply(null, arguments);                                                             // 2322
                    return other > this ? this : other;                                                                // 2323
                }                                                                                                      // 2324
        ),                                                                                                             // 2325
                                                                                                                       // 2326
        // keepLocalTime = true means only change the timezone, without                                                // 2327
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->                                             // 2328
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone                                            // 2329
        // +0200, so we adjust the time as needed, to be valid.                                                        // 2330
        //                                                                                                             // 2331
        // Keeping the time actually adds/subtracts (one hour)                                                         // 2332
        // from the actual represented time. That is why we call updateOffset                                          // 2333
        // a second time. In case it wants us to change the offset again                                               // 2334
        // _changeInProgress == true case, then we have to adjust, because                                             // 2335
        // there is no such time in the given timezone.                                                                // 2336
        zone : function (input, keepLocalTime) {                                                                       // 2337
            var offset = this._offset || 0,                                                                            // 2338
                localAdjust;                                                                                           // 2339
            if (input != null) {                                                                                       // 2340
                if (typeof input === 'string') {                                                                       // 2341
                    input = timezoneMinutesFromString(input);                                                          // 2342
                }                                                                                                      // 2343
                if (Math.abs(input) < 16) {                                                                            // 2344
                    input = input * 60;                                                                                // 2345
                }                                                                                                      // 2346
                if (!this._isUTC && keepLocalTime) {                                                                   // 2347
                    localAdjust = this._dateTzOffset();                                                                // 2348
                }                                                                                                      // 2349
                this._offset = input;                                                                                  // 2350
                this._isUTC = true;                                                                                    // 2351
                if (localAdjust != null) {                                                                             // 2352
                    this.subtract(localAdjust, 'm');                                                                   // 2353
                }                                                                                                      // 2354
                if (offset !== input) {                                                                                // 2355
                    if (!keepLocalTime || this._changeInProgress) {                                                    // 2356
                        addOrSubtractDurationFromMoment(this,                                                          // 2357
                                moment.duration(offset - input, 'm'), 1, false);                                       // 2358
                    } else if (!this._changeInProgress) {                                                              // 2359
                        this._changeInProgress = true;                                                                 // 2360
                        moment.updateOffset(this, true);                                                               // 2361
                        this._changeInProgress = null;                                                                 // 2362
                    }                                                                                                  // 2363
                }                                                                                                      // 2364
            } else {                                                                                                   // 2365
                return this._isUTC ? offset : this._dateTzOffset();                                                    // 2366
            }                                                                                                          // 2367
            return this;                                                                                               // 2368
        },                                                                                                             // 2369
                                                                                                                       // 2370
        zoneAbbr : function () {                                                                                       // 2371
            return this._isUTC ? 'UTC' : '';                                                                           // 2372
        },                                                                                                             // 2373
                                                                                                                       // 2374
        zoneName : function () {                                                                                       // 2375
            return this._isUTC ? 'Coordinated Universal Time' : '';                                                    // 2376
        },                                                                                                             // 2377
                                                                                                                       // 2378
        parseZone : function () {                                                                                      // 2379
            if (this._tzm) {                                                                                           // 2380
                this.zone(this._tzm);                                                                                  // 2381
            } else if (typeof this._i === 'string') {                                                                  // 2382
                this.zone(this._i);                                                                                    // 2383
            }                                                                                                          // 2384
            return this;                                                                                               // 2385
        },                                                                                                             // 2386
                                                                                                                       // 2387
        hasAlignedHourOffset : function (input) {                                                                      // 2388
            if (!input) {                                                                                              // 2389
                input = 0;                                                                                             // 2390
            }                                                                                                          // 2391
            else {                                                                                                     // 2392
                input = moment(input).zone();                                                                          // 2393
            }                                                                                                          // 2394
                                                                                                                       // 2395
            return (this.zone() - input) % 60 === 0;                                                                   // 2396
        },                                                                                                             // 2397
                                                                                                                       // 2398
        daysInMonth : function () {                                                                                    // 2399
            return daysInMonth(this.year(), this.month());                                                             // 2400
        },                                                                                                             // 2401
                                                                                                                       // 2402
        dayOfYear : function (input) {                                                                                 // 2403
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;           // 2404
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');                                     // 2405
        },                                                                                                             // 2406
                                                                                                                       // 2407
        quarter : function (input) {                                                                                   // 2408
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3); // 2409
        },                                                                                                             // 2410
                                                                                                                       // 2411
        weekYear : function (input) {                                                                                  // 2412
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;                // 2413
            return input == null ? year : this.add((input - year), 'y');                                               // 2414
        },                                                                                                             // 2415
                                                                                                                       // 2416
        isoWeekYear : function (input) {                                                                               // 2417
            var year = weekOfYear(this, 1, 4).year;                                                                    // 2418
            return input == null ? year : this.add((input - year), 'y');                                               // 2419
        },                                                                                                             // 2420
                                                                                                                       // 2421
        week : function (input) {                                                                                      // 2422
            var week = this.localeData().week(this);                                                                   // 2423
            return input == null ? week : this.add((input - week) * 7, 'd');                                           // 2424
        },                                                                                                             // 2425
                                                                                                                       // 2426
        isoWeek : function (input) {                                                                                   // 2427
            var week = weekOfYear(this, 1, 4).week;                                                                    // 2428
            return input == null ? week : this.add((input - week) * 7, 'd');                                           // 2429
        },                                                                                                             // 2430
                                                                                                                       // 2431
        weekday : function (input) {                                                                                   // 2432
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;                                          // 2433
            return input == null ? weekday : this.add(input - weekday, 'd');                                           // 2434
        },                                                                                                             // 2435
                                                                                                                       // 2436
        isoWeekday : function (input) {                                                                                // 2437
            // behaves the same as moment#day except                                                                   // 2438
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)                                          // 2439
            // as a setter, sunday should belong to the previous week.                                                 // 2440
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);                     // 2441
        },                                                                                                             // 2442
                                                                                                                       // 2443
        isoWeeksInYear : function () {                                                                                 // 2444
            return weeksInYear(this.year(), 1, 4);                                                                     // 2445
        },                                                                                                             // 2446
                                                                                                                       // 2447
        weeksInYear : function () {                                                                                    // 2448
            var weekInfo = this.localeData()._week;                                                                    // 2449
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);                                               // 2450
        },                                                                                                             // 2451
                                                                                                                       // 2452
        get : function (units) {                                                                                       // 2453
            units = normalizeUnits(units);                                                                             // 2454
            return this[units]();                                                                                      // 2455
        },                                                                                                             // 2456
                                                                                                                       // 2457
        set : function (units, value) {                                                                                // 2458
            units = normalizeUnits(units);                                                                             // 2459
            if (typeof this[units] === 'function') {                                                                   // 2460
                this[units](value);                                                                                    // 2461
            }                                                                                                          // 2462
            return this;                                                                                               // 2463
        },                                                                                                             // 2464
                                                                                                                       // 2465
        // If passed a locale key, it will set the locale for this                                                     // 2466
        // instance.  Otherwise, it will return the locale configuration                                               // 2467
        // variables for this instance.                                                                                // 2468
        locale : function (key) {                                                                                      // 2469
            var newLocaleData;                                                                                         // 2470
                                                                                                                       // 2471
            if (key === undefined) {                                                                                   // 2472
                return this._locale._abbr;                                                                             // 2473
            } else {                                                                                                   // 2474
                newLocaleData = moment.localeData(key);                                                                // 2475
                if (newLocaleData != null) {                                                                           // 2476
                    this._locale = newLocaleData;                                                                      // 2477
                }                                                                                                      // 2478
                return this;                                                                                           // 2479
            }                                                                                                          // 2480
        },                                                                                                             // 2481
                                                                                                                       // 2482
        lang : deprecate(                                                                                              // 2483
            'moment().lang() is deprecated. Use moment().localeData() instead.',                                       // 2484
            function (key) {                                                                                           // 2485
                if (key === undefined) {                                                                               // 2486
                    return this.localeData();                                                                          // 2487
                } else {                                                                                               // 2488
                    return this.locale(key);                                                                           // 2489
                }                                                                                                      // 2490
            }                                                                                                          // 2491
        ),                                                                                                             // 2492
                                                                                                                       // 2493
        localeData : function () {                                                                                     // 2494
            return this._locale;                                                                                       // 2495
        },                                                                                                             // 2496
                                                                                                                       // 2497
        _dateTzOffset : function () {                                                                                  // 2498
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.                                          // 2499
            // https://github.com/moment/moment/pull/1871                                                              // 2500
            return Math.round(this._d.getTimezoneOffset() / 15) * 15;                                                  // 2501
        }                                                                                                              // 2502
    });                                                                                                                // 2503
                                                                                                                       // 2504
    function rawMonthSetter(mom, value) {                                                                              // 2505
        var dayOfMonth;                                                                                                // 2506
                                                                                                                       // 2507
        // TODO: Move this out of here!                                                                                // 2508
        if (typeof value === 'string') {                                                                               // 2509
            value = mom.localeData().monthsParse(value);                                                               // 2510
            // TODO: Another silent failure?                                                                           // 2511
            if (typeof value !== 'number') {                                                                           // 2512
                return mom;                                                                                            // 2513
            }                                                                                                          // 2514
        }                                                                                                              // 2515
                                                                                                                       // 2516
        dayOfMonth = Math.min(mom.date(),                                                                              // 2517
                daysInMonth(mom.year(), value));                                                                       // 2518
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);                                        // 2519
        return mom;                                                                                                    // 2520
    }                                                                                                                  // 2521
                                                                                                                       // 2522
    function rawGetter(mom, unit) {                                                                                    // 2523
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();                                                     // 2524
    }                                                                                                                  // 2525
                                                                                                                       // 2526
    function rawSetter(mom, unit, value) {                                                                             // 2527
        if (unit === 'Month') {                                                                                        // 2528
            return rawMonthSetter(mom, value);                                                                         // 2529
        } else {                                                                                                       // 2530
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);                                            // 2531
        }                                                                                                              // 2532
    }                                                                                                                  // 2533
                                                                                                                       // 2534
    function makeAccessor(unit, keepTime) {                                                                            // 2535
        return function (value) {                                                                                      // 2536
            if (value != null) {                                                                                       // 2537
                rawSetter(this, unit, value);                                                                          // 2538
                moment.updateOffset(this, keepTime);                                                                   // 2539
                return this;                                                                                           // 2540
            } else {                                                                                                   // 2541
                return rawGetter(this, unit);                                                                          // 2542
            }                                                                                                          // 2543
        };                                                                                                             // 2544
    }                                                                                                                  // 2545
                                                                                                                       // 2546
    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);                              // 2547
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);                                             // 2548
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);                                             // 2549
    // Setting the hour should keep the time, because the user explicitly                                              // 2550
    // specified which hour he wants. So trying to maintain the same hour (in                                          // 2551
    // a new timezone) makes sense. Adding/subtracting hours does not follow                                           // 2552
    // this rule.                                                                                                      // 2553
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);                                                    // 2554
    // moment.fn.month is defined separately                                                                           // 2555
    moment.fn.date = makeAccessor('Date', true);                                                                       // 2556
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));        // 2557
    moment.fn.year = makeAccessor('FullYear', true);                                                                   // 2558
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));    // 2559
                                                                                                                       // 2560
    // add plural methods                                                                                              // 2561
    moment.fn.days = moment.fn.day;                                                                                    // 2562
    moment.fn.months = moment.fn.month;                                                                                // 2563
    moment.fn.weeks = moment.fn.week;                                                                                  // 2564
    moment.fn.isoWeeks = moment.fn.isoWeek;                                                                            // 2565
    moment.fn.quarters = moment.fn.quarter;                                                                            // 2566
                                                                                                                       // 2567
    // add aliased format methods                                                                                      // 2568
    moment.fn.toJSON = moment.fn.toISOString;                                                                          // 2569
                                                                                                                       // 2570
    /************************************                                                                              // 2571
        Duration Prototype                                                                                             // 2572
    ************************************/                                                                              // 2573
                                                                                                                       // 2574
                                                                                                                       // 2575
    function daysToYears (days) {                                                                                      // 2576
        // 400 years have 146097 days (taking into account leap year rules)                                            // 2577
        return days * 400 / 146097;                                                                                    // 2578
    }                                                                                                                  // 2579
                                                                                                                       // 2580
    function yearsToDays (years) {                                                                                     // 2581
        // years * 365 + absRound(years / 4) -                                                                         // 2582
        //     absRound(years / 100) + absRound(years / 400);                                                          // 2583
        return years * 146097 / 400;                                                                                   // 2584
    }                                                                                                                  // 2585
                                                                                                                       // 2586
    extend(moment.duration.fn = Duration.prototype, {                                                                  // 2587
                                                                                                                       // 2588
        _bubble : function () {                                                                                        // 2589
            var milliseconds = this._milliseconds,                                                                     // 2590
                days = this._days,                                                                                     // 2591
                months = this._months,                                                                                 // 2592
                data = this._data,                                                                                     // 2593
                seconds, minutes, hours, years = 0;                                                                    // 2594
                                                                                                                       // 2595
            // The following code bubbles up values, see the tests for                                                 // 2596
            // examples of what that means.                                                                            // 2597
            data.milliseconds = milliseconds % 1000;                                                                   // 2598
                                                                                                                       // 2599
            seconds = absRound(milliseconds / 1000);                                                                   // 2600
            data.seconds = seconds % 60;                                                                               // 2601
                                                                                                                       // 2602
            minutes = absRound(seconds / 60);                                                                          // 2603
            data.minutes = minutes % 60;                                                                               // 2604
                                                                                                                       // 2605
            hours = absRound(minutes / 60);                                                                            // 2606
            data.hours = hours % 24;                                                                                   // 2607
                                                                                                                       // 2608
            days += absRound(hours / 24);                                                                              // 2609
                                                                                                                       // 2610
            // Accurately convert days to years, assume start from year 0.                                             // 2611
            years = absRound(daysToYears(days));                                                                       // 2612
            days -= absRound(yearsToDays(years));                                                                      // 2613
                                                                                                                       // 2614
            // 30 days to a month                                                                                      // 2615
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.                                          // 2616
            months += absRound(days / 30);                                                                             // 2617
            days %= 30;                                                                                                // 2618
                                                                                                                       // 2619
            // 12 months -> 1 year                                                                                     // 2620
            years += absRound(months / 12);                                                                            // 2621
            months %= 12;                                                                                              // 2622
                                                                                                                       // 2623
            data.days = days;                                                                                          // 2624
            data.months = months;                                                                                      // 2625
            data.years = years;                                                                                        // 2626
        },                                                                                                             // 2627
                                                                                                                       // 2628
        abs : function () {                                                                                            // 2629
            this._milliseconds = Math.abs(this._milliseconds);                                                         // 2630
            this._days = Math.abs(this._days);                                                                         // 2631
            this._months = Math.abs(this._months);                                                                     // 2632
                                                                                                                       // 2633
            this._data.milliseconds = Math.abs(this._data.milliseconds);                                               // 2634
            this._data.seconds = Math.abs(this._data.seconds);                                                         // 2635
            this._data.minutes = Math.abs(this._data.minutes);                                                         // 2636
            this._data.hours = Math.abs(this._data.hours);                                                             // 2637
            this._data.months = Math.abs(this._data.months);                                                           // 2638
            this._data.years = Math.abs(this._data.years);                                                             // 2639
                                                                                                                       // 2640
            return this;                                                                                               // 2641
        },                                                                                                             // 2642
                                                                                                                       // 2643
        weeks : function () {                                                                                          // 2644
            return absRound(this.days() / 7);                                                                          // 2645
        },                                                                                                             // 2646
                                                                                                                       // 2647
        valueOf : function () {                                                                                        // 2648
            return this._milliseconds +                                                                                // 2649
              this._days * 864e5 +                                                                                     // 2650
              (this._months % 12) * 2592e6 +                                                                           // 2651
              toInt(this._months / 12) * 31536e6;                                                                      // 2652
        },                                                                                                             // 2653
                                                                                                                       // 2654
        humanize : function (withSuffix) {                                                                             // 2655
            var output = relativeTime(this, !withSuffix, this.localeData());                                           // 2656
                                                                                                                       // 2657
            if (withSuffix) {                                                                                          // 2658
                output = this.localeData().pastFuture(+this, output);                                                  // 2659
            }                                                                                                          // 2660
                                                                                                                       // 2661
            return this.localeData().postformat(output);                                                               // 2662
        },                                                                                                             // 2663
                                                                                                                       // 2664
        add : function (input, val) {                                                                                  // 2665
            // supports only 2.0-style add(1, 's') or add(moment)                                                      // 2666
            var dur = moment.duration(input, val);                                                                     // 2667
                                                                                                                       // 2668
            this._milliseconds += dur._milliseconds;                                                                   // 2669
            this._days += dur._days;                                                                                   // 2670
            this._months += dur._months;                                                                               // 2671
                                                                                                                       // 2672
            this._bubble();                                                                                            // 2673
                                                                                                                       // 2674
            return this;                                                                                               // 2675
        },                                                                                                             // 2676
                                                                                                                       // 2677
        subtract : function (input, val) {                                                                             // 2678
            var dur = moment.duration(input, val);                                                                     // 2679
                                                                                                                       // 2680
            this._milliseconds -= dur._milliseconds;                                                                   // 2681
            this._days -= dur._days;                                                                                   // 2682
            this._months -= dur._months;                                                                               // 2683
                                                                                                                       // 2684
            this._bubble();                                                                                            // 2685
                                                                                                                       // 2686
            return this;                                                                                               // 2687
        },                                                                                                             // 2688
                                                                                                                       // 2689
        get : function (units) {                                                                                       // 2690
            units = normalizeUnits(units);                                                                             // 2691
            return this[units.toLowerCase() + 's']();                                                                  // 2692
        },                                                                                                             // 2693
                                                                                                                       // 2694
        as : function (units) {                                                                                        // 2695
            var days, months;                                                                                          // 2696
            units = normalizeUnits(units);                                                                             // 2697
                                                                                                                       // 2698
            if (units === 'month' || units === 'year') {                                                               // 2699
                days = this._days + this._milliseconds / 864e5;                                                        // 2700
                months = this._months + daysToYears(days) * 12;                                                        // 2701
                return units === 'month' ? months : months / 12;                                                       // 2702
            } else {                                                                                                   // 2703
                // handle milliseconds separately because of floating point math errors (issue #1867)                  // 2704
                days = this._days + yearsToDays(this._months / 12);                                                    // 2705
                switch (units) {                                                                                       // 2706
                    case 'week': return days / 7 + this._milliseconds / 6048e5;                                        // 2707
                    case 'day': return days + this._milliseconds / 864e5;                                              // 2708
                    case 'hour': return days * 24 + this._milliseconds / 36e5;                                         // 2709
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;                                   // 2710
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;                             // 2711
                    // Math.floor prevents floating point math errors here                                             // 2712
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;            // 2713
                    default: throw new Error('Unknown unit ' + units);                                                 // 2714
                }                                                                                                      // 2715
            }                                                                                                          // 2716
        },                                                                                                             // 2717
                                                                                                                       // 2718
        lang : moment.fn.lang,                                                                                         // 2719
        locale : moment.fn.locale,                                                                                     // 2720
                                                                                                                       // 2721
        toIsoString : deprecate(                                                                                       // 2722
            'toIsoString() is deprecated. Please use toISOString() instead ' +                                         // 2723
            '(notice the capitals)',                                                                                   // 2724
            function () {                                                                                              // 2725
                return this.toISOString();                                                                             // 2726
            }                                                                                                          // 2727
        ),                                                                                                             // 2728
                                                                                                                       // 2729
        toISOString : function () {                                                                                    // 2730
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js            // 2731
            var years = Math.abs(this.years()),                                                                        // 2732
                months = Math.abs(this.months()),                                                                      // 2733
                days = Math.abs(this.days()),                                                                          // 2734
                hours = Math.abs(this.hours()),                                                                        // 2735
                minutes = Math.abs(this.minutes()),                                                                    // 2736
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);                                       // 2737
                                                                                                                       // 2738
            if (!this.asSeconds()) {                                                                                   // 2739
                // this is the same as C#'s (Noda) and python (isodate)...                                             // 2740
                // but not other JS (goog.date)                                                                        // 2741
                return 'P0D';                                                                                          // 2742
            }                                                                                                          // 2743
                                                                                                                       // 2744
            return (this.asSeconds() < 0 ? '-' : '') +                                                                 // 2745
                'P' +                                                                                                  // 2746
                (years ? years + 'Y' : '') +                                                                           // 2747
                (months ? months + 'M' : '') +                                                                         // 2748
                (days ? days + 'D' : '') +                                                                             // 2749
                ((hours || minutes || seconds) ? 'T' : '') +                                                           // 2750
                (hours ? hours + 'H' : '') +                                                                           // 2751
                (minutes ? minutes + 'M' : '') +                                                                       // 2752
                (seconds ? seconds + 'S' : '');                                                                        // 2753
        },                                                                                                             // 2754
                                                                                                                       // 2755
        localeData : function () {                                                                                     // 2756
            return this._locale;                                                                                       // 2757
        }                                                                                                              // 2758
    });                                                                                                                // 2759
                                                                                                                       // 2760
    moment.duration.fn.toString = moment.duration.fn.toISOString;                                                      // 2761
                                                                                                                       // 2762
    function makeDurationGetter(name) {                                                                                // 2763
        moment.duration.fn[name] = function () {                                                                       // 2764
            return this._data[name];                                                                                   // 2765
        };                                                                                                             // 2766
    }                                                                                                                  // 2767
                                                                                                                       // 2768
    for (i in unitMillisecondFactors) {                                                                                // 2769
        if (hasOwnProp(unitMillisecondFactors, i)) {                                                                   // 2770
            makeDurationGetter(i.toLowerCase());                                                                       // 2771
        }                                                                                                              // 2772
    }                                                                                                                  // 2773
                                                                                                                       // 2774
    moment.duration.fn.asMilliseconds = function () {                                                                  // 2775
        return this.as('ms');                                                                                          // 2776
    };                                                                                                                 // 2777
    moment.duration.fn.asSeconds = function () {                                                                       // 2778
        return this.as('s');                                                                                           // 2779
    };                                                                                                                 // 2780
    moment.duration.fn.asMinutes = function () {                                                                       // 2781
        return this.as('m');                                                                                           // 2782
    };                                                                                                                 // 2783
    moment.duration.fn.asHours = function () {                                                                         // 2784
        return this.as('h');                                                                                           // 2785
    };                                                                                                                 // 2786
    moment.duration.fn.asDays = function () {                                                                          // 2787
        return this.as('d');                                                                                           // 2788
    };                                                                                                                 // 2789
    moment.duration.fn.asWeeks = function () {                                                                         // 2790
        return this.as('weeks');                                                                                       // 2791
    };                                                                                                                 // 2792
    moment.duration.fn.asMonths = function () {                                                                        // 2793
        return this.as('M');                                                                                           // 2794
    };                                                                                                                 // 2795
    moment.duration.fn.asYears = function () {                                                                         // 2796
        return this.as('y');                                                                                           // 2797
    };                                                                                                                 // 2798
                                                                                                                       // 2799
    /************************************                                                                              // 2800
        Default Locale                                                                                                 // 2801
    ************************************/                                                                              // 2802
                                                                                                                       // 2803
                                                                                                                       // 2804
    // Set default locale, other locale will inherit from English.                                                     // 2805
    moment.locale('en', {                                                                                              // 2806
        ordinal : function (number) {                                                                                  // 2807
            var b = number % 10,                                                                                       // 2808
                output = (toInt(number % 100 / 10) === 1) ? 'th' :                                                     // 2809
                (b === 1) ? 'st' :                                                                                     // 2810
                (b === 2) ? 'nd' :                                                                                     // 2811
                (b === 3) ? 'rd' : 'th';                                                                               // 2812
            return number + output;                                                                                    // 2813
        }                                                                                                              // 2814
    });                                                                                                                // 2815
                                                                                                                       // 2816
    /* EMBED_LOCALES */                                                                                                // 2817
                                                                                                                       // 2818
    /************************************                                                                              // 2819
        Exposing Moment                                                                                                // 2820
    ************************************/                                                                              // 2821
                                                                                                                       // 2822
    function makeGlobal(shouldDeprecate) {                                                                             // 2823
        if (typeof Meteor !== 'undefined') {                                                                           // 2824
            Meteor.__moment = moment;                                                                                  // 2825
        }                                                                                                              // 2826
        /*global ender:false */                                                                                        // 2827
        if (typeof ender !== 'undefined') {                                                                            // 2828
            return;                                                                                                    // 2829
        }                                                                                                              // 2830
        oldGlobalMoment = globalScope.moment;                                                                          // 2831
        if (shouldDeprecate) {                                                                                         // 2832
            globalScope.moment = deprecate(                                                                            // 2833
                    'Accessing Moment through the global scope is ' +                                                  // 2834
                    'deprecated, and will be removed in an upcoming ' +                                                // 2835
                    'release.',                                                                                        // 2836
                    moment);                                                                                           // 2837
        } else {                                                                                                       // 2838
            globalScope.moment = moment;                                                                               // 2839
        }                                                                                                              // 2840
    }                                                                                                                  // 2841
                                                                                                                       // 2842
    // CommonJS module is defined                                                                                      // 2843
    if (hasModule) {                                                                                                   // 2844
        module.exports = moment;                                                                                       // 2845
    } else if (typeof define === 'function' && define.amd) {                                                           // 2846
        define('moment', function (require, exports, module) {                                                         // 2847
            if (module.config && module.config() && module.config().noGlobal === true) {                               // 2848
                // release the global variable                                                                         // 2849
                globalScope.moment = oldGlobalMoment;                                                                  // 2850
            }                                                                                                          // 2851
                                                                                                                       // 2852
            return moment;                                                                                             // 2853
        });                                                                                                            // 2854
        makeGlobal(true);                                                                                              // 2855
    } else {                                                                                                           // 2856
        makeGlobal();                                                                                                  // 2857
    }                                                                                                                  // 2858
}).call(this);                                                                                                         // 2859
                                                                                                                       // 2860
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/flamparski:moment-locales/bower_components/moment/locale/en-au.js                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// moment.js locale configuration                                                                                      // 1
// locale : australian english (en-au)                                                                                 // 2
                                                                                                                       // 3
(function (factory) {                                                                                                  // 4
    if (typeof define === 'function' && define.amd) {                                                                  // 5
        define(['moment'], factory); // AMD                                                                            // 6
    } else if (typeof exports === 'object') {                                                                          // 7
        module.exports = factory(require('../moment')); // Node                                                        // 8
    } else if (typeof Meteor === 'object' && typeof global === 'object') {                                             // 9
        factory(global.moment); // Meteor server                                                                       // 10
    } else if (typeof window === 'object') {                                                                           // 11
        factory(window.moment); // Any browser global                                                                  // 12
    } else {                                                                                                           // 13
        console.warn('Moment is being loaded through a language global!');                                             // 14
        factory(moment); // Language global -- last resort                                                             // 15
    }                                                                                                                  // 16
}(function (moment) {                                                                                                  // 17
    return moment.defineLocale('en-au', {                                                                              // 18
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),   // 19
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),                                    // 20
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),                              // 21
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),                                                      // 22
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),                                                               // 23
        longDateFormat : {                                                                                             // 24
            LT : 'h:mm A',                                                                                             // 25
            L : 'DD/MM/YYYY',                                                                                          // 26
            LL : 'D MMMM YYYY',                                                                                        // 27
            LLL : 'D MMMM YYYY LT',                                                                                    // 28
            LLLL : 'dddd, D MMMM YYYY LT'                                                                              // 29
        },                                                                                                             // 30
        calendar : {                                                                                                   // 31
            sameDay : '[Today at] LT',                                                                                 // 32
            nextDay : '[Tomorrow at] LT',                                                                              // 33
            nextWeek : 'dddd [at] LT',                                                                                 // 34
            lastDay : '[Yesterday at] LT',                                                                             // 35
            lastWeek : '[Last] dddd [at] LT',                                                                          // 36
            sameElse : 'L'                                                                                             // 37
        },                                                                                                             // 38
        relativeTime : {                                                                                               // 39
            future : 'in %s',                                                                                          // 40
            past : '%s ago',                                                                                           // 41
            s : 'a few seconds',                                                                                       // 42
            m : 'a minute',                                                                                            // 43
            mm : '%d minutes',                                                                                         // 44
            h : 'an hour',                                                                                             // 45
            hh : '%d hours',                                                                                           // 46
            d : 'a day',                                                                                               // 47
            dd : '%d days',                                                                                            // 48
            M : 'a month',                                                                                             // 49
            MM : '%d months',                                                                                          // 50
            y : 'a year',                                                                                              // 51
            yy : '%d years'                                                                                            // 52
        },                                                                                                             // 53
        ordinal : function (number) {                                                                                  // 54
            var b = number % 10,                                                                                       // 55
                output = (~~(number % 100 / 10) === 1) ? 'th' :                                                        // 56
                (b === 1) ? 'st' :                                                                                     // 57
                (b === 2) ? 'nd' :                                                                                     // 58
                (b === 3) ? 'rd' : 'th';                                                                               // 59
            return number + output;                                                                                    // 60
        },                                                                                                             // 61
        week : {                                                                                                       // 62
            dow : 1, // Monday is the first day of the week.                                                           // 63
            doy : 4  // The week that contains Jan 4th is the first week of the year.                                  // 64
        }                                                                                                              // 65
    });                                                                                                                // 66
}));                                                                                                                   // 67
                                                                                                                       // 68
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/flamparski:moment-locales/bower_components/moment/locale/en-gb.js                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// moment.js locale configuration                                                                                      // 1
// locale : great britain english (en-gb)                                                                              // 2
// author : Chris Gedrim : https://github.com/chrisgedrim                                                              // 3
//                                                                                                                     // 4
                                                                                                                       // 5
(function (factory) {                                                                                                  // 6
    if (typeof define === 'function' && define.amd) {                                                                  // 7
        define(['moment'], factory); // AMD                                                                            // 8
    } else if (typeof exports === 'object') {                                                                          // 9
        module.exports = factory(require('../moment')); // Node                                                        // 10
    } else if (typeof Meteor === 'object' && typeof global === 'object') {                                             // 11
        factory(global.moment); // Meteor server                                                                       // 12
    } else if (typeof window === 'object') {                                                                           // 13
        factory(window.moment); // Any browser global                                                                  // 14
    } else {                                                                                                           // 15
        console.warn('Moment is being loaded through a language global!');                                             // 16
        factory(moment); // Language global -- last resort                                                             // 17
    }                                                                                                                  // 18
}(function (moment) {                                                                                                  // 19
    return moment.defineLocale('en-gb', {                                                                              // 20
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),   // 21
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),                                    // 22
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),                              // 23
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),                                                      // 24
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),                                                               // 25
        longDateFormat : {                                                                                             // 26
            LT : 'HH:mm',                                                                                              // 27
            L : 'DD/MM/YYYY',                                                                                          // 28
            LL : 'D MMMM YYYY',                                                                                        // 29
            LLL : 'D MMMM YYYY LT',                                                                                    // 30
            LLLL : 'dddd, D MMMM YYYY LT'                                                                              // 31
        },                                                                                                             // 32
        calendar : {                                                                                                   // 33
            sameDay : '[Today at] LT',                                                                                 // 34
            nextDay : '[Tomorrow at] LT',                                                                              // 35
            nextWeek : 'dddd [at] LT',                                                                                 // 36
            lastDay : '[Yesterday at] LT',                                                                             // 37
            lastWeek : '[Last] dddd [at] LT',                                                                          // 38
            sameElse : 'L'                                                                                             // 39
        },                                                                                                             // 40
        relativeTime : {                                                                                               // 41
            future : 'in %s',                                                                                          // 42
            past : '%s ago',                                                                                           // 43
            s : 'a few seconds',                                                                                       // 44
            m : 'a minute',                                                                                            // 45
            mm : '%d minutes',                                                                                         // 46
            h : 'an hour',                                                                                             // 47
            hh : '%d hours',                                                                                           // 48
            d : 'a day',                                                                                               // 49
            dd : '%d days',                                                                                            // 50
            M : 'a month',                                                                                             // 51
            MM : '%d months',                                                                                          // 52
            y : 'a year',                                                                                              // 53
            yy : '%d years'                                                                                            // 54
        },                                                                                                             // 55
        ordinal : function (number) {                                                                                  // 56
            var b = number % 10,                                                                                       // 57
                output = (~~(number % 100 / 10) === 1) ? 'th' :                                                        // 58
                (b === 1) ? 'st' :                                                                                     // 59
                (b === 2) ? 'nd' :                                                                                     // 60
                (b === 3) ? 'rd' : 'th';                                                                               // 61
            return number + output;                                                                                    // 62
        },                                                                                                             // 63
        week : {                                                                                                       // 64
            dow : 1, // Monday is the first day of the week.                                                           // 65
            doy : 4  // The week that contains Jan 4th is the first week of the year.                                  // 66
        }                                                                                                              // 67
    });                                                                                                                // 68
}));                                                                                                                   // 69
                                                                                                                       // 70
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/flamparski:moment-locales/flamparski:moment-locales.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
if (typeof moment !== 'undefined') {                                                                                   // 1
//  console.log('we have moment');                                                                                     // 2
} else if (typeof Meteor.__moment !== 'undefined') {                                                                   // 3
//  console.log('moment is in Meteor.__moment: exposing to global');                                                   // 4
  moment = Meteor.__moment;                                                                                            // 5
}                                                                                                                      // 6
                                                                                                                       // 7
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['flamparski:moment-locales'] = {
  moment: moment
};

})();

//# sourceMappingURL=flamparski_moment-locales.js.map
