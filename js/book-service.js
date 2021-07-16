const TSItem = '.transport-solution-item';
const arrivalTSItem = '.arrival-transport-solution-item';
const listItemsSelected = [
    '.meet-greet-service-item',
    '.covid-safety-service-item',
    '.total-care-item',
    '.arrival-meet-greet-service-item',
    '.arrival-covid-safety-service-item',
    '.arrival-total-care-item',
    TSItem,
    arrivalTSItem,
    '.additional-service-item',
    '.terminal-transfer-service-item'];
const departureServicesPrice = [
    '.meet-greet-service-item',
    '.covid-safety-service-item',
    '.total-care-item',
    TSItem,
    '.terminal-transfer-service-item'];
const arrivalServicesPrice = [
    '.arrival-meet-greet-service-item',
    '.arrival-covid-safety-service-item',
    '.arrival-total-care-item',
    arrivalTSItem,
    '.terminal-transfer-service-item'];
const otherServicesPrice = [
    '.additional-service-item'];
const serviceItemSelectedClass = 'service-item-selected';
const serviceItemPrice = '.service-item-price';
const serviceItemOptional = 'service-item-optional';
const serviceItemMultiple = 'service-item-multiple';
const serviceItemRequired = 'service-item-required';
const priceTextReplace = 'IDR';
const tabItemCompleted = '.tab-item-complted';
const tabNotActive = 'tab-not-active';
const tabWCurrent = 'w--current';
const dataWTabAttr = 'data-w-tab';
const productNameClass = '.product-name';
var listTabItems = [];
var currentTotalPrice = 0;
const defaultDeparture = 'Departure';
const defaultArrival = 'Arrival';
function getMGObject() {
    var departure = $("#mg-departure option:selected").text();
    var arrival = $("#mg-arrival option:selected").text();
    const travelerText = $("#mg-traveler option:selected").text();
    const travelerAfterSplit = travelerText.split("x");
    const traveler = Number(travelerAfterSplit && travelerAfterSplit.length > 0 ? travelerAfterSplit[0] : 1);
    const isReturn = $( "#is-return" ).val();
    return {
        "departure": departure,
        "arrival": arrival,
        "traveler": traveler,
        "isReturn": isReturn
    }
}

function currencyFormat(num) {
    return 'IDR ' + (num ? num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0) + ' IDR';
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
    if ($(".departure-service-wrapper").is(":visible")) {
        totalPrice = totalPrice + getPriceForSection(departureServicesPrice, serviceItemSelectedClass, isVehiclesRequired, numberOfPassengers);
    }
    if ($(".arrival-service-wrapper").is(":visible")) {
        totalPrice = totalPrice + getPriceForSection(arrivalServicesPrice, serviceItemSelectedClass, isVehiclesRequired, numberOfPassengers);
    }
    totalPrice = totalPrice + getPriceForSection(otherServicesPrice, serviceItemSelectedClass, isVehiclesRequired, numberOfPassengers) + getTotalPriceFromLocalStorage();

    $("#total-price").html(currencyFormat(totalPrice));
}

function getTotalPriceFromLocalStorage() {
    var totalPrice = 0;
    $(".book-service-tab-link").each(function() {
        if ($(this).hasClass(tabWCurrent)) {
            const tabSelectedElement = $(this);
            const currentSelectedTab = tabSelectedElement.attr(dataWTabAttr);
            for(var index = 0; index < listTabItems.length; index ++) {
                const currentIndexValue = listTabItems[index];
                if (currentIndexValue == currentSelectedTab) {
                    continue;
                }
                if (currentIndexValue == 'outgoing-journey-tab') {
                    var outgoingForm = window.localStorage.getItem("outgoing");
                    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : null;
                    if (outgoingForm) {
                        totalPrice = totalPrice + getTotalPriceServices(outgoingForm.departure);
                        totalPrice = totalPrice + getTotalPriceServices(outgoingForm.arrival);
                        totalPrice = totalPrice + (outgoingForm.transfer && outgoingForm.transfer.price ? Number(outgoingForm.transfer.price) : 0);
                    }
                }
                if (currentIndexValue == 'return-journey-tab') {
                    var returnForm = window.localStorage.getItem("return");
                    returnForm = returnForm ? convertJsonToObject(returnForm) : null;
                    if (returnForm) {
                        totalPrice = totalPrice + getTotalPriceServices(returnForm.departure);
                        totalPrice = totalPrice + getTotalPriceServices(returnForm.arrival);
                        totalPrice = totalPrice + (returnForm.transfer && returnForm.transfer.price ? Number(returnForm.transfer.price) : 0);
                    }
                }
                if (currentIndexValue == 'additional-services-tab') {
                    var additionalServicesForm = window.localStorage.getItem("additional-services");
                    additionalServicesForm = additionalServicesForm ? convertJsonToObject(additionalServicesForm) : [];
                    for(var i = 0; i < additionalServicesForm.length; i ++) {
                        const item = additionalServicesForm[i];
                        totalPrice = totalPrice + (item.price ? Number(item.price) : 0);
                    }
                }
            }
            return false;
        }
    });
    return totalPrice;
}

