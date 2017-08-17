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

/* 
Globals

Only an ajax flag
*/

var ajaxInProg = false;


/*

Functions below drawDefault() and drawDefaultTwo() are helper functions for
resetting the venn.js SVG

*/

function toolTip(diagram, overlaps, sets) {

    var tooltip = d3.select("body").append("div")
        .attr("class", "venntooltip");
    d3.selection.prototype.moveParentToFront = function() {
        return this.each(function() {
            this.parentNode.parentNode.appendChild(this.parentNode);
        });
    };
    // hover on all the circles
    diagram.circles
        .style("stroke-opacity", 0)
        .style("stroke", "white")
        .style("stroke-width", "2");
    diagram.nodes
        .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseover", function(d, i) {
            var selection = d3.select(this).select("circle");
            selection.moveParentToFront()
                .transition()
                .style("fill-opacity", .5)
                .style("stroke-opacity", 1);
            tooltip.transition().style("opacity", .9);
            tooltip.text(d.size + " items");
        })
        .on("click",function(d,i){
            if(d.label){
            $("#accordion").accordion({active:d.label.charCodeAt(0)-65})
            }

        })
        .on("mouseout", function(d, i) {
            d3.select(this).select("circle").transition()
                .style("fill-opacity", .3)
                .style("stroke-opacity", 0);
            tooltip.transition().style("opacity", 0);
        });
    // draw a path around each intersection area, add hover there as well
    diagram.svg.selectAll("path")
        .data(overlaps)
        .enter()
        .append("path")
        .attr("d", function(d) {
            return venn.intersectionAreaPath(d.sets.map(function(j) {
                return sets[j];
            }));
        })
        .style("fill-opacity", "0")
        .style("fill", "black")
        .style("stroke-opacity", 0)
        .style("stroke", "white")
        .style("stroke-width", "2")
        .on("mouseover", function(d, i) {
            d3.select(this).transition()
                .style("fill-opacity", .1)
                .style("stroke-opacity", 1);
            tooltip.transition().style("opacity", .9);
            tooltip.text(d.size + " items");
        })
        .on("click",function(d,i){
            var accord_ref = $("#accordion").find("div");
            var ref_string = "c";
            var k = d.sets;
            var settings = {0:"A",1:"B",2:"C",3:"D"};
            for(var item=0; item<k.length; item++){
                var p = k[item];
                ref_string=ref_string+settings[p];
            }
            $.each(accord_ref, function(index,value){ 
                if(value.id==ref_string){
                    $("#accordion").accordion({active:index})
                    return false;
                }
            })

        })
        .on("mouseout", function(d, i) {
            d3.select(this).transition()
                .style("fill-opacity", 0)
                .style("stroke-opacity", 0);
            tooltip.transition().style("opacity", 0);
        })
        .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
}



function drawDefault() {

    $(".dynamic").html("");
    var overlaps = [{
        sets: [0, 1],
        size: 4
    }, {
        sets: [0, 2],
        size: 4
    }, {
        sets: [1, 2],
        size: 3
    }, {
        sets: [0, 1, 2],
        size: 2
    }];
    var sets = [{
        label: "List A",
        size: 16
    }, {
        label: "List B",
        size: 16
    }, {
        label: "List C",
        size: 16
    }];
    sets = venn.venn(sets, overlaps),
        diagram = venn.drawD3Diagram(d3.select(".dynamic"), sets, 320, 320);
    toolTip(diagram, overlaps, sets);

}


/*
Redraw Venn.js for two samples. Insert Mongo data.
*/


function twoSetBoilerPlate(res) {

    $(".dynamic").html("");
    clearLists();

    sets = [{
        label: "A".concat(res.a),
        size: res.a
    }, {
        label: "B".concat(res.b),
        size: res.b
    }, ];

    overlaps = [{
        sets: [0, 1],
        size: res.ab
    }];

    sets = venn.venn(sets, overlaps),
        diagram = venn.drawD3Diagram(d3.select(".dynamic"), sets, 320, 320);

    populateLists(res, 2);
    toolTip(diagram, overlaps, sets);

}

/*

Redraw Venn.js for three samples. Insert Mongo data.

*/


function threeSetBoilerPlate(res) {

    $(".dynamic").html("");
    clearLists();

    sets = [{
        label: "A".concat(res.a),
        size: res.a
    }, {
        label: "B".concat(res.b),
        size: res.b
    }, {
        label: "C".concat(res.c),
        size: res.c
    }];

    overlaps = [{
        sets: [0, 1],
        size: res.ab
    }, {
        sets: [0, 2],
        size: res.ac
    }, {
        sets: [1, 2],
        size: res.bc
    }, {
        sets: [0, 1, 2],
        size: res.abc
    }];

    sets = venn.venn(sets, overlaps),
        diagram = venn.drawD3Diagram(d3.select(".dynamic"), sets, 320, 320);

    populateLists(res, 3);
    toolTip(diagram, overlaps, sets);

}

