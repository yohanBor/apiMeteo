const form = document.getElementById("searchMeteo");
let map, marker;
function constructFctElement(numDay, data) {
    const dayArea = document.getElementsByClassName("day");
    let day, icon, tMin, tMax, date;
    switch (numDay) {
        case 1:
            day = data.fcst_day_1.day_long;
            icon = data.fcst_day_1.icon;
            tMin = data.fcst_day_1.tmin;
            tMax = data.fcst_day_1.tmax;
            date = data.fcst_day_1.date;
            break;
        case 2:
            day = data.fcst_day_2.day_long;
            icon = data.fcst_day_2.icon;
            tMin = data.fcst_day_2.tmin;
            tMax = data.fcst_day_2.tmax;
            date = data.fcst_day_2.date;
            break;
        case 3:
            day = data.fcst_day_3.day_long;
            icon = data.fcst_day_3.icon;
            tMin = data.fcst_day_3.tmin;
            tMax = data.fcst_day_3.tmax;
            date = data.fcst_day_3.date;
            break;
        case 4:
            day = data.fcst_day_4.day_long;
            icon = data.fcst_day_4.icon;
            tMin = data.fcst_day_4.tmin;
            tMax = data.fcst_day_4.tmax;
            date = data.fcst_day_4.date;
            break;
        default:
            break;
    }
    
    dayArea[numDay-1].innerHTML = '\
        <h3>'+day+' - '+date.split(".")[0]+'/'+date.split(".")[1]+'</h3>\
        <div class="fctInfo">\
            <img src='+ icon +' alt="icon"> \
            <div class="tempCol">\
                <div class="top">'+tMax+'°</div>\
                <div class="bottom">'+tMin+'°</div>\
            </div>\
        </div>';
}

function updateTempByHour(hour, data){
    const hourJson = data.fcst_day_0.hourly_data[hour.replace(":", "H")];
    document.getElementById("displayTmp").innerHTML = ' <p id="displayTmp">'+hourJson.CONDITION + ' . '+ hour.replace(":", "H") + ' - ' + hourJson.TMP2m+'°</p>';
}
/**
 * - Promise manager -
 * Called if statusCode is OK
 * @param {*} response 
 */
async function onSuccess(response) {
    const data = await response.json();
    
    try {
        document.getElementById("data").style.display="block";
        // Areas
        const areaCityName = document.getElementById("cityName");
        const areaTemp = document.getElementById("temperature");
        const areaDayForecast = document.getElementById("dayforecast");
        const areaInfos = document.getElementById("infos");
        const areaTmpFct = document.getElementById("tempFct");

        // Variables
        let city = data.city_info.name;
        const sunRise = data.city_info.sunrise;
        const sunSet = data.city_info.sunset;
        const date = data.current_condition.date;
        const day = data.fcst_day_0.day_long;
        const hour = data.current_condition.hour;
        const humidityPerc = data.current_condition.humidity;
        const windSpeed = data.current_condition.wnd_spd;
        const windDir = data.current_condition.wnd_dir;
        const condition = data.current_condition.condition;
        const conditionGeneral = data.fcst_day_0.condition;
        const temperature = data.current_condition.tmp;
        const temperatureMax = data.fcst_day_0.tmax;
        const bigIcon = data.current_condition.icon_big;
        const latitude = data.city_info.latitude;
        const longitude = data.city_info.longitude;

        if(city == "NA") city = "";
        areaCityName.innerHTML = '<h2>' + city + '</h2>\
                                    <p>'+day+' '+hour+'</p>'
        ;
        areaTemp.innerHTML = '<p><img src='+ bigIcon +' alt="icon"> '+temperature+'°</p>\
                            <h3>'+condition+'</h3> '
        ;
        
        areaTmpFct.innerHTML = '<p id="displayTmp"></p><input name="tempRange" id="tempRange" type="range" value="'+parseInt(hour.split(":")[0])+'"  min="0" max="24" step="1">';
        updateTempByHour(parseInt(hour.split(":")[0])+":00", data);

        document.getElementById("tempRange").addEventListener('input', function() {
            let selectedTemp = document.getElementById("tempRange").value + "H00";
            updateTempByHour(selectedTemp, data);
        }); 
        areaDayForecast.innerHTML = '<p>Voici les conditions du jours : <span id="condGen">'+conditionGeneral+'</span>.\
         La température maximale sera de '+temperatureMax+'°.</p>'
        ;
        areaInfos.innerHTML = '\
            <div class="infoItem" id="wind"><p><span class="underline">Vent</span> : '+windSpeed+'km/h</p></div>\
            <div class="infoItem" id="windDir"><p><span class="underline">Dir</span> : '+windDir+'</p></div>\
            <div class="infoItem" id="humidity"><p><span class="underline">Humidité</span> : '+humidityPerc+'%</p></div>\
            <div class="infoItem" id="rise"><p><span class="underline">Levé</span> : '+sunRise+'</p></div>\
            <div class="infoItem" id="rise"><p><span class="underline">Couché</span> : '+sunSet+'</p></div>\
        ';

        for (let numDay = 1; numDay < 5; numDay ++) {
            constructFctElement(numDay, data);
        }
        manageMap(latitude, longitude);
        map.on('click', onMapClick);
        document.getElementById("data").style.display = "block";
    } catch (error) {
        onError(data);
    }
}

