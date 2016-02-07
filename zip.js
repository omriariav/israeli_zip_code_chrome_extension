function formCity() {
    $('#formCity').autocomplete({
        serviceUrl: 'https://www.israelpost.co.il/zip_data.nsf/CreateLocationsforAutocomplete?OpenAgent&callback=?',
        paramName: 'StartsWith',
        dataType: 'jsonp',
        noCache: true,

        beforeRender: function(container) {
        },
        transformResult: function(response,orgquery) {
            return {
                suggestions: $.map(response['locations'], function(item,i) {
                    return { value: item.n, data: item.n };

                })
            };
        },
        onSelect: function (suggestion) {
            $('#formCity').val(suggestion.value);
//            storeCurrentFormInputs();
            $('#formStreet').show();
            $('#formHouse').show();
            $('#formEntrance').show();
            $('#sub_text').show();
            $('#formPob').show();
            formStreet(suggestion.value);
        }
    });
}

function formStreet(location) {
    $('#formStreet').autocomplete({
        serviceUrl: 'https://www.israelpost.co.il/zip_data.nsf/CreateStreetsforAutocomplete?OpenAgent&Location='+location,
        paramName: 'StartsWith',
        dataType: 'jsonp',
        noCache: true,
        beforeRender: function(container) {
        },
        transformResult: function(response,orgquery) {
            return {
                suggestions: $.map(response['streets'], function(item,i) {

                    return { value: item.n, data: item.id };

                })
            };
        },
        onSelect: function (suggestion) {
            $('#formStreet').val(suggestion.value);
            storeCurrentFormInputs();
            $('#formStreetId').val(suggestion.data);
            formCity(suggestion.value);
        }
    });
}

function trackButtonClick(e) {
    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
};

function clear_fields() {
    localStorage.clear();
    location.reload();

}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function resizeBox() {
    oper = navigator.platform.substr(0,3);
    
    if (oper == "Mac") {
        deltaHeight = 50;
        deltaWidth = 0;
    }
    else {
        deltaHeight = 50;
        deltaWidth = 50;
    }
    var bodyHeight = $('.container').height() + deltaHeight;
    var bodyWidth = $('.container').width() + deltaWidth;
    var screenWidth = screen.width;
    var screenHeight = screen.height;
    chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {top: Math.round(screenHeight / 2 - bodyHeight / 2),
        left: Math.round(screenWidth / 2 - bodyWidth / 2), width: bodyWidth, height: bodyHeight
    });
}

function getZipCode() {
    $('#verification').hide();
    $('#formZip').hide();
    var street = $.trim($('#formStreet').val());
    var city = $.trim($('#formCity').val());
    var house = $.trim($('#formHouse').val());
    var pob = $.trim($('#formPob').val());
    var entrance = $('#formEntrance').val();
    var zip = $('#zipInput').val();
    var gotoPostalSiteFlag = clientSideVerifier(street, pob, house, zip);
    if (gotoPostalSiteFlag == true) {
        var url = "https://www.israelpost.co.il/zip_data.nsf/SearchZip?OpenAgent&Location="+encodeURIComponent(city)+"&POB="+encodeURIComponent(pob)+"&Street="+encodeURIComponent(street)+"&House="+encodeURIComponent(house)+"&Entrance="+encodeURIComponent(entrance);
        $.get(url,function(result) {
            var zip = result.match(/RES[0-9]*\d/);
            if (zip[0] == "RES2") {
                trimmedZipString = "12";
            }
            else if (zip[0] == "RES013") {
                trimmedZipString = "13";
            }
            else {
                var trimmedZipString = zip.toString().substr(4);
            }
            showResults(trimmedZipString, city, street, house, pob, entrance);
            saveResults(trimmedZipString, city, street, house, pob, entrance);
            $('#clear_fields').show();
        });
    }
    else {
        showResults(trimmedZipString, city, street, house, pob, entrance);
        saveResults(trimmedZipString, city, street, house, pob, entrance);
    }
    resizeBox();
    return true;
}

