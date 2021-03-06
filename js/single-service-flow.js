const priceTextReplace = "IDR";
const productItemClass = ".product-item";
const itemSelectedClass = "service-item-selected";
const serviceItemMultiple = "product-multiple-select";
const productNameItemClass = ".product-name";
const productPriceItemClass = ".product-price";
const singleAirportItemClass = ".single-airport-item";
const singleAirportNameClass = ".single-airport-name";
const singleAirportCodeClass = ".single-airport-code";
const cartAiportOptionButtonClass = ".cart-airport-option-button";
const airportAttrValue = "Airport";
const locationAttrValue = "Location";
const requiredSelectAirportMessage = "Please select an Airport";
const requiredSelectServiceMessage = "Please select a service";
const loyaltyPointClass = ".product-loyalty-point";
const skuClass = ".product-sku";
const productTypeClass = ".product-type";
const productPriceHiddenClass = ".product-price-hidden";
const productItemIDClass = ".product-item-id";
function convertCurrencyToNumber(value) {
  return value
    ? Number(
        value
          .toString()
          .replace(priceTextReplace, "")
          .replace(/[^0-9.-]+/g, "")
      )
    : 0;
}

function currencyFormat(num, unitPrice = 1000) {
  num = convertCurrencyToNumber(num) * unitPrice;
  return (
    "IDR " +
    (num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0)
  );
}

function displayProductPrice() {
  $(productPriceItemClass).each(function () {
    const priceText = $(this).text();
    $(this).html(currencyFormat(priceText));
  });
}

(function () {
  $(".section-navbar").css("background-color", "#1a1a1a");
  const currentProductName = $("#product-name").text();
  $(".related-product-collection-item").each(function () {
    if (currentProductName == $(this).find(".releated-product-name").text()) {
      $(this).remove();
    }
  });
  $(".submit-button").click(function () {
    submit();
  });
  const currentPage = $("#current-page").val();
  switch (currentPage) {
    case "Hotel Quarantine":
      initHotelQuarantinePage();
      break;
    case "PCR/Swab Antigen Test":
      initPCRTestPage();
      break;
    case "LLTA":
      initLLTAPage();
      break;
    case "Terminal Transfer":
      initTerminalTransferPage();
      break;
    case "Airport Delight":
      initAirportDelightPage();
      break;
    case "Luggage Delivery":
      initLuggageDeliveryPage();
      break;
    case "Transport Solutions":
      initTransportSolutionsPage();
      break;
  }
  setTimeout(function () {
    displayProductPrice();
  }, 1500);
})();

function initHotelQuarantinePage() {
  initAirportsSelect(".hotel-airport-select", cartAiportOptionButtonClass);
  airportChange(".hotel-airport-select", cartAiportOptionButtonClass);
  initTravelerSelect(".hotel-traveler-select");
}

function initPCRTestPage() {
  initClickEventsToProductItem();
  initAirportsSelect(".pcr-airport-select", ".pcr-airport-button");
  airportChange(".pcr-airport-select", ".pcr-airport-button");
  initTravelerSelect(".pcr-traveler-select");
}

function initLLTAPage() {
  initTravelerSelect(".llta-traveler-select");
}

function initTerminalTransferPage() {
  initAirportsSelect(
    ".terminal-transfer-airport-select",
    cartAiportOptionButtonClass
  );
  airportChange(
    ".terminal-transfer-airport-select",
    cartAiportOptionButtonClass
  );
  initTravelerSelect(".terminal-transfer-traveler-select");
  initLocationSelect(".cart-option", "Drop-off", ".dropoff-terminal-select");
  initLocationSelect(".cart-option", "Pick-up", ".pickup-terminal-select");
}

function initAirportDelightPage() {
  initAirportsSelect(".airport-delight-select", cartAiportOptionButtonClass);
  airportChange(".airport-delight-select", cartAiportOptionButtonClass);
  initTravelerSelect(".airport-delight-traveler-select");
}

function initLuggageDeliveryPage() {
  $(".luggage-delivery-select").each(function () {
    const currentSelect = $(this).parent().find('option[value=""]').text();
    $(this).addClass(
      $.trim(currentSelect.toLowerCase()).replace(" ", "-") +
        "-luggage-delievery-select"
    );
  });
  initAirportsSelect(
    ".luggage-delivery-airport-select",
    cartAiportOptionButtonClass
  );
  airportChange(
    ".luggage-delivery-airport-select",
    cartAiportOptionButtonClass
  );
  initTravelerSelect(".luggage-delivery-traveler-select");
}

