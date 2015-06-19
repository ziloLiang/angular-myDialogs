 /*
  * angular.myDialogs.js 
  * angularjs 弹出层插件 
  * author: ziLoliang 梁冬
  * date: 2015-6-16
  * 
  * */
 (function (window, angular) {
      var myDialogs = angular.module("myDialogs",[])
      myDialogs.factory('myDialogs', ['$q','$http','$compile','$controller','$rootScope', '$document', '$templateRequest',
      function($q, $http, $compile, $controller, $rootScope, $document, $templateRequest) {
        
      var DialogsCore = function(options){
        var DialogsEle,scope,template,ctrlInject = {};   //弹出层dom对象,弹出层作用域对象,弹出层注入对象
        
        var beforeOpenDeferred = $q.defer(),   //打开弹出层之前回调
            afterOpenDeferred = $q.defer();    //打开弹出层之后回调
            
        var DialogsPromise = {                 //准备注入弹出层controller的promise
          beforeOpen: beforeOpenDeferred.promise,
          afterOpen: afterOpenDeferred.promise,
          close: function(){
            var cancelDefer = $q.defer();
            DialogsEle.remove();
            scope.$destroy();
            cancelDefer.resolve();
            return cancelDefer.promise;
          }
        };
        
        var DialogsWapper = "<div class='myDialogs' my-dialogs-config ></div>",
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
          DialogsEle = angular.element(DialogsWapper).html(template+endTemp);
          $compile(DialogsEle)(scope);
          $document.find("body").append(DialogsEle);
          afterOpenDeferred.resolve();
        },function(reason){
          throw reason;
        });

      }

      return {
          myAlert: function(options){
            DialogsCore({
              templateUrl: "/myDialogs/popAlert.html",
              controller: "myAlertController",
              data: {
               "msg": angular.copy(options.msg)
              }
            });
          },
          popFream: function(option){
            var opts = angular.extend({},{
              template: "",
              templateUrl: "",
              controller: "",
            },option);
            
            DialogsCore({
              template: opts.template,
              controller: opts.controller
            });
            
          }
        };
      }]).run(['$templateCache',function($templateCache){
        $templateCache.put("/myDialogs/popAlert.html","<div class='myDialogs-inner myAlert'><p class='myAlert-msg' data-ng-bind-html='msg'></p><span class='btn red-btn' ng-click='close();'>关 闭<span></div>");
        
      }]);
      
      myDialogs.controller("myAlertController",["$scope","$sce","$DialogsPromise", "$DialogsData",
      function($scope, $sce, $DialogsPromise, $DialogsData){
        $scope.msg = $sce.trustAsHtml($DialogsData.msg);
        $scope.close = function(){
          $DialogsPromise.close();
        }
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
              });
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