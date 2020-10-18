sap.ui.define(["sap/ui/core/UIComponent",
        'sap/ui/model/resource/ResourceModel',
        'sap/ui/model/odata/ODataModel',
    ],

    function (UIComponent, ResourceModel, ODataModel) {
        "use strict";

        var Component = UIComponent.extend("app.Component", {

            metadata: {
                rootView: "app.App",
                routing: {
                    config: {
                        routerClass: "sap.m.routing.Router",
                        viewPath: "app/views",
                        controlId: "rootControl",
                        controlAggregation: "pages",
                        viewType: "XML"
                    },
                    routes: [
                        {
                            name: "role",
                            // empty hash - normally the start page
                            pattern: "",
                            target: "role"
                        },

                        {
                            name: "AddRole",
                            // empty hash - normally the start page
                            pattern: "AddRole",
                            target: "AddRole"
                        },

                        {
                            pattern: "ViewRole",
                            name: "ViewRole",
                            target: "ViewRole"
                        },

                        {
                            pattern: "EditRole",
                            name: "EditRole",
                            target: "EditRole"
                        }

                    ],
                    targets: {
                        role: {
                            viewName: "role",
                        },
                        AddRole: {
                            viewName: "AddRole",
                        },
                        ViewRole: {
                            viewName: "ViewRole",
                        },
                        EditRole: {
                            viewName: "EditRole"
                        }

                    }
                }
            },

            init: function () {
                UIComponent.prototype.init.apply(this, arguments);
                // var oModel = new ODataModel("http://192.168.1.123:81/leasing.svc/", true);

                jQuery.sap.require("jquery.sap.storage");
			    this.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			    var logToken = this.oStorage.get('logToken')

			    var data = {
				    'Token' : (logToken) ? logToken : null
			    }
			    var oModel = new ODataModel("http://192.168.1.222:615/terp/terp_data.svc", {
										        json : true,
										        //dheaders : data
										    });
		
			    this.setModel(oModel);
                this._router = this.getRouter();
                this._router.initialize();
                this.getRouter().initialize();
            },
        });
        return Component;
    }, true);

var user = {};

jQuery.sap.require("jquery.sap.storage");
var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
var resource_section = oStorage.get("resource");
