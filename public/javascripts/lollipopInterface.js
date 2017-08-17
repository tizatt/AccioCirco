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

    var GLOBAL_TOGGLE_FLAG = 0;


    $("#bb").hide();
    $("#prs").chosen({
        width: "25%"
    });

    $("#genes").chosen({
        width: "25%"
    });
    $("#genes2").chosen({
        width: "25%"
    });
    $(".spinner").hide();

    //  $("#tog").hide();




    $(document).ready(function() {

        res();
        $("#g2").hide();

    });


    var res = function() {

        $(".spinner").show();

        $.getJSON("genes.json", function(data) {


            $.each(data.response.docs, function(index, val) {

                console.log(val);

                $('#genes')
                    .append($("<option></option>")
                        .attr("value", val.symbol)
                        .text(val.symbol));

            });

            $(".spinner").hide();
            //    $("#tog").show();

            $("#genes").trigger("chosen:updated");


        });
    }


    $('input[type=radio][name=up]').change(function() {
        $("#mysvg").empty();
        $("#aaa").empty();
        if (this.value == 'projectRun') {
            $("#g2").show();
            $("#g").hide();
            GLOBAL_TOGGLE_FLAG = 1;
            $("#aa").hide();
            $("#bb").show();
            $("#__prs").chosen({
                width: "25%"
            });
            $("#prs").val('-- select a study --').trigger("chosen:updated");
            $("#genes").val('-- select a gene --').trigger("chosen:updated");



        }
        if (this.value == 'study') {
            GLOBAL_TOGGLE_FLAG = 0;
            $("#g2").hide();
            $("#g").show();
            $("#bb").hide();
            $("#aa").show();
            $("#genes").val('-- select a gene --').trigger("chosen:updated");

        }

    });


    $('#right-button').click(function() {
        console.log($('#mysvg').find("svg").attr("width"));
        var totalwidth = $('#mysvg').find("svg").attr("width");
        event.preventDefault();

        if ($('#mysvg').css('marginLeft').replace(/[^-\d\.]/g, '') > -(totalwidth)) {

            $('#mysvg').animate({

                marginLeft: "-=200px"
            }, "fast");

        }
        console.log($('#mysvg').css('marginLeft').replace(/[^-\d\.]/g, ''));
    });


    $('#left-button').click(function() {
        console.log($('#mysvg').find("svg").attr("width"));
        var totalwidth = $('#mysvg').find("svg").attr("width");
        event.preventDefault();

        if ($('#mysvg').css('marginLeft').replace(/[^-\d\.]/g, '') < 0) {

            $('#mysvg').animate({

                marginLeft: "+=200px"
            }, "fast");

        }
        console.log($('#mysvg').css('marginLeft').replace(/[^-\d\.]/g, ''));
    });

    var findGenes = function(flag) {


        $("#mysvg").empty();
        $("#aaa").empty();
        $("#genes").val('-- select a gene --').trigger("chosen:updated");

        /*
                $("#mysvg").empty();
                $("#aaa").empty();
                $(".spinner").show();
                $('#genes').empty();


                if(!flag){

                    var q = { qy: $("#prs").val().toString() };
                
                    $.getJSON("/lol/genes", q, function(data) {


                        $('#genes').append($("<option disabled selected> -- select a gene -- </option>  "));
                        $.each(data, function(index, val) {

                            $('#genes')
                                .append($("<option></option>")
                                    .attr("value", val._id)
                                    .text(val._id));

                        });

                        $(".spinner").hide();
                        //    $("#tog").show();

                        $("#genes").trigger("chosen:updated");


                    });

                }

                */









        if (flag) {

            $('#genes2').empty();

            $(".spinner").show();
            //$('#genes').empty();

            var q = {
                qy: $("#__prs").val().toString()
            };

            if ($("#__prs").val().length > 0) {

                console.log(q);

                $.getJSON("/lol/genesPR", q, function(data) {

                    console.log(data);

                    $('#genes2').append($("<option disabled selected> -- select a gene -- </option>  "));
                    $.each(data, function(index, val) {

                        $('#genes2')
                            .append($("<option></option>")
                                .attr("value", val)
                                .text(val));

                    });

                    $(".spinner").hide();
                    //    $("#tog").show();
                    $("#genes2").trigger("chosen:updated");
                });

            }
        }


    };



    var geneSelected = function() {


        $(".spinner").show();
        $("#mysvg").empty();

        var pr = {
            qy: "",
            qy2: "",
            study_or_pr: ""
        };

        if (!GLOBAL_TOGGLE_FLAG) {

            pr.qy2 = $("#genes").val();

        }

        if (GLOBAL_TOGGLE_FLAG) {
            pr.qy2 = $("#genes2").val()
        }


        if ($("#bb").is(":visible")) {
            pr['study_or_pr'] = "__pr";
            pr['qy'] = $("#__prs").val().toString();
        } else {

            pr['study_or_pr'] = "__stud";
            if ($("#prs").val()) {
                pr['qy'] = $("#prs").val().toString();
            } else {
                pr['qy'] = "";
            }
        }


        $.getJSON("/lol/LOLLIPOP", pr, function(data) {

            console.log(data);

            //    $("#tog").hide();
            if (data.error) {

                $("#mysvg").append("lookup failed");
            } else {


                if (!GLOBAL_TOGGLE_FLAG) {




                    if ($("#prs").val()) {

                        if (data.m == false) {
                            $("#mysvg").append("No mutation in this gene<br>");
                            $("#mysvg").append(data.mysvg.svg);
                        } else {
                            $("#mysvg").append(data.svg);
                        }

                    } else {
                        $("#mysvg").append("Select study to add mutation data<br>");
                        $("#mysvg").append(data.mysvg.svg);
                    }




                }

                if (GLOBAL_TOGGLE_FLAG) {

                    if (data.m == false) {
                        $("#mysvg").append("No mutation in this gene<br>");
                        $("#mysvg").append(data.mysvg.svg);
                    } else {

                        $("#mysvg").append(data.svg);
                    }

                }

            }

        });




        $("#aaa").text(pr.qy2);
        $(".spinner").hide();



    };
