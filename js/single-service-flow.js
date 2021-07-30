    const priceTextReplace = 'IDR';
    const productItemClass = '.product-item';
    const itemSelectedClass = 'service-item-selected';
    const serviceItemMultiple = 'product-multiple-select';
    const productNameItemClass = '.product-name';
    const productPriceItemClass = '.product-price';
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
    
    function submit() {
        const currentPage = $("#current-page").val();
        window.localStorage.removeItem("single-service");
        var singleService = null;
        var airport = null;
        switch(currentPage) {
            case "Hotel Quarantine":
                airport = $(".hotel-airport-select option:selected").text();
                singleService = {
                    "airport": airport,
                    "traveler": getCurrentTraveler(".hotel-traveler-select"),
                    "services": [{
                        "name": "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
                        "price": convertCurrencyToNumber("{{wf {&quot;path&quot;:&quot;default-sku:price&quot;,&quot;type&quot;:&quot;CommercePrice&quot;\} }}")
                    }]
                }
                break;
            case "PCR/Swab Antigen Test":
                airport = $(".pcr-airport-select option:selected").text();
                singleService = {
                    "airport": airport,
                    "traveler": getCurrentTraveler(".pcr-traveler-select"),
                    "services": []
                }
                $(".pcr-product-item").each(function() {
                    if ($(this).hasClass(itemSelectedClass)) {
                    const serviceItem = {
                        "name": $(this).find(productNameItemClass).text(),
                        "price": convertCurrencyToNumber($(this).find(productPriceItemClass).text())
                    }
                    singleService.services.push(serviceItem);
                }
                });
                break;
                case "LLTA":
                singleService = {
                "traveler": getCurrentTraveler(".llta-traveler-select"),
                "services": [{
                    "name": "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
                    "price": convertCurrencyToNumber("{{wf {&quot;path&quot;:&quot;default-sku:price&quot;,&quot;type&quot;:&quot;CommercePrice&quot;\} }}")
                }]
                }
                break;
            case "Terminal Transfer":
                singleService = {
                "traveler": getCurrentTraveler(".terminal-transfer-traveler-select"),
                "services": [{
                    "name": "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
                    "price": convertCurrencyToNumber("{{wf {&quot;path&quot;:&quot;default-sku:price&quot;,&quot;type&quot;:&quot;CommercePrice&quot;\} }}")
                }],
                pickUp: $(".pickup-terminal-select").val(),
                dropOff: $(".dropoff-terminal-select").val()
                }
                break;
            case "Airport Delight":
                airport = $(".airport-delight-select option:selected").text();
                singleService = {
                    "airport": airport,
                    "traveler": getCurrentTraveler(".airport-delight-traveler-select"),
                    "services": [{
                        "name": "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
                        "price": convertCurrencyToNumber("{{wf {&quot;path&quot;:&quot;default-sku:price&quot;,&quot;type&quot;:&quot;CommercePrice&quot;\} }}")
                    }]
                }
                break;
                case "Luggage Delivery":
                singleService = {
                    "airport": $(".airport-luggage-delievery-select option:selected").text(), 
                "traveler": getCurrentTraveler(".luggage-delivery-traveler-select"),
                "services": [{
                    "name": "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
                    "price": convertCurrencyToNumber("{{wf {&quot;path&quot;:&quot;default-sku:price&quot;,&quot;type&quot;:&quot;CommercePrice&quot;\} }}")
                }],
                pickUp: $(".drop-off-luggage-select option:selected").text(),
                dropOff: $(".pick-up-luggage-select option:selected").text(),
                terminal: $(".terminal-luggage-delievery-select option:selected").text()
                }
                break;
        }
        window.localStorage.setItem("single-service", JSON.stringify(singleService));
        window.location = "/passenger-details-other-services";
    }

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
    }
    
    function airportChange(airportSelectClass) {
        $(airportSelectClass).change(function() {
                if ($(this).val()) {
                $(productPriceItemClass).hide();
                displayProductPrice();
            $(productPriceItemClass).show();
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
        /*
        $(".luggage-delivery-select").each(function() {
            const findLocationSelect = $(this).html().toLowerCase().indexOf("location");
        if (findLocationSelect >= 0) {
            $(".luggage-delivery-option-list").append(
            "<div role='group'><select data-node-type='commerce-add-to-cart-option-select' class='luggage-delivery-select w-select' required=''>" + $(this).html().replace("Location", "Pick-up Location") +"</select></div>");
                $(this).parent().find('option[value=""]').text('Drop-off Location');
            return false;
        }
        });
        */
        $(".luggage-delivery-select").each(function() {
        const currentSelect = $(this).parent().find('option[value=""]').text();
        $(this).addClass($.trim(currentSelect.toLowerCase()).replace(" ", "-") + "-luggage-delievery-select");
        });
    }