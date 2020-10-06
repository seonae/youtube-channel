var module = (function() {
    const webjs = require("webjs-helper"),
          feed  = require("webjs-feed");

    var _id = "", _channel_id = "", _handlers = [];
    var _dir_path = "";
    var _web_loaded = false;

    function _on_web_loaded(data) {
        console.log("get_videos")

        if (data["url"].startsWith("https://m.youtube.com/channel")) {
            webjs.import(_dir_path + "/youtube.js");

            _handlers.forEach(function(handler) {
                handler();
            });

            if (!feed.is_web_loaded()) {
                feed.on_web_loaded();
            }

            _web_loaded = true, _handlers = [];
        }
    }

    return {
        initialize: function(id, channel_id) {
            var web_prefix = id.replace(".", "_");
            var dir_path = this.__ENV__["dir-path"];

            global[web_prefix + "__on_web_loaded"] = function(data) {
                _on_web_loaded(data);
            }

            webjs.initialize(id + ".web", "__$_bridge");
            view.object(id).action("load", { 
                "filename":dir_path + "/web.sbml",
                "web-id":id, 
                "web-prefix":web_prefix,
                "channel-id":channel_id
            });

            _id = id, _channel_id = channel_id, _dir_path = dir_path;

            return this;
        },

        get_channel_id: function() {
            return _channel_id;
        },

        get_channel_info: function() {
            return new Promise(function(resolve, reject) {
                var handler = function() {
                    webjs.call("getChannelInfo")
                        .then(function(result) {
                            resolve({
                                "title":result["channelInfo"]["title"],
                                "logo-url":result["channelInfo"]["logoUrl"],
                                "subscriber-count":result["channelInfo"]["subscriberCount"],
                                "logged-in":result["channelInfo"]["loggedIn"] ? "yes" : "no",
                                "subscribing":result["channelInfo"]["subscribing"] ? "yes" : "no"
                            });
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                }
                
                _web_loaded ? handler() : _handlers.push(handler);
            });
        },

        get_videos: function(location) {
            return new Promise(function(resolve, reject) {
                var handler = function() {
                    feed.feed("videos", function(next_token) {
                        webjs.call("getVideos", [ next_token ])
                            .then(function(result) {
                                var videos = [];
                
                                result["videos"].forEach(function(video) {
                                    videos.push({
                                        "video-id":video["url"].match(/v=([^&#]+)/)[1],
                                        "title":video["title"],
                                        "view-count":video["viewCount"],
                                        "published-at":video["publishedDate"],
                                        "duration":video["duration"]
                                    });
                                });
                
                                feed.on_feed_done("videos", location + result["videos"].length);
                                resolve(videos);
                            })
                            .catch(function(error) {
                                reject(error);
                            });
                    })
                }

                if (location === 0 && feed.is_web_loaded()) {
                    feed.reset();
                    view.object(_id + ".web").action("home");

                    _web_loaded = false;
                }

                _web_loaded ? handler() : _handlers.push(handler);
            });
        },

        subscribe: function() {
            return new Promise(function(resolve, reject) {
                var handler = function() {
                    webjs.call("subscribe")
                        .then(function() {
                            resolve();
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                }

                _web_loaded ? handler() : _handlers.push(handler);
            });
        },
    }
})();

__MODULE__ = module;
