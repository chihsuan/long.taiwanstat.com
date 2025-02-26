
var width=$(".visual").width();
var leftwidth=$(".detail").width();
if(width>700) width=700;
if(width<500) width=500;
if(leftwidth>800) leftwidth=800;
if(leftwidth<500) leftwidth=500;
var leftheight=leftwidth*1/3;
var svg=d3.select(".visual").append("svg").attr("width",width).attr("height",width);
var svgNum=d3.select(".numbers").append("svg").attr("width",leftwidth).attr("height",leftheight);
var svgSalary=d3.select(".salary").append("svg").attr("width",leftwidth).attr("height",leftheight);
var svgTime=d3.select(".time").append("svg").attr("width",leftwidth).attr("height",leftheight);
var svgSa_Time=d3.select(".sa_time").append("svg").attr("width",leftwidth).attr("height",leftheight);
var colorScale=d3.scale.category20();
var padding=(leftheight-80)/2;
var widthpadding=60;
var yScale=d3.scale.linear().domain([0,2]).range([padding,leftheight-padding]);
var xScale=d3.scale.linear().domain([0,0]).range([widthpadding,leftwidth-widthpadding]);

///colorinfo
d3.csv("bigitem.csv",function(data){    //CREATE color info
    sv=d3.select(".colorinfo").append("svg").attr("width",$(".colorinfo").width()).attr("height",600);
    sv.selectAll("circle").data(data).enter()
        .append("circle").attr({
            cx:function(d,i){return 30;},
            cy:function(d,i){return i*25+30;},
            r:10,
            fill:function(d){return colorScale(d.job);}
        })
    sv.selectAll("text").data(data).enter()
        .append("text").attr("x",45).attr("y",function(d,i){return i*25+35;}).text(function(d){return d.job;})

})
////////////
d3.csv("salary.csv",function(data){ //the main part in this code ,including circles and detail
    //search part
    var content = [];
    data.map(function(d){
        content.push({title:d.job});
    })
    $('.ui.search').search({source: content,
                            maxResults: 89});


    //////////////////////////////////////////////////////////////////////////////////
    //button part
    $(".ui.button").click(function(){
        console.log("dsaa");
        $("input[name='sort']").prop("checked",false);
        $(".ui.button").removeClass("clicked");
        $(this).addClass("clicked");
        visualize();
        $("input[name='text']").prop("checked",false);
    });
    ////////////////////////////////////////////////////////////////////////////////
    console.log(data); 
    var force;
    var circles;
    var gcircles;
    var salaryMM,numberMM,timeMM,sa_timeMM;
    var itemName;
    var circleScale=d3.scale.sqrt().range([8,40]).domain([0,0]);
    var tmp1=data.map(function(d){return parseInt(d.人數總計);})
    numberMM=[d3.min(tmp1),d3.max(tmp1)];
    var tmp2=data.map(function(d){return parseInt(d.薪資平均);})
    salaryMM=[d3.min(tmp2),d3.max(tmp2)];
    var tmp3=data.map(function(d){return parseFloat(d.工時平均);})
    timeMM=[d3.min(tmp3),d3.max(tmp3)];
    var tmp4=data.map(function(d){return parseFloat(d.時薪平均);})
    sa_timeMM=[d3.min(tmp4),d3.max(tmp4)];

    function visualize(){

        if(force!=undefined) force.stop();
        console.log("here");
        d3.selectAll(".gcircles").remove();
        $(".detail").show();
        $(".visual").removeClass("twelve wide column");
        $(".visual").addClass("eight wide column");
        $(".visual svg").attr("width",width).attr("height",width);
        $(".results").click(function(){
            var name = $(".ui.search").search("get result").title;
            over(d3.select("g.gcircles."+name).data()[0]);
        })

        itemName=$(".ui.button.clicked").text();

        var max=0,min=1000000;
        var nodes=data.map(function(d){
            return{
                job:d.job,
                value:returnValue(d),
                type:d.type,
            };
            function returnValue(d){
                if(itemName=="人數"){
                    return parseFloat(d[itemName+"總計"]);
                }
                else{
                    return parseFloat(d[itemName+"平均"]);
                }
          }

      });
      if(itemName=="人數"){
          circleScale=d3.scale.sqrt().range([8,40]).domain(numberMM);
      }
      else if(itemName=="薪資"){
          circleScale=d3.scale.sqrt().range([8,40]).domain(salaryMM);
      }
      else if(itemName == "工時"){
          circleScale=d3.scale.sqrt().range([8,40]).domain(timeMM);
      }
      else {
          circleScale=d3.scale.sqrt().range([8,40]).domain(sa_timeMM);
      }
      gcircles=d3.select(".visual svg").selectAll("g.gcircles").data(nodes).enter().append("g")
    .attr("class",function(d){return "gcircles "+d.job;}).on("mouseover",over);


    gcircles.append("circle").attr({

        r: function(d){return circleScale(d.value); },
        fill:function(d){return colorScale(d.type);},
        stroke: "#444",
    })
    gcircles.append("text").text(function(d){return d.job;}).attr("class","gtext")

    gsort_info=gcircles.append("g").attr("class","sort_info")
    gsort_info.append("rect");
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+15+")").text("人數:");
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+30+")").text(function(d){return sort_detail(d,1);});
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+45+")").text("薪資:");
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+60+")").text(function(d){return sort_detail(d,2);});
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+75+")").text("工時:");
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+90+")").text(function(d){return sort_detail(d,3);});
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+105+")").text("時薪:");
    gsort_info.append("text").attr("fill","#000").attr("transform","translate("+10+","+120+")").text(function(d){return sort_detail(d,4);});
    $(".sort_info").hide();
    $(".gtext").hide(); //default no text
    force = d3.layout.force() // 建立 Layout
        .nodes(nodes)               // 綁定資料
        .size([width,width])            // 設定範圍
        .charge(-60)
        .on("tick", tick2)           // 設定 tick 函式
        .start();                   // 啟動！
    function over(d){
        d3.selectAll("g.gcircles").classed("selected",false);
        force.charge(-60);
        force.start();
        d3.select("g.gcircles."+d.job).classed("selected",true);
        force.charge(
            function(d2){
                if(d==d2) {
                    return -500;
                }
                else return -60;
            }
        )
        force.start();
        showDetail(d);
    }

    function tick2() { // tick 會不斷的被呼叫
        gcircles.attr("transform",function(d) { return 'translate(' + [d.x, d.y] + ')'; })
    }
    over(d3.select("g.gcircles").data()[0]); ///init display detail

    }

