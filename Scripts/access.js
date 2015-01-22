/// <reference path="OpenLayers.js" />


//define a new class DeleteFeature
var DeleteFeature = OpenLayers.Class(OpenLayers.Control, {
    initialize: function (layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layer = layer;
        this.handler = new OpenLayers.Handler.Feature(
            this, layer, { click: this.clickFeature }
        );
    },
    clickFeature: function (feature) {
        // if feature doesn't have a fid, destroy it
        if (feature.fid == undefined) {
            this.layer.destroyFeatures([feature]);
        } else {
            feature.state = OpenLayers.State.DELETE;
            this.layer.events.triggerEvent("afterfeaturemodified",
                                           { feature: feature });
            feature.renderIntent = "select";
            this.layer.drawFeature(feature);
        }
    },
    setMap: function (map) {
        this.handler.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Control.DeleteFeature"
});


var EraseLayer = OpenLayers.Class(OpenLayers.Control, {
    initialize: function (layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layer = layer;
        this.handler = new OpenLayers.Handler.Feature(
            this, layer, { click: this.eraselayer }
        );
    },
    eraselayer: function (layer) {
        this.layer.removeAllFeatures();
        alert("all clear");
    },
    setMap: function (map) {
        this.handler.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Control.EraseLayer"
});

var Click = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function (options) {
        this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
        OpenLayers.Control.prototype.initialize.apply(
                        this, [options]);
        this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.clickhere
                        }, this.handlerOptions
                    );
    },

    clickhere: function (e) {
        var lonlat = map.getLonLatFromPixel(e.xy);
        lonlat.transform("EPSG:900913", "EPSG:4326");
        alert(lonlat);
        //        alert("You clicked near " + lonlat.lat + " N, " +
        //                                              +lonlat.lon + " E");
    },
    CLASS_NAME: "OpenLayers.Control.Click"

});

