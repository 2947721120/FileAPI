/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

/*global QUnit:true, alert:true*/

'use strict';


// 不要再订购测试
QUnit.config.reorder = false;
// 串行测试，而不是并行的。
QUnit.config.autorun = false;

// 发短信给家长PhantomJS过程通过警报！好时光！！
function sendMessage() {
  var args = [].slice.call(arguments);
  alert(JSON.stringify(args));
}

//这些方法对连接Qunit PhantomJS。
QUnit.log(function(obj) {
  // What is this I don’t even
  if (obj.message === '[object Object], undefined:undefined') { return; }
  // 在发送之前解析一些东西。
  var actual = QUnit.jsDump.parse(obj.actual);
  var expected = QUnit.jsDump.parse(obj.expected);
  //把它
  sendMessage('qunit.log', obj.result, actual, expected, obj.message, obj.source);
});

QUnit.testStart(function(obj) {
  sendMessage('qunit.testStart', obj.name);
});

QUnit.testDone(function(obj) {
  sendMessage('qunit.testDone', obj.name, obj.failed, obj.passed, obj.total);
});

QUnit.moduleStart(function(obj) {
  sendMessage('qunit.moduleStart', obj.name);
});

QUnit.moduleDone(function(obj) {
  sendMessage('qunit.moduleDone', obj.name, obj.failed, obj.passed, obj.total);
});

QUnit.begin(function() {
  sendMessage('qunit.begin');
});

QUnit.done(function(obj) {
  sendMessage('qunit.done', obj.failed, obj.passed, obj.total, obj.runtime);
});