/*

Redraw Venn.js for four samples. Insert Mongo data.

*/




function fourSetBoilerPlate(res) {



    clearLists();
    $(".dynamic").html("");



    sets = [{
        label: "A".concat(res.a),
        size: res.a
    }, {
        label: "B".concat(res.b),
        size: res.b
    }, {
        label: "C".concat(res.c),
        size: res.c
    }, {
        label: "D".concat(res.d),
        size: res.d
    }];


    var overlaps = [

        {
            sets: [0, 1],
            size: res.ab
        }, {
            sets: [0, 2],
            size: res.ac
        }, {
            sets: [0, 3],
            size: res.ad
        }, {
            sets: [1, 2],
            size: res.bc
        }, {
            sets: [1, 3],
            size: res.bd
        }, {
            sets: [2, 3],
            size: res.cd
        },

        {
            sets: [0, 1, 2],
            size: res.abc
        }, {
            sets: [0, 1, 3],
            size: res.abd
        }, {
            sets: [0, 2, 3],
            size: res.acd
        }, {
            sets: [1, 2, 3],
            size: res.bcd
        },


        {
            sets: [0, 1, 2, 3],
            size: res.abcd
        },


    ];



    sets = venn.venn(sets, overlaps),
        diagram = venn.drawD3Diagram(d3.select(".dynamic"), sets, 320, 320);


  
    populateLists(res, 4);
    toolTip(diagram, overlaps, sets);
    

}


/*

Client side intersection algorithm for gene lists.

*/



Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};


function arr_diff(a,b) {
    if(a instanceof Array && b instanceof Array){
        return a.diff(b);
    }
    else{
        return 0;
    }
}



function intersect(a, b) {


if(a && b){
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a
        .filter(function(e) {
            if (b.indexOf(e) !== -1) return true;
        })
        .filter(function(e) {
            if (b.indexOf(e) !== -1) return true;
        });
    }
    else{
        console.log("intersect returned 0");
        return 0;
    }






}



Array.prototype.unique = function() {
    var a = [], l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++)
            if (this[i] === this[j]) j = ++i;
      a.push(this[i]);
    }
    return a;
};


/*

Here is the logic for handling user entered gene lists. The input is split using a regular expression
and the intersection is found (entirely client side).


*/