// 加载高德街道图层的自定义类
 OpenLayers.Layer.GaodeCache = OpenLayers.Class(OpenLayers.Layer.TMS, {

            tileOriginCorner: 'tl',

            type: 'png',

            myResolutions: [
                            //156543.0339,
                           // 78271.516953125,
                            39135.7584765625,
                            19567.87923828125,
                            9783.939619140625,
                            4891.9698095703125,
                            2445.9849047851562,
                            1222.9924523925781,
                            611.4962261962891,
                            305.74811309814453,
                            152.87405654907226,
                            76.43702827453613,
                            38.218514137268066,
                            19.109257068634033,
                            9.554628534317016,
                            4.777314267158508,
                            2.388657133579254,
                            1.194328566789627,
                            0.5971642833948135,
            ],

            tileOrigin: new OpenLayers.LonLat(-20037508.3427892, 20037508.3427892),

            initialize: function (name, url, options) {

                OpenLayers.Layer.TMS.prototype.initialize.apply(this, [name, url, options]);
            },

            getURL: function (bounds) {
                var res = this.map.getResolution();
//                var x = parseInt((bounds.getCenterLonLat().lon - this.tileOrigin.lon) / (256 * res));
//                var y = parseInt((this.tileOrigin.lat - bounds.getCenterLonLat().lat) / (256 * res));
//                var z = this.map.getZoom();
//                if (Math.abs(this.myResolutions[z] - res) > 0.0000000000000000001) {
//                    for (var i = 0; i < this.myResolutions.length; i++) {
//                        if (Math.abs(this.myResolutions[i] - res) <= 0.0000000000000000001) {
//                            z = i;
//                            break;
//                        }
//                    }
//                }


//                if (OpenLayers.Util.isArray(this.url)) {
//                    var serverNo = parseInt( Math.random(0, this.url.length));
//                    return this.url[serverNo] + "&z="+z + '&y=' + y + '&x=' + x;
//                }else{
//                    return this.url + "&z="+z + '&y=' + y + '&x=' + x;
                //                }
                var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));  //this.tileSize.w
                var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
                var z = this.map.getZoom()+2;
                if (this.maxExtent.intersectsBounds(bounds)) {
                    // return this.url + z + "/" + x + "/" + y + "." + this.type;
                    return this.url + "&z=" + z + '&y=' + y + '&x=' + x;
                } else {
                    return "";
                }
            }

    });


    OpenLayers.Layer.LTTranficLayer2 = OpenLayers.Class(OpenLayers.Layer.TileCache, {
        timer: null,
        mapMaxExtent: null,
        initialize: function (name, url, options) {
            var tempoptions = OpenLayers.Util.extend({
                'format': 'image/png',
                isBaseLayer: true
            }, options);     // Prototype????
            OpenLayers.Layer.TileCache.prototype.initialize.apply(this, [name, url, {}, tempoptions]);
            this.numZoomLevels = 6;
            this.maxResolution = url;
            this.realtileurl = url;
            this.transitionEffect = null;
            },   // end of initialize

            destroy : function() {
                OpenLayers.Layer.TileCache.prototype.destroy.apply(this,arguments);
                this.destroyTimer();
            },

            refresh: function () {
                if (this.visibility) {
                this.clearGrid();
                this.redraw();

                }
            },
            createTimer : function() {
                function time() {//获取图片路径与时间戳
                OpenLayers.loadURL('http://eye.bjjtw.gov.cn/Web-T_bjjt_new/query.do', {
                serviceType : 'traffic',
                acode : '110000',
                cls : 1,
                type : 0,
                timestamp : Math.random()
                }, this, this.success, this.failure);
            }
            var _time = OpenLayers.Function.bind(time, this);
            _time();
            this.timer = window.setInterval(_time, 60 * 1000);

            },

            destroyTimer : function(){
                if (this.timer) {
                window.clearInterval(this.timer);
                this.timer = null;
            }
            },

            success : function(resp){
                var txt = resp.responseText;
                if (txt === '') {
                return;
            }

            resp = eval('(' + txt + ')');
            if (resp) {
            var time = resp.sTime+"";
            var times=time.substring(8,10) + ":" + time.substring(10,12);
            if(this.visibility){
            $('traffictime').innerHTML = times;
            if($('traffictime').timestmp&&$('traffictime').timestmp!=times){
            $('traffictime').timestmp = times;
            this.refresh();

            }
            if(!$('traffictime').timestmp){
            $('traffictime').timestmp = times;
            this.refresh();
            }
            }
            }
            },
            failure : function(resp) {

            },

            /**
            * 按地图引擎切图规则实现的拼接方式
            */
            getURL: function (bounds) {
            var res = this.map.getResolution();
            var bbox = this.map.getMaxExtent();
            var size = this.tileSize;
            //计算列号 
            var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
            //计算行号
            var tileY = Math.round((bbox.top - bounds.top) / (res * size.h));
            //当前的等级 
            var tileZ = this.map.zoom;
            if (tileX < 0) tileX = tileX + Math.round(bbox.getWidth() / bounds.getWidth());
            if (tileY < 0) tileY = tileY + Math.round(bbox.getHeight() / bounds.getHeight());
            return this.getTilePic(tileX, tileY, tileZ);
            },

            clone: function (obj) {

            if (obj == null) {
            obj = new OpenLayers.Layer.LTTrafficLayer2(this.name, this.url, this.options);
            }
            obj = OpenLayers.Layer.LTTrafficLayer2.prototype.clone.apply(this, [obj]);
            return obj;
            },
            //请求加随机数，解决ie6下图片缓存不更新问题
            getTilePic: function (tileX, tileY, tileZ) {
            var dir = '';
            if (tileZ > 6) {
            var delta = Math.pow(2, tileZ - 5);
            var rowDir = 'R' + Math.floor(tileY / delta);
            var colDir = 'C' + Math.floor(tileX / delta);
            dir = tileZ + "/" + rowDir + "/" + colDir + "/";
            } else {
            dir = tileZ + '/';
            }

            var tileNo = tileZ + "-" + tileX + "-" + tileY;
            var sUrl = this.url + dir + tileNo + '.png?r=';
            var d = Math.random();
            sUrl += d;
            //alert(sUrl);
            return sUrl;
            },
            CLASS_NAME: "OpenLayers.Layer.LTTrafficLayer2"
    });
       

