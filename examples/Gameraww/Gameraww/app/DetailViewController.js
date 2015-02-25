var uikit = require('UIKit');
var utils = require('./Utils');

var JSDetailViewController = uikit.UIViewController.extend({
  viewWillAppear: function(animated) {
    var navigationItem = this.navigationItem;
    navigationItem.title = this.item["title"];
    this.activityIndicator().startAnimating();

    var url = this.item["url"];

    if (!url.match(/.jpg$/)) {
      url += ".jpg";
    }

    var self = this;
    utils.imageViewLoadFromURL(this.imageView(), url, function(error) {
      self.activityIndicator().stopAnimating();
      self.toggleTopBarVisibility();
    });

    uikit.UIViewController.prototype.viewWillAppear.call(this, animated);
  },

  prefersStatusBarHidden: function() {
    var navigationController = this.navigationController;
    var navigationBarHidden = navigationController.navigationBarHidden;
    return navigationBarHidden;
  },

  toggleTopBarVisibility: function() {
    var navigationController = this.navigationController;
    var navigationBarHidden = navigationController.navigationBarHidden;
    console.log(navigationBarHidden);

    this.navigationController.setNavigationBarHiddenAnimated(!navigationBarHidden, true);
  },

  imageView: function() {
    return this.pImageView;
  },

  "setImageView:": function(aImageView) {
    this.pImageView = aImageView;
  },

  activityIndicator: function() {
    return this.pActivityIndicator;
  },

  "setActivityIndicator:": function(aActivityIndicator) {
    this.pActivityIndicator = aActivityIndicator;
  },
  viewForZoomingInScrollView: function(scrollView) {
    return this.pImageView;
  }
}, {
  name: "JSDetailViewController",
  exposedMethods: {
    "toggleTopBarVisibility": { returns: interop.types.void },
    "imageView": { returns: uikit.UIImageView },
    "setImageView:": { returns: interop.types.void, params: [ uikit.UIImageView ] },
    "activityIndicator": { returns: uikit.UIActivityIndicatorView },
    "setActivityIndicator:": { returns: interop.types.void, params: [ uikit.UIActivityIndicatorView ] }
  },
  protocols: [ uikit.UIScrollViewDelegate ]
});