function onMapClick(e) {
    manageMap(e.latlng.lat, e.latlng.lng);
    const promise = fetch("https://www.prevision-meteo.ch/services/json/lat="+e.latlng.lat+"lng="+e.latlng.lng);
            promise.then(onSuccess, onError);
}

/**
 * If user authorize location
 * @param {*} position 
 */
function showPosition(position){
    manageMap(position.coords.latitude, position.coords.longitude )
    const promise = fetch("https://www.prevision-meteo.ch/services/json/lat="+position.coords.latitude+"lng="+position.coords.longitude);
            promise.then(onSuccess, onError);
}

/**
 * If user refuses location
 * Show Bordeaux location by default
 */
function ShowBordeaux(){
    const promise = fetch("https://www.prevision-meteo.ch/services/json/bordeaux");
            promise.then(onSuccess, onError);
}

function manageMap(latitute, longitude ) {
    try {
        // If map is defined
        map.flyTo(new L.LatLng(latitute, longitude), 12);
        if(marker != undefined) map.removeLayer(marker);
        
    } catch (error) {
        // If map is not defined
        document.getElementById("map").style.display = "block";
        map = L.map('map').setView([latitute, longitude], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }
    marker = L.marker([latitute, longitude]).addTo(map);
}

/**
 * - Promise manager -
 * If the city doesn't exist
 * @param {*} response 
 */
function onError(response) {
    try {
        showSmallMessage(response.errors[0].text, false);
        console.error("error city");
    } catch (error) {
        console.error(error);
    }
}

/**
 * Update Small selector
 * @param {*} message The message to write
 * @param {*} valid The validity of city name 
 */
function showSmallMessage(message, valid) {
    const msgArea = document.querySelector("#searchMeteo small");
    msgArea.innerHTML = message;
    form.className = valid ? "searchMeteoSuccess" : "searchMeteoError";
    return valid;
}

/**
 * Check valid text format
 * @param {*} inputElement 
 */
function validateCity (textElement) {
    const patternCity = new RegExp('^[a-zA-Z-]+$');
    if (textElement.trim().length === 0)
        return showSmallMessage("Please enter a city", false);

    else if (!patternCity.test(textElement.trim())) 
        return showSmallMessage("This format doesn't correspond to a city", false);
    
    return showSmallMessage("", true);
}


window.onload = function() {
    form.addEventListener('submit', function (event) { 
        event.preventDefault(); 
        const cityName = form.elements['city'].value;
        if (validateCity(cityName)) {
            const promise = fetch("https://www.prevision-meteo.ch/services/json/" + cityName);
            promise.then(onSuccess, onError);
        }
    });
    const inputForm = document.querySelector("#searchMeteo input");
    inputForm.oninput = () => {validateCity(inputForm.value);};

    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, ShowBordeaux);
    }
}