function geneList() {

    clearLists();
    var set = {};

    $("#identical").empty();
    $("#load_icon").show();

    var entry_fields = {"a":"gl1", "b":"gl2", "c":"gl3", "d":"gl4"};

    for (item in entry_fields){
        if(document.getElementById(entry_fields[item]).value   ){
            var temp = "orig" + item.toUpperCase();
            set[temp] = document.getElementById(entry_fields[item]).value.split(/[\s,]+/).unique();
            set[item] = set[temp].length;
        } 
    }


    set.iab = intersect(set.origA, set.origB);
    set.iac = intersect(set.origA, set.origC);
    set.iad = intersect(set.origA, set.origD);
    set.ibc = intersect(set.origB, set.origC);
    set.ibd = intersect(set.origB, set.origD);
    set.icd = intersect(set.origC, set.origD);





// spam abcd
    set.iaNab = arr_diff(set.origA, set.iab);
    set.iaNac = arr_diff(set.origA, set.iac);
    set.iaNad = arr_diff(set.origA, set.iad);
    set.iaNbc = arr_diff(set.origA, set.ibc);
    set.iaNbd = arr_diff(set.origA, set.ibd);
    set.iaNcd = arr_diff(set.origA, set.icd);

    set.ibNab = arr_diff(set.origB, set.iab);
    set.ibNac = arr_diff(set.origB, set.iac);
    set.ibNad = arr_diff(set.origB, set.iad);
    set.ibNbc = arr_diff(set.origB, set.ibc);
    set.ibNbd = arr_diff(set.origB, set.ibd);
    set.ibNcd = arr_diff(set.origB, set.icd);


    set.icNab = arr_diff(set.origC, set.iab);
    set.icNac = arr_diff(set.origC, set.iac);
    set.icNad = arr_diff(set.origC, set.iad);
    set.icNbc = arr_diff(set.origC, set.ibc);
    set.icNbd = arr_diff(set.origC, set.ibd);
    set.icNcd = arr_diff(set.origC, set.icd);


    set.idNab = arr_diff(set.origD, set.iab);
    set.idNac = arr_diff(set.origD, set.iac);
    set.idNad = arr_diff(set.origD, set.iad);
    set.idNbc = arr_diff(set.origD, set.ibc);
    set.idNbd = arr_diff(set.origD, set.ibd);
    set.idNcd = arr_diff(set.origD, set.icd);
 
//end spam







    set.iabc = intersect(set.iab, set.iac);
    set.iabd = intersect(set.iab, set.ibd);
    set.iacd = intersect(set.iac, set.icd);
    set.ibcd = intersect(set.ibc, set.icd);


if(set.origA && set.origB && set.origC){

    set.iabNabc = arr_diff(set.iab, set.iabc);
    set.iacNabc = arr_diff(set.iac, set.iabc);
    set.iadNabc = arr_diff(set.iad, set.iabc);
    set.ibcNabc = arr_diff(set.ibc, set.iabc);
    set.ibdNabc = arr_diff(set.ibd, set.iabc);
    set.icdNabc = arr_diff(set.icd, set.iabc);

}


    if(set.origA && set.origB && set.origC && set.origD){

    set.iabNabd = arr_diff(set.iab, set.iabd);
    set.iacNabd = arr_diff(set.iac, set.iabd);
    set.iadNabd = arr_diff(set.iad, set.iabd);
    set.ibcNabd = arr_diff(set.ibc, set.iabd);
    set.ibdNabd = arr_diff(set.ibd, set.iabd);
    set.icdNabd = arr_diff(set.icd, set.iabd);

    set.iabNacd = arr_diff(set.iab, set.iacd);
    set.iacNacd = arr_diff(set.iac, set.iacd);
    set.iadNacd = arr_diff(set.iad, set.iacd);
    set.ibcNacd = arr_diff(set.ibc, set.iacd);
    set.ibdNacd = arr_diff(set.ibd, set.iacd);
    set.icdNacd = arr_diff(set.icd, set.iacd);

    set.iabNbcd = arr_diff(set.iab, set.ibcd);
    set.iacNbcd = arr_diff(set.iac, set.ibcd);
    set.iadNbcd = arr_diff(set.iad, set.ibcd);
    set.ibcNbcd = arr_diff(set.ibc, set.ibcd);
    set.ibdNbcd = arr_diff(set.ibd, set.ibcd);
    set.icdNbcd = arr_diff(set.icd, set.ibcd);

    }



    set.iabcd = intersect(set.iab, set.icd);



    set.ab = set.iab.length;
    set.ac = set.iac.length;
    set.ad = set.iad.length;
    set.bc = set.ibc.length;
    set.bd = set.ibd.length;
    set.cd = set.icd.length;

    set.abc = set.iabc.length;
    set.abd = set.iabd.length;
    set.acd = set.iacd.length;
    set.bcd = set.ibcd.length;

    set.abcd = set.iabcd.length;



    if (set.origA && set.origB && !set.origC && !set.origD) {
        twoSetBoilerPlate(set);
    }

    if (set.origA && set.origB && set.origC && !set.origD) {
        threeSetBoilerPlate(set);
    }

    if (set.origA && set.origB && set.origC && set.origD) {
        fourSetBoilerPlate(set);
    }


    $("#load_icon").hide();



}


//highlight null
function hlNull(item) {
    $.each($("#chosen").find("p"), function(key, value) {
        if (item == $(value).text().split(" ")[0]) {
            $(value).css({
                "background-color": "Yellow"
            });
        }
    });
}

/*

Alerts user if DB selection is null.

*/


function nullcheck(data, a, b, c, d) {

    if (!a) {
        alert(data.s1 + " is null :-(");
        hlNull(data.s1);
    }
    if (!b) {
        alert(data.s2 + " is null :-(");
        hlNull(data.s2);
    }
    if (!c) {
        alert(data.s3 + " is null :-(");
        hlNull(data.s3);
    }
    if (!d) {
        alert(data.s4 + " is null :-(");
        hlNull(data.s4);
    }

}



function exportSVG() {


var x = new XMLSerializer();

var content = x.serializeToString($("svg")[0] );


$('#svg_export_form > input[name=svg]').val( content );
$('#svg_export_form').attr('action','ia/svg');
$('#svg_export_form').submit();


}







function prep_export() {


    var ids = ["#cA", "#cB", "#cC", "#cD", "#cAB", "#cAC", "#cAD", "#cBC", "#cBD", "#cCD", "#cABC", "#cABD", "#cACD", "#cBCD", "#cABCD"];
    var csvContent = "data:text/csv;charset=utf-8,";


    for(var i=0;i<ids.length;i++){

       var unit =  $(ids[i]).find('p').text();
       var press = ids[i] + "," + unit;
       csvContent += press+ "\n";
    }

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);

}




