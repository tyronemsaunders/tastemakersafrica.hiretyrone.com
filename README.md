## Installation
Installation of ngSassFoundation relies on Node.js' package ecosystem, npm so first install [nodejs](http://nodejs.org).
Once Node.js is installed we can use npm to install the required global packages:

`$ sudo npm -g install gulp-cli gulp bower`

Now that that's done clone this repository using git.  Note: If you use the command line you may need to install git as well.

```
$ git clone git://github.com/tyronemsaunders/ngSassFoundation my-project-name
$ cd my-project-name
```

Once this repository has been downloaded to your project's directory we are ready to install the local build dependencies.  This will read the dependencies and devDependencies from package.json and install everything needed into a folder called node-modules/.

`$ npm install`

Next install the frontend packages using Bower.  This will install the packages into a folder called vendor/.  The file .bowerrc changes the bower install directory from the default of bower_components to vendor/.

`$ bower install`

The last step is to build all the files.  This is where the magic happens.  The instructions in gulpfile.js tell the build system to pull files from the vendor and src directories and build them into the webapp.

`$ gulp`

navigate to build/index.html and your app should be running. 

## Purpose
TBD

## Tutorial
1. Build your angular app in the src/app and src/assets directories.
2. Run `$ gulp` to build your app which will place build files in the build\ directory an production ready minified files in the bin\ directory.
3. Clean the build\ and bin\ directory by running `$ gulp clean`

Reference [AngularJS](http://www.angularjs.org), [Foundation for Sites](http://foundation.zurb.com/sites), [Foundation 6 Directives for Angular 1.5](http://circlingthesun.github.io/angular-foundation-6/), [Font Awesome](http://fontawesome.io/), and [Josh David Miller's](http://joshdavidmiller.com/) [ngbp](https://github.com/ngbp/ngbp) for details regarding the tools used to build this boilerplate.

## TODO
Here is a list of things I think this project needs.

* Add more detail to this Readme file
* Implement a Jasmine Testing Framework
* Implement a Karma Test Runner
* Implement E2E testing
* Add favicon support
* Add the ability to pick and choose Foundation components