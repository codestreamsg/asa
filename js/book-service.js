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
    TSItem];
const arrivalServicesPrice = [
    '.arrival-meet-greet-service-item',
    '.arrival-covid-safety-service-item',
    '.arrival-total-care-item',
    arrivalTSItem];
const terminalTransferServicePrice = ['.terminal-transfer-service-item'];    
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
const defaultPickUpLocation = 'Pick-up location';
const defaultDropOffLocation = 'Drop-off Location';
var countInputIndex = 0;
var currentSelectedTab = '';
const maxNumberOfPassengers = 8;
const productLoyaltyPointClass = '.product-loyalty-point';
const productSkuClass = '.product-sku';
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

function setMGObject() {
    var mgForm = window.localStorage.getItem("meet-greet"); 
    mgForm = mgForm ? convertJsonToObject(mgForm) : {};
    var mgObject = getMGObject();
    if (mgForm.departure != mgObject.departure) {
        $('#mg-departure').val(mgForm.departure).niceSelect('update');
    }
    if (mgForm.arrival != mgObject.arrival) {
        $('#mg-arrival').val(mgForm.arrival).niceSelect('update');
    }
    if (mgForm.traveler != mgObject.traveler) {
        $('#mg-traveler').val(mgForm.traveler + "x Traveler").niceSelect('update');
    }
    if (mgForm.isReturn != mgObject.isReturn) {
        $("#toggle-return-button").trigger("click");
        $("#is-return" ).val(mgForm.isReturn);
    }
}