function initTransportSolutionsPage() {
  initClickEventsToProductItem(true);
  initAirportsSelect(
    ".transport-solutions-airport-select",
    ".transport-solutions-button"
  );
  initTravelerSelect(".transport-solutions-traveler-select");
  initLocationSelect(
    ".cart-option",
    "Location",
    ".location-transport-solutions-select"
  );
  transportAirportLocationChange();
  const vehiclesRequired =
    '<div style="display: none;" id="w-node-_38c2e180-8c41-e4b0-445a-b9ec91ebc2eb-ed1cc56e" role="listitem" class="w-dyn-item vehicles-required-container">' +
    '<div class="product-item transport-solution-item">' +
    '<div class="transport-solution-vehicles-description">' +
    "<div>" +
    '<div class="heading-title padding-vertical-small">2 Vehicles required</div>' +
    "<div>Each vehicle can seat a maximum of 4 pax, therefore you will require 2 vehicles.</div>" +
    "</div>" +
    "<div>" +
    '<div class="departure-vehicles-required-count"></div>' +
    '<div class="heading-title departure-vehicles-required-price"></div>' +
    "</div></div></div></div>";
  $(".single-transport-solutions-collection-list").append(vehiclesRequired);
  $(".transport-solutions-traveler-select").change(function () {
    const numberOfPassengers = getCurrentTraveler(
      ".transport-solutions-traveler-select"
    );
    if (numberOfPassengers > 4) {
      $(".vehicles-required-container").show();
    } else {
      $(".vehicles-required-container").hide();
    }
  });
}

function initTravelerSelect(travelerSelectClass) {
  $(".traveler-item").each(function () {
    var s = $(this).text();
    $(travelerSelectClass).append(
      '<option value="' + s + '">' + s + "</option>"
    );
  });
}

function getCurrentTraveler(travelerClass) {
  const travelerText = $(travelerClass + " option:selected").text();
  const travelerAfterSplit = travelerText.split("x");
  return travelerAfterSplit && travelerAfterSplit.length > 0
    ? Number(travelerAfterSplit[0])
    : 1;
}

function airportChange(selectClass, cartAiportOptionButton) {
  $(selectClass).change(function () {
    const currentSelectedValue = $(selectClass + " option:selected").val();
    if (currentSelectedValue) {
      var isMatchedValue = false;
      $(cartAiportOptionButton).each(function () {
        if (
          $(this).text() == currentSelectedValue &&
          $(this).attr("aria-checked") != "true" &&
          $(this).parent().attr("aria-label") == airportAttrValue
        ) {
          $(productPriceItemClass).hide();
          isMatchedValue = true;
          $(this).trigger("click");
        }
      });
      if (isMatchedValue) {
        setTimeout(function () {
          displayProductPrice();
          $(productPriceItemClass).show();
        }, 200);
      }
    }
  });
}

function initClickEventsToProductItem(isDisplayVehiclesRequired = false) {
  $(productItemClass).click(function () {
    if ($(this).hasClass(itemSelectedClass)) {
      $(this).removeClass(itemSelectedClass);
      if (isDisplayVehiclesRequired) {
        $(".departure-vehicles-required-count").empty();
        $(".departure-vehicles-required-price").empty();
      }
    } else {
      if (!$(productItemClass).hasClass(serviceItemMultiple)) {
        $(productItemClass).each(function () {
          $(this).removeClass(itemSelectedClass);
        });
      }
      $(this).addClass(itemSelectedClass);
      if (isDisplayVehiclesRequired) {
        displayPriceForVehiclesRequired();
      }
    }
  });
}

function initAirportsSelect(itemClass, cartAiportOptionButton) {
  var productAirports = [];
  $(cartAiportOptionButton).each(function () {
    if ($(this).parent().attr("aria-label") == airportAttrValue) {
      productAirports.push($(this).text());
    }
  });
  $(singleAirportItemClass).each(function () {
    var text = $(this).find(singleAirportNameClass).text();
    var value = $(this).find(singleAirportCodeClass).text();
    if (productAirports.includes(value)) {
      $(itemClass).append(
        '<option value="' + value + '">' + text + "</option>"
      );
    }
  });
}

