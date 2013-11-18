/**
 * Created with JetBrains PhpStorm.
 * User: Mirtl
 * Date: 03.11.13
 * Time: 14:48
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function(){
    var jsonArr = [];
    var bowlarray = [];
    var sum = 0;
    var DOMvariables = {productcolumn: "#productcolumn", bowlcolumn: "#bowlcolumn", alertheader: "main > header > p:last-child"};
    var defaulttext = $(DOMvariables.alertheader).text();
    var directivesForPure = {
        one:{
            "section": {
                "store <- stores":{
                    "header": "store.name",
                    "header@class":"'storeheader'",
                    "@data-store":"store._id",
                    "li":{
                        "product <- store.items":{
                            ".": "product.name",
                            "@class": "'productlist'",
                            "@data-productid":"product._id"
                        }
                    }
                }
            }
        },
        two:{
            "span": "sum",
            "li":{
                "product <- bowllist":{
                    "@style": "display: inline",
                    "@data-productid": "product._id",
                    "p:first-child": "product.name",
                    "p:last-child":"product.measure",
                    "input@value": "product.number"
                }
            }
        }
    };
    var productsRender = $(DOMvariables.productcolumn).compile(directivesForPure.one);
    var bowlRender = $(DOMvariables.bowlcolumn).compile(directivesForPure.two);
    //switch headers with store names
    function showList(){
        $(".productlist").hide();
        $("#veg").find("header").css("border-radius", "0 0 10px 10px");//yes, it's awful and it doesn't work((
        $(this).css("border-radius", "0 0 0 0")
            .next("ul").find(".productlist").show();
    }
    //calculate product calories by multiplied it with amount
    //когда изменяешь кол-во продукта на 0, считает это неправильным кол-вом, ИСПРАВИТЬ!
    function calCalc(_id, amount){
        sum = 0;
        for(var i = 0; i < bowlarray.length; i++){
            if(bowlarray[i]._id === _id){
                bowlarray[i].number = amount;//new property for bowlarray
            }
            sum += Math.ceil(bowlarray[i].number * bowlarray[i].cal);
        }
        return sum;
    }
    //change product amount in bowl
    function changeAmount(){
        debugger;
        //var this_amount = checkString($(this).val());
        var this_amount = parseInt(($(this).val()), 10);//something goes wrong
        var this_id = $(this).closest("li").attr("data-productid");
        if(isNaN(this_amount) || this_amount > 1000){
            $(DOMvariables.alertheader).text("Введите верное количество продукта.")
        }
        else{
            $(DOMvariables.alertheader).text(defaulttext);
            calCalc(this_id, this_amount);
            $("#bowlcolumn").find("header").text("Итог: " + sum + " кал.");
        }
    }
    //call when click on product in list
    function addProduct(){
        var returnedItem = chooseProduct(this);
        for(var i = 0; i < bowlarray.length; i++){
            if(bowlarray[i]._id === returnedItem._id){
                $(DOMvariables.alertheader).text("Выбранный вами продукт уже есть в миске");
                return;
            }
        }
        $(DOMvariables.alertheader).text(defaulttext);
        bowlarray.push(returnedItem);
        $(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender);
        $("#bowlcolumn").find("header").text("Итог: " + sum + " кал.");
    }
    //get store and id of chosen element from data attribute and call search function
    function chooseProduct(el){
        return searchProduct($(el).closest("section").data("store"), $(el).data("productid"));
    }
    //search object with the same store id and then item id and push it to bowl array
    function searchProduct(itemstore, itemid){
        for(var i = 0; i < jsonArr.length; i++){
            if(jsonArr[i]._id === itemstore){
                for(var j = 0; j < jsonArr[i].items.length; j++){
                    if(jsonArr[i].items[j]._id === itemid){
                        jsonArr[i].items[j].number = 0;
                        return jsonArr[i].items[j];
                    }
                }
            }
        }
    }
    //get data from json
    $.ajax({
         url: "newjson.json",
         dataType: "json",
         success: function(data){
             $.each(data, function(key, val){
                 jsonArr.push(val);
             });
         },
         error: function(jqXHR, textStatus, errorThrown) {
             alert(textStatus + ": " + errorThrown);
         },
         complete: function(){
             jsonArr.sort();
             $(DOMvariables.productcolumn).render({stores: jsonArr}, productsRender);
             $(DOMvariables.productcolumn).on("click", ".storeheader", showList);
             $(DOMvariables.productcolumn).on("click", ".productlist", addProduct);
             $(document).on("change", "input", changeAmount );
         }
    });

});
