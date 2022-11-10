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
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
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

			this.mode = undefined;

			var dataModel = this.getOwnerComponent().getModel("tableData");
			this.getView().byId( "idSalesTable" ).setModel(dataModel, "sOrder1");

			this.temp = JSON.stringify(this.getView().getModel("sOrder1").getData());
			
			// create a new model for property binding .for visible property
			var newModel1 = new JSONModel({
				visibleHeader: true,
				"editable": false,
				"valueState": "None",
				"add": true,
				"edit": true,
				"delete": true,
				"status":"completed",
				"status1":"Edited"

			});
			this.getView().byId( "idSalesTable" ).setModel(newModel1, "newModel");
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

			var oCreateUrl = "/zOrderDateSet";
			oModel.create(oCreateUrl, data, null,
				function(response) {
					alert("Data successfully created");
				},
				function(error) {
					alert("Error while creating the data");
				}
			);
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
		},
		
		onDelete: function(oEvent) {
			this.mode = "delete";
			var that = this;
			var sData = oEvent.getSource().getModel("sOrder1").getData();
			var oTable = this.byId("idSalesTable");
			var selectedRowData = oTable.getSelectedContexts();//get the selected contexts 
			if (selectedRowData.length === 0) {
				MessageToast.show("please select atleast one row");
				return;
			} else {

				for (var i = selectedRowData.length - 1; i >= 0; i--) {
					var oThisObj = selectedRowData[i].getObject();
					var index = $.map(sData.Sales, function(obj, index) {
						if (obj === oThisObj) {
							return index;
						}
					});
					sData.Sales.splice(index, 1);//delete  record by using Splice
				}
				that.getView().getModel("sOrder1").setData(sData);//after deleting set the data
				// this._oTable.getModel().setData(sData);
				oTable.removeSelections(true);
			}
		},
		onEdit: function(oEvent) {
			// this.mode is a global varible 
			this.mode = "Edit";
			var that = this;
			// declare a arry for holding old records.
			this.oldDataArry = [];
			// var sData = oEvent.getSource().getModel("sOrder1").getData();
			var oTable = this.byId("idSalesTable");
			// selected row data containts selected records to edit
			var selectedRowData = oTable.getSelectedContexts();

			if (selectedRowData.length === 0) {//this condiction check wheather the records got selected or not
				MessageToast.show("please select atleast one row");

				return;
			} else {
			
				oEvent.getSource().getParent().getParent().getParent().setShowFooter(true);
				that.getView().getModel("newModel").setProperty("/add", false);//we set property add to false so that it disappear when click on edit button
				that.getView().getModel("newModel").setProperty("/delete", false);//we set property delete to false so that it disappear when click on edit button
				that.getView().getModel("newModel").setProperty("/editable", false);//we set property editable to false so that first property is non-editable
				selectedRowData.forEach(function(item) {
					var sContext = item;
					var sPath = sContext.getPath();
					var sObj = sContext.getObject();
					var oldObj = {//here old Obj collects selected data 
						sPath: sPath,
						sObj: JSON.stringify(sObj)//Json.Stringfy method used to convert in String format
					};
					that.oldDataArry.push(oldObj);//append the record to arry which we declare before
					sObj.editable = true;//by using this property we enable inputfeilds visible

					that.getView().getModel("sOrder1").setProperty(sPath, sObj, sContext, true);//finally we set record in model in that path

				});

			}

		},
		onLiveChange: function(oEvent) {
			this.enteredValue = oEvent.getParameter("value");

		},
		onAdd: function(oEvent) {
			this.mode = "Add";
			var that = this;
			oEvent.getSource().getParent().getParent().getParent().setShowFooter(true);
			that.getView().getModel("newModel").setProperty("/edit", false);
			that.getView().getModel("newModel").setProperty("/add", true);
			that.getView().getModel("newModel").setProperty("/delete", false);
			that.getView().getModel("newModel").setProperty("/editable", true);

			var newRecord = {//create a dummy record to push when user click on Add
				"Id": "",
				"Name": "",
				"NameType": "",
				"Quantity": "",
				"Price": "",
                "FullPrice": "",
                "Storage": "",
                "FullStorage": "",
				"editable": true,
				"neweditable": true
			};
			var oTableData = oEvent.getSource().getModel("sOrder1").getData();//get table data
			oTableData.Sales.push(newRecord);//push this new record in model
			that.getView().getModel("sOrder1").setData(oTableData);//set data to the view
		},

		onChange: function(oEvent) {
			var that = this;
			var enteredText = oEvent.getParameters("value").value;
			this.recordexists = undefined;
			// var index=undefined;
			var sData = this.getView().getModel("sOrder1").getData().Sales;//get the model data
			var spath = parseInt(oEvent.getSource().getBindingContext("sOrder1").getPath().split("/")[2]);//get the index of enter data row

			var index = sData.findIndex(function(item, sindex) {//findIndex is a method used to validate if same value found it returns index position othervise it returns -1
				return item.Id === enteredText && sindex !== spath;
			});
			if (index > -1) {
				this.recordexists = index;
				that.getView().getModel("newModel").setProperty("/valueState", "Error");//set value state to error
				MessageToast.show("Entered entry already exists");

				return;
			}
			that.getView().getModel("newModel").setProperty("/valueState", "None");


		},
		onSave: function(oEvent) {
			var that = this;
			if (this.mode === "Edit") {//if user click on save in edit functionality
				var oTable = this.byId("idSalesTable");
				var selectedRowData = oTable.getSelectedContexts();
				selectedRowData.forEach(function(item) {
					var sContext = item;
					var sPath = sContext.getPath();
					var sObj = sContext.getObject();
					sObj.editable = false;//we set editable false 
					that.getView().getModel("sOrder1").setProperty(sPath, sObj, sContext, true);

				});
				oEvent.getSource().getParent().getParent().setShowFooter(false);
				that.getView().getModel("newModel").setProperty("/edit", true);//we set property add to true so that it appers when click on save button
				that.getView().getModel("newModel").setProperty("/add", true);//we set property add to true so that it appers when click on save button
				that.getView().getModel("newModel").setProperty("/delete", true);//we set property delete to true so that it appers when click on save button
				MessageToast.show("Record updated successfully");//throws a message
				return;

			} else if (this.mode === "Add") {
				var sData = oEvent.getSource().getModel("sOrder1").getData().Sales;//get the table data
				var sIndex = sData.length - 1;//get the length of the sdata
				if (this.recordexists !== undefined) {
					MessageToast.show("ID already exists");

					return;

				} else {
					for (var i = 0; i <= sIndex; i++) {

						if (sData[i].editable === true) {//check feilds which are Appended by click on Add
							if (sData[i].Id === "") {//check if the entered data is black then it throws a error message
								MessageToast.show("ID cannot be empty");
								return;
							} else {
								sData[i].editable = false;//if record is not blank set editable to false
								sData[i].neweditable = false;//this is for first property
								that.getView().getModel("sOrder1").setProperty("/Sales/" + i, sData[i]);//set property binding for that records
								that.getView().getModel("newModel").setProperty("/edit", true);//edit button visible
								that.getView().getModel("newModel").setProperty("/add", true);//add button visible
								that.getView().getModel("newModel").setProperty("/delete", true);//delete button visible
								that.getView().getModel("newModel").setProperty("/editable", false);//we set property editable to false so that first property is non-editable
								oEvent.getSource().getParent().getParent().setShowFooter(false);
								MessageToast.show("Record saved Successfully");
							}
						}
					}
				}
			}

		},
		onCancel: function(oEvent) {
			if (this.mode === "Edit") {

				var that = this;
				var oTable = this.byId("idSalesTable");
				// var selectedRowData = oTable.getSelectedContexts();

				this.oldDataArry.forEach(function(item) {
					// var sContext = item;
					var sPath = item.sPath;
					var sObj = JSON.parse(item.sObj);
					sObj.editable = false;
					that.getView().getModel("sOrder1").setProperty(sPath, sObj, true);
				});
				oEvent.getSource().getParent().getParent().setShowFooter(false);
				that.getView().getModel("newModel").setProperty("/edit", true);
				that.getView().getModel("newModel").setProperty("/add", true);
				that.getView().getModel("newModel").setProperty("/delete", true);
				oTable.removeSelections(true);

			} else if (this.mode === "Add") {
				 var oTable = this.byId("idSalesTable");
				var sData = oEvent.getSource().getModel("sOrder1").getData().Sales;
				var sIndex = sData.length - 1;
				for (var i = sIndex; i >= 0; i--) {
					var cellsInEdit = sData[i].editable;
					if (cellsInEdit === true) {
						sData.splice(i, 1);//delete a record by slice method

					}
					 oTable.removeSelections(true);
				}
				this.getView().getModel("sOrder1").setProperty("/Sales/", sData);
				oEvent.getSource().getParent().getParent().setShowFooter(false);
				this.getView().getModel("newModel").setProperty("/edit", true);
				this.getView().getModel("newModel").setProperty("/add", true);
				this.getView().getModel("newModel").setProperty("/delete", true);
				MessageToast.show("Record saved Successfully");
			}

		}

	});
});