/*

Fetch intersection data from the server when Find Intersection button is clicked.
The function below posts the user's selection to the server and calls either
twoSetBoilerPlate() or threeSetBoilerPlate() depending one whether or not the user
selected two or three samples.

*/


$('#somebutton').click(function() {

    //don't let the user spam ajax requests
    if (ajaxInProg) {

        if( $("#zz").val() && $("#zz").val()>0  ){
            alert("warning,algorithm is working");
        }
        else{
            alert("wait  or switch samples");

        }
    } else {

        var sample1 = "",
            sample2 = "",
            sample3 = "",
            sample4 = "";

        $("#load_icon").show();

        var e = document.getElementById("ddlViewBy");
        var strUser = e.options[e.selectedIndex].value;

        var sampleSize = $("#zz").val().length;

        var samples = $("#zz").val();

        if(typeof samples[0] !== 'undefined'){
            var sample1 = samples[0];
        }
        if(typeof samples[1] !== 'undefined'){
            var sample2 = samples[1];
        }
        if(typeof samples[2] !== 'undefined'){
            var sample3 = samples[2];
        }
        if(typeof samples[3] !== 'undefined'){
            var sample4 = samples[3];
        }

        var data = {
            "key": strUser,
            "s1": sample1,
            "s2": sample2,
            "s3": sample3,
            "s4": sample4,
            "u_db": $("#selectDb option:selected").val()
        };



        ajaxInProg = true;

        if(data.u_db) {


        $.ajax({
            type: "POST",
            url: "/ia/",
            data: data,
            timeout: 180000,

            success: function(res) {

                clearLists();


                if (res.error) {
                    alert("error");
                } else {


                    if (sampleSize == 2) {

                        if (res.origA && res.origB) {
                            twoSetBoilerPlate(res);
                        } else {
                            nullcheck(data, res.origA, res.origB, 1, 1);
                        }
                    } else if (sampleSize == 3) {

                        if (res.origA && res.origB && res.origC) {
                            threeSetBoilerPlate(res);
                        } else {
                            nullcheck(data, res.origA, res.origB, res.origC, 1);
                        }
                    } else if (sampleSize == 4) {

                        if (res.origA && res.origB && res.origC && res.origD) {
                            fourSetBoilerPlate(res);
                        } else {
                            nullcheck(data, res.origA, res.origB, res.origC);
                        }
                    }

                }


                $("#load_icon").hide();
                ajaxInProg = false;
            },

            error: function(request, status, err) {
                if (status == "timeout") {
                    alert("uhoh... looks like the server is a bit slow; the query timed out");
                    $("#load_icon").hide();
                    ajaxInProg = false;
                }
            }


        });


        }








    }
});


/*

Tabs helper function

*/


$("ul.nav-tabs a").click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});


//convert to .png


d3.select("#save").on("click", function() {

    var image = 0;
    var imgsrc = 0;
    var img = 0;
    var canvas = 0;
    var pngimg = 0;
    var canvasdata = 0;
    var a = 0;
    var html = 0;


    $("canvas").hide();
    $("#svgdataurl").hide();
    $("#pngdataurl").hide();

    html = d3.select("svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    console.log(html);

    imgsrc = 'data:image/svg+xml;base64,' + btoa(html);

    console.log(imgsrc);
    img = '<img src="' + imgsrc + '">';
    console.log(img);

    d3.select("#svgdataurl").html(img);


    canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    console.log(canvas);
    console.log(context);

    image = new Image;
    image.src = imgsrc;

    console.log(image);

    image.onload = function() {
        context.drawImage(image, 0, 0);

        canvasdata = canvas.toDataURL("image/png");
        console.log(canvasdata);

        pngimg = '<img src="' + canvasdata + '">';

        console.log(pngimg);
        d3.select("#pngdataurl").html(pngimg);

        a = document.createElement("a");
        a.download = "sample.png";
        a.href = canvasdata;
        a.click();
    };

    $("canvas").empty();
    $("#svgdataurl").empty();
    $("#pngdataurl").empty();

});

/*

Initialize settings below; Grab DB list from the server and
hide certain elements that are to be triggered if gene list is clicked. 
Also initialize accordion. 

*/


$( document ).ready(function() {    

$("#zz").chosen({max_selected_options: 4, width:"95%"}); 

    getDBs();
    from_csv();
    drawDefault();
    $("#load_icon").hide();

    $("#accordion").accordion({
        active: false,
        collapsible: true,
        heightStyle: "content",
        navigation: true
    });


 $("#save_as_svg").click(function() { exportSVG(); });


});




