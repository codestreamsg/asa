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

function currencyFormat(num) {
  num = convertCurrencyToNumber(num) * 1000;
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
  initClickEventsToProductItem();
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

function initClickEventsToProductItem() {
  $(productItemClass).click(function () {
    if ($(this).hasClass(itemSelectedClass)) {
      $(this).removeClass(itemSelectedClass);
    } else {
      if (!$(productItemClass).hasClass(serviceItemMultiple)) {
        $(productItemClass).each(function () {
          $(this).removeClass(itemSelectedClass);
        });
      }
      $(this).addClass(itemSelectedClass);
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
      $(".hotel-product-item").each(function () {
        const serviceItem = {
          name: $("#current-product-name").val(),
          loyaltyPoint: $("#current-product-loyal-point").val(),
          sku: $("#current-product-sku").val(),
          flightType: "arr",
          price: convertCurrencyToNumber(
            $(this).find(productPriceItemClass).text()
          ),
        };
        singleService.services.push(serviceItem);
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
          const serviceItem = {
            name: $(this).find(productNameItemClass).text(),
            loyaltyPoint: $(this).find(loyaltyPointClass).text(),
            sku: $(this).find(skuClass).text(),
            flightType: "arr",
            price: convertCurrencyToNumber(
              $(this).find(productPriceItemClass).text()
            ),
          };
          singleService.services.push(serviceItem);
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
      $(".llta-product-item").each(function () {
        const serviceItem = {
          name: $("#current-product-name").val(),
          loyaltyPoint: $("#current-product-loyal-point").val(),
          sku: $("#current-product-sku").val(),
          productType: $("#current-product-type").val(),
          flightType: "arr",
          price: convertCurrencyToNumber(
            $(this).find(productPriceItemClass).text()
          ),
        };
        singleService.services.push(serviceItem);
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
      $(".terminal-transfer-product-item").each(function () {
        const serviceItem = {
          name: $("#current-product-name").val(),
          loyaltyPoint: $("#current-product-loyal-point").val(),
          sku: $("#current-product-sku").val(),
          flightType: "arr",
          price: convertCurrencyToNumber(
            $(this).find(productPriceItemClass).text()
          ),
        };
        singleService.services.push(serviceItem);
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
      $(".airport-delight-product-item").each(function () {
        const serviceItem = {
          name: $("#current-product-name").val(),
          loyaltyPoint: $("#current-product-loyal-point").val(),
          sku: $("#current-product-sku").val(),
          flightType: "arr",
          price: convertCurrencyToNumber(
            $(this).find(productPriceItemClass).text()
          ),
        };
        singleService.services.push(serviceItem);
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
      $(".luggage-delievery-product-item").each(function () {
        const serviceItem = {
          name: $("#current-product-name").val(),
          loyaltyPoint: $("#current-product-loyal-point").val(),
          sku: $("#current-product-sku").val(),
          flightType: $(".dropoff-luggage-select").val(),
          productType: $("#current-product-type").val(),
          price: convertCurrencyToNumber(
            $(this).find(productPriceItemClass).text()
          ),
        };
        singleService.services.push(serviceItem);
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
          const serviceItem = {
            name: $(this).find(productNameItemClass).text(),
            loyaltyPoint: $(this).find(loyaltyPointClass).text(),
            sku: $(this).find(skuClass).text(),
            flightType: $(".dropoff-transport-solutions-select").val(),
            price: convertCurrencyToNumber(
              $(this).find(productPriceItemClass).text()
            ),
            productType: $(this).find(productTypeClass).text(),
          };
          singleService.services.push(serviceItem);
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
