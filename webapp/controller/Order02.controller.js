sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History){
    "use strict";
    var oModel;
    var oOrder;
	var type;
    var oModel;
    var oUserName;
    var oDataSap;
    var oUserData;
    var oStatusOrder;
    var oIdClient;
    var oDate;
    var oNameOrg;
    var oAdrOrg;
    var oDescDoc;
    
    return Controller.extend("ztest_fiori_ks.controller.Order02", {
    	
    	onInit: function(){
    		
    	oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
		this.getView().setModel(oModel);
    	
		// oOrder = sap.ui.getCore().getModel("oOrder");
		// var readurl = "/zOrderDateSet("+oOrder+")";
		// 	oModel.read(readurl, {
		// 		success : function(oData, oResponse) {
		// 			sap.ui.getCore().setModel(oData.ZzclientId, "oClientId");
		// 			sap.ui.getCore().setModel(oData.Zzdate, "oDate");
		// 			sap.ui.getCore().setModel(oData.ZzorderType, "oOrderType");
		// 			sap.ui.getCore().setModel(oData.Zzstatus, "oStatus");
		// 			sap.ui.getCore().setModel(oData.Zzuser, "oUser");
		// 			sap.ui.getCore().setModel(oData.zzorder, "oOrder");
		// 			sap.ui.getCore().setModel(oData.Zzdesc, "oDescDoc");
		// 		}.bind(this)
		// 	});
			
		// oIdClient = sap.ui.getCore().getModel("oClientId");
		// readurl = "/zstclientSet('"+oIdClient+"')";
		// oModel.read(readurl, {
		// 	success : function(oData, oResponse) {
		// 		sap.ui.getCore().setModel(oData.Address, "oAdrOrg");
		// 		sap.ui.getCore().setModel(oData.NameOrg, "oNameOrg");
					
		// }.bind(this) });
		this._getDateResorces();
		},
		onRefresh: function(){
			this._getDateResorces();
		},
		_getDateResorces: function(){
			type = sap.ui.getCore().getModel("oOrderType");
			oUserName = sap.ui.getCore().getModel("oUser");
			oUserData = sap.ui.getCore().getModel("oDate");
			oOrder = sap.ui.getCore().getModel("oOrder");
			oIdClient = sap.ui.getCore().getModel("oClientId");
			oStatusOrder = sap.ui.getCore().getModel("oStatus");
			oAdrOrg = sap.ui.getCore().getModel("oAdrOrg");
			oNameOrg = sap.ui.getCore().getModel("oNameOrg");
			oDescDoc = sap.ui.getCore().getModel("oDescDoc");
			
			oDate = new sap.ui.model.json.JSONModel({
				date: oUserData,
				user: oUserName,
				number: oOrder,
				desc: oDescDoc,
				type: type,
				idOrg: oIdClient,
				state: oStatusOrder,
				adr: oAdrOrg,
				nameOrg: oNameOrg
			}) ;
			this.getView().setModel(oDate);
		},
        onBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.getOwnerComponent().getRouter().navTo("page1", null, true);
			}
		},

		onExit: function(){
			this.getOwnerComponent().getRouter().navTo("page1");
		},
		onCreate: function(){
			
		},
		onSendMail: function(){
			
		}
    });
});