var foundation = require('Foundation');
var objectivec = require('ObjectiveC');
var uikit = require('UIKit');
var tnsapi = require('TNSApi');
var tnstestnativecallbacks = require('TNSTestNativeCallbacks');
var tnsprimitives = require('TNSPrimitives');

describe(module.id, function () {
    afterEach(function () {
        TNSClearOutput();
    });

    it("NativeArrayWithArray", function () {
        var object = foundation.NSArray.arrayWithArray([0, 1, '2']);
        expect(object.objectAtIndex(0)).toBe(0);
        expect(object.objectAtIndex(1)).toBe(1);
        expect(object.objectAtIndex(2)).toBe('2');
        expect(object.count).toBe(3);
        expect(object.hash).toBe(3);
    });

    it("MethodCalledInDealloc", function () {
        expect(function () {
            (function () {
                var JSApi = tnsapi.TNSApi.extend({});
                new JSApi();
            }());

            // TODO
            // [self collectGarbage];
        }).not.toThrow();
    });

    it("CustomGetterAndSetter", function () {
        var object = new tnsapi.TNSApi();
        expect(object.property).toBe(0);
        object.property = 3;
        expect(object.property).toBe(3);

        tnstestnativecallbacks.TNSTestNativeCallbacks.apiCustomGetterAndSetter(object);
    });

    it("OverrideWithCustomGetterAndSetter", function () {
        var JSApi = tnsapi.TNSApi.extend({
            get property() {
                return -Object.getOwnPropertyDescriptor(tnsapi.TNSApi.prototype, 'property').get.call(this);
            },
            set property(x) {
                Object.getOwnPropertyDescriptor(tnsapi.TNSApi.prototype, 'property').set.call(this, x * 2);
            },
        });
        var object = new JSApi();
        expect(object.property).toBe(0);
        object.property = 3;
        expect(object.property).toBe(-6);

        tnstestnativecallbacks.TNSTestNativeCallbacks.apiOverrideWithCustomGetterAndSetter(object);
    });

    // TODO
    // it("BigIntMethods", function() {
    //      var bigInt = functionWithLongLong('9223372036854775807');
    //      assert(bigInt.value === '9223372036854775807');
    //      assert(isNaN(bigInt.valueOf()));
    //      assert(('' + bigInt) === 'NaN');
    //      assert(bigInt.toString() === '9223372036854775807');
    //      assert(isNaN(1 + bigInt));
    // });

    // TODO
    // it("BigIntEdgeCases", function() {
    //      assert(functionWithLongLong(9007199254740992) === 9007199254740992);
    //      assert(functionWithLongLong('9007199254740993').toString() === '9007199254740993');

    //      assert(functionWithLongLong(-9007199254740992) === -9007199254740992);
    //      assert(functionWithLongLong('-9007199254740993').toString() === '-9007199254740993');
    // });

    // TODO: check object
//    it("CFDictionary", function() {
//        var object = new NSMutableDictionary();
//        object.setObjectForKey('value', 'key');
//        var value = CFDictionaryGetValue(object, 'key');
//    });

    it("instanceOfNativeClass", function () {
        var array = new NSMutableArray();
        expect(array instanceof NSMutableArray).toBe(true);
        expect(array instanceof foundation.NSArray).toBe(true);
        expect(array instanceof objectivec.NSObject).toBe(true);
    });

    it("instanceOfDerivedClass", function () {
        var JSObject = TNSDerivedInterface.extend({});
        var object = JSObject.alloc().init();
        expect(object instanceof JSObject).toBe(true);
        expect(object instanceof TNSDerivedInterface).toBe(true);
        expect(object instanceof objectivec.NSObject).toBe(true);
    });

    it("instanceOfUITabBarController", function () {
        var object = uikit.UITabBarController.alloc().init();
        expect(object instanceof uikit.UITabBarController).toBe(true);
        expect(object instanceof uikit.UIViewController).toBe(true);
        expect(object instanceof uikit.UIResponder).toBe(true);
        expect(object instanceof objectivec.NSObject).toBe(true);
    });

    it("Appearance", function () {
        expect(uikit.UILabel.appearance().description.indexOf('<Customizable class: UILabel>')).not.toBe(-1);

        uikit.UILabel.appearance().textColor = uikit.UIColor.redColor();
        expect(uikit.UILabel.appearance().textColor).toBe(uikit.UIColor.redColor());
        expect(uikit.UILabel.appearance().constructor).toBe(uikit.UILabel);
    });

    it("ReadonlyPropertyInProtocolAndOverrideWithSetterInInterface", function () {
        var object = new uikit.UIView();
        object.bounds = {
            origin: {
                x: 10,
                y: 20
            },
            size: {
                width: 30,
                height: 40
            }
        };

        tnstestnativecallbacks.TNSTestNativeCallbacks.apiReadonlyPropertyInProtocolAndOverrideWithSetterInInterface(object);
    });

    it("DescriptionOverride", function () {
        var object = objectivec.NSObject.extend({
            get description() {
                return 'js description';
            }
        }).alloc().init();

        expect(object.description).toBe('js description');
        expect(object.toString()).toBe('js description');

        tnstestnativecallbacks.TNSTestNativeCallbacks.apiDescriptionOverride(object);
    });

    it("ProtocolClassConflict", function () {
        expect(foundation.NSProtocolFromString("NSObject")).toBe(objectivec.NSObjectProtocol);
    });

    it("NSMutableArrayMethods", function () {
        var JSMutableArray = foundation.NSMutableArray.extend({
            init: function () {
                var self = foundation.NSMutableArray.prototype.init.apply(this, arguments);
                self._array = [];
                return self;
            },
// TODO
//            dealloc: function() {
//                TNSLog(this.count);
//                delete this._array;
//                NSMutableArray.prototype.dealloc.apply(this, arguments);
//            },
            insertObjectAtIndex: function (anObject, index) {
                this._array.splice(index, 0, anObject);
            },
            removeObjectAtIndex: function (index) {
                this._array.splice(index, 1);
            },
            addObject: function (anObject) {
                this._array.push(anObject);
            },
            removeLastObject: function () {
                this._array.pop();
            },
            replaceObjectAtIndexWithObject: function (index, anObject) {
                this._array[index] = anObject;
            },
            objectAtIndex: function (index) {
                return this._array[index];
            },
            get count() {
                return this._array.length;
            },
            get hash() {
                return this.count;
            }
        }, {
            name: 'JSMutableArray'
        });

        (function () {
            var array = new JSMutableArray();
            tnstestnativecallbacks.TNSTestNativeCallbacks.apiNSMutableArrayMethods(array);
        }());
        __collect();

        expect(TNSGetOutput()).toBe('44abcd');
    });

    it("SpecialCaseProperty_When_InstancesRespondToSelector:_IsFalse", function () {
        var field = new uikit.UITextField();
        expect(field.secureTextEntry).toBe(false);
        field.secureTextEntry = true;
        expect(field.secureTextEntry).toBe(true);
    });

    it("TypedefPointerClass", function () {
        expect(tnsapi.TNSApi.alloc().init().strokeColor).toBeNull();
    });

    it("GlobalObjectProperties", function () {
        var propertyNames = Object.getOwnPropertyNames(global);
        expect(propertyNames).toContain("NSTimeZoneNameStyle");
        expect(propertyNames).toContain("UITextViewTextDidChangeNotification");
        expect(propertyNames).toContain("UIApplicationStateRestorationBundleVersionKey");
        expect(propertyNames.length).toBeGreaterThan(4000);
    });

    it("ApiIterator", function () {
        var counter = 0;

        Object.getOwnPropertyNames(global).forEach(function (x) {
            // console.debug(x);

            var symbol = global[x];

            if (objectivec.NSObject.isPrototypeOf(symbol) || symbol === objectivec.NSObject) {
                var klass = symbol;
                expect(klass).toBeDefined();

                // console.debug(klass);

                Object.getOwnPropertyNames(klass).forEach(function (y) {
                    if (klass.respondsToSelector(y)) {
                        // console.debug(x, y);

                        var method = klass[y];
                        expect(method).toBeDefined();

                        counter++;
                    }
                });

                Object.getOwnPropertyNames(klass.prototype).forEach(function (y) {
                    if (klass.instancesRespondToSelector(y)) {
                        // console.debug(x, "proto", y);

                        var property = Object.getOwnPropertyDescriptor(klass.prototype, y);

                        if (!property) {
                            var method = klass.prototype[y];
                            expect(method).toBeDefined();
                        }

                        counter++;
                    }
                });
            }
        });

        expect(counter).toBeGreaterThan(2900);
    });

    it("NSObjectSuperClass", function () {
        expect(objectivec.NSObject.superclass()).toBeNull();
        expect(objectivec.NSObject.alloc().init().superclass).toBeNull();
    });

    it("NSObjectAsId", function () {
        expect(objectivec.NSObject.respondsToSelector('description')).toBe(true);
    });

    it("FunctionLength", function () {
        expect(tnsprimitives.functionWithInt.length).toBe(1);
        expect(objectivec.NSObject.isSubclassOfClass.length).toBe(1);
    });

    it("ArgumentsCount", function () {
        expect(function () {
            objectivec.NSObject.alloc().init(3);
        }).toThrowError();
    });

    it("Swizzle", function () {
        var object = tnsapi.TNSSwizzleKlass.alloc().init();

        (function () {
            var nativeProperty = Object.getOwnPropertyDescriptor(tnsapi.TNSSwizzleKlass.prototype, 'aProperty');
            Object.defineProperty(tnsapi.TNSSwizzleKlass.prototype, 'aProperty', {
                get: function () {
                    return 2 * nativeProperty.get.call(this);
                },
                set: function (x) {
                    nativeProperty.set.call(this, 2 * x);
                }
            });

            var nativeStaticMethod = tnsapi.TNSSwizzleKlass.staticMethod;
            tnsapi.TNSSwizzleKlass.staticMethod = function (x) {
                return 2 * nativeStaticMethod.apply(this, arguments);
            };

            var nativeInstanceMethod = tnsapi.TNSSwizzleKlass.prototype.instanceMethod;
            tnsapi.TNSSwizzleKlass.prototype.instanceMethod = function (x) {
                return 2 * nativeInstanceMethod.apply(this, arguments);
            };

            object.aProperty = 4;
            expect(object.aProperty).toBe(16);
            expect(tnsapi.TNSSwizzleKlass.staticMethod(4)).toBe(8);
            expect(object.instanceMethod(4)).toBe(8);

            tnstestnativecallbacks.TNSTestNativeCallbacks.apiSwizzle(tnsapi.TNSSwizzleKlass.alloc().init());
            expect(TNSGetOutput()).toBe('1266');
            TNSClearOutput();
        }());

        (function () {
            var swizzledProperty = Object.getOwnPropertyDescriptor(tnsapi.TNSSwizzleKlass.prototype, 'aProperty');
            Object.defineProperty(tnsapi.TNSSwizzleKlass.prototype, 'aProperty', {
                get: function () {
                    return 3 * swizzledProperty.get.call(this);
                },
                set: function (x) {
                    swizzledProperty.set.call(this, 3 * x);
                }
            });

            var swizzledStaticMethod = tnsapi.TNSSwizzleKlass.staticMethod;
            tnsapi.TNSSwizzleKlass.staticMethod = function (x) {
                return 3 * swizzledStaticMethod.apply(this, arguments);
            };

            var swizzledInstanceMethod = tnsapi.TNSSwizzleKlass.prototype.instanceMethod;
            tnsapi.TNSSwizzleKlass.prototype.instanceMethod = function (x) {
                return 3 * swizzledInstanceMethod.apply(this, arguments);
            };

            object.aProperty = 4;
            expect(object.aProperty).toBe(144);
            expect(tnsapi.TNSSwizzleKlass.staticMethod(4)).toBe(24);
            expect(object.instanceMethod(4)).toBe(24);

            tnstestnativecallbacks.TNSTestNativeCallbacks.apiSwizzle(tnsapi.TNSSwizzleKlass.alloc().init());
            expect(TNSGetOutput()).toBe('1081818');
            TNSClearOutput();
        }());
    });
});
