var Promise = require('bluebird');
var equal = require('deep-equal');

var localStorageManager = {
  getZipItems: function() {
    var promise = new Promise(function(resolve, reject) {
        try {
            chrome.storage.local.get('zipItems', function(data) {
                if(!data.zipItems) {
                    resolve([]);
                    return;
                }

                var items = JSON.parse(data.zipItems);
                resolve(items);
            });
        } catch(error) {
            reject(error);
        }
    });
    
    return promise;
  },

  addZipItem: function(item) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
        self.getZipItems()
        .then(function(items) {
            var duplicate = items.find(function(element) {
                return equal(element, item);
            });
            if(duplicate) {
                resolve(false);
                return;
            }
            
            items.unshift(item);
            self._saveItems(items);
            resolve(true);
        });
    });
  },
  
  deleteZipItem: function(item) {
    var self = this;
    
    self.getZipItems()
    .then(function(items) {
        var index;
        var itemToDelete = items.find(function(element, i) {
            index = i;
            return equal(element, item);
        });
        
        if(itemToDelete) {
            items.splice(index, 1);
            self._saveItems(items);
        }
    });
  },

  _saveItems: function(items) {
    chrome.storage.local.set({zipItems: JSON.stringify(items)});
  }
};

module.exports = localStorageManager;
