define([

],

function() {

    return function (itemType){

        if (itemType == 'InvtPart')
        itemType = 'inventoryitem';
        else if (itemType == 'OthCharge')
        itemType = 'otherchargeitem';
        else if (itemType == 'Service')
        itemType = 'serviceitem';
        else if (itemType == 'NonInvtPart')
        itemType = 'noninventoryitem';
        else if (itemType == 'Assembly')
        itemType = 'assemblyitem';
        else if (itemType == 'Description')
        itemType = 'descriptionitem';
        else if (itemType == 'Discount')
        itemType = 'discountitem';
        else if (itemType == 'GiftCert')
        itemType = 'giftcertificateitem';
        else if (itemType == 'Group')
        itemType = 'itemgroup';
        else if (itemType == 'Kit')
        itemType = 'kititem';
        else if (itemType == 'Markup')
        itemType = 'markupitem';
        else if (itemType == 'Payment')
        itemType = 'paymentitem';
        else if (itemType == 'Subtotal')
        itemType = 'subtotalitem';


        return itemType;
        
    }

});