$(".ui.button.people").click();
function sort_detail(d,num){
    var theData;
    for(var i in data){
        if(data[i].job==d.job){
            theData=data[i]
        }
    }
    if(num==1){
        return theData.人數總計+rank(["人數總計",theData.人數總計]);
    }
    else if (num==2) {
        return theData.薪資平均+rank(["薪資平均",theData.薪資平均]);
    }
    else if (num == 3){
        return theData.工時平均+rank(["工時平均",theData.工時平均]);
    }
    else {
        return theData.時薪平均+rank(["時薪平均",theData.時薪平均]);
    }
}
function showDetail(d){
    var theData;
    for(var i in data){
        if(data[i].job==d.job){
            theData=data[i]
        }
    }
    $(".job").text(d.job);
    $(".type").text("(屬於："+d.type+")");
    numData=[["人數總計",theData.人數總計],["人數(男)",theData.人數男],["人數(女)",theData.人數女]]; //to d3 selector read
    salData=[["薪資平均",theData.薪資平均],["薪資(男)",theData.薪資男],["薪資(女)",theData.薪資女]]; //to d3 selector read
    timeData=[["工時平均",theData.工時平均],["工時(男)",theData.工時男],["工時(女)",theData.工時女]]; //to d3 selector read
    sa_timeData=[["時薪平均",theData.時薪平均],["時薪(男)",theData.時薪男],["時薪(女)",theData.時薪女]]; //to d3 selector read
    if ($(".detail rect").length==12){ //detail is displayed
        xScale=d3.scale.linear().domain(numberMM).range([padding,leftheight-padding]);
        changeRect(".numbers svg",numData);
        xScale=d3.scale.linear().domain(salaryMM).range([padding,leftheight-padding]);
        changeRect(".salary svg",salData);
        xScale=d3.scale.linear().domain(timeMM).range([padding,leftheight-padding]);
        changeRect(".time svg",timeData);
        xScale=d3.scale.linear().domain(sa_timeMM).range([padding,leftheight-padding]);
        changeRect(".sa_time svg",sa_timeData);

    }
    else{
        xScale=d3.scale.linear().domain(numberMM).range([padding,leftheight-padding]);
        createRect(".numbers svg",numData);
        xScale=d3.scale.linear().domain(salaryMM).range([padding,leftheight-padding]);
        createRect(".salary svg",salData);
        xScale=d3.scale.linear().domain(timeMM).range([padding,leftheight-padding]);
        createRect(".time svg",timeData);
        xScale=d3.scale.linear().domain(sa_timeMM).range([padding,leftheight-padding]);
        createRect(".sa_time svg",sa_timeData);
    }
}
function createRect(itemName,rectData){
    d3.select(itemName).selectAll("rect").data(rectData).enter().append("rect")
    .attr({
        x:widthpadding,
        y:function(d,i){return yScale(i);},
        height:20,
        width:function(d){return xScale(d[1])},
        fill:function(d){var color=0.8-(xScale(d[1])/leftwidth)*0.7;
        return d3.hsl(200,color,color);}
    });
    d3.select(itemName).selectAll("text").data(rectData).enter().append("text")
    .attr({
        x:0,
        y:function(d,i){return yScale(i)+15;}, //the rect center is diff from text
    })
    .text(function(d){return d[0];})
    .append("text")
    .attr({
        x:0,
        y:0,
    })

    d3.select(itemName).selectAll("text.value").data(rectData).enter().append("text")
    .attr({
        class:"value",
        x:widthpadding,
        y:function(d,i){return yScale(i)+15;}, //the rect center is diff from text
    })
    .text(function(d){return d[1]+rank(d);})


}
function changeRect(itemName,rectData){
    d3.select(itemName).selectAll("rect").data(rectData).transition().duration(250)
    .attr({
        x:widthpadding,
        y:function(d,i){return yScale(i);},
        height:20,
        width:function(d){return xScale(d[1])},
        fill:function(d){
            var color=0.8-(xScale(d[1])/leftwidth)*0.7;
            return d3.hsl(200,color,color);
        }
    });
    d3.select(itemName).selectAll("text.value").data(rectData).transition().duration(250)
    .attr({
        x:widthpadding,
        y:function(d,i){return yScale(i)+15;}, //the rect center is diff from text
    })
    .text(function(d){return d[1]+rank(d);})

}

