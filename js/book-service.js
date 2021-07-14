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
    '.additional-service-item'];
const serviceItemSelectedClass = 'service-item-selected';
const serviceItemPrice = '.service-item-price';
const priceTextReplace = 'IDR';
const tabItemCompleted = '.tab-item-complted';
const tabNotActive = 'tab-not-active';
const tabWCurrent = 'w--current';
const dataWTabAttr = 'data-w-tab';
const productNameClass = '.product-name';
var listTabItems = [];
function getMGObject() {
    return {
        "departure": $("#departure-header").text(),
        "arrival": $("#arrival-header").text(),
        "traveler": Number($("#traveler-header").text().replace("x", ""))
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
}

function initNextPleaseButton() {
    $(".book-service-tab-link").click(function() {
    	const tabSelectedElement = $(this);
        const currentTab = tabSelectedElement.attr(dataWTabAttr);
        var findIndex = listTabItems.indexOf(currentTab);
        if (findIndex == -1) {
            return false;
        }
        findIndex = findIndex + 1;
        for(var i = findIndex; i < listTabItems.length; i ++) {
            const nextTab = $('.' + listTabItems[i]);
            if (nextTab && !nextTab.hasClass(tabNotActive)) {
                nextTab.addClass(tabNotActive);
            }
        }
    });
    $(".next-please-button").click(function() {
        $(".book-service-tab-link").each(function() {
            if ($(this).hasClass(tabWCurrent)) {
              const tabSelectedElement = $(this);
              const currentTab = tabSelectedElement.attr(dataWTabAttr);
              const findIndex = listTabItems.indexOf(currentTab);
              if (findIndex == -1 || findIndex == listTabItems.length - 1) {
                return false;
              }
              tabSelectedElement.addClass(tabItemCompleted);
              const nextTab = $('.' + listTabItems[findIndex + 1]);
              if (nextTab) {
                nextTab.removeClass(tabNotActive);
                nextTab.trigger("click");
              }
              return false;
            }
          });
     })
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
        listTabItems = ['outgoing-journey-tab', 'return-journey-tab', 'additional-services-tab', 'passenger-details-tab', 'checkout-tab'];
    } else {
        $(".book-service-tabs-menu").css("grid-template-columns","1fr 1fr 1fr 1fr");
        $(".return-journey-tab").hide();
        $("#additional-services-step").html("02");
        $("#passenger-details-step").html("03");
        $("#checkout-step").html("04");
        listTabItems = ['outgoing-journey-tab', 'additional-services-tab', 'passenger-details-tab', 'checkout-tab'];
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

function initOutgoingTab() {
    var outgoingForm = window.localStorage.getItem("outgoing"); 
    outgoingForm = outgoingForm ? convertJsonToObject(outgoingForm) : null;
    if (outgoingForm) {
        initServices(outgoingForm.departure, "");
        initServices(outgoingForm.arrival, "arrival-");
    }
}

function initReturnTab() {
    var returnForm = window.localStorage.getItem("return");
    returnForm = returnForm ? convertJsonToObject(returnForm) : null;
    if (returnForm) {
     	initServices(returnForm.departure, "");
  		initServices(returnForm.arrival, "arrival-");
    }
}

function initAdditionalServicesTab() {

}

function initPassengerDetailsTab() {

}

function initCheckoutTab() {

}

function convertJsonToObject(string) {
    return string ? jQuery.parseJSON(string) : null;
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
                    displayVehiclesRequired("." + arrivalClass + "transport-solution-item", Number(transportSolution.price.replace(priceTextReplace, "").replace(/[^0-9.-]+/g,"")));
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
            }
        })
    }
    if (data.transportLocation) {
    	const transportLocation = data.transportLocation;
			const findCurrentLocation = $("." + arrivalClass + "departure-transport-select").find(".current");
        if (findCurrentLocation) {
      	    findCurrentLocation.html(transportLocation);
        }
    }
}

$(document).ready(function() {
    initData();
    $('select').niceSelect();
    for(var index = 0; index < listItemsSelected.length; index ++) {
        initItemSelected(listItemsSelected[index], serviceItemSelectedClass);
    }
});