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
  num = convertCurrencyToNumber(num)*1000;
  return (
    "IDR " +
    (num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0)
  );
}

function displayProductPrice() {
  $(".product-price").each(function () {
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
  displayProductPrice();
})();

function initHotelQuarantinePage() {
  initAirportsSelect(".hotel-airport-select");
  airportChange(".hotel-airport-select", cartAiportOptionButtonClass);
  initTravelerSelect(".hotel-traveler-select");
}

function initPCRTestPage() {
  initClickEventsToProductItem();
  initAirportsSelect(".pcr-airport-select");
  airportChange(".pcr-airport-select", ".pcr-airport-button");
  initTravelerSelect(".pcr-traveler-select");
}

function initLLTAPage() {
  initTravelerSelect(".llta-traveler-select");
}

function initTerminalTransferPage() {
  initAirportsSelect(".terminal-transfer-airport-select");
  airportChange(
    ".terminal-transfer-airport-select",
    cartAiportOptionButtonClass
  );
  initTravelerSelect(".terminal-transfer-traveler-select");
}

function initAirportDelightPage() {
  initAirportsSelect(".airport-delight-select");
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
  initAirportsSelect(".luggage-delivery-airport-select");
  airportChange(
    ".luggage-delivery-airport-select",
    cartAiportOptionButtonClass
  );
  initTravelerSelect(".luggage-delivery-traveler-select");
}

function initTransportSolutionsPage() {
  initClickEventsToProductItem();
  initAirportsSelect(".transport-solutions-airport-select");
  airportChange(
    ".transport-solutions-airport-select",
    ".transport-solutions-button"
  );
  initTravelerSelect(".transport-solutions-traveler-select");
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
        if ($(this).text() == currentSelectedValue) {
          $(productPriceItemClass).hide();
          isMatchedValue = true;
          $(this).trigger("click");
        }
      });
      if (isMatchedValue) {
        setTimeout(function () {
          displayProductPrice();
          $(productPriceItemClass).show();
        }, 500);
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

function initAirportsSelect(itemClass) {
  $(singleAirportItemClass).each(function () {
    var text = $(this).find(singleAirportNameClass).text();
    var value = $(this).find(singleAirportCodeClass).text();
    $(itemClass).append('<option value="' + value + '">' + text + "</option>");
  });
}