function getTotalPriceServices(data) {
    var totalPrice = 0;
    if (!data) {
        return totalPrice;
    }
    const meetGreetService = data.meetGreetService;
    totalPrice = totalPrice + (meetGreetService && meetGreetService.price ? Number(meetGreetService.price) : 0);

    const transportSolution = data.transportSolution;
    const priceVehiclesRequired = transportSolution && transportSolution.isVehiclesRequired == "true" ? 2 : 1;
    totalPrice = totalPrice + (transportSolution && transportSolution.price ? Number(transportSolution.price*priceVehiclesRequired) : 0);

    const covidSafetyServices = data.covidSafetyServices ? data.covidSafetyServices : [];
    for(var index = 0; index < covidSafetyServices.length; index ++) {
        const item = covidSafetyServices[index];
        totalPrice = totalPrice + (item.price ? Number(item.price) : 0);
    }

    const totalCares = data.totalCares ? data.totalCares : [];
    for(var index = 0; index < totalCares.length; index ++) {
        const item = totalCares[index];
        totalPrice = totalPrice + (item.price ? Number(item.price) : 0);
    }

    return totalPrice;
}

function getPriceForSection(items, serviceItemSelectedClass, isVehiclesRequired, numberOfPassengers) {
    var totalPrice = 0;
    for(var index = 0; index < items.length; index ++) {
        $(items[index]).each(function() {
            if ($(this).hasClass(serviceItemSelectedClass)) {
                var priceValue = convertCurrencyToNumber($(this).find(serviceItemPrice).text());
                if (isVehiclesRequired == "true") {
                    displayVehiclesRequired(items[index], priceValue);
                }
                if (items[index] == TSItem || items[index] == arrivalTSItem) {
                    priceValue = isVehiclesRequired == "true" ? (priceValue*2) : priceValue;
                } else {
                    priceValue = priceValue*numberOfPassengers;
                }
                totalPrice = totalPrice + priceValue;
            }
        });
    }
    return totalPrice;
}

function initItemSelected(itemClass, itemSelectedClass) {
    $(itemClass).click(function() {
        if ($(itemClass).hasClass(serviceItemRequired)) {
            $(itemClass).each(function() {
                $(this).removeClass(itemSelectedClass);
            });
            $(this).addClass(itemSelectedClass);
        }

        if ($(itemClass).hasClass(serviceItemOptional)) {
            if ($(this).hasClass(itemSelectedClass)) {
                $(this).removeClass(itemSelectedClass);
            } else {
                if (!$(itemClass).hasClass(serviceItemMultiple)) {
                    $(itemClass).each(function() {
                        $(this).removeClass(itemSelectedClass);
                    });
                }
                $(this).addClass(itemSelectedClass);
            }
        }
       
        calTotalPrice();
    })
}

function setAirportLocationTitle(departureValue, arrivalValue) {
    $('#departure-title').html(departureValue + ' - Departure');
    $('#arrival-title').html(arrivalValue + ' - Arrival');
}

function displayDepartureSection(value) {
    if (value == defaultDeparture) {
        $(".departure-service-wrapper").hide();
    } else {
        $(".departure-service-wrapper").show();
    }
}

function displayArrivalSection(value) {
    if (value == defaultArrival) {
        $(".arrival-service-wrapper").hide();
    } else {
        $(".arrival-service-wrapper").show();
    }
}

