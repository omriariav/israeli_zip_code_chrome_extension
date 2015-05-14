/**
 * Created by Omri on 3/16/14.
 */
function onClickHandler() {
    oper = navigator.platform.substr(0,3);
    if (oper == "Mac") {
        windowWidth = 350;
        windowHeight = 370;
    }
    else {
        windowWidth = 370;
        windowHeight = 370;
    }
    x = screen.width / 2 - windowWidth / 2;
    y = screen.height / 2 - windowHeight /2;
    var url_to_index = chrome.extension.getURL('index.html');

    chrome.windows.create({
        width: windowWidth,
        height: windowHeight,
        type: 'panel',
        url: url_to_index,
        top: y,
        left: x
    });
};

chrome.browserAction.onClicked.addListener(onClickHandler);
chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.runtime.onInstalled.addListener(function() {
    registerContextMenus();
});

function registerContextMenus() {
    var pagecontext = 'all';
    var pagetitle = "חיפוש מיקוד";
    var pageid = chrome.contextMenus.create({"title": pagetitle, "contexts":[pagecontext],
        "id": "context" + pagecontext} );
}