function saveResults(zipString, cityString, streetString, houseString, pobString, entranceString) {
    localStorage.setItem("formCity", cityString);
    localStorage.setItem("formStreet", streetString);
    localStorage.setItem("formZip", zipString);
    localStorage.setItem("formHouse", houseString);
    localStorage.setItem("formPob", pobString);
    localStorage.setItem("formEntrance", entranceString);

}

function showResults(zipString, cityString, streetString, houseString, pobString, entranceString) {
    
    $('#formCity').val(cityString).show();
    var processDataFlag = clientSideVerifier(streetString, pobString, houseString, zipString)
    if (processDataFlag == true) {
        window.saveZipItem(zipString, cityString, streetString, houseString, pobString, entranceString);
        
        $('#sub_text').hide();
        $('#zipInput').val(zipString);
        $('#formZip').show();
        if (streetString != "") {
            $('#formStreet').val(streetString).show();
            $('#formHouse').val(houseString).show();
            $('#formEntrance').val(entranceString).show();
        }
        else {
            $('#formStreet').hide();

        }
        if (houseString != "") {
            $('#formHouse').val(houseString).show();
        }
        else {
            $('#formHouse').hide();

        }
        if (pobString != "") {
            $('#formPob').val(pobString).show();
        }
        else {
            $('#formPob').hide();
        }
        if (entranceString != "") {
            $('#formEntrance').val(entranceString).show();
        }
        else {
            $('#formEntrance').hide();
        }
    }
    else {
        $('#formStreet').show();
        $('#formHouse').show();
        $('#formEntrance').show();
        $('#formPob').show();
        $('#sub_text').show();
    }
    resizeBox();
}

function clientSideVerifier(streetString, pobString, houseString, zipString) {
    clientError1 = 'ניתן לחפש לפי רחוב או לפי תיבת דואר, לא גם וגפ...';
    clientError2 = 'נא להזין מספר תיבת דואר מספרות בלבד...';
    clientError3 = 'נא להזין מספר בית בספרות בלבד...';
    clientError4 = "לא נמצא מיקוד מתאים. במידה והוזנה כניסה, יש לנסות לחפש בלעדיה...";
    clientError5 = "לא נמצא מיקוד מתאים. יש לנסות שנית עם רחוב ו/או מספר בית…";
    clientError6 = "לא נמצא מיקוד מתאים עם העיר ו/או הרחוב שהוזנ/ה. יש לנסות שנית..."
    savedClientErrorMsg = null;
    res = true;
    if (streetString != "" && pobString != "") {
        $('#verification').html(clientError1).show();
        $('#formStreet').focus();
        res = false;
        saveErrorFlagAndMsg(res, clientError1);
    }

    else if (zipString == "11") {
        $('#verification').html(clientError4).show();
        res = false;
        saveErrorFlagAndMsg(res, clientError4);
    }

    else if (zipString == "12") {
        $('#verification').html(clientError5).show();
        res = false;
        saveErrorFlagAndMsg(res, clientError5);
    }

    else if (zipString == "13") {
        $('#verification').html(clientError6).show();
        $('#formCity').focus();
        res = false;
        saveErrorFlagAndMsg(res, clientError6);
    }

    else if (isNumeric(pobString) == false && pobString != "") {
        $('#verification').html(clientError2).show();
        $('#formPob').focus();
        res = false;
        saveErrorFlagAndMsg(res, clientError2);
    }

    else if (isNumeric(houseString) == false && houseString != "") {
        $('#verification').html(clientError3).show();
        $('#formHouse').focus();
        res = false;
        saveErrorFlagAndMsg(res, clientError3);
    }
    else {
        saveErrorFlagAndMsg(res, '');
    }
    return res;
}

function saveErrorFlagAndMsg(errorFlag, errorMsg) {
    localStorage.setItem('errorFlag', errorFlag);
    localStorage.setItem('savedClientErrorMsg', errorMsg);
}

function readSessionStorage() {
    readCity = localStorage.getItem('formCity');
    readStreet = localStorage.getItem('formStreet');
    readHouse = localStorage.getItem('formHouse');
    readPob = localStorage.getItem('formPob');
    readEntrance = sessionStorage.getItem('formEntrance');
    readZip = localStorage.getItem('formZip');
    readErrorMsg = localStorage.getItem('savedClientErrorMsg');
    readErrorFlag = localStorage.getItem('errorFlag');
    readJson = {
        'city' : readCity,
        'street' : readStreet,
        'house' : readHouse,
        'pob' : readPob,
        'entrance' : readEntrance,
        'zip' : readZip,
        'errorFlag' : readErrorFlag,
        'errorMsg' : readErrorMsg
    };
    return readJson;
}

