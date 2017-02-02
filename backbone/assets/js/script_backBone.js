
$(function(){

				var app = app || {Utils: {}};
              
                
                // Defining routers 

                var appRouter = Backbone.Router.extend({
                    routes: {
                        "": "indexRoute",
                        "fetchRoute": "fetchDetailsRoute",
                        "addRoute": "addDetailsRoute",
                        "updateRoute":"updateDetailsRoute"

                    }                          
                });
                

                // Method to return the filtered data

                app.Utils.filterCollection = function(collection, filterValue) {
                    if (filterValue == "") return collection.models;
                    return collection.filter(function(data) {
                        return _.some(_.values(data.toJSON()), function(value) {
                           if (_.isNumber(value)) value = value.toString();
                           if (_.isString(value)) {
                                  if( value.toLowerCase().indexOf(filterValue.toLowerCase()) != -1){
                                    return true;
                                  }else{
                                    return false;
                                  }

                            }
                           return false;
                        });
                    });
                }

                Backbone.Collection.prototype.filterValues = function(filterValues) {
                    return app.Utils.filterCollection(this, filterValues);
                }


                // Method to get the filtered data and append the filtered data in the table.

                var FilterView = Backbone.View.extend({
                      
                        el: "#container",
                      
                        events: {
                            "keyup #search" : "filter"
                        },
                      
                        filter: function(e) {                      
                            $(".stockBody").html("");
                            stockCollections.model.tempModels = stocks.filterValues($(e.target).val());
                            if(stockCollections.model.tempModels.length == 0){
                                $(".addDetailsAnc").show();
                                searchValue = $("#search").val()
                                $(".inputVal").html(searchValue);
                                $(".addDetailsInput").val(searchValue);
                            }else{
                                $(".addDetailsAnc").hide();
                            }
                           stockCollections.renderUpdated();
                        }
                });

                //  updating the stock collection when clicking ADD button and append the updated data in table

                var addDetailsView = Backbone.View.extend({
                        el: "#addDetails",
                            
                        events: {
                            'click #addButton' : 'addDetailsFromForm'

                        },

                        addDetailsFromForm: function(){
                            var companyNameAddDetails = $(".addDetailsInput").val();
                            var currenctPriceAddDetails = $(".addDetailsCurrenctPrice").val();
                            var purchasepriceAddDetails = $(".addDetailsPurchaseprice").val();
                            var netProfiltAddDetails = $(".addDetailsNetProfit").val();
                                  
                             var json = {"companyName":companyNameAddDetails
                                         ,"currentPrice":currenctPriceAddDetails,
                                        "purchasePrice":currenctPriceAddDetails,
                                        "netProfit":netProfiltAddDetails};
                            
                            stockCollections.model.add(json);
                            location.href="#updateRoute";
                        
                        }
                });
                 
                 //  Method to render data in table and event binding for DELETE button in the table.

                var StockView = Backbone.View.extend({
                
                        el: ".stockBody",
                
                        template: _.template($('#stockTemplate').html()),
                        
                        render: function(eventName) {
                            _.each(this.model.models, function(stock){
                                var stockTemplate = this.template(stock.toJSON());
                                $(this.el).append(stockTemplate);
                            }, this);
                            $("#preLoader").hide();   
                            return this;
                        },

                        renderUpdated: function(eventName) {
                            
                            _.each(this.model.tempModels, function(stock){
                                 var stockTemplate = this.template(stock.toJSON());
                                 $(this.el).append(stockTemplate);
                            }, this);
                             return this;
                        },

                        events: {
                                 'click .deleteAnc' : 'deleteModel'

                        },

                        deleteModel: function(e){
                             var textContent =  e.target.parentElement.parentElement.children[0].textContent.trim();
                             stockCollections.model.remove(stockCollections.model.where({companyName: textContent}));
                             $(".stockBody").html("");
                             stockCollections.render();
                        }

                    });
                  
                

                app.Router = new appRouter();

                 // router for index page
                 app.Router.on('route:indexRoute', function() {
                     $("#tableHolder,#addDetails").hide();
                     $("#landingInfoDiv").show();
                 });
                  
                 // router for add details page 
                 app.Router.on('route:addDetailsRoute', function() {
                     $("#tableHolder,#landingInfoDiv").hide();
                     $(".addDetailsPurchaseprice,.addDetailsNetProfit,.addDetailsCurrenctPrice").val("");
                     $("#addDetails").show();
                  });

                // router for table view page
                app.Router.on('route:fetchDetailsRoute', function() {
                     $("#tableHolder,#preLoader").show();
                     $("#landingInfoDiv,#addDetails").hide();
                     $(".stockBody").html("");
   
                     var stock = Backbone.Model.extend();  
                     var StockList = Backbone.Collection.extend({
                        model: stock,
                        url: 'https://api.myjson.com/bins/e2ltp',
                    });   

                    stocks = new StockList();    
                    stockCollections = new StockView({model: stocks});
                    stocks.fetch({
                        success: function(response) {
                            
                            stockCollections.render();
                        }
                    });
                });
                
                // router for updated details page.
                app.Router.on('route:updateDetailsRoute', function() {
                     $("#tableHolder").show();
                     $("#addDetails,.addDetailsAnc,#landingInfoDiv").hide();
                     $("#search").val("");
                     stockCollections.render();
                });

                //variable declaration
                Backbone.history.start();
                var filterView = new FilterView();
                var addView = new addDetailsView();
                var stocks,searchValue;

                
});