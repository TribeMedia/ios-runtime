(function (applicationPath, createModuleFunction, isValidNativeModule, createNativeModule) {
    'use strict';

    function ModuleError() {
        var tmp = Error.apply(this, arguments);
        this.message = tmp.message;
        Object.defineProperty(this, 'stack', { get: function() { return tmp.stack }});
    }
    ModuleError.prototype = Object.create(Error.prototype);
    ModuleError.prototype.constructor = ModuleError;
    global.ModuleError = ModuleError;

    var CORE_MODULES_ROOT = NSString.stringWithString("tns_modules");
    var USER_MODULES_ROOT = NSString.stringWithString("app");

    var fileManager = NSFileManager.defaultManager();
    var nsstr = NSString.stringWithString.bind(NSString);

    applicationPath = nsstr(applicationPath).stringByStandardizingPath;

    var isDirectory = new interop.Reference();

    function __findModule(moduleIdentifier, previousPath) {
        if (!previousPath) {
            previousPath = NSString.pathWithComponents([USER_MODULES_ROOT, 'index.js']).toString();
        }
        var absolutePath;
        if (/^\.{1,2}\//.test(moduleIdentifier)) { // moduleIdentifier starts with ./ or ../
            var moduleDir = nsstr(previousPath).stringByDeletingLastPathComponent;
            absolutePath = NSString.pathWithComponents([applicationPath, moduleDir, moduleIdentifier]);
        } else if (/^\//.test(moduleIdentifier)) { // moduleIdentifier starts with /
            absolutePath = NSString.pathWithComponents([moduleIdentifier]);
        } else {
            moduleDir = CORE_MODULES_ROOT;
            absolutePath = NSString.pathWithComponents([applicationPath, moduleDir, moduleIdentifier]);
        }

        if (fileManager.fileExistsAtPathIsDirectory(absolutePath, isDirectory)) {
            if (!isDirectory.value) {
                throw new ModuleError("Expected '" + absolutePath + "' to be a directory");
            }

            var mainFileName = "index.js";

            var packageJsonPath = nsstr(absolutePath).stringByAppendingPathComponent("package.json");
            var packageJson = NSString.stringWithContentsOfFileEncodingError(packageJsonPath, NSUTF8StringEncoding, null);
            if (packageJson) {
                //console.debug("PACKAGE_FOUND: " + packageJsonPath);

                try {
                    mainFileName = JSON.parse(packageJson).main || mainFileName;
                } catch (e) {
                    throw new ModuleError("Error parsing package.json in '" + absolutePath + "'");
                }
            }

            absolutePath = nsstr(absolutePath).stringByAppendingPathComponent(mainFileName);
        } else {
            absolutePath = nsstr(absolutePath).stringByAppendingPathExtension("js");
        }
        absolutePath = nsstr(absolutePath).stringByStandardizingPath;

        if (fileManager.fileExistsAtPathIsDirectory(absolutePath, isDirectory)) {
            if (isDirectory.value) {
                throw new ModuleError("Expected '" + absolutePath + "' to be a file");
            }

            //console.debug('FIND_MODULE:', moduleIdentifier, absolutePath);

            return {
                name: nsstr(moduleIdentifier).lastPathComponent,
                path: absolutePath,
                bundlePath: absolutePath.substr(applicationPath.length)
            };
        } else {
            throw new ModuleError("Failed to find module '" + moduleIdentifier + "' relative to '" + previousPath + "'. Computed path: " + absolutePath);
        }
    }

    function __executeModule(moduleMetadata, module) {
        var modulePath = moduleMetadata.bundlePath;
        module.require = function require(moduleIdentifier) {
            return __loadModule(moduleIdentifier, modulePath).exports;
        };
        var moduleSource = NSString.stringWithContentsOfFileEncodingError(moduleMetadata.path, NSUTF8StringEncoding, null);
        var moduleFunction = createModuleFunction(moduleSource, moduleMetadata.bundlePath, moduleMetadata.name);
        var fileName = moduleMetadata.path;
        var dirName = nsstr(moduleMetadata.path).stringByDeletingLastPathComponent.toString();
        module.filename = fileName;
        moduleFunction(module.require, module, module.exports, dirName, fileName);
    }

    var modulesCache = new Map();
    function __loadModule(moduleIdentifier, previousPath) {
        if (/\.js$/.test(moduleIdentifier)) {
            throw new Error('Module identifiers may not have file-name extensions like ".js"');
        }

        var key = "";
        var module = {};

        if (isValidNativeModule(moduleIdentifier))
        {
            key = moduleIdentifier;
            if (modulesCache.has(key)) {
                return modulesCache.get(key);
            }

            module = createNativeModule(moduleIdentifier);
        } else {
            var moduleMetadata = __findModule(moduleIdentifier, previousPath);

            key = moduleMetadata.bundlePath;
            if (modulesCache.has(key)) {
                return modulesCache.get(key);
            }

            module.exports = {};
            module.id = moduleMetadata.bundlePath;

            __executeModule(moduleMetadata, module);
        }

        modulesCache.set(key, module);

        return module;
    }

    return __loadModule;
});
