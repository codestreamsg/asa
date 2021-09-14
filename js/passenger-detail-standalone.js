function Generator() {}

Generator.prototype.rand = Math.floor(Math.random() * 26) + Date.now();

Generator.prototype.getId = function () {
  return this.rand++;
};
const priceTextReplace = "IDR";
const disabledNextButtonClass = "disabled-button";
$(document).ready(function () {
  $(".checkout-button").addClass(disabledNextButtonClass);
  $(".passenger-details-content").hide();
  $(".input-can-hide").each(function () {
    $(this).prop("required", false);
  });
  $(".add-on-services-container").hide();
  $(".add-on-services-content").hide();
  setProducOptions();
  initCheckoutButton();
  $(".success-message-form").remove();
  const passengerDetailId = new Generator();
  $("#passenger_detail_id").val(passengerDetailId.getId());
  $("#customer_passenger_detail_id").val($("#passenger_detail_id").val());
  $(".flight-date").prop("type", "date");
  $(".flight-time").prop("type", "time");
  $("#Full-Name").focusout(function () {
    if ($("#Is-Passenger").is(":checked")) {
      $(".passenger-full-name-first").val($("#Full-Name").val());
    }
  });
  $("#Is-Passenger").change(function () {
    if (this.checked) {
      $(".passenger-full-name-first").val($("#Full-Name").val());
    } else {
      $(".passenger-full-name-first").val("");
    }
  });
  $(".coupon-container").hide();
  setTimeout(function () {
    initTheCart();
    jQuery.getJSON(
      "https://" +
        FC.settings.storedomain +
        "/cart?" +
        FC.session.get() +
        "&empty=true&output=json&callback=?",
      function (cart) {
        addProductsToFoxy();
        $(".checkout-button").removeClass(disabledNextButtonClass);
      }
    );
  }, 3000);
  addCouponToCart();
  $(".cart-service-list").empty();
  $(".cart-airport-title").empty();
});

function convertJsonToObject(string) {
  return string ? jQuery.parseJSON(string) : {};
}

function addCouponToCart() {
  $(".voucher-button").click(function () {
    $(".voucher-error-message").hide();
    const couponVal = $("#Voucher-Code").val();
    if (!couponVal) {
      return false;
    }
    FC.client
      .request(
        "https://" + FC.settings.storedomain + "/cart?coupon=" + couponVal
      )
      .done(function () {
        if (FC.util.hasError("coupon")) {
          $(".voucher-error-message").show();
        } else {
          $("#Voucher-Code").val("");
          displayPriceAfterDiscount();
        }
      });
  });
}

function displayPriceAfterDiscount() {
  jQuery.getJSON(
    "https://" +
      FC.settings.storedomain +
      "/cart?" +
      FC.session.get() +
      "&output=json&callback=?",
    function (cart) {
      $(".services-total-price").html(currencyFormat(cart.total_order));
      $("#total-price").html(currencyFormat(cart.total_order));
      $(".coupon-container").hide();
      $(".coupons-list").empty();
      $.each(cart.coupons, function (key, value) {
        $(".coupon-container").show();
        $(".coupons-list").append(
          generateDiscountItem(value.name + ": " + key, value.amount)
        );
      });
    }
  );
}

function addProductsToFoxy() {
  var singleService = window.localStorage.getItem("single-service");
  singleService = singleService ? convertJsonToObject(singleService) : null;
  if (!singleService) {
    return false;
  }
  const numberOfPassengers = singleService.traveler;
  for (var i = 0; i < singleService.services.length; i++) {
    const service = singleService.services[i];
    var qty = numberOfPassengers;
    if (service.productType == "Transport Solution") {
      qty = numberOfPassengers > 4 ? 2 : 1;
    }
    const productDetail = getProductById(service?.id);
    if (productDetail) {
      getInputsForProduct(
        productDetail.name,
        productDetail.price,
        "Outgoing Departure",
        service.loyaltyPoint,
        singleService.airportCode,
        "",
        service.sku,
        qty,
        service.flightType,
        service.productType ? service.productType : "",
        singleService.terminal ? singleService.terminal : ""
      );
    }
  }
}

