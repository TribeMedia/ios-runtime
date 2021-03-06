# ios-runtime

## Clone the repository
Use `--recursive` flag to `git clone` command to clone all repository dependencies

```
git clone git@github.com:NativeScript/ios-runtime.git --recursive
```
or if you have already cloned it without `--recursive` flag just run

```
git submodule update --init --recursive
```

## Installing Grunt
We have a [grunt](http://gruntjs.com) build setup. To run the build you will need to be able to exec the following tools from the command line:
 - [node](http://nodejs.org)
 - [npm](http://npmjs.org)
 - Xcode6
 - [xcodebuild](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/xcodebuild.1.html) (using Xcode6, in case of multiple Xcode installations check [xcode-select](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/xcode-select.1.html))
 - [xcpretty](https://github.com/supermarin/xcpretty)
 - [homebrew](http://brew.sh/) - Used to install various dependencies
 - [cmake](http://www.cmake.org/) - Required at path, install with `brew install cmake`
 - [llvm](http://llvm.org/) - Install with `brew tap homebrew/versions`, `brew install llvm36`

With npm install grunt-cli:
`sudo npm install -g grunt-cli`

Then install the grunt modules in the **root** of the repo:
`npm install`

## Building JavaScriptCore
To build JavaScriptCore run `grunt jsc`.

#### Artefacts
The build should produce a `dist/jsc` folder.

## Creating an Xcode Project
```shell
mkdir cmake-build && cd cmake-build
cmake .. -G Xcode -DCMAKE_OSX_SYSROOT=iphoneos -DCMAKE_C_COMPILER_WORKS=YES -DCMAKE_CXX_COMPILER_WORKS=YES -DCMAKE_INSTALL_PREFIX=../dist
```

## NPM Package Build
To build npm package run `grunt package` in the **root** of the repo.

#### Artefacts
The build should produce a `dist/tns-ios-*.tgz` file which is the NPM package. It should contain NativeScript, NativeScript template project, MetadataGenerator and WebInspectorUI.

## Test
To run the tests on a connected device: `grunt test`.

#### Artefacts
There should be a `junit-result.xml` file in the root of the repo.