function currencyFormat(num) {
    return 'IDR ' + (num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0);
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

function hideVehiclesRequired(itemClass) {
    if (itemClass == TSItem) {
        $(".departure-vehicles-required-container").hide();
    } else if (itemClass == arrivalTSItem) {
        $(".arrival-vehicles-required-container").hide();
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
    if ($(".terminal-transfer-service-item").is(":visible")) {
        totalPrice = totalPrice + getPriceForSection(terminalTransferServicePrice, serviceItemSelectedClass, isVehiclesRequired, numberOfPassengers);
    }
    totalPrice = totalPrice + getPriceForSection(otherServicesPrice, serviceItemSelectedClass, isVehiclesRequired, numberOfPassengers) + getTotalPriceFromLocalStorage(numberOfPassengers);

    $("#total-price").html(currencyFormat(totalPrice));
    return totalPrice;
}

function getTotalPriceFromLocalStorage(numberOfPassengers) {
    var totalPrice = 0;
    $(".book-service-tab-link").each(function() {
        if ($(this).hasClass(tabWCurrent)) {
            const tabSelectedElement = $(this);
            const selectedTab = tabSelectedElement.attr(dataWTabAttr);
            for(var index = 0; index < listTabItems.length; index ++) {
                const currentIndexValue = listTabItems[index];
                if (currentIndexValue == selectedTab) {
                    continue;
                }
                if (currentIndexValue == 'outgoing-journey-tab') {
                    var outgoingForm = window.localStorage.getItem("outgoing");
                    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : null;
                    if (outgoingForm) {
                        totalPrice = totalPrice + getTotalPriceServices(outgoingForm.departure, numberOfPassengers);
                        totalPrice = totalPrice + getTotalPriceServices(outgoingForm.arrival, numberOfPassengers);
                        totalPrice = totalPrice + (outgoingForm.transfer && outgoingForm.transfer.price ? Number(outgoingForm.transfer.price)*numberOfPassengers : 0);
                    }
                }
                if (currentIndexValue == 'return-journey-tab') {
                    var returnForm = window.localStorage.getItem("return");
                    returnForm = returnForm ? convertJsonToObject(returnForm) : null;
                    if (returnForm) {
                        totalPrice = totalPrice + getTotalPriceServices(returnForm.departure, numberOfPassengers);
                        totalPrice = totalPrice + getTotalPriceServices(returnForm.arrival, numberOfPassengers);
                        totalPrice = totalPrice + (returnForm.transfer && returnForm.transfer.price ? Number(returnForm.transfer.price)*numberOfPassengers : 0);
                    }
                }
                if (currentIndexValue == 'additional-services-tab') {
                    var additionalServicesForm = window.localStorage.getItem("additional-services");
                    additionalServicesForm = additionalServicesForm ? convertJsonToObject(additionalServicesForm) : [];
                    for(var i = 0; i < additionalServicesForm.length; i ++) {
                        const item = additionalServicesForm[i];
                        totalPrice = totalPrice + (item.price ? Number(item.price)*numberOfPassengers : 0);
                    }
                }
            }
            return false;
        }
    });
    return totalPrice;
}

function getTotalPriceServices(data, numberOfPassengers) {
    var totalPrice = 0;
    if (!data) {
        return totalPrice;
    }
    const meetGreetService = data.meetGreetService;
    totalPrice = totalPrice + (meetGreetService && meetGreetService.price ? Number(meetGreetService.price)*numberOfPassengers : 0);

    const transportSolution = data.transportSolution;
    const priceVehiclesRequired = transportSolution && transportSolution.isVehiclesRequired == "true" ? 2 : 1;
    totalPrice = totalPrice + (transportSolution && transportSolution.price ? Number(transportSolution.price*priceVehiclesRequired) : 0);

    const covidSafetyServices = data.covidSafetyServices ? data.covidSafetyServices : [];
    for(var index = 0; index < covidSafetyServices.length; index ++) {
        const item = covidSafetyServices[index];
        totalPrice = totalPrice + (item.price ? Number(item.price)*numberOfPassengers : 0);
    }

    const totalCares = data.totalCares ? data.totalCares : [];
    for(var index = 0; index < totalCares.length; index ++) {
        const item = totalCares[index];
        totalPrice = totalPrice + (item.price ? Number(item.price)*numberOfPassengers : 0);
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
                } else {
                    hideVehiclesRequired(items[index]);
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
    initBookingSteps(isreturnValue, true);
    setDeparturesSelect(departureValue);
    setArrivalsSelect(arrivalValue);
    setTravelersSelect(travelerValue);
    initBookNowButton();
    initToggleReturnButton();
    initNextPleaseButton();
    initAllServiceItemPrice();
    initSelectedTabs();
    initEditMgForm();
    $(".book-service-tab-link").each(function() {
        if ($(this).hasClass(tabWCurrent)) {
          const tabSelectedElement = $(this);
          currentSelectedTab = tabSelectedElement.attr(dataWTabAttr);
          switch(currentSelectedTab) {
            case 'outgoing-journey-tab':
                initOutgoingTab(departureValue, arrivalValue);
                break;
            case 'return-journey-tab':
                initReturnTab(departureValue, arrivalValue);
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

function initEditMgForm() {
    $(".mg-edit-content").click(function() {
        if (!$(".meet-greet-form-container").is(":visible")) {
        	setMGObject();
        }
    });
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
    var isDisplay = false;
    $('.transport-location-select').append('<option selected value="" disabled>' + defaultPickUpLocation + '</option>');
    $('.transport-airport-item').each(function() {
        var transportAirportName = $(this).find('.transport-airport-name').text();
        if (transportAirportName == departureValue) {
            var transportSolutionName = $(this).find('.transport-solution-name').text();
            var transportAirportCode = $(this).find('.transport-airport-code').text();
            $('.transport-location-select').append('<option value="' + transportAirportCode + '">' + transportSolutionName + '</option>');
            isDisplay = true;
        }
    })
    if (isDisplay) {
        $(".transport-solutions-container").show();
    } else {
        $(".transport-solutions-container").hide();
    }
}

function setArrivalTransportSelect(arrivalValue) {
    var isDisplay = false;
    $('.arrival-transport-location-select').append('<option selected value="" disabled>' + defaultDropOffLocation + '</option>');
    $('.transport-airport-item').each(function() {
        var transportAirportName = $(this).find('.transport-airport-name').text();
        if (transportAirportName == arrivalValue) {
            var transportSolutionName = $(this).find('.transport-solution-name').text();
            var transportAirportCode = $(this).find('.transport-airport-code').text();
            $('.arrival-transport-location-select').append('<option value="' + transportAirportCode + '">' + transportSolutionName + '</option>');
            isDisplay = true;
        }
    })
    if (isDisplay) {
        $(".arrival-transport-solutions-container").show();
    } else {
        $(".arrival-transport-solutions-container").hide();
    }
}

function setDeparturesSelect(departureValue) {
    const departureSelected = defaultDeparture == departureValue ? 'selected="selected"' : '';
    $('.departures-select').append('<option ' + departureSelected + ' value="" disabled>Departure</option>');
    $('.departures-select').append('<option value="" disabled>Domestic</option>');
    $('.domestic-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == departureValue ? 'selected="selected"' : '';
        $('.departures-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
    $('.departures-select').append('<option value="" disabled>International</option>');
    $('.international-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == departureValue ? 'selected="selected"' : '';
        $('.departures-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
}

function setArrivalsSelect(arrivalValue) {
    const arrivalSelected = defaultArrival == arrivalValue ? 'selected="selected"' : '';
    $('.arrivals-select').append('<option ' + arrivalSelected + ' value="" disabled>Arrival</option>');
    $('.arrivals-select').append('<option value="" disabled>Domestic</option>');
    $('.domestic-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == arrivalValue ? 'selected="selected"' : '';
        $('.arrivals-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
    $('.arrivals-select').append('<option value="" disabled>International</option>');
    $('.international-airport-item').each(function() {
        var s = $(this).text();
        const addSelected = s == arrivalValue ? 'selected="selected"' : '';
        $('.arrivals-select').append('<option ' + addSelected + ' value="' + s + '">' + s + '</option>');
    })
}

function setTravelersSelect(travelerValue) {
    $('.traveler-item').each(function() {
        var s = $(this).text();
        const travelerAfterSplit = s.split("x");
        const traveler = travelerAfterSplit && travelerAfterSplit.length > 0 ? travelerAfterSplit[0] : 1;
        const addSelected = traveler == travelerValue ? 'selected="selected"' : '';
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
      	$(".mg-edit-content").trigger("click");
        var mgForm = window.localStorage.getItem("meet-greet"); 
        mgForm = mgForm ? convertJsonToObject(mgForm) : null;
        window.localStorage.setItem("meet-greet", JSON.stringify(mgData));
        if (mgForm && (mgForm.departure != mgData.departure || mgForm.arrival != mgData.arrival)) {
            this.resetForm();
            window.location = "outgoing-journey-tab";
            return false;
        }
        $("#departure-header").html(mgData.departure);
        $("#arrival-header").html(mgData.arrival);
        $("#traveler-header").html('x' + mgData.traveler);
        setAirportLocationTitle(mgData.departure, mgData.arrival);
        $("#is-vehicles-required").val(mgData.traveler > 4 ? "true" : "false");
        displayDepartureSection(mgData.departure);
        displayArrivalSection(mgData.arrival);
        initBookingSteps(mgData.isReturn);
        calTotalPrice();
        if (mgData.isReturn == "false") {
            window.localStorage.removeItem("return");
            if (currentSelectedTab == "return-journey-tab") {
                window.location = "outgoing-journey-tab";
                return false;
            }
        }
        if (currentSelectedTab == "passenger-details-tab") {
            initPassengerDetailsTab();
        }
        var returnForm = window.localStorage.getItem("return");
        returnForm = returnForm ? convertJsonToObject(returnForm) : null;
        if (currentSelectedTab != "outgoing-journey-tab" && mgData.isReturn == "true" && !returnForm) {
            window.location = "return-journey-tab";
        }
    });
}

function resetForm() {
    window.localStorage.removeItem("outgoing");
    window.localStorage.removeItem("return");
    window.localStorage.removeItem("additional-services");
    window.localStorage.removeItem("bookers-detail");
    window.localStorage.removeItem("passengers-detail");
    window.localStorage.removeItem("add-on-services");
}

function initToggleReturnButton() {
    const toggleReturnButton = document.getElementById("toggle-return-button");
    toggleReturnButton.addEventListener("click", event => {
        $("#is-return").val($( "#is-return" ).val() == "false" ? "true" : "false");
    });
}

function initFirstMeetGreetServiceSelected(arrivalClass) {
    $("." + arrivalClass + "meet-greet-service-item").each(function() {
        $(this).addClass(serviceItemSelectedClass);
        return false;
    })
}

function initTransportLocationChange(arrivalClass) {
    $("#" + arrivalClass + "transport-location-select").change(function() {
        setTimeout(function(){
            $("." + arrivalClass + "product-button-option").each(function() {
                if ($(this).text() == "CGK" || $(this).text() == $("#" + arrivalClass + "transport-location-select option:selected").text()) {
                    $(this).trigger("click");
                }
            });
            setTimeout(function() {
                $(".service-item-price." + arrivalClass + "transport-solution-product-price").each(function() {
                    const text = $(this).text();
                    var price = text ? convertCurrencyToNumber(text) : 0;
                    price = price*1000;
                    $(this).html(currencyFormat(price));
                });
                calTotalPrice();
            }, 100);
        }, 500);
    });
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
    const transportLocation = data.transportLocation;
    if (transportLocation && transportLocation != defaultPickUpLocation && transportLocation !=  defaultDropOffLocation) {
        $("#" + arrivalClass + "transport-location-select").val(transportLocation).niceSelect('update');
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
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                loyaltyPoint: $(this).find(productLoyaltyPointClass).text(),
                sku: $(this).find(productSkuClass).text()
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
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                loyaltyPoint: $(this).find(productLoyaltyPointClass).text(),
                sku: $(this).find(productSkuClass).text()
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
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                loyaltyPoint: $(this).find(productLoyaltyPointClass).text(),
                sku: $(this).find(productSkuClass).text()
            }
        }
    })
    const transportLocationText = $("." + arrivalClass + "transport-location-select option:selected").text();
    const transportLocationVal = $("." + arrivalClass + "transport-location-select option:selected").val();
    data.transportLocation = transportLocationText != defaultPickUpLocation && transportLocationText != defaultDropOffLocation ? transportLocationText : '';
    $("." + arrivalClass + "transport-solution-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.transportSolution = {
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                isVehiclesRequired: $("#is-vehicles-required").val(),
                loyaltyPoint: $(this).find(productLoyaltyPointClass).text(),
                aiportCode: transportLocationVal,
                sku: $(this).find(productSkuClass).text()
            }
        }
    })
    $("." + arrivalClass + "covid-safety-service-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.covidSafetyServices.push({
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                loyaltyPoint: $(this).find(productLoyaltyPointClass).text(),
                sku: $(this).find(productSkuClass).text()
            })
        }
    })
    $("." + arrivalClass + "total-care-item").each(function() {
        if ($(this).hasClass(serviceItemSelectedClass)) {
            data.totalCares.push({
                name: $(this).find(productNameClass).text(),
                price: convertCurrencyToNumber($(this).find(serviceItemPrice).text()),
                loyaltyPoint: $(this).find(productLoyaltyPointClass).text(),
                sku: $(this).find(productSkuClass).text()
            })
        }
    })
    return data;
}

function convertCurrencyToNumber(value) {
    return value ? Number(value.toString().replace(priceTextReplace, "").replace(/[^0-9.-]+/g,"")) : 0;
}

function addAllProductsToCart() {
    countInputIndex = 0;
    var mgObject = getMGObject();
    const numberOfPassengers = mgObject.traveler;
    var outgoingForm = window.localStorage.getItem("outgoing");
    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : {};
    addProductsForSection(outgoingForm.departure, numberOfPassengers, 'Outgoing Departure');
    addProductsForSection(outgoingForm.arrival, numberOfPassengers, 'Outgoing Arrival');
    if (outgoingForm.transfer) {
        countInputIndex ++;
        $("#embed-input-fields").append(getInputsForProduct(countInputIndex, outgoingForm.transfer.name, outgoingForm.transfer.price, numberOfPassengers, 'Outgoing Transfer', outgoingForm.transfer.loyaltyPoint, '', outgoingForm.transfer.sku));
    }
    
    var returnForm = window.localStorage.getItem("return");
    returnForm = returnForm ? convertJsonToObject(returnForm) : {};
    addProductsForSection(returnForm.departure, numberOfPassengers, 'Return Departure');
    addProductsForSection(returnForm.arrival, numberOfPassengers, 'Return Arrival');
    if (returnForm.transfer) {
        countInputIndex ++;
        $("#embed-input-fields").append(getInputsForProduct(countInputIndex, returnForm.transfer.name, returnForm.transfer.price, numberOfPassengers, 'Return Transfer', returnForm.transfer.loyaltyPoint, '', returnForm.transfer.sku));
    }

    var additionalServicesForm = window.localStorage.getItem("additional-services");
    additionalServicesForm = additionalServicesForm ? convertJsonToObject(additionalServicesForm) : [];
    if (additionalServicesForm) {
        for(var index = 0; index < additionalServicesForm.length; index ++) {
            countInputIndex ++;
            const additionalService = additionalServicesForm[index];
            $("#embed-input-fields").append(getInputsForProduct(countInputIndex, additionalService.name, additionalService.price, numberOfPassengers, 'Additional Service', additionalService.loyaltyPoint, '', additionalService.sku));
        }
    }
}

function addProductsForSection(data, numberOfPassengers, categoryName) {
    if (!data) {
        return;
    }
    if (data.meetGreetService) {
        countInputIndex ++;
        $("#embed-input-fields").append(getInputsForProduct(countInputIndex, data.meetGreetService.name, data.meetGreetService.price, numberOfPassengers, categoryName, data.meetGreetService.loyaltyPoint, '', data.meetGreetService.sku));
    }
    if (data.transportSolution) {
        countInputIndex ++;
        const transportSolution = data.transportSolution;
        const priceVehiclesRequired = transportSolution && transportSolution.isVehiclesRequired == "true" ? 2 : 1;
        $("#embed-input-fields").append(getInputsForProduct(countInputIndex, transportSolution.name, transportSolution.price, priceVehiclesRequired, categoryName, transportSolution.loyaltyPoint, transportSolution.aiportCode, transportSolution.sku, data.transportLocation ? data.transportLocation : ""));
    }
    if (data.covidSafetyServices) {
        for(var index = 0; index < data.covidSafetyServices.length; index ++) {
            countInputIndex ++;
            const covidSafetyService = data.covidSafetyServices[index];
            $("#embed-input-fields").append(getInputsForProduct(countInputIndex, covidSafetyService.name, covidSafetyService.price, numberOfPassengers, categoryName, covidSafetyService.loyaltyPoint, '', covidSafetyService.sku));
        }
    }
    if (data.totalCares) {
        for(var index = 0; index < data.totalCares.length; index ++) {
            countInputIndex ++;
            const totalCare = data.totalCares[index];
            $("#embed-input-fields").append(getInputsForProduct(countInputIndex, totalCare.name, totalCare.price, numberOfPassengers, categoryName, totalCare.loyaltyPoint, '', totalCare.sku));
        }
    }
}

function getInputsForProduct(index, productName, productPrice, quantity, category, loyaltyPoint, airport = '', sku = '', terminal = '') {
    const result = '<input type="hidden" name="' + index + ':name" value="' + productName + '" />'
                + '<input type="hidden" name="' + index + ':price" value="' + productPrice+ '" />'
                + '<input type="hidden" name="' + index + ':code" value="' + sku + '" />'
                + '<input type="hidden" name="' + index + ':quantity" value="' + quantity + '" />'
                + '<input type="hidden" name="' + index + ':Journey" value="' + category+ '" />'
                + '<input type="hidden" name="' + index + ':Loyalty Point" value="' + loyaltyPoint + '" />'
                + '<input type="hidden" name="' + index + ':Airport" value="' + airport + '" />'
                + '<input type="hidden" name="' + index + ':Terminal" value="' + terminal + '" />';
    return result;
}

function displayPassengerDetails() {
    for (var i = 1; i <= getMGObject().traveler; i ++) {
        $(".passenger-details-" + i).show();
        $(".passenger-details-" + i + " :input.input-can-hide").prop('required', true);;
    }
}

function displayAddOnServices() {
    var outgoingForm = window.localStorage.getItem("outgoing");
    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : null;
    var returnForm = window.localStorage.getItem("return");
    returnForm = returnForm ? convertJsonToObject(returnForm) : null;
    $(".add-on-services-container").hide();
    displayAddOnTransportSolutions(outgoingForm, ".transport-outgoing");
    displayAddOnTransportSolutions(returnForm, ".transport-return");
    displayAddOnLuggageDeliveries(outgoingForm, ".luggage-delivery-outgoing");
    displayAddOnLuggageDeliveries(returnForm, ".luggage-delivery-return");
    var additionalServicesForm = window.localStorage.getItem("additional-services");
    additionalServicesForm = additionalServicesForm ? convertJsonToObject(additionalServicesForm) : [];
    const isShowLLTAService = additionalServicesForm.find(item => item.name == "Lost Luggage Tracing Assistance");
    if (isShowLLTAService) {
        $(".add-on-services-container").show();
        $(".add-on-llta-service").show();
        $(".add-on-llta-service :input.input-can-hide").prop('required', true);
    }
}

function displayAddOnTransportSolutions(data, transportClass) {
    const isDepartureTransportSolution = data && data.departure && data.departure.transportSolution ? true : false;
    const isArrivalTransportSolution = data && data.arrival && data.arrival.transportSolution ? true : false;
    if (isDepartureTransportSolution || isArrivalTransportSolution) {
        $(".add-on-services-container").show();
        $(".add-on-transport-service").show();
        if (isDepartureTransportSolution) {
            $(transportClass + "-departure").show();
            $(transportClass + "-departure :input.input-can-hide").prop('required', true);
        }
        if (isArrivalTransportSolution) {
            $(transportClass + "-arrival").show();
            $(transportClass + "-arrival :input.input-can-hide").prop('required', true);
        }
    } else {
        $(transportClass).hide();
        $(transportClass + " :input.input-can-hide").prop('required', false);
    }
}

function displayAddOnLuggageDeliveries(data, transportClass) {
    const isDepartureTransportSolution = data && data.departure && data.departure.totalCares && data.departure.totalCares.find(x => x.name === 'Luggage Delivery') ? true : false;
    const isArrivalTransportSolution = data && data.arrival && data.arrival.totalCares && data.arrival.totalCares.find(x => x.name === 'Luggage Delivery') ? true : false;
    if (isDepartureTransportSolution || isArrivalTransportSolution) {
        $(".add-on-services-container").show();
        $(".add-on-luggage-delivery-service").show();
        $(".input-luggage-details :input.input-can-hide").prop('required', true);
        if (isDepartureTransportSolution) {
            $(transportClass + "-departure").show();
            $(transportClass + "-departure :input.input-can-hide").prop('required', true);
        }
        if (isArrivalTransportSolution) {
            $(transportClass + "-arrival").show();
            $(transportClass + "-arrival :input.input-can-hide").prop('required', true);
        }
    } else {
        $(transportClass).hide();
        $(transportClass + " :input.input-can-hide").prop('required', false);
        $(".input-luggage-details :input.input-can-hide").prop('required', false);
    }
}

function initTheCart() {
    const mgObject = getMGObject();
    $(".cart-service-section").hide();
    $(".cart-service-list").empty();
    $(".outgoing-cart-journey").hide();
  	$(".return-cart-journey").hide();
    var outgoingForm = window.localStorage.getItem("outgoing");
    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : null;
    if (outgoingForm) {
        $(".outgoing-cart-journey").show();
        if (outgoingForm.departure) {
    			$(".outgoing-departure-cart-airport-title").html(mgObject.departure + " - Departure");
    		}
        if (outgoingForm.arrival) {
            $(".outgoing-arrival-cart-airport-title").html(mgObject.arrival + " - Arrival");
        }
        displayJourneyServices(outgoingForm.departure, ".outgoing-departure-cart-service", ".outgoing-departure-cart-service-list");
        displayJourneyServices(outgoingForm.arrival, ".outgoing-arrival-cart-service", ".outgoing-arrival-cart-service-list");
        if (outgoingForm.transfer) {
        	$(".outgoing-transfer-cart-service").show();
        	const service = outgoingForm.transfer;
        	$(".outgoing-transfer-cart-service-list").append(generateServiceItem(service.name, service.price));
        } else {
          $(".outgoing-transfer-cart-service").hide();
        }
    }
    
    var returnForm = window.localStorage.getItem("return");
    returnForm = returnForm ? convertJsonToObject(returnForm) : null;
    if (returnForm) {
        $(".return-cart-journey").show();
        if (returnForm.departure && returnForm.arrival) {
            $(".return-departure-cart-airport-title").html(mgObject.arrival + " - Departure");
            $(".return-arrival-cart-airport-title").html(mgObject.departure + " - Arrival");
        } else {
            $(".return-departure-cart-airport-title").html(mgObject.departure + " - Departure");
            $(".return-arrival-cart-airport-title").html(mgObject.arrival + " - Arrival");
        }
        displayJourneyServices(returnForm.departure, ".return-departure-cart-service", ".return-departure-cart-service-list");
        displayJourneyServices(returnForm.arrival, ".return-arrival-cart-service", ".return-arrival-cart-service-list");
        if (returnForm.transfer) {
            $(".return-transfer-cart-service").show();
            const service = returnForm.transfer;
            $(".return-transfer-cart-service-list").append(generateServiceItem(service.name, service.price*getMGObject().traveler));
        } else {
            $(".return-transfer-cart-service").hide();
        }
    }
    var additionalServicesForm = window.localStorage.getItem("additional-services");
    additionalServicesForm = additionalServicesForm ? convertJsonToObject(additionalServicesForm) : [];
    if (additionalServicesForm && additionalServicesForm.length > 0) {
        $(".additional-services-cart-journey").show();
        $(".additional-services-cart").show();
    } else {
        $(".additional-services-cart-journey").hide();
    }
    for(var i = 0; i < additionalServicesForm.length; i ++) {
        const service = additionalServicesForm[i];
        $(".additional-services-cart-list").append(generateServiceItem(service.name, service.price*getMGObject().traveler));
    }
}

function displayJourneyServices(data, journeyClass, servicesClass) {
    if (data) {
        $(journeyClass).show();
        if (data.meetGreetService) {
            const service = data.meetGreetService;
            $(servicesClass).append(generateServiceItem(service.name, service.price*getMGObject().traveler));
        }
        if (data.transportSolution) {
            const service = data.transportSolution;
            const priceVehiclesRequired = getMGObject().traveler > 4 ? 2 : 1;
            $(servicesClass).append(generateServiceItem(service.name, service.price*priceVehiclesRequired));
        }
        if (data.covidSafetyServices) {
            const services = data.covidSafetyServices;
            for(var i = 0; i < services.length; i ++) {
                const service = services[i];
                $(servicesClass).append(generateServiceItem(service.name, service.price*getMGObject().traveler));
            }
        }
        if (data.totalCares) {
            const services = data.totalCares;
            for(var i = 0; i < services.length; i ++) {
                const service = services[i];
                $(servicesClass).append(generateServiceItem(service.name, service.price*getMGObject().traveler));
            }
        }
    } else {
        $(journeyClass).hide();
    }
}

function generateServiceItem(name, price) {
    const result = '<div class="cart-service">'
                + '<div>' + name + '</div>'
                + '<div>' + currencyFormat(price) + '</div>'
                + '</div>'
    return result;
}

function setTransportLocationPrice(arrivalClass) {
    const transportLocationSelect = $("#" + arrivalClass + "transport-location-select option:selected").text();
    if ((!arrivalClass && transportLocationSelect != defaultPickUpLocation) || (arrivalClass && transportLocationSelect != defaultDropOffLocation)) {
        $("." + arrivalClass + "product-button-option").each(function() {
            if ($(this).text() == "CGK" || $(this).text() == $("#" + arrivalClass + "transport-location-select option:selected").text()) {
                $(this).trigger("click");
            }
        });
        setTimeout(function() {
            $(".service-item-price." + arrivalClass + "transport-solution-product-price").each(function() {
                const text = $(this).text();
                var price = text ? convertCurrencyToNumber(text) : 0;
                price = price*1000;
                $(this).html(currencyFormat(price));
            });
            calTotalPrice();
    }, 1000);
    }
}

$(document).ready(function() {
    initData();
    $('select').niceSelect();
    for(var index = 0; index < listItemsSelected.length; index ++) {
        initItemSelected(listItemsSelected[index], serviceItemSelectedClass);
    }
});