function initData() {
    var mgForm = window.localStorage.getItem("meet-greet"); 
    mgForm = mgForm ? convertJsonToObject(mgForm) : {};
    const departureValue = mgForm && mgForm.departure ? mgForm.departure : defaultDeparture;
    const arrivalValue = mgForm && mgForm.arrival ? mgForm.arrival : defaultArrival;
    const travelerValue = mgForm && mgForm.traveler ? Number(mgForm.traveler) : 1;
    const isreturnValue = mgForm && mgForm.isReturn ? mgForm.isReturn : 'false';
    displayDepartureSection(departureValue);
    displayArrivalSection(arrivalValue);
    $("#departure-header").html(departureValue);
    $("#arrival-header").html(arrivalValue);
    $("#traveler-header").html('x' + travelerValue);
    if (travelerValue > 4) {
        $("#is-vehicles-required").val("true");
    }
    $("#is-return").val(isreturnValue);
    setAirportLocationTitle(departureValue, arrivalValue);
    initBookingSteps(isreturnValue, true);
    setDeparturesSelect(departureValue);
    setArrivalsSelect(arrivalValue);
    setTravelersSelect(travelerValue);
    initBookNowButton();
    initToggleReturnButton();
    setDepartureTransportSelect(departureValue);
    setArrivalTransportSelect(arrivalValue);
    initNextPleaseButton();
    initAllServiceItemPrice();
    initSelectedTabs();
    $(".book-service-tab-link").each(function() {
        if ($(this).hasClass(tabWCurrent)) {
          const tabSelectedElement = $(this);
          const currentSelectedTab = tabSelectedElement.attr(dataWTabAttr);
          switch(currentSelectedTab) {
            case 'outgoing-journey-tab':
                initOutgoingTab();
                break;
            case 'return-journey-tab':
                initReturnTab();
                break;
            case 'additional-services-tab':
                initAdditionalServicesTab();
                break;
            case 'passenger-details-tab':
                initPassengerDetailsTab();
                break;
            case 'checkout-tab':
                initCheckoutTab();
                break;
            }
        }
    });
    calTotalPrice();
}

function initAllServiceItemPrice() {
    $(".service-item-price").each(function() {
    	const text = $(this).text();
    	var price = text ? convertCurrencyToNumber(text) : 0;
        price = price*1000;
        $(this).html(currencyFormat(price));
    });
}

function initSelectedTabs() {
    $(".book-service-tab-link").click(function() {
        window.location = $(this).attr(dataWTabAttr);
    });
}

function initNextPleaseButton() {
    $(".next-please-button").click(function() {
        const mgData = getMGObject();
        window.localStorage.setItem("meet-greet", JSON.stringify(mgData));
        $(".book-service-tab-link").each(function() {
            if ($(this).hasClass(tabWCurrent)) {
                const tabSelectedElement = $(this);
                const currentTab = tabSelectedElement.attr(dataWTabAttr);
                switch(currentTab) {
                    case 'outgoing-journey-tab':
                        var outgoing = {
                            departure: $(".departure-service-wrapper").is(":visible") ? getSelectedServices("") : null,
                            arrival: $(".arrival-service-wrapper").is(":visible") ? getSelectedServices("arrival-") : null,
                            transfer: getTerminalTransferSelectedServices()
                        }
                        window.localStorage.setItem("outgoing", JSON.stringify(outgoing));
                        break;
                    case 'return-journey-tab':
                        var returnJourney = {
                            departure: $(".departure-service-wrapper").is(":visible") ? getSelectedServices("") : null,
                            arrival: $(".arrival-service-wrapper").is(":visible") ? getSelectedServices("arrival-") : null,
                            transfer: getTerminalTransferSelectedServices()
                        }
                        window.localStorage.setItem("return", JSON.stringify(returnJourney));
                        break;
                    case 'additional-services-tab':
                        window.localStorage.setItem("additional-services", JSON.stringify(getSelectedAdditionalServices()));
                        break;
                    case 'passenger-details-tab':
                        break;
                    case 'checkout-tab':
                        break;
                }
                const findIndex = listTabItems.indexOf(currentTab);
                if (findIndex == -1 || findIndex == listTabItems.length - 1) {
                    return false;
                }
                const nextTab = listTabItems[findIndex + 1];
                window.location = nextTab;
                return false;
            }
        });
     })
}

function initBookingSteps(isreturnValue, isDocumentReady = false) {
    if (isreturnValue == "true") {
        $(".return-journey-tab").show();
        $("#additional-services-step").html("03");
        $("#passenger-details-step").html("04");
        $("#checkout-step").html("05");
        if (isDocumentReady) {
            $("#toggle-return-button").trigger("click");
        }
        listTabItems = ['outgoing-journey-tab', 'return-journey-tab', 'additional-services-tab', 'passenger-details-tab', 'checkout-tab'];
    } else {
        $(".return-journey-tab").hide();
        $("#additional-services-step").html("02");
        $("#passenger-details-step").html("03");
        $("#checkout-step").html("04");
        listTabItems = ['outgoing-journey-tab', 'additional-services-tab', 'passenger-details-tab', 'checkout-tab'];
    }
}