function rank(item){
    item[0]=item[0].replace("(","");
    item[0]=item[0].replace(")","");
    var rankArr=[];
    data.map(function(d){
        rankArr.push(parseFloat(d[item[0]]));
    })
    rankArr.sort(function(a,b){return b-a;})
    return " (No."+(rankArr.indexOf(parseFloat(item[1]))+1)+")";
}
function circlesort(){
    var dataTmp;
    if(itemName=="人數"){
        dataTmp=tmp1;
    }
    else if (itemName=="薪資") {
        dataTmp=tmp2;
    }
    else if (itemName=="工時"){
        dataTmp=tmp3;
    }
    else {
        dataTmp=tmp4;
    }
    $(".detail").hide();
    $(".visual").removeClass("eight wide column");
    $(".visual").addClass("twelve wide column");
    var num=Math.floor($(".visual").width()/160);

    dataTmp.sort(function(a,b){return b-a;});
    d3.select(".visual svg").transition().duration(750).attr("width",width+leftwidth).attr("height",Math.ceil(89/num)*160+80);
    force.size([$(".visual").width(),$(".visual").width()])
    .charge(0)
    .on("tick", tick3)           // 設定 tick 函式
    .start();                   // 啟動！
    function tick3() { // tick 會不斷的被呼叫
        var check=[];
        gcircles.transition().duration(150).delay(250).attr("transform", function(d) {
            if(check.indexOf(d.value)==-1){
                check.push(d.value);
                return 'translate(' + [(dataTmp.indexOf(d.value)%num)*160+80,Math.floor(dataTmp.indexOf(d.value)/num)*160+80] + ')';
            }
            else{
                return 'translate(' + [((dataTmp.indexOf(d.value)+1)%num)*160+80,(Math.floor((dataTmp.indexOf(d.value)+1)/num))*160+80] + ')';
            }
        });
    }
    $(".sort_info").delay(500).show(3000);
}
$("input[name='text']").click(function(){
    if($(this).prop("checked")){
        $(".gtext").show();
    }
    else{
        $(".gtext").hide();
    }
});
$("input[name='sort']").click(function(){
    if($(this).prop("checked")){
        force.stop();
        circlesort();
    }
    else{
        force.stop();
        visualize();
        if($("input[name='text']").prop("checked")){
            $(".gtext").show();
        }
        else{
            $(".gtext").hide();
        }
  }
})
});
