const arrivalTSItem = '.arrival-transport-solution-item';
const listItemsSelected = [
    '.meet-greet-service-item',
    '.covid-safety-service-item',
    '.total-care-item',
    '.arrival-meet-greet-service-item',
    '.arrival-covid-safety-service-item',
    '.arrival-total-care-item',
    TSItem,
    arrivalTSItem];
const serviceItemSelectedClass = 'service-item-selected';
const serviceItemPrice = '.service-item-price';
const priceTextReplace = 'IDR';

function getMGObject() {
    return {
        "departure": $("#departure-header").text(),
        "arrival": $("#arrival-header").text(),
        "traveler": Number($("#traveler-header").text().replace("x", ""))
    }
}

function currencyFormat(num) {
    return 'IDR ' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' IDR';
}

function displayVehiclesRequired(itemClass, priceValue) {
    const countText = '2x ' + currencyFormat(priceValue) + ' =';
    const priceText = currencyFormat(priceValue*2);
    if (itemClass == TSItem) {
        $(".departure-vehicles-required-count").html(countText);
        $(".departure-vehicles-required-price").html(priceText);
        $(".departure-vehicles-required-container").show();
    } else if (itemClass == arrivalTSItem) {
        $(".arrival-vehicles-required-count").html(countText);
        $(".arrival-vehicles-required-price").html(priceText);
        $(".arrival-vehicles-required-container").show();
    }
}

function calTotalPrice() {
    var totalPrice = 0;
    const numberOfPassengers = getMGObject().traveler;
    const isVehiclesRequired = $("#is-vehicles-required").val();
    for(var index = 0; index < listItemsSelected.length; index ++) {
        $(listItemsSelected[index]).each(function() {
            if ($(this).hasClass(serviceItemSelectedClass)) {
            const priceText = $(this).find(serviceItemPrice).text();
            var priceValue = Number(priceText.replace(priceTextReplace, "").replace(/[^0-9.-]+/g,""));
            if (isVehiclesRequired == "true") {
                displayVehiclesRequired(listItemsSelected[index], priceValue);
            }
            if (listItemsSelected[index] == TSItem || listItemsSelected[index] == arrivalTSItem) {
                priceValue = isVehiclesRequired == "true" ? (priceValue*2) : priceValue;
            } else {
                priceValue = priceValue*numberOfPassengers;
            }
            totalPrice = totalPrice + priceValue;
            }
        });
    }
    $("#total-price").html(currencyFormat(totalPrice));
}

function initItemSelected(itemClass, itemSelectedClass) {
    $(itemClass).click(function() {
        $(itemClass).each(function() {
            $(this).removeClass(itemSelectedClass);
        });
    $(this).addClass(itemSelectedClass);
        calTotalPrice();
    })
}

function setAirportLocationTitle(departureValue, arrivalValue) {
    $('#departure-title').html(departureValue + ' - Departure');
    $('#arrival-title').html(arrivalValue + ' - Arrival');
}

function initData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var departureValue = urlParams.get('departure');
    departureValue = departureValue == '' ? 'Departure' : departureValue;
    var arrivalValue = urlParams.get('arrival');
    arrivalValue = arrivalValue == '' ? 'Arrival' : arrivalValue;
    const travelerValue = urlParams.get('traveler');
    const isreturnValue = urlParams.get('isreturn');
    $("#departure-header").html(departureValue);
    $("#arrival-header").html(arrivalValue);
    $("#traveler-header").html('x' + travelerValue);
    if (Number(travelerValue) > 4) {
        $("#is-vehicles-required").val("true");
    }

    setAirportLocationTitle(departureValue, arrivalValue);
    initBookingSteps(isreturnValue, true);
    setDeparturesSelect(departureValue);
    setArrivalsSelect(arrivalValue);
    setTravelersSelect(travelerValue);
    initBookNowButton();
    initToggleReturnButton();
    setDepartureTransportSelect(departureValue);
    setArrivalTransportSelect(arrivalValue);
}

function initBookingSteps(isreturnValue, isDocumentReady = false) {
    if (isreturnValue == "true") {
    $(".book-service-tabs-menu").css("grid-template-columns","1fr 1fr 1fr 1fr 1fr");
        $(".return-journey-tab").show();
        $("#additional-services-step").html("03");
        $("#passenger-details-step").html("04");
        $("#checkout-step").html("05");
        if (isDocumentReady) {
            $("#toggle-return-button").trigger("click");
        }
    } else {
        $(".book-service-tabs-menu").css("grid-template-columns","1fr 1fr 1fr 1fr");
        $(".return-journey-tab").hide();
        $("#additional-services-step").html("02");
        $("#passenger-details-step").html("03");
        $("#checkout-step").html("04");
    }
}