function setDepartureTransportSelect(departureValue) {
    $('.transport-location-select').append('<option selected value="" disabled>Pick-up location</option>');
    $('.transport-airport-item').each(function() {
        var transportAirportName = $(this).find('.transport-airport-name').text();
        if (transportAirportName == departureValue) {
            var transportSolutionName = $(this).find('.transport-solution-name').text();
            $('.transport-location-select').append('<option value="' + transportSolutionName + '">' + transportSolutionName + '</option>');
        }
    })
}

function setArrivalTransportSelect(arrivalValue) {
    $('.arrival-transport-location-select').append('<option selected value="" disabled>Drop-off Location</option>');
    $('.transport-airport-item').each(function() {
        var transportAirportName = $(this).find('.transport-airport-name').text();
        if (transportAirportName == arrivalValue) {
            var transportSolutionName = $(this).find('.transport-solution-name').text();
            $('.arrival-transport-location-select').append('<option value="' + transportSolutionName + '">' + transportSolutionName + '</option>');
        }
    })
}

function setDeparturesSelect(departureValue) {
    const departureSelected = defaultDeparture == departureValue ? 'selected' : '';
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
    const arrivalSelected = defaultArrival == arrivalValue ? 'selected' : '';
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
        const mgData = getMGObject();
        if (mgData.departure != "" && mgData.arrival != "" && mgData.departure == mgData.arrival) {
            alert("Please choose different between Departure and Arrival");
            return false;
        }
        window.localStorage.setItem("meet-greet", JSON.stringify(mgData));
        $("#departure-header").html(mgData.departure);
        $("#arrival-header").html(mgData.arrival);
        $("#traveler-header").html('x' + mgData.traveler);
        setAirportLocationTitle(mgData.departure, mgData.arrival);
        $(".mg-edit-content").trigger("click");
        $("#is-vehicles-required").val(mgData.traveler > 4 ? "true" : "false");
        displayDepartureSection(mgData.departure);
        displayArrivalSection(mgData.arrival);
        initBookingSteps(mgData.isReturn);
    });
}

function initToggleReturnButton() {
    const toggleReturnButton = document.getElementById("toggle-return-button");
    toggleReturnButton.addEventListener("click", event => {
        $("#is-return").val($( "#is-return" ).val() == "false" ? "true" : "false");
    });
}

function initOutgoingTab() {
    var outgoingForm = window.localStorage.getItem("outgoing");
    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : null;
    if (outgoingForm) {
        initServices(outgoingForm.departure, "");
        initServices(outgoingForm.arrival, "arrival-");
        initTerminalTransferServices(outgoingForm.transfer);
    } else {
        initFirstMeetGreetServiceSelected("");
        initFirstMeetGreetServiceSelected("arrival-");
    }
}

function initReturnTab() {
    var returnForm = window.localStorage.getItem("return");
    returnForm = returnForm ? convertJsonToObject(returnForm) : null;
    if (returnForm) {
     	initServices(returnForm.departure, "");
  		initServices(returnForm.arrival, "arrival-");
        initTerminalTransferServices(returnForm.transfer);
    } else {
        initFirstMeetGreetServiceSelected("");
        initFirstMeetGreetServiceSelected("arrival-");
    }
}

function initFirstMeetGreetServiceSelected(arrivalClass) {
    $("." + arrivalClass + "meet-greet-service-item").each(function() {
        $(this).addClass(serviceItemSelectedClass);
        return false;
    })
}

function initAdditionalServicesTab() {
    var additionalServicesForm = window.localStorage.getItem("additional-services");
    additionalServicesForm = additionalServicesForm ? convertJsonToObject(additionalServicesForm) : [];
    $(".additional-service-item").each(function() {
        const productNameValue = $(this).find(productNameClass).text();
        const findProduct = additionalServicesForm.find(x => x.name === productNameValue);
        if (findProduct) {
            $(this).addClass(serviceItemSelectedClass);
            currentTotalPrice = currentTotalPrice + convertCurrencyToNumber($(this).find(serviceItemPrice).text());
        }
    })
}

function initPassengerDetailsTab() {

}

function initCheckoutTab() {

}

