app.factory("userContactsResource", function($resource, $rootScope,auth){
	return $resource("https://www.googleapis.com/m8/feeds/contacts/:user_email/full/:user_id", {user_email: "@user_email", user_id: "@user_id"},
		{
			get: {method:'GET', params:{alt:'json'}}
		});
});