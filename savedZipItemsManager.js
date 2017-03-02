var format = require('string-format')
var localStorageManager = require('./localStorageManager');
var copyTextToClipboard = require('./copyTextToClipboard');
var equal = require('deep-equal');
var uuid = require('node-uuid');

var itemsContainer = $('.saved-zips');
var tempIdToItem = {};
localStorageManager.getZipItems()
.then(function(zipItems) {
    zipItems.forEach(addZipItemToDom);
});

itemsContainer.on('click', '.copy-zip-btn', function() {
    var $this = $(this);
    var zip = $this.data('zip');
    copyTextToClipboard(zip);
    $this.html('הועתק!');
})
.on('click', '.delete-btn', function() {
    var $this = $(this);
    var id = $this.data('id');
    var item = tempIdToItem[id];
    localStorageManager.deleteZipItem(item);
    tempIdToItem[id] = undefined;
    $this.parent('.saved-zip').remove();
});

function addZipItemToDom(item) {
    var id = uuid.v4();
    tempIdToItem[id] = item;
    var zip = item.zip || "";
    var element = $('<div class="alert alert-success saved-zip"></div>');
    var text = format('<div class="address">{0} <b>({1})</b></div>', getSavedZipElementText(item), zip);
    element.append(text);
    element.append('<button type="button" class="btn btn-success btn-sm copy-zip-btn" data-zip="' + item.zip + '">העתק מיקוד</button>');
    element.append('<button type="button" class="btn btn-danger delete-btn" data-id="' + id + '">X</button>');
    
    itemsContainer.append(element);
}

function getSavedZipElementText(item) {
    if(item.pob) {
        return format('תא דואר {0}', item.pob);
    } else {
        var entrance = item.entrance ? (',כניסה ' + item.entrance) : '';
        return format('{street} {house} {entrance}, {city}', {
            street: item.street,
            house: item.house,
            entrance: entrance,
            city: item.city
        });
    }
}

window.saveZipItem = function(zip, city, street, house, pob, entrance) {
    var zipItem = {
        zip: zip,
        city: city,
        street: street,
        house: house,
        pob: pob,
        entrance: entrance
    }
    
    localStorageManager.addZipItem(zipItem)
    .then(function(wasAdded) {
        if(wasAdded)    addZipItemToDom(zipItem);
    });
}