function initLocationSelect(
  cartOptionClass,
  compareAttrClass,
  insertSelectClass
) {
  $(cartOptionClass).each(function () {
    const children = $(this).children();
    const childrenAttr = children.attr("aria-label");
    if (childrenAttr == compareAttrClass) {
      children.children().each(function () {
        const text = $(this).children().text();
        const value = $(this).children().text();
        $(insertSelectClass).append(
          '<option value="' + value + '">' + text + "</option>"
        );
      });
    }
  });
}

function transportAirportLocationChange() {
  const aiportSelectClass = ".transport-solutions-airport-select";
  const locationSelectClass = ".location-transport-solutions-select";
  const cartAiportOptionButton = ".transport-solutions-button";
  $(aiportSelectClass + ' option[value=""]').attr("disabled", "disabled");
  $(locationSelectClass + ' option[value=""]').attr("disabled", "disabled");
  $(aiportSelectClass).change(function () {
    const currentSelectedValue = $(
      aiportSelectClass + " option:selected"
    ).val();
    if (currentSelectedValue) {
      var isMatchedValue = false;
      $(cartAiportOptionButton).each(function () {
        if (
          $(this).text() == currentSelectedValue &&
          $(this).attr("aria-checked") != "true" &&
          $(this).parent().attr("aria-label") == airportAttrValue
        ) {
          $(this).trigger("click");
          if ($(locationSelectClass).val()) {
            $(productPriceItemClass).hide();
            isMatchedValue = true;
          }
        }
      });
      if (isMatchedValue) {
        setTimeout(function () {
          displayProductPrice();
          $(productPriceItemClass).show();
          displayPriceForVehiclesRequired();
        }, 200);
      }
    }
  });

  $(locationSelectClass).change(function () {
    const currentSelectedValue = $(
      locationSelectClass + " option:selected"
    ).val();
    if (currentSelectedValue) {
      var isMatchedValue = false;
      $(cartAiportOptionButton).each(function () {
        if (
          $(this).text() == currentSelectedValue &&
          $(this).attr("aria-checked") != "true" &&
          $(this).parent().attr("aria-label") == locationAttrValue
        ) {
          $(this).trigger("click");
          if ($(aiportSelectClass).val()) {
            $(productPriceItemClass).hide();
            isMatchedValue = true;
          }
        }
      });
      if (isMatchedValue) {
        setTimeout(function () {
          displayProductPrice();
          $(productPriceItemClass).show();
          displayPriceForVehiclesRequired();
        }, 200);
      }
    }
  });
}