function setDepartureTransportSelect(departureValue) {
    $('.departure-transport-select').append('<option selected value="" disabled>Pick-up location</option>');
    $('.transport-airport-item').each(function() {
        var transportAirportName = $(this).find('.transport-airport-name').text();
        if (transportAirportName == departureValue) {
            var transportSolutionName = $(this).find('.transport-solution-name').text();
            $('.departure-transport-select').append('<option value="' + transportSolutionName + '">' + transportSolutionName + '</option>');
        }
    })
}

function setArrivalTransportSelect(arrivalValue) {
    $('.arrival-transport-select').append('<option selected value="" disabled>Drop-off Location</option>');
    $('.transport-airport-item').each(function() {
        var transportAirportName = $(this).find('.transport-airport-name').text();
        if (transportAirportName == arrivalValue) {
            var transportSolutionName = $(this).find('.transport-solution-name').text();
            $('.arrival-transport-select').append('<option value="' + transportSolutionName + '">' + transportSolutionName + '</option>');
        }
    })
}

function setDeparturesSelect(departureValue) {
    const departureSelected = 'Departure' == departureValue ? 'selected' : '';
    $('.departures-select').append('<option ' + departureSelected + ' value="" disabled>Departure</option>');
    $('.departures-select').append('<option value="" disabled>Domestic</option>');
    $('.domestic-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == departureValue ? 'selected' : '';
        $('.departures-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
    $('.departures-select').append('<option value="" disabled>International</option>');
    $('.international-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == departureValue ? 'selected' : '';
        $('.departures-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
}

function setArrivalsSelect(arrivalValue) {
    const arrivalSelected = 'Arrival' == arrivalValue ? 'selected' : '';
    $('.arrivals-select').append('<option ' + arrivalSelected + ' value="" disabled>Arrival</option>');
    $('.arrivals-select').append('<option value="" disabled>Domestic</option>');
    $('.domestic-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == arrivalValue ? 'selected' : '';
        $('.arrivals-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
    $('.arrivals-select').append('<option value="" disabled>International</option>');
    $('.international-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == arrivalValue ? 'selected' : '';
        $('.arrivals-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
}

function setTravelersSelect(travelerValue) {
    $('.traveler-item').each(function() {
        var s = $(this).text();
        const travelerAfterSplit = s.split("x");
        const traveler = travelerAfterSplit && travelerAfterSplit.length > 0 ? travelerAfterSplit[0] : 1;
        const addSelected = traveler == travelerValue ? 'selected' : '';
        $('.travelers-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
}

function initBookNowButton() {
    const bookNowButton = document.getElementById("book-now-button");
    bookNowButton.addEventListener("click", event => {
    var departure = $("#mg-departure option:selected").text();
    departure = departure == "Departure" ? "" : departure;
    var arrival = $("#mg-arrival option:selected").text();
    arrival = arrival == "Arrival" ? "" : arrival;
    const travelerText = $("#mg-traveler option:selected").text();
    const travelerAfterSplit = travelerText.split("x");
    const traveler = Number(travelerAfterSplit && travelerAfterSplit.length > 0 ? travelerAfterSplit[0] : 1);
    const isReturn = $( "#is-return" ).val();

    if (departure != "" && arrival != "" &&departure == arrival) {
        alert("Please choose different between Departure and Arrival");
        return;
    }
    $("#departure-header").html(departure);
    $("#arrival-header").html(arrival);
    $("#traveler-header").html('x' + traveler);
    setAirportLocationTitle(departure, arrival);
    $(".mg-edit-content").trigger("click");
    $("#is-vehicles-required").val(traveler > 4 ? "true" : "false");
    initBookingSteps(isReturn);
    });
}

function initToggleReturnButton() {
    const toggleReturnButton = document.getElementById("toggle-return-button");
    toggleReturnButton.addEventListener("click", event => {
        $("#is-return").val($( "#is-return" ).val() == "false" ? "true" : "false");
    });
}

$(document).ready(function() {
    initData();
    $('select').niceSelect();
    for(var index = 0; index < listItemsSelected.length; index ++) {
        initItemSelected(listItemsSelected[index], serviceItemSelectedClass);
    }
});