const form = document.getElementById("searchMeteo");

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

        // Variables
        const city = data.city_info.name;
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

        areaCityName.innerHTML = '<h2>' + city + '</h2>\
                                    <p>'+day+' '+hour+'</p>'
        ;
        areaTemp.innerHTML = '<p><img src='+ bigIcon +' alt="icon"> '+temperature+'°</p>\
                            <h3>'+condition+'</h3>'
        ;
        areaDayForecast.innerHTML = '<p>Aujourd\'hui le ciel sera <span id="condGen">'+conditionGeneral+'</span>.\
         La température maximale sera de '+temperatureMax+'°.</p>'
        ;
        areaInfos.innerHTML = '\
            <div class="infoItem" id="wind"><p><span class="underline">Vent</span> : '+windSpeed+'km/h</p></div>\
            <div class="infoItem" id="windDir"><p><span class="underline">Dir</span> : '+windDir+'</p></div>\
            <div class="infoItem" id="humidity"><p><span class="underline">Humidité</span> : '+humidityPerc+'%</p></div>\
            <div class="infoItem" id="rise"><p><span class="underline">Levé</span> : '+sunRise+'</p></div>\
            <div class="infoItem" id="rise"><p><span class="underline">Couché</span> : '+sunSet+'</p></div>\
        ';

    } catch (error) {
        onError(data);
    }
}

/**
 * - Promise manager -
 * If the city doesn't exist
 * @param {*} response 
 */
function onError(response) {
    showSmallMessage(response.errors[0].text, false);
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
    const patternCity = new RegExp('^[a-zA-Z- ]+$');
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
}