OpenLayers.Popup.CSSFramedCloud = OpenLayers.Class(OpenLayers.Popup.Framed, {
    autoSize: true,
    panMapIfOutOfView: true,
    fixedRelativePosition: false,

    positionBlocks: {
        "tl": {
            'offset': new OpenLayers.Pixel(44, -6),
            'padding': new OpenLayers.Bounds(5, 14, 5, 5),
            'blocks': [
                {
                    className: 'olwidgetPopupStemTL',
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(null, 4, 32, null),
                    position: new OpenLayers.Pixel(0, -28)
                }
            ]
        },
        "tr": {
            'offset': new OpenLayers.Pixel(-44, -6),
            'padding': new OpenLayers.Bounds(5, 14, 5, 5),
            'blocks': [
                {
                    className: "olwidgetPopupStemTR",
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(32, 4, null, null),
                    position: new OpenLayers.Pixel(0, -28)
                }
            ]
        },
        "bl": {
            'offset': new OpenLayers.Pixel(44, 6),
            'padding': new OpenLayers.Bounds(5, 5, 5, 14),
            'blocks': [
                {
                    className: "olwidgetPopupStemBL",
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(null, null, 32, 4),
                    position: new OpenLayers.Pixel(0, 0)
                }
            ]
        },
        "br": {
            'offset': new OpenLayers.Pixel(-44, 6),
            'padding': new OpenLayers.Bounds(5, 5, 5, 14),
            'blocks': [
                {
                    className: "olwidgetPopupStemBR",
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(32, null, null, 4),
                    position: new OpenLayers.Pixel(0, 0)
                }
            ]
        }
    },

    initialize: function (id, lonlat, contentSize, contentHTML, anchor, closeBox,
                    closeBoxCallback, relativePosition, separator) {
        if (relativePosition && relativePosition != 'auto') {
            this.fixedRelativePosition = true;
            this.relativePosition = relativePosition;
        }
        if (separator === undefined) {
            this.separator = ' of ';
        } else {
            this.separator = separator;
        }

        this.olwidgetCloseBox = closeBox;
        this.olwidgetCloseBoxCallback = closeBoxCallback;
        this.page = 0;
        OpenLayers.Popup.Framed.prototype.initialize.apply(this, [id, lonlat,
            contentSize, contentHTML, anchor, false, null]);
    },

    /*
    * 构造popup内部容器。
    */
    setContentHTML: function (contentHTML) {
        if (contentHTML !== null && contentHTML !== undefined) {
            this.contentHTML = contentHTML;
        }

        if (this.contentDiv !== null) {
            var popup = this;

            // 清空旧数据
            this.contentDiv.innerHTML = "";

            // 创建内部容器
            var containerDiv = document.createElement("div");
            containerDiv.innerHTML = this.contentHTML;
            containerDiv.className = 'olwidgetPopupContent';
            this.contentDiv.appendChild(containerDiv);

            // 创建关闭按钮
            if (this.olwidgetCloseBox) {
                var closeDiv = document.createElement("div");
                closeDiv.className = "olwidgetPopupCloseBox";
                closeDiv.innerHTML = "close";
                closeDiv.onclick = function (event) {
                    popup.olwidgetCloseBoxCallback.apply(popup, arguments);
                };
                this.contentDiv.appendChild(closeDiv);
            }
            if (this.autoSize) {
                this.registerImageListeners();
                this.updateSize();
            }
        }
    },

    /*
    * 重写createBlocks：使用CSS样式而不是特定的img图片
    */
    createBlocks: function () {
        this.blocks = [];

        // since all positions contain the same number of blocks, we can
        // just pick the first position and use its blocks array to create
        // our blocks array
        var firstPosition = null;
        for (var key in this.positionBlocks) {
            firstPosition = key;
            break;
        }

        var position = this.positionBlocks[firstPosition];
        for (var i = 0; i < position.blocks.length; i++) {

            var block = {};
            this.blocks.push(block);

            var divId = this.id + '_FrameDecorationDiv_' + i;
            block.div = OpenLayers.Util.createDiv(divId,
                null, null, null, "absolute", null, "hidden", null
            );
            this.groupDiv.appendChild(block.div);
        }
    },
    /*
    * 重写updateBlocks
    */
    updateBlocks: function () {
        if (!this.blocks) {
            this.createBlocks();
        }
        if (this.size && this.relativePosition) {
            var position = this.positionBlocks[this.relativePosition];
            for (var i = 0; i < position.blocks.length; i++) {

                var positionBlock = position.blocks[i];
                var block = this.blocks[i];

                // adjust sizes
                var l = positionBlock.anchor.left;
                var b = positionBlock.anchor.bottom;
                var r = positionBlock.anchor.right;
                var t = positionBlock.anchor.top;

                // note that we use the isNaN() test here because if the
                // size object is initialized with a "auto" parameter, the
                // size constructor calls parseFloat() on the string,
                // which will turn it into NaN
                //
                var w = (isNaN(positionBlock.size.w)) ? this.size.w - (r + l)
                                                      : positionBlock.size.w;

                var h = (isNaN(positionBlock.size.h)) ? this.size.h - (b + t)
                                                      : positionBlock.size.h;

                block.div.style.width = (w < 0 ? 0 : w) + 'px';
                block.div.style.height = (h < 0 ? 0 : h) + 'px';

                block.div.style.left = (l !== null) ? l + 'px' : '';
                block.div.style.bottom = (b !== null) ? b + 'px' : '';
                block.div.style.right = (r !== null) ? r + 'px' : '';
                block.div.style.top = (t !== null) ? t + 'px' : '';

                block.div.className = positionBlock.className;
            }

            this.contentDiv.style.left = this.padding.left + "px";
            this.contentDiv.style.top = this.padding.top + "px";
        }
    },
    updateSize: function () {

        return OpenLayers.Popup.prototype.updateSize.apply(this, arguments);

    },

    CLASS_NAME: "OpenLayers.Popup.CSSFramedCloud"
});



