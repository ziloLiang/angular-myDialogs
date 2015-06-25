 /*
  * angular.myDialogs.js 
  * angularjs 弹出层插件 
  * author: ziLoliang 梁冬
  * date: 2015-6-16
  * 
  * */
 (function (window, angular) {
      var myDialogs = angular.module("myDialogs",[])
      myDialogs.factory('myDialogs', ['$q','$http','$compile','$controller','$rootScope', '$document', '$templateRequest','$timeout',
      function($q, $http, $compile, $controller, $rootScope, $document, $templateRequest, $timeout) {
        
      var DialogsCore = function(options){
        var DialogsEle,scope,template,ctrlInject = {};   //弹出层dom对象,弹出层作用域对象,弹出层注入对象
        var options = angular.extend({
          backMask: false
        },options)
        var beforeOpenDeferred = $q.defer(),   //打开弹出层之前回调
            afterOpenDeferred = $q.defer();    //打开弹出层之后回调
            
        var DialogsPromise = {                 //准备注入弹出层controller的promise
          beforeOpen: beforeOpenDeferred.promise,
          afterOpen: afterOpenDeferred.promise,
          close: function(){
            var cancelDefer = $q.defer();
            cancelDefer.resolve();
            DialogsEle.removeClass("fade");
            $timeout(function(){
              DialogsEle.remove();
              scope.$destroy();
            },300);
            return cancelDefer.promise;
          }
        };
        
        var DialogsWapper = "<div class='myDialogs' my-dialogs-config ></div>",
            backMask = "<div class='backMask' ></div>",
            endTemp = "<div style='display:none' my-dialogs-finish ></div>";
        
        var getTemplate = function(){
            if(options.template){
              return $q.when(options.template);
            }else if(options.templateUrl){
              return $templateRequest(options.templateUrl);
            }else{
              throw "no template";
              return false;
            }
        }
        
        getTemplate().then(function(template){
          scope = $rootScope.$new();
          ctrlInject = {
            $scope: scope,
            $DialogsPromise: DialogsPromise
          }
          if(options.data)ctrlInject.$DialogsData= options.data;
          var PopController = $controller(options.controller,ctrlInject);
          DialogsEle = angular.element(DialogsWapper).html("<div class='myDialogs-inner'>"+template+"</div>"+endTemp);
          if(options.backMask){
            DialogsEle.prepend(backMask);
          }
          $compile(DialogsEle)(scope);
          $document.find("body").append(DialogsEle);
          afterOpenDeferred.resolve();
        },function(reason){
          throw reason;
        });

      }

       return {
          myAlert: function(options){
            var type = options.type||"normal";
            DialogsCore({
              templateUrl: "/myDialogs/myAlert.html",
              controller: "myAlertController",
              backMask: options.backMask,
              data: {
               "type": type,
               "msg": angular.copy(options.msg)
              }
            });
          },
          myBtnAlert: function(options){
            var type = options.type||"normal";
            DialogsCore({
              templateUrl: "/myDialogs/myBtnAlert.html",
              controller: "myBtnAlertController",
              backMask: options.backMask,
              data: {
               "type": type,
               "msg": angular.copy(options.msg)
              }
            });
          },
          myConfirm: function(options){
            var opts = angular.extend({
              yesCallback: function(){},
              noCallback: function(){}
            },options);
            DialogsCore({
              templateUrl: "/myDialogs/myConfirm.html",
              controller: "myConfirmController",
              backMask: opts.backMask,
              data: {
               "msg": angular.copy(options.msg),
               yesCallback: opts.yesCallback,
               noCallback: opts.noCallback
              }
            });
          },
          popFream: function(option){
            var opts = angular.extend({},{
              template: "",
              templateUrl: "",
              backMask: false,
              controller: "",
            },option);
            
            DialogsCore(opts);
          }
        };
      }]).run(['$templateCache',function($templateCache){
        $templateCache.put("/myDialogs/myBtnAlert.html","<div class='panel myDialogs-inner btnAlert {{type}}'><p class='msg' data-ng-bind-html='msg'></p><span class='btn myAlert-btn' ng-click='close();'>关 闭<span></div>");
        $templateCache.put("/myDialogs/myAlert.html","<div class='panel myDialogs-inner alert {{type}}' ng-click='close();'><p data-ng-bind-html='msg'></p></div>");
        $templateCache.put("/myDialogs/myConfirm.html","<div class='panel myDialogs-inner myConfirm {{type}}'><p class='msg' data-ng-bind-html='msg'></p><div class='btn-wapper clearfix'><button class='btn gray-btn'  ng-click='no();' >否</button><button class='btn blue-btn' ng-click='yes();'>是</button></div></div>");
      }]);
      
      myDialogs.controller("myAlertController",["$scope","$sce","$DialogsPromise", "$DialogsData", "$timeout",
      function($scope, $sce, $DialogsPromise, $DialogsData, $timeout){
        $scope.msg = $sce.trustAsHtml($DialogsData.msg);
        $scope.type = $DialogsData.type;
        $scope.close = function(){
          $DialogsPromise.close();
        }
        
        $timeout(function(){
          $DialogsPromise.close();
        },3000)
        
      }]);
      
      myDialogs.controller("myBtnAlertController",["$scope","$sce","$DialogsPromise", "$DialogsData",
      function($scope, $sce, $DialogsPromise, $DialogsData){
        $scope.msg = $sce.trustAsHtml($DialogsData.msg);
        $scope.type = $DialogsData.type;
        $scope.close = function(){
          $DialogsPromise.close();
        }
      }]);
      
      myDialogs.controller("myConfirmController",["$scope","$sce","$DialogsPromise", "$DialogsData", 
      function($scope, $sce, $DialogsPromise, $DialogsData){
        $scope.msg = $sce.trustAsHtml($DialogsData.msg);
        $scope.yes = function(){
          $DialogsPromise.close().then(function(){
            $DialogsData.yesCallback();
          });
        };
        
        $scope.no = function(){
          $DialogsPromise.close().then(function(){
            $DialogsData.noCallback();
          });
        };
        
      }]);
      
      myDialogs.directive("myDialogsConfig",function(){
        return {
          link: function(scope, ele, attrs){
            scope.$on("myDialogsFinish",function(){
              var h = ele[0].offsetHeight,
                  w = ele[0].offsetWidth,
                  ml = -w/2;
              ele.css({
                "marginLeft": -w/2 + "px",
                "marginTop": -h/2 + "px"
              }).addClass("center fade");
            });
          }
        }
      });
      myDialogs.directive("myDialogsFinish",function($timeout){  
        return {
          link: function(scope, ele, attrs){
            $timeout(function(){
              scope.$emit("myDialogsFinish");
            });
          }
        }
      });
 })(window, window.angular);