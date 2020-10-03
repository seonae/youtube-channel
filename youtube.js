function getVideos(nextToken, onResult, onError) {
    if (nextToken) {
        if (_loadNextPage()) {
            setTimeout(function() {
                _getVideos(nextToken, 3, onResult, onError);
            }, 200)    
        } else {
            onResult({ "videos":[] })
        }
    } else {
        _getVideos(0, 1, onResult, onError);        
    }
}

function _getVideos(location, waitingCount, onResult, onError) {
    try {
        var videoItems = document.getElementsByTagName('ytm-compact-video-renderer')
        var videos = []

        if (videoItems.length > location) {
            for (var i = location; i < videoItems.length; i++) {
                try {
                    videos.push({
                        "url":videoItems[i].getElementsByClassName('compact-media-item-image')[0].href,
                        "title":videoItems[i].getElementsByClassName('compact-media-item-headline')[0].textContent,
                        "viewCount":videoItems[i].getElementsByClassName('compact-media-item-stats')[0].textContent,
                        "publishedDate":videoItems[i].getElementsByClassName('compact-media-item-stats')[1].textContent
                    })
                } catch (e) {
                    // eat up
                }
            }
    
            if (waitingCount > 0) {
                setTimeout(function() {
                    _getVideos(location, waitingCount - 1, onResult, onError)
                }, 200)
            } else {
                onResult({ "videos":videos })
            }
        } else {
            setTimeout(function() {
                _getVideos(location, waitingCount, onResult, onError)
            }, 200)
        }
    } catch (e) {
        onError();
    }
}

function _loadNextPage() {
    try {
        document.getElementsByTagName('c3-next-continuation')[0]
                .getElementsByTagName('button')[0]
                .click()
    } catch (e) {
        return false;
    }

    return true;
}

function getChannelInfo(onResult, onError) {
    _getChannelInfo(onResult, onError);
}

function _getChannelInfo(onResult, onError) {
    try {
        var subscribeDiv = document.getElementsByClassName('c4-tabbed-header-subscibe')[0]
        var subscribeText = subscribeDiv.getElementsByClassName('button-renderer-text')[0].textContent
        
        if (document.getElementsByClassName('profile-icon-img')[0].src) {
            onResult({ "channelInfo":{
                "title":document.getElementsByClassName('c4-tabbed-header-title')[0].textContent,
                "logoUrl":document.getElementsByClassName('profile-icon-img')[0].src,
                "subscriberCount":document.getElementsByClassName('c4-tabbed-header-subscriber-count')[0].textContent,
                "loggedIn":(document.getElementsByClassName('pivot-subs').length > 0) ? true : false,
                "subscribing":(subscribeText === "구독중") ? true : false
            }})    
        } else {
            console.log("_getChannelInfo")

            setTimeout(function() {
                _getChannelInfo(onResult, onError)
            }, 200);
        }
    } catch (e) {
        setTimeout(function() {
            _getChannelInfo(onResult, onError)
        }, 200);
    }
}

function subscribe(onResult, onError) {
    _subscribe(onResult, onError);
}

function _subscribe(onResult, onError) {
    try {
        var subscribeDiv = document.getElementsByClassName('c4-tabbed-header-subscibe')[0];
        var subscribeButton = subscribeDiv.getElementsByClassName('c3-material-button-button')[0];

        subscribeButton.click();

        setTimeout(function() {
            onResult();
        }, 200);
    } catch (e) {
        setTimeout(function() {
            _subscribe(onResult, onError)
        }, 200);
    }
}