function insertValuesFromStorage(jsonObject, f) {
    f;
    errorFlag = jsonObject['errorFlag']; // if errorFlag is false - we have an error
    if (jsonObject['city'] != null) {
        $('#formCity').val(jsonObject['city']).show();
        $('#clear_fields').show();
    }
    else {
        $('#formCity').show();
    }

    if (jsonObject['street'] != null) {
        if (jsonObject['street'] != "") {
            $('#formStreet').val(jsonObject['street']).show();
            $('#formHouse').val(jsonObject['house']).show();
            $('#clear_fields').show();

        }
        if (jsonObject['house'] != null) {
            if (jsonObject['house'] != "") {
                $('#formHouse').val(jsonObject['house']).show();
                $('#clear_fields').show();
            }
        }
        else {
            $('#formHouse').show();
        }
        if (jsonObject['entrance'] != null) {
            if (jsonObject['entrance'] != "") {
                $('#formEntrance').val(jsonObject['entrance']).show();
                $('#clear_fields').show();
            }
        }
        if (jsonObject['pob'] != null) {
            if (jsonObject['pob'] != "") {
                $('#formPob').val(jsonObject['pob']).show();
                $('#clear_fields').show();
            }
        }
        else {
            $('#formPob').show();
        }
    }

    if (errorFlag == "false") {
        $('#verification').html(jsonObject['errorMsg']).show();
        $('#sub_text').show();
        $('#formCity').show();
        $('#formStreet').show();
        $('#formHouse').show();
        $('#formEntrance').show();
        $('#formPob').show();
        $('#clear_fields').show();
    }
    else {
        if (jsonObject['zip'] != null) {
            $('#zipInput').val(jsonObject['zip']);
            $('#formZip').show();
            $('#clear_fields').show();
        }
    }
    resizeBox();
}

function storeCurrentFormInputs() {
    resizeBox();
    var form_inputs = document.querySelectorAll('input');
    for (var i = 0; i < form_inputs.length; i++) {
        valueOf = form_inputs[i].value;
        nameOf = form_inputs[i].id;
        localStorage.setItem(nameOf, valueOf);
    }
}

function checkIfPobOrStreet() {
    $('#verification').hide();
    $('#formZip').hide();
    var form_inputs = document.querySelectorAll('input');
    if (form_inputs[1].value != "") {
        $('#formPob').hide();
        $('#sub_text').hide();
    }
    else {
        if (form_inputs[3].value != "") {
            $('#formStreet').hide();
            $('#formPob').show();
            $('#formEntrance').hide();
            $('#formHouse').hide();
            $('#sub_text').hide();
        }
        else {
            if (form_inputs[1].value == "" && form_inputs[0].value != "") {
                $('#formStreet').show();
                $('#formEntrance').show();
                $('#formHouse').show();
                $('#formPob').show();
                $('#sub_text').show();
                resizeBox();
            }
        }
    }
    resizeBox();
}

$(document).ready(function(){
    zipFlag = false;
    $('#formCity').focus();
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', trackButtonClick);
    }

    var inputs = document.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('input', storeCurrentFormInputs);
        inputs[i].addEventListener('input', checkIfPobOrStreet);
    }

    currentState = readSessionStorage();
    insertValuesFromStorage(currentState, formCity());

    $('#findzip').on('click',function() {
        zipFlag = getZipCode();

    });

    $('#clear_fields').on('click',function() {
        clear_fields();
    });

    $('#formZip').on('click', '#zipCopyBtn', function() {
        $('#zipInput').select();
        document.execCommand("Copy");
        document.getSelection().removeAllRanges();
        $('#zipInput').fadeOut(300);
        $('#zipInput').fadeIn(300);
        $('#zipCopyBtn').html("הועתק!");
       resizeBox();
    });

    $(window).blur(function() {
        if (zipFlag == true) {
            localStorage.clear();
        }
        window.close();
    });
});
