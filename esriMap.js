/// <reference path="Scripts/init.js" />

var serverurl= "http://58.198.182.215:6080/arcgis/rest/services/"
// var startExtent= new esri.geometry.Extent({})

require(["esri/map",
    "dojo/domReady!",
    "dojo/dom-construct",
    "esri/config",
    "esri/graphic",
    "esri/InfoTemplate",
    "esri/symbols/SimpleFillSymbol",
    
    "esri/dijit/InfoWindowLite",
    "esri/layers/FeatureLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ImageParameters"],
function (Map, ArcGISDynamicMapServiceLayer, SimpleFillSymbol,FeatureLayer,
    InfoTemplate,InfoWindowLite,Graphic,ImageParameters,
    domConstruct) {
    var map = new Map("map", {
        center: [121, 31.5],
        zoom: 8,
        basemap: "topo"
    });

    var polygon={"geometry":{"rings":[[[115.3125,37.96875],
    [111.4453125,37.96875],[99.84375,36.2109375],[99.84375,23.90625],[116.015625,24.609375],
    [115.3125,37.96875]]],"spatialReference":{"wkid":4326}},"symbol":{"color":[0,0,0,64],"outline":{"color":[0,0,0,255],
    "width":1,"type":"esriSLS","style":"esriSLSSolid"},
    "type":"esriSFS","style":"esriSFSSolid" }}

   /* var infotem1 = new InfoTemplate();
    infotem1.setTitle("this is Title");
    infotem1.setContent("<b>2000 Population: </b>${POP2000}<br/>")*/

    var gra= new Graphic(polygon);
   // gra.setInfoTemplate(infotem1)

    var maplayer = new esri.layers.ArcGISDynamicMapServiceLayer(serverurl+ "net2/MapServer");
   // map.addLayer(maplayer);

   
    var infoWindow= new InfoWindowLite(null,domConstruct.create("div"));
    infoWindow.startup()
    map.setInfoWindow(infoWindow)


    var Infotem= new esri.InfoTemplate("${hname}","名称：${hname}");

    var options= {mode:esri.layers.FeatureLayer.MODE_ONDEMAND,
        infoTemplate:Infotem,
        outFields:["*"]
    }
    var hoslayer= new esri.layers.FeatureLayer(serverurl+"net2/MapServer/20",options)
     hoslayer.isVisible=true   

     map.addLayer(hoslayer);
     map.infoWindow.resize(200,75)
     

    


});    //end of require


    function MapResize(){
        clearTimeout(resizeTimer)
        resizeTimer= setTimeout(function(){
            map.resize();
            map.reposition()

        },500)

    }


    /*
    // AMD写法
    require(["esri/map", ... ], function(Map, ... ){ ... });

    // legacy 这个比较好理解
    dojo.require("esri.map");


    dojo.ready(init);  初始化函数这么加载
    dojo.ready (or dojo.addOnLoad): Similar to <body onload="">. 
    It registers an initializing block after the page has finished loading.

    //添加事件。
    dojo.connect: Similar to Element.addEventListener and Element.attachEvent 
    JavaScript functions. It registers a listener to listen to specific events on 
    an Object or element on the page and returns results from a function.

    eg: dojo.connect(myMap, "onLoad", myLoadHandler);


    //找元素
    dojo.byId: Similar to the document.getElementById(id) JavaScript function. 
    The function searches and returns the first HTML element with the argument ID.
    dojo.byId("myInputField").value = myMap.id;

    */

    //dojo.connect(map, "click",info(map.basemapLayerIds));
    //请求数据
    /*
    var request = esriRequest({
  
    url: "<String>",
    // Service parameters if required, sent with URL as key/value pairs
    content: {
    parameter1: <value>,
    parameter2: <value>
    },
    // Data format
    handleAs: "<String>"
    });

    */


//function info(ids) {
//    alert(ids);
//}