function convertJsonToObject(string) {
    return string ? jQuery.parseJSON(string) : {};
}

function initServices(data, arrivalClass) {
    if (!data) {
    	return;
    }
    if (data.meetGreetService) {
        const meetGreetService = data.meetGreetService;
        $("." + arrivalClass + "meet-greet-service-item").each(function() {
            const productNameValue = $(this).find(productNameClass).text();
            if (productNameValue == meetGreetService.name) {
                $(this).addClass(serviceItemSelectedClass);
                currentTotalPrice = currentTotalPrice + convertCurrencyToNumber($(this).find(serviceItemPrice).text());
            }
        })
    }
    if (data.transportSolution) {
        const transportSolution = data.transportSolution;
        $("." + arrivalClass + "transport-solution-item").each(function() {
            const productNameValue = $(this).find(productNameClass).text();
            if (productNameValue == transportSolution.name) {
                $(this).addClass(serviceItemSelectedClass);
                if (transportSolution.isVehiclesRequired == "true") {
                    displayVehiclesRequired("." + arrivalClass + "transport-solution-item", convertCurrencyToNumber(transportSolution.price));
                    currentTotalPrice = currentTotalPrice + convertCurrencyToNumber($(this).find(serviceItemPrice).text())*2;
                }
            }
        })
    }
    if (data.covidSafetyServices) {
        const covidSafetyServices = data.covidSafetyServices;
        $("." + arrivalClass + "covid-safety-service-item").each(function() {
            const productNameValue = $(this).find(productNameClass).text();
            const findProduct = covidSafetyServices.find(x => x.name === productNameValue);
            if (findProduct) {
                $(this).addClass(serviceItemSelectedClass);
                currentTotalPrice = currentTotalPrice + convertCurrencyToNumber($(this).find(serviceItemPrice).text());
            }
        })
    }
    if (data.totalCares) {
        const totalCares = data.totalCares;
        $("." + arrivalClass + "total-care-item").each(function() {
            const productNameValue = $(this).find(productNameClass).text();
            const findProduct = totalCares.find(x => x.name === productNameValue);
            if (findProduct) {
                $(this).addClass(serviceItemSelectedClass);
                currentTotalPrice = currentTotalPrice + convertCurrencyToNumber($(this).find(serviceItemPrice).text());
            }
        })
    }
    if (data.transportLocation) {
    	const transportLocation = data.transportLocation;
        $("." + arrivalClass + "transport-location-select" + " option[value=" + transportLocation + "]").attr('selected', 'selected');
    }
}

function initTerminalTransferServices(data) {
    if (data) {
        $(".terminal-transfer-service-item").each(function() {
            const productNameValue = $(this).find(productNameClass).text();
            if (productNameValue == data.name) {
                $(this).addClass(serviceItemSelectedClass);
                currentTotalPrice = currentTotalPrice + convertCurrencyToNumber($(this).find(serviceItemPrice).text());
            }
        })
    }
}

function getTerminalTransferSelectedServices() {
    var data = null;
    $(".terminal-transfer-service-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data = {
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text())
            }
        }
    })
    return data;
}

function getSelectedAdditionalServices() {
    var data = [];
    $(".additional-service-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.push({
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text())
            })
        }
    })
    return data;
}

function getSelectedServices(arrivalClass) {
    var data = {
        meetGreetService: null,
        transportSolution: null,
        covidSafetyServices: [],
        totalCares: [],
        transportLocation: ""
    };
    $("." + arrivalClass + "meet-greet-service-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.meetGreetService = {
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text())
            }
        }
    })
    $("." + arrivalClass + "transport-solution-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.transportSolution = {
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                isVehiclesRequired: $("#is-vehicles-required").val()
            }
        }
    })
    $("." + arrivalClass + "covid-safety-service-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.covidSafetyServices.push({
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text())
            })
        }
    })
    $("." + arrivalClass + "total-care-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.totalCares.push({
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text())
            })
        }
    })
    data.transportLocation = $("." + arrivalClass + "transport-location-select option:selected").text();
    return data;
}

function convertCurrencyToNumber(value) {
    return value ? Number(value.replace(priceTextReplace, "").replace(/[^0-9.-]+/g,"")) : 0;
}

$(document).ready(function() {
    initData();
    $('select').niceSelect();
    for(var index = 0; index < listItemsSelected.length; index ++) {
        initItemSelected(listItemsSelected[index], serviceItemSelectedClass);
    }
});