    const priceTextReplace = 'IDR';
    const productItemClass = '.product-item';
    const itemSelectedClass = 'service-item-selected';
    const serviceItemMultiple = 'product-multiple-select';
    const productNameItemClass = '.product-name';
    const productPriceItemClass = '.product-price';
    const singleAirportItemClass = '.single-airport-item';
    const singleAirportNameClass = '.single-airport-name';
    const singleAirportCodeClass = '.single-airport-code';
    const cartAiportOptionButtonClass = '.cart-airport-option-button';
    function convertCurrencyToNumber(value) {
        return value ? Number(value.toString().replace(priceTextReplace, "").replace(/[^0-9.-]+/g,""))*1000 : 0;
    }

    function currencyFormat(num) {
        num = convertCurrencyToNumber(num);
        return  "IDR " + (num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0);
    }
    
    function displayProductPrice() {
        $(".product-price").each(function() {
            const priceText = $(this).text();
        $(this).html(currencyFormat(priceText));
        });
    }
    
    (function() {
        $('.section-navbar').css("background-color", "#1a1a1a");
        const currentProductName = $("#product-name").text();
        $(".related-product-collection-item").each(function() {
            if (currentProductName == $(this).find(".releated-product-name").text()) {
            $(this).remove();
        }
        });   
        $(".submit-button").click(function() {
            submit();
        });
        const currentPage = $("#current-page").val();
        switch(currentPage) {
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

    function getCurrentTraveler(travelerClass) {
        const travelerText = $(travelerClass + " option:selected").text();
        const travelerAfterSplit = travelerText.split("x");
        return travelerAfterSplit && travelerAfterSplit.length > 0 ? Number(travelerAfterSplit[0]) : 1;
    }
    
    function initHotelQuarantinePage() {
        airportChange(".hotel-airport-select");
        $('.traveler-item').each(function() {
            var s = $(this).text();
            $('.hotel-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
        initAirportsSelect(".hotel-airport-select");
    }

    function airportChange(selectClass) {
        $(selectClass).change(function() {
            const currentSelectedValue = $(selectClass + " option:selected").val();
            if (currentSelectedValue) {
                $(productPriceItemClass).hide();
                $(cartAiportOptionButtonClass).each(function() {
                    if ($(this).text() == currentSelectedValue) {
                        $(this).trigger("click");
                    }
                });
                setTimeout(function(){ 
                    displayProductPrice();
                    $(productPriceItemClass).show();
                }, 200);
            }
        });
    }
    
    function initPCRTestPage() {
        initClickEventsToProductItem();
        $(".pcr-airport-select").change(function() {
            const currentSelectedText = $(".pcr-airport-select option:selected").text();
            const currentSelectedValue = $(".pcr-airport-select option:selected").val();
            if (currentSelectedValue) {
                $(".product-price").hide();
                $(".pcr-airport-button").each(function() {
                if ($(this).text() == currentSelectedText) {
                    $(this).trigger("click");
                }
                });
                setTimeout(function(){ 
                displayProductPrice();
                $(".product-price").show();
                }, 200);
            }
            });
            $('.traveler-item').each(function() {
            var s = $(this).text();
            $('.pcr-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
    }
    
    function initLLTAPage() {
        $('.traveler-item').each(function() {
        var s = $(this).text();
        $('.llta-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
    }
    
    function initTerminalTransferPage() {
        airportChange(".terminal-transfer-airport-select");
        $('.traveler-item').each(function() {
        var s = $(this).text();
        $('.terminal-transfer-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
    }
    
    function initClickEventsToProductItem() {
        $(productItemClass).click(function() {
            if ($(this).hasClass(itemSelectedClass)) {
            $(this).removeClass(itemSelectedClass);
        } else {
            if (!$(productItemClass).hasClass(serviceItemMultiple)) {
            $(productItemClass).each(function() {
                $(this).removeClass(itemSelectedClass);
            });
            }
            $(this).addClass(itemSelectedClass);
        }
        });
    }
    
    function initAirportDelightPage() {
        airportChange(".airport-delight-select");
        $('.traveler-item').each(function() {
        var s = $(this).text();
        $('.airport-delight-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
    }
    
    function initLuggageDeliveryPage() {
        airportChange(".luggage-delivery-airport-select");
        $('.traveler-item').each(function() {
        var s = $(this).text();
        $('.luggage-delivery-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
        $(".luggage-delivery-select").each(function() {
        const currentSelect = $(this).parent().find('option[value=""]').text();
        $(this).addClass($.trim(currentSelect.toLowerCase()).replace(" ", "-") + "-luggage-delievery-select");
        });
    }
    
    function initTransportSolutionsPage() {
        initClickEventsToProductItem();
        $(".transport-solutions-airport-select").change(function() {
            const currentSelectedText = $(".transport-solutions-airport-select option:selected").text();
            const currentSelectedValue = $(".transport-solutions-airport-select option:selected").val();
            if (currentSelectedValue) {
                $(".product-price").hide();
                $(".transport-solutions-button").each(function() {
                if ($(this).text() == currentSelectedText) {
                    $(this).trigger("click");
                }
                });
                setTimeout(function(){ 
                    displayProductPrice();
                    $(".product-price").show();
                }, 200);
            }
        });
        $('.traveler-item').each(function() {
            var s = $(this).text();
            $('.transport-solutions-traveler-select').append('<option value="' + s + '">' + s + '</option>');
        });
    }

    function initAirportsSelect(itemClass) {
        $(singleAirportItemClass).each(function() {
            var text = $(this).find(singleAirportNameClass).text();
            var value = $(this).find(singleAirportCodeClass).text();
            $(itemClass).append('<option value="' + value + '">' + text + '</option>');
        });
    }