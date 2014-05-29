angular.module("app").controller("ContactsCtrl", function($http, $scope, $location, userContactsResource, userGroupsResource, $routeParams, $rootScope, numberOfNotesOnThePage, ngProgress){
	console.log('fire');
	$scope.groups = {};
	$scope.filter = $location.search();
	$scope.selectedContacts = {};
	ngProgress.color("#5bc0de");

	userGroupsResource.get({user_email: "default"}, function (groups){
		$scope.groupStatuses = {};
		angular.forEach(groups.feed.entry, function(value){
			$scope.groups[value.id.$t] = {
				title: value.title.$t,
				id: value.id.$t,
				isSystem: false
			}
			if (value.gContact$systemGroup) {
				$scope.groups[value.id.$t].title = value.title.$t.substring(14);
				$scope.groups[value.id.$t].isSystem = true;
			}
		});
	});
	

	$scope.$watch('filter', function(newVal, oldVal){
		if ( newVal !== oldVal) {
			$scope.reloadContacts(newVal);
			angular.forEach(newVal, function(value, key){
				$location.search(key, value)
			})
		}
	}, true)

	$rootScope.getGroupTitle = function(id) {
		return $scope.groups[id]?$scope.groups[id].title:'';
	}
	$scope.filterByGroup = function (key){
		$scope.filter.page = 1
		$scope.filter.group = key;
	}
	$scope.onSelectContactCallback = function(index){
		var contact = $scope.contacts.feed.entry[index];
		if (contact.isChecked) {
			$scope.selectedContacts[index] = contact.id.$t;
		} else {
			$scope.selectedContacts = $scope.selectedContacts.filter(function(item){return item != contact.id.$t});
		}
	}
	$scope.reloadContacts = function (newVal){
		$scope.selectedContacts = {};
		ngProgress.start();
			if (!$scope.filter.page) {
				$scope.filter['page'] = 1
			}
		userContactsResource.get(angular.extend({user_email: "default", "max-results": numberOfNotesOnThePage, 'start-index': 1+numberOfNotesOnThePage*($scope.filter.page-1)}, newVal)).$promise.then(
        function(value){
        	$scope.contacts = value;
        	ngProgress.complete();
        }, function(){
        	ngProgress.reset();
        }
      );
	}
	$scope.saveGroup = function (id) {
		console.log('group with id:', id, '- saved.')
	}

	$scope.deleteContacts = function () {
		console.log('start deleting....', $scope.selectedContacts);
		
		angular.forEach($scope.selectedContacts, function(id, index){
			id = id.split('/');
			id = id[id.length - 1];
			$http.defaults.headers.common['If-match'] = $scope.contacts.feed.entry[index].gd$etag;
			userContactsResource.delete({user_email: "default", user_id: id})
			delete id;
			console.log($scope.selectedContacts)
		})
	}


	$scope.reloadContacts();
});