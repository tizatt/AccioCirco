/*
 *  Copyright (c) 2016 by The Translational Genomics Research
 *  Institute. All rights reserved. This License is limited to, and you may
 *  use the Software solely for, your own internal and non-commercial use
 *  for academic and research purposes. Without limiting the foregoing, you
 *  may not use the Software as part of, or in any way in connection with
 *  the production, marketing, sale or support of any commercial product or
 *  service or for any governmental purposes. For commercial or governmental
 *  use, please contact dcraig@tgen.org. By installing this Software you are
 *  agreeing to the terms of the LICENSE file distributed with this
 *  software.
 *           
*/



//populate db selection

function populateCollectionList(data) {



    for (var item in data) {


        if (data[item].name == "germline" || data[item].name == "tumor") {
            $('#selectDb')
                .append($("<option></option>")
                    .text(data[item].name));
        }
    }

    $("#loading").hide();

}



//populate list of samples

function populateSampleList(data) {

    data = data.sort();

    $.each(data, function(key, value) {
        $('#zz')
            .append($("<option></option>")
                .attr("value", value)
                .on("click", addToList)
                .text(value));
    });



    $("#zz").val('-- select projectRun --').trigger("chosen:updated");
    $("#loading").hide();

}




//get list of samples after clicking get samples button

function getSampleList() {

    //$("#zz").empty();

    $.post('/ia/loadList', {
        option: $("#selectDb option:selected").val()
    }, function(res) {

        $("#loading").show();

        if (!res) {
            $("#loading").text("timed out");
        }

        else{
            if(!res.error){
                populateSampleList(res);
            }
        }

    });


}



//get DBs on load


function getDBs() {

    $("#loading").hide();

    $.get("/ia/loadDb", function(data) {
        populateCollectionList(data);
    });


}





/*

This adds a user's sample selection from the DB list to the area above the accordion
 (that shows the samples selected thus far).

*/

function addToList() {

    if ($("#chosen").find('p').length >= 4) {
        alert("only four samples currently supported... please remove at least one before adding");
    } else {

        var e = document.getElementById("zz");
        var strUser = e.options[e.selectedIndex].value;

        $("#chosen").append("<p>" + strUser + " <a href=\"#\" style=\"color:red;\" onclick=\"rem(this)\">X</a></p>");


    }

}




/*

This removes a sample when the user clicks the red X.

*/


function rem(a) {

    $(a).parent().remove();

}






/*

These two helper functions are involved in toggling how the main page displays.
If fromDb(), it shows the appropriate display for using samples, and from_csv() shows the appropriate
display for entering gene lists.

*/

function fromDb() {
    $("#in_csv_tab").hide();
    $("#in_db_tab").show();
    $("#query_db").show();
}

function from_csv() {
    $("#in_db_tab").hide();
    $("#in_csv_tab").show();
    $("#query_db").hide();
}





/*

Resets the accordion lists

*/

function clearLists() {

    $("#accordion").find("div").each(function(i) {
        $(this).find("h5").empty();
        this.getElementsByTagName('p')[0].innerHTML = "";
    });


}






/*

Populates the accordion lists. Has conditionals for two or three samples.

*/


function populateLists(res, m) {


    var accordion = $("#accordion");
    accordion.empty();

    for(var item in res){
        if( Array.isArray( res[item] ) && res[item].length>0  ){

            var m = res[item];


            if(m[m.length-1]==""){
                m.pop();
            }

            var t_item = item.replace("orig","");
            t_item = t_item.replace("i","");
            t_item = t_item.replace("N","-");
            t_item = t_item.toUpperCase();

        

            var t_id = "c" + t_item;

            var title = $("<h3>"+t_item+"</h3>");
            var contents = $("<div id=\""+t_id+"\"   >"+"<h5>"+m.length+"</h5>"+"<p>"+m+"</p>"+"</div>");
            
            accordion.append(title);
            accordion.append(contents);
        }
    }

    accordion.accordion("refresh");






}