////control.class创建新的类，类定义有问题。

//TileImage = OpenLayers.Class(OpenLayers.Layer.WMS, {
//     /**
//      * Constructor: TileImage
//     * 
//     * Parameters:
//     * name - {String} A name for the layer
//      * url - {String} Base url for the TileImage
//    * params - {Object} An object with key/value pairs representing the
//     *                   GetMap query string parameters and parameter values.
//      * options - {Object} Hashtable of extra options to tag onto the layer
//    */
//    initialize: function(name, url, params, options) {
//         OpenLayers.Layer.WMS.prototype.initialize.apply(this, arguments);
//    },    
// 
//     /**
//      * APIMethod:destroy
//      */
//     destroy: function() {
//         // for now, nothing special to do here. 
//          OpenLayers.Layer.WMS.prototype.destroy.apply(this, arguments);  
//     },
//     
//     /**
//32      * APIMethod: clone
//33      * 
//34      * Parameters:
//35      * obj - {Object}
//36      * 
//37      * Returns:
//38      * {<ShineEnergy.Layer.TileImage>} An exact clone of this <ShineEnergy.Layer.TileImage>
//39      */
//     clone: function (obj) {
//         
//         if (obj == null) {
//             obj = new ShineEnergy.Layer.TileImage(this.name,
//                                            this.url,
//                                            this.options);
//         }
// 
//         //get all additions from superclasses
//          obj = OpenLayers.Layer.WMS.prototype.clone.apply(this, [obj]);
// 
//         // copy/set any non-init, non-simple values here
//  
//         return obj;
//     },    
//     
//     /**
//57      * Method: getURL
//58      * 
//59      * Parameters:
//60      * bounds - {<OpenLayers.Bounds>}
//61      * 
//62      * Returns:
//63      * {String} A string with the layer's url and parameters and also the 
//64      *          passed-in bounds and appropriate tile size specified as 
//65      *          parameters
//66      */
//     getURL: function (bounds) {
//         bounds = this.adjustBounds(bounds);
//         var res = this.map.getResolution();
//         var tileOriginY = this.options.maxExtent.top;
//         var tileOriginX = this.options.maxExtent.left;
//         var x = Math.round((bounds.left - tileOriginX) / (res * this.tileSize.w));
//         var y = Math.round((tileOriginY - bounds.bottom) / (res * this.tileSize.h));
//         var z = this.map.getZoom();
//         var path = "?LAYER=" + this.params.LAYERS + "&X=" + x + "&Y=" + y + "&Z=" + z + "&S=Map"; 
//         var url = this.url;
//         if (url instanceof Array) {
//             url = this.selectUrl(path, url);
//         }
//         return url + path;
//     },
// 
//     CLASS_NAME: "OpenLayers.Layer.TileImage"
// });