function initTheCart() {
  var singleService = window.localStorage.getItem("single-service");
  singleService = singleService ? convertJsonToObject(singleService) : null;
  if (!singleService) {
    return false;
  }
  var totalPrice = 0;
  if (singleService.airport) {
    $(".cart-airport-title").html(singleService.airport + " - Departure");
  } else {
    $(".cart-airport-title").empty();
  }
  const numberOfPassengers = singleService.traveler;
  for (var i = 0; i < singleService.services.length; i++) {
    const service = singleService.services[i];
    var qty = numberOfPassengers;
    if (service.productType == "Transport Solution") {
      qty = numberOfPassengers > 4 ? 2 : 1;
    }
    const productDetail = getProductById(service?.id);
    if (productDetail) {
      const productPrice = productDetail.price * qty;
      totalPrice = totalPrice + productPrice;
      $(".cart-service-list").append(
        generateServiceItem(productDetail.name, productDetail.price, qty)
      );
    }
  }
  $(".services-total-price").html(currencyFormat(totalPrice));
  $("#total-price").html(currencyFormat(totalPrice));
  $("#airport_departure").val(singleService.airport);
  $("#service_name").val(singleService.name);
  $("#number_of_passengers").val(singleService.traveler);
  $("#outgoing_flight_airport_code").val(singleService.airportCode);
  for (var i = 1; i <= numberOfPassengers; i++) {
    $(".passenger-details-" + i).show();
    $(".passenger-details-" + i + " :input.input-can-hide").prop(
      "required",
      true
    );
  }
  const transportAddOn = singleService.services.find(
    (item) => item?.productType == "Transport Solution"
  );
  const luggageAddOn = singleService.services.find(
    (item) => item?.productType == "Luggage Delivery"
  );
  const isShowLLTAAddOn = singleService.services.find(
    (item) => item?.productType == "LLTA"
  )
    ? true
    : false;
  if (transportAddOn) {
    const addressTitle =
      transportAddOn.flightType == "arr"
        ? "Airport Pick-up address"
        : "Airport Drop-off address";
    $(".add-on-services-container").show();
    $(".add-on-transport-service").show();
    $(".transportation-address-title").html(addressTitle);
  }
  if (luggageAddOn) {
    const addressTitle =
      luggageAddOn.flightType == "arr"
        ? "Airport Pick-up address"
        : "Airport Drop-off address";
    $(".add-on-services-container").show();
    $(".add-on-luggage-delivery-service").show();
    $(".luggage-delivery-address-title").html(addressTitle);
  }
  if (isShowLLTAAddOn) {
    $(".add-on-services-container").show();
    $(".add-on-llta-service").show();
  }
}

function generateServiceItem(name, price, qty) {
  const result =
    '<div class="cart-service">' +
    "<div>" +
    name +
    "</div>" +
    "<div>" +
    '<span style="padding-right: 32px;">' +
    currencyFormat(price) +
    "</span>" +
    "<span>" +
    qty +
    "</span>" +
    "</div>" +
    "</div>";
  return result;
}

function generateDiscountItem(name, price) {
  const result =
    '<div class="cart-service">' +
    "<div>" +
    name +
    "</div>" +
    "<div>" +
    currencyFormat(price) +
    "</div>" +
    "</div>";
  return result;
}

function currencyFormat(num) {
  var numAsString = num.toString();
  const isNegative = numAsString.startsWith("-");
  numAsString = isNegative ? numAsString.replace("-", "") : numAsString;
  const currencyCode = (isNegative ? "- " : "") + "IDR ";
  return (
    currencyCode +
    (num ? numAsString.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0)
  );
}

function getInputsForProduct(
  productName,
  productPrice,
  category,
  loyaltyPoint,
  airport,
  terminal,
  sku,
  quantity,
  flightType,
  productType = "",
  transportLocation = ""
) {
  const productVal =
    "&name=" +
    productName +
    "&price=" +
    productPrice +
    "&code=" +
    sku +
    "&quantity=" +
    quantity +
    "&Journey=" +
    category +
    "&Loyalty Point=" +
    loyaltyPoint +
    "&Airport=" +
    airport +
    "&Terminal=" +
    terminal +
    "&Flight Type=" +
    flightType +
    "&Product Type=" +
    productType +
    "&Transport Location=" +
    transportLocation;
  jQuery.getJSON(
    "https://" +
      FC.settings.storedomain +
      "/cart?" +
      FC.session.get() +
      productVal +
      "&output=json&callback=?",
    function (cart) {}
  );
}

function initCheckoutButton() {
  $("#checkout-button").click(function () {
    $("#add-mg-form-button").trigger("click");
    if ($("#wf-form-booking-form").valid()) {
      $(".section-footer").hide();
      $("#customer_email").val($("#Email-Address").val());
      setTimeout(function () {
        $("#add-cart-button").trigger("click");
      }, 3000);
    }
  });
}

function getProductById(productId) {
  var data = null;
  $(".collection-product-item").each(function () {
    if ($(this).find(".collection-product-item-id").text() == productId) {
      data = {
        id: $(this).find(".collection-product-item-id").text(),
        price:
          convertCurrencyToNumber(
            $(this).find(".collection-product-price").text()
          ) * 1000,
        name: $(this).find(".collection-product-name").text(),
      };
      return false;
    }
  });
  return data;
}

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

function setProducOptions() {
  var singleService = window.localStorage.getItem("single-service");
  singleService = singleService ? convertJsonToObject(singleService) : null;
  if (!singleService) {
    return false;
  }
  $(".collection-product-button").each(function () {
    const text = $(this).text();
    const ariaChecked = $(this).attr("aria-checked");
    if (
      (text == singleService?.terminal || text == singleService?.airportCode) &&
      ariaChecked != "true"
    ) {
      $(this).trigger("click");
    }
  });
}
