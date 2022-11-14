sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel, History, ODataModel, Sorter, Filter, CountMode, FilterOperator, Fragment, syncStyleClass, MessageToast) {
	"use strict";
	var state;
	var oIdOrder;
	var type;
	var oModel;
	var oUserName;
	var oDataSap;
	var oUserData;
	var oStatusOrder;
	var oIdClient;
	var oDesc;
	var oAdr;
	var isErrorResponse;
	var isActive;
	var iTimeoutId;

	return Controller.extend("ztest_fiori_ks.controller.Create02", {
		onInit: function() {
			oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			isActive = 0;
			this.getView().byId("oSelectClient").setModel(oModel);
			this.getView().byId("oSearchField").setModel(oModel);

			this._getUserData();
			this.getResourceBundle();
			this._getDateResorces();
			console.log("Start: isErrorResponse : ", isErrorResponse);
		},
		_getUserData: function() {
			var readurl = "/zUserDataSet";
			oModel.read(readurl, {
				success: function(oData, oResponse) {
					sap.ui.getCore().setModel(oData.valueOf().results[0].zUserName, "oUserData");
					sap.ui.getCore().setModel(oData.valueOf().results[0].zData, "oUserName");
					sap.ui.getCore().setModel(oData.valueOf().results[0].zIdOrder, "oOrderId");
					sap.ui.getCore().setModel(oData.valueOf().results[0].zViewData, "oDataSap");
				}.bind(this)
			});
		},

		_getDateResorces: function() {
			oUserName = sap.ui.getCore().getModel("oUserData");
			oUserData = sap.ui.getCore().getModel("oUserName");
			oIdOrder = sap.ui.getCore().getModel("oOrderId");

			var oDate = new sap.ui.model.json.JSONModel({
				date: oUserData,
				user: oUserName,
				number: oIdOrder,
				state: state
			});
			this.getView().setModel(oDate);

			//this.onUpdateState();
		},
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		onSuggestType: function(event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters.push(new Filter({
					filters: [
						new Filter("Zdesc", FilterOperator.Contains, sValue.toUpperCase())
						// new Filter("Ztype", FilterOperator.Contains, sValue.toUpperCase())
					],
					and: false
				}));
			}

			var oSource = event.getSource();
			var oBinding = oSource.getBinding('suggestionItems');
			oBinding.filter(aFilters);

			oBinding.attachEventOnce('dataReceived', function() {
				oSource.suggest();
			});

		},
		onSuggestClient: function(event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters.push(new Filter({
					filters: [
						new Filter("NameOrg", FilterOperator.Contains, sValue.toUpperCase())
						// new Filter("Ztype", FilterOperator.Contains, sValue.toUpperCase())
					],
					and: false
				}));
			}

			var oSource = event.getSource();
			var oBinding = oSource.getBinding('suggestionItems');
			oBinding.filter(aFilters);

			oBinding.attachEventOnce('dataReceived', function() {
				oSource.suggest();
			});
			this.onChangeId();

		},

		onChangeId: function() {
			oIdClient = this.getView().byId("oSelectClient").getValue();
			var readurl = "/zstclientSet('" + oIdClient + "')";
			oModel.read(readurl, {
				success: function(oData, oResponse) {

					this.getView().byId("oNameOrg").setValue(oData.valueOf().NameOrg);
					this.getView().byId("oAdrClient").setValue(oData.valueOf().Address);
					oAdr = oData.valueOf().Address;
					isErrorResponse = 0;
				}.bind(this),
				error: function(err) {
					isErrorResponse = 1;
				}
			});

		},
		_setNotFoundClient: function() {
			console.log("set adress");
			this.getView().byId("oNameOrg").setValue('value not found');
			this.getView().byId("oAdrClient").setValue('value not found');
		},
		onBack: function() {
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

		onExit: function() {
			this.getOwnerComponent().getRouter().navTo("page1");
		},
		_createOrderSt: function() {
			oIdOrder = sap.ui.getCore().getModel("oOrderId");
			type = this.getView().byId("oSearchField").getValue();
			oUserName = this.getView().byId("oUserName").getValue();
			oDataSap = sap.ui.getCore().getModel("oDataSap");
			oIdClient = this.getView().byId("oSelectClient").getValue();
			oStatusOrder = this.getView().byId("stateOrder").getValue();
			oDesc = this.getView().byId("oDescDoc").getValue();

			var data = {};
			data.zzorder = oIdOrder;
			data.ZzorderType = type;
			data.Zzuser = oUserName;
			data.Zzdate = oDataSap;
			data.ZzclientId = oIdClient;
			data.Zzstatus = oStatusOrder;
			data.Zzdesc = oDesc;

			onCreateTable();

			// var oCreateUrl = "/zOrderDateSet";
			// oModel.create(oCreateUrl, data, null,
			// 	function(response) {
			// 		alert("Data successfully created");
			// 	},
			// 	function(error) {
			// 		alert("Error while creating the data");
			// 	}
			// );

		},
		onCreate: function() {
			this._createOrderSt();

		},
		onCheck: function() {
			this._getDateResorces();
			this.onChangeId();
			this.onUpdateState();
		},
		_checkField: function() {
			oDesc = this.getView().byId("oDescDoc").getValue();
			type = this.getView().byId("oSearchField").getValue();
			//oAdr = this.getView().byId("oNameOrg").getValue();
			console.log("Description : ", oDesc, " ; type : ", type, " ; adress : ", oAdr);
			if (oDesc === '') {

			}
			if (type === '') {

			}
			if (oAdr === undefined) {
				console.log("adress is null");
			}
		},
		onUpdateState: function() {
			// if (isErrorResponse === 1) {
			// 	this._setNotFoundClient();
			// }
					//	this.onOpenDialog();

			if (isErrorResponse === 1) {
				console.log("set adress : error");
				oAdr = undefined;
				this.getView().byId("oNameOrg").setValue('value not found');
				this.getView().byId("oAdrClient").setValue('value not found');
			} 
			
			console.log("Run: isErrorResponse : ", isErrorResponse);
			this._checkField();
			console.log("isActive : ", isActive);
			if (isActive === 0) {
				this.getView().byId("stateOrder").setValue("Новый");
			} else {
				this.getView().byId("stateOrder").setValue("Данные заполнены");
			}

		},

		onOpenDialog: function() {
			// load BusyDialog fragment asynchronously
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			setTimeout(function () {
				oDialog.close();
			}, 1000);
		}

	});
});