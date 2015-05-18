(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Random = Package.random.Random;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var moment = Package['flamparski:moment-locales'].moment;
var Avatar = Package['bengott:avatar'].Avatar;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var Comments;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/arkham:comments-ui/lib/model.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Comments = (function () {                                                                                            // 1
  var timeTick = new Tracker.Dependency(),                                                                           // 2
    collection = new Mongo.Collection('comments'),                                                                   // 3
    noOptOptions = {                                                                                                 // 4
      validate: false,                                                                                               // 5
      filter: false,                                                                                                 // 6
      getAutoValues: false,                                                                                          // 7
      removeEmptyStrings: false                                                                                      // 8
    },                                                                                                               // 9
    ReplySchema, CommentSchema;                                                                                      // 10
                                                                                                                     // 11
  /*                                                                                                                 // 12
   * Helper Functions                                                                                                // 13
   */                                                                                                                // 14
                                                                                                                     // 15
  function transformUser(userId) {                                                                                   // 16
    var user = Meteor.users.findOne(userId),                                                                         // 17
      displayName;                                                                                                   // 18
                                                                                                                     // 19
    if (user) {                                                                                                      // 20
      if (user.emails && user.emails[0]) {                                                                           // 21
        displayName = user.emails[0].address;                                                                        // 22
      }                                                                                                              // 23
                                                                                                                     // 24
      if (user.username) {                                                                                           // 25
        displayName = user.username;                                                                                 // 26
      }                                                                                                              // 27
                                                                                                                     // 28
      return { displayName: displayName };                                                                           // 29
    }                                                                                                                // 30
  }                                                                                                                  // 31
                                                                                                                     // 32
  function transformReplies(scope, position) {                                                                       // 33
    if (!position) {                                                                                                 // 34
      position = [];                                                                                                 // 35
    }                                                                                                                // 36
                                                                                                                     // 37
    return _.map(scope.replies, function (reply, index) {                                                            // 38
      position.push(index);                                                                                          // 39
                                                                                                                     // 40
      reply.position = position;                                                                                     // 41
      reply.documentId = scope._id;                                                                                  // 42
                                                                                                                     // 43
      reply.user = scope.user.bind(reply);                                                                           // 44
      reply.likesCount = scope.likesCount.bind(reply);                                                               // 45
      reply.createdAgo = scope.createdAgo.bind(reply);                                                               // 46
                                                                                                                     // 47
      // clone position                                                                                              // 48
      reply.position = position.slice(0);                                                                            // 49
                                                                                                                     // 50
      if (reply.replies) {                                                                                           // 51
        // recursive!                                                                                                // 52
        reply.enhancedReplies = _.bind(transformReplies, null, _.extend(_.clone(scope), { replies: reply.replies }), position)();
      }                                                                                                              // 54
                                                                                                                     // 55
      position.pop();                                                                                                // 56
                                                                                                                     // 57
      return reply;                                                                                                  // 58
    });                                                                                                              // 59
  }                                                                                                                  // 60
                                                                                                                     // 61
  function modifyNestedReplies(nestedArray, position, callback) {                                                    // 62
    var currentPos = position.shift();                                                                               // 63
                                                                                                                     // 64
    if (nestedArray[currentPos]) {                                                                                   // 65
      if (position.length && nestedArray[currentPos] && nestedArray[currentPos].replies) {                           // 66
        modifyNestedReplies(nestedArray[currentPos].replies, position, callback);                                    // 67
      } else {                                                                                                       // 68
        callback(nestedArray, currentPos);                                                                           // 69
      }                                                                                                              // 70
    }                                                                                                                // 71
  }                                                                                                                  // 72
                                                                                                                     // 73
  function getUserIdsByComment(comment) {                                                                            // 74
    var ids = [];                                                                                                    // 75
                                                                                                                     // 76
    ids.push(comment.userId);                                                                                        // 77
                                                                                                                     // 78
    if (comment.replies) {                                                                                           // 79
      _.each(comment.replies, function (reply) {                                                                     // 80
        ids = _.union(ids, getUserIdsByComment(reply));                                                              // 81
      });                                                                                                            // 82
    }                                                                                                                // 83
                                                                                                                     // 84
    return ids;                                                                                                      // 85
  }                                                                                                                  // 86
                                                                                                                     // 87
  function getImageFromContent(content) {                                                                            // 88
    var urls;                                                                                                        // 89
                                                                                                                     // 90
    if (content) {                                                                                                   // 91
      urls = content.match(/(\S+\.[^/\s]+(\/\S+|\/|))(.jpg|.png|.gif)/g) ;                                           // 92
                                                                                                                     // 93
      if (urls && urls[0]) {                                                                                         // 94
        return urls[0];                                                                                              // 95
      }                                                                                                              // 96
    }                                                                                                                // 97
                                                                                                                     // 98
    return '';                                                                                                       // 99
  }                                                                                                                  // 100
                                                                                                                     // 101
  /*                                                                                                                 // 102
   * Schema Definitions                                                                                              // 103
   */                                                                                                                // 104
                                                                                                                     // 105
  ReplySchema = new SimpleSchema({                                                                                   // 106
    replyId: {                                                                                                       // 107
      type: String                                                                                                   // 108
    },                                                                                                               // 109
    userId: {                                                                                                        // 110
      type: String                                                                                                   // 111
    },                                                                                                               // 112
    image: {                                                                                                         // 113
      type: String,                                                                                                  // 114
      optional: true,                                                                                                // 115
      autoValue: function () {                                                                                       // 116
        return getImageFromContent(this.siblingField('content').value);                                              // 117
      }                                                                                                              // 118
    },                                                                                                               // 119
    content: {                                                                                                       // 120
      type: String,                                                                                                  // 121
      min: 1,                                                                                                        // 122
      max: 10000                                                                                                     // 123
    },                                                                                                               // 124
    replies: {                                                                                                       // 125
      type: [Object],                                                                                                // 126
      autoValue: function (doc) {                                                                                    // 127
        if (this.isInsert) {                                                                                         // 128
          return [];                                                                                                 // 129
        }                                                                                                            // 130
      },                                                                                                             // 131
      optional: true                                                                                                 // 132
    },                                                                                                               // 133
    likes: {                                                                                                         // 134
      type: [String],                                                                                                // 135
      autoValue: function() {                                                                                        // 136
        if (this.isInsert) {                                                                                         // 137
          return [];                                                                                                 // 138
        }                                                                                                            // 139
      },                                                                                                             // 140
      optional: true                                                                                                 // 141
    },                                                                                                               // 142
    createdAt: {                                                                                                     // 143
      type: Date,                                                                                                    // 144
      autoValue: function() {                                                                                        // 145
        if (this.isInsert) {                                                                                         // 146
          return new Date;                                                                                           // 147
        } else if (this.isUpsert) {                                                                                  // 148
          return {$setOnInsert: new Date};                                                                           // 149
        } else {                                                                                                     // 150
          this.unset();                                                                                              // 151
        }                                                                                                            // 152
      }                                                                                                              // 153
    },                                                                                                               // 154
    lastUpdatedAt: {                                                                                                 // 155
      type: Date,                                                                                                    // 156
      autoValue: function() {                                                                                        // 157
        if (this.isUpdate) {                                                                                         // 158
          return new Date();                                                                                         // 159
        }                                                                                                            // 160
      },                                                                                                             // 161
      denyInsert: true,                                                                                              // 162
      optional: true                                                                                                 // 163
    }                                                                                                                // 164
  });                                                                                                                // 165
                                                                                                                     // 166
  CommentSchema = new SimpleSchema({                                                                                 // 167
    userId: {                                                                                                        // 168
      type: String                                                                                                   // 169
    },                                                                                                               // 170
    referenceId: {                                                                                                   // 171
      type: String                                                                                                   // 172
    },                                                                                                               // 173
    image: {                                                                                                         // 174
      type: String,                                                                                                  // 175
      optional: true,                                                                                                // 176
      autoValue: function () {                                                                                       // 177
        return getImageFromContent(this.siblingField('content').value);                                              // 178
      }                                                                                                              // 179
    },                                                                                                               // 180
    content: {                                                                                                       // 181
      type: String,                                                                                                  // 182
      min: 1,                                                                                                        // 183
      max: 10000                                                                                                     // 184
    },                                                                                                               // 185
    replies: {                                                                                                       // 186
      type: [Object],                                                                                                // 187
      autoValue: function () {                                                                                       // 188
        if (this.isInsert) {                                                                                         // 189
          return [];                                                                                                 // 190
        }                                                                                                            // 191
      },                                                                                                             // 192
      optional: true                                                                                                 // 193
    },                                                                                                               // 194
    likes: {                                                                                                         // 195
      type: [String],                                                                                                // 196
      autoValue: function() {                                                                                        // 197
        if (this.isInsert) {                                                                                         // 198
          return [];                                                                                                 // 199
        }                                                                                                            // 200
      },                                                                                                             // 201
      optional: true                                                                                                 // 202
    },                                                                                                               // 203
    createdAt: {                                                                                                     // 204
      type: Date,                                                                                                    // 205
      autoValue: function() {                                                                                        // 206
        if (this.isInsert) {                                                                                         // 207
          return new Date;                                                                                           // 208
        } else if (this.isUpsert) {                                                                                  // 209
          return {$setOnInsert: new Date};                                                                           // 210
        } else {                                                                                                     // 211
          this.unset();                                                                                              // 212
        }                                                                                                            // 213
      }                                                                                                              // 214
    },                                                                                                               // 215
    lastUpdatedAt: {                                                                                                 // 216
      type: Date,                                                                                                    // 217
      autoValue: function() {                                                                                        // 218
        if (this.isUpdate) {                                                                                         // 219
          return new Date();                                                                                         // 220
        }                                                                                                            // 221
      },                                                                                                             // 222
      denyInsert: true,                                                                                              // 223
      optional: true                                                                                                 // 224
    }                                                                                                                // 225
  });                                                                                                                // 226
                                                                                                                     // 227
  /*                                                                                                                 // 228
   * Model Configuration                                                                                             // 229
   */                                                                                                                // 230
                                                                                                                     // 231
  // Reactive moment changes                                                                                         // 232
  Meteor.setInterval(function () {                                                                                   // 233
    timeTick.changed();                                                                                              // 234
  }, 1000);                                                                                                          // 235
                                                                                                                     // 236
  function fromNowReactive(mmt) {                                                                                    // 237
    timeTick.depend();                                                                                               // 238
    return mmt.fromNow();                                                                                            // 239
  }                                                                                                                  // 240
                                                                                                                     // 241
  collection.attachSchema(CommentSchema);                                                                            // 242
                                                                                                                     // 243
  // Is handled with Meteor.methods                                                                                  // 244
  collection.allow({                                                                                                 // 245
    insert: function () { return false; },                                                                           // 246
    update: function () { return false; },                                                                           // 247
    remove: function () { return false; }                                                                            // 248
  });                                                                                                                // 249
                                                                                                                     // 250
  collection.helpers({                                                                                               // 251
    likesCount: function () {                                                                                        // 252
      if (this.likes && this.likes.length) {                                                                         // 253
        return this.likes.length;                                                                                    // 254
      }                                                                                                              // 255
                                                                                                                     // 256
      return 0;                                                                                                      // 257
    },                                                                                                               // 258
    user: function () {                                                                                              // 259
      return transformUser(this.userId);                                                                             // 260
    },                                                                                                               // 261
    createdAgo: function () {                                                                                        // 262
      return fromNowReactive(moment(this.createdAt));                                                                // 263
    },                                                                                                               // 264
    enhancedReplies: function (position) {                                                                           // 265
      return transformReplies(this);                                                                                 // 266
    }                                                                                                                // 267
  });                                                                                                                // 268
                                                                                                                     // 269
  /*                                                                                                                 // 270
   * Meteor Methods                                                                                                  // 271
   */                                                                                                                // 272
                                                                                                                     // 273
  Meteor.methods({                                                                                                   // 274
    'comments/add': function (referenceId, content) {                                                                // 275
      check(referenceId, String);                                                                                    // 276
      check(content, String);                                                                                        // 277
                                                                                                                     // 278
      content = content.trim();                                                                                      // 279
                                                                                                                     // 280
      if (!this.userId || !content) {                                                                                // 281
        return;                                                                                                      // 282
      }                                                                                                              // 283
                                                                                                                     // 284
      collection.insert(                                                                                             // 285
          { referenceId: referenceId, content: content, userId: this.userId, createdAt: (new Date()), likes: [], replies: [] }
      );                                                                                                             // 287
    },                                                                                                               // 288
    'comments/edit': function (documentId, newContent) {                                                             // 289
      check(documentId, String);                                                                                     // 290
      check(newContent, String);                                                                                     // 291
                                                                                                                     // 292
      newContent = newContent.trim();                                                                                // 293
                                                                                                                     // 294
      if (!this.userId || !newContent) {                                                                             // 295
        return;                                                                                                      // 296
      }                                                                                                              // 297
                                                                                                                     // 298
      collection.update(                                                                                             // 299
        { _id: documentId, userId: this.userId },                                                                    // 300
        { $set: { content: newContent, likes: [], image: getImageFromContent(newContent) } }                         // 301
      );                                                                                                             // 302
    },                                                                                                               // 303
    'comments/remove': function (documentId) {                                                                       // 304
      check(documentId, String);                                                                                     // 305
      collection.remove({ _id: documentId, userId: this.userId });                                                   // 306
    },                                                                                                               // 307
    'comments/like': function (documentId) {                                                                         // 308
      check (documentId, String);                                                                                    // 309
      check(this.userId, String);                                                                                    // 310
                                                                                                                     // 311
      if (!this.userId) {                                                                                            // 312
        return;                                                                                                      // 313
      }                                                                                                              // 314
                                                                                                                     // 315
      if (collection.findOne({ _id: documentId, likes: { $in: [this.userId] } })) {                                  // 316
        collection.update({ _id: documentId }, { $pull: { likes: this.userId } }, noOptOptions)                      // 317
      } else {                                                                                                       // 318
        collection.update({ _id: documentId }, { $push: { likes: this.userId } }, noOptOptions)                      // 319
      }                                                                                                              // 320
    },                                                                                                               // 321
    'comments/reply/add': function (documentId, docScope, content) {                                                 // 322
      check(documentId, String);                                                                                     // 323
      check(docScope, Object);                                                                                       // 324
      check(content, String);                                                                                        // 325
                                                                                                                     // 326
      var doc = collection.findOne({ _id: documentId }),                                                             // 327
          reply;                                                                                                     // 328
                                                                                                                     // 329
      content = content.trim();                                                                                      // 330
                                                                                                                     // 331
      if (!doc || !this.userId || !content) {                                                                        // 332
        return false;                                                                                                // 333
      }                                                                                                              // 334
                                                                                                                     // 335
      reply = {                                                                                                      // 336
        replyId: Random.id(),                                                                                        // 337
        content: content,                                                                                            // 338
        userId: this.userId,                                                                                         // 339
        createdAt: (new Date()),                                                                                     // 340
        replies: [], likes: [],                                                                                      // 341
        lastUpdatedAt: (new Date())                                                                                  // 342
      };                                                                                                             // 343
                                                                                                                     // 344
      check(reply, ReplySchema);                                                                                     // 345
                                                                                                                     // 346
      if (docScope._id) {                                                                                            // 347
        // highest level reply                                                                                       // 348
        doc.replies.unshift(reply);                                                                                  // 349
      } else if (docScope.position) {                                                                                // 350
        // nested reply                                                                                              // 351
        modifyNestedReplies(doc.replies, docScope.position, function (replies, index) {                              // 352
          replies[index].replies.unshift(reply);                                                                     // 353
        });                                                                                                          // 354
      }                                                                                                              // 355
                                                                                                                     // 356
      collection.update({ _id: documentId }, { $set: { replies: doc.replies } }, noOptOptions);                      // 357
    },                                                                                                               // 358
    'comments/reply/edit': function (documentId, docScope, newContent) {                                             // 359
      check(documentId, String);                                                                                     // 360
      check(docScope, Object);                                                                                       // 361
      check(newContent, String);                                                                                     // 362
                                                                                                                     // 363
      var doc = collection.findOne(documentId),                                                                      // 364
          userId = this.userId;                                                                                      // 365
                                                                                                                     // 366
      newContent = newContent.trim();                                                                                // 367
                                                                                                                     // 368
      if (!userId || !newContent) {                                                                                  // 369
        return;                                                                                                      // 370
      }                                                                                                              // 371
                                                                                                                     // 372
      modifyNestedReplies(doc.replies, docScope.position, function (replies, index) {                                // 373
        if (replies[index].userId === userId) {                                                                      // 374
          replies[index].content = newContent;                                                                       // 375
          replies[index].likes = [];                                                                                 // 376
          replies[index].image = getImageFromContent(newContent);                                                    // 377
        }                                                                                                            // 378
      });                                                                                                            // 379
                                                                                                                     // 380
      collection.update({ _id: documentId }, { $set: { replies: doc.replies } }, noOptOptions);                      // 381
    },                                                                                                               // 382
    'comments/reply/like': function (documentId, docScope) {                                                         // 383
      check(documentId, String);                                                                                     // 384
      check(docScope, Object);                                                                                       // 385
                                                                                                                     // 386
      var doc = collection.findOne({ _id: documentId }),                                                             // 387
          userId = this.userId;                                                                                      // 388
                                                                                                                     // 389
      if (!userId) {                                                                                                 // 390
        return;                                                                                                      // 391
      }                                                                                                              // 392
                                                                                                                     // 393
      modifyNestedReplies(doc.replies, docScope.position, function (replies, index) {                                // 394
        if (replies[index].likes.indexOf(userId) > -1) {                                                             // 395
          replies[index].likes.splice(replies[index].likes.indexOf(userId), 1);                                      // 396
        } else {                                                                                                     // 397
          replies[index].likes.push(userId);                                                                         // 398
        }                                                                                                            // 399
      });                                                                                                            // 400
                                                                                                                     // 401
      collection.update({ _id: documentId }, { $set: { replies: doc.replies }  }, noOptOptions);                     // 402
    },                                                                                                               // 403
    'comments/reply/remove': function (documentId, docScope) {                                                       // 404
      check(documentId, String);                                                                                     // 405
      check(docScope, Object);                                                                                       // 406
                                                                                                                     // 407
      var doc = collection.findOne({ _id: documentId }),                                                             // 408
          userId = this.userId;                                                                                      // 409
                                                                                                                     // 410
      if (!userId) {                                                                                                 // 411
        return;                                                                                                      // 412
      }                                                                                                              // 413
                                                                                                                     // 414
      modifyNestedReplies(doc.replies, docScope.position, function (replies, index) {                                // 415
        if (replies[index].userId === userId) {                                                                      // 416
          replies.splice(index, 1);                                                                                  // 417
        }                                                                                                            // 418
      });                                                                                                            // 419
                                                                                                                     // 420
      collection.update({ _id: documentId }, { $set: { replies: doc.replies }  }, noOptOptions);                     // 421
    },                                                                                                               // 422
    'comments/count': function (referenceId) {                                                                       // 423
      check(referenceId, String);                                                                                    // 424
      return collection.find({ referenceId: referenceId }).count();                                                  // 425
    }                                                                                                                // 426
  });                                                                                                                // 427
                                                                                                                     // 428
                                                                                                                     // 429
  if (Meteor.isServer) {                                                                                             // 430
    Meteor.publishComposite('comments/reference', function (id, limit) {                                             // 431
      check(id, String);                                                                                             // 432
      check(limit, Number);                                                                                          // 433
                                                                                                                     // 434
      return {                                                                                                       // 435
        find: function () {                                                                                          // 436
          return collection.find({ referenceId: id }, { limit: limit, sort: { createdAt: -1 } });                    // 437
        },                                                                                                           // 438
        children: [{                                                                                                 // 439
          find: function (comment) {                                                                                 // 440
            var userIds = getUserIdsByComment(comment);                                                              // 441
                                                                                                                     // 442
            return Meteor.users.find({ _id: { $in: userIds } }, { fields: { profile: 1, emails: 1, username: 1 } }); // 443
          }                                                                                                          // 444
        }]                                                                                                           // 445
      };                                                                                                             // 446
    })                                                                                                               // 447
  }                                                                                                                  // 448
                                                                                                                     // 449
  /*                                                                                                                 // 450
   * Public API                                                                                                      // 451
   */                                                                                                                // 452
                                                                                                                     // 453
  return {                                                                                                           // 454
    get: function (id) {                                                                                             // 455
      return collection.find({ referenceId: id }, { sort: { createdAt: -1 } });                                      // 456
    },                                                                                                               // 457
    getOne: function (id) {                                                                                          // 458
      return collection.findOne({ _id: id });                                                                        // 459
    },                                                                                                               // 460
    getAll: function () {                                                                                            // 461
      return collection.find({}, { sort: { createdAt: -1 } });                                                       // 462
    },                                                                                                               // 463
    add: function (referenceId, content) {                                                                           // 464
      Meteor.call('comments/add', referenceId, content);                                                             // 465
    },                                                                                                               // 466
    edit: function (documentId, newContent) {                                                                        // 467
      Meteor.call('comments/edit', documentId, newContent);                                                          // 468
    },                                                                                                               // 469
    remove: function (documentId) {                                                                                  // 470
      Meteor.call('comments/remove', documentId);                                                                    // 471
    },                                                                                                               // 472
    like: function (documentId) {                                                                                    // 473
      Meteor.call('comments/like', documentId);                                                                      // 474
    },                                                                                                               // 475
    reply: function (documentId, docScope, content) {                                                                // 476
      Meteor.call('comments/reply/add', documentId, docScope, content);                                              // 477
    },                                                                                                               // 478
    editReply: function (documentId, docScope, content) {                                                            // 479
      Meteor.call('comments/reply/edit', documentId, docScope, content);                                             // 480
    },                                                                                                               // 481
    removeReply: function (documentId, docScope) {                                                                   // 482
      Meteor.call('comments/reply/remove', documentId, docScope);                                                    // 483
    },                                                                                                               // 484
    likeReply: function (documentId, docScope) {                                                                     // 485
      Meteor.call('comments/reply/like', documentId, docScope);                                                      // 486
    },                                                                                                               // 487
    session: {                                                                                                       // 488
      set: function (key, val) {                                                                                     // 489
        return Session.set('commentsUi_' + key, val);                                                                // 490
      },                                                                                                             // 491
      get: function (key) {                                                                                          // 492
        return Session.get('commentsUi_' + key);                                                                     // 493
      },                                                                                                             // 494
      equals: function (key, val) {                                                                                  // 495
        return Session.equals('commentsUi_' + key, val);                                                             // 496
      }                                                                                                              // 497
    },                                                                                                               // 498
    changeSchema: function (cb) {                                                                                    // 499
      var currentSchema = collection.simpleSchema().schema(),                                                        // 500
        callbackResult = cb(currentSchema),                                                                          // 501
        newSchema;                                                                                                   // 502
                                                                                                                     // 503
      newSchema = callbackResult ? callbackResult : currentSchema;                                                   // 504
      !!newSchema && collection.attachSchema(newSchema, { replace: true });                                          // 505
    },                                                                                                               // 506
    _collection: collection                                                                                          // 507
  };                                                                                                                 // 508
})();                                                                                                                // 509
                                                                                                                     // 510
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['arkham:comments-ui'] = {
  Comments: Comments
};

})();

//# sourceMappingURL=arkham_comments-ui.js.map