function submit() {
  const currentPage = $("#current-page").val();
  window.localStorage.removeItem("single-service");
  var singleService = null;
  var airport = null;
  switch (currentPage) {
    case "Hotel Quarantine":
      airport = $(".hotel-airport-select option:selected");
      if (!airport.val()) {
        alert(requiredSelectAirportMessage);
        return false;
      }
      singleService = {
        airport: airport.text(),
        airportCode: airport.val(),
        traveler: getCurrentTraveler(".hotel-traveler-select"),
        services: [],
      };
      singleService.services.push({
        name: $("#current-product-name").val(),
        loyaltyPoint: $("#current-product-loyal-point").val(),
        sku: $("#current-product-sku").val(),
        flightType: "arr",
        price: convertCurrencyToNumber($("#current-product-price").val()),
        id: $("#current-product-item-id").val(),
      });
      break;
    case "PCR/Swab Antigen Test":
      airport = $(".pcr-airport-select option:selected");
      if (!airport.val()) {
        alert(requiredSelectAirportMessage);
        return false;
      }
      singleService = {
        airport: airport.text(),
        airportCode: airport.val(),
        traveler: getCurrentTraveler(".pcr-traveler-select"),
        services: [],
      };
      $(".pcr-product-item").each(function () {
        if ($(this).hasClass(itemSelectedClass)) {
          singleService.services.push({
            name: $(this).find(productNameItemClass).text(),
            loyaltyPoint: $(this).find(loyaltyPointClass).text(),
            sku: $(this).find(skuClass).text(),
            flightType: "arr",
            price: convertCurrencyToNumber(
              $(this).find(productPriceHiddenClass).text()
            ),
            id: $(this).find(productItemIDClass).text(),
          });
        }
      });
      if (singleService.services.length == 0) {
        alert(requiredSelectServiceMessage);
        return false;
      }
      break;
    case "LLTA":
      singleService = {
        traveler: getCurrentTraveler(".llta-traveler-select"),
        services: [],
      };
      singleService.services.push({
        name: $("#current-product-name").val(),
        loyaltyPoint: $("#current-product-loyal-point").val(),
        sku: $("#current-product-sku").val(),
        productType: $("#current-product-type").val(),
        flightType: "arr",
        price: convertCurrencyToNumber($("#current-product-price").val()),
        id: $("#current-product-item-id").val(),
      });
      break;
    case "Terminal Transfer":
      airport = $(".terminal-transfer-airport-select option:selected");
      if (!airport.val()) {
        alert(requiredSelectAirportMessage);
        return false;
      }
      singleService = {
        airport: airport.text(),
        airportCode: airport.val(),
        traveler: getCurrentTraveler(".terminal-transfer-traveler-select"),
        services: [],
        pickUp: $(".pickup-terminal-select").val(),
        dropOff: $(".dropoff-terminal-select").val(),
      };
      singleService.services.push({
        name: $("#current-product-name").val(),
        loyaltyPoint: $("#current-product-loyal-point").val(),
        sku: $("#current-product-sku").val(),
        flightType: "arr",
        price: convertCurrencyToNumber($("#current-product-price").val()),
        id: $("#current-product-item-id").val(),
      });
      break;
    case "Airport Delight":
      airport = $(".airport-delight-select option:selected");
      if (!airport.val()) {
        alert(requiredSelectAirportMessage);
        return false;
      }
      singleService = {
        airport: airport.text(),
        airportCode: airport.val(),
        traveler: getCurrentTraveler(".airport-delight-traveler-select"),
        services: [],
      };
      singleService.services.push({
        name: $("#current-product-name").val(),
        loyaltyPoint: $("#current-product-loyal-point").val(),
        sku: $("#current-product-sku").val(),
        flightType: "arr",
        price: convertCurrencyToNumber($("#current-product-price").val()),
        id: $("#current-product-item-id").val(),
      });
      break;
    case "Luggage Delivery":
      airport = $(".luggage-delivery-airport-select option:selected");
      if (!airport.val()) {
        alert(requiredSelectAirportMessage);
        return false;
      }
      singleService = {
        airport: airport.text(),
        airportCode: airport.val(),
        traveler: getCurrentTraveler(".luggage-delivery-traveler-select"),
        services: [],
      };
      singleService.services.push({
        name: $("#current-product-name").val(),
        loyaltyPoint: $("#current-product-loyal-point").val(),
        sku: $("#current-product-sku").val(),
        flightType: $(".dropoff-luggage-select").val(),
        productType: $("#current-product-type").val(),
        price: convertCurrencyToNumber($("#current-product-price").val()),
        id: $("#current-product-item-id").val(),
      });
      break;
    case "Transport Solutions":
      airport = $(".transport-solutions-airport-select option:selected");
      if (!airport.val()) {
        alert(requiredSelectAirportMessage);
        return false;
      }
      singleService = {
        airport: airport.text(),
        airportCode: airport.val(),
        traveler: getCurrentTraveler(".transport-solutions-traveler-select"),
        services: [],
        terminal: $(".location-transport-solutions-select").val(),
      };
      $(".transport-solution-item").each(function () {
        if ($(this).hasClass(itemSelectedClass)) {
          singleService.services.push({
            name: $(this).find(productNameItemClass).text(),
            loyaltyPoint: $(this).find(loyaltyPointClass).text(),
            sku: $(this).find(skuClass).text(),
            flightType: $(".dropoff-transport-solutions-select").val(),
            price: convertCurrencyToNumber(
              $(this).find(productPriceHiddenClass).text()
            ),
            id: $(this).find(productItemIDClass).text(),
            productType: $(this).find(productTypeClass).text(),
          });
        }
      });
      if (singleService.services.length == 0) {
        alert(requiredSelectServiceMessage);
        return false;
      }
      break;
  }
  singleService.name = $("#current-product-name").val();
  window.localStorage.setItem("single-service", JSON.stringify(singleService));
  window.location = "/passenger-details-other-services";
}

function displayPriceForVehiclesRequired() {
  $(productItemClass).each(function () {
    if ($(this).hasClass(itemSelectedClass)) {
      const currentProductPriceText = $(this)
        .find(productPriceItemClass)
        .text();
      if (currentProductPriceText) {
        $(".departure-vehicles-required-count").html(
          "2x " + currentProductPriceText + " ="
        );
        const currentProductPrice = convertCurrencyToNumber(
          currentProductPriceText
        );
        $(".departure-vehicles-required-price").html(
          currencyFormat(currentProductPrice * 2, 1)
        );
      }
    }
  });
}
