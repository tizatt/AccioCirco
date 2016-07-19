var loading = false;
var duplicates = [];

function exit(){

    var text = $(event.target)[0].className;

    if(text == "overlay"){
        window.location.replace('#');
    }
}


function getLS(myQuery) {

    loading = true;
    var data = {
        ls: myQuery,
        mc: $("#chn").val()
    };
    $("#g1").empty();

    $.ajax({
        type: "POST",
        url: "/tml/ls",
        data: data,
        timeout: 180000,
        success: function(res) {


                    if(res.length>0){

                        $("#g1").append(res[0].path)
                        $("#g1").append("<br>");
                        $("#g1").append("<br>");


                        for (var i = 0; i < res.length; i++) {

                            $("#g1").append(res[i].size + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[i].filename + " <br> ");

                            if(res[i].aalt ){
                                
                                var aalt = res[i].aalt;

                                for(item in aalt){

                                    if(res[i].size>1000000000){
                                        var str_m = aalt[item];
                                        str_m = str_m.replace(":","");
                                     $("#g1").append( "&nbsp;&nbsp;&nbsp;&nbsp;" + "<b>mult location detected  </b> " + str_m + " <br> ");
                                    }

                                }
            
                    
                            }


                     }  
                 }

                    loading = false;

            

    

        },

        error: function(request, status, err) {

            console.log("k");

        }

    });




};



function curryInit(elem, _json, tt) {




    var w = 1280 - 80, //1280 - 80
        h = 800-180 , //800 - 180
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        //color= d3.scale.ordinal().range(colorbrewer.RdBu[9]),
        root,
        node;

    var tm = d3.layout.treemap()
        .round(false)
        .size([w, h])
        .sticky(true)
        .value(function(d) {
            return d.size;
        });


    var svg = d3.select(elem).append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(.5,.5)");



    var nl_copy = "";

    node = root = _json[0];

    var nodes = tm.nodes(root)
        .filter(function(d) {
            return !d.children;
        });



    var cell = svg.selectAll("g")
        .data(nodes)
        .enter().append("svg:g")
        .attr("class", "cell")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        //.on("click", function(d) { return zoom(node == d.parent ? root : d.parent); })
        .on('mousemove', function(d) {
            // this variable will be used in a loop to store the current node being inspected
            var currentNode = d;
            // this array will hold the names of each subsequent parent node
            var nameList = [currentNode.name];



            nl_copy = nameList[0];

            $(tt).html("<p>" + '<b>PATH:</b> ' + nameList + ' <br><b>ITEMSIZE:</b> ' + Math.round((d.size / 1000000000) * 100) / 100 + ' GB ' + "</p>");

        })


    .on('click', function(d) {

        if (!loading) {
            getLS(nl_copy);
        }
        return window.open("#popup1", "_self");
    });




    cell.append("svg:rect")
        .attr("width", function(d) {
            return d.dx > 4 ? d.dx - .65 : d.dx;
        }) //careful balancing act for border size
        .attr("height", function(d) {
            return d.dy > 4 ? d.dy - .65 : d.dy;
        }) // can either hack borders
        .style("fill", function(d) {


            if (d.name == "empty") {
                return "#000000";
            }
            var found = $.inArray(d.name, duplicates) > -1;
            if(found){
                return "#ff0000";
            }

            return color(d.parent.name);

        });



    _json = null;



};



function clearTm() {

    $("#hi").empty();
    $("#tooltip").empty();

}


function newImg() {

    

    $(".spinner").show();

    var data = {
        item: $("#chn").val()
    };


    $.ajax({
        type: "POST",
        url: "/tml/tmdata_update",
        data: data,
        timeout: 180000,
        success: function(res) {

            clearTm();
            curryInit(document.getElementById("hi"), res, $("#tooltip")) ;
            $(".spinner").hide();

        },

        error: function(request, status, err) {
            console.log("error");

        }

    });

};





function getDups(){


var t = {

    mc: $("#chn").val()
}


duplicates = [];
    
$.ajax({
        type: "POST",
        url: "/tml/dups",
        data: t,
        timeout: 180000,
        success: function(res) {


                if(res.length>0){
                        for (var i = 0; i < res.length; i++) {
                            if(res[i].aalt ){

                                var dup = res[i].path;
                                dup = dup.replace(":","");
                                duplicates.push(dup);
                    
            
                    
                            }


                     }  
                 }

                 newImg();
                 



        
        },

        error: function(request, status, err) {
            alert("error");

        }

    });


    


}





$( document ).ready(function() {
    
    var url = window.location.href;
    var _url = url.split("/");

    console.log(_url);


    $("#chn option").each(function()
    {

        if( $(this).val() == _url[ _url.length-1]) {


            $("#chn").val(_url[_url.length-1] );


        }


    });

    
    getDups();

    

});

